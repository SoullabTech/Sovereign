/**
 * MAIA-TURN-GENERATION-PROVENANCE-IMPLEMENTATION-01 — what the DURABLE ROW says.
 *
 * The resolver tests prove the mapping; these prove what actually reaches
 * `conversation_turns.provenance`. The defect lived at the mint, not at the
 * boundary: `generatedBy: role === 'user' ? 'member-utterance' : 'synthesis'`.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const queryMock = jest.fn(async () => ({ rows: [{ id: 'turn-1' }] }));
jest.mock('../../../db/postgres', () => ({ query: (...args: unknown[]) => queryMock(...(args as [])) }));

import { TurnsStore } from '../TurnsStore';
import { TurnPosture } from '../../../sanctuary/turnPosture';
import { TurnGeneration } from '../../../provenance/turnGeneration';

/** The provenance JSON handed to the INSERT for a given role. */
function mintedProvenance(role: 'user' | 'assistant'): Record<string, unknown> | null {
  for (const call of queryMock.mock.calls) {
    const [sql, params] = call as unknown as [string, unknown[]];
    if (!String(sql).includes('INSERT INTO conversation_turns')) continue;
    const json = (params ?? []).find(
      (p) => typeof p === 'string' && p.includes('"generatedBy"')
    );
    if (!json) continue;
    const parsed = JSON.parse(json as string) as Record<string, unknown>;
    const isUser = parsed.createdBy === 'member';
    if ((role === 'user') === isUser) return parsed;
  }
  return null;
}

const ordinary = () => TurnPosture.resolve({});

beforeEach(() => queryMock.mockClear());

describe('minted turn provenance — generation is resolved, never inferred from role', () => {
  it('a declared typed turn is recorded as directly member-produced', async () => {
    await TurnsStore.addTurn(
      ordinary(),
      TurnGeneration.resolve({ memberActionClass: 'direct-composition' }),
      { userId: 'm1', sessionId: 's1', role: 'user', content: 'I am sad today.' }
    );
    const p = mintedProvenance('user');
    expect(p?.generatedBy).toBe('member-utterance');
    expect(p?.createdBy).toBe('member');
  });

  it('a declared voice turn is recorded as transcription, NOT as member-utterance', async () => {
    await TurnsStore.addTurn(
      ordinary(),
      TurnGeneration.resolve({ memberActionClass: 'speech-transcription' }),
      { userId: 'm1', sessionId: 's1', role: 'user', content: 'the blue lantern' }
    );
    const p = mintedProvenance('user');
    expect(p?.generatedBy).toBe('speech-transcription');
    // ⛔ Origin is unchanged: the member originated the object; a model produced
    // its representation. That duality is exactly what the two axes hold apart.
    expect(p?.createdBy).toBe('member');
  });

  it('an undeclared member turn is recorded as unknown generation', async () => {
    await TurnsStore.addTurn(
      ordinary(),
      TurnGeneration.resolve({}),
      { userId: 'm1', sessionId: 's1', role: 'user', content: 'from an old client' }
    );
    const p = mintedProvenance('user');
    expect(p?.generatedBy).toBe('unknown-generation');
    expect(p?.createdBy).toBe('member');
    // Unknown generation implies nothing about ownership or posture.
    expect(p?.postureAtCreation).toBe('normal');
  });

  it('role:user alone no longer produces member-utterance', async () => {
    // The whole defect in one assertion: the same role, three different
    // truthful records, decided by evidence rather than by seat at the table.
    const seen: unknown[] = [];
    for (const meta of [
      { memberActionClass: 'direct-composition' },
      { memberActionClass: 'speech-transcription' },
      {},
    ]) {
      queryMock.mockClear();
      await TurnsStore.addTurn(ordinary(), TurnGeneration.resolve(meta), {
        userId: 'm1', sessionId: 's1', role: 'user', content: 'same role every time',
      });
      seen.push(mintedProvenance('user')?.generatedBy);
    }
    expect(seen).toEqual(['member-utterance', 'speech-transcription', 'unknown-generation']);
  });

  it('a member turn with NO resolved generation refuses the write (fail closed)', async () => {
    const id = await TurnsStore.addTurn(ordinary(), null, {
      userId: 'm1', sessionId: 's1', role: 'user', content: 'unresolved',
    });
    expect(id).toBeNull();
    expect(queryMock.mock.calls.filter(
      (c) => String((c as unknown as [string])[0]).includes('INSERT INTO conversation_turns')
    )).toHaveLength(0);
  });

  it('a forged literal is not a TurnGeneration — the nominal barrier holds', async () => {
    const id = await TurnsStore.addTurn(
      ordinary(),
      'member-utterance' as unknown as TurnGeneration,
      { userId: 'm1', sessionId: 's1', role: 'user', content: 'forged' }
    );
    expect(id).toBeNull();
  });

  it('assistant generation is unchanged — synthesis, regardless of the member action', async () => {
    await TurnsStore.addExchange(
      ordinary(),
      TurnGeneration.resolve({ memberActionClass: 'speech-transcription' }),
      'm1', 's1', 'member said this', 'MAIA replied this', 'x-1'
    );
    expect(mintedProvenance('assistant')?.generatedBy).toBe('synthesis');
    expect(mintedProvenance('assistant')?.createdBy).toBe('maia');
    expect(mintedProvenance('user')?.generatedBy).toBe('speech-transcription');
  });

  it('Sanctuary still refuses to persist, whatever the generation says', async () => {
    // Generation and posture are independent axes. Classifying generation must
    // not make a sanctuary turn persistable.
    const sanctuary = TurnPosture.resolve({ sanctuary: true });
    const id = await TurnsStore.addTurn(
      sanctuary,
      TurnGeneration.resolve({ memberActionClass: 'direct-composition' }),
      { userId: 'm1', sessionId: 's1', role: 'user', content: 'spoken in sanctuary' }
    );
    expect(id).toBeNull();
    expect(queryMock.mock.calls.filter(
      (c) => String((c as unknown as [string])[0]).includes('INSERT INTO conversation_turns')
    )).toHaveLength(0);
  });
});
