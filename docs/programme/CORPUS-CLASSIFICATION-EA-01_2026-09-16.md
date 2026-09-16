# CORPUS-CLASSIFICATION-EA-01 · Elemental Alchemy

**Date:** 2026-09-16  
**Base:** `bfdc06f71176841f62b3805806dc52f6433e08cd`  
**State:** single-item classification candidate; rebuild/embed remains separately held

## Subject

This tranche classifies exactly one historical source item:

`data/ain/source/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md`

No directory, filename family, neighboring work, or publication-shaped file inherits this decision.

## Classification

- classification: `published_knowledge`
- authority kind: `soullab_owned`
- evidence source: `in_file`
- required marker: `Copyright © 2024 by Kelly Nezat`

The marker is mechanically present in the work at line 71 on the reviewed tree. Under CORPUS-AUTHORITY-01, the rule is admissible only because the marker is found in the candidate file itself; a free-text assertion would not satisfy the boundary.

## Real-corpus verdict

Against all 736 `.md` / `.txt` files under `data/ain/source`:

- admitted: **1**
- excluded: **735**
- refused: **0**

The sole admitted path is the Elemental Alchemy subject above. Every other legacy item remains governed by the broad `unclassified_legacy` rule and therefore excluded.

## Production state before this tranche

Production is already running the authority-evidence repair at `GIT_COMMIT=bfdc06f71`.

The runtime image does **not** contain `data/ain/source`; corpus source material is not available to the running application for accidental runtime ingestion.
Production corpus stores were witnessed immediately before this tranche:

- `ain_knowledge_chunks`: **0 rows**
- `library_sources` with `file_path LIKE 'data/ain/source/%'`: **0 rows**

Therefore this classification changes only future eligibility. It does not expose, retrieve, or reactivate any existing production corpus row.

## Local evidence

- admission/composition suite: **23/23 PASS**
- real 736-file verdict: **1 admitted / 735 excluded / 0 refused**
- root TypeScript: **229 vs baseline 239 · 0 regressions**
- `typecheck:scripts`: **40 base / 40 head**, head-only **0**, base-only **0**, identity sets identical
- provider governance: PASS
- no-Supabase: PASS
- design canon: PASS — no member-facing UI changes
- `git diff --check`: PASS

## Explicit holds

This tranche does **not** run or authorize corpus rebuild/embed. It does not classify any third-party work, operational artifact, or neighboring Soullab file. Any future corpus addition requires its own declared classification and mechanically verified authority evidence.
