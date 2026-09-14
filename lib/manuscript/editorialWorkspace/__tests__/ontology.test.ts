/**
 * W5-1 — the ontology contract's acceptance bar.
 *
 * ⭐⭐ THE NEGATIVE LAW IS THE BAR:
 *     No Insight, Direction or discourse turn can be passed to
 *     `authorizeVersion`, directly or through a convenience adapter.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  isAuthorizableContent, successionPredecessor,
  DISCOURSE_DELETION, FREEZE_RELATIONSHIP,
  type EditorialInsight, type EditorialDirection, type DiscourseBinding,
} from '../ontology';

/**
 * ⭐⭐ TWO READINGS OF ONE FILE, BECAUSE THEY ANSWER DIFFERENT QUESTIONS.
 *
 * ⚠️ The first writing had ONE comment-stripped constant and then asserted
 * PROSE against it — so a sentence that lives in a doc comment could never be
 * found, and the obligation failed against a correct contract. A code ban and a
 * prose requirement are not the same question and must not share a body.
 */
const SRC = readFileSync(
  join(process.cwd(), 'lib/manuscript/editorialWorkspace/ontology.ts'), 'utf8');
/** ⛔ For bans on what the code DOES — comments stripped (the C21 discipline). */
const CONTRACT = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
/** ⭐ For requirements on what the contract SAYS. */
const PROSE = SRC;

const insight: EditorialInsight = {
  id: 'i1', chainId: 'C1', author: 'maia', __notAuthorizable: true,
  observation: 'The paragraph above already carries the developmental movement.',
  authoredAt: '2026-09-14T10:00:00.000Z',
};
const direction: EditorialDirection = {
  id: 'd1', chainId: 'C1', author: 'member', __notAuthorizable: true,
  instruction: 'Keep the spiral image, drop the repeated argument.',
  refersTo: 'v1', authoredAt: '2026-09-14T10:02:00.000Z',
};
const turn = { id: 't1', threadId: 'T1', speaker: 'author', body: 'Why?' };
const version = { id: 'v4', chainId: 'C1', supersedes: 'v3',
  replacementText: ', unhurried', author: 'member', authoredAt: 'x' };

describe('W5-1 · ⛔ the negative law — only candidate wording is authorizable', () => {
  it('⭐⭐ a ProposalVersion is authorizable content; the other three are not', () => {
    expect(isAuthorizableContent(version)).toBe(true);
    expect(isAuthorizableContent(insight)).toBe(false);
    expect(isAuthorizableContent(direction)).toBe(false);
    expect(isAuthorizableContent(turn)).toBe(false);
  });

  it('⭐⭐ THE PREDICATE IS TRUTHFUL — an incomplete version does NOT narrow', () => {
    /* ⚠️ The first writing checked id, chainId and replacementText and then told
       TypeScript the value was a COMPLETE ProposalVersion. Nothing exploitable
       reached authorization - this helper is evidence, not the membrane - but an
       unsound predicate is the weakness this programme refuses every time a
       caller happens to behave correctly. */
    expect(isAuthorizableContent({
      id: 'v', chainId: 'c', replacementText: 'words' })).toBe(false);
    /* each required field, absent in turn */
    const complete = { id: 'v', chainId: 'c', supersedes: null,
      replacementText: 'w', author: 'maia', authoredAt: 't' };
    expect(isAuthorizableContent(complete)).toBe(true);
    for (const k of ['id', 'chainId', 'supersedes', 'replacementText',
      'author', 'authoredAt']) {
      const { [k]: _gone, ...missing } = complete as Record<string, unknown>;
      expect(isAuthorizableContent(missing)).toBe(false);
    }
    /* ⛔ author is a closed vocabulary, not any string */
    expect(isAuthorizableContent({ ...complete, author: 'editor' })).toBe(false);
    /* ⛔ supersedes is a version id or null — never undefined, never a number */
    expect(isAuthorizableContent({ ...complete, supersedes: 7 })).toBe(false);
    /* ⭐ rationale keeps its two states: absent, or a string */
    expect(isAuthorizableContent({ ...complete, rationale: 'because' })).toBe(true);
    expect(isAuthorizableContent({ ...complete, rationale: null })).toBe(false);
  });

  it('⛔ THE CONVENIENCE ADAPTER — an object wearing both shapes is REFUSED', () => {
    /* The realistic attack is not a bare Insight. It is a helper that "just
       adds the fields authorizeVersion needs". Carrying the brand disqualifies
       it outright, because a thing that is both IS a conversion. */
    /* ⭐ Laundered into the COMPLETE shape, so only the brand disqualifies it —
       which is the point: a thing that is both IS a conversion. */
    const laundered = { ...insight, supersedes: null, replacementText: 'some wording',
      authoredAt: insight.authoredAt };
    expect(isAuthorizableContent(laundered)).toBe(false);
    const launderedDirection = { ...direction, supersedes: null,
      replacementText: direction.instruction, authoredAt: direction.authoredAt };
    expect(isAuthorizableContent(launderedDirection)).toBe(false);
    /* ⛔ and stripping the brand is the only way through — stated, so the
       persistence separation is understood as the real protection */
    const { __notAuthorizable: _b, ...stripped } = laundered;
    expect(isAuthorizableContent(stripped)).toBe(true);
  });

  it('⛔ neither Insight nor Direction carries wording, a range or an operation', () => {
    for (const o of [insight, direction] as unknown as Record<string, unknown>[]) {
      for (const banned of ['replacementText', 'range', 'operation', 'expectedText']) {
        expect(o[banned]).toBeUndefined();
      }
    }
  });

  it('⛔ the brand is CONTRACT EVIDENCE, not the installed authorization membrane', () => {
    /* ⚠️ The first writing called it a discriminant "never read" while this very
       helper reads it, and implied it was already enforcing authorization. The
       durable protection is that none of the three lives in proposal_versions. */
    expect(PROSE).not.toMatch(/never persisted and never read/);
    expect(PROSE).toMatch(/not in proposal_versions/);
    /* ⛔ and the real authorization path does not consult the brand */
    const AUTH = readFileSync(join(process.cwd(),
      'lib/manuscript/revisionAuthorization/store.ts'), 'utf8');
    expect(AUTH).not.toMatch(/__notAuthorizable|isAuthorizableContent/);
  });

  it('⛔ [SOURCE] the contract itself imports no store, route or persistence', () => {
    expect(CONTRACT).not.toMatch(/from '@\/lib\/db|query\(|CREATE TABLE|INSERT|ALTER/);
    /* it may name ProposalVersion as a type, and only as a type */
    expect(CONTRACT).toMatch(/import type \{ ProposalVersion \}/);
  });
});

describe('W5-1 · Insight', () => {
  it('⭐⭐ is MAIA-authored and may stand with ZERO versions — "I would keep this"', () => {
    expect(insight.author).toBe('maia');
    /* the type admits no member author, and no version is referenced at all */
    expect(Object.keys(insight)).not.toContain('versionId');
    expect(Object.keys(insight)).not.toContain('supersedes');
  });

  it('⭐ its subject is the chain, not a frozen developmental reading', () => {
    expect(Object.keys(insight)).toContain('chainId');
    expect(Object.keys(insight)).not.toContain('readingId');
    expect(Object.keys(insight)).not.toContain('observationKey');
  });
});

describe('W5-1 · Direction', () => {
  it('⛔ the Direction prose no longer CLAIMS the candidate supersedes the head', () => {
    /* ⚠️ Residue: the function was corrected in W5-1.1 while two paragraphs
       above it still said "a later candidate still supersedes the head". W5-2 is
       where prose becomes columns, so a schema designer must not read head
       synthesis from the text above the function that forbids it.
       ⛔ NOT a global ban on the word — the surrounding explanation legitimately
       uses it to describe what is forbidden. The positive sentence is asserted
       instead. */
    expect(PROSE).not.toMatch(/candidate still supersedes the head/);
    expect(PROSE).toMatch(/PREDECESSOR THE\s*\n?\s*\*?\s*AUTHOR ACTED AGAINST/);
    expect(PROSE).toMatch(/persistence judges whether that predecessor is\s*\n?\s*\*?\s*still lawful/);
  });

  it('⭐ may refer backward — and ⛔ a reference is NEVER a succession', () => {
    expect(direction.refersTo).toBe('v1');
    /* the next candidate supersedes what the AUTHOR ACTED AGAINST, whatever
       was referred to conversationally */
    expect(successionPredecessor('v4', 'v1')).toBe('v4');
    expect(successionPredecessor('v4', null)).toBe('v4');
    expect(successionPredecessor(null, 'v1')).toBeNull();
  });

  it('⭐⭐ THE AUTHORED PREDECESSOR IS NEVER THE HEAD — W2\'s law, one layer up', () => {
    /* ⚠️ The first contract named this parameter `headVersionId`, which
       reintroduced the very question appendAuthoredVersion was repaired to stop
       asking. The author acted against v2 while v4 is the head; the contract
       returns v2 UNCHANGED and lets the store judge it. */
    expect(successionPredecessor('v2', null)).toBe('v2');
    expect(successionPredecessor('v2', 'v1')).toBe('v2');
    /* identity over every shape, so nothing can be consulted but argument one */
    for (const a of ['v1', 'v2', 'v3', null]) {
      for (const r of ['v1', 'v9', null]) {
        expect(successionPredecessor(a, r)).toBe(a);
      }
    }
  });

  it('⛔ the contract has no MEANS of learning the head — absence, not promise', () => {
    /* exactly two inputs: what was authored against, and a reference it ignores */
    expect(successionPredecessor.length).toBe(2);
    expect(CONTRACT).not.toMatch(/headVersionId|currentHead|successorOf/);
    /* ⚠️ and it imports nothing that could supply one.
       The first writing of this ban matched the word `lineage`, which is a
       legitimate key on DISCOURSE_DELETION — the sixth over-broad source ban in
       this session. Banned as IMPORTS AND CALLS, which is what "has no means"
       actually means. */
    expect(CONTRACT).not.toMatch(/from '@\/lib\/manuscript\/proposalChain\/store'/);
    expect(CONTRACT).not.toMatch(/readChain\(|readProposalWork\(|lineage\(/);
    /* exactly one import, and it is a TYPE */
    expect((CONTRACT.match(/^import /gm) ?? []).length).toBe(1);
  });

  it('⛔ governs nothing — it is not a ruling and carries no ruling vocabulary', () => {
    const keys = Object.keys(direction);
    for (const ruling of ['statement', 'principle', 'intent', 'governs', 'authorship']) {
      expect(keys).not.toContain(ruling);
    }
  });

  it('⭐ is IMMUTABLE — no answered/spent state, because no answer relationship exists', () => {
    /* ⚠️ The first contract called Direction "spent when answered" while
       defining no answer relationship — the prose a schema designer turns into
       an `answered_at` column. A historical act must not be mutated because
       something later responded to it. W4 may earn that relationship. */
    for (const mutable of ['answeredAt', 'answered', 'spent', 'status',
      'resolvedAt', 'satisfiedBy']) {
      expect(Object.keys(direction)).not.toContain(mutable);
    }
    /* ⚠️ AND THE C21 CLASS, IN MY OWN NEW FILE. The first writing banned the
       phrase "spent when answered" from the prose — and matched the note
       RECORDING ITS WITHDRAWAL. A prose ban must never read as the banned
       behaviour returning. What is actually owed is that the contract no longer
       CLAIMS it and does RECORD that it was withdrawn. */
    expect(PROSE).toMatch(/WITHDRAWN[\s\S]{0,200}?answer relationship/);
    expect(PROSE).toMatch(/IMMUTABLE AUTHORED INSTRUCTION/);
    /* the enforceable half is on the CODE: no mutable answer state exists */
    expect(CONTRACT).not.toMatch(/answered_at|answeredAt|spent/);
  });

  it('either party may steer', () => {
    expect(['maia', 'member']).toContain(direction.author);
  });
});

describe('W5-1 · Discourse — reuse, bound provably', () => {
  it('⛔ the binding is typed, member-owned and immutable — never JSONB-only', () => {
    const b: DiscourseBinding = {
      threadId: 'T1', chainId: 'C1', memberId: 'M1', boundAt: 'x' };
    expect(Object.keys(b).sort()).toEqual(['boundAt', 'chainId', 'memberId', 'threadId']);
    /* ⛔ the contract does not decide the physical form, and says so */
    expect(CONTRACT).not.toMatch(/on: 'proposal_chain'/);
  });

  it('⭐⭐ deleting the conversation never touches the lineage', () => {
    expect(DISCOURSE_DELETION.threadDeletionTouchesChain).toBe(false);
    expect(DISCOURSE_DELETION.threadDeletionTouchesVersions).toBe(false);
    expect(DISCOURSE_DELETION.threadDeletionTouchesAuthorizations).toBe(false);
  });

  it('⛔ and the lineage never obliges the member to keep the conversation', () => {
    expect(DISCOURSE_DELETION.lineageRetentionObligesThreadRetention).toBe(false);
    expect(DISCOURSE_DELETION.threadDeletionMayRemoveBinding).toBe(true);
  });

  it('⭐⭐ W5-2 CRITERION recorded: same Work, proven by the database', () => {
    /* ⛔ A relation proving only same-member would admit Kelly's thread about
       Work X bound to Kelly's chain about Work Y - the 01A.1 wrong-Work
       substitution, reopened in persistence. Recorded as a criterion; NOT
       implemented here. */
    expect(PROSE).toMatch(/SAME MEMBER IS NOT ENOUGH/);
    expect(PROSE).toMatch(/thread\.manuscript_id = chain\.work_id/);
    expect(PROSE).toMatch(/proven by the DATABASE, never by application code/i);
    /* ⛔ and it is still a criterion, not a decision */
    expect(PROSE).toMatch(/physical form is W5-2's to adjudicate/);
  });

  it('⭐⭐ two freezes, two moments — no equality, no copying, no synchronising', () => {
    expect(FREEZE_RELATIONSHIP).toEqual({
      mustBeEqual: false, mayBeCopied: false, threadMayOpenAfterChain: true });
  });
});
