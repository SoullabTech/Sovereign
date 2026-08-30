// MAIA Desktop — the turn. DESKTOP-CONVERSATION-01 / DSC-02.
//
// Extracted from main.js by DESKTOP SOVEREIGN CORE 02. Nothing here changed in
// the move. The acceptance for DESKTOP-CONVERSATION-01 is back-and-forth
// conversation, so this is the loop that matters, and none of it is Electron's:
// a native host announces phases through its own surface and hands audio to its
// own output device, while what a turn MEANS stays here.
//
// Every failure is surfaced to the member in words rather than swallowed — a
// companion that goes quiet after you speak is the failure mode this whole
// programme exists to avoid.
//
// ⛔ THREE ORDERINGS HERE ARE SEMANTIC, NOT INCIDENTAL. DSC-01 established the
// rule the hard way (see the invariant §7A): moving a caller moves its ordering
// obligations even when every module it calls stays correct.
//
//   1. transcription succeeds → epoch.final → announce 'heard'
//      The epoch records a FINAL only for a transcript canonical MAIA actually
//      returned. An empty or failed transcription must record nothing: the tail
//      invariant would then be protecting material the member never said, and
//      a local host would be asserting what no canonical action confirmed.
//
//   2. an empty take() returns WITHOUT entering the busy state
//      A cough is not a turn. Entering busy for one would defer a canonical
//      thread adoption in continuity, which reads this module's `isBusy` — so a
//      throat-clear elsewhere in the house would stall the member's continuity.
//
//   3. busy is released in `finally`, on every path including a throw
//      A leaked busy flag freezes every later turn AND permanently defers
//      adoption. The release is cross-unit, not local hygiene.
//
// ⛔ The runtime references are read through getters at exactly the points the
// original read them, INCLUDING after an await. That is deliberate: if the
// member stops capture or signs out mid-turn, the next read finds a dead
// session and the throw becomes a surfaced error. Capturing them once at entry
// would instead write quietly into a session that no longer exists.

'use strict';

/**
 * @param conversation () => conversation client | null   (re-created at sign-in)
 * @param voice        () => voice session | null         (created per capture)
 * @param announce     (payload) => void   one turn-phase announcement
 * @param speak        (audio) => void     MAIA's voice to an output device
 */
function createTurn({
  conversation,
  voice,
  announce,
  speak,
  now = () => Date.now(),
} = {}) {
  let busy = false;

  async function run() {
    if (!voice() || busy || !conversation()) return;
    const taken = voice().utterance.take();
    if (!taken) return;                    // silence or a cough, not an utterance
    busy = true;
    try {
      announce({ phase: 'transcribing' });

      const t = await conversation().transcribe(taken.samples, voice().sampleRate);
      if (!t.ok) { announce({ phase: 'error', error: t.error }); return; }

      const said = (t.text || '').trim();
      if (!said) { announce({ phase: 'idle' }); return; }

      // The transcript is a FINAL for the epoch — the tail invariant now has real
      // material to protect, which on the first walk it never did.
      voice().epoch.final(said, `utt-${now()}`);
      announce({ phase: 'heard', member: said });

      announce({ phase: 'thinking' });
      const a = await conversation().ask(said);
      if (!a.ok) { announce({ phase: 'error', error: a.error }); return; }

      // Words before voice, always. The surface must never speak an answer it
      // has not yet shown — that is how text and voice diverge.
      announce({ phase: 'answered', maia: a.text });
      if (a.audio) speak(a.audio);
      else announce({ phase: 'no-voice' });
    } catch (e) {
      announce({ phase: 'error', error: (e && e.message) || 'turn failed' });
    } finally {
      busy = false;
    }
  }

  return {
    run,
    /** Read by continuity: a turn in flight defers thread adoption. */
    get isBusy() { return busy; },
  };
}

module.exports = { createTurn };
