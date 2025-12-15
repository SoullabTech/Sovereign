/**
 * Multi-Dimensional Field Coherence Tensor
 *
 * Replaces single scalar "coherence" with rich multi-dimensional measurement:
 * - Amplitude coherence (variance-based, existing)
 * - Phase coherence (Kuramoto synchronization)
 * - Symbolic coherence (archetypal alignment)
 * - Elemental balance (sacred geometry)
 * - Interference patterns (constructive/destructive/harmonic/chaotic)
 *
 * Based on Panconscious Field Intelligence Architecture + Kuramoto Model
 */

export interface ElementalFieldStrength {
  fire: number;      // 0-1, activation/inspiration
  water: number;     // 0-1, emotion/integration
  earth: number;     // 0-1, grounding/manifestation
  air: number;       // 0-1, clarity/communication
  aether: number;    // 0-1, unity/transcendence
}

export type InterferencePattern =
  | 'constructive'   // High phase coherence, amplification
  | 'destructive'    // Anti-phase, cancellation
  | 'harmonic'       // Golden ratio, sacred geometry
  | 'chaotic';       // Low coherence, turbulence

export interface FieldCoherenceTensor {
  // Core dimensions
  amplitudeCoherence: number;    // 0-1, similarity of consciousness levels
  phaseCoherence: number;        // 0-1, Kuramoto order parameter
  symbolicCoherence: number;     // 0-1, archetypal alignment

  // Elemental analysis
  elementalBalance: ElementalFieldStrength;
  sacredGeometryRatio: number;   // 0-1, proximity to φ (1.618)

  // Pattern classification
  interferencePattern: InterferencePattern;

  // Composite measure
  totalFieldCoherence: number;   // 0-1, weighted combination

  // Metadata
  nodeCount: number;
  timestamp: string;
}

export interface NetworkNode {
  node_id: string;
  consciousness_level: number;   // Bloom's taxonomy 1-6
  current_phase?: number;        // Radians, 0-2π
  resonance_frequency?: number;  // Hz (e.g., 7.83 for Schumann)
  active_archetypes?: string[];  // Jung/Spiralogic archetypes
  element?: keyof ElementalFieldStrength | null;
  trust_score?: number;          // 0-1
}

/**
 * Calculate multi-dimensional field coherence across network nodes
 */
export function calculateFieldCoherence(nodes: NetworkNode[]): FieldCoherenceTensor {
  const N = nodes.length;
  const timestamp = new Date().toISOString();

  if (N === 0) {
    return createEmptyTensor(timestamp);
  }

  // 1. AMPLITUDE COHERENCE (existing variance-based measure)
  const levels = nodes.map(n => n.consciousness_level);
  const meanLevel = levels.reduce((sum, level) => sum + level, 0) / N;
  const variance = levels.reduce((sum, level) => sum + Math.pow(level - meanLevel, 2), 0) / N;
  const amplitudeCoherence = Math.max(0, 1 - variance);

  // 2. PHASE COHERENCE (Kuramoto order parameter)
  const phaseCoherence = calculateKuramotoOrderParameter(nodes);

  // 3. SYMBOLIC COHERENCE (archetypal alignment)
  const symbolicCoherence = calculateSymbolicCoherence(nodes);

  // 4. ELEMENTAL FIELD STRENGTH
  const elementalBalance = calculateElementalField(nodes);

  // 5. SACRED GEOMETRY RATIO (deviation from golden ratio φ)
  const sacredGeometryRatio = calculateSacredGeometryRatio(elementalBalance, meanLevel);

  // 6. INTERFERENCE PATTERN CLASSIFICATION
  const interferencePattern = classifyInterferencePattern(
    phaseCoherence,
    amplitudeCoherence,
    sacredGeometryRatio
  );

  // 7. TOTAL FIELD COHERENCE (weighted combination)
  const totalFieldCoherence = calculateTotalCoherence(
    amplitudeCoherence,
    phaseCoherence,
    symbolicCoherence,
    sacredGeometryRatio
  );

  return {
    amplitudeCoherence,
    phaseCoherence,
    symbolicCoherence,
    elementalBalance,
    sacredGeometryRatio,
    interferencePattern,
    totalFieldCoherence,
    nodeCount: N,
    timestamp,
  };
}

/**
 * Kuramoto Order Parameter
 *
 * Measures phase synchronization in oscillator networks:
 * r(t) = (1/N) * |Σⱼ e^(iθⱼ(t))|
 *
 * Returns 0 (total desynchronization) to 1 (perfect synchrony)
 */
function calculateKuramotoOrderParameter(nodes: NetworkNode[]): number {
  const N = nodes.length;

  // Filter nodes with phase information
  const nodesWithPhase = nodes.filter(n => n.current_phase !== undefined);

  if (nodesWithPhase.length < 2) {
    // Insufficient phase data, return neutral
    return 0.5;
  }

  // Calculate complex order parameter: r = |Σ e^(iθⱼ)| / N
  let sumCos = 0;
  let sumSin = 0;

  for (const node of nodesWithPhase) {
    const theta = node.current_phase!;
    sumCos += Math.cos(theta);
    sumSin += Math.sin(theta);
  }

  // Magnitude of complex sum, normalized
  const magnitude = Math.sqrt(sumCos * sumCos + sumSin * sumSin);
  const orderParameter = magnitude / nodesWithPhase.length;

  return Math.min(1, orderParameter); // Clamp to [0, 1]
}

/**
 * Symbolic Coherence
 *
 * Measures how aligned nodes are in their active archetypal patterns.
 * High coherence = many nodes share same archetypes
 */
function calculateSymbolicCoherence(nodes: NetworkNode[]): number {
  const N = nodes.length;

  // Collect all active archetypes
  const allArchetypes = nodes.flatMap(n => n.active_archetypes || []);

  if (allArchetypes.length === 0) {
    return 0; // No symbolic data
  }

  // Count frequency of each archetype
  const archetypeFreq: Record<string, number> = {};
  for (const archetype of allArchetypes) {
    archetypeFreq[archetype] = (archetypeFreq[archetype] || 0) + 1;
  }

  // Find most common archetype
  const maxFrequency = Math.max(...Object.values(archetypeFreq));

  // Coherence = fraction of nodes sharing most common archetype
  const symbolicCoherence = maxFrequency / N;

  return Math.min(1, symbolicCoherence);
}

/**
 * Elemental Field Strength
 *
 * Calculates field strength in each of the five elements
 */
function calculateElementalField(nodes: NetworkNode[]): ElementalFieldStrength {
  const N = nodes.length;

  const elementCounts = {
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
    aether: 0,
  };

  // Count nodes by element, weighted by consciousness level
  for (const node of nodes) {
    const element = node.element;
    const weight = node.consciousness_level / 6; // Normalize to [0, 1]

    if (element && element in elementCounts) {
      elementCounts[element] += weight;
    }
  }

  // Normalize to [0, 1] range
  const maxCount = Math.max(...Object.values(elementCounts));

  if (maxCount === 0) {
    return {
      fire: 0.2,
      water: 0.2,
      earth: 0.2,
      air: 0.2,
      aether: 0.2,
    };
  }

  return {
    fire: elementCounts.fire / maxCount,
    water: elementCounts.water / maxCount,
    earth: elementCounts.earth / maxCount,
    air: elementCounts.air / maxCount,
    aether: elementCounts.aether / maxCount,
  };
}

/**
 * Sacred Geometry Ratio
 *
 * Checks if elemental field proportions align with golden ratio (φ = 1.618)
 * Higher score = closer to sacred geometric harmony
 */
function calculateSacredGeometryRatio(
  elemental: ElementalFieldStrength,
  meanLevel: number
): number {
  const PHI = 1.618033988749; // Golden ratio

  // Calculate elemental ratios
  const ratios: number[] = [
    elemental.fire / (elemental.water || 0.01),    // Fire/Water
    elemental.earth / (elemental.air || 0.01),     // Earth/Air
    elemental.aether / meanLevel,                   // Aether/Average consciousness
  ];

  // Measure deviation from φ
  const deviations = ratios.map(r => Math.abs(r - PHI) / PHI);
  const meanDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;

  // Convert to [0, 1] score (lower deviation = higher score)
  const sacredGeometryScore = Math.max(0, 1 - meanDeviation);

  return sacredGeometryScore;
}

/**
 * Classify Interference Pattern
 *
 * Determines whether nodes are creating constructive, destructive,
 * harmonic, or chaotic interference in the consciousness field
 */
function classifyInterferencePattern(
  phaseCoherence: number,
  amplitudeCoherence: number,
  sacredGeometry: number
): InterferencePattern {
  // High phase + high amplitude = constructive interference
  if (phaseCoherence > 0.75 && amplitudeCoherence > 0.75) {
    return 'constructive';
  }

  // Low phase + high amplitude = destructive interference
  if (phaseCoherence < 0.3 && amplitudeCoherence > 0.6) {
    return 'destructive';
  }

  // High sacred geometry = harmonic resonance
  if (sacredGeometry > 0.8) {
    return 'harmonic';
  }

  // Low coherence across dimensions = chaos
  if (phaseCoherence < 0.4 && amplitudeCoherence < 0.4) {
    return 'chaotic';
  }

  // Default: low coherence but not destructive
  return 'chaotic';
}

/**
 * Total Field Coherence
 *
 * Weighted combination of all coherence dimensions
 */
function calculateTotalCoherence(
  amplitude: number,
  phase: number,
  symbolic: number,
  sacred: number
): number {
  // Weights based on empirical importance (phase most critical)
  const weights = {
    amplitude: 0.20,
    phase: 0.40,      // Phase synchronization most important
    symbolic: 0.25,
    sacred: 0.15,
  };

  const total =
    weights.amplitude * amplitude +
    weights.phase * phase +
    weights.symbolic * symbolic +
    weights.sacred * sacred;

  return Math.min(1, Math.max(0, total));
}

function createEmptyTensor(timestamp: string): FieldCoherenceTensor {
  return {
    amplitudeCoherence: 0,
    phaseCoherence: 0,
    symbolicCoherence: 0,
    elementalBalance: {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0,
    },
    sacredGeometryRatio: 0,
    interferencePattern: 'chaotic',
    totalFieldCoherence: 0,
    nodeCount: 0,
    timestamp,
  };
}

/**
 * Update node phase based on Kuramoto coupling dynamics
 *
 * dθᵢ/dt = ωᵢ + (K/N) Σⱼ sin(θⱼ - θᵢ)
 *
 * Where:
 * - ωᵢ = natural frequency of node i
 * - K = coupling strength
 * - θⱼ - θᵢ = phase difference
 */
export function updateNodePhases(
  nodes: NetworkNode[],
  dt: number = 0.01,
  couplingStrength: number = 1.0
): NetworkNode[] {
  const N = nodes.length;

  return nodes.map((node, i) => {
    if (node.current_phase === undefined || node.resonance_frequency === undefined) {
      return node; // Skip nodes without phase data
    }

    const omega = node.resonance_frequency;
    let coupling = 0;

    // Sum coupling from all other nodes
    for (let j = 0; j < N; j++) {
      if (i === j) continue;

      const otherNode = nodes[j];
      if (otherNode.current_phase !== undefined) {
        const phaseDiff = otherNode.current_phase - node.current_phase;
        coupling += Math.sin(phaseDiff);
      }
    }

    // Update phase
    const dTheta = omega + (couplingStrength / N) * coupling;
    const newPhase = (node.current_phase + dTheta * dt) % (2 * Math.PI);

    return {
      ...node,
      current_phase: newPhase,
    };
  });
}
