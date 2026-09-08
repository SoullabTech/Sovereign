/**
 * AIN-STRUCTURED-INFERENCE-SEAM-01 · SC1–SC8 — provider-enforced schema conformance.
 *
 * GOVERNED AMENDMENT, founder ruling 2026-09-08, after G8 attempt #3 stopped at
 * Window 4: the provider returned a completed `tool_use` whose array-typed field
 * arrived as a JSON string containing corrupt JSON. Post-cognition contract
 * failure, so no retry (C5) — and the lawful response is to stop asking for
 * schema-invalid arguments rather than to tolerate them downstream.
 *
 *   A structured caller may require provider-enforced schema conformance.
 *   A provider that cannot guarantee it must refuse; it may not silently
 *   downgrade to ordinary tool use.
 *
 * The vendor term stays in the adapter. The seam speaks requirements.
 */
import { toAnthropicParams } from '../anthropicStructuredAdapter';
import type { StructuredProvider, StructuredRequest, StructuredTool } from '../types';
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..', '..');
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const plainTool: StructuredTool = {
  name: 'propose_structure',
  inputSchema: { type: 'object', additionalProperties: false, properties: {}, required: [] },
};
const strictTool: StructuredTool = { ...plainTool, inputSchemaConformance: 'provider_enforced' };
const base = (tools: StructuredTool[]): StructuredRequest => ({
  model: 'claude-opus-5', system: 'S',
  messages: [{ role: 'user', content: 'q' }], maxTokens: 100, tools,
});

describe('SC1 · a caller that asks for nothing is unchanged', () => {
  it('no conformance key → no vendor key anywhere in the wire params', () => {
    /* DEVELOP gets no behaviour change merely because Encounter needs a
       guarantee. The request must be byte-identical to what it was before the
       field existed. */
    const wire = JSON.stringify(toAnthropicParams(base([plainTool])));
    expect(wire).not.toContain('strict');
    expect(JSON.parse(wire).tools[0]).toEqual({
      name: 'propose_structure',
      input_schema: { type: 'object', additionalProperties: false, properties: {}, required: [] },
    });
  });

  it('and `best_effort` stated explicitly is also silent on the wire', () => {
    const wire = JSON.stringify(toAnthropicParams(base([{ ...plainTool, inputSchemaConformance: 'best_effort' }])));
    expect(wire).not.toContain('strict');
  });
});

describe('SC2 · the requirement reaches the vendor as that vendor’s mechanism', () => {
  it('`provider_enforced` becomes a top-level field on the tool definition', () => {
    const tools = (toAnthropicParams(base([strictTool])) as { tools: Record<string, unknown>[] }).tools;
    expect(tools[0].strict).toBe(true);
    /* On the tool, never on tool_choice — a different field with a different
       meaning, and putting it there would enforce nothing. */
    expect(JSON.stringify(toAnthropicParams({ ...base([strictTool]), toolChoice: { type: 'tool', name: 'propose_structure' } }))).toContain('"strict":true');
  });

  it('and only on the tool that asked for it', () => {
    const tools = (toAnthropicParams(base([plainTool, strictTool])) as { tools: Record<string, unknown>[] }).tools;
    expect(tools[0].strict).toBeUndefined();
    expect(tools[1].strict).toBe(true);
  });

  it('the schema itself is passed through unrewritten', () => {
    /* The seam does not rewrite contracts, and enforcement is not permission to
       start. A schema the caller wrote is the schema that goes up the wire. */
    const tools = (toAnthropicParams(base([strictTool])) as { tools: Record<string, unknown>[] }).tools;
    expect(tools[0].input_schema).toEqual(strictTool.inputSchema);
  });
});

describe('SC6 · the neutral seam never learns the vendor’s word', () => {
  it.each(['lib/ai/structured/types.ts', 'lib/ai/structured/router.ts'])(
    '%s contains no vendor term, comments stripped',
    (p) => {
      /* C21 discipline: these files DISCUSS the mechanism they must not name in
         code, so prose is stripped before the scan — a file must never fail for
         documenting its own compliance. */
      expect(strip(readFileSync(join(ROOT, p), 'utf8'))).not.toMatch(/\bstrict\b/);
    },
  );

  it('the requirement is spelled in seam vocabulary, not vendor vocabulary', () => {
    const types = readFileSync(join(ROOT, 'lib/ai/structured/types.ts'), 'utf8');
    expect(types).toContain("'provider_enforced'");
    expect(types).toContain("'best_effort'");
  });
});

/* ── SC3–SC5 · the refusal, driven through the PRODUCTION API ───────────── */

const execute = jest.fn();
let enforces = true;
jest.mock('../anthropicStructuredAdapter', () => ({
  ...jest.requireActual('../anthropicStructuredAdapter'),
  anthropicStructuredProvider: (): StructuredProvider => ({
    name: 'anthropic',
    get enforcesInputSchema() { return enforces; },
    execute: (req: StructuredRequest) => execute(req),
  }),
}));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { runStructured } = require('../router') as typeof import('../router');

const ok = {
  content: [], stopReason: 'end_turn', usage: { inputTokens: 1, outputTokens: 1 },
  provenance: {
    provider: 'anthropic' as const, model: 'claude-opus-5',
    reportedModel: 'claude-opus-5', modelAgreement: 'agreed' as const, latencyMs: 1,
  },
};

beforeEach(() => { execute.mockReset().mockResolvedValue(ok); enforces = true; });

describe('SC3–SC5 · refuse, never downgrade', () => {
  it('SC5 a provider that guarantees conformance proceeds', async () => {
    const r = await runStructured(base([strictTool]));
    expect(r.ok).toBe(true);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('⛔ SC3 a provider that does not guarantee it REFUSES', async () => {
    enforces = false;
    expect(await runStructured(base([strictTool]))).toMatchObject({
      ok: false, refusal: 'schema_conformance_unavailable',
    });
  });

  it('⛔ SC4 and the refusal happens BEFORE cognition — no call is made', async () => {
    /* The difference between refusing and downgrading. A downgrade would send
       the request as ordinary tool use and return an answer that happens to
       validate; the caller asked for a guarantee, not for a likely outcome. */
    enforces = false;
    await runStructured(base([strictTool]));
    expect(execute).not.toHaveBeenCalled();
  });

  it('a caller that did not require enforcement is unaffected by a non-enforcing provider', async () => {
    enforces = false;
    const r = await runStructured(base([plainTool]));
    expect(r.ok).toBe(true);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('and a request with no tools at all is unaffected', async () => {
    enforces = false;
    const { tools, ...noTools } = base([plainTool]);
    const r = await runStructured(noTools as StructuredRequest);
    expect(r.ok).toBe(true);
  });
});
