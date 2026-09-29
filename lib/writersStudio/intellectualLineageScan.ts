/**
 * WRITERS-STUDIO-C15R1 — full-manuscript intellectual-lineage scan contract.
 *
 * The scan produces CANDIDATES only. It never inserts citations, rewrites a
 * bibliography, edits prose, or upgrades a possible relationship into an
 * established one.
 */
import type {
  IntellectualRelationshipKind,
  IntellectualRelationshipStanding,
} from './intellectualLineage';

export interface BibliographyEntry {
  key: string;
  chapterLabel: string;
  raw: string;
}

export interface LineageScanSection {
  sectionId: string;
  position: number;
  heading: string | null;
  body: string;
}

export interface LineageCandidate {
  id: string;
  kind: IntellectualRelationshipKind;
  standing: IntellectualRelationshipStanding;
  statement: string;
  manuscriptSectionIds: readonly string[];
  bibliographyKeys: readonly string[];
  why: string;
  uncertainty: string | null;
}

export interface IntellectualLineageScan {
  manuscriptId: string;
  revisionNumber: number;
  scannedSectionIds: readonly string[];
  bibliographyEntries: readonly BibliographyEntry[];
  candidates: readonly LineageCandidate[];
}

export const LINEAGE_SCAN_SYSTEM = [
  'You are MAIA reading an existing manuscript for intellectual lineage and citation/provenance questions.',
  'The manuscript is the primary textual field. Bibliography entries are supporting reference records, not proof that a passage derives from them.',
  'Distinguish: writer-original, source-derived-claim, quotation, paraphrase, writer-synthesis, uncertain-attribution.',
  'Every candidate must name exact manuscript section ids and zero or more bibliography entry keys.',
  'Use evidenced-in-manuscript only when manuscript text actually exists at the cited section ids.',
  'A bibliography match does not establish derivation by itself.',
  'Do not invent sources, quotations, page numbers, publication facts, or author intentions.',
  'Do not insert citation text, rewrite bibliography entries, or propose manuscript edits.',
  'If a relationship is plausible but not established, use uncertain-attribution and say why it remains uncertain.',
  'Writer synthesis means multiple ideas are visibly brought together in the manuscript; it does not mean the writer owns the underlying source ideas.',
].join('\n');
