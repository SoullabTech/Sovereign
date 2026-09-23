/**
 * ⭐ THE CONSTRUCTOR MUST REFUSE.
 *
 * Eight inadmissible observations, each the shape an actual reference frame
 * rendered. ⛔ If any is ADMITTED, the guarantee is decorative — a checklist
 * applied after rendering rather than a property of the object.
 *
 * ⭐ Every case is drawn from a real frame, ⛔ not invented.
 */

import { observe, type ObserveInput, type RefusalCode } from '../../../../lib/writersStudio/studio/developObservation';

const COVERAGE = { read: 34, total: 41, depth: 'reading the full text', when: 'just now' };
const base: ObserveInput = {
  id: 'x', domain: 'continuity', label: 'The river',
  description: 'The river appears in 11 of 41 chapters.',
  evidence: ['Ch 1'], returnTo: { label: 'Go to Ch 1', sectionId: 'ch-1' },
  provenance: { kind: 'textual-entity' },
};

const CASES: ReadonlyArray<{ id: string; from: string; expect: RefusalCode; input: ObserveInput }> = [
  { id: 'C1-no-evidence', from: 'Key Patterns cards — four themes, not one reference',
    expect: 'NO_EVIDENCE', input: { ...base, label: 'Change and Transition', evidence: [] } },

  { id: 'C2-no-return', from: 'theme cards whose only action was “Explore →”',
    expect: 'NO_RETURN_ADDRESS', input: { ...base, returnTo: { label: '', sectionId: '' } } },

  { id: 'C3-verdict-heading', from: '“Luminous detail” — lawful body under an unlawful label',
    expect: 'VERDICT_LANGUAGE',
    input: { ...base, label: 'Luminous detail', description: 'This section offers a vivid image.' } },

  { id: 'C4-verdict-body', from: '“Your protagonist’s inner world is growing richer.”',
    expect: 'VERDICT_LANGUAGE',
    input: { ...base, label: 'A deepening sense of self',
      description: 'Your protagonist’s inner world is growing richer.' } },

  { id: 'C5-verdict-strong', from: '“A strong spiral with five movements.”',
    expect: 'VERDICT_LANGUAGE',
    input: { ...base, label: 'Overall arc', description: 'A strong spiral structure with five movements.' } },

  { id: 'C6-cross-work-no-coverage', from: 'every lens frame making whole-Work claims with no coverage shown',
    expect: 'CROSS_WORK_WITHOUT_COVERAGE',
    input: { ...base, description: 'You address the reader in 31 of 41 chapters.', crossWork: true } },

  { id: 'C7-reader-effect-asserted', from: '“Readers will find this confusing.”',
    expect: 'READER_EFFECT_NOT_HYPOTHESIS',
    input: { ...base, domain: 'reader', label: 'Reader perspective',
      description: 'Readers lose the referent here.', doesNotEstablish: ['reader-effect'] } },

  { id: 'C8-reader-missing-non-conclusion', from: 'a hedged reader entry that forgets what it cannot establish',
    expect: 'MISSING_PERMANENT_NON_CONCLUSION',
    input: { ...base, domain: 'reader', label: 'Reader perspective',
      description: 'A reader might lose the referent here.' } },
];

const line = (s: string) => process.stdout.write(s + '\n');
let bad = 0;

line('── observe() MUST REFUSE ────────────────────────────────────────────');
for (const c of CASES) {
  const r = observe(c.input);
  if (r.ok) {
    bad += 1;
    line(`  ⛔ ADMITTED  ${c.id.padEnd(34)} expected ${c.expect}`);
    line(`              from: ${c.from}`);
  } else if (r.code !== c.expect) {
    bad += 1;
    line(`  ⚠️ WRONG     ${c.id.padEnd(34)} got ${r.code}, expected ${c.expect}`);
  } else {
    line(`  REFUSED     ${c.id.padEnd(34)} ${r.code}`);
  }
}

/* ⭐ And the conforming case must be ADMITTED — otherwise the constructor is
   merely strict, ⛔ not discriminating. */
const good = observe({ ...base, crossWork: true, coverage: COVERAGE });
line('');
line(`  ${good.ok ? 'ADMITTED' : '⛔ REFUSED'}    conforming observation${good.ok ? '' : ` — ${good.code}`}`);
if (!good.ok) bad += 1;

line('');
line(`  verdict     ${bad === 0 ? 'CONSTRUCTOR IS LETHAL + DISCRIMINATING' : `⛔ ${bad} FAILING`}`);
process.exit(bad === 0 ? 0 : 1);
