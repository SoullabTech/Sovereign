/**
 * Vault Symbol Index: MAIA's Image-Based Memory
 *
 * Enables MAIA to remember "where meaning lives" rather than re-searching.
 * Based on the insight that human memory works through images and associations.
 *
 * Three modes of operation:
 * 1. Orient: Given a query, find which symbols/images apply
 * 2. Locate: Given symbols, find the best vault locations to start
 * 3. Learn: After each RCN run, strengthen/weaken associations
 */

import { query as pgQuery, pool } from '@/lib/db/postgres';
import type { RecursiveResult, ChunkProvenance } from '@/lib/rlm/client';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface VaultSymbol {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  elementalAffinity: string | null;
}

export interface SymbolLink {
  id: string;
  symbolId: string;
  symbolSlug: string;
  vaultPath: string;
  filePath: string;
  heading: string | null;
  weight: number;
  timesUsed: number;
  timesHelpful: number;
  lastUsefulAt: Date | null;
}

export interface QueryPattern {
  pattern: string;
  symbolSlug: string;
  weight: number;
}

export type PromptPattern =
  | 'what_is'      // "What is X?"
  | 'how_do_i'     // "How do I X?"
  | 'compare'      // "Compare X and Y"
  | 'summarize'    // "Summarize X"
  | 'find'         // "Find X"
  | 'explain'      // "Explain X"
  | 'when'         // "When should I X?"
  | 'why'          // "Why X?"
  | 'general';     // Everything else

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern Detection
// ═══════════════════════════════════════════════════════════════════════════════

const PATTERN_MATCHERS: [PromptPattern, RegExp][] = [
  ['what_is', /^what\s+(is|are|was|were)\b/i],
  ['how_do_i', /^how\s+(do|can|should|would|might)\s+i\b/i],
  ['compare', /\b(compare|versus|vs\.?|difference|contrast)\b/i],
  ['summarize', /\b(summarize|summary|overview|recap)\b/i],
  ['find', /^(find|search|look\s+for|locate)\b/i],
  ['explain', /^(explain|describe|tell\s+me\s+about)\b/i],
  ['when', /^when\s+(should|do|can|would)\b/i],
  ['why', /^why\s+(is|are|do|should|would)\b/i],
];

export function detectPromptPattern(prompt: string): PromptPattern {
  const normalized = prompt.trim().toLowerCase();

  for (const [pattern, regex] of PATTERN_MATCHERS) {
    if (regex.test(normalized)) {
      return pattern;
    }
  }

  return 'general';
}

// ═══════════════════════════════════════════════════════════════════════════════
// Symbol Image Detection
// ═══════════════════════════════════════════════════════════════════════════════

const SYMBOL_KEYWORDS: Record<string, string[]> = {
  spiral: [
    'spiral', 'spiralogic', 'development', 'stage', 'phase', 'growth',
    'regression', 'progression', 'facet', '12 facet', 'journey', 'evolution'
  ],
  threshold: [
    'threshold', 'liminal', 'transition', 'initiation', 'transform',
    'pause', 'wait', 'before', 'turning point', 'shift', 'breakthrough'
  ],
  mirror: [
    'mirror', 'witness', 'reflect', 'see', 'observe', 'watch',
    'awareness', 'presence', 'being with', 'holding space'
  ],
  polarity: [
    'polarity', 'tension', 'opposites', 'fire', 'water', 'earth', 'air',
    'element', 'balance', 'integration', 'both/and', 'paradox'
  ],
  field: [
    'field', 'coherence', 'collective', 'ubuntu', 'we', 'together',
    'resonance', 'shared', 'relational', 'community', 'constellation'
  ],
};

export function detectRelevantSymbols(prompt: string): string[] {
  const normalized = prompt.toLowerCase();
  const matches: string[] = [];

  for (const [symbol, keywords] of Object.entries(SYMBOL_KEYWORDS)) {
    const hasMatch = keywords.some(kw => normalized.includes(kw));
    if (hasMatch) {
      matches.push(symbol);
    }
  }

  // If no specific symbols detected, return default exploration set
  if (matches.length === 0) {
    return ['spiral', 'field']; // Default: development + relational
  }

  return matches;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Database Operations
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get all core symbols
 */
export async function getAllSymbols(): Promise<VaultSymbol[]> {
  const result = await pgQuery(`
    SELECT id, slug, title, description, elemental_affinity
    FROM vault_symbols
    ORDER BY slug
  `);

  return result.rows.map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    elementalAffinity: row.elemental_affinity,
  }));
}

/**
 * Get symbol by slug
 */
export async function getSymbolBySlug(slug: string): Promise<VaultSymbol | null> {
  const result = await pgQuery(`
    SELECT id, slug, title, description, elemental_affinity
    FROM vault_symbols
    WHERE slug = $1
  `, [slug]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    elementalAffinity: row.elemental_affinity,
  };
}

/**
 * Get top links for a symbol, ordered by weight
 */
export async function getSymbolLinks(
  symbolSlug: string,
  vaultPath: string,
  limit: number = 5
): Promise<SymbolLink[]> {
  const result = await pgQuery(`
    SELECT
      l.id, l.symbol_id, s.slug as symbol_slug,
      l.vault_path, l.file_path, l.heading,
      l.weight, l.times_used, l.times_helpful, l.last_useful_at
    FROM vault_symbol_links l
    JOIN vault_symbols s ON s.id = l.symbol_id
    WHERE s.slug = $1 AND l.vault_path = $2
    ORDER BY l.weight DESC, l.times_helpful DESC
    LIMIT $3
  `, [symbolSlug, vaultPath, limit]);

  return result.rows.map(row => ({
    id: row.id,
    symbolId: row.symbol_id,
    symbolSlug: row.symbol_slug,
    vaultPath: row.vault_path,
    filePath: row.file_path,
    heading: row.heading,
    weight: row.weight,
    timesUsed: row.times_used,
    timesHelpful: row.times_helpful,
    lastUsefulAt: row.last_useful_at,
  }));
}

/**
 * Get starting points for a query based on symbols and patterns
 */
export async function getStartingPoints(
  prompt: string,
  vaultPath: string,
  limit: number = 8
): Promise<SymbolLink[]> {
  const symbols = detectRelevantSymbols(prompt);
  const pattern = detectPromptPattern(prompt);

  // Get links for detected symbols, prioritized by weight
  const result = await pgQuery(`
    SELECT DISTINCT ON (l.file_path, l.heading)
      l.id, l.symbol_id, s.slug as symbol_slug,
      l.vault_path, l.file_path, l.heading,
      l.weight, l.times_used, l.times_helpful, l.last_useful_at
    FROM vault_symbol_links l
    JOIN vault_symbols s ON s.id = l.symbol_id
    LEFT JOIN vault_query_patterns qp ON qp.symbol_id = s.id AND qp.pattern = $3
    WHERE s.slug = ANY($1) AND l.vault_path = $2
    ORDER BY l.file_path, l.heading, (l.weight + COALESCE(qp.weight, 0)) DESC
    LIMIT $4
  `, [symbols, vaultPath, pattern, limit]);

  return result.rows.map(row => ({
    id: row.id,
    symbolId: row.symbol_id,
    symbolSlug: row.symbol_slug,
    vaultPath: row.vault_path,
    filePath: row.file_path,
    heading: row.heading,
    weight: row.weight,
    timesUsed: row.times_used,
    timesHelpful: row.times_helpful,
    lastUsefulAt: row.last_useful_at,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// Learning from RCN Results
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Weight adjustment constants
 */
const WEIGHT_HIGH_CONFIDENCE = 0.15;    // Bump when helpful
const WEIGHT_MEDIUM_CONFIDENCE = 0.05;  // Small bump for partial help
const WEIGHT_FORCED_SUBMIT = 0.01;      // Tiny bump even when forced
const WEIGHT_DECAY_UNUSED = -0.02;      // Slight decay for unused links

/**
 * Learn from an RCN result - update symbol link weights
 */
export async function learnFromResult(
  prompt: string,
  vaultPath: string,
  result: RecursiveResult
): Promise<void> {
  const { provenance, confidence, completedNormally, budgetUsage, notVerified } = result;
  const symbols = detectRelevantSymbols(prompt);
  const pattern = detectPromptPattern(prompt);

  // Determine weight adjustment based on outcome
  let weightBump: number;
  if (completedNormally && confidence >= 0.7) {
    weightBump = WEIGHT_HIGH_CONFIDENCE;
  } else if (confidence >= 0.4) {
    weightBump = WEIGHT_MEDIUM_CONFIDENCE;
  } else if (budgetUsage.forcedSubmitUsed) {
    weightBump = WEIGHT_FORCED_SUBMIT;
  } else {
    weightBump = 0;
  }

  const isHelpful = completedNormally && confidence >= 0.6;

  // Update links for each provenance item
  for (const prov of provenance) {
    if (!prov.filePath) continue; // Skip non-vault provenance

    // For each detected symbol, create or update the link
    for (const symbolSlug of symbols) {
      await upsertSymbolLink(
        symbolSlug,
        vaultPath,
        prov.filePath,
        prov.heading || null,
        weightBump,
        isHelpful
      );
    }
  }

  // Update query pattern weights
  for (const symbolSlug of symbols) {
    await updateQueryPattern(pattern, symbolSlug, isHelpful);
  }

  // Record misses if budget was exhausted or confidence is low
  if (!completedNormally || confidence < 0.5 || budgetUsage.forcedSubmitUsed) {
    await recordMiss(
      result.runId,
      pattern,
      notVerified || [],
      budgetUsage.forcedSubmitUsed || false,
      budgetUsage.budgetExhaustedReason || null,
      symbols
    );
  }
}

/**
 * Create or update a symbol link
 */
async function upsertSymbolLink(
  symbolSlug: string,
  vaultPath: string,
  filePath: string,
  heading: string | null,
  weightBump: number,
  isHelpful: boolean
): Promise<void> {
  await pgQuery(`
    INSERT INTO vault_symbol_links (
      symbol_id, vault_path, file_path, heading,
      weight, times_used, times_helpful, last_useful_at
    )
    SELECT
      id, $2, $3, $4,
      $5, 1, CASE WHEN $6 THEN 1 ELSE 0 END, CASE WHEN $6 THEN now() ELSE NULL END
    FROM vault_symbols WHERE slug = $1
    ON CONFLICT (symbol_id, vault_path, file_path, heading)
    DO UPDATE SET
      weight = vault_symbol_links.weight + EXCLUDED.weight,
      times_used = vault_symbol_links.times_used + 1,
      times_helpful = vault_symbol_links.times_helpful + CASE WHEN $6 THEN 1 ELSE 0 END,
      last_useful_at = CASE WHEN $6 THEN now() ELSE vault_symbol_links.last_useful_at END,
      updated_at = now()
  `, [symbolSlug, vaultPath, filePath, heading, weightBump, isHelpful]);
}

/**
 * Update query pattern weights
 */
async function updateQueryPattern(
  pattern: PromptPattern,
  symbolSlug: string,
  isHelpful: boolean
): Promise<void> {
  const weightBump = isHelpful ? WEIGHT_HIGH_CONFIDENCE : WEIGHT_FORCED_SUBMIT;

  await pgQuery(`
    INSERT INTO vault_query_patterns (
      corpus_type, pattern, symbol_id,
      weight, seen_count, helpful_count, last_seen_at
    )
    SELECT
      'vault', $1, id,
      $3, 1, CASE WHEN $4 THEN 1 ELSE 0 END, now()
    FROM vault_symbols WHERE slug = $2
    ON CONFLICT (corpus_type, pattern, symbol_id)
    DO UPDATE SET
      weight = vault_query_patterns.weight + EXCLUDED.weight,
      seen_count = vault_query_patterns.seen_count + 1,
      helpful_count = vault_query_patterns.helpful_count + CASE WHEN $4 THEN 1 ELSE 0 END,
      last_seen_at = now(),
      updated_at = now()
  `, [pattern, symbolSlug, weightBump, isHelpful]);
}

/**
 * Record a miss for learning
 */
async function recordMiss(
  runId: string,
  pattern: PromptPattern,
  notVerified: string[],
  forcedSubmit: boolean,
  budgetExhaustedReason: string | null,
  suggestedSymbols: string[]
): Promise<void> {
  await pgQuery(`
    INSERT INTO vault_symbol_misses (
      run_id, prompt_pattern, not_verified,
      forced_submit, budget_exhausted_reason, suggested_symbols
    ) VALUES ($1, $2, $3, $4, $5, $6)
  `, [runId, pattern, notVerified, forcedSubmit, budgetExhaustedReason, suggestedSymbols]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Convenience: Oriented Search
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get orientation for a query - symbols + starting file hints
 *
 * This is what MAIA calls before doing a full vault search.
 * Returns the images that apply and where to start looking.
 */
export async function getOrientation(
  prompt: string,
  vaultPath: string
): Promise<{
  pattern: PromptPattern;
  symbols: string[];
  startingPoints: SymbolLink[];
}> {
  const pattern = detectPromptPattern(prompt);
  const symbols = detectRelevantSymbols(prompt);
  const startingPoints = await getStartingPoints(prompt, vaultPath);

  return { pattern, symbols, startingPoints };
}
