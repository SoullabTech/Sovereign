import type { IntellectualRelationshipKind } from './intellectualLineage';
import type { BibliographyEntry } from './intellectualLineageScan';

export interface ChapterLineageCandidate {
  id: string;
  kind: IntellectualRelationshipKind;
  statement: string;
  sectionIds: readonly string[];
  bibliographyKeys: readonly string[];
  why: string;
  uncertainty: string | null;
}

export interface ChapterLineageScan {
  manuscriptId: string;
  revisionNumber: number;
  chapterRootId: string;
  chapterHeading: string;
  sectionIds: readonly string[];
  bibliographyEntries: readonly BibliographyEntry[];
  candidates: readonly ChapterLineageCandidate[];
  questionsToInvestigate: readonly string[];
}

export const CHAPTER_LINEAGE_SYSTEM = [
  'You are MAIA investigating intellectual lineage inside ONE manuscript chapter while retaining whole-book context.',
  'The chapter prose is primary evidence. Whole-book observations are orientation only and do not substitute for chapter text.',
  'Distinguish writer-original, source-derived-claim, quotation, paraphrase, writer-synthesis, and uncertain-attribution.',
  'Return only the strongest 4 to 12 candidates that materially help the writer understand this chapter. Do not attempt exhaustive cataloguing in one pass.',
  'Every candidate must point to exact supplied section ids.',
  'A bibliography entry is a lead, not proof of derivation.',
  'If exact source wording is not supplied, do not assert that a paraphrase matches the source; mark uncertainty and frame the next research question.',
  'Do not invent page numbers, source wording, publication facts, or author intentions.',
  'Do not insert citations, rewrite prose, or edit bibliography.',
  'Preserve relationships to the whole Work: say when a chapter issue appears to connect to a wider manuscript pattern, but do not treat orientation notes as textual evidence.',
].join('\n');

export function validChapterLineageScan(value: unknown): value is ChapterLineageScan {
  if (!value || typeof value !== 'object') return false;
  const v = value as any;
  if (
    typeof v.manuscriptId !== 'string'
    || !Number.isInteger(v.revisionNumber)
    || typeof v.chapterRootId !== 'string'
    || typeof v.chapterHeading !== 'string'
    || !Array.isArray(v.sectionIds)
    || !v.sectionIds.every((id: unknown) => typeof id === 'string')
    || !Array.isArray(v.bibliographyEntries)
    || !Array.isArray(v.candidates)
    || !Array.isArray(v.questionsToInvestigate)
  ) return false;

  return v.candidates.every((candidate: unknown) => {
    if (!candidate || typeof candidate !== 'object') return false;
    const c = candidate as any;
    return typeof c.id === 'string'
      && typeof c.kind === 'string'
      && typeof c.statement === 'string'
      && Array.isArray(c.sectionIds)
      && c.sectionIds.every((id: unknown) => typeof id === 'string')
      && Array.isArray(c.bibliographyKeys)
      && c.bibliographyKeys.every((key: unknown) => typeof key === 'string')
      && typeof c.why === 'string'
      && (c.uncertainty === null || typeof c.uncertainty === 'string');
  });
}
