# EAA-03 / P1-B — HOME ARRIVAL REPOSITORY TRUTH CENSUS

**Date:** 2026-09-17
**Lane:** EAA-03 — Prototype Pair + Living Field Return Contract
**Pass:** P1-B — repository truth only
**Branch:** `claude/magical-archimedes-dcsry5`
**Repository HEAD at census:** `8b80ec21`
**Status:** CENSUS COMPLETE · ⛔ NOTHING IMPLEMENTED · RETURNED FOR P1-C ADJUDICATION

**Containment:** no source edited · no route created · no component created · no CSS ·
no schema · no migration · no feature flag · no prompt · no data access altered ·
no cleanup performed. This record is the only file written.

**Evidence classes:** VERIFIED · LIKELY · UNKNOWN · RISK · BLOCKER.
Nothing is asserted from plausibility. Where repository evidence does not settle a
question it is marked UNKNOWN rather than inferred.

---

## 1. Executive finding

**The Home arrival prototype is far less greenfield than EAA-03 assumes, and the
Living Field is far more authored-by-system than EAA-03 assumes. Both corrections
point the same direction: P1 should be built on the Keeps/atoms substrate and must
not render Living Field affinities.**

Five findings dominate.

**F1 — The arrival constitution already exists and already satisfies EAA-03's
governing distinction. VERIFIED.** `lib/maia/arrivalState.ts` separates a durable
first-crossing marker from a session-temporary invocation, and its header states:
*"No inference lives here. Both inputs are member acts... Nothing reads readiness,
mood, or absence."* EAA-03 §II is not a new law for Home; it is the law Home's
arrival module was already written to. P1 inherits this rather than inventing it.

**F2 — A structurally identical prototype seam already shipped and is the
repository-supported answer to §L. VERIFIED.** `/maia/prototype`
(`app/maia/prototype/page.tsx` → `components/maia/prototype/ArrivalPrototypeShell.tsx`)
is a dev-only surface that composes *real* MAIA components **inert**, with
*"NO persistence, NO default-state inference"*, gated by a default-OFF flag plus a
role check, and excluded from the iOS export. P1-B did not have to invent a seam;
it had to find this one.

**F3 — The record EAA-03 §C asks for exists, and it is `kept_at`. VERIFIED —
the answer is FOUND, not NONE FOUND.** `member_memory_atoms.kept_at` is documented
in `database/migrations/20260521000001_member_memory_atoms.sql:100-102` as
*"The formation moment: when the member CHOSE to keep this. Distinct from created_at
(row creation) and from the source's creation time."* That is precisely *"the member
deliberately chose for this to remain meaningful."* Alongside it, `return_preference`
is already a member-consent vocabulary and `crossing_allowed` is a schema-level
crossing prohibition (`CONSTRAINT crossing_must_be_false`). **The Return Contract
has a partial precursor in production schema.**

**F4 — Living Field affinities are system-authored destination assignments carrying
a score, with no proposal status and no revision history. RISK — and a BLOCKER for
any P1 that renders them.** `living_field_affinities.created_by` defaults to
`'system'` and **has zero non-system writers anywhere in the repository (VERIFIED by
search)**. The member never chooses the destination; `lib/maia/living-field/affinityMapper.ts`
does, via fixed score tables. Writes are `ON CONFLICT DO UPDATE` (`indexAtom.ts:62-67`),
so a re-index **overwrites** the prior affinity with no supersession record. Against
EAA-03 §XI ("MAIA proposal can never silently become member truth"), §XX.E
(revisability) and §XX.F (member chooses scope), this substrate is non-conforming
today.

*Precision that must not be lost:* the mapper is **not content inference**. Its header
states *"Pure function — no DB, no Claude, no inference... No content analysis. No NLP.
Only what the member explicitly set."* It is a deterministic projection of
member-set metadata. The defect is **unrequested destination authority and an
affinity score presented as membership**, not covert psychological profiling. The
distinction matters for P1-C: this is repairable by adding standing, not by removal.

**F5 — Two distinct context-boundary gaps, one latent and one live. RISK.** The
Living Field write path and its gathering read path carry **no `memory_scope` filter**,
while the personal MAIA loader (`lib/maia/memoryAtomsLoader.ts:248`) enforces one
strictly. Today this is **latent**, because no code path creates a non-personal atom.
Separately and **live**: practitioner-authored observations are written into the
member's own pool and the gathering route presents them under the label
*"Keeps you have held."* Detail in §10.

**Consequence for P1-C.** A Home arrival built on Keeps (`kept_at`), member-named
Changes, and Relationships needs **no new schema and no synthesis** — it is retrieval
of member acts. A Home arrival that renders Living Field gathering inherits an
unresolved authority defect. That is the decision P1-C should make first.

---

## 2. Current Home / House runtime path

### 2.1 Authenticated landing — VERIFIED

| Item | Finding |
|---|---|
| Route | `/maia` — `app/maia/page.tsx` (**2,166 lines**) |
| Boundary | `'use client'` at line 1 — the entire Home is a client component |
| Layout | No `app/maia/layout.tsx` (VERIFIED absent) |
| Shell | `components/maia/MaiaShell.tsx` (406 lines) |
| Centre | `components/maia/MaiaCenterField.tsx` (165 lines) |
| Conversation | `components/OracleConversation.tsx` (**11,210 lines**) |
| Arrival logic | `lib/maia/arrivalState.ts` |
| Session/roles | `lib/hooks/useSession.ts` → `GET /api/members/session` (server-sourced roles) |
| Identity for greeting | `resolveDisplayName()` (`lib/services/greetingService`), `generateWelcomeGreeting()` (`lib/maia/welcomeGreeting`) |

**Accidental-blast-radius warning — RISK.** `app/maia/page.tsx` imports at least 25
feature surfaces (Journal sheet, Shadow sheet, Academy, Feedback, Changes sheet,
subscription hooks, consciousness-computing session processor). Editing `page.tsx`,
`MaiaShell`, `MaiaCenterField` or `OracleConversation` to serve P1 would reach far
beyond Home. **P1 must not modify any of these four files.**

### 2.2 House navigation — VERIFIED

`lib/navigation/houseDestinations.ts` is the single authoritative navigation policy.
Its header records the defect class it closed: the House rendered from one list, the
WebView allowlisted from a second, and the iOS bundle stripped from a third, so a tap
could be *"advertised, allowed in-app, and yet absent from the bundle — a silent white
screen."* Drift is test-enforced (`__tests__/houseNavDrift.test.ts`).

**Implication for P1:** any new route is governed by this registry plus
`scripts/capacitor-patch-routes.sh`. A prototype route that is web-only must be
declared so, or it risks the exact white-screen class this registry exists to prevent.

### 2.3 Return to Arrival — VERIFIED

Two distinct mechanisms, not to be conflated:

- **Return to MAIA** — `lib/navigation/houseReturn.ts`, `MAIA_HOME`, `RETURN_LABEL = 'MAIA'`,
  affordance `components/navigation/ReturnToMaia.tsx`, guarded by
  `lib/navigation/__tests__/houseReturn.test.ts`. Its header records that
  `returnBehavior: 'back-to-maia'` *"was read by NOTHING"* for a period — *"a declaration
  is not a behaviour."*
- **Return to Arrival** — `MaiaShell.tsx:52`, a member-invoked reopening of the Arrival
  room. Ruling quoted in `arrivalState.ts`: *"Returning to Arrival is opening a room,
  not undoing an initiation."*

**P1 has an existing navigation escape and must reuse it rather than author one.**

### 2.4 Authorization posture — LIKELY (one runtime fact unwitnessed)

`/maia` is reached post-onboarding; identity for API reads is established by
`probeAuthPosture(request)` (`lib/auth/authPostureProbe`) on the Living Field routes
inspected. Whether `/maia` itself is server-side gated, or relies on client redirect
plus per-API authorization, was **not** established from repository truth in this pass
— the page is a client component with no server guard in its own file. **UNKNOWN.**
P1-C should settle this before any P1 surface reads member data.

---

## 3. Living Field authority map

### 3.1 Objects — VERIFIED

| Object | Migration / module | Nature |
|---|---|---|
| `personal_living_fields` | `20260701000002_personal_living_fields.sql` | Member-authored field expression |
| `personal_living_field_sources` | same | Member-gathered sources (`source_type`, `source_id`, `source_excerpt`) |
| `living_field_affinities` | `20260702000001_living_field_affinities.sql` | **System-derived** atom→dimension mapping |
| `living_field_participant_consents` | (read via consent route) | Member-granted participant access |
| `circle_living_fields` | `20260402100001_circle_living_fields.sql` | Circle-scoped — **not personal** |
| Canonical dimensions | `lib/maia/living-field/canonicalFieldKeys.ts` | 13 fixed keys |

Routes: `app/api/maia/living-field/route.ts` · `[fieldKey]/route.ts` ·
`[fieldKey]/gathering/route.ts` · `[fieldKey]/sources/route.ts` · `[fieldKey]/consent/route.ts`.
UI: `app/maia/living-field/page.tsx`, `components/maia/living-field/*`.

The 13 canonical keys **already include `relationships`** — EAA-03's §VII facet list and
this list are near-identical in intent. P1 does not need a new facet vocabulary.

### 3.2 What causes something to appear — the categories, kept separate

**(a) Direct member-created — VERIFIED.** `personal_living_fields.current_expression`
and field revisions (`expression`, `change_note`, `authored_by` —
`[fieldKey]/route.ts:48`). Member-authored, carries an author column.
**Safe for Home.**

**(b) Member-gathered sources — VERIFIED.** `personal_living_field_sources`, surfaced
at `[fieldKey]/route.ts:57`. Member act. **Safe for Home.**

**(c) System-derived affinity — VERIFIED, and this is the contested class.**
`living_field_affinities`, written by `lib/maia/living-field/indexAtom.ts`.
- Trigger: exactly **one** runtime call site —
  `lib/psyche/portfolio.ts:505`, fire-and-forget, `if (wasCreated)` only.
- Plus **one offline** call site — `scripts/backfill-living-field-affinities.ts:26`.
- Destination + score chosen by `affinityMapper.ts` (`REGISTER_MAP`, `LENS_DELTA_MAP`,
  `SOURCE_TYPE_MAP`).
- `evidence_reason` records a **derivation rule** (e.g. `"register:developmental"`),
  **not** one of EAA-03 §XX.C's member crossing reasons.
- `created_by TEXT NOT NULL DEFAULT 'system'` — **zero non-system writers (VERIFIED
  by repository-wide search).** The column anticipates a distinction never constituted.
- Upsert is `ON CONFLICT (atom_id, field_key) DO UPDATE` — **overwrites**. No
  `revised_at`, no `supersedes`, no `revoked`. **Against §XX.E. RISK.**

**(d) Inferred material — NONE FOUND (VERIFIED, and this is a genuine strength).**
`affinityMapper.ts` header: *"Pure function — no DB, no Claude, no inference... No
content analysis. No NLP. Only what the member explicitly set."* No model, no
embedding, no emotional/psychological inference participates in Living Field
membership. EAA-03 §XXVIII's "hidden emotional inference" STOP condition is **not**
tripped by this substrate.

**(e) Activity-derived — NONE FOUND for Living Field. VERIFIED.**

**(f) Cached / precomputed — VERIFIED, YES.** `living_field_affinities` *is* a
precomputed index; `gathered_count` is read from it. A stale or backfill-era row
persists until overwritten and has no revocation path.

### 3.3 Constitutional guards actually enforced — VERIFIED

Applied at **both** write (`indexAtom.ts:41-44`) and read (`gathering/route.ts:48-51`,
described in-file as *"defence in depth"*):
`status NOT IN ('protected','archived')` · `primary_register IS DISTINCT FROM 'sacred_protected'` ·
`NOT ('sacred_protected' = ANY(registers))`.

**Guard that is absent from both:** `memory_scope`. See §10.

### 3.4 Selection warrant — VERIFIED, and better than expected

`gathering/route.ts` exposes `evidence_reason`, `affinity_score`, and a
**denominator** ("N of M"), with the in-file law: *"A gathering may never hide its
denominator."* Referenced canon: `docs/canon/ECOLOGY_OF_MIRRORS.md`.

This is real inspectability and partially answers EAA-03 §P7 ("Why is this showing up
here?"). **What it does not carry is standing**: it explains the derivation rule, not
a member act of adoption.

---

## 4. Candidate continuity sources

| Source | Table / module | Member authored | Explicitly member marked | MAIA generated | Context-bound | Provenance now | Safe for Home w/o reinterpretation | Useful timestamp | Wrong-context risk |
|---|---|---|---|---|---|---|---|---|---|
| **Keeps** | `member_memory_atoms` | Yes (member-gesture path) | **Yes — `kept_at`, `status`, `is_breakthrough`** | Mixed (see §5) | Yes — `memory_scope` | Strong: `source_type`, `source_id`, `facilitator_id`, `provenance` JSONB, `generated_by`, `posture_at_creation` | **Yes**, if practitioner-authored atoms are distinguished | `kept_at`, `last_touched_at` | Low today (all personal); see §10 |
| **Changes** | `studio_changes` | Yes — `NameYourChange.tsx` | Yes (naming is the act) | Optional enrichment only | Yes — `member_id` / `practitioner_id` / `client_id` / `team_id` | `title`, `description`, `status`, timestamps | **Yes — retrieval only, no synthesis** | `created_at`, `status` | **Low** — member route filters `WHERE c.member_id = $1` (`app/api/changes/route.ts:61`) |
| **Relationships** | `app/relationships` + `app/api/relationships` | Yes | Yes (member creates the relationship) | Patterns marked as noticing | Yes — shared spaces separate | Present | **Yes** — route in, do not re-render | entries/checkin timestamps | Medium — shared spaces (§10.3) |
| **Living Field affinities** | `living_field_affinities` | **No** | **No** | Derived (deterministic) | **No scope filter** | `evidence_reason` = derivation rule | **NO — see F4** | `kept_at` via join | See §10.1 |
| **Living Field expressions** | `personal_living_fields` | Yes | Yes | No | Member-owned | `authored_by` on revisions | Yes | `updated_at` | Low |
| Journal | (not traced this pass) | — | — | — | — | — | — | — | **UNKNOWN** |
| Ideas / Reflections / Practices | routes exist under `app/maia/*` | — | — | — | — | — | — | — | **UNKNOWN** |

**Answer to §C's decisive question:** the equivalent of *"the member deliberately chose
for this to remain meaningful"* — **FOUND**, in three places of differing strength:
1. `member_memory_atoms.kept_at` (strongest — explicitly documented as the choosing moment)
2. `member_memory_atoms.is_breakthrough` (`20260524000002`) — member-marked significance
3. `studio_changes.title` authored through `NameYourChange.tsx` — naming as the act

Journal, Ideas, Reflections and Practices were **not traced** in this pass and are
marked **UNKNOWN** rather than assumed. If P1-C wants them, they need their own pass.

---

## 5. Keeps census

**Canonical source of truth — VERIFIED:** `member_memory_atoms`
(`database/migrations/20260521000001_member_memory_atoms.sql`), accessed through
`lib/psyche/portfolio.ts`.

**Creation paths — VERIFIED, exactly two writers:**
1. `lib/psyche/portfolio.ts:460` — member gesture. Sets
   `posture_at_creation='normal'`, `generated_by='member-gesture'`. Fires
   `indexAtomAffinities` **only on creation** (`if (wasCreated)`).
2. `app/api/studio/with-me/sessions/[sessionId]/route.ts:137` — **practitioner**
   observation. `member_id = session.member_id` (the member),
   `source_type='practitioner_observation'`, `facilitator_id = practitioner`,
   `primary_register='witnessed'`, `return_preference='contextual_doorway'`,
   `generated_by='practitioner-observation'`, `crossing_allowed=false`,
   structured `provenance` JSONB. **Does not call `indexAtomAffinities`.**

**What the member gesture means today — VERIFIED.** `kept_at` is the choosing moment,
deliberately distinct from row creation and source creation. `status` vocabulary
includes `set_aside` (parked), `protected` (held without circulation, voice-ineligible),
`archived` (removed from recall, still preserved) — i.e. **withdrawal already exists
without destruction**, which is EAA-03 §XX.E's requirement in partial form.

**Consent model — VERIFIED.** `return_preference ∈ {member_pulled, contextual_doorway,
ritual_review_opt_in}`; default flipped to `contextual_doorway` by
`20260523000001_atoms_return_preference_default_contextual_doorway.sql`. Doorway
accounting exists: `last_surfaced_at`, `surface_count`.

**Crossing prohibition — VERIFIED and load-bearing.** `crossing_allowed BOOLEAN NOT NULL
DEFAULT FALSE` with `CONSTRAINT crossing_must_be_false CHECK (crossing_allowed = FALSE)`.
In-file comment: *"Material in one layer cannot be crossed with material in another to
form higher-order claims without explicit member ratification. Lifting this requires
explicit schema migration — friction by design."*

**This is the nearest existing ancestor of the EAA-03 Return Contract, and it is
already in production schema.** P1-C should treat the Return Contract as an
*extension of this precedent*, not a new invention.

**Verdict:** Keeps can serve as an early continuity source for P1 **without
reinterpretation**, on two conditions:
(a) practitioner-authored atoms are either excluded or visibly attributed (§10.2);
(b) `return_preference` is honoured — a `member_pulled` atom must not be pushed onto
Home, since Home surfacing is precisely a doorway offer.

---

## 6. Changes census

- **Route:** `app/api/changes/route.ts`, `[id]/route.ts`, plus `cast` · `consult` ·
  `experiences` · `interpret`. Studio equivalent: `app/api/studio/changes/*`.
- **UI:** `components/maia/changes/` — `ChangesSheet.tsx`, `NameYourChange.tsx`,
  `ChangeJourney.tsx`, `ChangeListView.tsx`, `MemberHexagramCaster.tsx`. Opened from
  Home as a **sheet** (`HouseSheetId = 'changes'`, `houseDestinations.ts`).
- **Schema:** `database/migrations/20260212000001_studio_changes.sql`. Ownership is
  *practitioner OR member*; carries `client_id`, `team_id`. `title` and `description`
  are `NOT NULL`. `change_type ∈ {dissolution, emergence, threshold, integration,
  upheaval, ripening}`. Optional `hexagram_*` casting, `council_result` JSONB,
  `hexagram_interpretation` JSONB. Supports `parent_change_id` / `root_change_id`
  chaining.
- **Header law (VERIFIED):** *"The chain belongs to the person. MAIA enriches when
  invited."*
- **Member naming — VERIFIED.** `NameYourChange.tsx` exists as a dedicated surface;
  `POST` inserts `(id, member_id, title, description, change_type, urgency,
  emotional_state, parent_change_id, root_change_id, status)` (`route.ts:162`).
- **System-generated Changes — NONE FOUND in the member route. VERIFIED.**
  `council_result` / `hexagram_interpretation` are MAIA enrichment *attached to* a
  member-named Change, never the Change itself.
- **Relationship to Living Field:** none direct. `change` appears in
  `SOURCE_TYPE_MAP` (`thresholds_transitions: 0.6, who_i_am_becoming: 0.5`) — i.e. a
  *Keep* of source_type `change` maps onto field dimensions, which is a different
  object from a `studio_changes` row. **Do not conflate these two.**

**Verdict — VERIFIED:** showing a member-named active Change on Home requires
**retrieval only, no synthesis**. The member route already scopes correctly by
`member_id` and does not expose practitioner/client rows. This is the **safest**
continuity thread in the census.

---

## 7. Relationships seam

- **Routes:** `app/relationships/page.tsx` · `app/relationships/[id]/page.tsx` ·
  `app/relationship/[spaceId]/threshold/page.tsx` (shared space — distinct tree).
- **API:** `app/api/relationships/route.ts` · `[id]/route.ts` · `[id]/checkin/route.ts` ·
  `[id]/entries/route.ts`.
- **Components:** `components/relationships/RelationshipCard.tsx`, `RelationshipModeNav.tsx`,
  `RelationshipTimeline`. Service: `lib/consciousness/relationalCheckin.ts`,
  `lib/relationships/relationshipContextService.ts`.

**Prior lane already shipped an attentional architecture — VERIFIED via
`app/relationships/__tests__/relationshipsUxArchitecture.test.ts` (`RELATIONSHIPS-UX-01`).**
Enforced by test:
- Opens with *"Who is present for you?"* and *"You do not need to know what it means yet."*
- Card **must not** contain `FieldToneIndicator`, `checked in`, `activeSignals.slice`
  — analytics are affirmatively excluded.
- Three modes: **Now** (*"What is alive between you now?"*) · **Story**
  (*"How did you get here?"*) · **Field** (*"What seems to happen between you?"*).
- Field carries: *"Patterns here are working perceptions, not verdicts."* and
  *"Something MAIA is noticing"*.

**This materially revises EAA-03 Prototype B.** The charter's §XVI five invitations
(Water/Fire/Earth/Air/Aether) land on an existing, test-locked **triad**. Approximate
correspondence, offered as observation not ruling:

| EAA-03 invitation | Existing mode |
|---|---|
| Water — *what's happening between you* | **Now** |
| Earth — *what actually happened* | **Story** (partial) |
| Air — *what are you trying to understand* | **Field** (partial) |
| Aether — *the whole* | **Field** (partial) |
| **Fire — *what could become possible*** | **NO EXISTING MODE — VERIFIED GAP** |

**Fire has no home in the shipped Relationships architecture.** That is the single
most concrete reconciliation item EAA-03 §XVI creates.

**Also notable:** *"Patterns here are working perceptions, not verdicts"* and
*"Something MAIA is noticing"* are EAA-03 §XI's proposal-status discipline **already
implemented at the language level** — and implemented in Relationships but *not* in
Living Field gathering. The precedent for the fix exists in-repo.

**Home → Relationships routing — VERIFIED SAFE.** Home can select a relationship and
route to `/relationships/[id]`. That changes no data authority: Home passes an id;
the existing page remains the sole reader. **No repair performed, none proposed here.**

---

## 8. Recent / continue mechanisms

**No dedicated Home "recents", "continue", "resume", "pinned" or "favorited" store was
identified. VERIFIED absent for Home; UNKNOWN across the wider app** (the broad grep
matched unrelated modules — `lib/patterns/generatePatternIntelligence.ts`,
`lib/consciousness/*`, `lib/vectors/soulIndex.ts` — none of which is a Home navigation
store, and none of which was traced further in this pass).

What exists instead are **timestamps and member-act columns**:

| Column | Object | Class |
|---|---|---|
| `kept_at` | atoms | **Claimed personal significance** — the member chose |
| `is_breakthrough` | atoms | **Claimed personal significance** — member-marked |
| `status` (`active`/`set_aside`/`protected`/`archived`) | atoms | Member disposition |
| `return_preference` | atoms | Member consent to return |
| `last_touched_at` | atoms | **Navigation convenience** — last interaction |
| `last_surfaced_at`, `surface_count` | atoms | System doorway accounting |
| `updated_at` | fields / changes | **Navigation convenience** |
| `affinity_score` | affinities | **System-assigned degree** — neither of the two |

**The load-bearing distinction, stated as §G requires it:** `kept_at`, `is_breakthrough`
and a member-named Change title are **claimed personal significance** and may be
presented as such. `last_touched_at`, `updated_at` and `affinity_score` are **not**, and
must never be rendered as "what matters in your life." `affinity_score` is the
dangerous one, because it *looks* like significance and is in fact a derivation weight.

**RISK:** `gathered_count` on the Living Field list route is an `affinity_score`-derived
population count. Surfacing it on Home would present system-derived gathering as
member-grounded continuity.

---

## 9. Provenance inventory

### Mechanically available today — VERIFIED

**On `member_memory_atoms`:**
`source_type` · `source_id` · `facilitator_id` · `provenance` JSONB
(`{session_id, practitioner_id, candidate_id, candidate_index, written_at}`,
GIN-indexed, `20260624000002_with_me_atom_provenance.sql`) · `generated_by`
(`'member-gesture'` | `'practitioner-observation'`) · `posture_at_creation` ·
`epistemological_status` (e.g. `'observed'`) · `primary_register` / `registers` ·
`elemental_lenses` · `memory_scope` + `team_id` / `client_id` / `encounter_id` ·
`kept_at` · `last_touched_at` · `created_at` / `updated_at` · `status` ·
`return_preference` · `last_surfaced_at` / `surface_count` · `is_breakthrough` ·
`crossing_allowed`.

**On `living_field_affinities`:** `evidence_reason` (derivation rule) ·
`affinity_score` · `created_by` (always `'system'`) · `created_at` · `atom_id`.

**On `personal_living_fields` revisions:** `authored_by` · `change_note` · `created_at`.

**On `studio_changes`:** `member_id` / `practitioner_id` / `client_id` / `team_id` ·
`title` · `description` · `status` · `parent_change_id` / `root_change_id` · timestamps.

### Would have to be invented — VERIFIED ABSENT

- **A crossing reason.** Nothing records `member_authored` / `member_marked` /
  `member_adopted` / `member_enacted` / `explicit_context_crossing`. `evidence_reason`
  is a derivation rule; `generated_by` is a writer identity. **Neither is standing.**
- **Supersession / revision on adopted meaning.** No `supersedes`, `revised_at`,
  `revoked_at` on affinities. Atom `status` gives withdrawal-without-destruction, but
  only for the atom, not for an adopted *meaning*.
- **Separation of source material from adopted meaning** (EAA-03 §XXI's central
  architectural distinction). Today an atom is both the material and its placement.
- **Member-chosen destination scope.** `memory_scope` is a *containment* scope, not a
  member-chosen Living Field destination. §XX.F is unimplemented.
- **Proposal status on a surfaced item.** No column marks a row as "MAIA proposal,
  not yet given standing." Relationships does this in *copy*; Living Field does not do
  it at all.

**No schema is authorized by this census. This inventory is the input to P1-C.**

---

## 10. Context-boundary risks

### 10.1 Living Field carries no `memory_scope` filter — RISK (latent today)

**VERIFIED.** `memory_scope` (`20260630000005_memory_atoms_scope.sql`) defines a strict
containment hierarchy — `personal` · `colab` · `client` · `encounter` — with the stated
principle *"memory continuity must never become memory leakage."*

`lib/maia/memoryAtomsLoader.ts` enforces it (`:248` — `scopeClauses` begins
`memory_scope = 'personal'`; `:95` — *"No context / personal: only memory_scope =
'personal' atoms surface"*).

**Living Field does not, at any point:**
- `lib/maia/living-field/indexAtom.ts` — no `memory_scope` in the SELECT or the guards (VERIFIED)
- `scripts/backfill-living-field-affinities.ts:14-20` — selects **all** atoms,
  scope-blind (VERIFIED)
- `app/api/maia/living-field/route.ts:53-58` (`gathered_count`) and `:66-73`
  (denominator) — `member_id` only (VERIFIED)
- `app/api/maia/living-field/[fieldKey]/gathering/route.ts:38-55` — `lfa.member_id`,
  status and sacred guards only (VERIFIED)

**Why this is LATENT and not live: VERIFIED.** A repository-wide search for writers
setting `memory_scope` to `'colab'`, `'client'` or `'encounter'` returned **nothing**.
Both atom insert sites leave the column at its `'personal'` default. So no
out-of-scope row exists to leak **today**.

**It becomes live the moment any scoped-atom writer ships** — at which point a
client- or Co-Lab-scoped atom would be indexed into, and surfaced from, a **personal**
Home surface. ⛔ Not repaired here.

### 10.2 Practitioner-authored material is presented as member Keeps — RISK (live)

**VERIFIED.** The `with-me` route writes `practitioner_observation` atoms with
`member_id` = the member and `memory_scope` at its `'personal'` default. Via
`REGISTER_MAP`, `witnessed → { current_life_phase: 0.5 }`, so such an atom is
affinity-eligible. The gathering route returns `a.title`, `a.source_type`,
`a.primary_register` and describes the result as
*"Keeps you have held, matched to this dimension..."*

**It selects no `facilitator_id` and displays no attribution.** Other loaders guard
exactly this: `lib/workbench/sources/keep.ts:86` carries
`AND NOT (source_type = 'practitioner_observation' AND facilitator_id IS NULL)`, and
`lib/maia/__tests__/memoryAtomsLoader.attribution.test.ts` records that *"9/10
practitioner_observation atoms"* had an attribution problem the loader was repaired to
guard. **The Living Field gathering path carries no equivalent guard.**

Against EAA-03 §XX.B (authority) and §XXII (Home may show *"You wrote…"* / *"You kept…"*),
presenting practitioner-authored observation under a member-authorship label is a
representation defect.

**Bounded honestly:** the `with-me` route does **not** call `indexAtomAffinities`, so
these atoms enter the affinity index **only** if the backfill script has been run.
**Whether `scripts/backfill-living-field-affinities.ts` has ever been executed against
production is UNKNOWN** — it is not established by repository truth, and no production
read was performed in this pass. **P1-C should treat this as the first question to
settle before any Living Field material appears on Home.**

### 10.3 Cross-context reachability from personal Home — mixed

| Context | Reachable from personal Home today? | Class |
|---|---|---|
| Studio / practitioner Changes | **No** — `app/api/changes/route.ts:61` filters `WHERE c.member_id = $1` | VERIFIED SAFE |
| Practitioner observations | **Yes, as personal atoms** | RISK — §10.2 |
| Client records | No writer creates `client`-scoped atoms today | LATENT — §10.1 |
| Co-Lab / Circles | `circle_living_fields` is a separate table; Circle API is founder-only (`lib/circles/circleAccess.ts`) | VERIFIED SAFE today |
| Writer's Studio | Not traced this pass | **UNKNOWN** |
| Shared relationship spaces | `app/relationship/[spaceId]` is a distinct tree from `app/relationships` | LIKELY separate — boundary not traced |
| Now What? / Worldcraft | `components/now-what/ClientHome.tsx` exists | **UNKNOWN** |
| Field Lab / Shadow | `lib/access/labAccess.ts` gates lab | LIKELY gated |

**Generic-retrieval verdict:** the one live generic-retrieval path that can cross an
authorship boundary is the Living Field gathering join (§10.2). Everything else
inspected filters by `member_id` and, where it matters, by scope.

---

## 11. Visual primitive inventory

| Primitive | Path | Verdict | Reason |
|---|---|---|---|
| Centre field / atmosphere | `components/maia/MaiaCenterField.tsx` | **REUSE** | Purpose-built living centre; already reduced-motion aware; takes `children`, `page.tsx` retains ownership |
| Reduced-motion helper | `MaiaCenterField.tsx` `usePrefersReducedMotion()` | **REUSE** | Exactly §P1's accessibility requirement |
| Motion tokens | `components/journal/room/tokens.ts`, `lib/motion/mobile-optimizations.ts` | **POSSIBLE** | Not inspected in depth this pass |
| Holoflower (idle) | `components/liquid/RhythmHoloflower` | **REUSE** | The prototype precedent already feeds it idle/static props with no mic, no voice engagement |
| Text composer | `components/ui/ModernTextInput.tsx` | **REUSE — inert** | `onSubmit`, `placeholder`, `disabled`; prototype precedent renders it inert. ⚠️ It has its own `showVoiceInputButton` / `enableVoiceInput` — must be left off (§12) |
| Greeting | `generateWelcomeGreeting()`, `resolveDisplayName()` | **REUSE** | Real member-grounded name; serves "Here you are" |
| Arrival state | `lib/maia/arrivalState.ts` | **REUSE** | Member-act only, no inference |
| House sheet / drawer | `components/maia/MaiaHouseSheet.tsx`, `MaiaShell.tsx` | **POSSIBLE** | Provides navigation escape, but `MaiaShell` is load-bearing for `/maia` — mount, never modify |
| Return affordance | `components/navigation/ReturnToMaia.tsx` | **REUSE** | The single sanctioned way back |
| Torus / mandala family | `ConsciousnessFieldWithTorus.tsx`, `TorusBackgroundMap.tsx`, `LivingMandala.tsx`, `SacredHoloflower.tsx`, `AdvancedHoloflower.tsx` | **AVOID** | Carry prior information architecture and consciousness-map semantics; importing them would import an old IA into a surface whose whole point is not having one |
| Mic torus indicators | `components/voice/MicTorusIndicator.tsx`, `MicInputWithTorus.tsx` | **AVOID** | Voice authority — §12 |
| `OracleConversation` | `components/OracleConversation.tsx` | **AVOID** | 11,210 lines; owns live conversation, voice and persistence |

**Nothing was redesigned. No component was opened for edit.**

---

## 12. Voice reuse finding

**Verdict: DEFER FROM P1. VERIFIED.**

- The Home-accessible voice authority is `components/OracleConversation.tsx`
  (**11,210 lines**), mounted by `app/maia/page.tsx` and wrapped by
  `VoiceStateProvider` (`lib/maia/voiceStateContext`). `MaiaCenterField` *reads*
  voice state (`useVoiceState`) to drive atmosphere but does not own it.
- Standalone candidates exist — `components/voice/HybridVoiceInput.tsx`,
  `components/ui/EnhancedVoiceMicButton.tsx`, `AdaptiveVoiceMicButton.tsx` — and
  `ModernTextInput` has a built-in mic path (`showVoiceInputButton`,
  `enableVoiceInput`, `isRecording`, `:258`, `:459-485`).
- **None was established as safely mountable without creating a second voice
  authority.** Their page/session lifecycle assumptions were not traced, and the
  repository is under active sovereign-voice work
  (`__tests__/voice-non-degradation.test.ts` is a hard gate; CLAUDE.md records a
  2026-09-07 voice-transcript defect and a 2026-09-17 Safari handoff fix).

**Reuse is therefore not *clearly* safe → DEFER.** The precedent agrees: the existing
prototype shell renders the composer **INERT**, explicitly *"no live
conversation/mic/streaming controller."* P1 should do the same and set
`showVoiceInputButton={false}` / `enableVoiceInput={false}` explicitly rather than
relying on defaults.

**No voice change is authorized, and none is proposed.**

---

## 13. Smallest candidate prototype seam

**The repository-supported candidate is the pattern already proven at `/maia/prototype`**
— not the pipeline sketched in the charter, which assumed a new adapter layer.

```text
existing authenticated /maia surface                    [UNTOUCHED]
        │
        ├─ existing flag + role gate  (default OFF)
        ↓
  bounded Home Next page  (client component, own route)
        ↓
  inert composition of EXISTING primitives
    MaiaCenterField · RhythmHoloflower(idle) · ModernTextInput(inert)
    generateWelcomeGreeting() · ReturnToMaia
        ↓
  read-only continuity reads — member-act columns ONLY
    atoms WHERE member_id AND status='active'
          AND memory_scope='personal'
          AND return_preference <> 'member_pulled'
          AND source_type <> 'practitioner_observation'   ← §10.2
      ORDER BY kept_at DESC   LIMIT 3
    + studio_changes WHERE member_id AND status active
        ↓
  existing routes, tables and components unchanged
```

**Candidate specifics:**

| Element | Repository-supported answer |
|---|---|
| Candidate route | A sibling of `app/maia/prototype/page.tsx`. **Name not chosen here** — naming is a P1-C act |
| Component boundary | New directory alongside `components/maia/prototype/`; imports existing components, edits none |
| Gating | `useFeatureFlags()` + role, per `app/maia/prototype/page.tsx:30` — **default OFF** |
| Navigation escape | `ReturnToMaia` / `MAIA_HOME` from `lib/navigation/houseReturn.ts` |
| Safe reads | `member_memory_atoms` (member-act columns), `studio_changes` via `app/api/changes` |
| Must remain untouched | `app/maia/page.tsx` · `components/maia/MaiaShell.tsx` · `components/maia/MaiaCenterField.tsx` · `components/OracleConversation.tsx` · `lib/maia/arrivalState.ts` · `lib/navigation/houseDestinations.ts` · all `lib/maia/living-field/*` · all `app/api/maia/living-field/*` · all `app/relationships/*` |

**Three cautions attach to this seam, and P1-C should rule on each:**

1. **RISK — the existing gate conflates roles.** `app/maia/prototype/page.tsx:25`
   computes `const isFounder = Boolean(isAdmin || isPractitioner)`. **A practitioner is
   not a founder.** Copying this gate onto a surface that renders *personal member
   continuity* would admit practitioners to it. `lib/founder/founderAuth.ts`
   (`requireFounder`) and `lib/access/labAccess.ts` (founder-union, fails closed) are
   the stronger available mechanisms.
2. **RISK — the gate is client-side.** The page returns `null` until flags load and
   renders a refusal panel otherwise, but it is a `'use client'` component. That is
   adequate for an inert prototype; it is **not** adequate for a surface that reads
   member data. Any P1 data read needs server-side authorization
   (`probeAuthPosture` is the pattern in use on the Living Field routes).
3. **Registry/native.** A new route interacts with `houseDestinations.ts` and
   `scripts/capacitor-patch-routes.sh` (§2.2). Web-only must be declared, not assumed.

**⛔ Not implemented. No route, component, CSS, flag or query was created.**

---

## 14. Blockers and unknowns

### BLOCKER (conditional — applies only to one design choice)

**B1 — Living Field affinities must not be rendered by P1 as continuity threads,
unless P1-C first rules on standing.** A gathered affinity is a system-chosen
destination carrying a system-assigned score, with no proposal status, no member
adoption record, and an overwriting upsert with no revision history (§3.2c, §9).
Rendering it on Home as "what is present in your life" is exactly EAA-03 §XI's
prohibited silent conversion of MAIA proposal into member truth, and trips §XXVIII's
"automatic interpretation persistence." **This blocks one option, not the prototype.**

### RISK

- **R1** — Living Field write + read paths lack a `memory_scope` filter; latent only
  because no non-personal atom writer exists (§10.1).
- **R2** — Practitioner-authored atoms surface through the gathering route under the
  label "Keeps you have held," with no `facilitator_id` attribution, while sibling
  loaders guard exactly this (§10.2).
- **R3** — The available prototype gate equates practitioner with founder (§13).
- **R4** — `gathered_count` / `affinity_score` read as significance but are derivation
  weights (§8).
- **R5** — Editing any of the four load-bearing Home files has a blast radius far
  beyond Home (§2.1).

### UNKNOWN — must not be inferred

- **U1** — Has `scripts/backfill-living-field-affinities.ts` ever run in production?
  Determines whether R2 is live or theoretical. **No production read was performed.**
- **U2** — Is `/maia` itself server-side authorization-gated, or client-redirect plus
  per-API authorization? (§2.4)
- **U3** — Journal, Ideas, Reflections, Practices as continuity sources — not traced.
- **U4** — Writer's Studio, Now What? / Worldcraft reachability from personal Home.
- **U5** — Shared relationship spaces (`app/relationship/[spaceId]`) vs personal
  relationships boundary — not traced.
- **U6** — Production row counts for every table named here.
- **U7** — Whether `RELATIONSHIPS-UX-01`'s Now/Story/Field triad is intended to be
  superseded by EAA-03's five invitations, or reconciled with them (§7). **A
  governance question, not a repository one.**

---

## 15. Files likely touched if a later prototype is authorized

**Created (net-new, additive only):**
- one page under `app/maia/<name>/page.tsx`
- one or more components under `components/maia/<name>/`
- possibly one read-only adapter under `lib/maia/<name>/`
- possibly one read-only API route under `app/api/maia/<name>/route.ts`

**Modified (minimum, and each is a governed decision, not a given):**
- `lib/utils/feature-flags.ts` — one default-OFF flag
- `lib/navigation/houseDestinations.ts` — **only if** the surface is reachable from
  the House; triggers the drift guard
- `scripts/capacitor-patch-routes.sh` — **only if** the route must be excluded from iOS

**Explicitly untouched:** `app/maia/page.tsx` · `components/maia/MaiaShell.tsx` ·
`components/maia/MaiaCenterField.tsx` · `components/OracleConversation.tsx` ·
`lib/maia/arrivalState.ts` · `lib/maia/living-field/**` · `app/api/maia/living-field/**` ·
`app/relationships/**` · `lib/psyche/portfolio.ts` · `database/migrations/**`.

---

## 16. Recommended P1 sequence — RECOMMENDATION ONLY

Offered as input to P1-C. **No part of this is authorized and no part was performed.**

1. **Settle U1** (was the backfill run?) and **B1** (may affinities appear at all?).
   These two answers determine what Home is allowed to show. Nothing else should be
   decided first.
2. **Build the arrival shell with zero continuity.** Centre, greeting, *"What feels
   present?"*, inert composer, reduced motion, return affordance. This alone tests
   §XXVII conditions 1, 3, 12 and the whole presence→invitation hierarchy — and it
   needs no member data, so it carries no leakage risk.
3. **Add one continuity class only: member-named Changes.** It is the safest
   (§6 — member-authored, correctly scoped, retrieval-only, no synthesis).
4. **Add Keeps second, with the two exclusions named in §13** (`memory_scope='personal'`,
   `source_type <> 'practitioner_observation'`) and honouring `return_preference`.
5. **Add provenance inspection ("Why is this showing up here?") using only columns
   that exist** — `kept_at`, `source_type`, `generated_by`, `title`. Do not invent a
   crossing reason to make the answer prettier; where the honest answer is *"you kept
   this on 4 March,"* that is the whole answer.
6. **Route into Relationships** without altering it; treat the Fire gap (§7) as an
   EAA-03 reconciliation item for a separate act.
7. **Only then** consider whether the Return Contract needs schema — and if so, design
   it as an **extension of `crossing_must_be_false` and `return_preference`**, which are
   its existing ancestors, rather than as a new parallel vocabulary.

---

## Standing

**CENSUS COMPLETE (READ-ONLY) · ⛔ P1 NOT BEGUN · ⛔ NO ROUTE CREATED · ⛔ NO COMPONENT
CREATED · ⛔ NO CSS · ⛔ NO SCHEMA · ⛔ NO MIGRATION · ⛔ NO FLAG · ⛔ NO DATA ACCESS
ALTERED · ⛔ NO PRODUCTION READ PERFORMED · ⛔ NOTHING REPAIRED · PRODUCTION UNTOUCHED.**

Returned for **P1-C — implementation seam adjudication**.

> *MAIA may help experience become visible. The member decides what it means, what
> remains, and what becomes part of the life they carry forward.*
