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

type Phase = 'loading' | 'ready' | 'no-source' | 'unauthorized' | 'error' | 'conflict';

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
  onMeta?: (meta: { updatedAt: string | null; revisionCount: number | null }) => void;
  onCheckpointed?: () => void;
  /** The member's own heading lines, for the navigator. */
  onHeadings?: (headings: Heading[]) => void;
}

const WritingSurface = forwardRef<WritingSurfaceHandle, WritingSurfaceProps>(
  function WritingSurface({ manuscriptId, head, onMeta, onCheckpointed, onHeadings }, ref) {
    const [phase, setPhase] = useState<Phase>('loading');
    const [content, setContent] = useState('');
    const [saveState, setSaveState] = useState<SaverState>('idle');
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const [keeping, setKeeping] = useState(false);
    const [kept, setKept] = useState(false);
    const [surface, setSurface] = useState<SurfaceId>('warm');

    const saverRef = useRef<DraftSaver | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const baseRef = useRef(1);
    const contentRef = useRef('');
    const fieldRef = useRef<HTMLTextAreaElement | null>(null);
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
    const lastHeightRef = useRef(0);
    const autosize = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const el = fieldRef.current;
        if (!el) return;
        const prev = el.style.height;
        el.style.height = 'auto';
        const next = el.scrollHeight;
        if (next === lastHeightRef.current && prev) {
          el.style.height = prev;
          return;
        }
        lastHeightRef.current = next;
        el.style.height = `${next}px`;
      });
    };
    useEffect(() => {
      autosize();
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      };
    }, [content, phase]);

    useEffect(() => {
      setSurface(loadSurfaceChoice(manuscriptId));
    }, [manuscriptId]);

    useImperativeHandle(ref, () => ({
      jumpTo(offset: number) {
        const el = fieldRef.current;
        const scroller = el?.closest('main');
        const len = contentRef.current.length || 1;
        if (!el || !scroller) return;
        /* Measure in the scroller's own content coordinates — offsetTop is
           relative to the nearest positioned ancestor, which is not the
           easel, and silently produced a no-op scroll. Landing is an
           estimate by proportion of characters (uniform flow); the member's
           heading is what they aimed at, so a near miss still arrives. */
        const top =
          el.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top +
          scroller.scrollTop;
        const target = top + (offset / len) * el.scrollHeight;
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
            cbRef.current.onMeta?.({
              updatedAt: meta.updatedAt,
              revisionCount: meta.revisionCount,
            });
          },
          onConflict: () => {
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
        cbRef.current.onHeadings?.(extractHeadings(r.content));
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
          cbRef.current.onHeadings?.(extractHeadings(value));
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
            ~{pageEstimate(content.length)} page{pageEstimate(content.length) === 1 ? '' : 's'}
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
          <textarea
            ref={fieldRef}
            value={content}
            onChange={(e) => edit(e.target.value)}
            aria-label="Working draft"
            rows={1}
            className="w-full bg-transparent outline-none resize-none overflow-hidden text-[16.5px] leading-[1.9]"
            style={{ fontFamily: SERIF, color: s.ink, caretColor: s.caret }}
          />
        </div>
      </div>
    );
  },
);

export default WritingSurface;
