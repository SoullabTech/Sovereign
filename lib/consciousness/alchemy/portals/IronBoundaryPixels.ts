// @ts-nocheck
/**
 * Disposable Pixels for Iron Boundary Rupture State
 *
 * Semantic meaning: The protective structures that once served you are breaking down.
 * What seemed solid and unchangeable is revealing its impermanence. This is not
 * destruction but transformation - the rigid boundaries that kept you safe in one
 * phase of life are dissolving to allow expansion into the next.
 */

import type {
  PortalId,
  ComplexityTier,
  BaseEngineState,
  BasePixelConfig,
} from './PortalTypes';

export interface IronBoundaryEngineState extends BaseEngineState {
  state: 'iron_boundary_rupture';
  intensity: number; // 0-100, how intense the boundary dissolution is
  rigidity_patterns: string[]; // Which structures are dissolving
  emerging_capacity: string; // What's becoming possible
  support_needed: 'grounding' | 'courage' | 'witnesses';
  rupture_velocity: 'gradual' | 'sudden' | 'seismic';
}

export interface IronBoundaryPixelConfig {
  headline: string;
  icon: string;
  subtext: string;
  ctaLabel: string;
  microPracticeLabel: string;
  microPracticeSteps: string[];
  urgencyIndicator?: string;
  supportMessage: string;

  // Styling and presentation
  colorTheme: {
    primary: string;
    background: string;
    accent: string;
  };
  toneKey: 'mythic' | 'clinical' | 'strategic';

  // Progressive disclosure
  advancedPanelLabel?: string;
  advancedPanelDescription?: string;

  // Safety adaptations
  emergencyOverride?: {
    headline: string;
    message: string;
    action: string;
  };

  // Complexity tier adaptations - disposable pixel philosophy in action
  complexityAdaptations?: {
    beginner?: Partial<IronBoundaryPixelConfig>;
    intermediate?: Partial<IronBoundaryPixelConfig>;
    advanced?: Partial<IronBoundaryPixelConfig>;
  };

  // Hide entire card for specific tiers (useful for facilitator-only content)
  hiddenForTiers?: ComplexityTier[];
}

// Core pixel mappings for each portal
export const IRON_BOUNDARY_PIXEL_MAP: Partial<Record<PortalId, IronBoundaryPixelConfig>> = {
  shamanic: {
    headline: 'The Armor is Cracking',
    icon: '🛡️',
    subtext: 'The protections you forged in harder times are beginning to crack. They once kept you safe; now they keep you small. The crack is where new life wants to move.',
    ctaLabel: 'Listen to the Cracked Shield',
    microPracticeLabel: 'Armor Listening Ritual',
    microPracticeSteps: [
      'Close your eyes and imagine the armor you wear around your heart or body today.',
      'Notice where it feels too tight, too heavy, or no longer true.',
      'Ask that armor: "What were you protecting me from? What do you need now?"',
      'Thank it for its service, and imagine loosening or opening one small section.'
    ],
    supportMessage: 'The dissolution of old armor is sacred work that requires witnessing and support.',
    colorTheme: {
      primary: '#78350f', // deep earth/bronze
      background: '#f6f1ec',
      accent: '#f97316'  // molten orange
    },
    toneKey: 'mythic',
    advancedPanelLabel: 'Show Underworld Gate',
    advancedPanelDescription: 'Iron boundary rupture is an underworld gate: the old war-armor of the soul is breaking so you can enter life less as a soldier and more as a steward.',
    emergencyOverride: {
      headline: 'Sacred Boundary Breach',
      message: 'Something or someone may be crossing your deeper limits. You are not meant to endure harm as initiation. Sacred help is needed now.',
      action: 'Seek Immediate Protection & Support'
    },
    complexityAdaptations: {
      beginner: {
        subtext: 'The ways you have kept yourself safe are starting to feel too tight. There is nothing wrong with you. Your soul is asking for a gentler kind of protection.',
        microPracticeLabel: 'Simple Boundary Check',
        microPracticeSteps: [
          'Think of one situation where you said yes but wanted to say no.',
          'Place a hand on your heart and quietly say: "I am allowed to protect my energy."',
          'Imagine drawing a soft circle of light around you that lets love in but keeps harm out.'
        ],
        advancedPanelLabel: undefined,
        advancedPanelDescription: undefined
      },
      advanced: {
        subtext: 'You are in a classic iron phase: the warrior defenses that once served you are calcified. The rupture is inviting a shift from armored will to embodied sovereignty.',
        microPracticeLabel: 'Warrior-to-Guardian Transition',
        microPracticeSteps: [
          'Identify three "iron vows" or hard rules you made in earlier life (e.g., "I will never need anyone," "I always handle it myself").',
          'Track where those vows now cut you off from support, intimacy, or truth.',
          'Offer one vow to the fire (symbolically or literally) and rewrite it as a guardian vow that protects life rather than just your walls.'
        ]
      }
    }
  },

  therapeutic: {
    headline: 'Your Defenses Are Softening',
    icon: '🧱',
    subtext:
      'Patterns that once protected you—emotional walls, over-control, withdrawal—are starting to crack. This can feel frightening, but it is often a sign that your system is ready for safer connection.',
    ctaLabel: 'Explore Your Boundaries Safely',
    microPracticeLabel: 'Defense Awareness Exercise',
    microPracticeSteps: [
      'Recall a recent situation where you shut down, lashed out, or over-accommodated.',
      'Name the defense you used (for example: sarcasm, perfectionism, people-pleasing, emotional shutdown).',
      'Ask: "What was this part of me trying to protect?"',
      'Note one safer way you might protect that same vulnerability in future.',
    ],
    supportMessage:
      'As defenses soften, your system may feel exposed. We focus first on safety and resourcing while you learn new ways to protect what matters.',
    colorTheme: {
      primary: '#2563eb',   // therapeutic blue
      background: '#eff6ff', // soft blue background
      accent: '#06b6d4',    // teal accent
    },
    toneKey: 'clinical',
    advancedPanelLabel: 'View Boundary Dynamics',
    advancedPanelDescription:
      'Iron boundary rupture often appears when long-standing defenses begin to fail. This can involve attachment patterns, trauma responses, and rigid self-concepts reaching their adaptive limit.',

    emergencyOverride: {
      headline: 'Boundary Breakdown – Safety First',
      message:
        'If you are experiencing impulsive behavior, self-harm urges, or unsafe situations as your defenses crack, immediate professional support is recommended.',
      action: 'Contact a trusted professional or crisis service',
    },

    complexityAdaptations: {
      beginner: {
        subtext:
          'You might notice yourself reacting more strongly or feeling "too open." This can be scary, but it is your system trying to find a healthier way to protect you.',
        microPracticeLabel: 'Gentle Self-Protection',
        microPracticeSteps: [
          'Think of one person or situation where you feel "too exposed."',
          'Place your hand on your chest and say: "I am allowed to have limits."',
          'Write down one simple sentence you can use to set a small boundary (for example: "I can\'t talk about this right now, can we pause?").',
        ],
        advancedPanelLabel: undefined,
        advancedPanelDescription: undefined,
      },

      advanced: {
        subtext:
          'You may be encountering de-compensating defenses: strategies that once regulated affect now create dysregulation. The task is to cultivate flexible, relational boundaries rather than rigid, absolute ones.',
        microPracticeLabel: 'Clinical Boundary Mapping',
        microPracticeSteps: [
          'Map three contexts (work, intimacy, family) and note where your boundaries tend to be too rigid versus too porous.',
          'For each, identify one "flex point" where you can practice a more nuanced response (for example: partial disclosure, clearer request, time-limited engagement).',
          'Track emotional and somatic responses to these micro-changes over 1–2 weeks and bring observations into therapy or supervision.',
        ],
      },
    },
  },

  corporate: {
    headline: 'Your Operating Boundaries Are Misaligned',
    icon: '📐',
    subtext:
      'The way you have been holding responsibility, access, and decision-making is reaching its breaking point. The boundaries that once created stability now generate friction.',
    ctaLabel: 'Re-draw Your Leadership Boundaries',
    microPracticeLabel: 'Leadership Boundary Audit',
    microPracticeSteps: [
      'List key areas where you feel overloaded, resentful, or chronically interrupted.',
      'Mark which of these are due to unclear ownership, unclear access, or unclear expectations.',
      'Circle one area where you can clarify a boundary this week (for example: decision rights, meeting participation, communication windows).',
      'Draft a simple, respectful message to communicate this new boundary.',
    ],
    supportMessage:
      'Boundary strain at this level is a structural signal, not a personal failure. The work is to redesign how responsibility, access, and decisions are held.',
    colorTheme: {
      primary: '#0f172a',   // deep navy
      background: '#f8fafc', // light, neutral background
      accent: '#f97316',    // purposeful orange
    },
    toneKey: 'strategic',
    advancedPanelLabel: 'See Structural Pattern',
    advancedPanelDescription:
      'Iron boundary rupture at the leadership level often signals a transition from heroic, hands-on control to systems-level governance: redefining span of control, escalation paths, and decision rights.',

    emergencyOverride: {
      headline: 'Critical Boundary Collapse',
      message:
        'If you are at risk of burnout, ethical compromise, or severe relational fallout, this is a red-level leadership boundary event. Immediate structural intervention is needed.',
      action: 'Initiate emergency leadership support',
    },

    complexityAdaptations: {
      beginner: {
        subtext:
          'You are being stretched beyond what your current way of leading can handle. This does not mean you are failing; it means the structure around you needs to change.',
        microPracticeLabel: 'Simple Boundary Reset',
        microPracticeSteps: [
          'Identify one meeting, thread, or responsibility you can delegate, decline, or time-box this week.',
          'Clarify what you are saying no to, and what you are still committed to delivering.',
          'Schedule a short conversation or message to align expectations with key stakeholders.',
        ],
        advancedPanelLabel: undefined,
        advancedPanelDescription: undefined,
      },

      advanced: {
        subtext:
          'You are at a pivot from operator to architect. The breakdown of your current boundary model is an invitation to redesign authority, accountability, and information flow.',
        microPracticeLabel: 'Architecture-Level Boundary Design',
        microPracticeSteps: [
          'Draw your current leadership "boundary map": who has access to you, what decisions you personally hold, and where bottlenecks occur.',
          'Define your ideal boundary map 12–18 months from now: what you should no longer own, where decisions should move closer to the edge, and what escalations should remain with you.',
          'Design a 30-day experiment where you explicitly redistribute one cluster of decisions or access patterns and track impact on performance, morale, and your energy.',
        ],
      },
    },
  },

  recovery: {
    headline: 'Your Old Protection System Is Breaking Down',
    icon: '💎',
    subtext: 'The survival patterns that got you through active addiction or trauma are cracking apart. This feels scary, but these defenses are dissolving because you\'re ready for connection and truth.',
    ctaLabel: 'Honor the Breakdown',
    microPracticeLabel: 'Inventory Your Armor',
    microPracticeSteps: [
      'List three ways you protected yourself during your hardest times (isolation, control, perfectionism, etc.).',
      'For each, ask: "How did this serve me then? How does it limit me now?"',
      'Choose one pattern you\'re ready to soften this week.',
      'Share this intention with someone you trust in recovery.'
    ],
    supportMessage: 'Breaking down old protection is terrifying and sacred work that requires your recovery community.',
    colorTheme: {
      primary: '#059669', // recovery green
      background: '#f0fdf4',
      accent: '#10b981'
    },
    toneKey: 'clinical',
    advancedPanelLabel: 'Show Recovery Science',
    advancedPanelDescription: 'Iron boundary rupture in recovery often occurs when trauma-based survival strategies begin to interfere with healthy attachment and authentic living.',
    emergencyOverride: {
      headline: 'Relapse Risk - Boundary Collapse',
      message: 'If you\'re using substances to cope with these feelings, or if you\'re having thoughts of self-harm, this is a recovery emergency.',
      action: 'Contact sponsor or treatment provider immediately'
    },
    complexityAdaptations: {
      beginner: {
        subtext: 'The ways you kept yourself safe before are starting to feel too heavy. This is normal in recovery - you\'re learning to live without armor.',
        microPracticeLabel: 'Simple Boundary Practice',
        microPracticeSteps: [
          'Think of one situation this week where you said yes but felt resentful.',
          'Place your hand on your heart and say: "I can protect myself without walls."',
          'Tell one trusted person in your recovery circle about this experience.'
        ],
        advancedPanelLabel: undefined,
        advancedPanelDescription: undefined
      },
      advanced: {
        subtext: 'You\'re experiencing the dissolution of trauma-based object relations and moving toward secure attachment. This is terrifying and necessary.',
        microPracticeLabel: 'Attachment Boundary Work',
        microPracticeSteps: [
          'Map your attachment patterns in three key relationships: sponsor, intimate partner, and close friend.',
          'Notice where you default to isolation, control, or people-pleasing when triggered.',
          'Practice one vulnerable truth-telling with appropriate boundaries this week.',
          'Track emotional and somatic responses in a recovery journal.'
        ]
      }
    }
  },

  creative: {
    headline: 'Your Creative Boundaries Are Dissolving',
    icon: '🎭',
    subtext: 'The structures that once contained your creative expression - rules about what\'s "good enough," who you\'re "allowed" to be, what\'s "realistic" - are breaking down to make space for what wants to be born.',
    ctaLabel: 'Trust the Creative Chaos',
    microPracticeLabel: 'Boundary Dissolution Ritual',
    microPracticeSteps: [
      'Write down three creative "rules" you\'ve been following (e.g., "I\'m not a real artist," "I have to finish everything I start").',
      'For each rule, ask: "Whose voice is this really? What am I protecting myself from?"',
      'Choose one rule to ceremonially release - tear up the paper, burn it, or bury it.',
      'Create something today without any rules at all - 5 minutes of pure expression.'
    ],
    supportMessage: 'Creative boundary dissolution requires witnesses who can see and celebrate your emerging expression.',
    colorTheme: {
      primary: '#7c3aed', // creative purple
      background: '#faf5ff',
      accent: '#a855f7'
    },
    toneKey: 'mythic',
    advancedPanelLabel: 'Show Creative Initiation',
    advancedPanelDescription: 'Iron boundary rupture for creators is often an initiation: the structures that kept you safe in the mundane world must dissolve for you to birth what has never existed.',
    emergencyOverride: {
      headline: 'Creative Emergency - Destructive Spiral',
      message: 'If boundary dissolution is leading to self-destructive behavior, artistic obsession that harms relationships, or creative blocks that trigger despair, immediate support is needed.',
      action: 'Seek creative mentorship or therapeutic support'
    },
    complexityAdaptations: {
      beginner: {
        subtext: 'You\'re feeling called to create or express yourself in new ways, but old fears about judgment or failure are fighting back. This is normal.',
        microPracticeLabel: 'Gentle Creative Boundary',
        microPracticeSteps: [
          'Think of one creative thing you\'ve been wanting to try but haven\'t (singing, writing, painting, dancing).',
          'Write down the fear that\'s been stopping you.',
          'Do that creative thing for just 3 minutes today - set a timer and let yourself be terrible.',
          'Notice: did anything bad actually happen?'
        ],
        advancedPanelLabel: undefined,
        advancedPanelDescription: undefined
      },
      advanced: {
        subtext: 'You\'re at a liminal threshold where your established creative identity is dissolving to make space for a larger expression. This requires death of the artist you\'ve been to birth the artist you\'re becoming.',
        microPracticeLabel: 'Identity Boundary Alchemy',
        microPracticeSteps: [
          'Map your "creative identity" - the story of who you are as an artist/creator and what your work "should" be.',
          'Identify which aspects of this identity feel like protection versus authentic expression.',
          'Create one piece this week that deliberately breaks your established "style" or comfort zone.',
          'Notice what emerges when you\'re not trying to be yourself.'
        ]
      }
    }
  },

  coach: {
    headline: 'Your Protective Systems Are Outdated',
    icon: '🔄',
    subtext: 'The strategies and boundaries that once served your growth are now limiting your expansion. These protective patterns were necessary for building confidence, but they\'re preventing your next evolution.',
    ctaLabel: 'Redesign Your Growth Container',
    microPracticeLabel: 'Breakthrough Boundary Audit',
    microPracticeSteps: [
      'Identify 3 "rules" you have about who you should be or how you should show up that feel increasingly restrictive.',
      'For each rule, ask: "What was this protecting me from? What was I afraid would happen without this boundary?"',
      'Choose one rule to experiment with softening for the next week - what would feel like a 10% expansion?',
      'Create accountability support: share this experiment with a trusted person who can celebrate your courage.'
    ],
    supportMessage: 'Boundary evolution is a natural part of growth. This isn\'t about dropping all protection, but upgrading to boundaries that support your emerging capacity.',
    colorTheme: {
      primary: '#FF6B6B',   // vibrant coral - energy and transformation
      background: '#F8F9FA', // clean, supportive backdrop
      accent: '#4ECDC4',    // turquoise - balance and flow
    },
    toneKey: 'strategic',
    advancedPanelLabel: 'Show Transformation Framework',
    advancedPanelDescription: 'Iron boundary rupture in coaching contexts signals a readiness transition: moving from protection-based identity to possibility-based identity. The work is to honor what the boundaries accomplished while creating space for who you\'re becoming.',
    emergencyOverride: {
      headline: 'Critical Boundary Overwhelm',
      message: 'If you\'re experiencing breakdown rather than breakthrough - feeling unsafe, overwhelmed, or destabilized - this may not be the right time for boundary expansion. Professional support is needed.',
      action: 'Connect with Professional Support'
    },
    complexityAdaptations: {
      beginner: {
        subtext: 'You may be noticing that some of your "always" and "never" rules about yourself are feeling too tight. This is normal and healthy - you\'re growing.',
        microPracticeLabel: 'Simple Boundary Reflection',
        microPracticeSteps: [
          'Think of one area where you\'ve been saying "I\'m not the kind of person who..." but part of you is curious.',
          'Ask yourself: "What would I try if I knew I was completely supported?"',
          'Choose one tiny action toward that curiosity this week.',
          'Notice what happens - no pressure to continue, just practice paying attention.'
        ]
      },
      intermediate: {
        advancedPanelLabel: 'Show Growth Edge Analysis',
        advancedPanelDescription: 'Your protective systems are recalibrating because your capacity has expanded beyond what they were designed to contain. This is the natural rhythm of development: grow, bump against limits, redesign the container, integrate new capacity.'
      },
      advanced: {
        microPracticeLabel: 'Identity Evolution Mapping',
        microPracticeSteps: [
          'Map the "identity categories" you use to organize your sense of self (roles, strengths, values, story themes).',
          'Identify which categories feel expansive versus constraining at this stage of your development.',
          'For the constraining ones, explore: "What version 2.0 of this aspect of me wants to emerge?"',
          'Create ritual space to honor what you\'re releasing and welcome what you\'re becoming.'
        ],
        advancedPanelLabel: 'See Developmental Architecture',
        advancedPanelDescription: 'Advanced boundary work involves conscious participation in identity evolution: recognizing protective systems as developmental achievements while staying available to the next level of integration and service.'
      }
    }
  },

  gen_z: {
    headline: 'Your Boundaries Are Getting an Update',
    icon: '📲',
    subtext: 'Real talk - those walls you built to protect yourself? They served their purpose, but now they\'re blocking your growth. Time to upgrade your emotional firewall, no cap.',
    ctaLabel: 'Level Up Your Boundaries',
    microPracticeLabel: 'Boundary Reality Check',
    microPracticeSteps: [
      'Take a screenshot of your life rn - what "rules" do you have that feel outdated or too restrictive?',
      'Pick 3 that make you feel trapped and ask: "What was past-me protecting future-me from?"',
      'For each one, rate how valid that fear still is on a scale of 1-10.',
      'Choose the lowest-rated fear and commit to one small boundary experiment this week. Share it in your story/close friends for accountability.'
    ],
    supportMessage: 'Your mental health matters. Boundary work can feel overwhelming - that\'s valid. Don\'t go through this alone.',
    colorTheme: {
      primary: '#8B5CF6',   // vibrant purple - authentic self-expression
      background: '#F8FAFC', // clean minimal backdrop
      accent: '#10B981',    // green - growth and healing
    },
    toneKey: 'clinical',
    advancedPanelLabel: 'Show Social Justice Context',
    advancedPanelDescription: 'Iron boundary rupture for Gen Z often connects to systemic issues: boundaries formed as protection from oppression, trauma, or instability. The work honors both personal healing and collective liberation.',
    emergencyOverride: {
      headline: 'Boundary Breakdown Mode',
      message: 'If you\'re feeling unsafe, overwhelmed, or like everything is falling apart - pause. This isn\'t the time for boundary work. Reach out to someone you trust.',
      action: 'Get Support Now'
    },
    complexityAdaptations: {
      beginner: {
        headline: 'Your Rules Don\'t Define You',
        subtext: 'You might be noticing that some of your "always" and "never" thoughts about yourself don\'t fit anymore. That\'s actually really healthy.',
        microPracticeLabel: 'Simple Rule Check',
        microPracticeSteps: [
          'Think of one thing you always say "I\'m not that type of person" about.',
          'Ask yourself: "Who decided that? Is it still true?"',
          'Try doing that thing in a small, safe way this week.',
          'Notice how it feels - no judgment, just curiosity.'
        ]
      },
      intermediate: {
        advancedPanelLabel: 'Show Development Context',
        advancedPanelDescription: 'Your boundaries are recalibrating because you\'re growing beyond what your protection systems were designed for. This is the natural process of becoming who you really are.'
      },
      advanced: {
        microPracticeLabel: 'Identity Evolution Deep Dive',
        microPracticeSteps: [
          'Map the different "versions" of yourself across different spaces (online, family, work, friends).',
          'Notice which versions feel most authentic vs performative.',
          'Identify the boundary stories that keep these versions separate.',
          'Design an integration experiment: bring more authenticity to one "performance" space.'
        ],
        advancedPanelLabel: 'See Systemic Analysis',
        advancedPanelDescription: 'Advanced boundary work recognizes that personal boundaries intersect with systemic oppression. True healing includes both individual development and collective liberation work.'
      }
    }
  },

  gen_alpha: {
    headline: 'Time to Update Your Settings',
    icon: '⚙️',
    subtext: 'Your protection mode is running old software. Those safety settings were important when you were learning the world, but now they\'re limiting your adventures. Ready for an upgrade?',
    ctaLabel: 'Update Safety Settings',
    microPracticeLabel: 'Safety Setting Scan',
    microPracticeSteps: [
      'Imagine your brain has safety settings like a game. Which ones feel too strict for your current level?',
      'Pick one "rule" that stops you from trying new things and ask: "What was this setting protecting me from?"',
      'Rate that danger from 1-10 for how real it is in your life today.',
      'If it\'s lower than 7, plan one small adventure to test your new brave level this week.'
    ],
    supportMessage: 'Growing up means your safety needs change. It\'s normal to need help figuring out which boundaries to keep and which to update.',
    colorTheme: {
      primary: '#06B6D4',   // cyan - digital native, future-focused
      background: '#F1F5F9', // light, tech-clean backdrop
      accent: '#F59E0B',    // amber - achievement/reward energy
    },
    toneKey: 'clinical',
    advancedPanelLabel: 'Show Future Skills Training',
    advancedPanelDescription: 'Gen Alpha boundary work focuses on developing discernment in an increasingly complex world: learning to stay open to possibility while building appropriate protection for digital-native challenges.',
    emergencyOverride: {
      headline: 'Safety Mode Override',
      message: 'If things feel scary, overwhelming, or like too much is changing at once - that\'s okay. Talk to a trusted adult about what you\'re experiencing.',
      action: 'Talk to Trusted Adult'
    },
    complexityAdaptations: {
      beginner: {
        headline: 'Your Rules Can Change As You Grow',
        subtext: 'Some rules that helped when you were little might feel too small for who you\'re becoming. That\'s how growing up works!',
        microPracticeLabel: 'Rule Growth Check',
        microPracticeSteps: [
          'Think of one rule about yourself that feels too tight (like "I\'m not brave enough for...").',
          'Remember when this rule started - was it to keep you safe when you were younger?',
          'Ask a trusted adult: "Do you think I\'m ready to try being a little braver with this?"',
          'Plan one small brave thing to try with support.'
        ]
      },
      intermediate: {
        advancedPanelLabel: 'Show Development Game',
        advancedPanelDescription: 'Think of boundaries like game levels - you need different protection settings as you level up in life. The goal isn\'t to remove all safety, but to upgrade to age-appropriate settings.'
      },
      advanced: {
        microPracticeLabel: 'Future Self Navigation',
        microPracticeSteps: [
          'Imagine yourself 5 years from now - what would that version of you be brave enough to do?',
          'List 3 things that future-you would try that current-you feels scared of.',
          'Pick the easiest one and break it into tiny practice steps.',
          'Create a support team (family, friends, mentors) for this growth adventure.'
        ],
        advancedPanelLabel: 'See Future Skills Framework',
        advancedPanelDescription: 'Advanced Gen Alpha boundary work involves developing meta-cognitive awareness: learning to consciously update your own protection systems as you encounter new challenges in a rapidly changing world.'
      }
    }
  }
};

// Helper function to get the appropriate pixel configuration
export function getIronBoundaryPixelConfig(
  engineState: IronBoundaryEngineState,
  portal: PortalId,
  tier: ComplexityTier
): { config: IronBoundaryPixelConfig | null; hidden: boolean } {
  const base = IRON_BOUNDARY_PIXEL_MAP[portal] ?? IRON_BOUNDARY_PIXEL_MAP['therapeutic'];

  if (!base) {
    return { config: null, hidden: true };
  }

  // Check if this tier should be hidden
  if (base.hiddenForTiers?.includes(tier)) {
    return { config: null, hidden: true };
  }

  // Apply tier adaptations
  const tierAdaptations = base.complexityAdaptations?.[tier] || {};

  // Apply emergency override if critical safety level
  let finalConfig = { ...base, ...tierAdaptations };

  if (engineState.safetyLevel === 'critical' && base.emergencyOverride) {
    finalConfig = {
      ...finalConfig,
      headline: base.emergencyOverride.headline,
      subtext: base.emergencyOverride.message,
      ctaLabel: base.emergencyOverride.action,
    };
  }

  // Apply state-specific modifications based on engine output
  finalConfig.subtext = adjustSubtextForIntensity(finalConfig.subtext, engineState.intensity);
  finalConfig.supportMessage = adjustSupportForVelocity(finalConfig.supportMessage, engineState.rupture_velocity);

  return { config: finalConfig, hidden: false };
}

// State-responsive text adjustments
function adjustSubtextForIntensity(baseText: string, intensity: number): string {
  if (intensity > 80) {
    return baseText.replace('are shifting', 'are rapidly transforming');
  } else if (intensity < 30) {
    return baseText.replace('are shifting', 'are gently evolving');
  }
  return baseText;
}

function adjustSupportForVelocity(baseMessage: string, velocity: IronBoundaryEngineState['rupture_velocity']): string {
  switch (velocity) {
    case 'sudden':
      return `URGENT: ${baseMessage} The pace of change requires immediate support.`;
    case 'seismic':
      return `CRITICAL: ${baseMessage} This level of transformation needs professional guidance.`;
    default:
      return baseMessage;
  }
}

// Export types for consumers
export type { IronBoundaryEngineState, IronBoundaryPixelConfig };