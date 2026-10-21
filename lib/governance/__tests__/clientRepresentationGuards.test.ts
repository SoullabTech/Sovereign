/**
 * Client Representation Guards — enforcement-decision proof (the three-stage gate).
 * Pins the constitutional decisions the route layer relies on, with no DB.
 *
 * Spec: docs/specs/CLIENT_REPRESENTATION_GOVERNANCE_PATCH_2026-06-25.md
 */
import {
  deriveAuthorship,
  mayProduceRepresentation,
  representationRefusal,
  maySurfaceRepresentation,
  consentSnapshot,
} from '../clientRepresentationGuards';

describe('deriveAuthorship — first-class provenance from source FKs', () => {
  it('review candidate ⇒ maia_inferred', () => {
    expect(deriveAuthorship({ sourceCandidateId: 'c1' })).toBe('maia_inferred');
  });
  it('review lens ⇒ maia_inferred', () => {
    expect(deriveAuthorship({ reviewLensId: 'lens-shadow' })).toBe('maia_inferred');
  });
  it('source note only ⇒ practitioner_authored', () => {
    expect(deriveAuthorship({ sourceNoteId: 'n1' })).toBe('practitioner_authored');
  });
  it('unknown origin ⇒ maia_inferred (conservative — held)', () => {
    expect(deriveAuthorship({})).toBe('maia_inferred');
  });
  it('note + candidate ⇒ maia_inferred (MAIA origin wins)', () => {
    expect(deriveAuthorship({ sourceNoteId: 'n1', sourceCandidateId: 'c1' })).toBe('maia_inferred');
  });
});

describe('mayProduceRepresentation — generate/persist policy', () => {
  it('private ⇒ refuse (no MAIA-authored client representations, with or without consent)', () => {
    expect(mayProduceRepresentation('private', null)).toBe(false);
    expect(mayProduceRepresentation('private', new Date('2026-06-01'))).toBe(false);
  });
  it('consent_based without captured consent ⇒ refuse', () => {
    expect(mayProduceRepresentation('consent_based', null)).toBe(false);
  });
  it('consent_based with captured consent ⇒ allow', () => {
    expect(mayProduceRepresentation('consent_based', new Date('2026-06-01'))).toBe(true);
  });
  it('transparent ⇒ allow (later persist/surface gates still apply)', () => {
    expect(mayProduceRepresentation('transparent', null)).toBe(true);
  });
});

describe('representationRefusal — refusal code or null', () => {
  it('private ⇒ REPRESENTATION_NOT_PERMITTED', () => {
    expect(representationRefusal('private', null)?.code).toBe('REPRESENTATION_NOT_PERMITTED');
  });
  it('consent_based without consent ⇒ CONSENT_REQUIRED', () => {
    expect(representationRefusal('consent_based', null)?.code).toBe('CONSENT_REQUIRED');
  });
  it('permitted (transparent / consent satisfied) ⇒ null', () => {
    expect(representationRefusal('transparent', null)).toBeNull();
    expect(representationRefusal('consent_based', new Date('2026-06-01'))).toBeNull();
  });
});

describe('maySurfaceRepresentation — surface gate (the held-by-default rule)', () => {
  it('HELD: maia_inferred + crossing_allowed=false ⇒ withhold', () => {
    expect(maySurfaceRepresentation({ authorship: 'maia_inferred', crossingAllowed: false, privacyMode: 'private', consentCapturedAt: null })).toBe(false);
  });
  it('maia_suggested + crossing_allowed=false ⇒ withhold (MAIA-originated)', () => {
    expect(maySurfaceRepresentation({ authorship: 'maia_suggested', crossingAllowed: false, privacyMode: 'private', consentCapturedAt: null })).toBe(false);
  });
  it('maia_inferred + crossing_allowed=true (transparent) ⇒ surface', () => {
    expect(maySurfaceRepresentation({ authorship: 'maia_inferred', crossingAllowed: true, privacyMode: 'transparent', consentCapturedAt: null })).toBe(true);
  });
  it('private withholds maia_* even when crossing_allowed (mode-transition edge)', () => {
    expect(maySurfaceRepresentation({ authorship: 'maia_inferred', crossingAllowed: true, privacyMode: 'private', consentCapturedAt: null })).toBe(false);
  });
  it("practitioner_authored ⇒ surfaces even with crossing_allowed=false (the practitioner's own note)", () => {
    expect(maySurfaceRepresentation({ authorship: 'practitioner_authored', crossingAllowed: false, privacyMode: 'private', consentCapturedAt: null })).toBe(true);
  });
  it('consent floor overrides everything: consent_based + no consent ⇒ withhold even practitioner_authored', () => {
    expect(maySurfaceRepresentation({ authorship: 'practitioner_authored', crossingAllowed: true, privacyMode: 'consent_based', consentCapturedAt: null })).toBe(false);
  });
  it('consent_based + consent captured + crossing allowed ⇒ surface', () => {
    expect(maySurfaceRepresentation({ authorship: 'maia_inferred', crossingAllowed: true, privacyMode: 'consent_based', consentCapturedAt: new Date('2026-06-01') })).toBe(true);
  });
});

describe('consentSnapshot — durable write-time stamp', () => {
  it('captures basis + ISO timestamp', () => {
    expect(consentSnapshot('consent_based', new Date('2026-06-01T00:00:00Z'))).toEqual({
      consent_basis: 'consent_based',
      consent_at_write: '2026-06-01T00:00:00.000Z',
    });
  });
  it('null consent ⇒ null timestamp, basis preserved', () => {
    expect(consentSnapshot('private', null)).toEqual({ consent_basis: 'private', consent_at_write: null });
  });
});
