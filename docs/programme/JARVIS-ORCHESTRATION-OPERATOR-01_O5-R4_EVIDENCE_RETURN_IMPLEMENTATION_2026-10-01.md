# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R4 — Evidence Return Implementation

**Date:** 2026-10-01
**Base / frozen-law parent:** `b1c719610` (`chore/o5r4-evidence-return-census-20261001`)
**Class:** B — Structural Risk
**Standing:** ⭐ IMPLEMENTATION COMPLETE · LOCAL PROOFS GREEN · ⛔ NOT MERGED · ⛔ INSTALLED JARVIS UNTOUCHED

## 1. Scope carried from the frozen R4 instrument

Only the evidence-return boundary was implemented:

1. W4.v2 admits `finding` and `proposal` while the Work Unit is `EXECUTING`;
2. evidence lands in `evaluation.findings[]` / `evaluation.proposals[]`;
3. immutable evidence identity is derived as `sha256:<digest>` from the canonical normalized record, so frozen R1 payload fields are not amended with new ID fields;
4. duplicate evidence is explicitly refused;
5. ordinary and cross-lane finding schemas are closed;
6. proposal→O1 `CANDIDATE` is a separate pure projection from the W4 record;
7. candidate projection is idempotent by `source_ref`;
8. a candidate cannot satisfy O1 continuation inheritance;
9. an authentic cross-lane consequence finding projects as evidence to exactly its `affected_lane`, with forged/tampered records refused.

No scheduler, O7 founder inbox, O8 semantic merge, automatic work creation, authority grant, cross-lane write, lifecycle-state addition, or W4.v1 runtime path was added.

## 2. W4.v2 implementation

`scripts/builder/work-unit-ledger-v2.mjs` extends the existing ledger machinery rather than creating a second ledger.

### New evidence kinds

- `finding`;
- `proposal`.

Both are admitted only in `EXECUTING`.

### Finding schemas

Ordinary finding, exact fields:

`kind · source_act · summary · urgency`

Cross-lane consequence finding, exact frozen R1 fields:

`kind · source_act · affected_lane · reason · evidence_refs · urgency`

`urgency` remains `low · normal · high`. Unknown fields fail closed. Thus `suggested_patch`, commands, paths, authority, grants, instructions, or any unlisted field cannot ride inside a finding.

### Proposal schema

Exact fields:

`kind · source_act · summary · proposed_kind`

`proposed_kind` remains descriptive evidence only. W4 never interprets it as work or authority.

### Backward compatibility

Existing W0.v2 records do not contain `evaluation.findings` or `evaluation.proposals`. W4 creates the relevant array only on the **cloned append target**. Existing envelopes therefore require no migration or rewrite.

The W2 authorized-core snapshot is unchanged because it contains only evaluation conditions, not mutable evidence arrays. The existing W4 immutable-surface check remains the enforcement boundary.

## 3. Immutable evidence identity

A finding/proposal record ID is derived from:

`SHA-256(kind + canonical normalized JSON)`

and returned as `sha256:<digest>`.

No payload ID field was added. This preserves the R1 closed consequence-finding field set exactly.

Appending the same canonical evidence again returns the existing W4 duplicate refusal (`DUPLICATE_FINDING_ID` / `DUPLICATE_PROPOSAL_ID`). A content change produces a distinct evidence identity rather than silently coalescing by summary text.

## 4. O1 evidence projection

`jarvis-desktop/src/operator-intent-contract.js` adds `STANDING.CANDIDATE` and two pure projection functions:

- `projectExecutorProposalCandidate(record)`;
- `projectExecutorProposalCandidates(records)`.

`compileIntent()` is unchanged in behavior and continues to emit only `CLEAR · AMBIGUOUS · INVALID` from operator speech.

A valid W4.v2 proposal record projects to:

- `standing: CANDIDATE`;
- `raw_utterance: proposal.summary`;
- `source: executor-proposal`;
- `source_ref: w4-proposal:<W4 record id>`;
- `authority_grants: []`.

No requested level or authority mentions are inferred from executor language. A proposal saying “deploy production immediately” remains candidate evidence; it is not compiled as operator release intent.

Repeated reads are deduplicated by `source_ref`, not free-text summary. Two distinct proposal records with identical summaries remain distinct candidates.

A `CANDIDATE` is deliberately not accepted as the prior `CLEAR` intent for `continue`, so candidate evidence cannot bootstrap itself into continuation authority.

## 5. E9 targeted consequence projection

`scripts/builder/o5-consequence-finding-projection-v1.mjs` is a pure read/projection seam. It does not create or persist an inbox. It accepts only an authentic W4.v2 consequence-finding record whose `sha256:` identity recomputes from its canonical entry.

A conforming record projects to the four-field frozen shape:

`target_lane · source · source_ref · evidence`

with `target_lane` exactly equal to `affected_lane`, `source=executor-consequence-finding`, and `source_ref=w4-finding:<W4 record id>`. Ordinary findings, forged record IDs, and records whose payload has been altered after admission project to `null`.

The live-host integration proof delivers the projection into a synthetic lane map and proves exactly the named lane receives one copy while every other lane remains empty. This is evidence propagation only; no persistent lane inbox, O7 surface, O2 node, O3 authority, command, patch, or cross-lane write is introduced.

## 6. Evidence earned

### R4 real-module integration

`node --test jarvis-desktop/test/o5-r4-evidence-return.test.mjs`

**5/5 pass**:

- evidence-only append + digest identity + duplicate refusal, with identity/context/scope/authority/routing/execution/verifier-results/provenance/state all byte-equivalent before/after;
- ordinary/consequence closed finding schemas + no finding projection;
- separate proposal→O1 candidate projection + stable source-ref idempotency;
- evidence admission closes after leaving `EXECUTING`;
- E9 targeted lane projection, ordinary-finding non-projection, and forged/tampered record refusal.

### Existing substrate regressions

- W4.v2 proof: **23/23**;
- W2.v2 lifecycle proof: **13/13**;
- Work Unit v2 end-to-end: **24/24 required falsifiers + 12/12 composition assertions**;
- O1 intent contract: **18/18**;
- O5-R1 frozen matrix: **LETHAL + DISCRIMINATING**;
- O5-R4 frozen matrix: **LETHAL + DISCRIMINATING**;
- O5-R4 freeze: **INTACT**.

`node --check` passes for the modified runtime modules.

### E9 implementation mutation probe

The projector was mutated under a file backup so `target_lane` always returned `lane-a`. The real-module suite failed **4 pass / 1 fail** at R4-E9 with the direct assertion `lane-a !== lane-b`. The original projector was then restored from the backup and verified byte-identical with `cmp`; the suite returned to **5/5**. No `git checkout` restoration was used.

## 7. What remains before admission

- the frozen-law PR must become canonical;
- this implementation must pass repository CI after reconciliation to then-current canonical;
- a post-merge installed Desktop deployment is a separate act, as with O5-R3.

No production or delegation-home state was touched by implementation or tests.

**Standing: O5-R4 IMPLEMENTED ✅ · AMENDED FROZEN LAW INTACT ✅ · REAL-MODULE PROOF 5/5 ✅ · W4 23/23 ✅ · W2 13/13 ✅ · E2E 24/24 + 12/12 ✅ · O1 18/18 ✅ · ⛔ NOT MERGED · ⛔ NOT DEPLOYED.**
