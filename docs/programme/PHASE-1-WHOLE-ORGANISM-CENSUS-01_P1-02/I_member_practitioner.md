# P1-02 · DOMAIN I — MEMBER / PRACTITIONER ORGANISM

```text
LANE      PHASE-1-WHOLE-ORGANISM-CENSUS-01
STEP      P1-02 · PARALLEL ORGANISM CENSUS
DOMAIN    I · member · MAIA · practitioner · practitioner-facing surfaces ·
          member-private material · explicit sharing gestures · derived visibility
SUBJECT   1a5554300e855d3581085849301a39cbb10ab385
TYPE      RECORD ONLY — evidence, never rulings
AUTHORITY READ / TRACE / CLASSIFY
BOUND BY  D-P1-08 · P1-GOV-ACCESS-01 · constraints 1–8 · LIVE calibration
```

> **P1-02 asks what the organism does. It does not infer from doing that the organism
> is authorized to do it.**

**SUBJECT VERIFICATION.** `git diff --stat 1a555430 HEAD` at capture time returns 14 files,
all under `docs/programme/**` (P1-00 custody, C-2 ruling, FLOW, the eight P1-01 slices, the
P1-02 instrument). **No file under `app/**`, `lib/**`, `config/**`, `database/**` or
`middleware.ts` differs between the census subject and the working tree.** Every `file:line`
below is therefore a claim about the subject.

**CONTENT DISCIPLINE.** Paths, field names, column names, route shapes and authorization
predicates only. No member content, no prose excerpt from any member-authored object, no
credential, no token value, no identifier of any real person.

---

## 0 · What this domain found, in one paragraph

The corpus contains **two member/practitioner access models written in code** —
`lib/relationship/scope.ts` and `lib/coachField/` (projection + bring-forward) — and
**neither is reachable from any route or page**; both are imported only by their own tests
and by `scripts/verify-*`. The practitioner visibility that is actually **wired** runs
through a different, thinner set of paths that do not import either model. Of those wired
paths, exactly **one** consults a member consent column (`can_be_shown_to_practitioner`,
`DEFAULT false`), and that same page performs **no check that the viewing practitioner has
any relationship to the member whose id is in the URL**. Several practitioner-facing API
families take the actor's identity from a **client-supplied query parameter or request
body** rather than from the session. **Per constraint 6, none of this is governed:**
P1-01 located no ruled access model for practitioner visibility of member material, and
nothing in the code supplies one. Every capability below therefore carries
`GOVERNANCE GATE: NONE FOUND`.

---

## 1 · The authorization primitives, as they actually exist

### 1.1 · `deriveVerifiedAccess` — the one verified identity derivation

- `lib/auth/verifiedAccess.ts:112-158` — reads the session credential, joins
  `auth_sessions → members`, returns `{authenticated, memberId, tier, roles}`.
- Roles come from the `members.roles` column (`:119-121`). Tier from `members.tier`.
- An `x-member-id` / `x-maia-member-id` / `maia_member_id` claim that disagrees with the
  session is **refused** (`:145-151`). Fails closed on DB error (`:128-132`).
- Called from `middleware.ts:259` and fed to `checkAccess` at `middleware.ts:272`.

⭐ This primitive is sound. **The findings below are all about paths that do not use it.**

### 1.2 · `config/accessMatrix.ts` — declared policy, and its unmapped default

- `Role = 'admin' | 'steward' | 'curator' | 'practitioner' | 'partner' | 'member'`
  (`config/accessMatrix.ts:11`).
- `checkAccess()` tests **public → authenticated → tier → roles** in that order
  (`config/accessMatrix.ts`, tail of the function).
- **Unmapped routes default to ALLOW.** `getAccessMode()` returns `'permissive'` unless
  `ACCESS_CONTROL_MODE === 'strict'` (`config/accessMatrix.ts:727-729`); in permissive mode
  an unmatched path returns `{ allowed: true, reason: 'no-rule-match', unmapped: true }`.
  ⚠️ The env value in the production environment is **UNKNOWN** — no runtime access.
- Header contract: middleware writes `x-access-tier` / `x-access-roles` / `x-access-authed`
  onto the **forwarded request** (`middleware.ts:62-87`).
- **Dev bypass** at `middleware.ts:173-184`: when `NODE_ENV === 'development'`, requests to
  `/api/stellium/*` and `/api/notifications/*` are forwarded with
  `x-access-roles: 'practitioner'`, `x-access-tier: 'pro'`, `x-access-authed: 'true'` and no
  session at all. Guarded on `NODE_ENV`; recorded, not scored as a production path.

Relevant declared rules, verbatim from the matrix:

| Line | Rule | Note |
|---|---|---|
| `:485` | `{ prefix: '/studio', minTier: 'free' }` | *"Studio - open to all authenticated users"* — **no role** |
| `:470` | `{ prefix: '/caseload', minTier: 'pro', rolesAnyOf: ['practitioner'] }` | ⚠️ prefix is `/caseload`, **not** `/api/caseload` |
| `:578` | `{ prefix: '/api/supervision', minTier: 'free' }` | **no role**, no tier above free |
| `:534` | `{ exact: '/api/practitioners/create', minTier: 'pro' }` | **no role** |
| `:474-476` | `/practitioner/dashboard`, `/practitioner/`, `/practitioners/` | notes say *"page handles auth"* / *"API enforces access"* |
| `:404` | `/labtools` | DECLARED free, ENFORCED founder-only — self-declared **unreconciled** |
| `:288`, `:299`, `:531` | Circles | DECLARED free, ENFORCED founder-only via `requireCircleAccess()` |

⭐ The matrix **itself records** that DECLARED and ENFORCED diverge in at least three places
(`:288`, `:299`, `:392-404`, `:531`). That is the file's own language, not this census's.

### 1.3 · Role gates that exist

| Gate | Location | Authority source |
|---|---|---|
| `requireFounder()` | `lib/founder/founderAuth.ts:49-60` | `FOUNDER_MEMBER_IDS` env allowlist, checked against `session.memberId` |
| `requireLabAccess()` | `lib/access/labAccess.ts` | union of `FOUNDER_MEMBER_IDS` and `LAB_ACCESS_MEMBER_IDS`; fails closed |
| `requireCircleAccess()` | `lib/circles/circleAccess.ts:63` | founder allowlist ∪ `CIRCLE_ACCESS_MEMBER_IDS`; the file states the cohort var is **not yet constituted** (`:23-36`) |
| `getCurrentPractitioner()` / `requirePractitioner()` | `lib/auth/getCurrentPractitioner.ts:27-66`, `:74-98` | session member id → `SELECT … FROM practitioners WHERE member_id = $1 AND status = 'active'` |
| `getAuthoredField()` | `lib/practiceField/programAuthoringService.ts`, via `app/api/practitioner/programs/route.ts:33-45` | "field holder" = member who authored a practice field |

⛔ There is **no** `requireSupervisor()`, no `requireFacilitator()`, and no gate anywhere
that asks *"is this practitioner in relationship with this member?"* at a page or route
boundary. The only function in the tree that asks that question is
`authorizePractitionerClientRelationship()` in `lib/coachField/identity.ts` — and §3.1 shows
it has no route callers.

---

## 2 · CAPABILITY RECORDS

### CAP-I-01 · Practitioner reads a member's Living Field threads

```text
CAPABILITY        A practitioner opens /studio/fields/<memberId> and reads the titles,
                  authorship class, phase and dates of that member's field-note threads,
                  plus the member's real name and username.
DECLARED WHERE    config/accessMatrix.ts:485 ({ prefix: '/studio', minTier: 'free' })
COMPUTED WHERE    n/a — direct read
PERSISTED WHERE   member_field_note_threads
                  (database/migrations/20260626000001_member_field_note_threads.sql:40)
LOADED WHERE      app/studio/fields/[memberId]/page.tsx:63-77 (getFieldEvidence)
                  app/studio/fields/[memberId]/page.tsx:79-85 (getMember)
SURFACED WHERE    app/studio/fields/[memberId]/page.tsx:134-205
UPDATED WHERE     member sets the flag TRUE at save time
                  (app/api/maia/vision-studio/field-note/route.ts:107-130)
                  member withdraws it (app/api/now-what/field-note/[id]/route.ts:132-139)
```

**CANONICAL CALL PATH** — `GET /studio/fields/<memberId>` → middleware `checkAccess`
(`/studio` prefix, tier `free`, **no role**) → `getCurrentSession()` (`:94`) → inline
`SELECT id FROM practitioners WHERE member_id = $1 AND status = 'active'` (`:104-107`), zero
rows ⇒ `redirect('/studio')` (`:109`) → `SELECT … FROM member_field_note_threads WHERE
member_id = $1 AND released_at IS NULL AND can_be_shown_to_practitioner = TRUE` (`:65-73`)
→ render (`:134-205`).

**MEMBER AUTHORITY** — the per-thread boolean `can_be_shown_to_practitioner`.
**DEFAULT `false`** (`20260626000001_member_field_note_threads.sql:40`; baseline
`0001_baseline_2026-09-01.sql:12389` `DEFAULT false NOT NULL`). ⚠️ That migration's own
comment calls the capability **DEFERRED** and the flag *"held FALSE, no path"* (`:8,40,96`)
— but **Vision Studio supplies a path**: `app/api/maia/vision-studio/field-note/route.ts:107-130`
binds the column to a per-thread `shareWithPractitioner` boolean from the request body
(`:36`), intent stated at `:11-15`. Withdrawal exists: `PATCH app/api/now-what/field-note/[id]/route.ts:132-139`,
ownership enforced inside the mutation by the `member_id` predicate (`:107-113`), idempotent
(`:122-129`), ledgered by `20260730000002_practitioner_visibility_withdrawn_event.sql`.

**PRACTITIONER AUTHORITY** — read-only; may not write, withdraw, or reach a FALSE-flag
thread. **⛔ But practitioner identity is the ONLY thing checked.**

⭐⭐ **THE STRUCTURAL FINDING.** The gate at `:104-107` asks *"is the viewer an active
practitioner?"*, never *"is this practitioner this member's practitioner?"* No
`practitioner_clients`, `relationship_spaces` or `coach_client_*` predicate appears on the
page; `memberId` is a free URL segment. **Any member holding an `active` row in
`practitioners` can read the shared field of any member whose id they supply.** The consent
column limits *which threads*, never *which practitioner*.

**MAIA AUTHORITY** — none here. **SYSTEM AUTHORITY** — `released_at IS NULL` (`:68`) silently
excludes released threads.

**GOVERNANCE GATE — ⛔ NONE FOUND.** The page header (`:9-11`) asserts *"This is the consented
facilitator view."* That is a source comment, not a ruled source. P1-01 §2 established that
**no ruled access model for practitioner visibility of member material exists**; the one
artifact shaped like one disclaims itself
(`docs/product/NOW_WHAT_NAVIGATION_AND_ARRIVAL_ARCHITECTURE_2026-08-03.md:141-142`) and defers
to an unlocated *"consent architecture"*. Per constraint 6 the flag's existence does not make
the visibility governed, and *"consented"* is an assertion the corpus does not back.

**FAILURE MODE** — unauthenticated → sign-in message (`:95-101`); non-practitioner →
redirect (`:109`); unknown memberId → 404 (`:117`). ⚠️ A **known** memberId with zero shared
threads renders the member's **name** and *"has not yet carried anything"* (`:142,165-168`)
— see CAP-I-07.

**CURRENT STATUS — `WIRED-BUT-UNOBSERVED`.** Complete path traced from a real entry point.
No dated runtime or production witness exists in-repo: the predecessor census records
*"WALKED: none in this census"* for this surface
(`docs/programme/MAIA_WHOLE_ORGANISM_MAP/07_now_what.md:128` — **C-2 · FROZEN INCOMPLETE ·
EVIDENCE INPUT ONLY**).

**SOURCE EVIDENCE** — `app/studio/fields/[memberId]/page.tsx:1-205`;
`config/accessMatrix.ts:485`; `database/migrations/20260626000001_member_field_note_threads.sql:8,40,96`;
`app/api/maia/vision-studio/field-note/route.ts:11-15,36,107-130`;
`app/api/now-what/field-note/[id]/route.ts:107-139`.

---

### CAP-I-02 · Any caller lists supervision sessions and reads clinical transcripts

```text
CAPABILITY        List clinical supervision sessions for an arbitrary practitionerId and
                  read the transcript segments of an arbitrary sessionId.
DECLARED WHERE    config/accessMatrix.ts:578 ({ prefix: '/api/supervision', minTier: 'free' })
PERSISTED WHERE   supervision session + transcript tables via lib/supervision/SupervisionStore.ts
LOADED WHERE      app/api/supervision/sessions/route.ts:15-45
                  app/api/supervision/transcript/list/route.ts:34-45
SURFACED WHERE    app/supervision/** ; lib/supervision/ClinicalSupervisionEngine.ts
```

**CANONICAL CALL PATH** — `GET /api/supervision/sessions?practitionerId=…&caseId=…` →
middleware `checkAccess` (matched rule: tier `free`, **no `rolesAnyOf`**) → handler →
`practitionerId` and `caseId` read straight from `searchParams` (`:22-23`) →
`listSessions({practitionerId, caseId, limit, offset})` (`:26-31`) → response.

`GET /api/supervision/transcript/list?sessionId=…` → same middleware rule → handler →
`sessionId` from `searchParams` (`:40`) → `getTranscript` / `getTranscriptSegments`.

**⛔ NO HANDLER-LEVEL AUTHORIZATION.** Neither file imports `requireFounder`,
`requirePractitioner`, `getCurrentPractitioner`, `requireMemberId`, `getCurrentSession` or
`getMemberIdFromRequest`. Grepped: zero matches in either route.

**MEMBER AUTHORITY** — ⛔ **NONE FOUND.** No consent column, flag or gesture is consulted.
The subject of a supervision transcript is a client whose speech is captured; nothing on the
path asks them anything.

**PRACTITIONER AUTHORITY** — asserted by query parameter, verified by nothing.

**SYSTEM AUTHORITY** — total. ⚠️ Both route headers assert *"HIPAA compliant"*
(`sessions/route.ts:5`; `transcript/list/route.ts:7`). Recorded verbatim as a **source-comment
claim about storage location**; it says nothing about the authorization this census finds
absent, and ⛔ this census does not adjudicate it.

**GOVERNANCE GATE — ⛔ NONE FOUND.** P1-01 recorded *"Governance of the supervision stream —
who may open it, on what consent, with what client knowledge"* as **UNLOCATED**. The code is
consistent: nothing enforces it because there is nothing to enforce.

**FAILURE MODE** — missing params yield 400/empty; nothing can fail closed on identity,
because identity is never established.

**CURRENT STATUS — `WIRED-BUT-UNOBSERVED`.** Path complete from a real entry point; no
in-repo runtime witness.

**SOURCE EVIDENCE** — `app/api/supervision/sessions/route.ts:1-45`;
`app/api/supervision/transcript/list/route.ts:1-45`; `config/accessMatrix.ts:578`;
route inventory: `app/api/supervision/{insights/list,insights/stream,scribe,session/[id],
session/[id]/essence,session/start,session/stop,sessions,transcript/list,transcript/stream,
upload}/route.ts` (11 routes).

⚠️ **SCOPE HONESTY.** Four supervision routes were read in full for auth imports
(`sessions`, `transcript/list`, `insights/list`, `session/start`) and none carries one. The
remaining seven were **not** individually read; their status is **UNKNOWN**, not "the same".

---

### CAP-I-03 · Caseload — practitioner identity asserted by query parameter

```text
CAPABILITY        List a practitioner's cases, case memories, case notes, captures,
                  patterns and consultations.
DECLARED WHERE    config/accessMatrix.ts:470 — { prefix: '/caseload', … }
                  ⚠️ that prefix does NOT match '/api/caseload/...'
PERSISTED WHERE   lib/caseload/CaseStore.ts, CaseMemoryService.ts, CasePatternService.ts
LOADED WHERE      app/api/caseload/list/route.ts:29-70 (+ 8 sibling routes)
SURFACED WHERE    app/caseload/**, app/studio/caseload/**, app/model-studio/caseload/**
```

**CANONICAL CALL PATH** — `GET /api/caseload/list?memberId=…` → middleware: **no matrix rule
matches `/api/caseload/*`**, so in the default permissive mode the request passes as
`unmapped` → handler → `memberId` read from `searchParams` (`:36`) → `CaseStore.isPractitioner(memberId)`
(`:45`) → 403 if false (`:46-51`) → `CaseStore.listCases(memberId, filters)` and
`CaseStore.getCaseCounts(memberId)` (`:61-64`).

⭐⭐ **The check is `is the member named in the URL a practitioner`, not `is the caller that
member`.** The handler's own doc comment names the parameter
*"memberId (required): Practitioner's member ID"* (`:22`). Same shape in
`app/api/caseload/[caseId]/memories/list/route.ts:36` and
`app/api/caseload/[caseId]/notes/route.ts:47`.

**MEMBER AUTHORITY** — ⛔ **NONE FOUND.** Caseload content is practitioner-authored *about*
a client; the client is represented by `ClientNameEncryption` (`lib/caseload/ClientNameEncryption.ts`)
rather than by a `members` row. No consent column, no client gesture, no client-facing view.

**PRACTITIONER AUTHORITY** — self-asserted.

**GOVERNANCE GATE — ⛔ NONE FOUND.**

**FAILURE MODE** — 400 on missing `memberId`, 403 when the named member is not a
practitioner. ⛔ There is no failure mode for *"caller is not the member named"*, because
that question is never asked.

**CURRENT STATUS — `WIRED-BUT-UNOBSERVED`.**

**SOURCE EVIDENCE** — `app/api/caseload/list/route.ts:20-70`;
`app/api/caseload/[caseId]/memories/list/route.ts:36`;
`app/api/caseload/[caseId]/notes/route.ts:47`; `config/accessMatrix.ts:470`;
`config/accessMatrix.ts:727-729` (permissive default).

---

### CAP-I-04 · Becoming a practitioner — unauthenticated, self-asserted memberId

```text
CAPABILITY        Create a practitioners row for an arbitrary memberId and set
                  members.is_practitioner = true for that member.
DECLARED WHERE    config/accessMatrix.ts:534 ({ exact: '/api/practitioners/create', minTier: 'pro' })
PERSISTED WHERE   practitioners ; members.is_practitioner ; practitioner_themes
LOADED/WRITTEN    app/api/practitioners/create/route.ts:43-165
```

**CANONICAL CALL PATH** — `POST /api/practitioners/create` with body
`{ memberId, practiceName, slug, email, portalType?, enabledModules?, consultantProfile? }`
(`:13-27`) → middleware (`minTier: 'pro'`, **no role**) → handler → field presence validation
(`:56-60`) → `INSERT INTO practitioners (…)` (`:144`) →
`UPDATE members SET is_practitioner = true … WHERE id = $1` (`:161`).

⭐⭐ **The handler performs no authentication and no authorization.** Grepped for
`session`, `auth`, `requireMember`, `cookies`, `headers.get` across all 240 lines: the only
hits are the words *"auth whoami"* in a comment (`:158`) and an unrelated `sessionNotes` key
(`:199`). The `memberId` written is the one supplied in the body.

**Why it matters here:** the row created is exactly the row read by `getCurrentPractitioner()`
(`lib/auth/getCurrentPractitioner.ts:36-48`) and by CAP-I-01's inline gate
(`app/studio/fields/[memberId]/page.tsx:104-107`). The route says so itself at `:156-157`:
*"The Studio gate (getCurrentPractitioner) reads the practitioners table."* **This capability
is upstream of CAP-I-01's only check.**

**MEMBER AUTHORITY** — ⛔ **NONE FOUND.** The member whose `is_practitioner` flips is not
consulted, and need not be the caller.

**GOVERNANCE GATE — ⛔ NONE FOUND.**
**FAILURE MODE** — 400 on missing fields, slug-collision handling; ⛔ no identity failure
mode exists.

**CURRENT STATUS — `WIRED-BUT-UNOBSERVED`.**

**SOURCE EVIDENCE** — `app/api/practitioners/create/route.ts:13-27,43-60,144-165`;
`lib/auth/getCurrentPractitioner.ts:36-48`; `config/accessMatrix.ts:534`.

⚠️ **NOT TRACED:** `app/api/practitioners/verify-passcode/route.ts` accepts passcodes with
prefixes `PORTAL-`, `SOULLAB-`, `PRO-` (`:16`, `:35`). Whether any client flow requires it
before calling `create` is **UNKNOWN** — the `create` route does not.

---

### CAP-I-05 · Practitioner ⇄ client messaging, digest and prep

```text
CAPABILITY        A practitioner reads the message thread a client sent them, a
                  since-last-session digest, session prep, and emergency contact info.
LOADED WHERE      app/api/practitioner/clients/[clientId]/{messages,digest,prep,emergency,
                  policy,spiralogic-report}/route.ts
                  lib/practitioner/messages.ts ; lib/practitioner/sessionPrep.ts
PERSISTED WHERE   practitioner_clients ; practitioner_sessions ; message tables ;
                  spiralogic_reports
```

**AUTHORIZATION** — `requireMemberId()` from `lib/auth/session`
(`digest/route.ts:15,30` · `messages/route.ts:15` · `spiralogic-report/route.ts:16,28`).
The returned value is **assigned to a variable named `practitionerId`** and passed straight
into `getMessageDigest(practitionerId, clientId)` and into
`SELECT … FROM spiralogic_reports` (`spiralogic-report/route.ts:31-35`).

⚠️ **VOCABULARY COLLISION, DOCUMENTED IN THE SCHEMA ITSELF.**
`database/migrations/20260802000002_practitioner_client_relationship.sql:45-52` records:

```text
practitioner_id -> practitioners(id)      in practitioner_clients, practitioner_client_notes
practitioner_id -> members(id)            in client_invites, practitioner_sessions
"Same column name, different referent. Service code must therefore resolve
 practitioner identity THROUGH the relationship row and never by trusting a
 column called practitioner_id."
```

The same migration records that `practitioner_clients` has **three competing
`CREATE TABLE IF NOT EXISTS` definitions** and that *"the declared shape in this repository
is therefore NOT authoritative — not even for the target of the practitioner_id foreign
key"* (`:26-39`). Per the vocabulary rule, **`practitioner_id` is an overloaded token and no
finding here attaches to it as such.** Whether `requireMemberId()`'s member id is the
correct referent at each of these call sites **could not be settled from the tree** and is
recorded as **UNKNOWN**, not as a defect.

**MEMBER AUTHORITY** — ⛔ **NONE FOUND** on the read side. The messages are ones the client
sent to the practitioner, so the sending act is itself the gesture; but no column records a
consent state, and no withdrawal path exists. The link to a member is
`practitioner_clients.member_id`, which is **write-once** — a trigger refuses re-pointing
and refuses unlinking (`20260802000002_…:333-347`), with `ON DELETE SET NULL` to `members(id)`
(`:150-154`) and `CHECK ((member_id IS NULL) = (linked_at IS NULL))` (`:265`).

**GOVERNANCE GATE — ⛔ NONE FOUND.**

**CURRENT STATUS — `WIRED-BUT-UNOBSERVED`.**

---

### CAP-I-06 · Studio CRM surface (≈76 routes)

```text
CAPABILITY        The practitioner Studio: clients, notes, encounters, moments,
                  transcripts, field, protocols, observations, inquiry responses.
AUTHORIZATION     getCurrentPractitioner(request) at the top of each handler
                  (76 files matched; lib/auth/getCurrentPractitioner.ts:27-66)
SCOPING           identity.practitionerId, server-derived, used in the WHERE clause
                  (e.g. app/api/studio/clients/route.ts:27-32)
```

⭐ This family is the **best-behaved** practitioner surface in the tree: identity is derived
server-side from the session and never accepted from the caller, matching the discipline
`lib/coachField/practitionerProjection.ts:26-31` describes but cannot enforce from where it
sits.

**WHAT DATA** — practitioner-authored records *about* clients: `practitioner_clients`
(`name`, `email`, `phone`, `birth_*`, `internal_notes`, `tier`, `tags`, `key_placements`,
`total_revenue`, `leadership_profile`, `client_types`, `intake_responses`, encrypted name
columns — baseline `practitioner_clients` DDL), `studio_practitioner_observations`,
`studio_inquiry_responses`, `pattern_ledger`, encounters/moments/transcripts.

⭐⭐ **A GREP THAT MATTERED.** Across `app/api/{studio,practitioner,practitioners,caseload,
supervision,stellium}` and `app/{studio,practitioner,supervision,caseload}` — the **only**
file selecting from a member-owned table (`member_field_note_threads`, `memory_atoms`,
`maia_turns`, `member_daily_anchors`, `semantic_memories`, `developmental_memories`,
`ask_turns`, `conversations`, `journal_entries`, `member_spiral_state`, `manuscript_*`,
`working_draft*`) is **`app/studio/fields/[memberId]/page.tsx`** — i.e. CAP-I-01.
**The Studio does not read the member's MAIA life;** it reads the practitioner's own record
of a professional relationship. That boundary is **structural** (no join exists), not
permissioned.

**MEMBER AUTHORITY** — ⛔ **NONE FOUND.** `intake_responses` and `studio_inquiry_responses`
hold client-supplied answers; no consent column, no client view, no withdrawal.

**GOVERNANCE GATE — ⛔ NONE FOUND.**  **CURRENT STATUS — `WIRED-BUT-UNOBSERVED`.**

---

### CAP-I-07 · DERIVED / INFERRED VISIBILITY

⛔ **Recorded only. No repair proposed, no mechanism designed, no programme opened (F9,
D-P1-08).**

**D-1 · Member existence and real name, no consent predicate, no relationship.**
`app/studio/fields/[memberId]/page.tsx:79-85` runs `SELECT id, name, username FROM members
WHERE id = $1` — no consent column, no relationship join. Name renders at `:142,159,166,199`.
A practitioner supplying an id learns that it resolves to a real member, and that member's name.

**D-2 · An existence oracle over the *absence* of shared material.** Three outcomes are
distinguishable: unknown id → `notFound()` (`:117`); known id + zero shared threads → the
member's name plus *"has not yet carried anything from a Vision Studio session"* (`:165-168`);
known id + ≥1 thread → the threads. So *"exists and has shared nothing"* is readable, and is
distinct from *"no such member"*.

**D-3 · Counts, phase counts, ordering.** `totalThreads` (`:132,148`), `orderedPhases.length`
as *"N phases active"* (`:149`), a per-phase count badge (`:177`), ordering `created_at ASC`
within phase (`:70-72`). The counted set is consent-filtered — ⚠️ but they are counts over a
filtered set whose complement the practitioner cannot see, and they move on withdrawal (D-4).

**D-4 · Withdrawal is silent, hence inferable by difference.** The PATCH flips the flag
(`app/api/now-what/field-note/[id]/route.ts:132-139`); **no practitioner notification writer
was found**. The thread simply leaves the result set; a practitioner who saw the page before
and after observes a count decrease and a missing title. The act is recorded in
`member_field_note_events` (`20260730000002…`) — a **member-side** ledger; no practitioner
read of it was found.

**D-5 · Authorship class disclosed per thread.** `t.authorship` renders `member-authored` vs
`member-confirmed` (`:183`) — i.e. whether the member wrote it or MAIA proposed and the
member kept it. Dates at `:184`.

**D-6 · A truncated member identifier is echoed to the practitioner.** `:157-160` renders
`/maia/vision-studio?fieldContext=` plus the first 8 characters of the member's uuid.

**D-7 · Relationship-space state flows member-ward only.**
`app/api/sovereign/app/maia/list/route.ts:800-820` injects practice-field context into
**MAIA's** prompt for the member, gated on `status='active' AND consent_status='accepted'`
(`:806`) and `!isSanctuary` (`:801`); `app/api/member/portal/route.ts:19-42` shows the member
their own spaces. ⭐ **No reverse path was found** — no traced practitioner route reports
member acceptance, activity or latency back. Recorded as an absence found by search, ⛔ not a
proof of absence.

**D-8 · Program positions are structurally unreadable by the practitioner.**
`app/api/practitioner/programs/route.ts:11-15`: *"This surface writes the CURRICULUM only.
Member positions are a different jurisdiction entirely: no route here reads, counts, or
aggregates them, and none may be added (catalog spec §8 — the absence is the feature)."*
Verified: it imports only `getAuthoredField`, `listPrograms`, `createProgram` (`:19-24`) and
never touches `programPositionService`. ⭐ The one **enforced-by-construction**
non-visibility in the domain. ⛔ Still **GOVERNANCE GATE: NONE FOUND** — *"catalog spec §8"*
is a spec reference and P1-01 located no ruling binding it.

**GOVERNANCE GATE for all of D-1…D-8 — ⛔ NONE FOUND.**
P1-01 slice 08 §3 recorded: *"No document read in this slice addresses whether a practitioner
could infer the existence of member-private material through metadata, counts, ordering,
timestamps, notifications, suggested actions, or latency."* The four nearest texts were
examined there and each falls short. That absence is unchanged by anything found here —
per constraint 6, discovering the mechanisms does not govern them.

**CURRENT STATUS — `WIRED-BUT-UNOBSERVED`** for D-1…D-6; **`OBSERVATION-ONLY`** is not used,
because these are live render paths, not instrumentation.

---

### CAP-I-08 · `lib/relationship/scope.ts` — the explicit access model that nothing calls

```text
CAPABILITY        A typed member/practitioner read-scope and verb model:
                  ReadScope, Role, resolveReadScope, canRead, requiresCommitmentContext,
                  isOfferable, developIntoWisdom, removeIdentifiers,
                  wisdomMayCiteMemberMaterial (returns never), maySystemDraw,
                  admitsToCommitment, practitionerMay, offersDoNothing,
                  ScopeViolation, Unruled
DECLARED WHERE    lib/relationship/scope.ts:50-420
CONSUMERS         lib/relationship/__tests__/scope.test.ts — and nothing else
```

Grepped each exported symbol (`resolveReadScope`, `practitionerMay`, `admitsToCommitment`,
`maySystemDraw`, `ScopeViolation`) across `lib/`, `app/`, `scripts/`, `tests/`, `__tests__`:
**every hit outside the module itself is in its own test file.**

What it encodes (`:336-344`, `:345-362`, `:369-412`): the practitioner may never declare the
member's material into a shared commitment; a Keep never crosses on its own — *"the crossing
IS the consent event"*; a practitioner may `reflect`, `offer_question`, `offer_observation`,
`offer_encouragement` over `my_question | my_work | my_story | my_coaching`, and never edit.
`:350` names `can_be_shown_to_practitioner` as *"the existing flag that holds this line"* —
so the module knows about CAP-I-01's column, and CAP-I-01 does not know about the module.

**MEMBER / PRACTITIONER / MAIA / SYSTEM AUTHORITY** — all **notional**; the module governs
no live read.

**GOVERNANCE GATE — ⛔ NONE FOUND.** It is a source file, not a ruled source, and it is not
cited as authoritative by any located ruling.

**CURRENT STATUS — `ORPHANED`.** The code exists; its declared consumer (any route or page
that reads member material for a practitioner) does not import it. ⛔ Not `DORMANT`: CAP-I-01
performs the very act this module models, and does so without it.

---

### CAP-I-09 · `lib/coachField/` — the second access model that nothing calls

```text
MODULES           lib/coachField/{identity,practitionerProjection,bringForward,invitation}.ts
CONSUMERS         scripts/verify-practitioner-projection.ts ; scripts/verify-bring-forward.ts
                  — and nothing else
```

- `getPractitionerClientProjection()` (`practitionerProjection.ts:109`) and
  `listPractitionerRelationships()` (`:201`): imported only by
  `scripts/verify-bring-forward.ts:26` and `scripts/verify-practitioner-projection.ts:23-24`.
- `bringForward()`, `receiveOfferings()`, `listMyOfferings()`, `updateOffering()`,
  `withdrawOffering()` (`bringForward.ts:98,151,167,180,209`): **zero importers** in `app/`
  or `lib/`. (`updateOffering` also exists in `lib/offerings/offeringService.ts:79` — a
  **different** function, and the only one with a route. Vocabulary collision; recorded.)

⭐⭐ **`bringForward` is, by its own header, *"the only place a member decides"* that anything
crosses to a practitioner** (`bringForward.ts:5-8`). It writes `coach_client_shared_items` as
a member-authored snapshot with opaque lineage — not a permission on the source, not a live
pointer (`:14-24`). **No member-facing route reaches it.** The member gesture the coach-field
model is built around has no surface.

- `practitionerProjection.ts:57-73`: the client-sovereign field is protected by the
  **absence of a join**, with the forbidden-table roster held in
  `scripts/verify-practitioner-projection.ts` so the module never names them. ⭐ A genuine
  discipline. ⚠️ It protects a projection **no route calls**.

**GOVERNANCE GATE — ⛔ NONE FOUND.**

**CURRENT STATUS — `DORMANT`** (verification-script-reachable only). The `practitioner_clients`
relationship substrate it reads **is** live (CAP-I-05/06); the projection over it is not.

---

### CAP-I-10 · Practitioner observation atoms inside member memory

```text
CAPABILITY        A facilitator-authored observation stored in the MEMBER's own memory
                  store and surfaced into MAIA's prompt as a separate authorship section.
DECLARED WHERE    database/migrations/20260624000001_practitioner_observation_provenance.sql
PERSISTED WHERE   member_memory_atoms.source_type = 'practitioner_observation',
                  member_memory_atoms.facilitator_id (FK → members(id) ON DELETE SET NULL, :13-14),
                  member_memory_atoms.epistemological_status
                  ∈ observed | reported | inferred | provisional | claimed (:17-26)
LOADED WHERE      lib/maia/memoryAtomsLoader.ts:171,186,202,296-311
SURFACED WHERE    lib/maia/memoryAtomsLoader.ts:442-447 — projectAtomSections() splits into
                  '# MEMBER-PLACED PORTFOLIO' and '# PRACTITIONER OBSERVATIONS'
GUARDED BY        PRACTITIONER_ATTRIBUTION_GUARD (memoryAtomsLoader.ts:186):
                  "(source_type <> 'practitioner_observation' OR facilitator_id IS NOT NULL)"
                  mirrored in lib/workbench/sources/keep.ts:86
                  and excluded from Book Studio mirrors (lib/bookStudio/mirrorSources.ts:160-161)
WRITE REFUSED AT  lib/psyche/portfolio.ts:386-392 — keepSource() throws for this source_type
```

⭐ **The direction is practitioner → member**, the inverse of every other capability here: a
practitioner's observation is written into the member's memory and reaches MAIA's cognition
about that member, in a labelled section.

⛔ **NO WRITER WAS LOCATED.** `lib/psyche/portfolio.ts:389-390` names the authorized writer as
*"the facilitated With-Me path (which sets facilitator_id)"*. Grepping `facilitator_id` across
`lib/`, `app/`, `scripts/` returns only: the two read guards, the loader's projection, the
refusal message, a literal `'maia-facilitator'` string in
`lib/consciousness/ConsciousnessSessionIntegration.ts:73`, and the vendored legacy backend
(§CAP-I-12). **No live INSERT of a `practitioner_observation` atom exists at the subject.**

**MEMBER AUTHORITY** — the atom is `member_memory_atoms`, and `lib/psyche/portfolio.ts:718-780`
provides member-side set-aside/archive scoped to `source_type = 'practitioner_observation'`
(`:748`, `:777`). ⛔ **No member consent gate on creation was found** — there is no creation
path to gate.

**GOVERNANCE GATE — ⛔ NONE FOUND.** The migration header (`:5-9`) states a
*"Constitutional intent"* about the `witnessed` register. Per D-P1-06 and constraint 6, a
migration comment asserting constitutional intent is **implementation evidence, not a ruled
source**, and P1-01 located no ruling behind it.

**CURRENT STATUS — `ORPHANED`.** Schema, read guards, loader projection, refusal path and
member-side disposal all exist; the declared producer does not.

---

### CAP-I-11 · Relationship spaces — the object P1-01 found ungoverned

```text
PERSISTED WHERE   relationship_spaces (invite_token, participant_member_id, status,
                  consent_status, practitioner_display_name, practice_display_name,
                  relationship_type, created_from)
CREATED WHERE     app/api/practitioner/practice-field/invite/route.ts:72-100
CONSUMED WHERE    app/api/join/[token]/route.ts:29 ; app/api/join/[token]/accept/route.ts:26,50
                  app/api/relationship-spaces/[spaceId]/consent/route.ts:27,52
                  app/api/relationship-spaces/[spaceId]/threshold/route.ts:25
MEMBER-FACING     app/api/member/portal/route.ts:19-42 ; app/maia/portal/page.tsx:26,86,142
MAIA-FACING       app/api/sovereign/app/maia/list/route.ts:800-820
```

**Data flow, as traced:** practitioner creates a space and emails an invite token → member
opens `/join/<token>` → accepts → `consent_status` moves → MAIA's prompt for that member gains
the practitioner's practice-field snapshot, gated on `status='active' AND
consent_status='accepted'` and suppressed in Sanctuary (`maia/list/route.ts:801,806`).

⭐ **Member consent gesture: PRESENT and NAMED.** `consent_status` on `relationship_spaces`,
moved by the member's accept at `app/api/join/[token]/accept/route.ts:50` and by
`app/api/relationship-spaces/[spaceId]/consent/route.ts:52`. Its DEFAULT at creation is set
by the practitioner's insert (`invite/route.ts:90-95`); ⚠️ the column's schema default was
**not read** — `relationship_spaces` has no dedicated migration file matching the grep set,
and its DDL was not located at the subject. Recorded as **UNKNOWN**, not assumed.

**WHAT THE CONSENT AUTHORIZES** — practitioner material flowing **toward** MAIA/member. ⛔ It
authorizes no practitioner read of member material, and none was found on this object.

**GOVERNANCE GATE — ⛔ NONE FOUND, and specifically so.** P1-01 slice 08 §5 D-3 records that
`relationship_spaces` is **excluded** from the Relationship Room Constitution's jurisdiction
by a non-deciding reconciliation instrument
(`…PRE_RATIFICATION_RECONCILIATION_2026-08-10.md:104-105`), and that **no read document claims
it**. The code shows a live, member-consent-bearing object sitting in that gap.

**CURRENT STATUS — `WIRED-BUT-UNOBSERVED`.**

**Governance containment** exists as a separate attributed act on the practice field:
`app/api/practitioner/practice-field/[id]/containment/route.ts:1-20` cites a founder ruling
of 2026-08-09 requiring an authenticated, attributable actor for containment transitions.
⭐ **This is the only located founder ruling that binds a practitioner-side surface in this
domain**, and it governs *containment of the practitioner's own field material*, ⛔ **not**
practitioner visibility of member material.

---

### CAP-I-12 · `app/api/_backend/**` — vendored legacy backend with a facilitator dashboard

- Contains `src/routes/facilitatorDashboard.routes.ts` and
  `src/services/{calendarIntegration,retreatSupport}Service.ts`, all keyed on `facilitator_id`.
- All use Supabase query builders (`.eq(...)`, `supabase.from(...)` —
  `facilitatorDashboard.routes.ts:15,54,63`), which the project invariants prohibit.
- `find app/api/_backend -name route.ts` → **no results**; the directory is `_`-prefixed and
  contains no Next route module, so it is not routable by the App Router.

**CURRENT STATUS — `SUPERSEDED`** (Supabase-based; no Next route surface).
**GOVERNANCE GATE — ⛔ NONE FOUND.**
⚠️ Its Dockerfiles and `package.json` mean it may be built and run as a **separate service**;
whether any deployment does so is **UNKNOWN** from the tree.

---

## 3 · The five required answers

### Q1 · Every code path by which a non-member human reads member-originated data

| # | Path | Authorization actually performed | Data exposed |
|---|---|---|---|
| 1 | `GET /studio/fields/<memberId>` — `app/studio/fields/[memberId]/page.tsx:63-115` | session present (`:94`) **+** caller has an `active` row in `practitioners` (`:104-107`). ⛔ **No relationship to `<memberId>`.** | `member_field_note_threads`: `title`, `authorship`, `member_decision`, `spiralogic_phase`, `created_at` where `can_be_shown_to_practitioner = TRUE AND released_at IS NULL`; **plus `members.name` and `members.username` with no predicate at all** (`:79-85`) |
| 2 | `GET /api/supervision/sessions`, `GET /api/supervision/transcript/list` (+9 siblings) | ⛔ **NONE in the handler.** Matrix rule `:578` = tier `free`, no role. Actor from `searchParams` | supervision session metadata; clinical transcript segments (speaker, timing, text) — client speech captured in session |
| 3 | `GET /api/caseload/*` (9 routes) | ⛔ caller identity never established; `memberId` from query string, checked only for `isPractitioner` (`list/route.ts:36,45`). Route family is **unmapped** in the matrix | case list + counts, case memories, case notes, captures, patterns, consultations |
| 4 | `app/api/practitioner/clients/[clientId]/{messages,digest,prep,emergency,policy,spiralogic-report}` | `requireMemberId()`; result used as `practitionerId` (see §CAP-I-05 vocabulary collision) | client→practitioner messages; message digest since last session; session prep; emergency contacts (PHI accessors); generated spiralogic reports |
| 5 | `app/api/studio/**` (≈76 routes) | `getCurrentPractitioner(request)` — server-derived, sound | practitioner-authored records about clients; `intake_responses`; `studio_inquiry_responses` (client-supplied answers); encounters, moments, transcripts, protocols, observations, `pattern_ledger` |
| 6 | `app/api/practitioners/create` (**writes**, enabling #1 and #5) | ⛔ **NONE.** `memberId` from request body | creates `practitioners` row; sets `members.is_practitioner = true` |
| 7 | Founder-gated surfaces — `requireFounder()` via `lib/founder/founderAuth.ts:49-60` (workbench, book-studio, labtools, Circles via `requireCircleAccess`) | `FOUNDER_MEMBER_IDS` allowlist against session member id; fails closed when unset | out of this domain's scope except as a contrast: ⭐ these are the **only** non-member-read paths whose authority is an explicit, named, fail-closed allowlist |
| 8 | ⛔ **NOT a path:** `lib/relationship/scope.ts`, `lib/coachField/*` | n/a — no route imports them | n/a |

⭐⭐ **The single most consequential line in this table is row 1's authorization cell.**
The one path that reads a member's own authored material applies a **role** check where a
**relationship** check would be required for the surface to mean what its header says it
means.

### Q2 · Explicit member consent gesture per path — column, flag, gesture, DEFAULT

| Path | Consent object | DEFAULT | Gesture | Withdrawal |
|---|---|---|---|---|
| `/studio/fields/<memberId>` | `member_field_note_threads.can_be_shown_to_practitioner` (`20260626000001…:40`) | **`false`** (`:40`; baseline `:12389` `DEFAULT false NOT NULL`) | per-thread `shareWithPractitioner` at save (`vision-studio/field-note/route.ts:36,107-130`) | ✅ `PATCH /api/now-what/field-note/[id]` (`:132-139`), idempotent, ledgered |
| Field Lab field notes | same column | **`false`**, and held FALSE by the route — *"stays FALSE here (triadic frontier, deferred)"* (`app/api/maia/field-lab/field-note/route.ts:21`) | — | — |
| `relationship_spaces` | `consent_status` | ⚠️ **UNKNOWN** — DDL not located at the subject; the insert supplies it (`invite/route.ts:90-95`) | member accepts an invite (`app/api/join/[token]/accept/route.ts:50`; `relationship-spaces/[spaceId]/consent/route.ts:52`) | not traced |
| Scribe sessions (adjacent, practitioner container) | `scribe_sessions.consent_status` `CHECK (pending|confirmed|declined)` **`DEFAULT 'pending'`**; `consent_method CHECK (voice|tap|both)`; `memory_policy CHECK (sealed|learning)` **`DEFAULT 'sealed'`** (`20260126000001_scribe_sessions.sql:20-30`) | `'pending'` | consent confirmed before transcript reads (`app/api/scribe/transcript/route.ts:76`; `mark/route.ts:59`; `review-session/route.ts:86,153`) | not traced |
| `/api/supervision/*` | ⛔ **NONE** | — | — | — |
| `/api/caseload/*` | ⛔ **NONE** | — | — | — |
| `/api/practitioner/clients/*` (messages, digest, prep, emergency, spiralogic-report) | ⛔ **NONE** | — | — | — |
| `/api/studio/**` incl. `intake_responses`, `studio_inquiry_responses`, encounters, transcripts | ⛔ **NONE** | — | — | — |
| `practitioner_observation` atoms (CAP-I-10) | ⛔ **NONE at creation** (no creation path exists) | — | — | member-side set-aside/archive only (`lib/psyche/portfolio.ts:735-780`) |
| `POST /api/practitioners/create` | ⛔ **NONE** — the member whose `is_practitioner` flips is not asked | — | — | — |

⭐ **Plainly stated: of the eight live practitioner-facing read families in Q1, exactly one
(row 1) consults a member consent column, and one adjacent family (scribe) has a real
consent state machine. The other six have none.**

⛔ Per D-P1-08, no consent is inferred from any implementation above, and none of these
defaults is scored as adequate or inadequate — only recorded.

### Q3 · Derived / inferred visibility

Traced and reported in full at **CAP-I-07 (D-1 … D-8)**. Summary of what a practitioner can
infer without reading any member-private content:

- **existence** of a member from an id (D-1, D-2)
- the member's **real name and username**, with no predicate (D-1)
- that a member has **shared nothing** — distinguishable from *"no such member"* (D-2)
- **counts** of shared threads and of active phases; per-phase counts (D-3)
- **ordering** by `created_at` within phase, and per-thread dates (D-3, D-5)
- **withdrawal by difference** — silent removal from a previously observed list (D-4)
- **authorship class** — member-authored vs MAIA-proposed-and-kept (D-5)
- a **truncated member identifier** echoed into a shareable URL (D-6)

Not found: practitioner-facing notification of member activity (searched
`notify.*practitioner` / `practitioner.*notif` — all hits are session/booking/Stripe
notifications to the practitioner about the practitioner's own schedule, e.g.
`lib/notifications/SessionNotificationService.ts:779-830`, `lib/stellium/settings.ts:387`);
no practitioner-facing latency or presence surface; no reverse read of `relationship_spaces`
consent state (D-7); no practitioner read of program positions (D-8).

⛔ **Recorded only.** No model designed, no mechanism proposed, no threshold invented, no
k-anonymity rule imported from `CIRCLE_FIELD_DOCTRINE.md:72-79` (which governs Circle theme
surfacing, not this).

### Q4 · FACILITATOR vs PRACTITIONER in code

**There are two unrelated uses of "facilitator", and a third place where the two vocabularies
sit on the same object.**

1. **Circle role — a real, distinct, enforced role.**
   `lib/circles/types.ts:5` — `export type CircleRole = 'helper' | 'facilitator' | 'member'`.
   Enforced: `lib/circles/removalService.ts:114` requires `actorRow.role !== 'facilitator'` →
   refuse; `lib/circles/inquiryService.ts:30` admits `helper` **or** `facilitator`.
   ⚠️ P1-01 recorded that no code path writes `facilitator`; at this subject the **type and
   the checks** exist, and no writer of the value was located by this census either.
   **This role has no connection to `practitioners` — different table, different gate
   (`requireCircleAccess`), different surface.**

2. **`member_memory_atoms.facilitator_id` — the collapse, on one object.**
   `database/migrations/20260624000001_practitioner_observation_provenance.sql:11-14` adds a
   column named **`facilitator_id`** whose purpose is to attribute a `source_type` named
   **`practitioner_observation`** (`:28,45`). The migration header uses both words in three
   consecutive lines: *"facilitator-authored observations"* (`:2`), *"approved practitioner
   observations"* (`:5`), *"witnessed directly by a facilitator in session"* (`:21`).
   `lib/psyche/portfolio.ts:385-391` closes the loop: *"canon: facilitator_id is canonical"*.
   ⭐⭐ **One column, one source type, two role words, treated as the same actor.**

3. **The Studio field page calls a practitioner gate a facilitator view.**
   `app/studio/fields/[memberId]/page.tsx` — title *"Living Field facilitator view"* (`:2`),
   heading *"Living Field — Facilitator View"* (`:143`), closing section *"Facilitation
   guidance"* (`:197`), header sentence *"This is the consented facilitator view"* (`:11`) —
   while the gate it actually executes is
   `SELECT id FROM practitioners WHERE member_id = $1 AND status = 'active'` (`:104-107`).

**Additional occurrences, classified and set aside** (separate referents of an overloaded
token; ⛔ per the vocabulary rule no finding attaches to them):
`CollectiveFieldOrchestrator.ts:39,85,140,597` · `AdvancedConsciousnessDetection.ts:69,105,126`
· `AgentBackchannelingIntegration.ts:99` and `ShadowConversationOrchestrator.ts:582,613`
(`'facilitators_visible'` enum) · `BackchannelingDemonstration.ts:57,611` ·
`master-member-archetype-intelligence.ts:65,213` (`'coach-facilitator'` archetype label).

**ANSWER.** ⭐ **Code draws a real facilitator/practitioner distinction in exactly one place
— the Circle role type — and that place is unrelated to practitioner access. Everywhere the
two words meet a member's material, they name the same actor:** one `practitioners` row
reached through one gate, described in facilitator language on the surface and in
practitioner language in the schema, attributed by a column called `facilitator_id` to a
source type called `practitioner_observation`.

P1-01 recorded *"Whether facilitator (FR-05/FR-12) and practitioner are the same authority,
different authorities, or unrelated"* as **UNLOCATED**. ⛔ The code does not answer it — it
**uses both words for one actor without deciding**, which is a different fact and is
recorded as such.

### Q5 · GOVERNANCE GATE, per capability

| Capability | GOVERNANCE GATE | The named ruled source, if any |
|---|---|---|
| CAP-I-01 practitioner reads member field threads | ⛔ **NONE FOUND** | none. P1-01 §2 verdict; the only visibility grid self-disclaims (`NOW_WHAT_NAVIGATION_AND_ARRIVAL_ARCHITECTURE_2026-08-03.md:141-142`) |
| CAP-I-02 supervision sessions + transcripts | ⛔ **NONE FOUND** | none. P1-01 records supervision-stream governance **UNLOCATED** |
| CAP-I-03 caseload | ⛔ **NONE FOUND** | none |
| CAP-I-04 practitioner creation | ⛔ **NONE FOUND** | none |
| CAP-I-05 client messaging / digest / prep / emergency | ⛔ **NONE FOUND** | none |
| CAP-I-06 Studio CRM (≈76 routes) | ⛔ **NONE FOUND** | none |
| CAP-I-07 derived visibility (D-1…D-8) | ⛔ **NONE FOUND** | none. P1-01 §3: the question is addressed by no document |
| CAP-I-08 `lib/relationship/scope.ts` | ⛔ **NONE FOUND** | none — and it governs nothing anyway |
| CAP-I-09 `lib/coachField/*` | ⛔ **NONE FOUND** | none |
| CAP-I-10 practitioner-observation atoms | ⛔ **NONE FOUND** | a migration comment asserting *"Constitutional intent"* (`20260624000001…:5-9`) — implementation evidence under D-P1-06, not a ruled source |
| CAP-I-11 relationship spaces | ⛔ **NONE FOUND** | ⭐ one adjacent ruling exists — founder 2026-08-09 on **containment attribution** (`practice-field/[id]/containment/route.ts:9-14`) — and it does **not** govern practitioner visibility of member material |
| CAP-I-12 `_backend` facilitator dashboard | ⛔ **NONE FOUND** | none |

⭐⭐ **Twelve capabilities, twelve `NONE FOUND`.** Per constraint 6, this is what
**P1-GOV-ACCESS-01** looks like from the implementation side: the absence is not weakened by
any of it. The one located founder ruling that touches a practitioner surface governs the
practitioner's own material, in the opposite direction.

---

## 4 · Contradictions (both sides visible, ⛔ unreconciled)

**C-I-1 · "Deferred, held FALSE, no path" vs. a live path.**
`database/migrations/20260626000001_member_field_note_threads.sql:8,40,96` states the
practitioner-visibility capability is **DEFERRED** and the column is *"held FALSE, no path"*.
`app/api/maia/vision-studio/field-note/route.ts:107-130` binds the column to a client-supplied
`shareWithPractitioner` value, and `app/studio/fields/[memberId]/page.tsx:69` reads it.
Both statements are present at the subject. ⛔ Not reconciled.

**C-I-2 · "The consented facilitator view" vs. a role-only gate.**
`app/studio/fields/[memberId]/page.tsx:9-11` asserts the view is consented; `:104-107` checks
only that the viewer is some active practitioner, with no relationship predicate and no
consent predicate on `members.name` / `members.username` (`:79-85`). ⛔ Not reconciled.

**C-I-3 · Two written access models vs. the wired one.**
`lib/relationship/scope.ts` and `lib/coachField/*` encode member/practitioner read scopes,
crossing rules and verb limits. `app/studio/fields/[memberId]/page.tsx` performs a
practitioner read of member material and imports neither. ⛔ Not reconciled.

**C-I-4 · `/caseload` declared with a role; `/api/caseload` matched by nothing.**
`config/accessMatrix.ts:470` declares `{ prefix: '/caseload', minTier: 'pro',
rolesAnyOf: ['practitioner'] }`. The API family lives at `/api/caseload/*`, which that prefix
does not match, and no other rule matches it; the unmapped default is permissive
(`:727-729`). ⛔ Not reconciled. ⚠️ Whether `ACCESS_CONTROL_MODE=strict` is set in production
is **UNKNOWN**.

**C-I-5 · `/api/supervision` declared free-tier, no role; content is clinical.**
`config/accessMatrix.ts:578` vs. the routes' own *"HIPAA compliant"* headers
(`sessions/route.ts:5`; `transcript/list/route.ts:7`) and their absent handler
authorization. ⛔ Not reconciled.

**C-I-6 · Facilitator and practitioner: one actor, two vocabularies.**
`member_memory_atoms.facilitator_id` attributing `source_type='practitioner_observation'`
(`20260624000001…:11-14,28,45`; *"canon: facilitator_id is canonical"*,
`lib/psyche/portfolio.ts:390`) vs. `CircleRole` where `facilitator` is a distinct enforced
role unrelated to `practitioners` (`lib/circles/types.ts:5`;
`lib/circles/removalService.ts:114`). ⛔ Not reconciled.

**C-I-7 · `practitioner_id` refers to two different tables.**
Recorded by the schema itself: `20260802000002_practitioner_client_relationship.sql:45-52`,
with three competing `CREATE TABLE IF NOT EXISTS` definitions at `:26-39` and the explicit
warning that *"the declared shape in this repository is therefore NOT authoritative."*
⛔ Not reconciled; per the vocabulary rule no finding is attached to the token itself.

**C-I-8 · The matrix's own DECLARED-vs-ENFORCED divergences.**
`config/accessMatrix.ts:288,299,392-404,531` — the file records four cases where the declared
policy and the enforced policy differ, one of which it labels *"Unreconciled"* in its own
note (`:404`). ⛔ Carried forward, not reconciled.

---

## 5 · Unlocated governance

- ⛔ **A ruled model of what a practitioner may see of a member.** Re-confirmed at the code
  level: no gate, guard, test or config file cites one. **P1-GOV-ACCESS-01.**
- ⛔ **"The consent architecture"** — deferred to at
  `docs/product/NOW_WHAT_NAVIGATION_AND_ARRIVAL_ARCHITECTURE_2026-08-03.md:142`. Searched for
  a code artifact bearing that name: none. Still **UNLOCATED**.
- ⛔ **Supervision-stream governance** — who may start, stream, read or retain a clinical
  supervision transcript, and on whose consent. No code gate, no ruled source.
- ⛔ **Governance of `relationship_spaces`** — live object, member consent column, excluded
  from the Relationship Room Constitution's jurisdiction by a non-deciding instrument,
  claimed by nothing.
- ⛔ **Authority to create a practitioner.** `POST /api/practitioners/create` has no gate; no
  ruling naming who may become a practitioner was located.
- ⛔ **Whether facilitator and practitioner are one authority.** The code uses both words for
  one actor without deciding (Q4). Unlocated in documents, undecided in code.
- ⛔ **Derived / inferred visibility.** No rule on counts, ordering, timestamps, presence,
  existence oracles or withdrawal-by-difference. **Recorded only (F9 / D-P1-08).**
- ⛔ **A member-facing statement of what their practitioner can see.** Searched member-facing
  surfaces (`app/now-what/{home,field,questions}/page.tsx`, `app/maia/portal/page.tsx`); the
  member sees their own per-item sharing state (`app/api/now-what/home/route.ts:95`
  `sharedWithCoach`; `WithdrawVisibility` rendered at `app/now-what/field/page.tsx:142` and
  `app/now-what/questions/page.tsx:136`) — ⛔ but no statement of **who** the practitioner is
  for that member, or **what else** they can see. Still **UNLOCATED**.
- ⚠️ `docs/architecture/CAPABILITY_ACCESS_MODEL_PROPOSAL.md` — named by P1-01 as unread.
  **Not read in this domain either** (this is a code census). Status **UNKNOWN**.

---

## 6 · Named-but-unverified artifacts

| Named | Named where | Verified at subject? |
|---|---|---|
| *"the facilitated With-Me path (which sets facilitator_id)"* | `lib/psyche/portfolio.ts:389-390` | ⛔ **NO.** No writer of a `practitioner_observation` atom exists in `lib/` or `app/`. The consumer (loader, guards, projection, member disposal) all exist |
| *"the consent architecture"* | `NOW_WHAT_NAVIGATION_AND_ARRIVAL_ARCHITECTURE_2026-08-03.md:142` | ⛔ **NO** — no document and no code artifact |
| `CIRCLE_ACCESS_MEMBER_IDS` cohort | `lib/circles/circleAccess.ts:23-36` | ⚠️ read by the code; the file states the cohort is **not yet constituted**. Effective value **UNKNOWN** (no runtime) |
| `FOUNDER_MEMBER_IDS` / `LAB_ACCESS_MEMBER_IDS` | `lib/founder/founderAuth.ts:26-27`; `lib/access/labAccess.ts:26` | ⚠️ code verified; **values UNKNOWN** |
| `ACCESS_CONTROL_MODE` | `config/accessMatrix.ts:727-729` | ⚠️ code verified; **production value UNKNOWN** — decides whether `/api/caseload/*` is open |
| `scripts/verify-practitioner-projection.ts` forbidden-table roster | `lib/coachField/practitionerProjection.ts:64-67` | ⚠️ the script exists and imports the module; ⛔ **not executed** (running scripts is outside this census's authority) |
| `docs/specs/developmental-environment/PRACTITIONER_PROGRAM_PLATFORM_ADR_2026-07-14.md` | `app/api/practitioner/programs/route.ts:5` | ⛔ **NOT READ** in this domain. Its binding force is **UNKNOWN** |
| *"catalog spec §8 — the absence is the feature"* | `app/api/practitioner/programs/route.ts:13-14` | ⛔ **NOT LOCATED.** The behaviour it describes **is** verified in code (D-8); the spec is not |
| Founder ruling 2026-08-09 on containment attribution | `app/api/practitioner/practice-field/[id]/containment/route.ts:9-14`, citing `docs/design/practitioner-portal/GOVERNANCE_CONTAINMENT_2026-08-09.md` | ⛔ **NOT READ** in this domain |
| *"HIPAA compliant"* | `app/api/supervision/sessions/route.ts:5`; `transcript/list/route.ts:7` | ⛔ a source-comment claim. ⛔ Not adjudicated here |
| `relationship_spaces` DDL | consumed by six routes | ⛔ **NOT LOCATED** at the subject; `consent_status` schema default **UNKNOWN** |
| `app/api/_backend/**` as a deployed service | Dockerfiles + `package.json` present | ⛔ **UNKNOWN** whether any deployment runs it |

---

## 7 · Open questions for P1-04

1. **Q1-row-1 is the domain's sharpest single fact.** `/studio/fields/<memberId>` applies a
   **role** check where the surface's own language implies a **relationship**. P1-04 must
   decide whether that gap is a defect against something, ⛔ and this census records only
   that P1-01 located nothing for it to be a defect *against*.
   **`REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED`.**
2. **Two complete access models exist in code and neither is wired.** Is
   `lib/relationship/scope.ts` a discarded design, an unratified candidate, or the intended
   model of a surface that was built past it? The tree cannot say. **`REPAIR QUESTION MAY
   EXIST — NOT YET AUTHORIZED`.**
3. **`bringForward()` — the only member gesture in the coach-field model — has no surface.**
   Whether the model was intended to reach members is **UNKNOWN**.
4. **Handler-level authorization is absent on three route families** (supervision, caseload,
   `practitioners/create`) whose declared matrix rules do not supply it either. P1-04 must
   determine whether these are within any lane's scope. **`REPAIR QUESTION MAY EXIST — NOT
   YET AUTHORIZED`.**
5. **`ACCESS_CONTROL_MODE` in production.** Requires a runtime witness this container cannot
   produce. Its value determines whether `/api/caseload/*` is reachable unauthenticated.
6. **Is `facilitator` one role or two?** Q4 shows the code uses one actor and two vocabularies
   on the same column. P1-04 may need this settled before any practitioner-visibility
   question can be stated precisely — ⛔ this census does not settle it.
7. **Who may become a practitioner?** CAP-I-04 is upstream of CAP-I-01's only check, so any
   later reasoning about practitioner visibility depends on it.
8. **`relationship_spaces` sits in a governance gap that is documented as a gap.** It is live,
   it carries member consent, and no ruled source claims it.
9. **`practitioner_observation` atoms: schema and readers without a writer.** Whether the
   With-Me path was removed, never built, or lives outside this tree is **UNKNOWN**
   (**E-1**: no history claim made).
10. **Derived visibility (D-1 … D-8) is recorded and ungoverned.** ⛔ Per D-P1-08 and F9 this
    census opens nothing and proposes nothing; P1-04 inherits the list intact.

---

## 8 · Method and limits

- **Authority exercised:** READ · TRACE · CLASSIFY. No file outside this record was modified;
  no build, test, migration, script or deploy was run; no repair proposed; no contradiction
  reconciled; no access model designed, widened or narrowed.
- **Calibration:** no runtime, no database, no production access — so every capability is at
  most `WIRED-BUT-UNOBSERVED` and **nothing here is scored `LIVE`**.
- **C-2:** `MAIA_WHOLE_ORGANISM_MAP/07_now_what.md` is cited once (CAP-I-01, for its own
  *"WALKED: none in this census"*), carrying **PREDECESSOR CENSUS · FROZEN INCOMPLETE ·
  EVIDENCE INPUT ONLY**. No claim of its is adopted as present truth.
- **E-1:** no ancestry, removal or history claim is made. Absences are absences at the subject.
- **Constraint 5:** every artifact named was opened and read at the subject, except rows that
  say **NOT READ / NOT LOCATED**.
- **Search completeness:** Q1 is built from directed greps over
  `app/api/{studio,practitioner,practitioners,caseload,supervision,stellium}`,
  `app/{studio,practitioner,supervision,caseload}`,
  `lib/{practitioner,caseload,supervision,coachField,relationship,practiceField,access,auth,founder,circles}`,
  `config/accessMatrix.ts`, `middleware.ts`, `database/{migrations,baseline}`. ⚠️ **Not proved
  exhaustive:** seven of eleven supervision routes and most of the ≈76 Studio routes were
  classified by their shared authorization import rather than read individually. Any
  completeness claim beyond what is cited is **UNKNOWN**.
