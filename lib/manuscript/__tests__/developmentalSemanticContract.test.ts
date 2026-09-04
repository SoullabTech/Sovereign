/**
 * WS2-07-F1 — the semantic contract, falsified without a model.
 *
 * The founder's ruling (2026-09-04, determination C) is that both model acts
 * were underdefined at runtime: the 07B reader received a bare lens token and
 * the 07C classifier received eight bare phenomenon labels, so each supplied
 * semantics from the words themselves at exactly the boundary where
 * reproducibility is required.
 *
 * These tests prove the DEFINITIONS ARE RENDERED and the separations hold.
 * They deliberately prove nothing about what a model then does with them —
 * that is the live witness's job, and a structural test that depended on
 * stochastic behaviour would be neither.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  DEVELOPMENTAL_LENSES, LENS_MEANING, LENS_RIDER,
} from '../developmentalReader/contract';
import {
  READER_SYSTEM, READER_VERSION, promptContractHash, renderRequest,
} from '../developmentalReader/render';
import { evidenceAtRev1 } from '../development/__tests__/fixture';
import { recoverEvidence } from '../development/resolve';
import type { RecoveredBody } from '../developmentalReader/contract';
import {
  DEVELOPMENTAL_PHENOMENA, PHENOMENON_DEFINITION, PHENOMENON_LABEL,
} from '../developmentalReading/contract';
import { CLASSIFIER_SYSTEM, CLASSIFIER_VERSION, classifierTool } from '../developmentalReading/classify';

const ROOT = join(__dirname, '..', '..', '..');

/** Compare meaning, not typography: emphasis, dash style and spacing differ between prose and prompt. */
const norm = (s: string) => s
  .replace(/\*\*?/g, '')
  .replace(/[—–‐-‒]/g, '-')
  .replace(/[‘’]/g, "'")
  .replace(/\s+/g, ' ')
  .toLowerCase()
  .trim();

function renderedRequest(lens: (typeof DEVELOPMENTAL_LENSES)[number]): string {
  const { revision, evidence } = evidenceAtRev1({ withStructure: true });
  const recovered: RecoveredBody[] = ['s0', 's1'].map((sectionId) => {
    const r = recoverEvidence({ kind: 'section', sectionId }, evidence.readState, revision.content);
    if (!r.ok || r.value.kind !== 'text') throw new Error('fixture');
    return r.value;
  });
  return renderRequest({ commissionedLens: lens, evidence, recovered });
}

describe('the lens meanings are the capability spec\'s, and they reach the reader', () => {
  it('every one of the seven is quoted from DEVELOPMENTAL_EDITOR_CAPABILITY, not authored here', () => {
    const spec = norm(readFileSync(join(ROOT, 'docs', 'programme', 'DEVELOPMENTAL_EDITOR_CAPABILITY.md'), 'utf8'));
    for (const lens of DEVELOPMENTAL_LENSES) {
      expect(`${lens} in the capability spec: ${spec.includes(norm(LENS_MEANING[lens]))}`)
        .toBe(`${lens} in the capability spec: true`);
    }
  });

  it('the commissioned lens reaches the reader WITH its meaning, and only that lens', () => {
    for (const lens of DEVELOPMENTAL_LENSES) {
      const req = renderedRequest(lens);
      expect(req).toContain(`COMMISSIONED LENS: ${lens}`);
      expect(req).toContain(LENS_MEANING[lens]);
      for (const other of DEVELOPMENTAL_LENSES) {
        if (other === lens) continue;
        expect(`${lens} request leaks ${other}'s meaning: ${req.includes(LENS_MEANING[other])}`)
          .toBe(`${lens} request leaks ${other}'s meaning: false`);
      }
    }
  });

  it('the two riders ride: development may not infer abandonment; arc is scope-sensitive', () => {
    expect(LENS_RIDER.development).toMatch(/abandoned.*INTERPRETATION/s);
    expect(renderedRequest('development')).toContain(LENS_RIDER.development!);
    expect(LENS_RIDER.arc).toMatch(/scope-sensitive/);
    expect(renderedRequest('arc')).toContain(LENS_RIDER.arc!);
    /* A lens with no rider gets no Note line at all — no empty ceremony. */
    expect(renderedRequest('voice')).not.toMatch(/COMMISSIONED LENS: voice[\s\S]{0,400}?\n  Note:/);
  });
});

describe('the reader boundary — mechanical measurement is not a claim (WS2-07-F1 requirement 6)', () => {
  it('the rule is in the reader\'s system prompt and names every container measurement the Lantern Road claim used', () => {
    const rule = READER_SYSTEM.split('\n').find((l) => l.startsWith('3.')) ?? '';
    expect(rule).toMatch(/may NOT consist solely of content that can be re-derived mechanically/);
    for (const measurement of ['Counts', 'lengths', 'positions', 'heading format', 'topology', 'how many sections a division holds']) {
      expect(`rule 3 names ${measurement}: ${rule.includes(measurement)}`).toBe(`rule 3 names ${measurement}: true`);
    }
    /* Measurements may still SUPPORT a noticing — UNDERSTAND's own worked example depends on it. */
    expect(rule).toMatch(/may SUPPORT a noticing; they may not BE the noticing/);
  });

  it('the rule survives renumbering: the system prompt still carries all seven rules, in order', () => {
    const numbers = READER_SYSTEM.split('\n').filter((l) => /^\d+\./.test(l)).map((l) => l.split('.')[0]);
    expect(numbers).toEqual(['1', '2', '3', '4', '5', '6', '7']);
  });
});

describe('lens and phenomenon stay independent vocabularies (UNDERSTAND §4)', () => {
  it('the READER is never given the phenomenon taxonomy — not in its prompt, not in any request', () => {
    const surfaces: [string, string][] = [['READER_SYSTEM', READER_SYSTEM],
      ...DEVELOPMENTAL_LENSES.map((l) => [`request(${l})`, renderedRequest(l)] as [string, string])];
    for (const [name, text] of surfaces) {
      for (const p of DEVELOPMENTAL_PHENOMENA) {
        expect(`${name} names phenomenon ${p}: ${text.includes(p) || text.includes(PHENOMENON_LABEL[p])}`)
          .toBe(`${name} names phenomenon ${p}: false`);
      }
    }
  });

  it('the CLASSIFIER is never given the lens meanings, and is told the lens does not decide', () => {
    for (const lens of DEVELOPMENTAL_LENSES) {
      expect(`classifier carries ${lens}'s meaning: ${CLASSIFIER_SYSTEM.includes(LENS_MEANING[lens])}`)
        .toBe(`classifier carries ${lens}'s meaning: false`);
    }
    expect(CLASSIFIER_SYSTEM).toMatch(/The lens is context, not the answer/);
    expect(CLASSIFIER_SYSTEM).toMatch(/NOT given the manuscript/);
  });
});

describe('the eight phenomenon definitions reach the classifier', () => {
  it('every phenomenon renders with its IS and its IS NOT', () => {
    expect(DEVELOPMENTAL_PHENOMENA).toHaveLength(8);
    for (const p of DEVELOPMENTAL_PHENOMENA) {
      const d = PHENOMENON_DEFINITION[p];
      expect(`${p} has a definition: ${d.is.length > 0 && d.isNot.length > 0}`).toBe(`${p} has a definition: true`);
      expect(`${p} IS rendered: ${CLASSIFIER_SYSTEM.includes(d.is)}`).toBe(`${p} IS rendered: true`);
      expect(`${p} IS NOT rendered: ${CLASSIFIER_SYSTEM.includes(d.isNot)}`).toBe(`${p} IS NOT rendered: true`);
      expect(CLASSIFIER_SYSTEM).toContain(`("${p}")`);
    }
  });

  it('positional-asymmetry excludes uniformity and container measurement — the Lantern Road regression, structurally', () => {
    const d = PHENOMENON_DEFINITION['positional-asymmetry'];
    expect(d.is).toMatch(/UNEVENLY DISTRIBUTED across comparable positions or member-authored divisions/);
    expect(d.isNot).toMatch(/uniformity or regularity/);
    expect(d.isNot).toMatch(/heading format, section lengths, counts, or how many sections a division holds/);
    /* And the classifier is told the same thing once more, as a closing rule. */
    expect(CLASSIFIER_SYSTEM).toMatch(/whole content is a MEASUREMENT of the container[\s\S]*notices no phenomenon in this family/);
  });

  it('the precedence rules for the two real overlaps are rendered', () => {
    expect(CLASSIFIER_SYSTEM).toMatch(/WHEN TWO COULD APPLY, the more specific one wins/);
    expect(CLASSIFIER_SYSTEM).toMatch(/Choose "register-shift" if the claim's content is FULLY EXPRESSED by the change in the manner of telling/);
    expect(CLASSIFIER_SYSTEM).toMatch(/Movement is change THROUGH a sequence\. Positional asymmetry is uneven DISTRIBUTION ACROSS positions/);
  });

  it('unclassifiable and refuse-to-stretch are untouched — the fail-closed behaviour the ruling preserved', () => {
    expect(CLASSIFIER_SYSTEM).toMatch(/answer "unclassifiable" for that claim/);
    expect(CLASSIFIER_SYSTEM).toMatch(/Do not stretch a category to fit\. Do not invent one\./);
    const schema = JSON.stringify(classifierTool().input_schema);
    expect(schema).toContain('"unclassifiable"');
    for (const p of DEVELOPMENTAL_PHENOMENA) expect(schema).toContain(`"${p}"`);
    /* The tool did not grow a way to express a ninth category or a partial answer. */
    expect(JSON.parse(schema).properties.classifications.items.properties.phenomenon.enum).toHaveLength(9);
  });
});

describe('provenance moved because the semantic contract moved', () => {
  it('both versions are bumped to -02, and the hashes are over the new text', () => {
    expect(READER_VERSION).toBe('DEVELOPMENTAL-READER-02');
    expect(CLASSIFIER_VERSION).toBe('DEVELOPMENTAL-PHENOMENON-02');
    expect(promptContractHash()).toHaveLength(64);
  });

  it('a reading frozen before the repair stays readable: the version is provenance, never a filter', () => {
    /* Nothing in the reading unit compares a version against a constant — an
       older reading is historical fact, not an invalid one. */
    const src = ['contract.ts', 'freeze.ts', 'store.ts', 'assess.ts', 'commission.ts']
      .map((f) => readFileSync(join(ROOT, 'lib', 'manuscript', 'developmentalReading', f), 'utf8')).join('\n');
    expect(/readerVersion\s*===|classifierVersion\s*===/.test(src)).toBe(false);
  });
});
