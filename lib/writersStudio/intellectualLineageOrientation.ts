import type { BibliographyEntry } from './intellectualLineageScan';

export interface IntellectualTerrain {
  id: string;
  label: string;
  description: string;
  chapterSectionIds: readonly string[];
  bibliographyKeys: readonly string[];
  uncertainty: string | null;
}

export interface IntellectualLineageOrientation {
  manuscriptId: string;
  revisionNumber: number;
  readingIds: readonly string[];
  bibliographyEntries: readonly BibliographyEntry[];
  terrains: readonly IntellectualTerrain[];
  questionsToInvestigate: readonly string[];
}

export const LINEAGE_ORIENTATION_SYSTEM = [
  'You are MAIA orienting to the intellectual field of an existing manuscript before local source/citation analysis.',
  'You are given whole-manuscript developmental observations, the manuscript section headings/ids, and bibliography entries.',
  'Your task is MACRO ORIENTATION only: identify 3 to 6 broad intellectual terrains, recurring source families, conceptual conversations, and places worth investigating. Depth belongs to later chapter investigation, not this pass.',
  'Do not claim that a manuscript passage derives from a source merely because the source appears in the bibliography.',
  'Do not classify exact wording as quotation or paraphrase in this macro pass.',
  'Do not invent page numbers, sources, bibliography entries, author intentions, or unseen text.',
  'Each terrain may point to chapter/root section ids and bibliography keys as places to investigate next.',
  'State uncertainty explicitly.',
  'End with useful questions for deeper chapter-level investigation.',
  'Do not edit manuscript prose or bibliography.',
].join('\n');

export function validIntellectualLineageOrientation(
  value: unknown,
): value is IntellectualLineageOrientation {
  if (!value || typeof value !== 'object') return false;
  const v = value as any;
  if (
    typeof v.manuscriptId !== 'string'
    || !Number.isInteger(v.revisionNumber)
    || !Array.isArray(v.readingIds)
    || !v.readingIds.every((id: unknown) => typeof id === 'string')
    || !Array.isArray(v.bibliographyEntries)
    || !Array.isArray(v.terrains)
    || !Array.isArray(v.questionsToInvestigate)
    || !v.questionsToInvestigate.every((q: unknown) => typeof q === 'string')
  ) return false;

  return v.terrains.every((terrain: unknown) => {
    if (!terrain || typeof terrain !== 'object') return false;
    const t = terrain as any;
    return typeof t.id === 'string'
      && typeof t.label === 'string'
      && typeof t.description === 'string'
      && Array.isArray(t.chapterSectionIds)
      && t.chapterSectionIds.every((id: unknown) => typeof id === 'string')
      && Array.isArray(t.bibliographyKeys)
      && t.bibliographyKeys.every((key: unknown) => typeof key === 'string')
      && (t.uncertainty === null || typeof t.uncertainty === 'string');
  });
}
