/**
 * EA-NOOP-ADJUSTMENT-01 — focused falsifiers for the narrow no-op law.
 *
 * ⭐ `evaluateNoopAdjustment` is pure and total: given the EXACT frozen
 * predecessor (or `null`) and a new candidate, it decides nothing except
 * whether the candidate repeats that one predecessor's wording, authored by
 * MAIA, byte-for-byte. Every case here is falsifiable without a database.
 *
 * ⛔ WHAT THESE TESTS MUST PROVE IS ABSENT, NOT JUST WHAT IS PRESENT:
 *   · a member-authored identical predecessor is NOT classified as the defect
 *   · a genuinely different candidate is NOT classified as the defect
 *   · normalized-but-not-byte-identical wording is NOT classified as the defect
 *   · `null` (no predecessor, or none found) is NOT classified as the defect
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  detectNoopAdjustment,
  evaluateNoopAdjustment,
  type NoopAdjustmentVerdict,
} from '../noopProposal';
import { readProposalWork } from '../../proposalChain/proposalWork';

jest.mock('../../proposalChain/proposalWork', () => ({
  readProposalWork: jest.fn(),
}));

const mockedReadProposalWork = readProposalWork as jest.MockedFunction<typeof readProposalWork>;

const MAIA_PREDECESSOR = {
  author: 'maia' as const,
  replacementText: 'The fire settles into something steadier here.',
};

describe('EA-NOOP-ADJUSTMENT-01 · evaluateNoopAdjustment', () => {
  it('refuses when the candidate is byte-identical to the exact MAIA predecessor', () => {
    const verdict = evaluateNoopAdjustment(
      MAIA_PREDECESSOR, MAIA_PREDECESSOR.replacementText);
    expect(verdict.isNoop).toBe(true);
    const refused = verdict as Extract<NoopAdjustmentVerdict, { isNoop: true }>;
    expect(refused.reason).toBe('noop_editorial_adjustment');
    expect(typeof refused.detail).toBe('string');
    expect(refused.detail.length).toBeGreaterThan(0);
  });

  it('⛔ does NOT refuse a member-authored predecessor with identical wording', () => {
    const memberPredecessor = { author: 'member' as const, replacementText: MAIA_PREDECESSOR.replacementText };
    expect(evaluateNoopAdjustment(memberPredecessor, MAIA_PREDECESSOR.replacementText))
      .toEqual({ isNoop: false });
  });

  it('⛔ does NOT refuse a genuinely different candidate', () => {
    expect(evaluateNoopAdjustment(MAIA_PREDECESSOR, 'The fire settles into something else entirely.'))
      .toEqual({ isNoop: false });
  });

  it('⛔ does NOT refuse on normalized-only equality — exact bytes only', () => {
    /* Trailing space + different sentence-final punctuation: equal under any
       whitespace/case normalization, not equal byte-for-byte. */
    const normalizedOnly = `${MAIA_PREDECESSOR.replacementText} `;
    expect(evaluateNoopAdjustment(MAIA_PREDECESSOR, normalizedOnly))
      .toEqual({ isNoop: false });

    const caseFolded = MAIA_PREDECESSOR.replacementText.toUpperCase();
    expect(evaluateNoopAdjustment(MAIA_PREDECESSOR, caseFolded))
      .toEqual({ isNoop: false });
  });

  it('⛔ does NOT refuse when there is no exact frozen predecessor (null)', () => {
    expect(evaluateNoopAdjustment(null, MAIA_PREDECESSOR.replacementText))
      .toEqual({ isNoop: false });
  });

  it('⛔ an empty candidate against an empty MAIA predecessor is still a byte-identical repeat', () => {
    /* ⚠️ Deliberately unusual but in scope: the law is exact-byte equality,
       not "non-trivial" equality. An empty replacement repeating an empty
       replacement is still the same defect. */
    const emptyPredecessor = { author: 'maia' as const, replacementText: '' };
    expect(evaluateNoopAdjustment(emptyPredecessor, '')).toEqual({
      isNoop: true, reason: 'noop_editorial_adjustment',
      detail: expect.any(String),
    });
  });
});

describe('EA-NOOP-ADJUSTMENT-01 · frozen predecessor runtime seam', () => {
  beforeEach(() => mockedReadProposalWork.mockReset());

  it('queries the exact frozen predecessor id and refuses its byte-identical MAIA successor', async () => {
    mockedReadProposalWork.mockResolvedValue({
      ok: true,
      work: {
        chain: {} as never,
        versions: [],
        focused: { id: 'frozen-v2', author: 'maia', replacementText: 'same words' } as never,
      },
    });

    await expect(detectNoopAdjustment({
      memberId: 'member-1',
      chainId: 'chain-1',
      authoredAgainstVersionId: 'frozen-v2',
      candidateReplacementText: 'same words',
    })).resolves.toMatchObject({ isNoop: true, reason: 'noop_editorial_adjustment' });

    expect(mockedReadProposalWork).toHaveBeenCalledWith('member-1', 'chain-1', 'frozen-v2');
  });

  it('does not scan older lineage for a match when the frozen predecessor differs', async () => {
    mockedReadProposalWork.mockResolvedValue({
      ok: true,
      work: {
        chain: {} as never,
        versions: [
          { id: 'older-v1', author: 'maia', replacementText: 'older words' },
          { id: 'frozen-v2', author: 'maia', replacementText: 'current words' },
        ] as never,
        focused: { id: 'frozen-v2', author: 'maia', replacementText: 'current words' } as never,
      },
    });

    await expect(detectNoopAdjustment({
      memberId: 'member-1',
      chainId: 'chain-1',
      authoredAgainstVersionId: 'frozen-v2',
      candidateReplacementText: 'older words',
    })).resolves.toEqual({ isNoop: false });
  });

  it('keeps the no-op gate before durable MAIA outcome persistence', () => {
    const source = readFileSync(
      join(process.cwd(), 'lib/manuscript/editorialRuntime/turn.ts'), 'utf8');
    const proposalGate = source.indexOf("if (admission.outcome.kind === 'reply_with_proposal')");
    const noopGate = source.indexOf('const noop = await detectNoopAdjustment({');
    const persistence = source.indexOf('const persisted = await persistMaiaEditorialOutcome({');

    expect(proposalGate).toBeGreaterThan(-1);
    expect(noopGate).toBeGreaterThan(proposalGate);
    expect(persistence).toBeGreaterThan(noopGate);
  });
});
