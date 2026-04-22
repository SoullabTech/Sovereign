# PR #254 — Review Checklist

> This checklist is specific to PR #254 and should not be reused as a general review checklist.

PR #254 is **intentionally additive** to the scaffold rewrite that landed in #252. Review it against that frame — not as a standalone behavior change.

## Scope reminders

- #252 landed the canonical `lib/ain/synthesis/dialectical.md` rewrite with epistemic discipline
- This PR adds the complementary runtime signal + observability layer
- No DB migration, no frontend change, no temperature/model/framing change in this PR

## Code review checks

### A. No duplicate scaffold changes

- [ ] `lib/ain/synthesis/dialectical.md` is **not** modified by this PR
- [ ] Diff confirms this file is untouched vs `clean-main-no-secrets`
- [ ] If any commit in this PR touches that file, reject — #252 is canonical

### B. Absent-bundle signaling exists in both builders

Both question builders must explicitly emit a `NO EVIDENCE BUNDLE PROVIDED` block when `inputBundle` is undefined.

- [ ] `lib/studio/leadership/situationTypes.ts` — has an `else` branch after the `if (inputBundle)` block that emits the absent-bundle block
- [ ] `lib/studio/changes/changeTypes.ts` — same pattern, parallel to Decisions
- [ ] The absent-bundle text names three concrete absences: no client inquiry, no field signals, no practitioner observations
- [ ] The absent-bundle text instructs synthesis to name this limitation in the Evidence Limits section (or equivalent per #252's scaffold) and prefer information-generating moves

### C. Changes intervention contract is untouched

- [ ] `changeTypes.ts` INTERVENTION DESIGN synthesis-instructions block (next smallest useful intervention, witness vs technique, success signals, risk/caution, observation window) is preserved
- [ ] No weakening of singular-action clinical framing

### D. L5 override is scoped, not global

- [ ] `lib/ain/consultation.ts` — `maxTokensOverride: 3000` is passed **only** at the council synthesis call site (around line 293-297)
- [ ] `lib/consciousness/LLMProvider.ts` L5 default (1200) is **not** changed — other L5 callers continue to use the default
- [ ] The override has a comment explaining why (truncation of multi-section synthesis output)

### E. Observability files are dev-only

These files must have zero runtime effect on the serving path:

- [ ] `tests/fixtures/council/*.{md,json}` — fixtures only, not imported by production code
- [ ] `tests/council/council-synthesis.evaluator.ts` — not imported by production code
- [ ] `tests/council/run-council-gold-standard.ts` — not imported by production code
- [ ] `tests/council/run-decision-gold-standard.ts` — not imported by production code
- [ ] `docs/examples/council-synthesis-gold-standard.md` — pointer doc only

### F. No schema or migration risk

- [ ] No SQL migration files added in this PR
- [ ] No changes to `database/migrations/`
- [ ] No DB client changes in `lib/db/`
- [ ] No new columns, indexes, or tables implied by the code changes

### G. Evaluator alignment is additive

- [ ] `tests/fixtures/council/gold-standard-support-network-synthesis.json` — `names_uncertainty_or_limitation` regex is broadened (not narrowed); no required concepts removed
- [ ] `tests/council/council-synthesis.evaluator.ts` — the duplicate structural "names missing data" rule is removed (evidence-limits naming now owned by the concept layer); no other structural rules removed

### H. Spec is docs-only

- [ ] `docs/canon/NEXT_SIGNAL_LOOP_SPEC.md` — no code references, no imports, no runtime effect
- [ ] Spec explicitly notes "Not implemented" and lays out insertion points for a future commit

## Governance

- [ ] Confirm this is **additive** (not a scaffold rewrite) so Class C / normal review path applies, not Class A covenant gate
- [ ] If governance classification is unclear, consult `docs/canon/CHANGES_SECTION_EPISTEMIC_DISCIPLINE.md` (added by #252) and the project's Change Classification rubric

## Final sign-off

- [ ] Verification table in PR description (post-reconciliation run against main + #252 + this branch) is consistent with what reviewers see if they run the harnesses locally
- [ ] No `Co-Authored-By: Claude` attribution in any commit
- [ ] Leak guard passed on push (visible in push output)
