# RF-R3 — Ratification Record

**Founder:** Kelly · **Steward:** JARVIS · **Date:** 2026-08-13
**Governing:** founder ruling D-9, 2026-08-13 (custody sequence, step 5)

This record exists so that the rulings of 2026-08-13 point at **repository-custodied
content** rather than at paths in one person's working tree. It **records** what the
founder ruled; it does not confer authority of its own.

---

## 1. The custody commit

| | |
|---|---|
| **Custody commit** | `5637d09a9e9b30315f4c1338dd8741485655508f` |
| **Branch** | `chore/rf-custody-2026-08-13` |
| **Rooted at** | `22200f967` — deployed production; `fix(relational): contain inferred rupture state at write and at read` |
| **Lineage** | `22200f967` verified **ancestor** of this branch. 3 commits, 20 files, **documentation only**. ⛔ No unrecorded divergence; no runtime, schema, migration or application code touched. |

⛔ **This branch is not a deploy candidate.** Landing it changes nothing about what is
running. It carries **no** deployment authorization.

## 2. The exact governed documents

Identity is the **blob hash**, not the path — two files sharing a name are not the same
file.

**Baseline, as authored** (custody commit `5637d09a9`):

| Ref | Path | Blob |
|---|---|---|
| A1 | `docs/design/relational-field/RELATIONAL_FIELD_R3_R6_DESIGN_2026-08-13.md` | `1f92da54bbf29e5e583fc81ac913a9167bf73ca6` |
| A2 | `docs/design/relational-field/RF-R3_PROVENANCE_BOUNDARY_2026-08-13.md` | `e29d39d32a8560d0611cb216e2b30ab3090b0f59` |
| A4 | `docs/governance/RELATIONSHIP_ROOM_CONSTITUTION_RATIFICATION_BRIEF_2026-08-13.md` | `0b64a7954905acd2d943cc5bb6100eb6a6ea63ac` |
| A5 | `docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md` | `c1f5dfa4a1c199aaa276fc534e632698ff543d49` |

**Governed state, rulings applied** (ruling commit `2e6bee424`):

| Ref | Blob | Changed |
|---|---|---|
| A1 | `756a79ca04a993cae67b26091760b8e69f0cd038` | ✅ |
| A2 | `548748acb116f03da869f97857e4e788c9647b15` | ✅ |
| A4 | `0b64a7954905acd2d943cc5bb6100eb6a6ea63ac` | — unchanged |
| A5 | `c1f5dfa4a1c199aaa276fc534e632698ff543d49` | — unchanged |

⭐ **A5, the Constitution, is byte-identical across both commits.** Canon was custodied,
never edited. Every correction landed in the design documents, which is the correct
direction: canon governed, and the design documents yielded to it.

## 3. What the founder ruled

Nine decisions, 2026-08-13. Each was one question of principle carrying a recommended
ruling; the founder ruled each.

| # | Ruling |
|---|---|
| **D-1** | Release **marks permission; it never destroys.** `Erase` is a separately named destructive act whose deletion, audit, backup and propagation semantics **require their own contract**. |
| **D-2** | Correct makes the predecessor **unavailable as an expression of the member's meaning** while retaining immutable lineage. Supersede **preserves it as dated history**, offerable only with provenance and continuing consent. |
| **D-3** | **Anti-laundering holds.** A member-authored correction to a declaration may persist as a new declaration event. A correction of MAIA's observation does **not** authorize the observation to persist; before RF-R6 only the member's resulting words carry forward. |
| **D-4** | A governing document **may not describe a boundary as live structural containment without an exact code referent and a mutation-failing test.** ⭐ Production satisfies it — see §4. |
| **D-5** | **Meaning-bearing presentation is expression.** System-selected ordering, prominence, badges, omission and juxtaposition are governed as utterances. Neutral deterministic chronology and member-selected organization are not automatically interpretation. |
| **D-6** | Retrieval consent applies **only to the member's private field.** Sharing requires a separate, attributable consent event naming declaration, recipient or space, purpose, and revocability. |
| **D-7** | `HOLD` and `Repudiate` are **neither combined nor added to declaration lineage.** HOLD sits at the threshold before declaration and creates no relational assertion. Repudiate challenges **authenticity** and invokes quarantine and integrity review, not semantic correction. |
| **D-8** | **Strike** *"what is trying to emerge."* Aether may support integrative posture but may not manufacture emergent meaning. If the **member** asks, MAIA may accompany the inquiry without asserting an emergence exists. |
| **D-9** | **Yes.** No governing design document may bind implementation, ratification, or member experience while it exists only as an untracked working-tree artifact. **Existence is not custody.** |

**Also corrected, per founder direction:** every exemplar asking whether the
relationship has changed is withdrawn from both design documents — Article VII governs,
and canon outranks a design document. *"current"* is split into **lineage standing** and
**present offerability**, both event-derived, ⛔ neither ever a cached authority bit. The
**selection principle** is stated explicitly. Shared-space composition must begin from a
**separately authorized input set**. The see/say boundary is reconciled without
discarding either instrument.

## 4. Reconciled state of fact

Established by ref-bound read at exact production SHA `22200f967`:

| Claim | Standing |
|---|---|
| Structural containment (`DECLARATION_CAPABLE_SOURCES`, fail-closed, gating write `:178` and read `:285`) | ✅ **ESTABLISHED** as a source fact |
| The design inquiry's contrary finding | ⛔ **WITHDRAWN** — wrong-referent evidence (searched `d41b8b355`, two days older) |
| `elemental_dynamics` socket · relationship ownership hole | ✅ established **in source** at production SHA |
| Containment test fails under **text** mutation | ✅ established — and it is **source-text assertion only**, never executing the gated functions |
| **Runtime** containment behaviour | ⛔ **NOT ESTABLISHED** |
| `relationship_essences` behaviour | ⛔ **NOT ESTABLISHED** |
| Relationship surface **files** present | ✅ established |
| Relationship surface **runtime reachability** | ⛔ **NOT ESTABLISHED** |
| Every production **row count** | ⛔ **NOT ESTABLISHED** — no database witness taken |

## 5. What this record does **not** do

- ⛔ It does **not** authorize implementation. **Building remains closed.**
- ⛔ It does **not** authorize deployment. Nothing here reaches a running system.
- ⛔ It does **not** convert any NOT ESTABLISHED row above into a fact. A runtime and
  database witness remains **unrun**, and no design ruling rests on one.
- ⛔ It does **not** ratify the design inquiry. `inquiry/` is **non-authoritative
  evidence** with a recorded defect — see `inquiry/PROVENANCE.md`.

## 6. Standing after this record

| Item | State |
|---|---|
| A1, A2, A4, A5 | **repository-custodied** at `5637d09a9`; governed state at `2e6bee424` |
| D-1 … D-9 | **ratified**, and now pointing at custodied content |
| A1/A2 as **binding** authority | ⛔ still **PROPOSED — NOT YET BINDING** pending founder ratification of the successor |
| Design inquiry | non-authoritative evidence, defect recorded |
| Runtime and database claims | ⛔ **NOT ESTABLISHED** |
| Building | ⛔ **CLOSED** |
