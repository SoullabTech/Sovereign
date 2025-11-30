/**
 * SHIFt Explicit Research Survey (24 Items)
 * 
 * Structured, Likert-style, psychometric anchor for validated data collection.
 * Maps to 12 Spiralogic facets with 2 items each for reliability.
 */

export interface SurveyItem {
  id: string;
  facetCode: string;
  text: string;
  reverse?: boolean; // for reverse-scored items
}

export const SHIFT_EXPLICIT_SURVEY: SurveyItem[] = [
  // =============================================================================
  // 🔥 FIRE – INSPIRATION & WILL
  // =============================================================================
  {
    id: 'F1_1',
    facetCode: 'F1_Meaning',
    text: 'I feel a spark of purpose that guides me, even in uncertain times.'
  },
  {
    id: 'F1_2', 
    facetCode: 'F1_Meaning',
    text: 'My daily actions reflect a vision that excites me.'
  },
  {
    id: 'F2_1',
    facetCode: 'F2_Courage',
    text: 'I can generate enthusiasm for new ideas or projects easily.'
  },
  {
    id: 'F2_2',
    facetCode: 'F2_Courage', 
    text: 'I am willing to take risks in service of what I believe in.'
  },

  // =============================================================================
  // 🌍 EARTH – GROUNDING & COHERENCE
  // =============================================================================
  {
    id: 'E1_1',
    facetCode: 'E1_Coherence',
    text: 'The path I am walking feels steady and reliable.'
  },
  {
    id: 'E1_2',
    facetCode: 'E1_Coherence',
    text: 'I feel grounded when making important life decisions.'
  },
  {
    id: 'E2_1',
    facetCode: 'E2_Grounding',
    text: 'I live in ways that align with my core commitments.'
  },
  {
    id: 'E2_2',
    facetCode: 'E2_Grounding',
    text: 'My daily routines give me strength and structure.'
  },

  // =============================================================================
  // 🌊 WATER – EMOTIONAL FLOW & CONNECTION
  // =============================================================================
  {
    id: 'W1_1',
    facetCode: 'W1_Attunement',
    text: 'My emotions move through me in healthy, balanced ways.'
  },
  {
    id: 'W1_2',
    facetCode: 'W1_Attunement',
    text: 'I am able to turn emotional challenges into sources of growth.'
  },
  {
    id: 'W2_1',
    facetCode: 'W2_Belonging',
    text: 'I feel supported and connected within my relationships and communities.'
  },
  {
    id: 'W2_2',
    facetCode: 'W2_Belonging',
    text: 'I readily express empathy and care for others.'
  },

  // =============================================================================
  // 🌬 AIR – REFLECTION & ADAPTABILITY
  // =============================================================================
  {
    id: 'A1_1',
    facetCode: 'A1_Reflection',
    text: 'I regularly pause to reflect on the meaning of my experiences.'
  },
  {
    id: 'A1_2',
    facetCode: 'A1_Reflection',
    text: 'I enjoy exploring different viewpoints before forming conclusions.'
  },
  {
    id: 'A2_1',
    facetCode: 'A2_Adaptability',
    text: 'When things change, I adapt without losing my center.'
  },
  {
    id: 'A2_2',
    facetCode: 'A2_Adaptability',
    text: 'Curiosity often leads me to reframe problems in new ways.'
  },

  // =============================================================================
  // ✨ AETHER – VALUES HARMONY & FULFILLMENT
  // =============================================================================
  {
    id: 'AE1_1',
    facetCode: 'AE1_Values',
    text: 'I sense a deep harmony between my actions and my highest values.'
  },
  {
    id: 'AE1_2',
    facetCode: 'AE1_Values',
    text: 'I feel that my life contributes to something greater than myself.'
  },
  {
    id: 'AE2_1',
    facetCode: 'AE2_Fulfillment',
    text: 'Even with unfinished dreams, I feel my life carries meaning.'
  },
  {
    id: 'AE2_2',
    facetCode: 'AE2_Fulfillment',
    text: 'Looking back, I am satisfied with the path I have taken so far.'
  },

  // =============================================================================
  // SPIRALOGIC INTEGRATION FACETS
  // =============================================================================
  {
    id: 'C1_1',
    facetCode: 'C1_Integration',
    text: 'I can recognize when a chapter of my life is ending and a new one is beginning.'
  },
  {
    id: 'C1_2',
    facetCode: 'C1_Integration',
    text: 'I see patterns of growth and renewal in my personal journey.'
  },
  {
    id: 'C2_1',
    facetCode: 'C2_Integrity',
    text: 'I feel guided through life by forces larger than myself (spiritual, communal, or natural).'
  },
  {
    id: 'C2_2',
    facetCode: 'C2_Integrity',
    text: 'I trust that even difficulties contain seeds of transformation.'
  }
];

export const SURVEY_INSTRUCTIONS = "For each statement, choose a number from 1 (Strongly Disagree) to 7 (Strongly Agree).";

export const SURVEY_SCALE_LABELS = {
  1: "Strongly Disagree",
  2: "Disagree", 
  3: "Somewhat Disagree",
  4: "Neither Agree nor Disagree",
  5: "Somewhat Agree",
  6: "Agree",
  7: "Strongly Agree"
};

export const SURVEY_METADATA = {
  version: "1.0",
  totalItems: 24,
  facetsPerElement: {
    fire: 2,
    earth: 2,
    water: 2,
    air: 2,
    aether: 2,
    cross: 2
  },
  estimatedMinutes: 8,
  validationTarget: "12-facet Spiralogic model"
};