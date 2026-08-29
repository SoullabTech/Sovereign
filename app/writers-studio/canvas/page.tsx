'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from '../pressTheme';
import {
  columnFlex,
  GOLD,
  GROUND,
  INK,
  MAIA_ACCENT,
  RADIUS,
  RULE,
  SPACE,
} from '../studioTheme';
import { StudioPanel } from '../studio/StudioPanel';
import { StudioSurface } from '../studio/StudioSurface';
import { StudioRail } from '../studio/StudioRail';
import { StudioText, typeStyle } from '../studio/StudioType';
import { IMPORT_HREF, SOURCE_HREF } from '../studioMap';
import { UNTITLED_EXPRESSION } from '../shellIdentity';
import { arrivalWork, useLivingWorks } from '../useLivingWorks';
import type { CurrentManuscript } from '../useCurrentManuscript';
import {
  formatWhen,
  loadRevisions,
  pageEstimate,
  type RevisionSummary,
} from '../../press/manuscript/workingDraftClient';
import Worktable from './Worktable';
import WorkDrawer from './WorkDrawer';
import MaterialsDrawer from './MaterialsDrawer';

/**
 * Writer Canvas — the room. v0.1 of the environment all Writer Studio entry
 * paths lead into.
 *
 * Design authority: docs/design/author-studio/WRITER_CANVAS_ROOM_MAP_2026-08-05
 * .md as amended by the persona walk (A1–A6), built inside the boundary of
 * WRITER_CANVAS_V01_IMPLEMENTATION_BOUNDARY_2026-08-05.md — the room structure
 * with ONE real instrument (the Worktable writing surface). Everything else is
 * folded or absent, honestly.
 *
 * Three zones (builder names; they never appear on the walls):
 *   Study Wall — folded drawer spine on the left: Work · Materials ·
 *                Structure (only when the import carried sections) · History.
 *   Worktable  — the center. The draft, mid-motion. See Worktable.tsx.
 *   Window     — MAIA's folded presence on the right. v0.1 opens to one honest
 *                sentence and nothing else: no reflection endpoint exists on
 *                this surface, and a beautiful empty panel would be worse than
 *                a folded one.
 *
 * What this room deliberately does NOT claim:
 *   · that the manuscript belongs to the Work. Nothing writes
 *     living_work_expressions yet — so the head of the room names the thing
 *     ACTUALLY on the table (the manuscript), and the declared Work lives in
 *     the Work drawer, explicitly unlinked. The v0.1 shape (Work as headline,
 *     manuscript beneath it) read as belonging the moment a member had both:
 *     the persona walk's novelist found her book headlined by an unrelated
 *     work. Display may not draw a containment the data does not hold.
 *   · which of several Works the member returned to (arrivalWork declines to
 *     guess; so does this room).
 *   · any inferred state. The orientation line is authored facts only: the
 *     draft exists, it was last touched at a time.
 *
 * ── WS2-03A: THE SHELL PROJECTION SEAM ─────────────────────────────────────
 *
 * This room now renders through the accepted WS2-02 visual system — the GROUND
 * ramp, the type roles, StudioPanel, and the honest StudioRail. That is the
 * whole of WS2-03A: the design system was intentionally unrouted, so the §0.2
 * instrument (which photographs /writers-studio/canvas) had nothing of it to
 * photograph, and WS2-02's visual witness could not be obtained. This seam
 * exists to make that witness possible, and stops there.
 *
 * WHAT IS PROJECTED: ramp, typography, panels, rail.
 *
 * WHAT IS NOT, and why: 04's column PROPORTIONS. The reference room has five
 * columns — rail, outline, field, MAIA, materials. This room has a different
 * real column set: a folded drawer spine showing one drawer at a time, and a
 * folded Window. Forcing the measured fractions onto it would mean building
 * Materials as a permanent right rail, which is WS2-03B and beyond. So the
 * capture can adjudicate ramp, typography, hierarchy, density and states —
 * and cannot yet adjudicate column proportion. That limit is real and is
 * reported rather than papered over.
 *
 * The rail is the MEMBER-FACING projection: StudioRail draws through
 * visibleDestinations, so it shows only what is built. It does not and must
 * not match 04's sixteen. The full canonical grammar stays in the fixture.
 */


type ListPhase = 'loading' | 'ready' | 'none' | 'unauthorized' | 'error';

/** Same rule as Studio Home: return by identity, never by position. */
const byIdentity = (href: string, manuscriptId: string) =>
  `${href}&m=${encodeURIComponent(manuscriptId)}`;

const WINDOW_SENTENCE =
  'Reflection with MAIA will become available when this Work can carry its context.';

export default function WriterCanvasPage() {
  const { phase: worksPhase, works, reload: reloadWorks } = useLivingWorks();
  const work = arrivalWork(worksPhase, works);

  const [listPhase, setListPhase] = useState<ListPhase>('loading');
  const [manuscripts, setManuscripts] = useState<CurrentManuscript[]>([]);
  // Read once, synchronously on the client, so the table never swaps its
  // manuscript after mounting (the exit guard would flush a draft mid-swap).
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

  /**
   * ── IDENTITY IS HONOURED OR REFUSED. NEVER SUBSTITUTED. ──────────────────
   *
   * This previously read `find(...) ?? manuscripts[0]`, and runtime showed what
   * that costs. A member asked for a3ae67fd — "Elemental Alchemy (KDP print)",
   * 174 sections, their own — and the room put a different, empty manuscript on
   * the table and said "the most recent of your 4 manuscripts is on the table".
   * The page looked fine. It was the wrong book. Nothing signalled it.
   *
   * That fallback is unremarkable until `?m=` names something. Once a producer
   * has named a manuscript, an unresolvable name is an identity FAILURE, and
   * turning it into plausible-looking wrong content is worse than an error,
   * because an error can be seen.
   *
   * So: named and found → that manuscript. Named and not found → nothing, and
   * the room says so. Not named at all → most recent, which substitutes no
   * identity because none was asserted.
   *
   * The root cause of why a valid owned id failed to resolve is still open in
   * the WS2-01 identity lane. This is the safety half, and it stands whatever
   * that investigation finds.
   */
  const manuscript =
    listPhase === 'ready'
      ? requested !== null
        ? (manuscripts.find((m) => m.id === requested) ?? null)
        : (manuscripts[0] ?? null)
      : null;

  /** Named a manuscript, and it is not among the member's own. */
  const identityRefused =
    listPhase === 'ready' && requested !== null && manuscript === null;

  /* Contextual panels. Open by default because 04 shows the room working, and
     dismissible because DESIGN-CONTRACT §2 refuses permanent furniture. What is
     dismissed can be called back from the lower band. */
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [maiaOpen, setMaiaOpen] = useState(true);
  const [materialsOpen, setMaterialsOpen] = useState(true);
  const [draftMeta, setDraftMeta] = useState<{
    updatedAt: string | null;
    revisionCount: number | null;
  } | null>(null);

  /* Versions live in the lower band now, not behind a drawer, so they are read
     whenever something is on the table and re-read after a kept version. */
  const [revisions, setRevisions] = useState<RevisionSummary[] | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  useEffect(() => {
    if (!manuscript) return;
    let cancelled = false;
    (async () => {
      const r = await loadRevisions(apiFetch, manuscript.id);
      if (!cancelled) setRevisions(r.kind === 'ok' ? r.revisions : null);
    })();
    return () => {
      cancelled = true;
    };
  }, [manuscript, historyKey]);

  // ---- Signed out ---------------------------------------------------------
  if (listPhase === 'unauthorized') {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 text-center"
        style={{ background: GROUND.base, color: INK.primary, fontFamily: SERIF }}
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

  // ── The unite rule (first slice, ruled 2026-08-05) ─────────────────────
  // The head of the room may unite the Work and the table ONLY on the
  // member's own declaration — a living_work_expressions row they created —
  // and only when it is unambiguous (exactly one work declares this
  // manuscript; expressions may belong to several works by design, and the
  // room does not guess between them). Without a declaration, v0.1-close
  // honesty stands: the manuscript heads the room, the Work stays in its
  // drawer, near but not claimed.
  const owningWorks = manuscript
    ? works.filter((w) =>
        w.expressions.some(
          (e) => e.expressionType === 'manuscript' && e.expressionId === manuscript.id
        )
      )
    : [];
  const unitedWork = owningWorks.length === 1 ? owningWorks[0] : null;
  const manuscriptLabel = manuscript ? (manuscript.title ?? UNTITLED_EXPRESSION) : '';

  const headline = unitedWork
    ? (unitedWork.title ?? 'Your work')
    : manuscript
      ? manuscriptLabel
      : work
        ? (work.title ?? 'Your work')
        : 'Writer Canvas';
  const headlineNamed = unitedWork
    ? unitedWork.title !== null
    : manuscript
      ? manuscript.title !== null
      : Boolean(work?.title);

  const typeStyleFor = () => typeStyle('navItem');

  /** Calling a dismissed panel back. Quiet — this is chrome, not an action. */
  const recallStyle = {
    ...typeStyle('metadata'),
    background: 'none',
    border: `1px solid ${RULE.soft}`,
    borderRadius: RADIUS.base,
    color: INK.quiet,
    cursor: 'pointer',
    padding: `${SPACE.tight}px ${SPACE.snug}px`,
  } as const;

  /* ── The five modes. WRITE is here; EXPLORE is Studio Home, which is real.
     The rest are not built, and are rendered as plainly unavailable rather
     than as links that would lie about where they go. ── */
  const MODES: { label: string; href?: string; current?: boolean }[] = [
    { label: 'Write', current: true },
    { label: 'Develop' },
    { label: 'Explore', href: '/writers-studio' },
    { label: 'Review' },
    { label: 'Publish' },
  ];

  const materialsWork = unitedWork ?? (works.length === 1 ? works[0] : null);
  const materialCount = materialsWork?.materials?.length ?? 0;

  const bandLabel = (text: string) => (
    <StudioText role="panelLabel" style={{ marginBottom: SPACE.snug }}>
      {text}
    </StudioText>
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: GROUND.base, color: INK.primary, fontFamily: SERIF, height: '100vh' }}
    >
      {/* ── Header: the place, the work, the modes. ── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACE.roomy,
          padding: `${SPACE.base}px ${SPACE.roomy}px`,
          borderBottom: `1px solid ${RULE.soft}`,
          background: GROUND.raised,
          flexShrink: 0,
        }}
      >
        <Link href="/writers-studio" style={{ textDecoration: 'none' }}>
          <StudioText role="bandLabel">Soullab · Writer&rsquo;s Studio</StudioText>
        </Link>

        <div style={{ minWidth: 0 }}>
          <StudioText
            role="workIdentity"
            as="h1"
            style={{ opacity: headlineNamed ? 1 : 0.75 }}
          >
            {headline}
          </StudioText>
          {unitedWork?.purpose && (
            <StudioText role="quiet" style={{ fontStyle: 'italic' }}>
              {unitedWork.purpose}
            </StudioText>
          )}
        </div>

        <nav style={{ display: 'flex', gap: SPACE.tight, marginLeft: SPACE.roomy }}>
          {MODES.map((m) => {
            const style = {
              ...typeStyleFor(),
              color: m.current ? INK.primary : m.href ? INK.secondary : INK.quiet,
              padding: `${SPACE.tight}px ${SPACE.base}px`,
              borderRadius: RADIUS.pill,
              textDecoration: 'none',
              ...(m.current
                ? { background: GROUND.active, boxShadow: `inset 0 -2px 0 ${GOLD.DEFAULT}` }
                : {}),
            } as const;
            return m.href && !m.current ? (
              <Link key={m.label} href={m.href} style={style}>
                {m.label}
              </Link>
            ) : (
              <span
                key={m.label}
                style={style}
                {...(m.current ? {} : { title: 'Not yet built' })}
              >
                {m.label}
              </span>
            );
          })}
        </nav>

        <span style={{ flex: 1 }} />
        {draftMeta?.updatedAt && (
          <StudioText role="metadata">saved {formatWhen(draftMeta.updatedAt)}</StudioText>
        )}
      </header>

      {/* ── The room: measured columns. ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: SPACE.base, padding: SPACE.base }}>
        <StudioRail
          hasManuscript={Boolean(manuscript)}
          style={{ ...columnFlex('rail'), borderRadius: RADIUS.panel }}
        />

        {/* Manuscript — the outline, and the Work beneath it. */}
        {outlineOpen && (
          <StudioPanel
            role="manuscript-outline"
            label="Manuscript"
            onDismiss={() => setOutlineOpen(false)}
            style={columnFlex('outlinePanel')}
          >
            {manuscript ? (
              <>
                <StudioText role="metadata" style={{ marginBottom: SPACE.base }}>
                  {manuscript.sectionCount > 0
                    ? `${manuscript.sectionCount} sections · ${pageEstimate(manuscript.charCount)}`
                    : pageEstimate(manuscript.charCount)}
                </StudioText>
                {manuscript.sectionCount > 1 && (
                  <Link
                    href={byIdentity(SOURCE_HREF, manuscript.id)}
                    style={{ ...typeStyleFor(), color: INK.secondary }}
                  >
                    Read them in the Source →
                  </Link>
                )}
                <div style={{ marginTop: SPACE.roomy }}>
                  {bandLabel('Work')}
                  <WorkDrawer
                    works={works}
                    unitedWork={unitedWork}
                    manuscript={{ id: manuscript.id, title: manuscript.title }}
                    manuscriptLabel={manuscriptLabel}
                    onChanged={reloadWorks}
                  />
                </div>
              </>
            ) : (
              <StudioText role="quiet">Nothing is on the table.</StudioText>
            )}
          </StudioPanel>
        )}

        {/* ── The writing field: the largest, quietest surface. ── */}
        <StudioSurface
          level="field"
          edge="soft"
          radius="panel"
          style={{
            ...columnFlex('writingField'),
            display: 'flex',
            flexDirection: 'column',
            padding: `${SPACE.roomy}px ${SPACE.generous}px`,
            overflow: 'auto',
          }}
        >
          {listPhase === 'loading' && <StudioText role="quiet">opening…</StudioText>}
          {/* `unauthorized` never reaches here — the signed-out room returns
              early above, so a branch for it would be dead code. */}
          {listPhase === 'error' && (
            <StudioText role="prose" tone="secondary">
              The Canvas could not be reached just now. Your work is not affected — please try
              again in a moment.
            </StudioText>
          )}

          {/* Identity refused — named, and not found. Never a substitute. */}
          {identityRefused && (
            <div style={{ maxWidth: '32rem' }}>
              <StudioText role="prose" tone="secondary" style={{ marginBottom: SPACE.base }}>
                That manuscript is not one of yours.
              </StudioText>
              <StudioText role="quiet">
                Nothing has been opened, and nothing has changed. Rather than put a different
                manuscript on the table, the Canvas is telling you the one you asked for could not
                be found.
              </StudioText>
              <div style={{ marginTop: SPACE.roomy }}>
                <Link href="/writers-studio" style={{ ...typeStyleFor(), color: INK.secondary }}>
                  ← Back to your writing
                </Link>
              </div>
            </div>
          )}

          {listPhase === 'none' && (
            <div style={{ maxWidth: '28rem' }}>
              <StudioText role="prose" tone="secondary" style={{ marginBottom: SPACE.base }}>
                Nothing is on the table yet.
              </StudioText>
              <StudioText role="quiet">
                Begin at the{' '}
                <Link href="/writers-studio" style={{ color: INK.secondary }}>
                  Studio Home
                </Link>{' '}
                — start writing, or{' '}
                <Link href={IMPORT_HREF} style={{ color: INK.secondary }}>
                  bring in existing writing
                </Link>
                .
              </StudioText>
            </div>
          )}

          {manuscript && (
            <Worktable
              manuscriptId={manuscript.id}
              onMeta={setDraftMeta}
              onCheckpointed={() => setHistoryKey((k) => k + 1)}
            />
          )}
        </StudioSurface>

        {/* ── MAIA: adjacent to the work, never its owner. ── */}
        {maiaOpen && (
          <StudioPanel
            role="maia"
            label="MAIA"
            onDismiss={() => setMaiaOpen(false)}
            style={columnFlex('maiaPanel')}
          >
            <StudioText role="maiaReading" style={{ color: MAIA_ACCENT.voice }}>
              {WINDOW_SENTENCE}
            </StudioText>
            <StudioText role="quiet" style={{ marginTop: SPACE.base }}>
              Conversations become available when this Work can be carried into MAIA and back
              without guessing which one you meant.
            </StudioText>
          </StudioPanel>
        )}

        {/* ── Materials: contextual, dismissible, and real or absent. ── */}
        {materialsOpen && (
          <StudioPanel
            role="materials"
            label="Materials"
            count={materialCount > 0 ? materialCount : undefined}
            onDismiss={() => setMaterialsOpen(false)}
            style={columnFlex('materialsPanel')}
          >
            <MaterialsDrawer
              work={materialsWork}
              manuscript={manuscript}
              manuscripts={manuscripts}
              onChanged={reloadWorks}
            />
          </StudioPanel>
        )}
      </div>

      {/* ── Lower band: only what exists. Versions is real; Statistics is
          counted from the member's own material. Goals has no substrate and
          is therefore absent rather than drawn empty. ── */}
      {manuscript && (
        <footer
          style={{
            display: 'flex',
            gap: SPACE.generous,
            padding: `${SPACE.base}px ${SPACE.roomy}px`,
            borderTop: `1px solid ${RULE.soft}`,
            background: GROUND.raised,
            flexShrink: 0,
            overflowX: 'auto',
          }}
        >
          <div style={{ minWidth: 220 }}>
            {bandLabel('Versions')}
            {revisions === null ? (
              <StudioText role="metadata">opening…</StudioText>
            ) : revisions.length === 0 ? (
              <StudioText role="metadata">
                No kept versions yet — “Keep a version” sets one down.
              </StudioText>
            ) : (
              revisions.slice(0, 4).map((r) => (
                <div
                  key={r.revisionNumber}
                  style={{ display: 'flex', justifyContent: 'space-between', gap: SPACE.base }}
                >
                  <StudioText role="metadata" tone="secondary" as="span">
                    Version {r.revisionNumber}
                  </StudioText>
                  <StudioText role="metadata" as="span">
                    {formatWhen(r.createdAt)}
                  </StudioText>
                </div>
              ))
            )}
          </div>

          <div style={{ minWidth: 200 }}>
            {bandLabel('Statistics')}
            <StudioText role="metadata" tone="secondary">
              {pageEstimate(manuscript.charCount)}
            </StudioText>
            {manuscript.sectionCount > 0 && (
              <StudioText role="metadata">{manuscript.sectionCount} sections</StudioText>
            )}
            {materialCount > 0 && (
              <StudioText role="metadata">{materialCount} materials</StudioText>
            )}
          </div>

          <span style={{ flex: 1 }} />

          {/* Panels are contextual: what was dismissed can be called back. */}
          <div style={{ display: 'flex', gap: SPACE.base, alignItems: 'flex-start' }}>
            {!outlineOpen && (
              <button type="button" onClick={() => setOutlineOpen(true)} style={recallStyle}>
                Manuscript
              </button>
            )}
            {!maiaOpen && (
              <button type="button" onClick={() => setMaiaOpen(true)} style={recallStyle}>
                MAIA
              </button>
            )}
            {!materialsOpen && (
              <button type="button" onClick={() => setMaterialsOpen(true)} style={recallStyle}>
                Materials
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
