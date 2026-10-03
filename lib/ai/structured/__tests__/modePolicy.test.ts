/**
 * AIN-STRUCTURED-INFERENCE-SEAM-01 — the mode belongs to the platform.
 *
 * The caller owns model, prompt, messages, tools and token ceiling. The platform
 * owns whether that provider is authorized here. A `runStructured` that accepted
 * a mode let a cognitive surface opt itself out of sovereign policy; these tests
 * pin the boundary.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { resolveStructuredMode } from '../policy';
import { runStructured } from '../router';
import type { StructuredRequest } from '../types';

const req: StructuredRequest = {
  model: 'claude-opus-5', system: 's',
  messages: [{ role: 'user', content: 'q' }], maxTokens: 10,
};

describe('structured v1 effective policy', () => {
  it('unset resolves to primary — zero behaviour change for today\'s callers', () => {
    expect(resolveStructuredMode(undefined)).toEqual({ ok: true, mode: 'primary' });
    expect(resolveStructuredMode('')).toEqual({ ok: true, mode: 'primary' });
    expect(resolveStructuredMode('   ')).toEqual({ ok: true, mode: 'primary' });
  });

  it.each(['primary', 'sovereign', 'local_only'] as const)(
    'passes %s through', (m) => {
      expect(resolveStructuredMode(m)).toEqual({ ok: true, mode: m });
    });

  it('REFUSES an invalid mode rather than defaulting to the permissive one', () => {
    const r = resolveStructuredMode('soverign');
    expect(r.ok).toBe(false);
    expect(r.ok === false && r.refusal).toBe('invalid_inference_mode');
  });
});

describe('the production API does not accept a mode', () => {
  it('runStructured takes exactly one parameter', () => {
    expect(runStructured.length).toBe(1);
  });

  it('an explicitly sovereign deployment refuses, without reaching Anthropic', async () => {
    const prev = process.env.MAIA_INFERENCE_MODE;
    process.env.MAIA_INFERENCE_MODE = 'sovereign';
    try {
      const r = await runStructured(req);
      expect(r).toEqual({
        ok: false,
        refusal: 'structured_inference_unavailable',
        detail: 'mode=sovereign: no local provider can honour a structured contract',
      });
    } finally {
      if (prev === undefined) delete process.env.MAIA_INFERENCE_MODE;
      else process.env.MAIA_INFERENCE_MODE = prev;
    }
  });

  it('a mistyped deployment mode refuses at the boundary', async () => {
    const prev = process.env.MAIA_INFERENCE_MODE;
    process.env.MAIA_INFERENCE_MODE = 'local-only';
    try {
      const r = await runStructured(req);
      expect(r.ok).toBe(false);
      expect(r.ok === false && r.refusal).toBe('invalid_inference_mode');
    } finally {
      if (prev === undefined) delete process.env.MAIA_INFERENCE_MODE;
      else process.env.MAIA_INFERENCE_MODE = prev;
    }
  });

  /**
   * THE STRUCTURAL GATE. Comments are stripped first — the module deliberately
   * DISCUSSES the export it no longer has, and an earlier version of this test
   * passed on that prose rather than on the code.
   */
  it('router.ts exports no callable path that accepts a mode or policy override', () => {
    const src = readFileSync(join(__dirname, '..', 'router.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

    /* Exactly two exports: the production entry point and a null constant. */
    const exported = [...src.matchAll(/^export\s+(?:async\s+)?(?:function|const|let|var|class)\s+(\w+)/gm)]
      .map((m) => m[1]).sort();
    expect(exported).toEqual(['LOCAL_STRUCTURED_PROVIDER', 'runStructured']);

    /* And no export re-surfaces one under another name. */
    expect(src).not.toMatch(/^export\s*\{/m);
    expect(src).not.toMatch(/^export\s+\*/m);

    /* No exported signature mentions a mode or a provider override. */
    const exportedSignatures = [...src.matchAll(/^export[\s\S]*?\)/gm)].map((m) => m[0]).join('\n');
    expect(exportedSignatures).not.toMatch(/InferenceMode/);
    expect(exportedSignatures).not.toMatch(/\bmode\b/);
    expect(exportedSignatures).not.toMatch(/StructuredProvider\s*\}/);
  });

  it('the removed seam is gone from the code, not merely renamed', () => {
    const src = readFileSync(join(__dirname, '..', 'router.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(src).not.toContain('__runStructuredWithPolicyForTest');
    expect(src).not.toContain('ForTest');
  });

  it('only policy.ts decides the mode, and it is not a routing path', () => {
    const policy = readFileSync(join(__dirname, '..', 'policy.ts'), 'utf8');
    expect(policy).toContain('export function resolveStructuredMode');
    /* It resolves a mode; it cannot execute anything. */
    expect(policy).not.toContain('execute');
    expect(policy).not.toContain('StructuredProvider');
  });
});
