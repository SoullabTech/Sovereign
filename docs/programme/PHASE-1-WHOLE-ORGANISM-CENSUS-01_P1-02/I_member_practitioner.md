# P1-02 · DOMAIN I — MEMBER / PRACTITIONER ORGANISM

```text
LANE      PHASE-1-WHOLE-ORGANISM-CENSUS-01 · STEP P1-02 · PARALLEL ORGANISM CENSUS
DOMAIN    I · member · MAIA · practitioner · practitioner-facing surfaces ·
          member-private material · sharing gestures · derived visibility
SUBJECT   1a5554300e855d3581085849301a39cbb10ab385
TYPE      RECORD ONLY — evidence, never rulings · AUTHORITY: READ / TRACE / CLASSIFY
BOUND BY  D-P1-08 · P1-GOV-ACCESS-01 · constraints 1–8 · LIVE calibration
```

> **P1-02 asks what the organism does. It does not infer from doing that the organism
> is authorized to do it.**

**SUBJECT VERIFICATION.** `git diff --stat 1a555430 HEAD` returns 14 files, all under
`docs/programme/**`. **No file under `app/**`, `lib/**`, `config/**`, `database/**` or
`middleware.ts` differs between the census subject and the working tree.** Every `file:line`
below is a claim about the subject.

**CONTENT DISCIPLINE.** Paths, field names, column names, route shapes and authorization
predicates only. No member content, no excerpt from any member-authored object, no credential,
no identifier of any real person.

---

## 0 · What this domain found, in one paragraph

The corpus contains **two member/practitioner access models written in code** —
`lib/relationship/scope.ts` and `lib/coachField/*` — and **neither is reachable from any route
or page**; both are imported only by their own tests and by `scripts/verify-*`. The visibility
that is actually **wired** runs through a thinner set of paths importing neither. Of those,
exactly **one** consults a member consent column (`can_be_shown_to_practitioner`,
`DEFAULT false`), and that same page performs **no check that the viewing practitioner has any
relationship to the member whose id is in the URL**. Three practitioner-facing route families
take the actor's identity from a **client-supplied query parameter or request body** rather
than the session. **Per constraint 6, none of this is governed:** P1-01 located no ruled access
model for practitioner visibility of member material, and nothing in the code supplies one.
Every capability below carries `GOVERNANCE GATE: NONE FOUND`.

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

- `Role = 'admin' | 'steward' | 'curator' | 'practitioner' | 'partner' | 'member'` (`:11`).
- `checkAccess()` tests **public → authenticated → tier → roles** in that order (function tail).
- **Unmapped routes default to ALLOW.** `getAccessMode()` returns `'permissive'` unless
  `ACCESS_CONTROL_MODE === 'strict'` (`:727-729`); an unmatched path then returns
  `{allowed: true, reason: 'no-rule-match', unmapped: true}`. ⚠️ The production value is
  **UNKNOWN** — no runtime.
- Middleware writes `x-access-tier` / `x-access-roles` / `x-access-authed` onto the **forwarded
  request** (`middleware.ts:62-87`).
- **Dev bypass** (`middleware.ts:173-184`): under `NODE_ENV === 'development'`,
  `/api/stellium/*` and `/api/notifications/*` are forwarded with
  `x-access-roles: 'practitioner'`, `x-access-tier: 'pro'`, `x-access-authed: 'true'` and no
  session. Guarded on `NODE_ENV`; recorded, ⛔ not scored as a production path.

Relevant declared rules, verbatim from the matrix:Relevant declared rules, verbatim from the matrix:

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
| `requireFounder()` | `lib/founder/founderAuth.ts:49-60` | `FOUNDER_MEMBER_IDS` env allowlist vs `session.memberId` |
| `requireLabAccess()` | `lib/access/labAccess.ts` | founder ∪ `LAB_ACCESS_MEMBER_IDS`; fails closed |
| `requireCircleAccess()` | `lib/circles/circleAccess.ts:63` | founder ∪ `CIRCLE_ACCESS_MEMBER_IDS`; the file states the cohort var is **not yet constituted** (`:23-36`) |
| `getCurrentPractitioner()` / `requirePractitioner()` | `lib/auth/getCurrentPractitioner.ts:27-66`, `:74-98` | session member id → `SELECT … FROM practitioners WHERE member_id = $1 AND status = 'active'` |
| `getAuthoredField()` | via `app/api/practitioner/programs/route.ts:33-45` | "field holder" = member who authored a practice field |

⛔ There is **no** `requireSupervisor()`, no `requireFacilitator()`, and **no gate anywhere that
asks whether a practitioner is in relationship with a particular member** at a page or route
boundary. The only function in the tree that asks that is
`authorizePractitionerClientRelationship()` (`lib/coachField/identity.ts`) — and CAP-I-09 shows
it has no route callers.

---

## 2 · CAPABILITY RECORDS

### CAP-I-01 · Practitioner reads a member's Living Field threads

**CAPABILITY** a practitioner opens `/studio/fields/<memberId>` and reads that member's
field-note thread titles, authorship class, phase and dates, plus the member's real name and
username. **DECLARED** `config/accessMatrix.ts:485` (`{prefix:'/studio', minTier:'free'}`).
**PERSISTED** `member_field_note_threads` (`20260626000001_member_field_note_threads.sql:40`).
**LOADED** `app/studio/fields/[memberId]/page.tsx:63-77` (threads), `:79-85` (member row).
**SURFACED** `:134-205`. **UPDATED** member sets the flag at save
(`app/api/maia/vision-studio/field-note/route.ts:107-130`) or withdraws it
(`app/api/now-what/field-note/[id]/route.ts:132-139`).

**CANONICAL CALL PATH** — `GET /studio/fields/<memberId>` → middleware `checkAccess`
(`/studio` prefix, tier `free`, **no role**) → `getCurrentSession()` (`:94`) → inline
`SELECT id FROM practitioners WHERE member_id = $1 AND status = 'active'` (`:104-107`), zero
rows ⇒ `redirect('/studio')` (`:109`) → `SELECT … FROM member_field_note_threads WHERE
member_id = $1 AND released_at IS NULL AND can_be_shown_to_practitioner = TRUE` (`:65-73`)
→ render (`:134-205`).

**MEMBER AUTHORITY** — the per-thread boolean `can_be_shown_to_practitioner`,
**DEFAULT `false`** (`20260626000001_member_field_note_threads.sql:40`; baseline
`0001_baseline_2026-09-01.sql:12389` `DEFAULT false NOT NULL`). ⚠️ That migration's own comment
calls the capability **DEFERRED** and the flag *"held FALSE, no path"* (`:8,40,96`) — but
**Vision Studio supplies a path**: `app/api/maia/vision-studio/field-note/route.ts:107-130`
binds the column to a per-thread `shareWithPractitioner` boolean from the request body (`:36`),
intent stated at `:11-15`. Withdrawal exists
(`app/api/now-what/field-note/[id]/route.ts:132-139`): ownership enforced **inside** the
mutation by the `member_id` predicate (`:107-113`), idempotent (`:122-129`), ledgered by
`20260730000002_practitioner_visibility_withdrawn_event.sql`.

**PRACTITIONER AUTHORITY** — read-only; may not write, withdraw, or reach a FALSE-flag thread.
**⛔ But practitioner identity is the ONLY thing checked.** **MAIA AUTHORITY** — none here.
**SYSTEM AUTHORITY** — `released_at IS NULL` (`:68`) silently excludes released threads.

⭐⭐ **THE STRUCTURAL FINDING.** The gate at `:104-107` asks *"is the viewer an active
practitioner?"*, never *"is this practitioner this member's practitioner?"* No
`practitioner_clients`, `relationship_spaces` or `coach_client_*` predicate appears on the page;
`memberId` is a free URL segment. **Any member holding an `active` row in `practitioners` can
read the shared field of any member whose id they supply.** The consent column limits *which
threads*, never *which practitioner*.

**GOVERNANCE GATE — ⛔ NONE FOUND.** The page header (`:9-11`) asserts *"This is the consented
facilitator view."* That is a source comment, not a ruled source. P1-01 §2 established that
**no ruled access model for practitioner visibility of member material exists**; the one
artifact shaped like one disclaims itself
(`docs/product/NOW_WHAT_NAVIGATION_AND_ARRIVAL_ARCHITECTURE_2026-08-03.md:141-142`) and defers
to an unlocated *"consent architecture"*. Per constraint 6 the flag's existence does not make
the visibility governed, and *"consented"* is an assertion the corpus does not back.

**FAILURE MODE** — unauthenticated → sign-in message (`:95-101`); non-practitioner → redirect
(`:109`); unknown memberId → 404 (`:117`). ⚠️ A **known** memberId with zero shared threads
renders the member's **name** and *"has not yet carried anything"* (`:142,165-168`) — CAP-I-07.

**CURRENT STATUS — `WIRED-BUT-UNOBSERVED`.** Complete path traced from a real entry point.
No dated runtime or production witness exists in-repo: the predecessor census records
*"WALKED: none in this census"* for this surface
(`docs/programme/MAIA_WHOLE_ORGANISM_MAP/07_now_what.md:128` — **C-2 · FROZEN INCOMPLETE ·
EVIDENCE INPUT ONLY**).

**SOURCE EVIDENCE** — `app/studio/fields/[memberId]/page.tsx:1-205`;
`config/accessMatrix.ts:485`; `database/migrations/20260626000001_member_field_note_threads.sql:8,40,96`;
`app/api/maia/vision-studio/field-note/route.ts:11-15,36,107-130`;
`app/api/now-what/field-note/[id]/route.ts:107-139`.

### CAP-I-02 · Any caller lists supervision sessions and reads clinical transcripts

**CAPABILITY** list supervision sessions for an arbitrary `practitionerId` and read transcript
segments for an arbitrary `sessionId`. **DECLARED** `config/accessMatrix.ts:578`
(`{prefix:'/api/supervision', minTier:'free'}`). **PERSISTED** session + transcript tables via
`lib/supervision/SupervisionStore.ts`. **LOADED** `app/api/supervision/sessions/route.ts:15-45`;
`app/api/supervision/transcript/list/route.ts:34-45`. **SURFACED** `app/supervision/**`;
`lib/supervision/ClinicalSupervisionEngine.ts`.

**CANONICAL CALL PATH** — `GET /api/supervision/sessions?practitionerId=…&caseId=…` →
middleware `checkAccess` (matched rule: tier `free`, **no `rolesAnyOf`**) → handler →
`practitionerId` and `caseId` read straight from `searchParams` (`:22-23`) →
`listSessions({practitionerId, caseId, limit, offset})` (`:26-31`) → response.

`GET /api/supervision/transcript/list?sessionId=…` → same middleware rule → handler →
`sessionId` from `searchParams` (`:40`) → `getTranscript` / `getTranscriptSegments`.

**⛔ NO HANDLER-LEVEL AUTHORIZATION.** Neither file imports `requireFounder`,
`requirePractitioner`, `getCurrentPractitioner`, `requireMemberId`, `getCurrentSession` or
`getMemberIdFromRequest`. Grepped: zero matches in either route.

**MEMBER AUTHORITY** — ⛔ **NONE FOUND.** No consent column, flag or gesture is consulted. The
subject of a supervision transcript is a client whose speech is captured; nothing on the path
asks them anything. **PRACTITIONER AUTHORITY** — asserted by query parameter, verified by
nothing. **SYSTEM AUTHORITY** — total.

⚠️ Both route headers assert *"HIPAA compliant"* (`sessions/route.ts:5`;
`transcript/list/route.ts:7`). Recorded verbatim as a **source-comment claim about storage
location**; it says nothing about the authorization this census finds absent, and ⛔ this
census does not adjudicate it.

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

### CAP-I-03 · Caseload — practitioner identity asserted by query parameter

**CAPABILITY** list a practitioner's cases, case memories, notes, captures, patterns,
consultations. **DECLARED** `config/accessMatrix.ts:470` — ⚠️ prefix `/caseload`, which does
**not** match `/api/caseload/*`. **PERSISTED** `lib/caseload/{CaseStore,CaseMemoryService,
CasePatternService}.ts`. **LOADED** `app/api/caseload/list/route.ts:29-70` + 8 siblings.
**SURFACED** `app/caseload/**`, `app/studio/caseload/**`, `app/model-studio/caseload/**`.

**CANONICAL CALL PATH** — `GET /api/caseload/list?memberId=…` → middleware: **no matrix rule
matches `/api/caseload/*`**, so in the default permissive mode it passes as `unmapped` →
handler → `memberId` from `searchParams` (`:36`) → `CaseStore.isPractitioner(memberId)`
(`:45`) → 403 if false (`:46-51`) → `CaseStore.listCases(memberId, filters)` +
`getCaseCounts(memberId)` (`:61-64`).

⭐⭐ **The check is *is the member named in the URL a practitioner*, not *is the caller that
member*.** The handler's own comment names the parameter *"memberId (required):
Practitioner's member ID"* (`:22`). Same shape at
`app/api/caseload/[caseId]/memories/list/route.ts:36` and
`app/api/caseload/[caseId]/notes/route.ts:47`.

**MEMBER AUTHORITY** — ⛔ **NONE FOUND.** Caseload content is practitioner-authored *about* a
client; the client is represented via `lib/caseload/ClientNameEncryption.ts` rather than a
`members` row. No consent column, no client gesture, no client-facing view.

**PRACTITIONER AUTHORITY** — self-asserted.  **GOVERNANCE GATE — ⛔ NONE FOUND.**

**FAILURE MODE** — 400 on missing `memberId`; 403 when the named member is not a
practitioner. ⛔ No failure mode exists for *"caller is not the member named"* — that question
is never asked.

**CURRENT STATUS — `WIRED-BUT-UNOBSERVED`.**

**SOURCE EVIDENCE** — `app/api/caseload/list/route.ts:20-70`;
`app/api/caseload/[caseId]/memories/list/route.ts:36`;
`app/api/caseload/[caseId]/notes/route.ts:47`; `config/accessMatrix.ts:470,727-729`.

### CAP-I-04 · Becoming a practitioner — unauthenticated, self-asserted memberId

**CAPABILITY** create a `practitioners` row for an arbitrary `memberId` and set that member's
`members.is_practitioner = true`. **DECLARED** `config/accessMatrix.ts:534`
(`{exact:'/api/practitioners/create', minTier:'pro'}`, **no role**). **PERSISTED**
`practitioners`, `members.is_practitioner`, `practitioner_themes`. **WRITTEN**
`app/api/practitioners/create/route.ts:43-165`.

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

### CAP-I-05 · Practitioner ⇄ client messaging, digest and prep

**CAPABILITY** a practitioner reads the message thread a client sent them, a since-last-session
digest, session prep, emergency contacts and generated reports. **LOADED**
`app/api/practitioner/clients/[clientId]/{messages,digest,prep,emergency,policy,
spiralogic-report}/route.ts`; `lib/practitioner/{messages,sessionPrep}.ts`. **PERSISTED**
`practitioner_clients`, `practitioner_sessions`, message tables, `spiralogic_reports`.

**AUTHORIZATION** — `requireMemberId()` from `lib/auth/session`
(`digest/route.ts:15,30` · `messages/route.ts:15` · `spiralogic-report/route.ts:16,28`). The
returned value is **assigned to a variable named `practitionerId`** and passed into
`getMessageDigest(practitionerId, clientId)` and into
`SELECT … FROM spiralogic_reports` (`spiralogic-report/route.ts:31-35`).

⚠️ **VOCABULARY COLLISION, DOCUMENTED IN THE SCHEMA ITSELF.**
`20260802000002_practitioner_client_relationship.sql:45-52` records that `practitioner_id`
references `practitioners(id)` in `practitioner_clients` / `practitioner_client_notes` but
`members(id)` in `client_invites` / `practitioner_sessions` — *"Same column name, different
referent. Service code must therefore resolve practitioner identity THROUGH the relationship
row and never by trusting a column called practitioner_id."* The same migration records
**three competing `CREATE TABLE IF NOT EXISTS` definitions** of `practitioner_clients` and
that *"the declared shape in this repository is therefore NOT authoritative — not even for
the target of the practitioner_id foreign key"* (`:26-39`). Per the vocabulary rule,
`practitioner_id` is an overloaded token and **no finding attaches to it as such**; whether
`requireMemberId()`'s value is the correct referent at each call site **could not be settled
from the tree** and is recorded as **UNKNOWN**, ⛔ not as a defect.

**MEMBER AUTHORITY** — ⛔ **NONE FOUND** on the read side. The messages are ones the client
sent, so the sending act is the gesture; no column records a consent state and no withdrawal
path exists. The member link is `practitioner_clients.member_id`, **write-once** — a trigger
refuses re-pointing and unlinking (`20260802000002…:333-347`), `ON DELETE SET NULL` to
`members(id)` (`:150-154`), `CHECK ((member_id IS NULL) = (linked_at IS NULL))` (`:265`).

**GOVERNANCE GATE — ⛔ NONE FOUND.**  **CURRENT STATUS — `WIRED-BUT-UNOBSERVED`.**

### CAP-I-06 · Studio CRM surface (≈76 routes)

**CAPABILITY** the practitioner Studio: clients, notes, encounters, moments, transcripts,
field, protocols, observations, inquiry responses. **AUTHORIZATION** `getCurrentPractitioner(request)`
at the top of each handler (76 files matched; `lib/auth/getCurrentPractitioner.ts:27-66`).
**SCOPING** `identity.practitionerId`, server-derived, used in the `WHERE` clause (e.g.
`app/api/studio/clients/route.ts:27-32`). ⭐ The **best-behaved** practitioner surface in the
tree: identity is never accepted from the caller.

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

### CAP-I-07 · DERIVED / INFERRED VISIBILITY

⛔ **Recorded only. No repair proposed, no mechanism designed, no programme opened (F9,
D-P1-08).**

**D-1 · Member existence and real name — no consent predicate, no relationship.**
`app/studio/fields/[memberId]/page.tsx:79-85` runs `SELECT id, name, username FROM members
WHERE id = $1`. Name renders at `:142,159,166,199`. Supplying an id reveals that it resolves
to a real member, and that member's name.

**D-2 · An existence oracle over the *absence* of shared material.** Three distinguishable
outcomes: unknown id → `notFound()` (`:117`); known id + zero shared threads → the member's
name plus *"has not yet carried anything from a Vision Studio session"* (`:165-168`); known id
+ ≥1 thread → the threads. *"Exists and has shared nothing"* is readable, and distinct from
*"no such member"*.

**D-3 · Counts, phase counts, ordering.** `totalThreads` (`:132,148`), `orderedPhases.length`
as *"N phases active"* (`:149`), per-phase count badge (`:177`), ordering `created_at ASC`
within phase (`:70-72`). The counted set is consent-filtered — ⚠️ but the practitioner cannot
see its complement, and the counts move on withdrawal (D-4).

**D-4 · Withdrawal is silent, hence inferable by difference.** The PATCH flips the flag
(`app/api/now-what/field-note/[id]/route.ts:132-139`); **no practitioner notification writer
was found**. The thread leaves the result set; a practitioner who saw the page before and after
observes a count decrease and a missing title. The act is recorded in `member_field_note_events`
(`20260730000002…`) — a **member-side** ledger; no practitioner read of it was found.

**D-5 · Authorship class disclosed per thread.** `t.authorship` renders `member-authored` vs
`member-confirmed` (`:183`) — whether the member wrote it or MAIA proposed and the member kept
it. Dates at `:184`.

**D-6 · A truncated member identifier is echoed to the practitioner.** `:157-160` renders
`/maia/vision-studio?fieldContext=` plus the first 8 characters of the member's uuid.

**D-7 · Relationship-space state flows member-ward only.**
`app/api/sovereign/app/maia/list/route.ts:800-820` injects practice-field context into **MAIA's**
prompt for the member, gated on `status='active' AND consent_status='accepted'` (`:806`) and
`!isSanctuary` (`:801`); `app/api/member/portal/route.ts:19-42` shows the member their own
spaces. ⭐ **No reverse path was found.** Recorded as an absence found by search, ⛔ not a proof
of absence.

**D-8 · Program positions are structurally unreadable by the practitioner.**
`app/api/practitioner/programs/route.ts:11-15`: *"This surface writes the CURRICULUM only.
Member positions are a different jurisdiction entirely: no route here reads, counts, or
aggregates them, and none may be added (catalog spec §8 — the absence is the feature)."*
Verified: it imports only `getAuthoredField`, `listPrograms`, `createProgram` (`:19-24`) and
never touches `programPositionService`. ⭐ The one **enforced-by-construction** non-visibility
here. ⛔ Still **GOVERNANCE GATE: NONE FOUND** — *"catalog spec §8"* is a spec reference and
P1-01 located no ruling binding it.

**GOVERNANCE GATE for all of D-1…D-8 — ⛔ NONE FOUND.**
P1-01 slice 08 §3 recorded: *"No document read in this slice addresses whether a practitioner
could infer the existence of member-private material through metadata, counts, ordering,
timestamps, notifications, suggested actions, or latency."* The four nearest texts were
examined there and each falls short. That absence is unchanged by anything found here —
per constraint 6, discovering the mechanisms does not govern them.

**CURRENT STATUS — `WIRED-BUT-UNOBSERVED`** for D-1…D-6; **`OBSERVATION-ONLY`** is not used,
because these are live render paths, not instrumentation.

### CAP-I-08 · `lib/relationship/scope.ts` — the explicit access model that nothing calls

**CAPABILITY** a typed member/practitioner read-scope and verb model: `ReadScope`, `Role`,
`resolveReadScope`, `canRead`, `requiresCommitmentContext`, `isOfferable`, `developIntoWisdom`,
`removeIdentifiers`, `wisdomMayCiteMemberMaterial` (returns `never`), `maySystemDraw`,
`admitsToCommitment`, `practitionerMay`, `offersDoNothing`, `ScopeViolation`, `Unruled`
(`lib/relationship/scope.ts:50-420`). **CONSUMERS** `lib/relationship/__tests__/scope.test.ts`
— and nothing else.

Grepped each exported symbol (`resolveReadScope`, `practitionerMay`, `admitsToCommitment`,
`maySystemDraw`, `ScopeViolation`) across `lib/`, `app/`, `scripts/`, `tests/`, `__tests__`:
**every hit outside the module is in its own test file.**

What it encodes (`:336-344,345-362,369-412`): the practitioner may never declare the member's
material into a shared commitment; a Keep never crosses on its own — *"the crossing IS the
consent event"*; a practitioner may `reflect`, `offer_question`, `offer_observation`,
`offer_encouragement` over `my_question | my_work | my_story | my_coaching`, and never edit.
`:350` names `can_be_shown_to_practitioner` as *"the existing flag that holds this line"* — so
the module knows about CAP-I-01's column, and CAP-I-01 does not know about the module.

**MEMBER / PRACTITIONER / MAIA / SYSTEM AUTHORITY** — all **notional**; it governs no live read.
**GOVERNANCE GATE — ⛔ NONE FOUND** — a source file is not a ruled source, and no located
ruling cites it.

**CURRENT STATUS — `ORPHANED`.** The code exists; its declared consumer (any route or page
that reads member material for a practitioner) does not import it. ⛔ Not `DORMANT`: CAP-I-01
performs the very act this module models, and does so without it.

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

### CAP-I-10 · Practitioner observation atoms inside member memory

**CAPABILITY** a facilitator-authored observation stored in the **member's own** memory store
and surfaced into MAIA's prompt as a separate authorship section.
**DECLARED** `database/migrations/20260624000001_practitioner_observation_provenance.sql`.
**PERSISTED** `member_memory_atoms.source_type = 'practitioner_observation'`;
`.facilitator_id` (FK → `members(id) ON DELETE SET NULL`, `:13-14`);
`.epistemological_status ∈ observed|reported|inferred|provisional|claimed` (`:17-26`).
**LOADED** `lib/maia/memoryAtomsLoader.ts:171,186,202,296-311`.
**SURFACED** `:442-447` — `projectAtomSections()` splits `# MEMBER-PLACED PORTFOLIO` from
`# PRACTITIONER OBSERVATIONS`.
**GUARDED** `PRACTITIONER_ATTRIBUTION_GUARD` (`:186`)
`"(source_type <> 'practitioner_observation' OR facilitator_id IS NOT NULL)"`, mirrored at
`lib/workbench/sources/keep.ts:86` and excluded from Book Studio mirrors
(`lib/bookStudio/mirrorSources.ts:160-161`).
**WRITE REFUSED** `lib/psyche/portfolio.ts:386-392` — `keepSource()` throws for this source type.

⭐ **The direction is practitioner → member**, inverse of every other capability here: an
observation is written into the member's memory and reaches MAIA's cognition about that
member, in a labelled section.

⛔ **NO WRITER WAS LOCATED.** `lib/psyche/portfolio.ts:389-390` names the authorized writer as
*"the facilitated With-Me path (which sets facilitator_id)"*. Grepping `facilitator_id` across
`lib/`, `app/`, `scripts/` returns only the two read guards, the loader projection, the
refusal message, a literal `'maia-facilitator'` string
(`lib/consciousness/ConsciousnessSessionIntegration.ts:73`), and the vendored legacy backend
(CAP-I-12). **No live INSERT of a `practitioner_observation` atom exists at the subject.**

**MEMBER AUTHORITY** — the atom lives in `member_memory_atoms`, and
`lib/psyche/portfolio.ts:718-780` gives the member set-aside/archive scoped to this source
type (`:748,777`). ⛔ **No member consent gate on creation was found** — there is no creation
path to gate.

**GOVERNANCE GATE — ⛔ NONE FOUND.** The migration header (`:5-9`) asserts a *"Constitutional
intent"* about the `witnessed` register. Per D-P1-06 and constraint 6 a migration comment is
**implementation evidence, not a ruled source**, and P1-01 located no ruling behind it.

**CURRENT STATUS — `ORPHANED`.** Schema, read guards, loader projection, refusal path and
member-side disposal all exist; the declared producer does not.

### CAP-I-11 · Relationship spaces — the object P1-01 found ungoverned

**PERSISTED** `relationship_spaces` (`invite_token`, `participant_member_id`, `status`,
`consent_status`, `practitioner_display_name`, `practice_display_name`, `relationship_type`,
`created_from`). **CREATED** `app/api/practitioner/practice-field/invite/route.ts:72-100`.
**CONSUMED** `app/api/join/[token]/route.ts:29`; `…/accept/route.ts:26,50`;
`app/api/relationship-spaces/[spaceId]/{consent:27,52 · threshold:25}/route.ts`.
**MEMBER-FACING** `app/api/member/portal/route.ts:19-42`; `app/maia/portal/page.tsx:26,86,142`.
**MAIA-FACING** `app/api/sovereign/app/maia/list/route.ts:800-820`.

**Data flow, as traced:** practitioner creates a space and emails an invite token → member
opens `/join/<token>` → accepts → `consent_status` moves → MAIA's prompt for that member gains
the practitioner's practice-field snapshot, gated on `status='active' AND
consent_status='accepted'` and suppressed in Sanctuary (`maia/list/route.ts:801,806`).

⭐ **Member consent gesture: PRESENT and NAMED** — `relationship_spaces.consent_status`, moved
by the member's accept (`app/api/join/[token]/accept/route.ts:50`;
`app/api/relationship-spaces/[spaceId]/consent/route.ts:52`). ⚠️ Its **schema default was not
read** — no migration matching the grep set defines `relationship_spaces`, and its DDL was not
located at the subject. **UNKNOWN**, not assumed.

**WHAT THE CONSENT AUTHORIZES** — practitioner material flowing **toward** MAIA/member. ⛔ It
authorizes no practitioner read of member material, and none was found on this object.

**GOVERNANCE GATE — ⛔ NONE FOUND, and specifically so.** P1-01 slice 08 §5 D-3 records that
`relationship_spaces` is **excluded** from the Relationship Room Constitution's jurisdiction
by a non-deciding instrument (`…PRE_RATIFICATION_RECONCILIATION_2026-08-10.md:104-105`) and
that **no read document claims it**. The code shows a live, member-consent-bearing object
sitting in that gap.

**CURRENT STATUS — `WIRED-BUT-UNOBSERVED`.**

⭐ One adjacent founder ruling exists: governance containment as an attributed act on the
practitioner's own practice field
(`app/api/practitioner/practice-field/[id]/containment/route.ts:1-20`, citing a founder ruling
of 2026-08-09 requiring an authenticated, attributable actor). **It is the only located
founder ruling binding a practitioner-side surface in this domain, and it governs the
practitioner's own material — ⛔ not practitioner visibility of member material.**

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

Traced in full at **CAP-I-07 (D-1 … D-8)**. Without reading any member-private content, a
practitioner can infer: the **existence** of a member from an id (D-1, D-2); that member's
**real name and username**, with no predicate (D-1); that a member has **shared nothing** —
distinguishable from *"no such member"* (D-2); **counts** of shared threads and active phases,
and per-phase counts (D-3); **ordering** and per-thread dates (D-3, D-5); **withdrawal by
difference** — silent removal from a previously observed list (D-4); **authorship class**,
member-authored vs MAIA-proposed-and-kept (D-5); a **truncated member identifier** echoed into
a shareable URL (D-6).

**Not found:** practitioner-facing notification of member activity — searched
`notify.*practitioner` / `practitioner.*notif`; all hits concern the practitioner's own
schedule/booking/Stripe (`lib/notifications/SessionNotificationService.ts:779-830`;
`lib/stellium/settings.ts:387`). No practitioner-facing latency or presence surface. No reverse
read of `relationship_spaces` consent state (D-7). No practitioner read of program positions
(D-8).

⛔ **Recorded only.** No model designed, no mechanism proposed, no threshold invented, and no
k-anonymity rule imported from `CIRCLE_FIELD_DOCTRINE.md:72-79` (which governs Circle theme
surfacing, not this).

### Q4 · FACILITATOR vs PRACTITIONER in code

**Two unrelated uses of "facilitator", plus one object where both vocabularies sit together.**

1. **Circle role — a real, distinct, enforced role.** `lib/circles/types.ts:5` —
   `export type CircleRole = 'helper' | 'facilitator' | 'member'`. Enforced at
   `lib/circles/removalService.ts:114` (removal requires `role === 'facilitator'`) and
   `lib/circles/inquiryService.ts:30` (admits `helper` or `facilitator`). ⚠️ P1-01 recorded
   that no code path writes `facilitator`; this census located no writer either — the **type
   and the checks** exist. **This role has no connection to `practitioners`:** different
   table, different gate (`requireCircleAccess`), different surface.

2. **`member_memory_atoms.facilitator_id` — the collapse, on one object.**
   `20260624000001_practitioner_observation_provenance.sql:11-14` adds a column named
   **`facilitator_id`** to attribute a `source_type` named **`practitioner_observation`**
   (`:28,45`). The header uses both words in three consecutive lines: *"facilitator-authored
   observations"* (`:2`), *"approved practitioner observations"* (`:5`), *"witnessed directly
   by a facilitator in session"* (`:21`). `lib/psyche/portfolio.ts:385-391` closes it:
   *"canon: facilitator_id is canonical"*. ⭐⭐ **One column, one source type, two role words,
   one actor.**

3. **The Studio field page calls a practitioner gate a facilitator view.**
   `app/studio/fields/[memberId]/page.tsx` — *"Living Field facilitator view"* (`:2`),
   *"Living Field — Facilitator View"* (`:143`), *"Facilitation guidance"* (`:197`), *"This is
   the consented facilitator view"* (`:11`) — while the gate executed is
   `SELECT id FROM practitioners WHERE member_id = $1 AND status = 'active'` (`:104-107`).

**Set aside** (separate referents of an overloaded token; ⛔ no finding attaches):
`CollectiveFieldOrchestrator.ts:39,85,140,597` · `AdvancedConsciousnessDetection.ts:69,105,126`
· `AgentBackchannelingIntegration.ts:99` and `ShadowConversationOrchestrator.ts:582,613`
(`'facilitators_visible'` enum) · `BackchannelingDemonstration.ts:57,611` ·
`master-member-archetype-intelligence.ts:65,213` (`'coach-facilitator'` label).

**ANSWER.** ⭐ **Code draws a real facilitator/practitioner distinction in exactly one place —
the Circle role type — and that place is unrelated to practitioner access. Everywhere the two
words meet a member's material they name the same actor:** one `practitioners` row reached
through one gate, described in facilitator language on the surface and practitioner language
in the schema, attributed by a column called `facilitator_id` to a source type called
`practitioner_observation`. P1-01 recorded whether facilitator and practitioner are the same
authority as **UNLOCATED**; ⛔ the code does not answer it — it **uses both words for one actor
without deciding**, which is a different fact, recorded as such.

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

⭐⭐ **Twelve capabilities, twelve `NONE FOUND`.** Per constraint 6 this is what
**P1-GOV-ACCESS-01** looks like from the implementation side: the absence is weakened by none
of it. The one located founder ruling touching a practitioner surface governs the
practitioner's **own** material, in the opposite direction.

---

## 4 · Contradictions (both sides visible, ⛔ unreconciled)

**C-I-1 · "Deferred, held FALSE, no path" vs. a live path.**
`20260626000001_member_field_note_threads.sql:8,40,96` states the capability is **DEFERRED**
and the column *"held FALSE, no path"*. `app/api/maia/vision-studio/field-note/route.ts:107-130`
binds it to a client-supplied value and `app/studio/fields/[memberId]/page.tsx:69` reads it.

**C-I-2 · "The consented facilitator view" vs. a role-only gate.**
`app/studio/fields/[memberId]/page.tsx:9-11` asserts consent; `:104-107` checks only that the
viewer is *some* active practitioner, and `:79-85` applies no predicate at all to
`members.name` / `members.username`.

**C-I-3 · Two written access models vs. the wired one.** `lib/relationship/scope.ts` and
`lib/coachField/*` encode member/practitioner read scopes, crossing rules and verb limits;
`app/studio/fields/[memberId]/page.tsx` performs a practitioner read of member material and
imports neither.

**C-I-4 · `/caseload` declared with a role; `/api/caseload` matched by nothing.**
`config/accessMatrix.ts:470` declares `{prefix: '/caseload', minTier: 'pro',
rolesAnyOf: ['practitioner']}`; the API family lives at `/api/caseload/*`, which that prefix
does not match and no other rule matches; the unmapped default is permissive (`:727-729`).
⚠️ Production `ACCESS_CONTROL_MODE` is **UNKNOWN**.

**C-I-5 · `/api/supervision` declared free-tier, no role; content is clinical.**
`config/accessMatrix.ts:578` vs. the routes' *"HIPAA compliant"* headers
(`sessions/route.ts:5`; `transcript/list/route.ts:7`) and their absent handler authorization.

**C-I-6 · Facilitator and practitioner: one actor, two vocabularies.**
`member_memory_atoms.facilitator_id` attributing `source_type='practitioner_observation'`
(`20260624000001…:11-14,28,45`; `lib/psyche/portfolio.ts:390`) vs. `CircleRole`, where
`facilitator` is a distinct enforced role unrelated to `practitioners`
(`lib/circles/types.ts:5`; `removalService.ts:114`).

**C-I-7 · `practitioner_id` refers to two different tables.** Recorded by the schema itself:
`20260802000002_practitioner_client_relationship.sql:45-52`, with three competing table
definitions at `:26-39` and the explicit warning that *"the declared shape in this repository
is therefore NOT authoritative."* ⛔ Per the vocabulary rule no finding attaches to the token.

**C-I-8 · The matrix's own DECLARED-vs-ENFORCED divergences.**
`config/accessMatrix.ts:288,299,392-404,531` — four cases the file records itself, one labelled
*"Unreconciled"* in its own note (`:404`).

⛔ All eight are carried forward with both sides visible. **None is reconciled here.**

## 5 · Unlocated governance

- ⛔ **A ruled model of what a practitioner may see of a member.** Re-confirmed at code level:
  no gate, guard, test or config cites one. **P1-GOV-ACCESS-01.**
- ⛔ **"The consent architecture"** — deferred to at
  `NOW_WHAT_NAVIGATION_AND_ARRIVAL_ARCHITECTURE_2026-08-03.md:142`; no code artifact bears the
  name. **UNLOCATED.**
- ⛔ **Supervision-stream governance** — who may start, stream, read or retain a clinical
  transcript, on whose consent. No code gate, no ruled source.
- ⛔ **Governance of `relationship_spaces`** — live, member-consent-bearing, excluded by a
  non-deciding instrument, claimed by nothing.
- ⛔ **Authority to create a practitioner.** `POST /api/practitioners/create` has no gate and
  no located ruling.
- ⛔ **Whether facilitator and practitioner are one authority.** Unlocated in documents,
  undecided in code (Q4).
- ⛔ **Derived / inferred visibility** — no rule on counts, ordering, timestamps, presence,
  existence oracles or withdrawal-by-difference. **Recorded only (F9 / D-P1-08).**
- ⛔ **A member-facing statement of what their practitioner can see.** The member sees their own
  per-item sharing state (`app/api/now-what/home/route.ts:95` `sharedWithCoach`;
  `WithdrawVisibility` at `app/now-what/field/page.tsx:142` and
  `app/now-what/questions/page.tsx:136`) — ⛔ but no statement of **who** their practitioner is
  or **what else** that person can see. **UNLOCATED.**
- ⚠️ `docs/architecture/CAPABILITY_ACCESS_MODEL_PROPOSAL.md` — named unread by P1-01, and not
  read here either (this is a code census). **UNKNOWN.**

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

1. **Q1 row 1 is the domain's sharpest fact.** `/studio/fields/<memberId>` applies a **role**
   check where the surface's own language implies a **relationship**. ⛔ This census records
   only that P1-01 located nothing for it to be a defect *against*.
   **`REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED`.**
2. **Two complete access models exist in code and neither is wired.** Discarded design,
   unratified candidate, or the intended model of a surface built past it? The tree cannot say.
   **`REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED`.**
3. **`bringForward()` — the only member gesture in the coach-field model — has no surface.**
   Whether it was intended to reach members is **UNKNOWN**.
4. **Handler-level authorization is absent on three route families** (supervision, caseload,
   `practitioners/create`) whose matrix rules do not supply it either.
   **`REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED`.**
5. **`ACCESS_CONTROL_MODE` in production** — needs a runtime witness this container cannot
   produce; its value decides whether `/api/caseload/*` is reachable unauthenticated.
6. **Is `facilitator` one role or two?** Q4 shows one actor and two vocabularies on one column.
   P1-04 may need this settled before the visibility question can even be stated precisely.
7. **Who may become a practitioner?** CAP-I-04 is upstream of CAP-I-01's only check.
8. **`relationship_spaces` sits in a documented governance gap** — live, member-consent-bearing,
   claimed by no ruled source.
9. **`practitioner_observation` atoms: schema and readers without a writer.** Removed, never
   built, or outside this tree — **UNKNOWN** (**E-1**: no history claim made).
10. **Derived visibility (D-1…D-8) is recorded and ungoverned.** ⛔ Per D-P1-08 and F9 this
    census opens nothing and proposes nothing; P1-04 inherits the list intact.

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
