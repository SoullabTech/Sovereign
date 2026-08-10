# CONTINUATION RECORD — unit-18-entry-conditions
episode: JARVIS Units 14–17 authority chain closed; Unit 18 held at the gate   closed: 2026-08-10   record-version: 2

## GOAL
Open JARVIS Unit 18 (Alpha proving walk) only once the authority chain can actually
dispatch end to end — not to demonstrate back-pressure already understood by Units 12/14.

## DRIFT PROBES
<!-- Prior readings, NOT state. Confirm or contradict with /orient. -->
worktree: /Users/soullab/.claude/worktrees/ain-jarvis-unit-17-resolution-resumption
branch: chore/jarvis-unit-17-resolution-resumption
head_sha: 4a29d1a27
ahead_of_trunk: 33
behind_trunk: 0
dirty: 0
cache_state: no artifact newer than HEAD
production_sha: n/a — production untouched by Units 14–17
migrations: none
local_runtime_state: DEGRADED (pid 76089, rt-3057a52d, loopback 127.0.0.1:8787)
local_worker_available: false — Ollama not running
builder_capacity: 2/2 held; both holders are unrelated lanes with dead processes
disk_free: 6.3Gi

## GOVERNING DECISIONS
<!-- cite, never restate -->
- Unit 17 architecture, terminal-run decision, five correspondence proofs → docs/ops/JARVIS_UNIT_17_RESOLUTION_RESUMPTION.md
- Unit 16 authenticated standing, roles, injection defence → docs/ops/JARVIS_UNIT_16_FOUNDER_CHANNEL.md
- Unit 15 verified delegation issuance + V12 → docs/ops/JARVIS_UNIT_15_VERIFIED_DELEGATION.md
- Unit 14 principal identity + publicRun objective → docs/ops/JARVIS_UNIT_14_PRINCIPAL_OBJECTIVE.md
- Unit 13 bridge contract (design only, partly superseded by 14/15) → docs/ops/JARVIS_UNIT_13_MAIA_BRIDGE_CONTRACT.md

## CAPABILITY CONSTRAINTS
- The four-part authority separation must not be collapsed, reworded into one step, or
  short-circuited by any future unit:
  **Authentication proves who answered. Correspondence proves which gate. Typed resolution
  proves what was decided. Admission proves what may execute.**
  Each stage is refusable independently; merging any two removes a refusal point.
- ESCALATION_REQUIRED must remain terminal with no outgoing transition. Resumption is
  new-run lineage (resumes_run_id + resolution_id + gate_id), never state resurrection.
  Adding AWAITING_AUTHORITY to make resumption convenient is the change this chain refused.
- Unit 18 must NOT open until all three hold — a run that cannot dispatch produces a
  truthful report answering the wrong question:
  1. worker execution healthy (Ollama up, runtime READY not DEGRADED);
  2. governed Builder capacity available (not 2/2 with dead holders);
  3. the end-to-end path demonstrably able to dispatch.
- Neither stale claim in the capacity ledger belongs to this lane. Do not clear them as
  housekeeping; they are other lanes' state.

## ESTABLISHED
- Conversational language cannot become runtime authority through this chain — evidence:
  three independent mechanisms, not one: (a) resolveGate() has no content-driven decision
  path; (b) case J refuses persuasive prose even with correct gate_id + digest; (c) the
  typed-resolution guard is the operative decision mechanism. See
  docs/ops/JARVIS_UNIT_17_RESOLUTION_RESUMPTION.md §5–§6.
- M1/M2 establish test-suite discrimination only, not structural impossibility — evidence:
  scripts/builder/__tests__/jarvis-gate-resumption-proof.mjs mutation section; they prove the
  suite would reject similarity-matching and most-recent-open-gate substitutes, which is a
  weaker claim than the shipped code being unable to do it.
- A resolution is not a delegation and cannot lift the Unit 14 ceiling — evidence: cases
  T, U, V in the same suite.
- Production is unreachable from the JARVIS runtime — evidence: no
  deploy|production|docker|ssh|minisforum|migrate reachability in scripts/ain-delegate.sh,
  recorded docs/ops/JARVIS_UNIT_13_MAIA_BRIDGE_CONTRACT.md §21.

## CHANGED
- docs/handoffs/chore-jarvis-unit-17-resolution-resumption_2026-08-10_unit-18-entry-conditions.md — this packet; the invariant and Unit 18 entry conditions previously existed only in session context.

## VERIFIED
- Units 11–17 proof suites green at HEAD | jurisdiction: implementation | witness: six node proof suites (runtime, desktop, principal, delegation, authority-channel, gate-resumption) | referent: 169 cases across the JARVIS authority chain | provenance: 4a29d1a27 · dirty 0 · 2026-08-10
- ESCALATION_REQUIRED remains terminal and unmodified | jurisdiction: implementation | witness: grep of LEGAL_TRANSITIONS + TERMINAL_STATES | referent: scripts/builder/jarvis-runtime-pipeline.mjs:47,64 | provenance: 4a29d1a27 · dirty 0 · 2026-08-10
- No MAIA caller exists in the application surface | jurisdiction: implementation | witness: grep for 8787 / jarvis-runtime-client across lib, app, components | referent: 0 matches | provenance: 4a29d1a27 · dirty 0 · 2026-08-10

## INSTRUMENTS USED
- scripts/builder/__tests__/jarvis-gate-resumption-proof.mjs | boundary: bound | provenance: hermetic temp AIN_DELEGATION_HOME, ephemeral port, stalled delegate · 2026-08-10 | result: 35 passed 0 failed
- scripts/builder/__tests__/jarvis-authority-channel-proof.mjs | boundary: bound | provenance: same harness · 2026-08-10 | result: 29 passed 0 failed
- scripts/builder/__tests__/jarvis-delegation-proof.mjs | boundary: bound | provenance: same harness · 2026-08-10 | result: 45 passed 0 failed
- scripts/builder/__tests__/jarvis-principal-proof.mjs | boundary: bound | provenance: same harness · 2026-08-10 | result: 25 passed 0 failed
- scripts/builder/__tests__/jarvis-runtime-proof.mjs | boundary: bound | provenance: same harness · 2026-08-10 | result: 15 passed 0 failed
- scripts/builder/__tests__/jarvis-desktop-proof.mjs | boundary: bound | provenance: same harness · 2026-08-10 | result: 20 passed 0 failed

## OPEN
? Should the four-part authority separation be ratified into a cross-unit control-plane
  record, or restated at the head of Unit 18 — it currently lives only in this packet.
? Who clears the two stale Builder claims, and by what governed act — they are not this
  lane's to release.
∅ End-to-end dispatch under a resolution-authorized resumed run — not measured; blocked on
  worker health and capacity, and is exactly what Unit 18 exists to measure.
∅ Whether gates should be raised automatically by escalating work — not measured; Unit 17
  implements the gate contract, not the trigger.
∅ Unit 16 PENDING_PUBLICATION → canon path — not measured; publication remains unimplemented.
∅ Founder control-plane session establishment — not measured; named authenticator only,
  established out of band.

## DO NOT REDISCOVER
- "CAPACITY_BLOCKED must be added as a runtime lifecycle state" — FALSIFIED by Unit 14:
  the pipeline already sets blocked={reason:'WORKER_CAPACITY_UNAVAILABLE'} on the return to
  QUEUED and publicRun already publishes it; the Unit 12 gap was client rendering.
- "An authenticated founder statement can authorize execution" — FALSIFIED by Unit 16 case
  A12 and Unit 17 cases T/U: a ruling carries standing with authorizes_execution false, and
  a resolution cannot substitute for a Unit 15 delegation.
- "Semantic similarity is an acceptable correspondence mechanism" — FALSIFIED by Unit 17
  mutation M1 and case J.

## NEXT COHERENT ACTION
Run /orient against this packet to confirm or contradict the drift probes — specifically
whether the local runtime has returned to READY with a live worker and whether Builder
capacity has freed — and open Unit 18 only if all three entry conditions in CAPABILITY
CONSTRAINTS now hold.
