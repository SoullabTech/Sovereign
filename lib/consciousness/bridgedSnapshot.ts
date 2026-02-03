/**
 * BRIDGED SNAPSHOT: The Integration Point Between Spiral Core and Wu Xing
 *
 * This is where the two elemental systems meet and inform each other.
 * The bridge enables:
 * 1. Spiral phases to suggest Wu Xing interventions
 * 2. Wu Xing imbalances to suggest Care Mode switches
 * 3. Combined signals to drive intelligent IntegrityCheck suggestions
 *
 * Architecture: Both snapshots are computed deterministically, then bridged.
 * The bridge output feeds into prompt assembly and IntegrityCheck.
 */

import type { WuXingSnapshot } from './wuxingSnapshot';
import type { SpiralogicElement, RefinementPhase } from './spiralogic-12-phases';
import {
  WuXingElement,
  wuxingToSpiralogic,
  spiralogicToWuxing,
  getSpirit,
  ELEMENT_BRIDGE,
  type BalanceAnalysis
} from './wuxingBridge';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Simplified Spiral snapshot input for bridging
 * Uses the actual property names from SpiralSnapshot in spiralCore.ts
 */
export interface SpiralSnapshotInput {
  primaryPhase: {
    phase: {
      element: SpiralogicElement;
      name: string;
      refinement: RefinementPhase;
    };
    confidence: number;
  };
  state: {
    nervous_system: 'regulated' | 'sympathetic' | 'dorsal' | 'mixed';
    resource_level: 'depleted' | 'low' | 'adequate' | 'resourced';
    integration_need: 'rest' | 'action' | 'expression' | 'meaning' | 'connection' | 'boundary';
  };
}

export interface BridgedSignal {
  type: 'alignment' | 'tension' | 'opportunity' | 'warning';
  spiralSource: string;
  wuxingSource: string;
  description: string;
  confidence: number;
}

export interface RiskFlag {
  id: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}

export interface StabilizerSuggestion {
  element: WuXingElement | SpiralogicElement;
  action: string;
  rationale: string;
  practiceType: 'somatic' | 'cognitive' | 'relational' | 'spiritual' | 'practical';
}

export interface LensCandidate {
  framework: string;
  confidence: number;
  rationale: string;
}

export interface BridgedSnapshot {
  /** Timestamp of computation */
  computedAt: Date;

  /** Dominant bridge signals */
  dominantSignals: BridgedSignal[];

  /** Risk flags for escalation/dysregulation */
  riskFlags: RiskFlag[];

  /** Recommended stabilizers from both systems */
  stabilizers: StabilizerSuggestion[];

  /** Recommended Care Mode candidates */
  lensCandidates: LensCandidate[];

  /** Summary for prompt injection */
  summaryLine: string;

  /** Whether to suggest TCM/Chinese framework */
  suggestTcm: boolean;

  /** Whether to offer I Ching oracle */
  offerIching: boolean;

  /** Combined element state for quick reference */
  combinedState: {
    spiralElement: SpiralogicElement;
    spiralPhase: string;
    spiralConfidence: number;
    wuxingDominant: WuXingElement[];
    wuxingDeficient: WuXingElement[];
    wuxingBalance: number;
    alignment: 'aligned' | 'complementary' | 'tensioned' | 'unknown';
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ELEMENT ALIGNMENT ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

type AlignmentType = 'aligned' | 'complementary' | 'tensioned' | 'unknown';

/**
 * Analyze alignment between Spiral element and Wu Xing state
 */
function analyzeElementAlignment(
  spiralElement: SpiralogicElement,
  wuxingDominant: WuXingElement[],
  wuxingDeficient: WuXingElement[]
): { alignment: AlignmentType; description: string } {
  const correspondingWuxing = spiralogicToWuxing(spiralElement);

  // Check if Wu Xing dominant aligns with Spiral element
  const hasAlignment = correspondingWuxing.some(wx => wuxingDominant.includes(wx));
  const hasDeficiency = correspondingWuxing.some(wx => wuxingDeficient.includes(wx));

  if (hasAlignment && !hasDeficiency) {
    return {
      alignment: 'aligned',
      description: `Spiral ${spiralElement} supported by Wu Xing ${wuxingDominant.join('/')}`
    };
  }

  if (hasDeficiency) {
    return {
      alignment: 'tensioned',
      description: `Spiral ${spiralElement} phase may be challenged by ${correspondingWuxing.join('/')} deficiency`
    };
  }

  // Check for complementary relationships
  // Fire spiral + Water excess = creative tension
  // Earth spiral + Metal dominant = grounded refinement
  if (spiralElement === 'fire' && wuxingDominant.includes('water')) {
    return {
      alignment: 'complementary',
      description: 'Fire phase with Water support - depth informing passion'
    };
  }

  if (spiralElement === 'earth' && (wuxingDominant.includes('metal') || wuxingDominant.includes('wood'))) {
    return {
      alignment: 'complementary',
      description: 'Earth phase with structural support - stable foundation for growth'
    };
  }

  if (spiralElement === 'water' && wuxingDominant.includes('fire')) {
    return {
      alignment: 'complementary',
      description: 'Water phase with Fire activation - consciousness illuminating depth'
    };
  }

  return {
    alignment: 'unknown',
    description: 'Elemental relationship requires exploration'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// RISK FLAG DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectRiskFlags(
  spiralSnapshot: SpiralSnapshotInput,
  wuxingSnapshot: WuXingSnapshot
): RiskFlag[] {
  const flags: RiskFlag[] = [];

  // Risk: Fire excess + sympathetic activation
  if (
    wuxingSnapshot.analysis.excessive.includes('fire') &&
    spiralSnapshot.state.nervous_system === 'sympathetic'
  ) {
    flags.push({
      id: 'fire-overdrive',
      severity: 'high',
      description: 'Fire excess combined with sympathetic activation - risk of burnout or agitation',
      mitigation: 'Prioritize cooling, grounding, and Water/Metal nourishment'
    });
  }

  // Risk: Water depletion + low resources
  if (
    wuxingSnapshot.analysis.needsSupport.includes('water') &&
    spiralSnapshot.state.resource_level === 'depleted'
  ) {
    flags.push({
      id: 'water-depletion',
      severity: 'high',
      description: 'Water/Kidney essence depleted - foundational energy at risk',
      mitigation: 'Rest, conservation, bone broth, avoid overwork'
    });
  }

  // Risk: Wood stagnation + high integration need (expression blocked)
  if (
    wuxingSnapshot.analysis.needsSupport.includes('wood') &&
    spiralSnapshot.state.integration_need === 'expression'
  ) {
    flags.push({
      id: 'wood-stagnation',
      severity: 'medium',
      description: 'Wood/Liver Qi stagnation - blocked expression and planning',
      mitigation: 'Movement, creative expression, anger work, sour foods'
    });
  }

  // Risk: Earth deficiency + dorsal (collapse)
  if (
    wuxingSnapshot.analysis.needsSupport.includes('earth') &&
    spiralSnapshot.state.nervous_system === 'dorsal'
  ) {
    flags.push({
      id: 'earth-collapse',
      severity: 'medium',
      description: 'Earth/Spleen deficiency with low tone - may feel ungrounded, scattered',
      mitigation: 'Routine, warm foods, gentle structure, singing'
    });
  }

  // Risk: Severe imbalance in any system
  if (wuxingSnapshot.analysis.state === 'severe_imbalance') {
    flags.push({
      id: 'severe-imbalance',
      severity: 'high',
      description: 'Significant elemental imbalance detected',
      mitigation: 'Consider constitutional support and longer-term balancing practices'
    });
  }

  return flags;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STABILIZER GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

function generateStabilizers(
  spiralSnapshot: SpiralSnapshotInput,
  wuxingSnapshot: WuXingSnapshot
): StabilizerSuggestion[] {
  const stabilizers: StabilizerSuggestion[] = [];

  // Wu Xing derived stabilizers
  for (const deficient of wuxingSnapshot.analysis.needsSupport) {
    const bridge = ELEMENT_BRIDGE[deficient];
    const spirit = getSpirit(deficient);

    stabilizers.push({
      element: deficient,
      action: `Nourish ${capitalize(deficient)} (${bridge.organ.yin})`,
      rationale: `${spirit.name} (${spirit.function.split(' - ')[1]}) needs support`,
      practiceType: deficient === 'fire' ? 'relational' :
                   deficient === 'earth' ? 'practical' :
                   deficient === 'metal' ? 'somatic' :
                   deficient === 'water' ? 'spiritual' : 'cognitive'
    });
  }

  // Nervous system stabilizers
  if (spiralSnapshot.state.nervous_system === 'sympathetic') {
    stabilizers.push({
      element: 'water',
      action: 'Cooling breath, slow exhale, grounding',
      rationale: 'Sympathetic activation needs parasympathetic support',
      practiceType: 'somatic'
    });
  }

  if (spiralSnapshot.state.nervous_system === 'dorsal') {
    stabilizers.push({
      element: 'fire',
      action: 'Gentle activation, warmth, connection',
      rationale: 'Dorsal shutdown needs gradual mobilization',
      practiceType: 'relational'
    });
  }

  // Resource stabilizers
  if (spiralSnapshot.state.resource_level === 'depleted') {
    stabilizers.push({
      element: 'earth',
      action: 'Basic needs first: food, rest, comfort',
      rationale: 'Depleted resources need Earth nourishment before processing',
      practiceType: 'practical'
    });
  }

  return stabilizers.slice(0, 4); // Max 4 stabilizers
}

// ═══════════════════════════════════════════════════════════════════════════════
// LENS CANDIDATE GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

function generateLensCandidates(
  spiralSnapshot: SpiralSnapshotInput,
  wuxingSnapshot: WuXingSnapshot,
  riskFlags: RiskFlag[]
): LensCandidate[] {
  const candidates: LensCandidate[] = [];

  // TCM lens strongly suggested when Wu Xing analysis is rich
  if (wuxingSnapshot.constitution || wuxingSnapshot.analysis.state !== 'balanced') {
    candidates.push({
      framework: 'tcm',
      confidence: wuxingSnapshot.constitution ? 0.85 : 0.6,
      rationale: wuxingSnapshot.constitution
        ? 'Member has BaZi profile - TCM lens can leverage constitutional understanding'
        : 'Wu Xing imbalance detected - TCM lens offers balancing framework'
    });
  }

  // Somatic lens for nervous system / body signals
  if (
    spiralSnapshot.state.nervous_system !== 'regulated' ||
    wuxingSnapshot.analysis.needsSupport.includes('metal') // Metal = breath, body
  ) {
    candidates.push({
      framework: 'somatic',
      confidence: 0.75,
      rationale: 'Body-based work indicated by nervous system state or Metal element need'
    });
  }

  // IFS for parts / integration work
  if (spiralSnapshot.state.integration_need === 'meaning' || spiralSnapshot.state.integration_need === 'connection') {
    candidates.push({
      framework: 'ifs',
      confidence: 0.7,
      rationale: 'Integration need suggests parts work could be valuable'
    });
  }

  // Jungian/Depth for Fire phases (consciousness, transformation)
  if (spiralSnapshot.primaryPhase.phase.element === 'fire') {
    candidates.push({
      framework: 'jungian',
      confidence: 0.65,
      rationale: 'Fire phase work benefits from depth psychological framing'
    });
  }

  // Existential for Water phases (meaning, depth)
  if (spiralSnapshot.primaryPhase.phase.element === 'water') {
    candidates.push({
      framework: 'existential',
      confidence: 0.65,
      rationale: 'Water phase invites existential exploration'
    });
  }

  // Sort by confidence
  return candidates.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN BRIDGE FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build the bridged snapshot from Spiral + Wu Xing snapshots
 */
export function buildBridgedSnapshot(
  spiralSnapshot: SpiralSnapshotInput,
  wuxingSnapshot: WuXingSnapshot
): BridgedSnapshot {
  const now = new Date();

  // Analyze element alignment
  const alignment = analyzeElementAlignment(
    spiralSnapshot.primaryPhase.phase.element,
    wuxingSnapshot.constitution?.dominant || wuxingSnapshot.moment.momentDominant,
    wuxingSnapshot.constitution?.deficient || []
  );

  // Build dominant signals
  const dominantSignals: BridgedSignal[] = [];

  // Signal: Phase-Element relationship
  dominantSignals.push({
    type: alignment.alignment === 'aligned' ? 'alignment' :
          alignment.alignment === 'complementary' ? 'opportunity' :
          alignment.alignment === 'tensioned' ? 'tension' : 'opportunity',
    spiralSource: `${spiralSnapshot.primaryPhase.phase.name} (${spiralSnapshot.primaryPhase.phase.element})`,
    wuxingSource: wuxingSnapshot.constitution
      ? `Day Master: ${capitalize(wuxingSnapshot.constitution.dayMaster)}`
      : `Moment: ${wuxingSnapshot.moment.momentDominant.map(capitalize).join('/')}`,
    description: alignment.description,
    confidence: spiralSnapshot.primaryPhase.confidence *
                (wuxingSnapshot.constitution ? 0.9 : 0.6)
  });

  // Signal: Spirit-Phase resonance
  if (wuxingSnapshot.spiritFocus) {
    const spiritElement = wuxingSnapshot.spiritFocus.element;
    const spiralElement = spiralSnapshot.primaryPhase.phase.element;
    const spiritSpiral = wuxingToSpiralogic(spiritElement);

    if (spiritSpiral === spiralElement) {
      dominantSignals.push({
        type: 'alignment',
        spiralSource: `${spiralSnapshot.primaryPhase.phase.name} phase`,
        wuxingSource: `${wuxingSnapshot.spiritFocus.name} spirit (${capitalize(spiritElement)})`,
        description: `Spirit and Spiral phase aligned - deep work in ${spiralElement} domain possible`,
        confidence: 0.8
      });
    }
  }

  // Detect risk flags
  const riskFlags = detectRiskFlags(spiralSnapshot, wuxingSnapshot);

  // Generate stabilizers
  const stabilizers = generateStabilizers(spiralSnapshot, wuxingSnapshot);

  // Generate lens candidates
  const lensCandidates = generateLensCandidates(spiralSnapshot, wuxingSnapshot, riskFlags);

  // Build summary line
  const summaryParts: string[] = [];
  summaryParts.push(`Spiral: ${spiralSnapshot.primaryPhase.phase.name} (${spiralSnapshot.primaryPhase.phase.element})`);

  if (wuxingSnapshot.constitution) {
    summaryParts.push(`BaZi: ${capitalize(wuxingSnapshot.constitution.dayMaster)} day master`);
  }

  summaryParts.push(`Balance: ${wuxingSnapshot.analysis.state.replace('_', ' ')}`);

  if (riskFlags.length > 0) {
    summaryParts.push(`Flags: ${riskFlags.length}`);
  }

  const summaryLine = summaryParts.join(' | ');

  // Determine if TCM should be suggested
  const suggestTcm = lensCandidates.some(c => c.framework === 'tcm' && c.confidence > 0.7);

  // Determine if I Ching should be offered
  // Offer when: user in transition, seeking guidance, or explicitly spiritual content
  const offerIching =
    spiralSnapshot.primaryPhase.phase.refinement === 'emergence' || // New phase = uncertainty
    spiralSnapshot.state.integration_need === 'meaning' || // Seeking synthesis
    wuxingSnapshot.moment.momentDominant.includes('water'); // Water moment = receptive to oracle

  return {
    computedAt: now,
    dominantSignals,
    riskFlags,
    stabilizers,
    lensCandidates,
    summaryLine,
    suggestTcm,
    offerIching,
    combinedState: {
      spiralElement: spiralSnapshot.primaryPhase.phase.element,
      spiralPhase: spiralSnapshot.primaryPhase.phase.name,
      spiralConfidence: spiralSnapshot.primaryPhase.confidence,
      wuxingDominant: wuxingSnapshot.constitution?.dominant || wuxingSnapshot.moment.momentDominant,
      wuxingDeficient: wuxingSnapshot.constitution?.deficient || [],
      wuxingBalance: wuxingSnapshot.analysis.score,
      alignment: alignment.alignment
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT ADDENDUM GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate prompt addendum for bridged awareness
 */
export function generateBridgePromptAddendum(bridged: BridgedSnapshot): string {
  const lines: string[] = [];

  lines.push('## BRIDGED SNAPSHOT (Spiral × Wu Xing)');
  lines.push('');
  lines.push(`**Summary:** ${bridged.summaryLine}`);
  lines.push(`**Alignment:** ${formatAlignment(bridged.combinedState.alignment)}`);
  lines.push('');

  // Dominant signals
  if (bridged.dominantSignals.length > 0) {
    lines.push('**Key Signals:**');
    bridged.dominantSignals.forEach(signal => {
      const icon = signal.type === 'alignment' ? '✓' :
                   signal.type === 'opportunity' ? '○' :
                   signal.type === 'tension' ? '△' : '!';
      lines.push(`  ${icon} ${signal.description}`);
    });
    lines.push('');
  }

  // Risk flags (if any)
  if (bridged.riskFlags.length > 0) {
    lines.push('**Risk Flags:**');
    bridged.riskFlags.forEach(flag => {
      const severity = flag.severity === 'high' ? '⚠️' : flag.severity === 'medium' ? '!' : '·';
      lines.push(`  ${severity} ${flag.description}`);
      lines.push(`    → ${flag.mitigation}`);
    });
    lines.push('');
  }

  // Stabilizers
  if (bridged.stabilizers.length > 0) {
    lines.push('**Stabilizers:**');
    bridged.stabilizers.slice(0, 3).forEach(s => {
      lines.push(`  - ${s.action} (${s.rationale})`);
    });
    lines.push('');
  }

  // Lens suggestions
  if (bridged.lensCandidates.length > 0) {
    const topLens = bridged.lensCandidates[0];
    lines.push(`**Lens Affinity:** ${topLens.framework} (${(topLens.confidence * 100).toFixed(0)}%) — ${topLens.rationale}`);
    lines.push('');
  }

  // Oracle offer hint
  if (bridged.offerIching) {
    lines.push('**Oracle Available:** I Ching casting may be welcomed (emergence phase / meaning need / Water moment)');
    lines.push('');
  }

  return lines.join('\n');
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatAlignment(alignment: BridgedSnapshot['combinedState']['alignment']): string {
  switch (alignment) {
    case 'aligned': return 'Aligned — Spiral and Wu Xing in harmony';
    case 'complementary': return 'Complementary — Systems support each other';
    case 'tensioned': return 'Tensioned — Creative friction present';
    case 'unknown': return 'Emergent — Relationship unfolding';
    default: return alignment;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  buildBridgedSnapshot,
  generateBridgePromptAddendum
};
