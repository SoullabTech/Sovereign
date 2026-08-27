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
];

export const INVOKE_CHANNEL_NAMES = RATIFIED_INVOKE_CHANNELS.map((c) => c.channel).sort();
export const PUSH_CHANNEL_NAMES = RATIFIED_PUSH_CHANNELS.map((c) => c.channel).sort();
