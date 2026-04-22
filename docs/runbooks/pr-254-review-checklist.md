# PR #254 — Review Checklist

> This checklist is specific to PR #254 and should not be reused as a general review checklist.

---

## Context

This PR is **additive to #252**, not a competing scaffold rewrite.

- #252 established the canonical `dialectical.md` synthesis scaffold
- This PR adds:
  - observability (fixture + evaluator + runners)
  - explicit absent-bundle signaling in both council builders
  - evaluator alignment to real emitted phrasing
  - Next Signal Loop spec (docs only)
  - PR-specific runbooks (review + deploy)

---

## A. No `dialectical.md` override

- [ ] Confirm **no conflicting rewrite** of `lib/ain/synthesis/dialectical.md`
- [ ] Ensure the canonical scaffold from #252 remains intact
- [ ] Any references to evidence limits should rely on #252 behavior, not redefinition here

---

## B. Absent-bundle signaling present (both builders)

### Files to check:
- `lib/studio/leadership/situationTypes.ts`
- `lib/studio/changes/changeTypes.ts`

- [ ] When `inputBundle` is **undefined**, builder emits explicit signal:
  - "NO EVIDENCE BUNDLE PROVIDED"
  - no client inquiry
  - no field signals
  - no practitioner observations
- [ ] Instruction clearly tells synthesis to **name this limitation rather than infer around it**
- [ ] Pattern mirrors the already-shipped absent-bundle logic

---

## C. Changes intervention contract untouched

- [ ] No weakening of intervention-design language:
  - "next smallest useful intervention"
  - "witness-first vs technique"
  - "success signal"
  - "risk/caution"
- [ ] No attempt to force strategic/plural framing into Changes surface
- [ ] Changes remains **clinical / practitioner shaped by design**

---

## D. L5 token override is scoped

### File to check:
- `lib/ain/consultation.ts`

- [ ] `maxTokensOverride: 3000` applies **only to council synthesis call**
- [ ] No global change to all L5 usage
- [ ] No unintended increase in token usage outside this path

---

## E. Observability files are dev-only

- [ ] `tests/fixtures/`, `tests/council/`, evaluator, and runners:
  - do not alter runtime behavior
  - are not imported into production paths
- [ ] No accidental coupling between evaluator and live synthesis

---

## F. No schema or migration required

- [ ] No database schema changes
- [ ] No migration files
- [ ] Safe deploy without DB coordination

---

## G. Evaluator alignment is additive

- [ ] `names_uncertainty_or_limitation` concept updated to match real phrasing:
  - "no field signals"
  - "evidence limits"
  - "what is missing"
- [ ] No removal of important concept checks
- [ ] Structural and concept checks are consistent (no contradictory results)

---

## H. Next Signal Loop spec is docs-only

### File:
- `docs/canon/NEXT_SIGNAL_LOOP_SPEC.md`

- [ ] Spec clearly defines:
  - intent
  - invariants
  - scaffold changes
  - builder changes
  - API implications
  - frontend contract
- [ ] No runtime implementation included in this PR
- [ ] Clearly marked as **future work**

---

## I. Runbooks present and scoped

### Files:
- `docs/runbooks/pr-254-review-checklist.md`
- `docs/runbooks/pr-254-deploy-checklist.md`

- [ ] Both include disclaimer: "specific to PR #254"
- [ ] Instructions are concrete and copy-pasteable
- [ ] No attempt to generalize into canonical docs

---

## J. Overall integration check

- [ ] Works **on top of #252**, not against it
- [ ] Builder signals + scaffold behavior compose correctly
- [ ] No regression risk introduced
- [ ] PR is narrow, additive, and reviewable as a unit

---

## Expected outcome if correct

After merge + deploy:

- Fresh consultations should:
  - explicitly name **evidence limits** when no bundle is present
  - avoid inference from missing data
  - remain coherent and domain-appropriate
- No banned synthesis rhetoric should appear

---

## Reviewer guidance

If something feels off, check:

1. Is this trying to override #252?
2. Is this introducing runtime coupling from test/evaluator code?
3. Is Changes being forced into a Decisions-style frame?

If none of those are true, the PR is likely correct.
