'use client';

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Feather,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Library,
  Link2,
  Mic,
  NotebookPen,
  PenLine,
  Plus,
  Quote,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from './pressTheme';
import { IMPORT_HREF, SOURCE_HREF, WRITE_HREF } from './studioMap';
import { useCurrentManuscript } from './useCurrentManuscript';
import { UNTITLED_EXPRESSION } from './shellIdentity';
import { useLivingWorks } from './useLivingWorks';
import WorkCard from './WorkCard';

/**
 * Writer's Studio — Home. The doorway is simple; the architecture stays
 * sophisticated underneath.
 *
 * ── SLICE 6d (2026-08-05, Kelly): meet the person, not the architecture ────
 *
 * Nobody arrives thinking "I need to manage expressions inside a living
 * work". They arrive thinking "I want to write something · start a book ·
 * develop an idea · capture thoughts · organize research". So the room:
 *
 *   TOP      What are you creating today?  → five intention doors
 *   MIDDLE   My Projects                   → living_works as visual cards
 *   BOTTOM   Bring Something In            → materials + ingest
 *
 * The member experiences Idea → Development → Writing → Expression. The Work
 * model (living_works / living_work_expressions) remains the spine; its
 * vocabulary stays out of the member's way. MAIA does not lead — "Think with
 * MAIA" waits quietly in the header until wanted.
 *
 * The five doors are ENTRY POINTS, not products and not classifications: all
 * converge on the same three real instruments (a blank page · the declare
 * act · manuscript ingest). Walking through a door records NOTHING about the
 * member; type and stage are member words or absent (NEVER_AUTHORED_BY_THE_
 * SYSTEM). Material kinds beyond documents render plainly not-yet-available
 * (the studioMap honesty pattern) — a visible shape is allowed, a fake door
 * is not.
 */

const pageEstimate = (chars: number) => Math.max(1, Math.round(chars / 1800));
const pagesLabel = (chars: number) => {
  const n = pageEstimate(chars);
  return `${n} page${n === 1 ? '' : 's'}`;
};

const byIdentity = (href: string, manuscriptId: string) =>
  `${href}&m=${encodeURIComponent(manuscriptId)}`;

const ICON = { size: 15, strokeWidth: 1.5 } as const;

function ZoneLabel({ icon, name }: { icon: ReactNode; name: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5" style={{ color: PRESS.accent }}>
      <span className="opacity-80">{icon}</span>
      <p
        className="text-[12px] tracking-[0.25em] uppercase"
        style={{ color: PRESS.text, opacity: 0.65 }}
      >
        {name}
      </p>
    </div>
  );
}

function Zone({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`border p-6 md:p-7 ${className}`}
      style={{ borderColor: PRESS.ruleSoft, background: 'rgba(0,0,0,0.15)' }}
    >
      {children}
    </section>
  );
}

/** One intention door. Enters the Studio; classifies no one. */
function IntentDoor({
  icon,
  title,
  sub,
  onClick,
  href,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
  onClick?: () => void;
  href?: string;
}) {
  const inner = (
    <>
      <span style={{ color: PRESS.accent }} aria-hidden="true">
        {icon}
      </span>
      <span className="block text-[15px] mt-2.5" style={{ fontFamily: SERIF }}>
        {title}
      </span>
      <span className="block text-[12px] opacity-45 mt-1 leading-snug">{sub}</span>
    </>
  );
  const cls =
    'border p-5 text-left transition-opacity hover:opacity-100 opacity-85 min-h-[44px] block w-full';
  const style = { borderColor: PRESS.ruleSoft, background: 'rgba(0,0,0,0.15)' };
  // Explicit name: the walk found these doors exposing no accessible name.
  const label = `${title} — ${sub}`;
  return href ? (
    <Link href={href} className={cls} style={style} aria-label={label}>
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} className={cls} style={style} aria-label={label}>
      {inner}
    </button>
  );
}

export default function WriterStudioHome() {
  const { phase, manuscripts } = useCurrentManuscript();
  const { phase: worksPhase, works, reload: reloadWorks } = useLivingWorks();

  const hasWorks = worksPhase === 'ready' && works.length > 0;
  const projectsRef = useRef<HTMLDivElement | null>(null);
  const bringRef = useRef<HTMLDivElement | null>(null);

  /* Choose your adventure (Kelly, 08-05 — the ruled second doorway axis):
     "Where are you starting?" comes BEFORE "what kind of work?". The five
     intention doors open behind "Begin something new" — expanded by default
     only when the Studio is empty, because then beginning IS the adventure. */
  const [newOpen, setNewOpen] = useState<boolean | null>(null);

  const placedIds = new Set(
    works.flatMap((w) =>
      w.expressions.filter((e) => e.expressionType === 'manuscript').map((e) => e.expressionId)
    )
  );
  const unplaced = manuscripts.filter((m) => !placedIds.has(m.id));

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [placeBusy, setPlaceBusy] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  // The declare act, lifted to the page so the Idea/Research doors can open it.
  const [declaring, setDeclaring] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [declareBusy, setDeclareBusy] = useState(false);
  const [declareError, setDeclareError] = useState<string | null>(null);

  const openDeclare = () => {
    setDeclaring(true);
    projectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const declare = async () => {
    setDeclareBusy(true);
    setDeclareError(null);
    try {
      const title = draftName.trim();
      const res = await apiFetch('/api/sovereign/living-works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(title ? { title } : {}),
      });
      if (!res.ok) throw new Error(String(res.status));
      setDeclaring(false);
      setDraftName('');
      await reloadWorks();
    } catch {
      setDeclareError('Could not begin your project just now. Nothing was changed.');
    } finally {
      setDeclareBusy(false);
    }
  };

  /** The explicit gesture that creates the place to write. Nothing before it. */
  const startWriting = async () => {
    setStarting(true);
    setStartError(null);
    try {
      const res = await apiFetch('/api/sovereign/manuscripts/blank', { method: 'POST' });
      if (res.status === 401) {
        setStartError('Your Studio opens only to you. Please sign in again.');
        return;
      }
      if (!res.ok) {
        setStartError('Could not make a page just now. Nothing was lost — please try again.');
        return;
      }
      const data = await res.json().catch(() => ({}));
      window.location.href = data?.id
        ? `${WRITE_HREF}&m=${encodeURIComponent(data.id)}`
        : WRITE_HREF;
    } catch {
      setStartError('Could not reach the Studio just now. Please try again in a moment.');
    } finally {
      setStarting(false);
    }
  };

  /** The crossing: Material joins a project because the member said so. */
  const placeInto = async (workId: string, manuscriptId: string) => {
    setPlaceBusy(true);
    setPlaceError(null);
    try {
      const res = await apiFetch(`/api/sovereign/living-works/${workId}/expressions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expressionType: 'manuscript', expressionId: manuscriptId }),
      });
      if (!res.ok) throw new Error(String(res.status));
      await reloadWorks();
    } catch {
      setPlaceError('Could not place that just now. Nothing was changed.');
    } finally {
      setPlaceBusy(false);
    }
  };

  // ---- Signed out --------------------------------------------------------
  if (phase === 'unauthorized') {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 text-center"
        style={{ background: PRESS.bg, color: PRESS.text, fontFamily: SERIF }}
      >
        <div className="max-w-sm">
          <img
            src="/holoflower-studio-transparent.png"
            alt=""
            aria-hidden="true"
            className="w-12 h-12 mx-auto mb-5 opacity-90"
          />
          <p className="text-[13px] tracking-[0.25em] uppercase opacity-50 mb-3">
            Writer&rsquo;s Studio
          </p>
          <p className="text-[15px] leading-relaxed opacity-70">
            The Studio holds your own words, so it opens only to you.{' '}
            <a href="/signin" className="underline underline-offset-4">
              Sign in
            </a>{' '}
            to enter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: PRESS.bg, color: PRESS.text, fontFamily: SERIF }}
    >
      <div className="max-w-[1360px] mx-auto px-5 md:px-8 py-8 md:py-10">
        {/* ── Name of the place · MAIA waits, never leads ─────────────────── */}
        <header className="flex items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <img
              src="/holoflower-studio-transparent.png"
              alt=""
              aria-hidden="true"
              className="w-8 h-8 opacity-90"
            />
            <p className="text-[13px] tracking-[0.3em] uppercase opacity-55">
              Writer&rsquo;s Studio
            </p>
          </div>
          {/* Discoverable, never the doorway: the work calls MAIA, not the
              other way round. */}
          <Link
            href="/maia"
            className="text-[12px] underline underline-offset-4 opacity-35 hover:opacity-75"
          >
            Reflection with MAIA →
          </Link>
        </header>

        {phase === 'error' && (
          <p className="text-[14px] opacity-60 mb-8">
            The Studio could not be reached just now. Your work is not affected — please try
            again in a moment.
          </p>
        )}

        {/* ── TOP: choose your adventure. The first axis is WHERE you are
            starting, not what the thing is — a returning writer's adventure
            is usually "continue", and arrival must offer that as plainly as
            "begin". Doors, not classification; choosing records nothing. ── */}
        <h1 className="text-[24px] md:text-[28px] leading-snug opacity-90 mb-6">
          Where are you starting?
        </h1>
        {(() => {
          const hasAnything = hasWorks || manuscripts.length > 0;
          const showNew = newOpen ?? !hasAnything;
          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <IntentDoor
                  icon={<Sparkles {...ICON} size={18} />}
                  title="Begin something new"
                  sub="An idea, a page, a project"
                  onClick={() => setNewOpen(!showNew)}
                />
                {hasAnything ? (
                  <IntentDoor
                    icon={<Feather {...ICON} size={18} />}
                    title="Continue your work"
                    sub="Pick up where you left off"
                    onClick={() =>
                      projectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  />
                ) : (
                  /* An honest door: nothing to continue until something exists. */
                  <div
                    className="border p-5 opacity-30"
                    style={{ borderColor: PRESS.ruleSoft }}
                    aria-disabled="true"
                  >
                    <span style={{ color: PRESS.accent }}>
                      <Feather {...ICON} size={18} />
                    </span>
                    <span className="block text-[15px] mt-2.5" style={{ fontFamily: SERIF }}>
                      Continue your work
                    </span>
                    <span className="block text-[12px] opacity-60 mt-1">
                      Nothing here yet — it begins next door
                    </span>
                  </div>
                )}
                <IntentDoor
                  icon={<FolderOpen {...ICON} size={18} />}
                  title="Bring something in"
                  sub="A document you already have"
                  onClick={() =>
                    bringRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                />
              </div>

              {/* The second axis, revealed by the first: what kind of thing. */}
              {!showNew ? (
                <div className="mb-12" />
              ) : (
                <>
                  <p className="text-[12px] tracking-[0.25em] uppercase opacity-40 mb-4">
                    What are you bringing into form?
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
          <IntentDoor
            icon={<Sparkles {...ICON} size={18} />}
            title="Capture an idea"
            sub="A thought, question, inspiration"
            onClick={openDeclare}
          />
          <IntentDoor
            icon={<PenLine {...ICON} size={18} />}
            title="Start writing"
            sub="Essay, article, story, reflection"
            onClick={() => void startWriting()}
          />
          <IntentDoor
            icon={<BookOpen {...ICON} size={18} />}
            title="Develop a major work"
            sub="Book, dissertation, long-form"
            href={IMPORT_HREF}
          />
          <IntentDoor
            icon={<Mic {...ICON} size={18} />}
            title="Create something to share"
            sub="Talk, course, campaign"
            onClick={openDeclare}
          />
                    <IntentDoor
                      icon={<Library {...ICON} size={18} />}
                      title="Explore and research"
                      sub="Study, investigation, collection"
                      onClick={openDeclare}
                    />
                  </div>
                </>
              )}
            </>
          );
        })()}
        {(starting || startError) && (
          <p role={startError ? 'alert' : undefined} className="text-[13px] opacity-70 -mt-8 mb-8">
            {startError ?? 'making a page…'}
          </p>
        )}

        {/* ── MIDDLE: My Projects ────────────────────────────────────────── */}
        {/* ── MIDDLE: Your Work — the emotional centre. Living creative
            bodies, not project-management items. ─────────────────────────── */}
        <div ref={projectsRef}>
          <ZoneLabel icon={<Feather {...ICON} />} name="Your Work" />
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mb-12">
            {hasWorks &&
              works.map((w) => (
                <WorkCard key={w.id} work={w} manuscripts={manuscripts} reload={reloadWorks} />
              ))}

            {/* Begin a project — the declare act. Creates a work; names it only
                if the member does. */}
            {declaring ? (
              <div
                className="border border-dashed p-6"
                style={{ borderColor: PRESS.rule, background: 'rgba(0,0,0,0.1)' }}
              >
                <label htmlFor="np-name" className="block text-[14px] opacity-70 mb-3">
                  What are you working on?
                </label>
                <input
                  id="np-name"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !declareBusy) void declare();
                    if (e.key === 'Escape') setDeclaring(false);
                  }}
                  autoFocus
                  className="press-field w-full bg-transparent border-b py-2 text-[17px] outline-none"
                  style={{ borderColor: PRESS.rule, fontFamily: SERIF }}
                />
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <button
                    onClick={() => void declare()}
                    disabled={declareBusy}
                    className="px-5 py-2 text-[13px] tracking-wide disabled:opacity-30"
                    style={{ background: PRESS.accent, color: PRESS.ink }}
                  >
                    {declareBusy ? '…' : 'Begin'}
                  </button>
                  <span className="text-[12px] opacity-45">A name can come later.</span>
                  <button
                    onClick={() => {
                      setDeclaring(false);
                      setDraftName('');
                    }}
                    className="text-[12px] opacity-50 hover:opacity-80 ml-auto"
                  >
                    cancel
                  </button>
                </div>
                {declareError && (
                  <p role="alert" className="text-[12px] mt-3 opacity-80">
                    {declareError}
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={openDeclare}
                aria-label="New project"
                className="border border-dashed p-6 flex flex-col items-center justify-center gap-2 opacity-55 hover:opacity-90 min-h-[160px]"
                style={{ borderColor: PRESS.rule }}
              >
                <Plus {...ICON} size={18} aria-hidden="true" />
                <span className="text-[14px]" style={{ fontFamily: SERIF }}>
                  New project
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ── BOTTOM: Bring Something In ─────────────────────────────────── */}
        <div ref={bringRef}>
        <Zone>
          <ZoneLabel icon={<FolderOpen {...ICON} />} name="Bring Something In" />

          {/* One real door today; the rest of the shape shown plainly not-yet.
              A muted tile is honest; a clickable one would be a fake door. */}
          <div className="flex flex-wrap gap-4 mb-7">
            <Link
              href={IMPORT_HREF}
              aria-label="Bring in a document"
              className="border px-5 py-4 text-center opacity-90 hover:opacity-100"
              style={{ borderColor: PRESS.accent }}
            >
              <span style={{ color: PRESS.accent }} className="inline-block" aria-hidden="true">
                <FileText {...ICON} size={18} />
              </span>
              <span className="block text-[13px] mt-1.5">Document</span>
            </Link>
            {[
              { icon: <ImageIcon {...ICON} size={18} />, label: 'Image' },
              { icon: <Quote {...ICON} size={18} />, label: 'Quote' },
              { icon: <NotebookPen {...ICON} size={18} />, label: 'Note' },
              { icon: <Mic {...ICON} size={18} />, label: 'Recording' },
              { icon: <Link2 {...ICON} size={18} />, label: 'Link' },
            ].map((t) => (
              <div
                key={t.label}
                className="border px-5 py-4 text-center opacity-25"
                style={{ borderColor: PRESS.ruleSoft }}
                aria-disabled="true"
              >
                {t.icon}
                <span className="block text-[13px] mt-1.5">{t.label}</span>
                <span className="block text-[10px] tracking-[0.15em] uppercase mt-0.5">
                  not yet
                </span>
              </div>
            ))}
          </div>

          {/* Writing not yet placed in a project. */}
          {unplaced.length > 0 && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {unplaced.map((m) => (
                <div key={m.id}>
                  <p
                    className="text-[16px] leading-snug mb-1"
                    style={m.title ? undefined : { opacity: 0.7 }}
                  >
                    {m.title ?? UNTITLED_EXPRESSION}
                  </p>
                  <p className="text-[13px] opacity-45 mb-2.5">
                    writing · {pagesLabel(m.charCount)}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-[13px]">
                    <Link
                      href={byIdentity(WRITE_HREF, m.id)}
                      className="underline underline-offset-4 opacity-70 hover:opacity-100"
                    >
                      Open
                    </Link>
                    <Link
                      href={byIdentity(SOURCE_HREF, m.id)}
                      className="opacity-50 hover:opacity-80 underline underline-offset-4"
                    >
                      Source
                    </Link>
                  </div>
                  {hasWorks && (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {works.map((w) => (
                        <button
                          key={w.id}
                          onClick={() => void placeInto(w.id, m.id)}
                          disabled={placeBusy}
                          className="text-[13px] underline underline-offset-4 opacity-55 hover:opacity-90 min-h-[44px] disabled:opacity-30"
                        >
                          Place in &ldquo;{w.title ?? 'your project'}&rdquo;
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {placeError && (
            <p role="alert" className="text-[13px] mt-4 opacity-80">
              {placeError}
            </p>
          )}
        </Zone>
        </div>
      </div>
    </div>
  );
}
