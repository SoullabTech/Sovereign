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
    channel: 'jarvis:run-work-unit',
    ratified_in: 'Alpha Floor C0→Builder wire',
    purpose:
      'The governed local-native wire. Carries a PACKET only — the lane is pinned in main and is ' +
      'deliberately not a renderer-supplied value, so a compromised renderer cannot name a lane at ' +
      'all. Admission remains the mechanism\'s.',
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
