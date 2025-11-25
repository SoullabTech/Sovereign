// Shadow Detection: Pattern reflection for personal agent context
// Not for user diagnosis - for agent attunement

export interface ShadowInsight {
  avoidedFacets: string[];
  overEmphasized: string[];
  silences: string[];
  asymmetryScore: number; // 0-1, higher = more misalignment
}

export interface PetalIntensities {
  [petalName: string]: number;
}

// Element mapping for petals
const PETAL_ELEMENTS: Record<string, string> = {
  creativity: "fire",
  intuition: "fire", 
  courage: "fire",
  love: "water",
  wisdom: "water",
  vision: "water",
  grounding: "earth",
  flow: "earth",
  power: "earth",
  healing: "air",
  mystery: "air",
  joy: "air"
};

// Keywords associated with each petal for text analysis
const PETAL_KEYWORDS: Record<string, string[]> = {
  creativity: ["create", "art", "innovation", "express", "design", "imagination"],
  intuition: ["feel", "sense", "know", "instinct", "inner", "trust"],
  courage: ["brave", "bold", "risk", "afraid", "fear", "challenge"],
  love: ["love", "heart", "compassion", "care", "connect", "relationship"],
  wisdom: ["wise", "understand", "learn", "experience", "insight", "knowledge"],
  vision: ["see", "future", "dream", "goal", "possibility", "imagine"],
  grounding: ["ground", "stable", "present", "here", "body", "earth"],
  flow: ["flow", "adapt", "flexible", "change", "movement", "ease"],
  power: ["power", "strength", "will", "control", "authority", "impact"],
  healing: ["heal", "peace", "restore", "wellness", "recovery", "whole"],
  mystery: ["unknown", "mystery", "shadow", "hidden", "depth", "secret"],
  joy: ["joy", "happy", "celebration", "laughter", "play", "delight"]
};

// Shadow themes that might emerge
const SHADOW_THEMES = [
  "avoidance of conflict",
  "fear of vulnerability", 
  "resistance to rest",
  "avoiding responsibility",
  "fear of being seen",
  "resistance to change",
  "avoiding emotions",
  "fear of failure",
  "perfectionism paralysis",
  "people pleasing",
  "imposter syndrome",
  "fear of success"
];

export function detectShadow(content: string, checkIns: PetalIntensities): ShadowInsight {
  const contentLower = content.toLowerCase();
  const avoidedFacets: string[] = [];
  const overEmphasized: string[] = [];
  const silences: string[] = [];

  // Detect text-petal misalignments
  Object.entries(checkIns).forEach(([petal, intensity]) => {
    const keywords = PETAL_KEYWORDS[petal] || [];
    const textMentions = keywords.some(keyword => contentLower.includes(keyword));
    
    // High check-in but no text mention = potential avoidance
    if (intensity > 0.6 && !textMentions) {
      avoidedFacets.push(petal);
    }
    
    // Heavy text mention but low/no check-in = potential over-emphasis
    const mentionCount = keywords.reduce((count, keyword) => 
      count + (contentLower.split(keyword).length - 1), 0);
    
    if (mentionCount > 2 && intensity < 0.3) {
      overEmphasized.push(petal);
    }
  });

  // Detect implied shadow themes
  SHADOW_THEMES.forEach(theme => {
    const themeWords = theme.split(' ');
    const hasThemeWords = themeWords.some(word => contentLower.includes(word));
    const avoidsThemeDirectly = !contentLower.includes(theme);
    
    if (hasThemeWords && avoidsThemeDirectly) {
      silences.push(theme);
    }
  });

  // Calculate asymmetry score
  const totalMisalignments = avoidedFacets.length + overEmphasized.length + silences.length;
  const totalPetals = Object.keys(checkIns).length;
  const asymmetryScore = Math.min(1, totalMisalignments / Math.max(1, totalPetals));

  return {
    avoidedFacets,
    overEmphasized,
    silences,
    asymmetryScore
  };
}

// Generate shadow reflection questions (not diagnoses)
export function generateShadowQuestions(shadowInsight: ShadowInsight): string[] {
  const questions: string[] = [];
  
  if (shadowInsight.avoidedFacets.length > 0) {
    questions.push("What might be left unsaid here?");
    questions.push("Where do you notice yourself holding back?");
  }
  
  if (shadowInsight.overEmphasized.length > 0) {
    questions.push("What are you trying to convince yourself of?");
    questions.push("What would happen if you needed this less?");
  }
  
  if (shadowInsight.silences.length > 0) {
    questions.push("What theme keeps appearing around the edges?");
    questions.push("What conversation have you been postponing?");
  }
  
  return questions;
}

// Calculate elemental shadow patterns
export function getElementalShadow(checkIns: PetalIntensities): Record<string, number> {
  const elementTotals = { fire: 0, water: 0, earth: 0, air: 0 };
  const elementCounts = { fire: 0, water: 0, earth: 0, air: 0 };
  
  Object.entries(checkIns).forEach(([petal, intensity]) => {
    const element = PETAL_ELEMENTS[petal];
    if (element && element in elementTotals) {
      elementTotals[element] += intensity;
      elementCounts[element]++;
    }
  });
  
  // Calculate averages and find the "shadow" (least expressed) element
  const elementAverages: Record<string, number> = {};
  Object.keys(elementTotals).forEach(element => {
    elementAverages[element] = elementCounts[element] > 0 
      ? elementTotals[element] / elementCounts[element] 
      : 0;
  });
  
  return elementAverages;
}