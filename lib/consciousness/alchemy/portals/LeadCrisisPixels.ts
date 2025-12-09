/**
 * Lead Crisis Disposable Pixel Configuration
 *
 * Concrete implementation of semantic state → portal-specific pixels
 * Same core engine output, different cultural expressions
 */

import { PopulationPortal } from './PortalArchitecture';
import { SafetyLevel, ComplexityTier, BaseEngineState } from './PortalTypes';


export interface LeadCrisisEngineState extends BaseEngineState {
  state: 'lead_crisis';
  recommendedMode: 'self_guided' | 'guided' | 'intensive'; // Override base with crisis-specific modes
  crisisScore: number; // 0-1 intensity
  protectiveFactors: string[];
  urgentFlags: string[];
}

/**
 * Disposable pixel atoms for a single semantic state (lead_crisis)
 * expressed through different cultural portals
 */
export interface LeadCrisisPixelConfig {
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

  /**
   * Complexity tier adaptations - disposable pixel philosophy in action
   * Base config is "intermediate", these override for different development levels
   */
  complexityAdaptations?: {
    beginner?: Partial<LeadCrisisPixelConfig>;
    intermediate?: Partial<LeadCrisisPixelConfig>;
    advanced?: Partial<LeadCrisisPixelConfig>;
  };

  /**
   * Hide entire card for specific tiers (useful for facilitator-only content)
   */
  hiddenForTiers?: ComplexityTier[];
}

export const LEAD_CRISIS_PIXEL_MAP: Record<PopulationPortal, LeadCrisisPixelConfig> = {
  shamanic: {
    headline: 'The Old Shell is Breaking',
    icon: '🐍',
    subtext: "You are in sacred transition. What you've been has served its purpose. What wants to be born needs space to emerge.",
    ctaLabel: 'Enter the Sacred Container',
    microPracticeLabel: 'Threshold Ritual',
    microPracticeSteps: [
      'Light a candle or sit near a gentle light source',
      'Place your hands on your heart and feel your breath for three cycles',
      'Ask inwardly: "What is ready to die? What is ready to be born?"',
      'Listen deeply for what arises, without judgment'
    ],
    urgencyIndicator: 'Sacred Crisis Detected',
    supportMessage: 'The spirits are calling you deeper. This breakdown is a breakthrough.',

    colorTheme: {
      primary: '#8B4513',
      background: '#1a1a0a',
      accent: '#FFD700'
    },
    toneKey: 'mythic',

    advancedPanelLabel: 'Show Elemental Wisdom',
    advancedPanelDescription: 'This crisis is an F1 → W1 transition: fire identity meeting water depth. The shell cracks so the deeper current can move.',

    emergencyOverride: {
      headline: 'Sacred Emergency - Immediate Container Needed',
      message: 'Your soul is in intense transition. This requires immediate sacred support.',
      action: 'Connect with Elder or Medicine Person Now'
    },

    complexityAdaptations: {
      beginner: {
        subtext: 'You are between what has been and what is not yet. There is nothing wrong with you. This is a sacred in-between.',
        microPracticeSteps: [
          'Find a quiet place where you will not be disturbed for a few minutes',
          'Place one hand on your heart and one on your belly. Feel your breath',
          'Simply say: "I am allowed to be in between"'
        ],
        advancedPanelLabel: undefined,
        advancedPanelDescription: undefined
      },
      advanced: {
        subtext: 'You are entering a classic nigredo phase: the alchemical darkening where identity structures dissolve so essence can reorganize.',
        microPracticeLabel: 'Nigredo Descent Practice',
        microPracticeSteps: [
          'Name three identities or roles that feel like they are crumbling',
          'Offer each one (in words or symbolically) to the fire, earth, or water as witness',
          'Ask: "What vow or pattern is ending? What deeper fidelity is emerging beneath it?"',
          'Hold space for what wants to emerge without forcing or controlling'
        ]
      }
    }
  },

  therapeutic: {
    headline: "You're in an Acute Adjustment Phase",
    icon: '⚖️',
    subtext: 'Your system is under significant stress. This is a normal response during major life transitions. We can help you stabilize and build support.',
    ctaLabel: 'Begin Grounding & Safety Assessment',
    microPracticeLabel: 'Immediate Grounding Protocol',
    microPracticeSteps: [
      'Rate your current distress on a scale from 1 to 10',
      'Notice three things you can see, three things you can touch, three sounds you can hear',
      'Identify three people or resources you can reach out to in the next 24 hours',
      'Take five slow breaths, gently focusing on the feeling of your feet on the ground'
    ],
    urgencyIndicator: 'Clinical Attention Indicated',
    supportMessage: 'Your distress is valid and treatable. Professional support can help.',

    colorTheme: {
      primary: '#4169E1',
      background: '#f8f9fa',
      accent: '#32CD32'
    },
    toneKey: 'clinical',

    advancedPanelLabel: 'View Clinical Context',
    advancedPanelDescription: 'This may resemble an adjustment disorder with mixed anxiety and depressive features. Safety, stabilization, and social support are key.',

    emergencyOverride: {
      headline: 'Crisis Intervention Needed',
      message: 'Your safety is our priority. Immediate professional support is recommended.',
      action: 'Contact Crisis Line or Emergency Services'
    },

    complexityAdaptations: {
      beginner: {
        subtext: 'You are going through a hard change. Your feelings make sense. We will focus first on helping you feel a little safer right now.',
        microPracticeLabel: 'Simple Safety Check-In',
        microPracticeSteps: [
          'Ask yourself: "In this moment, am I physically safe?" If not, seek immediate help',
          'If you are safe, place your feet flat on the floor and notice the support beneath you',
          'Take three slow breaths and gently name out loud how you are feeling, without judgment'
        ],
        advancedPanelLabel: undefined,
        advancedPanelDescription: undefined
      },
      advanced: {
        subtext: 'You are likely in an acute adjustment phase with significant allostatic load. The task now is nervous system down-regulation and meaning-making.',
        microPracticeLabel: 'Clinical Self-Monitoring Loop',
        microPracticeSteps: [
          'Track your distress 3× per day (morning, midday, evening) on a 1–10 scale',
          'Note triggers, bodily sensations, and thoughts associated with spikes',
          'Identify one small, evidence-based regulation tool (e.g., paced breathing, progressive relaxation) you can commit to practicing daily for 7 days',
          'Document patterns and effectiveness for clinical discussion'
        ]
      }
    }
  },

  corporate: {
    headline: "You're at a Critical Leadership Inflection Point",
    icon: '📊',
    subtext: 'Your current performance model is reaching capacity limits. This pressure indicates it is time to evolve your leadership operating system.',
    ctaLabel: 'Start Strategic Recalibration',
    microPracticeLabel: 'Rapid Leadership Diagnostic',
    microPracticeSteps: [
      'Map your current stress points: people, projects, decisions causing friction',
      'List what has worked well to get you here (your current playbook)',
      'Name one thing that must change for the next level of impact',
      'Define one small experiment you can run this week to test a new approach'
    ],
    urgencyIndicator: 'Leadership Crisis Detected',
    supportMessage: 'High performers often face these inflection points. Strategic support accelerates breakthrough.',

    colorTheme: {
      primary: '#2F4F4F',
      background: '#f5f5f5',
      accent: '#DC143C'
    },
    toneKey: 'strategic',

    advancedPanelLabel: 'See Strategic Model',
    advancedPanelDescription: 'This transition mirrors a shift from individual contributor to systems-level leader. The crisis invites redesigning how you hold responsibility, vision, and support.',

    emergencyOverride: {
      headline: 'Critical Leadership Support Needed',
      message: 'Your leadership system is under extreme stress. Immediate intervention required.',
      action: 'Arrange Emergency Executive Coaching Session'
    },

    complexityAdaptations: {
      beginner: {
        subtext: 'Your role is under pressure. This does not mean you are failing. It means the way you have been leading is being stretched.',
        microPracticeLabel: 'Simple Leadership Check-In',
        microPracticeSteps: [
          'Write down the one situation that is stressing you the most right now at work',
          'Ask: "What is one thing I can say or do in the next 48 hours that would reduce this stress by even 10%?"',
          'Commit to that one small action and schedule when you will do it'
        ],
        advancedPanelLabel: undefined,
        advancedPanelDescription: undefined
      },
      advanced: {
        subtext: 'You are at a classic inflection from operator to architect. The existing leadership schema is at its scaling threshold.',
        microPracticeLabel: 'Architect-Level Reframe',
        microPracticeSteps: [
          'Map your current leadership system: decision flows, key relationships, and feedback channels',
          'Identify one belief about control, responsibility, or visibility that is no longer serving at this scale',
          'Design a 14-day experiment that redistributes responsibility or information flow in a way that tests a new leadership schema',
          'Define success metrics and stakeholder communication plan for the experiment'
        ]
      }
    }
  },

  religious: {
    headline: 'Dark Night of the Soul',
    icon: '✝️',
    subtext: 'What you are experiencing is what the mystics call purification - a necessary passage before deeper union with the Divine.',
    ctaLabel: 'Seek Sacred Direction',
    microPracticeLabel: 'Prayer for Guidance',
    microPracticeSteps: [
      'Find a quiet place for prayer or contemplation',
      'Offer your struggle to God/Divine presence',
      'Ask for strength and clarity in this dark passage',
      'Rest in Divine love, even if you cannot feel it right now'
    ],
    urgencyIndicator: 'Spiritual Crisis Recognized',
    supportMessage: 'God works through all things, including this darkness, for your spiritual growth.',

    colorTheme: {
      primary: '#800080',
      background: '#f8f8ff',
      accent: '#FFD700'
    },
    toneKey: 'mythic',

    advancedPanelLabel: 'Understand Mystical Purification',
    advancedPanelDescription: 'This follows the classical pattern of spiritual dryness before mystical union. Saints and mystics describe this necessary emptying.',

    emergencyOverride: {
      headline: 'Urgent Pastoral Care Needed',
      message: 'Your soul is in intense struggle. Immediate spiritual guidance is needed.',
      action: 'Contact Spiritual Director or Pastoral Counselor'
    }
  },

  recovery: {
    headline: 'Step 4 Inventory Crisis',
    icon: '🔄',
    subtext: 'This feels like the deep work of fearless moral inventory. Your Higher Power is showing you what needs to heal. This is recovery work.',
    ctaLabel: 'Work with Your Sponsor',
    microPracticeLabel: 'Recovery Tools Check',
    microPracticeSteps: [
      'Contact your sponsor or trusted person in recovery',
      'Attend a meeting today if possible',
      'Remember: Progress not perfection',
      'Use your recovery tools: prayer, meditation, service'
    ],
    urgencyIndicator: 'Recovery Crisis Pattern',
    supportMessage: 'This darkness has shown you truth before. Your Higher Power and recovery community are here.',

    colorTheme: {
      primary: '#228B22',
      background: '#f0f8ff',
      accent: '#4169E1'
    },
    toneKey: 'clinical',

    advancedPanelLabel: 'See Step Work Context',
    advancedPanelDescription: 'This crisis mirrors Step 4 inventory work - a thorough and fearless examination that leads to freedom.',

    emergencyOverride: {
      headline: 'Recovery Emergency Support',
      message: 'Your sobriety and wellbeing are at risk. Immediate recovery support needed.',
      action: 'Call Sponsor or Recovery Crisis Line Now'
    }
  },

  academic: {
    headline: 'Developmental Crisis Analysis',
    icon: '📚',
    subtext: "You're experiencing what Erikson would call a developmental crisis - the normal but intense process of transitioning between life stages.",
    ctaLabel: 'Apply Research-Based Interventions',
    microPracticeLabel: 'Evidence-Based Assessment',
    microPracticeSteps: [
      'Document current symptoms and stress indicators',
      'Review relevant literature on life transitions',
      'Apply cognitive restructuring techniques from CBT research',
      'Activate your professional and peer support networks'
    ],
    urgencyIndicator: 'Developmental Crisis Confirmed',
    supportMessage: 'Research shows these transitions, while difficult, typically resolve with appropriate support and interventions.',

    colorTheme: {
      primary: '#4B0082',
      background: '#f9f9f9',
      accent: '#20B2AA'
    },
    toneKey: 'clinical',

    advancedPanelLabel: 'Review Research Literature',
    advancedPanelDescription: 'Extensive research on adult developmental crises shows predictable patterns and evidence-based interventions for successful resolution.',

    emergencyOverride: {
      headline: 'Immediate Professional Consultation',
      message: 'Severity indicators suggest need for immediate professional intervention.',
      action: 'Contact Academic Advisor or Mental Health Professional'
    }
  },

  // Additional portals can be added here
  creative: {
    headline: 'Creative Death and Rebirth',
    icon: '🎨',
    subtext: 'Your old creative identity is dissolving to make space for what wants to emerge. This is the artist\'s sacred passage.',
    ctaLabel: 'Honor the Creative Void',
    microPracticeLabel: 'Artist Emergency Kit',
    microPracticeSteps: [
      'Create something small and imperfect today - anything at all',
      'Connect with other artists who understand this passage',
      'Remember: creative death always precedes creative birth',
      'Trust the process even when you cannot see the outcome'
    ],
    urgencyIndicator: 'Creative Crisis Detected',
    supportMessage: 'Every great artist goes through this dissolution. Your creativity is not gone - it is transforming.',

    colorTheme: {
      primary: '#FF6347',
      background: '#fff8dc',
      accent: '#9932CC'
    },
    toneKey: 'mythic',

    advancedPanelLabel: 'Understand Creative Cycles',
    advancedPanelDescription: 'This follows the classical pattern of creative death/rebirth described by artists throughout history.',

    emergencyOverride: {
      headline: 'Creative Emergency Support',
      message: 'Your creative spirit needs immediate understanding and support.',
      action: 'Connect with Artist Mentor or Creative Community'
    }
  },

  parental: {
    headline: 'Family Transformation Point',
    icon: '👨‍👩‍👧‍👦',
    subtext: 'Your family system is evolving. The old patterns that worked before are shifting to accommodate new growth and needs.',
    ctaLabel: 'Assess Family Dynamics',
    microPracticeLabel: 'Family Stabilization Steps',
    microPracticeSteps: [
      'Ensure all family members feel safe and heard',
      'Identify what family patterns are under stress',
      'Connect with other parents facing similar challenges',
      'Remember: families grow through crises together'
    ],
    urgencyIndicator: 'Family Crisis Identified',
    supportMessage: 'Healthy families evolve through challenges. This pressure indicates growth is needed.',

    colorTheme: {
      primary: '#CD853F',
      background: '#faf0e6',
      accent: '#32CD32'
    },
    toneKey: 'clinical',

    advancedPanelLabel: 'Family Systems Perspective',
    advancedPanelDescription: 'Family development theory shows that crises often signal needed evolution in family structure and roles.',

    emergencyOverride: {
      headline: 'Family Crisis Support Needed',
      message: 'Your family needs immediate support to navigate this transition safely.',
      action: 'Contact Family Therapist or Support Services'
    }
  },

  elder: {
    headline: 'Wisdom Keeper Transition',
    icon: '👵',
    subtext: 'You are being called to a new stage of life - from doing to being, from accumulating to sharing, from striving to wisdom.',
    ctaLabel: 'Embrace Elder Wisdom',
    microPracticeLabel: 'Elder Reflection Practice',
    microPracticeSteps: [
      'Reflect on the wisdom you have gained through life experience',
      'Consider what you most want to share with younger generations',
      'Connect with other elders navigating similar transitions',
      'Honor both what you are releasing and what you are becoming'
    ],
    urgencyIndicator: 'Elder Transition Recognized',
    supportMessage: 'This passage into elderhood is sacred. Your wisdom is needed by the community.',

    colorTheme: {
      primary: '#708090',
      background: '#f5f5f5',
      accent: '#B8860B'
    },
    toneKey: 'mythic',

    advancedPanelLabel: 'Understanding Life Stage Transitions',
    advancedPanelDescription: 'Elder transitions involve deep psychological and spiritual shifts from ego-driven to soul-centered living.',

    emergencyOverride: {
      headline: 'Elder Support Needed',
      message: 'This life transition requires understanding and support from others who honor the elder passage.',
      action: 'Connect with Elder Counselor or Support Group'
    }
  },

  youth: {
    headline: 'Identity Formation Crisis',
    icon: '🌱',
    subtext: 'You are in the intense process of discovering who you are becoming. This confusion and intensity is normal during identity formation.',
    ctaLabel: 'Navigate Identity Development',
    microPracticeLabel: 'Youth Grounding Techniques',
    microPracticeSteps: [
      'Remember that not knowing who you are yet is completely normal',
      'Connect with trusted adults who believe in your potential',
      'Try new experiences to discover your interests and values',
      'Be patient with yourself - identity develops over time'
    ],
    urgencyIndicator: 'Youth Identity Crisis',
    supportMessage: 'Your generation faces unique challenges. This struggle to understand yourself shows you are growing.',

    colorTheme: {
      primary: '#32CD32',
      background: '#f0fff0',
      accent: '#FF6347'
    },
    toneKey: 'clinical',

    advancedPanelLabel: 'Identity Development Science',
    advancedPanelDescription: 'Research on adolescent and young adult development shows identity formation is a normal, necessary process.',

    emergencyOverride: {
      headline: 'Youth Crisis Support',
      message: 'Young people need specialized understanding during identity formation crises.',
      action: 'Contact Youth Counselor or Trusted Adult'
    }
  },

  coach: {
    headline: 'Breakthrough Moment Approaching',
    icon: '🚀',
    subtext: 'You are in a powerful transformation space. This difficulty isn\'t a sign you\'re failing - it\'s evidence that you\'re ready for your next level of growth and capability.',
    ctaLabel: 'Embrace the Breakthrough',
    microPracticeLabel: 'Crisis-to-Growth Reframe',
    microPracticeSteps: [
      'Acknowledge: "This challenge appeared because I\'m ready for it"',
      'Identify 3 strengths you\'ve developed that prepared you for this moment',
      'Ask: "What wants to emerge through this experience?"',
      'Take one action today that honors your emerging capacity, however small'
    ],
    urgencyIndicator: 'Transformation Opportunity',
    supportMessage: 'In coaching, we understand that breakdown often precedes breakthrough. This intensity signals you\'re approaching a new level of capability.',

    colorTheme: {
      primary: '#FF6B6B',   // vibrant coral - energy and possibility
      background: '#F8F9FA', // clean, supportive space
      accent: '#4ECDC4',    // turquoise - flow and balance
    },
    toneKey: 'clinical',

    advancedPanelLabel: 'Developmental Transformation Science',
    advancedPanelDescription: 'Research in adult development shows that periods of crisis often indicate readiness for increased complexity, leadership capacity, and creative contribution.',

    emergencyOverride: {
      headline: 'Coaching Crisis Support',
      message: 'While growth can be challenging, you deserve support that understands your potential while honoring your current needs.',
      action: 'Connect with Professional Coach or Therapist'
    },

    complexityAdaptations: {
      beginner: {
        headline: 'Growing Pains Are Normal',
        subtext: 'What you\'re experiencing is a natural part of growth. These feelings of uncertainty or overwhelm often show up when you\'re ready to expand your comfort zone.',
        microPracticeLabel: 'Simple Growth Acknowledgment',
        microPracticeSteps: [
          'Place a hand on your heart and say: "I am growing"',
          'Remember one time you overcame a challenge and came out stronger',
          'Ask someone you trust: "What growth do you see in me?"',
          'Choose one small action that feels supportive and take it today'
        ]
      },
      intermediate: {
        advancedPanelLabel: 'Growth Edge Dynamics',
        advancedPanelDescription: 'You may be experiencing what developmental psychology calls "edge states" - the productive discomfort that signals readiness for capacity expansion.',
        microPracticeLabel: 'Capacity Integration Practice',
        microPracticeSteps: [
          'Map your current challenge alongside past growth experiences - notice the patterns',
          'Identify which skills/capacities want to develop through this experience',
          'Design one experiment this week to practice your emerging capacity',
          'Create accountability with someone who believes in your potential'
        ]
      },
      advanced: {
        headline: 'Conscious Evolution Moment',
        subtext: 'You are in conscious partnership with your own evolution. This crisis is your psyche\'s way of creating space for the leader, creator, or contributor you\'re becoming.',
        microPracticeLabel: 'Evolutionary Purpose Alignment',
        microPracticeSteps: [
          'Connect with your deepest sense of purpose - what wants to be born through you?',
          'Examine this crisis through the lens of your evolutionary edge - what capacity is emerging?',
          'Design a practice that supports you during this transformation',
          'Consider how your growth serves not just you, but the larger systems you\'re part of'
        ]
      }
    }
  },

  gen_z: {
    headline: 'This Crisis Is Your Transformation Unlocking',
    icon: '🔓',
    subtext: 'This isn\'t you "falling apart" - this is you leveling up. Your nervous system is recalibrating because you\'re ready for something bigger. Trust the process, even when it feels chaotic.',
    ctaLabel: 'Embrace the Level Up',
    microPracticeLabel: 'Crisis Reframe Challenge',
    microPracticeSteps: [
      'Acknowledge the chaos: "My system is upgrading right now"',
      'List 3 ways you\'ve grown stronger from past difficult times',
      'Ask yourself: "What version of me is trying to emerge?"',
      'Post one small victory or insight on your story today - normalize the growth process'
    ],
    urgencyIndicator: 'Mental Health Priority',
    supportMessage: 'Crisis can trigger trauma responses. You don\'t have to be "fine" right now. Professional support + community care both matter.',

    colorTheme: {
      primary: '#8B5CF6',   // vibrant purple - authentic transformation
      background: '#F8FAFC', // clean, supportive space
      accent: '#10B981',    // green - growth and healing
      gradientStart: '#6366F1', // indigo
      gradientEnd: '#8B5CF6'    // purple
    },
    toneKey: 'motivational',

    emergencyOverride: {
      headline: 'Mental Health Emergency Mode',
      message: 'If you\'re having thoughts of self-harm, or feeling completely overwhelmed - this is bigger than a growth moment. Reach out immediately.',
      action: 'Get Crisis Support Now'
    },

    complexityAdaptations: {
      beginner: {
        headline: 'Growing Pains Are Normal',
        subtext: 'This difficult time doesn\'t mean you\'re doing something wrong. It means you\'re changing in important ways.',
        microPracticeLabel: 'Simple Growth Recognition',
        microPracticeSteps: [
          'Place a hand on your heart and say: "I am growing"',
          'Remember one time you overcame a challenge before',
          'Text or call one person who believes in you today',
          'Do one thing that feels like taking care of yourself'
        ]
      },
      intermediate: {
        subtext: 'Your nervous system is processing major change. The discomfort you\'re feeling is actually evidence that you\'re expanding beyond your previous capacity.',
        microPracticeLabel: 'Nervous System Reset',
        microPracticeSteps: [
          'Do 5 minutes of box breathing (4-4-4-4) to regulate your system',
          'Identify what specific change is happening in your life right now',
          'Journal: "My body/mind is adapting to..." (be specific)',
          'Plan one micro-action that honors your emerging self'
        ]
      },
      advanced: {
        headline: 'Conscious Crisis Navigation',
        subtext: 'You\'re in a liminal space - the threshold between who you were and who you\'re becoming. This crisis is initiation energy.',
        microPracticeLabel: 'Liminal Space Integration',
        microPracticeSteps: [
          'Map the transition: What identity/role/belief are you outgrowing?',
          'Identify the emerging capacity trying to be born through this crisis',
          'Create a ritual to honor both what you\'re releasing and what you\'re becoming',
          'Connect this personal transformation to your broader purpose and impact'
        ]
      }
    }
  },

  gen_alpha: {
    headline: 'Your System Is Upgrading',
    icon: '⚡',
    subtext: 'Think of this like when your device updates - sometimes it feels glitchy while the new software installs. You\'re getting upgraded with new abilities to handle bigger challenges.',
    ctaLabel: 'Complete the Upgrade',
    microPracticeLabel: 'System Update Check',
    microPracticeSteps: [
      'Imagine your brain is installing new "courage software" - what % complete is it?',
      'Think of 3 new things you can handle now that you couldn\'t handle last year',
      'What new "superpower" do you think this upgrade is giving you?',
      'Share your upgrade progress with a trusted adult or friend'
    ],
    urgencyIndicator: 'Growing Up Process',
    supportMessage: 'Big feelings during growth are normal. Ask trusted adults for help when things feel too big to handle alone.',

    colorTheme: {
      primary: '#06B6D4',   // cyan - future-focused, digital native
      background: '#F1F5F9', // light, tech-friendly backdrop
      accent: '#F59E0B',    // amber - achievement, progress energy
      gradientStart: '#0EA5E9', // sky blue
      gradientEnd: '#06B6D4'     // cyan
    },
    toneKey: 'encouraging',

    emergencyOverride: {
      headline: 'Big Feelings Alert',
      message: 'If this feels too scary or overwhelming, or if you\'re thinking about hurting yourself - talk to a trusted adult right away.',
      action: 'Talk to Trusted Adult Now'
    },

    complexityAdaptations: {
      beginner: {
        headline: 'Your Brave Level Is Increasing',
        subtext: 'Just like in games, sometimes you face bigger challenges because you\'re getting stronger. This means you\'re ready to level up!',
        microPracticeLabel: 'Brave Level Check',
        microPracticeSteps: [
          'What\'s your brave level from 1-10 today? (Any number is okay!)',
          'Think of something small you can do that feels 10% braver',
          'Ask a grown-up: "Can you help me be brave with this?"',
          'Celebrate any brave thing you do, even tiny ones'
        ]
      },
      intermediate: {
        subtext: 'Your brain is learning to handle more complex situations. The uncomfortable feelings mean your "life skills" are upgrading to the next level.',
        microPracticeLabel: 'Life Skills Upgrade',
        microPracticeSteps: [
          'What life skill do you think you\'re learning right now? (like patience, courage, problem-solving)',
          'Rate your progress: "I\'m __% better at this than I was 6 months ago"',
          'Pick one small way to practice this skill today',
          'Tell someone about your progress - everyone needs encouragement while learning'
        ]
      },
      advanced: {
        headline: 'Conscious Development Navigation',
        subtext: 'You\'re developing advanced emotional intelligence and resilience. This crisis is teaching you skills for handling uncertainty and change.',
        microPracticeLabel: 'Future Self Preparation',
        microPracticeSteps: [
          'Imagine the version of you 5 years from now - what would they tell current-you about this situation?',
          'What skills are you developing that will help you in high school, college, and beyond?',
          'Design a "training plan" for building the emotional muscles you need',
          'Connect with mentors/role models who can support your development journey'
        ]
      }
    }
  }
};

/**
 * Merge helper: applies tier-specific overrides on top of the base config
 */
function applyComplexityTier(
  base: LeadCrisisPixelConfig,
  tier: ComplexityTier
): LeadCrisisPixelConfig {
  const overrides = base.complexityAdaptations?.[tier];

  if (!overrides) return base;

  return {
    ...base,
    ...overrides,
    // Ensure nested arrays/fields are properly overridden
    microPracticeSteps: overrides.microPracticeSteps ?? base.microPracticeSteps,
    colorTheme: overrides.colorTheme ?? base.colorTheme
  };
}

/**
 * Smart pixel configuration selector with complexity tiers and safety adaptations
 */
export function getLeadCrisisPixelConfig(
  engineState: LeadCrisisEngineState,
  portal: PopulationPortal,
  tier: ComplexityTier
): { config: LeadCrisisPixelConfig | null; hidden: boolean } {
  const baseConfig = LEAD_CRISIS_PIXEL_MAP[portal];

  if (!baseConfig) {
    return { config: null, hidden: true };
  }

  // Check if this portal should be hidden for this complexity tier
  if (baseConfig.hiddenForTiers?.includes(tier)) {
    return { config: null, hidden: true };
  }

  // Apply complexity tier adaptations
  let configWithTier = applyComplexityTier(baseConfig, tier);

  // Safety-based overrides for critical situations (takes precedence over tier)
  if (engineState.safetyLevel === 'critical' && baseConfig.emergencyOverride) {
    configWithTier = {
      ...configWithTier,
      headline: baseConfig.emergencyOverride.headline,
      subtext: baseConfig.emergencyOverride.message,
      ctaLabel: baseConfig.emergencyOverride.action,
      urgencyIndicator: 'EMERGENCY',
      colorTheme: {
        ...configWithTier.colorTheme,
        primary: '#dc2626', // Emergency red
        accent: '#fbbf24'    // Warning yellow
      }
    };
  }

  return { config: configWithTier, hidden: false };
}

/**
 * Legacy helper for backwards compatibility
 */
export function getLeadCrisisPixelConfigLegacy(
  engineState: LeadCrisisEngineState,
  portal: PopulationPortal,
  developmentLevel: number = 0.5 // 0-1, affects complexity
): LeadCrisisPixelConfig {
  // Convert development level to complexity tier
  let tier: ComplexityTier = 'intermediate';
  if (developmentLevel < 0.3) {
    tier = 'beginner';
  } else if (developmentLevel > 0.7) {
    tier = 'advanced';
  }

  const { config } = getLeadCrisisPixelConfig(engineState, portal, tier);
  return config || LEAD_CRISIS_PIXEL_MAP[portal];
}

/**
 * Cross-portal bridge finder for seamless transitions
 */
export function findCulturalBridges(
  fromPortal: PopulationPortal,
  toPortal: PopulationPortal
): string[] {
  const bridgeMap: Record<string, string[]> = {
    'shamanic-therapeutic': ['trauma healing', 'shadow integration', 'somatic awareness'],
    'shamanic-religious': ['spiritual crisis', 'dark night of soul', 'divine calling'],
    'shamanic-recovery': ['spiritual awakening', 'higher power', 'community support'],
    'therapeutic-corporate': ['stress management', 'performance optimization', 'resilience building'],
    'therapeutic-religious': ['pastoral counseling', 'spiritual direction', 'faith-based healing'],
    'corporate-recovery': ['leadership principles', 'accountability', 'service orientation'],
    'recovery-religious': ['spiritual foundation', 'surrender', 'community of faith'],
    'academic-therapeutic': ['evidence-based practice', 'research methodology', 'clinical assessment'],
    'creative-shamanic': ['vision questing', 'creative inspiration', 'artistic calling'],
    'parental-therapeutic': ['family systems', 'attachment theory', 'developmental needs']
  };

  const key1 = `${fromPortal}-${toPortal}`;
  const key2 = `${toPortal}-${fromPortal}`;

  return bridgeMap[key1] || bridgeMap[key2] || ['human development', 'consciousness growth', 'healing journey'];
}

export default LEAD_CRISIS_PIXEL_MAP;