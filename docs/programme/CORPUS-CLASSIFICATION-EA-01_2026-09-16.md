# CORPUS-CLASSIFICATION-EA-01 · Elemental Alchemy

**Date:** 2026-09-16
**Base:** `b603fe52e33b0cd251a10dea0e0de7d29a95143e`
**State:** single-item classification candidate; rebuild/embed remains separately held

## Subject

This tranche classifies exactly one historical source item:

`data/ain/source/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md`

No directory, filename family, neighboring work, or publication-shaped file inherits this decision.

## Classification

- classification: `published_knowledge`
- authority kind: `rights_holder_authorized`
- evidence source: `governed_record`
- authority record: `docs/corpus-authority/elemental-alchemy.md`
- rights holder: `Kelly Nezat`
- required marker: `CORPUS USE AUTHORIZED — ELEMENTAL ALCHEMY — KELLY NEZAT — 2026-09-16`
- authorized subject SHA-256: `f57f17e6ab82f911a4932c1f2d5fa0149e8fe499c7461f60bd87f86d0f657af0`

The work itself states `Copyright © 2024 by Kelly Nezat`. Kelly has also stated that Soullab is a registered trademark to Kelly Nezat. The trademark fact is preserved as founder/brand provenance only; it is not treated as a copyright assignment. Corpus authority is therefore expressed as `rights_holder_authorized`, not `soullab_owned`: Kelly retains copyright ownership while explicitly authorizing Soullab / MAIA corpus use of this exact work revision.

## Real-corpus verdict

Against all 736 `.md` / `.txt` files under `data/ain/source`:

- admitted: **1**
- excluded: **735**
- refused: **0**

The sole admitted path is the Elemental Alchemy subject above. Every other legacy item remains governed by the broad `unclassified_legacy` rule and therefore excluded.

## Production state before this tranche

Production is running `GIT_COMMIT=d2a48d8052997b7048748a86c80fe1fc8ab8078a`, which mechanically contains the authority-evidence repair merge `bfdc06f71176841f62b3805806dc52f6433e08cd`.

The runtime image does **not** contain `data/ain/source`; corpus source material is not available to the running application for accidental runtime ingestion.
Production corpus stores were witnessed immediately before this tranche:

- `ain_knowledge_chunks`: **0 rows**
- `library_sources` with `file_path LIKE 'data/ain/source/%'`: **0 rows**

Therefore this classification changes only future eligibility. It does not expose, retrieve, or reactivate any existing production corpus row.

## Reconciliation to current canonical

While EA-01 was under review, `clean-main-no-secrets` advanced again to `b603fe52e33b0cd251a10dea0e0de7d29a95143e`. The final intervening range from `445a4d1a6f9a673231d12b9d5ab02519100e4fff` changed **41 paths** and had **zero path overlap** with EA-01's five governed files. The branch was merged forward without conflict, then the admission suite, digest witness, full 736-file verdict, root TypeScript gate, scripts identity comparison, provider governance, no-Supabase, design canon, and `git diff --check` were rerun on the reconciled tree.

## Local evidence

- admission/composition suite: **29/29 PASS**
- real 736-file verdict: **1 admitted / 735 excluded / 0 refused**
- root TypeScript: **229 vs baseline 239 · 0 regressions**
- `typecheck:scripts`: **40 base / 40 head**, head-only **0**, base-only **0**, identity sets identical
- provider governance: PASS
- no-Supabase: PASS
- design canon: PASS — no member-facing UI changes
- `git diff --check`: PASS

## Independent review amendment

The initial tranche used `soullab_owned` because the work names Kelly Nezat as copyright holder and Kelly also owns the Soullab® trademark. Review rejected that inference: trademark ownership and copyright ownership are separate rights, and the in-file copyright notice does not evidence assignment of the book copyright to Soullab.

The tranche now uses `rights_holder_authorized` instead. A governed record under `docs/corpus-authority/elemental-alchemy.md` preserves three distinct facts:

1. the work itself names Kelly Nezat as copyright holder;
2. Soullab® is a registered trademark to Kelly Nezat, which is identity/brand provenance only;
3. Kelly Nezat authorizes Soullab / MAIA corpus use of this work.

T24 witnesses that `published_knowledge` may be admitted by governed rights-holder authorization without asserting organizational copyright ownership. Additional negative witnesses require a named rights holder, a governed authorization record, and an exact subject SHA-256 match.

## Explicit holds

This tranche does **not** run or authorize corpus rebuild/embed. It does not classify any third-party work, operational artifact, or neighboring Soullab file. Any future corpus addition requires its own declared classification and mechanically verified authority evidence.
