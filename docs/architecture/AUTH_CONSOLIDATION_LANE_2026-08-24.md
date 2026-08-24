# Auth Consolidation Lane — 2026-08-24

**Status:** lane opened. Part 1 (transport honesty) is **built and tested on this
branch, not deployed**. Parts 2–4 are **designed, not authorized**.

Read with `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` in hand. Every section below
is labelled **VERIFIED** (read out of the code in this repo), **BUILT** (changed on
this branch, tests green, not in production), or **PROPOSED** (a direction, not a
decision). Nothing here is Live until it is deployed and observed.

---

## 0. The finding that reorders everything

**Today's outage and the signup problem are not the same thing.**

The outage is a transport bug with a one-line cause. The signup problem is that
MAIA has accumulated several generations of authentication and asks people to
cross a threshold whose internal meaning changes depending on which historical
doorway they hit. Fixing the first does not touch the second, and treating the
first as "signup solved" is how the second keeps surviving.

### 0.1 The outage — VERIFIED

Resend's Node client **resolves** on API rejection. It returns
`{ data: null, error: { name, message } }`; it does not throw. Four auth routes
awaited `emails.send()` inside a bare `try/catch` and logged success on the next
line:

| Route | Before |
|---|---|
| `POST /api/members/email-code` | `await getResend().emails.send(...)` → `console.log('Code sent')` |
| `POST /api/members/magic-link` | same shape |
| `POST /api/members/recover` | same shape |
| `POST /api/members/reset-password` | same shape |
| `POST /api/members/send-verification` | already read `{ error }` — the one that was right |

A 429 `monthly_quota_exceeded` therefore never reached the catch. MAIA returned
`200 { success: true }`, wrote "Code sent" to the log, and showed the member a
code-entry screen for a code that was never mailed. From the member's side this
is indistinguishable from "MAIA is broken and lying about it."

`lib/email/sendEmail.ts` — the central helper that already reads `{ data, error }`
and whose header comment already documents this exact bug class — **existed the
whole time**. The auth lane was the one lane that never adopted it. This was not
an unknown failure mode; it was a known one with an unenforced fix.

### 0.2 What the old test suite could not have caught — VERIFIED

`app/api/members/email-code/__tests__/route.test.ts` mocked success as `{ id }`
and failure as a **rejected promise**. Resend produces neither shape. The suite
was green against a provider that does not exist. It proved the beta-waitlist
removal; it could not have proved delivery.

### 0.3 The enumeration leak — VERIFIED, now closed

`POST /api/members/email-code` returned `isExistingMember: true|false` — in a
route whose own header claimed "no enumeration leak" — **before the caller had
proved they own the address**. Anyone could probe an address and learn whether
that person has a Soullab account. `POST /api/members/magic-link` did the same.

### 0.4 Session creation was non-fatal — VERIFIED, now closed

`POST /api/members/email-code/verify` caught session-creation failure, logged it
`(non-fatal)`, and returned `success: true` with a member payload anyway. The
client then stored a localStorage session with no server session behind it. That
is the origin of the "I'm signed in here but not there / MAIA thinks I'm someone
else" class of report.

---

## 1. The census — VERIFIED

Authentication surfaces currently reachable in this repo:

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
on both modern paths with values that are not passkeys, invented solely to satisfy
a constraint from an earlier generation of the system. That is the architectural
smell in one line of DDL.

---

## 2. Part 1 — transport honesty — BUILT (this branch, not deployed)

Shipped here because a door that lies about whether it opened cannot be reasoned
about at any higher level.

- **`lib/email/sendEmail.ts`** gains `SendFailureKind` — `quota_exceeded`,
  `rate_limited`, `provider_auth`, `invalid_recipient`, `provider_error`,
  `not_configured`, `exception` — plus `retryable` and `ourFault`. Quota is
  separated from throttle because the remedies differ. An unrecognised provider
  error degrades to `provider_error`, never to success. **A resolved send with no
  message id is a failure**: success now requires provider-issued proof.
- **A quota / credential / not-configured failure emits a greppable
  `[MAIA/email] TRANSPORT_DOWN` line.** When that fires, every code, invite and
  reset in the system is failing — it should not have to be inferred from a
  per-request error.
- **All five auth routes now send through `sendEmail`.** No route in the auth lane
  constructs its own Resend client. (`app/api/members/beads/route.ts` still does;
  it is not auth and is out of this lane's scope.)
- **An undeliverable code is burned.** The row is invalidated when delivery fails,
  so a member who retries is never asked for a code they were never sent.
- **Member-facing copy tells them whose problem it is.** `ourFault` → `503` and
  "that's on our side, not yours"; a bad address → `400`. Neither sends the member
  in circles through a door that cannot open.
- **`isExistingMember` removed** from the `email-code` and `magic-link` responses.
  It still shapes the email body and server-side telemetry; it no longer crosses
  the wire to an unproved caller.
- **Session creation is fatal in `email-code/verify`.** No valid server session
  means authentication has not completed.
- **New telemetry event** `magic_link_send_failed`. `magic_link_sent` now means
  the provider accepted the send and returned a message id.

**Tests:** `lib/email/__tests__/sendEmail.test.ts` (10) and
`app/api/members/email-code/__tests__/delivery.test.ts` (10). Every failure case
models the **returned-error** shape, including a literal 429 monthly-quota
reproduction. The legacy suite's `{ id }` mock was corrected to `{ data, error }`.
`npm run typecheck` no-regression gate green.

**Deliberately NOT claimed:** none of this is verified in production. The live
`GIT_COMMIT` still predates it.

---

## 3. Part 2 — the seven invariants — PROPOSED

The launch architecture. Founder-stated 2026-08-24; recorded here as the target,
not as built.

1. **One public entrance.** `/signin` and `/signup` collapse into one experience.
   Soullab decides new-vs-returning internally; the member is never asked.
2. **One canonical authentication engine.** Old magic-link / password / OTP
   implementations do not coexist indefinitely.
3. **Email OTP creates *or* signs in the member in one atomic operation.** No
   username, no password, no synthetic passkey. There is no intermediate state
   meaning "verified, but let's see whether we can create the account."
4. **The server session is the sole authentication authority.** localStorage may
   cache presentation data; it never proves identity. *(Closed for `email-code/verify`
   in Part 1; still open on the other doors.)*
5. **Authentication and entitlement are separate.** Auth answers *who are you*;
   membership answers *what may you enter*. A beta switch must never again be able
   to strand authentication.
6. **Transport success must be real.** *(Closed in Part 1 for the auth lane.)*
7. **Passkey is the preferred return path; email OTP is the universal recovery
   path.** No password is required of a new member — so there is nothing to
   forget, reset, mistype, leak, or reuse.

Soulfulness belongs immediately *after* the threshold. Instead of asking someone
to invent a username, MAIA asks *"What would you like me to call you?"* That is
where the relationship starts.

### 3.1 Sovereignty invariant check (CLAUDE.md §6)

- **Increases agency?** Yes — fewer credentials to manage, no invented identifiers,
  no silent lockout.
- **Pushes life outward?** Neutral. A threshold should be crossed, not dwelt in.
- **Reduces psychological centrality?** Yes — the door stops being an event.
- **Cultural sovereignty (Invariant 14):** removing the forced username removes an
  imposed self-naming convention. `'Beautiful Soul'` as a default salutation is a
  framework imposition and should be reviewed in Part 3.

**Growth-obligation check** — this lane *reduces* capability (fewer doors, less
data collected at the threshold, one identity instead of several). New
responsibility created: a single door means a single point of failure, which is
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
mechanics, passkeys, sessions, cookies and token lifecycle — the boring security
work we should *want* to be boring. No third party enters the traffic path and no
identity SaaS holds our members. This is consistent with "self-hosted by design";
it is not a managed-hosting or managed-database dependency.

**ZITADEL** was considered and set aside: powerful and self-hostable, but it adds
a substantial service and administrative plane. Soullab does not need enterprise
IAM to let someone meet MAIA.

**Open questions before any adoption** — a spike must answer all four:
1. Can existing `members` rows migrate without a forced reset for anyone?
2. Does it work in the Capacitor/iOS WebView, where `SameSite=Lax` cookies are not
   sent cross-origin (see CLAUDE.md "Known recurring traps")? Passkeys in
   `WKWebView` require Associated Domains + `webcredentials` on `soullab.life`.
3. Can `members.passkey NOT NULL` be retired without breaking live rows?
4. Does it survive the offline / air-gap posture the project reserves?

**Recommendation:** run the spike against a *copy* of the member schema. Do not
adopt on paper.

---

## 5. Part 4 — Resend stays, but stops being a single point of failure — PROPOSED

The lesson is not "Resend is bad." It is: **we allowed email transport failure to
become identity failure.**

- Part 1 already puts `sendEmail` between auth and the provider. That seam is the
  place a secondary provider is added — auth need never know what Resend is. **No
  secondary provider is configured today**; naming one is a decision, not a patch.
- Resend's `sent` / `delivered` / `failed` / `bounced` webhooks are not consumed.
  Consuming them makes delivery observable rather than assumed — the natural next
  step after Part 1 made *acceptance* observable. Acceptance is not delivery.
- Under invariant 7, a returning member with a passkey needs no email at all. That
  is the real resilience; the fallback provider is the interim.

---

## 6. Sequence

`current auth census` **(done, §1)** → `target architecture` **(done, §3)** →
`Better Auth spike against a copy of the member schema` → `existing-member
migration proof` → `web / PWA / iPhone proof` → `controlled cutover` →
`delete legacy entrances`.

Deleting the legacy entrances is part of the work, not a follow-up. A consolidation
that leaves the old doors mounted has not consolidated anything.

---

## 7. Launch gate

The gate is **not** "tests green." It is a matrix, run end to end, with **no silent
success anywhere**:

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

## 8. Relationship to `a28e62b` (branch `claude/beta-signup-gate-investigation-exdgby`)

That commit removes the beta-waitlist pathway. It is good cleanup and should be
kept. It is **not** the signup repair, and today's evidence says it was not the
outage: `BETA_ALLOWLIST_ENABLED` is unset in production, and every `beta_waitlist`
row is from July — nobody was being stranded there today.

The two branches are independent and touch overlapping files. This lane
deliberately does not carry the waitlist removal, so the two can be reviewed on
their own merits. `a28e62b`'s `{ id }` Resend mock is corrected here; whichever
branch merges second must carry that correction forward.

---

## 9. What would falsify this document

- Production logs showing `[MAIA/email] sent` with real message ids **while**
  members still report no code → the failure is downstream of acceptance
  (deliverability, spam placement), and §5's webhook work becomes urgent rather
  than next.
- The Better Auth spike failing question 2 (iOS WebView) → invariant 7 needs a
  different mechanism, and §4 is withdrawn rather than deferred.
- Members proving able to sign in today on the live commit → the transport bug was
  not the operative cause and §0.1 is a real but secondary finding.
