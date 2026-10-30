'use client';

import { useEffect, useRef } from 'react';
import {
  interruptionAction,
  nowPlayingFor,
  remoteCommandAction,
  routeChangeAction,
  sessionOptionsFor,
} from '@/lib/listening/platformAudioPolicy';
import type { PlatformSessionSnapshot } from '@/lib/listening/platformAudioPolicy';
import { nativeSoundAudio } from '@/lib/listening/nativeSoundAudio';

type Handlers = { onPause: () => void; onResume: () => void; onStop: () => void };

// LISTEN-NATIVE-AUDIO-01: lock-screen / Control Center / interruption / route handling for the
// ONE persistent player. It never starts sound on its own: the only resume is a member's own
// lock-screen Play, and no platform "should resume" signal is ever honoured.
export function usePlatformAudioSession(
  snapshot: PlatformSessionSnapshot,
  companion: boolean,
  handlers: Handlers,
) {
  const latest = useRef({ snapshot, handlers });
  latest.current = { snapshot, handlers };
  const nowPlaying = nowPlayingFor(snapshot);
  const active = snapshot.kind !== 'none';

  // Native session: configured only while the member holds a field; released on Stop.
  useEffect(() => {
    const native = nativeSoundAudio();
    if (!native) return;
    if (active) void native.activate(sessionOptionsFor(companion)).catch(() => undefined);
    else void native.deactivate().catch(() => undefined);
  }, [active, companion]);

  // Native events. Interruption/route may only pause; remote Play is the member's gesture.
  useEffect(() => {
    const native = nativeSoundAudio();
    if (!native) return;
    const handles: Array<Promise<{ remove: () => Promise<void> }>> = [
      native.addListener('interruption', event => {
        if (interruptionAction(event) === 'pause') latest.current.handlers.onPause();
      }),
      native.addListener('routeChange', event => {
        if (routeChangeAction(event) === 'pause') latest.current.handlers.onPause();
      }),
      native.addListener('remoteCommand', event => {
        const action = remoteCommandAction(event.command, latest.current.snapshot.playback === 'playing');
        if (action === 'resume') latest.current.handlers.onResume();
        else if (action === 'pause') latest.current.handlers.onPause();
        else latest.current.handlers.onStop();
      }),
    ];
    return () => { handles.forEach(handle => void handle.then(h => h.remove()).catch(() => undefined)); };
  }, []);

  // Now Playing: native on device, Media Session in the browser (also drives Safari's lock screen).
  const nowKey = nowPlaying
    ? [nowPlaying.title, nowPlaying.subtitle, nowPlaying.passage, nowPlaying.playing,
       nowPlaying.durationSeconds, Math.floor(nowPlaying.elapsedSeconds / 15)].join('|')
    : 'none';
  useEffect(() => {
    const native = nativeSoundAudio();
    if (native) {
      if (nowPlaying) void native.setNowPlaying(nowPlaying).catch(() => undefined);
      else void native.clearNowPlaying().catch(() => undefined);
    }
    const session = typeof navigator !== 'undefined' ? navigator.mediaSession : undefined;
    if (!session) return;
    if (!nowPlaying) {
      session.metadata = null;
      session.playbackState = 'none';
      return;
    }
    if (typeof MediaMetadata !== 'undefined') {
      session.metadata = new MediaMetadata({
        title: nowPlaying.title,
        artist: 'Soullab Sound Studio',
        album: nowPlaying.passage ?? nowPlaying.subtitle,
      });
    }
    session.playbackState = nowPlaying.playing ? 'playing' : 'paused';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowKey]);

  // Lock-screen buttons. Seeking and track skipping are deliberately not offered.
  useEffect(() => {
    const session = typeof navigator !== 'undefined' ? navigator.mediaSession : undefined;
    if (!session) return;
    const set = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
      try { session.setActionHandler(action, handler); } catch { /* unsupported action */ }
    };
    set('play', () => latest.current.handlers.onResume());
    set('pause', () => latest.current.handlers.onPause());
    set('stop', () => latest.current.handlers.onStop());
    for (const action of ['seekbackward', 'seekforward', 'seekto', 'previoustrack', 'nexttrack'] as const) set(action, null);
    return () => {
      for (const action of ['play', 'pause', 'stop'] as const) set(action, null);
    };
  }, []);
}
