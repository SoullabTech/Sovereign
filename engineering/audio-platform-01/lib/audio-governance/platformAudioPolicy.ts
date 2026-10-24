/**
 * AUDIO-PLATFORM-01 · Soullab shared AUDIO FOCUS POLICY (source-owner review only).
 *
 * Pure policy. Does NOT start, stop, record, stream, license, authenticate,
 * authorize a conversation turn, or grant microphone access.
 * A permitted attempt MUST still pass an independently verified session,
 * consent/rights check (as applicable), AND an actual runtime audio lease.
 * No transcripts, birth charts, recording bytes, member IDs or access tokens.
 *
 * The existing lib/hooks/useAudioCoordinator.ts remains the designated
 * legacy in-document coordination surface. Source owners must reconcile
 * compatibility; do not mount a second global singleton by importing this.
 */

export const AUDIO_PROJECTS = [
  'maia', 'writers-studio', 'listening-room', 'sound-sanctuary',
  'jarvis', 'cabin', 'pro-studio', 'astrology', 'journals',
  'reader', 'house', 'research',
] as const;
export type AudioProject = (typeof AUDIO_PROJECTS)[number];

/** A project owns ONE main audio output session; stems/layers stay inside it. */
export const AUDIO_ACTIVITIES = [
  'continuous-media', 'guided-audio', 'narration',
  'conversation-speech', 'live-session', 'microphone-capture', 'ui-cue',
] as const;
export type AudioActivity = (typeof AUDIO_ACTIVITIES)[number];
export type AudioInitiator = 'member' | 'authorized-turn' | 'system';

export interface AudioFocusRequest {
  project: AudioProject;
  activity: AudioActivity;
  initiatedBy: AudioInitiator;
  /** Transient, LOCAL-only owner tag, never a member or identity identifier. */
  instanceKey: string;
}

export interface AudioFocusSession {
  project: AudioProject;
  activity: AudioActivity;
  /** Same local-only instance key; never broadcast or used for identity. */
  instanceKey: string;
  state: 'playing' | 'capturing' | 'paused';
}

export type AudioFocusVerdict =
  | 'attempt'         // no conflicting output in this policy snapshot
  | 'pause-and-attempt' // owning source(s) must acknowledge actual pause
  | 'deny'            // cannot begin new output or mic
  | 'owner-handoff';  // capture/turn/conversation conductor must decide

export type AudioFocusReason =
  | 'idle'
  | 'explicit-user-switch'
  | 'spoken-output-over-continuous'
  | 'live-session-over-continuous'
  | 'active-live-session'
  | 'active-voice-turn'
  | 'active-microphone-capture'
  | 'capture-requires-external-permission'
  | 'not-member-initiated'
  | 'requires-authorized-turn'
  | 'system-cues-require-opt-in'
  | 'project-capability-not-admitted'
  | 'invalid-policy-input'
  | 'cue-not-allowed-to-interrupt'
  | 'already-active';

export interface AudioFocusDecision {
  verdict: AudioFocusVerdict;
  reason: AudioFocusReason;
  /** Local IDs to ask source owners to PAUSE, never stop/cancel/erase. */
  pauseInstanceKeys: readonly string[];
  /** All audible output always requires a separate exclusive transport lease. */
  requiresOutputLease: boolean;
  /** Input authority lives OUTSIDE this policy. This must always be false. */
  grantsMicrophonePermission: false;
  /** A policy result never automatically resumes interrupted music. */
  automaticResume: false;
  /** Focus never grants content rights or streaming provider permission. */
  grantsMediaRights: false;
  /** Focus never verifies a member account or a voice/conversation turn. */
  grantsIdentityOrTurnAuthority: false;
}

/** Exact, conservative per-project capability inventory for review. */
export const PROJECT_AUDIO_CAPABILITIES: Readonly<Record<AudioProject, readonly AudioActivity[]>> = {
  maia: ['conversation-speech', 'guided-audio', 'microphone-capture', 'ui-cue'],
  'writers-studio': ['narration', 'microphone-capture', 'continuous-media', 'ui-cue'],
  'listening-room': ['continuous-media', 'guided-audio', 'ui-cue'],
  'sound-sanctuary': ['continuous-media', 'guided-audio', 'ui-cue'],
  jarvis: ['conversation-speech', 'microphone-capture', 'continuous-media', 'ui-cue'],
  cabin: ['conversation-speech', 'narration', 'continuous-media', 'guided-audio', 'microphone-capture', 'ui-cue'],
  'pro-studio': ['live-session', 'microphone-capture', 'narration', 'ui-cue'],
  astrology: ['narration', 'guided-audio', 'ui-cue'],
  journals: ['microphone-capture', 'narration', 'ui-cue'],
  reader: ['narration', 'continuous-media', 'ui-cue'],
  house: ['continuous-media', 'ui-cue'],
  research: ['narration', 'ui-cue'],
};

const allProjects = new Set<string>(AUDIO_PROJECTS);
const allActivities = new Set<string>(AUDIO_ACTIVITIES);
const outputActivities = new Set<AudioActivity>([
  'continuous-media', 'guided-audio', 'narration',
  'conversation-speech', 'live-session', 'ui-cue',
]);
const continuous = new Set<AudioActivity>(['continuous-media','guided-audio']);
const voice = new Set<AudioActivity>(['conversation-speech','narration']);

function result(
  verdict: AudioFocusVerdict,
  reason: AudioFocusReason,
  pause: readonly string[] = [],
  requiresOutputLease = verdict === 'attempt' || verdict === 'pause-and-attempt',
): AudioFocusDecision {
  return Object.freeze({
    verdict,
    reason,
    pauseInstanceKeys: Object.freeze([...pause]),
    requiresOutputLease,
    grantsMicrophonePermission: false as const,
    automaticResume: false as const,
    grantsMediaRights: false as const,
    grantsIdentityOrTurnAuthority: false as const,
  });
}

function isProject(x: unknown): x is AudioProject {
  return typeof x === 'string' && allProjects.has(x);
}
function isActivity(x: unknown): x is AudioActivity {
  return typeof x === 'string' && allActivities.has(x);
}
function isInstanceKey(x: unknown): x is string {
  // Local transient tags, not identity: bounded to avoid unwieldy input.
  return typeof x === 'string' && x.length > 0 && x.length <= 96;
}
function validSession(x: AudioFocusSession): boolean {
  return !!x && isProject(x.project) && isActivity(x.activity) &&
    isInstanceKey(x.instanceKey) &&
    (x.state === 'playing' || x.state === 'capturing' || x.state === 'paused');
}

/**
 * Pure, deterministic preference result. Not a security permit or a lock.
 *
 * A driver must recheck membership and all source permissions, then reserve
 * an exclusive output lock BEFORE it actually starts sound. If any requested
 * pause fails, is unacknowledged, or an output lock cannot be taken, REFUSE.
 * Input capture must be explicitly admitted by the privacy/mic owner; this
 * function *never* acquires or grants input permission.
 */
export function decideAudioFocus(
  request: AudioFocusRequest,
  sessions: readonly AudioFocusSession[],
): AudioFocusDecision {
  if (!request || !isProject(request.project) || !isActivity(request.activity) ||
      !isInstanceKey(request.instanceKey) ||
      !(['member','authorized-turn','system'] as unknown[]).includes(request.initiatedBy) ||
      !Array.isArray(sessions) || !sessions.every(validSession)) {
    return result('deny','invalid-policy-input',[],false);
  }
  if (!PROJECT_AUDIO_CAPABILITIES[request.project].includes(request.activity)) {
    return result('deny','project-capability-not-admitted',[],false);
  }

  if (request.activity === 'microphone-capture') {
    // No mic permission or streaming/recording authority is expressible here.
    return request.initiatedBy === 'member'
      ? result('owner-handoff','capture-requires-external-permission',[],false)
      : result('deny','not-member-initiated',[],false);
  }

  if (request.activity === 'ui-cue' && request.initiatedBy !== 'member') {
    return result('deny','system-cues-require-opt-in',[],false);
  }
  if (continuous.has(request.activity) && request.initiatedBy !== 'member') {
    return result('deny','not-member-initiated',[],false);
  }
  if (request.activity === 'live-session' && request.initiatedBy !== 'member') {
    return result('deny','not-member-initiated',[],false);
  }
  if (voice.has(request.activity) && request.initiatedBy === 'system') {
    return result('deny','requires-authorized-turn',[],false);
  }

  const active = sessions.filter(session =>
    session.state !== 'paused' && session.instanceKey !== request.instanceKey);
  const sameActive = sessions.some(session =>
    session.state !== 'paused' && session.instanceKey === request.instanceKey);
  if (sameActive) return result('deny','already-active',[],false);
  if (active.length === 0) return result('attempt','idle');

  const kinds = active.map(s => s.activity);
  if (kinds.includes('live-session')) {
    return result('deny','active-live-session',[],false);
  }
  if (kinds.includes('microphone-capture')) {
    return result('owner-handoff','active-microphone-capture',[],false);
  }

  if (request.activity === 'ui-cue') {
    return result('deny','cue-not-allowed-to-interrupt',[],false);
  }
  if (voice.has(request.activity)) {
    if (kinds.some(k => voice.has(k))) {
      return result('deny','active-voice-turn',[],false);
    }
    return result('pause-and-attempt','spoken-output-over-continuous', active.map(s=>s.instanceKey));
  }
  if (request.activity === 'live-session') {
    if (kinds.some(k=> voice.has(k))) {
      return result('owner-handoff','active-voice-turn',[],false);
    }
    return result('pause-and-attempt','live-session-over-continuous',active.map(s=>s.instanceKey));
  }
  if (continuous.has(request.activity) || request.activity === 'narration') {
    if (kinds.some(k=>voice.has(k))) {
      return result('deny','active-voice-turn',[],false);
    }
    return result('pause-and-attempt','explicit-user-switch',active.map(s=>s.instanceKey));
  }

  // Unknown/surprising future activity must not silently gain focus.
  return result('deny','invalid-policy-input',[],false);
}

/** A policy consistency assertion usable by all platform adapter tests. */
export function policyIsSideEffectFree(decision: AudioFocusDecision): boolean {
  return !decision.grantsMicrophonePermission && !decision.automaticResume &&
    !decision.grantsMediaRights && !decision.grantsIdentityOrTurnAuthority &&
    decision.pauseInstanceKeys.every(isInstanceKey);
}
