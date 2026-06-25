/**
 * Env-independent proof mirror of lib/governance/__tests__/clientRepresentationGuards.test.ts
 * (jest toolchain not installed here). Same assertions, same real guards, via node:assert.
 *   node --experimental-strip-types scripts/repro/client_representation_guard_proof.mts
 */
import assert from 'node:assert/strict';
import {
  deriveAuthorship,
  mayProduceRepresentation,
  representationRefusal,
  maySurfaceRepresentation,
  consentSnapshot,
} from '../../lib/governance/clientRepresentationGuards.ts';

let passed = 0;
const check = (name: string, fn: () => void) => { fn(); passed++; console.log(`  ✓ ${name}`); };

check('deriveAuthorship: candidate/lens ⇒ maia_inferred; note-only ⇒ practitioner; unknown ⇒ maia', () => {
  assert.equal(deriveAuthorship({ sourceCandidateId: 'c' }), 'maia_inferred');
  assert.equal(deriveAuthorship({ reviewLensId: 'l' }), 'maia_inferred');
  assert.equal(deriveAuthorship({ sourceNoteId: 'n' }), 'practitioner_authored');
  assert.equal(deriveAuthorship({}), 'maia_inferred');
  assert.equal(deriveAuthorship({ sourceNoteId: 'n', sourceCandidateId: 'c' }), 'maia_inferred');
});

check('mayProduce: private REFUSES; consent_based needs consent; transparent allowed', () => {
  assert.equal(mayProduceRepresentation('private', null), false);          // private = no representation
  assert.equal(mayProduceRepresentation('private', new Date('2026-06-01')), false);
  assert.equal(mayProduceRepresentation('consent_based', null), false);
  assert.equal(mayProduceRepresentation('consent_based', new Date('2026-06-01')), true);
  assert.equal(mayProduceRepresentation('transparent', null), true);
});

check('representationRefusal: private→NOT_PERMITTED; consent_based(no consent)→CONSENT_REQUIRED; else null', () => {
  assert.equal(representationRefusal('private', null)?.code, 'REPRESENTATION_NOT_PERMITTED');
  assert.equal(representationRefusal('consent_based', null)?.code, 'CONSENT_REQUIRED');
  assert.equal(representationRefusal('consent_based', new Date('2026-06-01')), null);
  assert.equal(representationRefusal('transparent', null), null);
});

check('maySurface: maia_* held unless crossing_allowed; practitioner_authored surfaces', () => {
  assert.equal(maySurfaceRepresentation({ authorship: 'maia_inferred', crossingAllowed: false, privacyMode: 'private', consentCapturedAt: null }), false);
  assert.equal(maySurfaceRepresentation({ authorship: 'maia_suggested', crossingAllowed: false, privacyMode: 'private', consentCapturedAt: null }), false);
  assert.equal(maySurfaceRepresentation({ authorship: 'maia_inferred', crossingAllowed: true, privacyMode: 'transparent', consentCapturedAt: null }), true);
  assert.equal(maySurfaceRepresentation({ authorship: 'practitioner_authored', crossingAllowed: false, privacyMode: 'private', consentCapturedAt: null }), true);
});

check('maySurface: consent floor overrides everything (consent_based + no consent ⇒ withhold)', () => {
  assert.equal(maySurfaceRepresentation({ authorship: 'practitioner_authored', crossingAllowed: true, privacyMode: 'consent_based', consentCapturedAt: null }), false);
  assert.equal(maySurfaceRepresentation({ authorship: 'maia_inferred', crossingAllowed: true, privacyMode: 'consent_based', consentCapturedAt: new Date('2026-06-01') }), true);
});

check('maySurface: private withholds maia_* even when crossing_allowed (mode-transition edge)', () => {
  assert.equal(maySurfaceRepresentation({ authorship: 'maia_inferred', crossingAllowed: true, privacyMode: 'private', consentCapturedAt: null }), false);
  assert.equal(maySurfaceRepresentation({ authorship: 'maia_suggested', crossingAllowed: true, privacyMode: 'private', consentCapturedAt: null }), false);
  assert.equal(maySurfaceRepresentation({ authorship: 'practitioner_authored', crossingAllowed: false, privacyMode: 'private', consentCapturedAt: null }), true); // own note still surfaces
});

check('consentSnapshot: basis + ISO timestamp / null', () => {
  assert.deepEqual(consentSnapshot('consent_based', new Date('2026-06-01T00:00:00Z')), { consent_basis: 'consent_based', consent_at_write: '2026-06-01T00:00:00.000Z' });
  assert.deepEqual(consentSnapshot('private', null), { consent_basis: 'private', consent_at_write: null });
});

console.log(`\nCLIENT-REPRESENTATION GUARD PROOF: ${passed}/7 green — private-refuses + private-withholds-surface + consent floor + held-by-default + provenance.`);
