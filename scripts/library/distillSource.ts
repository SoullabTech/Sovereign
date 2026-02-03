#!/usr/bin/env npx tsx
/**
 * Library Distillation Script — Extract structured wisdom from sources
 *
 * Takes a source and uses Claude/Kimi to generate a structured distillate:
 * - summary_short, summary_long
 * - definitions[], practices[], warnings[]
 * - facet_tags[], archetypes[], key_quotes[]
 * - Full provenance chain
 *
 * Usage:
 *   npx tsx scripts/library/distillSource.ts --source-id <uuid>
 *   npx tsx scripts/library/distillSource.ts --all-pending
 *   npx tsx scripts/library/distillSource.ts --batch 10
 *
 * Options:
 *   --source-id <uuid>   Distill a specific source
 *   --all-pending        Distill all sources without distillates
 *   --batch <n>          Limit to N sources per run
 *   --model <name>       Override model (default: claude-opus-4-5-20251101 or kimi-k2.5)
 *   --dry-run            Show what would be distilled without calling LLM
 *   --use-kimi           Force use of Kimi (overrides USE_KIMI_FOR_LIBRARY env)
 *
 * Environment:
 *   ANTHROPIC_API_KEY      Required for Claude
 *   MOONSHOT_API_KEY       Required for Kimi
 *   USE_KIMI_FOR_LIBRARY   Set to 'true' to use Kimi instead of Claude
 *   DATABASE_URL           PostgreSQL connection string
 */

import { query, queryOne } from '../../lib/database/postgres';
import { libraryService, type DistillatePayload } from '../../lib/library/LibraryService';
import Anthropic from '@anthropic-ai/sdk';
import { generateWithKimi, isKimiAvailable } from '../../lib/ai/kimiClient';

// =============================================================================
// CONFIGURATION
// =============================================================================

// Check if Kimi should be used
const USE_KIMI = process.env.USE_KIMI_FOR_LIBRARY === 'true';

const CONFIG = {
  // Default models
  DEFAULT_CLAUDE_MODEL: 'claude-opus-4-5-20251101',
  DEFAULT_KIMI_MODEL: process.env.MOONSHOT_MODEL || 'kimi-k2.5',

  // Chunk limits for distillation prompt
  MAX_CHUNKS_PER_DISTILL: 30,        // Max chunks to include in a single prompt
  MAX_TOKENS_PER_DISTILL: 50000,     // Approximate token limit for source content
  // Kimi has 2M context - can handle much more!
  MAX_TOKENS_PER_DISTILL_KIMI: 500000,

  // Retry configuration
  MAX_RETRIES: 3,
  INITIAL_BACKOFF_MS: 1000,
  BACKOFF_MULTIPLIER: 2,

  // Rate limiting (be respectful)
  DELAY_BETWEEN_SOURCES_MS: 2000,
};

// =============================================================================
// DISTILLATION PROMPT
// =============================================================================

const DISTILLATION_SYSTEM_PROMPT = `You are a Librarian AI serving MAIA, a sovereign consciousness companion built on Spiralogic principles. Your task is to distill wisdom from source texts into a structured format that MAIA can use to support users.

You will receive the full text (or key excerpts) of a wisdom source. Extract and structure the following:

## Output Format (JSON)

{
  "summary_short": "1-2 sentence essence of this source",
  "summary_long": "1-2 paragraph comprehensive summary",
  "definitions": [
    {"term": "key concept", "meaning": "clear definition", "context": "when/how it applies"}
  ],
  "practices": [
    {"name": "practice name", "description": "how to do it", "element": "Fire|Water|Earth|Air|Aether", "when_to_use": "appropriate situations"}
  ],
  "warnings": [
    {"condition": "when this applies", "contraindication": "what to avoid or be careful of", "alternative": "what to do instead"}
  ],
  "facet_tags": ["FIRE_1", "WATER_2", etc.],
  "archetypes": [
    {"name": "archetype name", "description": "what it represents", "shadow": "shadow expression", "integration": "integrated expression"}
  ],
  "key_quotes": [
    {"text": "exact quote", "location": "chapter/section if known", "significance": "why this matters"}
  ]
}

## Guidelines

1. **Definitions**: Extract 3-10 key terms/concepts that someone studying this material would need to understand
2. **Practices**: Extract concrete exercises, rituals, or practices. Include the elemental association if apparent
3. **Warnings**: Note any cautions, contraindications, or "shadow" expressions of the teachings
4. **Facet Tags**: Use Spiralogic facet notation (ELEMENT_PHASE where phase is 1, 2, or 3)
   - Fire: Action, will, identity, courage
   - Water: Emotion, depth, shadow, feeling
   - Earth: Body, structure, resources, embodiment
   - Air: Mind, communication, pattern, teaching
   - Aether: Spirit, integration, transcendence, unity
5. **Archetypes**: Identify archetypal patterns (Jungian or universal)
6. **Key Quotes**: Select 2-5 quotes that capture essential wisdom (preserve exact wording)

## Quality Standards

- Be precise and faithful to the source
- Don't invent content not present in the source
- If the source doesn't contain something (e.g., no practices), return an empty array
- Maintain the author's voice in quotes
- Flag uncertainty with [unclear] or [inferred]

Return ONLY valid JSON. No markdown, no explanation outside the JSON.`;

// =============================================================================
// TYPES
// =============================================================================

interface SourceWithChunks {
  id: string;
  title: string;
  author: string | null;
  file_path: string;
  type: string;
  chunks: Array<{
    id: string;
    chunk_index: number;
    content: string;
    token_count: number;
  }>;
  total_tokens: number;
}

interface DistillationResult {
  source_id: string;
  title: string;
  success: boolean;
  distillate_id?: string;
  error?: string;
  model_used: string;
  duration_ms: number;
}

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Load source with all its chunks
 */
async function loadSourceWithChunks(sourceId: string): Promise<SourceWithChunks | null> {
  const source = await queryOne<any>(
    `SELECT id, title, author, file_path, type FROM library_sources WHERE id = $1`,
    [sourceId]
  );

  if (!source) return null;

  const chunks = await query<any>(
    `SELECT id, chunk_index, content, token_count
     FROM library_chunks
     WHERE source_id = $1
     ORDER BY chunk_index`,
    [sourceId]
  );

  const totalTokens = chunks.reduce((sum, c) => sum + (c.token_count || 0), 0);

  return {
    id: source.id,
    title: source.title,
    author: source.author,
    file_path: source.file_path,
    type: source.type,
    chunks,
    total_tokens: totalTokens,
  };
}

/**
 * Build the distillation prompt for a source
 */
function buildDistillationPrompt(source: SourceWithChunks): string {
  const header = [
    `# Source: ${source.title}`,
    source.author ? `Author: ${source.author}` : null,
    `Type: ${source.type}`,
    `File: ${source.file_path}`,
    `Chunks: ${source.chunks.length}`,
    `Approximate tokens: ${source.total_tokens}`,
    '',
    '---',
    '',
    '# Content',
    '',
  ].filter(Boolean).join('\n');

  // Select chunks within token limit
  let selectedChunks: typeof source.chunks = [];
  let tokenCount = 0;

  for (const chunk of source.chunks) {
    if (tokenCount + chunk.token_count > CONFIG.MAX_TOKENS_PER_DISTILL) break;
    if (selectedChunks.length >= CONFIG.MAX_CHUNKS_PER_DISTILL) break;
    selectedChunks.push(chunk);
    tokenCount += chunk.token_count;
  }

  // If we couldn't include all chunks, note this
  const truncationNote = selectedChunks.length < source.chunks.length
    ? `\n[Note: Source truncated. Showing ${selectedChunks.length} of ${source.chunks.length} chunks]\n\n`
    : '';

  const content = selectedChunks
    .map(c => `[Chunk ${c.chunk_index + 1}]\n${c.content}`)
    .join('\n\n---\n\n');

  return header + truncationNote + content;
}

/**
 * Call Claude to generate distillate
 */
async function callClaudeForDistillate(
  prompt: string,
  model: string
): Promise<DistillatePayload> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model,
    max_tokens: 8192,
    system: DISTILLATION_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Extract text content
  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Claude response');
  }

  // Parse JSON (handle potential markdown wrapping)
  let jsonText = textContent.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  const distillate = JSON.parse(jsonText);

  // Validate required fields
  if (!distillate.summary_short || !distillate.summary_long) {
    throw new Error('Distillate missing required summary fields');
  }

  // Ensure arrays exist (even if empty)
  distillate.definitions = distillate.definitions || [];
  distillate.practices = distillate.practices || [];
  distillate.warnings = distillate.warnings || [];
  distillate.facet_tags = distillate.facet_tags || [];
  distillate.archetypes = distillate.archetypes || [];
  distillate.key_quotes = distillate.key_quotes || [];

  return distillate as DistillatePayload;
}

/**
 * Call Kimi to generate distillate
 * Uses thinking mode for deeper analysis and larger context window
 */
async function callKimiForDistillate(
  prompt: string,
  model: string
): Promise<DistillatePayload> {
  const result = await generateWithKimi({
    systemPrompt: DISTILLATION_SYSTEM_PROMPT,
    userInput: prompt,
    thinkingMode: true, // Use thinking mode for deeper analysis
    meta: {
      model,
      task: 'library_distillation',
    },
  });

  // Parse JSON (handle potential markdown wrapping)
  let jsonText = result.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  const distillate = JSON.parse(jsonText);

  // Validate required fields
  if (!distillate.summary_short || !distillate.summary_long) {
    throw new Error('Distillate missing required summary fields');
  }

  // Ensure arrays exist (even if empty)
  distillate.definitions = distillate.definitions || [];
  distillate.practices = distillate.practices || [];
  distillate.warnings = distillate.warnings || [];
  distillate.facet_tags = distillate.facet_tags || [];
  distillate.archetypes = distillate.archetypes || [];
  distillate.key_quotes = distillate.key_quotes || [];

  return distillate as DistillatePayload;
}

/**
 * Distill a single source with retry logic
 */
async function distillSource(
  sourceId: string,
  model: string,
  dryRun: boolean,
  useKimi: boolean
): Promise<DistillationResult> {
  const startTime = Date.now();
  const provider = useKimi ? 'Kimi' : 'Claude';

  // Load source
  const source = await loadSourceWithChunks(sourceId);
  if (!source) {
    return {
      source_id: sourceId,
      title: 'Unknown',
      success: false,
      error: 'Source not found',
      model_used: model,
      duration_ms: Date.now() - startTime,
    };
  }

  console.log(`\n📖 Distilling: ${source.title}`);
  console.log(`   Author: ${source.author || 'Unknown'}`);
  console.log(`   Chunks: ${source.chunks.length}`);
  console.log(`   Tokens: ~${source.total_tokens}`);
  console.log(`   Provider: ${provider} (${model})`);

  if (dryRun) {
    console.log(`   🔍 DRY RUN — would distill with ${provider} (${model})`);
    return {
      source_id: sourceId,
      title: source.title,
      success: true,
      model_used: model,
      duration_ms: Date.now() - startTime,
    };
  }

  // Build prompt
  const prompt = buildDistillationPrompt(source);

  // Retry loop
  let lastError: Error | null = null;
  let backoffMs = CONFIG.INITIAL_BACKOFF_MS;

  for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
    try {
      const providerEmoji = useKimi ? '🌙' : '🧠';
      console.log(`   ${providerEmoji} Calling ${provider} (${model}) (attempt ${attempt}/${CONFIG.MAX_RETRIES})...`);

      // Use Kimi or Claude based on flag
      const distillate = useKimi
        ? await callKimiForDistillate(prompt, model)
        : await callClaudeForDistillate(prompt, model);

      // Add provenance
      distillate.provenance = {
        source_id: source.id,
        title: source.title,
        author: source.author,
        file_path: source.file_path,
        chunk_ids_used: source.chunks.map(c => c.id),
      };

      // Store distillate
      const distillateId = await libraryService.storeDistillate(
        sourceId,
        distillate,
        model
      );

      console.log(`   ✅ Distillate created: ${distillateId.substring(0, 8)}...`);
      console.log(`   📊 Extracted: ${distillate.definitions.length} definitions, ${distillate.practices.length} practices, ${distillate.warnings.length} warnings`);
      console.log(`   🏷️  Facets: ${distillate.facet_tags.join(', ') || 'none'}`);

      return {
        source_id: sourceId,
        title: source.title,
        success: true,
        distillate_id: distillateId,
        model_used: model,
        duration_ms: Date.now() - startTime,
      };

    } catch (error: any) {
      lastError = error;
      console.warn(`   ⚠️  Attempt ${attempt} failed: ${error.message}`);

      if (attempt < CONFIG.MAX_RETRIES) {
        console.log(`   ⏳ Waiting ${backoffMs}ms before retry...`);
        await sleep(backoffMs);
        backoffMs *= CONFIG.BACKOFF_MULTIPLIER;
      }
    }
  }

  // All retries exhausted
  console.error(`   ❌ All retries failed`);
  return {
    source_id: sourceId,
    title: source.title,
    success: false,
    error: lastError?.message || 'Unknown error',
    model_used: model,
    duration_ms: Date.now() - startTime,
  };
}

/**
 * Find sources that need distillation
 */
async function findPendingSources(limit?: number): Promise<string[]> {
  const sql = `
    SELECT s.id
    FROM library_sources s
    LEFT JOIN library_distillates d ON s.id = d.source_id AND d.level = 'source'
    WHERE s.ingestion_status = 'completed'
      AND d.id IS NULL
    ORDER BY s.created_at
    ${limit ? `LIMIT ${limit}` : ''}
  `;

  const results = await query<{ id: string }>(sql);
  return results.map(r => r.id);
}

// =============================================================================
// UTILITIES
// =============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// LOGGING
// =============================================================================

async function logDistillationRun(results: DistillationResult[]): Promise<void> {
  const summary = {
    timestamp: new Date().toISOString(),
    total: results.length,
    success: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    total_duration_ms: results.reduce((sum, r) => sum + r.duration_ms, 0),
    results: results.map(r => ({
      source_id: r.source_id,
      title: r.title,
      success: r.success,
      error: r.error,
      duration_ms: r.duration_ms,
    })),
  };

  // Log to console
  console.log('\n' + '='.repeat(60));
  console.log('📊 DISTILLATION RUN SUMMARY');
  console.log('='.repeat(60));
  console.log(`   Timestamp:  ${summary.timestamp}`);
  console.log(`   Total:      ${summary.total}`);
  console.log(`   Success:    ${summary.success}`);
  console.log(`   Failed:     ${summary.failed}`);
  console.log(`   Duration:   ${(summary.total_duration_ms / 1000).toFixed(1)}s`);

  if (summary.failed > 0) {
    console.log('\n   Failed sources:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.title}: ${r.error}`);
    });
  }

  // Also log to database for tracking
  try {
    await query(
      `INSERT INTO library_search_log (query_text, query_type, chunks_returned, distillates_returned, search_duration_ms)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        `distillation_run_${summary.timestamp}`,
        'distillation',
        summary.total,
        summary.success,
        summary.total_duration_ms,
      ]
    );
  } catch (err) {
    // Non-critical
    console.warn('   (Could not log to database)');
  }
}

// =============================================================================
// CLI
// =============================================================================

async function main() {
  const args = process.argv.slice(2);

  const dryRun = args.includes('--dry-run');

  // Determine if using Kimi: --use-kimi flag OR USE_KIMI_FOR_LIBRARY env
  const useKimi = args.includes('--use-kimi') || USE_KIMI;

  // Check Kimi availability if requested
  if (useKimi && !isKimiAvailable()) {
    console.error('❌ Kimi requested but MOONSHOT_API_KEY not set');
    console.error('   Set MOONSHOT_API_KEY or remove --use-kimi flag');
    process.exit(1);
  }

  // Select default model based on provider
  const defaultModel = useKimi ? CONFIG.DEFAULT_KIMI_MODEL : CONFIG.DEFAULT_CLAUDE_MODEL;
  const model = getArgValue(args, '--model') || defaultModel;

  // Determine which sources to distill
  let sourceIds: string[] = [];

  const specificSourceId = getArgValue(args, '--source-id');
  if (specificSourceId) {
    sourceIds = [specificSourceId];
  } else if (args.includes('--all-pending')) {
    const batchLimit = parseInt(getArgValue(args, '--batch') || '0', 10) || undefined;
    sourceIds = await findPendingSources(batchLimit);
  } else {
    console.error('❌ No sources specified.');
    console.error('   Use --source-id <uuid> for a specific source');
    console.error('   Or --all-pending to distill all sources without distillates');
    console.error('   Or --all-pending --batch 10 to limit batch size');
    process.exit(1);
  }

  if (sourceIds.length === 0) {
    console.log('✅ No sources need distillation.');
    process.exit(0);
  }

  const providerName = useKimi ? 'Kimi (Moonshot)' : 'Claude (Anthropic)';
  console.log(`\n📚 Library Distillation Starting`);
  console.log(`   Sources: ${sourceIds.length}`);
  console.log(`   Provider: ${providerName}`);
  console.log(`   Model: ${model}`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);

  // Process sources
  const results: DistillationResult[] = [];

  for (let i = 0; i < sourceIds.length; i++) {
    const sourceId = sourceIds[i];
    console.log(`\n[${i + 1}/${sourceIds.length}]`);

    const result = await distillSource(sourceId, model, dryRun, useKimi);
    results.push(result);

    // Rate limiting delay between sources
    if (i < sourceIds.length - 1 && !dryRun) {
      await sleep(CONFIG.DELAY_BETWEEN_SOURCES_MS);
    }
  }

  // Log summary
  await logDistillationRun(results);

  if (dryRun) {
    console.log('\n🔍 This was a DRY RUN. No distillates were created.');
  }

  const exitCode = results.some(r => !r.success) ? 1 : 0;
  process.exit(exitCode);
}

function getArgValue(args: string[], flag: string): string | null {
  const index = args.indexOf(flag);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return null;
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
