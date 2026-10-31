/**
 * FG10 — source-exact own-chart relational inquiry.
 *
 * This is not synastry, a compatibility score, a diagnostic, a prediction,
 * or a representation of another person's chart. Only previously validated
 * in-memory natal data may enter; absent data stays absent.
 */
import { createProResearchSnapshot, type ResearchAspect } from './proResearchSnapshot';

export const RELATIONAL_ANCHORS = [
  { name: 'Moon', question: 'What helps me name a need without making someone else responsible for guessing it?' },
  { name: 'Venus', question: 'What do I value in reciprocity, affection, pleasure and shared choices?' },
  { name: 'Mars', question: 'How do I notice initiative, disagreement, boundaries and repair?' },
  { name: 'Mercury', question: 'How can I listen and communicate without treating my interpretation as someone else’s intention?' },
  { name: 'Saturn', question: 'What agreements and responsibilities make relationships sustainable over time?' },
] as const;

export interface RelationalAnchor {
  name: string;
  sign: string;
  degree: number;
  reportedHouse: number;
  motion: string;
  question: string;
}

export interface OwnChartRelationshipLens {
  anchors: RelationalAnchor[];
  reportedAspects: ResearchAspect[];
  incompleteAnchorCount: number;
  sourceNote: string;
  ownChartOnly: true;
  partnerComparisonEnabled: false;
}

/**
 * Reuses the existing chart-shape validation and the calculator's original
 * aspect list. Never fabricates placements, scores, partner consent, or aspects.
 */
export function createProRelationshipLens(chart: unknown): OwnChartRelationshipLens | null {
  const snapshot = createProResearchSnapshot(chart);
  if (!snapshot) return null;
  const anchors = RELATIONAL_ANCHORS.flatMap(definition => {
    const position = snapshot.positions.find(p => p.name === definition.name);
    if (!position) return [];
    return [{
      name: definition.name,
      sign: position.zodiacSign,
      degree: position.zodiacDegree,
      reportedHouse: position.calculatedHouse,
      motion: position.motion,
      question: definition.question,
    }];
  });
  const anchorNames = new Set<string>(RELATIONAL_ANCHORS.map(def => def.name));
  const reportedAspects = snapshot.aspects.filter(aspect =>
    anchorNames.has(aspect.planet1) || anchorNames.has(aspect.planet2)
  ).slice(0, 10);
  return {
    anchors,
    reportedAspects,
    incompleteAnchorCount: RELATIONAL_ANCHORS.length - anchors.length,
    sourceNote: 'Only calculator-reported own-chart facts. No independent astronomical certification.',
    ownChartOnly: true,
    partnerComparisonEnabled: false,
  };
}
