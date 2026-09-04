/**
 * BUILD-07C — the bounded classifier, falsified without a model.
 * Founder ruling: claims + lens + doesNotEstablish in, phenomenon out; the v1
 * family only; unclassifiable refuses; no prose; pinned model; provenance.
 */

import { createHash } from 'crypto';
import type { StructuredBlock } from '../../../ai/structured/types';
import {
  CLASSIFIER_SYSTEM, CLASSIFIER_TOOL, CLASSIFIER_VERSION, classifierPromptHash, classifierTool,
  classifyClaims, parseClassifierBlocks, renderClassificationRequest,
} from '../classify';
import { DEVELOPMENTAL_PHENOMENA, PHENOMENON_LABEL } from '../contract';

const call = (input: unknown, name = CLASSIFIER_TOOL): StructuredBlock => ({ type: 'tool_use', id: 't', name, input });
const cls = (...phenomena: string[]) => call({ classifications: phenomena.map((p, index) => ({ index, phenomenon: p })) });

describe('parseClassifierBlocks', () => {
  it('accepts exactly one classification per index, in any order', () => {
    const p = parseClassifierBlocks([call({ classifications: [{ index: 1, phenomenon: 'movement' }, { index: 0, phenomenon: 'recurrence' }] })], 2);
    expect(p.ok && p.phenomena).toEqual(['recurrence', 'movement']);
  });

  it('unclassifiable refuses rather than inventing a category', () => {
    const p = parseClassifierBlocks([cls('recurrence', 'unclassifiable')], 2);
    expect(p.ok ? 'ok' : `${p.refusal}:${p.index}`).toBe('classifier_unclassifiable:1');
  });

  it('missing, duplicated, out-of-range indexes and foreign values refuse', () => {
    expect((parseClassifierBlocks([cls('recurrence')], 2) as { refusal: string }).refusal).toBe('classifier_index_mismatch');
    expect((parseClassifierBlocks([call({ classifications: [{ index: 0, phenomenon: 'movement' }, { index: 0, phenomenon: 'movement' }] })], 1) as { refusal: string }).refusal).toBe('classifier_index_mismatch');
    expect((parseClassifierBlocks([call({ classifications: [{ index: 3, phenomenon: 'movement' }] })], 1) as { refusal: string }).refusal).toBe('classifier_index_mismatch');
    expect((parseClassifierBlocks([cls('irony')], 1) as { refusal: string }).refusal).toBe('classifier_malformed');
    expect((parseClassifierBlocks([call({ classifications: [{ index: 0, phenomenon: 'movement', confidence: 0.9 }] })], 1) as { refusal: string }).refusal).toBe('classifier_foreign_field');
    expect((parseClassifierBlocks([call({ classifications: [], rewritten: 'x' })], 1) as { refusal: string }).refusal).toBe('classifier_foreign_field');
    expect((parseClassifierBlocks([{ type: 'text', text: 'recurrence' }], 1) as { refusal: string }).refusal).toBe('classifier_malformed');
    expect((parseClassifierBlocks([cls('movement'), cls('movement')], 1) as { refusal: string }).refusal).toBe('classifier_malformed');
  });

  it('the tool cannot express a rewritten claim, an interpretation, or a score', () => {
    const schema = JSON.stringify(classifierTool().input_schema);
    for (const f of ['text', 'observation', 'interpretation', 'possibilities', 'questions', 'severity', 'confidence', 'score', 'rank']) {
      expect(schema).not.toMatch(new RegExp(`"${f}"\\s*:`));
    }
    expect(schema).toContain('"unclassifiable"');
    for (const p of DEVELOPMENTAL_PHENOMENA) expect(schema).toContain(`"${p}"`);
  });
});

describe('the classifier sees no prose', () => {
  it('renders claim text, lens and non-conclusions only, deterministically', () => {
    const a = renderClassificationRequest([{ text: 'The lantern recurs.', doesNotEstablish: ['whole-work-pattern'] }], 'development');
    const b = renderClassificationRequest([{ text: 'The lantern recurs.', doesNotEstablish: ['whole-work-pattern'] }], 'development');
    expect(a).toBe(b);
    expect(a).toContain('COMMISSIONED LENS: development');
    expect(a).toContain('[0] The lantern recurs.');
    expect(a).not.toMatch(/SECTION TEXT|=== SECTION/);
  });

  it('the system prompt names the eight phenomena verbatim and forbids rewriting', () => {
    for (const p of DEVELOPMENTAL_PHENOMENA) expect(CLASSIFIER_SYSTEM).toContain(PHENOMENON_LABEL[p]);
    expect(CLASSIFIER_SYSTEM).toMatch(/do not judge, rank, interpret, or rewrite/i);
    expect(CLASSIFIER_SYSTEM).toMatch(/NOT given the manuscript/);
  });
});

describe('provenance and the pinned model', () => {
  it('classifierPromptHash is over system + tool together; version is DEVELOPMENTAL-PHENOMENON-03', () => {
    const expected = createHash('sha256').update(CLASSIFIER_SYSTEM, 'utf8').update('\u0000')
      .update(JSON.stringify(classifierTool()), 'utf8').digest('hex');
    expect(classifierPromptHash()).toBe(expected);
    /* -02 since WS2-07-F1: the eight phenomena now reach the classifier defined. */
    expect(CLASSIFIER_VERSION).toBe('DEVELOPMENTAL-PHENOMENON-03');
  });

  it('under sovereign mode the seam refuses and no fallback is attempted', async () => {
    const prev = process.env.MAIA_INFERENCE_MODE;
    process.env.MAIA_INFERENCE_MODE = 'sovereign';
    try {
      const r = await classifyClaims([{ text: 'x', doesNotEstablish: ['author-intent'] }], 'voice', 'claude-test-model');
      expect(r.ok ? 'ok' : r.refusal).toBe('structured_inference_unavailable');
    } finally {
      if (prev === undefined) delete process.env.MAIA_INFERENCE_MODE; else process.env.MAIA_INFERENCE_MODE = prev;
    }
  });

  it('nothing to classify is a refusal, not an empty success', async () => {
    const r = await classifyClaims([], 'voice', 'm');
    expect(r.ok ? 'ok' : r.refusal).toBe('classifier_malformed');
  });
});
