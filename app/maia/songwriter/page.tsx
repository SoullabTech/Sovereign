'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { SeedInput } from '@/components/songwriter/SeedInput';
import { SongCanvas } from '@/components/songwriter/SongCanvas';
import { RecentDrafts } from '@/components/songwriter/RecentDrafts';
import { useSongDraft } from '@/lib/songwriter/useSongDraft';
import type { SongSeed } from '@/lib/songwriter/types';

type Phase = 'input' | 'loading' | 'canvas' | 'error';

export default function SongwriterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>('input');
  const [seed, setSeed] = useState<SongSeed | null>(null);
  const [inputEcho, setInputEcho] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [draftsKey, setDraftsKey] = useState(0);

  const draft = useSongDraft();

  // ─── Auto-resume from ?resume=id (used by /songs page) ─────────────────────

  useEffect(() => {
    const resumeId = searchParams.get('resume');
    if (resumeId) handleResume(resumeId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Generate seed ─────────────────────────────────────────────────────────

  async function handleSeed(content: string) {
    setPhase('loading');
    setInputEcho(content);

    try {
      const res = await fetch('/api/songwriter/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      const newSeed: SongSeed = data.seed;

      setSeed(newSeed);
      setPhase('canvas');

      await draft.initDraft(newSeed, content);
      setDraftsKey(k => k + 1);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setPhase('error');
    }
  }

  // ─── Resume existing draft ─────────────────────────────────────────────────

  async function handleResume(id: string) {
    try {
      const res = await fetch(`/api/songwriter/songs/${id}`);
      if (!res.ok) throw new Error('Failed to load draft');

      const data = await res.json();
      const song = data.song;

      const savedSeed: SongSeed = song.seed_payload ?? song.canvas?.seedPayload;
      if (!savedSeed) return;

      setSeed(savedSeed);
      setInputEcho(song.seed_prompt ?? '');
      draft.initDraft(savedSeed, song.seed_prompt ?? '');
      setPhase('canvas');
    } catch (err) {
      console.error('[Resume draft]', err);
    }
  }

  function reset() {
    setSeed(null);
    setInputEcho('');
    setErrorMsg('');
    setPhase('input');
    router.replace('/maia/songwriter');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0F12] via-[#1A1D26] to-[#0D0F12]">
      <AnimatePresence mode="wait">
        {(phase === 'input' || phase === 'loading') && (
          <div key="input">
            <SeedInput onSeed={handleSeed} isLoading={phase === 'loading'} />
            <RecentDrafts onResume={handleResume} refreshKey={draftsKey} onViewAll={() => router.push('/maia/songwriter/songs')} />
          </div>
        )}

        {phase === 'canvas' && seed && (
          <SongCanvas
            key="canvas"
            seed={seed}
            inputEcho={inputEcho}
            title={draft.title}
            lyrics={draft.lyrics ?? seed.lyrics}
            chords={draft.chords ?? seed.chords}
            saveState={draft.saveState}
            lastSavedAt={draft.lastSavedAt}
            onTitleChange={draft.updateTitle}
            onLyricChange={draft.updateLyric}
            onLyricReplace={draft.replaceLyric}
            onChordsReplace={draft.replaceChords}
            onReset={reset}
          />
        )}

        {phase === 'error' && (
          <div key="error" className="max-w-2xl mx-auto px-4 pt-32 text-center">
            <p className="text-white/40 text-base mb-6" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
              {errorMsg}
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30
                         hover:bg-amber-500/30 transition-all text-sm"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
            >
              Try again
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
