/**
 * Memory Organism Pass 1 — conversational continuity regression proof.
 *
 * Production finding 2026-09-03: the member's operative I Ching detail sat
 * beyond the former 280-character formatter prefix. The exchange was counted as
 * surfaced while the fact MAIA needed had been removed. This suite pins the
 * repair at both boundaries: DB retrieval must not pre-truncate the row, and the
 * prompt formatter must preserve both beginning and end when it must bound a
 * very long turn.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  formatPriorExchangesForPrompt,
  type SuppressionContext,
} from '@/lib/maia/conversationalRecallBlock';
import type { PriorExchangeSnapshot } from '@/lib/maia/memoryLoaders';

const BASE_CTX: SuppressionContext = {
  recallEnabled: true,
  mode: 'Talk',
  currentSessionTurnCount: 4,
  lastPriorSessionMinutesAgo: 90,
};

function exchange(content: string, role: 'user' | 'assistant' = 'user'): PriorExchangeSnapshot {
  return {
    session_id: 'prior-session',
    role,
    created_at: new Date(Date.now() - 60 * 60 * 1000),
    content,
  };
}

describe('conversational recall continuity', () => {
  it('preserves a decisive detail beyond the former 280-character boundary', () => {
    const content = `${'a'.repeat(288)} HEXAGRAM_61_INNER_TRUTH tail context`;
    const result = formatPriorExchangesForPrompt([exchange(content)], BASE_CTX);

    expect(result.emitted).toBe(true);
    expect(result.surfacedCount).toBe(1);
    expect(result.block).toContain('HEXAGRAM_61_INNER_TRUTH');
    expect(result.block).toContain('tail context');
    expect(result.block).not.toContain('middle omitted for recall budget');
  });

  it('for a very long turn preserves both beginning and end under one bounded formatter', () => {
    const content = `BEGIN_FACT ${'m'.repeat(5000)} END_FACT`;
    const result = formatPriorExchangesForPrompt([exchange(content, 'assistant')], BASE_CTX);

    expect(result.emitted).toBe(true);
    expect(result.block).toContain('BEGIN_FACT');
    expect(result.block).toContain('END_FACT');
    expect(result.block).toContain('[middle omitted for recall budget]');
    expect(result.block.length).toBeLessThan(4000);
  });

  it('keeps the member opt-out and Sanctuary refusals intact', () => {
    const row = exchange('remember me');

    expect(formatPriorExchangesForPrompt([row], { ...BASE_CTX, recallEnabled: false })).toEqual({
      block: '', emitted: false, surfacedCount: 0, suppressedReason: 'opt-out',
    });
    expect(formatPriorExchangesForPrompt([row], { ...BASE_CTX, mode: 'Sanctuary' })).toEqual({
      block: '', emitted: false, surfacedCount: 0, suppressedReason: 'sanctuary',
    });
  });

  it('has no hidden prefix clip in the DB retriever — the formatter owns the prompt budget', () => {
    const src = readFileSync(join(process.cwd(), 'lib/maia/memoryLoaders.ts'), 'utf8');
    const conversationalSection = src.slice(
      src.indexOf('export async function loadPriorCrossSessionExchanges'),
      src.indexOf('export async function loadConversationalRecallPref'),
    );

    expect(conversationalSection).toContain('SELECT session_id, role, created_at, content');
    expect(conversationalSection).not.toMatch(/LEFT\s*\(\s*content/i);
    expect(conversationalSection).toContain('LIMIT $3');
  });
});
