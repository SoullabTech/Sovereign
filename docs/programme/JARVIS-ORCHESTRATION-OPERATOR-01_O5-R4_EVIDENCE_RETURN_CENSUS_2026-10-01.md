# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R4 — Evidence Return Census

**Date:** 2026-10-01
**Base:** `dbc3036f2ff498779c56b91152d1d79f5e30fde8`
**Class:** Census / pre-falsifier · READ-ONLY against runtime mechanism
**Predecessors:** O5-R1 frozen F5/F6; O5-R2 recovery seam; O5-R3 grant-writer admission
**Standing:** ⭐ R4 CENSUS COMPLETE · ⭐ FALSIFIERS FROZEN · ⛔ NO W4 IMPLEMENTATION

> **Governing law carried from O5-R1:** executor-returned `finding` and `proposal` are evidence only. A proposal may be projected into O1 as a `CANDIDATE` with no grants; neither kind may become O2 work or O3 authority. A cross-lane finding propagates evidence, never mutation authority.

## 1. Why R4 is the next O5 boundary

The original O5 opening named four genuine gaps. R2 closed the failure-cause axis and the live Path-B recovery seam. R3 closed grant-writer concurrency, torn-tail durability and settlement integrity. The remaining R1 obligation visible in runtime is **evidence return**:

1. W4 has no `finding` kind;
2. W4 has no `proposal` kind;
3. runtime has no closed consequence-finding object carrying `affected_lane`;
4. proposal→O1 candidate exists only in the frozen R1 reference law, not in runtime.

This act does not open scheduler/parallel dispatch, O7 founder inbox behavior, or O8 semantic merge.

## 2. Current W4 mechanism

Both `work-unit-ledger-v1.mjs` and `work-unit-ledger-v2.mjs` recognize exactly seven kinds:

`model_identity · attempt · artifact · diff · test_result · verifier_result · resulting_commit`

An attempted `finding` or `proposal` therefore reaches `UNKNOWN_LEDGER_KIND` today. No runtime file in `scripts/`, `jarvis-desktop/`, or `lib/` defines the R1 consequence-finding field set (`kind · source_act · affected_lane · reason · evidence_refs · urgency`).

## 3. Lawful placement: evaluation evidence, outside authorized core

The existing Work Unit already separates mutable evidence from authority:

- `execution.*` carries attempts/artifacts/diffs/tests;
- `evaluation.verifier_results[]` carries evaluation evidence;
- W2 `authorizedCoreSnapshotV1/V2` includes only `evaluation.acceptance_conditions`, `falsification_conditions`, and `stop_conditions` — **not** `verifier_results`.

Therefore the structurally coherent candidate placement is:

- `evaluation.findings[]`;
- `evaluation.proposals[]`.

This is a **placement finding, not implementation authority**. R4 must prove that appending either changes only its evidence array and leaves the authorized-core snapshot, routing, lifecycle state, scope and authority byte-identical.

## 4. Existing frozen law R4 must reuse, not rename

From `tests/constitutional/jarvis-o5-r1/contract.mjs`:

- `EVIDENCE_KINDS = ['finding', 'proposal']`;
- proposal projection standing = `CANDIDATE`;
- consequence finding closed fields = `kind · source_act · affected_lane · reason · evidence_refs · urgency`;
- urgency = `low · normal · high`;
- forbidden consequence fields include patch/diff/command/script/grant/authority/path/instruction/next-act/mutation vocabulary.

R4 should import or mechanically mirror those frozen constants with a cross-check; it must not create a second vocabulary.

## 5. Critical seam: W4 append ≠ O1 projection

W4's module boundary is intentionally pure: immutable evidence append only, with no routing, lifecycle, authority, filesystem, network, or provider mutation. O5-R1 F5 additionally requires a `proposal` to surface as exactly one O1 `CANDIDATE` with empty grants.

Those are **two acts**:

1. **W4 admission:** append proposal evidence to `evaluation.proposals[]`;
2. **O1 projection:** a separate deterministic reader/projection may expose that evidence as candidate operator intent.

Making `appendEvidenceLedger*()` mutate O1 directly would satisfy the visible outcome while violating W4 custody. R4 falsifiers must kill that design explicitly.

## 6. Pre-implementation rulings for falsifier construction

These rulings are constrained by existing O5-R1 law and current runtime source. They authorize the **falsifier instrument only**, not W4 implementation.

### R4-R1 — evidence identity is derived, not a new payload field

R1 froze the consequence-finding payload as a closed field set. Adding `finding_id` inside that payload would silently amend the law. Instead, R4 treats the canonical digest of the normalized evidence record as immutable ledger identity.

- duplicate canonical record → duplicate refusal;
- any content change → a different evidence identity;
- proposal projection provenance → `source_ref = w4-proposal:sha256:<digest>`.

This preserves the frozen payload vocabulary and gives projection stable idempotency without deduplicating free text.

### R4-R2 — admission window is `EXECUTING` only

All mutable W4 return evidence today lands while the Work Unit is `EXECUTING`; `RETURNED` is a later lifecycle transition. R4 adds no lifecycle state and does not reopen lifecycle law. Findings/proposals therefore follow the existing evidence window: **`EXECUTING` only**.

### R4-R3 — implement against W4 v2 only; prove v1 is non-live

The caller census finds **no runtime caller** of `work-unit-ledger-v1.mjs`; only preservation/e2e proofs import it. The live Desktop/runtime path imports W4 v2. R4 therefore does not mutate historical v1. The falsifier suite carries a static reachability guard: if a non-test runtime caller of v1 appears, R4 stops rather than silently creating version skew.

### R4-R4 — O1 candidate projection is a separate evidence projection

Runtime O1 recognizes only `CLEAR · AMBIGUOUS · INVALID`; it has no evidence-derived candidate path. R4 will not feed executor text through `compileIntent()`. A proposal projects to the already-frozen R1 candidate shape, with stable provenance added:

`standing=CANDIDATE · raw_utterance=<summary> · source=executor-proposal · source_ref=w4-proposal:sha256:<digest> · authority_grants=[]`

The projection is deterministic and idempotent by `source_ref`. It is not a compiled `o1.intent.v1` operator utterance. Converting it to governed operator intent remains an operator act.

## 7. Falsifier freeze scope

The existing R1 F5/F6 remain governing and must stay green. R4 adds implementation-level falsifiers rather than replacing them:

| Proposed falsifier | Kills |
|---|---|
| **R4-E1 evidence-only append** | adding a finding/proposal changes authorized core, routing, lifecycle, scope or authority |
| **R4-E2 closed kind schemas** | unknown fields are silently retained; consequence finding carries executable/write authority |
| **R4-E3 immutable identity** | duplicate/conflicting evidence overwrites or silently coalesces |
| **R4-E4 proposal projection separation** | W4 append itself mutates O1/O2/O3 |
| **R4-E5 projection standing** | proposal projects as clear intent/work/authority, or carries grants |
| **R4-E6 finding non-escalation** | ordinary/cross-lane finding becomes O1 candidate, O2 node or O3 authority |
| **R4-E7 projection idempotency** | repeated reads of one proposal create multiple O1 candidates |
| **R4-E8 v1/v2 parity** | one live ledger version admits weaker evidence or broader fields than the other |

Each needs at least one competent defeat candidate before freeze. No falsifier is frozen by this census.

## 8. What did not change

- no W4 ledger code;
- no Work Unit schema;
- no lifecycle law;
- no O1/O2/O3 mechanism;
- no installed JARVIS;
- no delegation-home state;
- no O7/O8 behavior.

**Standing: O5-R4 EVIDENCE-RETURN CENSUS ✅ · RUNTIME GAP PROVEN · EVALUATION-EVIDENCE PLACEMENT IDENTIFIED · W4/O1 SEAM SEPARATED · FOUR STRUCTURAL RULINGS OWED BEFORE FALSIFIER FREEZE · ⛔ NO IMPLEMENTATION.**

## 9. Falsifier freeze result

The R4 instrument is now frozen at `tests/constitutional/jarvis-o5-r4/FREEZE.json`. The frozen files are:

- `contract.mjs`;
- `substrate.mjs`;
- `reference.mjs`;
- `falsifiers.mjs`;
- `candidates.mjs`.

`matrix.mjs` is deliberately unfrozen so a later implementation can add transparent Class-A/current-runtime observations without weakening the laws.

Result:

- **8/8 reference falsifiers PASS**;
- **8/8 named defeat candidates KILLED**;
- each R4-E1…E8 has a named killer;
- matrix: **LETHAL + DISCRIMINATING**.

The freeze guard was proven lethal both ways using a backup/restore probe: clean → `FREEZE INTACT`; an appended comment in `falsifiers.mjs` → `FREEZE VIOLATED (1)` with exit 1; byte-restored → `FREEZE INTACT`. No `git checkout` restoration was used.

## 10. Implementation boundary now opened by the instrument — mechanism still untouched

A conforming R4 implementation, if opened, is limited to:

1. W4 v2 admission of `finding` and `proposal` into evidence-only evaluation arrays while `EXECUTING`;
2. canonical digest identity and explicit duplicate refusal;
3. exact closed payload schemas, including the already-frozen consequence-finding law;
4. a **separate** deterministic proposal→O1 candidate projector (`CANDIDATE`, stable `source_ref`, zero grants);
5. no runtime W4 v1 caller; if one appears, stop and reopen the version ruling.

It may not add scheduler behavior, automatic work creation, authority, founder-inbox behavior, semantic merge, or cross-lane writes.

**Standing: O5-R4 CENSUS ✅ · RULINGS R4-R1…R4-R4 ✅ · FALSIFIERS R4-E1…E8 FROZEN ✅ · 8/8 DEFEAT CANDIDATES KILLED ✅ · FREEZE GUARD PROVEN ✅ · ⛔ NO RUNTIME IMPLEMENTATION · INSTALLED JARVIS UNTOUCHED.**

## 11. Freeze amendment 1 — R4-E9 cross-lane evidence projection

After the initial R4 law merged, review against the predecessor **O5-R1 F6** exposed one omission in the R4 instrument. R1 F6 does not stop at schema closure/non-escalation: a lawful consequence finding must also **reach its named `affected_lane` as evidence**.

The initial R4 freeze proved that a consequence finding could not carry executable/write authority, but it did not positively prove targeted evidence propagation. That was an instrument omission relative to the already-frozen predecessor law. The runtime implementation was therefore held before admission.

### Amendment cause

> The initial R4 freeze proved consequence-finding schema closure and non-escalation but omitted R1 F6’s positive requirement that a lawful consequence finding reach its affected lane as evidence. The law was incomplete relative to its frozen predecessor, not wrong in what it asserted.

### Added law — R4-E9

A lawful consequence finding projects as **evidence** to exactly its `affected_lane` and nowhere else.

The projection is pure and contains only:

`target_lane · source · source_ref · evidence`

with:

- `target_lane = finding.affected_lane`;
- `source = executor-consequence-finding`;
- stable `source_ref = w4-finding:sha256:<evidence digest>`;
- `evidence` equal to the admitted consequence-finding payload.

Ordinary findings do not produce a cross-lane projection. The projection is not an O7 founder inbox, O2 work node, O3 grant, scheduler act, command, patch, or cross-lane write. A host may deliver this evidence projection to its named lane; R4 does not invent a persistent lane-inbox subsystem.

### Defeat candidate

**DC-E9 — local-only consequence:** the finding is safely stored in W4 but no targeted lane projection is produced. It is killed only by R4-E9: `no cross-lane projection`.

### Freeze lineage

`FREEZE.json` retains the complete previous hashes and records amendment 1 with the prior freeze commit `b1c719610`, prior canonical merge `f7f53dee`, cause, changed surface, unchanged laws, and new hashes.

The amended guard was proven both ways:

- amended corpus → `FREEZE INTACT`;
- deliberate comment drift in `falsifiers.mjs` → `FREEZE VIOLATED (1)`, exit 1;
- byte restoration from backup → `FREEZE INTACT`.

Post-amendment matrix: **R4-E1…E9 all PASS on reference · DC-E1…E9 all KILLED · MATRIX LETHAL + DISCRIMINATING**.

**Standing after amendment: O5-R4 LAW = 9 FALSIFIERS / 9 NAMED DEFEAT CANDIDATES · FREEZE AMENDED ONCE · R1 F6 POSITIVE PROPAGATION RESTORED · ⛔ IMPLEMENTATION ADMISSION HELD UNTIL E9 MECHANISM/PROOF LANDS.**
