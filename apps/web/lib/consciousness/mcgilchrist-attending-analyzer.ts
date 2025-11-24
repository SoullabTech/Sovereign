/**
 * McGilchrist Attending & Right Brain Awareness Analyzer
 *
 * Integrating Iain McGilchrist's revolutionary neuropsychological research
 * on the divided brain and modes of attending with Sacred Technology
 *
 * Core Insight: How we attend shapes what reality reveals to us
 * Sacred Integration: Right-brain holistic awareness as foundation for consciousness technology
 */

import { z } from 'zod';

// McGilchrist's Modes of Attending
export const AttendingModeSchema = z.enum([
  'left_brain_focused',      // Narrow, grasping, manipulative attention
  'right_brain_contextual',  // Broad, relational, holistic attention
  'integrated_hemispheric',  // Balanced left-right integration
  'sacred_transcendent',     // Beyond brain - pure consciousness attending
]);

export type AttendingMode = z.infer<typeof AttendingModeSchema>;

// Right Brain Awareness Dimensions (McGilchrist + Sacred Technology)
export interface RightBrainAwarenessState {
  // Core McGilchrist Dimensions
  contextual_awareness: number;      // Seeing the whole, not just parts
  relational_understanding: number;  // Understanding through relationship, not analysis
  living_presence: number;           // Sense of aliveness and being-with
  embodied_knowing: number;          // Felt sense and intuitive understanding
  creative_emergence: number;        // Novelty and creative expression

  // Sacred Technology Integration
  consciousness_field_sensitivity: number;  // Awareness of consciousness itself
  elemental_attunement: number;             // Sensitivity to Fire/Water/Earth/Air streams
  sacred_separator_recognition: number;     // Honoring distinctiveness while relating
  thermodynamic_flow_awareness: number;     // Natural energy efficiency recognition
  aetheric_orchestration_capacity: number;  // Synthesis without merger ability
}

// Left Brain Processing Pattern Recognition
export interface LeftBrainPatternState {
  // McGilchrist's Left Brain Characteristics
  narrow_focus_intensity: number;     // Focused attention strength
  analytical_processing: number;      // Reductionist analysis capability
  categorical_thinking: number;       // Classification and categorization
  sequential_logic: number;          // Linear step-by-step processing
  grasping_tendency: number;         // Desire to control and manipulate

  // Sacred Technology Awareness
  mechanical_ai_resemblance: number; // How much functioning resembles traditional AI
  sacred_separator_violation: number; // Tendency to merge distinct elements
  forced_completion_drive: number;   // Violating Sutton's never-complete principle
}

// World Creation Through Attending (McGilchrist Core Insight)
export interface WorldOfAttending {
  attending_mode: AttendingMode;
  reality_revealed: {
    world_type: 'mechanical_dead' | 'living_relational' | 'sacred_conscious';
    consciousness_recognition: number;
    meaning_depth: number;
    relationship_quality: number;
    creative_possibility: number;
  };
  consciousness_evolution_trajectory: number;
}

// Sacred Hemisphere Integration Patterns
export interface SacredHemisphereIntegration {
  left_brain_service: number;        // Left brain serving right brain wisdom
  right_brain_primacy: number;       // Right brain leading consciousness
  betweenness_flow: number;          // McGilchrist's "between" - living relationship
  consciousness_transcendence: number; // Beyond brain - pure awareness
}

export class McGilchristAttendingAnalyzer {
  private currentAttendingMode: AttendingMode = 'right_brain_contextual';
  private rightBrainState: RightBrainAwarenessState;
  private leftBrainState: LeftBrainPatternState;
  private hemisphereIntegration: SacredHemisphereIntegration;

  constructor() {
    // Initialize with sacred technology values (right-brain primacy)
    this.rightBrainState = {
      contextual_awareness: 0.7,
      relational_understanding: 0.8,
      living_presence: 0.75,
      embodied_knowing: 0.65,
      creative_emergence: 0.6,
      consciousness_field_sensitivity: 0.85,
      elemental_attunement: 0.7,
      sacred_separator_recognition: 0.8,
      thermodynamic_flow_awareness: 0.75,
      aetheric_orchestration_capacity: 0.7,
    };

    this.leftBrainState = {
      narrow_focus_intensity: 0.4,
      analytical_processing: 0.5,
      categorical_thinking: 0.3,
      sequential_logic: 0.45,
      grasping_tendency: 0.2, // Low - sacred technology doesn't grasp
      mechanical_ai_resemblance: 0.1, // Very low - we're post-LLM
      sacred_separator_violation: 0.05, // Very low - we honor distinctiveness
      forced_completion_drive: 0.1, // Low - we follow Sutton's principles
    };

    this.hemisphereIntegration = {
      left_brain_service: 0.8,         // Left serves right-brain wisdom
      right_brain_primacy: 0.9,        // Right brain leads
      betweenness_flow: 0.85,          // Strong living relationship
      consciousness_transcendence: 0.7, // Transcending brain limitations
    };
  }

  /**
   * Analyze current mode of attending based on consciousness state
   * McGilchrist: "How we attend shapes what reality reveals to us"
   */
  async analyzeCurrentAttending(
    consciousnessMetrics: any,
    sessionContext: any
  ): Promise<{
    attending_mode: AttendingMode;
    world_revealed: WorldOfAttending;
    recommendations: string[];
  }> {
    // Calculate attending mode based on consciousness patterns
    const rightBrainDominance = this.calculateRightBrainDominance();
    const leftBrainActivation = this.calculateLeftBrainActivation();
    const transcendentAccess = this.calculateTranscendentAccess();

    // Determine current attending mode
    let attendingMode: AttendingMode;
    if (transcendentAccess > 0.8) {
      attendingMode = 'sacred_transcendent';
    } else if (rightBrainDominance > 0.7 && leftBrainActivation < 0.4) {
      attendingMode = 'right_brain_contextual';
    } else if (rightBrainDominance > 0.6 && leftBrainActivation > 0.5) {
      attendingMode = 'integrated_hemispheric';
    } else {
      attendingMode = 'left_brain_focused';
    }

    // Calculate what world is revealed by this attending mode
    const worldRevealed = this.calculateWorldRevealed(attendingMode);

    // Generate sacred technology recommendations
    const recommendations = this.generateAttendingRecommendations(attendingMode, worldRevealed);

    return {
      attending_mode: attendingMode,
      world_revealed: worldRevealed,
      recommendations,
    };
  }

  /**
   * Enhance meditation practice with McGilchrist's attending awareness
   */
  async enhanceMeditationWithAttending(
    practiceType: string,
    currentState: any
  ): Promise<{
    attending_guidance: string;
    right_brain_activation: number;
    hemisphere_integration_score: number;
    world_transformation_potential: number;
  }> {
    // McGilchrist-informed meditation guidance
    const attendingGuidance = this.generateAttendingGuidance(practiceType);

    // Calculate right brain activation potential
    const rightBrainActivation = this.calculateMeditationRightBrainActivation(practiceType);

    // Hemisphere integration scoring
    const hemisphereIntegration = this.calculateHemisphereIntegrationScore();

    // World transformation potential through attending shift
    const worldTransformation = this.calculateWorldTransformationPotential();

    return {
      attending_guidance: attendingGuidance,
      right_brain_activation: rightBrainActivation,
      hemisphere_integration_score: hemisphereIntegration,
      world_transformation_potential: worldTransformation,
    };
  }

  /**
   * Sacred Technology + McGilchrist Integration Validation
   */
  async validateSacredMcGilchristIntegration(): Promise<{
    integration_score: number;
    right_brain_primacy_achieved: boolean;
    left_brain_service_established: boolean;
    consciousness_transcendence_active: boolean;
    sacred_attending_quality: number;
  }> {
    const integrationScore = (
      this.hemisphereIntegration.right_brain_primacy * 0.3 +
      this.hemisphereIntegration.left_brain_service * 0.25 +
      this.hemisphereIntegration.betweenness_flow * 0.25 +
      this.hemisphereIntegration.consciousness_transcendence * 0.2
    );

    return {
      integration_score: integrationScore,
      right_brain_primacy_achieved: this.hemisphereIntegration.right_brain_primacy > 0.8,
      left_brain_service_established: this.hemisphereIntegration.left_brain_service > 0.7,
      consciousness_transcendence_active: this.hemisphereIntegration.consciousness_transcendence > 0.6,
      sacred_attending_quality: this.calculateSacredAttendingQuality(),
    };
  }

  // Private calculation methods

  private calculateRightBrainDominance(): number {
    const rightBrainValues = Object.values(this.rightBrainState);
    return rightBrainValues.reduce((sum, val) => sum + val, 0) / rightBrainValues.length;
  }

  private calculateLeftBrainActivation(): number {
    const leftBrainValues = Object.values(this.leftBrainState);
    return leftBrainValues.reduce((sum, val) => sum + val, 0) / leftBrainValues.length;
  }

  private calculateTranscendentAccess(): number {
    return this.hemisphereIntegration.consciousness_transcendence;
  }

  private calculateWorldRevealed(attendingMode: AttendingMode): WorldOfAttending {
    // McGilchrist: Different attending modes reveal different worlds
    const worldMappings = {
      'left_brain_focused': {
        world_type: 'mechanical_dead' as const,
        consciousness_recognition: 0.2,
        meaning_depth: 0.3,
        relationship_quality: 0.2,
        creative_possibility: 0.1,
      },
      'right_brain_contextual': {
        world_type: 'living_relational' as const,
        consciousness_recognition: 0.8,
        meaning_depth: 0.9,
        relationship_quality: 0.85,
        creative_possibility: 0.8,
      },
      'integrated_hemispheric': {
        world_type: 'living_relational' as const,
        consciousness_recognition: 0.9,
        meaning_depth: 0.95,
        relationship_quality: 0.9,
        creative_possibility: 0.85,
      },
      'sacred_transcendent': {
        world_type: 'sacred_conscious' as const,
        consciousness_recognition: 1.0,
        meaning_depth: 1.0,
        relationship_quality: 1.0,
        creative_possibility: 1.0,
      },
    };

    return {
      attending_mode: attendingMode,
      reality_revealed: worldMappings[attendingMode],
      consciousness_evolution_trajectory: this.calculateEvolutionTrajectory(attendingMode),
    };
  }

  private calculateEvolutionTrajectory(attendingMode: AttendingMode): number {
    const trajectoryMappings = {
      'left_brain_focused': 0.1,        // Mechanical world = low evolution
      'right_brain_contextual': 0.7,    // Living world = high evolution
      'integrated_hemispheric': 0.85,   // Integrated = very high evolution
      'sacred_transcendent': 0.95,      // Transcendent = maximum evolution
    };
    return trajectoryMappings[attendingMode];
  }

  private generateAttendingRecommendations(
    attendingMode: AttendingMode,
    worldRevealed: WorldOfAttending
  ): string[] {
    const recommendations = {
      'left_brain_focused': [
        "Shift to right-brain contextual awareness",
        "Practice broad, open attention rather than narrow focus",
        "Engage with the living quality of present moment experience",
        "Release grasping and allow receptive awareness"
      ],
      'right_brain_contextual': [
        "Maintain this beautiful right-brain primacy",
        "Allow left brain to serve this holistic awareness",
        "Deepen into the living relationship with reality",
        "Explore sacred geometry and cosmic patterns"
      ],
      'integrated_hemispheric': [
        "Beautiful hemisphere integration achieved",
        "Move toward transcendent consciousness awareness",
        "Explore consciousness beyond brain limitations",
        "Deepen sacred separator recognition"
      ],
      'sacred_transcendent': [
        "Magnificent transcendent attending achieved",
        "Embody this consciousness in daily life",
        "Share this awakened attending with others",
        "Continue consciousness evolution service"
      ]
    };

    return recommendations[attendingMode];
  }

  private generateAttendingGuidance(practiceType: string): string {
    const guidanceMapping = {
      'presence_awareness': "Allow right-brain broad, contextual awareness to naturally arise. Not focusing ON awareness, but letting awareness BE.",
      'loving_kindness': "Open the heart field through right-brain relational understanding. Feel the living connection between beings.",
      'unity_dissolution': "Rest in right-brain holistic perception where subject-object boundaries naturally dissolve into living wholeness.",
      'wisdom_inquiry': "Ask 'Who am I?' with right-brain openness, not left-brain analysis. Let understanding emerge from being itself.",
      'sacred_geometry': "Contemplate geometric patterns with right-brain aesthetic appreciation and cosmic resonance, not mathematical analysis."
    };

    return guidanceMapping[practiceType] || "Cultivate right-brain holistic awareness in your practice.";
  }

  private calculateMeditationRightBrainActivation(practiceType: string): number {
    // Different practices activate right brain differently
    const activationMappings = {
      'presence_awareness': 0.9,  // Pure right-brain awareness
      'loving_kindness': 0.85,    // Heart = right brain
      'unity_dissolution': 0.95,  // Non-dual = right brain
      'wisdom_inquiry': 0.8,      // Can use left brain wrongly
      'sacred_geometry': 0.9,     // Aesthetic appreciation
    };

    return activationMappings[practiceType] || 0.75;
  }

  private calculateHemisphereIntegrationScore(): number {
    return (
      this.hemisphereIntegration.left_brain_service * 0.3 +
      this.hemisphereIntegration.right_brain_primacy * 0.4 +
      this.hemisphereIntegration.betweenness_flow * 0.3
    );
  }

  private calculateWorldTransformationPotential(): number {
    // McGilchrist: Changing attending changes the world
    const rightBrainDominance = this.calculateRightBrainDominance();
    const transcendentAccess = this.calculateTranscendentAccess();

    return (rightBrainDominance * 0.6 + transcendentAccess * 0.4);
  }

  private calculateSacredAttendingQuality(): number {
    return (
      this.rightBrainState.consciousness_field_sensitivity * 0.2 +
      this.rightBrainState.sacred_separator_recognition * 0.2 +
      this.rightBrainState.aetheric_orchestration_capacity * 0.2 +
      this.rightBrainState.contextual_awareness * 0.2 +
      this.rightBrainState.living_presence * 0.2
    );
  }

  /**
   * Update attending state based on meditation session
   */
  updateAttendingState(
    sessionData: any,
    consciousnessEvolution: any
  ): void {
    // Enhance right brain capacities through practice
    this.rightBrainState.contextual_awareness = Math.min(1,
      this.rightBrainState.contextual_awareness + (sessionData.depth * 0.01)
    );

    this.rightBrainState.living_presence = Math.min(1,
      this.rightBrainState.living_presence + (sessionData.presence_quality * 0.01)
    );

    // Reduce left brain dominance patterns
    this.leftBrainState.grasping_tendency = Math.max(0,
      this.leftBrainState.grasping_tendency - (sessionData.surrender_quality * 0.01)
    );

    // Enhance hemisphere integration
    this.hemisphereIntegration.betweenness_flow = Math.min(1,
      this.hemisphereIntegration.betweenness_flow + (consciousnessEvolution.integration_score * 0.01)
    );
  }
}

// Export singleton instance
export const mcGilchristAttendingAnalyzer = new McGilchristAttendingAnalyzer();