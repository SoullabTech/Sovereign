/**
 * CROSS-SURFACE-THREAD-ADOPTION-01 — falsification suite.
 *
 * The six gates the founder set, plus the two traps that make this feature
 * dangerous rather than merely absent: re-POSTing adopted rows (a conversation
 * multiplier) and re-rendering one's own turn as a duplicate.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  planAdoption,
  localRepresentations,
  representationKey,
  seqForRole,
  nextPollDelayMs,
  mayPoll,
  POLL_VISIBLE_MS,
  POLL_HIDDEN_MS,
  POLL_MAX_BACKOFF_MS,
  type CanonicalTurnRow,
  type LocalMessageLike,
} from '../crossSurfaceAdoption';

const row = (o: Partial<CanonicalTurnRow> & { id: string }): CanonicalTurnRow => ({
  role: 'user', content: 'x', createdAt: '2026-08-28T12:00:00Z', ...o,
});

const local = (o: Partial<LocalMessageLike> & { id: string }): LocalMessageLike => ({
  role: 'user', ...o,
});

describe('GATE 1 — an external pair appears exactly once', () => {
  it('adopts both halves of a pair written by another surface', () => {
    const rows = [
      row({ id: 'r1', role: 'user', exchangeId: 'e1', seq: 0, content: 'spoken on Desktop' }),
      row({ id: 'r2', role: 'assistant', exchangeId: 'e1', seq: 1, content: 'her reply' }),
    ];
    const plan = planAdoption(rows, [], new Set());
    expect(plan.adopt.map((a) => a.row.id)).toEqual(['r1', 'r2']);
    expect(plan.unchanged).toBe(false);
  });

  it('does NOT adopt them a second time on the next poll', () => {
    const rows = [
      row({ id: 'r1', exchangeId: 'e1', seq: 0 }),
      row({ id: 'r2', role: 'assistant', exchangeId: 'e1', seq: 1 }),
    ];
    const first = planAdoption(rows, [], new Set());
    const seen = new Set(first.observed);
    // Same tail returned again, and the adopted rows are now on screen.
    const onScreen = first.adopt.map((a) => local({ id: a.row.id, role: a.row.role }));
    const second = planAdoption(rows, onScreen, seen);
    expect(second.adopt).toEqual([]);
    expect(second.unchanged).toBe(true);
  });
});

describe('⭐ GATE 3 — my own turn echoing back does not duplicate', () => {
  it('recognises a local message by durable exchange identity, not by text', () => {
    // The rich local pair, as the sovereign path produced it.
    const messages = [
      local({ id: 'local-a', role: 'user', metadata: { exchangeId: 'e9' } }),
      local({ id: 'local-b', role: 'oracle', metadata: { exchangeId: 'e9' } }),
    ];
    // The same exchange, come back from the server with different row ids.
    const rows = [
      row({ id: 'srv-1', role: 'user', exchangeId: 'e9', seq: 0 }),
      row({ id: 'srv-2', role: 'assistant', exchangeId: 'e9', seq: 1 }),
    ];
    const plan = planAdoption(rows, messages, new Set());
    expect(plan.adopt).toEqual([]);
    expect(plan.unchanged).toBe(true);
  });

  it('two identical member messages are two turns, not one — text is never the key', () => {
    // The failure a content-based merge produces: a member says "yes" twice and
    // the second one silently disappears.
    const messages = [local({ id: 'l1', role: 'user', metadata: { exchangeId: 'e1' } })];
    const rows = [
      row({ id: 's1', role: 'user', exchangeId: 'e1', seq: 0, content: 'yes' }),
      row({ id: 's2', role: 'user', exchangeId: 'e2', seq: 0, content: 'yes' }),
    ];
    const plan = planAdoption(rows, messages, new Set());
    expect(plan.adopt.map((a) => a.row.id)).toEqual(['s2']);
  });

  it('a rich local message is never handed back for replacement', () => {
    // The plan carries rows to ADD. It has no concept of replacing a local
    // message, so Keep state / integrity results / audio cannot be stripped.
    const plan = planAdoption(
      [row({ id: 's1', exchangeId: 'e1', seq: 0 })],
      [local({ id: 'l1', role: 'user', metadata: { exchangeId: 'e1' } })],
      new Set(),
    );
    expect(Object.keys(plan)).not.toContain('replace');
    expect(plan.adopt).toEqual([]);
  });
});

describe('legacy rows — exchange_id is NULL and must not become a wildcard', () => {
  it('matches a NULL-exchange row by id only', () => {
    expect(representationKey(null, 'user')).toBeNull();
    expect(representationKey(undefined, 'assistant')).toBeNull();

    const rows = [row({ id: 'legacy-1', exchangeId: null, seq: 0 })];
    // Not on screen → adopted.
    expect(planAdoption(rows, [], new Set()).adopt.map((a) => a.row.id)).toEqual(['legacy-1']);
    // On screen by id → skipped.
    expect(planAdoption(rows, [local({ id: 'legacy-1' })], new Set()).adopt).toEqual([]);
  });

  it('two NULL-exchange rows never collide with each other', () => {
    const rows = [
      row({ id: 'a', exchangeId: null, content: 'one' }),
      row({ id: 'b', exchangeId: null, content: 'two' }),
    ];
    expect(planAdoption(rows, [], new Set()).adopt).toHaveLength(2);
  });
});

describe('seq convention matches the migration', () => {
  it('member is 0, MAIA is 1 — in both role spellings', () => {
    expect(seqForRole('user')).toBe(0);
    expect(seqForRole('assistant')).toBe(1);
    expect(seqForRole('oracle')).toBe(1);
  });

  it('the two halves of one exchange are distinct representations', () => {
    const keys = localRepresentations([
      local({ id: 'a', role: 'user', metadata: { exchangeId: 'e1' } }),
      local({ id: 'b', role: 'oracle', metadata: { exchangeId: 'e1' } }),
    ]);
    expect(keys.has('e1:0')).toBe(true);
    expect(keys.has('e1:1')).toBe(true);
  });

  it('a half already on screen does not suppress its partner', () => {
    // Only the member's half rendered locally; MAIA's half must still adopt.
    const plan = planAdoption(
      [
        row({ id: 's1', role: 'user', exchangeId: 'e1', seq: 0 }),
        row({ id: 's2', role: 'assistant', exchangeId: 'e1', seq: 1 }),
      ],
      [local({ id: 'l1', role: 'user', metadata: { exchangeId: 'e1' } })],
      new Set(),
    );
    expect(plan.adopt.map((a) => a.row.id)).toEqual(['s2']);
  });
});

describe('⭐ GATE 4 — polling can never overwrite an in-flight turn', () => {
  const ready = {
    hasSession: true, isProcessing: false, isResponding: false,
    isStreaming: false, inFlightRequest: false,
  };

  it('permits a poll only when the conversation is settled', () => {
    expect(mayPoll(ready)).toBe(true);
  });

  it.each([
    ['isProcessing', { isProcessing: true }],
    ['isResponding', { isResponding: true }],
    ['isStreaming', { isStreaming: true }],
    ['a poll already in flight', { inFlightRequest: true }],
    ['no session yet', { hasSession: false }],
  ])('refuses while %s', (_label, override) => {
    expect(mayPoll({ ...ready, ...override })).toBe(false);
  });
});

describe('GATE — polling cadence', () => {
  it('is fast enough for speech when visible, slow when hidden', () => {
    expect(nextPollDelayMs({ visible: true, consecutiveErrors: 0 })).toBe(POLL_VISIBLE_MS);
    expect(POLL_VISIBLE_MS).toBeLessThanOrEqual(2000);
    expect(nextPollDelayMs({ visible: false, consecutiveErrors: 0 })).toBe(POLL_HIDDEN_MS);
  });

  it('backs off exponentially on error and never runs away', () => {
    const delays = [1, 2, 3, 4, 5, 10].map((e) =>
      nextPollDelayMs({ visible: true, consecutiveErrors: e }));
    for (let i = 1; i < delays.length; i++) expect(delays[i]).toBeGreaterThanOrEqual(delays[i - 1]);
    expect(delays.at(-1)).toBe(POLL_MAX_BACKOFF_MS);
    expect(Math.max(...delays)).toBeLessThanOrEqual(POLL_MAX_BACKOFF_MS);
  });
});

describe('GATE 5 — a thread beyond 100 rows still adopts its newest turn', () => {
  it('the route returns the NEWEST tail, so a late row is present to adopt', () => {
    // Simulating the corrected read: rows 150–249 of a long thread, in order.
    const tail = Array.from({ length: 100 }, (_, i) =>
      row({ id: `r${150 + i}`, exchangeId: `e${150 + i}`, seq: 0 }));
    const onScreen = tail.slice(0, 99).map((r) =>
      local({ id: r.id, role: 'user', metadata: { exchangeId: r.exchangeId! } }));

    const plan = planAdoption(tail, onScreen, new Set());
    expect(plan.adopt.map((a) => a.row.id)).toEqual(['r249']);
  });

  it('⛔ the OLD oldest-first read would have made this unreachable', () => {
    // Kept as documentation of the defect: an ASC LIMIT 100 read returns rows
    // 0–99 forever, so the newest turn is simply never in the payload and the
    // feature expires silently at row 100.
    const oldestHundred = Array.from({ length: 100 }, (_, i) => row({ id: `r${i}` }));
    expect(oldestHundred.some((r) => r.id === 'r249')).toBe(false);
  });
});

describe('the observed cursor is READ bookkeeping only', () => {
  it('reports every row it saw, adopted or not — so the cursor can advance past echoes', () => {
    const rows = [
      row({ id: 's1', exchangeId: 'e1', seq: 0 }),
      row({ id: 's2', role: 'assistant', exchangeId: 'e1', seq: 1 }),
    ];
    const plan = planAdoption(rows, [
      local({ id: 'l1', role: 'user', metadata: { exchangeId: 'e1' } }),
      local({ id: 'l2', role: 'oracle', metadata: { exchangeId: 'e1' } }),
    ], new Set());
    expect(plan.adopt).toEqual([]);
    // Nothing adopted, but both rows are marked observed — otherwise every poll
    // would re-examine the whole tail forever.
    expect(plan.observed).toEqual(['s1', 's2']);
  });
});


// ════════════════════════════════════════════════════════════════════════════
// ⭐ DEFECT FOUND IN PRE-WITNESS REVIEW — the fixture had assumed a shape the
// runtime did not have. These two tests are written against reality.
// ════════════════════════════════════════════════════════════════════════════

describe('GATE 3, against the REAL message shape', () => {
  it('⛔ the pre-fix shape: MAIA half without exchangeId would be adopted twice', () => {
    // What the component actually produced before this unit's repair: the
    // member's message carried metadata.exchangeId, MAIA's did not. The member
    // half matches and MAIA's does not, so her answer is adopted a second time
    // and appears twice on screen.
    const preFixLocal = [
      local({ id: 'l-user', role: 'user', metadata: { exchangeId: 'e9' } }),
      local({ id: 'l-maia', role: 'oracle' }),          // ← no exchangeId
    ];
    const rows = [
      row({ id: 's1', role: 'user', exchangeId: 'e9', seq: 0 }),
      row({ id: 's2', role: 'assistant', exchangeId: 'e9', seq: 1 }),
    ];
    const plan = planAdoption(rows, preFixLocal, new Set());
    expect(plan.adopt.map((a) => a.row.id)).toEqual(['s2']);   // the duplication
  });

  it('✅ with the repair — MAIA carries the same exchangeId — nothing duplicates', () => {
    const repaired = [
      local({ id: 'l-user', role: 'user', metadata: { exchangeId: 'e9' } }),
      local({ id: 'l-maia', role: 'oracle', metadata: { exchangeId: 'e9' } }),
    ];
    const rows = [
      row({ id: 's1', role: 'user', exchangeId: 'e9', seq: 0 }),
      row({ id: 's2', role: 'assistant', exchangeId: 'e9', seq: 1 }),
    ];
    expect(planAdoption(rows, repaired, new Set()).unchanged).toBe(true);
  });
});

describe('⭐ CANONICAL ORDERING — adoption never renders a conversation that did not happen', () => {
  it('an external turn OLDER than a local one is placed before it, not appended', () => {
    // Cross-surface concurrency: A was written elsewhere before B, but this
    // surface only has B. Appending would show B then A.
    const rows = [
      row({ id: 'A', role: 'user', exchangeId: 'eA', seq: 0, content: 'said on the phone' }),
      row({ id: 'B', role: 'user', exchangeId: 'eB', seq: 0, content: 'said here' }),
    ];
    const onScreen = [local({ id: 'local-B', role: 'user', metadata: { exchangeId: 'eB' } })];

    const plan = planAdoption(rows, onScreen, new Set());
    expect(plan.adopt).toHaveLength(1);
    const [a] = plan.adopt;
    expect(a.row.id).toBe('A');
    expect(a.afterLocalId).toBeNull();         // nothing represented precedes it
    expect(a.beforeLocalId).toBe('local-B');   // ⭐ it belongs BEFORE the local turn
  });

  it('a turn between two represented turns anchors to both', () => {
    const rows = [
      row({ id: 'A', exchangeId: 'eA', seq: 0 }),
      row({ id: 'MID', exchangeId: 'eMID', seq: 0 }),
      row({ id: 'C', exchangeId: 'eC', seq: 0 }),
    ];
    const onScreen = [
      local({ id: 'l-A', role: 'user', metadata: { exchangeId: 'eA' } }),
      local({ id: 'l-C', role: 'user', metadata: { exchangeId: 'eC' } }),
    ];
    const [mid] = planAdoption(rows, onScreen, new Set()).adopt;
    expect(mid.row.id).toBe('MID');
    expect(mid.afterLocalId).toBe('l-A');
    expect(mid.beforeLocalId).toBe('l-C');
  });

  it('a newer turn with nothing after it appends — the ordinary case', () => {
    const rows = [
      row({ id: 'A', exchangeId: 'eA', seq: 0 }),
      row({ id: 'NEW', exchangeId: 'eNEW', seq: 0 }),
    ];
    const onScreen = [local({ id: 'l-A', role: 'user', metadata: { exchangeId: 'eA' } })];
    const [n] = planAdoption(rows, onScreen, new Set()).adopt;
    expect(n.afterLocalId).toBe('l-A');
    expect(n.beforeLocalId).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT-LEVEL REPAIRS — the property IS the source, so it is read directly.
// Without these two, the module can be perfectly correct while the surface that
// feeds it regresses silently. Both were found in pre-witness review.
// ════════════════════════════════════════════════════════════════════════════

describe('the surface upholds what the module assumes', () => {
  const component = readFileSync(
    new URL('../../../components/OracleConversation.tsx', import.meta.url), 'utf8');

  it('BOTH halves of a sovereign exchange carry the same durable identity', () => {
    // The member's half always did. MAIA's did not — so the adoption poll
    // matched one and adopted the other, and her answer appeared twice.
    const sites = component.match(/exchangeId: turnExchangeId/g) ?? [];
    expect(sites.length).toBeGreaterThanOrEqual(2);

    // ⛔ Anchored on the SOVEREIGN response specifically. There are three
    // `oracleMessage` constructors; only this one has a persisted server row
    // and therefore only this one can be adopted back as a duplicate. The two
    // streaming-path constructors carry no exchange identity at all — recorded
    // as a separate finding, not silently absorbed here.
    const at = component.indexOf('-oracle`,');
    const oracleMsg = at > 0 ? component.slice(at, at + 2500) : '';
    expect(oracleMsg).not.toBe('');
    expect(oracleMsg).toContain('exchangeId: turnExchangeId');
  });

  it('the poll is OPT-IN — it never starts for an embedding that did not ask', () => {
    // OracleConversation is generic: it defaults to /api/between/chat and is
    // embedded in other contexts. A 1.8s database poll must not arrive in them
    // by default. Canonical /maia opts in by supplying onCanonicalThreadChange.
    expect(component).toContain('if (!onCanonicalThreadChange) return;');
    const guard = component.indexOf('if (!onCanonicalThreadChange) return;');
    const poll = component.indexOf('CROSS-SURFACE-THREAD-ADOPTION-01 — the conversation catches up');
    expect(guard).toBeGreaterThan(poll);          // the guard is inside the poll effect
  });

  it('the write cursor is advanced where adoption happens, and is not the read cursor', () => {
    expect(component).toContain('seenCanonicalRowIdsRef');
    const adoption = /setMessages\(\(prev\) => \{\s*const next = \[\.\.\.prev\];[\s\S]*?return next;\s*\}\);/.exec(component)?.[0] ?? '';
    expect(adoption).toContain('lastSyncedCountRef.current = next.length');
    // ⛔ and the read cursor must never be the write cursor
    expect(adoption).not.toContain('seenCanonicalRowIdsRef.current = ');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// THE FOURTH DEFECT — streaming voice authored turns with no durable identity,
// so the write-sync effect persisted them and the adoption poll read them back
// as turns nobody had said. Repaired at TURN BIRTH, threaded through the
// invocation — never minted later by the persistence effect.
// ════════════════════════════════════════════════════════════════════════════

describe('streaming voice carries durable identity from birth', () => {
  const component = readFileSync(
    new URL('../../../components/OracleConversation.tsx', import.meta.url), 'utf8');
  const hook = readFileSync(
    new URL('../../../hooks/useStreamingVoice.ts', import.meta.url), 'utf8');

  it('the streamed MEMBER half is stamped where the turn is authored', () => {
    expect(component).toContain('const streamingExchangeId = crypto.randomUUID();');
    const userMsg = /const streamingExchangeId[\s\S]*?source: 'voice',[\s\S]*?\};/.exec(component)?.[0] ?? '';
    expect(userMsg).toContain('metadata: { exchangeId: streamingExchangeId }');
  });

  it('the identity is threaded through the INVOCATION, not a shared ref', () => {
    // Per-invocation binding is what stops a late completion stamping a newer
    // turn. A ref in the component would not give that guarantee.
    expect(component).toContain(
      'sendStreamingMessage(cleanedText, conversationHistory, isSanctuary, streamingExchangeId)');
    expect(component).not.toContain('streamingExchangeIdRef');
    expect(hook).toMatch(/sanctuary: boolean,[\s\S]{0,1400}exchangeId: string,/);
  });

  it('BOTH streamed MAIA constructors stamp the id their completion carried', () => {
    expect(component).toContain('onComplete: (fullResponse, relational, exchangeId) => {');
    const stamps = component.match(/metadata: exchangeId \? \{ exchangeId \} : undefined,/g) ?? [];
    expect(stamps).toHaveLength(2);   // normal success, and TTS-failure-text-success
  });

  it('EVERY completion path carries it — the client persists whatever pair is on screen', () => {
    // The stream route writes nothing; the write-sync effect is the only writer.
    // So a fallback response on screen is persisted too, and must be matchable.
    const completions = hook.match(/onComplete\?\.\([^)]*\)/g) ?? [];
    expect(completions.length).toBeGreaterThanOrEqual(3);
    for (const c of completions) expect(c).toContain('exchangeId');
  });

  it('⛔ telemetry identity is NOT reused as conversational identity', () => {
    // turnIdRef is instrumentation and lives in a ref the next turn overwrites.
    // Both are UUIDs; they are different contracts.
    expect(hook).toContain('turnIdRef');
    const sig = /const sendMessage = useCallback\(async \([\s\S]*?\) => \{/.exec(hook)?.[0] ?? '';
    expect(sig).toContain('exchangeId: string');
    expect(component).not.toMatch(/exchangeId:\s*turnIdRef/);
    expect(hook).not.toMatch(/onComplete\?\.\([^)]*turnIdRef[^)]*\)/);
  });
});

describe('a streamed pair adopts ZERO rows once repaired', () => {
  it('server echo of a streamed exchange is fully recognised', () => {
    const streamed = [
      local({ id: 'msg-1', role: 'user', metadata: { exchangeId: 'sx' } }),
      local({ id: 'msg-2', role: 'oracle', metadata: { exchangeId: 'sx' } }),
    ];
    const echo = [
      row({ id: 'srv-a', role: 'user', exchangeId: 'sx', seq: 0 }),
      row({ id: 'srv-b', role: 'assistant', exchangeId: 'sx', seq: 1 }),
    ];
    expect(planAdoption(echo, streamed, new Set()).adopt).toEqual([]);
  });

  it('a SECOND streamed turn cannot inherit the first turn\'s identity', () => {
    // Two consecutive streamed turns, each with its own id: the second echo is
    // recognised on its own terms, not absorbed by the first.
    const onScreen = [
      local({ id: 'm1', role: 'user', metadata: { exchangeId: 'sx1' } }),
      local({ id: 'm2', role: 'oracle', metadata: { exchangeId: 'sx1' } }),
      local({ id: 'm3', role: 'user', metadata: { exchangeId: 'sx2' } }),
      local({ id: 'm4', role: 'oracle', metadata: { exchangeId: 'sx2' } }),
    ];
    const echo = [
      row({ id: 'a', role: 'user', exchangeId: 'sx1', seq: 0 }),
      row({ id: 'b', role: 'assistant', exchangeId: 'sx1', seq: 1 }),
      row({ id: 'c', role: 'user', exchangeId: 'sx2', seq: 0 }),
      row({ id: 'd', role: 'assistant', exchangeId: 'sx2', seq: 1 }),
    ];
    expect(planAdoption(echo, onScreen, new Set()).unchanged).toBe(true);
  });

  it('⛔ the PRE-FIX streamed shape duplicated the whole pair', () => {
    // Neither half carried identity, so the entire exchange came back as new.
    const preFix = [
      local({ id: 'msg-1', role: 'user' }),
      local({ id: 'msg-2', role: 'oracle' }),
    ];
    const echo = [
      row({ id: 'srv-a', role: 'user', exchangeId: 'sx', seq: 0 }),
      row({ id: 'srv-b', role: 'assistant', exchangeId: 'sx', seq: 1 }),
    ];
    expect(planAdoption(echo, preFix, new Set()).adopt).toHaveLength(2);
  });
});

describe('session parity — one session, not one for the record and another for the voice', () => {
  const component = readFileSync(
    new URL('../../../components/OracleConversation.tsx', import.meta.url), 'utf8');
  const hook = readFileSync(
    new URL('../../../hooks/useStreamingVoice.ts', import.meta.url), 'utf8');

  it('the canonical /maia sessionId is supplied to the streaming hook', () => {
    // Without it the hook mints `voice-<uuid>` and the route uses THAT as its
    // relational + wisdom continuity key, so MAIA answers from a session the
    // conversation record never knew about.
    const call = /= useStreamingVoice\(\{[\s\S]*?\n  \}\);/.exec(component)?.[0] ?? '';
    expect(call).not.toBe('');
    expect(call).toMatch(/^\s*sessionId,$/m);
  });

  it('the hook sends the supplied session, and follows it when the thread changes', () => {
    expect(hook).toContain('sessionId: sessionIdRef.current');
    // Adopting a new canonical thread must carry the voice session with it.
    expect(hook).toMatch(/providedSessionId && providedSessionId !== sessionIdRef\.current/);
  });

  it('⛔ a generated voice-* session is the FALLBACK, never used when one is supplied', () => {
    const gen = /function getOrCreateSessionId\([\s\S]*?\n\}/.exec(hook)?.[0] ?? '';
    expect(gen).toContain('if (providedId)');
    // A supplied id returns BEFORE sessionStorage is consulted and before
    // generateSessionId() is ever reached, so a stale `voice-*` left in
    // sessionStorage by an earlier run cannot win over the canonical thread.
    expect(gen.indexOf('return providedId;')).toBeLessThan(gen.indexOf('sessionStorage.getItem'));
    expect(gen.indexOf('return providedId;')).toBeLessThan(gen.indexOf('generateSessionId()'));
  });
});
