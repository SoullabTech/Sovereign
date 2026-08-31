/**
 * WS2-05B step 5b - the room where a reading is judged.
 *
 * WHOSE VOICE IS WHOSE. A division the member has changed shows THEIR structure
 * as the fact and MAIA's as what was suggested, beneath it. Her rationale never
 * migrates onto a boundary she did not propose: the frozen interpretation is
 * evidence, the reviewed tree is authorship, and the surface never lets one
 * wear the other's clothes.
 *
 * THE REVIEW READS AS THE BOOK. Same ordering primitive as the canonical
 * outline, so unaccounted material sits in position between proposed divisions
 * rather than below them. A proposal that covers a third of a Work should look
 * like a third of a Work.
 *
 * NO TREE IS EVER MANUFACTURED. `none` renders the account and the book, with
 * no divisions and no apology - it is a complete answer, not an empty state.
 * `ambiguous` renders the alternatives and no canonical structure at all; the
 * member takes one up by id, and until then nothing is accounted for.
 *
 * ATOMIC DOES NOT MEAN HIDDEN. Promote and transfer are previewed by the server
 * running the operation, and every division they change is shown before the
 * member commits. The parent's boundary moving is part of the gesture.
 *
 * THERE IS NO "USE THIS STRUCTURE" HERE. Absent, not disabled. While the room
 * is being proven it must be incapable of a canonical write.
 */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { GROUND, INK, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';
import {
  fetchProposal, applyGesture, previewGesture, reviewRefusalCopy,
  type ProposalView,
} from '@/lib/writersStudio/reviewClient';
import { orderReview, type ChangeRow } from '@/lib/writersStudio/reviewPresentation';
import type { OutlineEntry } from '@/lib/writersStudio/outlineOrder';
import { reviewDiff } from '@/lib/manuscript/structure/review';
import type { ReviewOperation } from '@/lib/manuscript/structure/review';
import type { ProposedUnit } from '@/lib/manuscript/structure/interpret';

export default function StructureReview({
  manuscriptId, proposalId,
}: { manuscriptId: string; proposalId: string }) {
  const [view, setView] = useState<ProposalView | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<{ op: ReviewOperation; rows: ChangeRow[] } | null>(null);
  /* Which divisions have been opened to show their sections. Empty by default:
     the room opens on the reading, not on 174 rows of evidence for it. */
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const toggle = useCallback((unitId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(unitId)) next.add(unitId);
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchProposal(manuscriptId, proposalId).then((r) => {
      if (cancelled) return;
      if (r.ok) setView(r.view);
      else setNotice(reviewRefusalCopy(r.refusal));
    });
    return () => { cancelled = true; };
  }, [manuscriptId, proposalId]);

  /* Preview first for the coupled gestures; commit directly for the rest. */
  const gesture = useCallback(async (op: ReviewOperation, previewFirst: boolean) => {
    if (!view) return;
    setBusy(true);
    setNotice(null);
    if (previewFirst) {
      const p = await previewGesture(manuscriptId, proposalId, view.reviewRevision, op);
      setBusy(false);
      if (!p.ok) { setNotice(reviewRefusalCopy(p.refusal)); return; }
      setPending({ op, rows: p.rows });
      return;
    }
    const r = await applyGesture(manuscriptId, proposalId, view.reviewRevision, op);
    setBusy(false);
    setPending(null);
    if (r.ok) {
      setView({ ...view, reviewed: r.reviewed, reviewRevision: r.reviewRevision });
      return;
    }
    setNotice(reviewRefusalCopy(r.refusal));
    /* A stale revision returns the newer state: show it rather than replaying
       an edit onto a proposal the member has not seen. */
    if (r.current) {
      setView({ ...view, reviewed: r.current.reviewed, reviewRevision: r.current.reviewRevision });
    }
  }, [manuscriptId, proposalId, view]);

  const ordered = useMemo(
    () => view ? orderReview(view.reviewed, view.sections) : null,
    [view]);

  const headingOf = useMemo(() => {
    const m = new Map(view?.sections.map((s) => [s.id, s]) ?? []);
    return (id: string) => m.get(id);
  }, [view]);

  /* What the member changed, paired by id against the frozen reading. */
  const delta = useMemo(() => {
    if (!view) return null;
    const original: ProposedUnit[] = 'units' in view.interpretation
      ? view.interpretation.units : [];
    return reviewDiff(original, view.reviewed.units);
  }, [view]);

  const proposedById = useMemo(() => {
    const m = new Map<string, ProposedUnit>();
    const walk = (l: readonly ProposedUnit[]) => {
      for (const u of l) { m.set(u.id, u); walk(u.children); }
    };
    if (view && 'units' in view.interpretation) walk(view.interpretation.units);
    return m;
  }, [view]);

  if (!view) {
    return (
      <div data-review-state="loading" style={{ padding: SPACE.comfortable }}>
        <StudioText role="metadata">
          {notice ?? 'reading the proposal…'}
        </StudioText>
      </div>
    );
  }

  const form = view.interpretation.form;

  return (
    <div data-structure-review data-form={form} style={{ padding: SPACE.comfortable }}>
      {/* MAIA's account of the Work, in her words, always. */}
      <StudioText role="maiaReading" style={{ display: 'block', marginBottom: SPACE.base }}>
        {view.interpretation.account}
      </StudioText>

      <Coverage view={view} />

      {notice && (
        <StudioText role="quiet" data-review-notice
          style={{ display: 'block', margin: `${SPACE.base}px 0` }}>
          {notice}
        </StudioText>
      )}

      {pending && (
        <PostImage rows={pending.rows} busy={busy}
          onCommit={() => void gesture(pending.op, false)}
          onCancel={() => setPending(null)} />
      )}

      {/* AMBIGUOUS: the alternatives, and no structure. Nothing is accounted
          for until the member takes one up. */}
      {form === 'ambiguous' && 'alternatives' in view.interpretation && (
        <div data-alternatives style={{ marginBottom: SPACE.roomy }}>
          <StudioText role="panelLabel" tone="muted" style={{ display: 'block', marginBottom: SPACE.snug }}>
            two readings remain plausible
          </StudioText>
          {view.interpretation.alternatives.map((a) => (
            <div key={a.id} data-alternative={a.id} style={{ marginBottom: SPACE.base }}>
              <StudioText role="workIdentity" as="span">{a.label}</StudioText>
              <StudioText role="quiet" style={{ display: 'block' }}>{a.why}</StudioText>
              <Tiny label={`take up the reading "${a.label}"`} disabled={busy}
                onClick={() => void gesture(
                  { op: 'choose-alternative', alternativeId: a.id }, false)}>
                take this reading
              </Tiny>
            </div>
          ))}
        </div>
      )}

      {/* NONE: a complete answer. The account above, the book below, no tree
          and no apology. */}
      {form === 'none' && (
        <StudioText role="panelLabel" tone="muted" data-no-structure
          style={{ display: 'block', margin: `${SPACE.base}px 0` }}>
          no divisions proposed
        </StudioText>
      )}

      {ordered?.status === 'refused' ? (
        <StudioText role="quiet" data-review-unrenderable style={{ display: 'block' }}>
          This proposal cannot be shown safely: {reviewRefusalCopy(ordered.refusal)} Nothing has
          been changed, and your writing is not affected.
        </StudioText>
      ) : (
        <div data-review-column style={{ display: 'flex', flexDirection: 'column', gap: SPACE.hairline }}>
          {ordered?.outline.entries.map((e) => (
            <Entry key={entryKey(e)} entry={e} depth={0}
              headingOf={headingOf} proposedById={proposedById}
              positionOf={(id) => headingOf(id)?.position}
              busy={busy} onGesture={gesture}
              expanded={expanded} onToggle={toggle} />
          ))}
        </div>
      )}

      {/* AFTER THE READING, NOT BEFORE IT. The thesis is what the member came
          to judge; her open questions are how to weigh it, and they read as
          qualifications of something already seen rather than as a preamble to
          something not yet shown. */}
      <OpenQuestions view={view} headingOf={headingOf} proposedById={proposedById} />

      {delta && (delta.added.length || delta.removed.length || delta.changed.length) ? (
        <StudioText role="metadata" tone="muted" data-review-delta
          style={{ display: 'block', marginTop: SPACE.comfortable }}>
          you changed {delta.changed.length}, added {delta.added.length},
          removed {delta.removed.length}
        </StudioText>
      ) : null}
    </div>
  );
}

const entryKey = (e: OutlineEntry) => e.kind === 'section' ? `s:${e.id}` : `u:${e.node.id}`;

/**
 * Everything MAIA left unresolved, gathered — and kept in TWO KINDS.
 *
 * There are three frozen `uncertainRegions` and ten divisions carrying
 * `uncertainty` tags. Those are different qualifications and collapsing them
 * into "three doubts" would be a fresh compression error of exactly the kind
 * this unit exists to correct — the 8a defect rebuilt one level higher.
 *
 * A REGION is a stretch of the Work she could not settle, in her own words.
 * A TAG is a caveat attached to a division she did propose.
 */
function OpenQuestions({
  view, headingOf, proposedById,
}: {
  view: ProposalView;
  headingOf: (id: string) => { position: number } | undefined;
  proposedById: Map<string, ProposedUnit>;
}) {
  const regions = view.interpretation.uncertainRegions;
  const tagged = [...proposedById.values()].filter((u) => u.uncertainty.length > 0);
  if (regions.length === 0 && tagged.length === 0) return null;

  const at = (id: string) => headingOf(id)?.position ?? '?';
  return (
    <div data-open-questions
      style={{ marginTop: SPACE.comfortable, paddingTop: SPACE.base,
        borderTop: `1px solid ${RULE.quiet}` }}>
      <StudioText role="panelLabel" tone="muted" style={{ display: 'block' }}>
        MAIA has unresolved questions
      </StudioText>

      {regions.length > 0 && (
        <div data-question-group="regions" style={{ marginTop: SPACE.snug }}>
          <StudioText role="metadata" tone="muted" style={{ display: 'block' }}>
            boundary and structure questions
          </StudioText>
          {regions.map((r, i) => (
            <StudioText key={`${r.fromSectionId}:${i}`} role="quiet"
              data-uncertain-region={`${at(r.fromSectionId)}-${at(r.toSectionId)}`}
              style={{ display: 'block', paddingLeft: SPACE.base }}>
              {at(r.fromSectionId)}–{at(r.toSectionId)} · {r.why}
            </StudioText>
          ))}
        </div>
      )}

      {tagged.length > 0 && (
        <div data-question-group="qualifications" style={{ marginTop: SPACE.snug }}>
          <StudioText role="metadata" tone="muted" style={{ display: 'block' }}>
            further qualifications, division by division
          </StudioText>
          {tagged.map((u) => (
            <StudioText key={u.id} role="quiet"
              style={{ display: 'block', paddingLeft: SPACE.base }}>
              {at(u.fromSectionId)}–{at(u.toSectionId)}
              {u.kind || u.title ? ` ${u.kind ?? ''}${u.title ? ` ${u.title}` : ''}` : ''}
              {' · '}
              {u.uncertainty.map((t) => UNCERTAINTY_SAYS[t] ?? t).join(' · ')}
            </StudioText>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * What each uncertainty tag says, in a member's words.
 *
 * TRANSLATION, NOT INTERPRETATION. The slugs are the reader's closed vocabulary
 * and mean something exact; these phrases say the same thing in the room's
 * language and neither soften nor sharpen it. `competing-interpretation` does
 * not become "probably fine", and `possible-scaffold-contamination` does not
 * become "this is a contents list".
 *
 * A TAG WITH NO ENTRY IS SHOWN RAW, never dropped. If the reader's vocabulary
 * grows and this map has not, the member meets an unfamiliar word rather than
 * silence - and silence is the failure this whole unit exists to correct.
 */
const UNCERTAINTY_SAYS: Record<string, string> = {
  'start-boundary': 'where this begins',
  'end-boundary': 'where this ends',
  kind: 'what kind of division this is',
  hierarchy: 'how this sits inside the whole',
  'possible-scaffold-contamination': 'whether this is writing or apparatus',
  'competing-interpretation': 'another reading is nearly as good',
};

/** What was actually read, shown rather than buried in a record. */
function Coverage({ view }: { view: ProposalView }) {
  const b = view.coverage.bodies;
  const n = b.sectionIds.length;
  /* "in full" is load-bearing and true by construction: nothing is ever
     truncated, so a section she read is a section she read to the end. The
     ceiling is named because "3 sections" means one thing under a limit of 8 and
     something else under none. */
  const said = b.mode === 'none'
    ? 'read the headings of this Work, and none of its text'
    : b.mode === 'all'
      ? 'read the whole Work'
      : `read the headings, and ${n} section${n === 1 ? '' : 's'} in full`
        + ` — ${n} of at most ${b.sectionLimit} she may ask for`;
  return (
    <StudioText role="metadata" tone="quiet" data-coverage={b.mode}
      /* The frozen facts, machine-readable beside their reading. A witness that
         had to grep the prose for "truncated" would force the row's vocabulary
         into the member's room to satisfy itself; these carry the row exactly,
         and the sentence stays in the room's language. */
      data-truncated={String(b.truncated)}
      data-passes={String(view.coverage.passes)}
      style={{ display: 'block', marginBottom: SPACE.base }}>
      MAIA {said}
      {/* READ FROM THE ROW. `truncated` is typed as the literal false, so only
          one branch can be reached today - but the sentence is derived from the
          record rather than asserted from what we believe the record says. The
          member is told what was read AND that none of it was shortened,
          because "she read 4 sections" and "she read the whole of 4 sections"
          are different claims. */}
      {b.mode !== 'none'
        && (b.truncated
          ? ', though some of it was shortened'
          : ', none of it shortened')}
      {', '}in {view.coverage.passes} pass{view.coverage.passes === 1 ? '' : 'es'}.
      {view.staleAsRead === true && ' Parts of the Work she read have changed since.'}
      {/* Not silence. An unmeasurable comparison is stated as one, because a
          member reading no warning will reasonably hear "nothing has changed". */}
      {view.staleAsRead === null
        && ' Whether it has changed since cannot be checked against this draft.'}
    </StudioText>
  );
}

/**
 * The whole consequence of a coupled gesture, before it happens.
 *
 * Every division it changes, not only the one the member named.
 */
function PostImage({
  rows, onCommit, onCancel, busy,
}: { rows: ChangeRow[]; onCommit: () => void; onCancel: () => void; busy: boolean }) {
  return (
    <div data-post-image style={{
      background: GROUND.active, borderRadius: RADIUS.sm,
      padding: SPACE.base, marginBottom: SPACE.base,
    }}>
      <StudioText role="panelLabel" tone="muted" style={{ display: 'block', marginBottom: SPACE.snug }}>
        this will change
      </StudioText>
      {rows.map((r) => (
        <div key={r.unitId} data-change-row={r.effect}
          style={{ display: 'flex', gap: SPACE.snug, alignItems: 'baseline' }}>
          <StudioText role="navItem" as="span" style={{ minWidth: '14ch' }}>
            {r.title ?? 'Untitled division'}
          </StudioText>
          <StudioText role="metadata" tone="quiet" as="span">
            {r.effect === 'moves-out'
              ? `moves out of ${r.fromParent ?? 'its division'}`
              : r.effect === 'changes-parent'
                ? `moves from ${r.fromParent ?? '—'} into ${r.toParent ?? '—'}`
                : r.effect === 'renamed'
                  ? `${r.before ?? '—'} → ${r.after ?? '—'}`
                  : `${r.before ?? '—'} → ${r.after ?? '—'}`}
          </StudioText>
        </div>
      ))}
      <div style={{ display: 'flex', gap: SPACE.tight, marginTop: SPACE.snug }}>
        <Tiny label="make this change" disabled={busy} onClick={onCommit}>make this change</Tiny>
        <Tiny label="cancel" disabled={busy} onClick={onCancel}>cancel</Tiny>
      </div>
    </div>
  );
}

function Entry({
  entry, depth, headingOf, proposedById, positionOf, busy, onGesture, expanded, onToggle,
}: {
  entry: OutlineEntry;
  depth: number;
  headingOf: (id: string) => { id: string; position: number; heading: string | null } | undefined;
  proposedById: Map<string, ProposedUnit>;
  positionOf: (id: string) => number | undefined;
  busy: boolean;
  onGesture: (op: ReviewOperation, previewFirst: boolean) => void;
  expanded: ReadonlySet<string>;
  onToggle: (unitId: string) => void;
}) {
  const pad = SPACE.snug + depth * SPACE.base;

  if (entry.kind === 'section') {
    const s = headingOf(entry.id);
    return (
      /* UNACCOUNTED MEANS OUTSIDE EVERY DIVISION, and only depth 0 is. The
         attribute was set on every section row, so material a proposal HAD
         accounted for was marked as material it had not - the reading looked
         emptier in the DOM than it was. */
      <div data-section={entry.position}
        data-unaccounted={depth === 0 ? 'true' : undefined}
        style={{ display: 'flex', gap: SPACE.snug, paddingLeft: pad }}>
        <StudioText role="navItem" tone="quiet" as="span">{entry.position}.</StudioText>
        <StudioText role="navItem" tone="secondary" as="span">
          {s?.heading ?? 'Untitled section'}
        </StudioText>
      </div>
    );
  }

  const node = entry.node;
  const proposed = proposedById.get(node.id);
  const from = positionOf(node.derivedSectionIds[0] ?? '');
  const to = positionOf(node.derivedSectionIds[node.derivedSectionIds.length - 1] ?? '');
  const changed = proposed
    && (proposed.title !== node.title || proposed.kind !== node.kind);
  const boundaryChanged = proposed
    && (positionOf(proposed.fromSectionId) !== from || positionOf(proposed.toSectionId) !== to);
  const mine = node.id.startsWith('m');
  const hasDoubt = (proposed?.uncertainty.length ?? 0) > 0;
  const open = expanded.has(node.id);
  const sectionCount = entry.entries.filter((e) => e.kind === 'section').length;

  return (
    <div data-review-unit={node.id} style={{ marginTop: SPACE.snug }}>
      <div style={{ display: 'flex', gap: SPACE.snug, alignItems: 'baseline', paddingLeft: pad }}>
        {/* COLLAPSED MUST NOT MEAN SETTLED. A division carrying qualification
            says so before it is opened; without this the summary would read as
            a settled outline and the caveats would be one click away from a
            member who has no reason to click. */}
        {/* THE MARKER IS THE ROW'S SHARE OF THE QUALIFICATION.
            What she left open is stated in full, once, in the gathered panel
            below - where the ten of them can be weighed together, which is the
            point. Repeating each division's caveat inline said the same thing
            twice and tripled the height of the outline, which is how the room
            became unreadable in the first place.
            NOT HIDDEN: the marker is on the row, it names the tags to a
            machine, and its title names them to a person on hover. */}
        {hasDoubt && (
          <span data-uncertainty={proposed?.uncertainty.join(',')}
            aria-label={`MAIA left open: ${(proposed?.uncertainty ?? [])
              .map((u) => UNCERTAINTY_SAYS[u] ?? u).join(', ')}`}
            title={`MAIA left open: ${(proposed?.uncertainty ?? [])
              .map((u) => UNCERTAINTY_SAYS[u] ?? u).join(', ')}`}
            style={{ color: INK.muted }}>◇</span>
        )}
        <StudioText role="workIdentity" as="span" style={{ flex: 1 }}>
          {node.kind && node.title ? `${node.kind} — ${node.title}`
            : node.title ?? node.kind ?? 'Untitled division'}
        </StudioText>
        <StudioText role="metadata" tone="quiet" as="span">{from}–{to}</StudioText>
        {sectionCount > 0 && (
          <Tiny
            label={open ? `hide the ${sectionCount} sections here`
              : `show the ${sectionCount} sections here`}
            disabled={false}
            onClick={() => onToggle(node.id)}
          >{open ? '−' : `+${sectionCount}`}</Tiny>
        )}
        <Tiny label="move this division out one level" disabled={busy}
          onClick={() => onGesture({ op: 'promote', unitId: node.id }, true)}>⇤</Tiny>
      </div>

      {/* THE TWO VOICES, kept apart. Only shown once they differ. */}
      {proposed && (changed || boundaryChanged) && (
        <div data-maia-original style={{ paddingLeft: pad + SPACE.base }}>
          <StudioText role="metadata" tone="quiet" style={{ display: 'block' }}>
            MAIA originally suggested {proposed.title ?? 'this division'}
            {' '}{positionOf(proposed.fromSectionId)}–{positionOf(proposed.toSectionId)}
          </StudioText>
          {proposed.rationale && (
            <StudioText role="quiet" style={{ display: 'block' }}>{proposed.rationale}</StudioText>
          )}
        </div>
      )}
      {mine && (
        <StudioText role="metadata" tone="quiet" data-member-authored
          style={{ display: 'block', paddingLeft: pad + SPACE.base }}>
          added by you
        </StudioText>
      )}

      {/* THE THESIS FIRST, EVIDENCE ON DEMAND.
          Child DIVISIONS always show - they are the reading. Section rows are
          the evidence for it, and 174 of them at once is a serialization, not a
          structure a person can hold.

          They remain IN THE DOM, hidden rather than unmounted, deliberately:
          the whole Work is still present, once, in order, which is what 8a
          asserts about this surface. Collapsing by unmounting would have made
          the room pass a completeness check it no longer met. */}
      {entry.entries.map((e) => (
        e.kind === 'section'
          ? (
            <div key={entryKey(e)} hidden={!open}>
              <Entry entry={e} depth={depth + 1}
                headingOf={headingOf} proposedById={proposedById} positionOf={positionOf}
                busy={busy} onGesture={onGesture} expanded={expanded} onToggle={onToggle} />
            </div>
          )
          : (
            <Entry key={entryKey(e)} entry={e} depth={depth + 1}
              headingOf={headingOf} proposedById={proposedById} positionOf={positionOf}
              busy={busy} onGesture={onGesture} expanded={expanded} onToggle={onToggle} />
          )
      ))}
      {entry.empty.map((c) => (
        <StudioText key={c.id} role="metadata" tone="quiet"
          style={{ display: 'block', paddingLeft: pad + SPACE.base }}>
          {c.title ?? 'Untitled division'} — no sections yet
        </StudioText>
      ))}
    </div>
  );
}

function Tiny({
  children, label, onClick, disabled,
}: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled}
      style={{
        background: GROUND.active, border: 'none', borderRadius: RADIUS.sm,
        color: INK.secondary, cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        padding: `${SPACE.hairline}px ${SPACE.snug}px`,
        font: 'inherit', fontSize: '0.75rem', lineHeight: 1.4,
      }}>
      {children}
    </button>
  );
}
