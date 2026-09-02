'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { canvasForManuscript } from '../../writers-studio/canvasIdentity';
import WriterField, { type WriterFieldHandle } from './WriterField';
import {
  headingAtOffset,
  loadDraftPosition,
  prefersReducedMotion,
  saveDraftPosition,
} from './returningState';
import {
  AUTOSAVE_DELAY_MS,
  beginDraft,
  createDraftSaver,
  createExitGuard,
  formatWhen,
  loadDraft,
  loadRevisions,
  newIdempotencyKey,
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

// Restore must happen before paint (so the draft never visibly jumps from the
// top to where the writer was), but React warns if useLayoutEffect appears
// during SSR. This client component is server-rendered for initial HTML, so
// pick the isomorphic variant: useLayoutEffect on the client, useEffect on the
// server (where there is nothing to restore anyway).
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface WorkingDraftEditorProps {
  manuscriptId: string;
  /**
   * A passage the member has asked to bring in, handed down from the Room.
   * Consumed exactly once: the editor calls `onInsertDone` whether it
   * succeeded or not, so a failed insertion never silently re-fires.
   * `id` changes per request so bringing the SAME passage in twice is two
   * distinct acts rather than a no-op.
   */
  pendingInsert?: { id: number; text: string } | null;
  onInsertDone?: (ok: boolean) => void;
}

type Phase =
  | 'loading' | 'none' | 'ready' | 'unauthorized' | 'error'
  | 'section-addressable'
  /** The server claims section authority and its section state is unreadable. */
  | 'unreadable';

/**
 * SECTION-ADDRESSABLE DRAFTS ARE NOT WRITTEN HERE.
 *
 * This surface is one CodeMirror document, and five separate contracts read
 * whole-draft integer offsets out of it: Explicit Insertion at a caret offset,
 * `returningState`'s caret and scroll, `headingAtOffset`, the revision store,
 * and `base_source_hash`. Making it section-native means one node per section
 * and rewriting all five together.
 *
 * ⛔ THE SHORTCUT IS THE THING THAT WAS RULED OUT. Keeping one field and
 * mapping its offsets back onto section boundaries is a hidden offset ledger —
 * "Option 2 wearing Option 3's name" — and the ledger becomes a second fallible
 * claim about the same text. When it is wrong, a durable identity that authored
 * structure and developmental evidence both depend on moves silently, and
 * nothing detects it at write time.
 *
 * So this surface tells the truth instead: it shows the draft and says where it
 * is written. The Canvas holds real section nodes. Unconverted drafts — every
 * draft that existed before this shipped — are untouched and still written
 * here.
 */

export default function WorkingDraftEditor({
  manuscriptId,
  pendingInsert,
  onInsertDone,
}: WorkingDraftEditorProps) {
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

  // R1.1 Returning — spatial continuity (single work, client-side, observable only).
  const fieldRef = useRef<WriterFieldHandle | null>(null);
  /* True once the writer has actually put a caret in the draft this session.
     Distinguishes "caret at 0" from "no caret yet" — the surface reports the
     same number for both, and they mean opposite things. */
  const caretTouchedRef = useRef(false);
  /* A caret position waiting for React to commit the value it belongs to. */
  const pendingCaretRef = useRef<number | null>(null);
  const posTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredRef = useRef(false); // restore position exactly once per mount
  const [conflict, setConflict] = useState(false);
  const [welcome, setWelcome] = useState<{ heading: string | null } | null>(null);
  const [welcomeFading, setWelcomeFading] = useState(false);

  const http = useMemo<Http>(() => (path, init) => apiFetch(path, init), []);

  // Single-flight, ordered autosave. Created once (the parent remounts this
  // component per manuscript via key), so manuscriptId is stable here.
  const saverRef = useRef<DraftSaver | null>(null);
  // The version this client last saw. Every write carries it; the server
  // refuses anything that does not match, so a second tab cannot overwrite
  // this one without the writer being told.
  const revisionIdRef = useRef<number>(1);
  if (!saverRef.current) {
    saverRef.current = createDraftSaver(
      (value) =>
        putDraft(http, manuscriptId, {
          content: value,
          baseRevisionId: revisionIdRef.current,
          idempotencyKey: newIdempotencyKey(),
        }),
      {
        onState: setSaveState,
        onSaved: (meta) => {
          if (typeof meta.revisionCount === 'number') setRevisionCount(meta.revisionCount);
          if (typeof meta.revisionId === 'number') revisionIdRef.current = meta.revisionId;
          setUpdatedAt(meta.updatedAt);
        },
        onConflict: () => setConflict(true),
      }
    );
  }
  const saver = saverRef.current;

  const reload = useCallback(async () => {
    setPhase('loading');
    const r = await loadDraft(http, manuscriptId);
    if (r.kind === 'ok') {
      setContent(r.content);
      setRevisionCount(r.revisionCount);
      revisionIdRef.current = r.revisionId;
      setUpdatedAt(r.updatedAt);
      setSaveState('idle');
      /* Read-only rather than a broken write. A content save against a
         section-addressable draft is refused by the server with nothing
         written; letting the writer type into a field whose every save will be
         declined would be worse than saying so before they start. */
      setPhase(r.sectionAddressable ? 'section-addressable' : 'ready');
    } else {
      setPhase(r.kind); // 'none' | 'unreadable' | 'unauthorized' | 'error'
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

  // ---- R1.1 Returning: spatial continuity ---------------------------------
  // Persist the writer's position — caret, selection, scroll. Observable only;
  // never intent or meaning. A courtesy, never load-bearing.
  const persistPosition = useCallback(() => {
    const field = fieldRef.current;
    if (!field) return;
    saveDraftPosition(manuscriptId, {
      selectionStart: field.selectionStart ?? 0,
      selectionEnd: field.selectionEnd ?? 0,
      scrollTop: field.scrollTop ?? 0,
    });
  }, [manuscriptId]);

  const persistPositionSoon = useCallback(() => {
    if (posTimer.current) clearTimeout(posTimer.current);
    posTimer.current = setTimeout(persistPosition, 400);
  }, [persistPosition]);

  // Ref indirection so exit handlers persist the latest position without
  // re-subscribing each render (mirrors flushRef below).
  /* The page grows with the writing. A fixed box with an inner scrollbar puts
     the caret near the bottom edge for hours; growing keeps it in the band the
     eye rests in and lets the browser own the one scrollbar.

     The textarea needed a measure-and-set effect on every keystroke to do this.
     WriterField gets it structurally instead — `.cm-scroller { overflow: visible }`
     with `height: auto`, so the surface has no inner scroll to begin with. Same
     behaviour, no per-keystroke layout write. */

  const persistRef = useRef(persistPosition);
  persistRef.current = persistPosition;

  // Restore position once, before paint — the draft must never visibly jump
  // from the top down to where the writer actually was.
  useIsomorphicLayoutEffect(() => {
    if (phase !== 'ready' || restoredRef.current) return;
    restoredRef.current = true;
    const field = fieldRef.current;
    const pos = loadDraftPosition(manuscriptId);
    // A genuine "return": a stored position, or a draft written before now.
    // A freshly-begun draft gets no welcome — there is no "back" to return to.
    const returning = !!pos || !!updatedAt;
    if (field && pos) {
      const len = field.value.length;
      try {
        // Selection before scroll: setting the selection can scroll the caret
        // into view, so applying scroll afterwards is what actually lands.
        field.setSelectionRange(
          Math.min(pos.selectionStart, len),
          Math.min(pos.selectionEnd, len),
        );
      } catch {
        /* selection API can throw; position is only a courtesy */
      }
      field.focus({ preventScroll: true });
      field.scrollTop = Math.min(pos.scrollTop, Math.max(0, field.scrollHeight));
    }
    if (returning) {
      setWelcome({ heading: headingAtOffset(content, pos?.selectionStart ?? 0) });
    }
  }, [phase, manuscriptId, updatedAt, content]);

  // The welcome arrives, then steps aside — the work is already present.
  useEffect(() => {
    if (!welcome) return;
    const reduce = prefersReducedMotion();
    const hold = 5000;
    const fade = reduce ? 0 : 1200;
    const t1 = reduce ? null : setTimeout(() => setWelcomeFading(true), hold);
    const t2 = setTimeout(() => setWelcome(null), hold + fade);
    return () => {
      if (t1) clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [welcome]);

  // Persist position on unmount too (tab switch, route change), and clear the
  // debounce timer.
  useEffect(
    () => () => {
      if (posTimer.current) clearTimeout(posTimer.current);
      persistRef.current();
    },
    [],
  );

  /**
   * W-1 — close the debounce gap on every exit.
   *
   * Text typed within AUTOSAVE_DELAY_MS is queued in the saver but has not been
   * sent. Previously the unmount cleanup only cleared the timer, so that text
   * died with the component: switching Room tabs, changing route, or leaving
   * the page silently discarded the writer's most recent words while the room
   * said "It autosaves as you write."
   *
   * Every path out now flushes first. Clearing the timer without flushing is
   * the bug; the two must never be separated again.
   */
  const exitGuard = useMemo(
    () =>
      createExitGuard(saver, () => {
        if (saveTimer.current) {
          clearTimeout(saveTimer.current);
          saveTimer.current = null;
        }
      }),
    [saver],
  );
  const flushNow = useCallback(() => {
    exitGuard.flushNow();
  }, [exitGuard]);

  // Ref indirection: the unmount cleanup must see the latest flushNow without
  // the effect re-running (a re-run would flush on every render).
  const flushRef = useRef(flushNow);
  flushRef.current = flushNow;

  // Unmount: Room tab switch, route change, manuscript change.
  useEffect(() => () => flushRef.current(), []);

  useEffect(() => {
    // `pagehide` and `visibilitychange → hidden` are the events mobile browsers
    // actually fire when backgrounding or discarding a tab; `beforeunload` is
    // unreliable there, so it cannot be the only guard.
    const onPageHide = () => {
      persistRef.current();
      flushRef.current();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        persistRef.current();
        flushRef.current();
      }
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      persistRef.current();
      flushRef.current();
      // Honesty limit: a dispatched PUT is not a completed PUT, and we cannot
      // await one here. If anything is still pending we ask the browser to
      // confirm rather than let the writer leave believing it was saved.
      if (exitGuard.stillPending()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [saver, exitGuard]);

  const onChange = (value: string) => {
    setContent(value);
    setCheckpointMsg(null);
    saver.queue(value); // marks 'unsaved' via onState
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saver.flush(), AUTOSAVE_DELAY_MS);
    persistPositionSoon(); // the caret has moved with the typing
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
      revisionIdRef.current = r.revisionId;
      setUpdatedAt(null);
      setSaveState('idle');
      /* ⛔ FAIL CLOSED ON THE WAY IN. New drafts are now born
         section-addressable, so an unconditional `ready` here would drop the
         member straight into the legacy writable editor on a draft the Canvas
         owns — and they would find out when a save they had already made was
         refused. The phase comes from the representation the server just
         returned, so the writable surface is never even mounted for a draft
         that does not belong to it. */
      setPhase(r.sectionAddressable ? 'section-addressable' : 'ready');
    } else if (r.kind === 'exists') {
      await reload();
    } else if (r.kind === 'unreadable') {
      setPhase('unreadable');
    } else if (r.kind === 'unauthorized') {
      setPhase('unauthorized');
    } else if (r.kind === 'no-sections') {
      setBeginError('This manuscript has no sections yet, so there is nothing to begin from.');
    } else {
      setBeginError('Could not start your working draft. Please try again.');
    }
    setCreating(false);
  };

  /* Everything arrives as the writer's own plain text. A manuscript pasted
     from a word processor brings fonts, colours and spacing that have nothing
     to do with the book; the words are what was meant.

     The textarea needed an explicit onPaste handler to enforce that. The
     WriterField does not: its document IS a markdown string, so a rich paste
     has nowhere to put formatting — it lands as text by construction. This is
     the same property that makes the whole surface swap safe, applied to
     paste. Removed rather than ported, because a handler that re-implements a
     guarantee the model already gives is a place for the two to disagree. */

  /**
   * Explicit insertion — the member brings a kept passage into the draft.
   *
   * Practice act: Integrate. Member-facing verb: "Bring in". Engineering
   * capability: explicit insertion. Those three names stay separate.
   *
   * What makes this constitutional rather than an AI edit:
   *   - The member chooses the passage and the caret. Nothing is placed,
   *     rewritten, summarised, reordered, or inserted automatically.
   *   - A checkpoint is written FIRST and awaited. Undo is not a bespoke
   *     mechanism here — it is the existing restore, so "bring in" is
   *     reversible by the same gesture that reverses everything else.
   *   - The passage arrives as ordinary draft text. Once in, it is
   *     indistinguishable from the member's own typing and carries no marker,
   *     no provenance badge, no styling. Recognition was already enacted when
   *     they kept it; the Room does not re-assert it.
   *   - The kept passage is not consumed. It stays in Keeps, unchanged.
   *
   * If the checkpoint fails, the insertion does NOT happen. An irreversible
   * insertion is worse than no insertion.
   */
  const insertAtCaret = useCallback(
    async (text: string) => {
      const field = fieldRef.current;
      if (!field || !text) return false;
      const ok = await checkpointRef.current(`Before bringing in a passage`);
      if (!ok) return false;
      /* WHERE it lands. A surface the writer has not touched this session
         reports selectionStart 0, and 0 is the worst possible answer: the
         passage would land above the title page of a 216-section book. Walked
         2026-08-01 — it did exactly that.

         So: use the live caret only if the writer has actually placed one this
         session. Otherwise fall back to the position they left last time, and
         only then to the end. The end is a defensible default; the top is not.

         `field.hasFocus()` replaces the old `document.activeElement === ta`:
         CodeMirror's focused element is its inner contentDOM, not the element
         this component holds a ref to, so an identity check against the ref
         would report "untouched" for a writer who is actively typing. */
      /* W-2 — read the document AFTER the checkpoint resolves.
         `content` was captured when this callback was created, and the await
         above can last as long as a network round-trip. A writer who keeps
         typing during it moves the real document on; writing the captured
         string back would silently delete every word typed in that window.
         The live surface is the authority, so ask it rather than the closure.
         Same reason the caret is re-read here and not before the await. */
      const current = field.value;
      const touched = field.hasFocus() || caretTouchedRef.current;
      const stored = loadDraftPosition(manuscriptId)?.selectionStart;
      const start = touched
        ? Math.min(field.selectionStart ?? current.length, current.length)
        : Math.min(stored ?? current.length, current.length);
      const end = touched ? Math.min(field.selectionEnd ?? start, current.length) : start;
      // A passage lands as its own paragraph unless the writer is mid-line.
      const before = current.slice(0, start);
      const after = current.slice(end);
      const lead = before && !before.endsWith('\n') ? '\n\n' : '';
      const tail = after && !after.startsWith('\n') ? '\n\n' : '';
      const piece = lead + text + tail;
      onChangeRef.current(before + piece + after);
      /* Apply the caret AFTER React has committed the new value. Setting it in
         a rAF races the commit: the browser replaces the textarea's value and
         drops the caret at the end, clobbering whatever we set. Walked
         2026-08-01 — the caret ended at character 380,797. */
      pendingCaretRef.current = start + piece.length;
      return true;
    },
    /* Deliberately NOT [content]: this callback no longer reads the captured
       string at all — it asks the live surface after the await. Depending on
       `content` would rebuild it on every keystroke and re-introduce the
       impression that the closure's copy is authoritative. It is not. */
    [manuscriptId]
  );

  /**
   * `overrideNote` lets a caller name the checkpoint it is taking on the
   * member's behalf (explicit insertion does this). It never touches the
   * member's own note field. Returns whether the checkpoint was actually
   * written — callers that must be reversible depend on the answer.
   */
  const checkpoint = async (overrideNote?: string): Promise<boolean> => {
    setCheckpointing(true);
    setCheckpointMsg(null);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    // Take the save lane so no autosave races this checkpoint write.
    await saver.beginExclusive();
    try {
      const r = await putDraft(http, manuscriptId, {
        content,
        checkpoint: true,
        note: overrideNote ?? (note.trim() || undefined),
        baseRevisionId: revisionIdRef.current,
        idempotencyKey: newIdempotencyKey(),
      });
      if (r.kind === 'conflict') setConflict(true);
      if (r.kind === 'ok') {
        if (typeof r.revisionCount === 'number') setRevisionCount(r.revisionCount);
        if (typeof r.revisionId === 'number') revisionIdRef.current = r.revisionId;
        setUpdatedAt(r.updatedAt);
        setSaveState('saved');
        if (!overrideNote) {
          setNote('');
          setCheckpointMsg('Checkpoint saved.');
        }
        if (showHistory) await refreshRevisions();
        return true;
      }
      setCheckpointMsg(
        overrideNote
          ? 'Could not make a checkpoint, so nothing was brought in. Please try again.'
          : 'Could not save a checkpoint. Please try again.'
      );
      return false;
    } finally {
      // Persist anything typed during the checkpoint; drop it if unchanged.
      saver.endExclusive({ persisted: content });
      setCheckpointing(false);
    }
  };

  /* Ref indirection so insertAtCaret does not have to re-create on every
     keystroke, and always calls the current closures. */
  const checkpointRef = useRef(checkpoint);
  checkpointRef.current = checkpoint;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  /* Consume a bring-in request exactly once, and only when there is a draft to
     insert into. `handledInsertRef` guards against React re-running the effect
     (StrictMode double-invoke, unrelated re-render) and inserting twice — a
     duplicated paragraph in someone's book is not a recoverable annoyance. */
  /* Place a caret that was chosen before the value existed. Runs after the
     commit that contains the inserted text, which is the only moment the
     position is meaningful. */
  useEffect(() => {
    const caret = pendingCaretRef.current;
    if (caret === null) return;
    pendingCaretRef.current = null;
    const field = fieldRef.current;
    if (!field) return;
    const at = Math.min(caret, field.value.length);
    field.focus();
    field.setSelectionRange(at, at);
    caretTouchedRef.current = true;
    persistPositionSoon();
  }, [content, persistPositionSoon]);

  const handledInsertRef = useRef<number | null>(null);
  useEffect(() => {
    if (!pendingInsert || phase !== 'ready') return;
    if (handledInsertRef.current === pendingInsert.id) return;
    handledInsertRef.current = pendingInsert.id;
    let live = true;
    void insertAtCaret(pendingInsert.text).then((ok) => {
      if (!live) return;
      if (ok) setCheckpointMsg('Brought in. A checkpoint was saved just before it.');
      onInsertDone?.(ok);
    });
    return () => {
      live = false;
    };
  }, [pendingInsert, phase, insertAtCaret, onInsertDone]);

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
    // Take the save lane so no autosave races (or outlives) the restore.
    await saver.beginExclusive();
    try {
      const r = await restoreRevision(http, manuscriptId, revisionNumber, {
        baseRevisionId: revisionIdRef.current,
        idempotencyKey: newIdempotencyKey(),
      });
      if (r.kind === 'conflict') setConflict(true);
      if (r.kind === 'ok') {
        if (typeof r.revisionId === 'number') revisionIdRef.current = r.revisionId;
        setRestoreConfirm(null);
        await reload();
        await refreshRevisions();
      } else {
        setRestoreError(true);
      }
    } finally {
      // Restored content is authoritative: discard edits made during the restore.
      saver.endExclusive({ flushPending: false });
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

  if (phase === 'unreadable') {
    return (
      <div className="max-w-xl">
        <p className="text-[15px] leading-relaxed opacity-75 mb-4">
          This draft could not be opened here safely.
        </p>
        <p className="text-[14px] leading-relaxed opacity-55 mb-6">
          Nothing is lost and nothing was changed. Your manuscript is arranged in sections, and
          this page could not read that arrangement — so it will not offer to write over it.
        </p>
        <a
          href={canvasForManuscript('/writers-studio/canvas', manuscriptId)}
          className="text-[14px] underline underline-offset-4"
          style={{ color: '#C9A227' }}
        >
          Open on the Canvas
        </a>
        <button
          onClick={() => void reload()}
          className="ml-6 text-[13px] underline underline-offset-4 opacity-60"
        >
          Try again
        </button>
      </div>
    );
  }

  if (phase === 'section-addressable') {
    return (
      <div className="max-w-xl">
        <h2 className="text-2xl mb-4" style={{ fontFamily: SERIF }}>
          This manuscript is written on the Canvas.
        </h2>
        <p className="text-[15px] leading-relaxed opacity-75 mb-4">
          Your draft is arranged in sections, so the Canvas is where it is written — it holds
          each section as its own place in the manuscript rather than as a position in one long
          string.
        </p>
        <p className="text-[14px] leading-relaxed opacity-55 mb-6">
          Nothing here is lost or changed. This page can still show you the words and your saved
          versions.
        </p>
        <a
          /* The canonical builder, not a hand-written query string: the
             Canvas reads `m`, and a link that spelled it differently would
             open the Canvas on a DIFFERENT manuscript. That is pinned by
             canvasParamPin across this boundary. */
          href={canvasForManuscript('/writers-studio/canvas', manuscriptId)}
          className="text-[14px] underline underline-offset-4"
          style={{ color: '#C9A227' }}
        >
          Open on the Canvas
        </a>
        <div
          className="writing-surface mt-10 whitespace-pre-wrap"
          style={{ maxWidth: '38rem', fontFamily: SERIF, fontSize: '17px', lineHeight: 1.8, opacity: 0.75 }}
        >
          {content}
        </div>
      </div>
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
    saveState === 'conflict'
      ? 'Not saved'
      : saveState === 'saving'
      ? 'Saving…'
      : saveState === 'unsaved'
        ? 'Unsaved changes'
        : saveState === 'unauthorized'
          ? 'Signed out — not saved'
          : saveState === 'error'
            ? 'Could not save just now'
            : updatedAt
              ? `Saved · ${formatWhen(updatedAt)}`
              : '';

  return (
    <div>
      {welcome && (
        /* R1.1 Returning — hospitality, then it steps aside. Observable facts
           only: the writer's own heading. No coaching, prediction, or prompt. */
        <p
          role="status"
          aria-live="polite"
          className="text-[15px] opacity-70 mb-6 leading-relaxed transition-opacity duration-[1200ms]"
          style={{ fontFamily: SERIF, opacity: welcomeFading ? 0 : undefined }}
        >
          Welcome back.
          {welcome.heading ? ` You were writing in ${welcome.heading}.` : ''}
        </p>
      )}
      <p className="text-[13px] opacity-60 mb-2 leading-relaxed">
        An editable copy of this manuscript, in your own words. The original is never changed.
      </p>
      {conflict && (
        <p role="alert" className="mb-4 text-[#E8B4A0] leading-relaxed" style={{ fontFamily: SERIF }}>
          This draft changed in another tab. Your work here has not been saved. Copy anything you
          need, then reload.
        </p>
      )}
      {saveState === 'unauthorized' && (
        /* A session that ended under a writer who is still writing — the case
           a returning beta writer met after time away. Everything they have
           typed since is still here and still queued; the only thing that can
           lose it now is navigating this tab away, so signing in opens in a
           new one. */
        <p role="alert" className="mb-4 text-[#E8B4A0] leading-relaxed" style={{ fontFamily: SERIF }}>
          Your session ended, so the last changes have not been saved. They are still here — nothing
          has been lost.{' '}
          <a
            href="/signin"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Sign in again in a new tab
          </a>
          , leave this page open, then use <span className="whitespace-nowrap">Save now</span>.
        </p>
      )}
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[12px] mb-6">
        <span className="opacity-40">≈ {pageEstimate(content.length)} pages</span>
        <span className="opacity-40">
          {revisionCount} checkpoint{revisionCount === 1 ? '' : 's'}
        </span>
        <span className="ml-auto flex items-center gap-3">
          {/* W-4: save state is announced, not just displayed. A writer using a
              screen reader must hear "Unsaved changes" without hunting for it. */}
          <span
            role="status"
            aria-live="polite"
            className={
              saveState === 'error' || saveState === 'unauthorized'
                ? 'opacity-100 text-[#E8B4A0]'
                : 'opacity-40'
            }
          >
            {saveLabel}
          </span>
          {(saveState === 'error' || saveState === 'unauthorized') && (
            /* W-4: the control a writer needs when saving has FAILED must not be
               hover-revealed — on touch there is no hover. Full opacity, real
               tap target, visible focus ring. */
            <button
              onClick={saveNow}
              className="underline underline-offset-4 opacity-100 min-h-[44px] px-2 -mx-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
            >
              Save now
            </button>
          )}
        </span>
      </div>

      {/* Phase B — the page, not a form field.
          A bordered box on a dark ground reads as an input to fill in. A writer
          spending six hours here is not filling in a field; they are working on
          a page. So: no border, no panel, no resize handle. The measure is held
          near 64 characters because that is where the eye finds the next line
          without hunting, and the type is set for hours rather than for a
          screenshot. Espresso palette throughout — this extends the Soullab
          Press visual language rather than importing MAIA's navy. */}
      {/* The writing surface. Same measurements the textarea had — 38rem
          measure, centred, 40vh of tail so the last line is never pinned to
          the bottom edge — carried onto the wrapper rather than the field, so
          the swap changes the widget and nothing about how the page reads.
          `writing-surface` is kept: it opts out of the global FORM rules in
          globals.css, and dropping it here would be an untested claim about
          which of those rules reach a contenteditable.

          The 60vh belongs to the FIELD, not the wrapper. Held on the wrapper it
          made a blank page the writer could see, aim at, and click — and the
          click landed on this div, because the editable area was one line tall.
          Focus was reachable only through code. The blank page has to BE the
          field, not sit behind it. */}
      <div
        className="writing-surface"
        style={{
          maxWidth: '38rem',
          margin: '0 auto',
          padding: '0 0 40vh',
        }}
      >
        <WriterField
          ref={fieldRef}
          value={content}
          onChange={onChange}
          onSelectionChange={persistPositionSoon}
          onCaretTouched={() => {
            caretTouchedRef.current = true;
          }}
          fontFamily={SERIF}
          fontSize="19px"
          caretColor="#C9A227"
          ariaLabel="Working draft"
          minHeight="60vh"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !checkpointing) void checkpoint();
          }}
          placeholder="Name this checkpoint (optional)"
          aria-label="Checkpoint note"
          className="press-field flex-1 min-w-[12rem] bg-transparent border-b border-[#4A4238] py-2 text-[14px] outline-none placeholder:opacity-40"
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
                        /* W-4: restore is the only path back to a checkpoint.
                           It was opacity-40 + hover-only — invisible on touch,
                           exactly when a writer most needs it. */
                        <button
                          onClick={() => {
                            setRestoreConfirm(r.revisionNumber);
                            setRestoreError(false);
                          }}
                          aria-label={`Restore checkpoint ${r.revisionNumber}${r.note ? `: ${r.note}` : ''}`}
                          className="text-[12px] opacity-80 underline underline-offset-4 min-h-[44px] px-2 -mx-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
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
