/**
 * WRITERS-STUDIO-C15 — intellectual lineage contract.
 *
 * Relationship kind and relationship standing are independent.
 * A source can be relevant before prose exists without being falsely described
 * as evidence for text that has not been written.
 */
import type {
  DeclaredManuscriptState,
  WorkMaturity,
} from './workMaturity';

export type IntellectualRelationshipKind =
  | 'writer-original'
  | 'source-derived-claim'
  | 'quotation'
  | 'paraphrase'
  | 'writer-synthesis'
  | 'uncertain-attribution';

export type IntellectualRelationshipStanding =
  | 'evidenced-in-manuscript'
  | 'relevant-to-planned-work'
  | 'prospective-research-direction'
  | 'unresolved';

export type LineageSourceRef =
  | { type: 'source-upload'; sourceId: string; label: string }
  | { type: 'bibliography-entry'; key: string; label: string }
  | { type: 'external-research'; url: string; label: string };

export interface ManuscriptLocus {
  sectionId: string;
  codePointStart?: number;
  codePointEnd?: number;
}

export interface IntellectualLineageItem {
  id: string;
  kind: IntellectualRelationshipKind;
  standing: IntellectualRelationshipStanding;
  statement: string;
  manuscriptLoci: readonly ManuscriptLocus[];
  sourceRefs: readonly LineageSourceRef[];
  notes: string | null;
  provenance: 'member-declared' | 'maia-candidate' | 'research-supported';
}

export type LineageValidation =
  | { ok: true }
  | { ok: false; reason: string };

function hasLocus(item: IntellectualLineageItem): boolean {
  return item.manuscriptLoci.length > 0;
}

export function validateLineageItem(
  item: IntellectualLineageItem,
  maturity: WorkMaturity,
): LineageValidation {
  if (!item.id || !item.statement.trim()) {
    return { ok: false, reason: 'lineage_item_incomplete' };
  }

  if (
    item.kind !== 'writer-original'
    && item.kind !== 'uncertain-attribution'
    && item.sourceRefs.length === 0
  ) {
    return { ok: false, reason: 'source_relationship_requires_source' };
  }

  if (item.standing === 'evidenced-in-manuscript') {
    if (!hasLocus(item)) return { ok: false, reason: 'manuscript_evidence_requires_locus' };
    if (maturity.observedExtent === 'none' || maturity.declaredState === 'pre-manuscript') {
      return { ok: false, reason: 'no_manuscript_evidence_before_manuscript' };
    }
  }

  if (
    (item.standing === 'relevant-to-planned-work'
      || item.standing === 'prospective-research-direction')
    && item.provenance === 'research-supported'
    && item.manuscriptLoci.length > 0
  ) {
    return { ok: false, reason: 'prospective_relationship_must_not_pose_as_written' };
  }

  return { ok: true };
}

export function allowedStandingsFor(
  state: DeclaredManuscriptState | null,
): readonly IntellectualRelationshipStanding[] {
  switch (state) {
    case 'pre-manuscript':
      return ['prospective-research-direction', 'unresolved'];
    case 'partial-manuscript':
      return [
        'evidenced-in-manuscript',
        'relevant-to-planned-work',
        'prospective-research-direction',
        'unresolved',
      ];
    case 'existing-manuscript':
      return [
        'evidenced-in-manuscript',
        'prospective-research-direction',
        'unresolved',
      ];
    default:
      return [
        'evidenced-in-manuscript',
        'relevant-to-planned-work',
        'prospective-research-direction',
        'unresolved',
      ];
  }
}
