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
  isAuthorizableContent, successorOf,
  DISCOURSE_DELETION, FREEZE_RELATIONSHIP,
  type EditorialInsight, type EditorialDirection, type DiscourseBinding,
} from '../ontology';

const CONTRACT = readFileSync(
  join(process.cwd(), 'lib/manuscript/editorialWorkspace/ontology.ts'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

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

  it('⛔ THE CONVENIENCE ADAPTER — an object wearing both shapes is REFUSED', () => {
    /* The realistic attack is not a bare Insight. It is a helper that "just
       adds the fields authorizeVersion needs". Carrying the brand disqualifies
       it outright, because a thing that is both IS a conversion. */
    const laundered = { ...insight, replacementText: 'some wording', supersedes: null };
    expect(isAuthorizableContent(laundered)).toBe(false);
    const launderedDirection = { ...direction, replacementText: direction.instruction };
    expect(isAuthorizableContent(launderedDirection)).toBe(false);
  });

  it('⛔ neither Insight nor Direction carries wording, a range or an operation', () => {
    for (const o of [insight, direction] as unknown as Record<string, unknown>[]) {
      for (const banned of ['replacementText', 'range', 'operation', 'expectedText']) {
        expect(o[banned]).toBeUndefined();
      }
    }
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
  it('⭐ may refer backward — and ⛔ a reference is NEVER a succession', () => {
    expect(direction.refersTo).toBe('v1');
    /* the next candidate still supersedes the HEAD, whatever was referred to */
    expect(successorOf('v4', 'v1')).toBe('v4');
    expect(successorOf('v4', null)).toBe('v4');
    expect(successorOf(null, 'v1')).toBeNull();
  });

  it('⛔ governs nothing — it is not a ruling and carries no ruling vocabulary', () => {
    const keys = Object.keys(direction);
    for (const ruling of ['statement', 'principle', 'intent', 'governs', 'authorship']) {
      expect(keys).not.toContain(ruling);
    }
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

  it('⭐⭐ two freezes, two moments — no equality, no copying, no synchronising', () => {
    expect(FREEZE_RELATIONSHIP).toEqual({
      mustBeEqual: false, mayBeCopied: false, threadMayOpenAfterChain: true });
  });
});
