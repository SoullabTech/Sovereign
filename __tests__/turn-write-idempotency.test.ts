/**
 * Turn-write idempotency — regression pins for the 2026-07-23 duplication incident.
 *
 * One member action reached `conversation_turns` through TWO writers in the same
 * request (maiaService's tail `addConversationExchange` → sessionManager, and its
 * direct `TurnsStore.addExchange`). Both wrote with `exchange_id` NULL, and the
 * store's `ON CONFLICT (exchange_id, seq) WHERE exchange_id IS NOT NULL` guard
 * cannot fire on NULL — a partial index does not index NULLs. Result: one
 * exchange persisted twice, four rows, ~20ms apart.
 *
 * The fix is one exchange identity minted at the member-action boundary and
 * carried by every writer in that request, so the second write is a no-op at the
 * database instead of a duplicate row.
 *
 * These tests pin the wiring, not the symptom. Deduplicating on content would
 * hide the write path AND could not distinguish replay from a member choosing to
 * repeat the same words.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

jest.mock('@/lib/db', () => ({ query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }) }));
jest.mock('@/lib/memory/stores/TurnsStore', () => ({
  TurnsStore: { addExchange: jest.fn().mockResolvedValue(undefined) },
}));

import { addConversationExchange } from '@/lib/sovereign/sessionManager';
import { TurnsStore } from '@/lib/memory/stores/TurnsStore';

const addExchange = TurnsStore.addExchange as jest.Mock;

describe('sessionManager.addConversationExchange — exchange identity', () => {
  beforeEach(() => addExchange.mockClear());

  it('forwards meta.exchangeId to TurnsStore so a sibling writer collapses', async () => {
    await addConversationExchange('session_x', 'hello', 'hi there', {
      userId: 'member-1',
      exchangeId: '11111111-2222-3333-4444-555555555555',
    });

    expect(addExchange).toHaveBeenCalledTimes(1);
    // signature: (posture, userId, sessionId, userMessage, assistantResponse, exchangeId)
    expect(addExchange.mock.calls[0][5]).toBe('11111111-2222-3333-4444-555555555555');
  });

  it('preserves the posture argument while threading the id', async () => {
    await addConversationExchange('session_x', 'hello', 'hi there', {
      userId: 'member-1',
      exchangeId: '11111111-2222-3333-4444-555555555555',
    });

    // posture is arg 0 and must never be displaced by the idempotency work —
    // dropping it would regress the S5 consent semantics on the write path.
    expect(addExchange.mock.calls[0][0]).toBeDefined();
    expect(addExchange.mock.calls[0][1]).toBe('member-1');
  });

  it('passes undefined — never a fabricated id — when the caller supplies none', async () => {
    await addConversationExchange('session_x', 'hello', 'hi there', { userId: 'member-1' });
    expect(addExchange.mock.calls[0][5]).toBeUndefined();
  });

  it('does not treat a non-string exchangeId as an identity', async () => {
    await addConversationExchange('session_x', 'hello', 'hi there', {
      userId: 'member-1',
      exchangeId: { not: 'a string' },
    });
    expect(addExchange.mock.calls[0][5]).toBeUndefined();
  });
});

describe('every writer in a request carries the same exchange identity', () => {
  it('maiaService mints one id per member action', () => {
    const src = read('lib/sovereign/maiaService.ts');
    expect(src).toMatch(/const exchangeId = randomUUID\(\);/);
  });

  it('maiaService passes it to every addConversationExchange call site', () => {
    const src = read('lib/sovereign/maiaService.ts');
    const sites = [...src.matchAll(/addConversationExchange\(/g)];
    expect(sites.length).toBeGreaterThan(0);

    for (const site of sites) {
      // the meta object literal opened by this call must carry exchangeId
      const tail = src.slice(site.index!, site.index! + 400);
      expect(tail).toMatch(/\bexchangeId,/);
    }
  });

  it('maiaService passes it to the direct TurnsStore.addExchange in the tail', () => {
    const src = read('lib/sovereign/maiaService.ts');
    expect(src).toMatch(/TurnsStore\.addExchange\([^)]*exchangeId\)/s);
    expect(src).not.toMatch(/TurnsStore\.addExchange\(turnPosture, effectiveUserId, sessionId, input, text\)/);
  });

  it('voice/persist gives both of its writers the same id', () => {
    const src = read('app/api/voice/persist/route.ts');
    expect(src).toMatch(/const exchangeId = globalThis\.crypto\.randomUUID\(\);/);
    // direct store write
    expect(src).toMatch(/assistantMessage,\s*\n\s*exchangeId\s*\n\s*\);/);
    // sibling write through sessionManager
    expect(src).toMatch(/userId: effectiveUserId,\s*\n\s*exchangeId,/);
  });
});

describe('the guard the identity relies on', () => {
  it('TurnsStore still writes both turns under ON CONFLICT (exchange_id, seq)', () => {
    const src = read('lib/memory/stores/TurnsStore.ts');
    const guards = [...src.matchAll(/ON CONFLICT \(exchange_id, seq\) WHERE exchange_id IS NOT NULL DO NOTHING/g)];
    // one for the user turn (seq 0), one for the assistant turn (seq 1)
    expect(guards.length).toBe(2);
  });

  it('has no content-equality dedup on the write path', () => {
    const src = read('lib/memory/stores/TurnsStore.ts');
    // Content equality cannot distinguish a replayed write from a member
    // repeating themselves. If dedup is ever added it must be identity-based.
    expect(src).not.toMatch(/ON CONFLICT \(user_id, session_id, role, content\)/);
  });
});
