'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS } from '../pressTheme';
import {
  BREAKPOINT,
  GOLD,
  GROUND,
  INK,
  MEASURE,
  RADIUS,
  RULE,
  SPACE,
  writingFieldLayout,
  type StudioLayout,
} from '../studioTheme';
import { StudioPanel } from '../studio/StudioPanel';
import { StudioShellRail } from '../studio/StudioRail';
import { StudioModeBar } from '../studio/StudioModeBar';
import { StudioScrollbars } from '../studio/StudioScrollbars';
import { StudioText } from '../studio/StudioType';
import { IMPORT_HREF } from '../studioMap';
import {
  canvasForManuscript,
  requestedManuscriptId,
  resolveManuscript,
  type ManuscriptResolution,
} from '../canvasIdentity';
import { UNTITLED_EXPRESSION } from '../shellIdentity';
import { useLivingWorks } from '../useLivingWorks';
import { resolveWorkContext, currentWork } from '../workContext';
import type { CurrentManuscript } from '../useCurrentManuscript';
import { loadRevisions, type RevisionSummary } from '../../press/manuscript/workingDraftClient';
import Worktable from './Worktable';
import WorkDrawer from './WorkDrawer';
import MaterialsDrawer from './MaterialsDrawer';
import ManuscriptOutline, { useManuscriptSections } from './ManuscriptOutline';
import MaiaColumn from './MaiaColumn';
import StudioLowerBand from './StudioLowerBand';

/**
 * THE WRITER'S STUDIO — the persistent shell, at /writers-studio/canvas.
 *
 * ── WHAT 03A WAS, AND WHY THIS IS DIFFERENT ────────────────────────────────
 *
 * WS2-03A routed the accepted WS2-02 primitives into this room and stopped.
 * The result looked like the old Canvas because it WAS the old Canvas: a
 * folded drawer spine showing one drawer at a time, with a rail bolted to its
 * left edge. New paint, old composition. The founder's reading of it —
 * "the projection seam" — is exactly right, and 03B is the composition.
 *
 * What changed structurally:
 *
 *   GONE  the vertical drawer spine, and the one-drawer-at-a-time rule that
 *         made the manuscript share the room with a 288px accordion.
 *   GONE  the folded Window, a 40px strip that had to be pried open before
 *         MAIA had any presence at all.
 *   NEW   the five-mode bar, the sixteen-destination shell rail, a standing
 *         outline column, the writing field at its MEASURED share, MAIA as a
 *         column rather than a hinge, Materials in 04's right-hand geometry,
 *         and the lower band 04 carries and this room never had.
 *
 * ── GEOMETRY: THE MEASURED PROPORTIONS, AT EVERY WIDTH ─────────────────────
 *
 * 03A could not adjudicate column proportion, because this room had a
 * different column set. It now has 04's. `writingFieldLayout` allocates the
 * measured gutters first and divides the remainder in the measured ratio; the
 * result is resolved here as PERCENTAGES rather than at one assumed viewport,
 * so the reference proportions hold at 1680 and at 1280 alike and no layout
 * depends on reading `window` during render.
 *
 * The column SET varies with what is honestly present — a dismissed panel
 * leaves the row and its share is redivided among the rest in the same
 * measured ratio. What never varies: the writing field is an explicit width,
 * never a `flex: 1` remainder. That was the WS2-02B defect and it is the one
 * failure mode this layout is built to make impossible.
 *
 * ── WHAT IS REAL IN THIS ROOM, REGION BY REGION ────────────────────────────
 *
 *   mode bar     WRITE real. Develop/Explore/Review/Publish have no rooms and
 *                are unpressable spans.
 *   shell rail   Home and Export are routes. Manuscript is this room.
 *                Materials, Structure and Versions are satisfied HERE as
 *                panels. Notes, Goals and the whole MAIA band are unavailable.
 *   outline      REAL sections from manuscript_sections.
 *   field        REAL. The Working Draft engine, unchanged.
 *   MAIA         Present, honest, and holding no member material.
 *   materials    REAL declarations only. Opens when there are some.
 *   lower band   Versions and Statistics real; Goals has no substrate.
 *
 * ── IDENTITY: THE WS2-01 MINIMUM, HELD HERE ────────────────────────────────
 *
 * This room used to read `manuscripts.find(...) ?? manuscripts[0]`. A named
 * manuscript that could not be found was silently replaced by whichever came
 * back first, and the room then told the member "the most recent of your N
 * manuscripts is on the table" — a true sentence about the wrong book.
 *
 * `resolveManuscript` returns a decision, and every branch of it is rendered:
 * an unresolvable identity REFUSES, and an unnamed arrival with several
 * manuscripts ASKS. Neither substitutes. Root-causing how a member came to be
 * sent an id they do not own stays in the WS2-01 lane; this room's job is to
 * stop being the place where that becomes invisible.
 */

/** Panels that can stand in the row beside the field. */
type ColumnId = 'outline' | 'maia' | 'materials';

/** Rail destinations this room satisfies in place rather than by navigation. */
const SATISFIED_IN_ROOM = ['materials', 'structure', 'versions'] as const;

export default function WritersStudioPage() {
  const { phase: worksPhase, works, reload: reloadWorks } = useLivingWorks();

  const [listPhase, setListPhase] = useState<
    'loading' | 'ready' | 'unauthorized' | 'error'
  >('loading');
  const [manuscripts, setManuscripts] = useState<CurrentManuscript[]>([]);

  // Read once, synchronously on the client, so the field never swaps its
  // manuscript after mounting (the exit guard would flush a draft mid-swap).
  const [requested, setRequested] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : requestedManuscriptId(window.location.search),
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
        if (cancelled) return;
        setManuscripts(Array.isArray(data.manuscripts) ? data.manuscripts : []);
        setListPhase('ready');
      } catch {
        if (!cancelled) setListPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolution = useMemo(
    () => resolveManuscript(requested, manuscripts),
    [requested, manuscripts],
  );
  const manuscript = resolution.kind === 'resolved' ? resolution.manuscript : null;

  /* PERSISTENT WORK CONTEXT, ACROSS RELOAD.
     The manuscript identity is pinned into the URL whenever one is resolved.
     That is what makes reload preserve the current Work: the Work is
     re-derived from the member's declarations for THIS manuscript, so pinning
     the manuscript pins the Work — without storing a second, staleable copy
     of it anywhere.

     CORRECTED after the first authenticated capture. This effect used to skip
     whenever `wasRequested` was true, on the reasoning that an identity that
     came FROM the URL is already in it. That reasoning had a hole: choosing a
     manuscript in the ambiguity chooser also sets `requested`, in React state
     and nowhere else. So the founder's own session — four manuscripts, none
     named, one chosen — ran with a bare /writers-studio/canvas in the address
     bar, and a reload would have dropped them back at the chooser. The
     capture is what showed it; no test could, because the URL is the one
     piece of state the room does not own.

     The condition is now about the URL rather than about provenance: pin
     whenever what is on the table differs from what the address bar names. */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (resolution.kind !== 'resolved') return;
    const id = resolution.manuscript.id;
    if (requestedManuscriptId(window.location.search) === id) return;
    window.history.replaceState(
      null,
      '',
      canvasForManuscript(window.location.pathname, id),
    );
  }, [resolution]);

  const workContext = resolveWorkContext(worksPhase, works, manuscript?.id ?? null);
  const work = currentWork(workContext);

  const { phase: sectionsPhase, sections } = useManuscriptSections(manuscript?.id ?? null);

  const [draftMeta, setDraftMeta] = useState<{
    updatedAt: string | null;
    revisionCount: number | null;
    words: number;
  } | null>(null);

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

  /* ── WHAT STANDS OPEN, AND WHY ──────────────────────────────────────────
     The outline is not contextual by contract — it is standing furniture the
     member may dismiss. MAIA is present because §1 makes her a companion
     across the modes, and dismissible because her panel contract says so.

     MATERIALS IS THE DELICATE ONE. 04 draws it open, and the founder's rule
     is explicit: Materials are NOT permanent furniture just because the
     reference depicts them open. So it is not open by default and it is not
     closed by default either — it is CONTEXTUAL, which is what its contract
     actually says. It opens when the current Work has materials the member
     declared, and stays shut when there is nothing real to hold. Opening an
     empty Materials column to reach 04's five would be furniture pretending
     to be context. */
  const [dismissed, setDismissed] = useState<Partial<Record<ColumnId, boolean>>>({});
  const [summoned, setSummoned] = useState<Partial<Record<ColumnId, boolean>>>({});
  const [bandOpen, setBandOpen] = useState(true);
  const [workOpen, setWorkOpen] = useState(false);

  const declaredMaterials = work?.materials.length ?? 0;
  const materialsInContext = declaredMaterials > 0;

  const open = (id: ColumnId, standing: boolean) =>
    summoned[id] === true || (standing && dismissed[id] !== true);

  const outlineOpen = open('outline', sections.length > 0);
  const maiaOpen = open('maia', true);
  const materialsOpen = open('materials', materialsInContext);

  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT.compact - 1}px)`);
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  /* At compact the ONE collapse either reference establishes applies:
     Materials yields its right-hand column before the outline does, and
     before the field gives up its measure (YIELDS_BEFORE). It is not deleted
     — PRESENT_AT_COMPACT keeps it — it simply cannot hold a column here. */
  const columnsShown = useMemo(() => {
    const cols: Array<keyof StudioLayout> = ['rail'];
    if (outlineOpen) cols.push('outlinePanel');
    cols.push('writingField');
    if (maiaOpen) cols.push('maiaPanel');
    if (materialsOpen && !compact) cols.push('materialsPanel');
    return cols as Array<'rail' | 'outlinePanel' | 'writingField' | 'maiaPanel' | 'materialsPanel'>;
  }, [outlineOpen, maiaOpen, materialsOpen, compact]);

  /* Resolved at a large notional width and expressed as percentages, so the
     MEASURED ratio holds at every viewport and nothing reads `window` during
     render. writingFieldLayout still owns the arithmetic. */
  const NOTIONAL = 100000;
  const L = writingFieldLayout(NOTIONAL, columnsShown);
  const pct = (n: number) => `${((n / NOTIONAL) * 100).toFixed(4)}%`;

  const summon = useCallback((id: ColumnId) => {
    setSummoned((s) => ({ ...s, [id]: true }));
    setDismissed((d) => ({ ...d, [id]: false }));
  }, []);
  const dismiss = useCallback((id: ColumnId) => {
    setSummoned((s) => ({ ...s, [id]: false }));
    setDismissed((d) => ({ ...d, [id]: true }));
  }, []);

  // ── Signed out ───────────────────────────────────────────────────────────
  if (listPhase === 'unauthorized') {
    return (
      <Bare>
        The Studio holds your own words, so it opens only to you.{' '}
        <a href="/signin" style={{ textDecoration: 'underline' }}>
          Sign in
        </a>{' '}
        to enter.
      </Bare>
    );
  }

  const manuscriptLabel = manuscript ? (manuscript.title ?? UNTITLED_EXPRESSION) : '';
  const headline = work?.title ?? (manuscript ? manuscriptLabel : 'Writer’s Studio');
  const named = Boolean(work?.title ?? manuscript?.title);

  const railCounts: Record<string, number> = {};
  if (manuscript) {
    railCounts.structure = sections.length;
    railCounts.versions = revisions?.length ?? 0;
    if (work) railCounts.materials = declaredMaterials;
  }

  return (
    <div
      data-room="writers-studio"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: GROUND.base,
        color: INK.primary,
        overflow: 'hidden',
      }}
    >
      {/* Scoped to data-room above. See StudioScrollbars. */}
      <StudioScrollbars />

      {/* ══ HEAD OF THE STUDIO ══════════════════════════════════════════ */}
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
          <StudioText role="bandLabel" tone="muted">
            Soullab · Writer’s Studio
          </StudioText>
        </Link>
        <div style={{ minWidth: 0 }}>
          <StudioText role="workIdentity" style={{ opacity: named ? 1 : 0.7 }}>
            {headline}
          </StudioText>
          {/* The member's own statement, in their words, only when their own
              declaration united a Work with what is on the table. */}
          {work?.purpose ? (
            <StudioText role="quiet">{work.purpose}</StudioText>
          ) : work && manuscript ? (
            <StudioText role="quiet">
              {manuscriptLabel} — a form of this work, declared by you
            </StudioText>
          ) : null}
        </div>
        {!compact && <StudioModeBar current="write" style={{ marginLeft: SPACE.roomy }} />}
        <span style={{ flex: 1 }} />
        {draftMeta && (
          <StudioText role="metadata" as="span">
            {draftMeta.words.toLocaleString()} words
          </StudioText>
        )}
      </header>

      {/* ══ BODY ════════════════════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          flexDirection: compact ? 'column' : 'row',
          flex: 1,
          minHeight: 0,
          gap: compact ? SPACE.base : pct(L.gutter),
          padding: compact ? SPACE.base : pct(L.gutter),
          overflow: compact ? 'auto' : 'hidden',
        }}
      >
        <StudioShellRail
          hasManuscript={Boolean(manuscript)}
          counts={railCounts}
          satisfiedInRoom={manuscript ? SATISFIED_IN_ROOM : []}
          current="manuscript"
          openPanels={[
            ...(materialsOpen ? ['materials'] : []),
            ...(outlineOpen ? ['structure'] : []),
            ...(bandOpen ? ['versions'] : []),
          ]}
          onSelect={(d) => {
            if (d.id === 'materials') summon('materials');
            if (d.id === 'structure') summon('outline');
            if (d.id === 'versions') setBandOpen(true);
          }}
          lead={
            <button
              type="button"
              onClick={() => setWorkOpen((v) => !v)}
              aria-expanded={workOpen}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: workOpen ? GROUND.active : 'transparent',
                border: `1px solid ${workOpen ? GOLD.edge : RULE.soft}`,
                borderRadius: RADIUS.base,
                padding: `${SPACE.tight + 1}px ${SPACE.base}px`,
                marginBottom: SPACE.comfortable,
                cursor: 'pointer',
              }}
            >
              <StudioText role="navItem" as="span" tone={workOpen ? 'primary' : 'secondary'}>
                This work
              </StudioText>
            </button>
          }
          style={{
            width: compact ? '100%' : pct(L.rail),
            flexShrink: 0,
            borderRadius: RADIUS.panel,
            /* WS2-03B correction 2 — the rail is a rounded column here, not a
               flush edge, so its right-only hairline had nothing to divide.
               It joins the quiet chrome; the writing field keeps the only
               visible border in the row. */
            border: `1px solid ${RULE.quiet}`,
            borderRight: `1px solid ${RULE.quiet}`,
          }}
        />

        {/* The Work drawer — identity and declarations, member-authored. It is
            not a column in 04 and is not invented as one: it opens from the
            rail's head into the outline's place. */}
        {workOpen && (
          <StudioPanel
            role="manuscript-outline"
            label="This work"
            onDismiss={() => setWorkOpen(false)}
            style={{ width: compact ? '100%' : pct(L.outlinePanel), flexShrink: 0 }}
          >
            <WorkDrawer
              works={works}
              unitedWork={work}
              manuscript={manuscript ? { id: manuscript.id, title: manuscript.title } : null}
              manuscriptLabel={manuscriptLabel}
              onChanged={reloadWorks}
            />
          </StudioPanel>
        )}

        {!workOpen && outlineOpen && (
          <StudioPanel
            role="manuscript-outline"
            label="Manuscript"
            onDismiss={() => dismiss('outline')}
            style={{ width: compact ? '100%' : pct(L.outlinePanel), flexShrink: 0 }}
          >
            <ManuscriptOutline
              manuscriptId={manuscript?.id ?? null}
              phase={sectionsPhase}
              sections={sections}
            />
          </StudioPanel>
        )}

        {/* ══ THE WRITING FIELD — the largest, quietest surface ══════════ */}
        <main
          data-panel-role="writing-field"
          style={{
            width: compact ? '100%' : pct(L.writingField),
            flexShrink: 0,
            minWidth: compact ? 0 : MEASURE.fieldMinWidth,
            minHeight: compact ? '60vh' : 0,
            background: GROUND.field,
            border: `1px solid ${RULE.soft}`,
            borderRadius: RADIUS.panel,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              width: '100%',
              maxWidth: `${MEASURE.prose}ch`,
              margin: '0 auto',
              /* WS2-03B correction 2. The manuscript is the centre of gravity
                 and was reading as one pane among four. Its measure and its
                 column width are unchanged — MEASURE.prose and the geometry
                 are measured values and not this correction's to move. What
                 it gets is air: the field breathes where the panels do not. */
              padding: `${SPACE.band}px ${MEASURE.roomGutter}px ${SPACE.generous}px`,
            }}
          >
            <FieldBody
              listPhase={listPhase}
              resolution={resolution}
              manuscript={manuscript}
              onPick={(id) => setRequested(id)}
              onMeta={setDraftMeta}
              onCheckpointed={() => setHistoryKey((k) => k + 1)}
            />
          </div>
        </main>

        {maiaOpen && (
          <StudioPanel
            role="maia"
            label="MAIA"
            onDismiss={() => dismiss('maia')}
            style={{ width: compact ? '100%' : pct(L.maiaPanel), flexShrink: 0 }}
          >
            <MaiaColumn context={workContext} />
          </StudioPanel>
        )}

        {materialsOpen && !compact && (
          <StudioPanel
            role="materials"
            label="Materials"
            count={declaredMaterials || undefined}
            onDismiss={() => dismiss('materials')}
            style={{ width: pct(L.materialsPanel), flexShrink: 0 }}
          >
            <MaterialsDrawer
              work={work ?? (works.length === 1 ? works[0] : null)}
              manuscript={manuscript}
              manuscripts={manuscripts}
              onChanged={reloadWorks}
            />
          </StudioPanel>
        )}
      </div>

      {/* ══ LOWER BAND ══════════════════════════════════════════════════ */}
      {bandOpen && manuscript && (
        <StudioLowerBand
          revisions={revisions}
          wordCount={draftMeta?.words ?? null}
          sectionCount={sectionsPhase === 'ready' ? sections.length : null}
          outlineOpen={outlineOpen}
          onShowOutline={() => summon('outline')}
          onDismiss={() => setBandOpen(false)}
        />
      )}
    </div>
  );
}

/* ── The field's contents, one honest branch per resolution ──────────────── */

function FieldBody({
  listPhase,
  resolution,
  manuscript,
  onPick,
  onMeta,
  onCheckpointed,
}: {
  listPhase: 'loading' | 'ready' | 'unauthorized' | 'error';
  resolution: ManuscriptResolution<CurrentManuscript>;
  manuscript: CurrentManuscript | null;
  onPick: (id: string) => void;
  onMeta: (m: { updatedAt: string | null; revisionCount: number | null; words: number }) => void;
  onCheckpointed: () => void;
}) {
  if (listPhase === 'loading') {
    return <StudioText role="metadata">opening…</StudioText>;
  }
  if (listPhase === 'error') {
    return (
      <StudioText role="prose" style={{ opacity: 0.75 }}>
        The Studio could not be reached just now. Your work is not affected —
        please try again in a moment.
      </StudioText>
    );
  }

  /* THE REFUSAL. An identity was named and does not resolve here.
     This is the branch that used to be `?? manuscripts[0]`, and it is a
     refusal rather than an error: the room is declining to guess, which is
     correct behaviour and must not be dressed as a fault (STATE.refusal). */
  if (resolution.kind === 'unresolved') {
    return (
      <div data-state="refusal" style={{ maxWidth: '46ch' }}>
        <StudioText role="chapterSubtitle" as="h2" style={{ marginBottom: SPACE.base }}>
          That manuscript is not on your shelf.
        </StudioText>
        <StudioText role="prose" style={{ opacity: 0.8, marginBottom: SPACE.comfortable }}>
          The Studio was asked to open a specific manuscript and cannot find it
          among yours. Nothing else has been put on the table in its place, and
          nothing has been changed.
        </StudioText>
        <StudioText role="metadata" style={{ marginBottom: SPACE.comfortable }}>
          requested: {resolution.requested}
        </StudioText>
        <Link href="/writers-studio" style={{ textDecoration: 'underline' }}>
          <StudioText role="navItem" as="span">
            Go to Studio Home →
          </StudioText>
        </Link>
      </div>
    );
  }

  /* THE QUESTION. Nothing was named and several exist. Not a fallback and not
     a dead end: the member is the only one who can answer, so ask them. */
  if (resolution.kind === 'ambiguous') {
    return (
      <div data-state="refusal" style={{ maxWidth: '46ch' }}>
        <StudioText role="chapterSubtitle" as="h2" style={{ marginBottom: SPACE.base }}>
          Which one are you working on?
        </StudioText>
        <StudioText role="prose" style={{ opacity: 0.8, marginBottom: SPACE.comfortable }}>
          You have {resolution.manuscripts.length} manuscripts and none was
          named. The Studio will not choose for you.
        </StudioText>
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.snug }}>
          {resolution.manuscripts.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onPick(m.id)}
              style={{
                textAlign: 'left',
                background: 'transparent',
                border: `1px solid ${RULE.soft}`,
                borderRadius: RADIUS.sm,
                padding: `${SPACE.snug}px ${SPACE.base}px`,
                cursor: 'pointer',
              }}
            >
              <StudioText role="navItem" tone="secondary">
                {m.title ?? UNTITLED_EXPRESSION}
              </StudioText>
              <StudioText role="metadata">
                {m.sectionCount} section{m.sectionCount === 1 ? '' : 's'}
              </StudioText>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (resolution.kind === 'empty') {
    return (
      <div style={{ maxWidth: '44ch' }}>
        <StudioText role="prose" style={{ opacity: 0.8, marginBottom: SPACE.comfortable }}>
          Nothing is on the table yet.
        </StudioText>
        <StudioText role="metadata">
          Begin at{' '}
          <Link href="/writers-studio" style={{ textDecoration: 'underline' }}>
            Studio Home
          </Link>{' '}
          — start writing, or{' '}
          <Link href={IMPORT_HREF} style={{ textDecoration: 'underline' }}>
            bring in existing writing
          </Link>
          .
        </StudioText>
      </div>
    );
  }

  return manuscript ? (
    <Worktable
      manuscriptId={manuscript.id}
      onMeta={onMeta}
      onCheckpointed={onCheckpointed}
    />
  ) : null;
}

function Bare({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACE.roomy,
        textAlign: 'center',
        background: GROUND.base,
        color: INK.primary,
      }}
    >
      <div style={{ maxWidth: '34ch' }}>
        <StudioText role="bandLabel" style={{ marginBottom: SPACE.base }}>
          Writer’s Studio
        </StudioText>
        <StudioText role="prose" style={{ opacity: 0.8, color: PRESS.text }}>
          {children}
        </StudioText>
      </div>
    </div>
  );
}
