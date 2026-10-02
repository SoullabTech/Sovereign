# FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-1A-R1 — Withheld Identity Presentation Repair

**Date**: 2026-09-23
**Act**: R1-1A-R1 (founder HOLD on R1-1A — one narrow presentation repair)
**Against**: R1-1A candidate `4581f118d` on `fix/flagship-ec1-contract-reconciliation-20260923` · canonical `3f63ca653`
**Lineage**: suite `04f6cd3a1` → repair `9f7053d46` → this record
**Population**: `app/writers-studio/flagship/DevelopReview.tsx` (the `WithheldObservations` presentation and its reason copy only) · the additive R1-1A suite (L12 revised, D11 added) · this record. ⛔ No live mount · no R1-0 change · no FS1 change · production untouched.

## Defect and repair

The R1-1A withheld presentation rendered `reading <readingId>` and `<observationKey>` as visible chips, and L12 required those raw values in rendered text — codifying a leak of implementation identity into the writer's experience.

Now each withheld item carries `data-withheld="<observationId>"` · `data-reading-id="<readingId>"` · `data-observation-key="<observationKey>"` · `data-withheld-reason="<reason>"` and shows only the supported human fact:

| reason | visible copy |
|---|---|
| `frozen_citation_text_unavailable` | This observation still exists, but the passage it was made against has changed, and the passage text as MAIA read it isn’t available here to show it at that place. |
| `observation_address_unavailable` | This observation still exists, but it concerns Work structure rather than a particular prose location. |
| `lens_not_presentable` | This observation still exists, but the current Review presentation cannot yet display that lens. |

followed by *These observations still belong to this reading.* No identity is collapsed, discarded or derived.

## Suite

**L12 (revised)** proves both halves: every identity present structurally on its item (three `data-reading-id` matches for one reading, each key and reason attribute), AND — after stripping tags — no `dobs_`, reading id fragment, `o3`/`o5`/`o7`, `readingId`, `observationKey` or `observationId` in visible text; the three reason sentences visible; the population counted as existing (*not shown at their place · 3* · *still belong*) with no disappearance vocabulary; controlled states unaffected. **D11** renders the identities as visible chips and dies on L12. No existing law weakened; D1–D10 unchanged.

**Known-bad RED first**: on `4581f118d` the revised L12 failed with `machineIdsVisible=true` while D11 already died. After repair: **12/12 · 11/11 dead · LETHAL + DISCRIMINATING**.

## Gates

| Gate | Result |
|---|---|
| `matrix:ws-flagship-r1-1a` | 12/12 · 11/11 dead · LETHAL + DISCRIMINATING |
| `typecheck:ws-flagship-r1-1a` | PASS (allowances unchanged, blob-pinned) |
| controlled Review states | goldens 4/4 byte-identical (L8); frozen `render.tsx` unchanged: 44/44 captures + `witness.json` byte-identical |
| `verify:flagship-freeze` | 57/57 INTACT |
| `matrix:ws-flagship` · `-c1a` · `-c1b` · `-c1c1` · `-r1-readonly` | all LETHAL |
| `npm run typecheck` (ship) | 226 vs 239 · 0 regressions |
| `check:design-canon` · `ci:sovereignty` (29/29) · `check:no-supabase` · `check:no-openai` · `git diff --check` | green |

**Standing: R1-1A-R1 ✅ CLOSED ON CANDIDATE · STOPPED for founder re-adjudication of R1-1A · R1-1B NOT OPENED.** Carried forward: frozen `C1B-L6` admits exactly two `data-nav="write"` orientation entries, so visible Review navigation awaits its own successor law and governed re-freeze (R1-1C), not R1-1B.
