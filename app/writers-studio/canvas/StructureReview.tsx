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
 *
 * ── WS2-05B-8B-02a · THE EDITORIAL SURFACE ─────────────────────────────────
 *
 * THE ROOM OPENS ON WHAT SHE THINKS, NOT ON WHAT SHE RETURNED. 8a proved the
 * render was faithful to the row and the founder still could not say what MAIA
 * thought the structure of the book was: the page showed the DATA STRUCTURE of
 * a reading rather than communicating the reading. Fidelity and intelligibility
 * are different properties, and only one of them has a machine witness.
 *
 * The order is the correction, and it is Kelly's:
 *
 *     1  editorial synthesis     what she thinks this Work is doing
 *     2  structural map          where it divides
 *     3  questions               what she would ask, and what she left open
 *     4  evidence on demand      the sections, when asked for
 *     5  conversation            02c, and not built
 *
 * NOT raw serialization · NOT a diagnostic console · NOT a canonical structure
 * editor · NOT an adoption surface.
 *
 * A LABEL IS NOT A TITLE, AND THE ROOM SAYS SO. `title` is the Work's words and
 * would be written into the manuscript on adoption; `editorialLabel` is MAIA's
 * description for writing to the member ABOUT their book, and never becomes
 * one. Where a division has a title, the title is the row's name and her label
 * lives inside `Why?`. Where it has none, her label names the row - which is
 * the whole point of 02b: five untitled siblings all of kind "element" read
 * Fire, Water, Earth, Air, Aether instead of five identical rows.
 *
 * IT MUST DEGRADE HONESTLY. Proposal 2a427a6f predates the editorial contract
 * and carries no letter and no labels; it is also 8a's acceptance gate. So the
 * letter renders only when there is one, the account keeps its old place when
 * there is not, and the room says which - rather than looking like a lesser
 * design for a reason the member cannot see.
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
import type {
  EditorialQuestion, EditorialSynthesis, ProposedUnit,
} from '@/lib/manuscript/structure/interpret';

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
  /* SEPARATE FROM `expanded`, deliberately. "Show me the sections in Fire" and
     "why do you think Fire is a division" are different questions, and a member
     asking the second should not be handed 28 heading rows. */
  const [whyOpen, setWhyOpen] = useState<ReadonlySet<string>>(new Set());
  const toggleWhy = useCallback((unitId: string) => {
    setWhyOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(unitId)) next.add(unitId);
      return next;
    });
  }, []);
  /* The account is long — ~1,800 characters on the real reading — and arriving
     first as an undifferentiated wall is the single loudest cause of the 8B
     failure. It stays available in full, one gesture away, and never edited. */
  const [reasoningOpen, setReasoningOpen] = useState(false);

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
  const anyLabel = [...proposedById.values()]
    .some((u) => typeof u.editorialLabel === 'string' && u.editorialLabel.length > 0);

  return (
    <div data-structure-review data-form={form} style={{ padding: SPACE.comfortable }}>
      {/* 1 · WHAT SHE THINKS THE WORK IS DOING. First, because it is what the
             member came to judge, and because reconstructing it from a tree is
             the failure this unit exists to correct. */}
      <EditorialLetter
        synthesis={view.interpretation.editorialSynthesis}
        account={view.interpretation.account}
        open={reasoningOpen}
        onToggle={() => setReasoningOpen((v) => !v)}
        headingOf={headingOf} />

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
        <div data-review-map
          style={{ marginTop: SPACE.roomy, paddingTop: SPACE.base,
            borderTop: `1px solid ${RULE.quiet}` }}>
          {/* 2 · WHERE IT DIVIDES. */}
          <StudioText role="bandLabel" style={{ display: 'block' }}>
            how she reads its shape
          </StudioText>
          {/* SAID PLAINLY, ONCE. Without this a member meets "Fire" on a row
              and reasonably takes it for a title their Work carries — and the
              one thing a label must never do is pass for one. */}
          {anyLabel && (
            <StudioText role="metadata" tone="quiet" data-label-note
              style={{ display: 'block', marginBottom: SPACE.snug }}>
              Where your Work does not name a division, MAIA describes it. Those
              descriptions are hers — they are not titles in your manuscript.
            </StudioText>
          )}
          <div data-review-column
            style={{ display: 'flex', flexDirection: 'column', gap: SPACE.hairline }}>
            {ordered?.outline.entries.map((e) => (
              <Entry key={entryKey(e)} entry={e} depth={0}
                headingOf={headingOf} proposedById={proposedById}
                positionOf={(id) => headingOf(id)?.position}
                busy={busy} onGesture={gesture}
                expanded={expanded} onToggle={toggle}
                whyOpen={whyOpen} onToggleWhy={toggleWhy} />
            ))}
          </div>
        </div>
      )}

      {/* 3 · AFTER THE READING, NOT BEFORE IT. The thesis is what the member
          came to judge; her questions are how to weigh it, and they read as
          qualifications of something already seen rather than as a preamble to
          something not yet shown. */}
      <OpenQuestions view={view} headingOf={headingOf} proposedById={proposedById} />

      {delta && (delta.added.length || delta.removed.length || delta.changed.length) ? (
        /* IN WORDS, BECAUSE IT IS ADDRESSED TO A PERSON. "you changed 1, added
           0, removed 0" is a diagnostic line: it reports three counters, two of
           which are usually zero, and makes the member do the reading. */
        <StudioText role="metadata" tone="muted" data-review-delta
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

const entryKey = (e: OutlineEntry) => e.kind === 'section' ? `s:${e.id}` : `u:${e.node.id}`;

/**
 * 1 · THE EDITORIAL LETTER — what she thinks the Work is doing.
 *
 * ASKED FOR AT READING TIME, NOT DERIVED HERE. The room does not cut her
 * account into headings and it does not summarise her tree: either would be a
 * second reading authored by code, wearing her name. It renders the letter she
 * wrote and nothing else.
 *
 * THE ACCOUNT IS NOT DISCARDED, IT IS SECOND. On the real Work it is ~1,800
 * characters of unbroken prose, and arriving first it is the densest thing on
 * the page. Behind `Read my full reasoning` it is one gesture away, complete,
 * and unedited — and the thesis gets to be seen first, which is the whole
 * correction.
 *
 * WITHOUT A LETTER, THE ACCOUNT KEEPS ITS OLD PLACE. A reading frozen before
 * the editorial contract has nothing else; hiding its one statement behind a
 * disclosure would make an older proposal harder to read than a newer one. The
 * room says which kind of reading it is holding rather than looking diminished
 * for a reason the member cannot see.
 */
function EditorialLetter({
  synthesis, account, open, onToggle, headingOf,
}: {
  synthesis: EditorialSynthesis | undefined;
  account: string;
  open: boolean;
  onToggle: () => void;
  headingOf: (id: string) => { position: number } | undefined;
}) {
  if (!synthesis) {
    return (
      <div data-editorial-letter="absent">
        <StudioText role="maiaReading" data-maia-account
          style={{ display: 'block', marginBottom: SPACE.snug }}>
          {account}
        </StudioText>
        <StudioText role="metadata" tone="quiet" style={{ display: 'block', marginBottom: SPACE.base }}>
          This reading was made before MAIA was asked to write to you directly,
          so it has her account of the Work and no letter.
        </StudioText>
      </div>
    );
  }

  return (
    <div data-editorial-letter="present" style={{ marginBottom: SPACE.base }}>
      <StudioText role="bandLabel" style={{ display: 'block' }}>
        what MAIA thinks your Work is doing
      </StudioText>

      <StudioText role="prose" data-thesis
        style={{ display: 'block', margin: `${SPACE.snug}px 0 ${SPACE.base}px` }}>
        {synthesis.thesis}
      </StudioText>

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

      {/* HIDDEN, NOT UNMOUNTED. The account stays in the document so what she
          said is present on the page whether or not anyone opened it — the same
          rule the collapsed sections follow, and for the same reason. */}
      <Tiny label={open ? "hide MAIA's full reasoning" : "read MAIA's full reasoning"}
        onClick={onToggle}>
        {open ? 'Hide my full reasoning' : 'Read my full reasoning'}
      </Tiny>
      <div hidden={!open}>
        <StudioText role="maiaReading" data-maia-account
          style={{ display: 'block', marginTop: SPACE.snug }}>
          {account}
        </StudioText>
      </div>
    </div>
  );
}

/** Section ids as positions, for a question that names places. */
function placesOf(
  q: EditorialQuestion, headingOf: (id: string) => { position: number } | undefined,
): string {
  const at = (q.sectionIds ?? [])
    .map((id) => headingOf(id)?.position)
    .filter((n): n is number => typeof n === 'number');
  return at.length === 0 ? '' : at.join(', ');
}

/**
 * 3 · Everything still open — and kept in THREE KINDS.
 *
 * `questionsForAuthor`, `uncertainRegions` and per-division `uncertainty` are
 * different things, and collapsing them into one count would be a fresh
 * compression error of exactly the kind this unit exists to correct — the 8a
 * defect rebuilt one level higher.
 *
 * A QUESTION is a doubt turned outward: something only the author can answer,
 *   with the places it concerns and what turns on the answer.
 * A REGION is a stretch of the Work she could not settle, in her own words.
 * A TAG is a caveat attached to a division she did propose.
 *
 * The questions come first because they are the only ones addressed TO the
 * member. The other two are the reading qualifying itself, and 8B's founder
 * verdict on the old panel was that stated caveats with no way to take them up
 * read as a dump of cryptic insight. A question that names its places and says
 * what turns on the answer is takeable-up by a person; the ability to REPLY to
 * one is 02c, and is not built.
 */
function OpenQuestions({
  view, headingOf, proposedById,
}: {
  view: ProposalView;
  headingOf: (id: string) => { position: number } | undefined;
  proposedById: Map<string, ProposedUnit>;
}) {
  const regions = view.interpretation.uncertainRegions;
  const questions = view.interpretation.editorialSynthesis?.questionsForAuthor ?? [];
  const tagged = [...proposedById.values()].filter((u) => u.uncertainty.length > 0);
  if (regions.length === 0 && tagged.length === 0 && questions.length === 0) return null;

  const at = (id: string) => headingOf(id)?.position ?? '?';
  return (
    <div data-open-questions
      style={{ marginTop: SPACE.roomy, paddingTop: SPACE.base,
        borderTop: `1px solid ${RULE.quiet}` }}>
      <StudioText role="bandLabel" style={{ display: 'block' }}>
        what she is still asking
      </StudioText>

      {questions.length > 0 && (
        <div data-question-group="author" style={{ marginTop: SPACE.snug }}>
          <StudioText role="panelLabel" style={{ display: 'block' }}>
            questions for you — only you can answer these
          </StudioText>
          {questions.map((q, i) => {
            const where = placesOf(q, headingOf);
            return (
              <div key={`${q.label}:${i}`} data-author-question={where || undefined}
                style={{ marginTop: SPACE.snug, paddingLeft: SPACE.base }}>
                <StudioText role="workIdentity" as="span">{q.label}</StudioText>
                {where && (
                  <StudioText role="metadata" tone="quiet" as="span"
                    style={{ marginLeft: SPACE.snug }}>
                    section{where.includes(',') ? 's' : ''} {where}
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
        <div data-question-group="regions" style={{ marginTop: SPACE.base }}>
          <StudioText role="panelLabel" style={{ display: 'block' }}>
            stretches she could not settle
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
        <div data-question-group="qualifications" style={{ marginTop: SPACE.base }}>
          <StudioText role="panelLabel" style={{ display: 'block' }}>
            further qualifications, division by division
          </StudioText>
          {/* NAMED THE WAY THE MAP NAMES IT. Five rows reading "element" here
              would rebuild the 8B defect inside the panel that exists to fix
              it: a member cannot weigh a qualification they cannot attach to a
              division. */}
          {tagged.map((u) => (
            <StudioText key={u.id} role="quiet"
              style={{ display: 'block', paddingLeft: SPACE.base }}>
              {at(u.fromSectionId)}–{at(u.toSectionId)}
              {' '}{u.title ?? u.editorialLabel ?? u.kind ?? 'this division'}
              {u.kind && (u.title ?? u.editorialLabel) ? ` (${u.kind})` : ''}
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
  whyOpen, onToggleWhy,
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
  whyOpen: ReadonlySet<string>;
  onToggleWhy: (unitId: string) => void;
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
  const why = whyOpen.has(node.id);
  const sectionCount = entry.entries.filter((e) => e.kind === 'section').length;

  /* HOW A ROW IS NAMED, and the order is the doctrine.
       title  the Work's words. Adoptable, and therefore first.
       label  MAIA's description. Never adoptable — it names the row only when
              the Work supplies nothing, which is the case 02b exists for: five
              untitled siblings of kind "element" reading Fire, Water, Earth,
              Air, Aether rather than five identical rows.
       kind   the Work's vocabulary for what sort of thing it is.
     A manufactured name is never third, fourth or fifth. */
  const label = proposed?.editorialLabel ?? null;
  const named = node.title ?? label ?? node.kind ?? 'Untitled division';
  const namedByMaia = node.title === null && label !== null;
  /* Shown beside the name unless it IS the name, so 174 rows do not read
     "element · element". */
  const kindAside = node.kind && node.kind !== named ? node.kind : null;
  const hasWhy = Boolean(proposed && (proposed.rationale || label || hasDoubt));

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
        {/* THE GUTTER IS ALWAYS THERE, the marker is not.
            Rendered only when present, it pushed every unmarked row a character
            to the left — so a scan down the map read as a ragged column and the
            one division MAIA was sure about looked like a different kind of
            thing. A fixed gutter keeps the names in line and still shows the
            mark only where she left something open. */}
        <span aria-hidden={!hasDoubt}
          data-uncertainty={hasDoubt ? proposed?.uncertainty.join(',') : undefined}
          aria-label={hasDoubt ? `MAIA left open: ${(proposed?.uncertainty ?? [])
            .map((u) => UNCERTAINTY_SAYS[u] ?? u).join(', ')}` : undefined}
          title={hasDoubt ? `MAIA left open: ${(proposed?.uncertainty ?? [])
            .map((u) => UNCERTAINTY_SAYS[u] ?? u).join(', ')}` : undefined}
          style={{ color: INK.muted, width: '1.2em', flex: '0 0 1.2em' }}>
          {hasDoubt ? '◇' : ''}
        </span>
        {/* MARKED, not merely styled. A member scanning the map must be able to
            tell a name their Work carries from a name MAIA gave it, and a
            difference in colour alone does not say which is which. The wrapper
            carries `title`, which StudioText deliberately does not forward. */}
        <span style={{ flex: 1 }}
          title={namedByMaia
            ? "MAIA's description of this division — not a title in your Work"
            : undefined}>
          {/* AN EXPLICIT HANDLE. The 02a witness first found the row's name by
              guessing at DOM shape and picked up the ◇ uncertainty marker
              instead, failing against a page that was rendering correctly. A
              check that loses its handle invents a defect; this is the same
              lesson StudioType's own comment records, one level out. */}
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
        {/* PLAIN WORDS INSTEAD OF GLYPHS. `⇤` and `+38` are a console's
            vocabulary; the aria-labels are unchanged, because they were already
            written for a person and 8a's captures find the disclosure by one. */}
        {hasWhy && (
          <Tiny label={why ? 'hide why MAIA proposed this division'
            : 'why MAIA proposed this division'}
            onClick={() => onToggleWhy(node.id)}>{why ? 'Hide why' : 'Why?'}</Tiny>
        )}
        {sectionCount > 0 && (
          <Tiny
            label={open ? `hide the ${sectionCount} sections here`
              : `show the ${sectionCount} sections here`}
            disabled={false}
            onClick={() => onToggle(node.id)}
          >{open ? 'Hide sections'
            : `Show ${sectionCount} section${sectionCount === 1 ? '' : 's'}`}</Tiny>
        )}
        {/* OFFERED ONLY WHERE IT CAN SUCCEED. `promote` refuses `not_nested`
            on a top-level division, so a button on those rows could do nothing
            but produce a refusal — an affordance that lies, and one repeated
            down every root row of the map. */}
        {depth > 0 && (
          <Tiny label="move this division out one level" disabled={busy}
            onClick={() => onGesture({ op: 'promote', unitId: node.id }, true)}>Move out</Tiny>
        )}
      </div>

      {/* 4 · EVIDENCE ON DEMAND — her reasoning for THIS division.
          Present in the row since 05B and rendered nowhere until now: it
          surfaced only once a member had already changed something, which is
          exactly backwards. Hidden rather than unmounted, so what she said is
          on the page either way. */}
      {hasWhy && (
        <div data-why={node.id} hidden={!why}
          style={{ paddingLeft: pad + SPACE.base, marginTop: SPACE.tight }}>
          {proposed?.rationale && (
            <StudioText role="quiet" style={{ display: 'block' }}>{proposed.rationale}</StudioText>
          )}
          {label && node.title !== null && (
            <StudioText role="metadata" tone="quiet" style={{ display: 'block' }}>
              MAIA calls this {label}.
            </StudioText>
          )}
          {hasDoubt && (
            <StudioText role="metadata" tone="quiet" style={{ display: 'block' }}>
              She left open: {(proposed?.uncertainty ?? [])
                .map((u) => UNCERTAINTY_SAYS[u] ?? u).join(', ')}.
            </StudioText>
          )}
        </div>
      )}

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
                busy={busy} onGesture={onGesture} expanded={expanded} onToggle={onToggle}
                whyOpen={whyOpen} onToggleWhy={onToggleWhy} />
            </div>
          )
          : (
            <Entry key={entryKey(e)} entry={e} depth={depth + 1}
              headingOf={headingOf} proposedById={proposedById} positionOf={positionOf}
              busy={busy} onGesture={onGesture} expanded={expanded} onToggle={onToggle}
              whyOpen={whyOpen} onToggleWhy={onToggleWhy} />
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
