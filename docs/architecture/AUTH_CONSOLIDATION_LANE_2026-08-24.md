# Auth Consolidation Lane — 2026-08-24

**Base:** `e56e502f` (`clean-main-no-secrets`, merge of PR #1073).
**Status:** Part 1 (transport honesty + attribution) is **BUILT on current
canonical, not deployed**. Parts 2–4 are **PROPOSED, not authorized**.

Read with `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` in hand. Sections are
labelled **VERIFIED** (read out of the code at this commit), **BUILT** (changed
on this branch, tests green, not in production), or **PROPOSED** (a direction,
not a decision). Nothing here is Live until it is deployed and witnessed.

---

## 0. The finding that reorders everything

**Today's outage and the signup problem are not the same thing.**

The outage is a transport bug with a one-line cause. The signup problem is that
MAIA has accumulated several generations of authentication and asks people to
cross a threshold whose internal meaning changes depending on which historical
doorway they hit. Fixing the first does not touch the second, and treating the
first as "signup solved" is how the second keeps surviving.

### 0.1 The outage — VERIFIED, fixed across two commits

Resend's Node client **resolves** on API rejection. It returns
`{ data: null, error: { name, message } }`; it does not throw. Every
account-access route awaited `emails.send()` inside a bare `try/catch` and
declared success on the next line, so the catch fired only on transport faults.
A 429 `monthly_quota_exceeded` therefore produced success logs and HTTP 200s for
mail Resend had refused. One person made six attempts across two days and could
not create an account; every surface we had said the mail had gone out.

`lib/email/sendEmail.ts` — the central helper that already read `{ data, error }`,
and whose header comment already documented this exact bug class — **existed the
whole time**. The auth lane was the one lane that never adopted it. This was not
an unknown failure mode; it was a known one with an unenforced fix.

Fixed on canonical by **PR #1072** (`email-code`, through the central helper) and
**PR #1073** (`magic-link`, `recover`, `reset-password`, inline). This branch is
the next layer, not a parallel one.

### 0.2 Why a green suite did not catch it — VERIFIED

The `email-code` fixture mocked success as `{ id }` and failure as a **rejected
promise**. Resend produces neither shape. The suite was green against a provider
that does not exist. PR #1072 corrected the fixture; the lesson generalises: *a
mock that cannot fail cannot prove the handling of failure.*

### 0.3 The enumeration leak — VERIFIED, closed here

`POST /api/members/email-code` returned `isExistingMember: true|false` — in a
route whose own header claimed "no enumeration leak" — **before the caller had
proved they own the address**. Anyone could probe an address and learn whether
that person has a Soullab account. `POST /api/members/magic-link` did the same.

### 0.4 Session creation was non-fatal — VERIFIED, closed here

`POST /api/members/email-code/verify` caught session-creation failure, logged it
`(non-fatal)`, and returned `success: true` with a member payload anyway. The
client then stored a localStorage session with no server session behind it.
That is the origin of the "signed in here but not there / MAIA thinks I'm
someone else" reports — and the same family as the send bug: **a step that
failed, reported as a step that succeeded.**

---

## 1. The census — VERIFIED

| Path | What it is |
|---|---|
| `POST /api/members/email-code` | 6-digit passwordless OTP request |
| `POST /api/members/email-code/verify` | OTP verification (signs in existing; only *verifies* new) |
| `POST /api/members/magic-link` | older email-link authentication |
| `POST /api/members/register-email` | second-stage signup after verification |
| `POST /api/members/enter` | email + password signup/sign-in |
| `POST /api/members/signin` | username + password |
| `POST /api/members/register` / `register-local` | passkey-era registration |
| `POST /api/members/recover` / `reset-password` / `send-verification` | recovery paths |
| `app/api/auth/*` | apple · google · microsoft · webauthn · passkeys · device · native-biometry · dev-login · credentials |
| `lib/auth/serverSessions.ts` | PostgreSQL sessions + HttpOnly cookies |
| `localStorage.beta_user` | still load-bearing in some flows |
| Pages | `/signin` · `/enter` · `/begin` · `/welcome` |

**The contradiction, concretely.** `email-code/verify` marks a new email
"verified" but does not create the person. The client must then call
`register-email`, which **requires a username and a password** — after the member
entered through what was presented as a passwordless experience — and then
manufactures a synthetic passkey to satisfy `members.passkey VARCHAR(255) UNIQUE
NOT NULL` (migration `20260103000001_members.sql:6`). `enter` does the same with
a different synthetic format (`ML-<timestamp>-<random>`).

So the `passkey` column — the one thing named after real WebAuthn — is populated
on both modern paths with values that are not passkeys, invented solely to
satisfy a constraint from an earlier generation of the system. That is the
architectural fossil in one line of DDL, and eliminating it is what the
consolidation lane is ultimately for.

---

## 2. Part 1 — transport honesty and attribution — BUILT on `e56e502f`

Canonical made every auth path report what the provider actually said. This layer
makes the report **classified, attributed, and honest about what to do next**.

### 2.1 One taxonomy, in one place

`lib/email/sendEmail.ts` gains `SendFailureKind`: `quota_exceeded`,
`rate_limited`, `provider_auth`, `provider_config`, `invalid_recipient`,
`provider_error`, `not_configured`, `exception` — alongside canonical's
`providerCode`, which is kept verbatim. **`providerCode` is the provider's raw
name for operators; `failureKind` is our classification, and the only thing
callers branch on.**

Attribution and retry policy live in a single `FAILURE_POLICY` table so the two
cannot drift. A resolved send with **no message id** is a failure: success
requires provider-issued proof. Quota, credential, sender-config and
not-configured failures emit a greppable `[MAIA/email] TRANSPORT_DOWN` line —
when that fires, every code, invite and reset in the system is failing, and it
should not have to be inferred from a per-request error during an outage.

### 2.2 The attribution defect — CORRECTED, recorded

The first draft of this taxonomy mapped any `validation_error` to
`invalid_recipient`. Resend also returns `validation_error` for **"The from
address is not verified"** — our configuration problem, and one of the refusals
PR #1073 deliberately tests. Under that rule a member got a **400 telling them
their own address was wrong**. Exactly inverted, and worse than the silence it
replaced: the previous bug failed to inform, this one would have misinformed.

The rule now:

- `invalid_recipient` requires evidence **naming the recipient** (`invalid_to`,
  "invalid recipient", "recipient rejected", "invalid \`to\` field").
- Any message also implicating our sender (`from address`, `sender`, `domain`)
  is never attributed to the member — sender evidence wins, because the cost of
  getting this backwards falls on them.
- A bare `validation_error`, and anything unrecognised, degrades to
  `provider_error`.
- **`invalid_recipient` is the only `ourFault: false` class.** Unattributed is
  ours, by construction.

### 2.3 Retry advice is governed by `retryable`, not by tone

Canonical's `email-code` deliberately said *not* "try again". That was right for
a quota, but applied to every refusal. The rule now:

```
retryable = true   → "…that's on our side, not yours. Please try again in a few minutes."
retryable = false  → "We can't send codes right now. That's on our side, not yours,
                      and retrying won't help. Please contact support@soullab.life…"
```

`retryable` **fails safe**: only `rate_limited` and `exception` are retryable.
Anything unattributed is not. Wrongly promising a retry rebuilds the loop this
lane exists to remove — six attempts across two days, none of which could have
worked. Wrongly withholding one only routes someone to a human, who can help.

Neither the provider's wording nor `failureKind` reaches the member. `reason`
stays the stable UI/telemetry field: canonical's `email_provider_refused`, plus
`email_address_rejected` for the one genuinely recipient-side class.

### 2.4 Centralisation

All five auth senders — `email-code`, `magic-link`, `recover`, `reset-password`,
`send-verification` — now send through `sendEmail`. **No auth route constructs a
provider client.** PR #1073 kept the three inline on purpose ("the shapes differ
on purpose") because widening the change during a live incident was the wrong
trade. That trade has expired: the structural lesson of the incident is that five
routes held five subtly different understandings of what `Resend.send()` means.
One understanding, in one place, is the fix.

(`app/api/members/beads/route.ts` still holds its own client. It is not auth and
is out of this lane. The non-auth senders recorded in PR #1073's message —
`team/invite`, `build/alert`, `feedback`, and the `lib/` senders — remain
unaddressed and are still real.)

### 2.5 The other three invariants closed here

- **Enumeration removed** from `email-code` and `magic-link`. A known and an
  unknown address now return identical responses.
- **An undelivered code is invalidated, not deleted.** A credential nobody
  received must not stay usable; the row is also the only record that this person
  tried — which is how the incident was reconstructed at all. Marking it `used`
  satisfies both, and answers PR #1072's reason for leaving it live.
- **Session creation is fatal** in `email-code/verify`. No server session means
  authentication did not complete: no success, no member payload, no cookies.

### 2.6 Proof

| Suite | Tests |
|---|---|
| `app/api/members/__tests__/account-access-send-truthfulness.test.ts` | 34 (was 24) |
| `lib/email/__tests__/sendEmail.test.ts` | 17 |
| `app/api/members/email-code/__tests__/delivery.test.ts` | 13 |
| `app/api/members/email-code/__tests__/route.test.ts` | 16 |
| `app/api/members/email-code/verify/__tests__/session-is-authentication.test.ts` | 6 |

PR #1073's behavioural controls are **preserved and adapted**, not traded away:
every per-route refusal case, thrown-fault case, funnel case and CONTROL still
runs. Only the structural block changed shape — it asserted the inline
`{ data: sendData, error: sendError }` form, which centralisation removes. It now
asserts the same **property** across all four routes: no provider client is
constructed, and no send result is discarded. The anchored-negative lesson from
that block's own correction is carried in the comment, because it is the reason
the assertions are written as the absence of the *client* rather than of a call
shape.

Negative controls, per this repo's convention:

| Control | Result |
|---|---|
| Original attribution defect reintroduced | 9 fail |
| Overbroad `validation_error` rule alone | 3 fail |
| Enumeration leak reintroduced | 2 fail |
| Session failure made non-fatal again | 4 fail, 2 pass — the 2 being the CONTROLs, correctly insensitive |

Gates: `check:no-supabase` clean; `npm run typecheck` no-regression green (not
re-baselined).

**Deliberately NOT claimed:** none of this is verified in production. This does
not restore delivery — that needs provider capacity, which is an account action.
It makes every auth path report what the provider actually said, to the right
party, with honest advice about what to do next.

### 2.7 Sibling sweep after structural moves — method

Centralising the five auth senders produced two kinds of drift, each found only
after the fact, and each *adjacent* to the change rather than remote from it.
Comments in four files still described the inline `{ data, error }` machinery
that centralisation had deleted. New log lines written alongside a helper that
already enforced a logging policy broke that policy one layer up. Neither was
caught by writing the change; both were caught afterwards, by review and by a
gate.

The method that would have caught them at the time:

- **After moving a call site, re-read the adjacent comments against the new
  machinery.** A comment that explains code which no longer exists is worse than
  no comment: the next reader trusts it.
- **Check every newly introduced log line against the policy and gates the old
  implementation already satisfied.** Moved code inherits its obligations; code
  written *beside* moved code does not inherit them automatically.
- **A green heuristic gate is evidence about that heuristic's aperture, not
  about the underlying property.** The member-identifier log gate flagged two of
  the four routes carrying a raw address, because its pattern matches a variable
  named `email` and not one named `normalizedEmail`. Passing it would not have
  meant the property held.
- **Where the property matters, add a direct or structural assertion rather than
  broadening the heuristic until it happens to pass.** Widening a detector to
  cover today's miss leaves the same class of gap one rename away.

This generalises a distinction the lane keeps meeting. `npm run typecheck` green
means nothing got *worse*, not that everything typechecks (CLAUDE.md states this
explicitly). PR #1073's structural check passed against the very bug it existed
to catch, because its negative was an unanchored substring of the fixed form. A
passing check reports on what the check can see.

The same shape appeared once more at the end of this PR, in copy rather than
code: the non-retryable failure path routed people to `hello@soullab.life`, an
address not set up for it. Every gate was green and every test passed, because
nothing in the suite knew which mailboxes exist. The lane exists to stop sending
people into dead ends, and had built one at the last step. The assertion added
in response is direct — the non-retryable path must return `support@soullab.life`
and must not return `hello@soullab.life` — rather than a general rule about
addresses, for the reason above.

---

## 3. Part 2 — the seven invariants — PROPOSED

The launch architecture. Recorded as the target, not as built.

1. **One public entrance.** `/signin` and `/signup` collapse into one experience.
   Soullab decides new-vs-returning internally; the member is never asked.
2. **One canonical authentication engine.** Old magic-link / password / OTP
   implementations do not coexist indefinitely.
3. **Email OTP creates *or* signs in the member in one atomic operation.** No
   username, no password, no synthetic passkey. There is no intermediate state
   meaning "verified, but let's see whether we can create the account."
4. **The server session is the sole authentication authority.** localStorage may
   cache presentation data; it never proves identity. *(Closed for
   `email-code/verify` in Part 1; still open on the other doors.)*
5. **Authentication and entitlement are separate.** Auth answers *who are you*;
   membership answers *what may you enter*. A beta switch must never again be
   able to strand authentication.
6. **Transport success must be real.** *(Closed for the auth lane in Part 1.)*
7. **Passkey is the preferred return path; email OTP is the universal recovery
   path.** No password is required of a new member — so there is nothing to
   forget, reset, mistype, leak, or reuse.

Soulfulness belongs immediately *after* the threshold. Instead of asking someone
to invent a username, MAIA asks *"What would you like me to call you?"* That is
where the relationship starts.

### 3.1 Sovereignty invariant check (CLAUDE.md §6)

- **Increases agency?** Yes — fewer credentials, no invented identifiers, no
  silent lockout.
- **Pushes life outward?** Neutral. A threshold should be crossed, not dwelt in.
- **Reduces psychological centrality?** Yes — the door stops being an event.
- **Cultural sovereignty (Invariant 14):** removing the forced username removes an
  imposed self-naming convention. `'Beautiful Soul'` as a default salutation is a
  framework imposition and should be reviewed in Part 3.

**Growth-obligation check** — this lane *reduces* capability (fewer doors, less
data collected at the threshold, one identity instead of several). The new
responsibility it creates: a single door is a single point of failure, which is
precisely why Part 1 shipped first and why §5 keeps transport observable.

---

## 4. Part 3 — Better Auth evaluation — PROPOSED, not decided

The question is not "should we add a library" but "should we keep maintaining our
own auth protocol, or stop." Six generations of doorway is the cost of the former.

**Fit.** MIT-licensed and self-hostable; plugs into Next.js and PostgreSQL;
first-class database sessions; an email-OTP plugin that creates the user on valid
OTP (removing our OTP → username → password → synthetic-passkey chain); a passkey
plugin implementing WebAuthn/FIDO2; **bring-your-own email provider**.

**Sovereignty read.** This is the load-bearing question, not the feature list.
Soullab continues to own people, data, Postgres, interface, language, onboarding,
roles, relationships, entitlements and experience. Better Auth would own OTP
mechanics, passkeys, sessions, cookies and token lifecycle. No third party enters
the traffic path and no identity SaaS holds our members. Consistent with
"self-hosted by design"; not a managed-hosting or managed-database dependency.

**ZITADEL** was considered and set aside: powerful and self-hostable, but it adds
a substantial service and administrative plane. Soullab does not need enterprise
IAM to let someone meet MAIA.

**Open questions a spike must answer before adoption:**
1. Can existing `members` rows migrate without a forced reset for anyone?
2. Does it work in the Capacitor/iOS WebView, where `SameSite=Lax` cookies are not
   sent cross-origin (CLAUDE.md, "Known recurring traps")? Passkeys in `WKWebView`
   require Associated Domains + `webcredentials` on `soullab.life`.
3. Can `members.passkey NOT NULL` be retired without breaking live rows?
4. Does it survive the offline / air-gap posture the project reserves?

Run the spike against a **copy** of the member schema. Do not adopt on paper.

---

## 5. Part 4 — Resend stays, but stops being a single point of failure — PROPOSED

The lesson is not "Resend is bad." It is: **we allowed email transport failure to
become identity failure.**

- Part 1 puts `sendEmail` between auth and the provider on every auth path. That
  seam is where a secondary provider is added — auth need never know what Resend
  is. **No secondary provider is configured today**; naming one is a decision.
- Resend's `sent` / `delivered` / `failed` / `bounced` webhooks are not consumed.
  Part 1 made *acceptance* observable. **Acceptance is not delivery.** Consuming
  the webhooks is the natural next step.
- Under invariant 7, a returning member with a passkey needs no email at all.
  That is the real resilience; a fallback provider is the interim.

---

## 6. Sequence

```
e56e502
truthful auth transport          ← Part 1 (this branch)
        ↓
LIVE WITNESS
        ↓
auth hardening on fresh canonical branch
        ↓
remove legacy beta gate          ← a28e62b's invariant, re-applied
        ↓
Better Auth SPIKE
        ↓
one-door migration decision
```

Deleting the legacy entrances is part of the work, not a follow-up. A
consolidation that leaves the old doors mounted has not consolidated anything.

---

## 7. Launch gate

The gate is **not** "tests green." It is a matrix, run end to end, with **no
silent success anywhere**:

- **member state** — new · returning · existing session
- **mail host** — Gmail · Outlook · Yahoo · Proton
- **browser** — Safari · Chrome
- **surface** — web · PWA · iPhone
- **failure** — provider failure · delayed email · expired code · resend · wrong code

Pass condition: in every cell, the member is either **authenticated into MAIA** or
shown a **real, actionable error**. There is no third outcome — no "verified but
not signed in", no "code sent" for mail that never left, no localStorage session
without a server session behind it.

---

## 8. Provenance of this lane

**`1e6fe91ba` (branch `claude/signup-resend-architecture-0faprs`) is evidence, not
ancestry.** It was built from `be5b3b802` and never descended from `e01d4a7` or
`e56e502f`, so it was a parallel implementation of surfaces canonical had already
reconciled — and it carried the attribution defect recorded in §2.2. It is
preserved unmerged as the R&D record. Its ideas were ported here deliberately,
onto current canonical, with that defect corrected and PR #1073's controls kept.

The architecture we are trying to build is precisely one where a parallel stale
implementation cannot quietly become the new truth. Rebuilding rather than
cherry-picking was the first application of that principle to ourselves.

**`a28e62b` (branch `claude/beta-signup-gate-investigation-exdgby`) stays
separate.** Its invariant is wanted — *authentication can never be converted into
a beta waitlist by configuration* — but the stale commit is not. Re-apply the
semantic change onto the then-current canonical route after this transport work
is deployed and witnessed. It was not today's cause: `BETA_ALLOWLIST_ENABLED` is
unset in production and every `beta_waitlist` row is from July.

---

## 9. What would falsify this document

- Production logs showing `[MAIA/email] sent` with real message ids **while**
  members still report no code → the failure is downstream of acceptance
  (deliverability, spam placement), and §5's webhook work becomes urgent rather
  than next.
- The Better Auth spike failing question 2 (iOS WebView) → invariant 7 needs a
  different mechanism, and §4 is withdrawn rather than deferred.
- Members proving able to sign in on the live commit → the transport bug was not
  the operative cause, and §0.1 is a real but secondary finding.
