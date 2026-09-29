/**
 * WRITERS-STUDIO-WORK-MATURITY-LAW-01
 *
 * Two axes on purpose:
 *   observedExtent — what text actually exists; system-observable.
 *   declaredState  — what kind of manuscript the writer says this is.
 *
 * ⛔ Text volume never declares completion.
 * ⛔ A plan is never manuscript evidence.
 */
export type ObservedTextExtent = 'none' | 'some' | 'substantial';
export type DeclaredManuscriptState =
  | 'pre-manuscript'
  | 'partial-manuscript'
  | 'existing-manuscript';

export interface WorkMaturity {
  observedExtent: ObservedTextExtent;
  declaredState: DeclaredManuscriptState | null;
  writtenSectionIds: readonly string[];
  emptySectionIds: readonly string[];
  totalCharacters: number;
}

export interface MaturitySection {
  draftSectionId: string;
  body: string;
}

const SUBSTANTIAL_CHARS = 40_000;

export function observeTextExtent(
  sections: readonly MaturitySection[],
): Omit<WorkMaturity, 'declaredState'> {
  const writtenSectionIds: string[] = [];
  const emptySectionIds: string[] = [];
  let totalCharacters = 0;

  for (const section of sections) {
    const text = section.body.trim();
    if (text) {
      writtenSectionIds.push(section.draftSectionId);
      totalCharacters += text.length;
    } else {
      emptySectionIds.push(section.draftSectionId);
    }
  }

  const observedExtent: ObservedTextExtent =
    totalCharacters === 0 ? 'none'
      : totalCharacters >= SUBSTANTIAL_CHARS ? 'substantial'
        : 'some';

  return { observedExtent, writtenSectionIds, emptySectionIds, totalCharacters };
}

export type ManuscriptClaimMode =
  | 'no-manuscript-claims'
  | 'existing-text-only'
  | 'whole-existing-manuscript';

export function manuscriptClaimMode(maturity: WorkMaturity): ManuscriptClaimMode {
  if (maturity.declaredState === 'pre-manuscript' || maturity.observedExtent === 'none') {
    return 'no-manuscript-claims';
  }
  if (maturity.declaredState === 'partial-manuscript' || maturity.declaredState === null) {
    return 'existing-text-only';
  }
  return 'whole-existing-manuscript';
}
