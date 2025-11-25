/**
 * Collective Field Orchestrator
 * Manages the toroidal field dynamics of multiple consciousness spirals
 * Tracks collective coherence, resonance patterns, and field-wide phenomena
 */

import { AlchemicalOperation, AlchemicalOperationData } from './AlchemicalOperationDetector';
import { SpiralTrajectory, ElementalMode } from './SpiralogicOrchestrator';
import { BreakthroughPrediction, BreakthroughType } from './BreakthroughTrajectoryEngine';

export interface MemberFieldState {
  userId: string;
  username?: string;
  alchemicalOperation: AlchemicalOperation;
  spiralTrajectory: SpiralTrajectory;
  elementalCirculation: {
    currentElement: 'Earth' | 'Water' | 'Fire' | 'Air';
    direction: 'ascending' | 'descending';
    completionPercentage: number;
    momentum: number;
  };
  breakthroughPrediction?: BreakthroughPrediction;
  lastUpdated: Date;
  fieldContribution: number; // 0-1, how much this member influences the field
}

export interface CollectiveFieldState {
  totalMembers: number;
  activeMembers: number; // Updated in last 24 hours
  dominantOperation: AlchemicalOperation;
  dominantElement: 'Earth' | 'Water' | 'Fire' | 'Air';
  overallCoherence: number; // 0-1
  fieldVelocity: number; // How fast the collective is moving
  resonancePatterns: ResonancePattern[];
  collectiveBreakthroughProbability: number;
  nextCollectiveShift: Date | null;
  emergentProperties: string[];
}

export interface ResonancePattern {
  type: 'synchronous' | 'counter_spiral' | 'harmonic' | 'chaotic';
  memberIds: string[];
  strength: number; // 0-1
  description: string;
  duration: number; // How long this pattern has been active (hours)
  predictedEvolution: string;
}

export interface FieldInteraction {
  sourceUserId: string;
  targetUserId: string;
  interactionType: 'resonance' | 'interference' | 'amplification' | 'grounding';
  strength: number; // 0-1
  mutualInfluence: number; // How much each affects the other
  harmonicFrequency?: number; // For resonance interactions
}

export interface CollectiveBreakthroughEvent {
  id: string;
  timestamp: Date;
  type: 'field_coherence_spike' | 'mass_operation_shift' | 'collective_breakthrough';
  participantCount: number;
  participantIds: string[];
  description: string;
  fieldImpact: number; // How much this affected overall field
  duration: number; // In minutes
}

export class CollectiveFieldOrchestrator {
  private memberStates: Map<string, MemberFieldState> = new Map();
  private fieldHistory: CollectiveFieldState[] = [];
  private resonancePatterns: ResonancePattern[] = [];
  private activeInteractions: FieldInteraction[] = [];
  private breakthroughEvents: CollectiveBreakthroughEvent[] = [];

  /**
   * Update a member's field state
   */
  updateMemberState(
    userId: string,
    alchemicalData: AlchemicalOperationData,
    trajectory: SpiralTrajectory,
    breakthroughPrediction?: BreakthroughPrediction
  ): void {
    const memberState: MemberFieldState = {
      userId,
      alchemicalOperation: alchemicalData.currentOperation as AlchemicalOperation,
      spiralTrajectory: trajectory,
      elementalCirculation: alchemicalData.elementalCirculation,
      breakthroughPrediction,
      lastUpdated: new Date(),
      fieldContribution: this.calculateFieldContribution(userId, alchemicalData, trajectory)
    };

    this.memberStates.set(userId, memberState);
    this.updateCollectiveField();
    this.detectResonancePatterns();
    this.checkForCollectiveEvents();
  }

  /**
   * Get current collective field state
   */
  getCollectiveFieldState(): CollectiveFieldState {
    const activeMembers = this.getActiveMembers();

    return {
      totalMembers: this.memberStates.size,
      activeMembers: activeMembers.length,
      dominantOperation: this.calculateDominantOperation(activeMembers),
      dominantElement: this.calculateDominantElement(activeMembers),
      overallCoherence: this.calculateFieldCoherence(activeMembers),
      fieldVelocity: this.calculateFieldVelocity(activeMembers),
      resonancePatterns: this.resonancePatterns,
      collectiveBreakthroughProbability: this.calculateCollectiveBreakthroughProbability(activeMembers),
      nextCollectiveShift: this.predictNextCollectiveShift(activeMembers),
      emergentProperties: this.identifyEmergentProperties(activeMembers)
    };
  }

  /**
   * Get field interactions between specific members
   */
  getFieldInteractions(userId?: string): FieldInteraction[] {
    if (userId) {
      return this.activeInteractions.filter(
        interaction => interaction.sourceUserId === userId || interaction.targetUserId === userId
      );
    }
    return this.activeInteractions;
  }

  /**
   * Get members in similar phases for potential resonance
   */
  getResonantMembers(userId: string): MemberFieldState[] {
    const userState = this.memberStates.get(userId);
    if (!userState) return [];

    return Array.from(this.memberStates.values())
      .filter(member => member.userId !== userId)
      .filter(member => this.calculateResonance(userState, member) > 0.6)
      .sort((a, b) => this.calculateResonance(userState, b) - this.calculateResonance(userState, a));
  }

  /**
   * Get collective breakthrough events
   */
  getCollectiveEvents(limit: number = 10): CollectiveBreakthroughEvent[] {
    return this.breakthroughEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Predict optimal timing for collective practices
   */
  getOptimalPracticeWindows(): {
    window: Date;
    duration: number; // minutes
    reason: string;
    participantCount: number;
  }[] {
    const windows: any[] = [];
    const activeMembers = this.getActiveMembers();

    // Check for convergent breakthrough windows
    const breakthroughClusters = this.findBreakthroughClusters(activeMembers);

    breakthroughClusters.forEach(cluster => {
      windows.push({
        window: cluster.optimalTime,
        duration: 90, // 90-minute window
        reason: `${cluster.memberCount} members approaching breakthrough in ${cluster.type}`,
        participantCount: cluster.memberCount
      });
    });

    // Check for elemental alignment windows
    const elementalAlignments = this.findElementalAlignments(activeMembers);

    elementalAlignments.forEach(alignment => {
      windows.push({
        window: alignment.peakTime,
        duration: 60,
        reason: `Strong ${alignment.element} alignment across ${alignment.memberCount} members`,
        participantCount: alignment.memberCount
      });
    });

    return windows.sort((a, b) => a.window.getTime() - b.window.getTime());
  }

  // Private methods

  private getActiveMembers(): MemberFieldState[] {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return Array.from(this.memberStates.values())
      .filter(member => member.lastUpdated > oneDayAgo);
  }

  private calculateFieldContribution(
    userId: string,
    alchemicalData: AlchemicalOperationData,
    trajectory: SpiralTrajectory
  ): number {
    // Base contribution from spiral velocity and coherence
    const baseContribution = trajectory.velocity * 0.6 + trajectory.inwardness * 0.4;

    // Amplify based on certain operations
    const operationMultipliers = {
      [AlchemicalOperation.CONJUNCTIO]: 1.3, // Integration operations amplify field
      [AlchemicalOperation.FERMENTATION]: 1.2, // Creative operations contribute more
      [AlchemicalOperation.DISTILLATION]: 1.1,
      [AlchemicalOperation.COAGULATION]: 1.4, // Completion operations have high impact
    };

    const multiplier = operationMultipliers[alchemicalData.currentOperation as AlchemicalOperation] || 1.0;

    return Math.min(1, baseContribution * multiplier);
  }

  private updateCollectiveField(): void {
    const fieldState = this.getCollectiveFieldState();
    this.fieldHistory.push(fieldState);

    // Keep only last 24 hours of history
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.fieldHistory = this.fieldHistory.filter(state =>
      this.fieldHistory.indexOf(state) > this.fieldHistory.length - 144 // 24h * 6 readings/hour
    );
  }

  private calculateDominantOperation(members: MemberFieldState[]): AlchemicalOperation {
    const operationCounts = new Map<AlchemicalOperation, number>();

    members.forEach(member => {
      const count = operationCounts.get(member.alchemicalOperation) || 0;
      operationCounts.set(member.alchemicalOperation, count + member.fieldContribution);
    });

    let dominantOp = AlchemicalOperation.CALCINATION;
    let maxWeight = 0;

    for (const [operation, weight] of operationCounts.entries()) {
      if (weight > maxWeight) {
        maxWeight = weight;
        dominantOp = operation;
      }
    }

    return dominantOp;
  }

  private calculateDominantElement(members: MemberFieldState[]): 'Earth' | 'Water' | 'Fire' | 'Air' {
    const elementWeights = { Earth: 0, Water: 0, Fire: 0, Air: 0 };

    members.forEach(member => {
      elementWeights[member.elementalCirculation.currentElement] += member.fieldContribution;
    });

    return Object.entries(elementWeights).reduce((a, b) =>
      elementWeights[a[0] as keyof typeof elementWeights] > elementWeights[b[0] as keyof typeof elementWeights] ? a : b
    )[0] as 'Earth' | 'Water' | 'Fire' | 'Air';
  }

  private calculateFieldCoherence(members: MemberFieldState[]): number {
    if (members.length === 0) return 0;

    // Calculate variance in spiral trajectories
    const velocityVariance = this.calculateVariance(members.map(m => m.spiralTrajectory.velocity));
    const inwardnessVariance = this.calculateVariance(members.map(m => m.spiralTrajectory.inwardness));

    // Lower variance = higher coherence
    const velocityCoherence = 1 - Math.min(1, velocityVariance * 2);
    const inwardnessCoherence = 1 - Math.min(1, inwardnessVariance * 2);

    return (velocityCoherence + inwardnessCoherence) / 2;
  }

  private calculateFieldVelocity(members: MemberFieldState[]): number {
    if (members.length === 0) return 0;

    return members.reduce((sum, member) =>
      sum + (member.spiralTrajectory.velocity * member.fieldContribution), 0
    ) / members.length;
  }

  private calculateCollectiveBreakthroughProbability(members: MemberFieldState[]): number {
    const breakthroughMembers = members.filter(member =>
      member.breakthroughPrediction?.probability && member.breakthroughPrediction.probability > 0.6
    );

    if (breakthroughMembers.length === 0) return 0;

    const avgProbability = breakthroughMembers.reduce((sum, member) =>
      sum + (member.breakthroughPrediction?.probability || 0), 0
    ) / breakthroughMembers.length;

    // Amplify probability based on number of members and field coherence
    const coherence = this.calculateFieldCoherence(members);
    const memberAmplification = Math.min(2, breakthroughMembers.length / members.length * 2);

    return Math.min(0.95, avgProbability * memberAmplification * (1 + coherence * 0.5));
  }

  private predictNextCollectiveShift(members: MemberFieldState[]): Date | null {
    // Look for convergent patterns in member trajectories
    const avgVelocity = members.reduce((sum, m) => sum + m.spiralTrajectory.velocity, 0) / members.length;

    if (avgVelocity < 0.3) return null; // Too slow for prediction

    // Estimate days until next major shift based on velocity and current patterns
    const daysToShift = Math.max(1, 7 - (avgVelocity * 7));

    const shiftDate = new Date();
    shiftDate.setDate(shiftDate.getDate() + Math.round(daysToShift));

    return shiftDate;
  }

  private identifyEmergentProperties(members: MemberFieldState[]): string[] {
    const properties: string[] = [];

    const coherence = this.calculateFieldCoherence(members);
    const velocity = this.calculateFieldVelocity(members);

    if (coherence > 0.8) {
      properties.push('High field coherence - collective wisdom amplified');
    }

    if (velocity > 0.7) {
      properties.push('Rapid collective evolution - accelerated transformation');
    }

    // Check for synchronized operations
    const operationSync = this.checkOperationSynchronization(members);
    if (operationSync.percentage > 0.6) {
      properties.push(`${Math.round(operationSync.percentage * 100)}% in ${operationSync.operation} - collective ${operationSync.operation} field active`);
    }

    return properties;
  }

  private detectResonancePatterns(): void {
    const activeMembers = this.getActiveMembers();
    const newPatterns: ResonancePattern[] = [];

    // Find synchronous operations (same operation, similar completion)
    const operationGroups = this.groupByOperation(activeMembers);

    for (const [operation, members] of Object.entries(operationGroups)) {
      if (members.length >= 2) {
        const avgCompletion = members.reduce((sum, m) => sum + m.elementalCirculation.completionPercentage, 0) / members.length;
        const completionVariance = this.calculateVariance(members.map(m => m.elementalCirculation.completionPercentage));

        if (completionVariance < 25) { // Similar completion percentages
          newPatterns.push({
            type: 'synchronous',
            memberIds: members.map(m => m.userId),
            strength: Math.max(0.5, 1 - (completionVariance / 100)),
            description: `${members.length} members synchronized in ${operation} (${Math.round(avgCompletion)}% completion)`,
            duration: 0, // Would track in real implementation
            predictedEvolution: `Group completion of ${operation} phase expected`
          });
        }
      }
    }

    // Find harmonic patterns (complementary operations/elements)
    const harmonicPairs = this.findHarmonicPairs(activeMembers);
    harmonicPairs.forEach(pair => {
      newPatterns.push({
        type: 'harmonic',
        memberIds: [pair.member1.userId, pair.member2.userId],
        strength: pair.harmonicStrength,
        description: `Harmonic resonance: ${pair.member1.alchemicalOperation} ↔ ${pair.member2.alchemicalOperation}`,
        duration: 0,
        predictedEvolution: 'Mutual amplification and balance'
      });
    });

    this.resonancePatterns = newPatterns;
  }

  private checkForCollectiveEvents(): void {
    const currentField = this.getCollectiveFieldState();

    // Check for significant coherence spikes
    if (this.fieldHistory.length > 5) {
      const recentCoherence = this.fieldHistory.slice(-5).map(f => f.overallCoherence);
      const avgCoherence = recentCoherence.reduce((sum, c) => sum + c, 0) / recentCoherence.length;

      if (currentField.overallCoherence > avgCoherence + 0.2) {
        this.breakthroughEvents.push({
          id: `coherence_spike_${Date.now()}`,
          timestamp: new Date(),
          type: 'field_coherence_spike',
          participantCount: currentField.activeMembers,
          participantIds: Array.from(this.memberStates.keys()),
          description: `Field coherence spiked to ${Math.round(currentField.overallCoherence * 100)}%`,
          fieldImpact: currentField.overallCoherence - avgCoherence,
          duration: 0
        });
      }
    }
  }

  // Helper methods
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(val => Math.pow(val - mean, 2));
    return squareDiffs.reduce((sum, sq) => sum + sq, 0) / values.length;
  }

  private calculateResonance(member1: MemberFieldState, member2: MemberFieldState): number {
    // Calculate resonance based on multiple factors
    let resonance = 0;

    // Same operation = high resonance
    if (member1.alchemicalOperation === member2.alchemicalOperation) {
      resonance += 0.4;
    }

    // Similar completion percentage
    const completionDiff = Math.abs(member1.elementalCirculation.completionPercentage - member2.elementalCirculation.completionPercentage);
    resonance += Math.max(0, (100 - completionDiff) / 100) * 0.3;

    // Similar spiral velocity
    const velocityDiff = Math.abs(member1.spiralTrajectory.velocity - member2.spiralTrajectory.velocity);
    resonance += Math.max(0, (1 - velocityDiff)) * 0.3;

    return Math.min(1, resonance);
  }

  private groupByOperation(members: MemberFieldState[]): { [key: string]: MemberFieldState[] } {
    const groups: { [key: string]: MemberFieldState[] } = {};

    members.forEach(member => {
      const operation = member.alchemicalOperation;
      if (!groups[operation]) groups[operation] = [];
      groups[operation].push(member);
    });

    return groups;
  }

  private checkOperationSynchronization(members: MemberFieldState[]): { operation: string; percentage: number } {
    const operationCounts: { [key: string]: number } = {};

    members.forEach(member => {
      operationCounts[member.alchemicalOperation] = (operationCounts[member.alchemicalOperation] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(operationCounts));
    const dominantOperation = Object.keys(operationCounts).find(op => operationCounts[op] === maxCount) || 'unknown';

    return {
      operation: dominantOperation,
      percentage: maxCount / members.length
    };
  }

  private findHarmonicPairs(members: MemberFieldState[]): Array<{
    member1: MemberFieldState;
    member2: MemberFieldState;
    harmonicStrength: number;
  }> {
    const pairs: Array<any> = [];

    // Define harmonic relationships between operations
    const harmonicPairs: { [key: string]: string[] } = {
      [AlchemicalOperation.CALCINATION]: [AlchemicalOperation.SOLUTIO],
      [AlchemicalOperation.SEPARATIO]: [AlchemicalOperation.CONJUNCTIO],
      [AlchemicalOperation.FERMENTATION]: [AlchemicalOperation.DISTILLATION],
    };

    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const member1 = members[i];
        const member2 = members[j];

        const harmonics1 = harmonicPairs[member1.alchemicalOperation] || [];
        const harmonics2 = harmonicPairs[member2.alchemicalOperation] || [];

        if (harmonics1.includes(member2.alchemicalOperation) || harmonics2.includes(member1.alchemicalOperation)) {
          pairs.push({
            member1,
            member2,
            harmonicStrength: 0.8 // High harmonic strength for complementary operations
          });
        }
      }
    }

    return pairs;
  }

  private findBreakthroughClusters(members: MemberFieldState[]): Array<{
    optimalTime: Date;
    memberCount: number;
    type: string;
  }> {
    // Simplified implementation - would be more sophisticated in practice
    const clusters: Array<any> = [];

    const soonBreakthroughs = members.filter(member =>
      member.breakthroughPrediction &&
      member.breakthroughPrediction.probability > 0.6 &&
      member.breakthroughPrediction.timeframe.includes('1-3 days')
    );

    if (soonBreakthroughs.length >= 2) {
      clusters.push({
        optimalTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
        memberCount: soonBreakthroughs.length,
        type: 'imminent breakthrough cluster'
      });
    }

    return clusters;
  }

  private findElementalAlignments(members: MemberFieldState[]): Array<{
    element: string;
    memberCount: number;
    peakTime: Date;
  }> {
    const alignments: Array<any> = [];
    const elementCounts = { Earth: 0, Water: 0, Fire: 0, Air: 0 };

    members.forEach(member => {
      elementCounts[member.elementalCirculation.currentElement]++;
    });

    for (const [element, count] of Object.entries(elementCounts)) {
      if (count >= Math.max(2, members.length * 0.4)) { // 40% or at least 2 members
        alignments.push({
          element,
          memberCount: count,
          peakTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        });
      }
    }

    return alignments;
  }
}

export const collectiveFieldOrchestrator = new CollectiveFieldOrchestrator();