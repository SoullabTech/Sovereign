import {
  SOURCE_VERIFICATION_LAW,
  sourceVerificationOptions,
  verificationStanding,
} from '@/lib/writersStudio/sourceVerification';

describe('C15R4 source verification law', () => {
  it('does not confuse bibliography metadata with verification', () => {
    expect(verificationStanding({
      hasBibliographyLead: true,
      attachedSourceCount: 0,
      reviewedSourceAvailable: false,
      verifiedEvidencePresent: false,
      externalResearchAvailable: false,
    })).toBe('bibliography-lead');

    expect(SOURCE_VERIFICATION_LAW.join(' ')).toContain(
      'A bibliography entry is a lead, never proof',
    );
  });

  it('requires source evidence before verified standing exists', () => {
    expect(verificationStanding({
      hasBibliographyLead: true,
      attachedSourceCount: 1,
      reviewedSourceAvailable: true,
      verifiedEvidencePresent: false,
      externalResearchAvailable: false,
    })).toBe('source-text-available');

    expect(verificationStanding({
      hasBibliographyLead: true,
      attachedSourceCount: 1,
      reviewedSourceAvailable: true,
      verifiedEvidencePresent: true,
      externalResearchAvailable: false,
    })).toBe('verified');
  });

  it('keeps verification paths open and writer-initiated', () => {
    const options = sourceVerificationOptions({
      hasBibliographyLead: true,
      attachedSourceCount: 0,
      reviewedSourceAvailable: false,
      verifiedEvidencePresent: false,
      externalResearchAvailable: false,
    });
    expect(options.map((option) => option.id)).toEqual([
      'use-reviewed-source',
      'bring-source',
      'research-externally',
      'talk-through',
      'leave-unresolved',
    ]);
    expect(options.find((option) => option.id === 'use-reviewed-source')?.available).toBe(false);
    expect(options.filter((option) => option.available).every((option) => option.requiresWriterGesture)).toBe(true);
  });

  it('preserves non-mutation at the verification boundary', () => {
    const law = SOURCE_VERIFICATION_LAW.join(' ');
    expect(law).toContain('No verification act inserts a citation');
    expect(law).toContain('Unresolved is a valid standing');
  });
});
