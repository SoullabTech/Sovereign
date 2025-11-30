import { normalizeText } from './schema';

export function validateRetrievalLeakage(
  answer: string,
  context: any
): {
  ok: boolean;
  score: number;
  referencedContext: boolean;
  details: string;
} {
  if (!context || !context.facet) {
    return {
      ok: true,
      score: 1,
      referencedContext: false,
      details: 'No context provided to check against'
    };
  }

  const answerNorm = normalizeText(answer);
  const facetKey = String(context.facet.key || '').toLowerCase();
  const element = String(context.facet.element || '').toLowerCase();
  const phase = String(context.facet.phase || '').toLowerCase();

  const referencedFacetKey = facetKey && answerNorm.includes(facetKey);
  const referencedElement = element && answerNorm.includes(element);
  const referencedPhase = phase && answerNorm.includes(phase);

  const referencedContext = referencedFacetKey || (referencedElement && referencedPhase);

  if (referencedContext) {
    return {
      ok: true,
      score: 1,
      referencedContext: true,
      details: referencedFacetKey
        ? `Referenced facet key: ${context.facet.key}`
        : `Referenced element: ${element}, phase: ${phase}`
    };
  }

  const hasRelevantTerms = checkRelevantTerms(answerNorm, context.facet);

  if (hasRelevantTerms) {
    return {
      ok: true,
      score: 0.7,
      referencedContext: false,
      details: 'Answer uses relevant alchemical terms but does not directly reference provided context'
    };
  }

  return {
    ok: false,
    score: 0,
    referencedContext: false,
    details: 'Answer ignores provided facet context entirely (retrieval leakage)'
  };
}

function checkRelevantTerms(answerNorm: string, facet: any): boolean {
  const alchemicalTerms = [
    'transformation', 'dissolution', 'coagulation', 'sublimation',
    'ignition', 'vision', 'descent', 'foundation', 'integration', 'unity',
    'elemental', 'alchemical', 'phase', 'cycle'
  ];

  const elementTerms = ['fire', 'water', 'earth', 'air', 'aether'];

  const hasAlchemicalTerms = alchemicalTerms.some(term => answerNorm.includes(term));
  const hasElementTerms = elementTerms.some(term => answerNorm.includes(term));

  return hasAlchemicalTerms || hasElementTerms;
}