'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { PRESS, SERIF } from '../pressTheme';
import { STUDIO_MODES, type StudioModeId } from './studioModes';

/**
 * The shared Writer's Studio shell.
 *
 * Design authority: docs/design/writer-studio/references/04-writing-field-wide.png
 * Programme: WRITERS-STUDIO-V2, unit WS2-01.
 *
 * ── What a shell is, and what it is not ─────────────────────────────────────
 *
 * Five fields, one environment. The shell is what does NOT change when the
 * writer moves between creative distances: the brand, the work they are in,
 * whether it is saved, how much of it there is, the way back, and the five
 * doors. Everything else is the field's.
 *
 * This is the difference between the Studio and five applications that happen
 * to share a palette. The room being replaced had its chrome written inline in
 * the middle of the Canvas page, so "the shell" existed only in the Canvas and
 * would have been re-invented, slightly differently, by every field after it.
 *
 * ── Composition, from the reference ─────────────────────────────────────────
 *
 *   top bar     brand · back · work title + subtitle · FIVE MODES ·
 *               saved state · word count · search · member
 *   left rail   New Work · WORK SPACE · MAIA · TOOLS
 *   field       everything else — passed in as children
 *
 * The rail's own entries are NOT built here: a rail item that navigates
 * somewhere unbuilt would be the door-to-nowhere this programme refuses. The
 * shell renders the groups it is given and nothing it is not.
 */

export interface RailItem {
  /** The member's word for it. */
  label: string;
  /** Where it goes. Null means the destination is not built yet. */
  href: string | null;
  /** A count, when there is an honest one to show. Never a score. */
  count?: number | null;
  /** True when this is where the writer currently is. */
  current?: boolean;
}

export interface RailGroup {
  /** The small caps heading. Null for the first, unlabelled group. */
  label: string | null;
  items: RailItem[];
}

interface StudioShellProps {
  /** The work, as the member titled it. Null while it is still being read. */
  workTitle: string | null;
  /** Their subtitle or purpose line, verbatim. Never generated. */
  workSubtitle?: string | null;
  /** Which of the five doors is lit. */
  mode: StudioModeId;
  /** Build the href for a mode — the shell does not invent routes. */
  hrefForMode: (id: StudioModeId) => string;
  /** Saved-state line, already phrased by the field that owns the draft. */
  savedLabel?: string | null;
  /** Word count, when the field has a real one. Never estimated for show. */
  wordCount?: number | null;
  /** The rail, composed by the field so it can name its own current place. */
  rail: RailGroup[];
  children: ReactNode;
}

const RAIL_W = 'w-[13.5rem]';

export default function StudioShell({
  workTitle,
  workSubtitle,
  mode,
  hrefForMode,
  savedLabel,
  wordCount,
  rail,
  children,
}: StudioShellProps) {
  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: PRESS.bg, color: PRESS.text, fontFamily: SERIF }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header
        className="shrink-0 flex items-center gap-4 px-4 md:px-6 h-14 border-b"
        style={{ borderColor: PRESS.rule }}
      >
        <Link href="/writers-studio" className="flex items-center gap-2.5 shrink-0 group">
          <span
            className="w-6 h-6 rounded-full border shrink-0"
            style={{ borderColor: PRESS.accent, opacity: 0.85 }}
            aria-hidden
          />
          <span className="hidden lg:block leading-none">
            <span className="block text-[12.5px] tracking-[0.09em]">SOULLAB</span>
            <span
              className="block text-[8.5px] tracking-[0.22em] uppercase opacity-45 mt-0.5"
              style={{ color: PRESS.accent }}
            >
              Writer&rsquo;s Studio
            </span>
          </span>
        </Link>

        <Link
          href="/writers-studio"
          aria-label="Back to Studio Home"
          className="shrink-0 text-[15px] opacity-35 hover:opacity-80 px-1"
        >
          ←
        </Link>

        {/* The work. Named, or honestly unnamed — never a placeholder title. */}
        <div className="min-w-0 shrink">
          <p
            className="text-[15px] leading-tight truncate"
            style={{ opacity: workTitle ? 1 : 0.5 }}
          >
            {workTitle ?? 'No writing on the table'}
          </p>
          {workSubtitle && (
            <p className="text-[11.5px] leading-tight opacity-45 truncate">{workSubtitle}</p>
          )}
        </div>

        {/* ── The five creative distances ───────────────────────────────── */}
        <nav aria-label="Studio fields" className="hidden md:flex items-center gap-1 mx-auto">
          {STUDIO_MODES.map((m) => {
            const here = m.id === mode;
            if (!m.realized) {
              /* Named, visible, and plainly not open. A disabled control that
                 says why is honest; a live one that opens nothing is not. */
              return (
                <span
                  key={m.id}
                  title={`${m.purpose} — not built yet (${m.unit})`}
                  aria-disabled="true"
                  className="px-3 py-1.5 text-[11px] tracking-[0.16em] uppercase opacity-25 cursor-default"
                >
                  {m.label}
                </span>
              );
            }
            return (
              <Link
                key={m.id}
                href={hrefForMode(m.id)}
                aria-current={here ? 'page' : undefined}
                className="px-3 py-1.5 text-[11px] tracking-[0.16em] uppercase rounded-sm transition-opacity"
                style={{
                  opacity: here ? 1 : 0.5,
                  color: here ? PRESS.accent : undefined,
                  borderBottom: here ? `1px solid ${PRESS.accent}` : '1px solid transparent',
                }}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto md:ml-0 flex items-center gap-4 shrink-0">
          {savedLabel && (
            <span className="hidden lg:inline text-[11.5px] opacity-50">{savedLabel}</span>
          )}
          {typeof wordCount === 'number' && (
            <span className="hidden xl:inline text-[11.5px] opacity-45 tabular-nums">
              {wordCount.toLocaleString()} words
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* ── Left rail ─────────────────────────────────────────────────── */}
        <aside
          className={`hidden md:flex md:flex-col ${RAIL_W} shrink-0 border-r overflow-y-auto py-4`}
          style={{ borderColor: PRESS.ruleSoft }}
        >
          {rail.map((group, gi) => (
            <div key={group.label ?? `g${gi}`} className="mb-5">
              {group.label && (
                <p className="px-4 mb-1.5 text-[9.5px] tracking-[0.2em] uppercase opacity-30">
                  {group.label}
                </p>
              )}
              <ul>
                {group.items.map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        aria-current={item.current ? 'page' : undefined}
                        className="flex items-baseline gap-2 px-4 py-1.5 text-[13px] transition-opacity"
                        style={{
                          opacity: item.current ? 1 : 0.6,
                          color: item.current ? PRESS.accent : undefined,
                        }}
                      >
                        <span className="truncate">{item.label}</span>
                        {typeof item.count === 'number' && (
                          <span className="ml-auto text-[11px] opacity-50 tabular-nums">
                            {item.count}
                          </span>
                        )}
                      </Link>
                    ) : (
                      /* No href — the destination does not exist yet. Shown
                         so the environment's shape is legible, dimmed so it
                         does not read as a control that failed. */
                      <span
                        className="flex items-baseline gap-2 px-4 py-1.5 text-[13px] opacity-22 cursor-default"
                        aria-disabled="true"
                      >
                        <span className="truncate">{item.label}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        {/* ── The field ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col">{children}</div>
      </div>
    </div>
  );
}
