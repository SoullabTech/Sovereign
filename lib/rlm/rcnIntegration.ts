/**
 * RCN Integration for MAIA
 *
 * MAIA-specific wrapper around the RCN client that:
 * - Builds corpus from available sources
 * - Applies consciousness context
 * - Merges RCN answers with MAIA's voice
 */

import { rcnClient, RecursiveResult, BudgetLimits, ChunkProvenance } from './client';
import { pickRcnBudget, CorpusType, RcnIntent, RcnBudgetContext, RcnMode } from './budgetRouter';
import { routeToRcn, RcnRoutingDecision, ConversationContext, detectsThoroughRequest } from './rcnRouter';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface MaiaRcnContext {
  /** User ID for corpus loading */
  userId: string;
  /** Voice mode */
  mode: 'dialogue' | 'counsel' | 'scribe';
  /** Is this a sanctuary session? */
  isSanctuary?: boolean;
  /** User's vault path (if Obsidian integration enabled) */
  vaultPath?: string;
  /** Active elemental field from governor */
  activeElement?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  /** Governor posture hint */
  governorPosture?: 'stay' | 'regulate' | 'invite_handoff';
  /** Processing depth (FAST/CORE/DEEP) */
  processingDepth?: 'FAST' | 'CORE' | 'DEEP';
  /** Previous RCN result (for escalation) */
  previousRcnResult?: Pick<RecursiveResult, 'confidence' | 'completedNormally' | 'budgetUsage'>;
}

export interface MaiaRcnResult {
  /** The answer from RCN */
  answer: string;
  /** What was read (provenance tracking) */
  provenance: ChunkProvenance[];
  /** Confidence in the answer (0-1) */
  confidence: number;
  /** Budget usage metrics */
  budgetUsage: RecursiveResult['budgetUsage'];
  /** Whether RCN completed normally */
  completedNormally: boolean;
  /** Selected budget mode */
  budgetMode: RcnMode;
  /** Detected intent */
  intent: RcnIntent;
  /** Corpus type used */
  corpusType: CorpusType;
  /** Whether this was a forced submit (hit budget wall) */
  forcedSubmit: boolean;
  /** Processing time in ms */
  processingTimeMs: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Corpus Building
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build corpus from available sources based on corpus type
 *
 * TODO: Integrate with memory system for user-specific corpus
 */
async function buildCorpus(
  corpusType: CorpusType,
  context: MaiaRcnContext
): Promise<string[]> {
  const corpus: string[] = [];

  switch (corpusType) {
    case 'docs':
      // TODO: Load from Community Commons
      // For now, return empty - user should provide explicit corpus
      break;

    case 'transcript':
      // TODO: Load from conversation memory
      break;

    case 'codebase':
      // TODO: Load relevant files from codebase
      break;

    case 'vault':
      // Vault is handled separately via vaultPath
      break;

    case 'general':
    default:
      // No corpus - RCN will use its base knowledge
      break;
  }

  return corpus;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Integration Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if a query should be routed to RCN
 */
export function shouldRouteToRcn(input: string, context: MaiaRcnContext): RcnRoutingDecision {
  const conversationContext: ConversationContext = {
    mode: context.mode,
    vaultPath: context.vaultPath,
    isSanctuary: context.isSanctuary,
    activeElement: context.activeElement,
    availableCorpora: ['docs', 'vault', 'codebase'], // Default available
  };

  return routeToRcn(input, conversationContext);
}

/**
 * Process a query with RCN and return MAIA-formatted result
 */
export async function processWithRcn(
  prompt: string,
  corpus: string[],
  corpusType: CorpusType,
  intent: RcnIntent,
  context: MaiaRcnContext
): Promise<MaiaRcnResult> {
  const startTime = Date.now();

  // Determine if user asked for thorough analysis
  const userAskedThorough = detectsThoroughRequest(prompt);

  // Build budget context
  const budgetContext: RcnBudgetContext = {
    corpusType,
    intent,
    channel: context.mode === 'dialogue' ? 'voice' : 'text',
    userAskedThorough,
    lastResult: context.previousRcnResult,
  };

  // Pick optimal budget
  const { mode: budgetMode, budget, rationale } = pickRcnBudget(budgetContext);

  // Log budget selection (for observability)
  console.log('[RCN Integration] Budget selected:', {
    budgetMode,
    intent,
    corpusType,
    rationale,
  });

  // Call RCN
  let result: RecursiveResult;

  if (corpusType === 'vault' && context.vaultPath) {
    // Use vault-specific endpoint
    result = await rcnClient.processVault(prompt, context.vaultPath, budget);
  } else if (corpus.length > 0) {
    // Use corpus
    result = await rcnClient.process({
      prompt,
      corpus,
      corpusType,
      budget,
    });
  } else {
    // No corpus - general processing
    result = await rcnClient.process({
      prompt,
      corpusType: 'general',
      budget,
    });
  }

  const processingTimeMs = Date.now() - startTime;

  return {
    answer: result.answer,
    provenance: result.provenance,
    confidence: result.confidence,
    budgetUsage: result.budgetUsage,
    completedNormally: result.completedNormally,
    budgetMode,
    intent,
    corpusType,
    forcedSubmit: !!result.budgetUsage.forcedSubmitUsed,
    processingTimeMs,
  };
}

/**
 * Full RCN integration flow for MAIA
 *
 * 1. Determines if RCN should handle the query
 * 2. Builds corpus if needed
 * 3. Processes with RCN
 * 4. Returns formatted result
 */
export async function maiaRcnProcess(
  input: string,
  context: MaiaRcnContext,
  explicitCorpus?: string[]
): Promise<{ used: false } | { used: true; result: MaiaRcnResult }> {
  // Check if we should use RCN
  const routingDecision = shouldRouteToRcn(input, context);

  if (!routingDecision.shouldUseRcn) {
    console.log('[RCN Integration] Routing decision: skip RCN', {
      rationale: routingDecision.rationale,
    });
    return { used: false };
  }

  console.log('[RCN Integration] Routing to RCN', {
    intent: routingDecision.intent,
    corpusType: routingDecision.corpusType,
    confidence: routingDecision.confidence,
    rationale: routingDecision.rationale,
  });

  // Build corpus (if not provided explicitly)
  const corpus = explicitCorpus || await buildCorpus(routingDecision.corpusType, context);

  // Process with RCN
  const result = await processWithRcn(
    input,
    corpus,
    routingDecision.corpusType,
    routingDecision.intent,
    context
  );

  return { used: true, result };
}

/**
 * Check RCN service health
 */
export async function checkRcnHealth(): Promise<{ available: boolean; latencyMs?: number }> {
  try {
    const start = Date.now();
    const health = await rcnClient.health();
    const latencyMs = Date.now() - start;

    return {
      available: health.status === 'healthy',
      latencyMs,
    };
  } catch {
    return { available: false };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Response Formatting
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format RCN result for MAIA's response style
 *
 * This preserves the answer but adds MAIA's voice characteristics
 */
export function formatRcnForMaia(
  result: MaiaRcnResult,
  context: MaiaRcnContext
): string {
  let formatted = result.answer;

  // If low confidence, add disclaimer
  if (result.confidence < 0.5) {
    formatted = `Based on what I could find: ${formatted}`;
  }

  // If forced submit, note the limitation
  if (result.forcedSubmit) {
    formatted += '\n\n(I reached my search limit - there may be more to explore.)';
  }

  return formatted;
}

/**
 * Extract trust receipt from RCN result (for transparency)
 */
export function extractTrustReceipt(result: MaiaRcnResult): {
  chunksRead: number;
  confidence: number;
  intent: RcnIntent;
  processingTimeMs: number;
} {
  return {
    chunksRead: result.provenance.length,
    confidence: result.confidence,
    intent: result.intent,
    processingTimeMs: result.processingTimeMs,
  };
}
