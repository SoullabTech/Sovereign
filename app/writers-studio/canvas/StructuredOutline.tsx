/**
 * WS2-05A — the outline as a map of the Work, not a list of database rows.
 *
 * WHAT THIS COLUMN MAY SAY. Only what the member authored. There are no
 * inferred parts, no "Chapter" derived from a heading that happens to contain
 * the word, and no proposals — 05B is not built, and a suggestion rendered
 * where authored structure renders has already become authorship.
 *
 * UNPLACED SECTIONS ARE SHOWN, AND THE COLUMN READS AS THE BOOK. Hiding them
 * would make a Work look organised when it is not. Listing them after every
 * division — which the first cut did — put a partially organised manuscript out
 * of its own order, which is the state a Work is in for the whole of an
 * organising session. Divisions are anchored by the earliest section they hold
 * and interleave with unplaced material in manuscript order
 * (lib/writersStudio/outlineOrder.ts). A book with no divisions renders exactly
 * as the flat list always did.
 *
 * PLACEMENT IS A RUN, AND A DIVISION STAYS CONTIGUOUS. The member names the
 * ends of a stretch of the book and says what it is. A gesture that would leave
 * ANY division in two separate places — the one gaining sections, the one
 * losing them, or an ancestor deriving them — is refused, by the service and
 * again by the database at COMMIT. A division is one continuous part of the
 * Work; a grouping split across the book is a different relation, and it does
 * not get to arrive here because the outline had nowhere else to put it.
 *
 * DELETE IS LEAF-ONLY. `parent_id` cascades, so removing a Part would take
 * every Chapter authored inside it. Auto-promoting them would change the
 * hierarchy as a side effect of a delete. So a division holding others offers
 * no ×, and its children carry ⇤ to move them out deliberately.
 *
 * NO BROWSER DIALOGS. Naming a division and confirming a removal happen inline,
 * in the room's own type. `window.prompt` and `window.confirm` were the first
 * cut's shortcut and they are wrong here twice over: they are OS chrome
 * dropped into a surface built to be quiet, and Chrome lets a viewer silently
 * suppress them for the rest of the tab ("prevent this page from creating
 * additional dialogs"), after which every naming gesture returns null and the
 * button appears to do nothing at all. An affordance whose failure mode is
 * silence has no place on the gesture that authors a book's structure.
 *
 * THE WRITING IS NOT TOUCHED. Every gesture here is a grouping. Deleting a
 * division deletes a grouping and returns its sections to "not yet placed" —
 * no words move, and the flattened manuscript is byte-identical before and
 * after (proved by scripts/ws2-05a-structure-witness.ts).
 */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GROUND, INK, RADIUS, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';
import {
  fetchStructure, sendGesture, refusalCopy,
  type StructureNodeDTO, type StructureTreeDTO,
} from '@/lib/writersStudio/structureClient';
import { orderOutline, type OutlineEntry } from '@/lib/writersStudio/outlineOrder';
import type { ManuscriptSection, OutlineSectionStatus } from './ManuscriptOutline';

const STATUS_MARK: Record<OutlineSectionStatus, { glyph: string; label: string } | null> = {
  clean: null,
  dirty: { glyph: '·', label: 'unsaved' },
  saving: { glyph: '∙', label: 'saving' },
  error: { glyph: '⚠', label: 'not confirmed' },
  conflict: { glyph: '!', label: 'needs attention' },
};

/** A unit's shown name. Kind and title are both the member's words. */
export function unitLabel(node: { kind: string | null; title: string | null }): string {
  if (node.kind && node.title) return `${node.kind} — ${node.title}`;
  return node.title ?? node.kind ?? 'Untitled division';
}

/**
 * The panel's chrome band.
 *
 * StudioPanel scrolls its body with `padding: SPACE.comfortable`, and sticky
 * offsets resolve against that scrollport's padding box — so a bare `top: 0`
 * would leave a 16px strip above the band through which rows would be seen
 * scrolling. The negative margins pull the band out to the panel's edges and
 * the matching padding puts its content back where it was, so it covers the
 * full width and the gap above it. Opaque `GROUND.raised` because it is the
 * panel's own ground; a translucent band would show the outline through it.
 *
 * NO BORDER. `RULE.quiet` is the ramp's own `raised` step and would be
 * invisible here; anything more visible would put a new edge into a room whose
 * contract says the writing field keeps the only one in the row. Depth in this
 * room is carried by the ramp, so the opaque band plus the space beneath it is
 * the whole separation, and rows read as passing under it.
 */
const CHROME: React.CSSProperties = {
  position: 'sticky',
  top: -SPACE.comfortable,
  zIndex: 1,
  background: GROUND.raised,
  marginLeft: -SPACE.comfortable,
  marginRight: -SPACE.comfortable,
  marginTop: -SPACE.comfortable,
  paddingLeft: SPACE.comfortable,
  paddingRight: SPACE.comfortable,
  paddingTop: SPACE.comfortable,
};

export default function StructuredOutline({
  manuscriptId,
  sections,
  activeId,
  statusOf,
  onSelect,
}: {
  manuscriptId: string;
  sections: ManuscriptSection[];
  activeId: string | null;
  statusOf: (sectionId: string) => OutlineSectionStatus;
  onSelect: (sectionId: string) => void;
}) {
  const [tree, setTree] = useState<StructureTreeDTO | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [organising, setOrganising] = useState(false);
  const [busy, setBusy] = useState(false);
  /* Which parent a new division is being named under: a unit id, null for top
     level, and `undefined` for "not naming anything right now". The three-way
     distinction matters — null is a real place in the tree. */
  const [naming, setNaming] = useState<string | null | undefined>(undefined);
  /* The unit whose × has been pressed once. Removal is two presses, in the
     room, rather than one press and an OS dialog. */
  const [confirming, setConfirming] = useState<string | null>(null);

  const byId = useMemo(() => new Map(sections.map((s) => [s.id, s])), [sections]);

  useEffect(() => {
    let cancelled = false;
    void fetchStructure(manuscriptId).then((r) => {
      if (cancelled) return;
      if (r.ok) setTree(r.tree);
      /* A structure that could not be read is left NULL, and the flat outline
         below renders. Rendering an empty tree would say "this book has no
         divisions", which is a claim, not a fallback. */
      else setNotice(refusalCopy(r.refusal));
    });
    return () => { cancelled = true; };
  }, [manuscriptId]);

  const act = useCallback(async (g: Parameters<typeof sendGesture>[1]) => {
    setBusy(true);
    setNotice(null);
    const r = await sendGesture(manuscriptId, g);
    setBusy(false);
    if (r.ok) setTree(r.tree);
    else setNotice(refusalCopy(r.refusal));
  }, [manuscriptId]);

  const ordered = useMemo(
    () => orderOutline(tree?.roots ?? [], sections),
    [tree, sections],
  );

  /* WS2-05A-R1 — reveal the restored place ONCE, on the render where the
     active row first exists.
     Not a general "chase the cursor": scrolling the map on every navigation
     would fight a member who has scrolled it deliberately to look somewhere
     else. This fires only when the outline first has a row for the section the
     URL restored, which is exactly the moment the writing field and the map
     would otherwise disagree about where the member is standing. */
  const activeRow = useRef<HTMLDivElement | null>(null);
  const revealed = useRef(false);
  useEffect(() => {
    if (revealed.current || !activeId) return;
    const el = activeRow.current;
    if (!el) return;
    revealed.current = true;
    el.scrollIntoView({ block: 'center' });
  }, [activeId, ordered]);

  const row = (s: ManuscriptSection, depth: number) => {
    const isActive = activeId === s.id;
    const mark = STATUS_MARK[statusOf(s.id)];
    return (
      <div
        key={s.id}
        ref={isActive ? activeRow : undefined}
        data-section={s.position}
        data-active={isActive || undefined}
        role="button"
        tabIndex={0}
        aria-current={isActive ? 'true' : undefined}
        onClick={() => onSelect(s.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(s.id); }
        }}
        style={{
          display: 'flex', gap: SPACE.snug, alignItems: 'baseline',
          padding: `${SPACE.tight}px ${SPACE.snug}px`,
          paddingLeft: SPACE.snug + depth * SPACE.base,
          borderRadius: RADIUS.sm,
          background: isActive ? GROUND.active : 'transparent',
          cursor: 'pointer',
        }}
      >
        <StudioText role="navItem" tone="quiet" as="span">{s.position}.</StudioText>
        <StudioText
          role="navItem" tone={isActive ? 'primary' : 'secondary'} as="span"
          style={{ flex: 1 }}
        >
          {s.heading ?? 'Untitled section'}
        </StudioText>
        {mark && (
          <span title={mark.label} style={{ lineHeight: 1 }}>
            <StudioText role="metadata" tone="quiet" as="span">
              <span aria-hidden>{mark.glyph}</span>
            </StudioText>
            <span className="sr-only"> {mark.label}</span>
          </span>
        )}
      </div>
    );
  };

  const unitHead = (
    node: StructureNodeDTO,
    depth: number,
    siblings: readonly StructureNodeDTO[],
    entries: readonly OutlineEntry[],
    empty: readonly StructureNodeDTO[],
    holdsNothing: boolean,
  ) => {
    const i = siblings.findIndex((s) => s.id === node.id);
    return (
      <div key={node.id} style={{ marginTop: SPACE.snug }}>
        <div
          style={{
            display: 'flex', gap: SPACE.snug, alignItems: 'baseline',
            paddingLeft: SPACE.snug + depth * SPACE.base,
          }}
        >
          {/* SERIF, by the room's own rule: serif is the member's work, sans
              is the building around it. A division's name is the member's
              words for how their book is divided, so it belongs to the work. */}
          <StudioText role="workIdentity" as="span" style={{ flex: 1 }}>
            {unitLabel(node)}
          </StudioText>
          {!node.contiguous && (
            /* Unreachable through these gestures: contiguity is refused on the
               way in and again at COMMIT. Drawn anyway, because a false value
               read from the database means the invariant was broken by
               something outside these paths, and the outline should say so
               rather than render it as though it were fine. */
            <span title="this division is in two separate places in the book — that should not be possible; please report it">
              <StudioText role="metadata" tone="quiet" as="span">
                <span aria-hidden>⚠</span>
              </StudioText>
              <span className="sr-only"> in two separate places, unexpectedly</span>
            </span>
          )}
          {organising && (
            <span style={{ display: 'flex', gap: SPACE.tight }}>
              <Tiny label="move up" disabled={busy || i <= 0}
                onClick={() => act({ gesture: 'move', unitId: node.id, parentId: parentOf(tree, node.id), index: i - 1 })}>↑</Tiny>
              <Tiny label="move down" disabled={busy || i < 0 || i >= siblings.length - 1}
                onClick={() => act({ gesture: 'move', unitId: node.id, parentId: parentOf(tree, node.id), index: i + 1 })}>↓</Tiny>
              <Tiny label="add a division inside this one" disabled={busy}
                onClick={() => { setConfirming(null); setNaming(node.id); }}>+</Tiny>
              {depth > 0 && (
                /* Move this division out to sit beside its parent. The only way
                   a nested division leaves, and always a member's act. */
                <Tiny label="move this division out one level" disabled={busy}
                  onClick={() => act({
                    gesture: 'move', unitId: node.id,
                    parentId: grandparentOf(tree, node.id), index: 0,
                  })}>⇤</Tiny>
              )}
              {node.children.length === 0 ? (
                confirming === node.id ? (
                  <>
                    <Tiny label="confirm: remove this division, keeping its writing"
                      disabled={busy}
                      onClick={() => { setConfirming(null); void act({ gesture: 'delete', unitId: node.id }); }}>
                      remove?
                    </Tiny>
                    <Tiny label="keep this division" disabled={busy}
                      onClick={() => setConfirming(null)}>keep</Tiny>
                  </>
                ) : (
                  <Tiny label="remove this division, keeping its writing" disabled={busy}
                    onClick={() => { setNaming(undefined); setConfirming(node.id); }}>×</Tiny>
                )
              ) : (
                /* No × at all, rather than one that refuses when pressed: an
                   affordance that cannot succeed should not be offered. */
                <span title="move the divisions inside this one out before removing it">
                  <StudioText role="metadata" tone="quiet" as="span">
                    <span aria-hidden>·</span>
                  </StudioText>
                </span>
              )}
            </span>
          )}
        </div>
        {organising && naming === node.id && (
          <NameDivision depth={depth + 1} disabled={busy}
            onCancel={() => setNaming(undefined)}
            onName={(title) => { setNaming(undefined); void act({
              gesture: 'create', kind: null, title, parentId: node.id }); }} />
        )}
        {holdsNothing && (
          <StudioText role="metadata" tone="quiet"
            style={{ display: 'block', paddingLeft: SPACE.snug + (depth + 1) * SPACE.base }}>
            no sections yet
          </StudioText>
        )}
        {organising && (
          <PlaceRun sections={sections} disabled={busy} depth={depth}
            onPlace={(from, to) => act({
              gesture: 'place', unitId: node.id, fromSectionId: from, toSectionId: to,
            })} />
        )}
        {/* Its own sections and its children, in manuscript order. */}
        {entries.map((e) => renderEntry(e, depth + 1, node.children))}
        {empty.map((c) => emptyUnit(c, depth + 1, node.children))}
      </div>
    );
  };

  /** A division holding nothing yet. Drawn plainly, given no position. */
  const emptyUnit = (node: StructureNodeDTO, depth: number, siblings: StructureNodeDTO[]) =>
    unitHead(node, depth, siblings, [], [], true);

  const renderEntry = (
    e: OutlineEntry,
    depth: number,
    siblings: readonly StructureNodeDTO[],
  ): React.ReactNode => {
    if (e.kind === 'section') {
      const s = byId.get(e.id);
      return s ? row(s, depth) : null;
    }
    return unitHead(e.node, depth, siblings, e.entries, e.empty, false);
  };

  return (
    <>
      {/* PANEL CHROME, NOT THE FIRST ROW.
          On a 174-section manuscript the count and the organise control used to
          scroll away exactly while the member was moving through the Work — the
          instrument for organising a book disappearing at the moment they are
          reading it. Sticky to the scrollport, opaque, and pulled out to the
          panel's padding so rows pass under it rather than beside it.
          Presentation only: nothing here changes what a gesture does. */}
      <div data-structured-outline style={CHROME}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: SPACE.snug, marginBottom: SPACE.base }}>
        <StudioText role="metadata" style={{ flex: 1 }}>
          {sections.length} section{sections.length === 1 ? '' : 's'}
        </StudioText>
        <Tiny label={organising ? 'done organising' : 'organise this Work'} disabled={busy}
          onClick={() => setOrganising((v) => !v)}>
          {organising ? 'done' : 'organise'}
        </Tiny>
      </div>

      {notice && (
        <StudioText role="quiet" style={{ marginBottom: SPACE.base }}>{notice}</StudioText>
      )}

      {organising && (
        <div style={{ marginBottom: SPACE.base }}>
          {naming === null ? (
            <NameDivision depth={0} disabled={busy}
              onCancel={() => setNaming(undefined)}
              onName={(title) => { setNaming(undefined); void act({
                gesture: 'create', kind: null, title, parentId: null }); }} />
          ) : (
            <Tiny label="add a top-level division" disabled={busy}
              onClick={() => { setConfirming(null); setNaming(null); }}>+ division</Tiny>
          )}
        </div>
      )}
      {organising && confirming && (
        <StudioText role="quiet" style={{ marginBottom: SPACE.base, display: 'block' }}>
          Removing a division returns its sections to “not yet placed”. No writing is removed.
        </StudioText>
      )}
      </div>

      {/* The book, in its own order: divisions anchored where their earliest
          section sits, unplaced material keeping its place between them. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.hairline }}>
        {ordered.entries.map((e) => renderEntry(e, 0, tree?.roots ?? []))}
      </div>

      {ordered.empty.length > 0 && (
        <>
          {/* Sans: the room speaking. These hold nothing, so they have no
              position in the manuscript and are not given one. */}
          <StudioText role="panelLabel" tone="muted"
            style={{ marginTop: SPACE.comfortable, display: 'block' }}>
            not yet holding any sections
          </StudioText>
          {ordered.empty.map((u) => emptyUnit(u, 0, tree?.roots ?? []))}
        </>
      )}
    </>
  );
}

/** The parent of this unit's parent — where ⇤ moves it to. */
function grandparentOf(tree: StructureTreeDTO | null, unitId: string): string | null {
  const parent = parentOf(tree, unitId);
  return parent ? parentOf(tree, parent) : null;
}

/** Which unit holds this one, from the tree the server sent. */
function parentOf(tree: StructureTreeDTO | null, unitId: string): string | null {
  if (!tree) return null;
  const walk = (nodes: StructureNodeDTO[], parent: string | null): string | null | undefined => {
    for (const n of nodes) {
      if (n.id === unitId) return parent;
      const found = walk(n.children, n.id);
      if (found !== undefined) return found;
    }
    return undefined;
  };
  return walk(tree.roots, null) ?? null;
}

function Tiny({
  children, label, onClick, disabled,
}: {
  children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled}
      style={{
        background: GROUND.active, border: 'none', borderRadius: RADIUS.sm,
        color: INK.secondary, cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        padding: `${SPACE.hairline}px ${SPACE.snug}px`,
        font: 'inherit', fontSize: '0.75rem', lineHeight: 1.4,
      }}
    >
      {children}
    </button>
  );
}

/**
 * Name a new division, in the room rather than in an OS dialog.
 *
 * Autofocused so the gesture is one press and then typing; Enter commits,
 * Escape cancels. The member's own word for the division is the whole content
 * of this control, so it gets the room's serif — it is the work, not the
 * building.
 */
function NameDivision({
  onName, onCancel, disabled, depth,
}: {
  onName: (title: string) => void;
  onCancel: () => void;
  disabled?: boolean;
  depth: number;
}) {
  const [text, setText] = useState('');
  const commit = () => { const t = text.trim(); if (t) onName(t); };
  return (
    <div style={{
      display: 'flex', gap: SPACE.tight, alignItems: 'center',
      paddingLeft: SPACE.snug + depth * SPACE.base,
      margin: `${SPACE.tight}px 0`,
    }}>
      <input
        autoFocus
        aria-label="what this division is called"
        placeholder="Part One, Chapter 4, Interlude…"
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); }
          if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
        }}
        style={{
          flex: 1, minWidth: 0,
          background: GROUND.raised, color: INK.primary, border: 'none',
          borderRadius: RADIUS.sm, padding: `${SPACE.tight}px ${SPACE.snug}px`,
          font: 'inherit', fontSize: '0.875rem',
        }}
      />
      <Tiny label="add this division" disabled={disabled || text.trim().length === 0}
        onClick={commit}>add</Tiny>
      <Tiny label="cancel" disabled={disabled} onClick={onCancel}>cancel</Tiny>
    </div>
  );
}

/**
 * Place an inclusive run into a division.
 *
 * Two selects rather than a drag: the member names the ends of a stretch, the
 * gesture is keyboard-reachable, and contiguity is true by construction. A
 * drag-selection over 174 rows would be both harder to use and easier to get
 * subtly wrong.
 */
function PlaceRun({
  sections, onPlace, disabled, depth,
}: {
  sections: ManuscriptSection[];
  onPlace: (fromId: string, toId: string) => void;
  disabled?: boolean;
  depth: number;
}) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const sel = (value: string, set: (v: string) => void, label: string) => (
    <select
      aria-label={label} value={value} disabled={disabled}
      onChange={(e) => set(e.target.value)}
      style={{
        background: GROUND.raised, color: INK.secondary, border: 'none',
        borderRadius: RADIUS.sm, padding: `${SPACE.hairline}px ${SPACE.tight}px`,
        font: 'inherit', fontSize: '0.75rem', maxWidth: '9ch',
      }}
    >
      <option value="">{label}</option>
      {sections.map((s) => <option key={s.id} value={s.id}>{s.position}</option>)}
    </select>
  );
  return (
    <div style={{
      display: 'flex', gap: SPACE.tight, alignItems: 'center',
      paddingLeft: SPACE.snug + depth * SPACE.base,
      margin: `${SPACE.tight}px 0`,
    }}>
      {sel(from, setFrom, 'from')}
      {sel(to, setTo, 'to')}
      <Tiny label="place these sections in this division"
        disabled={disabled || !from || !to}
        onClick={() => { onPlace(from, to); setFrom(''); setTo(''); }}>place</Tiny>
    </div>
  );
}
