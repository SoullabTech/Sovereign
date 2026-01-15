/**
 * Framing Governance Configuration
 *
 * Defines the "constitutional law" of the AIN committee:
 * - Base priors (qualified authority by domain)
 * - Min/max bounds (no voice silenced, no voice monopolizes)
 * - Domain match signals (when to boost a framing's prior)
 *
 * Philosophy: "rightful weighting + protected minority voice"
 * Not flattening, but bounded hierarchy.
 */

export interface FramingGovernance {
  /** Base credibility prior (0-1). Higher = more weight by default */
  basePrior: number;
  /** Minimum share of synthesis attention (never silenced) */
  minShare: number;
  /** Maximum share (never monopolizes) */
  maxShare: number;
  /** Role in synthesis: how to interpret this framing's contribution */
  role: 'elder' | 'counselor' | 'critic' | 'poet' | 'trickster';
  /** Keywords/topics that boost this framing's prior */
  domainSignals?: string[];
}

/**
 * Default governance profile for AIN framings
 *
 * Council structure:
 * - Elders: High authority on matched domains, shape primary recommendations
 * - Counselors: Moderate authority, provide supporting structure
 * - Critics: Always get voice, surface risks and blind spots
 * - Poets: Add meaning/depth, don't steer primary direction
 * - Tricksters: Disrupt assumptions, prevent groupthink
 */
export const framingGovernance: Record<string, FramingGovernance> = {
  // === FOUNDATIONAL ===
  'first-principles': {
    basePrior: 0.7,
    minShare: 0.08,
    maxShare: 0.35,
    role: 'counselor',
    domainSignals: ['axiom', 'fundamental', 'truth', 'foundation', 'core', 'essence'],
  },
  'systems-thinking': {
    basePrior: 0.7,
    minShare: 0.08,
    maxShare: 0.35,
    role: 'counselor',
    domainSignals: ['system', 'feedback', 'emergence', 'interconnect', 'complexity', 'loop'],
  },
  'practical-engineering': {
    basePrior: 0.8,
    minShare: 0.10,
    maxShare: 0.40,
    role: 'elder',
    domainSignals: ['build', 'implement', 'code', 'architecture', 'deploy', 'technical', 'docker', 'api'],
  },

  // === HUMAN-CENTERED ===
  'user-experience': {
    basePrior: 0.7,
    minShare: 0.08,
    maxShare: 0.35,
    role: 'counselor',
    domainSignals: ['user', 'experience', 'journey', 'friction', 'interface', 'usability'],
  },
  'phenomenology': {
    basePrior: 0.5,
    minShare: 0.05,
    maxShare: 0.25,
    role: 'poet',
    domainSignals: ['experience', 'embodiment', 'meaning', 'felt', 'sense', 'perception'],
  },
  'parenting': {
    basePrior: 0.6,
    minShare: 0.06,
    maxShare: 0.30,
    role: 'counselor',
    domainSignals: ['child', 'parent', 'nurture', 'growth', 'boundary', 'development', 'family'],
  },

  // === STRATEGIC ===
  'strategic-vision': {
    basePrior: 0.75,
    minShare: 0.08,
    maxShare: 0.38,
    role: 'elder',
    domainSignals: ['strategy', 'vision', 'long-term', 'path', 'direction', 'roadmap', 'future'],
  },
  'governance-incentives': {
    basePrior: 0.65,
    minShare: 0.10,
    maxShare: 0.30,
    role: 'critic',
    domainSignals: ['power', 'incentive', 'governance', 'control', 'policy', 'failure'],
  },
  'risk-reliability': {
    basePrior: 0.8,
    minShare: 0.12,
    maxShare: 0.35,
    role: 'critic',
    domainSignals: ['risk', 'safety', 'reliability', 'fail', 'fragile', 'danger', 'harm'],
  },

  // === THEORETICAL ===
  'kauffman-emergence': {
    basePrior: 0.5,
    minShare: 0.05,
    maxShare: 0.25,
    role: 'poet',
    domainSignals: ['emergence', 'adjacent possible', 'novelty', 'phase transition', 'complexity'],
  },
  'jung-archetypal': {
    basePrior: 0.5,
    minShare: 0.05,
    maxShare: 0.25,
    role: 'poet',
    domainSignals: ['archetype', 'shadow', 'symbol', 'unconscious', 'dream', 'myth', 'psyche'],
  },
  'bateson-meta-learning': {
    basePrior: 0.45,
    minShare: 0.05,
    maxShare: 0.20,
    role: 'trickster',
    domainSignals: ['meta', 'paradox', 'context', 'learning', 'pattern', 'double-bind'],
  },

  // === DOMAIN-SPECIFIC ===
  'ethics': {
    basePrior: 0.85,
    minShare: 0.12,
    maxShare: 0.40,
    role: 'elder',
    domainSignals: ['ethics', 'moral', 'value', 'harm', 'consent', 'right', 'wrong', 'responsibility'],
  },
  'relationships': {
    basePrior: 0.7,
    minShare: 0.08,
    maxShare: 0.35,
    role: 'counselor',
    domainSignals: ['relationship', 'connection', 'attachment', 'rupture', 'repair', 'trust'],
  },
  'creativity': {
    basePrior: 0.5,
    minShare: 0.05,
    maxShare: 0.25,
    role: 'poet',
    domainSignals: ['creative', 'art', 'flow', 'block', 'inspiration', 'expression'],
  },
  'grief': {
    basePrior: 0.65,
    minShare: 0.08,
    maxShare: 0.35,
    role: 'counselor',
    domainSignals: ['grief', 'loss', 'death', 'transition', 'mourning', 'letting go'],
  },
};

/**
 * Get governance config for a framing (with fallback defaults)
 */
export function getFramingGovernance(framingId: string): FramingGovernance {
  return framingGovernance[framingId] ?? {
    basePrior: 0.5,
    minShare: 0.05,
    maxShare: 0.30,
    role: 'counselor',
  };
}

/**
 * Compute context-adjusted prior based on question keywords
 *
 * Boosts prior when question matches framing's domain signals
 */
export function computeContextPrior(
  framingId: string,
  question: string
): number {
  const gov = getFramingGovernance(framingId);
  const signals = gov.domainSignals ?? [];

  if (signals.length === 0) {
    return gov.basePrior;
  }

  const questionLower = question.toLowerCase();
  const matchCount = signals.filter(s => questionLower.includes(s.toLowerCase())).length;

  // Boost prior based on signal matches (up to 20% boost)
  const boost = Math.min(matchCount * 0.05, 0.20);
  return Math.min(gov.basePrior + boost, 1.0);
}

/**
 * Apply min/max bounds and renormalize weights
 *
 * Ensures no voice is silenced and no voice monopolizes
 */
export function applyGovernanceBounds(
  weights: Record<string, number>
): Record<string, number> {
  const framingIds = Object.keys(weights);
  if (framingIds.length === 0) return weights;

  // First pass: apply bounds
  const bounded: Record<string, number> = {};
  for (const id of framingIds) {
    const gov = getFramingGovernance(id);
    const raw = weights[id] ?? 0;
    bounded[id] = Math.max(gov.minShare, Math.min(raw, gov.maxShare));
  }

  // Renormalize to sum to 1
  const total = Object.values(bounded).reduce((a, b) => a + b, 0);
  if (total <= 0) return weights;

  const normalized: Record<string, number> = {};
  for (const id of framingIds) {
    normalized[id] = bounded[id] / total;
  }

  return normalized;
}

/**
 * Get role-based synthesis guidance
 *
 * Returns instructions for how to interpret each role in synthesis
 */
export function getRoleSynthesisGuidance(): string {
  return `
When synthesizing framing responses, respect their roles:
- **Elders** (high-weight, domain experts): Shape primary structure and recommendations
- **Counselors** (moderate-weight): Provide supporting insights and context
- **Critics** (guaranteed voice): Surface risks, blind spots, and failure modes
- **Poets** (meaning-makers): Add depth, symbolism, and broader meaning
- **Tricksters** (disruptors): Challenge assumptions, prevent groupthink

Use low-weight framings primarily to surface tensions and edge cases, not to derail the main arc.
`.trim();
}
