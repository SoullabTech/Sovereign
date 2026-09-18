# WS-PASSAGE-CONVERSATION-01 — review candidate, 2026-09-18

## Scope and standing
Kelly authorized selected direction + editable intention; discussion while drafting; purpose names; context review; revision-specific confirmation; safe undo; actual MAIA testing. Builds on author-agency commit 780ad0372 and integrates canonical 78ba888aa. No merge to canonical or production deployment is authorized by this implementation turn.

## Implemented
- One selected direction replaces appended prompt blocks. Optional editorial question is selected once; free-form question and intention remain editable.
- Voice reference is explicitly included by checkbox and marked reference-only. On Discuss, the selected section context and active working revision are disclosed and sent through the existing canonical editorial turn.
- Desktop conversation sits beside wording; mobile stacks. Full sent context is inspectable without filling the conversation with prompt scaffolding.
- Discussion preserves unsaved working text. A newer proposal requires explicit acknowledgement before that draft is continued after the new version; lineage is never silently rebased.
- MAIA purpose names are read from rationale; writer-authored purposes persist through the existing member-version path as stated editorial rationale. Version history remains.
- Read in context is required for the exact candidate and current section; changing either invalidates the review. The compact sidebar opens this review rather than applying directly.
- Applied state comes from a durable exact-application receipt, independently of the active alternative or working draft.
- Undo uses server-held before/after section snapshots recorded atomically with adoption. It requires member ownership, an unspent undo record, the exact resulting draft version and an unchanged section body. It restores only that section and records undo atomically. Any later manuscript save causes refusal, including saves elsewhere. Older applications have no fabricated recovery snapshot.

## Migration
`20260918000006_editorial_application_recovery.sql` is required before this application build. It was bootstrapped/migrated in disposable local witness databases only. Original application receipts remain intact; recovery snapshots are immutable; only one complete undo receipt can be added. Reverting app code should retain recovery history. Dropping recovery history is not part of deployment rollback.

## Validation
- Real HTTP + disposable PostgreSQL + actual canonical MAIA calls: final strict-schema run **23/23 passed**, from a fresh synthetic conversation with no seeded alternatives.
- Actual generated alternatives were edited as a member version, applied verbatim, reread, reversed and checked against original; other section preserved.
- Recovery falsifiers: foreign member refusal; two concurrent undo requests execute once; failed receipt write rolls back manuscript/version; snapshot mutation refused; legitimate undo still succeeds after the injected failure.
- UI tests: direction exclusivity, draft preservation, explicit lineage continuation, context-review invalidation, partial editing, purpose history and revision-specific state.
- Browser preview: no page errors; no horizontal overflow at 390px; request/edit/discuss/save/review/apply/undo interaction exercised.
- TypeScript: 229 diagnostics versus baseline 239; zero new diagnostics.
- Sovereignty and design gates pass.
- Broad targeted population: 1203 pass / 4 fail. Two unchanged shellProjection assertions already fail on canonical. Two seamIsolation byte pins correctly flag the proposed shared-interface amendment below. No tests were skipped or weakened.

## Live-response defect and ratified amendment
Several non-strict provider calls returned malformed envelopes (including a string `proposal` with root-level `replacementText`). Runtime admission refused them; no malformed proposal entered the manuscript. Prompt clarification alone did not resolve this.

Ratified additive shared capability: `StructuredTool.schemaEnforcement?: 'required'`; the existing Anthropic adapter maps it to `strict: true`. Other callers omit it and retain identical wire parameters. No provider, model selection, fallback, validation or consent bypass is added. Editorial kind/adjunct and nonblank-content admission remain runtime obligations.

A top-level anyOf experiment was rejected by the provider; it was removed. The final request uses the existing object schema plus strict enforcement and passed the complete 23-check witness. This is bounded integration evidence, not a claim that every future model response is valid or editorially good.

Official source: https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use

## Shared-inference ratification — 2026-09-18
Kelly explicitly answered “yes” to approval of the specific shared-inference amendment in PR #1402 and its governed baseline update. The reviewed commit is **c4f96c853ba9246546383a93875b4ae5519e8c1b**. The scope is the optional `StructuredTool.schemaEnforcement` field in `types.ts` and its `strict: true` mapping in `anthropicStructuredAdapter.ts`. Policy and router are unchanged.

The governed baseline in `seamIsolation.test.ts` moves from `35d0f81d167dca73431ae7640d7fabf4bae86cff` to that reviewed commit. All four path comparisons remain unconditional, and the original seam merge remains preserved. No caller exemption, routing change, or validation relaxation is authorized. Other files in the reviewed commit do not acquire shared-seam baseline status.

Post-ratification regression run: **1205 passed / 2 failed**, 74 suites passed / 1 failed. All shared-inference checks, including the four byte pins, pass. The two remaining failures are the unchanged canonical shellProjection assertions described above. No additional model call or database migration was needed for this baseline-only update.

The earlier 1203/4 result above records the pre-ratification run; the two pin failures correctly enforced the approval boundary. This approval authorizes recording the amendment and updating PR evidence, not merging or deploying.

## Preview boundary and remaining acceptance
New loopback preview: http://127.0.0.1:4180. The existing 4178 preview was not replaced. The new preview is deliberately synthetic, uses fixed responses and memory-only application/undo; the live-MAIA and durable recovery evidence comes from the separate real API witness.

Kelly must still assess voice, rhythm, meaning and usefulness with real writing after review/admission. Two successful live turns do not validate creativity across genres. Production migration, release checks and deployment remain separate.

## Release-review repair — 2026-09-18
The two remaining shell failures were stale source-string assertions from before canonical creative-navigation previews (0ecab51b1). Replaced the blanket handler prohibition with rendered interaction coverage: future modes disclose availability, open only dismissible informational previews, contain no navigation/capability actions, and leave location unchanged. Built-room links preserve manuscript/section; missing manuscript identity remains non-navigable. The no-coming-soon assertion remains. No runtime behavior changed.

Final targeted population: **1209/1209 tests, 76/76 suites pass**. Earlier failing totals above remain historical evidence. Covenant metadata was corrected to the expected classification/rollback checkbox syntax; application rollback retains the additive recovery table and history. No additional inference calls or database mutations were needed. Merge and deployment remain separate.
