// JARVIS Desktop — the ratified preload channel allow-list.
//
// WHY THIS FILE EXISTS (MAIA-D00A, founder ruling 2026-08-25).
//
// The exact-list preload guard has now gone red twice in this programme:
//   · JOP-00 §4.1 — Alpha Floor added `mechanism-status` + `run-work-unit`
//     for the C0→Builder wire and did not re-review the guard (7 vs 9).
//   · MAIA-D00  §4.2 — JOP-04 added `reveal-workspace` and did not re-review
//     the guard (9 vs 10).
//
// Both times the guard did its job. Both times the failure survived a
// generation, because the list was DUPLICATED in two proof files and neither
// copy was the obvious place to go and argue. A guard that is red across two
// generations has stopped being a gate and become wallpaper.
//
// So the list now lives in exactly one place, carries the review that
// authorized each channel, and both proofs assert against it. Widening the
// renderer's authority now requires editing THIS file — which is a review, not
// an edit to a test expectation.
//
// ⛔ Adding an entry here is an authority decision, not bookkeeping. Each entry
// must be able to answer, in its own `purpose`, all five questions MAIA-D00A
// applied to `reveal-workspace`:
//   1. required   — is there a real founder need it serves?
//   2. authorized — did a named ruling admit it?
//   3. minimal    — is the surface the smallest that serves the need?
//   4. validated  — does MAIN own every value that reaches a privileged call?
//   5. compatible — does it preserve the secure renderer doctrine?

'use strict';

/**
 * Channels the renderer may `ipcRenderer.invoke`.
 * Order is irrelevant here; the proofs compare sorted.
 */
export const RATIFIED_INVOKE_CHANNELS = [
  {
    channel: 'jarvis:capabilities',
    ratified_in: 'Alpha Floor 2026-08-11',
    purpose:
      'Read the deterministic capability registry. Read-only by construction — the handler is ' +
      'separately proven not to reference runCapability, so discovery can never become execution.',
  },
  {
    channel: 'jarvis:continuity-search',
    ratified_in: 'JARVIS-CONTINUITY-BRIDGE-01 founder direction 2026-09-17',
    purpose:
      'Read-only founder recall over the LOCAL_ONLY continuity projection. The renderer supplies ' +
      'query text and a bounded result count only; MAIN selects the fixed local script/database, ' +
      'and no audience, path, shell command, mutation, or model invocation crosses this channel.',
  },
  {
    channel: 'jarvis:choose-repo',
    ratified_in: 'Preferences binding surface',
    purpose:
      'Ask MAIN to run the NATIVE directory chooser. The renderer cannot SET a path: main owns the ' +
      'dialog, and bindRepoRoot() refuses any directory missing the canonical Builder OS markers. ' +
      'A new root can only enter the system through the founder\'s own file dialog.',
  },
  {
    channel: 'jarvis:clear-repo',
    ratified_in: 'Preferences binding surface',
    purpose:
      'Unbind the saved workspace and re-resolve from scratch, so the surface shows what a cold ' +
      'launch would actually do rather than a cached memory of the binding just removed.',
  },
  {
    channel: 'jarvis:governance-action',
    ratified_in: 'Alpha Floor F2, 2026-08-11',
    purpose:
      'Run the governor\'s OWN CLI. Not new authority: argv is composed by GOV.buildGovernanceArgv ' +
      'and passed through unmodified, main.js carries no governance verb string of its own, and a ' +
      'non-zero exit is never rewritten into success.',
  },
  {
    channel: 'jarvis:mechanism-status',
    ratified_in: 'Alpha Floor C0→Builder wire',
    purpose: 'Read whether the bound repo is carrying the Builder execution mechanism. Read-only.',
  },
  {
    channel: 'jarvis:repo-config',
    ratified_in: 'Preferences binding surface',
    purpose: 'Read the current binding and its provenance. Read-only.',
  },
  {
    channel: 'jarvis:reveal-workspace',
    ratified_in: 'MAIA-D00A 2026-08-25 (added by JOP-04, reviewed here)',
    purpose:
      'Reveal the BOUND workspace in the OS file manager so the founder can confirm which checkout ' +
      'JARVIS resolved — the gesture JOP-04\'s "Home states the workspace before Work has to refuse ' +
      'it" requires. Minimal on four counts, each separately asserted: (1) the preload forwards NO ' +
      'argument and the handler DECLARES no parameter, so the renderer cannot name a path; (2) it ' +
      'reveals only currentRoot(), and every writer of RESOLVED.root is marker-validated in main ' +
      '(ENV/CONFIG/DEFAULT via isValidRepoRoot, WALK via the marker walk, bindRepoRoot via ' +
      'isValidRepoRoot); (3) an unbound root short-circuits to {revealed:false} without touching ' +
      'shell at all; (4) it uses shell.showItemInFolder, which SELECTS an item in the file manager — ' +
      'main.js is separately proven to call neither shell.openPath nor shell.openExternal, so no ' +
      'open-or-execute authority is introduced. It returns no file contents.',
  },
  {
    channel: 'jarvis:run-external-reasoning',
    ratified_in: 'JARVIS-NEMOTRON-C3 founder direction 2026-09-17',
    purpose:
      'A separate explicit founder act after C3 routing. Carries only task text plus external_ok. ' +
      'MAIN invokes a fixed OpenCode binary through frontier-worker in empty temporary custody with ' +
      'read/edit/list/bash/task/external-directory/web permissions denied. It cannot receive the ' +
      'bound repository path or JARVIS continuity, and C3 routing itself remains non-executing.',
  },
  {
    channel: 'jarvis:run-work-unit',
    ratified_in: 'Alpha Floor C0→Builder wire',
    purpose:
      'The governed local-native wire. Carries a PACKET only — the lane is pinned in main and is ' +
      'deliberately not a renderer-supplied value, so a compromised renderer cannot name a lane at ' +
      'all. Admission remains the mechanism\'s.',
  },
  {
    channel: 'jarvis:work-unit-action',
    ratified_in: 'JARVIS-DESKTOP-OPERATOR-FLOW-02 + I4 canonical convergence + E1 canonical provider execution',
    purpose:
      'Founder-facing control of canonical W0.v2 plus the explicitly LEGACY / COMPATIBILITY Work Unit lane ' +
      'through one bounded action channel. I4 canonical actions remain providers/preview-route/create/status/' +
      'canonical-bound/canonical-authorize/canonical-route/canonical-bind-transport/canonical-adjudicate/' +
      'canonical-close. E1 adds canonical-prepare-execution-transport/canonical-execution-auth-preview/' +
      'canonical-authorize-execution-once/canonical-confirm-execute/canonical-revoke-execution-grant/' +
      'canonical-record-verifier/canonical-evidence-ready without adding a preload channel. W2.v2 owns lifecycle, ' +
      'W3.v2 owns cognitive route, W3T.v1 owns exact provider/model/adapter realization, E1 grants one exact ' +
      'one-shot human execution act only after fresh R4/R5A checks, DR1 maps durable result standing, and W4.v2 ' +
      'owns execution/verifier evidence. Legacy compatibility actions remain route-plan/execution-auth-preview/' +
      'authorize-execution-once/confirm-execute/revoke-execution-grant/run-provider under legacy R5B/R4/R5A law ' +
      'and still cannot impersonate canonical E1. The renderer cannot supply lifecycle state, route records/digests, ' +
      'canonical SHA, raw authority, provider/model/adapter identity, credentials, or grant contents. ' +
      'No production/deploy/merge act is exposed.',
  },
  {
    channel: 'jarvis:status',
    ratified_in: 'original surface',
    purpose:
      'Read HOME + SYSTEM truth states. Every field is a real observation or explicitly UNKNOWN; ' +
      'nothing is inferred from intent.',
  },
  {
    channel: 'jarvis:submit-task',
    ratified_in: 'original surface',
    purpose:
      'Submit ONE bounded task shape, validated by capability-form. C3 remains ' +
      'routed_not_executed — Desktop does not invoke Claude.',
  },
];

/** Channels MAIN may push to the renderer. */
export const RATIFIED_PUSH_CHANNELS = [
  {
    channel: 'jarvis:repo-changed',
    ratified_in: 'Preferences binding surface',
    purpose:
      'Broadcast a rebind so every window redraws from the new resolution rather than from anything ' +
      'it remembered. Carries state outward only; nothing crosses inward.',
  },
];

export const INVOKE_CHANNEL_NAMES = RATIFIED_INVOKE_CHANNELS.map((c) => c.channel).sort();
export const PUSH_CHANNEL_NAMES = RATIFIED_PUSH_CHANNELS.map((c) => c.channel).sort();
