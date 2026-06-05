# Mayan Layer — Provenance-Aware Architecture (Spec)

**Date:** 2026-06-05 · **Status:** PROPOSED (spec only — no implementation) · **Governs:** the Mayan developmental-trajectory lens
**Governed by:** [MAIA Sovereignty Invariant 13 — Claim-Type Floor](../canon/MAIA_SOVEREIGNTY_INVARIANTS.md) · [Symbolic Guidance Layer Doctrine](../canon/SYMBOLIC_GUIDANCE_LAYER_DOCTRINE.md)
**Memory:** `project_symbolic_reasoning_governance`, `project_astrology_access_runtime_state`

---

## 0. Origin

MAIA computes **7 Manik** (Deer/Hand) for 1966-12-09. The member's authoritative reading (Mark Elmy's Three Pillars) places her at **12 Kame** (Death/Transformer), with a `Tijax → Kame → Ix` developmental structure. Those disagree — and the disagreement exposed that the current Mayan layer conflates three things that are not the same layer:

| # | Thing | Examples |
|---|---|---|
| 1 | **Calendar mathematics** | day sign, tone, trecena, year lord — *which correlation?* |
| 2 | **Ontology** | Three Pillars, Tree of Life, crossing ages, L/R powers, developmental transitions |
| 3 | **Interpretation** | Mark Elmy's reading of those structures; a practitioner's; a future MAIA synthesis |

The current layer is thin (day sign + tone + a short narrative) and the *engine's* correlation disagrees with the authoritative traditional (K'iche'/Guatemalan) count. **The fix is not "set Kelly = Kame."** That solves one case, not the architecture. Nor is it "replace everything with the engine," because the engine may still disagree with authoritative traditions.

**Core principle — provenance is meaning.** A day sign is not just a value; it is *who* calculated it, *which* correlation, *whether* a practitioner authored it, *whether* it was verified. That provenance changes how much standing the value has — exactly as it does for memory, entrustment, and continuity. So: **the computed chart (calculation layer) and the authored reading (interpretation layer) must coexist and never overwrite each other.**

---

## 1. Three layers to build

### Layer 1 — Mayan Core Schema (the ontology)

Replace the thin (day-sign + tone + narrative) model with the real unit of meaning — the developmental structure:

```
day_sign            tone            trecena         year_lord

conception_pillar   core_pillar     elder_pillar    future_elder

child_lhp   child_rhp
adult_lhp   adult_rhp
elder_lhp   elder_rhp
future_lhp  future_rhp

crossing_ages       # e.g. [11, 40, 52] — points where dominant energy shifts
```

Each pillar/power is itself a `{ tone, day_sign }` with the day-sign's archetype/meaning. This is the *developmental machine* (formation → core → elder; Tijax → Kame → Ix), not a static label.

### Layer 2 — Provenance (first-class)

Every Mayan **record** (and ideally every value) carries:

```
source_type   ∈ { computed, authored, imported, verified }
arena         ∈ { developmental, psychological, constitutional, climate, karmic_predictive }
source        # for computed: correlation/system id (e.g. "GMT-584283", "engine-v1");
              # for authored: author/practitioner (e.g. "Mark Elmy / Three Pillars")
verified_by   # nullable
verified_at   # nullable
computation_version / read_version
created_at
```

So MAIA always knows *"this came from a calculation"* vs *"this came from Mark Elmy's authored reading"* — different kinds of truth. **Computed and authored are stored as separate records; an authored reading never mutates the computed one, and vice versa.**

**Arena is first-class provenance, not just source.** Beyond *where a value came from*, each record (and each system) carries its **arena of inquiry** — what *kind* of question it answers. This is the hinge to the relevance layer (Invariant 13, layer 3): MAIA isn't choosing between *astrology systems*, it's choosing between *arenas*.

| System | Arena |
|---|---|
| Mayan (Three Pillars) | `developmental` |
| Western | `psychological` |
| Wu Xing / BaZi | `constitutional` |
| Da Yun | `climate` |
| Sidereal/Vedic | `karmic_predictive` → pairs directly with Invariant 13 **Tier 2** hard floor |

Tagging arena at the data layer is what lets a future relevance layer route a *developmental* question to Mayan and a *constitutional* one to Wu Xing — and it binds the karmic/predictive arena to its hard-floor gate at the schema level, not as an afterthought. The provenance model is therefore the foundation for the translator architecture: lens routing by **arena**, governed by **claim type**, grounded in **source**.

### Layer 3 — Interpretation / surfacing

MAIA names provenance when it speaks, under Invariant 13 Tier 1 (lens, not assertion) and the convergence safeguard:

- *"According to the authored reading in your record (Mark Elmy)…"*
- *"According to the calculated chart…"*

**On divergence, surface both, name the disagreement, and use the member's chosen authoritative source.** The target honest output:

> "The computed correlation produces **Manik**. Your authored reading from **Mark Elmy** places you in **12 Kame**, with the Tijax → Kame → Ix developmental structure. Those traditions disagree. The reading you've chosen as authoritative is the latter, so that's the lens I'm using."

That is simultaneously *more accurate* (it doesn't hide the disagreement) and *more aligned* with the governance architecture (it offers a lens, names its provenance, leaves the member as verifier).

---

## 2. Data model (proposed)

A new table (e.g. `member_mayan_profile`) keyed by `(user_id, source_type, source)` so computed and authored coexist:

- Ontology columns from Layer 1, stored structured (`pillars_json`, `powers_json`, `crossing_ages` int[]), not as a narrative blob.
- Provenance columns from Layer 2.
- A per-member **`authoritative_source`** pointer (which `source_type/source` the member has chosen as their lens — defaults to authored-if-present, else computed).
- The computed engine (`lib/astrology/mayanAstrology.ts`) writes `source_type=computed` records; authored readings are imported as `source_type=authored`. Neither path writes the other's rows.

The thin fields currently rendered in `maiaAstrologyContextService.ts` are replaced by the chosen-authoritative record's structured ontology, rendered under the `SYMBOLIC_LENS_BOUNDARY` wrapper.

---

## 3. Reference instance — Kelly / Mark Elmy (the seed)

Store the uploaded reading as the first `authored` record (`source = "Mark Elmy / Three Pillars"`):

- **day sign** 12 Kame · **trecena** Tz'ikin · **year lord** 6 Kej
- **conception** 4 Tijax · **core** 12 Kame · **elder** 7 Ix · **future elder** 2 Iq'
- L/R powers: child 10 K'at / 11 E' · adult 5 E' / 6 Ajpu · elder 13 Ajpu / 1 Q'anil · future 8 Q'anil / 9 Ajmak
- **crossing ages** [11, 40, 52]
- `source_type=authored`, `verified_by=member` (Kelly chose it authoritative)

"An instrument must be calibrated before it can be integrated" — this is the calibration.

---

## 4. The correlation question (open decision, secondary)

The computed engine's correlation disagrees with the traditional count. Two non-exclusive options:

- **(a) Fix the engine's correlation** so computed records match the traditional K'iche' count for *everyone* (helps members without an authored reading). Requires identifying the correct correlation/epoch; any reading using a different correlation will still disagree.
- **(b) Leave the engine, rely on the authored override + honest divergence surfacing** (Kelly's lean). The provenance architecture makes this safe — divergence is named, not hidden.

**Spec recommendation:** ship the provenance architecture first (it makes either correlation behavior honest); treat the correlation fix as a *separate, lower-priority* accuracy task — because, per Invariant 13's three layers, **accuracy and the architecture are independent.**

---

## 5. Build sequence

1. Mayan Core Schema (ontology) + table.
2. Provenance as a first-class field; computed and authored as separate records; `authoritative_source` pointer.
3. Seed Kelly's Mark Elmy reading as the `authored` reference instance.
4. Keep the computed engine separate (write computed records; do not overwrite authored).
5. Render the chosen-authoritative record into the bounded astrology channel; surface both + name the disagreement when they diverge.

## 6. Not in scope

- The correlation fix itself (open decision §4).
- Extending provenance to Western / Wu Xing (the pattern generalizes; this spec is Mayan-first).
- Authored-reading *ingestion UX* (manual entry vs upload vs parse) — a follow-on.

---

## 7. Why this is bigger than Mayan

*Provenance is meaning* is the same principle MAIA is already building around memory, entrustment, and continuity. A symbolic value's standing depends on its provenance, and the architecture's job is to **preserve provenance rather than collapse it into a single "truth."** The Mayan layer is the first symbolic system to get a provenance model; once proven, it becomes the template for every other symbolic system — the data-layer twin of the Invariant-13 governance layer.
