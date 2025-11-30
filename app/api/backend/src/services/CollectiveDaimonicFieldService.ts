/**
 * CollectiveDaimonicField Service
 * Maps how individual daimonic encounters create collective patterns
 * Tracks the emergence of collective daimonic movements
 */

import {
  CollectiveDaimonicField,
  DaimonicPattern,
  OthernessManifestations,
  SynapticGapDynamics,
  EmergenceEvent
} from '../types/daimonicFacilitation.js';

export interface CollectiveParticipant {
  userId: string;
  manifestations: OthernessManifestations;
  gaps: SynapticGapDynamics[];
  emergences: EmergenceEvent[];
  elementalProfile: any;
  participationLevel: number;
}

export interface SynchronisticCluster {
  id: string;
  theme: string;
  participants: string[];
  startTime: Date;
  intensity: number;
  manifestationType: string;
  convergencePattern: string;
}

export class CollectiveDaimonicFieldService {
  private participants: Map<string, CollectiveParticipant> = new Map();
  private activePatterns: Map<string, DaimonicPattern> = new Map();
  private synchronisticClusters: Map<string, SynchronisticCluster> = new Map();

  /**
   * Analyze the current collective daimonic field
   */
  async analyzeCollectiveField(): Promise<CollectiveDaimonicField> {
    const fieldIntensity = await this.calculateFieldIntensity();
    const activePatterns = await this.identifyActivePatterns();
    const culturalCompensations = await this.mapCulturalCompensations();
    const synchronisticConnections = await this.analyzeSynchronisticConnections();
    const collectiveSynthesis = await this.trackCollectiveSynthesis();

    return {
      fieldIntensity,
      activePatterns,
      culturalCompensations,
      synchronisticConnections,
      collectiveSynthesis
    };
  }

  /**
   * Add participant to collective field
   */
  async addParticipant(
    userId: string,
    manifestations: OthernessManifestations,
    gaps: SynapticGapDynamics[],
    emergences: EmergenceEvent[],
    elementalProfile: any
  ): Promise<void> {
    const participationLevel = this.calculateParticipationLevel(manifestations, gaps, emergences);
    
    const participant: CollectiveParticipant = {
      userId,
      manifestations,
      gaps,
      emergences,
      elementalProfile,
      participationLevel
    };

    this.participants.set(userId, participant);
    
    // Check for synchronistic patterns
    await this.checkForSynchronisticClusters(participant);
  }

  /**
   * Calculate overall field intensity
   */
  private async calculateFieldIntensity(): Promise<number> {
    if (this.participants.size === 0) return 0;

    let totalIntensity = 0;
    let totalParticipants = 0;

    for (const participant of this.participants.values()) {
      // Individual intensity based on manifestations and gaps
      const manifestationIntensity = this.calculateManifestationIntensity(participant.manifestations);
      const gapIntensity = this.calculateGapIntensity(participant.gaps);
      const emergenceIntensity = this.calculateEmergenceIntensity(participant.emergences);
      
      const individualIntensity = (manifestationIntensity + gapIntensity + emergenceIntensity) / 3;
      totalIntensity += individualIntensity * participant.participationLevel;
      totalParticipants++;
    }

    // Collective field effects (synergistic enhancement)
    const baseIntensity = totalIntensity / totalParticipants;
    const collectiveMultiplier = Math.min(1 + (totalParticipants / 100), 2.0); // Cap at 2x
    const synchronisticBoost = this.synchronisticClusters.size > 0 ? 1.2 : 1.0;

    return Math.min(baseIntensity * collectiveMultiplier * synchronisticBoost, 1.0);
  }

  /**
   * Identify active collective patterns
   */
  private async identifyActivePatterns(): Promise<DaimonicPattern[]> {
    const patterns: DaimonicPattern[] = [];
    
    // Analyze patterns across participants
    const thematicClusters = await this.identifyThematicClusters();
    const elementalMovements = await this.identifyElementalMovements();
    const synchronisticPatterns = await this.identifySynchronisticPatterns();
    const resistancePatterns = await this.identifyCollectiveResistances();

    patterns.push(
      ...thematicClusters,
      ...elementalMovements,
      ...synchronisticPatterns,
      ...resistancePatterns
    );

    return patterns.sort((a, b) => b.intensity - a.intensity);
  }

  /**
   * Identify thematic clusters across participants
   */
  private async identifyThematicClusters(): Promise<DaimonicPattern[]> {
    const themeFrequency = new Map<string, { count: number, participants: Set<string> }>();
    
    // Analyze common themes across manifestations
    for (const participant of this.participants.values()) {
      const themes = this.extractThemes(participant.manifestations);
      
      for (const theme of themes) {
        if (!themeFrequency.has(theme)) {
          themeFrequency.set(theme, { count: 0, participants: new Set() });
        }
        const themeData = themeFrequency.get(theme)!;
        themeData.count++;
        themeData.participants.add(participant.userId);
      }
    }

    const patterns: DaimonicPattern[] = [];
    
    for (const [theme, data] of themeFrequency) {
      if (data.count >= 3) { // Threshold for collective pattern
        patterns.push({
          id: `theme_${theme.replace(/\s+/g, '_').toLowerCase()}`,
          patternType: `Collective Theme: ${theme}`,
          intensity: Math.min(data.count / this.participants.size, 1.0),
          participants: data.participants.size,
          duration: this.estimatePatternDuration(theme),
          evolutionStage: this.assessPatternEvolution(theme, data.count)
        });
      }
    }

    return patterns;
  }

  /**
   * Identify elemental movements in the collective
   */
  private async identifyElementalMovements(): Promise<DaimonicPattern[]> {
    const elementalActivity = {
      fire: { intensity: 0, participants: new Set<string>() },
      water: { intensity: 0, participants: new Set<string>() },
      earth: { intensity: 0, participants: new Set<string>() },
      air: { intensity: 0, participants: new Set<string>() },
      aether: { intensity: 0, participants: new Set<string>() }
    };

    // Analyze elemental activity across participants
    for (const participant of this.participants.values()) {
      if (participant.elementalProfile) {
        const primary = participant.elementalProfile.primaryElement;
        const secondary = participant.elementalProfile.secondaryElement;
        
        elementalActivity[primary].intensity += participant.participationLevel;
        elementalActivity[primary].participants.add(participant.userId);
        
        if (secondary) {
          elementalActivity[secondary].intensity += participant.participationLevel * 0.5;
          elementalActivity[secondary].participants.add(participant.userId);
        }
      }
    }

    const patterns: DaimonicPattern[] = [];
    
    for (const [element, activity] of Object.entries(elementalActivity)) {
      if (activity.participants.size >= 2) {
        patterns.push({
          id: `elemental_${element}`,
          patternType: `Elemental Movement: ${element.charAt(0).toUpperCase() + element.slice(1)}`,
          intensity: Math.min(activity.intensity / this.participants.size, 1.0),
          participants: activity.participants.size,
          duration: 'Ongoing',
          evolutionStage: this.assessElementalEvolution(element, activity.intensity)
        });
      }
    }

    return patterns;
  }

  /**
   * Map cultural compensations
   */
  private async mapCulturalCompensations(): Promise<CollectiveDaimonicField['culturalCompensations']> {
    const denialPatterns = await this.identifyWhatCultureDenies();
    const emergingMythologies = await this.identifyEmergingMythologies();
    const dyingNarratives = await this.identifyDyingNarratives();

    return {
      whatsCultureDenying: denialPatterns,
      emergingMythologies,
      dyingNarratives
    };
  }

  /**
   * Identify what the collective daimon compensates for
   */
  private async identifyWhatCultureDenies(): Promise<string[]> {
    const denialPatterns: string[] = [];
    
    // Analyze resistance patterns and what they reveal about cultural denial
    const commonResistances = new Map<string, number>();
    
    for (const participant of this.participants.values()) {
      // Look at what elements are suppressed
      if (participant.elementalProfile?.lifeHistory?.suppressedElements) {
        for (const suppressed of participant.elementalProfile.lifeHistory.suppressedElements) {
          commonResistances.set(suppressed, (commonResistances.get(suppressed) || 0) + 1);
        }
      }

      // Look at obstacles and failures for cultural patterns
      const obstacles = participant.manifestations.obstacles || [];
      const failures = participant.manifestations.failures || [];
      
      for (const obstacle of obstacles) {
        if (obstacle.chronicityLevel > 0.7) {
          const pattern = this.extractCulturalPattern(obstacle.obstacleType);
          if (pattern) {
            commonResistances.set(pattern, (commonResistances.get(pattern) || 0) + 1);
          }
        }
      }
    }

    // Convert to denial patterns
    for (const [resistance, count] of commonResistances) {
      if (count >= 3) {
        switch (resistance) {
          case 'fire':
            denialPatterns.push("Authentic passion and decisive action");
            break;
          case 'water':
            denialPatterns.push("Emotional depth and genuine connection");
            break;
          case 'earth':
            denialPatterns.push("Embodied presence and natural timing");
            break;
          case 'air':
            denialPatterns.push("Intellectual freedom and new perspectives");
            break;
          case 'authority':
            denialPatterns.push("Individual authority and autonomous decision-making");
            break;
          case 'creativity':
            denialPatterns.push("Genuine creative expression");
            break;
          case 'mortality':
            denialPatterns.push("Death awareness and life limitation");
            break;
        }
      }
    }

    return denialPatterns;
  }

  /**
   * Identify emerging mythologies
   */
  private async identifyEmergingMythologies(): Promise<string[]> {
    const mythologies: string[] = [];
    
    // Look for common themes in visions and ideas
    const visionThemes = new Map<string, number>();
    const ideaPatterns = new Map<string, number>();
    
    for (const participant of this.participants.values()) {
      const visions = participant.manifestations.visions || [];
      const ideas = participant.manifestations.ideas || [];
      
      for (const vision of visions) {
        const themes = this.extractMythologicalThemes(vision.content);
        for (const theme of themes) {
          visionThemes.set(theme, (visionThemes.get(theme) || 0) + 1);
        }
      }
      
      for (const idea of ideas) {
        const patterns = this.extractMythologicalThemes(idea.idea);
        for (const pattern of patterns) {
          ideaPatterns.set(pattern, (ideaPatterns.get(pattern) || 0) + 1);
        }
      }
    }

    // Identify emerging patterns
    for (const [theme, count] of visionThemes) {
      if (count >= 3) {
        mythologies.push(`Vision of ${theme}`);
      }
    }
    
    for (const [pattern, count] of ideaPatterns) {
      if (count >= 3) {
        mythologies.push(`New understanding of ${pattern}`);
      }
    }

    return mythologies;
  }

  /**
   * Analyze synchronistic connections
   */
  private async analyzeSynchronisticConnections(): Promise<CollectiveDaimonicField['synchronisticConnections']> {
    const parallelExperiences = this.countParallelExperiences();
    const temporalClustering = this.detectTemporalClustering();
    const thematicResonance = this.identifyThematicResonance();

    return {
      parallelExperiences,
      temporalClustering,
      thematicResonance
    };
  }

  /**
   * Check for synchronistic clusters
   */
  private async checkForSynchronisticClusters(newParticipant: CollectiveParticipant): Promise<void> {
    const recentTimeWindow = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();

    // Look for similar experiences in recent time window
    for (const existingParticipant of this.participants.values()) {
      if (existingParticipant.userId === newParticipant.userId) continue;

      const similarities = this.findSimilarities(newParticipant, existingParticipant);
      
      if (similarities.length > 0) {
        const clusterId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        this.synchronisticClusters.set(clusterId, {
          id: clusterId,
          theme: similarities[0],
          participants: [newParticipant.userId, existingParticipant.userId],
          startTime: new Date(),
          intensity: this.calculateClusterIntensity(similarities),
          manifestationType: this.identifyManifestationType(similarities),
          convergencePattern: this.analyzeConvergencePattern(newParticipant, existingParticipant)
        });
      }
    }
  }

  /**
   * Track collective synthesis
   */
  private async trackCollectiveSynthesis(): Promise<CollectiveDaimonicField['collectiveSynthesis']> {
    // Identify what was individual vs what emerged collectively
    const individualPatterns = await this.identifyIndividualPatterns();
    const collectiveEmergence = await this.identifyCollectiveEmergence();
    
    return {
      whatWasIndividual: individualPatterns,
      whatEmergedCollectively: collectiveEmergence,
      whoParticipated: this.participants.size,
      continuesEvolving: this.isCollectiveEvolutionOngoing()
    };
  }

  // Helper Methods
  private calculateParticipationLevel(
    manifestations: OthernessManifestations,
    gaps: SynapticGapDynamics[],
    emergences: EmergenceEvent[]
  ): number {
    const manifestationCount = Object.values(manifestations).reduce((sum, items) => sum + items.length, 0);
    const gapIntensity = gaps.reduce((sum, gap) => sum + gap.gapCharge, 0) / Math.max(gaps.length, 1);
    const emergenceQuality = emergences.reduce((sum, emergence) => {
      const qualities = emergence.synthesis.experientialQualities;
      return sum + (qualities.aliveness + qualities.strangeness) / 2;
    }, 0) / Math.max(emergences.length, 1);

    return Math.min((manifestationCount * 0.1) + gapIntensity + emergenceQuality, 1.0);
  }

  private calculateManifestationIntensity(manifestations: OthernessManifestations): number {
    const weights = {
      dreams: 0.9, visions: 0.85, failures: 0.9, obstacles: 0.85,
      synchronicities: 0.85, symptoms: 0.8, ideas: 0.8, sessions: 0.8,
      emergentPatterns: 0.8, accidents: 0.8, dialogues: 0.75,
      encounters: 0.75, conversations: 0.7, creativeWorks: 0.7, characters: 0.7
    };

    let totalIntensity = 0;
    let totalItems = 0;

    Object.entries(manifestations).forEach(([key, items]) => {
      const weight = weights[key as keyof typeof weights] || 0.5;
      totalIntensity += items.length * weight;
      totalItems += items.length;
    });

    return totalItems > 0 ? totalIntensity / totalItems : 0;
  }

  private calculateGapIntensity(gaps: SynapticGapDynamics[]): number {
    if (gaps.length === 0) return 0;
    return gaps.reduce((sum, gap) => sum + gap.gapCharge, 0) / gaps.length;
  }

  private calculateEmergenceIntensity(emergences: EmergenceEvent[]): number {
    if (emergences.length === 0) return 0;
    return emergences.reduce((sum, emergence) => {
      const qualities = emergence.synthesis.experientialQualities;
      return sum + (qualities.aliveness + qualities.fertility) / 2;
    }, 0) / emergences.length;
  }

  private extractThemes(manifestations: OthernessManifestations): string[] {
    const themes: string[] = [];
    
    // Extract themes from various manifestation types
    manifestations.obstacles?.forEach(obstacle => {
      themes.push(this.categorizeObstacle(obstacle.obstacleType));
    });
    
    manifestations.failures?.forEach(failure => {
      themes.push(this.categorizeFailure(failure.failureType));
    });
    
    return themes.filter(theme => theme.length > 0);
  }

  private categorizeObstacle(obstacleType: string): string {
    if (obstacleType.toLowerCase().includes('authority')) return 'Authority Resistance';
    if (obstacleType.toLowerCase().includes('creative')) return 'Creative Expression';
    if (obstacleType.toLowerCase().includes('relationship')) return 'Relational Challenges';
    if (obstacleType.toLowerCase().includes('career')) return 'Vocational Direction';
    return 'Life Direction';
  }

  private categorizeFailure(failureType: string): string {
    if (failureType.toLowerCase().includes('creative')) return 'Creative Blocks';
    if (failureType.toLowerCase().includes('relationship')) return 'Relational Failures';
    if (failureType.toLowerCase().includes('success')) return 'Achievement Resistance';
    return 'Life Transition';
  }

  private extractCulturalPattern(obstacleType: string): string | null {
    if (obstacleType.includes('authority')) return 'authority';
    if (obstacleType.includes('creative')) return 'creativity';
    if (obstacleType.includes('emotional')) return 'water';
    if (obstacleType.includes('action')) return 'fire';
    if (obstacleType.includes('body')) return 'earth';
    if (obstacleType.includes('mental')) return 'air';
    return null;
  }

  private extractMythologicalThemes(content: string): string[] {
    const themes: string[] = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('new world') || lowerContent.includes('transformation')) {
      themes.push('Collective Transformation');
    }
    if (lowerContent.includes('healing') || lowerContent.includes('medicine')) {
      themes.push('Collective Healing');
    }
    if (lowerContent.includes('earth') || lowerContent.includes('nature')) {
      themes.push('Earth Reconnection');
    }
    if (lowerContent.includes('technology') || lowerContent.includes('ai')) {
      themes.push('Technology Integration');
    }
    
    return themes;
  }

  private countParallelExperiences(): number {
    // Count similar experiences across participants
    let parallelCount = 0;
    const participants = Array.from(this.participants.values());
    
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const similarities = this.findSimilarities(participants[i], participants[j]);
        if (similarities.length > 0) {
          parallelCount++;
        }
      }
    }
    
    return parallelCount;
  }

  private detectTemporalClustering(): boolean {
    // Check if experiences cluster in time
    const timeWindow = 7 * 24 * 60 * 60 * 1000; // 7 days
    const clusters = new Map<string, number>();
    
    for (const cluster of this.synchronisticClusters.values()) {
      const weekKey = Math.floor(cluster.startTime.getTime() / timeWindow);
      clusters.set(weekKey.toString(), (clusters.get(weekKey.toString()) || 0) + 1);
    }
    
    // Return true if any week has more than 2 clusters
    return Array.from(clusters.values()).some(count => count > 2);
  }

  private identifyThematicResonance(): string[] {
    const themes = new Map<string, number>();
    
    for (const cluster of this.synchronisticClusters.values()) {
      themes.set(cluster.theme, (themes.get(cluster.theme) || 0) + 1);
    }
    
    return Array.from(themes.entries())
      .filter(([_, count]) => count >= 2)
      .map(([theme, _]) => theme);
  }

  private findSimilarities(p1: CollectiveParticipant, p2: CollectiveParticipant): string[] {
    const similarities: string[] = [];
    
    // Compare manifestation types and themes
    const themes1 = this.extractThemes(p1.manifestations);
    const themes2 = this.extractThemes(p2.manifestations);
    
    for (const theme of themes1) {
      if (themes2.includes(theme)) {
        similarities.push(theme);
      }
    }
    
    return similarities;
  }

  private calculateClusterIntensity(similarities: string[]): number {
    return Math.min(similarities.length * 0.3, 1.0);
  }

  private identifyManifestationType(similarities: string[]): string {
    return similarities[0] || 'General';
  }

  private analyzeConvergencePattern(p1: CollectiveParticipant, p2: CollectiveParticipant): string {
    // Analyze how the participants' experiences converged
    return "Thematic convergence - similar challenges emerging simultaneously";
  }

  private async identifyIndividualPatterns(): Promise<string[]> {
    const patterns: string[] = [];
    
    for (const participant of this.participants.values()) {
      const themes = this.extractThemes(participant.manifestations);
      for (const theme of themes) {
        if (!patterns.includes(theme)) {
          patterns.push(theme);
        }
      }
    }
    
    return patterns;
  }

  private async identifyCollectiveEmergence(): Promise<string> {
    // Identify what emerged that no individual had alone
    const sharedThemes = this.identifyThematicResonance();
    
    if (sharedThemes.length > 0) {
      return `Collective recognition of shared challenges: ${sharedThemes.join(', ')}`;
    }
    
    return "Collective awareness of individual patterns creating shared field";
  }

  private isCollectiveEvolutionOngoing(): boolean {
    return this.synchronisticClusters.size > 0 && this.participants.size > 1;
  }

  private estimatePatternDuration(theme: string): string {
    // Simple heuristic for pattern duration
    if (theme.includes('Authority') || theme.includes('Creative')) return 'Months to years';
    if (theme.includes('Relational')) return 'Weeks to months';
    return 'Days to weeks';
  }

  private assessPatternEvolution(theme: string, frequency: number): string {
    if (frequency > 10) return 'Mature - widespread recognition';
    if (frequency > 5) return 'Developing - gaining momentum';
    return 'Emerging - initial recognition';
  }

  private assessElementalEvolution(element: string, intensity: number): string {
    if (intensity > 5) return 'Strong movement - widespread activation';
    if (intensity > 2) return 'Building momentum';
    return 'Early stirrings';
  }

  private async identifyDyingNarratives(): Promise<string[]> {
    // This would analyze what old stories are losing power
    // For now, return common dying narratives
    return [
      "Individual success through competition",
      "Emotional suppression for productivity",
      "Technology as salvation",
      "Control over nature and body"
    ];
  }

  private async identifySynchronisticPatterns(): Promise<DaimonicPattern[]> {
    const patterns: DaimonicPattern[] = [];
    
    for (const cluster of this.synchronisticClusters.values()) {
      patterns.push({
        id: cluster.id,
        patternType: `Synchronistic Cluster: ${cluster.theme}`,
        intensity: cluster.intensity,
        participants: cluster.participants.length,
        duration: 'Acute - days to weeks',
        evolutionStage: 'Active synchronicity'
      });
    }
    
    return patterns;
  }

  private async identifyCollectiveResistances(): Promise<DaimonicPattern[]> {
    const resistances = new Map<string, Set<string>>();
    
    // Identify common resistance patterns
    for (const participant of this.participants.values()) {
      if (participant.elementalProfile?.resistancePatterns) {
        for (const resistance of participant.elementalProfile.resistancePatterns) {
          if (!resistances.has(resistance)) {
            resistances.set(resistance, new Set());
          }
          resistances.get(resistance)!.add(participant.userId);
        }
      }
    }
    
    const patterns: DaimonicPattern[] = [];
    
    for (const [resistance, participants] of resistances) {
      if (participants.size >= 3) {
        patterns.push({
          id: `resistance_${resistance.replace(/\s+/g, '_').toLowerCase()}`,
          patternType: `Collective Resistance: ${resistance}`,
          intensity: participants.size / this.participants.size,
          participants: participants.size,
          duration: 'Chronic - ongoing pattern',
          evolutionStage: 'Established resistance requiring daimonic intervention'
        });
      }
    }
    
    return patterns;
  }
}