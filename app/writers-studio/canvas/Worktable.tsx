'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from '../pressTheme';
import {
  AUTOSAVE_DELAY_MS,
  beginDraft,
  createDraftSaver,
  createExitGuard,
  formatWhen,
  loadDraft,
  newIdempotencyKey,
  pageEstimate,
  putDraft,
  type DraftSaver,
  type SaverState,
} from '../../press/manuscript/workingDraftClient';

/**
 * The Worktable — Writer Canvas v0.1's one real instrument.
 *
 * The room design (WRITER_CANVAS_ROOM_MAP_2026-08-05.md) gives the worktable
 * one instrument at a time; v0.1 builds exactly one, the writing surface, on
 * the existing Working Draft engine. All sequencing guarantees come from
 * workingDraftClient (single-flight ordered autosave, exit guard, exclusive
 * lane for checkpoints) — reused verbatim, not reimplemented.
 *
 * "Keep a version" is the persona walk's universal versioning gesture: a
 * member-initiated checkpoint into History. It is the member's act — nothing
 * here checkpoints on their behalf.
 */

type Phase = 'loading' | 'ready' | 'no-source' | 'unauthorized' | 'error' | 'conflict';

interface WorktableProps {
  manuscriptId: string;
  /** Authored draft facts for the room's orientation line. Facts only. */
  onMeta?: (meta: { updatedAt: string | null; revisionCount: number | null }) => void;
  /** A version was kept; the History drawer re-reads. */
  onCheckpointed?: () => void;
}

export default function Worktable({ manuscriptId, onMeta, onCheckpointed }: WorktableProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [content, setContent] = useState('');
  const [saveState, setSaveState] = useState<SaverState>('idle');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [keeping, setKeeping] = useState(false);
  const [kept, setKept] = useState(false);

  const saverRef = useRef<DraftSaver | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseRef = useRef(1);
  const contentRef = useRef('');
  // Latest callbacks without re-running the mount effect (which would tear
  // down and re-create the saver mid-session).
  const cbRef = useRef({ onMeta, onCheckpointed });
  cbRef.current = { onMeta, onCheckpointed };

  useEffect(() => {
    let cancelled = false;

    const saver = createDraftSaver(
      (value) =>
        putDraft(apiFetch, manuscriptId, {
          content: value,
          baseRevisionId: baseRef.current,
          idempotencyKey: newIdempotencyKey(),
        }),
      {
        onState: (s) => {
          if (!cancelled) setSaveState(s);
        },
        onSaved: (meta) => {
          if (meta.revisionId !== null) baseRef.current = meta.revisionId;
          if (cancelled) return;
          setUpdatedAt(meta.updatedAt);
          cbRef.current.onMeta?.({ updatedAt: meta.updatedAt, revisionCount: meta.revisionCount });
        },
        onConflict: () => {
          // Not retryable (see workingDraftClient): the draft moved elsewhere,
          // or this client reused a key. Only the writer can decide.
          if (!cancelled) setPhase('conflict');
        },
      },
    );
    saverRef.current = saver;
    const guard = createExitGuard(saver, () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    });

    const settle = (r: {
      content: string;
      revisionCount: number;
      revisionId: number;
      updatedAt?: string | null;
    }) => {
      baseRef.current = r.revisionId;
      contentRef.current = r.content;
      if (cancelled) return;
      setContent(r.content);
      setUpdatedAt(r.updatedAt ?? null);
      setPhase('ready');
      cbRef.current.onMeta?.({ updatedAt: r.updatedAt ?? null, revisionCount: r.revisionCount });
    };

    (async () => {
      const loaded = await loadDraft(apiFetch, manuscriptId);
      if (cancelled) return;
      if (loaded.kind === 'ok') return settle(loaded);
      if (loaded.kind === 'unauthorized') return setPhase('unauthorized');
      if (loaded.kind === 'error') return setPhase('error');
      // 'none' — first entry for an imported book: found the draft on its
      // Source, verbatim. (A blank page creates its draft at birth.)
      const begun = await beginDraft(apiFetch, manuscriptId);
      if (cancelled) return;
      if (begun.kind === 'ok') return settle(begun);
      if (begun.kind === 'exists') {
        const again = await loadDraft(apiFetch, manuscriptId);
        if (cancelled) return;
        if (again.kind === 'ok') return settle(again);
        return setPhase('error');
      }
      if (begun.kind === 'no-sections') return setPhase('no-source');
      if (begun.kind === 'unauthorized') return setPhase('unauthorized');
      setPhase('error');
    })();

    // Every way out of the room closes the debounce window (W-1).
    const onPageHide = () => guard.flushNow();
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') guard.flushNow();
    };
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      guard.flushNow();
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [manuscriptId]);

  const edit = (value: string) => {
    setContent(value);
    contentRef.current = value;
    setKept(false);
    const saver = saverRef.current;
    if (!saver) return;
    saver.queue(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saver.flush(), AUTOSAVE_DELAY_MS);
  };

  const keepVersion = async () => {
    const saver = saverRef.current;
    if (!saver || keeping || phase !== 'ready') return;
    setKeeping(true);
    setKept(false);
    try {
      await saver.beginExclusive();
      const value = contentRef.current;
      const res = await putDraft(apiFetch, manuscriptId, {
        content: value,
        checkpoint: true,
        baseRevisionId: baseRef.current,
        idempotencyKey: newIdempotencyKey(),
      });
      if (res.kind === 'ok') {
        if (res.revisionId !== null) baseRef.current = res.revisionId;
        setUpdatedAt(res.updatedAt);
        setKept(true);
        cbRef.current.onMeta?.({ updatedAt: res.updatedAt, revisionCount: res.revisionCount });
        cbRef.current.onCheckpointed?.();
        saver.endExclusive({ persisted: value });
      } else if (res.kind === 'conflict') {
        saver.endExclusive({ flushPending: false });
        setPhase('conflict');
      } else {
        saver.endExclusive();
        setSaveState('error');
      }
    } finally {
      setKeeping(false);
    }
  };

  if (phase === 'loading') {
    return <p className="text-[14px] opacity-40">opening the draft…</p>;
  }
  if (phase === 'unauthorized') {
    return (
      <p className="text-[15px] opacity-70 max-w-md leading-relaxed">
        The Canvas holds your own words, so it opens only to you.{' '}
        <a href="/signin" className="underline underline-offset-4">
          Sign in
        </a>{' '}
        to continue.
      </p>
    );
  }
  if (phase === 'no-source') {
    return (
      <p className="text-[15px] opacity-70 max-w-md leading-relaxed">
        This manuscript has nothing to draft from yet. Nothing was changed.
      </p>
    );
  }
  if (phase === 'error') {
    return (
      <p className="text-[15px] opacity-70 max-w-md leading-relaxed">
        The draft could not be reached just now. Your work is not affected — please try again in a
        moment.
      </p>
    );
  }
  if (phase === 'conflict') {
    return (
      <div className="max-w-md">
        <p className="text-[15px] opacity-80 leading-relaxed mb-3">
          This draft changed somewhere else — perhaps another tab or device.
        </p>
        <p className="text-[14px] opacity-55 leading-relaxed">
          Autosave has stopped so nothing is overwritten. Reopen the room to continue from the
          current version.
        </p>
      </div>
    );
  }

  const status =
    saveState === 'saving'
      ? 'saving…'
      : saveState === 'unsaved'
        ? '·'
        : saveState === 'error'
          ? "couldn't save — your words are held here"
          : updatedAt
            ? `saved · ${formatWhen(updatedAt)}`
            : 'saved';

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Quiet facts, no scores: what the draft is, where saving stands, and
          the one versioning gesture. */}
      <div className="flex items-baseline gap-4 mb-4 text-[12px]">
        <span className="opacity-40">
          ~{pageEstimate(content.length)} page{pageEstimate(content.length) === 1 ? '' : 's'}
        </span>
        <span className="opacity-40" aria-live="polite">
          {status}
        </span>
        {saveState === 'error' && (
          <button
            onClick={() => saverRef.current?.flush()}
            className="underline underline-offset-4 opacity-60 hover:opacity-90"
          >
            try again
          </button>
        )}
        <span className="flex-1" />
        {kept && <span style={{ color: PRESS.accent }}>version kept</span>}
        <button
          onClick={() => void keepVersion()}
          disabled={keeping}
          className="opacity-55 hover:opacity-90 underline underline-offset-4 disabled:opacity-30"
        >
          {keeping ? 'keeping…' : 'Keep a version'}
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => edit(e.target.value)}
        aria-label="Working draft"
        className="flex-1 w-full bg-transparent outline-none resize-none text-[17px] leading-[1.8]"
        style={{ fontFamily: SERIF, color: PRESS.text, caretColor: PRESS.accent }}
      />
    </div>
  );
}
