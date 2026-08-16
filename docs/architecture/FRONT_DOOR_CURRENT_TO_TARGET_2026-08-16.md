# Front Door — CURRENT EXPERIENCE → TARGET EXPERIENCE

**Directive §26 deliverable.** Signup → Sign-in → First Arrival → Onboarding → First MAIA Encounter.
Decision surface only. **No production code has been changed.**

Bound referents: production `39cc97d87` · trunk `origin/clean-main-no-secrets` = `1c1e99578` ·
prod is 20 commits behind trunk with **zero auth commits in the gap**. The five core front-door
files are byte-identical to production. Custody detail: `00-custody-binding.md`.

Evidence classes are marked throughout. ✅ = personally verified at the deployed SHA.
Four of five research competencies reported; the journey-matrix competency was still running at
time of writing and its friction ledger is not yet folded in.

---

## 1 · CURRENT EXPERIENCE

A person lands on `soullab.life/signin` and sees a `BETA` badge, "Welcome.", "Sign in to enter.",
an email field, and four more buttons: Face ID/Touch ID, Google, Apple, "Use a password instead."

They type an email, get a six-digit code, type it, and land in `/maia`. On desktop and mobile web
this works — 67 sessions created, `token_redeemed` = `session_created` = 67 exactly, and the
`session_missing_after_verify` failure event has **never fired** (RUNTIME-WITNESS, `onboarding_events`).

That is the whole functioning path. Almost everything else on that screen is either broken,
unreachable, or misleading.

**The waitlist is gone.** Un-gated 2026-07-28 (`eb792efaa`); `BETA_ALLOWLIST_ENABLED` unset in
production ✅. The waitlist phase in `UnifiedAuth.tsx` is unreachable-but-retained as a documented
re-gate switch. Four people were turned away before it came down, all four were subsequently
approved, and none were ever told.

⚠️ **Correction to an earlier claim in this programme.** It was suggested that a founder sighting of
the waitlist screen could be explained by a stale cached bundle. **That explanation is wrong and is
withdrawn.** Entry to the waitlist phase is strictly conditional on a server-supplied field
(`UnifiedAuth.tsx:184` reading `data.status`), so a stale bundle carries the identical dependency
and cannot display it either. The literal string does still ship in the live JS chunk
(`21689-342a2c8730468bf6.js`) — present but unreachable. The sighting therefore remains
**unexplained**; the honest options are that it predates 2026-07-28 or that the `BETA` badge and
"Sign in to enter." were read as a gate. Do not let a plausible mechanism stand in for an
unestablished one.

**The documented onboarding chain no longer exists.** `/begin` and `/test-elemental` are bare
`redirect('/signin')` stubs; `/intro-maia` and `/intro-daimon` have no `page.tsx` at all. CLAUDE.md
documents a system that is gone.

**"Enter MAIA" does not enter MAIA.** The actual arrival path is
`/signin` → email → code → name → **`/onboarding`** (incl. birth data) → **`/choose`**
(`app/onboarding/page.tsx:119`) → `/maia` → **WeekZeroOnboarding, 6 steps** → Arrival.
The button labelled "Enter MAIA" (`UnifiedAuth.tsx:432`) leads to **four further gates**.

## 2 · TARGET EXPERIENCE

> ARRIVE → UNDERSTAND → ENTER → IDENTIFY → CONNECT → MEET MAIA → DEEPEN

One primary action, ranked not enumerated. A returning member crosses in one gesture. A new person
learns what this is and what will be remembered before speaking, without a slideshow. Recovery
always reconnects and never mints. Identity is proven server-side on every request, and no client
claim is ever authority.

---

## 3 · CURRENT DEFECTS

Ordered by severity. **D1–D3 are security defects that outrank every experience question.**

### D1 · Identity is a presence check ✅ VERIFIED — CRITICAL

`middleware.ts:81` at the deployed SHA, carrying its own `TODO: Replace with actual implementation`:

```
const memberIdHeader = req.headers.get('x-member-id');
if (memberIdHeader) return true;          // ANY value
const sessionTokenHeader = req.headers.get('x-session-token');
if (sessionTokenHeader) return true;      // ANY value, never validated
if (url.searchParams.get('_t') || url.searchParams.get('_m')) return true;
```

No `auth_sessions` lookup occurs. `app/api/auth/whoami/route.ts` ✅ does
`SELECT … FROM members WHERE id = $1` on a bare `x-member-id` and returns `authed: true` with
username, tier and `isPractitioner`. **Existence of a UUID is treated as proof of holding it.**

Auditor (CODE-READ, not re-verified in full): **37 routes** read `x-member-id` without session
verification; ~60 more accept `?memberId=`/`?userId=`; `admin/monitoring*` performs no role check;
16 practitioner routes use a local `getMemberFromRequest` that **shadows the hardened helper's
name** with existence-check semantics.

**Reconciliation of a genuine contradiction between two competencies.** The mobile competency
reported that `x-member-id` "is not a credential anywhere." That is true *of the hardened helper* —
`lib/auth/getMemberFromRequest.ts:50-68` ✅ refuses a bare claim and rejects mismatches as
impersonation, and it is excellent code. It is false of the system, because the 37 routes never
call it. **Availability is not composition.** The helper's correctness is the fix to preserve, not
evidence that the system is safe.

Not a runtime exploit witness: no endpoint was probed. UUIDs are v4 and unguessable — but need not
be guessed. `members/lookup-email` is an unauthenticated account-existence oracle, and
`members/magic-link` places `member_id` **in a URL query string**.

### D2 · Founder password public on GitHub ✅ VERIFIED — CRITICAL

`SoullabTech/Sovereign` is **PUBLIC**. Three files at HEAD *and on the default branch* carry a
plaintext credential across 12 commits: `app/signin/page.tsx.DISABLED` (3 pairs),
`KELLY_LOGIN_FIX_COMPLETE.md`, `scripts/admin-reset.ts`. On a branch named `clean-main-no-secrets`.

**Remedy is rotation, not history rewrite** — the value is already public.
Verified clean: prod `RESEND_API_KEY` absent from tree and full history; `monitor.env.example` is an
all-`x` placeholder; zero hits for Anthropic, AWS, GitHub-token and JWT patterns in tracked files.

### D3 · Duplicate identity, already realized ✅ VERIFIED — CRITICAL

| id | email | username | onboarded | created |
|---|---|---|---|---|
| `aed4e372…` | `Inhomesanctuary@gmail.com` | kristen | **true** | 2026-01-23 |
| `bce7a472…` | `inhomesanctuary@gmail.com` | kristenn | false | 2026-02-08 |

One capital letter. A real person re-registered because the system did not recognize her; her
onboarded account is orphaned. **No unique index on `members.email` or `LOWER(email)`** ✅ —
`pg_indexes` shows only `members_pkey`, `members_passkey_key`, `members_username_key`. Seven rows
hold non-lowercase emails, and both Google and Apple callbacks compare `WHERE email = $1`
case-**sensitively**, so six more are one OAuth sign-in from splitting.

This answers §4 and Q9 empirically: **the identity invariant is not currently held.**

### D4 · The primary front door is cookie-only ✅ VERIFIED — HIGH

`email-code/verify` ✅ returns `{success, member, redirect}` — **no session token in the body** — and
sets `maia_session` as an httpOnly `sameSite: lax` cookie. `storeSession(user, sessionToken?)` ✅
writes `maia_session_token` only when passed a second argument. The email-code call site (`:206`)
passes nothing. Biometric (`:288`) and password (`:319`) both pass `session?.token`.

Capacitor's origin is `capacitor://localhost` with no `server.url`, so soullab.life cookies are
cross-origin and unusable. **Predicted native symptom: sign-in appears to succeed, redirects to
`/maia`, then every call 401s.** Silent failure, not wrong identity.

Native OAuth callbacks *do* return a token explicitly "so the native app can use header-based auth"
— and the client drops it on the floor.

⚠️ **This is a prediction, not a witness.** No device walk was performed. It is the single highest-value
thing to test first, and `AUTH_TRACE_PATHS` (`apiBase.ts:20-24`) exists for exactly this.

### D5 · No consent basis before the first MAIA turn — HIGH

`termsAccepted|acceptedTerms|privacyAccepted|tos_accepted` → **0 files repo-wide** (CODE-READ, two
searches). A person reaches their first exchange having accepted nothing — no terms, no privacy
notice, no statement that conversations are remembered. Sanctuary Mode governs the *exception*
while nothing discloses the *rule*. On by default without an explicit act: memory continuity, all
recall preferences, Wu Xing lens, astrology load, onboarding telemetry (records email).

### D6 · "Face ID" shown on API presence, not capability — MEDIUM

`UnifiedAuth.tsx:468` gates on `browserSupportsWebAuthn()`. `platformAuthenticatorIsAvailable()` is
computed into a separate field the button ignores. Directive §2C forbids exactly this.

### D7 · Passkeys structurally impossible on native — MEDIUM

Three independent blocks: `biometricAuth.ts` uses raw relative `fetch('/api/auth/webauthn/...')`
while `app/api` is removed from the native build; `expectedOrigin` is one exact string (also
breaking passkeys on every Master Field subdomain); `App.entitlements` has only `applesignin` — no
`associated-domains`, no `webcredentials`, no `.well-known`. The sole enrollment UI
(`app/account/security`) is excluded from native.

### D8 · Service worker cache never invalidates — MEDIUM, blast radius unknown

`PWAProvider` registers `/sw-enhanced.js`, **which does not exist**, and the provider isn't mounted
in `app/layout.tsx`. The only reachable registration is from `/consciousness-computing/pwa` at
`scope:'/'`, whose navigation handler is **cache-first with no revalidation**, and whose cache name
is hardcoded and excluded from its own purge sweep. For anyone who ever hit that page, no deploy
and no version bump invalidates anything. This is the mechanism by which a retired UI can still be
displayed to a real person, and it answers Q10.

### D9 · Wu Xing moment block is unlabelled — MEDIUM (downgraded)

Originally reported HIGH as "clock-derived diagnostics as biography," citing
`lib/astrology/wuxingSnapshot.ts` — **a path that does not exist**; the real file is
`lib/consciousness/wuxingSnapshot.ts`. A `git diff` against a nonexistent path reports "no change,"
which nearly laundered a bad citation into a verified one.

What holds: `shouldComputeWuXing = isRecognizedUser && !isSanctuary` (no birth-data gate); without
a BaZi profile `constitution` is null and the snapshot derives from `computeWuXingMoment(new Date())`;
constitution lines *are* gated at `:360` while `Current State` / `Needs Support` / `Excessive` /
`Spirit Focus` / `Balancing Moves` are not.

What was omitted: every symbolic addendum is prefaced by `SYMBOLIC_LENS_BOUNDARY` ✅, which states
the lens is "NOT facts, NOT predictions, NOT evidence about this member's actual life… You still
know only what they have actually told you." It is ablation-validated (over-assertion index −3.63).

**The boundary does its job.** Residual defect is narrower: inside the block, moment-derived and
person-derived content are typographically indistinguishable. The fix is a label, not a gate. The
right instrument is a moment-only ablation; none exists.

### D10 · Dead surface — LOW but load-bearing for comprehension

~1,215 LOC of auth UI with zero page importers (`UnifiedAuthModal`, `SignInCard`, `QRLoginDisplay`,
`SyncAccountPrompt`, `MagicLinkForm`, `OAuthButtons`, `PasswordFallback`). Five dead session stores.
`/api/members/magic-link` is live but reachable only from dead components, while `app/magic-link/`
pages still exist. **10 `INSERT INTO members` sites across 5 different column shapes.** Five parallel
session-cookie regimes. Duplicate pairs: `members/password` vs `change-password`;
`members/reset-password` vs `admin/reset-member-password`.

⛔ Inventory only. Deletion is **not** authorized by this document.

### D11 · The password card is unusable by the people it appears to serve — MEDIUM

At signup the system machine-generates all three classic credentials and **shows the member none of
them**: a 32-hex password (`UnifiedAuth.tsx:65-68,:235`), a username derived from the email
local-part (`:236`), and a synthetic passkey (`register-email/route.ts:101`). The "Use a password
instead" card then asks for a *username* the member has never been told, and there is **no
forgot-password link** (`:419-421`). The card is structurally dead for anyone who arrived by the
primary path.

Related: passkey enrolment exists at only three sites, and the email-code path has **no enrolment
branch** — so the no-passkey population is self-perpetuating by construction.

### D12 · Navigation intent is discarded — LOW, trivially fixable

`middleware.ts:299` sets `?next=`; UnifiedAuth reads only `verified`/`email`/`u` (`:76-78`) and
**drops it**. Separately, `verify/route.ts:146-161` computes a correct `data.redirect` and the client
**discards it** at `:211`. And `/resume` — a purpose-built recovery escape hatch — is linked from
nowhere in the product.

---

## 4 · CURRENT FRICTION

1. **Choice overload at the threshold.** Five mechanisms at equal visual weight; two of them
   (Google, Apple) are non-functional on native, one (Face ID) is shown without capability
   detection. Google's guidance is explicit that this overwhelms.
2. **"Sign in to enter." for someone who has never registered** — reads as *you need existing
   access*, reinforced by the `BETA` badge. The mechanism is open; the language is not.
3. **41% of issued codes are never redeemed** — `magic_link_sent` 114 vs `token_redeemed` 67
   (RUNTIME-WITNESS). Some are retries; the gap is unexplained and worth instrumenting, not guessing.
4. **`magic_link_opened` stopped emitting 2026-05-19** while `magic_link_sent` continues to
   2026-08-15 — an instrumentation gap, not a behaviour change.
5. **Three fields with no consumer**: `wisdomFacets`, `focusAreas`, `explorationIntent`. Apparent
   consumers are a referent trap — `MaiaSystemPrompt.ts:432` reads `userContext.wisdomFacets`, but
   that object never reaches the live route (0 hits). `explorationIntent` invites the most personal
   disclosure ("what brought you here") and is the most conclusively dead.
6. **`redirect_loop_detected` fired twice** (2026-06-05).

**Disconfirmed hypothesis, recorded per §5:** the directive expected birth data to be the data-
minimization offender. It is not — it is the **best-governed field in the system**: optional,
skippable, separately consented, server-persisted, cross-device honoured, and `BirthDataForm`'s
persuasive defaults deliberately overridden with a neutral header. The live front door is already
genuinely minimal; password, username, biometric and OAuth are already deferred.

---

## 5 · TARGET FLOWS

**New visitor.** One field, one action. State what this is and what is remembered *before* the first
exchange, in one line with a link — not a checkbox wall. Do not offer five mechanisms.

**Returning member.** Session first; passkey where genuinely available; email-code otherwise. Never
make an existing member reason about signup-vs-login.

**Recovery.** Always reconnects, never mints. All three recovery routes already `LOWER()` both sides
correctly and **cannot** create a member — this part is already right and must not regress.

**Passkey.** Offered *after* a successful first authentication, on capability detection, never as the
first thing a stranger sees. Native support requires `associated-domains` + `.well-known` + an
origin allowlist — currently absent.

**First MAIA.** Authenticated facts + declared name only. `formatMemberWebForPrompt` returns `''`
for a new member, and no greeting/first-turn logic exists (0 hits for
`turnCount|isFirstTurn|greeting|welcomeBack|newMember`) — so nothing currently fabricates intimacy.
**Preserve this.**

---

## 6 · SEQUENCING

Security defects precede experience work. Fixing copy while `isAuthenticated()` is a presence check
optimizes the sign on a door whose lock is decorative.

- **Phase 0 — founder, today.** Rotate the exposed password (D2). Only the founder can do this.
- **Phase 1 — identity integrity.** Repair `isAuthenticated()`; route the 37 bypass routes through
  the existing hardened helper; add `UNIQUE (LOWER(email))` after merging the Kristen pair;
  normalize the OAuth email comparisons. Fail-closed, no bypass.
- **Phase 2 — native credential.** Return the session token in the verify body (or adopt header
  transport uniformly) and pass it to `storeSession`. Device walk with `AUTH_TRACE_PATHS`.
- **Phase 3 — consent floor.** Minimum disclosure before first exchange (D5).
- **Phase 4 — experience.** Rank the mechanisms, fix capability detection, then and only then the
  copy.

Historical outreach to the four waitlisted people is **independent of all of this** (§2 Journey F)
and can proceed as soon as the sender address is settled.

---

## 7 · TEST / WITNESS / DEPLOY

**Test.** Negative control first: bare `x-member-id` against a hardened route must return null —
this test already exists for `resolveIdentity` and should be generalized. Then: duplicate-prevention
on mixed-case email across all 10 insert sites; recovery reconnects; no cross-member leakage.

**Witness.** Code-read cannot settle D4. Required: a real device walk on iOS/Capacitor, Safari, and
an installed PWA, performed by a human, recorded as observation not interpretation. A technical PASS
cannot override a user-visible failure.

**Deploy.** Named immutable SHA via `scripts/deploy-production.sh`; Co-Lab gate 31/31; post-swap
provenance verify fail-closed; confirm no hidden identity migration in the unit; explicitly account
for the D8 cache before believing any front-door change reached anyone.

---

## 8 · FOUNDER RULINGS REQUIRED

Everything else in this document is below the authority boundary and will be implemented without
asking. These three are genuine principle questions where two competent implementers bound by the
same canon would still differ. Each carries a recommended ruling.

**R1 · Is email + one-time code the canonical front door?**
*Recommend: yes.* It is the only path with production evidence of working (67 sessions,
zero session-creation failures), it demands no invented password, and it already unifies signup and
signin. Passkey becomes an accelerator offered after first success; password demotes to recovery;
Google/Apple stay secondary and are hidden where non-functional. Ruling needed because it demotes
four mechanisms and settles Q1–Q5.

**R2 · Must a person authenticate before meeting MAIA at all?**
*Recommend: yes, and say why in one line.* MAIA's value is continuity, and continuity requires an
identity. The honest move is to state that plainly rather than let authentication read as
administrative friction. Ruling needed because the alternative — a pre-auth trial encounter — is a
real product direction with consent and memory consequences.

**R4 · Which of the four post-signup gates are constitutive of arrival?**
Between the button labelled "Enter MAIA" and MAIA there are four: `/onboarding` (incl. birth data),
`/choose`, then WeekZeroOnboarding's six steps inside `/maia`.
*Recommend: none of them are.* Under Inhabitable Architecture these are rooms, not the threshold —
birth data belongs at the moment Astrology's value becomes legible, and Week Zero belongs to the
relationship, not the door. Ruling needed because collapsing them changes what "onboarded" means
and touches surfaces beyond the front door.

**R3 · What is the minimum consent before the first exchange?**
*Recommend: a single sentence with a link — what is remembered, that Sanctuary exists, and how to
leave — shown before the first message, not a checkbox wall.* Currently it is zero. Ruling needed
because it is the disclosure floor for every future capability, and §7's growth-obligation test
binds here.

⛔ **Not asked, because it is below the boundary and already settled by canon:** whether to repair
the authentication bypass. Security gates fail closed; that is a defect fix, not a decision.
