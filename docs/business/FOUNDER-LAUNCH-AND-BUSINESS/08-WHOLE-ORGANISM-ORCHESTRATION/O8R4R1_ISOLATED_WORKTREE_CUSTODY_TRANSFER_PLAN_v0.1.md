# SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O8R4R1

## ISOLATED WORKTREE CUSTODY + EXACT PROGRAMME TRANSFER PLAN ONLY

**Status:** CUSTODY / TRANSFER PLAN ONLY · ISOLATED WORKTREE CREATED · NO PROGRAMME FILES TRANSFERRED · NO COMMIT · NO MERGE · NO DEPLOYMENT

## I. Why isolation is required

The active checkout contains substantial unrelated staged and unstaged work across House, Writer's Studio, Commons, Relationships, Reflections, Decisions, and other lanes.

The active checkout must therefore remain untouched for source-control admission.

Current active checkout:
- branch: `chore/a1-ls1r1-packet-transport-20260925`
- HEAD: `e886888416062c7fcbcf899040e3827bc8013835`

Isolated custody worktree:
- path: `/Users/soullab/MAIA-SOVEREIGN-O8-CUSTODY`
- branch: `chore/whole-organism-o8-custody-20260926`
- HEAD: `e886888416062c7fcbcf899040e3827bc8013835`
- initial status: clean

The active checkout branch and index were not changed by creating the worktree.

## II. Transfer ownership rule

> **Transfer only files constitutionally owned by the Whole-Organism O1–O8 programme or the exact O8R4 candidate route seam.**

Do not transfer a foreign implementation merely because a historical test imports it.

Three transfer classes are fixed:

### A. OWNED_TRANSFER
Files that belong to this programme and must move byte-for-byte.

### B. EXTERNAL_WITNESS_DEFERRED
Historical tests that depend on another lane's unadmitted implementation. Preserve their documentary evidence, but do not absorb their dependency.

### C. FORBIDDEN_UNRELATED
House, access, Studio, Writer's Studio, Decisions, Commons, Relationships, Reflections, or other concurrent implementation paths not owned by O1–O8.

## III. OWNED_TRANSFER set

### Programme documents

Transfer the entire directory:
`docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/`

This carries the complete O1–O8 documentary lineage, including O6 documentary topology evidence and all founder adjudications.

### Capability source plane

- `lib/maia/capabilityAuthorityRegistry.ts`
- `lib/maia/capabilityAwarenessProjection.ts`
- `lib/maia/explicitCapabilityInquiry.ts`

### Capability source tests

- `lib/maia/__tests__/capabilityAuthorityRegistry.test.ts`
- `lib/maia/__tests__/capabilityAwarenessProjection.test.ts`
- `lib/maia/__tests__/explicitCapabilityInquiry.test.ts`

### Constitutional test planes that are self-contained in this custody branch

- `tests/constitutional/whole-organism-orchestration/capability-awareness/`
- `tests/constitutional/whole-organism-orchestration/capability-presentation-reconciliation/`
- `tests/constitutional/whole-organism-orchestration/explicit-capability-inquiry/`
- `tests/constitutional/whole-organism-orchestration/post-f1-description-intercept/`

### O8R4 route candidate

- `app/api/sovereign/app/maia/list/route.ts`
- `app/api/sovereign/app/maia/list/__tests__/explicitCapabilityDescriptionIntercept.test.ts`

## IV. EXTERNAL_WITNESS_DEFERRED

Do **not** transfer in the first isolated admission:
`tests/constitutional/whole-organism-orchestration/capability-house-topology/`

Reason:
- its contract/matrix imports `lib/house/catalog.ts`;
- that catalog is currently untracked work owned by the separate House lane;
- importing the House catalog merely to make O6 executable would violate lane custody;
- O6 documentary evidence remains preserved in the programme documents.

Successor rule:
> The O6 executable matrix may be re-admitted only after the House catalog has independently earned canonical/source-control standing on the target lineage.

## V. FORBIDDEN_UNRELATED

The isolated transfer must contain **none** of the following current concurrent work unless separately admitted by its own programme:

- `app/house/**`
- `lib/house/**`
- `config/accessMatrix.ts`
- `database/migrations/*house*`
- `database/migrations/*decision*`
- `app/studio/**` changes
- `lib/studio/**` changes
- `app/writers-studio/**` changes
- `app/commons/**` changes
- `app/relationships/**` changes
- `components/reflections/**` changes
- `components/navigation/**` changes
- unrelated docs/programme packets
- unrelated `.beads` state.

An isolated-candidate census must fail if any such path appears in the transfer diff.

## VI. Frozen owned-transfer manifest

Authoritative manifest:
`O8R4R1_OWNED_TRANSFER_MANIFEST_v0.1.sha256`

Frozen counts:
- owned paths: **70**
- programme documents: **46**
- MAIA source/tests: **6**
- self-contained constitutional tests: **16**
- O8R4 route/test paths: **2**
- O6 executable topology tests: **0**
- forbidden unrelated paths: **0**

The manifest is the transfer authority. Directory globs are descriptive only and may not expand the successor transfer set.

## VII. Byte-preserving transfer protocol

The successor transfer act must:

1. verify both checkouts still share base HEAD `e886888416062c7fcbcf899040e3827bc8013835`;
2. verify the active checkout's O8R4 source hashes still match the frozen manifest;
3. copy only `OWNED_TRANSFER` files from active checkout to isolated worktree;
4. preserve file bytes exactly;
5. apply no formatting or refactor during transfer;
6. compare SHA-256 for every transferred file source→destination;
7. run `git status --short` in isolated worktree and prove all changed paths are allowlisted;
8. run `git diff --check`;
9. run self-contained O3/O4/O5/O7/O8/O8R4 tests available in the isolated branch;
10. treat O6 executable matrix as deferred, not failed;
11. stop before commit.

> **Transfer is reproduction, not development.**

## VIII. Expected isolated verification posture

After transfer but before commit, the isolated worktree should be able to run:

- capability authority registry tests;
- capability awareness projection tests;
- O5 capability-awareness matrix;
- O7R2R1 presentation-reconciliation matrix;
- O8R1 explicit-capability-inquiry matrix;
- O8R3 source-equivalence tests;
- O8R4 route-level structural test;
- platformKnowledge tests already present on base HEAD;
- legacy voice-world-navigation test already present on base HEAD;
- identity/Sanctuary route guards already present on base HEAD.

O8R2R1 historical route-witness matrix is expected to report route drift after the O8R4 candidate bytes are transferred. That historical matrix remains frozen and is not rewritten.

O6 executable matrix is deferred because its House witness is intentionally absent.

## IX. Source-control rule after successful transfer

A future commit act must occur **only in the isolated worktree**.

It must:
- stage only the verified programme transfer set;
- show the exact staged path census before commit;
- prove zero forbidden unrelated paths;
- commit against the dedicated custody branch;
- leave the active checkout's branch, index, and working tree untouched.

No merge or deployment follows automatically from commit acceptance.

## Standing

> **O8R4R1 — ISOLATED WORKTREE CUSTODY ESTABLISHED · OWNED/DEFERRED/FORBIDDEN TRANSFER CLASSES FIXED · HOUSE DEPENDENCY EXCLUDED · NO PROGRAMME TRANSFER YET · NO COMMIT / MERGE / DEPLOYMENT**

## Exact next boundary

> **SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O8R4R2 — EXACT OWNED-SET BYTE TRANSFER TO ISOLATED WORKTREE + PRE-COMMIT CONFORMANCE ONLY**

O8R4R2 may copy only the frozen OWNED_TRANSFER set to the isolated worktree, verify byte identity and path isolation, run the self-contained conformance stack, and stop before commit.

O8R4R2 may not commit, merge, deploy, import House implementation, or mutate the active checkout index.