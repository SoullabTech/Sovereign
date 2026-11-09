/**
 * LISTEN-56 · Bounded MAIA → EXISTING Listening provider action seam.
 *
 * This bridge does NOT mint source rights, verify sessions, create an audio
 * engine, auto-start a Focus timer, or write MAIA memory. The only input caller
 * is a single authenticated and F1-accepted, final member-authored command.
 * It is deliberately fail-closed until the existing independently verified
 * recording/signed-media authority is admitted. No browser assertion may flip
 * mediaAdmission to 'verified'.
 *
 * The port methods are already owned by PersistentListeningProvider; the one
 * newly exposed alias must point to that provider's existing stopAll().
 */
import { evaluateMaiaMusicCommand } from './maiaMusicCommand';
import type {
  MaiaMusicCommand, TrustedListeningGateSnapshot, ListeningGateResult,
} from './maiaMusicCommand';

export type MaiaMusicBridgePort = {
  readonly snapshot: { readonly playback: 'idle' | 'playing' | 'paused' | 'error'; readonly kind?: 'none' | 'sketch' | 'local-file' | 'review-media' };
  readonly focusSession: { readonly status: 'ready' | 'running' | 'paused' | 'completed' | 'stopped' } | null;
  readonly pause: () => void;
  readonly stopMusic: () => void;
  readonly pauseFocusSession: (reason?: 'member') => boolean;
  readonly resumeFocusSession: () => boolean;
  readonly stopFocusSession: () => boolean;
};

export type MaiaMusicBridgeEnvironment = {
  /** Must come from verified, member-scoped AuthenticatedListeningBoundary. */
  readonly listeningBoundaryReady: boolean;
  readonly port: MaiaMusicBridgePort | null;
  /** Source-side observation only; music output priority is still owned by audioFocus. */
  readonly maiaProtectedSpeechActive: boolean;
};

export type MaiaMusicBridgeOutcome = {
  readonly code:
    | 'STOPPED_MUSIC' | 'STOPPED_FOCUS' | 'PAUSED_MUSIC'
    | 'PAUSED_FOCUS' | 'RESUMED_FOCUS' | 'SHOW_LISTENING_CHOICES'
    | 'NO_ACTIVE_MUSIC' | 'NO_FOCUS_SESSION' | 'FOCUS_BUSY'
    | 'AUTH_REQUIRED' | 'TRANSPORT_UNAVAILABLE' | 'MEDIA_NOT_ADMITTED'
    | 'SHAPING_NOT_AUTHORIZED' | 'VOICE_OWNS_OUTPUT' | 'READER_OWNS_OUTPUT'
    | 'OUTPUT_UNAVAILABLE' | 'GESTURE_REQUIRED' | 'MEDIA_REVOKED';
  readonly changedLocalState: boolean;
  readonly musicStarted: false;
  readonly message: string;
};

function outcome(
  code: MaiaMusicBridgeOutcome['code'],
  message: string,
  changedLocalState = false,
): MaiaMusicBridgeOutcome {
  return { code, message, changedLocalState, musicStarted: false };
}

const unavailable = outcome('MEDIA_NOT_ADMITTED',
  'Focus Field sessions are ready, but no rights-admitted focus music is available in Soullab yet. Nothing has started.');

/** No caller-supplied, model-supplied or localStorage media grant is accepted. */
export function executeMaiaMusicCommandInExistingTransport(
  command: MaiaMusicCommand,
  environment: MaiaMusicBridgeEnvironment,
): MaiaMusicBridgeOutcome {
  const port = environment.port;

  // Member safety command. A local stop never needs the network, an approved
  // master or a refreshed cookie; it can only stop this EXISTING local port.
  if (command.kind === 'music-stop') {
    if (!port) return outcome('NO_ACTIVE_MUSIC', 'No local music player is active.');
    // A spoken member Stop may follow MAIA's higher-priority capture,
    // which pauses the Focus clock. Do not tell a member that time is
    // running when it is actually paused. Typed Stop leaves running Focus.
    const focusStatus = port.focusSession?.status;
    // Even an idle Stop calls the original terminal stopAll() to invalidate
    // pending asynchronous playback. But it MUST NOT tell another member
    // "Music stopped" when there was no source playing or paused locally.
    const hadMusic = port.snapshot.kind === 'none' ? false
      : port.snapshot.playback === 'playing' || port.snapshot.playback === 'paused';
    port.stopMusic();
    const focusMessage = focusStatus === 'paused'
      ? ' Your Focus session is paused until you resume it.'
      : focusStatus === 'running'
        ? ' Your Focus session continues.'
        : '';
    return outcome(hadMusic ? 'STOPPED_MUSIC' : 'NO_ACTIVE_MUSIC',
      (hadMusic ? 'Music stopped.' : 'No music was playing.') + focusMessage, true);
  }
  if (command.kind === 'focus-session-stop') {
    if (!port) return outcome('NO_FOCUS_SESSION', 'No local Focus session is active.');
    const stopped = port.stopFocusSession();
    return stopped ? outcome('STOPPED_FOCUS', 'Focus session stopped.', true)
      : outcome('NO_FOCUS_SESSION', 'There is no running Focus session to stop.');
  }

  if (!environment.listeningBoundaryReady)
    return outcome('AUTH_REQUIRED', 'Private listening requires a verified member session.');
  if (!port)
    return outcome('TRANSPORT_UNAVAILABLE', 'Listening is not available in this room.');

  const gate: TrustedListeningGateSnapshot = {
    verifiedCurrentMember: environment.listeningBoundaryReady,
    existingTransportReady: Boolean(port),
    // This hardcoded, deny-by-default review gate must be replaced ONLY under
    // an independently accepted signed media authority. Never use form data.
    mediaAdmission: 'absent',
    output: environment.maiaProtectedSpeechActive ? 'maia-voice' : 'available',
    userGestureAvailable: false,
    creatorAllowsShaping: false,
    playbackState: port.snapshot.playback === 'error' ? 'idle' : port.snapshot.playback,
    focusSessionState: port.focusSession?.status || 'none',
  };
  const decision: ListeningGateResult = evaluateMaiaMusicCommand(command, gate);
  if (decision.disposition === 'defer')
    return outcome(decision.code === 'READER_OWNS_OUTPUT' ? 'READER_OWNS_OUTPUT' : 'VOICE_OWNS_OUTPUT',
      'MAIA or the Reader currently has the sound output. Nothing will restart automatically.');
  if (decision.disposition === 'refuse') {
    switch (decision.code) {
      case 'AUTH_REQUIRED': return outcome('AUTH_REQUIRED', 'Private listening requires a verified session.');
      case 'TRANSPORT_UNAVAILABLE': return outcome('TRANSPORT_UNAVAILABLE', 'Listening is unavailable.');
      case 'MEDIA_NOT_ADMITTED': return unavailable;
      case 'MEDIA_REVOKED': return outcome('MEDIA_REVOKED', 'That recording is not currently authorized.');
      case 'NO_ACTIVE_AUDIO': return outcome('NO_ACTIVE_MUSIC', 'No music is currently playing.');
      case 'FOCUS_SESSION_NOT_RUNNING':
      case 'FOCUS_SESSION_NOT_PAUSED': return outcome('FOCUS_BUSY', 'The Focus session is not in the requested state.');
      case 'SHAPING_NOT_AUTHORIZED': return outcome('SHAPING_NOT_AUTHORIZED', 'This work is not authorized for sound shaping.');
      case 'OUTPUT_UNAVAILABLE': return outcome('OUTPUT_UNAVAILABLE', 'Audio output is unavailable.');
      case 'GESTURE_REQUIRED': return outcome('GESTURE_REQUIRED', 'Press Play in the Listening Room to begin.');
    }
  }
  // The only side effects permitted *today* affect the existing in-memory
  // Focus state or the current local sound. Do not call playSketch as a proxy
  // for a real Focus recording, nor startFocusSession before media admission.
  switch (decision.code) {
    case 'PAUSE_PRECHECK_ONLY':
      port.pause(); return outcome('PAUSED_MUSIC', 'Music paused. The Focus timer continues.', true);
    case 'PAUSE_FOCUS_ONLY':
      return port.pauseFocusSession('member')
        ? outcome('PAUSED_FOCUS', 'Focus session and any current music paused.', true)
        : outcome('FOCUS_BUSY', 'The Focus session could not be paused.');
    case 'RESUME_FOCUS_ONLY':
      return port.resumeFocusSession()
        ? outcome('RESUMED_FOCUS', 'Focus time resumed. Music was not restarted.', true)
        : outcome('FOCUS_BUSY', 'The Focus session could not be resumed.');
    case 'SHOW_CHOICES_ONLY':
      return outcome('SHOW_LISTENING_CHOICES', 'Open the Listening Room to choose your sound field.');
    case 'START_PRECHECK_ONLY':
    case 'RESUME_PRECHECK_ONLY':
    case 'RETUNE_PRECHECK_ONLY':
      return unavailable;
    default: return unavailable;
  }
}

/**
 * A pending command must never cross an authenticated Listening provider remount.
 * The stable opaque object is created by the existing member-scoped provider.
 * This is local lifecycle continuity, not a substitute for authentication.
 * No member identifier or raw session credential is stored in the marker.
 */
export function isCurrentListeningInstance(
  origin: object | null, active: object | null,
): boolean {
  return origin !== null && active !== null && origin === active;
}
