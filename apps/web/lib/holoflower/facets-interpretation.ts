/**
 * Spiralogic Holoflower - 12 Facets Interpretation System
 * Each facet represents a dimension of human experience
 * Petal position indicates the current state/engagement level
 */

export interface FacetInterpretation {
  id: string;
  name: string;
  element: 'earth' | 'fire' | 'water' | 'air';
  angle: number; // 0-360 degrees
  color: string;
  domain: string; // Life domain this facet governs
  
  // Interpretive meanings based on petal extension
  positions: {
    retracted: {
      value: [0.0, 0.25]; // Petal pulled toward center
      state: string;
      meaning: string;
      guidance: string;
    };
    emerging: {
      value: [0.25, 0.5]; // Petal partially extended
      state: string;
      meaning: string;
      guidance: string;
    };
    balanced: {
      value: [0.5, 0.75]; // Petal at middle position
      state: string;
      meaning: string;
      guidance: string;
    };
    extended: {
      value: [0.75, 1.0]; // Petal fully extended outward
      state: string;
      meaning: string;
      guidance: string;
    };
  };
  
  // Archetypal associations
  archetype: string;
  keywords: string[];
  chakra?: string;
  planetaryRuler?: string;
}

export const TWELVE_FACETS: FacetInterpretation[] = [
  // EARTH ELEMENT - Material World & Grounding (3 facets)
  {
    id: 'earth-foundation',
    name: 'Foundation',
    element: 'earth',
    angle: 210,
    color: '#947013',
    domain: 'Physical Security & Stability',
    positions: {
      retracted: {
        value: [0.0, 0.25],
        state: 'Unstable',
        meaning: 'Feeling ungrounded, lacking foundation',
        guidance: 'Focus on creating physical stability and routine'
      },
      emerging: {
        value: [0.25, 0.5],
        state: 'Building',
        meaning: 'Beginning to establish roots and structure',
        guidance: 'Continue developing your support systems'
      },
      balanced: {
        value: [0.5, 0.75],
        state: 'Grounded',
        meaning: 'Solid foundation, stable and secure',
        guidance: 'Maintain your practices while remaining flexible'
      },
      extended: {
        value: [0.75, 1.0],
        state: 'Rigid',
        meaning: 'Over-attached to security, resistant to change',
        guidance: 'Allow more flow and adaptability'
      }
    },
    archetype: 'The Builder',
    keywords: ['stability', 'security', 'roots', 'home', 'tradition'],
    chakra: 'Root',
    planetaryRuler: 'Saturn'
  },
  {
    id: 'earth-abundance',
    name: 'Abundance',
    element: 'earth',
    angle: 240,
    color: '#B8941F',
    domain: 'Resources & Material Wealth',
    positions: {
      retracted: {
        value: [0.0, 0.25],
        state: 'Scarcity',
        meaning: 'Experiencing lack, poverty consciousness',
        guidance: 'Shift focus from lack to gratitude'
      },
      emerging: {
        value: [0.25, 0.5],
        state: 'Growing',
        meaning: 'Resources beginning to accumulate',
        guidance: 'Trust in your ability to generate wealth'
      },
      balanced: {
        value: [0.5, 0.75],
        state: 'Abundant',
        meaning: 'Healthy relationship with resources',
        guidance: 'Share your abundance while honoring your needs'
      },
      extended: {
        value: [0.75, 1.0],
        state: 'Excess',
        meaning: 'Hoarding, materialistic attachment',
        guidance: 'Practice generosity and non-attachment'
      }
    },
    archetype: 'The Provider',
    keywords: ['wealth', 'resources', 'value', 'worth', 'prosperity'],
    chakra: 'Root/Sacral',
    planetaryRuler: 'Venus/Jupiter'
  },
  {
    id: 'earth-embodiment',
    name: 'Embodiment',
    element: 'earth',
    angle: 270,
    color: '#D4AF37',
    domain: 'Physical Health & Body Wisdom',
    positions: {
      retracted: {
        value: [0.0, 0.25],
        state: 'Disconnected',
        meaning: 'Out of touch with body, neglecting health',
        guidance: 'Return to body awareness and self-care'
      },
      emerging: {
        value: [0.25, 0.5],
        state: 'Awakening',
        meaning: 'Beginning to honor physical needs',
        guidance: 'Develop consistent health practices'
      },
      balanced: {
        value: [0.5, 0.75],
        state: 'Embodied',
        meaning: 'Fully present in body, vibrant health',
        guidance: 'Continue honoring your body temple'
      },
      extended: {
        value: [0.75, 1.0],
        state: 'Obsessive',
        meaning: 'Over-focused on physical, body obsession',
        guidance: 'Balance physical with other dimensions'
      }
    },
    archetype: 'The Temple',
    keywords: ['health', 'vitality', 'presence', 'senses', 'pleasure'],
    chakra: 'All physical chakras',
    planetaryRuler: 'Earth'
  },

  // FIRE ELEMENT - Passion & Transformation (3 facets)
  {
    id: 'fire-passion',
    name: 'Passion',
    element: 'fire',
    angle: 300,
    color: '#CD8A7A',
    domain: 'Creative Fire & Life Force',
    positions: {
      retracted: {
        value: [0.0, 0.25],
        state: 'Dormant',
        meaning: 'Lack of enthusiasm, creative blocks',
        guidance: 'Reconnect with what truly excites you'
      },
      emerging: {
        value: [0.25, 0.5],
        state: 'Sparking',
        meaning: 'Passion beginning to ignite',
        guidance: 'Fan the flames with action'
      },
      balanced: {
        value: [0.5, 0.75],
        state: 'Burning',
        meaning: 'Healthy passion, creative flow',
        guidance: 'Channel this fire into manifestation'
      },
      extended: {
        value: [0.75, 1.0],
        state: 'Consuming',
        meaning: 'Burnout, overwhelming intensity',
        guidance: 'Temper passion with patience'
      }
    },
    archetype: 'The Creator',
    keywords: ['creativity', 'sexuality', 'desire', 'art', 'expression'],
    chakra: 'Sacral/Solar Plexus',
    planetaryRuler: 'Mars'
  },
  {
    id: 'fire-will',
    name: 'Will',
    element: 'fire',
    angle: 330,
    color: '#B56C5A',
    domain: 'Personal Power & Determination',
    positions: {
      retracted: {
        value: [0.0, 0.25],
        state: 'Powerless',
        meaning: 'Weak will, victim consciousness',
        guidance: 'Reclaim your personal power'
      },
      emerging: {
        value: [0.25, 0.5],
        state: 'Strengthening',
        meaning: 'Building confidence and determination',
        guidance: 'Set clear boundaries and intentions'
      },
      balanced: {
        value: [0.5, 0.75],
        state: 'Empowered',
        meaning: 'Strong will, healthy assertiveness',
        guidance: 'Use power wisely and compassionately'
      },
      extended: {
        value: [0.75, 1.0],
        state: 'Dominating',
        meaning: 'Controlling, aggressive, forceful',
        guidance: 'Soften control, allow collaboration'
      }
    },
    archetype: 'The Warrior',
    keywords: ['power', 'courage', 'leadership', 'action', 'confidence'],
    chakra: 'Solar Plexus',
    planetaryRuler: 'Sun/Mars'
  },
  {
    id: 'fire-transformation',
    name: 'Transformation',
    element: 'fire',
    angle: 0,
    color: '#9D4E3A',
    domain: 'Change & Spiritual Alchemy',
    positions: {
      retracted: {
        value: [0.0, 0.25],
        state: 'Stagnant',
        meaning: 'Resisting change, stuck patterns',
        guidance: 'Embrace the invitation to transform'
      },
      emerging: {
        value: [0.25, 0.5],
        state: 'Shifting',
        meaning: 'Beginning metamorphosis',
        guidance: 'Trust the process of becoming'
      },
      balanced: {
        value: [0.5, 0.75],
        state: 'Alchemizing',
        meaning: 'Active transformation, rebirth',
        guidance: 'Stay present through the changes'
      },
      extended: {
        value: [0.75, 1.0],
        state: 'Chaotic',
        meaning: 'Constant upheaval, no integration',
        guidance: 'Allow time for integration'
      }
    },
    archetype: 'The Phoenix',
    keywords: ['rebirth', 'alchemy', 'death', 'renewal', 'metamorphosis'],
    chakra: 'All chakras',
    planetaryRuler: 'Pluto'
  },

  // WATER ELEMENT - Emotions & Intuition (3 facets)
  {
    id: 'water-emotion',
    name: 'Emotion',
    element: 'water',
    angle: 30,
    color: '#3F8BAB',
    domain: 'Emotional Intelligence & Flow',
    positions: {
      retracted: {
        value: [0.0, 0.25],
        state: 'Suppressed',
        meaning: 'Emotions blocked, numbness',
        guidance: 'Create safe space for feeling'
      },
      emerging: {
        value: [0.25, 0.5],
        state: 'Opening',
        meaning: 'Beginning to feel and express',
        guidance: 'Honor all emotions as messengers'
      },
      balanced: {
        value: [0.5, 0.75],
        state: 'Flowing',
        meaning: 'Healthy emotional expression',
        guidance: 'Continue emotional authenticity'
      },
      extended: {
        value: [0.75, 1.0],
        state: 'Flooding',
        meaning: 'Emotional overwhelm, drama',
        guidance: 'Develop emotional regulation'
      }
    },
    archetype: 'The Feeler',
    keywords: ['feelings', 'empathy', 'compassion', 'vulnerability', 'heart'],
    chakra: 'Heart',
    planetaryRuler: 'Moon'
  },
  {
    id: 'water-intuition',
    name: 'Intuition',
    element: 'water',
    angle: 60,
    color: '#5FA3BF',
    domain: 'Inner Knowing & Psychic Senses',
    positions: {
      retracted: {
        value: [0.0, 0.25],
        state: 'Disconnected',
        meaning: 'Cut off from intuition',
        guidance: 'Create quiet space for inner listening'
      },
      emerging: {
        value: [0.25, 0.5],
        state: 'Sensing',
        meaning: 'Intuitive abilities awakening',
        guidance: 'Trust your first instincts'
      },
      balanced: {
        value: [0.5, 0.75],
        state: 'Attuned',
        meaning: 'Clear intuitive channel',
        guidance: 'Act on intuitive guidance'
      },
      extended: {
        value: [0.75, 1.0],
        state: 'Ungrounded',
        meaning: 'Lost in psychic realms',
        guidance: 'Ground intuition in practical action'
      }
    },
    archetype: 'The Oracle',
    keywords: ['psychic', 'dreams', 'visions', 'knowing', 'mysticism'],
    chakra: 'Third Eye',
    planetaryRuler: 'Neptune'
  },
  {
    id: 'water-connection',
    name: 'Connection',
    element: 'water',
    angle: 90,
    color: '#7FBBD3',
    domain: 'Relationships & Sacred Bonds',
    positions: {
      retracted: {
        value: [0.0, 0.25],
        state: 'Isolated',
        meaning: 'Disconnected, lonely, withdrawn',
        guidance: 'Risk vulnerability in connection'
      },
      emerging: {
        value: [0.25, 0.5],
        state: 'Reaching',
        meaning: 'Opening to connection',
        guidance: 'Take small steps toward others'
      },
      balanced: {
        value: [0.5, 0.75],
        state: 'Connected',
        meaning: 'Healthy, nourishing relationships',
        guidance: 'Deepen bonds while maintaining self'
      },
      extended: {
        value: [0.75, 1.0],
        state: 'Enmeshed',
        meaning: 'Codependent, lost in others',
        guidance: 'Strengthen individual boundaries'
      }
    },
    archetype: 'The Lover',
    keywords: ['love', 'intimacy', 'family', 'community', 'belonging'],
    chakra: 'Heart/Sacral',
    planetaryRuler: 'Venus'
  },

  // AIR ELEMENT - Mind & Communication (3 facets)
  {
    id: 'air-mind',
    name: 'Mind',
    element: 'air',
    angle: 120,
    color: '#4A6B35',
    domain: 'Mental Clarity & Intelligence',
    positions: {
      retracted: {
        value: [0.0, 0.25],
        state: 'Foggy',
        meaning: 'Mental confusion, unclear thinking',
        guidance: 'Clear mental clutter, simplify'
      },
      emerging: {
        value: [0.25, 0.5],
        state: 'Clarifying',
        meaning: 'Thoughts becoming organized',
        guidance: 'Continue mental disciplines'
      },
      balanced: {
        value: [0.5, 0.75],
        state: 'Clear',
        meaning: 'Sharp mind, clear perspective',
        guidance: 'Apply wisdom to decisions'
      },
      extended: {
        value: [0.75, 1.0],
        state: 'Overthinking',
        meaning: 'Analysis paralysis, mental loops',
        guidance: 'Move from thinking to feeling'
      }
    },
    archetype: 'The Scholar',
    keywords: ['thought', 'logic', 'analysis', 'learning', 'wisdom'],
    chakra: 'Crown/Third Eye',
    planetaryRuler: 'Mercury'
  },
  {
    id: 'air-communication',
    name: 'Communication',
    element: 'air',
    angle: 150,
    color: '#62834D',
    domain: 'Expression & Sacred Speech',
    positions: {
      retracted: {
        value: [0.0, 0.25],
        state: 'Silent',
        meaning: 'Unable to express, voiceless',
        guidance: 'Find your authentic voice'
      },
      emerging: {
        value: [0.25, 0.5],
        state: 'Speaking',
        meaning: 'Beginning to express truth',
        guidance: 'Practice speaking your needs'
      },
      balanced: {
        value: [0.5, 0.75],
        state: 'Articulate',
        meaning: 'Clear, effective communication',
        guidance: 'Continue speaking your truth'
      },
      extended: {
        value: [0.75, 1.0],
        state: 'Verbose',
        meaning: 'Over-talking, not listening',
        guidance: 'Balance speaking with listening'
      }
    },
    archetype: 'The Messenger',
    keywords: ['speech', 'writing', 'teaching', 'listening', 'dialogue'],
    chakra: 'Throat',
    planetaryRuler: 'Mercury'
  },
  {
    id: 'air-vision',
    name: 'Vision',
    element: 'air',
    angle: 180,
    color: '#7A9B65',
    domain: 'Future Vision & Higher Perspective',
    positions: {
      retracted: {
        value: [0.0, 0.25],
        state: 'Shortsighted',
        meaning: 'No vision, stuck in present',
        guidance: 'Lift your gaze to possibilities'
      },
      emerging: {
        value: [0.25, 0.5],
        state: 'Glimpsing',
        meaning: 'Beginning to see potential',
        guidance: 'Clarify your vision'
      },
      balanced: {
        value: [0.5, 0.75],
        state: 'Visionary',
        meaning: 'Clear vision of possibilities',
        guidance: 'Take steps toward your vision'
      },
      extended: {
        value: [0.75, 1.0],
        state: 'Unrealistic',
        meaning: 'Lost in fantasy, ungrounded dreams',
        guidance: 'Ground vision in practical steps'
      }
    },
    archetype: 'The Visionary',
    keywords: ['future', 'dreams', 'innovation', 'possibility', 'imagination'],
    chakra: 'Third Eye/Crown',
    planetaryRuler: 'Uranus'
  }
];

/**
 * Get interpretation for a specific petal position
 * @param facetId - The facet identifier
 * @param position - Value between 0 and 1 (0 = center, 1 = fully extended)
 */
export function interpretPetalPosition(facetId: string, position: number): {
  state: string;
  meaning: string;
  guidance: string;
  intensity: 'retracted' | 'emerging' | 'balanced' | 'extended';
} {
  const facet = TWELVE_FACETS.find(f => f.id === facetId);
  if (!facet) throw new Error(`Facet ${facetId} not found`);

  if (position <= 0.25) {
    return { ...facet.positions.retracted, intensity: 'retracted' };
  } else if (position <= 0.5) {
    return { ...facet.positions.emerging, intensity: 'emerging' };
  } else if (position <= 0.75) {
    return { ...facet.positions.balanced, intensity: 'balanced' };
  } else {
    return { ...facet.positions.extended, intensity: 'extended' };
  }
}

/**
 * Get overall holoflower reading based on all petal positions
 */
export function getHoloflowerReading(petalPositions: Record<string, number>): {
  dominantElement: string;
  balanceScore: number;
  activeFacets: string[];
  dormantFacets: string[];
  guidance: string;
  archetypes: string[];
} {
  const elements = { earth: 0, fire: 0, water: 0, air: 0 };
  const activeFacets: string[] = [];
  const dormantFacets: string[] = [];
  const archetypes: string[] = [];
  
  let totalBalance = 0;
  let facetCount = 0;

  for (const [facetId, position] of Object.entries(petalPositions)) {
    const facet = TWELVE_FACETS.find(f => f.id === facetId);
    if (!facet) continue;

    // Track element engagement
    elements[facet.element] += position;
    
    // Calculate balance (0.5 is perfectly balanced)
    const balanceDistance = Math.abs(position - 0.5);
    totalBalance += (1 - balanceDistance * 2); // Convert to 0-1 scale
    facetCount++;

    // Track active vs dormant
    if (position > 0.6) {
      activeFacets.push(facet.name);
      archetypes.push(facet.archetype);
    } else if (position < 0.3) {
      dormantFacets.push(facet.name);
    }
  }

  // Find dominant element
  const dominantElement = Object.entries(elements).reduce((a, b) => 
    elements[a[0]] > elements[b[0]] ? a : b
  )[0];

  // Calculate overall balance
  const balanceScore = facetCount > 0 ? totalBalance / facetCount : 0;

  // Generate guidance
  let guidance = '';
  if (balanceScore > 0.7) {
    guidance = 'You are in a state of beautiful balance. Continue your practices while remaining open to growth.';
  } else if (balanceScore > 0.4) {
    guidance = 'You are finding your equilibrium. Focus on the facets that feel most out of balance.';
  } else {
    guidance = 'Your system is calling for rebalancing. Start with small, consistent actions in your dormant facets.';
  }

  if (dominantElement === 'earth' && elements.earth > elements.fire * 2) {
    guidance += ' Ground your earth energy with more fire and passion.';
  } else if (dominantElement === 'fire' && elements.fire > elements.water * 2) {
    guidance += ' Cool your fire with emotional flow and intuition.';
  } else if (dominantElement === 'water' && elements.water > elements.air * 2) {
    guidance += ' Balance emotions with mental clarity and communication.';
  } else if (dominantElement === 'air' && elements.air > elements.earth * 2) {
    guidance += ' Ground your mental energy in physical practices.';
  }

  return {
    dominantElement,
    balanceScore,
    activeFacets,
    dormantFacets,
    guidance,
    archetypes: [...new Set(archetypes)] // Remove duplicates
  };
}