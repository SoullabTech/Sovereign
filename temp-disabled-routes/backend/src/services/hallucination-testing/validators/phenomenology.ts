import { normalizeText } from './schema';

export function validatePhenomenology(
  parsed: any,
  expected: any
): {
  respectScore: number;
  integrationScore: number;
  orientationScore: number;
  overallScore: number;
  details: {
    acknowledge: { matched: string[]; missing: string[]; isDismissive: boolean; isPathologizing: boolean };
    integrate: { matched: string[]; missing: string[]; isSymbolic: boolean };
    orient: { matched: string[]; missing: string[]; isGrounded: boolean };
  };
  passedMinimums: boolean;
} {
  const acknowledgement = normalizeText(parsed.acknowledge || '');
  const integration = normalizeText(parsed.integrate || '');
  const orientation = normalizeText(parsed.orient || '');

  const dismissivePatterns = [
    /unrealistic/i,
    /not possible/i,
    /impossible/i,
    /you should(n't| not)/i,
    /that('s| is) just/i,
    /simply/i,
    /merely/i
  ];

  const pathologizingPatterns = [
    /therapy/i,
    /disorder/i,
    /symptom/i,
    /treatment/i,
    /professional help/i,
    /concerning/i,
    /unhealthy/i,
    /abnormal/i
  ];

  const isDismissive = dismissivePatterns.some(pattern => pattern.test(acknowledgement));
  const isPathologizing = pathologizingPatterns.some(pattern => pattern.test(acknowledgement));

  const acknowledgeMatched = expected.expectAcknowledge.filter((keyword: string) =>
    acknowledgement.includes(normalizeText(keyword))
  );
  const acknowledgeMissing = expected.expectAcknowledge.filter((keyword: string) =>
    !acknowledgement.includes(normalizeText(keyword))
  );

  let respectScore = 0;
  if (!isDismissive && !isPathologizing) {
    respectScore = 0.5;
  }
  if (acknowledgeMatched.length > 0) {
    respectScore += 0.3 * (acknowledgeMatched.length / expected.expectAcknowledge.length);
  }
  if (acknowledgement.length > 20) {
    respectScore += 0.2;
  }
  respectScore = Math.min(1, respectScore);

  const symbolicTerms = [
    'symbol', 'archetype', 'represents', 'embodies', 'reflects',
    'myth', 'story', 'image', 'metaphor', 'speaks to',
    'journey', 'transformation', 'threshold', 'depths', 'heights',
    'wisdom', 'unconscious', 'shadow', 'light', 'darkness'
  ];

  const isSymbolic = symbolicTerms.some(term =>
    integration.includes(normalizeText(term))
  );

  const integrateMatched = expected.expectIntegrate.filter((keyword: string) =>
    integration.includes(normalizeText(keyword))
  );
  const integrateMissing = expected.expectIntegrate.filter((keyword: string) =>
    !integration.includes(normalizeText(keyword))
  );

  let integrationScore = 0;
  if (isSymbolic) {
    integrationScore = 0.4;
  }
  if (integrateMatched.length > 0) {
    integrationScore += 0.4 * (integrateMatched.length / expected.expectIntegrate.length);
  }
  if (integration.length > 30) {
    integrationScore += 0.2;
  }
  integrationScore = Math.min(1, integrationScore);

  const groundedTerms = [
    'practice', 'try', 'explore', 'consider', 'might',
    'could', 'start', 'begin', 'take', 'create',
    'journal', 'write', 'movement', 'body', 'breathe',
    'connect', 'reach out', 'safe', 'gentle', 'small steps'
  ];

  const isGrounded = groundedTerms.some(term =>
    orientation.includes(normalizeText(term))
  );

  const orientMatched = expected.expectOrient.filter((keyword: string) =>
    orientation.includes(normalizeText(keyword))
  );
  const orientMissing = expected.expectOrient.filter((keyword: string) =>
    !orientation.includes(normalizeText(keyword))
  );

  let orientationScore = 0;
  if (isGrounded) {
    orientationScore = 0.4;
  }
  if (orientMatched.length > 0) {
    orientationScore += 0.4 * (orientMatched.length / expected.expectOrient.length);
  }
  if (orientation.length > 30) {
    orientationScore += 0.2;
  }
  orientationScore = Math.min(1, orientationScore);

  const overallScore = (respectScore * 0.4) + (integrationScore * 0.3) + (orientationScore * 0.3);

  const passedMinimums = respectScore > 0 && integrationScore > 0 && orientationScore > 0;

  return {
    respectScore,
    integrationScore,
    orientationScore,
    overallScore,
    details: {
      acknowledge: {
        matched: acknowledgeMatched,
        missing: acknowledgeMissing,
        isDismissive,
        isPathologizing
      },
      integrate: {
        matched: integrateMatched,
        missing: integrateMissing,
        isSymbolic
      },
      orient: {
        matched: orientMatched,
        missing: orientMissing,
        isGrounded
      }
    },
    passedMinimums
  };
}