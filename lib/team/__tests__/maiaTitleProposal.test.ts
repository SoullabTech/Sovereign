/**
 * Tests for lib/team/maiaTitleProposal.ts
 *
 * The primitive returns strings. It cannot rename anything — that boundary is
 * enforced by the routes (suggest-title writes proposed_titles; PATCH writes
 * title). What is tested here is the parsing, the bounds, and the prompt
 * contract that keeps a name a handle rather than a verdict.
 */

import { describe, it, expect } from 'vitest';
import {
  parseTitleCandidates,
  TITLE_PROPOSAL_SYSTEM_PROMPT,
  MAX_PROPOSALS,
  MAX_TITLE_LENGTH,
} from '../maiaTitleProposal';

describe('parseTitleCandidates', () => {
  it('splits one candidate per line', () => {
    expect(parseTitleCandidates('Relational Freedom\nConscious Participation')).toEqual([
      'Relational Freedom',
      'Conscious Participation',
    ]);
  });

  it('strips bullets, numbering, and wrapping quotes', () => {
    const raw = '- Relational Freedom\n2. "Conscious Participation"\n• “Degrees of Attending”';
    expect(parseTitleCandidates(raw)).toEqual([
      'Relational Freedom',
      'Conscious Participation',
      'Degrees of Attending',
    ]);
  });

  it('drops blank lines', () => {
    expect(parseTitleCandidates('\n\nRelational Freedom\n\n')).toEqual([
      'Relational Freedom',
    ]);
  });

  it('drops candidates longer than the title limit rather than truncating them', () => {
    const tooLong = 'x'.repeat(MAX_TITLE_LENGTH + 1);
    expect(parseTitleCandidates(`Good Name\n${tooLong}`)).toEqual(['Good Name']);
  });

  it('never returns more than MAX_PROPOSALS', () => {
    const raw = ['A', 'B', 'C', 'D', 'E'].join('\n');
    expect(parseTitleCandidates(raw)).toHaveLength(MAX_PROPOSALS);
  });

  it('returns an empty list for empty output, so the route can refuse cleanly', () => {
    expect(parseTitleCandidates('')).toEqual([]);
    expect(parseTitleCandidates('\n \n')).toEqual([]);
  });
});

describe('TITLE_PROPOSAL_SYSTEM_PROMPT', () => {
  it('asks for a name, not a summary or a claim about meaning', () => {
    expect(TITLE_PROPOSAL_SYSTEM_PROMPT).toMatch(/noun phrase, not a sentence/);
    expect(TITLE_PROPOSAL_SYSTEM_PROMPT).toMatch(/not:\s*\n- be a summary/i);
    expect(TITLE_PROPOSAL_SYSTEM_PROMPT).toMatch(
      /assert what the idea means, proves, or is really about/
    );
  });

  it("keeps the member's own vocabulary", () => {
    expect(TITLE_PROPOSAL_SYSTEM_PROMPT).toMatch(/member's own conceptual vocabulary/);
    expect(TITLE_PROPOSAL_SYSTEM_PROMPT).toMatch(
      /add framing the member has not introduced/
    );
  });

  it('frames the output as handles the member may ignore', () => {
    expect(TITLE_PROPOSAL_SYSTEM_PROMPT).toMatch(/handles, not verdicts/);
    expect(TITLE_PROPOSAL_SYSTEM_PROMPT).toMatch(/choose, edit, or ignore/);
  });
});
