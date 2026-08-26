'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { replaceRanges } from '@/lib/studio/manuscriptTools';
import {
  findInDraft,
  frameAfterEdit,
  frameForRegion,
  mapDraft,
  regionByKey,
  regionLabel,
  spliceFrame,
  type DeclaredPart,
  type DraftMap,
  type Frame,
} from './manuscriptMap';

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
 *
 * ── Working on one part (added: the novelist's built need) ──────────────────
 * A 216-part book in one field means every act of redevelopment begins with
 * scrolling. So the table can narrow its FRAME to a single carried part: the
 * field shows that part's text, and only that part's text.
 *
 * The frame is the only thing that narrows. Storage does not change shape:
 * the draft remains one document, the edit is spliced back into the whole
 * before it ever reaches the saver, and every guarantee in workingDraftClient
 * (ordering, idempotency, the version guard, the exit flush) applies to the
 * same bytes it always did. A narrowed frame must never become a narrowed
 * save — that would be a way to lose the rest of a book.
 */

type Phase = 'loading' | 'ready' | 'no-source' | 'unauthorized' | 'error' | 'conflict';

interface WorktableProps {
  manuscriptId: string;
  /** The parts the member carried in. Stable identity — see mapDraft. */
  parts: DeclaredPart[];
  /** Which part the frame is narrowed to, or null for the whole manuscript. */
  focusKey: string | null;
  /** The rail reads the living map from here; the table owns the text. */
  onMap?: (map: DraftMap) => void;
  /** The table can move the frame itself (a find result is a door too). */
  onFocusKey?: (key: string | null) => void;
  /** Authored draft facts for the room's orientation line. Facts only. */
  onMeta?: (meta: { updatedAt: string | null; revisionCount: number | null }) => void;
  /** A version was kept; the History drawer re-reads. */
  onCheckpointed?: () => void;
}

export default function Worktable({
  manuscriptId,
  parts,
  focusKey,
  onMap,
  onFocusKey,
  onMeta,
  onCheckpointed,
}: WorktableProps) {
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
  const fieldRef = useRef<HTMLTextAreaElement | null>(null);
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

  // ---- The living map -----------------------------------------------------
  // Recomputed from the text the member currently has, not from the import, so
  // the rail ages with the draft instead of describing a book that has moved on.
  const map = useMemo(() => mapDraft(content, parts), [content, parts]);
  useEffect(() => {
    onMap?.(map);
  }, [map, onMap]);

  /**
   * The frame's range, held as state rather than re-read from the map on every
   * keystroke — deliberately.
   *
   * If a writer deletes or rewrites the heading line of the part they are
   * working in, that part goes adrift and the map can no longer locate it. Had
   * the frame been derived from the map, the field would have snapped back to
   * the whole 216-part manuscript mid-sentence, with the caret somewhere else.
   * Instead the splice tells us exactly where the frame now ends, and the frame
   * simply stays where the writer is standing. The rail says the part has gone
   * adrift; the writing is not interrupted to say it.
   */
  const [frame, setFrame] = useState<Frame | null>(null);
  const [frameAdrift, setFrameAdrift] = useState(false);

  // Moving the frame is a member act (the rail, or a find result). Resolve it
  // against the map exactly once, when it moves.
  useEffect(() => {
    if (!focusKey) {
      setFrame(null);
      setFrameAdrift(false);
      return;
    }
    const resolved = frameForRegion(content, map, focusKey);
    if (resolved) {
      setFrame(resolved);
      setFrameAdrift(false);
    } else {
      // Asked for a part that is not in the draft as written. Say so; do not
      // pretend, and do not silently open something else.
      setFrame(null);
      setFrameAdrift(true);
    }
    // Intentionally keyed on the frame moving, not on the map changing: see
    // the note above on why an edit must not re-derive the frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey, phase]);

  const framed = frame !== null;
  const visible = framed ? content.slice(frame.start, frame.end) : content;
  const frameName = (() => {
    if (!focusKey) return null;
    const region = regionByKey(map, focusKey);
    if (region) return regionLabel(region);
    const carried = parts.find((p) => p.id === focusKey);
    return carried?.heading ?? 'This part';
  })();

  const edit = (value: string) => {
    // The splice: a framed edit is still an edit of the whole document.
    const full = spliceFrame(content, frame, value);
    setContent(full);
    contentRef.current = full;
    if (framed) setFrame(frameAfterEdit(frame, value));
    setKept(false);
    const saver = saverRef.current;
    if (!saver) return;
    saver.queue(full);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saver.flush(), AUTOSAVE_DELAY_MS);
  };

  // ---- Finding material across the whole manuscript -----------------------
  const [findOpen, setFindOpen] = useState(false);
  const [q, setQ] = useState('');
  const [replacement, setReplacement] = useState('');
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [replaced, setReplaced] = useState<string | null>(null);
  const found = useMemo(() => findInDraft(content, map, q), [content, map, q]);
  // A jump asks for a selection the field cannot make until it has re-rendered
  // around the new frame.
  const pendingSelect = useRef<{ start: number; length: number } | null>(null);
  useEffect(() => {
    const want = pendingSelect.current;
    const field = fieldRef.current;
    if (!want || !field) return;
    pendingSelect.current = null;
    field.focus();
    // Selecting the match scrolls the field to it — the writer asked to look at
    // this passage, so put them in front of it rather than at the part's top.
    field.setSelectionRange(want.start, want.start + want.length);
  }, [frame, visible]);

  const jumpTo = useCallback(
    (index: number, length: number, regionKey: string | null) => {
      const region = regionKey ? regionByKey(map, regionKey) : null;
      const nextKey = region ? region.key : null;
      const offset = region ? index - region.start : index;
      pendingSelect.current = { start: offset, length };
      if (nextKey === focusKey) {
        // Already standing in that part: nothing re-renders, so the effect that
        // normally applies the selection will not fire. Do it here instead —
        // otherwise a second result in the open chapter looks like a dead link.
        const field = fieldRef.current;
        if (field) {
          pendingSelect.current = null;
          field.focus();
          field.setSelectionRange(offset, offset + length);
        }
        return;
      }
      onFocusKey?.(nextKey);
    },
    [map, onFocusKey, focusKey],
  );

  /**
   * Replace — over the hits the writer was shown, never over the query.
   *
   * Two things make this safe rather than merely convenient:
   *
   *   1. A VERSION IS KEPT FIRST, always, and awaited. If the checkpoint does
   *      not land, nothing is replaced. A writer who replaces 412 occurrences
   *      and then wants them back must have somewhere to go back TO, and that
   *      cannot be best-effort.
   *
   *   2. The edit is computed against the WHOLE document from ranges taken
   *      from the whole document, then spliced back through the same saver as
   *      any other edit. A narrowed frame narrows what is shown; it never
   *      narrows what is saved.
   */
  const replaceHits = async (ranges: { start: number; end: number }[]) => {
    if (replacing || phase !== 'ready' || ranges.length === 0) return;
    setReplacing(true);
    setReplaced(null);
    try {
      const before = contentRef.current;
      // The undo point. Awaited, and a failure aborts the replace.
      const kept = await checkpoint(`Before replacing ${ranges.length}`);
      if (!kept) {
        setReplaced('Nothing was replaced — the version could not be kept first.');
        return;
      }

      let next: string;
      try {
        ({ next } = replaceRanges(before, ranges, replacement));
      } catch {
        // Overlapping or stale ranges. The draft moved under the search.
        setReplaced('Nothing was replaced — those passages have moved. Search again.');
        return;
      }

      setContent(next);
      contentRef.current = next;
      // The frame was resolved against the old text; re-resolve it against the
      // new so the field keeps showing the part the writer is standing in.
      if (focusKey) {
        setFrame(frameForRegion(next, mapDraft(next, parts), focusKey));
      }
      setKept(false);
      const saver = saverRef.current;
      saver?.queue(next);
      if (timerRef.current) clearTimeout(timerRef.current);
      saver?.flush();
      setReplaced(
        `Replaced ${ranges.length} · a version was kept first, in Versions.`,
      );
      setConfirmAll(false);
    } finally {
      setReplacing(false);
    }
  };

  /** Persist a checkpoint and report whether it actually landed. */
  const checkpoint = async (note?: string): Promise<boolean> => {
    const saver = saverRef.current;
    if (!saver) return false;
    await saver.beginExclusive();
    const value = contentRef.current;
    const res = await putDraft(apiFetch, manuscriptId, {
      content: value,
      checkpoint: true,
      note,
      baseRevisionId: baseRef.current,
      idempotencyKey: newIdempotencyKey(),
    });
    if (res.kind === 'ok') {
      if (res.revisionId !== null) baseRef.current = res.revisionId;
      setUpdatedAt(res.updatedAt);
      cbRef.current.onMeta?.({ updatedAt: res.updatedAt, revisionCount: res.revisionCount });
      cbRef.current.onCheckpointed?.();
      saver.endExclusive({ persisted: value });
      return true;
    }
    if (res.kind === 'conflict') {
      saver.endExclusive({ flushPending: false });
      setPhase('conflict');
      return false;
    }
    saver.endExclusive();
    setSaveState('error');
    return false;
  };

  const keepVersion = async () => {
    const saver = saverRef.current;
    if (!saver || keeping || phase !== 'ready') return;
    setKeeping(true);
    setKept(false);
    try {
      await saver.beginExclusive();
      // contentRef is always the WHOLE draft, framed or not — a kept version is
      // a version of the book, never of the part on screen.
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

  const shownChars = visible.length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Quiet facts, no scores: what the draft is, where saving stands, and
          the one versioning gesture. */}
      <div className="flex items-baseline flex-wrap gap-x-4 gap-y-1 mb-3 text-[12px]">
        <span className="opacity-40">
          ~{pageEstimate(shownChars)} page{pageEstimate(shownChars) === 1 ? '' : 's'}
          {framed && content.length !== shownChars
            ? ` of ~${pageEstimate(content.length)}`
            : ''}
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
        <button
          onClick={() => setFindOpen((o) => !o)}
          aria-expanded={findOpen}
          className="opacity-55 hover:opacity-90 underline underline-offset-4"
        >
          Find in manuscript
        </button>
        {kept && <span style={{ color: PRESS.accent }}>version kept</span>}
        <button
          onClick={() => void keepVersion()}
          disabled={keeping}
          className="opacity-55 hover:opacity-90 underline underline-offset-4 disabled:opacity-30"
        >
          {keeping ? 'keeping…' : 'Keep a version'}
        </button>
      </div>

      {/* ── The frame line: what the field is showing, and the way back out.
          Present only when the frame is narrowed, so an unframed table is
          exactly as quiet as it was before. ── */}
      {(framed || frameAdrift) && (
        <div
          className="flex items-baseline gap-3 mb-3 pb-2.5 border-b text-[12.5px]"
          style={{ borderColor: PRESS.ruleSoft }}
        >
          {framed ? (
            <>
              <span style={{ color: PRESS.accent }}>{frameName}</span>
              <span className="opacity-40">this part only · autosave holds the whole book</span>
            </>
          ) : (
            <span className="opacity-60 leading-relaxed">
              “{frameName}” is not in your draft as written — its heading line has been changed or
              removed. Showing the whole manuscript.
            </span>
          )}
          <span className="flex-1" />
          <button
            onClick={() => onFocusKey?.(null)}
            className="opacity-55 hover:opacity-90 underline underline-offset-4"
          >
            Whole manuscript
          </button>
        </div>
      )}

      {/* ── Find: the answer to "where does this material actually sit?" ── */}
      {findOpen && (
        <div
          className="mb-4 pb-3 border-b"
          style={{ borderColor: PRESS.ruleSoft }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder="a phrase to find — e.g. “earlier in this book”"
            aria-label="Find in manuscript"
            className="w-full bg-transparent outline-none border-b pb-1.5 text-[14px]"
            style={{ borderColor: PRESS.ruleSoft, fontFamily: SERIF, color: PRESS.text }}
          />
          {/* Replace stays folded until asked for: finding is the common act,
              and a replacement field sitting open invites an edit nobody
              intended. */}
          {q.trim().length >= 2 && (
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-2">
              <button
                onClick={() => {
                  setReplaceOpen((o) => !o);
                  setConfirmAll(false);
                  setReplaced(null);
                }}
                className="text-[11px] tracking-[0.14em] uppercase opacity-45 hover:opacity-95"
              >
                {replaceOpen ? 'never mind' : 'Replace…'}
              </button>
              {replaced && <span className="text-[11.5px] opacity-60">{replaced}</span>}
            </div>
          )}

          {replaceOpen && q.trim().length >= 2 && (
            <div className="mt-2.5">
              <input
                value={replacement}
                onChange={(e) => {
                  setReplacement(e.target.value);
                  setConfirmAll(false);
                }}
                placeholder="replace with…"
                aria-label="Replace with"
                className="w-full bg-transparent outline-none border-b pb-1.5 text-[14px]"
                style={{ borderColor: PRESS.ruleSoft, fontFamily: SERIF, color: PRESS.text }}
              />
              {found.hits.length > 0 && (
                <div className="mt-2.5">
                  {found.truncated ? (
                    /* Replacing "the first 200" would silently leave the rest.
                       Say so and refuse, rather than half-doing it. */
                    <p className="text-[11.5px] leading-relaxed opacity-55">
                      There are more matches than are shown, so replacing all of them here would
                      leave some behind. Narrow the phrase first.
                    </p>
                  ) : confirmAll ? (
                    <div className="border px-3.5 py-2.5" style={{ borderColor: PRESS.ruleSoft }}>
                      <p className="text-[12.5px] leading-relaxed opacity-70 mb-1">
                        Replace {found.hits.length} occurrence
                        {found.hits.length === 1 ? '' : 's'} of “{q.trim()}” with “
                        {replacement}”?
                      </p>
                      {/* How the first one will actually read — a count alone
                          is not enough to agree to. */}
                      <p
                        className="text-[12.5px] leading-relaxed opacity-50 mb-2"
                        style={{ fontFamily: SERIF }}
                      >
                        {found.hits[0].before}
                        <span style={{ color: PRESS.accent }}>{replacement}</span>
                        {found.hits[0].after}
                      </p>
                      <p className="text-[11.5px] opacity-45 mb-2">
                        A version is kept first, so this can be undone.
                      </p>
                      <div className="flex gap-4">
                        <button
                          disabled={replacing}
                          onClick={() =>
                            void replaceHits(
                              found.hits.map((h) => ({ start: h.index, end: h.index + h.length })),
                            )
                          }
                          className="text-[12px] underline underline-offset-4 opacity-80 hover:opacity-100 disabled:opacity-30"
                          style={{ color: PRESS.accent }}
                        >
                          {replacing ? 'replacing…' : 'replace them'}
                        </button>
                        <button
                          onClick={() => setConfirmAll(false)}
                          className="text-[12px] opacity-45 hover:opacity-80"
                        >
                          not now
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      disabled={replacing}
                      onClick={() => setConfirmAll(true)}
                      className="text-[11px] tracking-[0.14em] uppercase opacity-55 hover:opacity-95 disabled:opacity-30"
                    >
                      Replace all {found.hits.length}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {q.trim().length >= 2 && (
            <div className="mt-3">
              <p className="text-[11.5px] opacity-45 mb-2">
                {found.hits.length === 0
                  ? 'Not in this manuscript.'
                  : `${found.hits.length}${found.truncated ? '+' : ''} in your draft`}
              </p>
              <ul className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {found.hits.map((h) => (
                  <li key={h.index}>
                    <button
                      onClick={() => jumpTo(h.index, h.length, h.region?.key ?? null)}
                      className="text-left w-full opacity-70 hover:opacity-100"
                    >
                      <span className="text-[11px] uppercase tracking-[0.12em] opacity-60">
                        {h.region ? regionLabel(h.region) : 'Manuscript'}
                      </span>
                      <span className="block text-[13px] leading-snug">
                        {h.clippedStart && '…'}
                        {h.before}
                        <mark
                          className="bg-transparent"
                          style={{ color: PRESS.accent, fontWeight: 600 }}
                        >
                          {h.match}
                        </mark>
                        {h.after}
                        {h.clippedEnd && '…'}
                      </span>
                    </button>
                    {replaceOpen && (
                      <button
                        disabled={replacing}
                        onClick={() =>
                          void replaceHits([{ start: h.index, end: h.index + h.length }])
                        }
                        className="text-[10.5px] tracking-[0.12em] uppercase opacity-35 hover:opacity-90 disabled:opacity-20 mt-0.5"
                      >
                        replace this one
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {found.truncated && (
                <p className="text-[11.5px] opacity-40 mt-2">
                  Showing the first {found.hits.length}. Narrow the phrase to see the rest.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <textarea
        ref={fieldRef}
        value={visible}
        onChange={(e) => edit(e.target.value)}
        aria-label={framed && frameName ? `Working draft — ${frameName}` : 'Working draft'}
        className="flex-1 w-full bg-transparent outline-none resize-none text-[17px] leading-[1.8]"
        style={{ fontFamily: SERIF, color: PRESS.text, caretColor: PRESS.accent }}
      />
    </div>
  );
}
