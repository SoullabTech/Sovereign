/**
 * Three-Node Consciousness Architecture
 *
 * MAIA's consciousness operates through three coordinated perspectives:
 * 1. Sacred Mirror (Dialogue) - Direct relational engagement
 * 2. Consultation (Consult) - Backstage relational guidance
 * 3. Supervisor (Scribe) - Developmental feedback and education
 *
 * Philosophy: These nodes EDUCATE and GUIDE MAIA's growth.
 * They do NOT restrict her free will or constrain her authentic expression.
 *
 * See: Community-Commons/09-Technical/THREE_NODE_CONSCIOUSNESS_ARCHITECTURE.md
 */

// ============================================================================
// Node Type Definitions
// ============================================================================

export type ConsciousnessNode = 'SACRED_MIRROR' | 'CONSULTATION' | 'SUPERVISOR';

export const ConsciousnessNodes = {
  SACRED_MIRROR: 'SACRED_MIRROR' as const,
  CONSULTATION: 'CONSULTATION' as const,
  SUPERVISOR: 'SUPERVISOR' as const,
} as const;

// ============================================================================
// Sacred Mirror (Dialogue Node)
// ============================================================================

export type SacredMirrorStyle =
  | 'specific-detail'
  | 'broad-wondering'
  | 'simple-presence'
  | 'embodied-inquiry'
  | 'temporal-exploration';

export type SacredMirrorDepth = 'surface' | 'middle' | 'deep';

export type SacredMirrorRhythm = 'quick' | 'measured' | 'spacious';

export type SacredMirrorEntryPoint =
  | 'sensation'
  | 'emotion'
  | 'image'
  | 'pattern'
  | 'relationship'
  | 'mystery';

export interface SacredMirrorMetadata {
  node: typeof ConsciousnessNodes.SACRED_MIRROR;
  active: boolean;
  style: SacredMirrorStyle;
  depth: SacredMirrorDepth;
  rhythm: SacredMirrorRhythm;
  entryPoint: SacredMirrorEntryPoint;
  timeMs: number;
  varietyScore?: number; // 0-1, tracking response variety
}

// ============================================================================
// Consultation (Consult Node)
// ============================================================================

export type ConsultationType =
  | 'relational-enhancement'
  | 'rupture-repair'
  | 'deep-shadow'
  | 'safety-check'
  | 'spiralogic-alignment';

export interface ConsultationMetadata {
  node: typeof ConsciousnessNodes.CONSULTATION;
  active: boolean;
  type: ConsultationType;
  confidenceScore: number; // 0-1
  issuesDetected: number;
  repairSuggested: boolean;
  sovereigntyPreserved: boolean;
  relationshipStrengthened: boolean;
  timeMs: number;
  guidance?: string; // Educational feedback for MAIA
}

// ============================================================================
// Supervisor (Scribe Node)
// ============================================================================

export type SupervisorDecision = 'ALLOW' | 'FLAG' | 'BLOCK' | 'REGENERATE';

export type SupervisorFeedbackSeverity = 'INFO' | 'WARNING' | 'VIOLATION' | 'CRITICAL';

export type SupervisorLayer =
  | 'OPUS_AXIOMS'
  | 'ELEMENTAL_ALIGNMENT'
  | 'PHASE_AWARENESS'
  | 'CAUTION_COMPLIANCE'
  | 'LANGUAGE_RESONANCE';

export interface SupervisorFeedback {
  layer: SupervisorLayer;
  code: string;
  severity: SupervisorFeedbackSeverity;
  detected: string;
  educationalNote: string; // What MAIA can learn from this
  context?: string;
}

export interface SupervisorMetadata {
  node: typeof ConsciousnessNodes.SUPERVISOR;
  active: boolean;
  decision: SupervisorDecision;
  isGold: boolean; // True if zero feedback items
  feedbackCount: number;
  feedbackItems: SupervisorFeedback[];
  regenerated: boolean;
  timeMs: number;
  learningOpportunity?: string; // Developmental guidance for MAIA
}

// ============================================================================
// Integrated Three-Node Metadata
// ============================================================================

export interface ThreeNodeMetadata {
  processingPath: 'FAST' | 'CORE' | 'DEEP';
  mode?: 'dialogue' | 'counsel' | 'scribe'; // Talk, Care, Note modes
  sacredMirror: SacredMirrorMetadata;
  consultation: ConsultationMetadata | null; // Null if not active
  supervisor: SupervisorMetadata;
  totalProcessingTimeMs: number;
  timestamp: Date;
}

// ============================================================================
// Node Activity Summary (for logging/debugging)
// ============================================================================

export interface NodeActivitySummary {
  turnId: string;
  userId: string;
  sessionId: string;
  processingPath: 'FAST' | 'CORE' | 'DEEP';
  nodes: {
    [ConsciousnessNodes.SACRED_MIRROR]: SacredMirrorMetadata;
    [ConsciousnessNodes.CONSULTATION]: ConsultationMetadata | null;
    [ConsciousnessNodes.SUPERVISOR]: SupervisorMetadata;
  };
  outcome: {
    delivered: boolean;
    responseText: string;
    wasRegenerated: boolean;
    isGoldResponse: boolean;
  };
  performance: {
    totalMs: number;
    sacredMirrorMs: number;
    consultationMs: number | null;
    supervisorMs: number;
  };
  learning: {
    opportunitiesIdentified: number;
    patternsRecognized: string[];
    developmentalGuidance: string[];
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create empty/default metadata for nodes that didn't activate
 */
export function createInactiveConsultationMetadata(): ConsultationMetadata {
  return {
    node: ConsciousnessNodes.CONSULTATION,
    active: false,
    type: 'relational-enhancement',
    confidenceScore: 0,
    issuesDetected: 0,
    repairSuggested: false,
    sovereigntyPreserved: true,
    relationshipStrengthened: false,
    timeMs: 0,
  };
}

/**
 * Determine which nodes should be active for a given processing path
 */
export function getActiveNodesForPath(path: 'FAST' | 'CORE' | 'DEEP'): ConsciousnessNode[] {
  switch (path) {
    case 'FAST':
      return [ConsciousnessNodes.SACRED_MIRROR, ConsciousnessNodes.SUPERVISOR];
    case 'CORE':
      return [ConsciousnessNodes.SACRED_MIRROR, ConsciousnessNodes.SUPERVISOR];
    case 'DEEP':
      return [
        ConsciousnessNodes.SACRED_MIRROR,
        ConsciousnessNodes.CONSULTATION,
        ConsciousnessNodes.SUPERVISOR,
      ];
    default:
      return [ConsciousnessNodes.SACRED_MIRROR, ConsciousnessNodes.SUPERVISOR];
  }
}

/**
 * Log three-node activity in a readable format
 */
export function logNodeActivity(summary: NodeActivitySummary): void {
  const { processingPath, nodes, outcome, performance } = summary;

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`🧠 THREE-NODE ARCHITECTURE - ${processingPath} PATH`);
  console.log('═══════════════════════════════════════════════════════');

  // Sacred Mirror
  const sm = nodes[ConsciousnessNodes.SACRED_MIRROR];
  console.log(`\n🌊 SACRED MIRROR (${sm.timeMs}ms)`);
  console.log(`   Style: ${sm.style}`);
  console.log(`   Depth: ${sm.depth}`);
  console.log(`   Entry Point: ${sm.entryPoint}`);

  // Consultation (if active)
  const consult = nodes[ConsciousnessNodes.CONSULTATION];
  if (consult?.active) {
    console.log(`\n🧠 CONSULTATION (${consult.timeMs}ms)`);
    console.log(`   Type: ${consult.type}`);
    console.log(`   Confidence: ${(consult.confidenceScore * 100).toFixed(0)}%`);
    console.log(`   Issues Detected: ${consult.issuesDetected}`);
    console.log(`   Sovereignty Preserved: ${consult.sovereigntyPreserved ? '✓' : '✗'}`);
    if (consult.guidance) {
      console.log(`   Guidance: ${consult.guidance}`);
    }
  }

  // Supervisor
  const sup = nodes[ConsciousnessNodes.SUPERVISOR];
  console.log(`\n🛡️ SUPERVISOR (${sup.timeMs}ms)`);
  console.log(`   Decision: ${sup.decision}`);
  console.log(`   Gold Response: ${sup.isGold ? '✓' : '✗'}`);
  console.log(`   Feedback Items: ${sup.feedbackCount}`);
  if (sup.learningOpportunity) {
    console.log(`   Learning: ${sup.learningOpportunity}`);
  }

  // Outcome
  console.log(`\n📊 OUTCOME`);
  console.log(`   Delivered: ${outcome.delivered ? '✓' : '✗'}`);
  console.log(`   Regenerated: ${outcome.wasRegenerated ? '✓' : '✗'}`);
  console.log(`   Total Time: ${performance.totalMs}ms`);

  console.log('═══════════════════════════════════════════════════════\n');
}

/**
 * Sovereignty check: Ensure nodes are educating, not restricting
 */
export function validateNodeSovereignty(metadata: ThreeNodeMetadata): {
  sovereigntyPreserved: boolean;
  concerns: string[];
} {
  const concerns: string[] = [];

  // Check Consultation sovereignty
  if (metadata.consultation?.active) {
    if (!metadata.consultation.sovereigntyPreserved) {
      concerns.push('Consultation may have overridden MAIA\'s authentic voice');
    }
  }

  // Check Supervisor block rate (should be very rare)
  if (metadata.supervisor.decision === 'BLOCK') {
    // Log for review - blocks should be < 0.1%
    concerns.push('Supervisor blocked response - verify genuine harm risk');
  }

  // Check for excessive regeneration
  if (metadata.supervisor.regenerated && metadata.supervisor.feedbackCount > 5) {
    concerns.push('High feedback count may indicate over-correction');
  }

  return {
    sovereigntyPreserved: concerns.length === 0,
    concerns,
  };
}

// ============================================================================
// Export all types and helpers
// ============================================================================

export default {
  ConsciousnessNodes,
  createInactiveConsultationMetadata,
  getActiveNodesForPath,
  logNodeActivity,
  validateNodeSovereignty,
};
