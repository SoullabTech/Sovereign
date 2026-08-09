# `coach_client_shared_items` — Focused Provenance Review

**Status: EVIDENCE + one open question.** ⛔ No schema, no code, no adoption. Requested by the
founder 2026-08-06: *"it may already embody assumptions that the new model either adopts or
explicitly replaces."*

**Verdict up front: it is not what the measurement suggested.** It is neither abandoned, nor absent
from the repository, nor an earlier attempt at Placement. ⭐ **It is the inverse direction — the
member's offering into the relationship — and it is shipped, boundary-tested, and unexercised.**

---

## 1. Two corrections I owe

**Correction 1 — it is in the repository.** The measurement reported no defining migration and no
code references. Both readings were **artifacts of my search scope**: I grepped the checked-out
branch (`feature/labtools-redesign`), whose local `clean-main-no-secrets` is **402 commits behind
`origin`**.

**[O]** `database/migrations/20260803000001_coach_client_shared_items.sql` (116 lines), commit
`db39e6427` — *"feat(coach-field): Bring Forward — the member's gesture that makes the relationship
real"*, Kelly Nezat, 2026-08-03. **Present on `origin/clean-main-no-secrets` and present in the
deployed commit `b1399f693`.**

**Correction 2 — it is not abandoned.** **[O]** On trunk it has a service, a PHI accessor, and
**two verifiers**:

| Path | |
|---|---|
| `lib/coachField/bringForward.ts` | the service |
| `lib/security/phiAccessors/sharedOfferings.ts` | encrypted accessor |
| `scripts/verify-bring-forward.ts` | dedicated verifier |
| `scripts/verify-coach-field-boundaries.ts` | boundary gate |

⭐ It shipped **with its own boundary tests**. In the founder's four-state vocabulary it is
**present but unexercised** — ⛔ not abandoned, ⛔ not incompatible.

**[O]** Provenance ledger row 487 (`docs/db/migration-provenance-ledger-2026-08-05.tsv`) already
records it: applied `2026-08-05 14:26:16+00`, status `RECOVERABLE_FROM_HISTORY`, objects
`coach_client_shared_items` + two indexes + `trg_coach_shared_item_authorship`. ⭐ The existing
migration-provenance lane had already caught it. This review re-discovers, it does not discover.

---

## 2. What the object actually is

The migration states its own constitution, at length. The structure:

```
private field object          (stays the member's, never reachable here)
        │
        │ member chooses
        ▼
shared offering               (this table — a relationship object)
        │
        ▼
practitioner projection
```

| Column | Meaning |
|---|---|
| `relationship_id → practitioner_clients(id)` | the relationship it was brought into |
| `offered_by_member_id → members(id)` | ⭐ *"Authorship — which person performed the act. Never ownership of the source material."* |
| `kind ∈ reflection \| question \| commitment \| moment` | the member's register, ⛔ not a clinical taxonomy |
| `origin` + `source_id` | ⭐ **opaque lineage, deliberately no FK** |
| `snapshot_enc` + `snapshot_enc_meta` | ⭐ ciphertext only — ⛔ *"no plaintext sibling"* |
| `snapshot_version` | bumped when the member updates what the practitioner sees |
| `status ∈ active \| withdrawn` + `withdrawn_at` | with a coherence CHECK |

**Three design commitments worth naming, in the author's own words:**

1. **No FK to the source** — *"an FK would make the member's private row reachable by join from a
   practitioner-scoped query."* ⭐ The absence is the security property.
2. **Encrypted from birth** — *"structural privacy is not encryption at rest, so there is no
   plaintext column to fall back to and nothing to dual-write. Reads decrypt or they fail."*
3. **A snapshot, not a live mirror** — *"a declaration made at a moment… a live pointer would turn
   every later edit into a synchronisation and notification problem ('what does Larry see now?').
   The member stays the actor either way."*

⭐ **The third commitment is the same rule the Event Specification §6 reached independently** — *a
Placement pins the version it placed.* Two lanes, arriving at snapshot-not-pointer for the same
reason, from opposite directions.

---

## 3. ⭐ The constitutional finding

`PRACTITIONER_INFERENCE_CONTAINMENT_2026-08-06.md` states:

> ⛔ **No crossing mechanism designed. Deliberately.** *The gesture that changes authority state is
> defined after §7 is ruled, not before.*

**A crossing mechanism exists in production.** `coach_client_shared_items` is exactly that: a
member-authored, explicit, encrypted, withdrawable crossing from the member's private field into a
shared commitment. It satisfies the ratified requirement almost verbatim — *everything crossing must
be an explicit declaration by that person.*

⚠️ **Stated precisely, because the distinction matters:** it is a crossing mechanism for **member
field-note material** (`origin = 'field_note_thread'`). ⛔ It is **not** a crossing mechanism for
`pattern_ledger` recognitions — which is what the containment ruling was about, and that gap remains
exactly as recorded. ⭐ Two different objects; the containment ruling is not weakened, but its
"deliberately none exists" sentence is **true only of its own subject**, not of the system.

---

## 4. The gap it exposes in the publishing ontology

The four ruled objects and five ruled acts are **all practitioner-originated or
member-declaration-about-something-placed**:

| Direction | Act | Modelled? |
|---|---|---|
| practitioner → member | Placement | ✅ ruled |
| member declares about a placed thing | Uptake | ✅ ruled |
| practitioner records what they heard | Attestation | ✅ ruled |
| either party revokes | Withdrawal | ✅ ruled |
| governor confers force | Ratification | ✅ ruled |
| ⭐ **member → practitioner, member-originated** | **Offering / Bring Forward** | ⛔ **absent from the model, present in production** |

The Session-1 acceptance test held that *"What have I discovered?"* maps to **no publishing object**,
and called that absence proof the boundary holds. ⭐ **That remains right about ownership and
incomplete about acts.** Discovery stays the member's — but *the member choosing to bring a
discovery into the relationship* is a distinct authored act, and it already exists, encrypted,
withdrawable, and version-snapshotted.

> **The open question, in the narrow form:** is Offering a **sixth act** in the ruled grammar, or is
> Placement **direction-agnostic** — one act whose author may be either party?

⭐ Evidence pointing at **sixth act, not a direction flag**: the two differ in what they may
reference (a Work vs. an opaque private-source lineage), in what erasure means, and in who may
withdraw. A shared `direction` column would collapse two different privacy regimes into one table.

⛔ Not ruled here.

---

## 5. Disposition recommendation

⛔ **Do not adopt, do not extend, do not build Placement on it.** They are opposite directions with
different privacy regimes. Adopting it would repeat the `practitioner_materials` error — one home
serving two concepts.

✅ **Do adopt three of its decisions as precedent**, since they were reached independently and
already ship with verifiers:

1. **Opaque lineage instead of FK** where a join would breach a field boundary.
2. **Ciphertext-only, no plaintext sibling** for member words.
3. **Snapshot at the moment of the act**, ⛔ never a live pointer.

✅ **Do reconcile the seven share-shaped tables** with this one now correctly classified — the count
of genuine Placement candidates drops, because this one is not among them.

---

## 6. What remains true after this review

- The publishing substrate is still **empirically empty** — this table has 0 rows like the rest.
- ⚠️ **But "the repository does not contain X" is no longer a claim I can make from a branch grep.**
  Local trunk is 402 commits behind origin; the deployed commit `b1399f693` is the only reliable
  reference for what shipped. ⭐ **Every prior absence claim in this lane should be re-checked
  against the deployed commit before it is relied on.**
- The coach-field foundation is more developed than the publishing documents assumed: relationship
  identity invariants, boundary verifiers, and a shipped crossing gesture already exist
  (`docs/architecture/COACH_FIELD_FOUNDATION_INVARIANTS_2026-08-02.md`).

## 7. Not authorized

⛔ Adoption, extension, or modification of `coach_client_shared_items` · ⛔ ruling the sixth-act
question · ⛔ schema, migration, code, route, UI · ⛔ lifting the ontology's implementation block.
