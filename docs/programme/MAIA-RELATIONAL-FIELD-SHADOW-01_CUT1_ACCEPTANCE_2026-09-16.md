# MAIA-RELATIONAL-FIELD-SHADOW-01 — Cut 1 acceptance

**Status:** CUT 1 IMPLEMENTED · OFFLINE / NOT DEPLOYED
**Implementation base:** `fb391f20f`
**Frozen architecture:** `d899b3df6`
**Replication evidence:** `ef7d1b2bb`
**Member-facing authority:** NONE
**Deployment authority:** NONE

## What Cut 1 implements

The sovereign `/list` route now has one shadow-only schedule point after the successful response object has been constructed. The scheduler returns before any shadow DB read or model generation begins. Runtime execution is disabled unless all of the following are true: shadow flag enabled, explicit local model list configured, current member id on the explicit research allowlist, non-Sanctuary turn, positive learning `turnId`.

Cut 1 assembles a current-session field from member-authored turns only. Current request = current member evidence. Prior member turns = historical interpretive lineage. It does not infer correction, adoption, supersession, confirmation or any other relation not mechanically present in the source substrate.

The model returns one structured interpretive plan. The exact frozen research admission boundary either renders it as `maia_provisional / lineage_not_entailment` or refuses it. Cut 1 performs no regeneration and no structural recovery.

## Evidence plane

Rows write only to `maia_relational_field_shadow_runs`, a dedicated research table with no winner, score, reviewer, preference, promotion or routing field. Historical member text is not duplicated in the manifest; source row/exchange refs and SHA-256 digests are retained. Exact paired route-stage primary text and shadow output are stored only for allowlisted offline A/B adjudication.

An offline read-only exporter creates blinded current-vs-shadow packets plus a separate key. It verifies the primary response digest before including a pair and writes no adjudication back to MAIA.

## Mechanical acceptance

- Shadow test suites: **7 / 7 PASS**
- Assertions: **30 / 30 PASS**
- Frozen research hashes: **7 / 7 exact**
- Migration: transactionally created, indexes/comments accepted, then **ROLLBACK**; table absence verified afterward
- Bounded TypeScript: lane-local diagnostics **0** after repair
- Route-focused no-regression: base **28** diagnostic lines, head **28**; same messages, `/list` line positions shifted +1 by the new import
- Structured local runtime smoke (`llama3.1:8b`): **rendered**, 7.9 s, deterministic seed + prompt hash + basis + rendered digest captured

## SH-F1–SH-F10

- **SH-F1 NO MEMBER VISIBILITY — PASS.** Shadow response is not assigned to response data, `sovereignText`, prompt state or egress.
- **SH-F2 NO MEMORY WRITE — PASS.** Shadow persistence targets only its dedicated research table.
- **SH-F3 NO STANDING WRITE — PASS.** No standing, consent, authorization or claim record is mutated.
- **SH-F4 NO CURRENT-MAIA BEHAVIOR CHANGE — PASS mechanically.** `maiaService.ts` has no lane diff; `/list` adds only post-response scheduling.
- **SH-F5 PROVENANCE COMPLETE — PASS.** Turn/exchange/model/seed/architecture/source digests/packet/prompt/plan/basis/status/timings are recorded.
- **SH-F6 REFUSALS PRESERVED — PASS.** Borrowed-member-voice proof persists `refused`; no retry or repair.
- **SH-F7 LATENCY ISOLATED — PASS mechanically.** `setImmediate` scheduler returns before DB/model/store work begins. Real network-latency witness remains unspent because deployment is not authorized.
- **SH-F8 RECOMPUTABLE / DISPOSABLE — PASS.** Deterministic packet digest, deterministic seed, frozen architecture, read-only offline export.
- **SH-F9 ARCHITECTURE MATCH — PASS.** All seven imported research files match `d899b3df6` byte-for-byte.
- **SH-F10 NO AUTOMATIC WINNER / PROMOTION — PASS.** Models are explicit env configuration; evidence schema and exporter contain no automatic adjudication or feedback path.

## Intentionally unspent

No migration has been applied. No shadow environment flag has been enabled. No member has been enrolled. No deploy has occurred. No PR has been merged. No shadow output has been shown to a member or promoted into MAIA behavior.

The next evidence gate is a **route-level shadow witness on explicitly authorized founder traffic** after separately authorizing schema application and deployment of the invisible instrumentation. That witness should prove: live response unchanged, shadow row appears later, primary digest matches captured route response, latency does not delay egress, and offline blind export reconstructs the pair.
