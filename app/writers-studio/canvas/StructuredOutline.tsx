/**
 * WS2-05A — the outline as a map of the Work, not a list of database rows.
 *
 * WHAT THIS COLUMN MAY SAY. Only what the member authored. There are no
 * inferred parts, no "Chapter" derived from a heading that happens to contain
 * the word, and no proposals — 05B is not built, and a suggestion rendered
 * where authored structure renders has already become authorship.
 *
 * UNPLACED SECTIONS ARE SHOWN. Hiding them would make a Work look organised
 * when it is not — invention arrived at by omission instead of by invention.
 * A book with no divisions at all renders exactly as it did before this cut.
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
 * THE WRITING IS NOT TOUCHED. Every gesture here is a grouping. Deleting a
 * division deletes a grouping and returns its sections to "not yet placed" —
 * no words move, and the flattened manuscript is byte-identical before and
 * after (proved by scripts/ws2-05a-structure-witness.ts).
 */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { GROUND, INK, RADIUS, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';
import {
  fetchStructure, sendGesture, refusalCopy,
  type StructureNodeDTO, type StructureTreeDTO,
} from '@/lib/writersStudio/structureClient';
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

  const placedIds = useMemo(() => {
    const s = new Set<string>();
    const walk = (n: StructureNodeDTO) => {
      n.sectionIds.forEach((id) => s.add(id));
      n.children.forEach(walk);
    };
    tree?.roots.forEach(walk);
    return s;
  }, [tree]);

  const unplaced = useMemo(
    () => sections.filter((s) => !placedIds.has(s.id)),
    [sections, placedIds],
  );

  const row = (s: ManuscriptSection, depth: number) => {
    const isActive = activeId === s.id;
    const mark = STATUS_MARK[statusOf(s.id)];
    return (
      <div
        key={s.id}
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

  const unit = (node: StructureNodeDTO, depth: number, siblings: StructureNodeDTO[]) => {
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
              <Tiny label="add a division inside" disabled={busy}
                onClick={() => {
                  const name = window.prompt('What is this division called?');
                  if (name && name.trim()) {
                    void act({ gesture: 'create', kind: null, title: name.trim(), parentId: node.id });
                  }
                }}>+</Tiny>
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
                <Tiny label="remove this division, keeping its writing" disabled={busy}
                  onClick={() => {
                    if (window.confirm(
                      `Remove "${unitLabel(node)}"?\n\nIts sections return to "not yet placed". No writing is removed.`,
                    )) void act({ gesture: 'delete', unitId: node.id });
                  }}>×</Tiny>
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
        {organising && (
          <PlaceRun sections={sections} disabled={busy} depth={depth}
            onPlace={(from, to) => act({
              gesture: 'place', unitId: node.id, fromSectionId: from, toSectionId: to,
            })} />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.hairline }}>
          {node.sectionIds
            .map((id) => byId.get(id))
            .filter((s): s is ManuscriptSection => Boolean(s))
            .map((s) => row(s, depth + 1))}
        </div>
        {node.children.map((c) => unit(c, depth + 1, node.children))}
      </div>
    );
  };

  const hasStructure = (tree?.roots.length ?? 0) > 0;

  return (
    <>
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
          <Tiny label="add a top-level division" disabled={busy}
            onClick={() => {
              const name = window.prompt('What is this division called?');
              if (name && name.trim()) {
                void act({ gesture: 'create', kind: null, title: name.trim(), parentId: null });
              }
            }}>+ division</Tiny>
        </div>
      )}

      {tree?.roots.map((r) => unit(r, 0, tree.roots))}

      {/* Sans: this label is the room speaking, not the member. */}
      {(hasStructure || organising) && unplaced.length > 0 && (
        <StudioText role="panelLabel" tone="muted" style={{ marginTop: SPACE.comfortable, display: 'block' }}>
          not yet placed
        </StudioText>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.hairline }}>
        {unplaced.map((s) => row(s, 0))}
      </div>
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
