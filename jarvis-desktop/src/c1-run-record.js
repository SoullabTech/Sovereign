// Desktop C1 run-record construction.
//
// Extracted for the same reason correctness.js was: the logic that decides what
// a persisted C1 record CONTAINS must be testable without launching Electron.
// main.js does the import and the store call; this module owns the shape.
//
// It is not a persistence mechanism. The canonical store
// (scripts/builder/jarvis-runtime-store.mjs) is imported from the operated root
// and does the writing — this only builds the object handed to it.

'use strict';

/**
 * Map a canonical correctness verdict onto a persisted run state.
 *
 * Deliberately NOT the pipeline's RUN_STATES machine. Those tokens belong to the
 * local-native work-unit lane. 'unverified' has no honest equivalent there: it is
 * not FAILED (nothing was at fault — the worker ran and answered) and certainly
 * not VERIFIED. Collapsing it into either would reintroduce exactly the
 * execution-implies-truth error correctness.js exists to prevent.
 */
function stateForCorrectness(correctness) {
  switch (correctness) {
    case 'verified':   return 'VERIFIED';
    case 'failed':     return 'FAILED';
    case 'unverified': return 'UNVERIFIED';
    default:
      throw new Error(`c1-run-record: unknown correctness '${correctness}'`);
  }
}

/**
 * Build the record persisted for one completed C1 task.
 *
 * Called only AFTER decideCorrectness() has run, so a persisted record can never
 * carry a verdict the verifier did not give.
 *
 * Fragment CONTENT is dropped. The metadata (file, line range, source sha,
 * extraction method, content hash) is what provenance requires, and the content
 * itself is recoverable from the repository at that sha.
 */
function buildC1RunRecord({ run_id, now, root, task, model, executionVerified, correctness, correctness_reason, fragments, evidence, answer }) {
  if (!run_id) throw new Error('c1-run-record: run_id is required');
  const frags = Array.isArray(fragments) ? fragments : [];
  return {
    run_id,
    record_kind: 'c1-task',
    lane: 'C1',
    state: stateForCorrectness(correctness),
    created_at: now,
    repo_root: root,
    starting_sha: frags.length ? frags[0].source_sha : null,
    task,
    model,
    execution_verified: executionVerified === true,
    correctness,
    correctness_reason,
    fragments: frags.map(({ content, ...meta }) => meta),
    evidence,
    answer,
  };
}

module.exports = { buildC1RunRecord, stateForCorrectness };
