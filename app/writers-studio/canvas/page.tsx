'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from '../pressTheme';
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
import Companion from './Companion';
import StructureRail from './StructureRail';
import DevelopmentalReview from './DevelopmentalReview';
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

type MobilePane = 'work' | 'materials' | 'maia' | 'history';
/** What the writer is doing in the room. Modes change the CENTRE, not the room. */
type Mode = 'write' | 'develop' | 'reader';
type ListPhase = 'loading' | 'ready' | 'none' | 'unauthorized' | 'error';

/** Same rule as Studio Home: return by identity, never by position. */
const byIdentity = (href: string, manuscriptId: string) =>
  `${href}&m=${encodeURIComponent(manuscriptId)}`;

function RailSection({
  label,
  count,
  children,
  defaultOpen = true,
}: {
  label: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b" style={{ borderColor: PRESS.ruleSoft }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-baseline gap-2 px-5 py-3.5 text-left"
      >
        <span className="text-[10.5px] tracking-[0.2em] uppercase opacity-45">{label}</span>
        {typeof count === 'number' && count > 0 && (
          <span className="text-[10.5px] opacity-30">{count}</span>
        )}
        <span className="flex-1" />
        <span className="text-[10px] opacity-30">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </section>
  );
}

/**
 * The writer names their own book.
 *
 * An imported manuscript is titled from the FILENAME it arrived as, so a book
 * whose first page reads "Elemental Alchemy" shows up in the Studio as
 * "book-print-kdp-final". The room does not guess a better title from the
 * document — a title is an authoring act — so it gives the writer the pen.
 */
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
   * Which manuscript is on the table.
   *
   * ⚠️ NEVER SUBSTITUTE. An earlier version fell back to the most recent
   * manuscript when the requested id was not in the list — "degrading, not
   * stranding". Production disproved that reading on 2026-08-27: opening one
   * manuscript showed a DIFFERENT manuscript's draft, under the title of the
   * one that was opened, with a grey sentence as the only signal. A writer
   * cannot tell that from their own work having been replaced.
   *
   *   no id asked for   → the most recent is a reasonable place to land
   *   id asked for, found   → open it
   *   id asked for, NOT found → open NOTHING and say so
   *
   * Showing the wrong text under the right title is worse than showing none.
   */
  const asked = requested !== null;
  const found = asked ? (manuscripts.find((m) => m.id === requested) ?? null) : null;
  const missing = listPhase === 'ready' && asked && found === null;
  const manuscript =
    listPhase === 'ready' ? (asked ? found : (manuscripts[0] ?? null)) : null;

  const [mode, setMode] = useState<Mode>('write');
  const [handed, setHanded] = useState<{ key: string; message: string } | null>(null);
  const [maiaOpen, setMaiaOpen] = useState(true);
  const [mobilePane, setMobilePane] = useState<MobilePane>('maia');
  const [draftMeta, setDraftMeta] = useState<{
    updatedAt: string | null;
    revisionCount: number | null;
  } | null>(null);

  // ---- Structure: the member's carried cuts ------------------------------
  // Read once per manuscript, from the immutable Source. These are the parts
  // the member confirmed at the import threshold — the system proposes none.
  // The rail's live ranges come from the table (which holds the text); this
  // read only supplies identity, order, and the member's own heading words.
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

  const workPanel = (
    <WorkDrawer
      works={works}
      unitedWork={unitedWork}
      manuscript={manuscript ? { id: manuscript.id, title: manuscript.title } : null}
      manuscriptLabel={manuscriptLabel}
      onChanged={reloadWorks}
    />
  );

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
  const structurePanel = manuscript && manuscript.sectionCount > 1 && (
    <RailSection label="Structure" count={manuscript.sectionCount}>
      <StructureRail
        expressionLabel={`${manuscriptLabel} — manuscript`}
        parts={parts}
        map={draftMap}
        focusKey={focusKey}
        onFocusKey={handleFocusKey}
        sourceHref={byIdentity(SOURCE_HREF, manuscript.id)}
      />
    </RailSection>
  );

  const companion = (
    <Companion
      workId={railWork?.id ?? null}
      manuscriptId={manuscript?.id ?? null}
      roomKey={`${railWork?.id ?? '-'}:${manuscript?.id ?? '-'}`}
      handed={handed}
      onHandled={() => setHanded(null)}
    />
  );

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: PRESS.bg, color: PRESS.text, fontFamily: SERIF }}
    >
      {/* ── The head of the room: what am I making, and where do I stand. ── */}
      <header
        className="px-5 md:px-8 pt-4 pb-3.5 border-b shrink-0"
        style={{ borderColor: PRESS.rule }}
      >
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <Link
            href="/writers-studio"
            className="text-[10.5px] tracking-[0.2em] uppercase opacity-35 hover:opacity-75"
          >
            ← Studio
          </Link>
          <h1
            className="text-[21px] md:text-[24px] leading-tight"
            style={{ fontFamily: SERIF, opacity: headlineNamed ? 1 : 0.75 }}
          >
            {headline}
          </h1>
          {manuscript && (
            <span className="flex items-baseline gap-3">
              {(['write', 'develop', 'reader'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="text-[10.5px] tracking-[0.18em] uppercase transition-opacity"
                  style={{
                    opacity: mode === m ? 1 : 0.35,
                    color: mode === m ? PRESS.accent : undefined,
                  }}
                >
                  {m === 'write' ? 'Write' : m === 'develop' ? 'Develop' : 'Reader'}
                </button>
              ))}
            </span>
          )}
          {manuscript && (
            <ManuscriptName
              manuscriptId={manuscript.id}
              title={manuscript.title}
              onRenamed={(t) =>
                setManuscripts((list) =>
                  list.map((m) => (m.id === manuscript.id ? { ...m, title: t } : m)),
                )
              }
            />
          )}
          <span className="flex-1" />
          {/* Orientation, not measurement: authored facts only. */}
          <span className="text-[11.5px] opacity-45">
            {draftMeta?.updatedAt ? `last touched ${formatWhen(draftMeta.updatedAt)}` : ''}
          </span>
        </div>

        {/* The member's one statement, in their words — shown only when their
            own declaration united work and table. */}
        {unitedWork?.purpose && (
          <p
            className="text-[13px] leading-relaxed opacity-55 mt-1 max-w-xl italic"
            style={{ fontFamily: SERIF }}
          >
            {unitedWork.purpose}
          </p>
        )}

        {/* What is actually on the table — a factual line, not a claim. */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11.5px] opacity-45">
          {unitedWork && manuscript && (
            <span>On the table: {manuscriptLabel} — a form of this work, declared by you.</span>
          )}
          {manuscript && !asked && manuscripts.length > 1 && (
            <span>The most recent of your {manuscripts.length} manuscripts is on the table.</span>
          )}
          {railWork && (
            <span>
              {materialCount === 0
                ? 'Nothing brought in yet'
                : `${materialCount} material${materialCount === 1 ? '' : 's'} feeding this work`}
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* ── Left rail: the work and what feeds it, OPEN. ────────────────── */}
        <aside
          className="hidden md:flex md:flex-col w-[17.5rem] shrink-0 border-r overflow-y-auto"
          style={{ borderColor: PRESS.ruleSoft }}
        >
          <RailSection label="Work">{workPanel}</RailSection>
          <RailSection label="Materials" count={materialCount}>
            {materialsPanel}
          </RailSection>
          {structurePanel}
          <RailSection label="Versions" count={revisions?.length ?? 0} defaultOpen={false}>
            {historyPanel}
          </RailSection>
        </aside>

        {/* ── The worktable: the centre, always the largest thing. ────────── */}
        <main className="flex-1 min-w-0 flex flex-col px-5 md:px-10 py-5 overflow-hidden">
          {listPhase === 'loading' && <p className="text-[14px] opacity-40">opening…</p>}
          {listPhase === 'error' && (
            <p className="text-[15px] opacity-70 max-w-md leading-relaxed">
              The Canvas could not be reached just now. Your work is not affected — please try
              again in a moment.
            </p>
          )}
          {missing && (
            <div className="max-w-md">
              <p className="text-[16px] leading-relaxed opacity-80 mb-4">
                That manuscript is not on your shelf.
              </p>
              <p className="text-[14px] leading-relaxed opacity-55 mb-5">
                Nothing has been opened, and nothing has been changed. The Studio
                will not put a different manuscript on the table in its place —
                the wrong writing under the right name is worse than none.
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
          )}
          {listPhase === 'none' && (
            <div className="max-w-md">
              <p className="text-[16px] leading-relaxed opacity-75 mb-5">
                Nothing is on the table yet.
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
          {manuscript && mode !== 'write' && (
            <DevelopmentalReview
              key={mode}
              manuscriptId={manuscript.id}
              workId={railWork?.id ?? null}
              mode={mode === 'reader' ? 'reader' : 'developmental'}
              /* Evidence is a door: open the part it lives in, on the table. */
              onOpenPart={(partLabel) => {
                /* Evidence names a part by the member's own heading words,
                   which is exactly what the map keys regions by. */
                const region = draftMap?.regions.find((r) => r.heading === partLabel);
                if (region) setFocusKey(region.key);
                setMode('write');
              }}
              /* Discuss hands MAIA the finding AND its passages, so she is
                 already holding what the writer is pointing at. */
              onDiscuss={(f) => {
                const passages = f.evidence
                  .filter((e) => e.quote)
                  .map((e) => `${e.partLabel ? `[${e.partLabel}] ` : ''}"${e.quote}"`)
                  .join('\n\n');
                setHanded({
                  key: `finding:${f.id}`,
                  message: `About your finding "${f.title}" — you said: ${f.observation}${
                    f.why ? ` (because ${f.why})` : ''
                  }\n\nThe passages you pointed at:\n\n${passages}\n\nLet's talk about it.`,
                });
                if (!maiaOpen) setMaiaOpen(true);
              }}
            />
          )}
          {/* The table stays mounted while developing: unmounting it would
              flush and tear down the draft session on every mode switch. */}
          <div className={mode === 'write' ? 'flex-1 flex flex-col min-h-0' : 'hidden'}>
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
          </div>
        </main>

        {/* ── MAIA: present in the room, not a folded promise. ────────────── */}
        {maiaOpen ? (
          <aside
            className="hidden md:flex md:flex-col w-[21rem] shrink-0 border-l min-h-0"
            style={{ borderColor: PRESS.ruleSoft }}
          >
            {companion}
            <button
              onClick={() => setMaiaOpen(false)}
              className="shrink-0 text-[10.5px] tracking-[0.16em] uppercase opacity-30 hover:opacity-70 py-2"
            >
              fold away
            </button>
          </aside>
        ) : (
          <button
            onClick={() => setMaiaOpen(true)}
            aria-label="Open MAIA"
            className="hidden md:flex w-10 shrink-0 border-l items-start justify-center pt-6 opacity-40 hover:opacity-90"
            style={{ borderColor: PRESS.ruleSoft }}
          >
            <span className="text-[10.5px] tracking-[0.2em] uppercase [writing-mode:vertical-rl]">
              MAIA
            </span>
          </button>
        )}
      </div>

      {/* ── Mobile: the same room, one pane at a time — named, not cryptic. ── */}
      <div className="md:hidden border-t shrink-0" style={{ borderColor: PRESS.rule }}>
        <div className="flex">
          {(['maia', 'materials', 'work', 'history'] as MobilePane[]).map((p) => (
            <button
              key={p}
              onClick={() => setMobilePane(p)}
              className="flex-1 py-2.5 text-[10.5px] tracking-[0.16em] uppercase transition-opacity"
              style={{
                opacity: mobilePane === p ? 1 : 0.4,
                color: mobilePane === p ? PRESS.accent : undefined,
              }}
            >
              {p === 'maia' ? 'MAIA' : p === 'history' ? 'Versions' : p}
            </button>
          ))}
        </div>
        <div className="max-h-[52vh] overflow-y-auto border-t" style={{ borderColor: PRESS.ruleSoft }}>
          {mobilePane === 'maia' && <div className="h-[52vh]">{companion}</div>}
          {mobilePane === 'materials' && <div className="px-5 py-5">{materialsPanel}</div>}
          {mobilePane === 'work' && <div className="px-5 py-5">{workPanel}</div>}
          {mobilePane === 'history' && <div className="px-5 py-5">{historyPanel}</div>}
        </div>
      </div>
    </div>
  );
}
