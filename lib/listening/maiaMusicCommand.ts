/**
 * LISTEN-54 R1 / LISTEN-55 source-owner revision: SIDE-EFFECT-FREE command grammar.
 *
 * REVIEW PACKET ONLY. This file is not installed in the Soullab repository.
 * It neither authenticates a member nor plays sound, fetches private content,
 * produces provider inference, licenses recordings, starts a timer, or modifies
 * the existing VoiceCommandDetector / FocusFieldSession / audio authority.
 *
 * Any eventual caller MUST use the existing verified session and listening
 * boundary, not trust a client memberId or a model-authored intent. Audio
 * effects belong exclusively to the single PersistentListeningProvider under
 * AUDIO-PLATFORM-01 with rights/media delivery authority independently proven.
 */

export type AuthoredEventOrigin =
  | 'typed-final-user'
  | 'voice-final-user'
  | 'voice-partial'
  | 'assistant-generated'
  | 'system-generated';

export type FocusWorldHint =
  | 'classical' | 'ambient' | 'cinematic' | 'electronic'
  | 'organic' | 'nature' | 'rhythmic';

export type FocusTaskHint = 'writing' | 'reading' | 'coding' | 'studying' | null;

export type MaiaMusicCommand =
  | { readonly kind: 'focus-start'; readonly world: FocusWorldHint | null;
      readonly task: FocusTaskHint; readonly minutes: 25 | 50 | 90 | null }
  | { readonly kind: 'focus-session-stop' }
  | { readonly kind: 'focus-session-pause' }
  | { readonly kind: 'focus-session-resume' }
  | { readonly kind: 'music-stop' }
  | { readonly kind: 'music-pause' }
  | { readonly kind: 'music-resume' }
  | { readonly kind: 'music-show-choices' }
  | { readonly kind: 'music-more-spacious' }
  | { readonly kind: 'music-more-rhythmic' };

export type ParseDecision =
  | { readonly status: 'no-command' }
  | { readonly status: 'recognized'; readonly command: MaiaMusicCommand };

/**
 * Exact, anchored verbs. Not an LLM: a conversational reflection such as
 * "I wish someone would play focus music" must not start music. A command
 * inside a quote or a mixed request is not an executable MAIA directive.
 */
export function recognizeMaiaMusicCommand(
  authoredText: unknown,
  origin: AuthoredEventOrigin,
): ParseDecision {
  if (origin !== 'typed-final-user' && origin !== 'voice-final-user')
    return { status: 'no-command' };
  if (typeof authoredText !== 'string' || authoredText.length > 200)
    return { status: 'no-command' };
  if (/[\r\n\u0000-\u001f\u007f]/.test(authoredText))
    return { status: 'no-command' };
  const text = authoredText.trim().replace(/\s+/g, ' ');
  if (!text)
    return { status: 'no-command' };
  // A phrase wrapped in quotation marks is evidence about a command,
  // not permission to execute that command.
  if (/^[“”"'‘’]/.test(text)) return { status: 'no-command' };

  // At most a vocative and one politeness prefix; no trailing arbitrary text.
  const lead = text.replace(/^(?:hey\s+)?maia\s*[,.:]?\s*/i, '')
                   .replace(/^(?:please\s+|could\s+you\s+|would\s+you\s+please\s+)/i, '');
  const command = lead.replace(/[.!]\s*$/, '').trim();
  const start = command.match(
    /^(?:play|start|put on)\s+(?:(ambient|classical|cinematic|electronic|organic|nature|rhythmic)\s+)?(?:some\s+)?(?:focus\s+(?:music|sound)|music\s+for\s+(?:focus|concentration))(?:\s+for\s+(writing|reading|coding|studying))?(?:\s+for\s+(25|50|90)\s+minutes?)?$/i,
  );
  if (start) return {
    status: 'recognized',
    command: {
      kind: 'focus-start',
      world: (start[1]?.toLowerCase() as FocusWorldHint | undefined) ?? null,
      task: (start[2]?.toLowerCase() as FocusTaskHint | undefined) ?? null,
      minutes: start[3] ? (Number(start[3]) as 25 | 50 | 90) : null,
    },
  };
  // Focus session controls govern the TIMER, not the music output.
  if (/^(?:stop|end)\s+(?:(?:the|my)\s+)?focus\s+(?:session|field)$/i.test(command))
    return { status: 'recognized', command: { kind: 'focus-session-stop' } };
  if (/^pause\s+(?:(?:the|my)\s+)?focus\s+(?:session|field)$/i.test(command))
    return { status: 'recognized', command: { kind: 'focus-session-pause' } };
  if (/^(?:resume|continue)\s+(?:(?:the|my)\s+)?focus\s+(?:session|field)$/i.test(command))
    return { status: 'recognized', command: { kind: 'focus-session-resume' } };

  // Music commands govern the ACTIVE AUDIO; they do not stop the Focus timer.
  if (/^(?:stop|turn off|end)\s+(?:the\s+)?(?:music|sound|focus\s+music)$/i.test(command))
    return { status: 'recognized', command: { kind: 'music-stop' } };
  if (/^pause\s+(?:the\s+)?(?:music|sound|focus\s+music)$/i.test(command))
    return { status: 'recognized', command: { kind: 'music-pause' } };
  if (/^(?:resume|continue)\s+(?:the\s+)?(?:music|sound|focus\s+music)$/i.test(command))
    return { status: 'recognized', command: { kind: 'music-resume' } };
  if (/^(?:show|open)\s+(?:my\s+)?(?:music\s+choices|focus\s+music\s+choices|listening\s+room)$/i.test(command))
    return { status: 'recognized', command: { kind: 'music-show-choices' } };
  if (/^(?:make\s+(?:the\s+)?music\s+)?(?:more\s+spacious|less\s+rhythm(?:\s+and\s+more\s+space)?)$/i.test(command))
    return { status: 'recognized', command: { kind: 'music-more-spacious' } };
  if (/^(?:make\s+(?:the\s+)?music\s+)?(?:more\s+rhythm(?:ic)?|more\s+rhythm,?\s+less\s+atmosphere)$/i.test(command))
    return { status: 'recognized', command: { kind: 'music-more-rhythmic' } };
  return { status: 'no-command' };
}

/**
 * These fields are a TESTABLE POLICY MODEL, not self-authenticating evidence.
 * Only the existing source owner may bind them to authenticated server/session
 * and independent media authority. Never accept these flags from user JSON.
 */
export type TrustedListeningGateSnapshot = {
  readonly verifiedCurrentMember: boolean;
  readonly existingTransportReady: boolean;
  readonly mediaAdmission: 'verified' | 'absent' | 'revoked';
  readonly output: 'available' | 'maia-voice' | 'reader' | 'unavailable';
  readonly userGestureAvailable: boolean;
  readonly creatorAllowsShaping: boolean;
  readonly playbackState: 'idle' | 'playing' | 'paused';
  /** Independent authenticated Focus timer lifecycle, never inferred from audio state. */
  readonly focusSessionState: 'none' | 'ready' | 'running' | 'paused' | 'completed' | 'stopped';
};

export type ListeningGateResult =
  | { readonly disposition: 'local-stop-only'; readonly code: 'STOP_LOCAL';
      readonly claim: 'NOT_YET_STOPPED' }
  | { readonly disposition: 'local-focus-stop-only'; readonly code: 'STOP_FOCUS_LOCAL';
      readonly claim: 'NOT_YET_STOPPED' }
  | { readonly disposition: 'refuse'; readonly code:
      'AUTH_REQUIRED' | 'TRANSPORT_UNAVAILABLE' | 'MEDIA_NOT_ADMITTED' |
      'MEDIA_REVOKED' | 'GESTURE_REQUIRED' | 'NO_ACTIVE_AUDIO' |
      'SHAPING_NOT_AUTHORIZED' | 'OUTPUT_UNAVAILABLE' |
      'FOCUS_SESSION_NOT_RUNNING' | 'FOCUS_SESSION_NOT_PAUSED' }
  | { readonly disposition: 'defer'; readonly code: 'VOICE_OWNS_OUTPUT' | 'READER_OWNS_OUTPUT' }
  | { readonly disposition: 'propose-existing-transport-action';
      readonly code: 'START_PRECHECK_ONLY' | 'PAUSE_PRECHECK_ONLY' |
      'RESUME_PRECHECK_ONLY' | 'RETUNE_PRECHECK_ONLY' | 'SHOW_CHOICES_ONLY' |
      'PAUSE_FOCUS_ONLY' | 'RESUME_FOCUS_ONLY' };

export function evaluateMaiaMusicCommand(
  command: MaiaMusicCommand,
  gate: TrustedListeningGateSnapshot,
): ListeningGateResult {
  // Physical local Stop must be possible even if server auth is lost; it may
  // only silence this local transport. Never target another member remotely.
  if (command.kind === 'music-stop')
    return { disposition: 'local-stop-only', code: 'STOP_LOCAL', claim: 'NOT_YET_STOPPED' };
  if (command.kind === 'focus-session-stop')
    return { disposition: 'local-focus-stop-only', code: 'STOP_FOCUS_LOCAL', claim: 'NOT_YET_STOPPED' };
  if (!gate.verifiedCurrentMember)
    return { disposition: 'refuse', code: 'AUTH_REQUIRED' };
  if (!gate.existingTransportReady)
    return { disposition: 'refuse', code: 'TRANSPORT_UNAVAILABLE' };
  // Timer controls MUST NOT require a licensed recording or active audio.
  // These are proposals for existing FocusFieldSession only, not playback.
  if (command.kind === 'focus-session-pause') {
    if (gate.focusSessionState !== 'running')
      return { disposition: 'refuse', code: 'FOCUS_SESSION_NOT_RUNNING' };
    return { disposition: 'propose-existing-transport-action', code: 'PAUSE_FOCUS_ONLY' };
  }
  if (command.kind === 'focus-session-resume') {
    if (gate.focusSessionState !== 'paused')
      return { disposition: 'refuse', code: 'FOCUS_SESSION_NOT_PAUSED' };
    if (gate.output === 'maia-voice')
      return { disposition: 'defer', code: 'VOICE_OWNS_OUTPUT' };
    if (gate.output === 'reader')
      return { disposition: 'defer', code: 'READER_OWNS_OUTPUT' };
    if (gate.output !== 'available')
      return { disposition: 'refuse', code: 'OUTPUT_UNAVAILABLE' };
    return { disposition: 'propose-existing-transport-action', code: 'RESUME_FOCUS_ONLY' };
  }
  if (command.kind === 'music-show-choices')
    return { disposition: 'propose-existing-transport-action', code: 'SHOW_CHOICES_ONLY' };
  if (command.kind === 'music-pause') {
    if (gate.playbackState !== 'playing')
      return { disposition: 'refuse', code: 'NO_ACTIVE_AUDIO' };
    return { disposition: 'propose-existing-transport-action', code: 'PAUSE_PRECHECK_ONLY' };
  }
  if (gate.mediaAdmission === 'revoked')
    return { disposition: 'refuse', code: 'MEDIA_REVOKED' };
  if (gate.mediaAdmission !== 'verified')
    return { disposition: 'refuse', code: 'MEDIA_NOT_ADMITTED' };
  if ((command.kind === 'music-more-spacious' || command.kind === 'music-more-rhythmic') &&
    !gate.creatorAllowsShaping)
    return { disposition: 'refuse', code: 'SHAPING_NOT_AUTHORIZED' };
  if (command.kind === 'music-resume' && gate.playbackState !== 'paused')
    return { disposition: 'refuse', code: 'NO_ACTIVE_AUDIO' };
  if (command.kind.startsWith('music-more-') && gate.playbackState === 'idle')
    return { disposition: 'refuse', code: 'NO_ACTIVE_AUDIO' };
  if (gate.output === 'unavailable')
    return { disposition: 'refuse', code: 'OUTPUT_UNAVAILABLE' };
  if (gate.output === 'maia-voice')
    return { disposition: 'defer', code: 'VOICE_OWNS_OUTPUT' };
  if (gate.output === 'reader')
    return { disposition: 'defer', code: 'READER_OWNS_OUTPUT' };
  if ((command.kind === 'focus-start' || command.kind === 'music-resume') &&
    !gate.userGestureAvailable)
    return { disposition: 'refuse', code: 'GESTURE_REQUIRED' };
  if (command.kind === 'focus-start')
    return { disposition: 'propose-existing-transport-action', code: 'START_PRECHECK_ONLY' };
  if (command.kind === 'music-resume')
    return { disposition: 'propose-existing-transport-action', code: 'RESUME_PRECHECK_ONLY' };
  return { disposition: 'propose-existing-transport-action', code: 'RETUNE_PRECHECK_ONLY' };
}

/** Immutable ticket: an async callback must compare both epochs after await.
 * Epoch changes (Stop, logout, member switch, new command, revoked rights)
 * invalidate it. This method never starts/restarts music. */
export type MusicActionEpochTicket = Readonly<{
  sessionEpoch: number;
  commandEpoch: number;
}>;

export function isPendingMaiaMusicActionCurrent(
  ticket: MusicActionEpochTicket,
  current: MusicActionEpochTicket,
): boolean {
  return Number.isSafeInteger(ticket.sessionEpoch) && ticket.sessionEpoch >= 0 &&
    Number.isSafeInteger(ticket.commandEpoch) && ticket.commandEpoch >= 0 &&
    ticket.sessionEpoch === current.sessionEpoch &&
    ticket.commandEpoch === current.commandEpoch;
}

/**
 * F1 validation of a commandOnly *request*, not an action grant.
 * The authenticated flag must come from the existing server session resolver.
 * A client/user body claim is never a valid actor receipt.
 */
export function isAuthenticatedMusicCommandOnlyRequest(
  message: unknown, commandOnly: unknown, authenticatedFromServer: boolean,
): boolean {
  return commandOnly === true && authenticatedFromServer === true &&
    recognizeMaiaMusicCommand(message, 'typed-final-user').status === 'recognized';
}
