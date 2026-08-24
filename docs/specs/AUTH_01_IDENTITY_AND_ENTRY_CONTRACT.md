# AUTH-01 — World-Class Identity & Entry Contract

**Status:** CENSUS + CONTRACT. **Design only — not authorized for implementation.**
**Opened:** 2026-08-24 · **Author:** Claude Code session (founder-commissioned)
**Requires:** founder review before any schema migration, account merge, or production auth change.

> Governing invariant for this lane:
> **Identity selection, credential verification, account creation, session creation, and delivery transport are five separate steps.**
> Today they are entangled. Every defect below is a symptom of that entanglement.

> **Second governing invariant — founder ruling, 2026-08-24:**
> **AUTH EXPERIENCE INVARIANT — NO DEAD-END ERRORS.**
> No member-facing sign-in or signup state may terminate in an error-only state.
> The server preserves the exact operational failure for diagnosis; the member-facing
> layer translates it into truthful, actionable recovery choices.
> **Launch acceptance: zero known dead-end auth states.**

---

## 0. What this document is, and what it is not

This is a **census and a target contract**. It authorizes no code.

The `claude/signin-form-field-order` branch (username/password promoted from a 12px
footer link to a peer button) is an **interim accessibility correction**. It is not
"auth complete" and it does not close any finding in this document. It changed which
options are *visible*; it changed nothing about which options are *sound*.

### Census aperture — read this before trusting any count

| Surface | Depth | Standing |
|---|---|---|
| Entry / credential / session-creation paths | Read in full | **CENSUSED** |
| Member-creation sites (`INSERT INTO members`) | Enumerated + read | **CENSUSED** |
| `members` schema + constraints | Read from migrations | **CENSUSED** |
| Middleware gate + route-layer resolver | Read in full | **CENSUSED** |
| The other ~900 API routes | Counted, not individually audited | **UNKNOWN** |
| Production data (do duplicate members exist today?) | Not queried | **UNKNOWN** |

A green census of the entry paths proves the aperture of *this* census, not the
soundness of the whole auth surface. Findings F7 and F10 are explicitly bounded
by that aperture.

---

## 1. Current-state map

### 1.1 The four things currently tangled

```
PERSON              members.id (uuid)  — intended durable identity

LOGIN IDENTIFIERS   members.email      — NOT unique, nullable, inconsistently cased
                    members.username   — UNIQUE NOT NULL
                    members.passkey    — UNIQUE NOT NULL (synthetic for most paths)
                    oauth_accounts(provider, provider_user_id)  — the only real link table

CREDENTIALS         members.password_hash
                    webauthn credentials (+ members.has_webauthn flag)
                    magic_link_tokens (emailed 6-digit code)
                    OAuth proof (Google / Apple)

TRANSPORT           Resend, via lib/email/sendEmail.ts
```

⭐ Read this block as the root cause made visible: four kinds of login identifier, no layer that
joins them to one person.

`members.passkey` is doing duty as a NOT NULL identity column while every modern path
fabricates a synthetic value to satisfy it — `EMAIL-<USER>-<ts>`
(`app/api/members/register-email/route.ts:100`), `GOOGLE-<hex>`
(`app/api/auth/signin/google/callback/route.ts:184`). A column that every path must
lie to is a column that has outlived its meaning.

### 1.2 Sites that can create a durable person

`INSERT INTO members` appears in **10 non-test locations**:

```
app/api/members/register-email/route.ts        email + code path
app/api/members/register/route.ts              passkey/invite induction path
app/api/members/register-local/route.ts        local path
app/api/members/enter/route.ts                 email + password, creates on miss
app/api/auth/signin/google/callback/route.ts   web OAuth
app/api/auth/google/native-callback/route.ts   iOS OAuth
app/api/auth/signin/apple/callback/route.ts    web OAuth
app/api/auth/apple/native-callback/route.ts    iOS OAuth
app/api/now-what/register/route.ts             separate product surface
app/api/team/invite/[token]/register/route.ts  invite path
```

Ten doors, each with its own idea of what makes a person new.

### 1.3 Sites that can create a session

19 non-test locations call `createServerSession` / `setSessionCookies`. The route-layer
resolver (`lib/auth/getMemberFromRequest.ts`) is the single hardened reader; the writers
are not similarly consolidated.

---

## 1A. The dead-end ruling — founder, 2026-08-24

**Status: RULED. Binding on this lane.** Not a design preference — an acceptance condition.

A failure response must distinguish three things, and the member-facing layer must carry all three:

```
what happened  ·  whether retry can help  ·  what the member can do now
```

### The rules

1. **Never dead-end.** Every unsuccessful attempt exposes at least one viable next action, or a
   human-support path when none exists.
2. **Never advertise a method that cannot work.** A stale `has_webauthn = true` is not evidence
   the platform can attempt a passkey.
3. **Never blame the member for our failure.** Provider quota, configuration, deployment drift,
   session failure and outage are ours, and are said to be ours.
4. **Preserve privacy.** Pre-auth choices must not reveal whether an email exists, its roles, or
   its credential inventory. *(This constrains rule 2: capability may narrow the menu only
   **after** authentication.)*
5. **Keep the person's input.** A delivery failure must not erase the email they typed.
6. **Offer recovery in context.** "Try again" appears only for `retryable = true`. A quota refusal
   never says "try again."
7. **Signup behaves the same way.** A failed signup path yields another path or a clear return —
   never an opaque error page.
8. **Session creation is part of success.** Never celebrate "you're in" before the durable
   authenticated session exists.
9. **Support is an action, not a footer.** For genuinely blocked states, "Get help" is visible and
   carries a non-sensitive correlation reference.

### Worked example — the current quota refusal

Today's terminal red box becomes:

```
Email sign-in is temporarily unavailable.
You can still enter another way.

  → Sign in with username and password
  → Use a passkey on this device        (only when actually available)
  → Try email again later
  → Get help                            (carries reference 8cc73…)
```

### ⚠️ Tension this ruling creates with §3, named not hidden

Rule 2 (never advertise what cannot work) and rule 4 (never disclose credential inventory
pre-auth) pull against each other. **The resolution is the phase boundary, not a compromise:**
*platform* capability may gate a button pre-auth (does this device support WebAuthn at all — a
fact about the browser, not the account); *account* capability may only narrow the menu after
authentication. A method the account lacks fails at verification, where failure discloses nothing.

---

## 2. Findings

Each finding is classed. **VERIFIED** = read in source, cited. **UNKNOWN** = the
structural condition is verified, the live consequence is not measured.

### ROOT CAUSE — durable person identity and login identifiers are conflated · VERIFIED

> **There is no canonical person / login-identifier layer.** `members` is simultaneously the
> person and one of that person's identifiers. Nothing in the system guarantees that multiple
> **verified** identifiers for one human resolve to one durable member.

This — not F1 — is the defect that produced the split we lived through:

```
kelly@soullab.life   →  member A
soullab1@gmail.com   →  member B          ← both addresses valid, both verified
Google identity      →  A or B, decided by a string comparison (F2/F3)
username "Kelly"     →  A
```

Every finding below is a symptom of this one. F1 and F2 are how the *same* identifier splits a
person; F3 is how a *different* identifier fails to rejoin one. Fixing F1 and F2 alone would leave
the observed failure fully reproducible, because both addresses above are legitimate and neither
duplicates the other.

**Consequence for scope:** the identity model in §4 is not an optimization of the current schema —
it is the only change in this lane that addresses the root cause. F1/F2/F3 remediation (AUTH-01-E)
stops the bleeding; it does not close this.

### F1 — `members.email` has no uniqueness constraint · VERIFIED · **duplicate-person enabling defect**

`database/migrations/20260103000001_members.sql:10` declares `email VARCHAR(255)` —
nullable, no `UNIQUE`. Lines 6–7 make `passkey` and `username` `UNIQUE NOT NULL`.
The only index touching email anywhere in `database/migrations/` is on
`email_verification_token` (`20260110000001_email_verification.sql:14-15`).

**The database permits N durable members per email address.** Nothing at the storage
layer can catch a duplicate person. Every guard against duplication is application
code, and that code disagrees with itself — see F2.

⚠️ **This is an enabler, not the root cause.** Correction accepted 2026-08-24. A unique
constraint on `members.email` would close the *same-identifier* subclass and nothing more.
It would not have prevented the identity split actually observed, which involved **different
valid identifiers for the same person** — see the root cause below.

### F2 — Email matching is case-inconsistent across the doors · VERIFIED

| Site | Predicate |
|---|---|
| `app/api/members/email-code/route.ts:114` | `LOWER(email) = $1` |
| `app/api/members/enter/route.ts:34` | `LOWER(email) = $1` |
| `app/api/members/register-email/route.ts:88` | `email = $1` |
| `app/api/auth/signin/google/callback/route.ts:170` | `email = $1` |
| `app/api/auth/google/native-callback/route.ts:157` | `email = $1` |
| `app/api/auth/signin/apple/callback/route.ts:228` | `email = $1`, param lowercased |

Half the doors normalize in SQL; half compare a lowercased parameter against a column
that no constraint requires to be lowercase.

**Mechanism:** any `members` row whose stored email is not lowercase is invisible to
the exact-match doors. Google OAuth then falls through "existing link → existing email
→ create" (`google/callback:153-196`) and creates a **second durable person** for the
same human.

**UNKNOWN:** whether non-lowercase rows exist in production today. Structural defect
verified; live blast radius unmeasured. Census query before any merge work:

```sql
-- Rows that the exact-match doors cannot see
SELECT count(*) FROM members WHERE email IS NOT NULL AND email <> LOWER(email);

-- Humans who may already be two people
SELECT LOWER(email) AS e, count(*), array_agg(id) FROM members
 WHERE email IS NOT NULL GROUP BY 1 HAVING count(*) > 1;
```

### F3 — Email is the only bridge between OAuth and an existing person · VERIFIED

All four OAuth callbacks resolve: `oauth_accounts` link → **email exact match** →
create. `oauth_accounts(provider, provider_user_id)` is the only durable link, and it
only exists *after* a first successful sign-in. The bridge for the first sign-in is the
fragile match from F2. A Google identity and an emailed-code identity for one human are
joined by a string comparison with no constraint behind it.

### F4 — `/api/members/lookup-email` is an unauthenticated enumeration oracle · VERIFIED

`app/api/members/lookup-email/route.ts` takes any email, unauthenticated, and returns:

```json
{ "exists": true, "hasWebauthn": false, "name": "<real name>", "username": "<username>" }
```

Existence, the person's **real name**, their **username**, and their **credential
capability** — to anyone who can POST. Its own header comment says it "Never returns
sensitive data (no hashes, no IDs in response)", which is true and beside the point:
enumeration is the disclosure.

**`grep` finds zero callers in the repo.** It is reachable dead code. That makes
deleting it the cheapest real security win available in this lane.

### F5 — The code endpoint discloses admission status pre-auth · VERIFIED

`app/api/members/email-code/route.ts` returns `{status:'waitlist'}` (`:155`) for a
non-admitted email and `{success:true}` (`:296`) for an admitted one. Anyone can test
whether a given address is on the private-beta allowlist. The waitlist UX is good and
worth keeping; the *distinguishable pre-auth response* is the defect.

### F6 — The system advertises a capability it cannot verify · VERIFIED

`app/api/auth/webauthn/authenticate/verify/route.ts:145`

```ts
hasWebauthn: member.has_webauthn || true,   // always true
```

`|| true` makes the field constant regardless of the column. The same field is computed
correctly two files over — `native-biometry/verify/route.ts:129` and
`members/me/route.ts:198` both use `|| false`.

This is the founder's invariant 4 as a one-token bug, and it is the mechanism behind
"Face ID is available" on accounts with zero credentials. Note that even the *correct*
`has_webauthn` column is a cached flag maintained by
`lib/auth/webauthnServer.ts:246,389`, not a count of live credentials — so the target
contract must derive capability from credential evidence, not from either flag.

### F7 — The middleware gate is a presence check, not authentication · VERIFIED (bounded)

`middleware.ts:81-99`, under a `TODO: Replace with actual implementation` at `:79`:

```ts
const memberIdHeader = req.headers.get('x-member-id');
if (memberIdHeader) return true;                      // any value
const sessionTokenHeader = req.headers.get('x-session-token');
if (sessionTokenHeader) return true;                  // unvalidated
if (url.searchParams.get('_t') || url.searchParams.get('_m')) return true;  // presence only
```

**Two things materially reduce this, and both are verified:**

1. `x-access-authed` — the header middleware stamps — has **zero consumers** outside
   `middleware.ts`. Nothing downstream treats the gate's opinion as authority.
2. `lib/auth/getMemberFromRequest.ts` is genuinely hardened: it validates against
   `auth_sessions` and explicitly rejects a bare `x-member-id` that does not match the
   verified session (`:50-67`), with a header comment documenting the impersonation bug
   this replaced.

So: the gate is weak, the resolver is sound, and the resolver is what matters — **for
the routes that use it.** Which is F10.

### F8 — Transport is half-bounded · VERIFIED

`lib/email/sendEmail.ts` is a real boundary with failure classification (`ourFault`,
`retryable`, `failureKind`, `providerCode`) — built after the quota incident, and the
auth path correctly routes through it (`email-code/route.ts:188`). But `Resend` is still
constructed directly elsewhere, e.g. `lib/services/emailService.ts:8,48`. The auth path
is provider-swappable; the codebase is not. Good enough for AUTH-01; name it so it isn't
mistaken for done.

### F9 — Entering an identifier commits the person to one transport · VERIFIED

`components/auth/UnifiedAuth.tsx` — `sendCode()` fires `POST /api/members/email-code`
on **Continue**. Typing an email *is* choosing email delivery. When the provider refuses,
that route 502s and the default path dies with it. Passkey, password, Google and Apple
remain functional but are not where the person was sent.

This is the finding the front-door redesign exists to fix. Nothing shipped so far
touches it.

### F10 — 27 routes read `x-member-id` without the hardened resolver · **RESOLVED → 20 UNSAFE**

Census of `app/api/**/route.ts` (923 routes):

| | count |
|---|---|
| use `getMemberFromRequest` | 211 |
| read `x-member-id` at all | 53 |
| read `x-member-id` **without** importing `getMemberFromRequest` | **27** |

Includes `app/api/sovereign/app/maia/route.ts` (the primary conversation route) and
`app/api/members/me/route.ts`.

⚠️ **Censused 2026-08-24 — see `AUTH_01_C_XMEMBERID_AUTHORITY_CENSUS.md`. No longer UNKNOWN.**

```
🔴 UNSAFE AUTHORITY          20
✅ SAFE — verified credential  2
✅ SAFE — claim cross-checked  2
⚪ NON-AUTHORITY USE           3
❓ UNKNOWN                     0
```

Middleware does not mitigate: its `isAuthenticated()` accepts the caller's own header, unmapped API
routes are allowed by default (`ACCESS_CONTROL_MODE` defaults to permissive), and tier/roles come
from caller-controlled cookies. Highest-severity: `sovereign/app/maia` takes `userId` from the
**request body** with no auth gate, on the route carrying ~99.6% of conversation traffic, and both
reads developmental memory and writes `relationship_entries` with it.

⛔ Classifications are **source-read**, not runtime-witnessed. Exploitation was deliberately not
attempted.

### F11 — The server already honours the ruling. The client discards it. · VERIFIED

This is the most important correction in this revision, and it inverts the obvious assumption.

`app/api/members/email-code/route.ts:264-284` already implements most of the ruling:

```ts
if (!sendResult.ourFault) {
  return NextResponse.json({ error: "We couldn't send a code to that address…",
                             reason: 'email_address_rejected', retryable: false }, { status: 400 });
}
return NextResponse.json({
  error: sendResult.retryable
    ? "We couldn't send your code — that's a problem on our side, not yours. Please try again in a few minutes."
    : "We can't send codes right now. That's a problem on our side, not yours, and retrying won't help. Please contact support@soullab.life and we'll get you in.",
  reason: 'email_provider_refused',
  retryable: sendResult.retryable === true,
}, { status: 502 });
```

It distinguishes what happened (`reason`), whether retry helps (`retryable`), refuses to blame the
member, refuses "try again" on a non-retryable refusal, and routes to support instead. It leaks
neither the provider's wording nor the internal taxonomy. **Rules 3 and 6 are already satisfied
server-side.**

`components/auth/UnifiedAuth.tsx:188` then does this:

```ts
if (!res.ok) { setError(data?.error || 'Could not send the code. Please try again.'); return; }
```

**`reason` and `retryable` are read by nothing.** The structured contract exists, is correct, and
dies at the client boundary — flattened into one red string. The work here is not to build the
contract; it is to stop throwing it away.

### F12 — Six client paths give retry advice the server did not authorize · VERIFIED

Every `setError` in `UnifiedAuth.tsx` that is not the biometric handler:

| Line | String | Defect |
|---|---|---|
| `:194` | `'Could not send the code. Please try again.'` | exception path — unconditional retry advice, overrides `retryable:false` |
| `:223` | `'Could not verify the code. Please try again.'` | same |
| `:254`, `:263` | `'Could not complete signup. Please try again.'` | same |
| `:324` | `'Sign in succeeded but memberId missing.'` | internal state to the member; no action offered |
| `:364`, `:390` | `'Google sign-in failed: ' + e.message` | raw exception text to the member |
| `email-code:299` | `'Could not send the code. Please try again.'` | 500 fallback contradicts the 502 handler above it |

`:324` is the ruling's rule 8 working correctly — it refuses to proceed without a resolvable
member — and simultaneously failing rule 1, because it hands the person nothing to do.

⭐ **The positive precedent is already in the file.** `continueWithBiometric` (`:283-288`) maps
failure codes to actionable member copy:

```ts
if (code === 'CREDENTIAL_NOT_FOUND') msg = 'No Face ID set up here yet — enter your email and we'll send a code.';
else if (code === 'DEVICE_NOT_TRUSTED') msg = 'This device isn't set up yet — continue with your email.';
else if (code === 'USER_CANCELLED') msg = 'Cancelled. Tap again when you're ready.';
```

That is the ruling, already implemented, in one handler. **Generalize it; do not invent it.**

### F13 — Dead-end exposure differs by phase · VERIFIED

On the **email** phase, the error renders above a form that still shows password, biometric and
OAuth — so a quota refusal is *not* a total dead-end there (as of the field-order fix). On the
**code**, **password**, **name** and **waitlist** phases the only other control is a 12px
`← Back to email`. Those four phases are where `dead_end_rate` will actually be non-zero.

### F14 — Biometric availability is platform evidence, not credential evidence · VERIFIED

The button renders on `bioAvailable`, from `biometricAuth.getAvailability()` — whether the
*browser/device* supports WebAuthn. Nothing checks that this account has a live credential.
Combined with F6's `has_webauthn || true`, this is the `false_option_rate` mechanism: a button
presented as usable that the system already knows it cannot honour.

Note the resolution is **not** to consult the account pre-auth — rule 4 forbids that. It is that
platform availability alone may render the button, and the *account* check happens at
verification. See the tension note in §1A.

---

---

## 3. Target state machine

```
                        ┌──────────────────────┐
                        │  IDENTIFY            │
                        │  email or username   │
                        │  [Continue]          │
                        └──────────┬───────────┘
                                   │  resolves login CONTEXT only
                                   │  sends nothing · discloses nothing
                                   ▼
                        ┌──────────────────────┐
                        │  CHOOSE CREDENTIAL   │
                        │  · passkey           │
                        │  · password          │
                        │  · one-time code     │
                        │  · Google / Apple    │
                        └──────────┬───────────┘
                                   │  member picks · only now does transport fire
                                   ▼
                        ┌──────────────────────┐
                        │  VERIFY              │
                        │  credential proof    │
                        └──────────┬───────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
        ┌───────────────────┐         ┌──────────────────────┐
        │ RESOLVES to an    │         │ PROVEN ownership of  │
        │ existing member   │         │ an unknown identifier│
        └─────────┬─────────┘         └──────────┬───────────┘
                  │                              │
                  │                              ▼
                  │                   ┌──────────────────────┐
                  │                   │ CREATE member        │
                  │                   │ (only after proof)   │
                  │                   └──────────┬───────────┘
                  └──────────────┬───────────────┘
                                 ▼
                        ┌──────────────────────┐
                        │  SESSION             │
                        │  server session IS   │
                        │  the login. No       │
                        │  client-side "looks  │
                        │  logged in" state.   │
                        └──────────────────────┘
```

### Rules the machine must hold

1. **Continue sends nothing.** Identification establishes context. Transport fires only
   on an explicit credential choice. (Closes F9.)
2. **The credential menu is not personalized pre-auth.** Every method is offered to
   everyone; the system does not reveal which ones this identifier actually has.
   (Closes F4, F5.) A method the person doesn't have fails at *verification*, where
   failure discloses nothing.
3. **Capability is derived from credential evidence, never from a cached flag.**
   (Closes F6.) Post-authentication, the UI may show what this member actually has.
4. **Transport failure removes one method, never the door.** (Holds F8.)
5. **Account creation requires ownership proof**, and happens after it, never before.
6. **Session creation is authentication.** Server session fails ⇒ login failed.
7. **One authority.** Verified server credentials resolve the member. Middleware may
   gate; it may not authenticate. localStorage, query params and raw member IDs never
   decide identity. (Target for F7, F10.)
8. **Signup and signin are one door.** The server, after proof, knows whether this is a
   return or a first arrival. The person never has to know which they are.
9. **Recovery must not share a single point of failure with the primary path.**

---

## 4. Target identity data model

```
members
  id                    uuid PK          ← the durable person. Never duplicated.
  name, preferred_name, onboarded, tier, roles, …
  -- email / username / passkey / password_hash MOVE OUT (see §5)

member_login_identifiers
  id                    uuid PK
  member_id             uuid FK → members(id) ON DELETE CASCADE
  kind                  enum: email | username | google | apple
  identifier            citext            ← normalized at the type level, not by callers
  verified_at           timestamptz NULL  ← NULL = claimed, not proven
  is_primary            boolean
  created_at
  UNIQUE (kind, identifier)               ← the constraint F1 is missing
  -- partial unique: one primary per (member_id, kind)

member_credentials
  id                    uuid PK
  member_id             uuid FK → members(id) ON DELETE CASCADE
  kind                  enum: password | passkey
  secret_ref            (hash, or webauthn credential id + public key)
  created_at, last_used_at, revoked_at
  -- capability = SELECT count(*) WHERE revoked_at IS NULL. No cached boolean.

auth_sessions            (exists today — extend)
  member_id
  credential_kind       ← which credential proved this session
  credential_id         ← provenance, for step-up decisions
```

Resulting shape:

```
kelly@soullab.life  ─┐
soullab1@gmail.com   ├──→  ce284751…  Kelly   (one durable person)
username "Kelly"     ┤
Google subject       ┘
```

`citext` on `identifier` plus `UNIQUE (kind, identifier)` makes F1 and F2
**structurally impossible** rather than conventionally avoided. That is the point of
the model: not better discipline, but a shape in which the failure cannot be expressed.

---

## 5. Migration implications

**None of this is authorized. Listed so the cost is visible before the decision.**

1. **Backfill is the risky step, not the schema.** Creating the two tables is additive
   and safe. Populating `member_login_identifiers` from today's `members.email` /
   `username` / `passkey` / `oauth_accounts` is where existing duplicates surface —
   the `UNIQUE (kind, identifier)` constraint will **reject** the backfill if two
   members share an email. That is the constraint doing its job, and it must be run
   in a transaction against a production snapshot first.
2. **Duplicate resolution precedes migration.** F2's census query must run, and any
   duplicate persons must be adjudicated *by a human*, before the unique constraint can
   be applied. Automatic merge is out of scope and should stay out — merging two people
   who are actually two people is unrecoverable.
3. **`members.passkey UNIQUE NOT NULL` must be relaxed** before it can be retired; every
   current path fabricates a value to satisfy it.
4. **Dual-read window.** Ten creation sites and 19 session-creation sites cannot change
   atomically. Expect a period where identifiers are written to both the old columns and
   the new table, with reads moved over one door at a time.
5. **No account merge in this lane.** Detection yes; merge is a separate authorized unit
   with its own founder ruling.
6. **Sovereignty note.** `member_login_identifiers` is identity infrastructure, not
   memory: it holds no conversational content and must not become a profile surface.
   The growth-obligation check applies — this capability increase buys provenance
   (`verified_at`, `credential_kind` on sessions), which is the point, not a side effect.

---

## 6. Launch acceptance matrix

Nothing here is claimed as passing. This is the bar, not a report.

| # | Acceptance criterion | Closes | Status |
|---|---|---|---|
| A0 | **All verified identifiers for one human resolve to one durable `members.id`** | ROOT CAUSE | ☐ NOT MET |
| A1 | No email resolves to more than one `members.id` | F1, F2 | ☐ NOT MET |
| A2 | Identifier uniqueness enforced by a DB constraint, not by callers | F1, F2 | ☐ NOT MET |
| A3 | OAuth first sign-in links to the existing person for the same human | F3 | ☐ NOT MET |
| A4 | No pre-auth response distinguishes existing from unknown identifiers | F4, F5 | ☐ NOT MET |
| A5 | No pre-auth response discloses name, username, roles, member id, or credential capability | F4 | ☐ NOT MET |
| A6 | Advertised credential capability is derived from live credential rows | F6 | ☐ NOT MET |
| A7 | Identification does not trigger any transport | F9 | ☐ NOT MET |
| A8 | With the email provider hard-down, passkey + password + Google + Apple all still sign a member in, and the UI says which method is unavailable and why | F8, F9 | ☐ NOT MET |
| A9 | Every member-scoped route resolves identity through one verified-session authority | F7, F10 | ☐ NOT MET |
| A10 | Middleware cannot authenticate — only gate | F7 | ◐ PARTIAL (no consumers of `x-access-authed`; gate itself still presence-based) |
| A11 | A failed server session yields a failed login, with no client-side authed state | — | ☐ UNKNOWN — not censused |
| A12 | Account creation occurs only after ownership proof, at every one of the 10 creation sites | — | ◐ PARTIAL (`register-email` proves via `magic_link_tokens`; other 9 unaudited) |
| A13 | At least one recovery route does not depend on the primary path's infrastructure | — | ☐ NOT MET (email is both) |
| A14 | Every major route has comparable visual dignity | F9 | ✔ MET on `/signin` (interim branch); unverified elsewhere |
| A15 | **Zero known dead-end auth states** — every failure exposes ≥1 viable action or a support path | F11–F13 | ☐ NOT MET |
| A16 | No client path offers retry when the server returned `retryable:false` | F11, F12 | ☐ NOT MET |
| A17 | No member-facing string carries raw exception text or internal state | F12 | ☐ NOT MET |
| A18 | No method is presented as available without evidence the platform can attempt it | F6, F14 | ☐ NOT MET |
| A19 | Entered identity context survives a method switch | rule 5 | ◐ PARTIAL (`email` state persists across phases; unverified on OAuth round-trip) |
| A20 | Blocked states surface "Get help" with a non-sensitive correlation reference | rule 9 | ☐ NOT MET (support address is in copy; no reference id) |

A14 is the only row the shipped work touches. **1 of 21.** That ratio is the honest summary of
where this lane stands.

---

## 7. Smallest safe implementation sequence

Ordered by (risk ascending × reversibility descending). **Each unit requires its own
authorization. Nothing below is authorized by this document.**

**AUTH-01-A · Delete `/api/members/lookup-email`** — zero in-repo callers, removes a
live unauthenticated enumeration oracle. Pure deletion, instantly revertible. Closes
half of F4 with the smallest diff in the lane.

**AUTH-01-B · Fix `|| true` at `webauthn/authenticate/verify:145`** — one token. Closes
F6's acute form. (The cached-flag issue remains, and is fixed by the model in §4.)

**AUTH-01-C · Census the 27 `x-member-id` routes** — ✅ **COMPLETE, 2026-08-24.** It escalated:
20 UNSAFE AUTHORITY. Remediation is now the lane's first priority and outranks every UX unit
below, including E2. See `AUTH_01_C_XMEMBERID_AUTHORITY_CENSUS.md` §6.

**AUTH-01-D · Production duplicate census** — run F2's two queries. Read-only. Tells us
whether duplicate persons already exist, which determines whether §5 is a migration or
a rescue.

**AUTH-01-E · Normalize email comparison at all six doors** — make every predicate
`LOWER(email) = LOWER($1)` and lowercase at every insert. Does not fix F1, but stops the
bleeding while the model is decided. Behavioural change, needs verification per door.

**AUTH-01-E2 · Carry `reason` + `retryable` through the client** — the server contract already
exists (F11). Stop discarding it: read both fields, choose copy from `reason`, and render "try
again" only on `retryable:true`. Then generalize the biometric handler's shape (F12) to every
failure path, and replace raw exception strings. No schema, no new endpoint, no pre-auth
disclosure. **This is the cheapest route to A15/A16/A17 and it should probably run before F.**

**AUTH-01-F · Front-door state machine (§3), old data model** — identify → choose →
verify, with Continue firing no transport. Deliverable is the UI + route contract, still
reading `members.email`. Closes F9 and A7/A8 without touching schema.

**AUTH-01-G · Uniform pre-auth responses** — indistinguishable replies across
exists/unknown/waitlist. Closes F4, F5, A4, A5. Depends on F.

**AUTH-01-H · Identity data model (§4)** — additive tables + dual-write. Requires D
resolved and its own founder ruling.

**AUTH-01-I · Cut over reads, retire `members.passkey`, drop the old columns.** Last.

**Not in this lane, named so it stays out:** account merge, the wider `Resend →
EmailProvider` interface beyond the auth path, middleware rewrite, and the
`register/register-local/now-what/team-invite` creation doors (they need their own
census before anyone touches them).

---

## 8. Open questions requiring a founder ruling

1. **Username as a first-class login identifier, or a legacy identifier being retired?**
   §4 models it as first-class. If the intent is retirement, the front door in §3 should
   say "email" and the migration gets materially simpler.
2. **Do we adjudicate existing duplicate persons before or after the front-door redesign?**
   Recommendation: run AUTH-01-D now (read-only), decide after seeing the number.
3. **Is enumeration resistance a launch blocker, or a fast-follow?** It trades against
   the warmth of "Welcome back, Kelly." The target machine chooses resistance; that is a
   real UX cost and it is the founder's call, not mine.
4. **Does the private-beta waitlist survive uniform pre-auth responses?** A warm
   "you're on the list" message is itself the disclosure. Both are defensible; they
   cannot both be maximized.

---

## 9. Standing

**PROVEN:** ROOT CAUSE, F10 (resolved — 20 UNSAFE), F1, F2 (structure), F3, F4, F5, F6, F7 (bounded), F8, F9, F11, F12, F13, F14.
**UNKNOWN:** F2 (live blast radius), A11, A12 beyond `register-email`, and the
~900 routes outside this census.
**NOT CLAIMED:** that the entry paths censused here are the whole auth surface. They
are not.
