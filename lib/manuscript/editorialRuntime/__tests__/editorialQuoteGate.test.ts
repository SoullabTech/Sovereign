import { readFileSync } from 'fs';
import { join } from 'path';
import { judgeEditorialQuotes } from '../editorialQuoteGate';
import type { StructuredRequest } from '@/lib/ai/structured/types';

const req = (system: string, ...msgs: string[]) => ({
  model: 'm', system, maxTokens: 1,
  messages: msgs.map((content) => ({ role: 'user' as const, content })),
}) as unknown as StructuredRequest;
const PASSAGE = 'The harbour woke slowly, and the salt on the rails caught the first light before anyone spoke.';

describe('editorial turn · quote fidelity', () => {
  it('accepts a quote from the passage she was given', () => {
    expect(judgeEditorialQuotes(req('s', PASSAGE),
      { kind: 'reply_only', reply: 'I like "the salt on the rails caught the first light" here.' }).ok).toBe(true);
  });
  it('accepts a quote of her own proposed wording in the same response', () => {
    expect(judgeEditorialQuotes(req('s', PASSAGE), {
      kind: 'reply_with_proposal', reply: 'Try "the harbour stirred and the rails took the light" instead.',
      proposal: { replacementText: 'The harbour stirred and the rails took the light before anyone spoke.' },
    }).ok).toBe(true);
  });
  it('refuses an invented quote of the writer', () => {
    const r = judgeEditorialQuotes(req('s', PASSAGE),
      { kind: 'reply_only', reply: 'You wrote "the tide retreated like a held breath at dawn", which is lovely.' });
    expect(r.ok).toBe(false); expect(r.ungrounded).toHaveLength(1);
  });
  it('does not inspect the proposal or rationale text for quotes (only the reply)', () => {
    expect(judgeEditorialQuotes(req('s', PASSAGE), {
      kind: 'reply_with_proposal', reply: 'Here is an option.',
      proposal: { replacementText: 'He said "something entirely new that is not in the passage at all".' },
    }).ok).toBe(true);
  });
});

describe('editorial turn · wiring (static)', () => {
  const src = readFileSync(join(__dirname, '..', 'turn.ts'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  it('the gate runs after admission and before anything is persisted', () => {
    const gate = src.indexOf('judgeEditorialQuotes(request');
    expect(gate).toBeGreaterThan(src.indexOf('admitEditorialToolEnvelope('));
    expect(gate).toBeLessThan(src.indexOf('persistMaiaEditorialOutcome('));
  });
});
