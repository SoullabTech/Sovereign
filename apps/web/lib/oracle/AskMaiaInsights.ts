interface SocialMediaTrigger {
  platform: 'tiktok' | 'instagram' | 'twitter' | 'reddit' | 'youtube' | 'other';
  contentType: 'video' | 'post' | 'thread' | 'meme' | 'infographic';
  topic: string;
  userResonance: string;
}

interface LifeContext {
  ageRange?: 'teen' | 'young-adult' | 'adult' | 'middle-age' | 'senior';
  workSituation?: 'student' | 'employed' | 'unemployed' | 'caregiver' | 'retired';
  relationshipStatus?: 'single' | 'partnered' | 'married' | 'divorced' | 'complicated';
  livingSituation?: 'family' | 'alone' | 'roommates' | 'partner' | 'unstable';
  culturalBackground?: string;
  financialStress?: 'low' | 'moderate' | 'high';
  previousTherapy?: boolean;
}

interface AskMayaQuery {
  socialMediaTrigger: SocialMediaTrigger;
  personalResonance: string;
  lifeContext: Partial<LifeContext>;
  seekingType: 'understanding' | 'resources' | 'validation' | 'next-steps' | 'coping-strategies';
  specificConcerns?: string[];
}

interface ClinicalInsight {
  primaryConsideration: string;
  differentialFactors: string[];
  intersectionalConsiderations: string[];
  evidenceBase: string;
  limitations: string;
}

interface EveryLifeConnection {
  immediateStrategies: string[];
  longTermApproaches: string[];
  workplaceApplications?: string[];
  relationshipInsights?: string[];
  selfCareAdaptations: string[];
}

interface ResourceRecommendation {
  type: 'assessment' | 'therapy' | 'support-group' | 'educational' | 'crisis' | 'workplace' | 'community';
  title: string;
  description: string;
  url?: string;
  accessibilityNotes: string;
  costInfo: string;
  identityAffirming: boolean;
}

interface MayaInsightResponse {
  clinicalContext: ClinicalInsight;
  everydayApplications: EveryLifeConnection;
  resources: ResourceRecommendation[];
  validationMessage: string;
  nextSteps: string[];
  intersectionalFactors: string[];
}

export class AskMayaInsights {

  // Social media symptom translation patterns
  private socialMediaPatterns = {
    adhd: {
      commonPhrases: [
        "dopamine hit", "executive dysfunction", "time blindness", "rejection sensitivity",
        "hyperfocus", "brain fog", "masking", "overstimulation", "people pleasing"
      ],
      differentials: ["anxiety", "trauma", "depression", "autism", "perfectionism", "chronic_illness"],
      intersectionalFactors: [
        "Women/AFAB often diagnosed later due to internalizing symptoms",
        "Cultural expectations around productivity can amplify masking",
        "Economic stress can worsen executive function challenges"
      ]
    },

    trauma: {
      commonPhrases: [
        "triggered", "hypervigilant", "dissociation", "people pleasing", "fawn response",
        "emotional flashback", "inner critic", "boundary issues", "freeze response"
      ],
      differentials: ["anxiety", "depression", "adhd", "ocd", "chronic_pain", "autoimmune"],
      intersectionalFactors: [
        "Historical trauma affects entire communities",
        "Medical trauma disproportionately affects marginalized groups",
        "Cultural stigma can prevent trauma recognition"
      ]
    },

    autism: {
      commonPhrases: [
        "masking", "special interests", "sensory overload", "meltdown", "stimming",
        "social scripts", "routine disruption", "literal thinking", "pattern recognition"
      ],
      differentials: ["adhd", "social_anxiety", "ocd", "trauma", "depression"],
      intersectionalFactors: [
        "Autistic people of color face diagnostic bias",
        "Women/girls taught to mask from early age",
        "Late diagnosis often follows life transitions"
      ]
    },

    depression: {
      commonPhrases: [
        "executive dysfunction", "anhedonia", "brain fog", "low energy", "isolation",
        "self-worth", "numbness", "seasonal", "persistent sadness"
      ],
      differentials: ["adhd", "trauma", "chronic_illness", "hormonal", "grief", "anxiety"],
      intersectionalFactors: [
        "Cultural expressions of depression vary significantly",
        "Economic depression often overlaps with clinical depression",
        "Systemic oppression contributes to depression rates"
      ]
    },

    anxiety: {
      commonPhrases: [
        "overthinking", "catastrophizing", "perfectionism", "people pleasing", "worry",
        "panic attacks", "social anxiety", "generalized anxiety", "anticipatory anxiety"
      ],
      differentials: ["adhd", "trauma", "autism", "ocd", "medical_conditions"],
      intersectionalFactors: [
        "Minority stress significantly increases anxiety",
        "Economic insecurity creates realistic anxiety",
        "Cultural stigma can worsen social anxiety"
      ]
    }
  };

  analyzeQuery(query: AskMayaQuery): MayaInsightResponse {
    const detectedPattern = this.detectPattern(query.personalResonance);
    const clinicalContext = this.buildClinicalContext(detectedPattern, query);
    const everydayApplications = this.generateEverydayConnections(detectedPattern, query);
    const resources = this.curiateResources(detectedPattern, query.lifeContext);
    const intersectionalFactors = this.assessIntersectionalFactors(detectedPattern, query.lifeContext);

    return {
      clinicalContext,
      everydayApplications,
      resources,
      validationMessage: this.generateValidation(query),
      nextSteps: this.suggestNextSteps(query.seekingType, detectedPattern),
      intersectionalFactors
    };
  }

  private detectPattern(resonance: string): string {
    const lower = resonance.toLowerCase();

    // Score each pattern based on keyword matches
    const scores = Object.entries(this.socialMediaPatterns).map(([pattern, data]) => {
      const matches = data.commonPhrases.filter(phrase =>
        lower.includes(phrase.toLowerCase())
      ).length;
      return { pattern, score: matches };
    });

    // Return highest scoring pattern, default to 'general' if no clear match
    const topPattern = scores.reduce((a, b) => a.score > b.score ? a : b);
    return topPattern.score > 0 ? topPattern.pattern : 'general';
  }

  private buildClinicalContext(pattern: string, query: AskMayaQuery): ClinicalInsight {
    const patternData = this.socialMediaPatterns[pattern as keyof typeof this.socialMediaPatterns];

    if (!patternData) {
      return {
        primaryConsideration: "Your experience is valid and worth exploring further",
        differentialFactors: ["Individual variation", "Life circumstances", "Multiple factors"],
        intersectionalConsiderations: ["Identity factors affect symptom presentation"],
        evidenceBase: "Clinical experience varies widely across individuals",
        limitations: "Social media provides starting points, not diagnoses"
      };
    }

    const contextualResponses = {
      adhd: {
        primaryConsideration: "Executive function challenges can stem from multiple sources. ADHD involves persistent patterns from childhood, but trauma, anxiety, and life stress can create similar symptoms.",
        evidenceBase: "ADHD diagnosis requires comprehensive assessment considering developmental history, current functioning across multiple settings, and ruling out other conditions.",
        limitations: "Social media often shows highlight reels of symptoms. Professional assessment considers full clinical picture."
      },

      trauma: {
        primaryConsideration: "Trauma responses are adaptive survival mechanisms that can persist after safety is restored. Your nervous system learned to protect you.",
        evidenceBase: "Trauma-informed care recognizes how trauma affects brain development, relationships, and daily functioning across the lifespan.",
        limitations: "Trauma healing is highly individual. What works varies based on trauma type, timing, and available support."
      },

      autism: {
        primaryConsideration: "Autism is a neurotype, not a disorder to fix. Late recognition often follows major life transitions when existing coping strategies no longer work.",
        evidenceBase: "Autism assessment considers developmental patterns, sensory processing, communication styles, and social interaction preferences.",
        limitations: "Autism presents differently across gender, culture, and co-occurring conditions. Masking can obscure typical presentations."
      }
    };

    const response = contextualResponses[pattern as keyof typeof contextualResponses];

    return {
      primaryConsideration: response?.primaryConsideration || "Your experience deserves validation and exploration",
      differentialFactors: patternData.differentials,
      intersectionalConsiderations: patternData.intersectionalFactors,
      evidenceBase: response?.evidenceBase || "Clinical understanding continues evolving",
      limitations: response?.limitations || "Individual experiences vary significantly"
    };
  }

  private generateEverydayConnections(pattern: string, query: AskMayaQuery): EveryLifeConnection {
    const strategies = {
      adhd: {
        immediate: [
          "Use your alarm system - it's executive function support, not failure",
          "Try 'transition rituals' between tasks (2-minute breathing, stretch)",
          "Break large tasks into 15-minute chunks with rewards",
          "Use body doubling - work alongside others virtually or in person"
        ],
        longTerm: [
          "Develop sustainable routines rather than perfect systems",
          "Build support networks that understand executive function challenges",
          "Explore whether medication might be helpful",
          "Learn about accommodations in work/school settings"
        ],
        workplace: [
          "Request quiet workspace or noise-canceling headphones",
          "Break meetings into agenda items with time limits",
          "Use project management tools that match your brain",
          "Advocate for written instructions rather than verbal-only"
        ]
      },

      trauma: {
        immediate: [
          "Notice when you're in fight/flight/freeze and name it",
          "Use grounding techniques: 5-4-3-2-1 sensory method",
          "Practice boundary setting in low-stakes situations",
          "Develop self-compassion practices for your survival responses"
        ],
        longTerm: [
          "Consider trauma-informed therapy modalities",
          "Build relationships that respect your healing pace",
          "Explore somatic therapies that work with your nervous system",
          "Develop trauma-informed life planning"
        ],
        workplace: [
          "Identify workplace triggers and develop response plans",
          "Communicate boundaries professionally without over-explaining",
          "Use trauma-informed time management",
          "Build relationships with trusted colleagues gradually"
        ]
      },

      autism: {
        immediate: [
          "Honor your sensory needs - they're not preferences, they're requirements",
          "Use scripts for difficult social situations",
          "Schedule sensory breaks throughout your day",
          "Communicate your needs clearly rather than masking"
        ],
        longTerm: [
          "Connect with autistic community for support and understanding",
          "Develop unmasking practices gradually and safely",
          "Explore special interests as strengths, not obsessions",
          "Build routines that support your neurotype"
        ],
        workplace: [
          "Request accommodations: lighting, noise, schedule predictability",
          "Communicate preferences for written vs verbal communication",
          "Advocate for clear expectations and deadlines",
          "Find mentors who understand neurodivergent strengths"
        ]
      }
    };

    const patternStrategies = strategies[pattern as keyof typeof strategies];

    return {
      immediateStrategies: patternStrategies?.immediate || [
        "Trust your instincts about what you're experiencing",
        "Start with one small change that feels manageable",
        "Connect with others who share similar experiences"
      ],
      longTermApproaches: patternStrategies?.longTerm || [
        "Consider professional support when ready",
        "Build understanding through reputable educational resources",
        "Develop self-advocacy skills"
      ],
      workplaceApplications: patternStrategies?.workplace,
      selfCareAdaptations: [
        "Adapt self-care to your actual needs, not social expectations",
        "Notice what truly restores vs drains your energy",
        "Build routines that support your specific challenges"
      ]
    };
  }

  private curiateResources(pattern: string, context: Partial<LifeContext>): ResourceRecommendation[] {
    const baseResources: ResourceRecommendation[] = [
      {
        type: 'educational',
        title: 'Psychology Today Therapist Directory',
        description: 'Find therapists who specialize in your specific concerns and accept your insurance',
        url: 'https://psychologytoday.com',
        accessibilityNotes: 'Filter by identity-affirming therapists, sliding scale options',
        costInfo: 'Varies by provider and insurance coverage',
        identityAffirming: true
      },
      {
        type: 'crisis',
        title: '988 Suicide & Crisis Lifeline',
        description: '24/7 crisis support via phone, chat, or text',
        accessibilityNotes: 'Available in multiple languages, TTY accessible',
        costInfo: 'Free',
        identityAffirming: true
      }
    ];

    const patternSpecificResources = {
      adhd: [
        {
          type: 'assessment' as const,
          title: 'ADHD Clinical Assessment (Adult)',
          description: 'Comprehensive ADHD evaluation considering trauma history and cultural factors',
          accessibilityNotes: 'Available in multiple languages, trauma-informed approaches',
          costInfo: '$300-800, some insurance coverage',
          identityAffirming: true
        },
        {
          type: 'educational' as const,
          title: 'ADDitude Magazine',
          description: 'Evidence-based ADHD information with lived experience perspectives',
          url: 'https://additudemag.com',
          accessibilityNotes: 'Free articles, paid subscription for full access',
          costInfo: 'Free basic content, $20/year premium',
          identityAffirming: true
        }
      ],

      trauma: [
        {
          type: 'therapy' as const,
          title: 'Trauma-Informed Therapy Options',
          description: 'EMDR, somatic therapy, IFS, and other evidence-based trauma treatments',
          accessibilityNotes: 'Sliding scale options available through training clinics',
          costInfo: '$50-200 per session, insurance often covers',
          identityAffirming: true
        },
        {
          type: 'educational' as const,
          title: 'The Body Keeps the Score - Resources',
          description: 'Companion resources for understanding trauma responses',
          accessibilityNotes: 'Available in audiobook format',
          costInfo: '$15-30 for book, library copies available',
          identityAffirming: true
        }
      ],

      autism: [
        {
          type: 'assessment' as const,
          title: 'Autism Assessment (Adult)',
          description: 'Comprehensive autism evaluation by clinicians experienced with late diagnosis',
          accessibilityNotes: 'Culturally responsive assessment available',
          costInfo: '$1000-3000, limited insurance coverage',
          identityAffirming: true
        },
        {
          type: 'community' as const,
          title: 'Autistic Self Advocacy Network',
          description: 'Autistic-led organization providing resources and community',
          url: 'https://autisticadvocacy.org',
          accessibilityNotes: 'Fully accessible website, multiple communication options',
          costInfo: 'Free resources',
          identityAffirming: true
        }
      ]
    };

    const specific = patternSpecificResources[pattern as keyof typeof patternSpecificResources] || [];
    return [...baseResources, ...specific];
  }

  private assessIntersectionalFactors(pattern: string, context: Partial<LifeContext>): string[] {
    const factors = [];

    // Economic factors
    if (context.financialStress === 'high') {
      factors.push("Financial stress can worsen symptoms and limit treatment access");
      factors.push("Community mental health centers offer sliding scale options");
    }

    // Age-related factors
    if (context.ageRange === 'teen') {
      factors.push("Teen brain development affects symptom presentation");
      factors.push("School accommodations may be available through 504 plans or IEPs");
    }

    if (context.ageRange === 'middle-age' || context.ageRange === 'senior') {
      factors.push("Later-in-life recognition often follows major life transitions");
      factors.push("Symptoms may have been attributed to other life factors");
    }

    // Work-related factors
    if (context.workSituation === 'unemployed') {
      factors.push("Job searching with neurodivergent/mental health challenges requires specific strategies");
    }

    if (context.workSituation === 'caregiver') {
      factors.push("Caregiver stress can mask or amplify underlying conditions");
      factors.push("Caregiver support groups understand unique challenges");
    }

    // Relationship factors
    if (context.livingSituation === 'unstable') {
      factors.push("Housing instability significantly impacts mental health");
      factors.push("Crisis resources may be needed alongside therapeutic support");
    }

    return factors;
  }

  private generateValidation(query: AskMayaQuery): string {
    const validationMessages = [
      "Your instincts about your own experience are valid. Social media helped you find language for something real.",
      "Recognizing patterns in yourself through social media shows self-awareness and courage.",
      "You're not 'broken' - you're understanding how your brain works in a world not designed for it.",
      "Finding community through social media is a form of peer support that has real value.",
      "Your experience matters whether or not it fits neatly into diagnostic categories."
    ];

    return validationMessages[Math.floor(Math.random() * validationMessages.length)];
  }

  private suggestNextSteps(seekingType: string, pattern: string): string[] {
    const stepsByType = {
      understanding: [
        "Keep a symptom journal noting patterns across different situations",
        "Read reputable sources about your areas of interest",
        "Connect with others who share similar experiences"
      ],
      resources: [
        "Research therapists who specialize in your specific concerns",
        "Look into support groups (online or in-person)",
        "Investigate workplace or school accommodation options"
      ],
      validation: [
        "Trust your experience while remaining open to learning",
        "Find communities that affirm your identity and struggles",
        "Practice self-compassion as you explore these insights"
      ],
      'next-steps': [
        "Consider professional assessment if formal diagnosis would be helpful",
        "Start with one small accommodation or strategy change",
        "Build a support network of people who understand"
      ],
      'coping-strategies': [
        "Implement immediate coping strategies that match your specific challenges",
        "Develop long-term approaches based on your insights",
        "Create backup plans for difficult situations"
      ]
    };

    return stepsByType[seekingType] || stepsByType.understanding;
  }

  // Public method for the UI to use
  processQuery(
    socialMediaTrigger: string,
    personalResonance: string,
    context: Partial<LifeContext>,
    seekingType: AskMayaQuery['seekingType']
  ): MayaInsightResponse {
    const query: AskMayaQuery = {
      socialMediaTrigger: {
        platform: 'other',
        contentType: 'other',
        topic: socialMediaTrigger,
        userResonance: personalResonance
      },
      personalResonance,
      lifeContext: context,
      seekingType
    };

    return this.analyzeQuery(query);
  }
}

export const askMayaInsights = new AskMayaInsights();