'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react';
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
  sectionIndexAtOffset,
  type DraftRepresentation,
  type DraftSaver,
  type DraftSection,
  type SaverState,
} from '../../press/manuscript/workingDraftClient';

/**
 * The writing surface — the work at the center of the AIN Canvas, in its
 * Writer deployment.
 *
 * The manuscript lives on a sheet with physical weight (the Book Canvas
 * page grammar at writing proportions): one auto-growing surface, the
 * easel's single scroll, a reading measure, a shadow that makes it a thing
 * on a desk rather than a region in an app. Around it, only margin
 * activity: save facts, Keep a version, and the Writing Surface papers.
 *
 * Save behavior is byte-equivalent to the walked slice — the same
 * workingDraftClient single-flight autosave, exit guard, exclusive
 * checkpoint lane, terminal-and-honest conflict. The layout was furniture;
 * this loop is what survives.
 *
 * Versioning is a consequence of writing: quietly available beside the
 * words — NEVER a timed prompt or a system nudge.
 */

type Phase = 'loading' | 'ready' | 'no-source' | 'unauthorized' | 'error' | 'conflict' | 'refused' | 'unreadable';

/**
 * What the writer is editing, in the shape the draft actually has.
 *
 * ⛔ ONE CONTINUOUS PAGE IS THE EXPERIENCE, NOT THE DATA MODEL. A
 * section-addressable draft is held as real section nodes with server-minted
 * identities. The alternative — one field plus an invisible offset ledger — was
 * rejected by name: the ledger becomes a second fallible claim about the same
 * text, and when it is wrong a durable identity moves silently.
 *
 * The sheet still LOOKS like one page. Section nodes carry no card, no border,
 * no gap and no label; they are where the characters live, not a visible
 * decomposition of the writer's book.
 */
type Editable =
  | { addressable: false; content: string }
  | { addressable: true; sections: DraftSection[] };

/** The whole draft as text — for page counts and heading extraction only. */
function editableText(e: Editable): string {
  return e.addressable ? flattenDraftSections(e.sections) : e.content;
}

/** The value the save lane carries: the section array, or the whole string. */
function editablePayload(e: Editable): DraftSection[] | string {
  return e.addressable ? e.sections : e.content;
}

function editableFrom(r: DraftRepresentation): Editable {
  return r.sectionAddressable && r.sections
    ? { addressable: true, sections: r.sections }
    : { addressable: false, content: r.content };
}

/** The writer's papers. The sheet and its ink change; the room never repaints. */
const WRITING_SURFACES = {
  warm: { label: 'Warm Canvas', bg: '#221B17', ink: PRESS.text, caret: PRESS.accent },
  ivory: { label: 'Ivory Paper', bg: '#f3eddd', ink: '#2a2418', caret: '#8a6d1f' },
  white: { label: 'White Paper', bg: '#FAFAF7', ink: '#141414', caret: '#8a6d1f' },
  midnight: { label: 'Midnight', bg: '#0E1114', ink: '#C9CCD1', caret: PRESS.accent },
} as const;
type SurfaceId = keyof typeof WRITING_SURFACES;

const surfaceKey = (manuscriptId: string) => `writing_surface:${manuscriptId}`;
function loadSurfaceChoice(manuscriptId: string): SurfaceId {
  if (typeof window === 'undefined') return 'warm';
  const v =
    localStorage.getItem(surfaceKey(manuscriptId)) ?? localStorage.getItem('writing_surface');
  return v && v in WRITING_SURFACES ? (v as SurfaceId) : 'warm';
}

export interface Heading {
  text: string;
  offset: number;
  /**
   * The FORM the member's own line took — never an inferred hierarchy. A
   * line they marked with `#` is marked; a line that names a chapter is a
   * chapter; a line they set in capitals is capitals. The navigator gives
   * these three quiet weights so the eye can rest, but the distinctions are
   * the writer's own characters, read back.
   */
  kind: 'marked' | 'chapter' | 'caps';
  /** Depth of the member's own `#` marking (1–3), else null. */
  depth: number | null;
}

/**
 * Mechanical listing of the member's own heading lines — the same grammar
 * the import segmenter uses (markdown #, "Chapter N", ALL-CAPS). Display of
 * their characters, never inference of their structure.
 */
function extractHeadings(content: string): Heading[] {
  const out: Heading[] = [];
  const marked = /^(#{1,3})\s+(.+)$/;
  const chapter = /^[Cc]hapter\s+\w+.*$/;
  const caps = /^[A-Z][A-Z0-9 ,'&\-—:]{3,80}$/;
  let offset = 0;
  for (const line of content.split('\n')) {
    const raw = line.trim();
    if (raw && raw.length <= 100) {
      const m = raw.match(marked);
      if (m) {
        out.push({ text: m[2], offset, kind: 'marked', depth: m[1].length });
      } else if (chapter.test(raw)) {
        out.push({ text: raw, offset, kind: 'chapter', depth: null });
      } else if (caps.test(raw)) {
        out.push({ text: raw, offset, kind: 'caps', depth: null });
      }
    }
    offset += line.length + 1;
  }
  return out;
}

export interface WritingSurfaceHandle {
  /** Approximate landing by character offset (uniform-flow estimate). */
  jumpTo(offset: number): void;
}

interface WritingSurfaceProps {
  manuscriptId: string;
  /** The quiet head of the work, rendered ON the sheet in its ink. */
  head?: ReactNode;
  /** `words` is REQUIRED — see lib/writersStudio/draftWords.ts. */
  onMeta?: (meta: {
    updatedAt: string | null;
    revisionCount: number | null;
    words: number;
  }) => void;
  onCheckpointed?: () => void;
  /** The member's own heading lines, for the navigator. */
  onHeadings?: (headings: Heading[]) => void;
}

const WritingSurface = forwardRef<WritingSurfaceHandle, WritingSurfaceProps>(
  function WritingSurface({ manuscriptId, head, onMeta, onCheckpointed, onHeadings }, ref) {
    const [phase, setPhase] = useState<Phase>('loading');
    const [editable, setEditable] = useState<Editable>({ addressable: false, content: '' });
    const [saveState, setSaveState] = useState<SaverState>('idle');
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const [keeping, setKeeping] = useState(false);
    const [kept, setKept] = useState(false);
    const [surface, setSurface] = useState<SurfaceId>('warm');

    const saverRef = useRef<DraftSaver<DraftSection[] | string> | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const baseRef = useRef(1);
    const editableRef = useRef<Editable>({ addressable: false, content: '' });
    /* One node per section, in document order. The first is also the anchor the
       navigator scrolls from on an unconverted draft. */
    const fieldsRef = useRef<(HTMLTextAreaElement | null)[]>([]);
    const cbRef = useRef({ onMeta, onCheckpointed, onHeadings });
    cbRef.current = { onMeta, onCheckpointed, onHeadings };

    /**
     * One scroll: the field grows; the easel (the shell's <main>) scrolls.
     *
     * Measured against the founder's own 209-page book (~380,000 chars):
     * setting height to 'auto' and reading scrollHeight forces a full layout
     * of an enormous element, and doing it inside render meant once per
     * keystroke — the writer would feel their own book getting heavier as
     * they typed. Batched to one measurement per animation frame, and the
     * write is skipped when the height has not actually changed (the common
     * case: typing within a line).
     */
    const rafRef = useRef<number | null>(null);
    const lastHeightsRef = useRef<number[]>([]);
    /**
     * Grow the nodes to their content so the sheet reads as one page.
     *
     * `only` resizes the single node the writer is typing in — the common case.
     * Sizing every node on every keystroke would re-lay-out the whole book, and
     * a 209-page manuscript would get visibly heavier as they typed. Passing
     * nothing sizes all of them, which is what a load or a restore needs.
     */
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
    useEffect(() => {
      autosize();
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      };
    }, [editable, phase]);

    useEffect(() => {
      setSurface(loadSurfaceChoice(manuscriptId));
    }, [manuscriptId]);

    useImperativeHandle(ref, () => ({
      jumpTo(offset: number) {
        const e = editableRef.current;
        /* On a section-addressable draft the landing is EXACT to the section
           and estimated only within it — a real improvement over estimating
           across the whole book, and it comes from the identities the server
           gave us rather than from any offset ledger we keep. */
        let index = 0;
        let local = offset;
        if (e.addressable) {
          index = sectionIndexAtOffset(e.sections, offset);
          if (index < 0) return;
          for (let i = 0; i < index; i += 1) local -= e.sections[i].text.length;
        }
        const el = fieldsRef.current[index];
        const scroller = el?.closest('main');
        if (!el || !scroller) return;
        const len = (e.addressable ? e.sections[index].text.length : e.content.length) || 1;
        /* Measure in the scroller's own content coordinates — offsetTop is
           relative to the nearest positioned ancestor, which is not the
           easel, and silently produced a no-op scroll. Landing is an
           estimate by proportion of characters (uniform flow); the member's
           heading is what they aimed at, so a near miss still arrives. */
        const top =
          el.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top +
          scroller.scrollTop;
        const target = top + (Math.max(0, local) / len) * el.scrollHeight;
        scroller.scrollTo({ top: Math.max(0, target - 120), behavior: 'smooth' });
      },
    }));

    const chooseSurface = (s: SurfaceId) => {
      setSurface(s);
      try {
        // Member-authored preference: this manuscript, and the new default.
        localStorage.setItem(surfaceKey(manuscriptId), s);
        localStorage.setItem('writing_surface', s);
      } catch {
        /* a comfort, never a failure */
      }
    };

    useEffect(() => {
      let cancelled = false;

      /* ONE LANE, TWO SHAPES. The single-flight sequencing guarantee is the
         same whether the draft is written by sections or by content, so it is
         not duplicated — the branch is only about WHICH write the server will
         accept for this draft. Sending content to a section-addressable draft
         is refused, not merged. */
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
            if (!cancelled) setPhase('conflict');
          },
          onRefused: () => {
            /* The server declined the SHAPE of the write: this surface's
               picture of the draft is wrong. Nothing was written and nothing
               was lost, but retrying would refuse identically, so the writer is
               told to reopen rather than left watching a save that cannot
               land. */
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
        /* Drop node refs and cached heights past the new section count. React
           clears the ref of an unmounted node, but the trailing SLOTS stay, and
           a stale height would then be compared against a different section. */
        const count = next.addressable ? next.sections.length : 1;
        fieldsRef.current.length = count;
        lastHeightsRef.current.length = count;
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
        cbRef.current.onHeadings?.(extractHeadings(editableText(next)));
      };

      (async () => {
        const loaded = await loadDraft(apiFetch, manuscriptId);
        if (cancelled) return;
        if (loaded.kind === 'ok') return settle(loaded);
        if (loaded.kind === 'unauthorized') return setPhase('unauthorized');
        if (loaded.kind === 'error') return setPhase('error');
        const begun = await beginDraft(apiFetch, manuscriptId);
        if (cancelled) return;
        if (begun.kind === 'ok') return settle(begun);
        if (begun.kind === 'exists') {
          const again = await loadDraft(apiFetch, manuscriptId);
          if (cancelled) return;
          if (again.kind === 'ok') return settle(again);
          return setPhase('error');
        }
        if (begun.kind === 'unreadable') return setPhase('unreadable');
      if (begun.kind === 'no-sections') return setPhase('no-source');
        if (begun.kind === 'unauthorized') return setPhase('unauthorized');
        setPhase('error');
      })();

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
     * On a section-addressable draft that place is named by the SECTION'S OWN
     * ID, not by an offset — so nothing has to work out afterwards which
     * boundary the change fell inside. `sectionId` null means the draft is not
     * addressable and the whole string is the writable truth.
     */
    const edit = (sectionId: string | null, value: string) => {
      const prev = editableRef.current;
      const next: Editable =
        sectionId === null
          ? { addressable: false, content: value }
          : prev.addressable
            /* An id this draft does not own changes nothing. The client has no
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
          cbRef.current.onHeadings?.(extractHeadings(editableText(current)));
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

    if (phase === 'unreadable') {
      return (
        <div className="w-full max-w-md pt-20">
          <p className="text-[15px] opacity-80 leading-relaxed mb-3">
            This draft could not be opened safely.
          </p>
          <p className="text-[14px] opacity-55 leading-relaxed">
            Your manuscript is arranged in sections, and the sheet could not read that
            arrangement — so it will not offer to write over it. Nothing is lost and nothing was
            changed. Reopen the room to try again.
          </p>
        </div>
      );
    }
    if (phase === 'refused') {
      return (
        <div className="w-full max-w-md pt-20">
          <p className="text-[15px] opacity-80 leading-relaxed mb-3">
            This surface and the draft disagree about how the manuscript is arranged.
          </p>
          <p className="text-[14px] opacity-55 leading-relaxed">
            Nothing was written and nothing was lost. Reopen the room to continue from the
            manuscript as it stands.
          </p>
        </div>
      );
    }
    if (phase !== 'ready' && phase !== 'conflict') {
      return (
        <div className="w-full max-w-md pt-20 text-[15px] leading-relaxed opacity-70">
          {phase === 'loading' && <p className="opacity-60">opening the draft…</p>}
          {phase === 'unauthorized' && (
            <p>
              The Canvas holds your own words, so it opens only to you.{' '}
              <a href="/signin" className="underline underline-offset-4">
                Sign in
              </a>{' '}
              to continue.
            </p>
          )}
          {phase === 'no-source' && (
            <p>This manuscript has nothing to draft from yet. Nothing was changed.</p>
          )}
          {phase === 'error' && (
            <p>
              The draft could not be reached just now. Your work is not affected — please try
              again in a moment.
            </p>
          )}
        </div>
      );
    }
    if (phase === 'conflict') {
      return (
        <div className="w-full max-w-md pt-20">
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

    const s = WRITING_SURFACES[surface];
    const status =
      saveState === 'saving'
        ? 'saving…'
        : saveState === 'unsaved'
          ? '·'
          : saveState === 'unauthorized'
            ? 'signed out — nothing saved since you were'
            : saveState === 'error'
              ? "couldn't save"
              : updatedAt
                ? `saved · ${formatWhen(updatedAt)}`
                : 'saved';

    return (
      <div className="w-full max-w-[760px]">
        {/* Margin activity in room tone, above the sheet: the essential
            writing actions and nothing else. The rest of the toolbar waits
            for the founder's button-pass. */}
        <div
          /* The margin holds itself back until looked at — EXCEPT when a save
             has failed. CSS opacity compounds, so a bright child inside a 45%
             parent is still 45%: the lift has to happen here (W-4). */
          className={`flex items-center justify-end gap-3 text-[10.5px] mb-2 transition-opacity ${
            saveState === 'error' || saveState === 'unauthorized'
              ? 'opacity-100'
              : 'opacity-45 hover:opacity-95'
          }`}
          style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
        >
          <span>
            ~{pageEstimate(editableText(editable).length)} page
            {pageEstimate(editableText(editable).length) === 1 ? '' : 's'}
          </span>
          {/* W-4: a save that FAILED is not a dim marginal fact — this line
              is otherwise held at low opacity until hovered. */}
          <span
            role="status"
            aria-live="polite"
            style={
              saveState === 'error' || saveState === 'unauthorized'
                ? { color: PRESS.accent }
                : undefined
            }
          >
            {status}
          </span>
          {saveState === 'unauthorized' && (
            /* The session ended under a writer who is still writing. Their
               words are still queued, so signing in opens in a NEW tab — the
               sheet stays on screen until they come back and save it. */
            <>
              <a
                href="/signin"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                sign in (opens a new tab)
              </a>
              <button
                onClick={() => saverRef.current?.flush()}
                className="underline underline-offset-2"
              >
                then save
              </button>
            </>
          )}
          {saveState === 'error' && (
            <button
              onClick={() => saverRef.current?.flush()}
              className="underline underline-offset-2"
            >
              try again
            </button>
          )}
          {kept && <span style={{ color: PRESS.accent }}>version kept</span>}
          <button
            onClick={() => void keepVersion()}
            disabled={keeping}
            className="underline underline-offset-2 disabled:opacity-40"
          >
            {keeping ? 'keeping…' : 'Keep a version'}
          </button>
          <span className="flex items-center gap-1.5 ml-2" aria-label="Writing surface">
            {(Object.keys(WRITING_SURFACES) as SurfaceId[]).map((id) => (
              <button
                key={id}
                title={WRITING_SURFACES[id].label}
                aria-label={WRITING_SURFACES[id].label}
                aria-pressed={surface === id}
                onClick={() => chooseSurface(id)}
                className="w-3 h-3 rounded-full border transition-opacity"
                style={{
                  background:
                    id === 'warm'
                      ? 'linear-gradient(135deg,#221B17,#3a2f28)'
                      : WRITING_SURFACES[id].bg,
                  borderColor: surface === id ? PRESS.accent : 'currentColor',
                  opacity: surface === id ? 1 : 0.5,
                }}
              />
            ))}
          </span>
        </div>

        {/* The sheet: the manuscript with weight, on the easel. */}
        <div
          className="rounded-[2px] px-8 md:px-16 pt-12 pb-32 transition-colors duration-300"
          style={{
            background: s.bg,
            color: s.ink,
            boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          }}
        >
          {head}
          {/* THE SHEET IS ONE PAGE. On a section-addressable draft the writer's
              characters live in one node per section — real client state with
              the server's own identities, which is what makes a save able to
              say WHICH boundary changed without anything having to work it out
              afterwards.

              None of that is drawn. No card, no border, no gap, no label, no
              rule between them: the nodes are transparent and share the sheet's
              type, so the page reads exactly as it did as a single field. The
              writer is working on a book, not filling in a form with a row per
              chapter.

              ⛔ Boundaries do not move here. Merging two sections with a
              backspace, or splitting one with a return, are topology commands
              this slice does not implement — so they simply do not happen
              rather than happening approximately. The characters within a
              section are entirely the writer's. */}
          {editable.addressable ? (
            editable.sections.map((sec, i) => (
              <textarea
                key={sec.id}
                ref={(el) => { fieldsRef.current[i] = el; }}
                value={sec.text}
                onChange={(e) => { edit(sec.id, e.target.value); autosize(i); }}
                aria-label={i === 0 ? 'Working draft' : undefined}
                rows={1}
                className="block w-full bg-transparent outline-none resize-none overflow-hidden text-[16.5px] leading-[1.9] p-0 m-0 border-0"
                style={{ fontFamily: SERIF, color: s.ink, caretColor: s.caret }}
              />
            ))
          ) : (
            <textarea
              ref={(el) => { fieldsRef.current[0] = el; }}
              value={editable.content}
              onChange={(e) => { edit(null, e.target.value); autosize(0); }}
              aria-label="Working draft"
              rows={1}
              className="w-full bg-transparent outline-none resize-none overflow-hidden text-[16.5px] leading-[1.9]"
              style={{ fontFamily: SERIF, color: s.ink, caretColor: s.caret }}
            />
          )}
        </div>
      </div>
    );
  },
);

export default WritingSurface;
