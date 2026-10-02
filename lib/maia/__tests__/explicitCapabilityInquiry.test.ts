import fs from 'node:fs';
import path from 'node:path';

import {
  KNOWN_NON_PILOT_APPROVED_NAMES as PROD_NON_PILOT_NAMES,
  PILOT_PRESENTATIONS as PROD_PRESENTATIONS,
  composePilotDescription as prodCompose,
  composeResolvedInquiry as prodComposeResolved,
  normalizeInquiry as prodNormalize,
  renderPilotDescription as prodRender,
  resolveExplicitCapabilityInquiry as prodResolve,
} from '../explicitCapabilityInquiry';

import {
  KNOWN_NON_PILOT_APPROVED_NAMES as REF_NON_PILOT_NAMES,
  PILOT_PRESENTATIONS as REF_PRESENTATIONS,
  ACCEPTED_QUERIES,
  REFUSAL_QUERIES,
} from '../../../tests/constitutional/whole-organism-orchestration/explicit-capability-inquiry/fixture';

import {
  composePilotDescription as refCompose,
  composeResolvedInquiry as refComposeResolved,
  normalizeInquiry as refNormalize,
  renderPilotDescription as refRender,
  resolveExplicitCapabilityInquiry as refResolve,
} from '../../../tests/constitutional/whole-organism-orchestration/explicit-capability-inquiry/resolver';

describe('O8R3 inert explicit-capability-inquiry source admission', () => {
  it('preserves the exact three-capability founder-authored presentation set', () => {
    expect(PROD_PRESENTATIONS).toEqual(REF_PRESENTATIONS);
  });

  it('preserves the exact known non-pilot approved-name set', () => {
    expect(PROD_NON_PILOT_NAMES).toEqual(REF_NON_PILOT_NAMES);
  });

  it('keeps the production module self-contained with zero imports', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'lib/maia/explicitCapabilityInquiry.ts'),
      'utf8',
    );
    const imports = [...source.matchAll(/^\s*import\b/gm)];
    expect(imports).toHaveLength(0);
  });

  it('keeps all semantic entry points single-input', () => {
    expect(prodNormalize.length).toBe(1);
    expect(prodResolve.length).toBe(1);
    expect(prodCompose.length).toBe(1);
    expect(prodComposeResolved.length).toBe(1);
    expect(prodRender.length).toBe(1);
  });
});
describe('O8R3 accepted-query equivalence', () => {
  it.each(ACCEPTED_QUERIES)(
    '$input',
    ({ input, capabilityId, envelope }) => {
      const prod = prodResolve(input);
      const ref = refResolve(input);

      expect(prod).toEqual(ref);
      expect(prod).toEqual({
        kind: 'DESCRIBE',
        capabilityId,
        matchedName: PROD_PRESENTATIONS.find(
          (record) => record.capabilityId === capabilityId,
        )!.name,
        envelope,
      });

      expect(prodNormalize(input)).toBe(refNormalize(input));
    },
  );
});

describe('O8R3 refusal-query equivalence', () => {
  it.each(REFUSAL_QUERIES)(
    '$input → $reason',
    ({ input, reason }) => {
      const prod = prodResolve(input);
      const ref = refResolve(input);

      expect(prod).toEqual(ref);
      expect(prod).toEqual({ kind: 'ABSTAIN', reason });
      expect(prodComposeResolved(prod)).toBeNull();
      expect(refComposeResolved(ref)).toBeNull();
    },
  );
});
describe('O8R3 deterministic composition equivalence', () => {
  it.each(PROD_PRESENTATIONS)(
    '$capabilityId',
    ({ capabilityId, name, purpose }) => {
      const prodPayload = prodCompose(capabilityId);
      const refPayload = refCompose(capabilityId);

      expect(prodPayload).toEqual(refPayload);
      expect(prodPayload).toEqual({
        kind: 'DESCRIPTION_ONLY',
        capabilityId,
        name,
        purpose,
      });

      expect(prodRender(prodPayload)).toBe(refRender(refPayload));
      expect(prodRender(prodPayload)).toBe(`${name} — ${purpose}`);
    },
  );

  it('preserves ABSTAIN → null composition', () => {
    const prod = prodResolve('I had a dream.');
    const ref = refResolve('I had a dream.');

    expect(prodComposeResolved(prod)).toBeNull();
    expect(refComposeResolved(ref)).toBeNull();
  });
});

describe('O8R3 normalization equivalence', () => {
  const corpus = [
    ' What is New Journal Entry? ',
    'WHAT DOES ASTROLOGY READING MEAN.',
    "What is Writer's Studio?",
    'What is Writer’s Studio?',
    '  what   is   record a dream  ',
    'Can I use Astrology Reading?',
  ];

  it.each(corpus)('%s', (input) => {
    expect(prodNormalize(input)).toBe(refNormalize(input));
  });
});
