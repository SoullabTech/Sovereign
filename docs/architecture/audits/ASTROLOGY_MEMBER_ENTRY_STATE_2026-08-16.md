# ASTROLOGY · MEMBER ENTRY — anatomical state

**Observed:** 2026-08-16. **Trigger observation:** *"soullab.life/astrology on the House is going to /journey instead of /astrology."*

Health: `DEGRADED` · Lifecycle: `LIVE` · Attention: `INVESTIGATE`

Production SHA witnessed: `39cc97d87`. Canonical trunk tip: `1c1e99578` (`origin/clean-main-no-secrets`).

> ⚠️ **CORRECTED 2026-08-16 (re-bind under repair directive §2).** Earlier revisions of this document
> named `f9a7326f1` as "canonical trunk tip" and reported production as **18 commits behind**, and one
> in-session turn additionally claimed production was **"NOT an ancestor of trunk"**. All three were
> artifacts of reading the **stale LOCAL** `clean-main-no-secrets` ref, which was **570 commits behind
> `origin/`**. Truth at re-bind: canonical is `origin/clean-main-no-secrets` = `1c1e99578`; production
> `39cc97d87` **IS** an ancestor of it, **20 commits behind**. The non-causality conclusion survives and
> is now better grounded (see §1). Preserved rather than silently rewritten, per §19.

> **Authority note.** This document RECORDS state. Nothing here authorizes repair.
> The two established defects in §3 are `DISCOVERED`, not `AUTHORIZED`.

---

## 1. Navigation layers — the original report

```text
HOUSE → ASTROLOGY
● WIRED
✓ VERIFIED IN CODE      lib/navigation/houseDestinations.ts:261 — route: '/astrology'
                        identical at 39cc97d87 (deployed) and on trunk
✓ WITNESSED LIVE        browser pane: /astrology holds, no redirect

/astrology
● ROUTE HOLDS
✓ WITNESSED LIVE        location.pathname === '/astrology'; no server redirect
                        (middleware.ts, next.config.js redirects(), layout, page effects all checked)

EMPTY-STATE CTA → /journey
● IMPLEMENTED           app/astrology/page.tsx:667 — href="/journey"
                        the ONLY /astrology → /journey edge in the codebase
? INTENT / DESIGN NOT ESTABLISHED
◉ AWAITING FOUNDER RULING

PRODUCTION ALIGNMENT
! DRIFT                 20 commits behind origin/clean-main-no-secrets (1c1e99578)
                        prod 39cc97d87 IS an ancestor of canonical — on the line, merely behind
                        ESTABLISHED / CAUSALITY EXCLUDED
                        of those 20 commits, ZERO touch app/astrology, app/api/members,
                        app/api/astrology, lib/http/apiBase.ts, lib/auth, components/auth,
                        app/api/oracle, or lib/sovereign — verified by path-scoped rev-list,
                        not inferred. Both SHAs carry byte-identical astrology routing.
```

**There is no Astrology redirect defect.** A ticket reading *"fix Astrology redirect"* would have
repaired a layer that is not broken.

---

## 2. Capability state — birth-data resolution

```text
ASTROLOGY → MEMBER BIRTH-DATA RESOLUTION

SERVER IDENTITY SOURCE
  ESTABLISHED
  maia_session cookie | x-session-token
  client ?id= has no identity authority

CLIENT ?id=
  INERT
  transmitted but ignored by route

PROFILE CONTRACT
  ESTABLISHED
  returns birthData { date, time, location }

CLIENT GATING
  DEFECT ESTABLISHED
  server-authoritative profile request executes only if
  local beta_user yields memberId

IDENTITY CONGRUENCE
  OBSERVABLE
  NOT YET ESTABLISHED FOR CURRENT MEMBER SESSION

DESKTOP/PWA ENCOUNTER
  UNWITNESSED

iOS AUTH TRANSPORT
  CONTRACT HAZARD / DEFECT
  astrology uses plain fetch rather than authenticated apiFetch path

CURRENT EMPTY-STATE CAUSE
  UNKNOWN
```

### Evidence

| Claim | Class | Source |
|---|---|---|
| Route derives identity only from session credential | code-read | `app/api/members/profile/route.ts` GET — `getMemberIdFromRequest`; comment: *"Server decides who you are — no bare client-provided identity"* |
| `?id=` is ignored | code-read | same handler — query selects `WHERE m.id = $1` bound to the session-derived id |
| Response shape matches consumer | code-read | route returns `birthData { date, time, location }`; `app/astrology/page.tsx:350` reads `profile.birthData?.date` |
| `x-member-id` does not authenticate this route | runtime | tested against prod container, both ids → 401 |
| Unauthenticated boundary holds | runtime | 401 without credential |
| Schema populated | runtime | 25 of 88 members carry `birth_date` |

---

## 3. Two separable established defects

Both are `DISCOVERED`. Neither is authorized for repair.

### 3.1 Authority-gating defect

```text
local identity exists?
        │
       yes
        ↓
ask server who the member actually is
```

A client-side identity value controls **whether** a server-authoritative identity lookup happens,
while having **no authority over the identity that lookup resolves**.

The page gates branch 1 on `if (memberId)`, sourced from `localStorage.beta_user.id`
([page.tsx:338-341](../../../app/astrology/page.tsx)). If `beta_user` is absent or unparseable, the
authoritative request is never made — even with a valid session. Execution falls to the localStorage
branches, which cannot succeed either, producing the empty state.

The local value may legitimately serve fallback behavior. It should not determine whether the
authoritative branch exists.

**Established independent of whether it caused the desktop encounter.**

### 3.2 Authentication-transport mismatch

`apiFetch` attaches `x-session-token` from localStorage (falling back to `x-member-id`) precisely
because Capacitor/iOS/Safari block cookie transport. The astrology page calls
`fetch(apiUrl(...))` — the *unauthenticated* path — so on iOS it sends neither cookie nor token.

```text
CONTRACT VIOLATION      established by code-read
ACTUAL iOS FAILURE      witness owed
```

---

## 4. Identity hazard — names are not identity

Three member rows are named "Kelly":

| id (short) | email | birth_date |
|---|---|---|
| `ce284751` | kelly@soullab.life | 1966-12-09 |
| `ed52e28f` | info@soullab.life | 1966-12-09 |
| `49ae4717` | soullab1@gmail.com | **NULL** |

The session email on this machine is `soullab1@gmail.com` — the row with no birth data. That is
**suggestive, not binding**. Neither a display name nor a localStorage id is authoritative.

⚠️ **Superseded claim (2026-08-16, same session).** An earlier draft of this document stated that
reading `JSON.parse(localStorage.beta_user).id` would "discriminate" absent-data from broken-resolution.
That was wrong: `localStorage.beta_user` is the *client fallback* identity channel; the profile route
authenticates on the *session credential* channel. The two can diverge. Correction recorded rather than
erased — it is the origin of the identity-congruence observable in §6.

---

## 5. Discriminator — two reads, run on desktop/PWA

```js
fetch('/api/members/profile')
  .then(async r => ({ status: r.status, body: await r.json().catch(() => null) }))
  .then(console.log)
```

```js
JSON.parse(localStorage.beta_user || 'null')
```

| Server profile | localStorage | Meaning |
|---|---|---|
| Kelly + birth data | same id | server path healthy → cause lies downstream of auth |
| Kelly, no birth data | same id | legitimate absent-data state |
| Kelly A | Kelly B | **identity divergence** — chart resolves to the cookie's member, not the client's belief |
| Kelly + birth data | **absent/malformed** | **counterfactual diagnostic** (see below) |
| 401 despite signed-in UI | anything | session-resolution defect (desktop) / cookie-block hazard (iOS) |

**Counterfactual-diagnostic nuance.** The fourth row is *not* an observed runtime combination — had
localStorage been absent, the page would never have issued that request. The manual console fetch
establishes: *"Had the page made its authoritative request, this is what the session would have
received."* That is precisely what proves §3.1, and it must not be reported as an observed page state.

**Platform caveat.** On desktop Chrome/PWA the manual fetch faithfully reproduces branch 1. On iOS
Safari a 401 is §3.2 reproducing — not a profile defect.

---

## 6. Held direction — IDENTITY CONGRUENCE

Cat 1 (preserved direction). Observable, not built. **Not authorized.**

At any client surface there are two statements:

```text
WHO THE CLIENT THINKS I AM
        versus
WHO THE SERVER AUTHENTICATES ME AS
```

JARVIS should be able to compare them and render:

```text
IDENTITY CONGRUENCE
  ✓ congruent
  ! divergent
  ? cannot establish
```

— without treating either localStorage or a display name as authoritative.

Potential reach: MAIA memory, Studio ownership, relational data, Soul Portrait, Astrology, and any
other member-scoped capability. The failure class it guards against: *everything technically worked,
but for the wrong identity.*

The three-Kelly condition does not prove a bug. It makes identity congruence a legitimate thing to
**observe rather than assume**.

---

## 7. Aperture status

```text
APERTURE 1 — birth-data resolution for the current member
PARTIALLY CLOSED · NOT YET CLOSABLE

THEREFORE NOT YET CLAIMABLE:
  "current account has no birth data"
  "profile fetch is failing"
  "birth-data resolver is healthy"
  "localStorage identity equals authenticated identity"

ESCAPED THE APERTURE AS ESTABLISHED CLAIMS:
  authority-gating defect          (§3.1)
  authentication-transport mismatch (§3.2)
```

Uncertainty narrowed without forcing the finding into either *bug* or *working*.

## 7bis. CANONICAL ERRATUM E1 — one stale test comment (founder-found, 2026-08-16)

Found by the founder while independently reading the **admitted bytes** at `6d3c0cbc4`.

`app/astrology/__tests__/birthDataResolution.test.ts:119` says:

```text
network / 503 → the server COULD NOT ANSWER → cached fallback still allowed
```

That is **false at canonical**, and contradicted three lines below it.

| | |
|---|---|
| test header line 119 | ⛔ **STALE** |
| test line 132 — *"Covers 401/403, 5xx, transport failure"* | ✅ correct |
| `page.tsx:480` — *"no session, a rejected identity claim, a 5xx, or a transport failure"* | ✅ correct |
| PR #1061 doctrine | ✅ correct |
| **security semantics** | ✅ **UNCHANGED** |

**Provenance.** The line was written during the 1B phase, when the rule genuinely was narrower
(401/403 terminal; 5xx still permitted fallback). The founder's provenance audit then broadened it to
1C — neither cache can establish its own owner, so unavailability became terminal too. The
implementation and the in-code guard comments were updated; this test-header block was not. **A comment
outlived the doctrine it described**, inside the artifact whose purpose was to prevent exactly that.

⛔ **Do NOT reopen the repair or alter behaviour.** Founder ruling: this warrants **at most** a later
tiny factual-comment cleanup — provenance hygiene, not security remediation. Suggested replacement:

```text
network / 503 → server COULD NOT ESTABLISH MEMBER FOR THIS LOAD
              → unbound cache remains forbidden; render UNREACHABLE
```

⚠️ **Method note this earns:** a source-contract test can be satisfied by assertions while its own
explanatory prose has gone stale. The assertions were right; the paragraph teaching the reader why was
wrong. Comments are not covered by the tests that sit beneath them.

---

## 7ter. Custody status of THIS document

⚠️ This audit file is **untracked** in the shared checkout. It is **outside durable custody** and does
**not** form part of PR #1061. Canonical custody of the repair does not depend on it.

⛔ Do **not** fold it retroactively into the closed security repair. If it is to survive, admit it later
as a **separate docs-only act**.

---

## 8. Manifestation grammar — RESTORED / REPAIRED / DEPLOYED / MASKED

Founder ruling, 2026-08-16. These are **orthogonal axes**, not competing lifecycle states.
`MASKED` describes *manifestation*, never repair state.

> **RESTORED does not imply REPAIRED.**
> **REPAIRED does not imply DEPLOYED.**
> **MASKED means an unrepaired defect is no longer manifesting under the current conditions.**

So a defect and a capability are recorded on separate axes and may legitimately read:

```text
DEFECT 1                      BEHAVIOR
  discovery      ESTABLISHED    RESTORED
  repair         NONE
  manifestation  MASKED
```

**Why this is kept beyond Astrology:** a large class of production failures disappear after
logout/login, cache clearing, restart, fallback routing, or environmental change while the underlying
defect remains alive. The next successful encounter is then read as evidence of repair, and the defect
is retired without ever being fixed. JARVIS must be able to say: **the symptom disappeared, the defect
did not.**

### 8.1 Causal roles for this finding

```text
STALE CLIENT IDENTITY      potential initiating condition   (conversation-carried, unverified here)
DEFECT 1                   amplifier / enabling defect      (code-read, verified)
SERVER PROFILE             authoritative resolver           (code-read, verified)
EMPTY STATE                possible manifestation
```

The local identity does not determine the server's answer, yet it determines **whether the server gets
asked**. The gate converts otherwise-harmless stale client state into a possible failure condition.

⛔ Because the stale-cache condition for the **original** `/astrology` encounter is unverified, this
chain stands as a **prediction**, never a reconstruction of what happened.

### 8.2 Predicted post-sign-in chain (derived; NOT witnessed)

```text
sign in as kelly@soullab.life
  → storeSession() overwrites beta_user.id  49ae4717 → ce284751   [code-read: UnifiedAuth.tsx:141]
  → Defect-1 gate `if (memberId)` passes
  → branch 1 fires: /api/members/profile    (?id= inert; session resolves ce284751)
  → ce284751 HAS birth_date 1966-12-09      → birthData returned
  → /api/astrology/birth-chart              → chart renders
```

No deploy, no code change. If this occurs the correct entry is **behavior restored through identity
rebinding; Defects 1 and 2 unrepaired; Defect 1 now MASKED.**

### 8.3 iOS prediction — stated conditionally

⚠️ **Superseded phrasing (same session).** An earlier draft asserted *"on iOS the page's plain fetch
sends no token, and cookies are blocked there."* The first clause is code-read. The second promoted a
platform assumption to observed fact. Corrected form:

> Established by code-read: plain `fetch` → **no `x-session-token` fallback**.
> Conditional: **if** the current iOS/Capacitor environment does not provide a usable session cookie
> for that request, the Astrology page has no token fallback.

(The repo records a related trap in `CLAUDE.md` — SameSite=Lax cookies not sent cross-origin from iOS
WebView — which is *supporting context*, not a witness of this request on the current build.)

### 8.4 Post-sign-in discrimination matrix

| Desktop/PWA | iOS | Interpretation |
|---|---|---|
| chart | empty | **consistent with** Defect 2 manifesting on iOS — not established until the failing iOS request itself shows the missing transport |
| chart | chart | Defect 1 likely MASKED; Defect 2 exists in code but its predicted consequence is not manifesting under this runtime |
| empty | empty | identity rebinding did not restore the path — investigate earlier in the chain |
| empty | chart | prediction materially contradicted — re-open assumptions |

### 8.5 Provenance ledger for this chain

```text
CANONICAL IDENTITY / STALE 49ae... CONDITION
  source: conversation-carried finding
  NOT independently re-established in this session
storeSession() overwrite behavior
  source: code-read — VERIFIED this session
Defect-1 gate
  source: code-read — VERIFIED this session
predicted post-sign-in chart restoration
  source: derived — NOT witnessed
actual Kelly chart render
  source required: encounter — WITNESS OWED
```

---

## 9. §9 ADJUDICATION — the field-disconnect hypothesis is FALSIFIED for observed traffic

**2026-08-16.** Established from an existing lawful source — the `[MAIA] userId resolved:` log at
`app/api/sovereign/app/maia/list/route.ts:315`. **No instrumentation was added**: observability is not
permission to manufacture a second truth system.

```text
MAIA IDENTITY CONGRUENCE — production, 7 days, 20 turns

fromSession present        20/20
bodyUserId matches-session 20/20     ← CONGRUENT
bodyUserId ignored          0/20
cannot-establish            0/20

effective member
  memberRef 4a190476bad9   16/20 turns
  = sha256('49ae4717-2b3a-4189-b25d-2bef95b1a45a').slice(0,12)  EXACT
  = Kelly Nezat · soullab1@gmail.com · birth_date NULL
  two other members          4/20

verdict  CONGRUENT for observed turns
```

The two Kelly rows that **do** carry `birth_date 1966-12-09` (`memberRef` `88099bb1977c` and
`0716d6270c1c`) do not appear in production at all across the window.

**MAIA is not disconnected from the field. She is correctly bound to the account that has no birth
data.** The remaining discontinuity is between Kelly's multiple member identities — not between MAIA
and the identity she is handed.

### 9.1 Corrections this forces

⚠️ **The "12-hex identifier" in the §6 report was a LOG RENDERING, not a runtime identity.**
`memberRef()` (`lib/privacy/memberRef.ts`) emits a truncated SHA-256 so raw member ids stay out of
container stdout. Those values never reach `isRecognizedUser`. Reading a privacy-masked log field as
the identity in play is why the report conflicted so sharply with the source trace. Reclassified:

```text
12-HEX LOG VALUE   memberRef privacy token
                   ⛔ NOT member identity
                   ⛔ NOT a value reaching isRecognizedUser
```

⚠️ **The conversation-carried finding was directionally right, mechanically wrong.** `49ae4717` IS the
identity in play — but not as stale client cache overriding a canonical session. The **server session
itself** resolves to it, congruently, on every observed turn. Nothing is being substituted.

### 9.2 The observed encounter needs no defect to explain it

```text
authenticated member  49ae4717…
birth_date            NULL
server profile        authoritative
Astrology result      no birth data
empty state           EXPECTED — correct behaviour throughout
```

### 9.3 Defect causality — restated

| | real | causal to the observed encounter | repaired in source | deployed | witnessed post-repair |
|---|---|---|---|---|---|
| 1A client gate on server authority | yes | **NO** | yes | no | no |
| 1B rejection fell through to cache | yes | **NO** | yes | no | no |
| 1C unbound-cache fallback | yes | **NO** | yes | no | no |

All three are **latent structural defects**, detached from the narrative that surfaced them. 1B in
particular was a live cross-identity presentation path — worth closing on its own merit, and now
recorded as such rather than as the cause of anything.

### 9.4 Aperture 1 — reshaped

```text
SERVER SESSION IDENTITY    ESTABLISHED
REQUEST CLAIM CONGRUENCE   ESTABLISHED for observed traffic
EFFECTIVE FIELD IDENTITY   ESTABLISHED
CLIENT CACHE CONTENT       UNKNOWN — and NON-BLOCKING
```

State may remain unknown while behaviour is sufficiently established. The localStorage read is no
longer needed to explain the empty state; it would only complete the client-channel picture.

### 9.5 Next architectural question — NOT this unit

*Which Kelly identity should be the continuing canonical identity, and why is the currently
authenticated account the one holding almost none of the continuity?*

⛔ Separate programme. §14 stands: no merge, no delete, no copying of birth data, no atom movement, no
consent rewriting. Consolidation is a provenance-sensitive migration requiring its own founder ruling.

---

## 10. Generated work

| Item | State |
|---|---|
| Two console reads on desktop/PWA (§5) | `VERIFY_REQUIRED` |
| House → Astrology → existing chart, encountered as a member | `WITNESS_OWED` |
| iOS lived consequence of §3.2 | `WITNESS_OWED` |
| Repair of §3.1 / §3.2 | `DISCOVERED` — not authorized |
| Where *Enter Birth Details* should lead when no data exists | `AWAITING_AUTHORITY` (founder) |
| Production 18 commits behind | separate lane — Platform/Deployment → `DRIFT`, non-causal |
