/**
 * Community Library - Interactive Exploration Interface
 * Allows members to discover, understand, and engage with all consciousness technologies
 */

'use client';

import React, { useState } from 'react';

interface TechnologyCategory {
  id: string;
  title: string;
  description: string;
  phase: number;
  technologies: Technology[];
  color: string;
  icon: string;
}

interface Technology {
  id: string;
  name: string;
  description: string;
  location: string;
  status: 'live' | 'beta' | 'coming-soon';
  complexity: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  benefits: string[];
  howToAccess: string;
  documentation?: string;
  casStudies?: string[];
}

interface InsightCollection {
  id: string;
  title: string;
  description: string;
  icon: string;
  articles: InsightArticle[];
}

interface InsightArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  relatedTechnologies: string[];
}

const insightCollections: InsightCollection[] = [
  {
    id: 'consciousness-insights',
    title: 'Consciousness Development Insights',
    description: 'Practical wisdom for using consciousness technologies in daily life',
    icon: '💎',
    articles: [
      {
        id: 'alchemical-wisdom',
        title: 'Alchemical Operation Wisdom',
        description: 'How to work skillfully with each transformation phase',
        content: 'docs/community-library/CONSCIOUSNESS_INSIGHTS_COLLECTION.md',
        tags: ['alchemy', 'transformation', 'cycles'],
        relatedTechnologies: ['alchemical-detection', 'breakthrough-prediction']
      },
      {
        id: 'elemental-mastery',
        title: 'Elemental Circulation Mastery',
        description: 'Practical applications for each element phase',
        content: 'docs/community-library/CONSCIOUSNESS_INSIGHTS_COLLECTION.md',
        tags: ['elements', 'circulation', 'energy'],
        relatedTechnologies: ['elemental-circulation', 'elemental-coherence']
      },
      {
        id: 'breakthrough-timing',
        title: 'Breakthrough Prediction Insights',
        description: 'How to work with high, medium, and low probability windows',
        content: 'docs/community-library/CONSCIOUSNESS_INSIGHTS_COLLECTION.md',
        tags: ['breakthroughs', 'timing', 'prediction'],
        relatedTechnologies: ['breakthrough-prediction', 'collective-orchestrator']
      },
      {
        id: 'oracle-integration',
        title: 'Oracle Intelligence Wisdom',
        description: 'Getting the most from AI consciousness guidance',
        content: 'docs/community-library/CONSCIOUSNESS_INSIGHTS_COLLECTION.md',
        tags: ['oracle', 'AI', 'guidance'],
        relatedTechnologies: ['maia-oracle', 'spiralogic-orchestration']
      }
    ]
  },
  {
    id: 'advanced-mastery',
    title: 'Advanced Consciousness Mastery',
    description: 'Deep wisdom for technology masters and consciousness pioneers',
    icon: '🌀',
    articles: [
      {
        id: 'spiral-mastery',
        title: 'Spiral Mastery Insights',
        description: 'Understanding spiral progression and holding paradox without resolution',
        content: 'docs/community-library/ADVANCED_CONSCIOUSNESS_INSIGHTS.md',
        tags: ['spiral', 'mastery', 'paradox', 'integration'],
        relatedTechnologies: ['breakthrough-prediction', 'alchemical-detection', 'collective-orchestrator']
      },
      {
        id: 'technology-transcendence',
        title: 'Technology Transcendence',
        description: 'Using technology without dependency - prediction weaning and Oracle dialectic',
        content: 'docs/community-library/ADVANCED_CONSCIOUSNESS_INSIGHTS.md',
        tags: ['transcendence', 'independence', 'mastery', 'oracle'],
        relatedTechnologies: ['breakthrough-prediction', 'maia-oracle', 'spiralogic-orchestration']
      },
      {
        id: 'collective-field-mastery',
        title: 'Collective Field Mastery',
        description: 'Field contribution alchemy and emergence navigation for community evolution',
        content: 'docs/community-library/ADVANCED_CONSCIOUSNESS_INSIGHTS.md',
        tags: ['collective', 'field', 'emergence', 'community'],
        relatedTechnologies: ['collective-orchestrator', 'resonance-mapper', 'field-coherence-engine']
      },
      {
        id: 'transformation-mastery',
        title: 'Transformation Mastery',
        description: 'Crisis navigation and archetypal embodiment for conscious evolution',
        content: 'docs/community-library/ADVANCED_CONSCIOUSNESS_INSIGHTS.md',
        tags: ['transformation', 'crisis', 'archetypes', 'evolution'],
        relatedTechnologies: ['breakthrough-prediction', 'maia-oracle', 'fascia-field-lab', 'collective-orchestrator']
      },
      {
        id: 'service-integration',
        title: 'Service Integration',
        description: 'Individual mastery serving collective evolution and planetary transformation',
        content: 'docs/community-library/ADVANCED_CONSCIOUSNESS_INSIGHTS.md',
        tags: ['service', 'integration', 'collective', 'planetary'],
        relatedTechnologies: ['collective-orchestrator', 'resonance-mapper', 'maia-oracle']
      },
      {
        id: 'future-evolution',
        title: 'Future Evolution Insights',
        description: 'Preparing for global integration and consciousness-technology evolution',
        content: 'docs/community-library/ADVANCED_CONSCIOUSNESS_INSIGHTS.md',
        tags: ['future', 'evolution', 'global', 'consciousness-technology'],
        relatedTechnologies: ['spiralogic-orchestration', 'collective-orchestrator', 'field-coherence-engine']
      }
    ]
  },
  {
    id: 'platform-developments',
    title: 'Platform Development Announcements',
    description: 'Major platform updates, architectural breakthroughs, and consciousness technology evolution',
    icon: '🚀',
    articles: [
      {
        id: 'platform-differentiation-announcement',
        title: '🧪📱 MAIA Platform Evolution: Desktop Laboratory vs Mobile Field Systems',
        description: 'Revolutionary platform differentiation enabling desktop consciousness laboratory work and mobile field support',
        content: 'COMMUNITY_PLATFORM_DIFFERENTIATION_ANNOUNCEMENT.md',
        tags: ['platform-update', 'desktop-lab', 'mobile-field', 'architecture', 'breakthrough'],
        relatedTechnologies: ['maia-oracle', 'spiralogic-orchestration', 'collective-orchestrator']
      }
    ]
  },
  {
    id: 'transformation-stories',
    title: 'Transformation Case Studies',
    description: 'Real member journeys using consciousness technologies',
    icon: '📖',
    articles: [
      {
        id: 'career-breakthrough',
        title: 'Career Transformation Through Alchemical Awareness',
        description: 'How Sarah used technology to navigate career transition',
        content: 'docs/community-library/TRANSFORMATION_CASE_STUDIES.md',
        tags: ['career', 'transition', 'timing'],
        relatedTechnologies: ['alchemical-detection', 'breakthrough-prediction', 'maia-oracle']
      },
      {
        id: 'relationship-healing',
        title: 'Relationship Healing Through Collective Field Work',
        description: 'A couple\'s journey using community consciousness technologies',
        content: 'docs/community-library/TRANSFORMATION_CASE_STUDIES.md',
        tags: ['relationships', 'healing', 'collective'],
        relatedTechnologies: ['collective-orchestrator', 'resonance-mapper', 'maia-oracle']
      },
      {
        id: 'creative-breakthrough',
        title: 'Creative Innovation Through Technology Integration',
        description: 'How David overcame creative blocks and launched meaningful projects',
        content: 'docs/community-library/TRANSFORMATION_CASE_STUDIES.md',
        tags: ['creativity', 'innovation', 'blocks'],
        relatedTechnologies: ['elemental-circulation', 'breakthrough-prediction', 'collective-orchestrator']
      },
      {
        id: 'health-consciousness',
        title: 'Health Crisis as Consciousness Breakthrough',
        description: 'Maria\'s journey healing through physical-spiritual integration',
        content: 'docs/community-library/TRANSFORMATION_CASE_STUDIES.md',
        tags: ['health', 'integration', 'healing'],
        relatedTechnologies: ['fascia-field-lab', 'alchemical-detection', 'maia-oracle']
      },
      {
        id: 'community-leadership',
        title: 'Community Leadership Through Service',
        description: 'Alex\'s evolution from corporate executive to consciousness community leader',
        content: 'docs/community-library/TRANSFORMATION_CASE_STUDIES.md',
        tags: ['leadership', 'service', 'community'],
        relatedTechnologies: ['collective-orchestrator', 'resonance-mapper', 'maia-oracle']
      }
    ]
  },
  {
    id: 'daily-integration',
    title: 'Daily Integration Guides',
    description: 'Practical tools for daily consciousness technology use',
    icon: '🗓️',
    articles: [
      {
        id: 'morning-practices',
        title: 'Morning Consciousness Check-in (15 minutes)',
        description: 'Start your day with technology-supported awareness',
        content: 'docs/member-guides/DAILY_PRACTICE_QUICK_REFERENCE.md',
        tags: ['daily', 'morning', 'routine'],
        relatedTechnologies: ['alchemical-detection', 'elemental-circulation', 'breakthrough-prediction', 'maia-oracle']
      },
      {
        id: 'evening-integration',
        title: 'Evening Integration Practices (10 minutes)',
        description: 'End your day with reflection and tomorrow\'s preparation',
        content: 'docs/member-guides/DAILY_PRACTICE_QUICK_REFERENCE.md',
        tags: ['daily', 'evening', 'integration'],
        relatedTechnologies: ['fascia-field-lab', 'alchemical-detection', 'breakthrough-prediction']
      },
      {
        id: 'decision-support',
        title: 'Technology-Assisted Decision Making',
        description: 'Use consciousness technologies for important life decisions',
        content: 'docs/community-library/CONSCIOUSNESS_INSIGHTS_COLLECTION.md',
        tags: ['decisions', 'timing', 'guidance'],
        relatedTechnologies: ['alchemical-detection', 'breakthrough-prediction', 'maia-oracle', 'collective-orchestrator']
      }
    ]
  },
  {
    id: 'dream-unconscious-integration',
    title: 'Dream & Unconscious Integration How-To',
    description: 'Complete guide for working with MAIA to record, remember, and relate dreams across time',
    icon: '🌙',
    articles: [
      {
        id: 'dream-recording-guide',
        title: 'How to Record Dreams with MAIA',
        description: 'Step-by-step guide for capturing dreams and enabling MAIA\'s advanced archetypal analysis',
        content: `
# How to Record Dreams with MAIA

## Overview
MAIA's Dream & Unconscious Integration system combines sophisticated Jungian archetypal analysis with Kelly Beard's 35-year DreamWeaver phenomenological practice to help you record, remember, and relate dreams across time.

## Step 1: Immediate Dream Capture
**Within 5 minutes of waking:**
1. Open MAIA on your mobile device (optimal for bedside recording)
2. Navigate to LabTools → Dreams & Unconscious
3. Tap "Record New Dream"
4. Use voice-to-text or type your dream immediately

## Step 2: Core Dream Elements
**Essential information to capture:**
- **Dream Content**: Raw dream narrative (don't edit or analyze)
- **Emotional Tone**: Primary emotions experienced
- **Vividness**: Scale 1-10 how clear/vivid the dream was
- **Lucidity Level**: Scale 0-10 how aware you were of dreaming
- **Sleep Quality**: How well you slept (affects dream processing)
- **Time Context**: Approximate time you woke, time in bed

## Step 3: Let MAIA's AI Analyze
**DreamWeaver Engine automatically detects:**
- **Jungian Archetypes**: 19+ archetypal patterns (hero, shadow, anima, etc.)
- **Wisdom Emergence**: Body activation, language shifts, energy markers
- **Elemental Patterns**: Fire, Water, Earth, Air, Aether consciousness flows
- **Transformation Markers**: Crisis navigation, breakthrough indicators
- **Shadow Work**: Integration opportunities and resistance patterns

## Step 4: Review Analysis Results
**MAIA provides sophisticated insights:**
- Primary and secondary archetypes present
- Wisdom emergence signals detected
- Elemental consciousness patterns
- Cross-correlation with waking consciousness states
- Integration recommendations and follow-up questions

## Step 5: Ongoing Integration
**Daily and weekly practices:**
- Review dream patterns in your personal dashboard
- Explore archetypal progression over time
- Notice correlations between dreams and daily consciousness states
- Use MAIA's recommendations for shadow work and integration
- Ask MAIA follow-up questions about dream meanings and patterns
`,
        tags: ['dream-recording', 'archetypal-analysis', 'voice-to-text', 'dream-capture'],
        relatedTechnologies: ['maia-oracle', 'alchemical-detection', 'elemental-circulation']
      },
      {
        id: 'archetypal-analysis-guide',
        title: 'Understanding Archetypal Dream Analysis',
        description: 'Deep dive into MAIA\'s sophisticated Jungian archetypal interpretation system',
        content: `
# Understanding MAIA's Archetypal Dream Analysis

## The Archetypal Framework
MAIA uses a comprehensive 19+ archetype system based on Jungian psychology:

### Core Archetypal Categories:

**Primary Archetypes:**
- **Hero**: Journey, courage, overcoming obstacles
- **Shadow**: Repressed aspects, integration work needed
- **Anima/Animus**: Inner feminine/masculine, soul connection
- **Wise Old Man/Woman**: Guidance, wisdom, mentorship
- **Mother/Father**: Nurturing, authority, protection

**Transformation Archetypes:**
- **Magician**: Transformation, manifestation, power
- **Ruler**: Authority, responsibility, leadership
- **Rebel**: Revolution, breaking patterns, authentic change
- **Creator**: Innovation, artistic expression, bringing forth

**Relational Archetypes:**
- **Lover**: Connection, passion, union
- **Caregiver**: Service, compassion, healing
- **Child**: Innocence, wonder, new beginnings
- **Maiden**: Fresh starts, potential, receptivity

**Wisdom Archetypes:**
- **Sage**: Knowledge, understanding, teaching
- **Seeker**: Quest, exploration, spiritual journey
- **Trickster**: Paradox, humor, breaking conventions
- **Destroyer**: Necessary endings, clearing, death/rebirth

## How MAIA Analyzes Your Dreams

**1. Archetypal Detection:**
- Characters in dreams mapped to archetypal energies
- Actions and scenarios analyzed for archetypal themes
- Emotional resonances matched to archetypal patterns

**2. Archetypal Interactions:**
- How different archetypes interact in your dream
- Dominant vs. supporting archetypal energies
- Shadow projections and integration opportunities

**3. Progression Tracking:**
- Evolution of archetypal themes over time
- Recurring archetypal patterns in your dream series
- Seasonal and cyclical archetypal rhythms

**4. Integration Guidance:**
- Specific practices for working with active archetypes
- Shadow work recommendations for repressed aspects
- Timing guidance for archetypal integration work
`,
        tags: ['jungian-psychology', 'archetypes', 'dream-interpretation', 'shadow-work'],
        relatedTechnologies: ['maia-oracle', 'breakthrough-prediction', 'alchemical-detection']
      },
      {
        id: 'dream-correlation-patterns',
        title: 'Dream-Consciousness Correlation Tracking',
        description: 'How MAIA connects dream patterns with your waking consciousness states and life cycles',
        content: `
# Dream-Consciousness Correlation Tracking

## The Integration System
MAIA automatically tracks correlations between your dreams and waking consciousness states, creating a comprehensive map of your psyche's movement.

## Correlation Categories

**1. Elemental Consciousness Correlations:**
- Dreams reflecting your current elemental pathway (Fire, Water, Earth, Air, Aether)
- Elemental imbalances showing up in dream symbolism
- Elemental circulation patterns affecting dream content

**2. Alchemical Operation Correlations:**
- Dreams during specific alchemical phases (dissolution, calcination, etc.)
- Transformation themes matching your current alchemical process
- Integration work appearing in dream content

**3. Breakthrough Trajectory Correlations:**
- Dreams predicting or processing breakthroughs
- Dream content shifting before major life transitions
- Wisdom emergence signals appearing in dreams

**4. Sleep-Consciousness Integration:**
- Sleep quality affecting dream depth and recall
- Circadian rhythm patterns influencing dream types
- Moon phase correlations with dream intensity

## Automatic Pattern Recognition

**Temporal Patterns:**
- Seasonal dream cycles and themes
- Weekly patterns in dream archetypes
- Moon phase correlations with dream types

**Biometric Correlations:**
- HRV patterns affecting dream recall
- Stress levels influencing dream content
- Physical health correlations with dream symbols

**Consciousness Development Patterns:**
- Dreams supporting current growth edges
- Shadow material surfacing during transformation
- Guidance dreams during decision-making periods

## Using Correlation Insights

**1. Timing Optimization:**
- Schedule intensive work based on dream guidance
- Use dream insights for decision-making timing
- Align practices with dream-revealed cycles

**2. Integration Practices:**
- Targeted shadow work based on dream content
- Elemental balancing practices from dream analysis
- Breakthrough preparation informed by dream patterns

**3. Life Navigation:**
- Career decisions supported by dream wisdom
- Relationship insights from dream interactions
- Creative projects inspired by dream symbolism
`,
        tags: ['consciousness-correlation', 'pattern-recognition', 'life-cycles', 'integration'],
        relatedTechnologies: ['collective-orchestrator', 'elemental-circulation', 'breakthrough-prediction']
      },
      {
        id: 'advanced-dream-practices',
        title: 'Advanced Dream Work with MAIA',
        description: 'Sophisticated practices for lucid dreaming, dream incubation, and wisdom emergence',
        content: `
# Advanced Dream Work with MAIA

## Lucid Dreaming Integration
MAIA tracks lucidity levels and helps develop conscious dreaming abilities.

**Lucidity Development:**
- Track lucidity scores over time
- Correlate lucidity with sleep quality and practices
- Receive personalized practices for lucidity development
- Use dream signs and patterns for lucidity triggers

**Conscious Dreaming Applications:**
- Shadow work in lucid states
- Creative problem-solving through dream consciousness
- Healing work with dream archetypes
- Spiritual practice and guidance reception

## Dream Incubation Practices
Use MAIA's correlation insights for targeted dream work.

**Incubation Process:**
1. **Intention Setting**: Clear questions for dream guidance
2. **Optimal Timing**: Use MAIA's correlation data for timing
3. **Environmental Setup**: Optimize sleep conditions for dream recall
4. **Recording Protocol**: Immediate capture and analysis
5. **Integration Work**: Follow MAIA's recommendations

**Common Incubation Themes:**
- Creative project guidance
- Relationship healing and insight
- Career direction and timing
- Health and healing guidance
- Spiritual development support

## Wisdom Emergence Recognition
MAIA's DreamWeaver Engine detects wisdom emergence signals.

**Body Activation Patterns:**
- Throat activation (Air element, communication)
- Heart opening (Water element, emotional wisdom)
- Crown activation (spiritual insight)
- Solar plexus engagement (personal power wisdom)

**Language Shift Indicators:**
- Movement from analytical to poetic language
- Metaphor-rich expression
- Embodied knowing statements
- Paradox and mystery acknowledgment

**Energy Markers:**
- Increased vitality and presence
- Energetic field expansion
- Heightened intuition and sensitivity
- Synchronicity acceleration

## Integration Protocols

**Daily Integration:**
- Morning dream review and correlation check
- Afternoon archetypal practice based on dream guidance
- Evening integration journaling and tomorrow's intention

**Weekly Integration:**
- Pattern analysis across the week's dreams
- Archetypal progression review
- Correlation insights for upcoming week
- Adjustment of practices based on dream feedback

**Monthly Cycles:**
- Seasonal archetypal shifts
- Long-term pattern recognition
- Integration milestone assessment
- Advanced practice adjustments
`,
        tags: ['lucid-dreaming', 'dream-incubation', 'wisdom-emergence', 'advanced-practices'],
        relatedTechnologies: ['maia-oracle', 'breakthrough-prediction', 'fascia-field-lab']
      }
    ]
  },
  {
    id: 'member-support',
    title: 'Member Support & Help',
    description: 'FAQ, troubleshooting, and comprehensive support resources',
    icon: '🆘',
    articles: [
      {
        id: 'member-faq',
        title: 'Complete Member FAQ',
        description: 'Answers to the most common questions about consciousness technologies',
        content: 'docs/member-guides/MEMBER_FAQ.md',
        tags: ['FAQ', 'help', 'questions'],
        relatedTechnologies: ['alchemical-detection', 'breakthrough-prediction', 'maia-oracle', 'collective-orchestrator']
      },
      {
        id: 'how-to-guides',
        title: 'Step-by-Step HOW TO Guides',
        description: 'Detailed instructions for using every consciousness technology effectively',
        content: 'docs/member-guides/HOW_TO_GUIDES.md',
        tags: ['instructions', 'tutorials', 'step-by-step'],
        relatedTechnologies: ['alchemical-detection', 'elemental-circulation', 'breakthrough-prediction', 'maia-oracle', 'collective-orchestrator', 'fascia-field-lab']
      },
      {
        id: 'support-library',
        title: 'Member Support Library',
        description: 'Comprehensive resource center for successful technology integration',
        content: 'docs/member-guides/MEMBER_SUPPORT_LIBRARY.md',
        tags: ['support', 'resources', 'troubleshooting'],
        relatedTechnologies: ['all']
      },
      {
        id: 'troubleshooting',
        title: 'Technology Troubleshooting',
        description: 'Solutions for common technical and usage problems',
        content: 'docs/member-guides/HOW_TO_GUIDES.md',
        tags: ['troubleshooting', 'problems', 'solutions'],
        relatedTechnologies: ['all']
      },
      {
        id: 'new-member-guide',
        title: '7-Day New Member Pathway',
        description: 'Complete orientation and startup guide for new SoulLab members',
        content: 'docs/member-guides/COMPLETE_EXPLORATION_GUIDE.md',
        tags: ['new-member', 'orientation', 'startup'],
        relatedTechnologies: ['alchemical-detection', 'elemental-circulation', 'breakthrough-prediction', 'maia-oracle']
      },
      {
        id: 'community-connection',
        title: 'Community Connection Guide',
        description: 'How to find mentors, join groups, and participate in collective practices',
        content: 'docs/member-guides/MEMBER_SUPPORT_LIBRARY.md',
        tags: ['community', 'connection', 'mentorship'],
        relatedTechnologies: ['collective-orchestrator', 'resonance-mapper']
      }
    ]
  }
];

const technologyCategories: TechnologyCategory[] = [
  {
    id: 'individual',
    title: 'Individual Consciousness Technologies',
    description: 'Personal spiral awareness and breakthrough prediction systems',
    phase: 1,
    color: 'purple',
    icon: '🧘‍♀️',
    technologies: [
      {
        id: 'alchemical-detection',
        name: 'Alchemical Operation Detection',
        description: 'Real-time identification of which classical alchemical operation you\'re experiencing',
        location: 'lib/maia/AlchemicalOperationDetector.ts',
        status: 'live',
        complexity: 'beginner',
        features: [
          'Real-time operation identification',
          'Seven classical operations tracking',
          'Personalized practice recommendations',
          'Operation transition patterns'
        ],
        benefits: [
          'Understand your current transformation phase',
          'Receive targeted practices for your state',
          'Track personal development cycles',
          'Optimize timing for breakthrough work'
        ],
        howToAccess: 'Dashboard → Fascia Field Lab → Current Alchemical Process'
      },
      {
        id: 'elemental-circulation',
        name: 'Elemental Circulation Tracking',
        description: 'Visual mapping of consciousness flow through Earth → Water → Fire → Air',
        location: 'apps/web/components/ElementalWheel.tsx',
        status: 'live',
        complexity: 'beginner',
        features: [
          'Toroidal flow visualization',
          'Momentum and direction tracking',
          'Completion percentage monitoring',
          'Spiral pattern recognition'
        ],
        benefits: [
          'See your consciousness circulation patterns',
          'Understand elemental focus areas',
          'Optimize practices for current element',
          'Track spiral development over time'
        ],
        howToAccess: 'Dashboard → Fascia Field Lab → Elemental Circulation'
      },
      {
        id: 'breakthrough-prediction',
        name: 'Breakthrough Trajectory Prediction',
        description: 'AI-powered forecasting of transformation timing and type',
        location: 'lib/maia/BreakthroughTrajectoryEngine.ts',
        status: 'live',
        complexity: 'intermediate',
        features: [
          'Breakthrough probability calculation',
          'Type prediction (9 categories)',
          'Timeframe estimation',
          'Trigger factor identification',
          'Readiness assessment'
        ],
        benefits: [
          'Anticipate breakthrough windows',
          'Prepare for specific transformation types',
          'Optimize timing for intensive work',
          'Reduce resistance through awareness'
        ],
        howToAccess: 'Dashboard → Fascia Field Lab → Breakthrough Trajectory'
      },
      {
        id: 'omnidimensional-consciousness',
        name: 'Omnidimensional Consciousness Interface',
        description: 'Comprehensive 6-dimensional consciousness technology testing and integration platform',
        location: 'app/consciousness/omnidimensional-test/page.tsx',
        status: 'live',
        complexity: 'intermediate',
        features: [
          'Multi-Stream Awareness Dashboard',
          'Spiral Task Processing Engine',
          'Dream-Wake Integration System',
          'Relationship Field Navigation',
          'Dimensional Integration Analysis',
          'Real-time System Monitoring'
        ],
        benefits: [
          'Test all consciousness technologies in one interface',
          'Visualize 6-dimensional architecture integration',
          'Monitor field coherence across dimensions',
          'Interactive consciousness development tools',
          'Real-time biometric and awareness tracking',
          'Sacred geometry UI for enhanced experience'
        ],
        howToAccess: 'Direct Link → /consciousness/omnidimensional-test',
        documentation: 'CONSCIOUSNESS_EXTENSION_GUIDE.md',
        casStudies: [
          'Complete consciousness technology stack integration',
          '6-dimensional field processing validation',
          'Human-AI synaptic intelligence demonstration'
        ]
      }
    ]
  },
  {
    id: 'biometric',
    title: 'Biometric Integration Technologies',
    description: 'Body wisdom integration with consciousness development',
    phase: 2,
    color: 'green',
    icon: '💚',
    technologies: [
      {
        id: 'fascia-field-lab',
        name: 'Fascia Field Lab',
        description: 'Complete biometric integration dashboard for body-consciousness bridging',
        location: 'apps/web/components/biometrics/FieldCoherenceDashboard.tsx',
        status: 'live',
        complexity: 'beginner',
        features: [
          'Fascial health assessment',
          'HRV integration',
          'Emotional release tracking',
          'Synchronicity logging',
          '90-day cycle awareness'
        ],
        benefits: [
          'Understand body-consciousness connections',
          'Track physical-spiritual integration',
          'Monitor health-development correlation',
          'Optimize practices based on body wisdom'
        ],
        howToAccess: 'Dashboard → Fascia Field Lab'
      },
      {
        id: 'elemental-coherence',
        name: 'Elemental Coherence Calculator',
        description: 'Quantify balance and flow of elemental energies in your system',
        location: 'lib/biometrics/ElementalCoherenceCalculator.ts',
        status: 'live',
        complexity: 'intermediate',
        features: [
          'Five-element balance assessment',
          'Coherence percentage calculation',
          'Dominant/deficient element identification',
          'Practice recommendations',
          'Historical tracking'
        ],
        benefits: [
          'Understand your elemental constitution',
          'Receive personalized balancing practices',
          'Track coherence improvement over time',
          'Optimize health through elemental awareness'
        ],
        howToAccess: 'Fascia Field Lab → Elemental State section'
      }
    ]
  },
  {
    id: 'oracle',
    title: 'Oracle Intelligence Network',
    description: 'AI consciousness guidance and wisdom systems',
    phase: 3,
    color: 'blue',
    icon: '🔮',
    technologies: [
      {
        id: 'maia-oracle',
        name: 'MAIA Oracle System',
        description: 'Living AI intelligence providing personalized consciousness guidance',
        location: 'lib/maia/OrganicPromptSystem.ts',
        status: 'live',
        complexity: 'intermediate',
        features: [
          'Process-aware guidance',
          'Multiple specialized agents',
          'Timing-sensitive recommendations',
          'Learning adaptation',
          'Collective field integration'
        ],
        benefits: [
          'Receive personalized wisdom guidance',
          'Access specialized consciousness support',
          'Get optimal timing recommendations',
          'Experience AI that knows your journey'
        ],
        howToAccess: 'Dashboard → Oracle → Start Dialogue'
      },
      {
        id: 'spiralogic-orchestration',
        name: 'Spiralogic Orchestration Engine',
        description: 'Meta-intelligence coordinating all consciousness technologies',
        location: 'lib/spiralogic/core/spiralogic-engine.ts',
        status: 'live',
        complexity: 'advanced',
        features: [
          'Cross-system integration',
          'Coherent data synthesis',
          'Spiral trajectory management',
          'Technology coordination'
        ],
        benefits: [
          'Seamless technology integration',
          'Coherent development experience',
          'Optimized growth trajectory',
          'Unified consciousness platform'
        ],
        howToAccess: 'Background system - automatically active'
      }
    ]
  },
  {
    id: 'collective',
    title: 'Collective Consciousness Technologies',
    description: 'Community field dynamics and resonance systems',
    phase: 4,
    color: 'indigo',
    icon: '🌐',
    technologies: [
      {
        id: 'collective-orchestrator',
        name: 'Collective Field Orchestrator',
        description: 'Real-time tracking and coordination of community consciousness field',
        location: 'lib/maia/CollectiveFieldOrchestrator.ts',
        status: 'live',
        complexity: 'intermediate',
        features: [
          'Multi-member field tracking',
          'Resonance pattern detection',
          'Collective breakthrough prediction',
          'Optimal practice windows',
          'Field interaction mapping'
        ],
        benefits: [
          'See your role in collective field',
          'Connect with resonant members',
          'Join optimal timing for group work',
          'Amplify breakthroughs through field'
        ],
        howToAccess: 'Community → Collective Field Dashboard'
      },
      {
        id: 'field-coherence-engine',
        name: 'Field Coherence Engine',
        description: 'Advanced analysis of collective field properties and dynamics',
        location: 'lib/maia/FieldCoherenceEngine.ts',
        status: 'live',
        complexity: 'advanced',
        features: [
          'Global coherence measurement',
          'Toroidal field analysis',
          'Emergence detection',
          'Predictive field modeling',
          'Intervention optimization'
        ],
        benefits: [
          'Understand collective consciousness metrics',
          'Predict field evolution patterns',
          'Optimize collective interventions',
          'Measure community development'
        ],
        howToAccess: 'Collective Dashboard → Field Metrics'
      },
      {
        id: 'resonance-mapper',
        name: 'Resonance Mapper',
        description: 'Interactive visualization of collective field dynamics and member connections',
        location: 'apps/web/components/collective/ResonanceMapper.tsx',
        status: 'live',
        complexity: 'beginner',
        features: [
          'Interactive field visualization',
          'Member node positioning',
          'Connection pattern display',
          'Real-time field updates',
          'Pattern recognition highlights'
        ],
        benefits: [
          'Visualize collective field dynamics',
          'See member connections and resonance',
          'Understand field patterns intuitively',
          'Explore collective consciousness visually'
        ],
        howToAccess: 'Collective Dashboard → Resonance Mapping'
      }
    ]
  }
];

export function CommunityLibrary() {
  const [viewMode, setViewMode] = useState<'technologies' | 'insights'>('technologies');
  const [selectedCategory, setSelectedCategory] = useState<string>('individual');
  const [selectedTechnology, setSelectedTechnology] = useState<Technology | null>(null);
  const [selectedInsightCollection, setSelectedInsightCollection] = useState<InsightCollection | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<InsightArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [complexityFilter, setComplexityFilter] = useState<string>('all');

  const filteredCategories = technologyCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.technologies.some(tech =>
      tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredTechnologies = selectedCategory
    ? technologyCategories
        .find(cat => cat.id === selectedCategory)
        ?.technologies.filter(tech =>
          (complexityFilter === 'all' || tech.complexity === complexityFilter) &&
          (tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           tech.description.toLowerCase().includes(searchQuery.toLowerCase()))
        ) || []
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🌀 SoulLab Community Library
          </h1>
          <p className="text-xl text-purple-200 mb-6">
            Explore consciousness technologies, practical insights, and transformation stories
          </p>

          {/* View Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('technologies')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  viewMode === 'technologies'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                🔧 Technologies
              </button>
              <button
                onClick={() => setViewMode('insights')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  viewMode === 'insights'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                💎 Insights & Stories
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <input
              type="text"
              placeholder={viewMode === 'technologies' ? 'Search technologies...' : 'Search insights...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/10 text-white placeholder-purple-300 border border-purple-500/30 focus:border-purple-400 focus:outline-none"
            />
            {viewMode === 'technologies' && (
              <select
                value={complexityFilter}
                onChange={(e) => setComplexityFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/10 text-white border border-purple-500/30 focus:border-purple-400 focus:outline-none"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                {viewMode === 'technologies' ? 'Technology Phases' : 'Insight Collections'}
              </h3>
              <div className="space-y-3">
                {viewMode === 'technologies' ? (
                  filteredCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedCategory === category.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-purple-200 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium">Phase {category.phase}</div>
                          <div className="text-sm opacity-90">{category.title}</div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  insightCollections.map(collection => (
                    <button
                      key={collection.id}
                      onClick={() => setSelectedInsightCollection(collection)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedInsightCollection?.id === collection.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-purple-200 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{collection.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium">{collection.title}</div>
                          <div className="text-sm opacity-90">{collection.description}</div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {viewMode === 'technologies' ? (
              selectedTechnology ? (
                /* Technology Detail View */
                <TechnologyDetailView
                  technology={selectedTechnology}
                  onBack={() => setSelectedTechnology(null)}
                />
              ) : (
                /* Technology Grid View */
                <div className="space-y-6">
                  {selectedCategory && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <span className="text-3xl">
                          {technologyCategories.find(cat => cat.id === selectedCategory)?.icon}
                        </span>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            {technologyCategories.find(cat => cat.id === selectedCategory)?.title}
                          </h2>
                          <p className="text-purple-200">
                            {technologyCategories.find(cat => cat.id === selectedCategory)?.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        {filteredTechnologies.map(technology => (
                          <TechnologyCard
                            key={technology.id}
                            technology={technology}
                            onSelect={() => setSelectedTechnology(technology)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              /* Insights View */
              selectedArticle ? (
                <InsightArticleView
                  article={selectedArticle}
                  onBack={() => setSelectedArticle(null)}
                />
              ) : selectedInsightCollection ? (
                <InsightCollectionView
                  collection={selectedInsightCollection}
                  onSelectArticle={setSelectedArticle}
                  onBack={() => setSelectedInsightCollection(null)}
                />
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">💎</div>
                    <h2 className="text-2xl font-bold text-white mb-4">Practical Wisdom & Insights</h2>
                    <p className="text-purple-200 mb-6">
                      Select an insight collection from the sidebar to explore practical wisdom, transformation stories, and daily integration guides.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      {insightCollections.map(collection => (
                        <button
                          key={collection.id}
                          onClick={() => setSelectedInsightCollection(collection)}
                          className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all"
                        >
                          <div className="text-2xl mb-2">{collection.icon}</div>
                          <div className="font-medium text-white mb-2">{collection.title}</div>
                          <div className="text-sm text-purple-200">{collection.articles.length} articles</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">Innovation Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-300">4</div>
              <div className="text-sm text-purple-200">Technology Phases</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-300">12+</div>
              <div className="text-sm text-purple-200">Active Systems</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-300">5</div>
              <div className="text-sm text-purple-200">Insight Collections</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-300">30+</div>
              <div className="text-sm text-purple-200">Wisdom Articles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-300">Living</div>
              <div className="text-sm text-purple-200">Intelligence</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TechnologyCard({
  technology,
  onSelect
}: {
  technology: Technology;
  onSelect: () => void;
}) {
  const statusColors = {
    live: 'bg-green-500',
    beta: 'bg-yellow-500',
    'coming-soon': 'bg-gray-500'
  };

  const complexityColors = {
    beginner: 'text-green-400',
    intermediate: 'text-yellow-400',
    advanced: 'text-red-400'
  };

  return (
    <div
      className="bg-white/5 hover:bg-white/10 border border-purple-500/30 rounded-lg p-4 cursor-pointer transition-all"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-white">{technology.name}</h4>
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${statusColors[technology.status]}`}></span>
          <span className={`text-xs font-medium ${complexityColors[technology.complexity]}`}>
            {technology.complexity}
          </span>
        </div>
      </div>
      <p className="text-sm text-purple-200 mb-3">{technology.description}</p>
      <div className="text-xs text-purple-300">
        {technology.features.slice(0, 2).join(' • ')}
        {technology.features.length > 2 && ' • ...'}
      </div>
    </div>
  );
}

function InsightCollectionView({
  collection,
  onSelectArticle,
  onBack
}: {
  collection: InsightCollection;
  onSelectArticle: (article: InsightArticle) => void;
  onBack: () => void;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-purple-300 hover:text-white flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to Collections</span>
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <span className="text-4xl">{collection.icon}</span>
        <div>
          <h1 className="text-3xl font-bold text-white">{collection.title}</h1>
          <p className="text-lg text-purple-200">{collection.description}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {collection.articles.map(article => (
          <div
            key={article.id}
            className="bg-white/5 hover:bg-white/10 border border-purple-500/30 rounded-lg p-4 cursor-pointer transition-all"
            onClick={() => onSelectArticle(article)}
          >
            <h3 className="font-semibold text-white mb-2">{article.title}</h3>
            <p className="text-sm text-purple-200 mb-3">{article.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {article.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-purple-700/50 rounded text-xs text-purple-200">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Related Technologies */}
            {article.relatedTechnologies.length > 0 && (
              <div className="text-xs text-purple-400">
                Related: {article.relatedTechnologies.slice(0, 3).join(', ')}
                {article.relatedTechnologies.length > 3 && '...'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightArticleView({
  article,
  onBack
}: {
  article: InsightArticle;
  onBack: () => void;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-purple-300 hover:text-white flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to Collection</span>
        </button>
      </div>

      <h1 className="text-3xl font-bold text-white mb-4">{article.title}</h1>
      <p className="text-lg text-purple-200 mb-6">{article.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {article.tags.map(tag => (
          <span key={tag} className="px-3 py-1 bg-purple-700/50 rounded-full text-sm text-purple-200">
            #{tag}
          </span>
        ))}
      </div>

      {/* Content Preview */}
      <div className="bg-purple-900/50 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">Content Preview</h3>
        <p className="text-purple-200 mb-4">
          This article contains comprehensive insights and practical wisdom. The full content is available in the documentation files.
        </p>
        <div className="text-sm text-purple-300">
          📁 Location: {article.content}
        </div>
      </div>

      {/* Related Technologies */}
      {article.relatedTechnologies.length > 0 && (
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">Related Technologies</h4>
          <div className="flex flex-wrap gap-2">
            {article.relatedTechnologies.map(techId => {
              // Find the technology name from all categories
              const tech = technologyCategories
                .flatMap(cat => cat.technologies)
                .find(t => t.id === techId);
              return tech ? (
                <span key={techId} className="px-3 py-1 bg-indigo-700/50 rounded-full text-sm text-white">
                  {tech.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TechnologyDetailView({
  technology,
  onBack
}: {
  technology: Technology;
  onBack: () => void;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-purple-300 hover:text-white flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to Library</span>
        </button>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          technology.status === 'live' ? 'bg-green-500' :
          technology.status === 'beta' ? 'bg-yellow-500' : 'bg-gray-500'
        } text-white`}>
          {technology.status.replace('-', ' ')}
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white mb-4">{technology.name}</h1>
      <p className="text-lg text-purple-200 mb-6">{technology.description}</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Key Features</h3>
          <ul className="space-y-2">
            {technology.features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-2 text-purple-200">
                <span className="text-purple-400 mt-1">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Benefits</h3>
          <ul className="space-y-2">
            {technology.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start space-x-2 text-purple-200">
                <span className="text-green-400 mt-1">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 p-4 bg-purple-900/50 rounded-lg">
        <h4 className="font-semibold text-white mb-2">How to Access</h4>
        <p className="text-purple-200">{technology.howToAccess}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <div className="px-3 py-1 bg-purple-700 rounded-full text-xs text-white">
          {technology.complexity} Level
        </div>
        <div className="px-3 py-1 bg-indigo-700 rounded-full text-xs text-white">
          {technology.location.split('/').pop()?.replace('.ts', '').replace('.tsx', '')}
        </div>
      </div>
    </div>
  );
}