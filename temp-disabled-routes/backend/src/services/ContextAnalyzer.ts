// Context Analyzer - Advanced psychological assessment for AIN/MAYA/Anamnesis routing
// Provides sophisticated analysis beyond simple sentiment to guide archetypal experience selection

import { logger } from '../utils/logger';
import { getRelevantMemories } from './memoryService';

export interface ContextAnalysis {
  // Core psychological dimensions
  emotionalTone: {
    primary: string;
    intensity: number;
    complexity: number; // Multiple emotions present
    authenticity: number; // How genuine vs. masked
  };

  // Request classification
  requestType: {
    category: 'analytical' | 'supportive' | 'creative' | 'practical' | 'exploratory' | 'crisis';
    subtype: string;
    confidence: number;
  };

  // Urgency and priority assessment
  urgencyLevel: {
    immediate: boolean;
    therapeutic: boolean;
    developmental: boolean;
    maintenance: boolean;
  };

  // Thematic content analysis with Spiralogic integration
  topicCategory: {
    domain: 'relationships' | 'career' | 'identity' | 'spirituality' | 'creativity' | 'trauma' | 'growth' | 'practical';
    themes: string[];
    depth: 'surface' | 'emerging' | 'core' | 'shadow';
    spiralogicResonance?: string[]; // Which facets are activated
  };

  // Archetypal resonance patterns (4 + 1 elements)
  archetypeAlignment: {
    fire: number;    // Passion, creativity, transformation
    water: number;   // Intuition, emotion, flow
    earth: number;   // Grounding, practical, stability
    air: number;     // Intellect, communication, ideas
  };

  // Psychological readiness indicators
  readiness: {
    forInsight: number;
    forChallenge: number;
    forSupport: number;
    forAction: number;
    forTransformation?: number; // Added for deeper work
  };

  // Communication style preferences detected
  communicationStyle: {
    directness: number;
    metaphoricalThinking: number;
    analyticalPreference: number;
    emotionalExpressionComfort: number;
  };

  // Enhanced Spiralogic-specific analysis
  spiralogicFacet?: {
    primaryFacet: string; // e.g., 'fire-2' for Self-in-World Awareness
    resonanceScore: number; // How strongly it matches
    developmentalStage: 1 | 2 | 3; // Which stage within element
    elementalBalance: {
      fire: number;
      water: number;
      earth: number;
      air: number;
      aether: number;
    };
  };

  // Elemental phase and alchemical process
  elementalPhase?: {
    currentElement: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    alchemicalProcess: 'calcinatio' | 'solutio' | 'coagulatio' | 'sublimatio' | 'coniunctio';
    phaseDescription: string;
    frictionNeed: number; // 0-1 scale - need for productive struggle
    scaffoldingNeed: number; // 0-1 scale - need for supportive structure
  };
}

export interface UserHistory {
  recentMessages: Array<{
    content: string;
    timestamp: Date;
    analysis?: ContextAnalysis;
  }>;
  patterns: {
    commonThemes: string[];
    preferredApproaches: string[];
    responsePatterns: string[];
    growthAreas: string[];
  };
  therapeutic: {
    currentPhase: 'assessment' | 'engagement' | 'working' | 'integration' | 'maintenance';
    primaryConcerns: string[];
    strengths: string[];
    resistances: string[];
  };
  archetypeProfile?: {
    dominant: 'fire' | 'water' | 'earth' | 'air';
    secondary: 'fire' | 'water' | 'earth' | 'air';
    scores: Record<'fire' | 'water' | 'earth' | 'air', number>;
    dateAssessed: Date;
  };
}

class ContextAnalyzer {
  private emotionalMarkers = {
    // Joy family
    joy: ['happy', 'excited', 'thrilled', 'delighted', 'elated', 'euphoric', 'cheerful', 'optimistic'],
    contentment: ['peaceful', 'satisfied', 'content', 'serene', 'calm', 'balanced'],

    // Fear family
    anxiety: ['anxious', 'worried', 'nervous', 'panicked', 'stressed', 'overwhelmed', 'tense'],
    fear: ['afraid', 'terrified', 'scared', 'frightened', 'apprehensive', 'dread'],

    // Anger family
    anger: ['angry', 'furious', 'rage', 'irritated', 'frustrated', 'annoyed', 'resentful'],
    indignation: ['outraged', 'indignant', 'offended', 'violated', 'betrayed'],

    // Sadness family
    sadness: ['sad', 'depressed', 'melancholy', 'grief', 'sorrow', 'heartbroken', 'despair'],
    loneliness: ['lonely', 'isolated', 'abandoned', 'disconnected', 'empty'],

    // Complex emotions
    shame: ['ashamed', 'humiliated', 'embarrassed', 'guilty', 'regretful', 'remorseful'],
    confusion: ['confused', 'lost', 'bewildered', 'uncertain', 'conflicted', 'torn'],
    hope: ['hopeful', 'optimistic', 'encouraged', 'inspired', 'motivated'],

    // Archetypal emotional signatures
    fire_emotions: ['passionate', 'intense', 'creative', 'transformative', 'burning', 'energized'],
    water_emotions: ['flowing', 'intuitive', 'deep', 'mysterious', 'adaptive', 'healing'],
    earth_emotions: ['grounded', 'stable', 'practical', 'nurturing', 'solid', 'rooted'],
    air_emotions: ['intellectual', 'curious', 'communicative', 'light', 'free', 'detached']
  };

  private requestPatterns = {
    analytical: [
      'help me understand', 'what does this mean', 'analyze', 'explain', 'why',
      'how does', 'what are the implications', 'break down', 'examine'
    ],
    supportive: [
      'I\'m struggling', 'I need support', 'feeling overwhelmed', 'hard time',
      'going through', 'difficult', 'can\'t cope', 'need help'
    ],
    creative: [
      'ideas for', 'brainstorm', 'creative', 'imagine', 'what if',
      'possibilities', 'innovative', 'outside the box'
    ],
    practical: [
      'how do I', 'steps to', 'practical', 'action plan', 'implement',
      'next steps', 'concrete', 'specific advice'
    ],
    exploratory: [
      'wondering about', 'curious', 'explore', 'discover', 'journey',
      'path', 'direction', 'meaning', 'purpose'
    ],
    crisis: [
      'emergency', 'crisis', 'urgent', 'immediate', 'desperate',
      'can\'t take it', 'breaking point', 'falling apart'
    ]
  };

  private archetypeKeywords = {
    fire: [
      'passion', 'create', 'transform', 'burn', 'energy', 'intensity',
      'breakthrough', 'ignite', 'spark', 'drive', 'ambition', 'power'
    ],
    water: [
      'feel', 'flow', 'intuition', 'deep', 'emotion', 'healing',
      'cleanse', 'adapt', 'merge', 'mysterious', 'psychic', 'dream'
    ],
    earth: [
      'ground', 'stable', 'practical', 'build', 'foundation', 'solid',
      'nurture', 'grow', 'root', 'manifest', 'material', 'body'
    ],
    air: [
      'think', 'communicate', 'idea', 'mental', 'clarity', 'freedom',
      'perspective', 'detach', 'analyze', 'understand', 'concept', 'theory'
    ]
  };

  async analyzeInput(text: string, userHistory?: UserHistory): Promise<ContextAnalysis> {
    const lowerText = text.toLowerCase();

    try {
      // Detect emotional markers with sophistication
      const emotionalTone = this.detectEmotionalMarkers(lowerText);

      // Classify request intent
      const requestType = this.classifyIntent(lowerText);

      // Assess urgency levels
      const urgencyLevel = this.assessUrgency(lowerText);

      // Identify thematic content with 12-facet mapping
      const topicCategory = this.identifyThemesWithSpiralogic(lowerText);

      // Calculate archetypal alignment with enhanced 12-facet detection
      // If user has an archetype profile from assessment, blend it with live detection
      let archetypeAlignment = this.calculateArchetypeAlignmentEnhanced(lowerText);
      if (userHistory?.archetypeProfile) {
        archetypeAlignment = this.blendArchetypeAlignment(archetypeAlignment, userHistory.archetypeProfile);
      }

      // Detect specific Spiralogic facet resonance
      const spiralogicFacet = this.detectSpiralogicFacet(lowerText);

      // Assess psychological readiness with elemental wisdom
      const readiness = this.assessReadinessEnhanced(lowerText, userHistory, spiralogicFacet);

      // Detect communication style preferences
      const communicationStyle = this.detectCommunicationStyle(lowerText);

      // Assess elemental phase and alchemical process
      const elementalPhase = this.detectElementalPhase(lowerText, spiralogicFacet);

      const analysis: ContextAnalysis = {
        emotionalTone,
        requestType,
        urgencyLevel,
        topicCategory,
        archetypeAlignment,
        readiness,
        communicationStyle,
        spiralogicFacet,
        elementalPhase
      };

      logger.info('Context analysis completed', {
        inputLength: text.length,
        primaryEmotion: emotionalTone.primary,
        requestCategory: requestType.category,
        archetypeLeader: this.getLeadingArchetype(archetypeAlignment)
      });

      return analysis;

    } catch (error) {
      logger.error('Context analysis failed', { error: error.message });

      // Return basic fallback analysis
      return this.getFallbackAnalysis();
    }
  }

  private detectEmotionalMarkers(text: string) {
    const emotions = {};
    let totalIntensity = 0;
    let emotionCount = 0;

    // Analyze emotional content
    for (const [emotion, markers] of Object.entries(this.emotionalMarkers)) {
      const matches = markers.filter(marker => text.includes(marker)).length;
      if (matches > 0) {
        emotions[emotion] = matches;
        totalIntensity += matches;
        emotionCount++;
      }
    }

    // Find primary emotion
    const primary = Object.keys(emotions).reduce((a, b) =>
      emotions[a] > emotions[b] ? a : b, 'neutral'
    );

    // Calculate complexity (multiple emotions present)
    const complexity = emotionCount > 1 ? Math.min(emotionCount / 3, 1) : 0;

    // Assess authenticity (vs. social masking)
    const authenticityIndicators = ['really', 'truly', 'honestly', 'genuinely', 'actually'];
    const maskingIndicators = ['fine', 'okay', 'whatever', 'I guess', 'maybe'];

    const authenticity = Math.max(0,
      (authenticityIndicators.filter(word => text.includes(word)).length * 0.3) -
      (maskingIndicators.filter(word => text.includes(word)).length * 0.2)
    );

    return {
      primary: primary || 'neutral',
      intensity: Math.min(totalIntensity / 5, 1),
      complexity,
      authenticity: Math.max(0, Math.min(authenticity, 1))
    };
  }

  private classifyIntent(text: string) {
    const scores = {};

    for (const [category, patterns] of Object.entries(this.requestPatterns)) {
      scores[category] = patterns.filter(pattern => text.includes(pattern)).length;
    }

    const category = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b, 'exploratory'
    ) as any;

    return {
      category,
      subtype: this.getSubtype(category, text),
      confidence: scores[category] > 0 ? Math.min(scores[category] / 3, 1) : 0.3
    };
  }

  private assessUrgency(text: string) {
    const crisisWords = ['emergency', 'urgent', 'immediate', 'crisis', 'desperate', 'breaking point'];
    const therapeuticWords = ['trauma', 'abuse', 'depression', 'anxiety', 'panic', 'suicidal'];
    const developmentalWords = ['growth', 'learning', 'evolving', 'becoming', 'journey'];
    const maintenanceWords = ['check in', 'update', 'routine', 'regular', 'maintenance'];

    return {
      immediate: crisisWords.some(word => text.includes(word)),
      therapeutic: therapeuticWords.some(word => text.includes(word)),
      developmental: developmentalWords.some(word => text.includes(word)),
      maintenance: maintenanceWords.some(word => text.includes(word))
    };
  }

  private identifyThemes(text: string) {
    const themes = {
      relationships: ['relationship', 'partner', 'family', 'friend', 'love', 'conflict', 'connection'],
      career: ['work', 'job', 'career', 'profession', 'boss', 'colleague', 'salary'],
      identity: ['who am I', 'identity', 'self', 'personality', 'authenticity', 'values'],
      spirituality: ['spiritual', 'soul', 'meaning', 'purpose', 'divine', 'sacred', 'transcendent'],
      creativity: ['creative', 'art', 'expression', 'innovation', 'imagination', 'inspire'],
      trauma: ['trauma', 'abuse', 'hurt', 'wound', 'healing', 'recovery', 'trigger'],
      growth: ['growth', 'development', 'evolving', 'learning', 'progress', 'improvement'],
      practical: ['practical', 'daily', 'routine', 'organize', 'manage', 'plan', 'budget']
    };

    const scores = {};
    for (const [domain, keywords] of Object.entries(themes)) {
      scores[domain] = keywords.filter(keyword => text.includes(keyword)).length;
    }

    const domain = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b, 'growth'
    ) as any;

    // Determine depth
    const depthIndicators = {
      surface: ['just', 'simple', 'quick', 'basic'],
      emerging: ['starting to', 'beginning', 'noticing', 'becoming aware'],
      core: ['deep', 'fundamental', 'essential', 'core', 'heart of'],
      shadow: ['hidden', 'secret', 'ashamed', 'shadow', 'dark', 'unconscious']
    };

    let depth = 'surface' as any;
    let maxDepthScore = 0;

    for (const [depthLevel, indicators] of Object.entries(depthIndicators)) {
      const score = indicators.filter(indicator => text.includes(indicator)).length;
      if (score > maxDepthScore) {
        maxDepthScore = score;
        depth = depthLevel;
      }
    }

    return {
      domain,
      themes: Object.entries(scores)
        .filter(([_, score]) => score > 0)
        .map(([theme, _]) => theme),
      depth
    };
  }

  private calculateArchetypeAlignment(text: string) {
    const alignment = { fire: 0, water: 0, earth: 0, air: 0 };

    for (const [archetype, keywords] of Object.entries(this.archetypeKeywords)) {
      alignment[archetype] = keywords.filter(keyword => text.includes(keyword)).length;
    }

    // Normalize scores
    const total = Object.values(alignment).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      for (const archetype in alignment) {
        alignment[archetype] = alignment[archetype] / total;
      }
    } else {
      // Default balanced alignment if no clear indicators
      alignment.fire = alignment.water = alignment.earth = alignment.air = 0.25;
    }

    return alignment;
  }

  private assessReadiness(text: string, userHistory?: UserHistory) {
    // Insight readiness indicators
    const insightWords = ['understand', 'realize', 'see', 'clarity', 'aware', 'insight'];
    const forInsight = Math.min(
      insightWords.filter(word => text.includes(word)).length / 3, 1
    );

    // Challenge readiness indicators
    const challengeWords = ['ready', 'willing', 'prepared', 'bring it on', 'challenge'];
    const resistanceWords = ['can\'t', 'won\'t', 'refuse', 'not ready', 'too much'];
    const forChallenge = Math.max(0, Math.min(
      (challengeWords.filter(word => text.includes(word)).length * 0.4) -
      (resistanceWords.filter(word => text.includes(word)).length * 0.3), 1
    ));

    // Support readiness indicators
    const supportWords = ['help', 'support', 'need', 'struggling', 'difficult'];
    const forSupport = Math.min(
      supportWords.filter(word => text.includes(word)).length / 3, 1
    );

    // Action readiness indicators
    const actionWords = ['do', 'act', 'implement', 'start', 'begin', 'change'];
    const forAction = Math.min(
      actionWords.filter(word => text.includes(word)).length / 3, 1
    );

    return { forInsight, forChallenge, forSupport, forAction };
  }

  private detectCommunicationStyle(text: string) {
    // Directness indicators
    const directWords = ['directly', 'straight', 'blunt', 'honest', 'clear'];
    const indirectWords = ['maybe', 'perhaps', 'kind of', 'sort of', 'I guess'];
    const directness = Math.max(0, Math.min(
      (directWords.filter(word => text.includes(word)).length * 0.3) -
      (indirectWords.filter(word => text.includes(word)).length * 0.2) + 0.5, 1
    ));

    // Metaphorical thinking
    const metaphorWords = ['like', 'as if', 'imagine', 'picture', 'feels like'];
    const metaphoricalThinking = Math.min(
      metaphorWords.filter(word => text.includes(word)).length / 3, 1
    );

    // Analytical preference
    const analyticalWords = ['analyze', 'logic', 'reason', 'rational', 'think through'];
    const analyticalPreference = Math.min(
      analyticalWords.filter(word => text.includes(word)).length / 3, 1
    );

    // Emotional expression comfort
    const emotionalWords = ['feel', 'emotion', 'heart', 'soul', 'spirit'];
    const emotionalExpressionComfort = Math.min(
      emotionalWords.filter(word => text.includes(word)).length / 3, 1
    );

    return {
      directness,
      metaphoricalThinking,
      analyticalPreference,
      emotionalExpressionComfort
    };
  }

  private getSubtype(category: string, text: string): string {
    const subtypes = {
      analytical: text.includes('deep') ? 'deep_analysis' : text.includes('quick') ? 'quick_insight' : 'general_analysis',
      supportive: text.includes('crisis') ? 'crisis_support' : text.includes('gentle') ? 'gentle_support' : 'general_support',
      creative: text.includes('brainstorm') ? 'brainstorming' : text.includes('vision') ? 'visioning' : 'creative_exploration',
      practical: text.includes('step') ? 'step_by_step' : text.includes('plan') ? 'planning' : 'practical_guidance',
      exploratory: text.includes('meaning') ? 'meaning_exploration' : text.includes('path') ? 'path_finding' : 'general_exploration',
      crisis: text.includes('emergency') ? 'emergency' : 'crisis_intervention'
    };

    return subtypes[category] || 'general';
  }

  private getLeadingArchetype(alignment: any): string {
    return Object.keys(alignment).reduce((a, b) =>
      alignment[a] > alignment[b] ? a : b
    );
  }

  // Enhanced methods for Spiralogic integration
  private identifyThemesWithSpiralogic(text: string) {
    // Base theme detection
    const themes = {
      relationships: ['relationship', 'partner', 'family', 'friend', 'love', 'conflict', 'connection'],
      career: ['work', 'job', 'career', 'profession', 'boss', 'colleague', 'salary'],
      identity: ['who am I', 'identity', 'self', 'personality', 'authenticity', 'values'],
      spirituality: ['spiritual', 'soul', 'meaning', 'purpose', 'divine', 'sacred', 'transcendent'],
      creativity: ['creative', 'art', 'expression', 'innovation', 'imagination', 'inspire'],
      trauma: ['trauma', 'abuse', 'hurt', 'wound', 'healing', 'recovery', 'trigger'],
      growth: ['growth', 'development', 'evolving', 'learning', 'progress', 'improvement'],
      practical: ['practical', 'daily', 'routine', 'organize', 'manage', 'plan', 'budget']
    };

    const scores = {};
    const spiralogicResonance = [];

    for (const [domain, keywords] of Object.entries(themes)) {
      scores[domain] = keywords.filter(keyword => text.includes(keyword)).length;
    }

    const domain = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b, 'growth'
    ) as any;

    // Map to Spiralogic facets based on content
    if (text.includes('vision') || text.includes('calling')) spiralogicResonance.push('fire-1');
    if (text.includes('expression') || text.includes('creative')) spiralogicResonance.push('fire-2');
    if (text.includes('healing') || text.includes('emotions')) spiralogicResonance.push('water-1');
    if (text.includes('transformation') || text.includes('patterns')) spiralogicResonance.push('water-2');
    if (text.includes('purpose') || text.includes('service')) spiralogicResonance.push('earth-1');
    if (text.includes('resources') || text.includes('planning')) spiralogicResonance.push('earth-2');
    if (text.includes('relationship') || text.includes('connection')) spiralogicResonance.push('air-1');
    if (text.includes('communication') || text.includes('clarity')) spiralogicResonance.push('air-3');

    // Determine depth
    const depthIndicators = {
      surface: ['just', 'simple', 'quick', 'basic'],
      emerging: ['starting to', 'beginning', 'noticing', 'becoming aware'],
      core: ['deep', 'fundamental', 'essential', 'core', 'heart of'],
      shadow: ['hidden', 'secret', 'ashamed', 'shadow', 'dark', 'unconscious']
    };

    let depth = 'surface' as any;
    let maxDepthScore = 0;

    for (const [depthLevel, indicators] of Object.entries(depthIndicators)) {
      const score = indicators.filter(indicator => text.includes(indicator)).length;
      if (score > maxDepthScore) {
        maxDepthScore = score;
        depth = depthLevel;
      }
    }

    return {
      domain,
      themes: Object.entries(scores)
        .filter(([_, score]) => score > 0)
        .map(([theme, _]) => theme),
      depth,
      spiralogicResonance
    };
  }

  private calculateArchetypeAlignmentEnhanced(text: string) {
    const alignment = { fire: 0, water: 0, earth: 0, air: 0 };

    // Enhanced archetypal keyword detection with alchemical processes
    const enhancedKeywords = {
      fire: [
        ...this.archetypeKeywords.fire,
        'vision', 'breakthrough', 'ignite', 'catalyst', 'phoenix', 'alchemy', 'calcinatio'
      ],
      water: [
        ...this.archetypeKeywords.water,
        'dissolve', 'release', 'surrender', 'solutio', 'cleansing', 'renewal', 'rebirth'
      ],
      earth: [
        ...this.archetypeKeywords.earth,
        'structure', 'discipline', 'harvest', 'coagulatio', 'crystallize', 'solidify'
      ],
      air: [
        ...this.archetypeKeywords.air,
        'synthesis', 'wisdom', 'teaching', 'sublimatio', 'refine', 'elevate', 'transcend'
      ]
    };

    for (const [archetype, keywords] of Object.entries(enhancedKeywords)) {
      alignment[archetype] = keywords.filter(keyword => text.includes(keyword)).length;
    }

    // Normalize scores
    const total = Object.values(alignment).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      for (const archetype in alignment) {
        alignment[archetype] = alignment[archetype] / total;
      }
    } else {
      // Default balanced alignment
      alignment.fire = alignment.water = alignment.earth = alignment.air = 0.25;
    }

    return alignment;
  }

  private detectSpiralogicFacet(text: string) {
    // Detect which of the 12 facets is most resonant
    const facetKeywords = {
      'air-1': ['relationship', 'partner', 'intimacy', 'connection', 'relating'],
      'air-2': ['group', 'community', 'team', 'collaboration', 'belonging'],
      'air-3': ['teaching', 'sharing', 'communication', 'systems', 'wisdom'],
      'fire-1': ['vision', 'identity', 'calling', 'intuition', 'purpose'],
      'fire-2': ['creativity', 'expression', 'performance', 'art', 'play'],
      'fire-3': ['spiritual', 'transcendent', 'expansion', 'higher', 'sacred'],
      'water-1': ['nurturing', 'home', 'safety', 'comfort', 'belonging'],
      'water-2': ['healing', 'transformation', 'release', 'patterns', 'shadow'],
      'water-3': ['soul', 'essence', 'inner truth', 'depth', 'mystic'],
      'earth-1': ['service', 'contribution', 'mission', 'giving back', 'purpose'],
      'earth-2': ['resources', 'planning', 'building', 'development', 'structure'],
      'earth-3': ['mastery', 'ethics', 'discipline', 'refinement', 'code']
    };

    let bestFacet = 'fire-1';
    let highestScore = 0;

    for (const [facet, keywords] of Object.entries(facetKeywords)) {
      const score = keywords.filter(keyword => text.includes(keyword)).length;
      if (score > highestScore) {
        highestScore = score;
        bestFacet = facet;
      }
    }

    const [element, stage] = bestFacet.split('-');

    return {
      primaryFacet: bestFacet,
      resonanceScore: Math.min(highestScore / 3, 1),
      developmentalStage: parseInt(stage) as 1 | 2 | 3,
      elementalBalance: {
        fire: element === 'fire' ? 0.7 : 0.1,
        water: element === 'water' ? 0.7 : 0.1,
        earth: element === 'earth' ? 0.7 : 0.1,
        air: element === 'air' ? 0.7 : 0.1,
        aether: 0.1
      }
    };
  }

  private assessReadinessEnhanced(text: string, userHistory?: UserHistory, facet?: any) {
    // Base readiness assessment
    const baseReadiness = this.assessReadiness(text, userHistory);

    // Enhanced with transformation readiness
    const transformationWords = ['transform', 'change', 'evolve', 'breakthrough', 'alchemy'];
    const forTransformation = Math.min(
      transformationWords.filter(word => text.includes(word)).length / 3, 1
    );

    return {
      ...baseReadiness,
      forTransformation
    };
  }

  private detectElementalPhase(text: string, facet?: any) {
    // Determine current elemental phase and alchemical process
    let currentElement: 'fire' | 'water' | 'earth' | 'air' | 'aether' = 'fire';
    let alchemicalProcess: 'calcinatio' | 'solutio' | 'coagulatio' | 'sublimatio' | 'coniunctio' = 'calcinatio';

    if (facet) {
      const [element] = facet.primaryFacet.split('-');
      currentElement = element as any;
    }

    // Map elements to alchemical processes
    const processMap = {
      fire: 'calcinatio',
      water: 'solutio',
      earth: 'coagulatio',
      air: 'sublimatio',
      aether: 'coniunctio'
    };
    alchemicalProcess = processMap[currentElement] as any;

    // Determine friction vs scaffolding needs based on element
    const frictionNeeds = { fire: 0.8, air: 0.7, water: 0.3, earth: 0.4, aether: 0.2 };
    const scaffoldingNeeds = { fire: 0.2, air: 0.3, water: 0.8, earth: 0.7, aether: 0.5 };

    return {
      currentElement,
      alchemicalProcess,
      phaseDescription: this.getPhaseDescription(currentElement, alchemicalProcess),
      frictionNeed: frictionNeeds[currentElement],
      scaffoldingNeed: scaffoldingNeeds[currentElement]
    };
  }

  private getPhaseDescription(element: string, process: string): string {
    const descriptions = {
      'fire-calcinatio': 'Burning away the inessential to reveal authentic vision',
      'water-solutio': 'Dissolving rigid patterns through emotional flow',
      'earth-coagulatio': 'Crystallizing insights into tangible manifestation',
      'air-sublimatio': 'Refining understanding through elevated perspective',
      'aether-coniunctio': 'Integrating all elements in unified consciousness'
    };

    return descriptions[`${element}-${process}`] || 'Archetypal transformation in process';
  }

  private getFallbackAnalysis(): ContextAnalysis {
    return {
      emotionalTone: { primary: 'neutral', intensity: 0.5, complexity: 0, authenticity: 0.5 },
      requestType: { category: 'exploratory', subtype: 'general', confidence: 0.3 },
      urgencyLevel: { immediate: false, therapeutic: false, developmental: true, maintenance: false },
      topicCategory: { domain: 'growth', themes: ['growth'], depth: 'surface', spiralogicResonance: [] },
      archetypeAlignment: { fire: 0.25, water: 0.25, earth: 0.25, air: 0.25 },
      readiness: { forInsight: 0.5, forChallenge: 0.3, forSupport: 0.7, forAction: 0.4, forTransformation: 0.5 },
      communicationStyle: {
        directness: 0.5,
        metaphoricalThinking: 0.3,
        analyticalPreference: 0.4,
        emotionalExpressionComfort: 0.5
      },
      spiralogicFacet: {
        primaryFacet: 'fire-1',
        resonanceScore: 0.3,
        developmentalStage: 1,
        elementalBalance: { fire: 0.25, water: 0.25, earth: 0.25, air: 0.25, aether: 0.0 }
      },
      elementalPhase: {
        currentElement: 'fire',
        alchemicalProcess: 'calcinatio',
        phaseDescription: 'Beginning archetypal journey with vision and identity',
        frictionNeed: 0.6,
        scaffoldingNeed: 0.4
      }
    };
  }

  // Method to score archetype responses from assessment survey
  scoreArchetypeResponses(responses: string[]): UserHistory['archetypeProfile'] {
    const counts: Record<string, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0
    };

    // Count responses
    responses.forEach(response => {
      const archetype = response.toLowerCase();
      if (counts[archetype] !== undefined) {
        counts[archetype]++;
      }
    });

    // Sort archetypes by score
    const sortedArchetypes = Object.entries(counts)
      .sort((a, b) => b[1] - a[1]) as [('fire' | 'water' | 'earth' | 'air'), number][];

    // Identify dominant and secondary
    const dominant = sortedArchetypes[0][0];
    const secondary = sortedArchetypes[1] ? sortedArchetypes[1][0] : sortedArchetypes[0][0];

    return {
      dominant,
      secondary,
      scores: {
        fire: counts.fire,
        water: counts.water,
        earth: counts.earth,
        air: counts.air
      },
      dateAssessed: new Date()
    };
  }

  // Blend live detection with baseline archetype profile
  private blendArchetypeAlignment(
    liveAlignment: Record<string, number>,
    profile: UserHistory['archetypeProfile']
  ): Record<string, number> {
    if (!profile) return liveAlignment;

    // Weight baseline profile at 40% and live detection at 60%
    const baselineWeight = 0.4;
    const liveWeight = 0.6;

    // Normalize profile scores to percentages
    const totalProfileScore = Object.values(profile.scores).reduce((sum, score) => sum + score, 0) || 1;

    const blended = {
      fire: (profile.scores.fire / totalProfileScore * baselineWeight) + (liveAlignment.fire * liveWeight),
      water: (profile.scores.water / totalProfileScore * baselineWeight) + (liveAlignment.water * liveWeight),
      earth: (profile.scores.earth / totalProfileScore * baselineWeight) + (liveAlignment.earth * liveWeight),
      air: (profile.scores.air / totalProfileScore * baselineWeight) + (liveAlignment.air * liveWeight)
    };

    // Normalize blended scores
    const total = Object.values(blended).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      for (const archetype in blended) {
        blended[archetype] = blended[archetype] / total;
      }
    }

    return blended;
  }
}

export const contextAnalyzer = new ContextAnalyzer();