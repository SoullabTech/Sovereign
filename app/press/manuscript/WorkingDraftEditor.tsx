'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

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
 *   - Only the author writes. Every call is member-scoped by credential; the
 *     API is the sole writer.
 *   - Every checkpoint is preserved. Autosave updates in place; a checkpoint
 *     appends an append-only revision the member can always return to. Restore
 *     writes a NEW revision — history is never rewritten.
 *
 * Aesthetic: matches the Room — Soullab Press palette, quiet serif, wide
 * margins. A writing room, not a dashboard.
 */

const SERIF = 'Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif';

interface WorkingDraftEditorProps {
  manuscriptId: string;
}

interface RevisionSummary {
  revisionNumber: number;
  note: string | null;
  contentChars: number;
  createdAt: string;
}

type Phase = 'loading' | 'none' | 'ready' | 'unauthorized' | 'error';
type SaveState = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

const AUTOSAVE_DELAY_MS = 1200;
const CHARS_PER_PAGE = 1800; // matches the Room's page estimate

function formatWhen(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function pageEstimate(chars: number): number {
  return Math.max(1, Math.round(chars / CHARS_PER_PAGE));
}

export default function WorkingDraftEditor({ manuscriptId }: WorkingDraftEditorProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [content, setContent] = useState('');
  const [revisionCount, setRevisionCount] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');

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

  const base = `/api/sovereign/manuscripts/${manuscriptId}/draft`;

  const loadDraft = useCallback(async () => {
    setPhase('loading');
    try {
      const res = await apiFetch(base, { method: 'GET' });
      if (res.status === 401) {
        setPhase('unauthorized');
        return;
      }
      if (res.status === 404) {
        setPhase('none');
        return;
      }
      if (!res.ok) {
        setPhase('error');
        return;
      }
      const data = await res.json();
      setContent(typeof data.content === 'string' ? data.content : '');
      setRevisionCount(typeof data.revisionCount === 'number' ? data.revisionCount : 0);
      setUpdatedAt(data.updatedAt ?? null);
      setSaveState('idle');
      setPhase('ready');
    } catch {
      setPhase('error');
    }
  }, [base]);

  useEffect(() => {
    void loadDraft();
  }, [loadDraft]);

  // Flush the pending autosave timer when the manuscript changes or unmounts.
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [manuscriptId]);

  const autosave = useCallback(
    async (value: string) => {
      setSaveState('saving');
      try {
        const res = await apiFetch(base, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: value }),
        });
        if (!res.ok) {
          setSaveState('error');
          return;
        }
        const data = await res.json();
        if (typeof data.revisionCount === 'number') setRevisionCount(data.revisionCount);
        setUpdatedAt(data.updatedAt ?? null);
        setSaveState('saved');
      } catch {
        setSaveState('error');
      }
    },
    [base],
  );

  const onChange = (value: string) => {
    setContent(value);
    setSaveState('unsaved');
    setCheckpointMsg(null);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void autosave(value), AUTOSAVE_DELAY_MS);
  };

  const saveNow = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    void autosave(content);
  };

  const beginDraft = async () => {
    setCreating(true);
    setBeginError(null);
    try {
      const res = await apiFetch(base, { method: 'POST' });
      if (res.status === 401) {
        setPhase('unauthorized');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setContent(typeof data.content === 'string' ? data.content : '');
        setRevisionCount(typeof data.revisionCount === 'number' ? data.revisionCount : 1);
        setUpdatedAt(null);
        setSaveState('idle');
        setPhase('ready');
        return;
      }
      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        if (typeof data.error === 'string' && data.error.includes('already exists')) {
          await loadDraft();
          return;
        }
        setBeginError(
          data.error === 'Manuscript has no sections'
            ? 'This manuscript has no sections yet, so there is nothing to begin from.'
            : 'Could not start your working draft. Please try again.',
        );
        return;
      }
      setBeginError('Could not start your working draft. Please try again.');
    } catch {
      setBeginError('Could not start your working draft. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const loadRevisions = useCallback(async () => {
    setRevisionsLoading(true);
    try {
      const res = await apiFetch(`${base}/revisions`, { method: 'GET' });
      if (!res.ok) {
        setRevisions([]);
        return;
      }
      const data = await res.json();
      setRevisions(Array.isArray(data.revisions) ? data.revisions : []);
    } catch {
      setRevisions([]);
    } finally {
      setRevisionsLoading(false);
    }
  }, [base]);

  const checkpoint = async () => {
    setCheckpointing(true);
    setCheckpointMsg(null);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    try {
      const res = await apiFetch(base, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, checkpoint: true, note: note.trim() || undefined }),
      });
      if (!res.ok) {
        setCheckpointMsg('Could not save a checkpoint. Please try again.');
        return;
      }
      const data = await res.json();
      if (typeof data.revisionCount === 'number') setRevisionCount(data.revisionCount);
      setUpdatedAt(data.updatedAt ?? updatedAt);
      setSaveState('saved');
      setNote('');
      setCheckpointMsg('Checkpoint saved.');
      if (showHistory) void loadRevisions();
    } catch {
      setCheckpointMsg('Could not save a checkpoint. Please try again.');
    } finally {
      setCheckpointing(false);
    }
  };

  const toggleHistory = () => {
    const next = !showHistory;
    setShowHistory(next);
    setRestoreConfirm(null);
    setRestoreError(false);
    if (next) void loadRevisions();
  };

  const restore = async (revisionNumber: number) => {
    setRestoring(true);
    setRestoreError(false);
    try {
      const res = await apiFetch(`${base}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionNumber }),
      });
      if (!res.ok) {
        setRestoreError(true);
        return;
      }
      setRestoreConfirm(null);
      await loadDraft();
      await loadRevisions();
    } catch {
      setRestoreError(true);
    } finally {
      setRestoring(false);
    }
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
          onClick={() => void loadDraft()}
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
          onClick={() => void beginDraft()}
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
              <p className="text-[13px] opacity-70 mb-4">Could not restore that checkpoint. Please try again.</p>
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
