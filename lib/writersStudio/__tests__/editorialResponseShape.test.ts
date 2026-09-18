import { admitEditorialToolEnvelope } from '@/lib/manuscript/editorialDiscourse/contract';
test('observed malformed provider shape is refused rather than rescued into manuscript wording', () => {
  const result = admitEditorialToolEnvelope([{ type: 'tool_use', id: 'observed', name: 'editorial_outcome',
    input: { kind: 'reply_with_proposal', reply: 'Explanation', proposal: 'Reason in the wrong slot', replacementText: 'Unbound wording' } }]);
  expect(result).toEqual({ ok: false, reason: 'malformed' });
});
test('nested proposal preserves explicit wording and purpose', () => {
  const result = admitEditorialToolEnvelope([{ type: 'tool_use', id: 'valid', name: 'editorial_outcome',
    input: { kind: 'reply_with_proposal', reply: 'Possible benefit, uncertain.', proposal: {
      replacementText: 'A quieter return.', rationale: 'Editorial purpose: Quieter ending' } } }]);
  expect(result.ok).toBe(true);
});

import { toAnthropicParams } from '@/lib/ai/structured/anthropicStructuredAdapter';
test('required schema conformance reaches provider without changing schema or legacy callers', () => {
  const base = { model: 'test-model', system: 'test', messages: [], maxTokens: 10 };
  const schema = { type: 'object', properties: {}, additionalProperties: false };
  expect((toAnthropicParams({ ...base, tools: [{ name: 'test', inputSchema: schema, schemaEnforcement: 'required' }] }).tools as any[])[0])
    .toEqual({ name: 'test', input_schema: schema, strict: true });
  expect((toAnthropicParams({ ...base, tools: [{ name: 'test', inputSchema: schema }] }).tools as any[])[0])
    .not.toHaveProperty('strict');
});
