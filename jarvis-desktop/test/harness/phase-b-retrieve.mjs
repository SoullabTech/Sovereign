#!/usr/bin/env node
// Gate Zero restart witness — PHASE B: a NEW process retrieves the run.
//
// Started only after Phase A is confirmed dead. It shares nothing with Phase A
// except $AIN_DELEGATION_HOME on disk — no memory, no handles, no imports of
// Phase A's state. If the run comes back here, it came back from durable
// storage and from nowhere else.
//
// Retrieval goes through the app's OWN handler (`jarvis:get-run`), not through
// a direct read of the store. Reading the JSON file would prove the file
// exists; it would not prove the application can retrieve it, which is the
// actual Gate Zero condition.
import { loadMainProcess, REPO } from './electron-stub.mjs';

const runId = process.argv[2];
const outcome = { ok: false, pid: process.pid, run_id: runId };

try {
  process.env.JARVIS_REPO_ROOT = REPO;
  const { invoke } = loadMainProcess({ isPackaged: false });

  const got = await invoke('jarvis:get-run', runId);
  outcome.available = got.available;
  outcome.reason = got.reason || null;
  outcome.retrieved = !!got.run;
  outcome.provenance_intact = got.provenance_intact === true;

  if (got.run) {
    const r = got.run;
    outcome.run = {
      run_id: r.run_id,
      lane: r.lane,
      state: r.state,
      disposition: r.disposition,
      origin: r.origin,
      created_at: r.created_at,
      has_verification: !!r.verification,
      correctness: r.verification ? r.verification.correctness : null,
      // The eight identities, read back from disk. This is what "provenance
      // intact" has to mean concretely — not a flag, but the specific facts a
      // reader needs to know what this run was operating on.
      topology: r.topology
        ? {
            repository_identity: r.topology.repository_identity,
            operated_worktree: r.topology.operated_worktree,
            operated_branch: r.topology.operated_branch,
            operated_commit: r.topology.operated_commit,
            build_source_worktree: r.topology.build_source_worktree,
            build_source_commit: r.topology.build_source_commit,
            running_artifact_sha: r.topology.running_artifact_sha,
            relationship_state: r.topology.relationship ? r.topology.relationship.state : null,
          }
        : null,
    };
  }

  // The run must also be reachable by LISTING, not only by an id someone
  // already knew. A founder returning after a restart does not remember run
  // ids; if the run is invisible in the list it is not recoverable in practice.
  const page = await invoke('jarvis:list-runs', { limit: 50 });
  outcome.listed = !!(page.runs || []).find((r) => r.run_id === runId);
  outcome.list_total = page.total || 0;

  outcome.ok = outcome.retrieved && outcome.listed && outcome.provenance_intact;
} catch (e) {
  outcome.error = String(e && e.stack ? e.stack : e).slice(0, 800);
}

console.log(`__PHASE_B__${JSON.stringify(outcome)}`);
process.exit(outcome.ok ? 0 : 1);
