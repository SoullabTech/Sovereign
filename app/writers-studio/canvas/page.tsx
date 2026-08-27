'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from '../pressTheme';
import { CANVAS_HREF, IMPORT_HREF, SOURCE_HREF } from '../studioMap';
import { UNTITLED_EXPRESSION } from '../shellIdentity';
import { CANVAS_MANUSCRIPT_PARAM, canvasForManuscript, selectManuscript } from '../canvasIdentity';
import { arrivalWork, useLivingWorks } from '../useLivingWorks';
import type { CurrentManuscript } from '../useCurrentManuscript';
import {
  formatWhen,
  loadRevisions,
  pageEstimate,
  type RevisionSummary,
} from '../../press/manuscript/workingDraftClient';
import StudioShell, { type RailGroup } from '../shell/StudioShell';
import { STUDIO_MODE_PARAM, resolveMode, type StudioModeId } from '../shell/studioModes';
import WriteField from './WriteField';
import Worktable from './Worktable';
import MaterialsDrawer from './MaterialsDrawer';
import Companion from './Companion';
import StructureRail from './StructureRail';
import VersionsPanel from './VersionsPanel';
import type { DeclaredPart, DraftMap } from './manuscriptMap';

/**
 * Writer Canvas — the room.
 *
 * WS-VISIBLE-01 (2026-08-26) turned the room from a textarea with folded
 * spines into a working studio:
 *
 *   · Materials and Work are VISIBLE by default, in an open left rail. They
 *     were previously behind vertical one-word labels, so a member had to
 *     discover by clicking that the capability existed at all.
 *   · MAIA is present in the room (Companion.tsx) instead of a hard-coded
 *     placeholder sentence saying reflection would become available.
 *   · The room states itself in the header: what is on the table, what feeds
 *     it, where saving stands.
 *
 * What has NOT changed, deliberately: every honesty rule from v0.1 stands.
 * The head of the room may unite Work and manuscript ONLY on the member's own
 * declaration; nothing is inferred; a capability that does not exist is not
 * drawn. Structure appears only where structure exists.
 *
 * Design authority: docs/design/author-studio/WRITER_CANVAS_ROOM_MAP_2026-08-05
 * .md, as amended by the Writer's Studio Build Charter (§8 product doctrine,
 * §9 design standard, §12 WS-VISIBLE-01).
 */

/** What the writer is doing in the room. Modes change the CENTRE, not the room. */
type ListPhase = 'loading' | 'ready' | 'none' | 'unauthorized' | 'error';

/** Same rule as Studio Home: return by identity, never by position. */
const byIdentity = (href: string, manuscriptId: string) =>
  canvasForManuscript(href, manuscriptId);

function ManuscriptName({
  manuscriptId,
  title,
  onRenamed,
}: {
  manuscriptId: string;
  title: string | null;
  onRenamed: (title: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title ?? '');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const save = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const res = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/title`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: value }),
      });
      if (!res.ok) {
        setFailed(true);
        return;
      }
      const data = await res.json();
      onRenamed(typeof data.title === 'string' ? data.title : null);
      setEditing(false);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <button
        onClick={() => {
          setValue(title ?? '');
          setEditing(true);
        }}
        className="text-[10.5px] tracking-[0.16em] uppercase opacity-30 hover:opacity-80"
      >
        rename
      </button>
    );
  }

  return (
    <span className="flex items-baseline gap-2">
      <input
        value={value}
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void save();
          if (e.key === 'Escape') setEditing(false);
        }}
        placeholder="Its name, when you know it"
        aria-label="Name this manuscript"
        className="press-field bg-transparent border-b py-0.5 text-[15px] outline-none placeholder:opacity-35 min-w-[14rem]"
        style={{ borderColor: PRESS.rule, fontFamily: SERIF, color: PRESS.text }}
      />
      <button
        onClick={() => void save()}
        disabled={busy}
        className="text-[10.5px] tracking-[0.16em] uppercase opacity-60 hover:opacity-100 disabled:opacity-25"
        style={{ color: PRESS.accent }}
      >
        {busy ? 'naming…' : 'name it'}
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-[10.5px] tracking-[0.16em] uppercase opacity-30 hover:opacity-70"
      >
        cancel
      </button>
      {failed && <span className="text-[11px] opacity-60">could not rename just now</span>}
    </span>
  );
}

/**
 * The room reads the URL, and keeps reading it.
 *
 * Wrapped in Suspense because `useSearchParams` requires it on a statically
 * prerendered route. The fallback is deliberately empty: a half-drawn room
 * that later fills with a manuscript is worse than a beat of nothing.
 */
export default function WriterCanvasPage() {
  return (
    <Suspense fallback={null}>
      <WriterCanvas />
    </Suspense>
  );
}

function WriterCanvas() {
  const { phase: worksPhase, works, reload: reloadWorks } = useLivingWorks();
  const work = arrivalWork(worksPhase, works);

  const [listPhase, setListPhase] = useState<ListPhase>('loading');
  const [manuscripts, setManuscripts] = useState<CurrentManuscript[]>([]);
  /**
   * Which manuscript the URL asked for — read reactively, from the URL itself.
   *
   * ── Why this is not a useState initializer ────────────────────────────────
   * It was, until 2026-08-27, and production disproved it. Every entry into
   * this room is a CLIENT-SIDE navigation — `router.push` from Studio Home,
   * `<Link>` from HomeView — so the `?m=` value is not reliably on
   * `window.location` at the moment this component first reads it. A read
   * taken once at mount therefore returned null, `asked` was false, and the
   * room fell back to `manuscripts[0]`: the most recent manuscript, opened
   * under whatever the writer had actually clicked.
   *
   * That is why a DIRECT load of `?m=<bogus>` correctly refused while a
   * CLICKED manuscript silently opened the wrong one. Same code, two paths,
   * and only one of them had the parameter in hand at mount.
   *
   * `useSearchParams` is bound to the router rather than to the mount, so it
   * is correct on both paths and stays correct when the writer moves between
   * manuscripts without leaving the room.
   *
   * This does NOT reintroduce silent substitution. The URL is the writer's
   * request, not a guess: the room shows what was asked for, or it refuses
   * and says so. What it may never do is show something the URL did not ask
   * for — see the selection rule below.
   */
  const searchParams = useSearchParams();
  const requested = searchParams?.get(CANVAS_MANUSCRIPT_PARAM) ?? null;

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
   * Which manuscript is on the table.
   *
   * ⚠️ NEVER SUBSTITUTE. An earlier version fell back to the most recent
   * manuscript when the requested id was not in the list — "degrading, not
   * stranding". Production disproved that reading on 2026-08-27: opening one
   * manuscript showed a DIFFERENT manuscript's draft, under the title of the
   * one that was opened, with a grey sentence as the only signal. A writer
   * cannot tell that from their own work having been replaced.
   *
   *   id asked for, found     → open it
   *   id asked for, NOT found → open NOTHING and say so
   *   no id asked for         → open NOTHING and ask which writing
   *
   * The third case used to land on the most recent manuscript, and that is
   * how the 2026-08-27 failure reached the founder: a work with no manuscript
   * attached produced a Canvas URL carrying no id at all, and the room put a
   * 5-page transcript on the table under that work's name. There is no longer
   * any input to this room that opens a manuscript nobody named.
   *
   * Showing the wrong text under the right title is worse than showing none.
   * The rule lives in ../canvasIdentity.ts and is imported, not restated.
   */
  const selection = selectManuscript(requested, manuscripts);
  const missing = listPhase === 'ready' && selection.kind === 'missing';
  const unnamed = listPhase === 'ready' && selection.kind === 'unnamed';
  const manuscript =
    listPhase === 'ready' && selection.kind === 'found' ? selection.manuscript : null;

  /* ── Which creative distance, from the URL ──────────────────────────────
     Read REACTIVELY through useSearchParams, never in a useState initializer.
     That distinction is the whole of D-009, which this codebase has now been
     bitten by three times: on a client-side navigation the destination's
     parameters are not necessarily in hand at first render, so a value frozen
     at mount is a value frozen wrong. */
  const modeAsked = resolveMode(searchParams?.get(STUDIO_MODE_PARAM) ?? null);
  const mode: StudioModeId =
    modeAsked.kind === 'open' ? modeAsked.mode.id : modeAsked.fallback.id;

  /* The shell does not invent routes. A mode's href keeps the manuscript
     identity that is already on the table — moving between creative distances
     must never lose which writing the writer is in. */
  const hrefForMode = (id: StudioModeId) => {
    const base = manuscript ? canvasForManuscript(CANVAS_HREF, manuscript.id) : CANVAS_HREF;
    return `${base}${base.includes('?') ? '&' : '?'}${STUDIO_MODE_PARAM}=${id}`;
  };
  const [handed, setHanded] = useState<{ key: string; message: string } | null>(null);
  const [draftMeta, setDraftMeta] = useState<{
    updatedAt: string | null;
    revisionCount: number | null;
    words: number;
  } | null>(null);

  const [parts, setParts] = useState<DeclaredPart[]>([]);
  const [draftMap, setDraftMap] = useState<DraftMap | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const manuscriptId = manuscript?.id ?? null;

  useEffect(() => {
    if (!manuscriptId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}`, { method: 'GET' });
        if (cancelled || !res.ok) return;
        const data = await res.json();
        const rows: DeclaredPart[] = Array.isArray(data.sections)
          ? data.sections.map((sec: { id: string; position: number; heading: string | null }) => ({
              id: sec.id,
              position: sec.position,
              heading: sec.heading,
            }))
          : [];
        if (!cancelled) setParts(rows);
      } catch {
        // The rail is an aid, not the work. A failed read leaves the whole
        // manuscript on the table exactly as before — never an error page over
        // a draft that loaded fine.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [manuscriptId]);

  // The frame belongs to the manuscript it was opened in.
  useEffect(() => {
    setFocusKey(null);
    setDraftMap(null);
  }, [manuscriptId]);

  const handleMap = useCallback((m: DraftMap) => setDraftMap(m), []);
  const handleFocusKey = useCallback((key: string | null) => setFocusKey(key), []);

  // Kept versions — read once the table is known, re-read after a keep.
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
        style={{ background: PRESS.bg, color: PRESS.text, fontFamily: SERIF }}
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
  // room does not guess between them).
  const owningWorks = manuscript
    ? works.filter((w) =>
        w.expressions.some(
          (e) => e.expressionType === 'manuscript' && e.expressionId === manuscript.id
        )
      )
    : [];
  const unitedWork = owningWorks.length === 1 ? owningWorks[0] : null;
  const railWork = unitedWork ?? (works.length === 1 ? works[0] : null);
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

  const materialCount = railWork?.materials.length ?? 0;

  const materialsPanel = (
    <MaterialsDrawer
      work={railWork}
      manuscript={manuscript}
      manuscripts={manuscripts}
      onChanged={reloadWorks}
    />
  );

  /* A restore replaces the text on the table, so the table is remounted to
     read it fresh — the exit guard flushes on unmount, so nothing in flight is
     lost in the swap. */
  const [tableKey, setTableKey] = useState(0);
  const historyPanel = manuscript ? (
    <VersionsPanel
      manuscriptId={manuscript.id}
      revisions={revisions}
      onRestored={() => {
        setHistoryKey((k) => k + 1);
        setTableKey((k) => k + 1);
      }}
    />
  ) : null;

  /* The rail (S1): a map of the MANUSCRIPT, said so in its own header, never a
     map of the Work. Doors narrow the table's frame; they do not move, split,
     or rewrite anything. Open by default now — a member should not have to
     click a vertical label to discover their book has chapters. */
  const companion = (
    <Companion
      workId={railWork?.id ?? null}
      manuscriptId={manuscript?.id ?? null}
      roomKey={`${railWork?.id ?? '-'}:${manuscript?.id ?? '-'}`}
      handed={handed}
      onHandled={() => setHanded(null)}
    />
  );

  /* ── The manuscript column (reference 04, second column) ────────────────
     The parts of THIS manuscript, as doors. The rail component already knows
     how to say what it is a map of and how to report drift honestly; it is
     recomposed into a column of its own rather than being one accordion among
     four in a shared rail, which is what buried it before. */
  const manuscriptColumn = manuscript ? (
    <div className="py-4">
      <p className="px-4 mb-1 text-[9.5px] tracking-[0.2em] uppercase opacity-30">Manuscript</p>
      <div className="px-4 pb-3 border-b mb-3" style={{ borderColor: PRESS.ruleSoft }}>
        <p className="text-[13px] opacity-80">{manuscriptLabel}</p>
        {draftMeta?.updatedAt && (
          <p className="text-[11px] opacity-40 mt-0.5">
            last saved {formatWhen(draftMeta.updatedAt)}
          </p>
        )}
      </div>
      <div className="px-4">
        <StructureRail
          expressionLabel={`${manuscriptLabel} — manuscript`}
          parts={parts}
          map={draftMap}
          focusKey={focusKey}
          onFocusKey={handleFocusKey}
          sourceHref={byIdentity(SOURCE_HREF, manuscript.id)}
        />
      </div>
    </div>
  ) : null;

  /* ── The shell's rail ───────────────────────────────────────────────────
     Composed here because only the field knows where the writer currently is.
     An entry with a null href is a destination that does not exist yet: named
     so the environment's shape is legible, never a control that opens nothing.
     Counts are real or absent — never a placeholder digit. */
  const rail: RailGroup[] = [
    {
      label: 'Work space',
      items: [
        { label: 'Home', href: '/writers-studio' },
        { label: 'Manuscript', href: null, current: true },
        { label: 'Materials', href: null, count: materialCount || null },
        { label: 'Structure', href: null, count: manuscript?.sectionCount ?? null },
        { label: 'Versions', href: null, count: revisions?.length ?? null },
        { label: 'Goals', href: null },
      ],
    },
    {
      label: 'MAIA',
      items: [
        { label: 'Conversations', href: null },
        { label: 'Insights', href: null },
      ],
    },
    {
      label: 'Tools',
      items: [
        { label: 'Find / Replace', href: null },
        { label: 'Source', href: manuscript ? byIdentity(SOURCE_HREF, manuscript.id) : null },
        { label: 'Import writing', href: IMPORT_HREF },
      ],
    },
  ];

  /* Every panel the centre column can show instead of the manuscript. Kept as
     one list so the "manuscript or a reason there isn't one" rule is visible
     in one place rather than spread through the JSX. */
  const centreNotice =
    listPhase === 'loading' ? (
      <p className="text-[14px] opacity-40">opening…</p>
    ) : listPhase === 'error' ? (
      <p className="text-[15px] opacity-70 max-w-md leading-relaxed">
        The Studio could not be reached just now. Your work is not affected — please try again
        in a moment.
      </p>
    ) : unnamed ? (
      <div className="max-w-md">
        <p className="text-[16px] leading-relaxed opacity-80 mb-4">
          Which writing would you like on the table?
        </p>
        <p className="text-[14px] leading-relaxed opacity-55 mb-6">
          Nothing was named on the way in, so the Studio has not opened anything. It will not
          choose a manuscript on your behalf.
        </p>
        <ul className="space-y-2.5">
          {manuscripts.map((m) => (
            <li key={m.id}>
              <Link
                href={canvasForManuscript(CANVAS_HREF, m.id)}
                className="text-[15px] underline underline-offset-4 opacity-85 hover:opacity-100"
              >
                {m.title ?? UNTITLED_EXPRESSION}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ) : missing ? (
      <div className="max-w-md">
        <p className="text-[16px] leading-relaxed opacity-80 mb-4">
          That manuscript is not on your shelf.
        </p>
        <p className="text-[14px] leading-relaxed opacity-55 mb-5">
          Nothing has been opened, and nothing has been changed. The Studio will not put a
          different manuscript on the table in its place — the wrong writing under the right
          name is worse than none.
        </p>
        <p className="text-[13px] leading-relaxed opacity-40 mb-5 font-mono break-all">
          asked for: {requested}
        </p>
        <p className="text-[14px] leading-relaxed opacity-55">
          <Link href="/writers-studio" className="underline underline-offset-4 opacity-90">
            Studio Home
          </Link>{' '}
          has everything you have written.
        </p>
      </div>
    ) : listPhase === 'none' ? (
      <div className="max-w-md">
        <p className="text-[16px] leading-relaxed opacity-75 mb-5">Nothing is on the table yet.</p>
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
    ) : null;

  /* A mode the writer asked for that is not open yet is SAID, not swallowed.
     Same rule as D-010 one layer down: never silently substitute. */
  const modeNotice =
    modeAsked.kind === 'not-yet' ? (
      <p className="text-[12.5px] opacity-45 mb-3">
        {modeAsked.requested.label} — {modeAsked.requested.purpose} — is not built yet
        ({modeAsked.requested.unit}). You are in {modeAsked.fallback.label}.
      </p>
    ) : null;

  return (
    <StudioShell
      workTitle={headlineNamed ? headline : null}
      workSubtitle={unitedWork?.purpose ?? null}
      mode={mode}
      hrefForMode={hrefForMode}
      savedLabel={draftMeta?.updatedAt ? `Saved ${formatWhen(draftMeta.updatedAt)}` : null}
      wordCount={draftMeta?.words ?? null}
      rail={rail}
    >
      <WriteField
        manuscriptColumn={manuscriptColumn}
        worktable={
          <>
            {modeNotice}
            {centreNotice}
            {manuscript && (
              <Worktable
                key={tableKey}
                manuscriptId={manuscript.id}
                parts={parts}
                focusKey={focusKey}
                onMap={handleMap}
                onFocusKey={handleFocusKey}
                onMeta={setDraftMeta}
                onCheckpointed={() => setHistoryKey((k) => k + 1)}
              />
            )}
          </>
        }
        companion={companion}
        materials={materialsPanel}
        versions={historyPanel}
        draftMap={draftMap}
        focusKey={focusKey}
        onFocusKey={handleFocusKey}
        stats={{
          words: draftMeta?.words ?? null,
          materials: railWork ? materialCount : null,
          versions: revisions?.length ?? null,
          parts: manuscript?.sectionCount ?? null,
        }}
      />
    </StudioShell>
  );
}
