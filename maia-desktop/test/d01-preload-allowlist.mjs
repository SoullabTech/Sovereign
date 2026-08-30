// MAIA Desktop — the ratified preload channel allow-list. MAIA-D01.
//
// MAIA-D00A's finding, applied from the first commit rather than after the
// second regression: the list lives in ONE place, carries the review that
// authorized each channel, and is asserted EXACTly. A subset check is what lets
// the next widening through silently.
//
// ⛔ Adding an entry is an authority decision. Each must answer, in `purpose`:
// required · authorized · minimal · main-validated · doctrine-compatible.

export const RATIFIED_INVOKE_CHANNELS = [
  { channel: 'maia:voice-start', ratified_in: 'MAIA-D01',
    purpose: 'Open a capture session. Takes no argument: main assigns the epoch, so the renderer cannot forge or choose one.' },
  { channel: 'maia:voice-stop', ratified_in: 'MAIA-D01',
    purpose: 'Close capture and commit. Takes no argument; main runs the tail invariant and decides what commits.' },
  { channel: 'maia:voice-frame', ratified_in: 'MAIA-D01',
    purpose: 'Forward one block of owned PCM samples. Main validates length (1..65536) and clamps frameMs (1..1000); no device, endpoint or epoch may be named here.' },
  { channel: 'maia:voice-mic-result', ratified_in: 'MAIA-D01',
    purpose: 'REPORT that getUserMedia resolved or failed. Treated as an observation, never as authority: main decides what a denial means and truncates errorName to 64 chars.' },
  { channel: 'maia:voice-capture-lost', ratified_in: 'MAIA-D01',
    purpose: 'Report a track ending or muting under capture — the silent-death class. cause is truncated to 64 chars; main runs the boundary.' },
  { channel: 'maia:voice-state', ratified_in: 'MAIA-D01',
    purpose: 'Read the current voice snapshot. Read-only; returns counts and chars, never transcript text.' },
  { channel: 'maia:sign-in', ratified_in: 'DESKTOP-CONVERSATION-01',
    purpose: 'Sign in with the EXISTING member contract (POST /api/members/signin). Main truncates username/password, performs the request, and keeps the returned session token in main only. No Desktop-specific identity is invented and no server auth is weakened.' },
  { channel: 'maia:sign-out', ratified_in: 'DESKTOP-CONVERSATION-01',
    purpose: 'Clear the stored session. Takes no argument; main owns the credential and its removal from encrypted storage.' },
  { channel: 'maia:auth-state', ratified_in: 'DESKTOP-CONVERSATION-01',
    purpose: 'Read WHETHER a session exists and whose it is. Read-only, and deliberately never returns the token itself — a renderer that could read the credential could exfiltrate it.' },
  // ⭐ THE FIRST CHANNEL ADDED SINCE D01, and it had to argue for itself.
  //   required          a member cannot type to MAIA without one; there is no
  //                     existing verb that carries member words to main.
  //   authorized        DESKTOP-TEXT-01, whose acceptance is exactly this.
  //   minimal           one string. No thread id, no route, no member id, no
  //                     modality flag — main owns every one of those, as it
  //                     owns the epoch on the voice side.
  //   main-validated    trimmed, capped at 4000 chars, refused when signed out
  //                     or when a turn is already in flight. The renderer's
  //                     own trim is a convenience, not the gate.
  //   doctrine-compat   it forwards WORDS, the same thing `voice-frame`
  //                     forwards as audio. It grants the renderer no authority
  //                     it did not already have by speaking aloud.
  { channel: 'maia:send-text', ratified_in: 'DESKTOP-TEXT-01',
    purpose: 'Send a typed message to the SAME MAIA the member speaks to. Main trims and caps the text, ends any live capture with normal member-Stop semantics first (text and voice are mutually exclusive), and delivers it through the one shared turn path — same route, same thread, same context assembly, same rendering. The renderer names nothing but the words.' },
  { channel: 'maia:playback-ended', ratified_in: 'DESKTOP-CONVERSATION-WIRING-01',
    purpose: 'RESET-01 §6, the half-duplex handoff. Only the renderer holds an output device, so only the renderer can observe that MAIA finished speaking; without the report, main re-armed speech-turn creation while she was still talking and her voice returned through the microphone as a member turn. It carries an OBSERVATION, not authority — like maia:voice-mic-result. The renderer names no turn, generation or conversation; the authority supplies all three and refuses the report if the turn is not maia_speaking, if it arrives twice, or if it belongs to a replaced conversation.' },
  { channel: 'maia:status', ratified_in: 'MAIA-D01',
    purpose: 'Read app identity and build stamp. Read-only. An unstamped build reports UNSTAMPED rather than a fabricated SHA.' },
];

export const RATIFIED_PUSH_CHANNELS = [
  { channel: 'maia:turn', ratified_in: 'DESKTOP-CONVERSATION-01',
    purpose: 'Turn phase and its text, outward only: transcribing, heard, thinking, answered, no-voice, error, idle. Carries the member\'s transcript and MAIA\'s words TO THE SURFACE — never to telemetry, which stays structural.' },
  { channel: 'maia:audio', ratified_in: 'DESKTOP-CONVERSATION-01',
    purpose: 'MAIA\'s synthesized voice as base64 + format, outward only. Arrives on the same MAIA call that produced the words, so voice and text cannot diverge. Playback happens in the renderer because only it has an audio output device.' },
  { channel: 'maia:auth', ratified_in: 'DESKTOP-CONVERSATION-01',
    purpose: 'Session state changed, outward only. Carries signedIn and the member display name — never the token.' },
  { channel: 'maia:voice-event', ratified_in: 'MAIA-D01',
    purpose: 'Diagnostic events, outward only. Privacy-safe by construction — the emitter refuses non-allowlisted string metadata.' },
  { channel: 'maia:voice-state-changed', ratified_in: 'MAIA-D01',
    purpose: 'Voice state snapshot, outward only.' },
  { channel: 'maia:thread', ratified_in: 'MAIA-D04',
    purpose: 'Which conversation Desktop joined, outward only: whether a thread was resumed, its id, and the tail of its turns so the member opens on what was actually said. The turns are the member\'s own words and MAIA\'s, already theirs on every other surface — they go to the surface, never to telemetry. An adoption failure is reported here too, because a silent failure would fork the conversation.' },
];

export const INVOKE_CHANNEL_NAMES = RATIFIED_INVOKE_CHANNELS.map((c) => c.channel).sort();
export const PUSH_CHANNEL_NAMES = RATIFIED_PUSH_CHANNELS.map((c) => c.channel).sort();
