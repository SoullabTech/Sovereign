// JARVIS Desktop — F3 dual provenance.
//
// Pure, DOM-free. Loaded by main, renderer, and proof.
//
// TWO INDEPENDENT FACTS, NEVER COLLAPSED:
//
//   ARTIFACT IDENTITY     "I am build <app_build_sha>"
//   SUBSTRATE IDENTITY    "I am operating against <root> @ <head>, dirty=<bool>"
//
// The app artifact and the checkout it executes through can legitimately have
// different histories — that is what tonight's source-binding evidence showed.
// So this module reports both and refuses to present either as the other.
//
// It also refuses to present a hard-coded fallback root as though it were
// established truth: a root reached by implicit default is reported as
// DEGRADED with its resolution named, never as a clean green state.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisProvenance = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const RESOLUTION = {
    ENV: 'explicit-env',          // JARVIS_REPO_ROOT was set and verified
    CONFIG: 'explicit-config',    // founder named it in Preferences; persisted and re-verified
    DEFAULT: 'implicit-default',  // hard-coded candidate happened to verify — NOT truth
    WALK: 'dev-walk',             // dev mode walked up from the running source
    NONE: 'unresolved',
  };

  // CONFIG ranks with ENV, not with DEFAULT. The distinction this module exists
  // to protect is not "how many hops did it take" but "did anyone CHOOSE this
  // substrate". A persisted Preferences selection is a founder's explicit act
  // that survived a relaunch; a hard-coded candidate that happens to verify is
  // still a checkout nobody named. Only the latter is DEGRADED.

  /**
   * ARTIFACT IDENTITY.
   * `buildInfo` is the packaged build stamp (src/build-info.json), written at
   * package time. Absent in dev — and that absence is stated, not filled in
   * with the substrate's SHA.
   */
  function artifactIdentity({ buildInfo, isPackaged }) {
    // isPackaged is checked FIRST, and a stamp is never consulted for an
    // unpackaged process.
    //
    // The stamp used to be checked first, so a dev run could read a
    // build-info.json left behind by an earlier `npm run pack` and report
    // "Desktop build 2d9eb671c · packaged <time>" — an artifact identity the
    // running process did not possess. Verified against the real module on
    // 2026-08-11: state AVAILABLE, window titled "JARVIS — build 2d9eb671c",
    // from a process running straight off the source tree.
    //
    // Electron's app.isPackaged is the only thing that can answer "am I a
    // built artifact", because it is a property of how THIS process was
    // launched. A file on disk is a claim about some other process. The stamp
    // may therefore say WHICH build this is; it may never establish THAT this
    // is a build. The generated stamp now also lives outside the source tree
    // (see readBuildInfo in main.js), so this ordering is belt AND braces:
    // even if packaging leaked a stamp back into src/, it could no longer
    // elevate a dev process's identity.
    if (!isPackaged) {
      return {
        app_build_sha: null,
        built_at: null,
        packaged: false,
        state: 'UNKNOWN',
        detail: 'Running unpackaged from source — this Desktop has no build identity. Its behaviour is whatever the source tree currently says.',
      };
    }
    if (buildInfo && typeof buildInfo.app_build_sha === 'string' && buildInfo.app_build_sha) {
      return {
        app_build_sha: buildInfo.app_build_sha,
        built_at: buildInfo.built_at || null,
        packaged: true,
        state: 'AVAILABLE',
        detail: `Desktop build ${buildInfo.app_build_sha}${buildInfo.built_at ? ` · packaged ${buildInfo.built_at}` : ''}`,
      };
    }
    return {
      app_build_sha: null,
      built_at: null,
      packaged: true,
      state: 'DEGRADED',
      detail: 'Packaged app carries no build stamp — it cannot say which build it is. Repackage to stamp it.',
    };
  }

  /**
   * SUBSTRATE IDENTITY — the checkout whose code actually executes.
   */
  function substrateIdentity({ repoRoot, resolution, head, dirty, conflictingConfigRoot }) {
    if (!repoRoot) {
      return {
        resolved_repo_root: null, resolved_repo_head: null, resolved_repo_dirty: null,
        resolution: RESOLUTION.NONE, state: 'UNAVAILABLE',
        detail: 'No execution substrate resolved — choose a repository in JARVIS ▸ Preferences (⌘,). It must be a checkout carrying the canonical Builder OS markers. The selection is remembered across launches; JARVIS_REPO_ROOT still works but is no longer required.',
      };
    }
    const headTxt = head || 'unknown';
    const dirtyTxt = dirty === null || dirty === undefined ? 'unknown' : String(!!dirty);
    const base = `${repoRoot} @ ${headTxt}, dirty=${dirtyTxt}`;

    // CONFLICTED AUTHORITY. env legitimately outranks a saved choice — that
    // precedence is intentional and is NOT changed here. What was wrong is that
    // the override read as clean: Preferences said "your choice is being
    // overridden" while this card said AVAILABLE / green at the same moment.
    // One surface contradicting another is the same class of defect as silence.
    //
    // So the substrate stays truthfully bound to the ENV root — runtime
    // authority is unchanged — but it is reported DEGRADED, because a state
    // needing operator remediation is not a clean state. No new vocabulary:
    // DEGRADED already means "real, usable, and not what you should leave it as".
    const conflicted =
      resolution === RESOLUTION.ENV && conflictingConfigRoot && conflictingConfigRoot !== repoRoot;
    if (conflicted) {
      return {
        resolved_repo_root: repoRoot, resolved_repo_head: head || null,
        resolved_repo_dirty: dirty === undefined ? null : dirty,
        resolution, state: 'DEGRADED', conflict: { governing: repoRoot, overridden_config_root: conflictingConfigRoot },
        detail: `${base} — GOVERNED BY JARVIS_REPO_ROOT, which is overriding your saved choice (${conflictingConfigRoot}). The environment wins by design; this is flagged because your explicit selection is not in effect. Clear it with:  launchctl unsetenv JARVIS_REPO_ROOT  (then quit and relaunch JARVIS).`,
      };
    }

    if (resolution === RESOLUTION.DEFAULT) {
      return {
        resolved_repo_root: repoRoot, resolved_repo_head: head || null, resolved_repo_dirty: dirty === undefined ? null : dirty,
        resolution, state: 'DEGRADED',
        detail: `${base} — reached by IMPLICIT DEFAULT, not by explicit configuration. This Desktop is executing a sibling checkout it was not told to use. Choose it deliberately in Preferences (⌘,) to make the binding explicit and persistent.`,
      };
    }
    if (head && dirty) {
      return {
        resolved_repo_root: repoRoot, resolved_repo_head: head, resolved_repo_dirty: true,
        resolution, state: 'DEGRADED',
        detail: `${base} — the substrate checkout has uncommitted changes, so its HEAD does not fully describe the code being run.`,
      };
    }
    return {
      resolved_repo_root: repoRoot, resolved_repo_head: head || null, resolved_repo_dirty: dirty === undefined ? null : !!dirty,
      resolution, state: head ? 'AVAILABLE' : 'DEGRADED',
      detail: head ? base : `${base} — could not read HEAD; substrate version unknown.`,
    };
  }

  /** The pair. Kept as two named members so nothing can flatten them by accident. */
  function describeProvenance(input) {
    const artifact = artifactIdentity(input || {});
    const substrate = substrateIdentity(input || {});
    return {
      artifact,
      substrate,
      // An explicit, testable assertion that the two were not collapsed.
      identities_distinct: true,
      // True when the Desktop can name BOTH facts. This is the F3 condition —
      // not "does it run", but "can it say who it is and what it is acting on".
      // A conflicted override cannot report clean satisfaction: the substrate is
      // known, but it is not the one the founder selected. `substrate.conflict`
      // is redundant with state !== AVAILABLE today and is asserted anyway, so a
      // future state change cannot quietly re-admit a conflicted substrate here.
      self_binding_satisfied:
        artifact.state === 'AVAILABLE' &&
        substrate.state === 'AVAILABLE' &&
        !substrate.conflict &&
        substrate.resolution !== RESOLUTION.DEFAULT,
    };
  }

  /** Window-title identity — F5. One visible window, one attributable artifact. */
  function windowTitle(artifact) {
    if (artifact && artifact.app_build_sha) return `JARVIS — build ${artifact.app_build_sha}`;
    if (artifact && !artifact.packaged) return 'JARVIS — dev (unpackaged)';
    return 'JARVIS — unstamped build';
  }

  return { RESOLUTION, artifactIdentity, substrateIdentity, describeProvenance, windowTitle };
});
