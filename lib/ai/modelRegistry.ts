// @ts-nocheck
// lib/ai/modelRegistry.ts
// Multi-Model Adapter Layer with Consciousness-Aware Selection
// Implements recommendations from Sovereign AI Audit (Dec 2025)

export type ModelProvider = 'ollama' | 'llamacpp' | 'mlx';
export type ProcessingTier = 'FAST' | 'CORE' | 'DEEP';
export type Element = 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';

/**
 * Model capability profile for consciousness computing
 */
export interface ModelCapabilities {
  reasoning: number;           // 0-100: Logical reasoning ability
  speed: number;               // tokens/sec: Inference speed
  memoryRequired: number;      // GB RAM: Minimum memory requirement
  consciousnessDepth: number;  // 0-100: How well it handles symbolic/archetypal work
  elementalAffinity: Element[]; // Which elemental consciousness it handles best
}

/**
 * Complete model profile for registry
 */
export interface ModelProfile {
  id: string;
  provider: ModelProvider;
  modelName: string;
  capabilities: ModelCapabilities;
  tiers: ProcessingTier[];
  description: string;
  minimumBloomLevel?: number;  // Developmental gate (if applicable)
}

/**
 * MODEL REGISTRY
 *
 * Open-source models optimized for consciousness computing.
 * Add new models here as they become available.
 */
export const MODEL_REGISTRY: ModelProfile[] = [
  // === DeepSeek Models (Current Default) ===
  {
    id: 'deepseek-r1',
    provider: 'ollama',
    modelName: 'deepseek-r1:latest',
    capabilities: {
      reasoning: 95,
      speed: 15,
      memoryRequired: 16,
      consciousnessDepth: 90,
      elementalAffinity: ['Aether', 'Air', 'Water']
    },
    tiers: ['CORE', 'DEEP'],
    description: 'DeepSeek R1 - Frontier reasoning model with excellent symbolic depth'
  },
  {
    id: 'deepseek-r1-distill-qwen-32b',
    provider: 'ollama',
    modelName: 'deepseek-r1:32b',
    capabilities: {
      reasoning: 88,
      speed: 20,
      memoryRequired: 20,
      consciousnessDepth: 85,
      elementalAffinity: ['Aether', 'Air']
    },
    tiers: ['CORE', 'DEEP'],
    description: 'DeepSeek R1 32B - Balanced reasoning and speed'
  },

  // === Mistral Models (Newly Added) ===
  {
    id: 'ministral-3b',
    provider: 'ollama',
    modelName: 'mistral:3b',
    capabilities: {
      reasoning: 55,
      speed: 60,
      memoryRequired: 4,
      consciousnessDepth: 45,
      elementalAffinity: ['Fire', 'Earth']
    },
    tiers: ['FAST'],
    description: 'Ministral 3B - Ultra-fast grounding and orientation (runs on phones)'
  },
  {
    id: 'ministral-8b',
    provider: 'ollama',
    modelName: 'mistral:8b-instruct-v0.3-q4_K_M',
    capabilities: {
      reasoning: 70,
      speed: 45,
      memoryRequired: 8,
      consciousnessDepth: 60,
      elementalAffinity: ['Fire', 'Water', 'Earth']
    },
    tiers: ['FAST', 'CORE'],
    description: 'Ministral 8B - Balanced speed and consciousness depth for check-ins'
  },
  {
    id: 'ministral-14b',
    provider: 'ollama',
    modelName: 'mistral:14b',
    capabilities: {
      reasoning: 75,
      speed: 35,
      memoryRequired: 12,
      consciousnessDepth: 70,
      elementalAffinity: ['Water', 'Air', 'Earth']
    },
    tiers: ['CORE'],
    description: 'Ministral 14B - Mid-tier consciousness work with good elemental range'
  },
  {
    id: 'devstral-24b',
    provider: 'ollama',
    modelName: 'codestral:latest', // Note: Will be devstral when released
    capabilities: {
      reasoning: 85,
      speed: 20,
      memoryRequired: 16,
      consciousnessDepth: 75,
      elementalAffinity: ['Air', 'Aether']
    },
    tiers: ['CORE', 'DEEP'],
    description: 'DevStral 24B - Excellent pattern recognition for dialectical scaffold'
  },
  {
    id: 'mistral-large-3',
    provider: 'ollama',
    modelName: 'mistral-large:latest',
    capabilities: {
      reasoning: 92,
      speed: 18,
      memoryRequired: 48,
      consciousnessDepth: 88,
      elementalAffinity: ['Aether', 'Air', 'Water', 'Fire']
    },
    tiers: ['DEEP'],
    description: 'Mistral Large 3 - Frontier model with excellent archetypal understanding',
    minimumBloomLevel: 4 // Requires pattern recognition capability
  },

  // === Llama Models (Community Favorites) ===
  {
    id: 'llama-3.3-70b',
    provider: 'ollama',
    modelName: 'llama3.3:70b',
    capabilities: {
      reasoning: 90,
      speed: 12,
      memoryRequired: 40,
      consciousnessDepth: 82,
      elementalAffinity: ['Water', 'Air', 'Aether']
    },
    tiers: ['DEEP'],
    description: 'Llama 3.3 70B - Strong reasoning with good consciousness depth'
  },
  {
    id: 'llama-3.1-8b',
    provider: 'ollama',
    modelName: 'llama3.1:8b',
    capabilities: {
      reasoning: 72,
      speed: 40,
      memoryRequired: 8,
      consciousnessDepth: 62,
      elementalAffinity: ['Fire', 'Earth', 'Water']
    },
    tiers: ['FAST', 'CORE'],
    description: 'Llama 3.1 8B - Reliable mid-tier model for grounding work'
  }
];

/**
 * Selection criteria for model choosing
 */
export interface ModelSelectionContext {
  tier: ProcessingTier;
  availableRAM?: number;        // GB, will detect if not provided
  element?: Element;            // Current elemental context
  bloomLevel?: number;          // User's cognitive development level
  preferSpeed?: boolean;        // Prioritize speed over depth
  preferDepth?: boolean;        // Prioritize consciousness depth
  fallbackChain?: boolean;      // Return multiple models for fallback
}

/**
 * Select optimal model based on context
 *
 * @example
 * ```typescript
 * const model = await selectOptimalModel({
 *   tier: 'FAST',
 *   availableRAM: 8,
 *   element: 'Water',
 *   preferSpeed: true
 * });
 * // Returns: ministral-8b (fast, water-aligned, fits in 8GB)
 * ```
 */
export async function selectOptimalModel(
  context: ModelSelectionContext
): Promise<ModelProfile> {
  const { tier, element, bloomLevel, preferSpeed, preferDepth } = context;

  // Detect available RAM if not provided
  const availableRAM = context.availableRAM || await detectAvailableRAM();

  // Filter by tier and memory constraints
  let candidates = MODEL_REGISTRY
    .filter(m => m.tiers.includes(tier))
    .filter(m => m.memoryRequired <= availableRAM)
    .filter(m => {
      // Developmental gate: respect minimumBloomLevel
      if (m.minimumBloomLevel && bloomLevel) {
        return bloomLevel >= m.minimumBloomLevel;
      }
      return true;
    });

  if (candidates.length === 0) {
    throw new Error(
      `No models available for tier ${tier} with ${availableRAM}GB RAM` +
      (bloomLevel ? ` and Bloom level ${bloomLevel}` : '')
    );
  }

  // Apply elemental affinity scoring if element provided
  if (element) {
    candidates = candidates.map(m => ({
      ...m,
      elementalScore: m.capabilities.elementalAffinity.includes(element) ? 20 : 0
    }));
  }

  // Sort by selection criteria
  candidates.sort((a, b) => {
    const aScore = calculateModelScore(a, { tier, preferSpeed, preferDepth, element });
    const bScore = calculateModelScore(b, { tier, preferSpeed, preferDepth, element });
    return bScore - aScore;
  });

  console.log(`🎯 [Model Selection] Tier=${tier}, Element=${element || 'none'}, RAM=${availableRAM}GB`);
  console.log(`✅ Selected: ${candidates[0].id} (${candidates[0].description})`);

  return candidates[0];
}

/**
 * Get fallback chain for reliability
 * Returns ordered list: [primary, fallback1, fallback2, ...]
 */
export async function getModelFallbackChain(
  context: ModelSelectionContext
): Promise<ModelProfile[]> {
  const availableRAM = context.availableRAM || await detectAvailableRAM();

  const candidates = MODEL_REGISTRY
    .filter(m => m.tiers.includes(context.tier))
    .filter(m => m.memoryRequired <= availableRAM)
    .sort((a, b) => {
      const aScore = calculateModelScore(a, context);
      const bScore = calculateModelScore(b, context);
      return bScore - aScore;
    });

  // Return top 3 for fallback reliability
  return candidates.slice(0, 3);
}

/**
 * Calculate model score based on selection criteria
 */
function calculateModelScore(
  model: ModelProfile & { elementalScore?: number },
  context: Partial<ModelSelectionContext>
): number {
  let score = 0;

  // Base capability scores
  score += model.capabilities.reasoning * 0.3;
  score += model.capabilities.consciousnessDepth * 0.3;
  score += model.capabilities.speed * 0.2;

  // Tier-specific weights
  if (context.tier === 'DEEP') {
    // Prioritize consciousness depth for deep work
    score += model.capabilities.consciousnessDepth * 0.5;
    score += model.capabilities.reasoning * 0.3;
  } else if (context.tier === 'FAST') {
    // Prioritize speed for fast work
    score += model.capabilities.speed * 0.6;
  } else {
    // CORE: Balance
    score += model.capabilities.reasoning * 0.2;
    score += model.capabilities.consciousnessDepth * 0.2;
  }

  // User preference weights
  if (context.preferSpeed) {
    score += model.capabilities.speed * 0.3;
  }
  if (context.preferDepth) {
    score += model.capabilities.consciousnessDepth * 0.3;
  }

  // Elemental affinity bonus
  if (model.elementalScore) {
    score += model.elementalScore;
  }

  return score;
}

/**
 * Detect available RAM on the system
 * Returns conservative estimate in GB
 */
async function detectAvailableRAM(): Promise<number> {
  try {
    // Node.js environment
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const totalMemory = require('os').totalmem();
      const freeMemory = require('os').freemem();

      // Conservative: Use 60% of free memory
      const availableGB = Math.floor((freeMemory * 0.6) / (1024 ** 3));

      console.log(`💾 [Memory Detection] Total: ${Math.floor(totalMemory / (1024 ** 3))}GB, Available: ${availableGB}GB`);

      return Math.max(4, availableGB); // Minimum 4GB
    }
  } catch (err) {
    console.warn('[Memory Detection] Failed, defaulting to 8GB', err);
  }

  // Default fallback: Assume 8GB available
  return 8;
}

/**
 * Get model by ID
 */
export function getModelById(id: string): ModelProfile | undefined {
  return MODEL_REGISTRY.find(m => m.id === id);
}

/**
 * List all models for a given tier
 */
export function getModelsForTier(tier: ProcessingTier): ModelProfile[] {
  return MODEL_REGISTRY.filter(m => m.tiers.includes(tier));
}

/**
 * List all models with elemental affinity
 */
export function getModelsForElement(element: Element): ModelProfile[] {
  return MODEL_REGISTRY.filter(m =>
    m.capabilities.elementalAffinity.includes(element)
  );
}

/**
 * Export for testing/debugging
 */
export function getAllModels(): ModelProfile[] {
  return MODEL_REGISTRY;
}
