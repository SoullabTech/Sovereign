'use client';

/**
 * THE ROOM, BUILT AROUND THE ENGINE.
 *
 * ⭐ Put the new room around the proven writing engine; do not rebuild the
 * engine to obtain the room.
 *
 * Everything here is presentation. The Work, the outline, the conversation and
 * the workbench arrive as slots, already wired by the canonical Writer's
 * Studio — this component decides only where they sit and how quiet they are.
 * It holds no manuscript state, performs no fetch, and owns no navigation.
 *
 * ⛔ WHAT DOES NOT COME ACROSS FROM THE PROTOTYPE: its fixture responder, its
 * ten-section corpus, and any wiring of a generic MAIA. The Ask MAIA gesture
 * here reaches the EXISTING Canvas conversation path, unchanged and unimproved
 * — which does not go through CanonicalTurn. Visual integration and
 * whole-organism MAIA integration are separable and stay separate; putting a
 * better panel in front of the old path and calling it finished is the specific
 * failure this integration was told to avoid.
 */

import { useCallback, useMemo, useState } from 'react';
import { GOLD, GROUND, INK, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';
import {
  CLOSED,
  RAIL_REM,
  WORKBENCH_BOTTOM_REM,
  WORKBENCH_REM,
  aperture,
  maiaBox,
  stripBox,
  structureBox,
  type OrbitState,
} from './fieldAperture';
import { TREATMENTS, resolve, sectionBoundary, type Treatment } from './fieldTreatments';

/** The three affordances the rail carries. Each says "I am here", none says "use me". */
const ORBITS = [
  { key: 'structure', label: 'Struct', title: 'Structure' },
  { key: 'maia', label: 'MAIA', title: 'MAIA' },
  { key: 'workbench', label: 'Work­bench', title: 'Workbench' },
] as const;

type OrbitKey = (typeof ORBITS)[number]['key'];

export interface FieldRoomProps {
  treatment: Treatment['key'];
  /** The Work. Rendered untouched, in the centre, in its own aperture. */
  work: React.ReactNode;
  structure: React.ReactNode;
  maia: React.ReactNode;
  workbench?: React.ReactNode;
  /**
   * The focus strip: the same attention as the frame in the manuscript, carried
   * into the conversation. Absent when the writer holds no focus — the strip is
   * never a permanent band, because a band that is always there is chrome.
   */
  focus?: (api: { openMaia: () => void }) => React.ReactNode;
  /**
   * Attached to the element containing the Work, so the room can hear the
   * writer's own selection acts without the substrate being modified to
   * announce them.
   */
  workRef?: (node: HTMLElement | null) => void;
  /**
   * Which section shells currently carry part of the held focus.
   *
   * ⚠️ SECTION-LEVEL PAINT, AND SAID SO. The prototype highlighted the exact
   * characters, using an API that addresses DOM text nodes; the substrate
   * renders each editable section as a <textarea>, whose value is not such a
   * node. Painting inside it would mean an overlay mirror, which means a seam
   * in the preserved component — a separate decision, not one to take by
   * reflex here. So the mark says WHICH SECTIONS the focus covers, and the
   * strip says exactly what is held. The focus MODEL is character-exact
   * regardless; only this mark is coarse.
   */
  focusedSectionIds?: string[];
  title: string;
  note?: string | null;
}

export default function FieldRoom({
  treatment, work, structure, maia, workbench, focus, workRef, focusedSectionIds, title, note,
}: FieldRoomProps) {
  /**
   * ⭐ ARRIVAL IS THE QUIET ROOM. Nothing is read from storage and nothing is
   * open. A room that restored three panels because they were open last week
   * would be deciding, on the writer's behalf, that their attention belongs
   * where it was — which is the opposite of what an orbit is for.
   */
  const [open, setOpen] = useState<OrbitState>(CLOSED);
  const t = TREATMENTS[treatment];

  const toggle = useCallback((k: OrbitKey) => {
    setOpen((o) => ({ ...o, [k]: !o[k] }));
  }, []);

  const a = useMemo(() => aperture(open), [open]);
  const strip = useMemo(() => stripBox(open), [open]);
  /* The one gesture that opens her. Handed to the strip rather than performed
     by it, so the room stays the only thing that decides where a capability
     sits. */
  const openMaia = useCallback(() => setOpen((o) => ({ ...o, maia: true })), []);
  const focusNode = focus ? focus({ openMaia }) : null;
  const boundary = sectionBoundary(t);
  const focusMark = resolve(t, 'focus');
  const locationMark = resolve(t, 'location');

  return (
    <div
      data-field-room
      data-field-treatment={treatment}
      style={{ minHeight: '100vh', background: GROUND.base, color: INK.primary }}
    >
      {/* ── THE RAIL ─────────────────────────────────────────────────────────
          Quiet, always reachable, always the same width. No counts, no badges,
          no indicators anywhere in the room: a number beside a capability is a
          claim about how much of it you have left undone. */}
      <nav
        aria-label="Room"
        data-field-rail
        style={{
          position: 'fixed', left: 0, top: 0, bottom: 0, width: `${RAIL_REM}rem`,
          background: GROUND.raised, borderRight: `1px solid ${RULE.quiet}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: SPACE.tight, paddingTop: SPACE.comfortable, zIndex: 40,
        }}
      >
        {ORBITS.map((o) => {
          const isOpen = open[o.key];
          return (
            <button
              key={o.key}
              type="button"
              data-field-orbit-toggle={o.key}
              aria-expanded={isOpen}
              aria-controls={`field-orbit-${o.key}`}
              onClick={() => toggle(o.key)}
              style={{
                width: 40, minHeight: 44, cursor: 'pointer',
                background: isOpen ? GROUND.active : 'transparent',
                border: `1px solid ${isOpen ? GOLD.edge : 'transparent'}`,
                borderRadius: RADIUS.base,
                color: isOpen ? GOLD.text : INK.quiet,
                font: 'inherit', fontSize: 10, lineHeight: 1.05, letterSpacing: '0.03em',
                padding: 2,
              }}
              title={o.title}
            >
              {o.label}
            </button>
          );
        })}
      </nav>

      {/* ── THE WORK ─────────────────────────────────────────────────────────
          The aperture narrows around it; it never moves and never reflows under
          a panel, because no orbit participates in layout. */}
      <div
        data-field-aperture
        style={{
          paddingLeft: a.left, paddingRight: a.right, paddingBottom: a.bottom,
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          transition: 'padding 160ms ease',
        }}
      >
        <header
          style={{
            padding: `${SPACE.comfortable}px ${SPACE.roomy}px`,
            borderBottom: `1px solid ${RULE.quiet}`, background: GROUND.field,
            display: 'flex', alignItems: 'baseline', gap: SPACE.base, minWidth: 0,
          }}
        >
          {/* The title yields to a narrower aperture rather than growing a
              second line: a taller header would push the Work down and change
              the scroll position. */}
          <StudioText role="workIdentity" as="h1">
            <span style={{
              display: 'block', whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis', minWidth: 0,
            }}>{title}</span>
          </StudioText>
          {note && (
            <StudioText role="metadata" as="span">
              <span style={{ color: INK.quiet }}>{note}</span>
            </StudioText>
          )}
        </header>

        <main
          ref={workRef}
          data-field-work
          style={{
            flex: 1, minHeight: 0, minWidth: 0,
            padding: `${SPACE.generous}px ${SPACE.roomy}px 0`,
            /* LOCATION, where the treatment puts it in the prose. A is the
               treatment that deliberately has none. */
            ...(boundary
              ? { ['--field-section-boundary' as string]: boundary.border }
              : null),
            ['--field-focus-color' as string]: focusMark.color,
            ['--field-focus-weight' as string]: `${focusMark.weight}px`,
            ['--field-location-color' as string]: locationMark.color,
          }}
        >
          {/* The focus mark, drawn on the section shells the focus covers.
              Scoped to this room so nothing outside it can be reached. */}
          {focusedSectionIds && focusedSectionIds.length > 0 && (
            <style>{focusedSectionIds.map((id) => (
              `[data-field-room] [data-whole-manuscript-section="${id}"]{` +
              `box-shadow:inset ${Math.max(focusMark.weight, 2)}px 0 0 ${focusMark.color};` +
              `border-radius:2px}`
            )).join('')}</style>
          )}
          {work}
        </main>
      </div>

      {/* ── ORBITS ───────────────────────────────────────────────────────────
          Fixed, so the Work cannot reflow when a capability enters. */}
      <Orbit
        id="field-orbit-structure"
        label="Structure"
        open={open.structure}
        box={structureBox()}
        edge={{ borderRight: `1px solid ${RULE.quiet}` }}
        onClose={() => toggle('structure')}
      >
        {structure}
      </Orbit>

      <Orbit
        id="field-orbit-maia"
        label="MAIA"
        open={open.maia}
        box={maiaBox()}
        edge={{ borderLeft: `1px solid ${RULE.quiet}` }}
        onClose={() => toggle('maia')}
      >
        {/* ⭐ THE CONVERSATION BELONGS TO THE ORBIT, NOT TO THE COMPOSER.
            Closing MAIA puts the conversation away; it does not move it
            somewhere else. */}
        {maia}
      </Orbit>

      {workbench !== undefined && (
        <div
          id="field-orbit-workbench"
          data-field-orbit="workbench"
          hidden={!open.workbench}
          aria-label="Workbench"
          style={{
            position: 'fixed', left: `${RAIL_REM}rem`, right: 0,
            bottom: `${WORKBENCH_BOTTOM_REM}rem`, height: `${WORKBENCH_REM}rem`,
            zIndex: 34, background: GROUND.raised,
            borderTop: `1px solid ${RULE.quiet}`,
            display: open.workbench ? 'flex' : 'none', flexDirection: 'column',
          }}
        >
          <OrbitHead label="Workbench" onClose={() => toggle('workbench')} />
          <div style={{ overflow: 'auto', padding: SPACE.comfortable, minHeight: 0 }}>
            {workbench}
          </div>
        </div>
      )}

      {/* ── THE FOCUS STRIP ──────────────────────────────────────────────────
          The frame in the manuscript is WHERE your attention is; this is the
          SAME attention carried into the conversation. Two manifestations of
          one thing, so they share the focus mark — and it stops where the Work
          stops, because it belongs to the Work and not to the building. */}
      {focusNode && (
        <div
          data-field-focus-strip
          style={{
            ...strip, zIndex: 37, background: GROUND.field,
            borderTop: `1px solid ${RULE.quiet}`,
            padding: `${SPACE.base}px ${SPACE.roomy}px`,
          }}
        >
          <div style={{
            borderLeft: `${Math.max(focusMark.weight, 2)}px solid ${focusMark.color}`,
            paddingLeft: SPACE.base, minWidth: 0,
          }}>
            {focusNode}
          </div>
        </div>
      )}
    </div>
  );
}

function OrbitHead({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: SPACE.snug,
      padding: `${SPACE.base}px ${SPACE.comfortable}px ${SPACE.snug}px`,
      borderBottom: `1px solid ${RULE.quiet}`,
    }}>
      <StudioText role="panelLabel" as="h2">
        <span style={{ flex: 1, color: INK.muted }}>{label}</span>
      </StudioText>
      <span style={{ flex: 1 }} />
      <button
        type="button"
        onClick={onClose}
        style={{
          background: 'transparent', border: `1px solid ${RULE.quiet}`,
          color: INK.quiet, borderRadius: RADIUS.sm, font: 'inherit', fontSize: 11,
          padding: `${SPACE.tight}px ${SPACE.snug}px`, cursor: 'pointer', minHeight: 32,
        }}
      >
        Close
      </button>
    </div>
  );
}

function Orbit({
  id, label, open, box, edge, onClose, children,
}: {
  id: string;
  label: string;
  open: boolean;
  box: ReturnType<typeof structureBox>;
  edge: React.CSSProperties;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <aside
      id={id}
      data-field-orbit={label.toLowerCase()}
      aria-label={label}
      hidden={!open}
      style={{
        ...box, ...edge, zIndex: 35, background: GROUND.raised,
        display: open ? 'flex' : 'none', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      <OrbitHead label={label} onClose={onClose} />
      <div style={{ overflow: 'auto', padding: SPACE.comfortable, flex: 1, minHeight: 0 }}>
        {children}
      </div>
    </aside>
  );
}
