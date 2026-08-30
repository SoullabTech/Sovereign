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
  projectState = () => null,
} = {}) {
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
    if (v.liveness.noteFrame()) announce();

    const pcm = samples instanceof Float32Array ? samples : Float32Array.from(samples);
    v.utterance.push(pcm);

    for (const t of v.vad.push(pcm, frameMs)) {
      if (t === 'audio_started') v.epoch.audioStarted();
      else if (t === 'speech_started') v.epoch.speechStarted();
      else if (t === 'utterance_boundary') {
        // ⛔ A boundary does NOT end the epoch. A pause is still not a finished
        // thought, and capture keeps running through it (§XII).
        dispatchTurn();
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
    const tail = v.epoch.userStop();
    const text = v.epoch.commit();
    const snapshot = projectState();
    revokeSession();
    announce();
    // `chars` only — the transcript itself goes to the surface, never telemetry.
    return { ok: true, tail, chars: text.length, snapshot };
  }

  /**
   * ⭐ AUTH-TEARDOWN-CAPTURE-01. The member's authority to capture is gone —
   * signed out, or a credential rejected on any authenticated call. Capture is
   * released, and it is released FIRST, before the rest of member state falls
   * away.
   *
   * ⛔ WHY FIRST, and why this path has to exist at all: capture is the one
   * piece of member state that used to outlive its member, and it is the piece
   * that blocks every recovery — while a session is held, signing back in still
   * cannot start listening.
   *
   * ⛔ NOT `end()`. The member did not stop. Nothing is committed, no tail is
   * taken, and no transcript is returned to a caller who no longer holds
   * authority over it. This is a release, not a completion.
   *
   * ⛔ NOT `captureLost()`. That seeks a rebuild. Nothing is recoverable here:
   * the session is going away entirely.
   *
   * ⛔ ORDER IS SEMANTIC, inherited intact from the implementation this replaces:
   *   · supervision stops FIRST and unconditionally — a timer outliving its
   *     session is the same class of leak in miniature
   *   · the session is revoked BEFORE the released one is touched, so a turn
   *     dispatched in the meantime refuses at its own guard
   *   · the in-flight turn flag is deliberately NOT cleared. If a turn is in
   *     flight its own `finally` owns that flag, and clearing it here would let
   *     a second turn start under the first. With the session revoked the turn
   *     refuses anyway, so nothing is gained by racing it. (The turn itself
   *     ends as REVOKED rather than failed — see turn.js.)
   *   · the announcement is last, and is authoritative idle
   *
   * Idempotent: releasing twice is not an error, and the second call says so.
   */
  function releaseOnAuthLoss(cause) {
    watch.stop();
    const released = session();
    if (!released) return { ok: false, released: false };

    revokeSession();
    released.liveness.disarm();
    released.diagnostics.emit('voice_capture_lost', { cause, source: 'auth_teardown' });
    announce();
    return { ok: true, released: true };
  }

  return { begin, frame, micResult, captureLost, end, releaseOnAuthLoss };
}

module.exports = { createVoiceLifecycle };
