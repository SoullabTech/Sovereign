# SPM-02 — SUBSTRATE CENSUS

**Date:** 2026-09-14 · **Authority:** founder act — *"Authorize SPM substrate census only."*
**Object of comparison:** `SPM-01 v0.5` (STABLE) — `CLAIM = ORIGIN (immutable) · BASIS · STATUS`,
behind a pre-claim formation gate, with succession derived from the successor.

⛔ **PROHIBITED AND NOT PERFORMED:** schema design · migration · repair · normalization ·
implementation · ledger modification · falsifier construction · treating an analogous object as a
compliant match.

**Question answered, and only this one:** *what substrate actually exists beneath the stable object?*

---

## 0 · Scope, and two corrections to this instrument

**Scope:** working tree at `cef47c4c9`, branch `claude/spm-00-sovereign-personal-model`. Read-only.
⛔ **No production database was read.** Every statement below is about **code and DDL in the tree**,
never about rows that exist for a member. *Declaration is not liveness.*

⚠️ **SELF-CORRECTION 1 — my first enumeration was scoped to `database/migrations` and missed
`database/baseline/0001_baseline_2026-09-01.sql` (47,592 lines).** Table count went **579 → 657**.
`developmental_memories` was briefly and wrongly on my absent list.
⚠️ **SELF-CORRECTION 2 — my extractor's pattern did not match the baseline's quoted
`"public"."table"` form**, reporting `developmental_memories` as having no DDL when it has one at
baseline line 8559.

⭐ **Both are the same failure the SPI census earned its law from, reproduced inside this run's own
instrument: a scoped absence read as an absence.** They stay in the record. *A census that hides the
search that failed cannot be trusted about the searches that succeeded.* Every `ABSENT` below rests
on **at least three independent searches or a direct enumeration**, never one grep.

---

## 1 · The result in one line

> ⭐⭐ **The substrate is rich in *sourcing* and *lifecycle*, and almost empty in *epistemic standing*.
> Nothing in the tree distinguishes "the member said this" from "the system concluded this" as a
> property of a claim about the person.**

The fourth classification state earned itself immediately: **the two nearest matches to `ORIGIN` and
`STATUS` are both `ANALOGOUS-BUT-DIFFERENT`, and both would have passed a naive census as `PRESENT`.**

---

## 2 · Findings by substrate

### 2.1 · Atoms — `member_memory_atoms` (19 cols, `20260521000001`)

| SPM element | State | Evidence |
| --- | --- | --- |
| ORIGIN | ⭐ **ANALOGOUS-BUT-DIFFERENT** | `source_type` + `source_id` |
| STATUS | ⭐ **ANALOGOUS-BUT-DIFFERENT** | `status` |
| BASIS | **ABSENT** | no warrant field |
| formation gate | **PARTIAL** | `sourcing_discipline`, `crossing_must_be_false`, `sacred_protected_register_status` |
| succession | **ABSENT** | no `supersedes` |

⛔ **`source_type` is a CONTENT-CHANNEL axis, not an origin axis.** Its nine values —
`idea · idea_block · journal · dream · reflection · decision · change · session_excerpt ·
spontaneous` — are **all member-material channels.** It answers *which member surface did this come
from*, ⛔ **never *did the member assert this or did the system infer it*** — and it **cannot**, because
there is no value for an inference. Atoms are member-kept material by construction.

⛔ **`status` is a CIRCULATION/SALIENCY axis, not an epistemic one:** `active · still_alive ·
set_aside · protected`. ⭐ **Marking an atom `set_aside` says nothing about whether it is true, and
`protected` withholds it from circulation without touching its standing.** SPM's
`unreviewed · confirmed · disputed` has **no counterpart here.**

⭐ **Atoms do carry real formation discipline** — three CHECK constraints, one of which
(`crossing_must_be_false`) is a permanent structural refusal. *The gate exists; it gates circulation
and sourcing, not the admissibility of a proposition about the person.*

### 2.2 · Developmental memory — `developmental_memories` (23 cols, baseline)

**The closest thing in the organism to a claim about a person, and the closest to SPM's STATUS axis.**

- ⭐ **`confirmed_by_user` · `last_confirmed_at` · `user_feedback`** — a real **member-confirmation**
  axis. **PARTIAL** against STATUS: it can express *confirmed*, ⛔ **it cannot express *disputed*** and
  ⛔ has no *unreviewed* distinct from *never asked*.
- ⭐ **`valid_from` · `valid_to` · `formed_at`** — temporal standing already separated from creation.
- **Three typed source columns** — `source_beads_task_id · source_ain_session_id ·
  source_consciousness_entry_id`. ⭐⭐ **These are SYSTEM-INTERNAL provenance: which process produced
  the row. ⛔ None of them says whether the member asserted it.** **ANALOGOUS-BUT-DIFFERENT** against
  ORIGIN.
- `memory_type` admits `correction` among eight values — ⚠️ a *type*, not a relation to what it
  corrects. **Succession: ABSENT.**
- 🔴 **`user_id` is `TEXT`, not a foreign key.** Consequences below (§3.2).

### 2.3 · Semantic memory — `semantic_memories`

⭐⭐ **ANALOGOUS-BUT-DIFFERENT at full strength — it is not a model of the person at all.** Its columns
(`mastery_level · understanding_depth · times_applied · successful_applications · prerequisite_concepts
· builds_toward_concepts`) describe **a learner's grasp of concepts**, not propositions about a human.
⛔ Classifying it `PARTIAL` because it is called "memory" is exactly the error the fourth state exists
to prevent.

⚠️ **Its DDL lives in `db/migrations/` and `db/supabase/migrations/` — NOT in `database/migrations/`.**
Recorded as a **provenance observation only.** ⛔ No repair, no migration, no consolidation — that is
another lane's call, and this census may not make it.

### 2.4 · Interpretive ledger — `interpretive_ledger` (29 cols)

| SPM element | State |
| --- | --- |
| BASIS | ⭐ **PARTIAL — the strongest in the organism** |
| STATUS | **PARTIAL** |
| succession | ⭐ **PRESENT, and divergent from M1** |

- ⭐ `evidence_summary · evidence_event_count · cross_context_count` plus four separate confidence
  columns (`signal · structural · interpretive · composite`) and declared
  `contradiction_conditions` / `decay_conditions`. **This is the only substrate that asks *why should
  this be believed* — but the evidence is a SUMMARY and a COUNT, ⛔ not a reference to what supports
  it.** *It can tell you how much it believes; it cannot show you what on.*
- `parent_ledger_entry_id` gives lineage — ⚠️ **`ON DELETE SET NULL`: lineage is severable.**
- ⛔ **Confirms the SPI geometry finding without re-adjudicating it:** the ledger still carries the
  parent-mutating supersession. ⛔ **M1 explicitly implied no repair here; this census proposes none.**
- ⭐ **Jurisdiction note: the ledger holds HYPOTHESES, not member assertions** (`promoted_from_
  hypothesis_id`, `accumulating_hypotheses`). Under M1 that is a different object with its own
  lifecycle. ⛔ **Recorded, not reconciled.**

### 2.5 · S5 provenance substrate — `20260718000001`

⭐⭐ **PRESENT and structurally enforced — and it confirms F1 exactly.** Six constitutional keys are
DB-gated: `createdBy · generatedBy · postureAtCreation · sourceContainer · source ·
persistencePolicy`, with immutable-once-minted triggers and *"even raw SQL cannot write an unattested
turn."*

> ⭐ **All six ask why the OBJECT was allowed to exist. ⛔ None asks why the PROPOSITION about the
> human should be believed.** F1 is confirmed at the substrate, not merely at the specification.

`provenance_tombstones` is **PRESENT** — real tombstone machinery, keyed to deletion manifests.

### 2.6 · Writer's Studio provenance — `lib/manuscript/development/`

⭐⭐ **PRESENT, and it is the one place the organism already does what SPM's `BASIS` needs — pointed at
the wrong object.** Typed `SectionRef · PassageRef · SectionRunRef · StructureUnitRef`, frozen
`readState`, digest verification, `bind`/`resolve`/`capture` separated, and refusal types on every
operation (`BindRefusal`, `CaptureRefusal`).

⛔ **It establishes evidence for a WORK, not for a belief about a person.** The SPI headline is
confirmed by direct reading: *we can establish provenance for a work far better than for what MAIA
believes about someone.*

### 2.7 · Anamnesis · relationship memory · member settings

- **Anamnesis** (`AnamnesisField · DecentralizedMemory · UnifiedMemoryInterface · MemoryCoreIndex`):
  ⚠️ **no table reads or writes matched in its modules.** Under SPI absence law this is recorded as
  **an interface layer, standing UNRESOLVED** — ⛔ not `ABSENT`, since one search shape cannot settle it.
- **Relationship memory** — `member_relationships · relationship_essences · relationship_entries ·
  relationship_patterns` and more exist. ⚠️ **Enumerated, NOT read.** Standing **UNRESOLVED**;
  claiming a state would exceed what this run inspected.
- **`member_settings`** — **PRESENT** as a settings store. ⛔ Not a claim-bearing object.

### 2.8 · Export and erasure

- **Export** (`app/api/members/export-data/route.ts`) — **PARTIAL, five tables, confirmed by direct
  enumeration:** `members · member_settings · member_sessions · developmental_memories ·
  google_calendar_credentials`. ⛔ **Atoms, the interpretive ledger, relationship memory, manuscripts
  and episodes are NOT exported.** The SPI finding reproduces exactly.
- **Erasure** — `app/api/members/delete-account/route.ts` issues **three explicit DELETEs**
  (`member_sessions · member_settings · members`). `vault_erasure_queue` exists for artifacts
  (`artifact_ref · attempts · last_error`) — ⭐ a **retry queue**, not a claim-erasure model.

---

## 3 · Two findings that were not on the map

### 3.1 · ⭐⭐ The export/erasure asymmetry runs the opposite way to the census's framing

SPI recorded *forgetting ahead of ownership.* At the **route** level this run reads the reverse:
**export names five tables; explicit deletion names three.** ⛔ **This is NOT a claim that data
survives deletion** — see §3.2.

### 3.2 · 🔴 Cascade coverage is uneven, and one table has no cascade at all

| Table | Member linkage | On member delete |
| --- | --- | --- |
| `member_memory_atoms` | `member_id UUID REFERENCES members(id)` | ⭐ `ON DELETE CASCADE` |
| `interpretive_ledger` | `member_id UUID REFERENCES members(id)` | ⭐ `ON DELETE CASCADE` |
| `developmental_memories` | 🔴 **`user_id TEXT` — NO FOREIGN KEY** | ⛔ **no cascade possible** |

⭐ **So the three explicit DELETEs are not the whole story — atoms and the ledger go by cascade.**
⛔ **But `developmental_memories` is linked by a TEXT column with no key, so no cascade can reach it**
— and it is **the one memory table the export surface does include.**

⚠️ **Stated at exactly the strength the evidence carries:** this is **a schema-level observation about
referential structure in the tree.** ⛔ It is **NOT** a claim that member data persists in production
after deletion — no production database was read, and other deletion paths (`deletion_manifests`,
`deletion_manifest_scopes`, the erasure queue) were **enumerated but not traced**. **The honest state
is UNRESOLVED, flagged, and owed a trace.** ⛔ No repair is proposed or authorized here.

---

## 4 · Classification summary

```text
SPM ELEMENT        NEAREST SUBSTRATE                        STATE
ORIGIN             atoms source_type / dev-mem source_*     ⭐ ANALOGOUS-BUT-DIFFERENT
                   (content channel · system process)          — NOT member-vs-system
BASIS              interpretive_ledger evidence_*           PARTIAL  (summary + counts,
                   WS development/ EvidenceRef              PRESENT but aimed at WORKS)
STATUS             dev-mem confirmed_by_user                PARTIAL  (no disputed)
                   atoms status                             ⭐ ANALOGOUS-BUT-DIFFERENT
                                                               — circulation, not standing
FORMATION GATE     atoms CHECKs · S5 mint gates             PARTIAL  (real, and about
                                                               objects, not propositions)
NON-FORMATION REC. —                                        ABSENT   (3 searches)
SUCCESSION         interpretive_ledger parent_*             PRESENT, divergent from M1
                   memory modules                           ABSENT
GOVERNING PROV.    S5 six constitutional keys               ⭐ PRESENT, DB-ENFORCED
EXPORT             export-data route                        PARTIAL  (5 tables)
ERASURE            delete-account + cascades + queue        PARTIAL, coverage UNRESOLVED
VISIBILITY         orientation / memoryHealth               PARTIAL  (health ≠ visibility)
```

---

## 5 · What this census does not say

⛔ It does not say the substrate is wrong · does not propose a schema, a migration or a repair ·
does not reconcile the ledger's supersession · does not resolve the `db/` vs `database/` lineage ·
does not rule on whether any analogous object should become the SPM object · does not open
implementation design.

⚠️ **Standing UNRESOLVED and owed before any implementation act:** the erasure trace (§3.2) ·
Anamnesis · relationship memory · episodes.

> ⭐ **The reusable conclusion: SPM's `ORIGIN` and `STATUS` axes are genuinely new. They are not
> hiding in the substrate under other names — the names that look like them mean something else.**

---

# ADDENDUM — 2026-09-14 · CENSUS CLOSED

**Founder act.** ⭐ **Clarification only** (charter §6 shape): it states what the run already
established and ⛔ **changes no finding and no classification.**

## A1 · ⭐⭐ The restraint on the conclusion — the load-bearing correction

> ⛔ ***"`ORIGIN` and `STATUS` are genuinely new axes" does NOT imply new tables, new columns, or
> even a new claim object.***
> It means only that **the existing semantics cannot truthfully carry those axes.** ⭐ **How they
> should be represented remains an implementation/design question, and is therefore correctly
> UNOPENED.**

⚠️ The census's own closing sentence could be misread as implying storage. **It does not.** *A census
that discovers a semantic absence has not thereby chosen a representation for it.*

## A2 · ⭐ One precision on the strength of the absence

The census established that the distinction is **NOT ENCODED IN THE SUBSTRATE.** ⛔ It did **not**
establish that MAIA never makes the distinction conversationally or at prompt level — that was never
inspected. **Substrate absence, not behavioural absence.**

## A3 · ⭐⭐ `ANALOGOUS-BUT-DIFFERENT` is an ANTI-COLLAPSE OPERATOR

Not merely census vocabulary: ⭐ **it prevents SEMANTIC RESEMBLANCE from being mistaken for
ARCHITECTURAL COMPLIANCE.** The run falsified five tempting equivalences, and this is the reusable
output:

```text
source_type          ≠  ORIGIN
atom status          ≠  STATUS
confidence           ≠  BASIS
persistence          ≠  adoption
member association   ≠  member authorship
```

## A4 · Composition vs construction — now sharp

⭐ **Much of the supporting machinery is COMPOSITIONAL** — storing human material · retention and
recall · lifecycle/circulation controls · confidence-like quantities · domain provenance · export ·
deletion infrastructure.

⭐⭐ **The epistemic custody layer is CONSTRUCTION.** The system lacks the layer that answers:
***what kind of epistemic act made this proposition about this human admissible?*** ⛔ That is not a
cosmetic extension of `source_type`.

## A5 · Standing

```text
SPM-02  CENSUS CLOSED — it answered its question
```

⛔ **The erasure trace is NOT folded back in.** It leaves as a routed dependency (register **F5**),
because ⭐ *a census that keeps absorbing what it discovered stops being a census.*

> ⭐ **SPM was not invented to formalize something the code already happened to contain. The census
> found the exact absence SPM claims matters.**
