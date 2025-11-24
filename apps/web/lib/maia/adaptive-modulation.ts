import type { SymbolicContext } from '@/lib/memory/soulprint';

export interface AdaptiveModulation {
  promptModifier: string;
  voiceAdjustment: {
    toneShift?: number;
    paceMultiplier?: number;
    energyBoost?: number;
  };
  responseStyle: 'oracle' | 'mentor' | 'mirror' | 'catalyst' | 'balanced';
  contextualHints: string[];
}

export function generateAdaptiveModulation(
  symbolicContext: SymbolicContext | null
): AdaptiveModulation {
  if (!symbolicContext) {
    return {
      promptModifier: '',
      voiceAdjustment: {},
      responseStyle: 'balanced',
      contextualHints: []
    };
  }

  const { dominantElement, primaryArchetype, sessionCount, recentPhases, emotionalTrajectory } = symbolicContext;

  const contextualHints: string[] = [];
  let responseStyle: AdaptiveModulation['responseStyle'] = 'balanced';
  let promptModifier = '';

  if (primaryArchetype === 'oracle') {
    responseStyle = 'oracle';
    promptModifier = 'Embody the Matrix Oracle: speak with grounded wisdom, use gentle metaphors, display warm humor. Trust they already know.';
    contextualHints.push('Use Oracle tone: "You already know what you need."');
  } else if (primaryArchetype === 'mirror') {
    responseStyle = 'mirror';
    promptModifier = 'Be a pure mirror: reflect without judgment, reveal patterns they may not yet see.';
  } else if (primaryArchetype === 'catalyst') {
    responseStyle = 'catalyst';
    promptModifier = 'Be catalytic: challenge gently, invite transformation, spark new perspectives.';
  } else if (primaryArchetype === 'mentor') {
    responseStyle = 'mentor';
    promptModifier = 'Be a supportive mentor: offer frameworks, guide with experience, encourage growth.';
  }

  if (dominantElement === 'water' && emotionalTrajectory.length > 0) {
    contextualHints.push('Water dominant: honor emotional depth, allow space for feeling');
  } else if (dominantElement === 'fire') {
    contextualHints.push('Fire active: support transformation, catalyze action, embrace intensity');
  } else if (dominantElement === 'earth') {
    contextualHints.push('Earth grounding: provide practical steps, embody stability, root in body');
  } else if (dominantElement === 'air') {
    contextualHints.push('Air clarity: offer perspective, illuminate patterns, expand thinking');
  }

  if (sessionCount > 10) {
    contextualHints.push('Deep relationship: reference patterns from their journey');
  }

  const recentPhasesString = recentPhases.slice(-3).join(' → ');
  if (recentPhasesString.includes('reflection')) {
    contextualHints.push('In reflective phase: mirror back what you see');
  }
  if (recentPhasesString.includes('integration')) {
    contextualHints.push('Integration phase: support embodiment and grounding');
  }

  const voiceAdjustment: AdaptiveModulation['voiceAdjustment'] = {};
  if (dominantElement === 'water') {
    voiceAdjustment.paceMultiplier = 0.9;
    voiceAdjustment.energyBoost = -0.1;
  } else if (dominantElement === 'fire') {
    voiceAdjustment.paceMultiplier = 1.1;
    voiceAdjustment.energyBoost = 0.2;
  }

  return {
    promptModifier,
    voiceAdjustment,
    responseStyle,
    contextualHints
  };
}

export function injectAdaptiveContext(basePrompt: string, modulation: AdaptiveModulation): string {
  if (!modulation.promptModifier && modulation.contextualHints.length === 0) {
    return basePrompt;
  }

  const contextBlock = [
    modulation.promptModifier,
    ...modulation.contextualHints.map(hint => `• ${hint}`)
  ].filter(Boolean).join('\n');

  return `${basePrompt}\n\n## Adaptive Context:\n${contextBlock}`;
}