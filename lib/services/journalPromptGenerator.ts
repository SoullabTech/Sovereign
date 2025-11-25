// Journal Prompt Generator - Sacred Reflection System
// Integrates soulprint data, milestone progression, and Maia's voice

import { SPIRALOGIC_FACETS_COMPLETE, getFacetById, calculateElementalBalance } from '@/data/spiralogic-facets-complete';

export type MilestoneState = 'FirstBloom' | 'PatternKeeper' | 'DepthSeeker' | 'SacredGardener' | 'WisdomKeeper';
export type ContextTag = 'Morning' | 'Evening' | 'Breakthrough' | 'Shadow' | 'Transition' | 'Integration';
export type PromptType = 'archetypal' | 'balancing' | 'milestone' | 'emergence' | 'integration';

export interface JournalPromptRequest {
  petalScores: Record<string, number>; // facet-id -> activation score
  currentMilestone: MilestoneState;
  contextTag?: ContextTag;
  recentOfferingSessions: string[]; // Recent facet activations for pattern detection
}

export interface JournalPrompt {
  prompt: string;
  type: PromptType;
  focusFacet?: string;
  element?: string;
  followUpQuestions?: string[];
  maiaVoice: string; // Contextual introduction from Maia
}

// ========== COMPREHENSIVE PROMPT LIBRARY ==========

const ARCHETYPAL_PROMPTS = {
  // Fire Prompts - Vision & Expression
  'fire-1': [
    "What vision is asking you to come forward today?",
    "Where do you feel your intuition pulling you?",
    "What future possibility excites you most right now?",
    "How is your sense of identity evolving?",
    "What inner calling feels strongest today?"
  ],
  'fire-2': [
    "What wants to be created through you?",
    "How do you express your authentic self most naturally?",
    "What creative impulse is stirring within you?",
    "Where do you feel most alive and expressive?",
    "What performance or sharing feels ready to emerge?"
  ],
  'fire-3': [
    "What is your higher calling asking of you?",
    "How can you expand beyond current limitations?",
    "What spiritual path is drawing you forward?",
    "Where do you feel ready to transcend old patterns?",
    "What wisdom are you being called to embody?"
  ],

  // Water Prompts - Emotion & Transformation
  'water-1': [
    "Where do you feel most at home in your life?",
    "How can you nurture yourself more deeply today?",
    "What makes you feel truly seen and held?",
    "Where in your life do you experience genuine belonging?",
    "How do you create safety for yourself and others?"
  ],
  'water-2': [
    "What patterns are ready for transformation in your life?",
    "How can you alchemize current challenges into wisdom?",
    "What old story about yourself is ready to be released?",
    "Where do you feel healing energy moving through you?",
    "What needs to be transformed for you to step forward?"
  ],
  'water-3': [
    "What is your soul's deepest truth?",
    "How do you connect with your inner gold?",
    "What feels most essential about who you are beneath all roles?",
    "Where do you touch the mystery of your being?",
    "What wants to emerge from your deepest essence?"
  ],

  // Earth Prompts - Purpose & Embodiment
  'earth-1': [
    "What is your purpose in the larger whole?",
    "How can you serve life today in whatever way feels true?",
    "What contribution feels most meaningful to you right now?",
    "Where do you feel called to give back?",
    "How does your unique gift want to serve the world?"
  ],
  'earth-2': [
    "What resources do you need to gather for your path?",
    "How can you build more sustainable structures in your life?",
    "What practical steps support your vision?",
    "Who are the allies that could support your journey?",
    "What foundation needs strengthening in your world?"
  ],
  'earth-3': [
    "What is your ethical code and how do you live it?",
    "How can you refine your offering to the world?",
    "What discipline or practice would serve your mastery?",
    "Where do you feel called to greater integrity?",
    "What medicine do you have to offer others?"
  ],

  // Air Prompts - Relationship & Communication
  'air-1': [
    "How do you show up in one-to-one connections?",
    "What patterns repeat in your intimate relationships?",
    "Where do you feel most connected to another person?",
    "How can you offer deeper presence in your relationships?",
    "What wants to be communicated in your closest connections?"
  ],
  'air-2': [
    "How do you contribute to collective spaces?",
    "What role do you naturally play in group dynamics?",
    "Where do you feel true belonging in community?",
    "How can you strengthen your tribe connections?",
    "What collaborative energy wants to emerge through you?"
  ],
  'air-3': [
    "How can you codify your understanding more clearly?",
    "What wisdom are you ready to teach or share?",
    "Where do you feel called to bring more clarity?",
    "What knowledge wants to be synthesized through you?",
    "How can your communication serve a larger purpose?"
  ]
};

const BALANCING_PROMPTS = {
  fire_low: [
    "Where in your life could you invite more passion and vision?",
    "What creative spark is waiting to be rekindled?",
    "How might you reconnect with your sense of purpose?",
    "What would it look like to express yourself more boldly?"
  ],
  water_low: [
    "How might you create more emotional safety in your world?",
    "Where could you invite more gentleness and nurturing?",
    "What part of you needs deeper healing or attention?",
    "How can you honor your emotional landscape today?"
  ],
  earth_low: [
    "What practical steps would ground your vision?",
    "How might you bring more structure to support your dreams?",
    "Where could you invite more stability into your life?",
    "What embodied action would serve you today?"
  ],
  air_low: [
    "How might you strengthen your connections with others?",
    "Where could you invite more communication or dialogue?",
    "What relationship needs attention or care?",
    "How can you share your thoughts more clearly?"
  ],
  fire_high: [
    "How might you ground your passionate vision with practical steps?",
    "Where could you balance your fire with more nurturing energy?",
    "What would help you express your vision more sustainably?"
  ],
  water_high: [
    "How might you channel your emotional insights into creative expression?",
    "Where could you share your healing gifts with others?",
    "What action step would honor your inner wisdom?"
  ],
  earth_high: [
    "How might you infuse more creativity into your practical work?",
    "Where could you invite more flow and inspiration?",
    "What vision wants to emerge through your grounded efforts?"
  ],
  air_high: [
    "How might you deepen your connections beyond the mental realm?",
    "Where could you invite more embodied presence?",
    "What wants to be felt as well as understood?"
  ]
};

const MILESTONE_PROMPTS = {
  FirstBloom: [
    "What feels most alive in you right now?",
    "Where do you sense sacred possibility stirring?",
    "What wants to be born through your attention today?",
    "How does this moment feel different from others?",
    "What is beginning to bloom within you?"
  ],
  PatternKeeper: [
    "What rhythm or theme keeps returning in your days?",
    "How do you see your patterns weaving together?",
    "What wisdom emerges from your recurring experiences?",
    "Where do you notice sacred repetition in your life?",
    "What pattern are you ready to honor or transform?"
  ],
  DepthSeeker: [
    "What layers are revealing themselves in your experience?",
    "Where do you feel called to go deeper?",
    "What complexity in yourself are you ready to embrace?",
    "How are the facets of your being interconnected?",
    "What depths are asking for your attention?"
  ],
  SacredGardener: [
    "How do all aspects of yourself work together as a whole?",
    "What is the medicine you offer through your complete being?",
    "Where do you see the full mandala of your gifts?",
    "How do your various qualities support each other?",
    "What wholeness are you cultivating?"
  ],
  WisdomKeeper: [
    "What wisdom flows through you to serve life?",
    "How do you embody coherence in your daily being?",
    "What does living from your center feel like?",
    "How does your presence serve the larger whole?",
    "What legacy flows through your way of being?"
  ]
};

const EMERGENCE_PROMPTS = [
  "What is trying to emerge through you today?",
  "Where do you feel creative potential stirring?",
  "What new possibility is asking for your attention?",
  "How is life wanting to express itself through you?",
  "What emergence feels ready to unfold?"
];

const INTEGRATION_PROMPTS = [
  "How do the different aspects of your experience weave together?",
  "What threads connect your recent insights?",
  "Where do you notice harmony emerging in your life?",
  "How are your various experiences serving your wholeness?",
  "What integration is naturally occurring within you?"
];

// ========== MAIA VOICE PATTERNS ==========

const MAIA_INTRODUCTIONS = {
  morning: [
    "As this new day opens, your flower is breathing gently...",
    "The morning light touches your soulprint, and I notice...",
    "Your petals are stirring with dawn's energy. Today, perhaps...",
    "I sense fresh possibility in your flowering. Consider..."
  ],
  evening: [
    "As day settles into evening, your flower holds the fullness of today...",
    "The light softens, and your soulprint glows with what you've lived. Reflect...",
    "Evening wisdom gathers in your petals. What emerges as you consider...",
    "In this twilight moment, your journey today suggests..."
  ],
  breakthrough: [
    "Something significant is shifting in your flower's pattern...",
    "I sense a beautiful opening in your soulprint. This breakthrough invites...",
    "Your petals are dancing with new energy. What wants to be explored...",
    "A golden shimmer moves through your mandala. Perhaps..."
  ],
  shadow: [
    "I notice deeper currents moving beneath your flower's surface...",
    "Your soulprint holds shadows and light together. In this tender space...",
    "The mystery of your depths is stirring. What might emerge if you ask...",
    "Even the difficult places in your pattern hold wisdom. Consider..."
  ],
  transition: [
    "Your flower is moving between states, transforming gently...",
    "I sense you're in a passage, neither here nor there. What supports you in asking...",
    "The winds of change touch your petals. As you navigate this transition...",
    "Something is completing while something new begins. Reflect on..."
  ],
  integration: [
    "All the facets of your flower are finding their harmony...",
    "Your soulprint shows a beautiful weaving of experiences. How might...",
    "I see the wholeness emerging through your journey. What feels true when you consider...",
    "The mandala of your being is singing in new coherence. Perhaps..."
  ]
};

// ========== CORE GENERATOR LOGIC ==========

export function generateJournalPrompt(request: JournalPromptRequest): JournalPrompt {
  const { petalScores, currentMilestone, contextTag, recentOfferingSessions } = request;
  
  // Calculate elemental balance
  const activeIds = Object.keys(petalScores).filter(id => petalScores[id] > 0);
  const elementalBalance = calculateElementalBalance(activeIds);
  
  // Identify dominant and deficient elements
  const dominantElement = Object.entries(elementalBalance)
    .filter(([element]) => element !== 'aether')
    .sort(([,a], [,b]) => b - a)[0]?.[0];
  
  const deficientElement = Object.entries(elementalBalance)
    .filter(([element]) => element !== 'aether')
    .sort(([,a], [,b]) => a - b)[0];
  
  const isImbalanced = deficientElement && deficientElement[1] < 0.15;
  const isOverActive = dominantElement && elementalBalance[dominantElement] > 0.5;

  // Find most activated facet
  const dominantFacet = Object.entries(petalScores)
    .filter(([,score]) => score > 0)
    .sort(([,a], [,b]) => b - a)[0];

  let prompt: JournalPrompt;

  // PRIORITY 1: Milestone-specific prompts
  if (shouldUseMilestonePrompt(currentMilestone, recentOfferingSessions)) {
    const milestonePrompts = MILESTONE_PROMPTS[currentMilestone];
    const selectedPrompt = selectRandomPrompt(milestonePrompts);
    
    prompt = {
      prompt: selectedPrompt,
      type: 'milestone',
      maiaVoice: getMaiaIntro(contextTag, currentMilestone),
      followUpQuestions: getMilestoneFollowUps(currentMilestone)
    };
  }
  
  // PRIORITY 2: Balancing prompts for imbalances
  else if (isImbalanced && deficientElement) {
    const balanceKey = `${deficientElement[0]}_low`;
    const balancePrompts = BALANCING_PROMPTS[balanceKey as keyof typeof BALANCING_PROMPTS];
    const selectedPrompt = selectRandomPrompt(balancePrompts);
    
    prompt = {
      prompt: selectedPrompt,
      type: 'balancing',
      element: deficientElement[0],
      maiaVoice: `I notice your ${deficientElement[0]} energy feels quiet today. ${getMaiaIntro(contextTag)}`,
      followUpQuestions: getBalancingFollowUps(deficientElement[0])
    };
  }
  
  // PRIORITY 3: Overactive element moderation
  else if (isOverActive) {
    const balanceKey = `${dominantElement}_high`;
    const balancePrompts = BALANCING_PROMPTS[balanceKey as keyof typeof BALANCING_PROMPTS];
    const selectedPrompt = selectRandomPrompt(balancePrompts);
    
    prompt = {
      prompt: selectedPrompt,
      type: 'balancing',
      element: dominantElement,
      maiaVoice: `Your ${dominantElement} energy is flowing strongly. ${getMaiaIntro(contextTag)}`,
      followUpQuestions: getBalancingFollowUps(dominantElement)
    };
  }
  
  // PRIORITY 4: Archetypal prompts from dominant facet
  else if (dominantFacet) {
    const [facetId] = dominantFacet;
    const facet = getFacetById(facetId);
    const facetPrompts = ARCHETYPAL_PROMPTS[facetId as keyof typeof ARCHETYPAL_PROMPTS];
    
    if (facetPrompts && facet && 'essence' in facet) {
      const selectedPrompt = selectRandomPrompt(facetPrompts);
      
      prompt = {
        prompt: selectedPrompt,
        type: 'archetypal',
        focusFacet: facetId,
        element: facet.element,
        maiaVoice: `Your ${facet.facet.toLowerCase()} facet is glowing warmly. ${getMaiaIntro(contextTag)}`,
        followUpQuestions: facet.keyQuestions
      };
    } else {
      // Fallback to emergence prompt
      prompt = createEmergencePrompt(contextTag);
    }
  }
  
  // FALLBACK: Emergence or integration prompt
  else {
    const isIntegrative = activeIds.length >= 3;
    prompt = isIntegrative 
      ? createIntegrationPrompt(contextTag, activeIds)
      : createEmergencePrompt(contextTag);
  }

  return prompt;
}

// ========== HELPER FUNCTIONS ==========

function shouldUseMilestonePrompt(milestone: MilestoneState, recentSessions: string[]): boolean {
  // Use milestone prompts when:
  // 1. First time reaching a milestone
  // 2. At significant progression points
  // 3. When no clear dominant pattern exists
  
  if (milestone === 'FirstBloom') return recentSessions.length <= 2;
  if (milestone === 'PatternKeeper') return recentSessions.length >= 3 && recentSessions.length <= 6;
  if (milestone === 'DepthSeeker') return recentSessions.length >= 7 && recentSessions.length <= 12;
  
  return false;
}

function selectRandomPrompt(prompts: string[]): string {
  return prompts[Math.floor(Math.random() * prompts.length)];
}

function getMaiaIntro(contextTag?: ContextTag, milestone?: MilestoneState): string {
  const introSets = MAIA_INTRODUCTIONS[contextTag?.toLowerCase() as keyof typeof MAIA_INTRODUCTIONS] 
    || MAIA_INTRODUCTIONS.morning;
  
  return selectRandomPrompt(introSets);
}

function getMilestoneFollowUps(milestone: MilestoneState): string[] {
  const followUps = {
    FirstBloom: ["What wants your attention first?", "How does this feel in your body?"],
    PatternKeeper: ["What pattern serves you?", "What pattern is ready to evolve?"],
    DepthSeeker: ["What layer calls for exploration?", "How do these depths connect?"],
    SacredGardener: ["What aspect needs tending?", "How do your gifts serve each other?"],
    WisdomKeeper: ["How does this wisdom want to flow?", "What would living this look like?"]
  };
  
  return followUps[milestone];
}

function getBalancingFollowUps(element: string): string[] {
  const followUps = {
    fire: ["What wants to be expressed?", "How can this energy serve?"],
    water: ["What needs healing?", "How can you honor this feeling?"],
    earth: ["What action serves your vision?", "How can you ground this energy?"],
    air: ["What wants to be communicated?", "How can this connection deepen?"]
  };
  
  return followUps[element as keyof typeof followUps] || [];
}

function createEmergencePrompt(contextTag?: ContextTag): JournalPrompt {
  return {
    prompt: selectRandomPrompt(EMERGENCE_PROMPTS),
    type: 'emergence',
    maiaVoice: getMaiaIntro(contextTag),
    followUpQuestions: ["What supports this emergence?", "How does this want to unfold?"]
  };
}

function createIntegrationPrompt(contextTag?: ContextTag, activeIds: string[]): JournalPrompt {
  const elements = activeIds.map(id => {
    const facet = getFacetById(id);
    return facet && 'element' in facet ? facet.element : null;
  }).filter(Boolean);
  
  const uniqueElements = [...new Set(elements)];
  
  return {
    prompt: selectRandomPrompt(INTEGRATION_PROMPTS),
    type: 'integration',
    maiaVoice: `Your flower shows a beautiful weaving of ${uniqueElements.join(', ')} energies. ${getMaiaIntro(contextTag)}`,
    followUpQuestions: ["What harmony is emerging?", "How do these energies support each other?"]
  };
}

// ========== CONVENIENCE FUNCTIONS ==========

export function getPromptForQuickReflection(
  activeFacets: string[],
  milestone: MilestoneState = 'FirstBloom'
): JournalPrompt {
  const scores: Record<string, number> = {};
  activeFacets.forEach(id => { scores[id] = 1; });
  
  return generateJournalPrompt({
    petalScores: scores,
    currentMilestone: milestone,
    contextTag: getTimeBasedContext(),
    recentOfferingSessions: activeFacets
  });
}

function getTimeBasedContext(): ContextTag {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Evening';
  return 'Evening';
}

export function validatePromptRequest(request: JournalPromptRequest): boolean {
  return (
    request.petalScores !== null &&
    request.currentMilestone !== null &&
    typeof request.petalScores === 'object' &&
    Object.keys(request.petalScores).length > 0
  );
}