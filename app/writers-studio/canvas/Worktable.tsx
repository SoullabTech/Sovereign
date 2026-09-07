'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { countDraftWords } from '@/lib/writersStudio/draftWords';
import { PRESS, SERIF } from '../pressTheme';
import {
  AUTOSAVE_DELAY_MS,
  applySectionEdit,
  beginDraft,
  createDraftSaver,
  createExitGuard,
  flattenDraftSections,
  formatWhen,
  loadDraft,
  newIdempotencyKey,
  pageEstimate,
  putDraft,
  putDraftSections,
  type DraftRepresentation,
  type DraftSaver,
  type DraftSection,
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

type Phase = 'loading' | 'ready' | 'no-source' | 'unauthorized' | 'error' | 'conflict' | 'refused' | 'unreadable';

/**
 * What the writer is editing, in the shape the draft actually has.
 *
 * ⛔ ONE CONTINUOUS PAGE IS THE EXPERIENCE, NOT THE DATA MODEL. A
 * section-addressable draft is held as real section nodes carrying the server's
 * own identities. The alternative — one field plus an invisible offset ledger —
 * was rejected by name: the ledger becomes a second fallible claim about the
 * same text, and when it is wrong a durable identity moves silently.
 *
 * The worktable still LOOKS like one page. The nodes carry no card, no border,
 * no gap and no label; they are where the characters live, not a visible
 * decomposition of the writer's book.
 */
type Editable =
  | { addressable: false; content: string }
  | { addressable: true; sections: DraftSection[] };

/** The whole draft as text — for the page count only. */
const editableText = (e: Editable): string =>
  e.addressable ? flattenDraftSections(e.sections) : e.content;

/** The value the save lane carries: the section array, or the whole string. */
const editablePayload = (e: Editable): DraftSection[] | string =>
  e.addressable ? e.sections : e.content;

const editableFrom = (r: DraftRepresentation): Editable =>
  r.sectionAddressable && r.sections
    ? { addressable: true, sections: r.sections }
    : { addressable: false, content: r.content };

interface WorktableProps {
  manuscriptId: string;
  /** Authored draft facts for the room's orientation line. Facts only.
     `words` is REQUIRED: the consumer renders it directly, and an emitter
     that omits it puts `undefined` on the page rather than a number. */
  onMeta?: (meta: {
    updatedAt: string | null;
    revisionCount: number | null;
    words: number;
  }) => void;
  /** A version was kept; the History drawer re-reads. */
  onCheckpointed?: () => void;
  /**
   * NAV-03 — the parent's write authority for this Work is out of date.
   *
   * The name is the meaning: NOT "a draft was created here", but "read again".
   * An earlier draft of this said the callback fires only on a creation, on the
   * reasoning that `exists` means someone else got there first and the parent
   * "is not stale on our account". That was wrong. Staleness is not a question
   * of authorship — the parent read `no_draft`, a draft now exists, and its
   * answer is obsolete no matter which tab created it. A second tab reaching
   * `exists` and then loading the draft successfully is PROOF the parent's
   * earlier answer is stale, not evidence against it.
   *
   * Carries nothing. The draft is section-addressable (`section_addressable_at`
   * is stamped at creation), so the parent should now mount a different engine
   * — but deciding that is the parent's job. Passing the draft up would let
   * this room adjudicate which surface wins, and the point of the write-state
   * resolver is that the SERVER decides and the parent obeys.
   *
   * Without it, a session renders "not yet navigable" over a Work the server
   * already calls section_aware, and only a manual reload fixes it — observed
   * in production 2026-09-06.
   */
  onWriteAuthorityChanged?: () => void;
}

export default function Worktable({ manuscriptId, onMeta, onCheckpointed, onWriteAuthorityChanged }: WorktableProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [editable, setEditable] = useState<Editable>({ addressable: false, content: '' });
  const [saveState, setSaveState] = useState<SaverState>('idle');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [keeping, setKeeping] = useState(false);
  const [kept, setKept] = useState(false);

  const saverRef = useRef<DraftSaver<DraftSection[] | string> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseRef = useRef(1);
  const editableRef = useRef<Editable>({ addressable: false, content: '' });
  /* One node per section, in document order. */
  const fieldsRef = useRef<(HTMLTextAreaElement | null)[]>([]);
  // Latest callbacks without re-running the mount effect (which would tear
  // down and re-create the saver mid-session).
  const cbRef = useRef({ onMeta, onCheckpointed });
  cbRef.current = { onMeta, onCheckpointed };

  /**
   * Grow the nodes to their content so the column reads as one page.
   *
   * `only` sizes the single node being typed in — the common case. Sizing every
   * node on every keystroke would re-lay-out the whole book, and a 209-page
   * manuscript would get visibly heavier as its author typed. Passing nothing
   * sizes all of them, which is what a load or a restore needs.
   */
  const rafRef = useRef<number | null>(null);
  const lastHeightsRef = useRef<number[]>([]);
  const autosize = (only?: number) => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const nodes = fieldsRef.current;
      const range = only === undefined ? nodes.map((_, i) => i) : [only];
      for (const i of range) {
        const el = nodes[i];
        if (!el) continue;
        const prev = el.style.height;
        el.style.height = 'auto';
        const next = el.scrollHeight;
        if (next === lastHeightsRef.current[i] && prev) {
          el.style.height = prev;
          continue;
        }
        lastHeightsRef.current[i] = next;
        el.style.height = `${next}px`;
      }
    });
  };
  /* Layout effect, not effect: sizing after paint would show the writer one
     collapsed line per section for a frame on every open. */
  useLayoutEffect(() => {
    autosize();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable, phase]);

  useEffect(() => {
    let cancelled = false;

    /* ONE LANE, TWO SHAPES. The single-flight sequencing guarantee is identical
       whether the draft is written by sections or by content, so it is not
       duplicated — the branch is only about WHICH write the server will accept
       for this draft. Sending content to a section-addressable draft is
       refused, not merged. */
    const saver = createDraftSaver<DraftSection[] | string>(
      (value) =>
        Array.isArray(value)
          ? putDraftSections(apiFetch, manuscriptId, {
              sections: value,
              baseRevisionId: baseRef.current,
              idempotencyKey: newIdempotencyKey(),
            })
          : putDraft(apiFetch, manuscriptId, {
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
          cbRef.current.onMeta?.({
            updatedAt: meta.updatedAt,
            revisionCount: meta.revisionCount,
            words: countDraftWords(editableText(editableRef.current)),
          });
        },
        onConflict: () => {
          // Not retryable (see workingDraftClient): the draft moved elsewhere,
          // or this client reused a key. Only the writer can decide.
          if (!cancelled) setPhase('conflict');
        },
        onRefused: () => {
          /* The server declined the SHAPE of the write: this surface's picture
             of the draft is wrong. Nothing was written and nothing was lost,
             but retrying would refuse identically, so the writer is told to
             reopen rather than left watching a save that cannot land. */
          if (!cancelled) setPhase('refused');
        },
      },
    );
    saverRef.current = saver;
    const guard = createExitGuard(saver, () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    });

    const settle = (r: DraftRepresentation & {
      revisionCount: number;
      revisionId: number;
      updatedAt?: string | null;
    }) => {
      const next = editableFrom(r);
      /* Drop node refs past the new section count. React clears the ref of an
         unmounted node, but the trailing SLOTS stay. */
      fieldsRef.current.length = next.addressable ? next.sections.length : 1;
      baseRef.current = r.revisionId;
      editableRef.current = next;
      if (cancelled) return;
      setEditable(next);
      setUpdatedAt(r.updatedAt ?? null);
      setPhase('ready');
      cbRef.current.onMeta?.({
        updatedAt: r.updatedAt ?? null,
        revisionCount: r.revisionCount,
        words: countDraftWords(editableText(next)),
      });
    };

    (async () => {
      const loaded = await loadDraft(apiFetch, manuscriptId);
      if (cancelled) return;
      if (loaded.kind === 'ok') return settle(loaded);
      if (loaded.kind === 'unauthorized') return setPhase('unauthorized');
      if (loaded.kind === 'error') return setPhase('error');
      /* ⛔ NOT a fall-through to beginDraft. The server claims section
         authority and its section state could not be established: the draft
         EXISTS, so beginning would answer 'exists' and loop, and nothing here
         may guess at the boundaries in the meantime. */
      if (loaded.kind === 'unreadable') return setPhase('unreadable');
      // 'none' — first entry for an imported book: found the draft on its
      // Source, verbatim. (A blank page creates its draft at birth.)
      const begun = await beginDraft(apiFetch, manuscriptId);
      if (cancelled) return;
      /* Both paths below end with a draft the parent has not seen. Notified
         after settle() so this room is coherent even if the parent unmounts it
         on the next tick. No loop is possible: this initialisation runs once
         per mount, and the parent's response is a read. */
      if (begun.kind === 'ok') {
        settle(begun);
        onWriteAuthorityChanged?.();
        return;
      }
      if (begun.kind === 'exists') {
        /* Another session created it between the parent's read and ours. The
           parent is stale for exactly the same reason it would be had we
           created it, so this must notify too — otherwise the second tab
           reproduces the very defect NAV-03 repairs. */
        const again = await loadDraft(apiFetch, manuscriptId);
        if (cancelled) return;
        if (again.kind === 'ok') {
          settle(again);
          onWriteAuthorityChanged?.();
          return;
        }
        if (again.kind === 'unreadable') return setPhase('unreadable');
        return setPhase('error');
      }
      if (begun.kind === 'unreadable') return setPhase('unreadable');
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

  /**
   * A keystroke lands in exactly one place.
   *
   * On a section-addressable draft that place is named by the SECTION'S OWN ID,
   * not by an offset — so nothing has to work out afterwards which boundary the
   * change fell inside. `sectionId` null means the draft is not addressable and
   * the whole string is the writable truth.
   */
  const edit = (sectionId: string | null, value: string) => {
    const prev = editableRef.current;
    const next: Editable =
      sectionId === null
        ? { addressable: false, content: value }
        : prev.addressable
          /* An id this draft does not own changes nothing: the client has no
             authority to bring a boundary into existence. */
          ? { addressable: true, sections: applySectionEdit(prev.sections, sectionId, value) }
          : prev;
    if (next === prev) return;
    editableRef.current = next;
    setEditable(next);
    setKept(false);
    const saver = saverRef.current;
    if (!saver) return;
    saver.queue(editablePayload(next));
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
      const current = editableRef.current;
      const value = editablePayload(current);
      const res = current.addressable
        ? await putDraftSections(apiFetch, manuscriptId, {
            sections: current.sections,
            checkpoint: true,
            baseRevisionId: baseRef.current,
            idempotencyKey: newIdempotencyKey(),
          })
        : await putDraft(apiFetch, manuscriptId, {
            content: current.content,
            checkpoint: true,
            baseRevisionId: baseRef.current,
            idempotencyKey: newIdempotencyKey(),
          });
      if (res.kind === 'ok') {
        if (res.revisionId !== null) baseRef.current = res.revisionId;
        setUpdatedAt(res.updatedAt);
        setKept(true);
        cbRef.current.onMeta?.({
          updatedAt: res.updatedAt,
          revisionCount: res.revisionCount,
          words: countDraftWords(editableText(current)),
        });
        cbRef.current.onCheckpointed?.();
        saver.endExclusive({ persisted: value });
      } else if (res.kind === 'conflict') {
        saver.endExclusive({ flushPending: false });
        setPhase('conflict');
      } else if (res.kind === 'refused') {
        saver.endExclusive({ flushPending: false });
        setPhase('refused');
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
  if (phase === 'unreadable') {
    return (
      <div className="max-w-md">
        <p className="text-[15px] opacity-80 leading-relaxed mb-3">
          This draft could not be opened safely.
        </p>
        <p className="text-[14px] opacity-55 leading-relaxed">
          Your manuscript is arranged in sections, and the worktable could not read that
          arrangement — so it will not offer to write over it. Nothing is lost and nothing was
          changed. Reopen the room to try again.
        </p>
      </div>
    );
  }

  if (phase === 'refused') {
    return (
      <div className="max-w-md">
        <p className="text-[15px] opacity-80 leading-relaxed mb-3">
          This worktable and the draft disagree about how the manuscript is arranged.
        </p>
        <p className="text-[14px] opacity-55 leading-relaxed">
          Nothing was written and nothing was lost. Reopen the room to continue from the
          manuscript as it stands.
        </p>
      </div>
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
        : saveState === 'unauthorized'
          ? 'signed out — nothing saved since you were'
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
          ~{pageEstimate(editableText(editable).length)} page
          {pageEstimate(editableText(editable).length) === 1 ? '' : 's'}
        </span>
        {/* W-4: a save that FAILED is not a dim marginal fact. Everything
            else on this line stays quiet; this does not. */}
        <span
          className={
            saveState === 'error' || saveState === 'unauthorized' ? 'opacity-100' : 'opacity-40'
          }
          style={
            saveState === 'error' || saveState === 'unauthorized'
              ? { color: PRESS.accent }
              : undefined
          }
          role="status"
          aria-live="polite"
        >
          {status}
        </span>
        {saveState === 'unauthorized' && (
          /* The session ended under a writer who is still writing. The words
             on the table are still queued, so the one thing this must not do
             is take them off the screen: signing in opens in a NEW tab, and
             the draft stays exactly where it is until they come back and
             save it. */
          <>
            <a
              href="/signin"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 opacity-80 hover:opacity-100"
            >
              sign in (opens a new tab)
            </a>
            <button
              onClick={() => saverRef.current?.flush()}
              className="underline underline-offset-4 opacity-60 hover:opacity-90"
            >
              then save
            </button>
          </>
        )}
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
      {/* THE WORKTABLE IS ONE PAGE. On a section-addressable draft the writer's
          characters live in one node per section — real client state carrying
          the server's own identities, which is what lets a save say WHICH
          boundary changed without anything having to work it out afterwards.

          None of that is drawn. No card, no border, no gap, no label, no rule
          between them: the nodes are transparent and share the page's type, so
          the surface reads exactly as it did as a single field. The writer is
          working on a book, not filling in a form with a row per chapter.

          ⛔ Boundaries do not move here. Merging two sections with a backspace,
          or splitting one with a return, are topology commands this slice does
          not implement — so they do not happen rather than happening
          approximately. The characters within a section are entirely the
          writer's.

          The nodes size to their own content and the COLUMN scrolls, so the
          page grows continuously instead of each section owning a scrollbar. */}
      {editable.addressable ? (
        <div className="flex-1 w-full overflow-y-auto">
          {editable.sections.map((sec, i) => (
            <textarea
              key={sec.id}
              ref={(el) => { fieldsRef.current[i] = el; }}
              value={sec.text}
              onChange={(e) => { edit(sec.id, e.target.value); autosize(i); }}
              aria-label={i === 0 ? 'Working draft' : undefined}
              rows={1}
              className="block w-full bg-transparent outline-none resize-none overflow-hidden text-[17px] leading-[1.8] p-0 m-0 border-0"
              style={{ fontFamily: SERIF, color: PRESS.text, caretColor: PRESS.accent }}
            />
          ))}
        </div>
      ) : (
        <textarea
          ref={(el) => { fieldsRef.current[0] = el; }}
          value={editable.content}
          onChange={(e) => edit(null, e.target.value)}
          aria-label="Working draft"
          className="flex-1 w-full bg-transparent outline-none resize-none text-[17px] leading-[1.8]"
          style={{ fontFamily: SERIF, color: PRESS.text, caretColor: PRESS.accent }}
        />
      )}
    </div>
  );
}
