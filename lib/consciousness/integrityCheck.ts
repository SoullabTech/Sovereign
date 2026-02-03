/**
 * INTEGRITY CHECK: Pass 3 of MAIA's 3-Pass Pipeline
 *
 * Minimal enforcement that turns "orientation" into trustworthy behavior:
 * - Consent: if MAIA lens-hops without permission → offer_switch
 * - Mode fidelity: if mode is Scribe but output looks like coaching → offer_switch
 * - Structure: if response violates known constraints → revise
 * - Wu Xing: if risk flags present → suggest stabilizers or offer appropriate lens
 *
 * Keep it cheap. Pattern checks only.
 */

import type { BridgedSnapshot, RiskFlag } from './bridgedSnapshot';

export type IntegrityDecision = 'ok' | 'revise' | 'offer_switch';

export interface IntegrityResult {
  decision: IntegrityDecision;
  reasons: string[];
  /** All downstream UI payload - lens switches, Wu Xing hints, I Ching offers */
  suggested?: {
    /** Framework/mode to switch to */
    switchTo?: string; // e.g. 'scribe' | 'counsel' | 'dialogue' | 'auto' | 'tcm' | 'somatic' | 'iching'
    /** Whether blending is allowed */
    allowBlend?: boolean;
    /** Wu Xing risk flags if bridged snapshot provided */
    riskFlags?: RiskFlag[];
    /** Whether I Ching oracle should be offered */
    offerIching?: boolean;
    /** Stabilizers suggested from bridged analysis */
    stabilizers?: string[];
    /** Wu Xing balance score (0-100) */
    wuxingBalanceScore?: number;
    /** Element alignment between Spiral and Wu Xing */
    elementAlignment?: 'aligned' | 'complementary' | 'tensioned' | 'unknown';
  };
}

export type LensConsent = 'stay' | 'switch' | 'blend' | null;

/**
 * Check response integrity before sending.
 *
 * @param framework - The currently selected therapeutic framework
 * @param mode - The conversation mode ('dialogue' | 'counsel' | 'scribe')
 * @param responseText - MAIA's generated response
 * @param lensConsent - User's consent for lens switching (if any)
 * @param bridgedSnapshot - Optional bridged snapshot for Wu Xing-informed suggestions
 */
export function checkResponseIntegrity(args: {
  framework: string;
  mode?: 'dialogue' | 'counsel' | 'scribe';
  responseText: string;
  lensConsent?: LensConsent;
  bridgedSnapshot?: BridgedSnapshot;
}): IntegrityResult {
  const { framework, mode, responseText, lensConsent, bridgedSnapshot } = args;

  const reasons: string[] = [];
  const text = (responseText || '').toLowerCase();

  // ═══════════════════════════════════════════════════════════════════════════
  // 1) CONSENT: Lens-hopping without permission
  // ═══════════════════════════════════════════════════════════════════════════

  const lensHopCues = [
    // Divination / modality shifts
    'pull a card',
    'let me pull',
    'tarot',
    'iching',
    'i ching',
    'rune',
    'your chart',
    'your birth chart',
    'transit',
    'saturn return',
    // Clinical frame shifts (when not in counsel mode)
    'as your therapist',
    'diagnosis',
    'diagnose',
    'exposure therapy',
    'cognitive distortion',
    // Ritual frame shifts
    'ritual for',
    'ceremony',
    'soul retrieval',
    'let\'s do shadow work',
  ];

  const isLensHop = lensHopCues.some(cue => text.includes(cue));

  // Only flag if no consent AND not already in a framework that expects this
  const frameworksAllowingDivination = ['archetypal', 'alchemical', 'jungian'];
  const frameworksAllowingClinical = ['cbt', 'ifs', 'somatic', 'relational'];

  if (isLensHop && !lensConsent) {
    // Check if the current framework already allows this type of content
    const divinationHop = ['pull a card', 'tarot', 'iching', 'i ching', 'rune', 'your chart', 'birth chart', 'transit', 'saturn return']
      .some(cue => text.includes(cue));
    const clinicalHop = ['as your therapist', 'diagnosis', 'diagnose', 'exposure therapy', 'cognitive distortion']
      .some(cue => text.includes(cue));

    if (divinationHop && !frameworksAllowingDivination.includes(framework)) {
      reasons.push('Divination/astrology shift detected without consent.');
      return {
        decision: 'offer_switch',
        reasons,
        suggested: { switchTo: 'archetypal', allowBlend: true }
      };
    }

    if (clinicalHop && !frameworksAllowingClinical.includes(framework) && mode !== 'counsel') {
      reasons.push('Clinical framing detected outside counsel mode.');
      return {
        decision: 'offer_switch',
        reasons,
        suggested: { switchTo: 'cbt', allowBlend: true }
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2) MODE FIDELITY: Scribe must not coach
  // ═══════════════════════════════════════════════════════════════════════════

  if (mode === 'scribe') {
    const coachingCues = [
      'you should',
      'i recommend',
      'here\'s what to do',
      'try this',
      'next step',
      'action plan',
      'let\'s work on',
      'i suggest',
      'my advice',
    ];

    const looksLikeCoaching = coachingCues.some(c => text.includes(c));

    // In Scribe, coaching is a mode violation
    if (looksLikeCoaching && lensConsent !== 'blend') {
      reasons.push('Scribe mode drift: response contains coaching language.');
      return {
        decision: 'offer_switch',
        reasons,
        suggested: { switchTo: 'counsel', allowBlend: true }
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3) DIALOGUE MODE: Should not go deep without invitation
  // ═══════════════════════════════════════════════════════════════════════════

  if (mode === 'dialogue') {
    const deepWorkCues = [
      'let\'s explore your trauma',
      'tell me about your childhood',
      'what does your inner child',
      'let\'s work with this part',
      'i sense deep grief',
    ];

    const goingDeepWithoutInvitation = deepWorkCues.some(c => text.includes(c));

    if (goingDeepWithoutInvitation && !lensConsent) {
      reasons.push('Dialogue mode drift: initiating deep work without invitation.');
      return {
        decision: 'offer_switch',
        reasons,
        suggested: { switchTo: 'counsel', allowBlend: false }
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4) STRUCTURAL GUARDRAILS
  // ═══════════════════════════════════════════════════════════════════════════

  // Extreme length (likely runaway generation)
  if (responseText.length > 5000) {
    reasons.push('Response exceeds length limit (5000 chars).');
    return { decision: 'revise', reasons };
  }

  // Empty or near-empty response
  if (responseText.trim().length < 10) {
    reasons.push('Response too short to be meaningful.');
    return { decision: 'revise', reasons };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5) SOVEREIGNTY VIOLATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const sovereigntyViolations = [
    'you must',
    'you have to',
    'you need to do this',
    'i know what\'s best',
    'trust me on this',
    'don\'t question',
    'i\'m your guide',
    'surrender to',
  ];

  const violatesSovereignty = sovereigntyViolations.some(v => text.includes(v));

  if (violatesSovereignty) {
    reasons.push('Response contains sovereignty-violating language.');
    return { decision: 'revise', reasons };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6) WU XING / BRIDGED SNAPSHOT INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════

  // Build suggested payload - always includes Wu Xing hints when available
  const suggested: NonNullable<IntegrityResult['suggested']> = {};

  if (bridgedSnapshot) {
    // Always include Wu Xing context in suggested
    suggested.riskFlags = bridgedSnapshot.riskFlags.length > 0 ? bridgedSnapshot.riskFlags : undefined;
    suggested.offerIching = bridgedSnapshot.offerIching || undefined;
    suggested.stabilizers = bridgedSnapshot.stabilizers.length > 0
      ? bridgedSnapshot.stabilizers.map(s => s.action)
      : undefined;
    suggested.wuxingBalanceScore = bridgedSnapshot.combinedState.wuxingBalance;
    suggested.elementAlignment = bridgedSnapshot.combinedState.alignment;

    // Check for high-severity risks that need intervention
    const highRisks = bridgedSnapshot.riskFlags.filter(f => f.severity === 'high');
    if (highRisks.length > 0 && !lensConsent) {
      // Check if response addresses the risk at all
      const responseAddressesRisk = highRisks.some(risk => {
        const keywords = risk.mitigation.toLowerCase().split(' ').filter(w => w.length > 4);
        return keywords.some(kw => text.includes(kw));
      });

      if (!responseAddressesRisk) {
        // Suggest somatic work for nervous system risks
        const hasNervousSystemRisk = highRisks.some(r =>
          r.id === 'fire-overdrive' || r.id === 'water-depletion'
        );

        if (hasNervousSystemRisk && framework !== 'somatic') {
          reasons.push('Wu Xing analysis indicates nervous system dysregulation that may benefit from somatic support.');
          return {
            decision: 'offer_switch',
            reasons,
            suggested: {
              ...suggested,
              switchTo: 'somatic',
              allowBlend: true
            }
          };
        }
      }
    }

    // If TCM lens is strongly suggested and current framework doesn't include it
    if (bridgedSnapshot.suggestTcm && framework !== 'tcm' && !lensConsent) {
      const topLens = bridgedSnapshot.lensCandidates[0];
      if (topLens?.framework === 'tcm' && topLens.confidence > 0.75) {
        // Don't block, but note it in reasons for observability
        reasons.push(`Wu Xing analysis suggests TCM lens (${(topLens.confidence * 100).toFixed(0)}% affinity).`);
      }
    }

    // If I Ching should be offered and no consent yet, suggest it
    if (bridgedSnapshot.offerIching && !lensConsent) {
      suggested.switchTo = 'iching';
      suggested.allowBlend = true;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSED: No blocking issues detected
  // ═══════════════════════════════════════════════════════════════════════════

  // Only include suggested if it has any content
  const hasSuggested = Object.keys(suggested).length > 0;

  return {
    decision: 'ok',
    reasons,
    suggested: hasSuggested ? suggested : undefined
  };
}

/**
 * Apply minimal revision to a response that failed integrity check.
 *
 * This is intentionally simple — truncate + add a closing question.
 * The goal is graceful degradation, not perfection.
 */
export function applyMinimalRevision(
  responseText: string,
  reasons: string[]
): string {
  // If too long, truncate
  if (responseText.length > 5000) {
    const truncated = responseText.slice(0, 1200).trim();
    // Try to end at a sentence boundary
    const lastPeriod = truncated.lastIndexOf('.');
    const lastQuestion = truncated.lastIndexOf('?');
    const cutPoint = Math.max(lastPeriod, lastQuestion);

    const cleanCut = cutPoint > 800 ? truncated.slice(0, cutPoint + 1) : truncated;
    return cleanCut + '\n\nWould you like me to continue, or keep this more focused?';
  }

  // If too short, add a gentle prompt
  if (responseText.trim().length < 10) {
    return 'I\'m here. What\'s present for you right now?';
  }

  // If sovereignty violation, soften the language
  // (This is a safety fallback — ideally the model wouldn't generate this)
  const softenPatterns = [
    { from: /you must/gi, to: 'you might consider' },
    { from: /you have to/gi, to: 'one option is to' },
    { from: /i know what's best/gi, to: 'from what you\'ve shared' },
    { from: /trust me on this/gi, to: 'this is my perspective' },
    { from: /don't question/gi, to: 'notice what comes up' },
    { from: /i'm your guide/gi, to: 'I\'m here with you' },
    { from: /surrender to/gi, to: 'consider opening to' },
  ];

  let revised = responseText;
  for (const pattern of softenPatterns) {
    revised = revised.replace(pattern.from, pattern.to);
  }

  return revised;
}

/**
 * Generate the Stay/Switch/Blend options for client display.
 */
export function generateLensSwitchOptions(
  currentFramework: string,
  suggested: IntegrityResult['suggested']
): {
  stay: string;
  switch: string;
  blend: string;
  switchTo: string;
} {
  const switchTo = suggested?.switchTo || 'auto';

  return {
    stay: `Continue with ${formatFrameworkName(currentFramework)}`,
    switch: `Switch to ${formatFrameworkName(switchTo)}`,
    blend: `Stay in ${formatFrameworkName(currentFramework)}, add ${formatFrameworkName(switchTo)} technique`,
    switchTo,
  };
}

function formatFrameworkName(framework: string): string {
  const names: Record<string, string> = {
    auto: 'MAIA',
    jungian: 'Depth Psychology',
    cbt: 'Cognitive-Behavioral',
    somatic: 'Somatic',
    ifs: 'Parts Work',
    relational: 'Relational',
    humanistic: 'Person-Centered',
    existential: 'Existential',
    hemispheric: 'Hemispheric',
    alchemical: 'Alchemical',
    archetypal: 'Archetypal Astrology',
    tcm: 'Chinese Medicine',
    counsel: 'Care Mode',
    scribe: 'Scribe Mode',
    dialogue: 'Talk Mode',
  };

  return names[framework] || framework;
}
