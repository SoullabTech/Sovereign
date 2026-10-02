/**
 * WRITERS-STUDIO-C15R4 — SOURCE VERIFICATION LAW
 *
 * Bibliography metadata and manuscript attribution orient research; neither
 * verifies what a source actually says. Verification requires source evidence.
 */
export type SourceVerificationStanding =
  | 'unverified'
  | 'bibliography-lead'
  | 'source-text-available'
  | 'verified'
  | 'unresolved';

export type SourceVerificationMove =
  | 'use-reviewed-source'
  | 'bring-source'
  | 'research-externally'
  | 'talk-through'
  | 'leave-unresolved';

export interface SourceVerificationContext {
  hasBibliographyLead: boolean;
  attachedSourceCount: number;
  reviewedSourceAvailable: boolean;
  verifiedEvidencePresent: boolean;
  externalResearchAvailable: boolean;
}

export interface SourceVerificationOption {
  id: SourceVerificationMove;
  label: string;
  description: string;
  available: boolean;
  requiresWriterGesture: true;
}

export function verificationStanding(
  context: SourceVerificationContext,
): SourceVerificationStanding {
  if (context.verifiedEvidencePresent) return 'verified';
  if (context.reviewedSourceAvailable) return 'source-text-available';
  if (context.hasBibliographyLead) return 'bibliography-lead';
  return 'unverified';
}

export function sourceVerificationOptions(
  context: SourceVerificationContext,
): readonly SourceVerificationOption[] {
  return [
    {
      id: 'use-reviewed-source',
      label: 'Use reviewed source text',
      description: context.reviewedSourceAvailable
        ? 'Compare the manuscript claim with source text you have already reviewed.'
        : 'No reviewed source text is currently available for this relationship.',
      available: context.reviewedSourceAvailable,
      requiresWriterGesture: true,
    },
    {
      id: 'bring-source',
      label: 'Bring the source',
      description: context.attachedSourceCount > 0
        ? 'Open Sources and choose the material that actually supports this relationship.'
        : 'Bring a book excerpt, article, scan, note, or other source material into this Work.',
      available: true,
      requiresWriterGesture: true,
    },
    {
      id: 'research-externally',
      label: context.externalResearchAvailable ? 'Research this source' : 'External research',
      description: context.externalResearchAvailable
        ? 'Commission external research for source wording, location, edition, and context. Research remains separate from manuscript prose.'
        : 'External source research is not connected in this Writer’s Studio runtime yet.',
      available: context.externalResearchAvailable,
      requiresWriterGesture: true,
    },
    {
      id: 'talk-through',
      label: 'Talk through what needs verifying',
      description: 'Clarify what the manuscript establishes, what the bibliography suggests, and what evidence is still missing.',
      available: true,
      requiresWriterGesture: true,
    },
    {
      id: 'leave-unresolved',
      label: 'Leave unresolved',
      description: 'Keep the relationship visibly uncertain without forcing a citation decision now.',
      available: true,
      requiresWriterGesture: true,
    },
  ];
}

export const SOURCE_VERIFICATION_LAW = [
  'A bibliography entry is a lead, never proof of quotation, paraphrase, derivation, or support.',
  'A manuscript naming a source establishes that the writer attributes influence or support to it; it does not establish that the source actually says what the manuscript claims.',
  'Reviewed source text may be compared with manuscript text, but verification must preserve edition/location provenance where available.',
  'External research is an explicit writer act and remains research until the writer decides what belongs in the Work.',
  'No verification act inserts a citation, rewrites bibliography, or mutates manuscript prose.',
  'Unresolved is a valid standing.',
] as const;
