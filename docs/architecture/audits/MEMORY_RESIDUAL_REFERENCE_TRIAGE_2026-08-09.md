# Residual Reference Triage — the 102 unresolved memory references

**Date**: 2026-08-09 · **Authorized by**: `docs/governance/MEMORY_RESOLUTION_CONTRACT_RULING_2026-08-09.md`
Ruling 2 — *classify and address each failure class at its producing mechanism; ⛔ no mass edit;
⛔⛔ no synthetic placeholder memories.*

**Baseline**: `memory-audit-reports/audit-20260809-193848.json` (hash-bound). **Nothing repaired.**

---

## The three populations

| class | occ | distinct targets | producing mechanism | disposition |
|---|---|---|---|---|
| **A — meta-vocabulary** | 24 | 10 | audit classification | instrument escaping semantics |
| **B — truncation** | 6 | 2 | **citation copied from a sibling record** | writer discipline (root cause below) |
| **C — never-written** | 70 | ~47 | forward-reference to an unauthored memory | per-target triage |

### A — meta-vocabulary (24 occ) — *not corpus damage*

`[[wikilinks]]` ×9 · `[[refs]]` ×3 · `[[link]]` ×2 · `[[ref]]` ×2 · `[[name]]` ×2 · `[[slug]]` ×2 ·
`[[links]]` · `[[reference]]` · `[[existing-artifact]]` · `[[future-workstream]]`.

These are **quoted examples inside prose about linking** — several inside
`_referent_pass_report_2026-08-02.md`, a document *about* broken references whose illustrations are
counted as broken references. The masquerade class named in the mechanism map: **a document
describing a defect is scored as exhibiting it.**

**Disposition**: instrument-side. The audit needs escaping or exclusion semantics for illustrative
references (e.g. inline-code-fenced `` `[[x]]` `` exempt, or `_`-prefixed reports excluded from
wikilink scoring as they already are from topic counting). ⛔ **No corpus edit.** This is the
single change that would most improve the signal-to-noise of the instrument's own headline number.

### B — truncation (6 occ) — root cause identified, and it is NOT truncation-on-write

5 of 6 are the identical string `[[project_six_category_artifact_typolo]]`, appearing in five
*different* files: `feedback_controls_and_referents_index` · `project_anchor_consent_gate_live` ·
`project_colab_studio_container_architecture` · `project_scaling_readiness_overview` ·
`project_sovereignty_claim_vocabulary`.

**The target file is intact.** `project_six_category_artifact_typology.md` carries
`name: project-six-category-artifact-typology` — correct, untruncated, contract-conformant.

> **Producing mechanism: the reference was copied from a sibling record rather than resolved
> against the target's identity.** One session truncated it once; four later sessions cited the
> citation. This is *citation-by-copying-a-neighbour*, not a write-path character limit.

The 6th (`[[project_maia_voice_constitution]]` → `project_maia_voice_constitutional_constraint`) is
a distinct, single-instance case: a reference to a **differently-named** record — either a rename
that inbound links did not survive, or a guessed identifier. It is the corpus's only observed
instance of the rename-survival gap.

**Disposition**: the writer obligation now in `RESOLUTION_CONTRACT.md` ("never truncate a slug")
addresses the write; the copy-propagation mechanism additionally warrants the standing writer rule
*resolve a reference against the target, never against another record's citation of it.* Repairing
the 6 instances is a **candidate**, not authorized here.

### C — never-written (70 occ, ~47 targets) — the interesting population

All 70 are in **live topic files, zero in archival**. Top targets:

| target | refs | reading |
|---|---|---|
| `project_constitutional_methodology` | **13** | a methodology repeatedly cited as if canonical, never authored |
| `project_recognition_first_development` | 5 | |
| `earn-before-name` / `project_earn_before_name_epistemology` | 5 | same concept, two identifiers, neither written |
| `project-maia-formation-architecture-candidate` | 2 | canon doc exists (`MAIA_FORMATION_ARCHITECTURE_2026-08-06.md`); the *memory* was never written |
| `sovereign-placement-principle` · `ain-os-field-manifest-spec` · `feedback_methodology_not_the_product` | 2 each | |

Top referrers: `project_constitutional_rd_discipline` (×5) ·
`feedback_location_confers_false_authority` (×3) · `project_recognition_runtime` (×3) ·
`project_session_room_vs_vision_studio` (×3).

**These are not lost memories. They are promised ones** — forward references authored in good faith
to records that were never subsequently written. The `[[X]]` convention explicitly permits this
("a `[[name]]` that doesn't match an existing memory yet is fine; it marks something worth writing
later"), so a nonzero C-population is *by design*. What is diagnostic is the **concentration**: a
target cited 13 times across the corpus is a concept the system relies on and has never recorded.

**Disposition — per target, three outcomes, ⛔⛔ never fabrication:**
- **abandoned intent** → the citing lines should be de-referenced or re-pointed at what was
  actually authored (e.g. the formation-architecture canon doc).
- **failed persistence** → check `git log -S` / session transcripts for a memory that was written
  and lost.
- **expected-but-never-established capability** → the reference is evidence of an unmet
  architectural obligation; it belongs in the decision docket, not in a placeholder file.

⛔⛔ **No synthetic memory may be created to satisfy any of these references.** A file written to
make the audit green would be exactly the fabrication the ruling forbids — and, given
`project_constitutional_methodology`'s 13 inbound citations, would immediately acquire unearned
authority by location.

## Recommended sequence (not authorized)

1. **A first** — instrument escaping. Cheapest, and it is the only class that is purely
   instrument-side; resolves 24% of the residual without touching the corpus.
2. **B second** — 6 mechanical re-pointings once the writer rule is stated.
3. **C last, and slowly** — 47 targets requiring individual judgment about what was intended. This
   is founder-facing triage, not a cleanup task.

**Post-triage residual will not be zero, and should not be.** Legitimate forward references are a
feature of the linking convention. The measure of health is the *concentration* of unwritten
targets, not their count.
