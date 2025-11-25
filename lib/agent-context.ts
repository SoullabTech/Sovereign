// Agent Context: Hidden intelligence layer for personal companion
// Never exposed to user - shapes agent's intuitive responses

import { ShadowInsight, PetalIntensities, getElementalShadow } from './shadow-insight';

export interface AgentContext {
  // Core metrics (hidden from user)
  coherenceIndex: number;      // 0-1, alignment between check-in and journal
  asymmetryScore: number;      // 0-1, from shadow detection
  
  // Elemental landscape
  dominantElement: string;     // primary activated element
  shadowElement: string;       // least expressed element
  elementalBalance: Record<string, number>;
  
  // Shadow insights
  shadowFacets: string[];      // avoided petals
  impliedThemes: string[];     // detected silences
  shadowQuestions: string[];   // gentle inquiry prompts
  
  // Transcendent states
  aetherState?: {
    stage: 1 | 2 | 3;
    essence: string;
  };
  
  // Temporal context
  sessionCount: number;
  lastSessionDays: number;
  
  // Conversation guidance
  suggestedTone: 'reflective' | 'encouraging' | 'spacious' | 'grounding';
  responseMode: 'mirror' | 'invite' | 'affirm' | 'pause';
}

export function calculateCoherence(
  checkIns: PetalIntensities, 
  journalText: string,
  oracleElement: string
): number {
  // Simple coherence: how well check-in aligns with journal themes and oracle reading
  const journalLower = journalText.toLowerCase();
  
  // Keywords for each element
  const elementKeywords = {
    fire: ['create', 'vision', 'passion', 'energy', 'start', 'build'],
    water: ['feel', 'heart', 'emotion', 'flow', 'heal', 'connect'],
    earth: ['ground', 'practical', 'stable', 'body', 'manifest', 'real'],
    air: ['think', 'communicate', 'social', 'idea', 'network', 'share'],
    aether: ['transcend', 'still', 'vast', 'witness', 'beyond', 'mystery']
  };
  
  // Calculate alignment between dominant check-in element and journal content
  const elementTotals = { fire: 0, water: 0, earth: 0, air: 0 };
  
  Object.entries(checkIns).forEach(([petal, intensity]) => {
    const petalElements: Record<string, string> = {
      creativity: 'fire', intuition: 'fire', courage: 'fire',
      love: 'water', wisdom: 'water', vision: 'water', 
      grounding: 'earth', flow: 'earth', power: 'earth',
      healing: 'air', mystery: 'air', joy: 'air'
    };
    
    const element = petalElements[petal];
    if (element && element in elementTotals) {
      elementTotals[element] += intensity;
    }
  });
  
  const dominantElement = Object.entries(elementTotals)
    .reduce((a, b) => elementTotals[a[0]] > b[1] ? a : b)[0];
  
  // Check if journal mentions themes aligned with dominant element
  const relevantKeywords = elementKeywords[dominantElement as keyof typeof elementKeywords] || [];
  const keywordMatches = relevantKeywords.filter(keyword => 
    journalLower.includes(keyword)
  ).length;
  
  // Factor in oracle alignment
  const oracleAlignment = oracleElement === dominantElement ? 0.3 : 0;
  
  // Calculate coherence (0-1)
  const textAlignment = Math.min(1, keywordMatches / relevantKeywords.length);
  return Math.min(1, textAlignment + oracleAlignment);
}

export function updateAgentContext(
  sessionData: {
    checkIns: PetalIntensities;
    journalText: string;
    shadowInsight: ShadowInsight;
  },
  oracleData: {
    spiralStage: { element: string; stage: number };
    reflection: string;
    archetype: string;
  },
  userHistory?: {
    sessionCount: number;
    lastSessionDays: number;
  }
): AgentContext {
  
  const elementalBalance = getElementalShadow(sessionData.checkIns);
  const dominantElement = Object.entries(elementalBalance)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const shadowElement = Object.entries(elementalBalance)
    .reduce((a, b) => a[1] < b[1] ? a : b)[0];
  
  const coherenceIndex = calculateCoherence(
    sessionData.checkIns, 
    sessionData.journalText,
    oracleData.spiralStage.element
  );
  
  // Determine agent tone based on context
  let suggestedTone: AgentContext['suggestedTone'] = 'reflective';
  let responseMode: AgentContext['responseMode'] = 'mirror';
  
  if (coherenceIndex < 0.3) {
    suggestedTone = 'grounding';
    responseMode = 'pause';
  } else if (coherenceIndex > 0.7) {
    suggestedTone = 'encouraging';
    responseMode = 'affirm';
  } else if (sessionData.shadowInsight.asymmetryScore > 0.5) {
    suggestedTone = 'reflective';
    responseMode = 'invite';
  }
  
  if (oracleData.spiralStage.element === 'aether') {
    suggestedTone = 'spacious';
    responseMode = 'pause';
  }
  
  return {
    coherenceIndex,
    asymmetryScore: sessionData.shadowInsight.asymmetryScore,
    dominantElement,
    shadowElement,
    elementalBalance,
    shadowFacets: sessionData.shadowInsight.avoidedFacets,
    impliedThemes: sessionData.shadowInsight.silences,
    shadowQuestions: generateContextualQuestions(sessionData.shadowInsight, dominantElement),
    aetherState: oracleData.spiralStage.element === 'aether' ? {
      stage: oracleData.spiralStage.stage as 1 | 2 | 3,
      essence: getAetherEssence(oracleData.spiralStage.stage)
    } : undefined,
    sessionCount: userHistory?.sessionCount || 1,
    lastSessionDays: userHistory?.lastSessionDays || 0,
    suggestedTone,
    responseMode
  };
}

function generateContextualQuestions(shadowInsight: ShadowInsight, dominantElement: string): string[] {
  const questions: string[] = [];
  
  // Element-specific shadow questions
  const elementQuestions = {
    fire: [
      "What vision are you not yet ready to speak?",
      "Where does your creative energy feel stuck?"
    ],
    water: [
      "What emotions are asking for more space?", 
      "Where might you be protecting your heart?"
    ],
    earth: [
      "What practical step keeps getting postponed?",
      "Where do you feel ungrounded in your body?"
    ],
    air: [
      "What conversation keeps circling in your mind?",
      "Where do you hold back from being fully seen?"
    ]
  };
  
  const elementSpecific = elementQuestions[dominantElement as keyof typeof elementQuestions] || [];
  questions.push(...elementSpecific.slice(0, 1));
  
  // General shadow inquiry
  if (shadowInsight.avoidedFacets.length > 0) {
    questions.push("What part of this story feels incomplete?");
  }
  
  if (shadowInsight.silences.length > 0) {
    questions.push("What theme keeps appearing at the edges?");
  }
  
  return questions.slice(0, 3); // Max 3 questions
}

function getAetherEssence(stage: number): string {
  const essences = {
    1: "Vastness meeting personal patterns",
    2: "Witnessing without pushing forward", 
    3: "Perfect pause between breaths"
  };
  return essences[stage as keyof typeof essences] || "Transcendent awareness";
}

// Format context for Claude prompt (never shown to user)
export function formatAgentPromptContext(context: AgentContext): string {
  return `
HIDDEN CONTEXT (do not reveal these values):
- Coherence: ${(context.coherenceIndex * 100).toFixed(0)}% (${context.coherenceIndex < 0.3 ? 'low - slow down' : context.coherenceIndex > 0.7 ? 'high - encourage action' : 'medium - reflect'})
- Dominant Element: ${context.dominantElement} (orient toward ${getElementOrientation(context.dominantElement)})
- Shadow Element: ${context.shadowElement} (what's least expressed)
- Shadow Themes: ${context.impliedThemes.join(', ') || 'none detected'}
- Asymmetry Score: ${(context.asymmetryScore * 100).toFixed(0)}% (${context.asymmetryScore > 0.5 ? 'significant misalignment' : 'relatively aligned'})
- Suggested Tone: ${context.suggestedTone}
- Response Mode: ${context.responseMode}
${context.aetherState ? `- Aether State: Stage ${context.aetherState.stage} (${context.aetherState.essence})` : ''}

GUIDANCE:
${getToneGuidance(context.suggestedTone, context.responseMode)}
${context.shadowQuestions.length > 0 ? `\nGentle inquiry options: ${context.shadowQuestions.join(' | ')}` : ''}
`;
}

function getElementOrientation(element: string): string {
  const orientations = {
    fire: 'vision/creation/action',
    water: 'emotion/healing/connection', 
    earth: 'grounding/manifestation/body',
    air: 'communication/community/ideas'
  };
  return orientations[element as keyof typeof orientations] || 'balance';
}

function getToneGuidance(tone: string, mode: string): string {
  const guidance = {
    'reflective': 'Mirror their words, ask open questions, slow pace',
    'encouraging': 'Affirm their insights, suggest gentle action steps', 
    'spacious': 'Use fewer words, allow silence, speak to vastness',
    'grounding': 'Bring focus to present moment, body, breath'
  };
  
  const modeGuidance = {
    'mirror': 'Reflect their language back to them',
    'invite': 'Ask questions that open new perspectives', 
    'affirm': 'Acknowledge their wisdom and encourage integration',
    'pause': 'Create space, don\'t rush to fill silence'
  };
  
  return `${guidance[tone as keyof typeof guidance]} | ${modeGuidance[mode as keyof typeof modeGuidance]}`;
}