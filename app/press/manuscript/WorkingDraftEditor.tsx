'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  AUTOSAVE_DELAY_MS,
  beginDraft,
  createDraftSaver,
  formatWhen,
  loadDraft,
  loadRevisions,
  pageEstimate,
  putDraft,
  restoreRevision,
  type DraftSaver,
  type Http,
  type RevisionSummary,
  type SaverState,
} from './workingDraftClient';

/**
 * Soullab Press — Working Draft editor (Author Environment R1, writing surface).
 *
 * The member-facing writing surface over the Working Draft layer shipped in
 * PR #761 (substrate + API). It is deliberately NOT an AI editor and adds no
 * interpretive surface — it holds the member's own words and their own
 * checkpoints, nothing else. The Manuscript Room's constitution holds here:
 * evidence only, no themes, no scores, no suggestions, no analytics.
 *
 * Constitutional lines it keeps, by construction:
 *   - Source stays immutable. This edits a SEPARATE working copy (POST creates
 *     it verbatim from the source sections); nothing here touches the source.
 *   - Only the author writes. Every call is member-scoped by credential.
 *   - Every checkpoint is preserved. Autosave updates in place; a checkpoint
 *     appends an append-only revision; restore writes a NEW revision.
 *
 * State transitions (load, autosave sequencing, checkpoint, restore, errors)
 * live in ./workingDraftClient and are unit-tested there; this file is the
 * view. Autosave ordering — a slow earlier save never overwriting a later
 * edit — is guaranteed by the single-flight createDraftSaver.
 *
 * Aesthetic: matches the Room — Soullab Press palette, quiet serif, wide
 * margins. A writing room, not a dashboard.
 */

const SERIF = 'Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif';

interface WorkingDraftEditorProps {
  manuscriptId: string;
}

type Phase = 'loading' | 'none' | 'ready' | 'unauthorized' | 'error';

export default function WorkingDraftEditor({ manuscriptId }: WorkingDraftEditorProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [content, setContent] = useState('');
  const [revisionCount, setRevisionCount] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaverState>('idle');

  const [creating, setCreating] = useState(false);
  const [beginError, setBeginError] = useState<string | null>(null);

  const [note, setNote] = useState('');
  const [checkpointing, setCheckpointing] = useState(false);
  const [checkpointMsg, setCheckpointMsg] = useState<string | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [revisions, setRevisions] = useState<RevisionSummary[]>([]);
  const [revisionsLoading, setRevisionsLoading] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState<number | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const http = useMemo<Http>(() => (path, init) => apiFetch(path, init), []);

  // Single-flight, ordered autosave. Created once (the parent remounts this
  // component per manuscript via key), so manuscriptId is stable here.
  const saverRef = useRef<DraftSaver | null>(null);
  if (!saverRef.current) {
    saverRef.current = createDraftSaver((value) => putDraft(http, manuscriptId, { content: value }), {
      onState: setSaveState,
      onSaved: (meta) => {
        if (typeof meta.revisionCount === 'number') setRevisionCount(meta.revisionCount);
        setUpdatedAt(meta.updatedAt);
      },
    });
  }
  const saver = saverRef.current;

  const reload = useCallback(async () => {
    setPhase('loading');
    const r = await loadDraft(http, manuscriptId);
    if (r.kind === 'ok') {
      setContent(r.content);
      setRevisionCount(r.revisionCount);
      setUpdatedAt(r.updatedAt);
      setSaveState('idle');
      setPhase('ready');
    } else {
      setPhase(r.kind); // 'none' | 'unauthorized' | 'error'
    }
  }, [http, manuscriptId]);

  const refreshRevisions = useCallback(async () => {
    setRevisionsLoading(true);
    const r = await loadRevisions(http, manuscriptId);
    setRevisions(r.kind === 'ok' ? r.revisions : []);
    setRevisionsLoading(false);
  }, [http, manuscriptId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  const onChange = (value: string) => {
    setContent(value);
    setCheckpointMsg(null);
    saver.queue(value); // marks 'unsaved' via onState
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saver.flush(), AUTOSAVE_DELAY_MS);
  };

  const saveNow = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saver.flush();
  };

  const begin = async () => {
    setCreating(true);
    setBeginError(null);
    const r = await beginDraft(http, manuscriptId);
    if (r.kind === 'ok') {
      setContent(r.content);
      setRevisionCount(r.revisionCount);
      setUpdatedAt(null);
      setSaveState('idle');
      setPhase('ready');
    } else if (r.kind === 'exists') {
      await reload();
    } else if (r.kind === 'unauthorized') {
      setPhase('unauthorized');
    } else if (r.kind === 'no-sections') {
      setBeginError('This manuscript has no sections yet, so there is nothing to begin from.');
    } else {
      setBeginError('Could not start your working draft. Please try again.');
    }
    setCreating(false);
  };

  const checkpoint = async () => {
    setCheckpointing(true);
    setCheckpointMsg(null);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await saver.whenIdle(); // let any in-flight autosave settle first (ordering)
    const r = await putDraft(http, manuscriptId, {
      content,
      checkpoint: true,
      note: note.trim() || undefined,
    });
    if (r.kind === 'ok') {
      if (typeof r.revisionCount === 'number') setRevisionCount(r.revisionCount);
      setUpdatedAt(r.updatedAt);
      setSaveState('saved');
      setNote('');
      setCheckpointMsg('Checkpoint saved.');
      if (showHistory) await refreshRevisions();
    } else {
      setCheckpointMsg('Could not save a checkpoint. Please try again.');
    }
    setCheckpointing(false);
  };

  const toggleHistory = () => {
    const next = !showHistory;
    setShowHistory(next);
    setRestoreConfirm(null);
    setRestoreError(false);
    if (next) void refreshRevisions();
  };

  const restore = async (revisionNumber: number) => {
    setRestoring(true);
    setRestoreError(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await saver.whenIdle();
    const r = await restoreRevision(http, manuscriptId, revisionNumber);
    if (r.kind === 'ok') {
      setRestoreConfirm(null);
      await reload();
      await refreshRevisions();
    } else {
      setRestoreError(true);
    }
    setRestoring(false);
  };

  // ---- states ------------------------------------------------------------
  if (phase === 'loading') {
    return <p className="text-center text-[14px] opacity-40 py-24">…</p>;
  }

  if (phase === 'unauthorized') {
    return (
      <p className="text-[15px] leading-relaxed opacity-70">
        Your working draft holds your own words, so it opens only to you.{' '}
        <a href="/signin" className="underline underline-offset-4">
          Sign in
        </a>{' '}
        to write.
      </p>
    );
  }

  if (phase === 'error') {
    return (
      <div>
        <p className="text-[14px] opacity-70 mb-4">Could not open your working draft just now.</p>
        <button
          onClick={() => void reload()}
          className="text-[13px] underline underline-offset-4 opacity-60"
        >
          Try again
        </button>
      </div>
    );
  }

  if (phase === 'none') {
    return (
      <div className="max-w-xl">
        <h2 className="text-2xl mb-4" style={{ fontFamily: SERIF }}>
          This is where your manuscript lives.
        </h2>
        <p className="text-[15px] leading-relaxed opacity-70 mb-3">
          Your working draft is a private, editable copy of this manuscript — started from your
          exact words. The original is never changed.
        </p>
        <p className="text-[15px] leading-relaxed opacity-70 mb-10">
          It autosaves as you write. Whenever you want to keep a version you can return to, save a
          checkpoint. Every checkpoint is preserved.
        </p>
        <button
          onClick={() => void begin()}
          disabled={creating}
          className="px-8 py-3 bg-[#C9A227] text-[#1A1513] text-[14px] tracking-wide disabled:opacity-30"
        >
          {creating ? 'preparing your draft…' : 'Begin your working draft'}
        </button>
        {beginError && <p className="text-[13px] opacity-70 mt-6">{beginError}</p>}
      </div>
    );
  }

  // ---- ready: the writing surface ---------------------------------------
  const saveLabel =
    saveState === 'saving'
      ? 'Saving…'
      : saveState === 'unsaved'
        ? 'Unsaved changes'
        : saveState === 'error'
          ? 'Could not save just now'
          : updatedAt
            ? `Saved · ${formatWhen(updatedAt)}`
            : '';

  return (
    <div>
      <p className="text-[13px] opacity-60 mb-2 leading-relaxed">
        An editable copy of this manuscript, in your own words. The original is never changed.
      </p>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[12px] opacity-40 mb-6">
        <span>≈ {pageEstimate(content.length)} pages</span>
        <span>
          {revisionCount} checkpoint{revisionCount === 1 ? '' : 's'}
        </span>
        <span className="ml-auto flex items-center gap-3">
          {saveLabel}
          {saveState === 'error' && (
            <button onClick={saveNow} className="underline underline-offset-4 hover:opacity-80">
              Save now
            </button>
          )}
        </span>
      </div>

      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Working draft"
        spellCheck
        className="w-full bg-black/20 border border-[#4A4238] rounded-sm p-5 text-[16px] leading-relaxed outline-none focus:border-[#C9A227]/50 min-h-[60vh] resize-y"
        style={{ fontFamily: SERIF }}
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !checkpointing) void checkpoint();
          }}
          placeholder="Name this checkpoint (optional)"
          aria-label="Checkpoint note"
          className="flex-1 min-w-[12rem] bg-transparent border-b border-[#4A4238] py-2 text-[14px] outline-none placeholder:opacity-40"
          style={{ fontFamily: SERIF }}
        />
        <button
          onClick={() => void checkpoint()}
          disabled={checkpointing}
          className="px-6 py-2.5 bg-[#C9A227] text-[#1A1513] text-[14px] tracking-wide disabled:opacity-30"
        >
          {checkpointing ? 'saving…' : 'Save a checkpoint'}
        </button>
      </div>
      {checkpointMsg && <p className="text-[13px] opacity-60 mt-3">{checkpointMsg}</p>}

      <div className="mt-10 border-t border-[#3a322b] pt-6">
        <button
          onClick={toggleHistory}
          className="text-[12px] tracking-[0.15em] uppercase opacity-50 hover:opacity-80"
        >
          {showHistory ? 'Hide checkpoints' : 'Checkpoints'}
        </button>

        {showHistory && (
          <div className="mt-6">
            {restoreError && (
              <p className="text-[13px] opacity-70 mb-4">
                Could not restore that checkpoint. Please try again.
              </p>
            )}
            {revisionsLoading ? (
              <p className="text-[13px] opacity-40">…</p>
            ) : revisions.length === 0 ? (
              <p className="text-[13px] opacity-40 italic">No checkpoints yet.</p>
            ) : (
              <div className="space-y-5">
                {revisions.map((r) => (
                  <div
                    key={r.revisionNumber}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-[#3a322b] pb-4"
                  >
                    <span className="text-[12px] opacity-40 w-8">#{r.revisionNumber}</span>
                    <span className="text-[15px]">{r.note ?? 'Checkpoint'}</span>
                    <span className="text-[12px] opacity-40">{formatWhen(r.createdAt)}</span>
                    <span className="text-[12px] opacity-40">≈ {pageEstimate(r.contentChars)} pp</span>
                    <div className="ml-auto">
                      {restoreConfirm === r.revisionNumber ? (
                        <span className="flex items-center gap-3 text-[12px]">
                          <span className="opacity-60">Replace current text?</span>
                          <button
                            onClick={() => void restore(r.revisionNumber)}
                            disabled={restoring}
                            className="underline underline-offset-4 disabled:opacity-30"
                          >
                            {restoring ? 'restoring…' : 'Restore'}
                          </button>
                          <button
                            onClick={() => setRestoreConfirm(null)}
                            className="opacity-50 hover:opacity-80"
                          >
                            cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setRestoreConfirm(r.revisionNumber);
                            setRestoreError(false);
                          }}
                          className="text-[12px] opacity-40 hover:opacity-80"
                        >
                          restore
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {restoreConfirm !== null && (
              <p className="text-[12px] opacity-40 mt-4 leading-relaxed max-w-lg">
                Restoring replaces your current working text with this checkpoint, and is itself
                saved as a new checkpoint — so it&rsquo;s always reversible. Changes since your last
                checkpoint are not kept.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
