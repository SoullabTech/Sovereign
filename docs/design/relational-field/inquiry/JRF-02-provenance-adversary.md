# JRF-02 — Provenance Adversary

**PROPOSED — NOT RATIFIED** · invocation JRF-02 · 2026-08-13

---

## Scope

**The question I was given:** attempt to defeat the provenance boundary defined in A2
(`RF-R3_PROVENANCE_BOUNDARY_2026-08-13.md`). Find every path by which observation could be
laundered into declaration. Test A2 §6's claim that promotion is *structurally* impossible rather
than merely forbidden by policy.

**Posture:** adversarial. I looked for ways to make the system hold a system-authored assertion in a
shape that a future reader — human, code, or MAIA — would take for a member act.

**What I examined:** `lib/relationships/*`, `lib/consciousness/relationalObserver.ts`,
`lib/consciousness/relationalCheckin.ts`, the four `app/api/relationships/**` routes,
`app/api/maia/relational-signal/route.ts`, both `app/api/founder/relational-signals/**` routes,
both `app/api/relationship-spaces/**` routes, and migrations `20260403000001`,
`2026040900001{0,1,2}`, `2026063000000{8,9}`.

**What I did NOT examine:** production row counts (no DB access this session); the `agent_runs` /
`integration_passes` column definitions (located but not read — see NOT ESTABLISHED below); the
iOS/Capacitor surface; `relationshipResources.ts` and `detectRelationalSignal.ts` internals beyond
their call boundaries; whether any of this is deployed on `22200f967`.

**Scope boundary I did not cross:** I changed no code, schema, or governing document. This file is
my only write.

---

## Evidence and existing infrastructure

### E0 — Every file named in my brief exists, but one is misnamed

**FACT.** All seven named paths exist:

| Path | Lines |
|---|---|
| `lib/relationships/relationshipSignalService.ts` | 316 |
| `lib/relationships/types.ts` | 367 |
| `database/migrations/20260409000010_member_relational_signals.sql` | 74 |
| `app/api/founder/relational-signals/route.ts` | 255 |
| `app/api/founder/relational-signals/review/route.ts` | 115 |
| `database/migrations/20260630000008_member_relationships.sql` | 130 |
| `database/migrations/20260630000009_relationship_content.sql` | 108 |

**FACT.** `database/migrations/20260630000008_member_relationships.sql` **does not create
`member_relationships`.** Its only `CREATE TABLE` is `relationship_spaces` (line 19); its only
`COMMENT ON TABLE` is on `relationship_spaces` (line 104). The real `member_relationships` table is
defined in `database/migrations/20260403000001_relationship_field_v1.sql`.

**INFERENCE** (from the above): A1's reuse section is right about the *table* (`relationship_spaces`,
migration `20260630000008`) and the filename is the thing that lies. Anyone who greps for
`member_relationships` by filename will bind the wrong referent. This is a live instance of *names
are not identity* inside the very substrate RF-R3 must extend.

### E1 — `DECLARATION_CAPABLE_SOURCES` does not exist in code. It is a documentary object only.

**FACT**, established by two structurally different methods with a working control:

- `git grep -n 'DECLARATION_CAPABLE_SOURCES' -- '*.ts' '*.tsx' '*.sql' '*.js'` → **0 hits**
- `grep -rn 'DECLARATION_CAPABLE' lib/ app/ components/ scripts/ database/` → **0 files**
- Control (proves the search works): `grep -rln 'DECLARATION_CAPABLE_SOURCES' docs/` → **3 files**:
  - `docs/design/relational-field/RELATIONAL_FIELD_R3_R6_DESIGN_2026-08-13.md` (A1)
  - `docs/design/relational-field/RF-R3_PROVENANCE_BOUNDARY_2026-08-13.md` (A2)
  - `docs/architecture/audits/relational-field-reconciliation/00-PROGRAM-SEQUENCE-AND-STANDING-CAUTIONS.md`

**FACT.** The only occurrence of the word "declaration" anywhere under `lib/relationships/`,
`app/api/relationships/`, `app/api/relationship-spaces/`, or `app/api/founder/` is a prose comment:
`lib/relationships/types.ts:112` — *"…would convert a member's declaration into a…"*.

**FACT.** `docs/design/relational-field/` is **untracked** (`git status --porcelain` → `?? docs/design/relational-field/`).

### E2 — `source` is hardcoded at both write sites, but caller-assignable at the function boundary

**FACT.** `member_relational_signals.source` is constrained to two values at the DB:
`source TEXT NOT NULL CHECK (source IN ('maia_conversation', 'labtool_manual'))`
(`20260409000010_member_relational_signals.sql:49`). `SignalSource` mirrors this
(`lib/relationships/types.ts:184`), and `safeSource()` rejects anything else
(`relationshipSignalService.ts:70-72`).

**FACT.** `InsertInput.source` is a **required caller-supplied parameter**
(`relationshipSignalService.ts:94`).

**FACT.** There are exactly three call sites, and all three hardcode the value:

| Caller | Value | Line |
|---|---|---|
| `app/api/sovereign/app/maia/route.ts:382` → `persistDetectedSignal` | `'maia_conversation'` | service line 168 |
| `app/api/sovereign/app/maia/list/route.ts:1441` → `persistDetectedSignal` | `'maia_conversation'` | service line 168 |
| `app/api/maia/relational-signal/route.ts:129` | `'labtool_manual'` | route line 140 |

### E3 — `relationship_entries` has three writers and no provenance column

**FACT.** Schema (`20260403000001_relationship_field_v1.sql`):

```
CREATE TABLE IF NOT EXISTS relationship_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES member_relationships(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('checkin','note','reflection','threshold','rupture','repair')),
  felt_signals TEXT[], free_text TEXT, maia_reflection TEXT, pattern_hint TEXT,
  field_tone_snapshot TEXT, suggested_movement TEXT, content TEXT,
  confidence NUMERIC, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

There is **no author column, no gesture witness, no `posture_at_creation`, and no source column.**
`member_id` denotes the *subject/owner*, not the *actor*.

**FACT.** Three writers:

| # | Writer | Actor | Sets `confidence`? |
|---|---|---|---|
| 1 | `app/api/relationships/[id]/entries/route.ts:99` | member | **no → NULL** |
| 2 | `app/api/relationships/[id]/checkin/route.ts:97` | member gesture, MAIA-generated content | **no → NULL** |
| 3 | `lib/consciousness/relationalObserver.ts:192` | MAIA observer | **yes** (`detection.confidence`) |

**FACT.** Writer 1 verifies ownership before inserting
(`entries/route.ts:91-97`: `SELECT id FROM member_relationships WHERE id=$1 AND member_id=$2 AND archived_at IS NULL`, 404 otherwise).

### E4 — The check-in path writes MAIA's output onto a `confidence IS NULL` row

**FACT.** `app/api/relationships/[id]/checkin/route.ts:97-106` inserts:

```
relationship_id, member_id, kind:'checkin',
felt_signals: safeSignals,            // member-selected canonical enums
free_text: freeText?.trim() || null,  // member's words, NULLABLE
maia_reflection: result.reflection,   // MAIA-GENERATED PROSE
pattern_hint: result.patternHint,     // SYSTEM CLASSIFICATION
field_tone_snapshot: result.fieldTone,// SYSTEM CLASSIFICATION
suggested_movement: result.suggestedMovement, // SYSTEM CLASSIFICATION
```

`confidence` is **not in the insert**, so the row lands with `confidence IS NULL`.

### E5 — `relationship_field_state` is a denormalized single-row-per-relationship authority cache

**FACT.** Schema (`20260403000001_relationship_field_v1.sql`):

```
CREATE TABLE IF NOT EXISTS relationship_field_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES member_relationships(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  field_tone TEXT, active_signals TEXT[], dominant_pattern TEXT,
  developmental_theme TEXT, elemental_dynamics JSONB,
  last_checkin_at TIMESTAMPTZ, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(relationship_id)
);
```

**FACT.** Exactly one writer: `checkin/route.ts:111` — `INSERT … ON CONFLICT (relationship_id) DO UPDATE`,
writing `field_tone = result.fieldTone` (MAIA-generated).

**FACT.** It is read back to the member: `app/api/relationships/route.ts:14-38` (`GET`) joins field
state into the relationship list.

**FACT.** No provenance column. `UNIQUE(relationship_id)` makes it structurally single-valued and
mutable-in-place: prior values are **overwritten, not superseded**.

### E6 — The observer's gate consumes MAIA's own output; the code comment says otherwise

**FACT.** `lib/consciousness/relationalObserver.ts:54-56`:

```
function detectRelationalContent(userMessage: string, maiaResponse: string): RelationalDetection {
  const combined = `${userMessage} ${maiaResponse}`.toLowerCase();
```

**FACT.** The same file, lines 184-186:

```
// Pattern detection v2 — structural, multi-hit. Runs on the user message
// only (MAIA's response is deliberately excluded so the detector cannot
// chase its own output). See: lib/relationships/patternDetection.ts.
const patternHits = detectPatterns(userMessage);
```

**INFERENCE:** the exclusion is real for the **secondary** pattern detector and **absent** for the
**primary gate**. The decision of *whether to write an entry at all* — and `detection.entryKind`,
`detection.confidence` — is computed from text that includes MAIA's own words. The comment
truthfully describes line 186 and, read at the file level, creates a false impression of a boundary
covering the whole observer.

### E7 — MAIA's stored output is re-read into the next generation as relational history

**FACT.** `lib/consciousness/relationalCheckin.ts:105-115` (`buildRecentContext`), consumed by
`buildPrompt` at line 118+:

```
if (e.kind === 'checkin' && e.feltSignals?.length) {
  parts.push(`Check-in (${e.feltSignals.join(', ')})`);
  if (e.freeText) parts.push(`Sensing: "${e.freeText}"`);
  if (e.maiaReflection) parts.push(`Reflected: ${e.maiaReflection}`);
}
```

**FACT.** The same prompt injects the cached classification:
`${input.lastFieldTone ? \`Previous field tone: ${input.lastFieldTone}\` : …}`, sourced from
`currentField?.field_tone` (`checkin/route.ts:85`) — i.e. from E5's cache.

### E8 — The relational read path's only caller is the retired lane

**FACT.** `buildRelationalContextBlock` and `getMemberActiveRelationalContext` have exactly one
consumer: `app/api/oracle/conversation/route.ts` (imports at :84-86; use at :700-702, :2409).

**FACT** (CLAUDE.md, founder-recorded): that route was retired with ruling on 2026-07-17 (410 +
Sanctuary S2/K4) and receives ~zero traffic.

**INFERENCE:** MAIA does not presently read relational context on the traffic-bearing route. The
laundering paths below are therefore mostly **latent** today, and would become **live** the moment
RF-R5-RETRIEVAL reconnects the reader.

### E9 — Founder routes: read-only against the signal store

**FACT.** `app/api/founder/relational-signals/route.ts` exposes only `GET` (line 117), gated by
`requireFounder()` (line 122) *and* `getCurrentSession()` (line 129). Header comment (lines 16-17):
the turn excerpt is joined at render and "NEVER written back into the signals table."

**FACT.** `app/api/founder/relational-signals/review/route.ts` `POST` writes to a **separate** table:
`INSERT INTO founder_relational_signal_reviews (signal_id, reviewer_id, verdict, note, …) ON CONFLICT (signal_id) DO UPDATE`,
with `reviewer_id = session.memberId`. Migration `20260409000011` records the intent: annotations
"stored separately so they cannot contaminate the signal store" and "no automatic feedback loop from
review verdict into the detector."

### E10 — No backfill path exists today

**FACT.** `grep -rn 'UPDATE relationship_entries|UPDATE member_relational_signals|INSERT INTO relationship_entries|INSERT INTO member_relational_signals' database/migrations/ scripts/`
→ **0 hits**. No migration or script mass-writes these tables.

---

## The attack table

Each row: the path, its state against **current code**, and the control that would close it.
"CLOSED" means closed *structurally*; "CLOSED (by convention)" means the code is currently correct
but nothing prevents the next writer from being wrong.

| # | Attack path | State | Structural control that would close it |
|---|---|---|---|
| **A1** | **Caller-assigned `source` on the signal API** — pass `source` through an HTTP body into `insertRelationalSignal` | **CLOSED (by convention)** — E2: all 3 call sites hardcode; no route reads `body.source` | Remove `source` from `InsertInput`. Export two functions — `insertObservedSignal()` / `insertLabtoolSignal()` — each hardcoding its own literal. A value a caller cannot express is one a caller cannot forge |
| **A2** | **Add `'declaration'` to the `source` enum** | **CLOSED at DB, OPEN at governance** — E2: the `CHECK` constraint rejects it, but a one-line migration lifts it, and A2 §9's prohibition lives only in prose (E1) | Nothing structural is available here, because the prohibition's referent (`DECLARATION_CAPABLE_SOURCES`) **does not exist in code** (E1). See Finding 1 |
| **A3** | **`confidence IS NULL` read as "member-authored"** — A2 §7 uses exactly this test | **OPEN** — E3/E4: the check-in writer is a *system* content path that also leaves `confidence` NULL | Add a NOT NULL `authored_by` enum (`member_gesture` / `observer` / `system`) to `relationship_entries`, set at every insert, with no default. Absence of a value must never be the evidence |
| **A4** | **MAIA output stored on a member-attributed row** | **OPEN** — E4: `maia_reflection`, `pattern_hint`, `field_tone_snapshot`, `suggested_movement` all sit on a row keyed by `member_id` with no marker separating them from `free_text` | Move system-generated columns to a child table keyed by `entry_id`. Co-tenancy in one row is what makes the confusion possible |
| **A5** | **MAIA re-reads its own output as relational history** | **OPEN** — E7: `Reflected: ${e.maiaReflection}` and `Previous field tone:` enter the next prompt as history, unattributed to MAIA within the prompt text | The retrieval layer must render provenance *in the string*, per A2 §5 (`"You wrote in June: …"` vs. an unlabelled `Reflected:`). Structurally: make the reader unable to select system columns without also selecting the author tag |
| **A6** | **Observer gate consumes MAIA's own text** | **OPEN** — E6: `detectRelationalContent(userMessage, maiaResponse)` concatenates both; only `detectPatterns` excludes the response | Change the gate signature to accept a single `memberUtterance: string`. The exclusion should be unexpressible-otherwise, not commented |
| **A7** | **Denormalized current-state cache treated as authority** | **OPEN** — E5: `relationship_field_state` is `UNIQUE(relationship_id)`, overwritten in place, provenance-free, and rendered to the member via `GET /api/relationships` | This is A2 §9's forbidden mutable authority field, already built. Either compute field tone from the entry lineage at read time, or mark the cache non-authoritative and never render it as the relationship's state |
| **A8** | **Synthetic relationship indistinguishable from a member-created one** | **OPEN** — `member_relationships` has **no provenance column** (E0). `relationalObserver.ts:171-178` inserts `name: 'Unresolved Relational Field'`. The only discriminator is a **literal string match on `name`** (`relationalObserver.ts:162-165`) | Add NOT NULL `created_by` (`member` / `observer`) to `member_relationships`. A string-equality test on a user-editable display field is not a boundary |
| **A9** | **Unverified `relationshipId` on the signal POST** | **OPEN** — `app/api/maia/relational-signal/route.ts:131-134` takes `body.relationshipId` on trust. Ownership is **not** verified (contrast `entries/route.ts:91-97`, which does). Only the FK to `member_relationships(id)` constrains it | Verify `relationship_id` ownership against the session member before insert, as the entries route already does. Critical for RF-R3: A2 §2 req 3 makes `relationship_id` **required at creation** — inheriting this pattern yields a *declaration attached to another member's relationship* |
| **A10** | **Founder/admin writing on a member's behalf** | **CLOSED** — E9: the founder surface is `GET`-only against signals; the review `POST` writes a different table, stamped `reviewer_id`, with migration-level intent against feedback loops | Preserve on any future declaration surface: **no admin route may write a row whose actor column is a member other than the session member** |
| **A11** | **Telemetry / logs / agent metadata as a back door** (A2 §8.3 anti-laundering) | **NOT ESTABLISHED** — see below | — |
| **A12** | **Backfill / migration setting declaration provenance without a member act** | **CLOSED today, OPEN by construction** — E10: no such script exists. But nothing prevents one; A2 §4's "no system process may perform any of these five acts" is prose | A trigger refusing `INSERT` on the declarations table unless a gesture-witness column is non-null and references a real server-side auth event row. A `NOT NULL` column alone is forgeable by a migration that supplies a literal |
| **A13** | **Inferred gesture** — a UI action read as a declaration the member never made | **OPEN in kind** — E4: the check-in *is* a member gesture (opening the flow), but what gets persisted is largely MAIA's interpretation of it. `felt_signals` is a canonical-enum selection, not the member's wording | A2 §2 req 4 (`declared_text`, write-once, the member's exact submitted words) closes this **only if enum selections are barred from producing a declaration on their own.** Selecting a chip is not wording |

---

## Testing A2 §6: "promotion is structurally impossible"

A2 §6 asserts promotion is *unavailable*, not merely forbidden — "there is no function that
manufactures a past authenticated act, and none may be written."

**INFERENCE — the claim is sound about the future table and unsound as currently stated.** Three
separate problems:

### 1. The claim's premise is a table that does not exist

**FACT** (A2's own Acceptance section): "Ratification of this document means the eight requirements
are answered — **not** that the schema exists." A2 §6 reasons from properties (gesture witness,
immutable wording) of a **design**. Against *current code*, §6 is a statement about a hypothetical.
It is not yet true or false; it is **unbuilt**. Calling it "structural" today confuses a specified
constraint with an enforced one.

### 2. The prohibition it leans on is prose, not structure — Finding 1

A2 §0 states `DECLARATION_CAPABLE_SOURCES` "is empty and must stay empty." A2 §9 states "No
declaration value may be added to `member_relational_signals.source`." Both read as descriptions of
an enforced containment.

**FACT (E1): `DECLARATION_CAPABLE_SOURCES` does not exist in the codebase.** Two structurally
different searches return zero; a control search finds it in three documents and nowhere else.

**INFERENCE:** the containment is **entirely documentary**. There is no empty set in code to keep
empty, no import to break, no test to fail, no CI check to trip. The genuinely structural part is
the DB `CHECK` constraint on the `source` column (E2) — which does real work, and which a two-line
migration lifts. A2 §6 closes with *"prefer a boundary whose shape makes the violation impossible
over one that forbids it."* By its own test, this specific boundary is currently the second kind.

This is the finding the brief asked me to weight most heavily: **the containment presented as
structural is, at the level of the named artifact, policy.**

### 3. Promotion is not the live threat. Origination-by-ambiguity is.

**INFERENCE.** A2 §6 defends a *transition* — OBSERVED → DECLARED. That defence holds: nothing in
the code walks an assertion across classes. But every open row in the attack table above achieves the
same outcome **without any transition**, because the substrate never recorded the class in the first
place:

- an entry is not *promoted* to member-authored — it is **written that way**, because
  `confidence IS NULL` is the whole test (A3/A4);
- a relationship is not *promoted* to member-created — it is **created** structurally identical to
  one (A8);
- a field tone is not *promoted* to current — it is **the only row that exists** (A7).

A2 §3 says the four classes "are disjoint and an assertion never changes class." **FACT:** no column
in `relationship_entries`, `member_relationships`, or `relationship_field_state` stores the class.
A partition that is not represented cannot be violated — and cannot be relied on. Guarding the
transition while leaving origin unrecorded protects the one door in a room with no walls.

---

## Representational completion check

The project's earned detector: *does a caller exist · does the producer observe anything · does the
value vary with what was apprehended?* Applied to values a reader could mistake for a member act:

| Value | Caller? | Observes? | Varies? | Verdict |
|---|---|---|---|---|
| `confidence IS NULL` on an entry | yes (A2 §7 proposes to use it) | **no** — it is the *absence* of a write | **no** — constant across two unrelated writers | **Derived constant passing as evidence.** Fails all three |
| `member_id` on any relational row | yes (every reader) | no — set from session as *subject*, never as *actor* | no — always the owner | **Ambiguous by construction.** Reads as authorship; means ownership |
| `name = 'Unresolved Relational Field'` | yes (`relationalObserver.ts:162`) | no | no — a hardcoded literal | **String constant as ontology boundary.** Member-editable display text |
| `relationship_field_state.field_tone` | yes (`GET /api/relationships`) | yes — MAIA generated it | yes | Real, but **unattributed**: varies with apprehension while presenting as the relationship's state |
| `DECLARATION_CAPABLE_SOURCES` | **no caller — no definition** | no | no | **The strongest case in this audit.** A named constant that exists only in prose, cited across three documents as though it constrained runtime |

**INFERENCE.** `DECLARATION_CAPABLE_SOURCES` is representational completion operating on the
*governance* layer rather than the product layer: the vocabulary makes the system appear to possess
a containment mechanism it does not have. The failure mode is identical to `rupture_state` — a label
that reads as apprehension — one layer up, and aimed at us rather than at members.

---

## Proposed design

**RECOMMENDATION 1 — Record class at origin, before defending transitions.** Add a NOT NULL,
no-default `authored_by` enum (`member_gesture` / `observer` / `system` / `imported`) to
`relationship_entries` and a NOT NULL `created_by` to `member_relationships`. No default: every
insert must state what it is. Existing rows take an explicit `unattributed_historical` value —
**never** a member value (precedent: the 142 memory atoms, CLAUDE.md 2026-08-09). Closes A3, A8;
prerequisite for A4.

**RECOMMENDATION 2 — Make `source` unexpressible by callers.** Delete `source` from `InsertInput`;
export `insertObservedSignal()` and `insertLabtoolSignal()`. Closes A1 structurally at no behavioural
cost — all three current callers already pass a literal.

**RECOMMENDATION 3 — Give the containment a code referent.** If A2 §0/§9's prohibition is to be
structural, it needs an artifact: either (a) define `DECLARATION_CAPABLE_SOURCES` as an exported,
empty, `as const` array with a unit test asserting emptiness and a comment naming A2 as its
authority; or (b) **stop describing it as though it exists** and cite the DB `CHECK` constraint —
the actual mechanism — instead. I recommend (a), because A1's phrase "the set gains a member per
attributable assertion" presumes a set that can gain members.

**RECOMMENDATION 4 — Separate system columns from member columns.** Move `maia_reflection`,
`pattern_hint`, `field_tone_snapshot`, `suggested_movement` to a child table keyed by `entry_id`.
Closes A4; makes A5 tractable by forcing the reader to opt in to system content.

**RECOMMENDATION 5 — Single-utterance observer gate.** Change `detectRelationalContent` to accept
one `memberUtterance` parameter. Closes A6 and makes the existing comment true of the file.

**RECOMMENDATION 6 — Verify `relationship_id` ownership on the signal POST**, matching
`entries/route.ts:91-97`. Closes A9 and prevents RF-R3 inheriting the defect at the exact point A2
§2 req 3 makes `relationship_id` mandatory.

**RECOMMENDATION 7 — Gesture witness as a foreign key, not a literal.** A2 §2 req 2 should reference
a row in a server-side auth/session event table, not store a route string. A `NOT NULL TEXT` column
is satisfiable by any migration typing a plausible value; a FK to an event that must already exist
is not. This is what would make A2 §6 structurally true.

**RECOMMENDATION 8 — A declaration requires wording, enforced.** `CHECK (length(trim(declared_text)) > 0)`
plus a prohibition on constructing `declared_text` from enum selections. Closes A13; enforces A2 §2 req 4.

⛔ None of the above is authorized by this document. Building is closed (A1 §"BUILDING IS NOT OPEN");
these are proposals for the RF-R3 unit whenever it opens.

---

## Risks and falsification cases

What would prove me wrong:

1. **A1 is falsified if `DECLARATION_CAPABLE_SOURCES` exists somewhere I did not search** —
   a deployed branch, a worktree, `node_modules`, or generated output. I searched the working tree
   at `feature/labtools-redesign`. **A second observer should re-derive on `clean-main-no-secrets`
   and on deployed `22200f967`.** If it exists there, my central finding weakens to "absent from
   this branch."
2. **A3 is falsified if a fourth discriminator exists** that I missed — e.g. a view, a trigger, or
   a reader that distinguishes member from observer entries by something other than `confidence`.
   I found three writers by grep on `relationship_entries`; a trigger-based mechanism would not
   appear that way.
3. **A7 is falsified if `relationship_field_state` is never rendered as authoritative** — if the
   member-facing UI labels it as MAIA's reading. I verified the API joins it (`GET /api/relationships`);
   I did **not** inspect the components that render it.
4. **A5/A6 lose force if the check-in surface is dead.** I did not check whether
   `/api/relationships/[id]/checkin` receives traffic. If it is as dead as the oracle lane (E8),
   these are latent rather than active. **This does not make them safe** — RF-R4 builds on this path.
5. **The whole audit is scoped to code-read.** Per JARVIS Core §B, this establishes what the code
   says, not what runtime does and not what a member meets. No claim here is a runtime claim.

---

## Constitutional conflicts

Named, not resolved.

**C1 — A2 §9 forbids a mutable authority field; `relationship_field_state` already is one.**
A2 §9: *"Eligibility is COMPUTED from the declaration event and its subsequent lineage — never
copied into a mutable authority field."* E5 shows a `UNIQUE(relationship_id)`, overwritten-in-place,
provenance-free cache of MAIA's classification, rendered to the member. A2 governs declarations and
this table predates them, so this is not yet a violation — but A1 lists this table as substrate RF-R3
"extends, does not replace." **Extending it inherits the defect.** Founder-level; I do not resolve it.

**C2 — A2 §0's stated mechanism is not the operative one.** A2 §0 grounds the containment in
`DECLARATION_CAPABLE_SOURCES` being empty. E1: that constant does not exist. The operative mechanism
is the DB `CHECK` constraint. A2's reasoning is correct; its **referent** is not. Per the brief I
surface this rather than reconcile it. It requires a founder correction to A2, which I may not write.

**C3 — A2 §8.3's anti-laundering clause has no verified compliance witness.** The clause forbids
telemetry preserving a semantic assertion "in another guise." I could not establish the `agent_runs`
/ `integration_passes` column sets (A11). Whether any operational store holds relational assertions
readable back as knowledge is **NOT ESTABLISHED**.

**C4 — `posture_at_creation` is absent from every relational table.** A2 §7 rules it must be carried
from creation and never backfilled. **FACT:** migration `20260718000001_s5_provenance_substrate.sql`
adds `posture_at_creation` to `agent_runs` and `integration_passes` (lines 381-404) — and to none of
`relationship_entries`, `member_relationships`, `member_relational_signals`, or
`relationship_field_state`. A2 §7 also states a sanctuary session may not produce a Declaration.
**INFERENCE:** with no posture column on any relational table, there is presently no way to
establish whether an existing relational row arose under sanctuary. Since it may never be
backfilled, that question is **permanently unanswerable for existing rows** — which is the correct
outcome (the record follows reality), but it should be stated rather than discovered later.

**C5 — E6 vs. the code's own claim.** The comment at `relationalObserver.ts:184-186` describes a
boundary narrower than a file-level reading suggests. Not a canon violation; a documentation defect
in a provenance-critical path, which is how the class of error this programme excavated begins.

---

## Reuse opportunities

Substrate that exists and must not be duplicated:

- **Ownership verification** — `app/api/relationships/[id]/entries/route.ts:91-97` is the correct
  pattern. Reuse it in A9's fix and in RF-R3; do not write a second one.
- **Founder-annotation separation** — `founder_relational_signal_reviews` (migration `20260409000011`)
  is a working precedent for *third-party observation stored beside, never inside, the observed
  store*, stamped with the actor. This is the shape A2 §8.3 wants. Reuse it rather than inventing
  a declaration-review mechanism.
- **`requireFounder()` + `getCurrentSession()` double gate** (`app/api/founder/relational-signals/route.ts:122-129`)
  — handler-level authorization that does not trust middleware. Any declaration admin surface should
  use this, not a new check.
- **`relationship_spaces`** (migration `20260630000008`, per E0 the file's actual content) is the
  consent-gated two-member object; its `consent_status` / `consent_accepted_at` / `consent_items`
  triple is the existing consent-act shape. A2 §5's `retrieval_consent` should follow it together
  with atoms' `return_preference` and Daily Anchor's `surface_preference` (A2 §7) — **three
  precedents now exist; a fourth shape would be the error.**
- **`relationship_entry_patterns.expires_at`** (`relationalObserver.ts:196-207`) — existing
  currentness mechanism. A1 already rules item 5 must consume it rather than invent decay.
- **`insertOne` / `query` / `queryOne`** from `lib/db/postgres` — the only DB client.

---

## Unresolved founder decisions

One line each, phrased as a question of principle, carrying my recommended ruling.

1. **Should a containment that governing documents describe as structural be required to have a code
   referent before it may be cited as structural?**
   *Recommended ruling: yes.* A prohibition whose named artifact exists only in prose is policy. A2
   §6's own test — prefer a boundary whose shape makes violation impossible — should apply to A2's
   own containment. Either define `DECLARATION_CAPABLE_SOURCES` in code with a test asserting
   emptiness, or amend A2 to cite the DB `CHECK` constraint as the mechanism.

2. **Must every relational row record its author class at origin, rather than the class being
   inferred from the absence of a value?**
   *Recommended ruling: yes.* `confidence IS NULL` is a derived constant shared by a member writer
   and a system writer (E3/E4); A2 §7 currently proposes to read authorship from it. Class must be
   written, NOT NULL, no default, at every insert.

3. **Does A2's ontology of four disjoint classes bind the existing substrate that RF-R3 extends, or
   only the new declarations table?**
   *Recommended ruling: it binds what RF-R3 extends.* A1 says items 1-2 extend `member_relationships`
   / `relationship_entries`. Extending tables that cannot represent the partition imports the defect
   into the unit meant to end it.

4. **Must the gesture witness reference a server-side auth event row rather than store descriptive
   literals?**
   *Recommended ruling: yes.* This is the single change that converts A2 §6 from a specification
   into an enforcement. A `NOT NULL TEXT` witness column is satisfiable by any future migration
   typing a plausible string — exactly the "manufactured past authenticated act" §6 says cannot
   exist.

---

## Dissent and uncertainty

**Where I disagree with the design authority.** A2 §6 is, in my read, the strongest section of a
strong document, and I think it defends the wrong perimeter. Promotion — an assertion moving from
OBSERVED to DECLARED — is genuinely hard to arrange, and nothing in current code does it. But the
outcome A2 exists to prevent (a system assertion speaking in a member's voice) is reachable in
today's substrate **without any promotion at all**, because class is never recorded at origin. I
would rank "record origin" above "defend the transition." I hold this as disagreement about
sequencing, not about principle, and the founder has design authority.

**Where I disagree with myself.** Calling the containment "policy, not structure" is the sharpest
version of my finding and it may be too sharp. The DB `CHECK` constraint on `source` is real
structure and does most of the work A2 §0 attributes to the missing constant. A fair statement is:
*the containment is partly structural (the CHECK) and partly documentary (the constant), and the
documents credit the documentary half with the structural half's strength.* I have written it the
sharper way in Finding 1 because I was invoked to attack, and the softer framing is the one that
would let it persist. The founder should read both.

**Second uncertainty.** I cannot tell whether the missing constant is an *error* or a *plan* — A1's
"the set gains a member per attributable assertion" is written in the future tense throughout, so
`DECLARATION_CAPABLE_SOURCES` may be intended as a name for something RF-R3 will create. If so, the
defect is only that three documents refer to it in the present tense. That would substantially
reduce the severity of Finding 1, and I could not establish which reading is correct.

**Where I am adversarial and may be unfair.** A5, A6, and A7 describe a system that reads its own
prior output back into its next output. Some of that is ordinary conversational memory, not
laundering. The line I drew — *unattributed in the prompt string* — is my own, taken from A2 §5's
requirement that the offer carry its provenance in the utterance. A reasonable reader could hold
that internal prompt scaffolding need not be attributed the way member-facing speech must be. I
think A2 §5 reads the other way, but I am inferring from a section written about utterances and
applying it to prompts.

**NOT ESTABLISHED, explicitly:**

- **A11 / C3** — `agent_runs` and `integration_passes` column definitions. I located the migrations
  (`20260122000002_fix_agent_runs_schema.sql`, `20260405100001_agent_runs.sql`,
  `20260718000001_s5_provenance_substrate.sql`) but did not read the column sets. Whether these
  stores hold relational assertions readable back as knowledge about a relationship — the precise
  question A2 §8.3 asks — is **unanswered**.
- **All production row counts.** A2 §7's "18 rows" and A1's "440 unattached signals" and
  `relationship_spaces` "0 rows" are cited from prior audits. I had no DB access and verified none
  of them. I neither confirm nor dispute them.
- **Deployment state.** Whether any code cited here is what runs on `22200f967` is unverified. All
  findings are code-read against the working tree at `feature/labtools-redesign`.
- **Whether `/api/relationships/[id]/checkin` receives live traffic.** Bears directly on how urgent
  A4/A5/A7 are.
