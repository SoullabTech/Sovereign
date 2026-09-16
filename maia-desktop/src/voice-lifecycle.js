// MAIA Desktop — voice session lifecycle. DSC-04.
//
// Extracted from two ipcMain handlers. What a CoreAudio host would owe
// identically: what happens when capture begins, when a frame arrives, when the
// microphone is refused, when capture is lost, and when the member stops.
//
// ⛔ WHAT STAYED IN THE HOST, deliberately:
//   the IPC envelope and payload validation (frame length, frameMs, sample rate)
//   the signed-in gate and the already-capturing guard
//   newVoiceSession — the composition root, which is where concreteness belongs
//   the `voice` reference itself: this module never holds it, it asks for it
//
// ── DESKTOP-CONVERSATION-WIRING-01 — THE BOUNDARY ASKS BEFORE IT ACTS ───────
//
// `frame()` used to call `dispatchTurn()` on every VAD utterance boundary,
// unconditionally. The VAD does not know whether MAIA is speaking, and the
// microphone hears her: her reply arrives back through it, produces voiced
// frames, produces a boundary, and a turn was started FOR HER WORDS. The member
// then watched MAIA answer herself.
//
// Now every VAD transition is offered to `DesktopConversation` first, and a turn
// runs only if the authority ACCEPTED the boundary. While the turn axis is
// anywhere but `idle` — finalizing, waiting for MAIA, or MAIA speaking — the
// opening event is refused as `input_disarmed` and no turn is created.
//
// ⛔ AND CAPTURE IS UNTOUCHED BY ANY OF IT (RESET-01 §2). A refused boundary
// does not stop the microphone, does not close the epoch, and does not end the
// capture session. Frames keep arriving and liveness keeps being proven. VAD
// ends an utterance; it does not end listening.
//
// ⛔ SESSION REVOCATION (invariant §7B). This module NEVER stores a session. It
// re-resolves through `voice()` at each point of use, and when a session must
// die it calls `revokeSession()` — the host owns the reference and performs the
// revocation. A capability that could null the host's variable would be holding
// lifecycle authority it does not own.
//
// ── THE LIFECYCLE, AS THE CODE ACTUALLY RUNS ────────────────────────────────
//
//   begin        epoch opens · liveness ARMED (starting) · supervision starts
//   frame        the only thing that promotes liveness to LISTENING
//   micResult    granted → recorded; DENIED → epoch closed, session revoked
//   captureLost  epoch closed, liveness seeks ONE rebuild, session SURVIVES
//   end          liveness disarmed · supervision stopped · epoch committed
//
// ⭐ THE ASYMMETRY RULING (DSC-04). `micResult(false)` does NOT call
// `liveness.lost`, while `captureLost` does. That is INTENTIONAL, and it is not
// an accident of naming:
//
//   · `liveness.lost` is a RECOVERY-SEEKING transition. It moves the machine to
//     RECOVERING and spends one of the member's bounded recoveries, on the
//     expectation that a rebuild is in flight.
//   · A refused microphone is not recoverable by rebuilding the audio graph. No
//     rebuild is in flight, and none would help.
//   · So calling it would assert a false history — RECOVERING, about a session
//     being destroyed on the next line — and would burn the single recovery a
//     later real loss is entitled to.
//   · Nothing is left inconsistent by omitting it: the session is revoked
//     whole, its liveness machine dies with it, and the projection then reads
//     the domain's IDLE because there is no session at all.
//
//   The member-facing truths differ too, which is the point: denial is "we are
//   not capturing, and permission is yours to give"; loss is "we are trying to
//   get it back". Reporting the second for the first would be the silent-success
//   class of lie D02A exists to refuse.
//
//   ⛔ `epoch.captureLost` IS called on denial, and that is not symmetry — it is
//   necessary. `startEpoch()` runs at `begin`, BEFORE the permission result
//   arrives, so an epoch is genuinely open when denial lands and must be closed
//   (salvaging any open partial) rather than abandoned.

'use strict';

/**
 * ⛔ THE RATIFIED REVOCATION CAUSES. HOUSE-RECONCILE-01.
 *
 * `revokeCapture` is a neutral verb, and a neutral verb is exactly what turns
 * into a semantic garbage chute if it is left unguarded — the convenient way to
 * "reset voice" from anywhere. So each cause is declared here with the argument
 * for why it IS revocation, and a proof asserts that every call site in the tree
 * uses a ratified one. Adding an entry is an authority decision.
 *
 * The test each entry must pass: *if the cause string changed but the lifecycle
 * operation stayed the same, would the member-facing and authority semantics be
 * identical?* If not, it is a different operation and must not share this verb.
 *
 * ⛔ `source` is PROVENANCE and must not be shared for convenience. A crossing
 * that reported `auth_teardown` would put a false cause in the witness record —
 * the trigger is exactly what a later walk needs to reconstruct.
 */
const REVOCATION_CAUSES = Object.freeze({
  signed_out: {
    source: 'auth_teardown',
    why: 'The member signed out. Their authority to capture is gone, so there is no member-authored completion to commit and no rebuild that could help.',
  },
  session_expired: {
    source: 'auth_teardown',
    why: 'A credential was rejected on an authenticated call — the 401 door, which any background poll can walk through minutes into a session. Same authority loss as sign-out, arrived at without a member gesture.',
  },
  attention_crossed: {
    source: 'attention_crossing',
    why: 'The member crossed into a platform place. Capture authority is withdrawn because attention the member cannot see is not attention they consented to: a live microphone behind the House would be listening, transcribing and answering someone who has visibly gone elsewhere. Nothing is committed, because words spoken before the threshold are not a turn the member finished.',
  },
});

/**
 * @param voice          () => session | null   never stored; re-resolved at use
 * @param watch          capture supervision capability (start/stop)
 * @param announce       () => void   push the state projection to the surface
 * @param dispatchTurn   () => void   an utterance boundary may request a final
 * @param revokeSession  () => void   the HOST drops its session reference
 * @param projectState   () => object the host's state projection, for `end`
 */
function createVoiceLifecycle({
  voice,
  watch,
  announce,
  dispatchTurn,
  revokeSession,
  authority,
  projectState = () => null,
} = {}) {
  if (!authority || typeof authority.dispatch !== 'function') {
    throw new Error('voice lifecycle requires the DesktopConversation authority');
  }
  const session = () => (voice ? voice() : null);

  /**
   * Capture has begun. The session is already composed and its sample rate
   * already validated by the host.
   *
   * ⛔ ORDER IS SEMANTIC: the epoch opens BEFORE liveness is armed. Arming
   * declares that frames are expected; expecting frames for an epoch that has
   * not opened would leave a detected loss with no epoch to close.
   */
  function begin() {
    const v = session();
    if (!v) return { ok: false, reason: 'no capture session' };
    v.epoch.startEpoch();
    v.liveness.arm();
    watch.start();
    // ⭐ RESET-01 §3. Pressed once. The conversational capture session opens
    // here and does not close again for an utterance, a pause, a turn, or
    // MAIA speaking — only for the member, a genuine failure, or a teardown.
    //
    // ⛔ `START_VOICE` ONLY — the authority goes to `opening`, NOT to `open`.
    // D02A's whole finding was that graph connection is not evidence of audio:
    // the interface said "Listening…" for sixteen seconds against zero frames.
    // The authority inherits that rule rather than re-learning it — only a
    // frame may claim the capture is open (see `frame`).
    authority.dispatch({ type: 'START_VOICE' });
    announce();
    return { ok: true };
  }

  /**
   * One block of owned PCM. The hot path.
   *
   * ⛔ ORDER IS SEMANTIC throughout:
   *   · liveness is noted BEFORE the buffer, so a rebuild that just succeeded
   *     is visible on the frame that proves it
   *   · the buffer accumulates CONTINUOUSLY, not from `speech_started` — the
   *     VAD needs consecutive frames to confirm speech, so buffering at the
   *     acknowledgement would clip the first syllable of every utterance
   *   · the buffer is filled BEFORE the VAD runs, because an
   *     `utterance_boundary` in that same call consumes the buffer
   */
  function frame(samples, frameMs) {
    const v = session();
    if (!v) return { ok: false, reason: 'no capture session' };

    v.frames += 1;

    // Audio is arriving, so the capture graph is alive. If a loss was detected
    // and a rebuild was in flight, this is the proof it worked.
    //
    // ⭐ FRAME RECEIPT IS THE AUTHORITY FOR LISTENING (D02A), and it is what
    // moves the authority's capture axis to `open` — on the first frame, and
    // again after a recovery. `noteFrame()` returns a transition for exactly
    // those two cases and null while healthy, so this maps 1:1 onto
    // `opening → open` and `recovering → open` with nothing to keep in sync.
    if (v.liveness.noteFrame()) {
      authority.dispatch({ type: 'CAPTURE_OPENED' });
      announce();
    }

    const pcm = samples instanceof Float32Array ? samples : Float32Array.from(samples);
    v.utterance.push(pcm);

    for (const t of v.vad.push(pcm, frameMs)) {
      if (t === 'audio_started') v.epoch.audioStarted();
      else if (t === 'speech_started') {
        v.epoch.speechStarted();
        // The epoch records what the microphone did; the authority decides
        // whether it OPENS A TURN. During MAIA's reply it will not, and the
        // refusal is the point.
        authority.dispatch({ type: 'VAD_SPEECH_STARTED' });
      } else if (t === 'utterance_boundary') {
        // ⛔ A boundary does NOT end the epoch. A pause is still not a finished
        // thought, and capture keeps running through it (§XII).
        //
        // ⛔ AND IT DOES NOT UNCONDITIONALLY START A TURN. If the authority
        // refuses — no utterance was ever opened, because input was disarmed —
        // nothing is transcribed and nothing is asked. This is what stops
        // MAIA's own voice from becoming a member turn.
        const opened = authority.dispatch({ type: 'VAD_UTTERANCE_BOUNDARY' });
        if (opened.accepted) dispatchTurn();
      }
    }
    return { ok: true };
  }

  /**
   * The host reports whether the microphone was granted. A REPORT, never
   * authority: this decides what it means.
   */
  function micResult(granted, errorName) {
    const v = session();
    if (!v) return { ok: false, reason: 'no capture session' };
    if (granted) {
      v.epoch.micGranted();
    } else {
      // See THE ASYMMETRY RULING above: the epoch is open and must close;
      // liveness is NOT sent looking for a rebuild that cannot help.
      v.epoch.captureLost('permission_denied');
      v.diagnostics.emit('voice_transcribe_error', { errorName, phase: 'permission' });
      // A refused microphone is not a loss seeking recovery (see the asymmetry
      // ruling above), and the authority is told the same truth: the capture
      // FAILED. `CAPTURE_LOST` would claim a rebuild is coming.
      authority.dispatch({ type: 'CAPTURE_LOST', cause: 'permission_denied' });
      authority.dispatch({ type: 'CAPTURE_FAILED', cause: 'permission_denied' });
      revokeSession();
    }
    announce();
    return { ok: true };
  }

  /**
   * An explicit loss — `track_ended`, `track_muted`, or the supervisor's own
   * detection reported inward. The session SURVIVES: liveness seeks one rebuild.
   */
  function captureLost(cause) {
    const v = session();
    if (!v) return { ok: false, reason: 'no capture session' };
    const tail = v.epoch.captureLost(cause);
    // Routing all three losses through one state machine is what stops a muted
    // device and a dead worklet from diverging in what the member is shown.
    v.liveness.lost(cause);
    // ⛔ The capture axis moves; the turn axis is the authority's business. A
    // reply already in flight to MAIA is not cancelled by a dead microphone —
    // the member's words left the microphone at the final.
    authority.dispatch({ type: 'CAPTURE_LOST', cause });
    announce();
    return { ok: true, tail };
  }

  /**
   * The member stopped.
   *
   * ⛔ ORDER IS SEMANTIC: supervision stops before the epoch closes, so a tick
   * cannot report a loss for a session being closed deliberately; and the
   * projection is taken BEFORE the session is revoked, or the caller would be
   * handed the idle snapshot instead of what was just committed.
   */
  function end() {
    const v = session();
    if (!v) return { ok: false, reason: 'no capture session' };
    v.liveness.disarm();
    watch.stop();
    // ⛔ The member stopped LISTENING. `STOP_VOICE` closes the capture axis and
    // deliberately leaves an answer already in flight alone — stopping the
    // microphone is not stopping MAIA.
    authority.dispatch({ type: 'STOP_VOICE' });
    const tail = v.epoch.userStop();
    const text = v.epoch.commit();
    const snapshot = projectState();
    revokeSession();
    announce();
    // `chars` only — the transcript itself goes to the surface, never telemetry.
    return { ok: true, tail, chars: text.length, snapshot };
  }

  /**
   * ⭐ AUTH-TEARDOWN-CAPTURE-01 + HOUSE-RECONCILE-01. Capture authority is
   * WITHDRAWN. Named for what happens to capture; the caller supplies why.
   *
   * Its place among the three ways capture can end:
   *
   *   end()             the member intentionally stops
   *                     → authorship applies: the epoch commits
   *   captureLost()     a live capture unexpectedly disappears
   *                     → recovery may be sought: one rebuild
   *   revokeCapture()   capture authority is withdrawn
   *                     → NO member-authored completion, NO recovery claim,
   *                       release what must not survive
   *
   * ⛔ ORDER IS SEMANTIC, inherited intact:
   *   · supervision stops FIRST and unconditionally — a timer outliving its
   *     session is the same class of leak in miniature
   *   · the session is revoked BEFORE the released one is touched, so a turn
   *     dispatched in the meantime refuses at its own guard
   *   · the in-flight turn flag is deliberately NOT cleared. If a turn is in
   *     flight its own `finally` owns that flag, and clearing it here would let
   *     a second turn start under the first. With the session revoked the turn
   *     refuses anyway. (It ends as REVOKED rather than failed — see turn.js.)
   *   · the announcement is last, and is authoritative idle
   *
   * ⛔ An unratified cause still revokes — a teardown must never be blocked by
   * a vocabulary check — but it is recorded as `unratified` rather than
   * borrowing another trigger's provenance, so it is visible instead of silent.
   *
   * Idempotent: revoking twice is not an error, and the second call says so.
   */
  function revokeCapture({ cause } = {}) {
    watch.stop();
    const released = session();
    if (!released) return { ok: false, revoked: false };

    const ratified = REVOCATION_CAUSES[cause];
    // Authority is WITHDRAWN, so there is no member-authored completion to
    // protect: the turn is cancelled and the capture axis closed. Unlike
    // `end()`, an in-flight reply must NOT be delivered — nobody authorised it
    // any more.
    authority.dispatch({ type: 'CANCEL' });
    authority.dispatch({ type: 'STOP_VOICE' });
    revokeSession();
    released.liveness.disarm();
    released.diagnostics.emit('voice_capture_lost', {
      cause: cause || 'unspecified',
      source: ratified ? ratified.source : 'unratified',
    });
    announce();
    return { ok: true, revoked: true, cause: cause || 'unspecified' };
  }

  return { begin, frame, micResult, captureLost, end, revokeCapture };
}

module.exports = { createVoiceLifecycle, REVOCATION_CAUSES };
