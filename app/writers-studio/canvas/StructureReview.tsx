/**
 * WS2-05B step 5b — the room where a reading is judged.
 *
 * WHOSE VOICE IS WHOSE. A division the member has changed shows THEIR structure
 * as the fact and MAIA's as what was suggested, beneath it. Her rationale never
 * migrates onto a boundary she did not propose: the frozen interpretation is
 * evidence, the reviewed tree is authorship, and the surface never lets one
 * wear the other's clothes.
 *
 * THE REVIEW READS AS THE BOOK. Same ordering primitive as the canonical
 * outline, so unaccounted material sits in position between proposed divisions
 * rather than below them.
 *
 * NO TREE IS EVER MANUFACTURED. `none` renders the account and the book, with
 * no divisions and no apology. `ambiguous` renders the alternatives and no
 * canonical structure at all.
 *
 * THERE IS NO "USE THIS STRUCTURE" HERE. Absent, not disabled.
 *
 * ── WS2-05B-8B-02a-UX01 · STRUCTURE REVIEW EXPERIENCE ──────────────────────
 *
 * UNDERSTAND → ORIENT → INSPECT → RESPOND.
 *
 * 02a put MAIA's thesis first and the room still failed a reader, because four
 * unlike things were competing as equals: her overall reading, her reasoning,
 * the structural map, and the questions that require the author. They are not
 * equally important and the page was not saying so.
 *
 * THE CLEAREST SYMPTOM WAS `Why?`. Twenty-two identical buttons turned
 * EXPLANATION into a repeated control — and for one commit an authoring gesture
 * was living inside one of them, which conflated two questions that must never
 * share an affordance:
 *
 *     Why does MAIA see it this way?     ← about her reading
 *     What do I want to do with it?      ← about my structure
 *
 * SELECTION REPLACES REPETITION. A row is selected; an inspector answers for
 * the selected row. One explanation surface instead of twenty-two disclosures,
 * and the outline goes back to being an outline: a chevron that discloses what
 * is inside, a name, a range, a count. The count is metadata, not a button.
 *
 * WHAT THE CHEVRON MEANS, and it is one thing: SHOW WHAT IS INSIDE. A division
 * holding divisions opens by default — that tree IS the reading. A division
 * holding sections stays closed — those are the evidence for it, and 174 of
 * them at once is the serialization this unit exists to stop. Different
 * defaults, one meaning.
 *
 * ONLY EXCEPTIONS ARE MARKED. A row carrying a question or an unresolved
 * boundary says so; an untroubled row says nothing. Marking everything is the
 * same as marking nothing.
 *
 * NO NEW COGNITION. The inspector shows only what the frozen reading already
 * holds. It asks MAIA nothing, stores nothing, and changes nothing. `Ask MAIA
 * about this` is 02c and is deliberately absent — not disabled, absent.
 *
 * A LABEL IS NOT A TITLE. `title` is the Work's words and would be written into
 * the manuscript on adoption; `editorialLabel` is MAIA's description for
 * writing to the member ABOUT their book, and never becomes one.
 *
 * IT MUST DEGRADE HONESTLY. A proposal frozen before the editorial contract
 * carries no letter and no labels; the room says which kind of reading it holds
 * rather than looking diminished for a reason the member cannot see.
 */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GROUND, INK, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';
import {
  fetchProposal, applyGesture, previewGesture, reviewRefusalCopy,
  type ProposalView,
} from '@/lib/writersStudio/reviewClient';
import { orderReview, type ChangeRow } from '@/lib/writersStudio/reviewPresentation';
import type { OutlineEntry } from '@/lib/writersStudio/outlineOrder';
import { promoteShape, reviewDiff } from '@/lib/manuscript/structure/review';
import type { PromoteShape, ReviewOperation, ReviewedUnit } from '@/lib/manuscript/structure/review';
import type {
  EditorialQuestion, EditorialSynthesis, ProposedUnit, UncertainRegion,
} from '@/lib/manuscript/structure/interpret';
import AskMaia from './AskMaia';
import type { AskAnchor } from '@/lib/manuscript/ask/anchor';

/** Prose measure. Long lines cost comprehension; this is the usual 65–75ch. */
const MEASURE = '70ch';

/**
 * Hover, focus and narrow-screen behaviour, which inline styles cannot express.
 *
 * Scoped by a `ws2sr-` prefix rather than a global reset. The focus ring is not
 * optional: selection is the room's primary gesture and it has to be reachable
 * and visible from the keyboard, not merely clickable.
 */
const CSS = `
.ws2sr-row{display:flex;align-items:center;flex-wrap:wrap;gap:${SPACE.snug}px;
  min-height:44px;border-radius:${RADIUS.sm}px;padding-right:${SPACE.snug}px}
.ws2sr-row:hover{background:${GROUND.raised}}
.ws2sr-row[data-selected="true"]{background:${GROUND.active}}
.ws2sr-pick{flex:1;display:flex;align-items:center;gap:${SPACE.snug}px;
  background:none;border:none;padding:${SPACE.tight}px ${SPACE.snug}px;margin:0;
  font:inherit;color:inherit;text-align:left;cursor:pointer}
.ws2sr-twist{background:none;border:none;color:${INK.quiet};cursor:pointer;
  font:inherit;line-height:1;padding:${SPACE.tight}px;width:24px;flex:0 0 24px}
.ws2sr-twist[data-empty="true"]{visibility:hidden;cursor:default}
.ws2sr-pick:focus-visible,.ws2sr-twist:focus-visible{outline:2px solid ${INK.secondary};
  outline-offset:1px;border-radius:${RADIUS.sm}px}
.ws2sr-split{display:flex;gap:${SPACE.roomy}px;align-items:flex-start}
.ws2sr-main{flex:1;min-width:0}
.ws2sr-inspector{flex:0 0 360px;position:sticky;top:${SPACE.base}px;
  border-left:1px solid ${RULE.quiet};padding-left:${SPACE.base}px}
.ws2sr-group{border-left:1px solid ${RULE.quiet}}
/* A mark is an aside about the row, not part of its name. The left rule and
   the padding keep two marks from reading as one phrase — which is exactly how
   \`question\` and \`uncertain\` failed, both on screen and when the outline was
   copied out of the page. */
.ws2sr-mark{flex:0 0 auto;padding-left:${SPACE.snug}px;
  border-left:1px solid ${RULE.quiet}}
@media (max-width:900px){
  .ws2sr-split{display:block}
  .ws2sr-inspector{flex:none;position:static;border-left:none;padding-left:0;
    border-top:1px solid ${RULE.quiet};padding-top:${SPACE.base}px;
    margin-top:${SPACE.roomy}px}
}
`;

export default function StructureReview({
  manuscriptId, proposalId,
}: { manuscriptId: string; proposalId: string }) {
  const [view, setView] = useState<ProposalView | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<{ op: ReviewOperation; rows: ChangeRow[] } | null>(null);
  /** Explicit overrides only; the default is computed per row. See `OPEN`. */
  const [openOverride, setOpenOverride] = useState<ReadonlyMap<string, boolean>>(new Map());
  const [selected, setSelected] = useState<string | null>(null);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const questionsRef = useRef<HTMLDivElement | null>(null);

  const toggleOpen = useCallback((unitId: string, current: boolean) => {
    setOpenOverride((prev) => new Map(prev).set(unitId, !current));
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

  /**
   * WHAT "MOVE THIS DIVISION OUT" WOULD ACTUALLY DO, in the member's own names.
   *
   * The affordance used to read `Move out one level`, which describes the tree
   * and not the book: it asked the writer to hold a mental model of depth in
   * order to predict a change to their manuscript. What they need is the
   * consequence — which division this one is currently inside, and where it
   * would sit afterwards.
   *
   * NO NEW COGNITION. Every fact here is already in the reviewed tree and the
   * section order: who the parent is, who the grandparent is, and whether this
   * division sits at its parent's start, its end, or in the middle. The last of
   * those is `promoteShape` from the review module itself — the same rule the
   * operation enforces — so the room cannot promise an outcome the server would
   * refuse, nor name a landing place different from the one it performs.
   */
  const promotion = useMemo(() => {
    if (!view || !selected) return null;
    const path = pathToUnit(view.reviewed.units, selected);
    /* One entry is a top-level division: there is nothing to move out OF, and
       the whole panel is absent rather than disabled. */
    if (!path || path.length < 2) return null;
    const unit = path[path.length - 1];
    const parent = path[path.length - 2];
    const grandparent = path.length >= 3 ? path[path.length - 3] : null;

    const at = (id: string) => headingOf(id)?.position;
    const cFrom = at(unit.fromSectionId), cTo = at(unit.toSectionId);
    const pFrom = at(parent.fromSectionId), pTo = at(parent.toSectionId);
    if (cFrom === undefined || cTo === undefined || pFrom === undefined || pTo === undefined) {
      return null;
    }
    const name = (u: ReviewedUnit) =>
      divisionName(u.title, proposedById.get(u.id)?.editorialLabel ?? null, u.kind);
    return {
      unitId: unit.id,
      thisName: name(unit),
      parentName: name(parent),
      /* No grandparent means the parent is top-level, so this division would
         land at the top level too — named as the book, not as a null. */
      grandparentName: grandparent ? name(grandparent) : null,
      shape: promoteShape({ from: cFrom, to: cTo }, { from: pFrom, to: pTo }),
    };
  }, [view, selected, headingOf, proposedById]);

  /**
   * Which questions bear on which division, matched by the sections they name.
   *
   * DERIVED FROM IDS SHE SUPPLIED, never from her prose. A question carries the
   * sections it is about; a division carries a range. The overlap is arithmetic
   * — the room is not reading her sentences to guess what they refer to.
   */
  /**
   * WHICH ROW WEARS THE MARK — the deepest division holding the section.
   *
   * Range containment alone marks every ancestor: one question about sections
   * 3 and 4 lit up five rows, because `body` contains them and so does the Part
   * and so does the division inside it. A signal on five rows for one question
   * is the failure this unit is correcting — marking everything is the same as
   * marking nothing.
   *
   * The INSPECTOR still shows a question on any division whose range contains
   * it, which is context rather than signal and can afford to be generous.
   */
  const questionMarks = useMemo(() => {
    const at = new Map(view?.sections.map((s) => [s.id, s.position]) ?? []);
    const qs = view?.interpretation.editorialSynthesis?.questionsForAuthor ?? [];
    const units: { id: string; a: number; b: number; depth: number }[] = [];
    const walk = (l: readonly ProposedUnit[], depth: number) => {
      for (const u of l) {
        const a = at.get(u.fromSectionId);
        const b = at.get(u.toSectionId);
        if (a !== undefined && b !== undefined) units.push({ id: u.id, a, b, depth });
        walk(u.children, depth + 1);
      }
    };
    if (view && 'units' in view.interpretation) walk(view.interpretation.units, 0);

    const marks = new Map<string, { q: EditorialQuestion; index: number }[]>();
    for (const [index, q] of qs.entries()) {
      const owners = new Set<string>();
      for (const sid of q.sectionIds ?? []) {
        const p = at.get(sid);
        if (p === undefined) continue;
        let best: { id: string; depth: number } | null = null;
        for (const u of units) {
          if (p >= u.a && p <= u.b && (!best || u.depth > best.depth)) best = u;
        }
        if (best) owners.add(best.id);
      }
      for (const id of owners) marks.set(id, [...(marks.get(id) ?? []), { q, index }]);
    }
    return marks;
  }, [view]);

  const questionsFor = useMemo(() => {
    const at = new Map(view?.sections.map((s) => [s.id, s.position]) ?? []);
    const qs = view?.interpretation.editorialSynthesis?.questionsForAuthor ?? [];
    /* THE INDEX TRAVELS WITH THE QUESTION. An anchor names a position in the
       FROZEN reading, not a position in this unit's filtered list — those
       differ the moment a division holds the second question rather than the
       first, and an anchor off by one would open a conversation about a
       question the writer did not click. */
    return (u: ProposedUnit | undefined): { q: EditorialQuestion; index: number }[] => {
      if (!u) return [];
      const a = at.get(u.fromSectionId);
      const b = at.get(u.toSectionId);
      if (a === undefined || b === undefined) return [];
      return qs.map((q, index) => ({ q, index })).filter(({ q }) =>
        (q.sectionIds ?? []).some((id) => {
          const p = at.get(id);
          return p !== undefined && p >= a && p <= b;
        }));
    };
  }, [view]);

  /* The frozen UncertainRegions that fall inside a division, each carrying its
     index in the reading for the same reason questions do. These are a
     DIFFERENT OBJECT from a unit's `uncertainty` tags: a region is a place she
     could not settle, with her words for why; a tag is the kind of doubt. Only
     a region is anchorable as one, so only a region gets an `uncertainty`
     anchor — the tags are talked about through the division. */
  /* THE CONVERSATION LIVES HERE, NOT IN THE INSPECTOR, because a mark in the
     outline must be able to open it. Held in the parent it is one room, opened
     from either place, and clicking a second mark replaces the first. */
  const [asking, setAsking] = useState<{ anchor: AskAnchor; about: string } | null>(null);

  const regionsFor = useMemo(() => {
    const at = new Map(view?.sections.map((s) => [s.id, s.position]) ?? []);
    const rs = view?.interpretation.uncertainRegions ?? [];
    return (u: ProposedUnit | undefined): { r: UncertainRegion; index: number }[] => {
      if (!u) return [];
      const a = at.get(u.fromSectionId);
      const b = at.get(u.toSectionId);
      if (a === undefined || b === undefined) return [];
      return rs.map((r, index) => ({ r, index })).filter(({ r }) => {
        const x = at.get(r.fromSectionId);
        const y = at.get(r.toSectionId);
        return x !== undefined && y !== undefined && x <= b && y >= a;
      });
    };
  }, [view]);

  if (!view) {
    return (
      <div data-review-state="loading" style={{ padding: SPACE.comfortable }}>
        <StudioText role="metadata">{notice ?? 'reading the proposal…'}</StudioText>
      </div>
    );
  }

  const form = view.interpretation.form;
  const syn = view.interpretation.editorialSynthesis;
  const anyLabel = [...proposedById.values()]
    .some((u) => typeof u.editorialLabel === 'string' && u.editorialLabel.length > 0);
  const selectedUnit = selected ? proposedById.get(selected) : undefined;

  /**
   * A MARK IN THE OUTLINE TAKES UP EXACTLY WHAT IT NAMES.
   *
   * THE CLICK CONSUMES THE SET THAT RENDERED THE MARK. The question mark is
   * drawn from `questionMarks` — the questions assigned to THIS row, by deepest
   * containing division. Recomputing from `questionsFor`, which is the
   * inspector's broader overlap context, meant a row could visibly say "a
   * question for you" from one owned question while the click saw several
   * contextual ones and opened none — or, worse, opened a different one. Same
   * frozen indices in, same conversation out.
   *
   * A TAG IS NOT A REGION, AND A CLICK MUST NOT CONVERT ONE INTO THE OTHER.
   * The `left open: …` mark is rendered from a division's `uncertainty` TAGS.
   * An earlier version, finding exactly one `UncertainRegion` overlapping the
   * division, opened a conversation about that REGION — laundering a tag into a
   * region it has no identity relation to, which is the exact distinction this
   * slice was careful to establish. So this mark always opens the DIVISION,
   * truthfully. Region-specific conversation stays where a region is actually
   * named on screen: the inspector, which lists each region with its own way in.
   */
  const takeUpMark = useCallback((unitId: string, mark: 'question' | 'open') => {
    setSelected(unitId);
    const unit = proposedById.get(unitId);
    if (!unit) return;

    if (mark === 'question') {
      const marked = questionMarks.get(unitId) ?? [];
      /* One owned question opens directly. Several are listed in the inspector,
         each with its own way in, because choosing between them would be a
         guess about which one the writer meant. */
      setAsking(marked.length === 1
        ? { anchor: { on: 'question', proposalId, questionIndex: marked[0].index },
            about: marked[0].q.label }
        : null);
      return;
    }

    setAsking({
      anchor: { on: 'division', proposalId, unitId: unit.id },
      about: `what she left open in ${
        divisionName(unit.title, unit.editorialLabel ?? null, unit.kind)}`,
    });
  }, [proposalId, questionMarks, proposedById]);


  return (
    <div data-structure-review data-form={form} style={{ padding: SPACE.comfortable }}>
      <style>{CSS}</style>

      {/* ── UNDERSTAND ───────────────────────────────────────────────────── */}
      <EditorialLetter
        synthesis={syn}
        account={view.interpretation.account}
        open={reasoningOpen}
        onToggle={() => setReasoningOpen((v) => !v)}
        /* ── ORIENT, inside the letter and ABOVE the invitation to read more.
              What needs the author outranks an offer of further prose: these
              are the only things on the page nobody else can do. */
        orientation={
          <Orientation view={view} syn={syn}
            onGoToQuestions={() => questionsRef.current?.scrollIntoView(
              { behavior: 'smooth', block: 'start' })} />
        } />

      <Coverage view={view} />

      {notice && (
        <StudioText role="quiet" data-review-notice
          style={{ display: 'block', margin: `${SPACE.base}px 0`, maxWidth: MEASURE }}>
          {notice}
        </StudioText>
      )}

      {pending && (
        <PostImage rows={pending.rows} busy={busy}
          onCommit={() => void gesture(pending.op, false)}
          onCancel={() => setPending(null)} />
      )}

      {form === 'ambiguous' && 'alternatives' in view.interpretation && (
        <div data-alternatives style={{ marginBottom: SPACE.roomy, maxWidth: MEASURE }}>
          <StudioText role="panelLabel" style={{ display: 'block', marginBottom: SPACE.snug }}>
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

      {form === 'none' && (
        <StudioText role="panelLabel" data-no-structure
          style={{ display: 'block', margin: `${SPACE.base}px 0` }}>
          no divisions proposed
        </StudioText>
      )}

      {ordered?.status === 'refused' ? (
        <StudioText role="quiet" data-review-unrenderable
          style={{ display: 'block', maxWidth: MEASURE }}>
          This proposal cannot be shown safely: {reviewRefusalCopy(ordered.refusal)} Nothing has
          been changed, and your writing is not affected.
        </StudioText>
      ) : (
        <div data-review-map
          style={{ marginTop: SPACE.roomy, paddingTop: SPACE.base,
            borderTop: `1px solid ${RULE.quiet}` }}>
          <StudioText role="bandLabel" style={{ display: 'block' }}>
            your book&apos;s shape
          </StudioText>
          {anyLabel && (
            <StudioText role="metadata" tone="quiet" data-label-note
              style={{ display: 'block', marginBottom: SPACE.base, maxWidth: MEASURE }}>
              Where your Work does not name a division, MAIA describes it. Those
              descriptions are hers — they are not titles in your manuscript.
            </StudioText>
          )}

          {/* ── INSPECT. One explanation surface, for the selected row. ──── */}
          <div className="ws2sr-split">
            <div className="ws2sr-main" data-review-column>
              {ordered?.outline.entries.map((e) => (
                <Entry key={entryKey(e)} entry={e} depth={0}
                  headingOf={headingOf} proposedById={proposedById}
                  positionOf={(id) => headingOf(id)?.position}
                  openOverride={openOverride} onToggleOpen={toggleOpen}
                  selected={selected} onSelect={setSelected}
                  questionMarks={questionMarks} onMark={takeUpMark} />
              ))}
            </div>
            <Inspector unit={selectedUnit}
              positionOf={(id) => headingOf(id)?.position}
              questions={questionsFor(selectedUnit)}
              regions={regionsFor(selectedUnit)}
              manuscriptId={manuscriptId} proposalId={proposalId}
              asking={asking} setAsking={setAsking}
              busy={busy} onGesture={gesture} promotion={promotion} />
          </div>
        </div>
      )}

      {/* ── RESPOND ──────────────────────────────────────────────────────── */}
      <div ref={questionsRef}>
        <OpenQuestions view={view} headingOf={headingOf} proposedById={proposedById} />
      </div>

      {delta && (delta.added.length || delta.removed.length || delta.changed.length) ? (
        <StudioText role="metadata" data-review-delta
          style={{ display: 'block', marginTop: SPACE.comfortable }}>
          Your changes so far: {[
            delta.changed.length && `${delta.changed.length} division${delta.changed.length === 1 ? '' : 's'} altered`,
            delta.added.length && `${delta.added.length} added`,
            delta.removed.length && `${delta.removed.length} removed`,
          ].filter(Boolean).join(', ')}.
        </StudioText>
      ) : null}
    </div>
  );
}

/**
 * The chain of divisions from the top of the tree down to one unit.
 *
 * Depth alone told the inspector only THAT something could move; the path tells
 * it what the division is inside and what it would sit under afterwards, which
 * is what the member is actually being asked to picture.
 */
function pathToUnit(
  units: readonly ReviewedUnit[], id: string, trail: ReviewedUnit[] = [],
): ReviewedUnit[] | null {
  for (const u of units) {
    if (u.id === id) return [...trail, u];
    const deeper = pathToUnit(u.children, id, [...trail, u]);
    if (deeper) return deeper;
  }
  return null;
}

/**
 * ONE NAMING RULE for a division, wherever it is written.
 *
 * The Work's own title first; MAIA's description only where the Work does not
 * name it; the kind only where neither does. Kept in one function because the
 * outline row, the inspector headline and the promotion preview must call the
 * same division by the same name — a preview that renamed it would read as a
 * different division.
 */
function divisionName(
  title: string | null, editorialLabel: string | null, kind: string | null,
): string {
  return title ?? editorialLabel ?? kind ?? 'Untitled division';
}

const entryKey = (e: OutlineEntry) => e.kind === 'section' ? `s:${e.id}` : `u:${e.node.id}`;

/**
 * UNDERSTAND — what she thinks the Work is doing.
 *
 * ASKED FOR AT READING TIME, NOT DERIVED HERE. The room does not cut her
 * account into headings and does not summarise her tree: either would be a
 * second reading authored by code, wearing her name.
 *
 * THE THESIS STAYS; EVERYTHING ELSE OF HERS FOLDS. On the real reading the
 * account is ~1,800 characters and the findings another ~1,200. Shown together
 * they are the densest thing on the page and they arrive first, which is the
 * shape 8B failed on. Behind one quiet disclosure they are complete, unedited,
 * and not competing with the map at page load.
 *
 * WITHOUT A LETTER, THE ACCOUNT KEEPS ITS OLD PLACE. A reading frozen before
 * the editorial contract has nothing else, and hiding its one statement would
 * make an older proposal harder to read than a newer one.
 */
function EditorialLetter({
  synthesis, account, open, onToggle, orientation,
}: {
  synthesis: EditorialSynthesis | undefined;
  account: string;
  open: boolean;
  onToggle: () => void;
  orientation: React.ReactNode;
}) {
  if (!synthesis) {
    return (
      <div data-editorial-letter="absent" style={{ maxWidth: MEASURE }}>
        <StudioText role="maiaReading" data-maia-account
          style={{ display: 'block', marginBottom: SPACE.snug }}>
          {account}
        </StudioText>
        <StudioText role="metadata" tone="quiet" style={{ display: 'block' }}>
          This reading was made before MAIA was asked to write to you directly,
          so it has her account of the Work and no letter.
        </StudioText>
        {orientation}
      </div>
    );
  }
  return (
    <div data-editorial-letter="present" style={{ maxWidth: MEASURE }}>
      <StudioText role="bandLabel" style={{ display: 'block' }}>MAIA&apos;s read</StudioText>
      <StudioText role="prose" data-thesis
        style={{ display: 'block', margin: `${SPACE.snug}px 0 ${SPACE.base}px` }}>
        {synthesis.thesis}
      </StudioText>

      {orientation}

      <Tiny label={open ? "hide MAIA's reasoning" : "read MAIA's reasoning"}
        plain onClick={onToggle}>
        {open ? '⌄ Hide MAIA’s reasoning' : '› Read MAIA’s reasoning'}
      </Tiny>

      {/* HIDDEN, NOT UNMOUNTED — what she said is on the page either way. */}
      <div hidden={!open} style={{ marginTop: SPACE.base }}>
        {synthesis.strongestFindings.length > 0 && (
          <div data-findings style={{ marginBottom: SPACE.base }}>
            <StudioText role="panelLabel" style={{ display: 'block', marginBottom: SPACE.tight }}>
              what she would stand behind
            </StudioText>
            {synthesis.strongestFindings.map((f, i) => (
              <StudioText key={i} role="maiaReading" data-finding
                style={{ display: 'block', paddingLeft: SPACE.base, marginBottom: SPACE.tight }}>
                {f}
              </StudioText>
            ))}
          </div>
        )}
        <StudioText role="maiaReading" data-maia-account style={{ display: 'block' }}>
          {account}
        </StudioText>
      </div>
    </div>
  );
}

/**
 * ORIENT — the weight of what is open, before the map rather than after it.
 *
 * The questions are the only things on this page that nobody but the author can
 * answer, and they used to arrive below the whole structural tree. A count is
 * not a summary of them and does not pretend to be: it says how much is waiting
 * and offers to take you there.
 */
function Orientation({
  view, syn, onGoToQuestions,
}: {
  view: ProposalView;
  syn: EditorialSynthesis | undefined;
  onGoToQuestions: () => void;
}) {
  const q = syn?.questionsForAuthor.length ?? 0;
  const seams = view.interpretation.uncertainRegions.length;
  const total = view.sections.length;
  const loose = view.interpretation.unaccountedSectionIds.length;
  if (q === 0 && seams === 0) return null;
  return (
    <div data-orientation
      style={{ display: 'flex', alignItems: 'baseline', gap: SPACE.snug,
        flexWrap: 'wrap', margin: `${SPACE.base}px 0`, maxWidth: MEASURE }}>
      {q > 0 && (
        <Tiny label={`go to the ${q} questions MAIA has for you`} onClick={onGoToQuestions}>
          {q} question{q === 1 ? '' : 's'} for you
        </Tiny>
      )}
      <StudioText role="metadata" tone="quiet" as="span">
        {seams > 0 && `${seams} uncertain seam${seams === 1 ? '' : 's'}`}
        {seams > 0 && ' · '}
        {total - loose} of {total} sections accounted for
      </StudioText>
    </div>
  );
}

/**
 * INSPECT — one explanation surface, for the selected row.
 *
 * It replaces twenty-two `Why?` disclosures, and the replacement is not merely
 * tidier: a repeated control turns explanation into furniture, and the member
 * stops reading it. Here the question is asked once, by selecting, and answered
 * in one place.
 *
 * NOTHING HERE IS NEW COGNITION. Every line comes out of the frozen row — her
 * label, her rationale, her uncertainty, and the questions she attached to
 * sections inside this range. The inspector asks MAIA nothing and stores
 * nothing.
 *
 * `Ask MAIA about this` IS ABSENT, NOT DISABLED. It is 02c, it does not exist,
 * and a greyed-out control promising it would be the room advertising a
 * capability the programme has not built.
 *
 * THE AUTHORING GESTURE LIVES HERE, AND IS MARKED AS A DIFFERENT KIND OF THING.
 * "Why does MAIA see it this way" and "what do I want to do with it" must never
 * share an affordance — they shared one for exactly one commit, and it was the
 * clearest thing wrong with the room.
 */
/**
 * The one way into a conversation, so every mark opens the same room.
 *
 * A BUTTON, NOT A LINK: it opens a room in place and navigates nowhere, and a
 * writer who middle-clicks a link expecting a tab would lose the reading.
 */
function TalkButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} data-talk-with-maia
      style={{ display: 'block', marginTop: SPACE.hairline, padding: 0,
        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
      <StudioText role="metadata" as="span" style={{ textDecoration: 'underline' }}>
        {label}
      </StudioText>
    </button>
  );
}

function Inspector({
  unit, positionOf, questions, regions, manuscriptId, proposalId,
  asking, setAsking, busy, onGesture, promotion,
}: {
  unit: ProposedUnit | undefined;
  positionOf: (id: string) => number | undefined;
  /** Each carries its index in the FROZEN reading, which is what an anchor names. */
  questions: { q: EditorialQuestion; index: number }[];
  regions: { r: UncertainRegion; index: number }[];
  manuscriptId: string;
  proposalId: string;
  /* ONE CONVERSATION AT A TIME, OWNED BY THE PARENT so a mark in the outline can
     open the same room this panel does. */
  asking: { anchor: AskAnchor; about: string } | null;
  setAsking: (a: { anchor: AskAnchor; about: string } | null) => void;
  busy: boolean;
  onGesture: (op: ReviewOperation, previewFirst: boolean) => void;
  /** What moving this division out would do — absent when it is top-level. */
  promotion: {
    unitId: string; thisName: string; parentName: string;
    grandparentName: string | null; shape: PromoteShape;
  } | null;
}) {
  if (!unit) {
    return (
      <aside className="ws2sr-inspector" data-inspector="empty">
        <StudioText role="metadata" tone="quiet" style={{ display: 'block' }}>
          Select a division to see what MAIA saw there.
        </StudioText>
      </aside>
    );
  }
  const from = positionOf(unit.fromSectionId);
  const to = positionOf(unit.toSectionId);
  return (
    <aside className="ws2sr-inspector" data-inspector={unit.id}>
      <StudioText role="workIdentity" style={{ display: 'block' }}>
        {divisionName(unit.title, unit.editorialLabel ?? null, unit.kind)}
      </StudioText>
      <StudioText role="metadata" tone="quiet" style={{ display: 'block' }}>
        sections {from}–{to}{unit.kind ? ` · ${unit.kind}` : ''}
      </StudioText>

      {unit.title !== null && unit.editorialLabel && (
        <Panel label="what MAIA calls it">{unit.editorialLabel}</Panel>
      )}

      {unit.rationale && (
        /* HER WORDS FOR THIS DIVISION, under a heading that says what they
           are. The button used to say "Why?" and the field often answers
           "what" — naming the panel for the field rather than for a question
           it may not answer stops the room making a promise she did not. */
        <Panel label="how she reads it">{unit.rationale}</Panel>
      )}

      {(unit.uncertainty.length > 0 || regions.length > 0) && (
        <div data-inspector-uncertainty style={{ marginTop: SPACE.base }}>
          <StudioText role="panelLabel" style={{ display: 'block' }}>
            what she left open
          </StudioText>

          {/* THE ROW SAID "left open: where this ends +2 more" AND STOPPED
              THERE. It communicated that something was open and then had
              nowhere to go. Each open thing is now its own line, and each line
              can be taken up. */}
          {unit.uncertainty.map((u) => (
            <StudioText key={u} role="quiet" data-open-tag={u}
              style={{ display: 'block', marginTop: SPACE.hairline }}>
              {UNCERTAINTY_SAYS[u] ?? u}
            </StudioText>
          ))}

          {regions.map(({ r, index }) => (
            <div key={index} data-open-region={index} style={{ marginTop: SPACE.snug }}>
              <StudioText role="quiet" style={{ display: 'block' }}>{r.why}</StudioText>
              <TalkButton
                label="Talk with MAIA about this"
                onClick={() => setAsking({
                  anchor: { on: 'uncertainty', proposalId, regionIndex: index },
                  about: r.why,
                })} />
            </div>
          ))}

          {/* A DIVISION'S TAGS ARE NOT A REGION, so they are taken up through
              the division rather than pretending to be an anchor they are not. */}
          {unit.uncertainty.length > 0 && regions.length === 0 && (
            <TalkButton
              label="Talk with MAIA about this"
              onClick={() => setAsking({
                anchor: { on: 'division', proposalId, unitId: unit.id },
                about: `what she left open in ${
                  divisionName(unit.title, unit.editorialLabel ?? null, unit.kind)}`,
              })} />
          )}
        </div>
      )}

      {unit.evidenceRefs.length > 0 && (
        <Panel label="what she reasoned from">{unit.evidenceRefs.join(' · ')}</Panel>
      )}

      {questions.map(({ q, index }) => (
        <div key={index} data-inspector-question={index} style={{ marginTop: SPACE.base }}>
          <StudioText role="panelLabel" style={{ display: 'block' }}>
            a question for you
          </StudioText>
          <StudioText role="navItem" style={{ display: 'block' }}>{q.label}</StudioText>
          <StudioText role="quiet" style={{ display: 'block' }}>{q.explanation}</StudioText>
          {/* SHE ASKED; NOW IT CAN BE ANSWERED. The anchor names the question's
              position in the frozen reading, so the conversation opens on the
              exact entry the writer is looking at. */}
          <TalkButton
            label="Talk with MAIA about this"
            onClick={() => setAsking({
              anchor: { on: 'question', proposalId, questionIndex: index },
              about: q.label,
            })} />
        </div>
      ))}

      {asking && (
        <AskMaia manuscriptId={manuscriptId} anchor={asking.anchor}
          about={asking.about} onClose={() => setAsking(null)} />
      )}

      {promotion && (
        /* THE GESTURE IS DESCRIBED BY ITS CONSEQUENCE, NOT BY THE TREE.
           `Move out one level` was accurate and unreadable: it named a
           mechanic. What the writer holds in mind is their book — this
           division is inside that one, and afterwards it would sit beside it.
           So the panel names the parent, and shows where this would land.

           WHERE IT CANNOT MOVE, IT SAYS SO HERE rather than accepting the
           click and answering with a refusal. Same words either way: the copy
           comes from the refusal the operation itself would return. */
        <div data-inspector-structure
          style={{ marginTop: SPACE.roomy, paddingTop: SPACE.snug,
            borderTop: `1px solid ${RULE.quiet}` }}>
          <StudioText role="metadata" tone="quiet" style={{ display: 'block' }}>
            your structure
          </StudioText>
          <StudioText role="quiet" style={{ display: 'block', marginTop: SPACE.hairline }}>
            Currently inside {promotion.parentName}
          </StudioText>

          {promotion.shape === 'splits-parent' || promotion.shape === 'spans-parent' ? (
            <StudioText role="quiet" data-promote-blocked={promotion.shape}
              style={{ display: 'block', marginTop: SPACE.snug }}>
              {reviewRefusalCopy(promotion.shape === 'splits-parent'
                ? 'child_splits_parent' : 'parent_would_be_empty')}
            </StudioText>
          ) : (
            <>
              <div style={{ marginTop: SPACE.snug }}>
                <Tiny gesture="promote" disabled={busy}
                  label={`move this division outside ${promotion.parentName}`}
                  onClick={() => onGesture({ op: 'promote', unitId: promotion.unitId }, true)}>
                  Move outside “{promotion.parentName}”
                </Tiny>
              </div>
              <div data-promote-result style={{ marginTop: SPACE.base }}>
                <StudioText role="metadata" tone="quiet" style={{ display: 'block' }}>
                  it would then sit here
                </StudioText>
                <StudioText role="navItem" tone="quiet" style={{ display: 'block' }}>
                  {promotion.grandparentName ?? 'the top level of your book'}
                </StudioText>
                {/* BOOK ORDER, not a list: a division taken out of the start
                    of its parent stands before it, one taken out of the end
                    stands after. Showing them in the wrong order would
                    mispredict the one thing this preview exists to show.

                    Which row is the moved one is decided by POSITION, not by
                    comparing names — two divisions may legitimately carry the
                    same name, and then the preview would mark both. */}
                {(promotion.shape === 'prefix'
                  ? [
                      { name: promotion.thisName, moved: true },
                      { name: promotion.parentName, moved: false },
                    ]
                  : [
                      { name: promotion.parentName, moved: false },
                      { name: promotion.thisName, moved: true },
                    ]
                ).map((row, i) => (
                  <StudioText key={i} role="navItem" tone={row.moved ? 'primary' : 'quiet'}
                    data-promote-row={row.moved ? 'moved' : 'former-parent'}
                    style={{ display: 'block', paddingLeft: SPACE.roomy }}>
                    {row.name}{row.moved ? ' — this division' : ''}
                  </StudioText>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
}

function Panel({
  label, children, ...rest
}: { label: string; children: React.ReactNode; [k: `data-${string}`]: unknown }) {
  return (
    <div style={{ marginTop: SPACE.base }} {...rest}>
      <StudioText role="panelLabel" style={{ display: 'block' }}>{label}</StudioText>
      <StudioText role="quiet" style={{ display: 'block' }}>{children}</StudioText>
    </div>
  );
}

function Entry({
  entry, depth, headingOf, proposedById, positionOf,
  openOverride, onToggleOpen, selected, onSelect, questionMarks, onMark,
}: {
  entry: OutlineEntry;
  depth: number;
  headingOf: (id: string) => { id: string; position: number; heading: string | null } | undefined;
  proposedById: Map<string, ProposedUnit>;
  positionOf: (id: string) => number | undefined;
  openOverride: ReadonlyMap<string, boolean>;
  onToggleOpen: (unitId: string, current: boolean) => void;
  selected: string | null;
  onSelect: (unitId: string) => void;
  questionMarks: ReadonlyMap<string, { q: EditorialQuestion; index: number }[]>;
  /** Take up the mark that was clicked. See `takeUpMark` in the parent. */
  onMark: (unitId: string, mark: 'question' | 'open') => void;
}) {
  const pad = depth * SPACE.roomy;

  if (entry.kind === 'section') {
    return (
      /* UNACCOUNTED MEANS OUTSIDE EVERY DIVISION, and only depth 0 is. */
      <div data-section={entry.position}
        data-unaccounted={depth === 0 ? 'true' : undefined}
        style={{ display: 'flex', gap: SPACE.snug, paddingLeft: pad + SPACE.roomy,
          minHeight: 26, alignItems: 'center' }}>
        <StudioText role="metadata" tone="quiet" as="span">{entry.position}</StudioText>
        <StudioText role="navItem" tone="quiet" as="span">
          {headingOf(entry.id)?.heading ?? 'Untitled section'}
        </StudioText>
      </div>
    );
  }

  const node = entry.node;
  const proposed = proposedById.get(node.id);
  const from = positionOf(node.derivedSectionIds[0] ?? '');
  const to = positionOf(node.derivedSectionIds[node.derivedSectionIds.length - 1] ?? '');
  const changed = proposed && (proposed.title !== node.title || proposed.kind !== node.kind);
  const boundaryChanged = proposed
    && (positionOf(proposed.fromSectionId) !== from || positionOf(proposed.toSectionId) !== to);
  const mine = node.id.startsWith('m');
  const label = proposed?.editorialLabel ?? null;
  const named = node.title ?? label ?? node.kind ?? 'Untitled division';
  const namedByMaia = node.title === null && label !== null;
  const kindAside = node.kind && node.kind !== named ? node.kind : null;

  const childUnits = entry.entries.filter(
    (e): e is Extract<OutlineEntry, { kind: 'unit' }> => e.kind !== 'section');
  const sectionCount = entry.entries.length - childUnits.length;
  const hasInside = entry.entries.length > 0;

  /* ONE MEANING: SHOW WHAT IS INSIDE. A division holding divisions opens by
     default — that tree is the reading. A division holding sections stays
     closed — those are the evidence for it. */
  const open = openOverride.get(node.id) ?? childUnits.length > 0;

  const doubts = proposed?.uncertainty ?? [];
  const qs = questionMarks.get(node.id) ?? [];

  /* FIVE SIBLINGS OF ONE KIND ARE ONE THING. A faint rule says so without
     turning them into five cards, which would add noise where the point is
     that they belong together. */
  const childKinds = childUnits.map((e) => e.node.kind);
  const grouped = childUnits.length >= 2
    && childKinds[0] !== null
    && new Set(childKinds).size === 1;

  return (
    <div data-review-unit={node.id}>
      <div className="ws2sr-row" data-selected={selected === node.id ? 'true' : undefined}
        style={{ marginLeft: pad }}>
        <button type="button" className="ws2sr-twist" data-empty={hasInside ? undefined : 'true'}
          aria-expanded={hasInside ? open : undefined}
          aria-label={open
            ? `hide the ${sectionCount || childUnits.length} inside ${named}`
            : `show the ${sectionCount || childUnits.length} sections here`}
          onClick={() => hasInside && onToggleOpen(node.id, open)}>
          {open ? '⌄' : '›'}
        </button>

        {/* THE ROW IS THE CONTROL. Selecting it asks the one question the
            inspector answers, which is why there is no button beside it that
            asks the same thing twenty-two times. */}
        <button type="button" className="ws2sr-pick"
          aria-label={`inspect ${named}, sections ${from} to ${to}`}
          onClick={() => onSelect(node.id)}>
          <span title={namedByMaia
            ? "MAIA's description of this division — not a title in your Work"
            : undefined}>
            <StudioText role="workIdentity" as="span" data-row-name
              data-editorial-label={namedByMaia ? 'true' : undefined}
              tone={namedByMaia ? 'secondary' : 'primary'}>
              {named}
            </StudioText>
          </span>
          {kindAside && (
            <StudioText role="metadata" tone="quiet" as="span">{kindAside}</StudioText>
          )}
          <StudioText role="metadata" tone="quiet" as="span">{from}–{to}</StudioText>
          {sectionCount > 0 && (
            <StudioText role="metadata" tone="quiet" as="span">
              {sectionCount} section{sectionCount === 1 ? '' : 's'}
            </StudioText>
          )}
        </button>

        {/* ONLY EXCEPTIONS ARE MARKED. Marking every row is the same as marking
            none; a question or an open boundary earns a word, and a settled
            division says nothing.

            AND THE WORD HAS TO BE A WORD ABOUT THE BOOK. These read `question`
            and `uncertain` — two bare adjectives that named the DATA and told
            the writer nothing, and which ran together into `questionuncertain`
            the moment two of them met. The states behind them were always
            legitimate; only the saying was decoration.

            So each mark now says what is actually open, in the same language
            the inspector uses. Nothing is suppressed: where a division has
            several open readings the first is shown with a count of the rest,
            and the inspector still lists every one. */}
        {qs.length > 0 && (
          <button type="button" className="ws2sr-mark" data-mark-question
            onClick={(e) => { e.stopPropagation(); onMark(node.id, 'question'); }}
            aria-label={qs.length === 1
              ? `Talk with MAIA about her question: ${qs[0].q.label}`
              : `Talk with MAIA about her ${qs.length} questions here`}
            style={{ background: 'none', border: 'none', padding: 0,
              cursor: 'pointer', font: 'inherit', textAlign: 'left' }}>
            <StudioText role="metadata" tone="quiet" as="span" data-row-state="question">
              {qs.length === 1 ? 'a question for you' : `${qs.length} questions for you`}
            </StudioText>
          </button>
        )}
        {doubts.length > 0 && (
          /* A MARK THAT NAMES SOMETHING OPEN CAN BE TAKEN UP. It said what was
             left open and then went nowhere; the writer's next move — asking
             her about it — had no way in from the thing that raised it. */
          <button type="button" className="ws2sr-mark" data-mark-open
            data-uncertainty={doubts.join(',')}
            onClick={(e) => { e.stopPropagation(); onMark(node.id, 'open'); }}
            aria-label={`Talk with MAIA about what she left open: ${doubts
              .map((u) => UNCERTAINTY_SAYS[u] ?? u).join(', ')}`}
            title={`MAIA left open: ${doubts
              .map((u) => UNCERTAINTY_SAYS[u] ?? u).join(', ')}`}
            style={{ background: 'none', border: 'none', padding: 0,
              cursor: 'pointer', font: 'inherit', textAlign: 'left' }}>
            <StudioText role="metadata" tone="quiet" as="span" data-row-state="uncertain">
              left open: {UNCERTAINTY_SAYS[doubts[0]] ?? doubts[0]}
              {doubts.length > 1 ? ` +${doubts.length - 1} more` : ''}
            </StudioText>
          </button>
        )}
      </div>

      {proposed && (changed || boundaryChanged) && (
        <div data-maia-original style={{ paddingLeft: pad + SPACE.roomy }}>
          <StudioText role="metadata" tone="quiet" style={{ display: 'block' }}>
            MAIA originally suggested {proposed.title ?? 'this division'}
            {' '}{positionOf(proposed.fromSectionId)}–{positionOf(proposed.toSectionId)}
          </StudioText>
        </div>
      )}
      {mine && (
        <StudioText role="metadata" tone="quiet" data-member-authored
          style={{ display: 'block', paddingLeft: pad + SPACE.roomy }}>
          added by you
        </StudioText>
      )}

      {/* HIDDEN, NOT UNMOUNTED. The whole Work stays present, once, in order —
          which is what 8a asserts about this surface. Collapsing by unmounting
          would make the room pass a completeness check it no longer met. */}
      <div hidden={!open} className={grouped ? 'ws2sr-group' : undefined}
        style={grouped ? { marginLeft: pad + SPACE.base } : undefined}>
        {entry.entries.map((e) => (
          <Entry key={entryKey(e)} entry={e} depth={grouped ? 0 : depth + 1}
            headingOf={headingOf} proposedById={proposedById} positionOf={positionOf}
            openOverride={openOverride} onToggleOpen={onToggleOpen}
            selected={selected} onSelect={onSelect} questionMarks={questionMarks}
            onMark={onMark} />
        ))}
      </div>
      {entry.empty.map((c) => (
        <StudioText key={c.id} role="metadata" tone="quiet"
          style={{ display: 'block', paddingLeft: pad + SPACE.roomy }}>
          {c.title ?? 'Untitled division'} — no sections yet
        </StudioText>
      ))}
    </div>
  );
}

/**
 * RESPOND — everything still open, kept in THREE KINDS.
 *
 * `questionsForAuthor`, `uncertainRegions` and per-division `uncertainty` are
 * different things, and collapsing them into one count would be a fresh
 * compression error — the 8a defect rebuilt one level higher.
 *
 * A QUESTION is a doubt turned outward: something only the author can answer.
 * A SEAM is a stretch she could not settle, in her own words.
 * A NOTE is a caveat attached to a division she did propose.
 *
 * Only the questions open. The other two say how much they weigh and wait to
 * be asked for — on the real reading they are 4 and 19 against 5 questions, and
 * expanding all three at once is how twenty-eight items arrive at a reader who
 * came to understand one thesis.
 */
function OpenQuestions({
  view, headingOf, proposedById,
}: {
  view: ProposalView;
  headingOf: (id: string) => { position: number } | undefined;
  proposedById: Map<string, ProposedUnit>;
}) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const flip = (k: string) => setOpen((prev) => {
    const next = new Set(prev);
    if (!next.delete(k)) next.add(k);
    return next;
  });

  const regions = view.interpretation.uncertainRegions;
  const questions = view.interpretation.editorialSynthesis?.questionsForAuthor ?? [];
  const tagged = [...proposedById.values()].filter((u) => u.uncertainty.length > 0);
  if (regions.length === 0 && tagged.length === 0 && questions.length === 0) return null;

  const at = (id: string) => headingOf(id)?.position ?? '?';
  return (
    <div data-open-questions
      style={{ marginTop: SPACE.roomy, paddingTop: SPACE.base,
        borderTop: `1px solid ${RULE.quiet}`, maxWidth: MEASURE }}>

      {questions.length > 0 && (
        <div data-question-group="author">
          <StudioText role="bandLabel" style={{ display: 'block' }}>
            questions for you
          </StudioText>
          {questions.map((q, i) => {
            const where = (q.sectionIds ?? [])
              .map((id) => headingOf(id)?.position)
              .filter((n): n is number => typeof n === 'number');
            return (
              <div key={`${q.label}:${i}`}
                data-author-question={where.join(', ') || undefined}
                style={{ marginTop: SPACE.base }}>
                <StudioText role="navItem" as="span">{q.label}</StudioText>
                {where.length > 0 && (
                  <StudioText role="metadata" tone="quiet" as="span"
                    style={{ marginLeft: SPACE.snug }}>
                    section{where.length === 1 ? '' : 's'} {where.join(', ')}
                  </StudioText>
                )}
                <StudioText role="quiet" style={{ display: 'block' }}>
                  {q.explanation}
                </StudioText>
              </div>
            );
          })}
        </div>
      )}

      {regions.length > 0 && (
        <div data-question-group="regions" style={{ marginTop: SPACE.roomy }}>
          <Tiny plain label={open.has('regions')
            ? 'hide the uncertain seams'
            : `show the ${regions.length} uncertain seams`}
            onClick={() => flip('regions')}>
            {open.has('regions') ? '⌄' : '›'} {regions.length} uncertain seam
            {regions.length === 1 ? '' : 's'}
          </Tiny>
          <div hidden={!open.has('regions')}>
            {regions.map((r, i) => (
              <StudioText key={`${r.fromSectionId}:${i}`} role="quiet"
                data-uncertain-region={`${at(r.fromSectionId)}-${at(r.toSectionId)}`}
                style={{ display: 'block', paddingLeft: SPACE.base, marginTop: SPACE.snug }}>
                {at(r.fromSectionId)}–{at(r.toSectionId)} · {r.why}
              </StudioText>
            ))}
          </div>
        </div>
      )}

      {tagged.length > 0 && (
        <div data-question-group="qualifications" style={{ marginTop: SPACE.base }}>
          <Tiny plain label={open.has('quals')
            ? 'hide the reading notes'
            : `show the ${tagged.length} reading notes`}
            onClick={() => flip('quals')}>
            {open.has('quals') ? '⌄' : '›'} {tagged.length} reading note
            {tagged.length === 1 ? '' : 's'}
          </Tiny>
          <div hidden={!open.has('quals')}>
            {tagged.map((u) => (
              <StudioText key={u.id} role="quiet"
                style={{ display: 'block', paddingLeft: SPACE.base, marginTop: SPACE.snug }}>
                {at(u.fromSectionId)}–{at(u.toSectionId)}
                {' '}{u.title ?? u.editorialLabel ?? u.kind ?? 'this division'}
                {u.kind && (u.title ?? u.editorialLabel) ? ` (${u.kind})` : ''}
                {' · '}
                {u.uncertainty.map((t) => UNCERTAINTY_SAYS[t] ?? t).join(' · ')}
              </StudioText>
            ))}
          </div>
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

function Tiny({
  children, label, onClick, disabled, plain, gesture,
}: {
  children: React.ReactNode; label: string; onClick: () => void;
  disabled?: boolean;
  /** Subordinate: an authoring gesture sitting beside two reading ones. */
  plain?: boolean;
  /**
   * A stable handle for the gesture this button performs, so the witness can
   * find it by what it DOES rather than by what it currently says. The label is
   * prose and is expected to change; the operation is not.
   */
  gesture?: string;
}) {
  return (
    <button type="button" title={label} aria-label={label} data-gesture={gesture}
      onClick={onClick} disabled={disabled}
      style={{
        background: plain ? 'transparent' : GROUND.active,
        border: 'none', borderRadius: RADIUS.sm,
        color: plain ? INK.quiet : INK.secondary, cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        padding: `${SPACE.hairline}px ${SPACE.snug}px`,
        font: 'inherit', fontSize: '0.75rem', lineHeight: 1.4,
      }}>
      {children}
    </button>
  );
}
