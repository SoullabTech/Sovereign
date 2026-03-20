'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SongSeed, LyricSection, ChordSuggestion } from './types';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface SongDraftState {
  songId: string | null;
  title: string;
  lyrics: {
    verse1: LyricSection;
    chorus: LyricSection;
    bridge: LyricSection | null;
  } | null;
  chords: ChordSuggestion | null;
  structure: string[];
  saveState: SaveState;
  lastSavedAt: Date | null;
}

interface UseSongDraftReturn extends SongDraftState {
  initDraft: (seed: SongSeed, seedPrompt: string) => Promise<void>;
  updateLyric: (id: string, text: string) => void;
  updateTitle: (title: string) => void;
  forceSave: () => Promise<void>;
}

const DEBOUNCE_MS = 1500;

export function useSongDraft(): UseSongDraftReturn {
  const [songId, setSongId] = useState<string | null>(null);
  const [title, setTitle] = useState('Untitled Song');
  const [lyrics, setLyrics] = useState<SongDraftState['lyrics']>(null);
  const [chords, setChords] = useState<ChordSuggestion | null>(null);
  const [structure, setStructure] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const songIdRef = useRef<string | null>(null);
  const pendingPatchRef = useRef<Record<string, unknown>>({});
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref in sync for use in async callbacks
  useEffect(() => {
    songIdRef.current = songId;
  }, [songId]);

  // ─── Autosave ──────────────────────────────────────────────────────────────

  const flushPatch = useCallback(async () => {
    const id = songIdRef.current;
    if (!id) return;

    const payload = { ...pendingPatchRef.current };
    if (Object.keys(payload).length === 0) return;

    pendingPatchRef.current = {};
    setSaveState('saving');

    try {
      const res = await fetch(`/api/songwriter/songs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSaveState('saved');
      setLastSavedAt(new Date());
    } catch (err) {
      console.error('[useSongDraft] autosave failed:', err);
      setSaveState('error');
      // Restore payload so next edit retries
      pendingPatchRef.current = { ...payload, ...pendingPatchRef.current };
    }
  }, []);

  const scheduleSave = useCallback((patch: Record<string, unknown>) => {
    pendingPatchRef.current = { ...pendingPatchRef.current, ...patch };
    setSaveState('saving');

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(flushPatch, DEBOUNCE_MS);
  }, [flushPatch]);

  // ─── Init: create draft immediately after seed ─────────────────────────────

  const initDraft = useCallback(async (seed: SongSeed, seedPrompt: string) => {
    setLyrics(seed.lyrics);
    setChords(seed.chords);
    setStructure(seed.structure);

    const canvas = {
      seedPayload: seed,
      lyrics: seed.lyrics,
      chords: seed.chords,
      structure: seed.structure,
      coreStatement: seed.coreStatement,
    };

    try {
      const res = await fetch('/api/songwriter/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: seed.titles[0] ?? 'Untitled Song',
          seedPrompt,
          seedPayload: seed,
          lyrics: seed.lyrics,
          chords: seed.chords,
          structure: seed.structure,
          canvas,
        }),
      });

      if (!res.ok) {
        console.error('[useSongDraft] failed to create draft:', res.status);
        return;
      }

      const data = await res.json();
      setSongId(data.song.id);
      setTitle(data.song.title);
      setSaveState('saved');
      setLastSavedAt(new Date());
    } catch (err) {
      console.error('[useSongDraft] initDraft error:', err);
      // Draft creation failed — still allow editing locally
    }
  }, []);

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const updateLyric = useCallback((id: string, text: string) => {
    setLyrics(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        verse1: prev.verse1.id === id ? { ...prev.verse1, text } : prev.verse1,
        chorus: prev.chorus.id === id ? { ...prev.chorus, text } : prev.chorus,
        bridge: prev.bridge?.id === id ? { ...prev.bridge, text } : prev.bridge,
      };
      scheduleSave({ lyrics: updated });
      return updated;
    });
  }, [scheduleSave]);

  const updateTitle = useCallback((newTitle: string) => {
    setTitle(newTitle);
    scheduleSave({ title: newTitle });
  }, [scheduleSave]);

  const forceSave = useCallback(async () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    await flushPatch();
  }, [flushPatch]);

  return {
    songId, title, lyrics, chords, structure,
    saveState, lastSavedAt,
    initDraft, updateLyric, updateTitle, forceSave,
  };
}
