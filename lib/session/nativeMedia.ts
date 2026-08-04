/**
 * Native Session Room — local media acquisition, permission classification, and
 * device switching. Slice 1a (presence only).
 *
 * Why this is a module and not inline in the room component: every rule here is a
 * rule about what the person is TOLD when their camera or microphone does not work,
 * and about not silently growing a second video sender on device switch. Both are
 * testable; neither is testable inside a component that needs a real browser.
 *
 * Constitutional note: this file acquires media for TRANSPORT ONLY. It never records,
 * never persists, never writes a media stream row. Recording in the native room is
 * Slice 2 and lives behind the per-participant `record` consent event
 * (encounter_media_streams + enforce_record_consent_before_stream). Nothing here may
 * be reused to open a capture lane without crossing that threshold.
 */

export type MediaErrorKind =
  | 'permission-denied'
  | 'no-device'
  | 'device-busy'
  | 'unsatisfiable'
  | 'insecure-context'
  | 'aborted'
  | 'unknown';

export interface MediaErrorInfo {
  kind: MediaErrorKind;
  /** Short headline shown to the participant. */
  title: string;
  /** What they can actually do about it. Never "try again" with no instruction. */
  detail: string;
  /** True when rejoining after a change of settings could plausibly succeed. */
  recoverable: boolean;
}

/**
 * Map a getUserMedia rejection to something a person can act on.
 *
 * The browser's own messages are useless here ("Permission denied" tells you nothing
 * about which device or what to do), so every kind carries an instruction.
 */
export function classifyMediaError(err: unknown): MediaErrorInfo {
  const name =
    typeof err === 'object' && err !== null && 'name' in err
      ? String((err as { name: unknown }).name)
      : '';

  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return {
        kind: 'permission-denied',
        title: 'Camera and microphone are blocked',
        detail:
          'Your browser is blocking access for this site. Open the permissions icon in the address bar, allow camera and microphone, then rejoin.',
        recoverable: true,
      };
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return {
        kind: 'no-device',
        title: 'No camera or microphone found',
        detail:
          'This device reports no matching hardware. Connect a camera or headset and rejoin, or continue with audio only.',
        recoverable: true,
      };
    case 'NotReadableError':
    case 'TrackStartError':
      return {
        kind: 'device-busy',
        title: 'The device is in use by another app',
        detail:
          'Another application (often a meeting app left running) is holding the camera or microphone. Close it, then rejoin.',
        recoverable: true,
      };
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return {
        kind: 'unsatisfiable',
        title: 'That device could not be used',
        detail: 'The selected camera or microphone did not accept the request. Choose a different device.',
        recoverable: true,
      };
    case 'SecurityError':
      return {
        kind: 'insecure-context',
        title: 'Media is unavailable on an insecure connection',
        detail:
          'Browsers only release the camera and microphone over HTTPS. Open this room on its https:// address.',
        recoverable: false,
      };
    case 'AbortError':
      return {
        kind: 'aborted',
        title: 'Starting the device was interrupted',
        detail: 'The camera or microphone stopped responding while starting up. Rejoin to try again.',
        recoverable: true,
      };
    default:
      return {
        kind: 'unknown',
        title: 'Could not start the camera or microphone',
        detail:
          'The browser refused access without saying why. Check that no other app holds the devices, then rejoin.',
        recoverable: true,
      };
  }
}

export type GetUserMedia = (constraints: MediaStreamConstraints) => Promise<MediaStream>;

export interface MediaAcquisitionOk {
  ok: true;
  stream: MediaStream;
  /** 'on' = a live camera track is publishing. 'unavailable' = audio-only room for this participant. */
  video: 'on' | 'unavailable';
  /** Why video is unavailable, when it is. Present only when video === 'unavailable'. */
  videoIssue?: MediaErrorInfo;
}

export interface MediaAcquisitionFailed {
  ok: false;
  error: MediaErrorInfo;
}

export type MediaAcquisition = MediaAcquisitionOk | MediaAcquisitionFailed;

export interface AcquireOptions {
  audioDeviceId?: string;
  videoDeviceId?: string;
}

function constraintFor(deviceId: string | undefined, base: boolean): boolean | MediaTrackConstraints {
  if (!base) return false;
  return deviceId ? { deviceId: { exact: deviceId } } : true;
}

/**
 * Acquire audio+video, degrading to audio-only when the CAMERA is the problem —
 * but never pretending the room is fine when the MICROPHONE is the problem.
 *
 * The second attempt exists to answer a question the first failure cannot: a combined
 * request rejects identically whether the camera or the mic failed. Retrying audio-only
 * distinguishes them, so the participant is told which device actually failed instead of
 * a generic error. Audio is the floor: without it there is no session, so we refuse.
 */
export async function acquireLocalMedia(
  getUserMedia: GetUserMedia,
  opts: AcquireOptions = {}
): Promise<MediaAcquisition> {
  try {
    const stream = await getUserMedia({
      audio: constraintFor(opts.audioDeviceId, true),
      video: constraintFor(opts.videoDeviceId, true),
    });
    // A stream can come back without a camera track even on success (some virtual
    // devices do this). Report what is actually publishing, not what we asked for.
    const hasVideo = stream.getVideoTracks().length > 0;
    return hasVideo
      ? { ok: true, stream, video: 'on' }
      : {
          ok: true,
          stream,
          video: 'unavailable',
          videoIssue: {
            kind: 'no-device',
            title: 'No camera track',
            detail: 'The browser granted access but published no camera track. This room is audio-only.',
            recoverable: true,
          },
        };
  } catch (firstErr) {
    // Was it the camera or the microphone? Ask audio-only to find out.
    try {
      const audioOnly = await getUserMedia({ audio: constraintFor(opts.audioDeviceId, true), video: false });
      return {
        ok: true,
        stream: audioOnly,
        video: 'unavailable',
        videoIssue: classifyMediaError(firstErr),
      };
    } catch (secondErr) {
      // Audio failed too — the microphone is the blocker. Report THAT, not the combined error.
      return { ok: false, error: classifyMediaError(secondErr) };
    }
  }
}

/** Cameras and microphones, de-duplicated and labelled, for the device pickers. */
export function partitionDevices(devices: MediaDeviceInfo[]): {
  cameras: Array<{ deviceId: string; label: string }>;
  microphones: Array<{ deviceId: string; label: string }>;
} {
  const take = (kind: MediaDeviceKind, fallback: string) => {
    const seen = new Set<string>();
    const out: Array<{ deviceId: string; label: string }> = [];
    for (const d of devices) {
      if (d.kind !== kind) continue;
      // deviceId is '' until permission is granted; such entries carry no usable identity.
      if (!d.deviceId || seen.has(d.deviceId)) continue;
      seen.add(d.deviceId);
      out.push({ deviceId: d.deviceId, label: d.label || `${fallback} ${out.length + 1}` });
    }
    return out;
  };
  return { cameras: take('videoinput', 'Camera'), microphones: take('audioinput', 'Microphone') };
}

/**
 * Toggle a track without renegotiating. `enabled = false` keeps the sender and the m-line
 * intact and publishes black/silence, so turning the camera back on needs no new offer.
 * Returns the resulting state, or null when there is no track of that kind to toggle.
 */
export function setTrackEnabled(
  stream: MediaStream | null,
  kind: 'audio' | 'video',
  enabled: boolean
): boolean | null {
  if (!stream) return null;
  const tracks = kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks();
  if (tracks.length === 0) return null;
  tracks.forEach((t) => {
    t.enabled = enabled;
  });
  return enabled;
}

/** Minimal structural view of an RTCRtpSender — keeps device switching testable. */
export interface SenderLike {
  track: { kind: string } | null;
  replaceTrack: (track: MediaStreamTrack | null) => Promise<void>;
}

/**
 * The sender already publishing this kind. Device switching MUST reuse it —
 * addTrack would create a second sender, a second m-line, and force renegotiation
 * mid-call. Returns null when nothing of that kind is being published.
 */
export function findSenderForKind(senders: SenderLike[], kind: 'audio' | 'video'): SenderLike | null {
  return senders.find((s) => s.track?.kind === kind) ?? null;
}

export interface SwitchDeviceResult {
  ok: boolean;
  /** The track now publishing, when the switch succeeded. */
  track?: MediaStreamTrack;
  error?: MediaErrorInfo;
}

/**
 * Switch the camera or microphone mid-call: open the new device, hand it to the EXISTING
 * sender via replaceTrack, swap it into the local stream, and stop the old track.
 *
 * Order matters. replaceTrack comes before stopping the old track, so a failure leaves the
 * participant still publishing the device they had rather than dropping them to silence.
 * The `enabled` state carries over: switching cameras while muted must not un-mute you.
 */
export async function switchDevice(args: {
  getUserMedia: GetUserMedia;
  stream: MediaStream;
  senders: SenderLike[];
  kind: 'audio' | 'video';
  deviceId: string;
}): Promise<SwitchDeviceResult> {
  const { getUserMedia, stream, senders, kind, deviceId } = args;
  const existing = kind === 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];

  let next: MediaStreamTrack;
  try {
    const fresh = await getUserMedia(
      kind === 'audio'
        ? { audio: { deviceId: { exact: deviceId } }, video: false }
        : { audio: false, video: { deviceId: { exact: deviceId } } }
    );
    const [track] = kind === 'audio' ? fresh.getAudioTracks() : fresh.getVideoTracks();
    if (!track) {
      return { ok: false, error: classifyMediaError({ name: 'NotFoundError' }) };
    }
    next = track;
  } catch (err) {
    return { ok: false, error: classifyMediaError(err) };
  }

  // Carry the mute/camera-off state across the swap.
  if (existing) next.enabled = existing.enabled;

  const sender = findSenderForKind(senders, kind);
  if (sender) {
    try {
      await sender.replaceTrack(next);
    } catch (err) {
      next.stop(); // do not leak the device we just opened
      return { ok: false, error: classifyMediaError(err) };
    }
  }

  if (existing) {
    stream.removeTrack(existing);
    existing.stop();
  }
  stream.addTrack(next);
  return { ok: true, track: next };
}
