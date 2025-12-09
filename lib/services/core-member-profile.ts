/**
 * 🧬 CORE MEMBER PROFILE SERVICE
 *
 * The foundational wrapper that orchestrates all seven layers of MAIA's
 * consciousness architecture into a unified member intelligence profile.
 *
 * Seven Layers:
 * 1. Episodic Memory (SessionManager)
 * 2. Symbolic Memory (EpisodeManager)
 * 3. Profile Memory (CoreProfile)
 * 4. Trajectory Memory (PersonalTrajectory)
 * 5. Constellation Memory (SpiralConstellation)
 * 6. Collective Memory (CommunityField)
 * 7. Canonical Memory (MAIAKnowledge)
 */

import type { QuantumFieldMemory, Pattern, MemoryLayer } from '@/lib/consciousness/memory/QuantumFieldMemory';
import type { MemberSpiralConstellation, SpiralSummary } from '@/lib/services/spiral-constellation';

// ==============================================================================
// CORE MEMBER PROFILE INTERFACE
// ==============================================================================

export interface CoreMemberProfile {
  // Identity and access
  memberId: string;
  membershipLevel: 'community' | 'premium' | 'facilitator' | 'architect';
  lastActiveAt: string;
  joinedAt: string;

  // Profile consciousness layers
  profileLayers: {
    // Layer 1-2: Session & Episode Memory
    recentSessions: SessionSummary[];
    significantEpisodes: EpisodeSummary[];

    // Layer 3: Core Profile
    coreProfile: MemberCoreProfile;

    // Layer 4: Personal Trajectory
    personalTrajectory: PersonalTrajectory | null;

    // Layer 5: Spiral Constellation
    spiralConstellation: MemberSpiralConstellation | null;

    // Layer 6: Collective Field Resonance
    collectiveResonance: CollectiveResonanceProfile;

    // Layer 7: Canonical Wisdom Access
    canonicalWisdom: CanonicalWisdomProfile;
  };

  // Member readiness and exposure settings
  consciousnessReadiness: {
    spiralAwareness: 'implicit' | 'emerging' | 'explicit' | 'collaborative';
    constellationExposure: 'minimal' | 'standard' | 'advanced' | 'facilitator';
    fieldParticipation: 'observer' | 'participant' | 'co-creator' | 'facilitator';
    wisdomDepth: 'foundational' | 'therapeutic' | 'archetypal' | 'cosmic';
  };

  // Profile intelligence
  profileInsights: {
    dominantElements: { fire: number; water: number; earth: number; air: number };
    developmentPhase: 'discovery' | 'exploration' | 'integration' | 'mastery';
    crossLayerPatterns: CrossLayerPattern[];
    consciousnessSignature: string;
    evolutionaryDirection: string;
  };

  // Privacy and data sovereignty
  dataConsent: {
    profileStorage: boolean;
    spiralTracking: boolean;
    collectiveParticipation: boolean;
    wisdomContribution: boolean;
    facilitatorVisibility: boolean;
    lastUpdated: string;
  };
}

// ==============================================================================
// SUPPORTING INTERFACES
// ==============================================================================

export interface SessionSummary {
  sessionId: string;
  timestamp: string;
  duration: number;
  interactionCount: number;
  primaryTopics: string[];
  spiralActivation: string | null;
  emotionalTone: 'challenging' | 'exploratory' | 'integrative' | 'transcendent';
}

export interface EpisodeSummary {
  episodeId: string;
  title: string;
  lifeDomain: string;
  significance: number;
  relatedSpiral: string | null;
  insights: string[];
  elementalSignature: { fire: number; water: number; earth: number; air: number };
  createdAt: string;
}

export interface MemberCoreProfile {
  // Core identity patterns
  identityFacets: string[];
  coreValues: string[];
  lifeThemes: string[];
  challengePatterns: string[];
  growthEdges: string[];

  // Relational intelligence
  relationshipStyle: string;
  communicationPreferences: string[];
  boundaryPatterns: string[];
  intimacyCapacity: string;

  // Life circumstances
  lifeSeason: 'initiation' | 'establishment' | 'mastery' | 'wisdom' | 'transition';
  primaryDomains: string[];
  supportSystems: string[];
  resourceAccess: string[];

  // Consciousness preferences
  explorationStyle: 'gentle' | 'direct' | 'fierce' | 'playful';
  integrationPace: 'slow' | 'steady' | 'intensive' | 'cyclical';
  wisdomOrientation: 'practical' | 'psychological' | 'spiritual' | 'cosmic';

  lastUpdated: string;
}

export interface PersonalTrajectory {
  trajectoryId: string;
  startedAt: string;
  title: string;
  description: string;
  lifeDomain: string;

  // Trajectory intelligence
  currentPhase: TrajectoryPhase;
  completedPhases: TrajectoryPhase[];
  upcomingMilestones: Milestone[];

  // Evolution tracking
  elementalProgression: { fire: number; water: number; earth: number; air: number };
  consciousnessExpansion: number;
  integrationDepth: number;
  embodimentLevel: number;

  // Guidance intelligence
  guidanceStyle: 'gentle' | 'direct' | 'fierce' | 'playful';
  readyForAdvancement: boolean;
  nextDevelopmentEdge: string;
  supportNeeded: string[];

  lastUpdated: string;
}

export interface TrajectoryPhase {
  phaseId: string;
  name: string;
  element: 'fire' | 'water' | 'earth' | 'air';
  refinement: 'emergence' | 'deepening' | 'mastery';
  status: 'upcoming' | 'active' | 'integrating' | 'complete';
  startedAt?: string;
  completedAt?: string;
  keyInsights: string[];
  challenges: string[];
  breakthroughs: string[];
}

export interface Milestone {
  milestoneId: string;
  title: string;
  description: string;
  targetPhase: string;
  significance: 'minor' | 'moderate' | 'major' | 'transformative';
  readinessIndicators: string[];
  supportResources: string[];
}

export interface CollectiveResonanceProfile {
  // Field participation
  fieldContributions: FieldContribution[];
  collectivePatterns: CollectivePattern[];
  communityResonance: number;

  // Wisdom sharing
  wisdomOfferings: WisdomOffering[];
  guidanceStyle: 'listener' | 'mirror' | 'challenger' | 'visionary';
  teachingReadiness: number;

  // Community intelligence
  relationshipMap: CommunityRelationship[];
  collectiveRole: 'learner' | 'peer' | 'mentor' | 'elder' | 'facilitator';
  fieldSensitivity: number;

  lastUpdated: string;
}

export interface FieldContribution {
  contributionId: string;
  type: 'insight' | 'pattern' | 'breakthrough' | 'integration' | 'wisdom';
  content: string;
  lifeDomain: string;
  element: 'fire' | 'water' | 'earth' | 'air';
  resonanceScore: number;
  helpedMembers: number;
  createdAt: string;
}

export interface CollectivePattern {
  patternId: string;
  description: string;
  involvedMembers: number;
  lifeDomains: string[];
  significance: number;
  evolutionaryDirection: string;
  detectedAt: string;
}

export interface WisdomOffering {
  offeringId: string;
  title: string;
  description: string;
  wisdomType: 'experiential' | 'archetypal' | 'practical' | 'cosmic';
  lifeDomain: string;
  accessLevel: 'community' | 'premium' | 'facilitator';
  resonanceScore: number;
  createdAt: string;
}

export interface CommunityRelationship {
  memberId: string;
  relationshipType: 'peer' | 'mentor' | 'mentee' | 'collaborator' | 'inspiration';
  resonanceLevel: number;
  sharedPatterns: string[];
  mutualGrowthEdge: string;
  lastInteraction: string;
}

export interface CanonicalWisdomProfile {
  // Wisdom access patterns
  accessedTeachings: AccessedTeaching[];
  wisdomResonance: WisdomResonance[];
  integrationDepth: number;

  // Teaching relationship
  favoriteTeachers: string[];
  wisdomPreferences: WisdomPreference[];
  teachingStyle: 'experiential' | 'intellectual' | 'somatic' | 'energetic';

  // Cosmic intelligence
  cosmicAwareness: number;
  archetypeAlignment: ArchetypeAlignment[];
  universalPatterns: string[];

  lastUpdated: string;
}

export interface AccessedTeaching {
  teachingId: string;
  title: string;
  teacher: string;
  tradition: string;
  wisdomType: 'foundational' | 'therapeutic' | 'archetypal' | 'cosmic';
  accessCount: number;
  integrationLevel: number;
  personalRelevance: number;
  lastAccessed: string;
}

export interface WisdomResonance {
  teachingId: string;
  resonanceScore: number;
  integrationInsights: string[];
  livedExperience: string[];
  transmissionQuality: number;
  embodimentLevel: number;
}

export interface WisdomPreference {
  category: string;
  preference: 'gentle' | 'direct' | 'fierce' | 'playful';
  depth: 'surface' | 'therapeutic' | 'archetypal' | 'cosmic';
  style: 'narrative' | 'experiential' | 'systematic' | 'poetic';
}

export interface ArchetypeAlignment {
  archetypeName: string;
  alignmentStrength: number;
  expression: 'shadow' | 'emerging' | 'integrated' | 'transcendent';
  lifeDomains: string[];
  developmentEdge: string;
}

export interface CrossLayerPattern {
  patternId: string;
  name: string;
  description: string;
  involvedLayers: ('episodic' | 'symbolic' | 'profile' | 'trajectory' | 'constellation' | 'collective' | 'canonical')[];
  significance: number;
  evolutionaryDirection: string;
  therapeuticOpportunity: string;
  detectedAt: string;
}

// ==============================================================================
// CORE MEMBER PROFILE SERVICE
// ==============================================================================

export class CoreMemberProfileService {
  constructor(
    private quantumMemory: QuantumFieldMemory,
    private storageService: any, // PremiumMemberStorageService
    private spiralService: any, // SpiralConstellationService
    private collectiveService: any, // CommunityFieldService
    private wisdomService: any // MAIAKnowledgeService
  ) {}

  /**
   * Get complete member profile with all seven consciousness layers
   */
  async getCoreMemberProfile(memberId: string): Promise<CoreMemberProfile> {
    try {
      // Load base profile data
      const baseProfile = await this.loadBaseProfile(memberId);

      // Orchestrate all seven layers
      const [
        sessions,
        episodes,
        coreProfile,
        trajectory,
        constellation,
        collectiveResonance,
        canonicalWisdom
      ] = await Promise.all([
        this.getRecentSessions(memberId),
        this.getSignificantEpisodes(memberId),
        this.getCoreProfile(memberId),
        this.getPersonalTrajectory(memberId),
        this.spiralService?.getConstellationForMember(memberId),
        this.collectiveService?.getResonanceProfile(memberId),
        this.wisdomService?.getWisdomProfile(memberId)
      ]);

      // Generate cross-layer intelligence
      const profileInsights = await this.generateProfileInsights(
        memberId,
        { sessions, episodes, coreProfile, trajectory, constellation, collectiveResonance, canonicalWisdom }
      );

      return {
        memberId,
        membershipLevel: baseProfile.membershipLevel,
        lastActiveAt: baseProfile.lastActiveAt,
        joinedAt: baseProfile.joinedAt,

        profileLayers: {
          recentSessions: sessions,
          significantEpisodes: episodes,
          coreProfile,
          personalTrajectory: trajectory,
          spiralConstellation: constellation,
          collectiveResonance,
          canonicalWisdom
        },

        consciousnessReadiness: baseProfile.consciousnessReadiness,
        profileInsights,
        dataConsent: baseProfile.dataConsent
      };

    } catch (error) {
      console.error(`Error loading core member profile for ${memberId}:`, error);
      throw error;
    }
  }

  /**
   * Update member's consciousness readiness levels
   */
  async updateConsciousnessReadiness(
    memberId: string,
    readiness: Partial<CoreMemberProfile['consciousnessReadiness']>
  ): Promise<void> {
    try {
      const currentProfile = await this.loadBaseProfile(memberId);

      const updatedReadiness = {
        ...currentProfile.consciousnessReadiness,
        ...readiness
      };

      await this.storageService.updateProfile(memberId, {
        consciousnessReadiness: updatedReadiness,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error(`Error updating consciousness readiness for ${memberId}:`, error);
      throw error;
    }
  }

  /**
   * Detect cross-layer consciousness patterns
   */
  async detectCrossLayerPatterns(memberId: string): Promise<CrossLayerPattern[]> {
    try {
      const profile = await this.getCoreMemberProfile(memberId);
      const patterns: CrossLayerPattern[] = [];

      // Detect patterns across multiple layers

      // Session-Constellation patterns
      if (profile.profileLayers.spiralConstellation) {
        const sessionSpirals = this.extractSpiralActivationFromSessions(profile.profileLayers.recentSessions);
        const activeSpirals = profile.profileLayers.spiralConstellation.activeSpirals.map(s => s.id);

        if (sessionSpirals.some(s => activeSpirals.includes(s))) {
          patterns.push({
            patternId: `cross_session_constellation_${memberId}_${Date.now()}`,
            name: 'Session-Constellation Alignment',
            description: 'Recent session themes align with active spiral constellation',
            involvedLayers: ['episodic', 'constellation'],
            significance: 0.75,
            evolutionaryDirection: 'Integration of conscious awareness with natural development',
            therapeuticOpportunity: 'Member ready for explicit constellation guidance',
            detectedAt: new Date().toISOString()
          });
        }
      }

      // Profile-Collective patterns
      if (profile.profileLayers.collectiveResonance) {
        const profileThemes = profile.profileLayers.coreProfile.lifeThemes;
        const collectiveContributions = profile.profileLayers.collectiveResonance.fieldContributions;

        const themeContributionOverlap = this.calculateThemeOverlap(profileThemes, collectiveContributions);

        if (themeContributionOverlap > 0.6) {
          patterns.push({
            patternId: `cross_profile_collective_${memberId}_${Date.now()}`,
            name: 'Profile-Field Resonance',
            description: 'Core personal themes strongly resonating in collective field',
            involvedLayers: ['profile', 'collective'],
            significance: themeContributionOverlap,
            evolutionaryDirection: 'Personal development serving collective wisdom',
            therapeuticOpportunity: 'Ready to step into teaching or mentoring role',
            detectedAt: new Date().toISOString()
          });
        }
      }

      // Trajectory-Wisdom patterns
      if (profile.profileLayers.personalTrajectory && profile.profileLayers.canonicalWisdom) {
        const trajectoryPhase = profile.profileLayers.personalTrajectory.currentPhase;
        const wisdomAccess = profile.profileLayers.canonicalWisdom.accessedTeachings;

        const phaseWisdomAlignment = this.calculatePhaseWisdomAlignment(trajectoryPhase, wisdomAccess);

        if (phaseWisdomAlignment > 0.7) {
          patterns.push({
            patternId: `cross_trajectory_wisdom_${memberId}_${Date.now()}`,
            name: 'Trajectory-Wisdom Synchronicity',
            description: 'Current development phase perfectly aligned with accessed wisdom teachings',
            involvedLayers: ['trajectory', 'canonical'],
            significance: phaseWisdomAlignment,
            evolutionaryDirection: 'Embodied wisdom integration at perfect timing',
            therapeuticOpportunity: 'Ready for advanced teachings in current element/phase',
            detectedAt: new Date().toISOString()
          });
        }
      }

      return patterns;

    } catch (error) {
      console.error(`Error detecting cross-layer patterns for ${memberId}:`, error);
      return [];
    }
  }

  // ==============================================================================
  // PRIVATE HELPER METHODS
  // ==============================================================================

  private async loadBaseProfile(memberId: string): Promise<any> {
    // This would load from actual storage service
    // For now, return mock structure
    return {
      membershipLevel: 'premium' as const,
      lastActiveAt: new Date().toISOString(),
      joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      consciousnessReadiness: {
        spiralAwareness: 'emerging' as const,
        constellationExposure: 'standard' as const,
        fieldParticipation: 'participant' as const,
        wisdomDepth: 'therapeutic' as const
      },
      dataConsent: {
        profileStorage: true,
        spiralTracking: true,
        collectiveParticipation: true,
        wisdomContribution: true,
        facilitatorVisibility: false,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  private async getRecentSessions(memberId: string): Promise<SessionSummary[]> {
    // Mock session data - would integrate with SessionManager
    return [
      {
        sessionId: `session_${memberId}_1`,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 25 * 60 * 1000, // 25 minutes
        interactionCount: 12,
        primaryTopics: ['relationship challenges', 'boundary setting', 'emotional integration'],
        spiralActivation: 'relationship_001',
        emotionalTone: 'exploratory'
      },
      {
        sessionId: `session_${memberId}_2`,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 18 * 60 * 1000, // 18 minutes
        interactionCount: 8,
        primaryTopics: ['career direction', 'creative expression', 'life purpose'],
        spiralActivation: 'vocation_001',
        emotionalTone: 'integrative'
      }
    ];
  }

  private async getSignificantEpisodes(memberId: string): Promise<EpisodeSummary[]> {
    // Mock episode data - would integrate with EpisodeManager
    return [
      {
        episodeId: `episode_${memberId}_relationship_001`,
        title: 'Boundary setting breakthrough with partner',
        lifeDomain: 'relationship',
        significance: 0.85,
        relatedSpiral: 'relationship_001',
        insights: [
          'Clear boundaries actually increase intimacy',
          'Fear of conflict was preventing authentic connection',
          'Self-care enables better care for others'
        ],
        elementalSignature: { fire: 0.7, water: 0.8, earth: 0.6, air: 0.5 },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private async getCoreProfile(memberId: string): Promise<MemberCoreProfile> {
    // Mock core profile - would integrate with ProfileService
    return {
      identityFacets: ['Sensitive leader', 'Creative problem-solver', 'Deep feeler'],
      coreValues: ['Authenticity', 'Growth', 'Connection', 'Beauty'],
      lifeThemes: ['Balancing strength and vulnerability', 'Creative expression', 'Meaningful relationships'],
      challengePatterns: ['Perfectionism', 'People-pleasing', 'Fear of conflict'],
      growthEdges: ['Healthy boundaries', 'Self-compassion', 'Trusting intuition'],

      relationshipStyle: 'Empathic connector with boundary challenges',
      communicationPreferences: ['Deep conversations', 'Creative expression', 'Non-violent communication'],
      boundaryPatterns: ['Porous boundaries', 'Over-giving', 'Difficulty saying no'],
      intimacyCapacity: 'High capacity with trust issues',

      lifeSeason: 'establishment',
      primaryDomains: ['relationship', 'creativity', 'vocation'],
      supportSystems: ['Close friends', 'Therapy', 'Creative community'],
      resourceAccess: ['Moderate financial', 'Strong social', 'Rich creative'],

      explorationStyle: 'gentle',
      integrationPace: 'steady',
      wisdomOrientation: 'psychological',

      lastUpdated: new Date().toISOString()
    };
  }

  private async getPersonalTrajectory(memberId: string): Promise<PersonalTrajectory | null> {
    // Mock trajectory - would integrate with TrajectoryService
    return {
      trajectoryId: `traj_${memberId}_relationship`,
      startedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Relationship Mastery Journey',
      description: 'Learning to balance vulnerability and boundaries in intimate relationships',
      lifeDomain: 'relationship',

      currentPhase: {
        phaseId: 'water_deepening',
        name: 'Water Deepening',
        element: 'water',
        refinement: 'deepening',
        status: 'active',
        startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        keyInsights: ['Emotional fluidity creates safety', 'Vulnerability is strength'],
        challenges: ['Fear of overwhelming partner', 'Trusting emotional timing'],
        breakthroughs: ['Boundary setting conversation success']
      },

      completedPhases: [
        {
          phaseId: 'water_emergence',
          name: 'Water Emergence',
          element: 'water',
          refinement: 'emergence',
          status: 'complete',
          startedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          keyInsights: ['Emotions are information', 'Feeling is not weakness'],
          challenges: ['Emotional flooding', 'Fear of feeling too much'],
          breakthroughs: ['Learning to surf emotional waves']
        }
      ],

      upcomingMilestones: [
        {
          milestoneId: 'water_mastery_prep',
          title: 'Water Mastery Preparation',
          description: 'Integration of emotional wisdom with clear boundaries',
          targetPhase: 'water_mastery',
          significance: 'major',
          readinessIndicators: [
            'Consistent boundary setting',
            'Emotional regulation under stress',
            'Partner feedback integration'
          ],
          supportResources: [
            'Relationship coaching',
            'Couples communication workshop',
            'Somatic therapy'
          ]
        }
      ],

      elementalProgression: { fire: 0.4, water: 0.7, earth: 0.5, air: 0.3 },
      consciousnessExpansion: 0.65,
      integrationDepth: 0.7,
      embodimentLevel: 0.6,

      guidanceStyle: 'gentle',
      readyForAdvancement: false,
      nextDevelopmentEdge: 'Trust emotional timing in conflict',
      supportNeeded: ['Conflict resolution skills', 'Somatic awareness practices'],

      lastUpdated: new Date().toISOString()
    };
  }

  private async generateProfileInsights(
    memberId: string,
    layers: any
  ): Promise<CoreMemberProfile['profileInsights']> {
    // Calculate dominant elements across all layers
    const dominantElements = this.calculateDominantElements(layers);

    // Determine development phase
    const developmentPhase = this.determineDevelopmentPhase(layers);

    // Detect cross-layer patterns
    const crossLayerPatterns = await this.detectCrossLayerPatterns(memberId);

    // Generate consciousness signature
    const consciousnessSignature = this.generateConsciousnessSignature(layers);

    // Determine evolutionary direction
    const evolutionaryDirection = this.determineEvolutionaryDirection(layers);

    return {
      dominantElements,
      developmentPhase,
      crossLayerPatterns,
      consciousnessSignature,
      evolutionaryDirection
    };
  }

  private calculateDominantElements(layers: any): { fire: number; water: number; earth: number; air: number } {
    // Aggregate elemental signatures across all layers
    const elements = { fire: 0, water: 0, earth: 0, air: 0 };
    let count = 0;

    // From episodes
    if (layers.episodes) {
      layers.episodes.forEach((episode: EpisodeSummary) => {
        Object.keys(elements).forEach(element => {
          elements[element as keyof typeof elements] += episode.elementalSignature[element as keyof typeof episode.elementalSignature];
        });
        count++;
      });
    }

    // From trajectory
    if (layers.trajectory) {
      Object.keys(elements).forEach(element => {
        elements[element as keyof typeof elements] += layers.trajectory.elementalProgression[element as keyof typeof layers.trajectory.elementalProgression];
      });
      count++;
    }

    // From constellation
    if (layers.constellation?.elementalBalance) {
      Object.keys(elements).forEach(element => {
        elements[element as keyof typeof elements] += layers.constellation.elementalBalance[element as keyof typeof layers.constellation.elementalBalance];
      });
      count++;
    }

    // Normalize
    if (count > 0) {
      Object.keys(elements).forEach(element => {
        elements[element as keyof typeof elements] /= count;
      });
    }

    return elements;
  }

  private determineDevelopmentPhase(layers: any): 'discovery' | 'exploration' | 'integration' | 'mastery' {
    // Logic to determine overall development phase based on all layers
    if (layers.trajectory?.currentPhase?.refinement === 'mastery') return 'mastery';
    if (layers.constellation?.constellationHealth === 'integrated') return 'integration';
    if (layers.sessions?.some((s: SessionSummary) => s.emotionalTone === 'exploratory')) return 'exploration';
    return 'discovery';
  }

  private generateConsciousnessSignature(layers: any): string {
    const elements = this.calculateDominantElements(layers);
    const dominantElement = Object.entries(elements)
      .sort(([,a], [,b]) => b - a)[0][0];

    const phase = this.determineDevelopmentPhase(layers);
    const spiralCount = layers.constellation?.activeSpirals?.length || 0;

    return `${dominantElement}-${phase}-${spiralCount}spiral`;
  }

  private determineEvolutionaryDirection(layers: any): string {
    // Analyze trajectory and constellation to determine growth direction
    if (layers.trajectory?.nextDevelopmentEdge) {
      return layers.trajectory.nextDevelopmentEdge;
    }

    if (layers.constellation?.constellationTheme?.guidanceDirection) {
      return layers.constellation.constellationTheme.guidanceDirection;
    }

    return 'Deepening self-awareness and authentic expression';
  }

  private extractSpiralActivationFromSessions(sessions: SessionSummary[]): string[] {
    return sessions
      .map(session => session.spiralActivation)
      .filter(Boolean) as string[];
  }

  private calculateThemeOverlap(themes: string[], contributions: FieldContribution[]): number {
    // Calculate overlap between personal themes and field contributions
    const contributionTopics = contributions.map(c => c.content.toLowerCase());
    const themeMatches = themes.filter(theme =>
      contributionTopics.some(topic =>
        topic.includes(theme.toLowerCase()) || theme.toLowerCase().includes(topic)
      )
    );

    return themes.length > 0 ? themeMatches.length / themes.length : 0;
  }

  private calculatePhaseWisdomAlignment(phase: TrajectoryPhase, teachings: AccessedTeaching[]): number {
    // Calculate alignment between current phase and accessed wisdom
    const phaseElement = phase.element;
    const phaseRefinement = phase.refinement;

    const alignedTeachings = teachings.filter(teaching => {
      const isElementAligned = teaching.title.toLowerCase().includes(phaseElement) ||
                              teaching.title.toLowerCase().includes(phaseRefinement);
      const isHighRelevance = teaching.personalRelevance > 0.7;
      const isRecentAccess = new Date(teaching.lastAccessed) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      return isElementAligned && isHighRelevance && isRecentAccess;
    });

    return teachings.length > 0 ? alignedTeachings.length / teachings.length : 0;
  }
}

export default CoreMemberProfileService;