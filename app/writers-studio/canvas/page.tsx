'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from '../pressTheme';
import { DEVELOP_HREF, IMPORT_HREF, SOURCE_HREF } from '../studioMap';
import { UNTITLED_EXPRESSION } from '../shellIdentity';
import { canvasForManuscript } from '../canvasIdentity';
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
import { requestStructureReading } from '@/lib/writersStudio/reviewClient';

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
 */

type DrawerId = 'work' | 'materials' | 'structure' | 'develop' | 'history';
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

  // By identity when asked; most recent otherwise — degrading, not stranding,
  // when the asked-for id is gone.
  const manuscript =
    listPhase === 'ready'
      ? (manuscripts.find((m) => m.id === requested) ?? manuscripts[0] ?? null)
      : null;

  const [drawer, setDrawer] = useState<DrawerId | null>(null);

  /* The reading gesture. THREE STATES, and 'failed' is its own — a reading
     that did not happen is a fact about the machine, never a reading in
     which MAIA found nothing. Those are different facts about a member's
     book and only one of them is about the book. */
  const router = useRouter();
  const [reading, setReading] = useState<'idle' | 'reading' | 'failed'>('idle');
  const [windowOpen, setWindowOpen] = useState(false);
  const [draftMeta, setDraftMeta] = useState<{
    updatedAt: string | null;
    revisionCount: number | null;
  } | null>(null);

  // History drawer contents — read when opened, re-read after a kept version.
  const [revisions, setRevisions] = useState<RevisionSummary[] | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  useEffect(() => {
    if (drawer !== 'history' || !manuscript) return;
    let cancelled = false;
    (async () => {
      const r = await loadRevisions(apiFetch, manuscript.id);
      if (!cancelled) setRevisions(r.kind === 'ok' ? r.revisions : null);
    })();
    return () => {
      cancelled = true;
    };
  }, [drawer, manuscript, historyKey]);

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

  // Structure exists only where structure exists: a single-section draft has
  // no Structure drawer, and its absence is correct, not a gap.
  const drawers: { id: DrawerId; label: string }[] = [
    { id: 'work', label: 'Work' },
    { id: 'materials', label: 'Materials' },
    ...(manuscript && manuscript.sectionCount > 1
      ? [{ id: 'structure' as DrawerId, label: 'Structure' }]
      : []),
    // Develop exists only where there is a Work to read. The reading itself
    // happens in its own room (BUILD-07D); this drawer is the door.
    ...(manuscript ? [{ id: 'develop' as DrawerId, label: 'Develop' }] : []),
    { id: 'history', label: 'History' },
  ];

  const drawerBody = (id: DrawerId) => {
    switch (id) {
      case 'work':
        /* The anchor of the Study Wall (first slice): identity tended here,
           the Shape declaration lives here. Everything member-authored. */
        return (
          <WorkDrawer
            works={works}
            unitedWork={unitedWork}
            manuscript={manuscript ? { id: manuscript.id, title: manuscript.title } : null}
            manuscriptLabel={manuscriptLabel}
            onChanged={reloadWorks}
          />
        );
      case 'materials':
        /* Belongings: sentence first, thing second, home stated. The bring
           gesture is the consent event; un-belonging deletes nothing. */
        return (
          <MaterialsDrawer
            work={unitedWork ?? (works.length === 1 ? works[0] : null)}
            manuscript={manuscript}
            manuscripts={manuscripts}
            onChanged={reloadWorks}
          />
        );
      case 'structure':
        return manuscript ? (
          <>
            <p className="text-[13px] leading-relaxed opacity-70 mb-3">
              {manuscript.sectionCount} sections, carried in with your import.
            </p>
            <Link
              href={byIdentity(SOURCE_HREF, manuscript.id)}
              className="text-[13px] underline underline-offset-4 opacity-60 hover:opacity-90"
            >
              Read them in the Source
            </Link>

            {/* THE INVOCATION. Nothing about the Work goes up this wire — the
                server owns the read end to end, and this button contributes the
                gesture and the member's identity, nothing else.

                The sentence beneath it is not reassurance copy. A member is
                about to let something read their book, and the true thing to
                say is that a reading changes nothing until they decide. It
                stays visible while the reading runs, because that is exactly
                when it is load-bearing. */}
            <div
              className="mt-6 pt-5 border-t"
              style={{ borderColor: PRESS.ruleSoft }}
            >
              <button
                onClick={async () => {
                  setReading('reading');
                  const outcome = await requestStructureReading(manuscript.id);
                  /* Navigate to the path the SERVER returned. Constructing it
                     here would be a second copy of a contract that already has
                     one home.

                     The path is checked, not assumed: the outcome's success
                     shape is asserted over parsed JSON rather than validated,
                     so a missing path would otherwise reach router.push as
                     undefined and throw in front of the member. A reading we
                     cannot open is a reading that did not land. */
                  if (outcome.ok && outcome.reviewPath) router.push(outcome.reviewPath);
                  else setReading('failed');
                }}
                disabled={reading === 'reading'}
                aria-busy={reading === 'reading'}
                className="text-[13px] underline underline-offset-4 opacity-75 hover:opacity-100 disabled:opacity-40 disabled:no-underline"
              >
                {reading === 'reading' ? 'MAIA is reading…' : 'Ask MAIA to read the structure'}
              </button>

              <p className="text-[12.5px] leading-relaxed opacity-55 mt-2.5">
                MAIA will bring back a reading of how the work seems to be
                organized. Nothing changes until you decide.
              </p>

              {/* No refusal code on screen. A failed reading has no taxonomy
                  that means anything about a book, and the second sentence is
                  the half that matters. */}
              {reading === 'failed' && (
                <p className="text-[12.5px] leading-relaxed opacity-75 mt-3" role="status">
                  MAIA couldn&rsquo;t complete the reading. Your work hasn&rsquo;t changed.
                </p>
              )}
            </div>
          </>
        ) : null;
      case 'develop':
        /* BUILD-07D — the door to the Develop room. Nothing is read from
           here; the room is where readings are asked for and encountered,
           by durable identity, so the door carries only the Work's id. */
        return manuscript ? (
          <>
            <p className="text-[13px] leading-relaxed opacity-70 mb-3">
              What MAIA noticed when she read this work developmentally, kept exactly as she
              noticed it. Ask for a reading there; nothing changes unless you change it.
            </p>
            <Link
              href={canvasForManuscript(DEVELOP_HREF, manuscript.id)}
              className="text-[13px] underline underline-offset-4 opacity-75 hover:opacity-100"
              data-develop-door
            >
              Open Develop
            </Link>
          </>
        ) : null;
      case 'history':
        return (
          <>
            <p className="text-[12.5px] leading-relaxed opacity-50 mb-4">
              Autosave holds your latest words continuously. Versions you keep are set down here,
              and nothing is ever silently overwritten.
            </p>
            {revisions === null ? (
              <p className="text-[13px] opacity-40">opening…</p>
            ) : revisions.length === 0 ? (
              <p className="text-[13px] opacity-55 leading-relaxed">
                No kept versions yet. “Keep a version” at the table sets one down.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {revisions.map((r) => (
                  <li
                    key={r.revisionNumber}
                    className="border px-4 py-2.5"
                    style={{ borderColor: PRESS.ruleSoft }}
                  >
                    <p className="text-[13px]">
                      Version {r.revisionNumber}
                      {r.note ? ` — ${r.note}` : ''}
                    </p>
                    <p className="text-[11.5px] opacity-45 mt-0.5">
                      ~{pageEstimate(r.contentChars)} page
                      {pageEstimate(r.contentChars) === 1 ? '' : 's'} · {formatWhen(r.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </>
        );
    }
  };

  const reflectionPanel = (
    <div className="flex flex-col px-5 py-6">
      <h2 className="text-[11px] tracking-[0.2em] uppercase opacity-40 mb-4">Reflection</h2>
      <p className="text-[13.5px] leading-relaxed opacity-70 max-w-[16rem]">{WINDOW_SENTENCE}</p>
      <button
        onClick={() => setWindowOpen(false)}
        className="mt-6 self-start text-[12px] opacity-45 hover:opacity-80 underline underline-offset-4"
      >
        fold away
      </button>
    </div>
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: PRESS.bg, color: PRESS.text, fontFamily: SERIF }}
    >
      {/* ── The head of the room: what am I working on, and where am I. ── */}
      <header className="px-6 md:px-10 pt-6 pb-5">
        <Link
          href="/writers-studio"
          className="inline-block text-[11px] tracking-[0.2em] uppercase opacity-40 hover:opacity-75 mb-3"
        >
          ← Author Studio
        </Link>
        <p className="text-[12px] tracking-[0.25em] uppercase opacity-45 mb-1.5">Writer Canvas</p>
        <h1
          className="text-[24px] md:text-[27px] leading-snug"
          style={{ fontFamily: SERIF, opacity: headlineNamed ? 1 : 0.75 }}
        >
          {headline}
        </h1>
        {/* The becoming — the member's one statement, in their words, shown
            only when the member's declaration united work and table. */}
        {unitedWork?.purpose && (
          <p
            className="text-[13px] leading-relaxed opacity-60 mt-1.5 max-w-md italic"
            style={{ fontFamily: SERIF }}
          >
            {unitedWork.purpose}
          </p>
        )}
        {/* Orientation, not measurement: authored facts only. */}
        {draftMeta && (
          <p className="text-[12.5px] mt-1.5 italic" style={{ color: PRESS.accent, opacity: 0.85 }}>
            drafting
            {draftMeta.updatedAt ? ` · last touched ${formatWhen(draftMeta.updatedAt)}` : ''}
          </p>
        )}
        {/* Legitimate now, and only now: the belonging is the member's own
            declaration, so saying it is honest display, not drawn containment. */}
        {unitedWork && manuscript && (
          <p className="text-[13px] opacity-55 mt-2">
            On the table: {manuscriptLabel} — a form of this work, declared by you.
          </p>
        )}
        {/* Several manuscripts, arrived without naming one: say which rule
            picked. A fact about the room, not a claim about the work. */}
        {manuscript && manuscripts.length > 1 && !manuscripts.some((m) => m.id === requested) && (
          <p className="text-[13px] opacity-50 mt-2">
            The most recent of your {manuscripts.length} manuscripts is on the table.
          </p>
        )}
      </header>

      <div
        className="flex-1 flex flex-col md:flex-row min-h-0 border-t"
        style={{ borderColor: PRESS.rule }}
      >
        {/* ── Study Wall: the folded spine. One drawer open at a time. ── */}
        <nav
          aria-label="This work"
          className="flex md:flex-col md:w-12 shrink-0 border-b md:border-b-0 md:border-r px-3 md:px-0 md:pt-8 gap-1"
          style={{ borderColor: PRESS.ruleSoft }}
        >
          {drawers.map((d) => {
            const open = drawer === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDrawer(open ? null : d.id)}
                aria-expanded={open}
                className={`text-[10.5px] tracking-[0.15em] uppercase px-2.5 py-2.5 md:px-0 md:py-3 md:[writing-mode:vertical-rl] transition-opacity ${
                  open ? 'opacity-100' : 'opacity-45 hover:opacity-80'
                }`}
                style={open ? { color: PRESS.accent } : undefined}
              >
                {d.label}
              </button>
            );
          })}
        </nav>

        {drawer && (
          <aside
            className="md:w-72 shrink-0 border-b md:border-b-0 md:border-r px-5 py-6 overflow-y-auto"
            style={{ borderColor: PRESS.ruleSoft }}
          >
            <h2 className="text-[11px] tracking-[0.2em] uppercase opacity-40 mb-4">
              {drawers.find((d) => d.id === drawer)?.label}
            </h2>
            {drawerBody(drawer)}
          </aside>
        )}

        {/* ── Worktable: the center, always the largest thing. ── */}
        <main className="flex-1 min-w-0 flex flex-col px-6 md:px-12 py-7">
          {listPhase === 'loading' && <p className="text-[14px] opacity-40">opening…</p>}
          {listPhase === 'error' && (
            <p className="text-[15px] opacity-70 max-w-md leading-relaxed">
              The Canvas could not be reached just now. Your work is not affected — please try
              again in a moment.
            </p>
          )}
          {listPhase === 'none' && (
            <div className="max-w-md">
              <p className="text-[16px] leading-relaxed opacity-75 mb-6">
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
          {manuscript && (
            <Worktable
              manuscriptId={manuscript.id}
              onMeta={setDraftMeta}
              onCheckpointed={() => setHistoryKey((k) => k + 1)}
            />
          )}
        </main>

        {/* ── Window: MAIA's folded presence. Opens only when invited, and in
            v0.1 opens onto one honest sentence — never an empty panel
            pretending to be a capability. ── */}
        <aside
          className={`hidden md:block shrink-0 border-l transition-all ${windowOpen ? 'w-80' : 'w-10'}`}
          style={{ borderColor: PRESS.ruleSoft }}
        >
          {windowOpen ? (
            reflectionPanel
          ) : (
            <button
              onClick={() => setWindowOpen(true)}
              aria-label="Reflection"
              title="Reflection"
              className="w-full flex justify-center pt-8 opacity-40 hover:opacity-80 transition-opacity"
            >
              <span
                className="w-2 h-2 rounded-full border"
                style={{ borderColor: PRESS.text }}
              />
            </button>
          )}
        </aside>
      </div>

      {/* The Window's mobile form: a quiet line under the field, same honesty. */}
      <div className="md:hidden border-t px-6 py-4" style={{ borderColor: PRESS.ruleSoft }}>
        {windowOpen ? (
          <div>
            <p className="text-[13px] leading-relaxed opacity-70 mb-2">{WINDOW_SENTENCE}</p>
            <button
              onClick={() => setWindowOpen(false)}
              className="text-[12px] opacity-45 underline underline-offset-4"
            >
              fold away
            </button>
          </div>
        ) : (
          <button
            onClick={() => setWindowOpen(true)}
            className="text-[11px] tracking-[0.2em] uppercase opacity-40"
          >
            Reflection
          </button>
        )}
      </div>
    </div>
  );
}
