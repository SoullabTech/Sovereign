/**
 * 🔍 PERSONAL METRICS SERVICE
 *
 * The "Soul Mirror" - thin aggregation layer that creates personal metrics
 * by pulling from MAIA's Seven-Layer Soul Architecture. Provides clean,
 * member-facing insights for the Sacred Lab drawer.
 *
 * Seven-Layer Integration:
 * • Episodes (Layer 1) + Symbols (Layer 2) → Practice & Integration metrics
 * • Core Profile (Layer 3) + Canonical Wisdom (Layer 7) → Elemental & Archetypal balance
 * • Spiral Trajectories (Layer 4) + Constellation (Layer 5) → Spiral load & focus
 * • Community Field (Layer 6) → Field context & alignment
 *
 * Philosophy: Sacred reflection, not clinical judgment.
 * Location: MAIA Sacred Lab drawer → "Inner Diagnostics" (/labtools/metrics)
 */

import type { CoreMemberProfile } from '@/lib/services/core-member-profile';
import type { MemberSpiralConstellation } from '@/lib/services/spiral-constellation';
import type { CommunityField } from '@/lib/services/community-field-memory';
import type { WisdomResponse } from '@/lib/services/maia-knowledge-base';

// ==============================================================================
// PERSONAL METRICS SNAPSHOT INTERFACE
// ==============================================================================

export interface PersonalMetricsSnapshot {
  memberId: string;
  generatedAt: string;

  // 1. ELEMENTAL & ARCHETYPAL INTELLIGENCE
  elementalBalance: {
    fire: number;      // 0-1, passion/action/transformation
    water: number;     // 0-1, emotion/flow/depth
    earth: number;     // 0-1, grounding/structure/embodiment
    air: number;       // 0-1, mind/communication/transcendence
    aether: number;    // 0-1, spirit/cosmos/unity
    balanceIndex: number;  // 0-1, how balanced across elements
    dominantElement: string;
    emergingElement: string | null;
  };

  dominantFacets: string[];        // ['Fire2', 'Water3'] - current archetypal expressions
  activeArchetypes: ArchetypeActivation[];  // top 3 currently in play

  // 2. SPIRAL CONSTELLATION STATUS
  spiralConstellation: {
    activeSpiralCount: number;
    primarySpiralDomain: string | null;      // e.g. 'vocation', 'relationship'
    spiralLoad: 'light' | 'moderate' | 'intense' | 'overwhelming';
    phaseDistribution: Record<string, number>; // % in emergence/deepening/mastery
    averageIntensity: number;          // 0-1, how intense current work is
    harmonicCoherence: number;         // 0-1, how well spirals work together
    crossPatternActivity: number;      // 0-1, how much cross-spiral integration
  };

  // 3. ENGAGEMENT & PRACTICE
  engagement: {
    sessionsLast30Days: number;
    journalEntriesLast30Days: number;
    protocolEngagement: number;        // 0-1, practice completion rate
    sessionDepth: 'surface' | 'exploratory' | 'integrative' | 'transformative';
    consistencyPattern: 'sporadic' | 'regular' | 'intensive' | 'cyclical';
  };

  // 4. DEVELOPMENT TRAJECTORY
  development: {
    evolutionTrend: 'emerging' | 'ascending' | 'integrating' | 'stabilizing' | 'transcending';
    integrationIndex: number;        // 0-1, insight → embodied action rate
    shadowEngagementIndex: number;   // 0-1, willingness to meet difficult content
    developmentVelocity: number;     // 0-1, rate of consciousness expansion
    readinessLevel: number;          // 0-1, openness to next level challenges
    wisdomDepth: 'foundational' | 'therapeutic' | 'archetypal' | 'cosmic';
  };

  // 5. FIELD CONTEXT & RESONANCE
  fieldContext: {
    primaryFieldTheme: string;          // "Authority integration across life domains"
    communityResonance: number;         // 0-1, alignment with field
    fieldPosition: 'edge' | 'center' | 'bridge' | 'catalyst';
    similarityPercentile: number;       // where they sit compared to community
    contributionLevel: 'learning' | 'participating' | 'contributing' | 'teaching';
  };

  // 6. CONSCIOUSNESS QUALITY INDICATORS
  consciousness: {
    presenceDepth: number;           // 0-1, quality of awareness
    emotionalFluidity: number;       // 0-1, emotional regulation and flow
    somaticAwareness: number;        // 0-1, body connection and wisdom
    relationshipCapacity: number;    // 0-1, intimacy and boundary health
    creativePotency: number;         // 0-1, creative expression and flow
    spiritualConnection: number;     // 0-1, sense of meaning and transcendence
  };

  // 7. INSIGHTS & GUIDANCE
  insights: {
    currentFocus: string;            // "Deepening emotional intimacy in relationship spiral"
    nextEdge: string;               // "Ready for fire mastery integration"
    supportNeeded: string[];        // ["Somatic practices", "Conflict resolution"]
    celebrationWorthy: string[];    // Recent achievements and breakthroughs
    gentleInvitation: string;       // Next step suggestion
  };

  // 8. MAIA'S REFLECTION
  maiaReflection: {
    whisper: string;                // MAIA's gentle insight about this moment
    tone: 'supportive' | 'celebratory' | 'grounding' | 'encouraging';
    sacred_guidance: string;        // Deeper wisdom reflection
  };

  // META
  viewMode: 'gentle' | 'detailed' | 'facilitator';
  dataConfidence: number;          // 0-1, how much data supports these insights
}

export interface ArchetypeActivation {
  name: string;                    // "The Lover", "The Warrior"
  domain: string;                  // "relationship", "vocation"
  activation: number;              // 0-1, how active right now
  expression: 'shadow' | 'emerging' | 'integrated' | 'transcendent';
  guidance: string;               // Brief archetypal insight
}

// ==============================================================================
// PERSONAL METRICS SERVICE
// ==============================================================================

export class PersonalMetricsService {
  constructor(
    private coreProfileService: any,    // CoreMemberProfileService
    private spiralService: any,         // SpiralConstellationService
    private communityService: any,      // CommunityFieldMemoryService
    private wisdomService: any,         // MAIAKnowledgeBaseService
    private sessionManager: any,        // SessionManager
    private episodeManager: any         // EpisodeManager
  ) {}

  /**
   * Generate complete personal metrics snapshot
   */
  async getPersonalMetricsSnapshot(
    memberId: string,
    viewMode: 'gentle' | 'detailed' | 'facilitator' = 'gentle'
  ): Promise<PersonalMetricsSnapshot> {
    try {
      // 🛡️ DEVELOPMENT MODE: Check if services are properly initialized
      if (!this.coreProfileService) {
        console.warn(`⚠️ PersonalMetricsService: coreProfileService not initialized, returning mock data for ${memberId}`);
        return this.generateMockSnapshot(memberId);
      }

      // Gather data from all seven layers
      const [
        coreProfile,
        spiralConstellation,
        communityField,
        recentSessions,
        recentEpisodes
      ] = await Promise.all([
        this.coreProfileService.getCoreMemberProfile(memberId),
        this.spiralService?.getConstellationForMember?.(memberId) || null,
        this.communityService?.getMemberResonanceProfile?.(memberId) || null,
        this.getRecentSessions(memberId, 30),
        this.getRecentEpisodes(memberId, 30)
      ]);

      // Calculate each metrics section
      const elementalBalance = this.calculateElementalBalance(coreProfile, spiralConstellation);
      const dominantFacets = this.extractDominantFacets(coreProfile);
      const activeArchetypes = await this.calculateActiveArchetypes(memberId, coreProfile, spiralConstellation);

      const spiralMetrics = this.calculateSpiralMetrics(spiralConstellation);
      const engagement = this.calculateEngagementMetrics(recentSessions, recentEpisodes);
      const development = this.calculateDevelopmentMetrics(coreProfile, spiralConstellation, recentEpisodes);
      const fieldContext = this.calculateFieldContext(communityField, coreProfile);
      const consciousness = this.calculateConsciousnessQuality(coreProfile, spiralConstellation);
      const insights = await this.generateInsights(coreProfile, spiralConstellation, development);
      const maiaReflection = this.generateMAIAReflection(spiralMetrics, development, engagement);

      const snapshot: PersonalMetricsSnapshot = {
        memberId,
        generatedAt: new Date().toISOString(),
        elementalBalance,
        dominantFacets,
        activeArchetypes,
        spiralConstellation: spiralMetrics,
        engagement,
        development,
        fieldContext,
        consciousness,
        insights,
        maiaReflection,
        viewMode,
        dataConfidence: this.calculateDataConfidence(recentSessions, recentEpisodes, coreProfile)
      };

      return this.filterByViewMode(snapshot, viewMode);

    } catch (error) {
      console.error(`Error generating personal metrics for ${memberId}:`, error);
      throw error;
    }
  }

  /**
   * Get simplified metrics for dashboard widgets
   */
  async getMetricsDigest(memberId: string): Promise<{
    elementalPrimary: string;
    spiralCount: number;
    currentFocus: string;
    developmentMoment: string;
    fieldAlignment: string;
  }> {
    try {
      const snapshot = await this.getPersonalMetricsSnapshot(memberId, 'gentle');

      return {
        elementalPrimary: snapshot.elementalBalance.dominantElement,
        spiralCount: snapshot.spiralConstellation.activeSpiralCount,
        currentFocus: snapshot.spiralConstellation.primarySpiralDomain || 'Integration',
        developmentMoment: snapshot.development.evolutionTrend,
        fieldAlignment: snapshot.fieldContext.primaryFieldTheme
      };

    } catch (error) {
      console.error(`Error generating metrics digest for ${memberId}:`, error);
      throw error;
    }
  }

  // ==============================================================================
  // PRIVATE CALCULATION METHODS
  // ==============================================================================

  private calculateElementalBalance(
    coreProfile: CoreMemberProfile,
    constellation: any
  ): PersonalMetricsSnapshot['elementalBalance'] {

    // Aggregate from profile insights and constellation
    const profileElements = coreProfile.profileInsights.dominantElements;
    const constellationElements = constellation?.elementalBalance || { fire: 0.5, water: 0.5, earth: 0.5, air: 0.5 };

    // Weighted average (profile slightly favored as more stable)
    const fire = (profileElements.fire * 0.6) + (constellationElements.fire * 0.4);
    const water = (profileElements.water * 0.6) + (constellationElements.water * 0.4);
    const earth = (profileElements.earth * 0.6) + (constellationElements.earth * 0.4);
    const air = (profileElements.air * 0.6) + (constellationElements.air * 0.4);
    const aether = 0.2; // Mock - would calculate from transcendence indicators

    // Calculate balance index (1 = perfectly balanced, 0 = extremely imbalanced)
    const elements = [fire, water, earth, air, aether];
    const mean = elements.reduce((a, b) => a + b) / elements.length;
    const variance = elements.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / elements.length;
    const balanceIndex = Math.max(0, 1 - (variance * 4)); // Scale variance to 0-1

    // Determine dominant and emerging
    const elementMap = { fire, water, earth, air, aether };
    const sorted = Object.entries(elementMap).sort(([,a], [,b]) => b - a);
    const dominantElement = this.elementToName(sorted[0][0]);
    const emergingElement = sorted[1][1] > 0.6 ? this.elementToName(sorted[1][0]) : null;

    return {
      fire,
      water,
      earth,
      air,
      aether,
      balanceIndex,
      dominantElement,
      emergingElement
    };
  }

  private elementToName(element: string): string {
    const names = {
      fire: 'Fire (Transformation)',
      water: 'Water (Flow)',
      earth: 'Earth (Embodiment)',
      air: 'Air (Transcendence)',
      aether: 'Aether (Unity)'
    };
    return names[element as keyof typeof names] || element;
  }

  private extractDominantFacets(coreProfile: CoreMemberProfile): string[] {
    // Would analyze profile for current facet expressions
    return ['Fire2 (Sacred Warrior)', 'Water3 (Deep Feeler)'];
  }

  private async calculateActiveArchetypes(
    memberId: string,
    coreProfile: CoreMemberProfile,
    constellation: any
  ): Promise<ArchetypeActivation[]> {
    try {
      // Get archetype guidance from wisdom service
      const archetypes = await this.wisdomService.getArchetypeGuidance(
        constellation?.primarySpiral?.lifeDomain || 'universal',
        'current expression context', // would extract from profile
        coreProfile.consciousnessReadiness.wisdomDepth === 'cosmic' ? 0.9 : 0.7
      );

      return archetypes.slice(0, 3).map(archetype => ({
        name: archetype.name,
        domain: constellation?.primarySpiral?.lifeDomain || 'universal',
        activation: 0.7 + Math.random() * 0.3, // Mock - would calculate from recent patterns
        expression: 'integrated', // Mock - would analyze from episodes
        guidance: `Working with ${archetype.name.toLowerCase()} energy in current development`
      }));

    } catch (error) {
      console.error('Error calculating active archetypes:', error);
      return [
        {
          name: 'The Seeker',
          domain: 'universal',
          activation: 0.8,
          expression: 'integrated',
          guidance: 'Active exploration and truth-seeking energy'
        }
      ];
    }
  }

  private calculateSpiralMetrics(constellation: any): PersonalMetricsSnapshot['spiralConstellation'] {
    if (!constellation) {
      return {
        activeSpiralCount: 0,
        primarySpiralDomain: null,
        spiralLoad: 'light',
        phaseDistribution: {},
        averageIntensity: 0,
        harmonicCoherence: 0,
        crossPatternActivity: 0
      };
    }

    const activeSpiralCount = constellation.activeSpirals?.length || 0;
    const averageIntensity = constellation.activeSpirals?.reduce((acc: number, spiral: any) =>
      acc + spiral.intensity, 0) / activeSpiralCount || 0;

    // Determine spiral load
    let spiralLoad: 'light' | 'moderate' | 'intense' | 'overwhelming';
    if (activeSpiralCount <= 1) spiralLoad = 'light';
    else if (activeSpiralCount <= 2) spiralLoad = 'moderate';
    else if (activeSpiralCount <= 3) spiralLoad = 'intense';
    else spiralLoad = 'overwhelming';

    // Calculate phase distribution
    const phaseDistribution: Record<string, number> = {};
    constellation.activeSpirals?.forEach((spiral: any) => {
      const phase = spiral.currentPhase?.refinement || 'emergence';
      phaseDistribution[phase] = (phaseDistribution[phase] || 0) + 1;
    });

    // Normalize to percentages
    Object.keys(phaseDistribution).forEach(phase => {
      phaseDistribution[phase] = phaseDistribution[phase] / activeSpiralCount;
    });

    return {
      activeSpiralCount,
      primarySpiralDomain: constellation.primarySpiralId ?
        constellation.activeSpirals.find((s: any) => s.id === constellation.primarySpiralId)?.lifeDomain : null,
      spiralLoad,
      phaseDistribution,
      averageIntensity,
      harmonicCoherence: constellation.overallHarmonicCoherence || 0,
      crossPatternActivity: (constellation.crossPatterns?.length || 0) / Math.max(1, activeSpiralCount)
    };
  }

  private calculateEngagementMetrics(sessions: any[], episodes: any[]): PersonalMetricsSnapshot['engagement'] {
    const sessionsLast30Days = sessions.length;
    const journalEntriesLast30Days = episodes.filter(e => e.type === 'journal').length;

    // Mock protocol engagement - would track actual completion
    const protocolEngagement = 0.65;

    // Determine session depth from recent sessions
    const avgDepth = sessions.reduce((acc, session) => {
      const depthScore = {
        'challenging': 0.9,
        'exploratory': 0.7,
        'integrative': 0.8,
        'transcendent': 1.0
      };
      return acc + (depthScore[session.emotionalTone as keyof typeof depthScore] || 0.5);
    }, 0) / Math.max(1, sessions.length);

    let sessionDepth: 'surface' | 'exploratory' | 'integrative' | 'transformative';
    if (avgDepth < 0.4) sessionDepth = 'surface';
    else if (avgDepth < 0.6) sessionDepth = 'exploratory';
    else if (avgDepth < 0.8) sessionDepth = 'integrative';
    else sessionDepth = 'transformative';

    // Determine consistency pattern
    let consistencyPattern: 'sporadic' | 'regular' | 'intensive' | 'cyclical';
    if (sessionsLast30Days < 5) consistencyPattern = 'sporadic';
    else if (sessionsLast30Days < 15) consistencyPattern = 'regular';
    else if (sessionsLast30Days < 25) consistencyPattern = 'intensive';
    else consistencyPattern = 'cyclical'; // Mock detection

    return {
      sessionsLast30Days,
      journalEntriesLast30Days,
      protocolEngagement,
      sessionDepth,
      consistencyPattern
    };
  }

  private calculateDevelopmentMetrics(
    coreProfile: CoreMemberProfile,
    constellation: any,
    episodes: any[]
  ): PersonalMetricsSnapshot['development'] {

    // Evolution trend from profile insights
    const evolutionTrend = coreProfile.profileInsights.developmentPhase === 'discovery' ? 'emerging' :
                          coreProfile.profileInsights.developmentPhase === 'exploration' ? 'ascending' :
                          coreProfile.profileInsights.developmentPhase === 'integration' ? 'integrating' :
                          coreProfile.profileInsights.developmentPhase === 'mastery' ? 'transcending' : 'stabilizing';

    // Integration index from episodes - mock calculation
    const insightEpisodes = episodes.filter(e => e.type === 'insight').length;
    const actionEpisodes = episodes.filter(e => e.type === 'integration').length;
    const integrationIndex = actionEpisodes / Math.max(1, insightEpisodes);

    // Shadow engagement from episodes tagged with challenge/shadow content
    const challengeEpisodes = episodes.filter(e => e.tags?.includes('shadow') || e.tags?.includes('challenge')).length;
    const shadowEngagementIndex = Math.min(1, challengeEpisodes / Math.max(1, episodes.length * 0.3));

    // Development velocity - mock from constellation health
    const developmentVelocity = constellation?.constellationHealth === 'transcendent' ? 0.9 :
                               constellation?.constellationHealth === 'integrated' ? 0.8 :
                               constellation?.constellationHealth === 'focused' ? 0.6 : 0.4;

    // Readiness level from consciousness readiness
    const readinessMap = {
      'implicit': 0.3,
      'emerging': 0.5,
      'explicit': 0.8,
      'collaborative': 0.9
    };
    const readinessLevel = readinessMap[coreProfile.consciousnessReadiness.spiralAwareness] || 0.5;

    return {
      evolutionTrend: evolutionTrend as any,
      integrationIndex: Math.min(1, integrationIndex),
      shadowEngagementIndex,
      developmentVelocity,
      readinessLevel,
      wisdomDepth: coreProfile.consciousnessReadiness.wisdomDepth
    };
  }

  private calculateFieldContext(resonanceProfile: any, coreProfile: CoreMemberProfile): PersonalMetricsSnapshot['fieldContext'] {
    return {
      primaryFieldTheme: "Authority integration across relationship and vocation", // Mock - from community field
      communityResonance: resonanceProfile?.overallResonance || 0.7,
      fieldPosition: 'center', // Mock - would calculate from contribution patterns
      similarityPercentile: 0.65, // Mock - where they sit compared to others
      contributionLevel: resonanceProfile?.fieldInfluence > 0.7 ? 'teaching' :
                        resonanceProfile?.fieldInfluence > 0.5 ? 'contributing' :
                        resonanceProfile?.fieldInfluence > 0.3 ? 'participating' : 'learning'
    };
  }

  private calculateConsciousnessQuality(
    coreProfile: CoreMemberProfile,
    constellation: any
  ): PersonalMetricsSnapshot['consciousness'] {

    // Extract from trajectory if available
    const trajectory = coreProfile.profileLayers.personalTrajectory;

    return {
      presenceDepth: trajectory?.consciousnessExpansion || 0.7,
      emotionalFluidity: constellation?.elementalBalance?.water || 0.6,
      somaticAwareness: trajectory?.embodimentLevel || 0.6,
      relationshipCapacity: constellation?.elementalBalance?.water * 0.8 || 0.7,
      creativePotency: constellation?.elementalBalance?.fire || 0.6,
      spiritualConnection: constellation?.elementalBalance?.aether || 0.5
    };
  }

  private async generateInsights(
    coreProfile: CoreMemberProfile,
    constellation: any,
    development: PersonalMetricsSnapshot['development']
  ): Promise<PersonalMetricsSnapshot['insights']> {

    const primarySpiral = constellation?.activeSpirals?.find((s: any) => s.id === constellation.primarySpiralId);
    const currentFocus = primarySpiral ?
      `Deepening ${primarySpiral.currentPhase?.element} ${primarySpiral.currentPhase?.refinement} in ${primarySpiral.lifeDomain}` :
      "Integration across multiple life areas";

    const nextEdge = development.readinessLevel > 0.8 ?
      "Ready for advanced spiral constellation work" :
      development.shadowEngagementIndex < 0.6 ?
      "Integration of shadow material would accelerate growth" :
      "Consistent practice to stabilize current insights";

    const supportNeeded: any /* TODO: specify type */[] = [];
    if (development.integrationIndex < 0.6) supportNeeded.push("Integration practices");
    if (development.shadowEngagementIndex < 0.5) supportNeeded.push("Shadow work support");
    if (constellation?.overallHarmonicCoherence < 0.7) supportNeeded.push("Cross-pattern integration");

    const celebrationWorthy: any /* TODO: specify type */[] = [];
    if (development.integrationIndex > 0.8) celebrationWorthy.push("Strong integration of insights into action");
    if (constellation?.overallHarmonicCoherence > 0.8) celebrationWorthy.push("Beautiful harmonic coherence across life spirals");
    if (development.shadowEngagementIndex > 0.7) celebrationWorthy.push("Courageous engagement with challenging material");

    const gentleInvitation = development.evolutionTrend === 'integrating' ?
      "Trust your natural integration process" :
      development.evolutionTrend === 'ascending' ?
      "Allow the expansion while staying grounded" :
      "Honor whatever wants to emerge in this moment";

    return {
      currentFocus,
      nextEdge,
      supportNeeded,
      celebrationWorthy,
      gentleInvitation
    };
  }

  private generateMAIAReflection(
    spiralMetrics: PersonalMetricsSnapshot['spiralConstellation'],
    development: PersonalMetricsSnapshot['development'],
    engagement: PersonalMetricsSnapshot['engagement']
  ): PersonalMetricsSnapshot['maiaReflection'] {

    // High spiral load + high intensity = need for gentle pacing
    if (spiralMetrics.activeSpiralCount > 3 && spiralMetrics.averageIntensity > 0.7) {
      return {
        whisper: "You're carrying a lot of live spirals at once. This is a season for kindness to your nervous system and small, doable steps.",
        tone: 'grounding',
        sacred_guidance: "Remember that consciousness work happens in seasons. Right now, your soul is asking for gentle consistency rather than intensity. Trust the slower unfolding."
      };
    }

    // Strong integration phase = celebrate the deep work
    if (development.evolutionTrend === 'integrating' && development.integrationIndex > 0.6) {
      return {
        whisper: "You're in an integration cycle. Trust the slower unfolding — this is where deep change roots itself.",
        tone: 'supportive',
        sacred_guidance: "Integration is the most sacred part of transformation. What looks like 'not making progress' is actually your soul weaving new patterns into your being. Honor this rhythm."
      };
    }

    // High shadow engagement = recognize the courage
    if (development.shadowEngagementIndex > 0.7) {
      return {
        whisper: "You're meeting your edges with remarkable courage. This willingness to face the difficult parts is how real freedom emerges.",
        tone: 'celebratory',
        sacred_guidance: "Shadow work is soul work. By choosing to meet what's difficult, you're not just healing yourself — you're contributing to the healing of the whole field."
      };
    }

    // Rising/ascending with good practices = encourage momentum
    if ((development.evolutionTrend === 'emerging' || development.evolutionTrend === 'ascending') &&
        engagement.protocolEngagement > 0.6) {
      return {
        whisper: "You're in an expansion phase with beautiful consistency. Let yourself feel how much capacity you're building.",
        tone: 'encouraging',
        sacred_guidance: "This combination of growth and grounded practice creates lasting transformation. You're building the foundation for whatever wants to emerge next."
      };
    }

    // Transcending trend = honor the magnitude
    if (development.evolutionTrend === 'transcending') {
      return {
        whisper: "You're moving through a profound threshold. Trust what's emerging, even when it feels bigger than your familiar self.",
        tone: 'supportive',
        sacred_guidance: "Transcendence isn't about leaving yourself behind — it's about becoming more yourself than you ever imagined possible. Breathe into this expansion."
      };
    }

    // Low engagement but stabilizing = gentle invitation back
    if (engagement.sessionsLast30Days < 5 && development.evolutionTrend === 'stabilizing') {
      return {
        whisper: "It feels like you might be in a quieter phase with your practice. When you're ready, even small reconnections can open new doorways.",
        tone: 'encouraging',
        sacred_guidance: "Sometimes we need to rest from active consciousness work. Trust your rhythm, and know that when you're ready to reengage, your soul will show you the way."
      };
    }

    // Default gentle reflection
    return {
      whisper: "You're in an active phase of becoming. Take a breath and let yourself feel how far you've come.",
      tone: 'supportive',
      sacred_guidance: "Every moment of consciousness work matters, even when it's hard to see the progress. You're participating in the great work of awakening."
    };
  }

  private calculateDataConfidence(sessions: any[], episodes: any[], profile: CoreMemberProfile): number {
    // Higher confidence with more data points
    const sessionScore = Math.min(1, sessions.length / 20); // 20+ sessions = full confidence
    const episodeScore = Math.min(1, episodes.length / 10); // 10+ episodes = full confidence
    const profileScore = profile ? 0.8 : 0; // Profile exists

    return (sessionScore + episodeScore + profileScore) / 3;
  }

  private filterByViewMode(
    snapshot: PersonalMetricsSnapshot,
    viewMode: 'gentle' | 'detailed' | 'facilitator'
  ): PersonalMetricsSnapshot {

    if (viewMode === 'gentle') {
      // Round numbers, soften language
      snapshot.elementalBalance.balanceIndex = Math.round(snapshot.elementalBalance.balanceIndex * 100) / 100;
      // Remove very detailed metrics
    }

    if (viewMode === 'facilitator') {
      // Include all raw data, additional debugging info
    }

    return snapshot;
  }

  // Mock data methods - replace with actual service calls
  private async getRecentSessions(memberId: string, days: number): Promise<any[]> {
    // Mock recent sessions
    return [
      {
        sessionId: 'session1',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        emotionalTone: 'exploratory'
      },
      {
        sessionId: 'session2',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        emotionalTone: 'integrative'
      }
    ];
  }

  private async getRecentEpisodes(memberId: string, days: number): Promise<any[]> {
    // Mock recent episodes
    return [
      {
        episodeId: 'ep1',
        type: 'insight',
        tags: ['relationship'],
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        episodeId: 'ep2',
        type: 'integration',
        tags: ['shadow', 'relationship'],
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * 🛡️ DEVELOPMENT MODE: Generate mock data when services are not initialized
   */
  private generateMockSnapshot(memberId: string): PersonalMetricsSnapshot {
    return {
      memberId,
      generatedAt: new Date().toISOString(),

      // Mock elemental balance
      elementalBalance: {
        fire: 0.3,
        water: 0.25,
        earth: 0.2,
        air: 0.15,
        aether: 0.1,
        balanceIndex: 0.7,
        dominantElement: 'fire',
        emergingElement: 'water'
      },

      dominantFacets: ['Fire2', 'Water3'],
      activeArchetypes: [
        { archetype: 'Warrior', activationLevel: 0.8, developmentalStage: 'integration', awarenessLevel: 'conscious' },
        { archetype: 'Sage', activationLevel: 0.6, developmentalStage: 'exploration', awarenessLevel: 'emerging' }
      ],

      // Mock spiral constellation
      spiralConstellation: {
        activeSpiralCount: 2,
        primarySpiralDomain: 'personal_development',
        spiralLoad: 'moderate' as any,
        focusCoherence: 0.75,
        resolutionMomentum: 0.6,
        nextEvolutionaryEdge: 'Integrating shadow aspects with conscious awareness'
      },

      // Mock engagement metrics
      engagement: {
        weeklySessionCount: 3,
        averageSessionDepth: 7.5,
        practiceConsistency: 0.8,
        integrationMomentum: 0.65,
        lastActiveDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },

      // Mock development metrics
      development: {
        elementalGrowthTrajectory: [
          { element: 'fire', monthlyGrowthRate: 0.15, currentMastery: 0.6 }
        ],
        archetypalEvolution: 0.7,
        wisdomIntegrationScore: 0.65,
        practiceMaturity: 'developing' as any,
        nextDevelopmentalThreshold: 'Shadow integration and authentic expression'
      },

      // Mock field context
      fieldContext: {
        communityAlignment: 0.75,
        collectiveResonance: 0.6,
        fieldContribution: 0.5,
        mutualSupportIndex: 0.8,
        communityGrowthFactor: 0.7
      },

      // Mock archetypal patterns
      archetypalPatterns: {
        dominantArchetype: 'Warrior',
        secondaryArchetype: 'Sage',
        emergingArchetype: 'Healer',
        archetypalTension: 'Integration of power and wisdom',
        evolutionaryDirection: 'Compassionate strength'
      },

      // Mock insights
      insights: [
        {
          type: 'pattern' as any,
          content: 'Strong fire energy seeking balance through water consciousness',
          confidence: 0.8,
          category: 'elemental_evolution'
        }
      ],

      // Mock recommendations
      recommendations: [
        {
          type: 'practice' as any,
          priority: 'high' as any,
          content: 'Focus on water element practices for emotional depth',
          estimatedImpact: 0.7,
          category: 'elemental_balancing'
        }
      ]
    };
  }
}

export default PersonalMetricsService;