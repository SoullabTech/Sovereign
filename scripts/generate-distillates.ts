#!/usr/bin/env npx tsx
/**
 * Library Distillate Generation Pipeline
 *
 * Generates structured wisdom summaries for library sources.
 * Uses Kimi (2M context) with Claude fallback.
 *
 * Distillates are AI-generated structured extractions that include:
 * - Short & long summaries
 * - Key definitions, practices, warnings
 * - Spiralogic facet tags
 * - Archetypal patterns
 * - Key quotes with significance
 *
 * Usage:
 *   DATABASE_URL="postgresql://soullab@localhost:5432/maia_consciousness" npx tsx scripts/generate-distillates.ts
 *
 * Options:
 *   --dry-run       Show what would be processed
 *   --force         Re-generate existing distillates
 *   --limit=N       Process at most N sources (default: all)
 *   --type=TYPE     Only process sources of this type (book, teaching, etc.)
 */

import pg from 'pg';

// Parse CLI args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');
const limitArg = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0');
const typeFilter = args.find(a => a.startsWith('--type='))?.split('=')[1];
const RATE_LIMIT_MS = 2000;

// =============================================================================
// DISTILLATION PROMPT
// =============================================================================

const DISTILLATION_PROMPT = `You are a wisdom librarian analyzing a source text for the Soullab Living Library.

Extract the following structured information and respond ONLY with valid JSON matching this schema:

{
  "summary_short": "1-2 sentence essence of this text",
  "summary_long": "A paragraph capturing the core teaching and its significance",
  "definitions": [{"term": "...", "meaning": "...", "context": "..."}],
  "practices": [{"name": "...", "description": "...", "element": "fire|water|earth|air|aether or null", "when_to_use": "..."}],
  "warnings": [{"condition": "...", "contraindication": "...", "alternative": "..."}],
  "facet_tags": ["FIRE_1", "WATER_2", ...],
  "archetypes": [{"name": "...", "description": "...", "shadow": "...", "integration": "..."}],
  "key_quotes": [{"text": "exact quote from text", "location": "section/chapter if identifiable", "significance": "why this matters"}]
}

For facet_tags, use this Spiralogic mapping:
- FIRE_1: Initiation, new callings, courage to begin
- FIRE_2: Trials, resistance, testing commitment
- FIRE_3: Identity transformation through action
- WATER_1: Opening to vulnerability, emotional truth
- WATER_2: Shadow work, descent, underworld journey
- WATER_3: Integration, finding gold in darkness
- EARTH_1: Designing structures, creating containers
- EARTH_2: Building habits, establishing practices
- EARTH_3: Embodied reality, stable presence
- AIR_1: First sharing, speaking truth
- AIR_2: Teaching, articulating patterns
- AIR_3: Cultural integration, collective wisdom

Include 3-5 key quotes maximum. Be thorough but concise.
Respond ONLY with valid JSON — no markdown fencing, no explanation.`;

// =============================================================================
// AI GENERATION
// =============================================================================

async function generateWithKimiDirect(content: string): Promise<{ text: string; model: string } | null> {
  const apiKey = process.env.MOONSHOT_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'moonshot-v1-auto',
        messages: [
          { role: 'system', content: DISTILLATION_PROMPT },
          { role: 'user', content: `Analyze this text:\n\n${content.substring(0, 1500000)}` }, // ~1.5M chars for safety
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.warn(`[Kimi] API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json() as any;
    return {
      text: data.choices?.[0]?.message?.content || '',
      model: data.model || 'moonshot-v1-auto',
    };
  } catch (error) {
    console.warn('[Kimi] Error:', (error as Error).message);
    return null;
  }
}

async function generateWithClaudeDirect(content: string): Promise<{ text: string; model: string } | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    // Limit content for Claude's context window (~150K chars safe)
    const truncated = content.substring(0, 150000);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: DISTILLATION_PROMPT,
        messages: [
          { role: 'user', content: `Analyze this text:\n\n${truncated}` },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.warn(`[Claude] API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json() as any;
    return {
      text: data.content?.[0]?.text || '',
      model: data.model || 'claude-sonnet-4-20250514',
    };
  } catch (error) {
    console.warn('[Claude] Error:', (error as Error).message);
    return null;
  }
}

function parseDistillateJSON(text: string): any | null {
  // Try direct parse
  try {
    return JSON.parse(text);
  } catch {}

  // Try extracting JSON from markdown fences
  const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {}
  }

  // Try finding first { to last }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(text.substring(start, end + 1));
    } catch {}
  }

  return null;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('═'.repeat(60));
  console.log('  Library Distillate Generation Pipeline');
  console.log('═'.repeat(60));
  console.log(`  Dry run: ${isDryRun}`);
  console.log(`  Force:   ${isForce}`);
  console.log(`  Limit:   ${limitArg || 'all'}`);
  console.log(`  Type:    ${typeFilter || 'all'}`);
  console.log('');

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness',
  });

  try {
    await pool.query('SELECT 1');
    console.log('[1/3] Database connected');

    // Find sources that need distillation
    let sql = `
      SELECT s.id, s.title, s.author, s.type, s.token_count_total, s.chunk_count
      FROM library_sources s
      WHERE s.ingestion_status = 'completed'
    `;
    const params: any[] = [];

    if (!isForce) {
      sql += ` AND NOT EXISTS (SELECT 1 FROM library_distillates d WHERE d.source_id = s.id)`;
    }

    if (typeFilter) {
      params.push(typeFilter);
      sql += ` AND s.type = $${params.length}`;
    }

    sql += ` ORDER BY s.type = 'book' DESC, s.type = 'teaching' DESC, s.token_count_total DESC`;

    if (limitArg > 0) {
      sql += ` LIMIT ${limitArg}`;
    }

    const sources = await pool.query(sql, params);
    console.log(`[2/3] Found ${sources.rows.length} sources to distill\n`);

    if (sources.rows.length === 0) {
      console.log('[DONE] All sources already have distillates.');
      return;
    }

    if (isDryRun) {
      console.log('Sources to distill:');
      for (const s of sources.rows) {
        console.log(`  ${s.type.padEnd(10)} | ${s.title.substring(0, 50).padEnd(52)} | ${s.chunk_count || '?'} chunks | ${s.token_count_total || '?'} tokens`);
      }
      console.log('\nRun without --dry-run to generate distillates.');
      return;
    }

    // Check API availability
    const hasKimi = !!process.env.MOONSHOT_API_KEY;
    const hasClaude = !!process.env.ANTHROPIC_API_KEY;
    console.log(`  Kimi available:   ${hasKimi}`);
    console.log(`  Claude available: ${hasClaude}`);
    if (!hasKimi && !hasClaude) {
      console.error('  ERROR: No AI API keys found. Set MOONSHOT_API_KEY or ANTHROPIC_API_KEY');
      process.exit(1);
    }

    // Process sources
    console.log('\n[3/3] Generating distillates...\n');
    let generated = 0;
    let errors = 0;

    for (let i = 0; i < sources.rows.length; i++) {
      const source = sources.rows[i];
      console.log(`  [${i + 1}/${sources.rows.length}] ${source.title}`);

      try {
        // Load all chunks for this source
        const chunks = await pool.query(
          'SELECT content FROM library_chunks WHERE source_id = $1 ORDER BY chunk_index',
          [source.id]
        );

        if (chunks.rows.length === 0) {
          console.log('    → No chunks found, skipping');
          continue;
        }

        const fullText = chunks.rows.map((r: any) => r.content).join('\n\n---\n\n');
        console.log(`    → ${chunks.rows.length} chunks, ${fullText.length} chars`);

        // Try Kimi first (larger context), then Claude
        let result: { text: string; model: string } | null = null;

        if (hasKimi) {
          console.log('    → Generating with Kimi...');
          result = await generateWithKimiDirect(fullText);
        }

        if (!result && hasClaude) {
          console.log('    → Generating with Claude...');
          result = await generateWithClaudeDirect(fullText);
        }

        if (!result) {
          console.log('    → FAILED: No AI response');
          errors++;
          continue;
        }

        // Parse JSON response
        const parsed = parseDistillateJSON(result.text);
        if (!parsed) {
          console.log('    → FAILED: Could not parse JSON response');
          console.log('    → Raw:', result.text.substring(0, 200));
          errors++;
          continue;
        }

        // Add provenance
        parsed.provenance = {
          source_id: source.id,
          title: source.title,
          author: source.author,
          file_path: '',
          chunk_ids_used: [],
        };

        // Ensure required fields
        parsed.summary_short = parsed.summary_short || 'No summary generated';
        parsed.summary_long = parsed.summary_long || '';
        parsed.definitions = parsed.definitions || [];
        parsed.practices = parsed.practices || [];
        parsed.warnings = parsed.warnings || [];
        parsed.facet_tags = parsed.facet_tags || [];
        parsed.archetypes = parsed.archetypes || [];
        parsed.key_quotes = parsed.key_quotes || [];

        // If force, delete existing distillate first
        if (isForce) {
          await pool.query('DELETE FROM library_distillates WHERE source_id = $1', [source.id]);
        }

        // Store distillate
        await pool.query(
          `INSERT INTO library_distillates (source_id, level, payload, model_used)
           VALUES ($1, 'source', $2, $3)`,
          [source.id, JSON.stringify(parsed), result.model]
        );

        generated++;
        console.log(`    ✓ Generated (${result.model}) — ${parsed.facet_tags.length} facets, ${parsed.practices.length} practices, ${parsed.key_quotes.length} quotes`);

      } catch (error) {
        console.error(`    → ERROR:`, (error as Error).message);
        errors++;
      }

      // Rate limit
      if (i < sources.rows.length - 1) {
        await new Promise(r => setTimeout(r, RATE_LIMIT_MS));
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log(`  Generated: ${generated}`);
    console.log(`  Errors:    ${errors}`);

    const distillateCount = await pool.query('SELECT COUNT(*) as count FROM library_distillates');
    console.log(`  Total distillates in database: ${distillateCount.rows[0].count}`);

    console.log('\n[DONE] Distillate generation complete.');

  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error('[FATAL]', error);
  process.exit(1);
});
