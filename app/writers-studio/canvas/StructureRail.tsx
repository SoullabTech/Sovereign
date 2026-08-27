'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PRESS } from '../pressTheme';
import { pageEstimate } from '../../press/manuscript/workingDraftClient';
import { OPENING_KEY, regionLabel, type DeclaredPart, type DraftMap } from './manuscriptMap';

/**
 * The Structure rail — the parts of THIS EXPRESSION, as doors.
 *
 * Design authority: docs/design/author-studio/WORK_STRUCTURE_DESIGN_2026-08-05.md
 * and its persona walk (S1). Two rulings shape everything here:
 *
 *   S1 — the rail must say what it is a map OF. It maps the manuscript on the
 *        table, never the Work. A chapter list presented as *the* structure
 *        quietly collapses a Work into one of its expressions. One label
 *        prevents it, and that label is not optional.
 *
 *   Draft drift — the rail may not silently go stale. Parts the draft no
 *        longer contains are listed as such, in the member's own heading words,
 *        with no attempt to guess where they went. Only the writer knows.
 *
 * Refused here, per the design's own list: no auto-outline, no inferred
 * hierarchy, no invented parts, and no progress framing — this rail never says
 * "4 of 12 complete". It counts pages because pages are a fact about text; it
 * does not score a book against a plan it has no business assuming.
 */

interface StructureRailProps {
  /** What this rail is a map of. Named, per S1. */
  expressionLabel: string;
  parts: DeclaredPart[];
  map: DraftMap | null;
  focusKey: string | null;
  onFocusKey: (key: string | null) => void;
  /** The immutable Source, for reading the cuts as they arrived. */
  sourceHref: string;
}

/** How many parts before the rail is long enough to need finding, not reading. */
const FILTER_THRESHOLD = 12;

export default function StructureRail({
  expressionLabel,
  parts,
  map,
  focusKey,
  onFocusKey,
  sourceHref,
}: StructureRailProps) {
  const [filter, setFilter] = useState('');

  const regions = map?.regions ?? [];
  const adrift = map?.adrift ?? [];
  const unnamed = map?.unnamed ?? [];

  const needle = filter.trim().toLowerCase();
  const shown = useMemo(
    () =>
      needle
        ? regions.filter((r) => regionLabel(r).toLowerCase().includes(needle))
        : regions,
    [regions, needle],
  );

  return (
    <div>
      {/* S1: the label that keeps a chapter list from becoming the Work. */}
      <p className="text-[12px] leading-relaxed opacity-55 mb-1">{expressionLabel}</p>
      <p className="text-[11.5px] leading-relaxed opacity-40 mb-4">
        The cuts you carried in. Open one to work on it alone — the rest of the book stays exactly
        as it is.
      </p>

      {map === null ? (
        <p className="text-[13px] opacity-40">reading the draft…</p>
      ) : (
        <>
          <button
            onClick={() => onFocusKey(null)}
            className={`block w-full text-left text-[12.5px] py-1.5 mb-2 border-b transition-opacity ${
              focusKey === null ? 'opacity-100' : 'opacity-50 hover:opacity-85'
            }`}
            style={{
              borderColor: PRESS.ruleSoft,
              color: focusKey === null ? PRESS.accent : undefined,
            }}
          >
            Whole manuscript
          </button>

          {parts.length >= FILTER_THRESHOLD && (
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="find a part by name"
              aria-label="Find a part by name"
              className="w-full bg-transparent outline-none border-b pb-1 mb-3 text-[12.5px]"
              style={{ borderColor: PRESS.ruleSoft, color: PRESS.text }}
            />
          )}

          <ul className="space-y-0.5">
            {shown.map((r) => {
              const open = focusKey === r.key;
              const chars = r.end - r.start;
              return (
                <li key={r.key}>
                  <button
                    onClick={() => onFocusKey(open ? null : r.key)}
                    aria-current={open ? 'true' : undefined}
                    className={`block w-full text-left py-1 transition-opacity ${
                      open ? 'opacity-100' : 'opacity-65 hover:opacity-95'
                    }`}
                    style={open ? { color: PRESS.accent } : undefined}
                  >
                    <span className="block text-[13px] leading-snug">
                      {regionLabel(r)}
                      {r.key === OPENING_KEY && (
                        <span className="opacity-45"> — before your first heading</span>
                      )}
                    </span>
                    <span className="block text-[11px] opacity-40">
                      ~{pageEstimate(chars)} page{pageEstimate(chars) === 1 ? '' : 's'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {needle && shown.length === 0 && (
            <p className="text-[12.5px] opacity-45 mt-2">No part by that name.</p>
          )}

          {/* Drift, named rather than hidden. The rail does not guess where a
              rewritten heading went; it tells the writer what it can no longer
              find, so the stale entry is visible instead of quietly absent. */}
          {adrift.length > 0 && (
            <div className="mt-5 pt-3 border-t" style={{ borderColor: PRESS.ruleSoft }}>
              <p className="text-[11px] tracking-[0.12em] uppercase opacity-40 mb-2">
                Not found in the draft
              </p>
              <p className="text-[11.5px] leading-relaxed opacity-45 mb-2.5">
                {adrift.length === 1 ? 'This part was' : 'These parts were'} carried in, but{' '}
                {adrift.length === 1 ? 'its heading is' : 'their headings are'} no longer in your
                draft as written — renamed, rewritten, or folded into another part. Your words are
                not affected; only this map is.
              </p>
              <ul className="space-y-1">
                {adrift.map((p) => (
                  <li key={p.id} className="text-[12.5px] opacity-55">
                    {p.heading}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* WS2-01C — a part carried without a heading is NOT missing. Its
              words are in the draft; it simply has no line to make a door of.
              The rail used to file these under "Not found in the draft", which
              told the member their own front matter had gone — the leading
              unnamed part is now the opening region and is not listed at all,
              and any later one is described for what it is. */}
          {unnamed.length > 0 && (
            <div className="mt-5 pt-3 border-t" style={{ borderColor: PRESS.ruleSoft }}>
              <p className="text-[11px] tracking-[0.12em] uppercase opacity-40 mb-2">
                Carried without a heading
              </p>
              <p className="text-[11.5px] leading-relaxed opacity-45">
                {unnamed.length === 1 ? 'One part' : `${unnamed.length} parts`} arrived with no
                heading line, so {unnamed.length === 1 ? 'it has' : 'they have'} no door of{' '}
                {unnamed.length === 1 ? 'its' : 'their'} own. The words are in the draft, inside the
                part above. Give {unnamed.length === 1 ? 'it' : 'them'} a heading line and{' '}
                {unnamed.length === 1 ? 'it appears' : 'they appear'} here.
              </p>
            </div>
          )}

          <Link
            href={sourceHref}
            className="inline-block mt-5 text-[12px] underline underline-offset-4 opacity-50 hover:opacity-85"
          >
            Read the cuts as they arrived, in the Source
          </Link>
        </>
      )}
    </div>
  );
}
