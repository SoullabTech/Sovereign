/**
 * Native Session Room — Slice 1a media logic.
 *
 * These tests exist for the failure modes that a browser would hide:
 *  - a combined A/V rejection blaming the wrong device,
 *  - device switching quietly growing a second video sender,
 *  - a mute silently lifting when you change microphone,
 *  - degrading to audio-only when the MICROPHONE is what failed.
 */

import { describe, it, expect, jest } from '@jest/globals';
import {
  classifyMediaError,
  acquireLocalMedia,
  partitionDevices,
  setTrackEnabled,
  findSenderForKind,
  switchDevice,
  type SenderLike,
  type GetUserMedia,
} from '../nativeMedia';

// ── fakes ────────────────────────────────────────────────────────────────────
class FakeTrack {
  kind: string;
  enabled = true;
  stopped = false;
  readonly id: string;
  constructor(kind: string, id = `${kind}-track`) {
    this.kind = kind;
    this.id = id;
  }
  stop() {
    this.stopped = true;
  }
}

class FakeStream {
  private tracks: FakeTrack[];
  constructor(tracks: FakeTrack[]) {
    this.tracks = tracks;
  }
  getTracks() {
    return [...this.tracks];
  }
  getAudioTracks() {
    return this.tracks.filter((t) => t.kind === 'audio');
  }
  getVideoTracks() {
    return this.tracks.filter((t) => t.kind === 'video');
  }
  addTrack(t: FakeTrack) {
    this.tracks.push(t);
  }
  removeTrack(t: FakeTrack) {
    this.tracks = this.tracks.filter((x) => x !== t);
  }
}

const err = (name: string) => Object.assign(new Error(name), { name });
const stream = (...kinds: string[]) => new FakeStream(kinds.map((k) => new FakeTrack(k))) as unknown as MediaStream;

// ── classifyMediaError ───────────────────────────────────────────────────────
describe('classifyMediaError', () => {
  it('maps each browser error name to an actionable kind', () => {
    expect(classifyMediaError(err('NotAllowedError')).kind).toBe('permission-denied');
    expect(classifyMediaError(err('NotFoundError')).kind).toBe('no-device');
    expect(classifyMediaError(err('NotReadableError')).kind).toBe('device-busy');
    expect(classifyMediaError(err('OverconstrainedError')).kind).toBe('unsatisfiable');
    expect(classifyMediaError(err('SecurityError')).kind).toBe('insecure-context');
    expect(classifyMediaError(err('AbortError')).kind).toBe('aborted');
  });

  it('falls back to unknown for unrecognised and non-error values', () => {
    expect(classifyMediaError(err('SomethingNewError')).kind).toBe('unknown');
    expect(classifyMediaError(undefined).kind).toBe('unknown');
    expect(classifyMediaError('a string').kind).toBe('unknown');
  });

  it('never produces a message without an instruction', () => {
    for (const name of [
      'NotAllowedError',
      'NotFoundError',
      'NotReadableError',
      'OverconstrainedError',
      'SecurityError',
      'AbortError',
      'Whatever',
    ]) {
      const info = classifyMediaError(err(name));
      expect(info.title.length).toBeGreaterThan(0);
      expect(info.detail.length).toBeGreaterThan(20);
    }
  });

  it('marks an insecure context as unrecoverable — rejoining cannot fix https', () => {
    expect(classifyMediaError(err('SecurityError')).recoverable).toBe(false);
    expect(classifyMediaError(err('NotAllowedError')).recoverable).toBe(true);
  });
});

// ── acquireLocalMedia ────────────────────────────────────────────────────────
describe('acquireLocalMedia', () => {
  it('publishes audio and video when both are granted', async () => {
    const gum = jest.fn(async () => stream('audio', 'video')) as unknown as GetUserMedia;
    const res = await acquireLocalMedia(gum);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.video).toBe('on');
      expect(res.videoIssue).toBeUndefined();
    }
    expect(gum).toHaveBeenCalledTimes(1); // no needless second probe on the happy path
  });

  it('degrades to audio-only and names the CAMERA as the cause when only video fails', async () => {
    const gum = jest
      .fn()
      .mockRejectedValueOnce(err('NotReadableError')) // combined request fails
      .mockResolvedValueOnce(stream('audio')) as unknown as GetUserMedia; // audio alone is fine
    const res = await acquireLocalMedia(gum);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.video).toBe('unavailable');
      expect(res.videoIssue?.kind).toBe('device-busy');
    }
  });

  it('REFUSES when the microphone is the blocker — audio is the floor of a session', async () => {
    const gum = jest
      .fn()
      .mockRejectedValueOnce(err('NotAllowedError'))
      .mockRejectedValueOnce(err('NotAllowedError')) as unknown as GetUserMedia;
    const res = await acquireLocalMedia(gum);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.kind).toBe('permission-denied');
  });

  it('reports the SECOND failure, so a camera error never masquerades as a mic error', async () => {
    // Combined fails because the camera is busy; audio-only then fails because the mic is absent.
    const gum = jest
      .fn()
      .mockRejectedValueOnce(err('NotReadableError'))
      .mockRejectedValueOnce(err('NotFoundError')) as unknown as GetUserMedia;
    const res = await acquireLocalMedia(gum);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.kind).toBe('no-device'); // the mic truth, not the camera's
  });

  it('treats a granted stream carrying no camera track as audio-only, not as video on', async () => {
    const gum = jest.fn(async () => stream('audio')) as unknown as GetUserMedia;
    const res = await acquireLocalMedia(gum);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.video).toBe('unavailable');
  });

  it('passes exact device ids through when a device is chosen', async () => {
    const gum = jest.fn(async () => stream('audio', 'video')) as unknown as GetUserMedia;
    await acquireLocalMedia(gum, { audioDeviceId: 'mic-2', videoDeviceId: 'cam-2' });
    expect(gum).toHaveBeenCalledWith({
      audio: { deviceId: { exact: 'mic-2' } },
      video: { deviceId: { exact: 'cam-2' } },
    });
  });
});

// ── partitionDevices ─────────────────────────────────────────────────────────
describe('partitionDevices', () => {
  const dev = (kind: string, deviceId: string, label = '') =>
    ({ kind, deviceId, label, groupId: '', toJSON: () => ({}) }) as unknown as MediaDeviceInfo;

  it('splits cameras from microphones and ignores outputs', () => {
    const { cameras, microphones } = partitionDevices([
      dev('videoinput', 'cam-1', 'FaceTime HD'),
      dev('audioinput', 'mic-1', 'MacBook Mic'),
      dev('audiooutput', 'spk-1', 'Speakers'),
    ]);
    expect(cameras.map((c) => c.deviceId)).toEqual(['cam-1']);
    expect(microphones.map((m) => m.deviceId)).toEqual(['mic-1']);
  });

  it('drops entries with no deviceId — pre-permission stubs have no usable identity', () => {
    const { cameras } = partitionDevices([dev('videoinput', ''), dev('videoinput', 'cam-1')]);
    expect(cameras).toHaveLength(1);
  });

  it('de-duplicates repeated device ids', () => {
    const { microphones } = partitionDevices([dev('audioinput', 'mic-1'), dev('audioinput', 'mic-1')]);
    expect(microphones).toHaveLength(1);
  });

  it('substitutes a readable name when the browser withholds the label', () => {
    const { cameras } = partitionDevices([dev('videoinput', 'cam-1'), dev('videoinput', 'cam-2')]);
    expect(cameras[0].label).toBe('Camera 1');
    expect(cameras[1].label).toBe('Camera 2');
  });
});

// ── setTrackEnabled ──────────────────────────────────────────────────────────
describe('setTrackEnabled', () => {
  it('toggles without removing the track, so no renegotiation is needed', () => {
    const s = stream('audio', 'video');
    expect(setTrackEnabled(s, 'video', false)).toBe(false);
    expect(s.getVideoTracks()).toHaveLength(1); // still published, just disabled
    expect(s.getVideoTracks()[0].enabled).toBe(false);
    expect((s.getVideoTracks()[0] as unknown as FakeTrack).stopped).toBe(false);
  });

  it('leaves the other kind untouched', () => {
    const s = stream('audio', 'video');
    setTrackEnabled(s, 'video', false);
    expect(s.getAudioTracks()[0].enabled).toBe(true);
  });

  it('returns null when there is no track of that kind or no stream', () => {
    expect(setTrackEnabled(stream('audio'), 'video', false)).toBeNull();
    expect(setTrackEnabled(null, 'audio', false)).toBeNull();
  });
});

// ── findSenderForKind ────────────────────────────────────────────────────────
describe('findSenderForKind', () => {
  const sender = (kind: string | null): SenderLike => ({
    track: kind ? { kind } : null,
    replaceTrack: async () => {},
  });

  it('finds the sender already publishing that kind', () => {
    const senders = [sender('audio'), sender('video')];
    expect(findSenderForKind(senders, 'video')).toBe(senders[1]);
  });

  it('returns null rather than a stale sender when nothing publishes that kind', () => {
    expect(findSenderForKind([sender('audio'), sender(null)], 'video')).toBeNull();
  });
});

// ── switchDevice ─────────────────────────────────────────────────────────────
describe('switchDevice', () => {
  const makeSenders = () => {
    const calls: Array<{ kind: string } | null> = [];
    const senders: SenderLike[] = [
      { track: { kind: 'audio' }, replaceTrack: async () => {} },
      {
        track: { kind: 'video' },
        replaceTrack: async (t) => {
          calls.push(t as unknown as { kind: string });
        },
      },
    ];
    return { senders, calls };
  };

  it('reuses the existing sender — never grows a second video sender', async () => {
    const s = stream('audio', 'video');
    const { senders, calls } = makeSenders();
    const res = await switchDevice({
      getUserMedia: (async () => stream('video')) as unknown as GetUserMedia,
      stream: s,
      senders,
      kind: 'video',
      deviceId: 'cam-2',
    });
    expect(res.ok).toBe(true);
    expect(calls).toHaveLength(1); // replaceTrack, not addTrack
    expect(senders).toHaveLength(2); // sender count unchanged
    expect(s.getVideoTracks()).toHaveLength(1); // exactly one camera track in the stream
  });

  it('stops the old track so the previous camera light goes out', async () => {
    const s = stream('audio', 'video');
    const old = s.getVideoTracks()[0] as unknown as FakeTrack;
    await switchDevice({
      getUserMedia: (async () => stream('video')) as unknown as GetUserMedia,
      stream: s,
      senders: makeSenders().senders,
      kind: 'video',
      deviceId: 'cam-2',
    });
    expect(old.stopped).toBe(true);
  });

  it('carries mute state across the swap — changing microphone must not un-mute you', async () => {
    const s = stream('audio', 'video');
    s.getAudioTracks()[0].enabled = false; // muted before switching
    const res = await switchDevice({
      getUserMedia: (async () => stream('audio')) as unknown as GetUserMedia,
      stream: s,
      senders: makeSenders().senders,
      kind: 'audio',
      deviceId: 'mic-2',
    });
    expect(res.ok).toBe(true);
    expect(res.track?.enabled).toBe(false);
    expect(s.getAudioTracks()[0].enabled).toBe(false);
  });

  it('keeps you publishing the old device when opening the new one fails', async () => {
    const s = stream('audio', 'video');
    const old = s.getVideoTracks()[0] as unknown as FakeTrack;
    const res = await switchDevice({
      getUserMedia: (async () => {
        throw err('NotReadableError');
      }) as unknown as GetUserMedia,
      stream: s,
      senders: makeSenders().senders,
      kind: 'video',
      deviceId: 'cam-2',
    });
    expect(res.ok).toBe(false);
    expect(res.error?.kind).toBe('device-busy');
    expect(old.stopped).toBe(false); // still live
    expect(s.getVideoTracks()[0]).toBe(old as unknown as MediaStreamTrack);
  });

  it('keeps you publishing the old device when replaceTrack itself fails, and leaks nothing', async () => {
    const s = stream('audio', 'video');
    const old = s.getVideoTracks()[0] as unknown as FakeTrack;
    const opened: FakeTrack[] = [];
    const senders: SenderLike[] = [
      {
        track: { kind: 'video' },
        replaceTrack: async () => {
          throw err('InvalidStateError');
        },
      },
    ];
    const res = await switchDevice({
      getUserMedia: (async () => {
        const t = new FakeTrack('video', 'new-cam');
        opened.push(t);
        return new FakeStream([t]) as unknown as MediaStream;
      }) as unknown as GetUserMedia,
      stream: s,
      senders,
      kind: 'video',
      deviceId: 'cam-2',
    });
    expect(res.ok).toBe(false);
    expect(old.stopped).toBe(false); // old device still publishing
    expect(opened[0].stopped).toBe(true); // new device released, not leaked
  });

  it('fails cleanly when the new device yields no track of the requested kind', async () => {
    const s = stream('audio', 'video');
    const res = await switchDevice({
      getUserMedia: (async () => stream('audio')) as unknown as GetUserMedia, // asked video, got audio
      stream: s,
      senders: makeSenders().senders,
      kind: 'video',
      deviceId: 'cam-2',
    });
    expect(res.ok).toBe(false);
    expect(res.error?.kind).toBe('no-device');
  });
});
