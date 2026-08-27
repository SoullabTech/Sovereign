'use client';

import { type ReactNode, useState } from 'react';
import { PRESS, SERIF } from '../pressTheme';
import { regionLabel, type DraftMap } from './manuscriptMap';

/**
 * WS-WRITE — the writing field.
 *
 * Design authority: docs/design/writer-studio/references/04-writing-field-wide.png
 * Secondary: 08-writing-field-compact.png, for the MAIA disposition row only.
 * Programme: WRITERS-STUDIO-V2, unit WS2-01.
 *
 * ── The one rule of this composition ────────────────────────────────────────
 *
 * The manuscript is visually dominant. Everything else in this field is in
 * service of it, and the layout has to enforce that rather than hope for it:
 * the centre column is the only `flex-1` in the row, so every panel beside it
 * is a fixed width and the prose takes whatever is left. A panel cannot grow
 * its way into being the main event.
 *
 * That is not decoration. The room being replaced put the manuscript in a
 * `main` between two asides and then let the rails accumulate — Work,
 * Materials, Structure, Versions, all stacked in one 17.5rem column of
 * accordions — until the writing surface was a slot in a control panel. The
 * reference is unambiguous about which way that goes.
 *
 * ── What this file does NOT do ──────────────────────────────────────────────
 *
 * It does not fetch. Every panel here is handed in by the room, which owns
 * identity, custody and loading — WS2-01A's whole point was that the room may
 * not open a manuscript nobody named, and a field that fetched its own would
 * be a second place for that to go wrong.
 *
 * It does not invent data. Where the reference shows numbers the substrate does
 * not have, this field shows an honest absence. The screenshot is a spatial and
 * interaction specification, not seed data.
 */

interface WriteFieldProps {
  /** The manuscript's own parts — the second column. */
  manuscriptColumn: ReactNode;
  /** The writing surface. The centre. The largest thing. */
  worktable: ReactNode;
  /** MAIA, adjacent to the writing — not folded away behind a tab. */
  companion: ReactNode;
  /** Materials, visible within the writing field. */
  materials: ReactNode;
  /** Versions, in the lower band. */
  versions: ReactNode;
  /** The living map, for the Outline tab of the lower band. */
  draftMap: DraftMap | null;
  focusKey: string | null;
  onFocusKey: (key: string | null) => void;
  /** Real, computed facts only. Null where the substrate has none. */
  stats: {
    words: number | null;
    materials: number | null;
    versions: number | null;
    parts: number | null;
  };
}

const COL = {
  manuscript: 'w-[15rem]',
  maia: 'w-[20.5rem]',
  materials: 'w-[16.5rem]',
} as const;

type LowerTab = 'outline' | 'versions' | 'goals' | 'statistics';

export default function WriteField({
  manuscriptColumn,
  worktable,
  companion,
  materials,
  versions,
  draftMap,
  focusKey,
  onFocusKey,
  stats,
}: WriteFieldProps) {
  const [tab, setTab] = useState<LowerTab>('outline');
  const [bandOpen, setBandOpen] = useState(true);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* ── The writing row ──────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0">
        {/* Manuscript — the member's own parts, in their order. */}
        <aside
          className={`hidden lg:flex lg:flex-col ${COL.manuscript} shrink-0 border-r overflow-y-auto`}
          style={{ borderColor: PRESS.ruleSoft }}
        >
          {manuscriptColumn}
        </aside>

        {/* The manuscript itself. The only flex-1 in this row, on purpose. */}
        <main className="flex-1 min-w-0 flex flex-col px-5 md:px-9 py-5 overflow-hidden">
          {worktable}
        </main>

        {/* MAIA — adjacent to the writing, at the writing's own scale. */}
        <aside
          className={`hidden md:flex md:flex-col ${COL.maia} shrink-0 border-l min-h-0`}
          style={{ borderColor: PRESS.ruleSoft }}
        >
          {companion}
        </aside>

        {/* Materials — present in the writing field, not a separate errand.
            This is the writing-context relationship only; Materials Studio
            (WS2-06) is a different creative distance and is not built here. */}
        <aside
          className={`hidden xl:flex xl:flex-col ${COL.materials} shrink-0 border-l min-h-0 overflow-y-auto`}
          style={{ borderColor: PRESS.ruleSoft }}
        >
          {materials}
        </aside>
      </div>

      {/* ── The lower band ───────────────────────────────────────────────── */}
      <div className="shrink-0 border-t" style={{ borderColor: PRESS.rule }}>
        <div className="flex items-center gap-1 px-4 md:px-6">
          {(['outline', 'versions', 'goals', 'statistics'] as LowerTab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setBandOpen(true);
              }}
              className="px-3 py-2 text-[10.5px] tracking-[0.18em] uppercase transition-opacity"
              style={{
                opacity: bandOpen && tab === t ? 1 : 0.35,
                color: bandOpen && tab === t ? PRESS.accent : undefined,
              }}
            >
              {t}
            </button>
          ))}
          <button
            onClick={() => setBandOpen((o) => !o)}
            className="ml-auto px-3 py-2 text-[10.5px] tracking-[0.16em] uppercase opacity-30 hover:opacity-70"
            aria-expanded={bandOpen}
          >
            {bandOpen ? 'fold' : 'open'}
          </button>
        </div>

        {bandOpen && (
          <div
            className="max-h-[15rem] overflow-y-auto border-t px-4 md:px-6 py-4"
            style={{ borderColor: PRESS.ruleSoft }}
          >
            {tab === 'outline' && (
              <Outline map={draftMap} focusKey={focusKey} onFocusKey={onFocusKey} />
            )}
            {tab === 'versions' && versions}
            {tab === 'goals' && <Goals />}
            {tab === 'statistics' && <Statistics stats={stats} />}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The parts of the draft as a horizontal run, the way the reference lays them
 * out along the bottom. Same regions the rail uses — one map, two views of it,
 * never two maps.
 */
function Outline({
  map,
  focusKey,
  onFocusKey,
}: {
  map: DraftMap | null;
  focusKey: string | null;
  onFocusKey: (key: string | null) => void;
}) {
  if (!map) return <p className="text-[12.5px] opacity-40">reading the draft…</p>;
  if (map.regions.length === 0) {
    return <p className="text-[12.5px] opacity-40">This draft has no parts to lay out yet.</p>;
  }
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {map.regions.map((r) => {
        const open = focusKey === r.key;
        return (
          <button
            key={r.key}
            onClick={() => onFocusKey(open ? null : r.key)}
            className="shrink-0 max-w-[11rem] text-left border rounded-sm px-3 py-2 transition-opacity"
            style={{
              borderColor: open ? PRESS.accent : PRESS.ruleSoft,
              opacity: open ? 1 : 0.6,
            }}
          >
            <span className="block text-[12px] leading-snug truncate" style={{ fontFamily: SERIF }}>
              {regionLabel(r)}
            </span>
            <span className="block text-[10.5px] opacity-45 mt-0.5 tabular-nums">
              {(r.end - r.start).toLocaleString()} chars
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Goals — the one capability WS2-01 was authorized to ADD.
 *
 * The reference shows goal bars with percentages against them. There is no goal
 * substrate in this repository: no table, no route, nothing a writer has ever
 * declared. So this region holds its place in the band and says what is true.
 *
 * The alternative was to ship the reference's numbers — "Finish first complete
 * draft 82%" — which would be a fabricated measurement of the member's own
 * work, and is refused by DECISIONS D-003 regardless of how good it looks
 * beside the image. Goal progress becomes showable when there is a writer-
 * declared target to measure against, and not one moment earlier.
 */
function Goals() {
  return (
    <div className="max-w-md">
      <p className="text-[13px] leading-relaxed opacity-65 mb-2">
        You have not set any goals for this work.
      </p>
      <p className="text-[12px] leading-relaxed opacity-40">
        When you do, this is where they will sit — measured against the target you declared,
        never against one the Studio assumed for you. Setting them arrives with WS2-10.
      </p>
    </div>
  );
}

/**
 * Statistics — counts, which are facts about text, and nothing else.
 *
 * Word count, material count, version count, part count. The reference also
 * shows a completion ring; a percentage of "complete" is a judgment about a
 * work only its writer can make, so it is not here.
 */
function Statistics({
  stats,
}: {
  stats: { words: number | null; materials: number | null; versions: number | null; parts: number | null };
}) {
  const rows: { label: string; value: number | null }[] = [
    { label: 'Words', value: stats.words },
    { label: 'Parts carried in', value: stats.parts },
    { label: 'Materials', value: stats.materials },
    { label: 'Versions kept', value: stats.versions },
  ];
  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 max-w-2xl">
      {rows.map((r) => (
        <div key={r.label}>
          <dt className="text-[10.5px] tracking-[0.16em] uppercase opacity-35">{r.label}</dt>
          <dd className="text-[19px] mt-0.5 tabular-nums" style={{ fontFamily: SERIF }}>
            {r.value === null ? (
              <span className="text-[13px] opacity-35">not counted yet</span>
            ) : (
              r.value.toLocaleString()
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
