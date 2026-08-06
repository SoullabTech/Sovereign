'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import CanvasShell, { type CanvasTheme } from '@/components/canvas/CanvasShell';
import { createCanvasRegistry, type CanvasContext } from '@/components/canvas/registry';
import { PRESS, SERIF } from '../pressTheme';
import { IMPORT_HREF } from '../studioMap';
import { UNTITLED_EXPRESSION } from '../shellIdentity';
import { useLivingWorks } from '../useLivingWorks';
import type { CurrentManuscript } from '../useCurrentManuscript';
import { formatWhen } from '../../press/manuscript/workingDraftClient';
import WritingSurface, { type Heading, type WritingSurfaceHandle } from './WritingSurface';

/**
 * Writer Canvas — the writing deployment of the AIN Canvas.
 *
 * REPLACEMENT, not iteration (founder directive + replacement plan,
 * 2026-08-05): the old panel layout — zone rows, drawer spine, drawer
 * asides, nested viewer — is deleted, not rearranged. What survives is the
 * relationship loop and its plumbing: manuscript identity, declare/belong,
 * autosave, keep-a-version, loading, the unite rule.
 *
 * This instance is deliberately SPARE. Navigator: the member's own heading
 * lines. Center: the manuscript with weight. Support: the Work register and
 * MAIA's one honest line. Toolbar: identity only. Every further control is
 * a founder decision after the shell is visible — the emptiness is the
 * shell's first test, not a gap.
 *
 * The unite rule is unchanged: the head names the Work ONLY on the member's
 * own declaration, and only when unambiguous.
 */

const WRITER_THEME: CanvasTheme = {
  chrome: '#211A16',
  voidBg: '#161110',
  border: '#372F28',
  text: PRESS.text,
  dim: 'rgba(243,237,228,0.5)',
  accent: PRESS.accent,
};

type ListPhase = 'loading' | 'ready' | 'none' | 'unauthorized' | 'error';

export default function WriterCanvasPage() {
  const { phase: worksPhase, works, reload: reloadWorks } = useLivingWorks();

  const [listPhase, setListPhase] = useState<ListPhase>('loading');
  const [manuscripts, setManuscripts] = useState<CurrentManuscript[]>([]);
  const [requested] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('m'),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/sovereign/manuscripts', { method: 'GET' });
        if (cancelled) return;
        if (res.status === 401) return setListPhase('unauthorized');
        if (!res.ok) return setListPhase('error');
        const data = await res.json();
        const list: CurrentManuscript[] = Array.isArray(data.manuscripts) ? data.manuscripts : [];
        if (cancelled) return;
        setManuscripts(list);
        setListPhase(list.length > 0 ? 'ready' : 'none');
      } catch {
        if (!cancelled) setListPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const manuscript =
    listPhase === 'ready'
      ? (manuscripts.find((m) => m.id === requested) ?? manuscripts[0] ?? null)
      : null;

  // United ONLY by the member's declaration, only when unambiguous.
  const owningWorks = manuscript
    ? works.filter((w) =>
        w.expressions.some(
          (e) => e.expressionType === 'manuscript' && e.expressionId === manuscript.id,
        ),
      )
    : [];
  const unitedWork = owningWorks.length === 1 ? owningWorks[0] : null;
  const manuscriptLabel = manuscript ? (manuscript.title ?? UNTITLED_EXPRESSION) : '';

  const [draftMeta, setDraftMeta] = useState<{
    updatedAt: string | null;
    revisionCount: number | null;
  } | null>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [declareBusy, setDeclareBusy] = useState(false);
  const surfaceRef = useRef<WritingSurfaceHandle | null>(null);

  const declare = async (workId: string) => {
    if (!manuscript || declareBusy) return;
    setDeclareBusy(true);
    try {
      const res = await apiFetch(`/api/sovereign/living-works/${workId}/expressions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expressionType: 'manuscript', expressionId: manuscript.id }),
      });
      if (res.ok) reloadWorks();
    } finally {
      setDeclareBusy(false);
    }
  };

  // ---- Signed out (before the shell — the room opens only to its member).
  if (listPhase === 'unauthorized') {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 text-center"
        style={{ background: WRITER_THEME.voidBg, color: WRITER_THEME.text, fontFamily: SERIF }}
      >
        <div className="max-w-sm">
          <p className="text-[13px] tracking-[0.25em] uppercase opacity-50 mb-3">Writer Canvas</p>
          <p className="text-[15px] leading-relaxed opacity-70">
            The Canvas holds your own words, so it opens only to you.{' '}
            <a href="/signin" className="underline underline-offset-4">
              Sign in
            </a>{' '}
            to enter.
          </p>
        </div>
      </div>
    );
  }

  // ── Toolbar: identity only. The button-pass is the founder's. ──────────
  const toolbar = (
    <div
      className="h-11 flex items-center gap-4 px-4"
      style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
    >
      <Link
        href="/writers-studio"
        className="text-[10.5px] tracking-[0.18em] uppercase opacity-45 hover:opacity-85"
      >
        ← Author Studio
      </Link>
      <span className="text-[10px] tracking-[0.25em] uppercase opacity-30">Writer Canvas</span>
      <span className="flex-1" />
      <span className="text-[12.5px] opacity-70" style={{ fontFamily: SERIF }}>
        {unitedWork ? (unitedWork.title ?? 'Your work') : manuscriptLabel}
      </span>
      {draftMeta && (
        <span className="text-[10.5px] italic" style={{ color: PRESS.accent, opacity: 0.8 }}>
          drafting{draftMeta.updatedAt ? ` · ${formatWhen(draftMeta.updatedAt)}` : ''}
        </span>
      )}
    </div>
  );

  // ── Navigator: the member's own heading lines; landing is approximate. ──
  const navigator = (
    <nav className="px-4 py-5" style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      {headings.length === 0 ? (
        <p className="text-[11.5px] leading-relaxed opacity-40" style={{ fontFamily: SERIF }}>
          No headings yet — your text is one continuous flow.
        </p>
      ) : (
        <ul className="space-y-0.5">
          {headings.map((h, i) => (
            <li key={`${h.offset}-${i}`}>
              <button
                onClick={() => surfaceRef.current?.jumpTo(h.offset)}
                className="w-full text-left text-[12px] leading-snug py-1 opacity-55 hover:opacity-100 truncate transition-opacity"
                style={{ fontFamily: SERIF }}
                title={h.text}
              >
                {h.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );

  // ── Support: the Work register and one honest line. Nothing else yet. ──
  const workPanel = (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      {unitedWork ? (
        <div>
          <p className="text-[13px]" style={{ fontFamily: SERIF }}>
            {unitedWork.title ?? 'Your work'}
          </p>
          {unitedWork.purpose && (
            <p
              className="text-[11.5px] italic leading-relaxed opacity-60 mt-1.5"
              style={{ fontFamily: SERIF }}
            >
              {unitedWork.purpose}
            </p>
          )}
          <p className="text-[10.5px] opacity-45 mt-2">
            {manuscriptLabel} — a form of this work, declared by you.
          </p>
        </div>
      ) : works.length > 0 && manuscript ? (
        <div className="space-y-2">
          <p className="text-[11px] leading-relaxed opacity-50">
            This manuscript is not yet part of a work. That is yours to say:
          </p>
          {works.map((w) => (
            <button
              key={w.id}
              disabled={declareBusy}
              onClick={() => void declare(w.id)}
              className="block w-full text-left text-[11.5px] leading-snug opacity-65 hover:opacity-100 underline underline-offset-2 disabled:opacity-30"
              style={{ fontFamily: SERIF }}
            >
              a form of “{w.title ?? 'your unnamed work'}”
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[11px] leading-relaxed opacity-50">
          No work is declared yet.{' '}
          <Link href="/writers-studio" className="underline underline-offset-2 opacity-90">
            The Studio Home
          </Link>{' '}
          is where a work begins.
        </p>
      )}
    </div>
  );

  /**
   * The deployment furnishes the rails through the extension contract — the
   * same path every future studio uses. Reflection declares itself relevant
   * only once a Work can carry context; until then it is absent, not empty.
   */
  const canvasContext: CanvasContext = {
    deployment: 'writer',
    workId: unitedWork?.id ?? null,
    objectId: manuscript?.id ?? null,
    mode: 'writing',
  };
  const registry = createCanvasRegistry()
    .registerPanel({
      id: 'writer.manuscript',
      label: 'Manuscript',
      region: 'navigator',
      order: 10,
      isRelevant: () => manuscript !== null,
      render: () => navigator,
    })
    .registerPanel({
      id: 'writer.work',
      label: 'Work',
      region: 'context',
      order: 10,
      render: () => workPanel,
    })
    .registerPanel({
      id: 'writer.reflection',
      label: 'Reflection',
      region: 'context',
      order: 20,
      // Absence over emptiness: no panel until the Work can carry context.
      isRelevant: (ctx) => ctx.workId !== null,
      render: () => (
        <p className="text-[11px] leading-relaxed opacity-45" style={{ fontFamily: SERIF }}>
          Reflection with MAIA will become available when this Work can carry its context.
        </p>
      ),
    });

  // The quiet head of the work, on the sheet, in the sheet's ink.
  const head = (
    <div className="mb-10">
      <p className="text-[20px]" style={{ fontFamily: SERIF }}>
        {unitedWork ? (unitedWork.title ?? 'Your work') : manuscriptLabel}
      </p>
      {unitedWork && (
        <p className="text-[12px] opacity-55 mt-1" style={{ fontFamily: SERIF }}>
          {manuscriptLabel}
        </p>
      )}
    </div>
  );

  return (
    <CanvasShell
      theme={WRITER_THEME}
      toolbar={toolbar}
      registry={registry}
      context={canvasContext}
    >
      {listPhase === 'loading' && (
        <p className="pt-20 text-[14px] opacity-40" style={{ fontFamily: SERIF }}>
          opening…
        </p>
      )}
      {listPhase === 'error' && (
        <p
          className="pt-20 max-w-md text-[15px] leading-relaxed opacity-70"
          style={{ fontFamily: SERIF }}
        >
          The Canvas could not be reached just now. Your work is not affected — please try again
          in a moment.
        </p>
      )}
      {listPhase === 'none' && (
        <div className="pt-20 max-w-md" style={{ fontFamily: SERIF }}>
          <p className="text-[16px] leading-relaxed opacity-75 mb-5">
            Nothing is on the canvas yet.
          </p>
          <p className="text-[14px] leading-relaxed opacity-55">
            Begin at the{' '}
            <Link href="/writers-studio" className="underline underline-offset-4 opacity-90">
              Studio Home
            </Link>{' '}
            — start writing, or{' '}
            <Link href={IMPORT_HREF} className="underline underline-offset-4 opacity-90">
              bring in existing writing
            </Link>
            .
          </p>
        </div>
      )}
      {manuscript && (
        <WritingSurface
          ref={surfaceRef}
          manuscriptId={manuscript.id}
          head={head}
          onMeta={setDraftMeta}
          onHeadings={setHeadings}
        />
      )}
    </CanvasShell>
  );
}
