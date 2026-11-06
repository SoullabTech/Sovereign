'use client';

/** LISTEN-01 · one performer's platform player, loaded only after a member presses "Play here".
 *
 * Soullab never starts the sound. The member presses the platform player's own play button; this
 * component only decides when sound must STOP (performerPlaybackPolicy.ts) and holds the shared
 * audio lease while it plays (AUDIO-PLATFORM-01 / LISTEN-14). There is no play(), resume() or
 * autoplay anywhere in this file — tests/listening/listen80 guards that at source level.
 * No listening activity is stored, sent or shown to anyone, including MAIA.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AUDIO_OUTPUT_TAB_NONCE, acquireAudioOutput } from '@/lib/listening/audioOutputLock';
import type { AudioOutputLease } from '@/lib/listening/audioOutputLock';
import {
  SOULLAB_AUDIO_FOCUS_EVENT, SOULLAB_AUDIO_TAB_CHANNEL, SOULLAB_SESSION_END_EVENT,
  audioFocusSource, requestAudioFocus,
} from '@/lib/listening/audioFocus';
import { isMaiaSpeechActive } from '@/lib/listening/maiaSpeechFocus';
import {
  decideOnBusMessage, decideOnFocusSource, decideOnPlaying, holdsOutput,
} from '@/lib/listening/performerPlaybackPolicy';
import type { PerformerPlayerAdapter, PerformerPlayerState } from '@/lib/listening/performerPlaybackPolicy';
import { mountEmbed } from '@/lib/listening/performerEmbedLoaders';
import type { PerformerEntry } from '@/lib/listening/performerCatalog';
import styles from './PerformerShelf.module.css';

const PROVIDER_NAME = { youtube: 'YouTube', spotify: 'Spotify' } as const;
type Phase = 'idle' | 'loading' | 'ready' | 'failed';

export default function PerformerEmbed({ entry }: { entry: PerformerEntry }) {
  const embed = entry.embed;
  const host = useRef<HTMLDivElement>(null);
  const adapter = useRef<PerformerPlayerAdapter | null>(null);
  const lease = useRef<AudioOutputLease | null>(null);
  const acquiring = useRef(false);
  const stateRef = useRef<PerformerPlayerState>('unstarted');
  const alive = useRef(true);
  const [phase, setPhase] = useState<Phase>('idle');
  const [notice, setNotice] = useState('');

  const releaseLease = useCallback(() => { lease.current?.release(); lease.current = null; }, []);
  const pauseNow = useCallback(() => { adapter.current?.pause(); releaseLease(); }, [releaseLease]);
  const closePlayer = useCallback(() => {
    pauseNow();
    adapter.current?.destroy();
    adapter.current = null;
    if (host.current) host.current.textContent = '';
    stateRef.current = 'closed';
    if (alive.current) setPhase('idle');
  }, [pauseNow]);

  // The lease is held only while sound is playing. First sound without it, or with MAIA speaking,
  // is paused at once (fail closed): a null lease means busy OR locks/channel unavailable.
  const onState = useCallback(async (state: PerformerPlayerState) => {
    stateRef.current = state;
    if (!holdsOutput(state)) { releaseLease(); return; }
    if (lease.current || acquiring.current) return;
    acquiring.current = true;
    let got: AudioOutputLease | null = null;
    try { got = await acquireAudioOutput('listening-music'); } finally { acquiring.current = false; }
    if (!alive.current || stateRef.current !== 'playing') { got?.release(); return; }
    if (decideOnPlaying(got ? 'granted' : 'refused', isMaiaSpeechActive()) === 'pause') {
      got?.release();
      adapter.current?.pause();
      setNotice(got
        ? 'MAIA is speaking. Press play when she has finished.'
        : 'Another sound is playing, or this browser cannot share sound safely. Press play when it has finished, or use the links below.');
      return;
    }
    lease.current = got;
    setNotice('');
    requestAudioFocus('listening-room');
  }, [releaseLease]);

  const begin = useCallback(async () => {
    if (!embed || !host.current) return;
    setPhase('loading');
    setNotice('');
    try {
      const handle = await mountEmbed(host.current, embed, {
        onState: s => { void onState(s); },
        onFailure: () => {
          if (!alive.current) return;
          setNotice(`This player could not start here. You can listen on ${PROVIDER_NAME[embed.provider]} instead.`);
          setPhase('failed');
        },
      });
      if (!alive.current) { handle.adapter.destroy(); return; }
      adapter.current = handle.adapter;
      setPhase(p => (p === 'failed' ? p : 'ready'));
    } catch {
      if (!alive.current) return;
      setNotice(`This player could not start here. You can listen on ${PROVIDER_NAME[embed.provider]} instead.`);
      setPhase('failed');
    }
  }, [embed, onState]);

  // While a player exists: obey MAIA, Reader, Writer and other music; close on session end.
  useEffect(() => {
    if (phase !== 'ready' && phase !== 'failed') return undefined;
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(SOULLAB_AUDIO_TAB_CHANNEL);
      channel.onmessage = event => {
        if (decideOnBusMessage(event.data, AUDIO_OUTPUT_TAB_NONCE) === 'pause') pauseNow();
      };
    } catch { channel = null; }
    const onFocus = (event: Event) => {
      if (decideOnFocusSource(audioFocusSource(event)) === 'pause') pauseNow();
    };
    window.addEventListener(SOULLAB_AUDIO_FOCUS_EVENT, onFocus);
    window.addEventListener(SOULLAB_SESSION_END_EVENT, closePlayer);
    return () => {
      channel?.close();
      window.removeEventListener(SOULLAB_AUDIO_FOCUS_EVENT, onFocus);
      window.removeEventListener(SOULLAB_SESSION_END_EVENT, closePlayer);
    };
  }, [phase, pauseNow, closePlayer]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      lease.current?.release(); lease.current = null;
      adapter.current?.pause(); adapter.current?.destroy(); adapter.current = null;
    };
  }, []);

  if (!embed) return null;
  const provider = PROVIDER_NAME[embed.provider];
  return (
    <div className={styles.playRow} data-performer-embed={embed.provider}>
      {phase === 'idle' && (
        <>
          <button type="button" className={styles.playButton} onClick={() => { void begin(); }}
            aria-label={`Play here: ${entry.name}`}>Play here</button>
          <span className={styles.disclosure}>Playing this loads {provider}. Then press play on the player.</span>
        </>
      )}
      {phase === 'loading' && <span className={styles.disclosure} role="status">Loading {provider}…</span>}
      <div ref={host} className={styles.playerHost} />
      <p className={styles.notice} role="status" aria-live="polite">{notice}</p>
    </div>
  );
}
