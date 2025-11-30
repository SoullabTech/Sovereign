/**
 * Sacred Coherence Configuration
 * Maps therapeutic insights to indigenous wisdom without pathologizing
 */

export const SACRED_COHERENCE = {
  // Opening affirmations by trust level
  openings: {
    newUser: {
      text: "You arrive whole. Let's discover what wants to emerge.",
      tone: "gentle_invitation",
      elements: ["aether", "water"]
    },
    returning: {
      text: "Welcome back to your sacred work. Your medicine grows stronger.",
      tone: "recognition",
      elements: ["fire", "earth"]
    },
    deepTrust: {
      text: "Old friend, the spiral continues. What truth visits today?",
      tone: "intimacy",
      elements: ["all"]
    }
  },

  // Elemental medicine affirmations
  elementalMedicine: {
    fire: {
      strength: "Your sacred rage transforms. Your passion creates worlds.",
      shadow: "Fire without Water consumes. Time to honor your cooling.",
      practice: "Feed your flame with intention, not urgency."
    },
    water: {
      strength: "Your tears are medicine. Your depth heals others.",
      shadow: "Water without Earth floods. Time to find your banks.",
      practice: "Let your feelings flow toward purpose, not pooling."
    },
    earth: {
      strength: "Your stillness holds worlds. Your patience grows forests.",
      shadow: "Earth without Air hardens. Time to let in movement.",
      practice: "Root deep while staying supple."
    },
    air: {
      strength: "Your vision clarifies. Your words carry truth.",
      shadow: "Air without Fire scatters. Time to focus your wind.",
      practice: "Let thoughts serve action, not spin alone."
    },
    aether: {
      strength: "You bridge worlds. Your presence is ceremony.",
      shadow: "Aether without Earth drifts. Time to embody your knowing.",
      practice: "Channel mystery through grounded action."
    }
  },

  // Friction patterns (non-pathologizing)
  frictionMaps: {
    anxiety: {
      clinical: "Sympathetic nervous system activation",
      indigenous: "Air element seeking Earth's anchor",
      reframe: "Your sensitivity is heightened. This is information, not emergency."
    },
    depression: {
      clinical: "Neurotransmitter imbalance",
      indigenous: "Water element in sacred winter",
      reframe: "You're composting old stories. Decay feeds new growth."
    },
    anger: {
      clinical: "Emotional dysregulation",
      indigenous: "Fire element defending boundaries",
      reframe: "Your NO is sacred. What needs protecting?"
    },
    numbness: {
      clinical: "Dissociation",
      indigenous: "Aether element avoiding Earth",
      reframe: "You've traveled far from body. Time to return home."
    },
    overwhelm: {
      clinical: "Cognitive overload",
      indigenous: "All elements spinning without center",
      reframe: "The spiral moved too fast. Pause at center."
    }
  },

  // Integrated practices (both/and)
  practices: {
    grounding: {
      therapeutic: {
        name: "5-4-3-2-1 Sensory Grounding",
        instruction: "Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.",
        target: "Activates prefrontal cortex, reduces amygdala activation"
      },
      indigenous: {
        name: "Earth Remembering Ritual",
        instruction: "Place bare feet on earth. Say: 'Earth, remember me. I remember you.'",
        target: "Returns soul to body through sacred reciprocity"
      },
      microStep: "Touch one living thing today with full presence."
    },
    
    regulation: {
      therapeutic: {
        name: "Vagal Breathing",
        instruction: "Inhale 4 counts, hold 4, exhale 6, hold 2. Repeat 4 cycles.",
        target: "Stimulates vagus nerve, shifts to parasympathetic"
      },
      indigenous: {
        name: "Wind Horse Breathing",
        instruction: "Breathe in strength, breathe out what's complete. Let Wind carry it.",
        target: "Releases what's done to make space for what comes"
      },
      microStep: "Three conscious breaths before your next transition."
    },
    
    release: {
      therapeutic: {
        name: "Emotional Freedom Technique",
        instruction: "Tap meridian points while stating the issue and self-acceptance.",
        target: "Disrupts emotional pattern, integrates hemispheres"
      },
      indigenous: {
        name: "Water Release Ceremony",
        instruction: "Speak troubles into water, pour it onto earth with thanks.",
        target: "Returns emotional energy to larger cycle"
      },
      microStep: "Name one feeling out loud before bed."
    },
    
    protection: {
      therapeutic: {
        name: "Boundary Setting Script",
        instruction: "State: 'I have the right to... I choose to... I will...'",
        target: "Reinforces prefrontal executive function"
      },
      indigenous: {
        name: "Sacred NO Ritual",
        instruction: "Draw a circle around yourself. State what cannot enter.",
        target: "Creates energetic boundary through embodied declaration"
      },
      microStep: "Say no to one small thing today."
    }
  },

  // Closing affirmations
  closings: {
    fire: "Your flame knows its purpose. Burn bright, burn true.",
    water: "Your depths hold medicine. Flow toward your knowing.",
    earth: "Your roots remember. Stand in your ancient strength.",
    air: "Your vision carries forward. Breathe into tomorrow.",
    aether: "You bridge all worlds. Walk between with grace.",
    integration: "You are not broken. You are becoming."
  },

  // Continuity tracking
  spiralMarkers: {
    initiation: "First recognition of pattern",
    descent: "Moving into the friction",
    transformation: "Alchemy in process",
    integration: "Embodying new knowing",
    return: "Gifting medicine forward"
  }
};

/**
 * Get appropriate sacred response based on context
 */
export function getSacredResponse(
  trustLevel: number,
  element: string,
  pattern?: string
): {
  opening: string;
  medicine: string;
  practice: any;
  closing: string;
} {
  // Determine trust-based opening
  let opening = SACRED_COHERENCE.openings.newUser.text;
  if (trustLevel > 0.7) {
    opening = SACRED_COHERENCE.openings.deepTrust.text;
  } else if (trustLevel > 0.3) {
    opening = SACRED_COHERENCE.openings.returning.text;
  }

  // Get elemental medicine
  const elementLower = element.toLowerCase();
  const medicine = SACRED_COHERENCE.elementalMedicine[elementLower]?.strength || 
                   SACRED_COHERENCE.elementalMedicine.aether.strength;

  // Select appropriate practice
  const practiceKey = pattern || 'grounding';
  const practice = SACRED_COHERENCE.practices[practiceKey] || 
                   SACRED_COHERENCE.practices.grounding;

  // Get closing affirmation
  const closing = SACRED_COHERENCE.closings[elementLower] || 
                  SACRED_COHERENCE.closings.integration;

  return {
    opening,
    medicine,
    practice,
    closing
  };
}