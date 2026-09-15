# MAIA-WISDOM — Programme State

**As of 2026-09-15.** Records rulings **R10–R15** and the lane split. ⛔ Authorizes nothing.

## Acts

| | State |
|---|---|
| ACT 1 — repository census | ✅ ACCEPTED |
| ACT 1B — completion witness | ✅ ACCEPTED |
| ACT 1C — C/D (elemental semantics · R9 pathways) | ✅ ACCEPTED |
| ACT 1C — A/B | → extracted to `MAIA-WISDOM-WITNESS-01` |
| Discovery — repository | ✅ sufficient |
| Discovery — external corpus · population | ⚠️ witness owed |

## Rulings

**R1–R9** carried. New:

- **R10** — Weather is an active Spiralogic environment at the **relational/field** level. Structural roles need not be symmetrical; Weather may be the environment *of the elemental whole* rather than a peer content category.
- **R11** — **Aether remains distinct from Weather and unadjudicated.** ⛔ No normalization, mapping or merge.
- **R12** — **Deterministic elemental derivation is evidence, not authority.** Reproducibility makes a derivation inspectable, ⛔ never canonical.
- **R13** — **Collective intelligence must admit disconfirming evidence.** Equal *admissibility*, not equal weight.
- **R14** — ⛔ Contribution volume · popularity · status · affinity · reputation **cannot establish epistemic authority.**
- **R15** — ⛔ **Conversation ≠ contribution. Distillation ≠ consent.** Contribution requires an act.

⭐ **R7 amended by R10/R11**, not replaced: the five environments stand as
Fire · Water · Earth · Air · Weather, ⛔ without asserting they are ontologically identical.

## Lanes

| Lane | State |
|---|---|
| ⭐⭐ **`MAIA-WISDOM-CONSENT-01`** — existing AIN ingress boundary | **OPEN** · ACT 1 census complete · ⚠️ reachability falsifier owed |
| **`MAIA-WISDOM-WITNESS-01`** — external corpus + production population | **OPEN, parallel** · ⛔ unreachable from any container · founder-side |
| `ACT 2C` — AIN toroidal circulation governance | ⛔ blocked on CONSENT-01 |
| `ACT 2B` — epistemic relationship / contradiction architecture | ⛔ not opened · ⚠️ R13 has no substrate |
| `ACT 2A` — source / provenance / rights / elemental carrier | ⛔ design may proceed; **implementation held for WITNESS-01** |
| `MAIA-WISDOM-RUNTIME-01` — live member route severance | ⛔ recorded, not opened |

## `MAIA-WISDOM-WITNESS-01` — custody obligation

⛔ **Not runnable from any remote container** — failed for the same environmental reason in
1B and 1C. Requires the Mac Studio / an authorized DB environment.

**A — external AIN filesystem census**

```bash
node scripts/witness/ain-corpus-census.mjs \
  --root "/path/to/_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1" \
  --out  ~/ain-census-2026-09-15
```
Read-only; refuses to start if `--out` resolves inside `--root`; validated against the
in-repo corpus (739 files, all machine-readable, 738/739 without ratified frontmatter,
15 redundant files).

**B — production population truth** (read-only, no writes)

```sql
SELECT 'ain_knowledge_chunks' t, count(*), count(embedding) embedded FROM ain_knowledge_chunks
UNION ALL SELECT 'corpus_chunks', count(*), count(embedding) FROM corpus_chunks
UNION ALL SELECT 'library_chunks', count(*), count(embedding) FROM library_chunks
UNION ALL SELECT 'library_sources', count(*), count(*) FILTER (WHERE ingestion_status='completed') FROM library_sources;
-- elemental tagging health:
SELECT meta->>'element' e, meta->>'element_secondary' e2, count(*) FROM library_chunks GROUP BY 1,2 ORDER BY 3 DESC;
```

⭐ **Result is a merge/admission gate for `ACT 2A` implementation** — ⛔ never a blocker on
CONSENT-01, 2C governance, or 2B epistemic design.

## Open question carried

**F.13** — the Unified Field ⇄ AIN boundary census (46 files carry unified/collective-field
language) remains **uncensused**; its own read-only act.
