/**
 * 🌌 SPIRAL CONSTELLATION SERVICE
 *
 * The meta-intelligence layer that orchestrates multiple life spirals
 * into a coherent understanding of a member's current soul architecture.
 *
 * This service provides:
 * - Cross-spiral pattern detection
 * - Primary/secondary spiral dynamics
 * - Constellation-wide guidance intelligence
 * - Community field integration
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Core types for constellation architecture
export type LifeDomain =
  | 'relationship' | 'vocation' | 'health' | 'creativity'
  | 'spirituality' | 'family' | 'community' | 'money';

export type SpiralStatus = 'dormant' | 'active' | 'integration' | 'completed';

export type SpiralPhase =
  | 'initiation' | 'descent' | 'turning' | 'emergence' | 'integration'
  | 'fire-emergence' | 'fire-deepening' | 'fire-mastery'
  | 'water-emergence' | 'water-deepening' | 'water-mastery'
  | 'earth-emergence' | 'earth-deepening' | 'earth-mastery'
  | 'air-emergence' | 'air-deepening' | 'air-mastery';

export interface SpiralSummary {
  id: string;
  lifeDomain: LifeDomain;
  title: string;
  status: SpiralStatus;
  currentPhase: SpiralPhase;
  intensity: number;             // 0–1 how activated this spiral is
  priority: number;              // 1–5 how central to member's current work
  facetFocus: string[];          // primary consciousness facets active
  primaryArchetypes: string[];   // archetypal energies most present
  daysActive: number;
  lastActivity: string;
  coreChallenge: string;
  emergingWisdom: string;

  // Elemental signature of this spiral
  elementalSignature: {
    fire: number;    // 0-100
    water: number;
    earth: number;
    air: number;
  };
}

export interface CrossSpiralPattern {
  id: string;
  description: string;           // "Authority avoidance in Fire-2 across work and relationships"
  involvedSpirals: string[];     // spiral IDs showing this pattern
  facets: string[];              // consciousness facets involved
  archetypes: string[];          // archetypal themes
  significance: number;          // 0–1 how important this pattern is
  frequency: number;             // how often it shows up
  lastObserved: string;
  therapeuticOpportunity: string; // what this pattern offers for growth
}

export interface ConstellationTheme {
  id: string;
  name: string;                  // "Reorienting authority and belonging"
  description: string;           // fuller description
  involvedDomains: LifeDomain[];
  dominantElements: string[];    // ['Fire-2', 'Water-1']
  collectiveResonance: number;   // 0-1 how much this echoes in field
  guidanceDirection: string;     // therapeutic direction
}

export interface MemberSpiralConstellation {
  memberId: string;

  // The active map of their life work
  activeSpirals: SpiralSummary[];
  dormantSpirals: SpiralSummary[];
  integrationSpirals: SpiralSummary[];
  completedSpirals: SpiralSummary[];

  // The main "classrooms" right now
  primarySpiralId: string | null;      // highest intensity * priority
  secondarySpiralIds: string[];        // supporting spirals

  // Cross-spiral intelligence
  crossPatterns: CrossSpiralPattern[]; // repeating motifs across life areas

  // High-level constellation read
  constellationTheme: ConstellationTheme;
  dominantElementalTheme: string[];    // ['Fire-2', 'Water-2'] most active phases
  currentLifeEmphasis: string;         // "Reorientation of vocation and belonging"

  // Harmonic development across constellation
  overallHarmonicCoherence: number;    // 0-100 integration across all spirals
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
  };

  // Meta-intelligence
  constellationHealth: 'scattered' | 'focused' | 'integrated' | 'transcendent';
  readyForNewSpiral: boolean;          // can handle activating new domain
  needsIntegration: boolean;           // spirals need consolidation

  generatedAt: string;
}

export interface SpiralConstellationService {
  getConstellationForMember(memberId: string): Promise<MemberSpiralConstellation>;
  detectCrossSpiralPatterns(spirals: SpiralSummary[]): Promise<CrossSpiralPattern[]>;
  generateConstellationTheme(spirals: SpiralSummary[]): Promise<ConstellationTheme>;
  updateConstellationFromEpisode(memberId: string, spiralId: string, episodeData: any): Promise<void>;
  getConstellationGuidance(constellation: MemberSpiralConstellation, context: string): Promise<ConstellationGuidance>;
}

export interface ConstellationGuidance {
  primaryFocus: string;              // what to focus on first
  crossSpiralReflection?: string;    // insights about patterns across spirals
  harmonyGuidance?: string;          // suggestions for elemental balance
  nextDevelopment?: string;          // what wants to emerge next
  supportingSpiralAdvice?: string;   // how other spirals can support primary
}

class SpiralConstellationServiceImpl implements SpiralConstellationService {

  async getConstellationForMember(memberId: string): Promise<MemberSpiralConstellation> {
    // Get all spirals for this member
    const spiralRecords = await prisma.spiralProcess.findMany({
      where: { userId: memberId },
      include: {
        episodes: {
          orderBy: { timestamp: 'desc' },
          take: 5
        }
      }
    });

    // Convert to summaries
    const spiralSummaries = await Promise.all(
      spiralRecords.map(record => this.convertToSpiralSummary(record))
    );

    // Organize by status
    const active = spiralSummaries.filter(s => s.status === 'active');
    const dormant = spiralSummaries.filter(s => s.status === 'dormant');
    const integration = spiralSummaries.filter(s => s.status === 'integration');
    const completed = spiralSummaries.filter(s => s.status === 'completed');

    // Determine primary and secondary spirals
    const primary = this.identifyPrimarySpiral(active);
    const secondary = this.identifySecondarySpirals(active, primary);

    // Detect cross-spiral patterns
    const crossPatterns = await this.detectCrossSpiralPatterns(active);

    // Generate constellation theme
    const constellationTheme = await this.generateConstellationTheme(active);

    // Calculate harmonic metrics
    const elementalBalance = this.calculateElementalBalance(active);
    const overallHarmonicCoherence = this.calculateOverallHarmony(active);
    const dominantElementalTheme = this.deriveDominantElements(active);

    // Meta-intelligence assessments
    const constellationHealth = this.assessConstellationHealth(active, crossPatterns);
    const readyForNewSpiral = this.assessReadinessForNewSpiral(active, overallHarmonicCoherence);
    const needsIntegration = this.assessIntegrationNeed(active, crossPatterns);

    return {
      memberId,
      activeSpirals: active,
      dormantSpirals: dormant,
      integrationSpirals: integration,
      completedSpirals: completed,
      primarySpiralId: primary?.id || null,
      secondarySpiralIds: secondary.map(s => s.id),
      crossPatterns,
      constellationTheme,
      dominantElementalTheme,
      currentLifeEmphasis: constellationTheme.name,
      overallHarmonicCoherence,
      elementalBalance,
      constellationHealth,
      readyForNewSpiral,
      needsIntegration,
      generatedAt: new Date().toISOString()
    };
  }

  async detectCrossSpiralPatterns(spirals: SpiralSummary[]): Promise<CrossSpiralPattern[]> {
    const patterns: CrossSpiralPattern[] = [];

    if (spirals.length < 2) return patterns;

    // Pattern 1: Shared facets across multiple spirals
    const facetGroups = this.groupSpiralsBySharedFacets(spirals);
    for (const [facets, groupedSpirals] of facetGroups) {
      if (groupedSpirals.length > 1 && facets.length > 0) {
        patterns.push({
          id: `facet_pattern_${facets.join('_')}`,
          description: `${facets.join(' + ')} pattern showing up across ${groupedSpirals.map(s => s.lifeDomain).join(' and ')}`,
          involvedSpirals: groupedSpirals.map(s => s.id),
          facets: facets,
          archetypes: this.extractSharedArchetypes(groupedSpirals),
          significance: this.calculatePatternSignificance(groupedSpirals),
          frequency: groupedSpirals.length,
          lastObserved: new Date().toISOString(),
          therapeuticOpportunity: this.generateTherapeuticOpportunity(facets, groupedSpirals)
        });
      }
    }

    // Pattern 2: Similar phases across domains
    const phaseGroups = this.groupSpiralsByPhase(spirals);
    for (const [phase, groupedSpirals] of phaseGroups) {
      if (groupedSpirals.length > 1) {
        patterns.push({
          id: `phase_pattern_${phase}`,
          description: `Multiple spirals in ${phase} phase - systemic ${this.getPhaseTheme(phase)}`,
          involvedSpirals: groupedSpirals.map(s => s.id),
          facets: this.extractCommonFacets(groupedSpirals),
          archetypes: this.extractSharedArchetypes(groupedSpirals),
          significance: 0.8, // Phase alignments are highly significant
          frequency: groupedSpirals.length,
          lastObserved: new Date().toISOString(),
          therapeuticOpportunity: `This alignment suggests a deep ${this.getPhaseTheme(phase)} process affecting multiple life areas simultaneously`
        });
      }
    }

    // Pattern 3: Elemental imbalances
    const elementalPattern = this.detectElementalImbalancePattern(spirals);
    if (elementalPattern) {
      patterns.push(elementalPattern);
    }

    return patterns.sort((a, b) => b.significance - a.significance);
  }

  async generateConstellationTheme(spirals: SpiralSummary[]): Promise<ConstellationTheme> {
    if (spirals.length === 0) {
      return {
        id: 'dormant',
        name: 'Preparation and gathering',
        description: 'A time of inner preparation before new spirals activate',
        involvedDomains: [],
        dominantElements: [],
        collectiveResonance: 0.5,
        guidanceDirection: 'Listen inward for emerging callings'
      };
    }

    // Analyze dominant themes
    const dominantElements = this.deriveDominantElements(spirals);
    const involvedDomains = spirals.map(s => s.lifeDomain);
    const themeName = this.synthesizeThemeName(spirals, dominantElements);
    const description = this.synthesizeThemeDescription(spirals, dominantElements);
    const guidanceDirection = this.synthesizeGuidanceDirection(spirals, dominantElements);

    // Calculate collective resonance (would query community field data in full implementation)
    const collectiveResonance = await this.calculateCollectiveResonance(dominantElements, involvedDomains);

    return {
      id: `theme_${Date.now()}`,
      name: themeName,
      description: description,
      involvedDomains,
      dominantElements,
      collectiveResonance,
      guidanceDirection
    };
  }

  async updateConstellationFromEpisode(memberId: string, spiralId: string, episodeData: any): Promise<void> {
    // Update spiral state based on new episode
    await prisma.spiralProcess.update({
      where: { id: spiralId },
      data: {
        lastActivity: new Date().toISOString(),
        // Update other fields based on episode insights
      }
    });

    // Trigger constellation recalculation if needed
    // This could be optimized to only recalculate when significant changes occur
  }

  async getConstellationGuidance(
    constellation: MemberSpiralConstellation,
    context: string
  ): Promise<ConstellationGuidance> {
    const guidance: ConstellationGuidance = {
      primaryFocus: this.generatePrimaryFocus(constellation),
    };

    // Add cross-spiral reflection if patterns exist
    if (constellation.crossPatterns.length > 0) {
      const strongestPattern = constellation.crossPatterns[0];
      guidance.crossSpiralReflection = this.generateCrossSpiralReflection(strongestPattern, constellation);
    }

    // Add harmony guidance if needed
    if (constellation.overallHarmonicCoherence < 60) {
      guidance.harmonyGuidance = this.generateHarmonyGuidance(constellation.elementalBalance);
    }

    // Suggest next development
    if (constellation.readyForNewSpiral) {
      guidance.nextDevelopment = this.suggestNextDevelopment(constellation);
    }

    // Supporting spiral advice
    if (constellation.secondarySpiralIds.length > 0) {
      guidance.supportingSpiralAdvice = this.generateSupportingAdvice(constellation);
    }

    return guidance;
  }

  // Private helper methods
  private async convertToSpiralSummary(record: any): Promise<SpiralSummary> {
    // Convert database record to SpiralSummary
    // This would include calculating intensity, priority, etc. from episode data
    return {
      id: record.id,
      lifeDomain: record.domain as LifeDomain,
      title: record.title || `${record.domain} journey`,
      status: record.status as SpiralStatus,
      currentPhase: record.currentPhase as SpiralPhase,
      intensity: this.calculateIntensity(record),
      priority: this.calculatePriority(record),
      facetFocus: this.extractFacets(record),
      primaryArchetypes: this.extractArchetypes(record),
      daysActive: this.calculateDaysActive(record),
      lastActivity: record.lastActivity || record.updatedAt,
      coreChallenge: record.coreChallenge || 'Discovering the way forward',
      emergingWisdom: record.emergingWisdom || 'Wisdom is emerging through experience',
      elementalSignature: this.calculateElementalSignature(record)
    };
  }

  private identifyPrimarySpiral(spirals: SpiralSummary[]): SpiralSummary | null {
    if (spirals.length === 0) return null;

    // Primary spiral = highest (intensity * priority)
    return spirals.reduce((primary, current) => {
      const primaryScore = primary.intensity * primary.priority;
      const currentScore = current.intensity * current.priority;
      return currentScore > primaryScore ? current : primary;
    });
  }

  private identifySecondarySpirals(spirals: SpiralSummary[], primary: SpiralSummary | null): SpiralSummary[] {
    if (!primary) return spirals.slice(0, 2);

    return spirals
      .filter(s => s.id !== primary.id)
      .sort((a, b) => (b.intensity * b.priority) - (a.intensity * a.priority))
      .slice(0, 2);
  }

  private groupSpiralsBySharedFacets(spirals: SpiralSummary[]): Map<string[], SpiralSummary[]> {
    const groups = new Map<string[], SpiralSummary[]>();

    for (let i = 0; i < spirals.length; i++) {
      for (let j = i + 1; j < spirals.length; j++) {
        const sharedFacets = spirals[i].facetFocus.filter(f =>
          spirals[j].facetFocus.includes(f)
        );

        if (sharedFacets.length > 0) {
          const key = sharedFacets.sort();
          if (!groups.has(key)) {
            groups.set(key, []);
          }
          const existing = groups.get(key)!;
          if (!existing.includes(spirals[i])) existing.push(spirals[i]);
          if (!existing.includes(spirals[j])) existing.push(spirals[j]);
        }
      }
    }

    return groups;
  }

  private groupSpiralsByPhase(spirals: SpiralSummary[]): Map<SpiralPhase, SpiralSummary[]> {
    const groups = new Map<SpiralPhase, SpiralSummary[]>();

    for (const spiral of spirals) {
      if (!groups.has(spiral.currentPhase)) {
        groups.set(spiral.currentPhase, []);
      }
      groups.get(spiral.currentPhase)!.push(spiral);
    }

    return groups;
  }

  private detectElementalImbalancePattern(spirals: SpiralSummary[]): CrossSpiralPattern | null {
    const totalElements = this.calculateElementalBalance(spirals);
    const maxElement = Math.max(totalElements.fire, totalElements.water, totalElements.earth, totalElements.air);
    const minElement = Math.min(totalElements.fire, totalElements.water, totalElements.earth, totalElements.air);

    if (maxElement - minElement > 40) { // Significant imbalance
      const overdeveloped = Object.entries(totalElements).find(([_, value]) => value === maxElement)?.[0];
      const underdeveloped = Object.entries(totalElements).find(([_, value]) => value === minElement)?.[0];

      return {
        id: 'elemental_imbalance',
        description: `Elemental imbalance: ${overdeveloped} overdeveloped, ${underdeveloped} underdeveloped across constellation`,
        involvedSpirals: spirals.map(s => s.id),
        facets: [`${overdeveloped}-dominance`, `${underdeveloped}-deficit`],
        archetypes: ['Elemental Imbalance'],
        significance: 0.9,
        frequency: spirals.length,
        lastObserved: new Date().toISOString(),
        therapeuticOpportunity: `Integrating ${underdeveloped} element would bring greater harmony to all life areas`
      };
    }

    return null;
  }

  private calculateElementalBalance(spirals: SpiralSummary[]): { fire: number; water: number; earth: number; air: number } {
    if (spirals.length === 0) return { fire: 0, water: 0, earth: 0, air: 0 };

    const totals = spirals.reduce((acc, spiral) => ({
      fire: acc.fire + spiral.elementalSignature.fire,
      water: acc.water + spiral.elementalSignature.water,
      earth: acc.earth + spiral.elementalSignature.earth,
      air: acc.air + spiral.elementalSignature.air
    }), { fire: 0, water: 0, earth: 0, air: 0 });

    return {
      fire: Math.round(totals.fire / spirals.length),
      water: Math.round(totals.water / spirals.length),
      earth: Math.round(totals.earth / spirals.length),
      air: Math.round(totals.air / spirals.length)
    };
  }

  private calculateOverallHarmony(spirals: SpiralSummary[]): number {
    if (spirals.length === 0) return 0;

    const elementalBalance = this.calculateElementalBalance(spirals);
    const average = (elementalBalance.fire + elementalBalance.water + elementalBalance.earth + elementalBalance.air) / 4;

    const variance = Object.values(elementalBalance).reduce((acc, value) =>
      acc + Math.pow(value - average, 2), 0
    ) / 4;

    const standardDeviation = Math.sqrt(variance);
    const balanceScore = Math.max(0, 100 - standardDeviation * 2);
    const developmentScore = average;

    return Math.round((balanceScore * 0.4) + (developmentScore * 0.6));
  }

  private deriveDominantElements(spirals: SpiralSummary[]): string[] {
    const elementCounts = spirals.reduce((acc, spiral) => {
      const phase = spiral.currentPhase;
      if (phase.includes('fire')) acc.fire++;
      else if (phase.includes('water')) acc.water++;
      else if (phase.includes('earth')) acc.earth++;
      else if (phase.includes('air')) acc.air++;
      return acc;
    }, { fire: 0, water: 0, earth: 0, air: 0 });

    return Object.entries(elementCounts)
      .filter(([_, count]) => count > 0)
      .sort(([_, a], [__, b]) => b - a)
      .map(([element, _]) => element)
      .slice(0, 2);
  }

  private assessConstellationHealth(
    spirals: SpiralSummary[],
    patterns: CrossSpiralPattern[]
  ): 'scattered' | 'focused' | 'integrated' | 'transcendent' {
    if (spirals.length === 0) return 'scattered';
    if (spirals.length === 1) return 'focused';

    const harmonyScore = this.calculateOverallHarmony(spirals);
    const hasDestructivePatterns = patterns.some(p => p.significance > 0.8);

    if (harmonyScore > 80 && !hasDestructivePatterns) return 'transcendent';
    if (harmonyScore > 60) return 'integrated';
    if (spirals.length <= 3) return 'focused';
    return 'scattered';
  }

  private assessReadinessForNewSpiral(spirals: SpiralSummary[], harmony: number): boolean {
    // Ready for new spiral if:
    // - Harmony is high enough (>60)
    // - Not too many active spirals (<4)
    // - At least one spiral is in later phases
    const hasMaturitySigns = spirals.some(s =>
      s.currentPhase.includes('mastery') || s.currentPhase === 'integration'
    );

    return harmony > 60 && spirals.length < 4 && hasMaturitySigns;
  }

  private assessIntegrationNeed(spirals: SpiralSummary[], patterns: CrossSpiralPattern[]): boolean {
    // Needs integration if:
    // - Many spirals but low harmony
    // - Strong cross-patterns indicating fragmentation
    // - Multiple spirals in similar phases without integration

    return spirals.length > 2 && (
      this.calculateOverallHarmony(spirals) < 50 ||
      patterns.length > 2
    );
  }

  // Synthesis methods for theme generation
  private synthesizeThemeName(spirals: SpiralSummary[], dominantElements: string[]): string {
    const domainThemes = {
      vocation: 'calling',
      relationship: 'intimacy',
      health: 'vitality',
      creativity: 'expression',
      spirituality: 'transcendence',
      family: 'belonging',
      community: 'service',
      money: 'abundance'
    };

    const elementThemes = {
      fire: 'ignition',
      water: 'flow',
      earth: 'grounding',
      air: 'clarity'
    };

    const primaryDomains = spirals.slice(0, 2).map(s => domainThemes[s.lifeDomain]);
    const elementalTheme = dominantElements.map(e => elementThemes[e as keyof typeof elementThemes]).join(' and ');

    return `${elementalTheme} across ${primaryDomains.join(' and ')}`;
  }

  private synthesizeThemeDescription(spirals: SpiralSummary[], dominantElements: string[]): string {
    const phases = spirals.map(s => s.currentPhase);
    const hasDescents = phases.some(p => p.includes('descent') || p.includes('water'));
    const hasEmergences = phases.some(p => p.includes('emergence') || p.includes('fire'));

    if (hasDescents && hasEmergences) {
      return 'A time of simultaneous dissolution and emergence across multiple life areas';
    } else if (hasDescents) {
      return 'A deep restructuring process affecting multiple dimensions of life';
    } else if (hasEmergences) {
      return 'New life force activating across multiple areas simultaneously';
    } else {
      return 'Steady development and integration across key life domains';
    }
  }

  private synthesizeGuidanceDirection(spirals: SpiralSummary[], dominantElements: string[]): string {
    const primarySpiral = this.identifyPrimarySpiral(spirals);
    if (!primarySpiral) return 'Listen for emerging callings';

    const elementGuidance = {
      fire: 'Honor the emerging vision while building sustainable structure',
      water: 'Allow the dissolution while maintaining loving witness',
      earth: 'Ground the vision in consistent practice and embodiment',
      air: 'Articulate the wisdom while staying connected to feeling'
    };

    const primaryElement = dominantElements[0] as keyof typeof elementGuidance;
    return elementGuidance[primaryElement] || 'Follow the organic unfolding with conscious presence';
  }

  // Placeholder methods for complex calculations
  private calculateIntensity(record: any): number {
    // Would analyze recent episode frequency, emotional intensity, etc.
    return 0.7; // Placeholder
  }

  private calculatePriority(record: any): number {
    // Would analyze user-set priorities, life impact, etc.
    return 3; // Placeholder
  }

  private extractFacets(record: any): string[] {
    // Would analyze episodes for consciousness facets
    return ['authenticity', 'vulnerability']; // Placeholder
  }

  private extractArchetypes(record: any): string[] {
    // Would analyze for archetypal themes
    return ['Seeker', 'Lover']; // Placeholder
  }

  private calculateDaysActive(record: any): number {
    const started = new Date(record.startedAt || record.createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - started.getTime()) / (1000 * 60 * 60 * 24));
  }

  private calculateElementalSignature(record: any): { fire: number; water: number; earth: number; air: number } {
    // Would analyze episodes for elemental patterns
    return { fire: 60, water: 80, earth: 40, air: 30 }; // Placeholder
  }

  private extractSharedArchetypes(spirals: SpiralSummary[]): string[] {
    const allArchetypes = spirals.flatMap(s => s.primaryArchetypes);
    return [...new Set(allArchetypes)];
  }

  private calculatePatternSignificance(spirals: SpiralSummary[]): number {
    // Calculate based on spiral intensity, number of spirals, etc.
    return spirals.reduce((acc, s) => acc + s.intensity, 0) / spirals.length;
  }

  private generateTherapeuticOpportunity(facets: string[], spirals: SpiralSummary[]): string {
    return `Working with ${facets.join(' + ')} across ${spirals.length} life areas offers deep integration opportunity`;
  }

  private extractCommonFacets(spirals: SpiralSummary[]): string[] {
    if (spirals.length === 0) return [];

    return spirals[0].facetFocus.filter(facet =>
      spirals.every(spiral => spiral.facetFocus.includes(facet))
    );
  }

  private getPhaseTheme(phase: SpiralPhase): string {
    const themes: Record<string, string> = {
      'initiation': 'new beginning',
      'descent': 'deep transformation',
      'turning': 'critical transition',
      'emergence': 'new life emerging',
      'integration': 'wisdom embodiment',
      'fire-emergence': 'ignition of will',
      'fire-deepening': 'sustained passion',
      'fire-mastery': 'aligned power',
      'water-emergence': 'emotional awakening',
      'water-deepening': 'shadow work',
      'water-mastery': 'emotional integration',
      'earth-emergence': 'grounding vision',
      'earth-deepening': 'building practice',
      'earth-mastery': 'stable manifestation',
      'air-emergence': 'finding voice',
      'air-deepening': 'teaching wisdom',
      'air-mastery': 'integrated understanding'
    };

    return themes[phase] || 'transformation';
  }

  private async calculateCollectiveResonance(elements: string[], domains: LifeDomain[]): Promise<number> {
    // Would query community field data to see how common this pattern is
    return 0.6; // Placeholder
  }

  private generatePrimaryFocus(constellation: MemberSpiralConstellation): string {
    const primary = constellation.activeSpirals.find(s => s.id === constellation.primarySpiralId);
    if (!primary) return 'Listen for what wants to emerge';

    return `Your primary focus is ${primary.lifeDomain} - ${primary.coreChallenge}`;
  }

  private generateCrossSpiralReflection(pattern: CrossSpiralPattern, constellation: MemberSpiralConstellation): string {
    const domains = pattern.involvedSpirals.map(id =>
      constellation.activeSpirals.find(s => s.id === id)?.lifeDomain
    ).filter(Boolean);

    return `I notice a pattern: ${pattern.description}. This shared theme across ${domains.join(' and ')} suggests ${pattern.therapeuticOpportunity}`;
  }

  private generateHarmonyGuidance(elementalBalance: { fire: number; water: number; earth: number; air: number }): string {
    const sorted = Object.entries(elementalBalance).sort(([,a], [,b]) => a - b);
    const weakest = sorted[0][0];
    const strongest = sorted[sorted.length - 1][0];

    return `Your constellation shows ${strongest} emphasis and ${weakest} deficit. Consider practices that strengthen ${weakest} qualities.`;
  }

  private suggestNextDevelopment(constellation: MemberSpiralConstellation): string {
    const activeDomains = constellation.activeSpirals.map(s => s.lifeDomain);
    const allDomains: LifeDomain[] = ['relationship', 'vocation', 'health', 'creativity', 'spirituality', 'family', 'community', 'money'];
    const availableDomains = allDomains.filter(d => !activeDomains.includes(d));

    if (availableDomains.length > 0) {
      return `Your constellation could benefit from activating ${availableDomains[0]} spiral when ready`;
    }

    return 'Focus on deepening existing spirals rather than starting new ones';
  }

  private generateSupportingAdvice(constellation: MemberSpiralConstellation): string {
    const secondarySpirals = constellation.activeSpirals.filter(s =>
      constellation.secondarySpiralIds.includes(s.id)
    );

    if (secondarySpirals.length > 0) {
      const domains = secondarySpirals.map(s => s.lifeDomain);
      return `Your ${domains.join(' and ')} spirals can support your primary work by providing stability and perspective`;
    }

    return 'Consider how your other life areas might support your primary focus';
  }
}

export const spiralConstellationService: SpiralConstellationService = new SpiralConstellationServiceImpl();