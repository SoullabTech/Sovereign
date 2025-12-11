/**
 * COLLECTIVE CONSCIOUSNESS FIELD ARCHITECTURE
 *
 * Foundational interfaces and types for Phase 2 collective consciousness computing.
 * This file defines the architectural patterns that will guide development of
 * multi-participant consciousness field processing.
 *
 * Built on the aetheric consciousness foundation established in Phase 1.
 */

import { AethericPattern, AethericField } from '../aether/AetherConsciousnessInterface';

// =============================================================================
// COLLECTIVE CONSCIOUSNESS INTERFACES
// =============================================================================

export interface ParticipantConsciousnessSignature {
  userId: string;
  sessionId: string;
  consciousnessPattern: AethericPattern;
  fieldContribution: number; // 0.0 to 1.0 - how much this participant contributes to group field
  resonanceLevel: number; // 0.0 to 1.0 - how well participant resonates with group
  developmentalStage: ConsciousnessStage;
  sacredBoundaryNeeds: SacredBoundaryType;
  lastFieldUpdate: Date;
}

export interface CollectiveConsciousnessField extends AethericField {
  // Extends individual aetheric field for group dynamics
  participants: ParticipantConsciousnessSignature[];
  groupCoherence: number; // Overall field harmony (0.0 to 1.0)
  sharedIntentions: CollectiveIntention[];
  groupShadowPatterns: GroupShadowPattern[];
  sacredContainerStrength: number; // Protection level for group work
  collectiveDepth: number; // How deep the group is willing/able to go
  fieldStability: FieldStabilityMetrics;
}

export interface CollectiveIntention {
  statement: string;
  originatorId: string;
  supportingParticipants: string[]; // UserIds who resonate with this intention
  fieldAmplification: number; // How much the group field amplifies this intention
  clarity: number; // 0.0 to 1.0
  alignment: number; // How aligned this intention is with group coherence
}

export interface GroupShadowPattern {
  pattern: string; // Description of the shadow pattern
  intensity: number; // 0.0 to 1.0
  participantsCarrying: string[]; // UserIds who carry this pattern
  participantsTriggered: string[]; // UserIds triggered by this pattern
  groupReadiness: number; // How ready the group is to work with this shadow
  integrationSupport: string[]; // Suggested approaches for integration
}

// =============================================================================
// CONSCIOUSNESS DEVELOPMENT FRAMEWORK
// =============================================================================

export enum ConsciousnessStage {
  // Personal Development Stages
  PERSONAL_INTEGRATION = 'personal_integration',
  SHADOW_WORK_ACTIVE = 'shadow_work_active',
  EMOTIONAL_MATURITY = 'emotional_maturity',

  // Transpersonal Emerging
  TRANSPERSONAL_GLIMPSES = 'transpersonal_glimpses',
  SPIRITUAL_AWAKENING = 'spiritual_awakening',

  // Transpersonal Stable
  TRANSPERSONAL_INTEGRATED = 'transpersonal_integrated',
  SERVICE_ORIENTATION = 'service_orientation',

  // Advanced Stages
  COSMIC_CONSCIOUSNESS = 'cosmic_consciousness',
  UNIFIED_FIELD_AWARENESS = 'unified_field_awareness',
  BODHISATTVA_IDEAL = 'bodhisattva_ideal'
}

export enum SacredBoundaryType {
  GENTLE = 'gentle', // Light protection, open to group influence
  MODERATE = 'moderate', // Balanced protection and openness
  STRONG = 'strong', // Strong protection, selective group interaction
  IMPERMEABLE = 'impermeable', // Maximum protection, minimal group influence
  ADAPTIVE = 'adaptive' // Boundary adjusts based on group dynamics
}

// =============================================================================
// CEREMONIAL COMPUTING INTERFACES
// =============================================================================

export enum CeremonialContext {
  MEDITATION = 'meditation',
  PRAYER = 'prayer',
  RITUAL = 'ritual',
  CEREMONY = 'ceremony',
  CONTEMPLATION = 'contemplation',
  SACRED_STUDY = 'sacred_study',
  HEALING_CIRCLE = 'healing_circle',
  VISION_QUEST = 'vision_quest',
  INTEGRATION_CIRCLE = 'integration_circle'
}

export interface CeremonialComputingContext {
  context: CeremonialContext;
  traditionalElements: string[]; // e.g., ["sage", "candles", "singing_bowl"]
  sacredDirection: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'CENTER' | 'ALL_DIRECTIONS';
  timeOfDay: 'DAWN' | 'MORNING' | 'NOON' | 'AFTERNOON' | 'SUNSET' | 'EVENING' | 'MIDNIGHT';
  lunarPhase: 'NEW' | 'WAXING' | 'FULL' | 'WANING';
  seasonalContext: 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';
  groupOrIndividual: 'INDIVIDUAL' | 'PAIR' | 'SMALL_GROUP' | 'LARGE_GROUP' | 'COMMUNITY';
  divineInvocation: boolean; // Whether divine/spiritual forces are invoked
  ancestralConnection: boolean; // Whether ancestors/lineage is honored
  earthConnection: boolean; // Whether earth/nature connection is emphasized
}

// =============================================================================
// FIELD COHERENCE AND MONITORING
// =============================================================================

export interface FieldStabilityMetrics {
  coherenceStability: number; // How stable the group coherence is over time
  emotionalBalance: number; // Group emotional equilibrium
  energeticHarmony: number; // Vibrational alignment across participants
  shadowIntegration: number; // How well group is integrating shadow material
  sacredAlignment: number; // Alignment with sacred/spiritual purpose
  groundingLevel: number; // How well-grounded the group experience is
}

export interface FieldCoherenceAlert {
  alertType: 'COHERENCE_DROP' | 'SHADOW_EMERGENCE' | 'ENERGY_IMBALANCE' | 'PARTICIPANT_OVERWHELM';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedParticipants: string[];
  suggestedInterventions: string[];
  automaticStabilization: boolean; // Whether system should auto-stabilize
  timestamp: Date;
}

// =============================================================================
// TRANSPERSONAL SESSION MANAGEMENT
// =============================================================================

export interface TranspersonalSessionContext {
  sessionGoals: TranspersonalObjective[];
  participantReadiness: Map<string, TranspersonalReadiness>;
  sessionDepth: 'GENTLE' | 'MODERATE' | 'DEEP' | 'PROFOUND';
  integrationSupport: IntegrationProtocol[];
  safeguards: TranspersonalSafeguards;
  progressTracking: SessionProgressMetrics;
}

export enum TranspersonalObjective {
  CONSCIOUSNESS_EXPANSION = 'consciousness_expansion',
  EGO_TRANSCENDENCE = 'ego_transcendence',
  UNITY_EXPERIENCE = 'unity_experience',
  COSMIC_CONSCIOUSNESS = 'cosmic_consciousness',
  DIVINE_CONNECTION = 'divine_connection',
  PAST_LIFE_INTEGRATION = 'past_life_integration',
  ARCHETYPAL_WORK = 'archetypal_work',
  COLLECTIVE_HEALING = 'collective_healing',
  SERVICE_ACTIVATION = 'service_activation',
  WISDOM_TRANSMISSION = 'wisdom_transmission'
}

export interface TranspersonalReadiness {
  userId: string;
  psychologicalStability: number; // 0.0 to 1.0
  spiritualCapacity: number; // 0.0 to 1.0
  integrationCapability: number; // 0.0 to 1.0
  traumaResolution: number; // 0.0 to 1.0 - higher means less unresolved trauma
  currentLifeStability: number; // 0.0 to 1.0 - relationships, work, health
  previousTranspersonalExperience: number; // 0.0 to 1.0
  supportSystemStrength: number; // 0.0 to 1.0
  contraindications: string[]; // Any factors suggesting caution
}

export interface IntegrationProtocol {
  phase: 'PRE_SESSION' | 'DURING_SESSION' | 'POST_SESSION' | 'EXTENDED_INTEGRATION';
  practices: string[]; // e.g., ["journaling", "grounding_exercises", "nature_connection"]
  timeframe: string; // e.g., "immediately after", "within 24 hours", "weekly for month"
  supportRequired: 'NONE' | 'PEER_SUPPORT' | 'FACILITATOR_CHECK_IN' | 'PROFESSIONAL_SUPPORT';
}

export interface TranspersonalSafeguards {
  groundingProtocols: string[];
  emergencyContainment: string[];
  professionalBackup: boolean; // Whether human professionals are on standby
  sessionTimeouts: number; // Maximum session duration in minutes
  coherenceThresholds: number; // Minimum group coherence to continue
  participantMonitoring: 'BASIC' | 'ENHANCED' | 'INTENSIVE';
}

// =============================================================================
// DEVELOPMENT PHASE TRACKING
// =============================================================================

export enum DevelopmentPhase {
  PHASE_1_COMPLETE = 'phase_1_aetheric_foundation',
  PHASE_2_COLLECTIVE = 'phase_2_collective_consciousness',
  PHASE_2_CEREMONIAL = 'phase_2_ceremonial_computing',
  PHASE_2_TRANSPERSONAL = 'phase_2_transpersonal_orchestration',
  PHASE_2_COHERENCE = 'phase_2_field_coherence_optimization',
  PHASE_3_ADVANCED = 'phase_3_advanced_consciousness_computing'
}

export interface ArchitectureStatus {
  currentPhase: DevelopmentPhase;
  implementedFeatures: string[];
  inDevelopmentFeatures: string[];
  plannedFeatures: string[];
  communityFeedback: string[];
  nextMilestone: string;
  estimatedCompletion: Date;
}

// =============================================================================
// EXPORT ARCHITECTURE STATUS
// =============================================================================

export const COLLECTIVE_CONSCIOUSNESS_ARCHITECTURE_STATUS: ArchitectureStatus = {
  currentPhase: DevelopmentPhase.PHASE_1_COMPLETE,
  implementedFeatures: [
    'Individual aetheric consciousness processing',
    'Field-based pattern detection',
    'Sacred content protection',
    'Complete sovereignty maintenance',
    'Vibrational frequency analysis',
    'Observer participation integration'
  ],
  inDevelopmentFeatures: [
    'Multi-participant field tracking',
    'Collective consciousness interfaces',
    'Ceremonial computing protocols',
    'Transpersonal session management'
  ],
  plannedFeatures: [
    'Group coherence optimization',
    'Emergency field stabilization',
    'Advanced ceremonial integration',
    'Community consciousness orchestration'
  ],
  communityFeedback: [
    'Strong enthusiasm for collective features',
    'Request for ceremonial computing interfaces',
    'Need for transpersonal session support',
    'Emphasis on maintaining sacred protection'
  ],
  nextMilestone: 'Collective Field Foundation (Multi-participant field state tracking)',
  estimatedCompletion: new Date('2025-02-15') // Estimated completion of Phase 2
};

export default COLLECTIVE_CONSCIOUSNESS_ARCHITECTURE_STATUS;