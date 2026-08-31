---
level: index
---

# Constitutional Classification Index

> **Phase III — Constitutional Consolidation · the Freeze (in-place classification).**
> Every document in `docs/canon/` has been read by content and assigned a `level:` in its frontmatter, answering one question: **"Is this law, or a consequence of law?"**
>
> **This is non-breaking governance cartography.** No files moved, no paths renamed, no code/CI/runtime references changed. The classification makes document *levels visible* while preserving every current assumption. (Rationale: `docs/canon/` is presently *both* a governance category and an implementation dependency — ~26 docs and ~30 code comments reference these paths. **Classify meaning first; decouple paths second; relocate third, only if still warranted.**)
>
> Levels here are the **proposed freeze decision**, subject to authoring. The classifiers leaned generous toward Constitution → **17 is still above the 8–12 target**; the remaining reduction is *consolidation* (folding overlapping vows), a constitutional act reserved to the founder, not performed here.

## The five levels

| Level | Question it answers |
|---|---|
| `constitution` | What must always be true? (vow / invariant / irreducible boundary) |
| `jurisprudence` | How is the Constitution interpreted? (principle / doctrine / precedent) |
| `protocol` | How is it applied in one domain? |
| `architecture` | What structures / maps / audits implement it? |
| *(implementation)* | What code realizes it? — lives in `app/` `lib/` `database/`, not here |

---

## CONSTITUTION (17) — *what must always be true*

`MAIA_OATH` · `MAIA_SOVEREIGNTY_INVARIANTS` · `MAIA_CANON_v1.1` · `MAIA_IDENTITY_ONTOLOGY` · `MAIA_PROMISE_v1.0` · `MAIA_MEMORY_CANON_v1.0` · `MAIA_EPISTEMIC_TONE_SPEC_v1.0` · `LONGITUDINAL_MEMORY_CATEGORY_GRADIENT` · `CHANGES_SECTION_EPISTEMIC_DISCIPLINE` · `CIRCLE_FIELD_DOCTRINE` · `FEDERATED_RELATIONAL_ARCHITECTURE` · `FIS_FIELD_STATE_PRIMITIVE` · `RECOGNITION_INTEGRITY` · `RIGHT_TO_REMAIN_UNPOSSESSED` · `SPIRAL_CONTINUITY_ENGINE` · `THE_CLEARING` · `TRANSPARENT_ENCHANTMENT`

> **Consolidation candidates (founder's call, not done here):** `MAIA_PROMISE_v1.0` largely restates `MAIA_OATH`; `MAIA_FAILURE_BOUNDARIES` (jurisprudence) is exegesis of `MAIA_CANON_v1.1`; several sacredness/clearing vows (`THE_CLEARING`, `TRANSPARENT_ENCHANTMENT`, `RECOGNITION_INTEGRITY`, `RIGHT_TO_REMAIN_UNPOSSESSED`) may fold toward a smaller core. Reducing 17 → 8–12 is the next authored step.

## JURISPRUDENCE (14) — *how the Constitution is interpreted*

`MAIA_AS_MIRROR_INFRASTRUCTURE` · `INTERFACE_HUMILITY` · `DISCIPLINED_NON_COLLAPSE` · `MAIA_FOUNDATIONAL_CONTEXT` · `MAIA_FAILURE_BOUNDARIES_v1.0` · `MAIA_SANCTUARY_ECONOMY` · `MAIA_SPOKEN_MANIFESTO` · `MEDIA_FIELD_AND_RELATIONAL_FIELD_BOUNDARIES` · `PATTERN_PRIMITIVE` · `CORPUS_WEIGHTING_SCHEMA_v1.0` · `SACREDNESS_AS_ARCHITECTURAL_ORIENTATION` · `THE_SACRED_AND_ITS_ARCHITECTURE` · `SOULLAB_VOICE_DOCTRINE_DAOIST` · `SYMBOLIC_GUIDANCE_LAYER_DOCTRINE`

## PROTOCOL (11) — *how the law is applied in one domain*

`MARKETING_CLAIM_DISCIPLINE` · `CONSTITUTIONAL_AUDIT_PROCESS` · `CORPUS_DISCIPLINE_PROTOCOL_v1.0` · `FOUR_LAYER_SUBSTITUTION` · `ORACLE_CORPUS_DESIGN_v1.0` · `MAIA_ASK_LAYER` · `MAIA_KNOWLEDGE_FIELD_v1.0` · `MAIA_CONNECTOR_EXPERIENCE` · `NEXT_SIGNAL_LOOP_SPEC` · `SESSION_REVIEW_LENS_CONSTITUTIONS` · `SOULLAB_PRESS_DOORWAY_METHOD`

## ARCHITECTURE (10) — *structures, maps, audits*

`MAIA_SYSTEM_MAP` · `MAIA_CURRENT_STATE_v1.0` · `MAIA_WIRING_AUDIT_v1.0` · `MAIA_MEMORY_ROADMAP` · `MAIA_KNOWLEDGE_FIELD_12_DOMAIN_MAP` · `FIELD_GRAVITY_ARCHITECTURE` · `ICHING_STRUCTURAL_ENGINE` · `INTELLIGENCE_FIELD_ACCESS_MAP` · `SOULLAB_THEME` · `SOVEREIGN_STORAGE_SOP_v1.0`

---

## Reconciliation items (flags, not blockers)

Two documents are *referenced* (in `CLAUDE.md` and/or session memory) but **do not exist** in `docs/canon/` on this branch:

- `MAIA_ATTENTION_DOCTRINE.md` — referenced by CLAUDE.md's "Attention Doctrine Check" and memory; **absent**.
- `GOVERNANCE_REVIEW_INSTRUMENTS.md` — referenced by memory; **absent**.

Resolve by either authoring the missing documents or correcting the references. Not a blocker for this classification.

---

## The constitutional sequence

```
1. Classify meaning first      ← THIS PR (non-breaking)
2. Decouple paths second       ← separate engineering task (update the ~56 code/doc refs)
3. Relocate files third        ← only if still warranted, after decoupling
```

**A document can be reclassified without being relocated.** That is the correct move precisely because the path itself has become load-bearing. The Atlas (`docs/MAIA_CONSTITUTIONAL_ATLAS.md`, separate draft, PR #484) is the wider navigation map; this index is the freeze decision for `docs/canon/`.
