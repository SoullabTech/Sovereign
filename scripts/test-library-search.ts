#!/usr/bin/env npx tsx
/**
 * Living Library Search Verification
 *
 * Tests the Library search pipeline end-to-end:
 * 1. Database connectivity and table existence
 * 2. Chunk count and embedding coverage
 * 3. Semantic search quality
 * 4. Element boost verification
 * 5. Spiralogic metadata distribution
 * 6. Dynamic range decision logic
 *
 * Usage:
 *   DATABASE_URL="postgresql://soullab@localhost:5432/maia_consciousness" npx tsx scripts/test-library-search.ts
 */

import pg from 'pg';
import { calculateDynamicRange } from '../lib/library/dynamicRange';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness',
});

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.log(`  ✗ ${message}`);
    failed++;
  }
}

async function main() {
  console.log('═'.repeat(60));
  console.log('  Living Library — Search Verification');
  console.log('═'.repeat(60));

  try {
    await pool.query('SELECT 1');
    console.log('  Database connected\n');
  } catch (error) {
    console.error('  ERROR: Cannot connect to database');
    process.exit(1);
  }

  // ===== TEST 1: Tables exist =====
  console.log('[1] Table Existence');
  const tables = ['library_sources', 'library_chunks', 'library_distillates', 'library_search_log'];
  for (const table of tables) {
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1",
      [table]
    );
    assert(result.rows[0].count > 0, `${table} exists`);
  }

  // ===== TEST 2: Data populated =====
  console.log('\n[2] Data Population');
  const sourceCount = await pool.query('SELECT COUNT(*)::int as count FROM library_sources WHERE ingestion_status = $1', ['completed']);
  const chunkCount = await pool.query('SELECT COUNT(*)::int as count FROM library_chunks');
  const embeddedCount = await pool.query('SELECT COUNT(*)::int as count FROM library_chunks WHERE embedding IS NOT NULL');

  const sources = sourceCount.rows[0].count;
  const chunks = chunkCount.rows[0].count;
  const embedded = embeddedCount.rows[0].count;

  console.log(`  Sources: ${sources} | Chunks: ${chunks} | Embedded: ${embedded}`);
  assert(sources > 0, `Has completed sources (${sources})`);
  assert(chunks > 0, `Has chunks (${chunks})`);
  assert(embedded > 0, `Has embedded chunks (${embedded})`);
  assert(embedded / chunks > 0.9, `>90% embedding coverage (${Math.round(embedded / chunks * 100)}%)`);

  // ===== TEST 3: Spiralogic metadata =====
  console.log('\n[3] Spiralogic Metadata Distribution');
  const elementDist = await pool.query(`
    SELECT meta->>'element' as element, COUNT(*)::int as count
    FROM library_chunks
    WHERE meta->>'element' IS NOT NULL
    GROUP BY meta->>'element'
    ORDER BY count DESC
  `);

  if (elementDist.rows.length > 0) {
    for (const row of elementDist.rows) {
      console.log(`    ${row.element}: ${row.count} chunks`);
    }
    assert(elementDist.rows.length >= 3, `Multiple elements tagged (${elementDist.rows.length} elements)`);
  } else {
    console.log('    No elements tagged');
    assert(false, 'At least some chunks should be element-tagged');
  }

  const phaseDist = await pool.query(`
    SELECT meta->>'phase' as phase, COUNT(*)::int as count
    FROM library_chunks
    WHERE meta->>'phase' IS NOT NULL
    GROUP BY meta->>'phase'
    ORDER BY phase
  `);
  if (phaseDist.rows.length > 0) {
    for (const row of phaseDist.rows) {
      console.log(`    Phase ${row.phase}: ${row.count} chunks`);
    }
  }

  // ===== TEST 4: Source type distribution =====
  console.log('\n[4] Source Type Distribution');
  const typeDist = await pool.query(`
    SELECT type, COUNT(*)::int as count
    FROM library_sources
    WHERE ingestion_status = 'completed'
    GROUP BY type
    ORDER BY count DESC
  `);
  for (const row of typeDist.rows) {
    console.log(`    ${row.type}: ${row.count} sources`);
  }
  assert(typeDist.rows.length > 0, 'Has source types');

  // ===== TEST 5: Semantic search (requires Ollama) =====
  console.log('\n[5] Semantic Search');
  try {
    // Check Ollama availability
    const ollamaCheck = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'nomic-embed-text', prompt: 'test' }),
    });

    if (ollamaCheck.ok) {
      const testQueries = [
        'shadow work and individuation',
        'courage to begin something new',
        'embodied practice and grounding',
        'what is consciousness',
      ];

      for (const queryText of testQueries) {
        const embedResponse = await fetch('http://localhost:11434/api/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'nomic-embed-text', prompt: queryText }),
        });
        const embedData = await embedResponse.json() as { embedding: number[] };
        const embedding = embedData.embedding;

        const searchResult = await pool.query(`
          SELECT
            c.id,
            c.meta->>'element' as element,
            s.title,
            1 - (c.embedding <=> $1::vector) as score
          FROM library_chunks c
          JOIN library_sources s ON c.source_id = s.id
          WHERE c.embedding IS NOT NULL
          ORDER BY c.embedding <=> $1::vector
          LIMIT 3
        `, [JSON.stringify(embedding)]);

        if (searchResult.rows.length > 0) {
          const topScore = searchResult.rows[0].score;
          console.log(`    "${queryText}" → top score: ${topScore.toFixed(3)} | "${searchResult.rows[0].title}" (${searchResult.rows[0].element || 'untagged'})`);
          assert(topScore > 0.2, `"${queryText}" finds relevant content (score ${topScore.toFixed(3)} > 0.2)`);
        } else {
          assert(false, `"${queryText}" returned results`);
        }
      }
    } else {
      console.log('    Ollama not available — skipping semantic search tests');
      console.log('    (Start Ollama to test: ollama serve)');
    }
  } catch (error) {
    console.log('    Ollama not available — skipping semantic search tests');
  }

  // ===== TEST 6: Dynamic Range Logic (pure logic, no DB needed) =====
  console.log('\n[6] Dynamic Range Decision Logic');

  const test1 = calculateDynamicRange('teach me about shadow work', {
    element: 'water', phase: 2, motion: 'stuck',
    relationalPhase: 2, conversationDepth: 5,
  });
  assert(test1.shouldConsult === true, 'Consults on "teach me about shadow work" (depth 5)');
  assert(test1.elementBoost === 'water', 'Element boost set to water');
  assert(test1.retrievalLimit >= 4, `Stuck motion increases limit (${test1.retrievalLimit})`);

  const test2 = calculateDynamicRange('teach me about shadow work', {
    conversationDepth: 1,
  });
  assert(test2.shouldConsult === false, 'Does NOT consult at conversation depth 1');

  const test3 = calculateDynamicRange('how is the weather today', {
    conversationDepth: 10,
  });
  assert(test3.shouldConsult === false, 'Does NOT consult for non-wisdom messages');

  const test4 = calculateDynamicRange('tell me about individuation', {
    element: 'fire', phase: 1,
    relationalPhase: 3, conversationDepth: 8,
  });
  assert(test4.shouldConsult === true, 'Consults on "individuation"');
  assert(test4.framingLevel === 'minimal', `Autonomy phase uses minimal framing (${test4.framingLevel})`);
  assert(test4.retrievalLimit <= 3, `Autonomy phase limits retrieval (${test4.retrievalLimit})`);

  const test5 = calculateDynamicRange('what is consciousness and awakening', {
    element: 'aether', phase: 3, motion: 'breakthrough',
    relationalPhase: 2, conversationDepth: 12,
  });
  assert(test5.shouldConsult === true, 'Consults on consciousness question');
  assert(test5.elementBoost === 'aether', 'Aether boost for consciousness query');

  // ===== TEST 7: Water/Aether behavioral validation =====
  console.log('\n[7] Water/Aether Retrieval Behavior');
  try {
    const ollamaCheck7 = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'nomic-embed-text', prompt: 'test' }),
    });

    if (ollamaCheck7.ok) {
      const waterAetherQueries: { query: string; targetElements: string[] }[] = [
        { query: 'I feel a heavy grief I can\'t name', targetElements: ['water'] },
        { query: 'how do I soften shame', targetElements: ['water'] },
        { query: 'dream about death and rebirth', targetElements: ['water', 'aether'] },
        { query: 'I feel empty but not depressed', targetElements: ['aether'] },
        { query: 'what is presence', targetElements: ['aether'] },
        { query: 'I\'m in a threshold and don\'t know what\'s next', targetElements: ['aether', 'water'] },
        { query: 'nonduality and suffering', targetElements: ['aether', 'water'] },
        { query: 'silence feels terrifying', targetElements: ['aether'] },
      ];

      for (const { query: queryText, targetElements } of waterAetherQueries) {
        const embedResponse = await fetch('http://localhost:11434/api/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'nomic-embed-text', prompt: queryText }),
        });
        const embedData = await embedResponse.json() as { embedding: number[] };
        const embedding = embedData.embedding;

        // Search top 5 with element boost for the target element
        const targetEl = targetElements[0];
        const searchResult = await pool.query(`
          SELECT
            c.meta->>'element' as element,
            c.meta->>'element_secondary' as element_secondary,
            s.title,
            (1 - (c.embedding <=> $1::vector))
            + CASE WHEN c.meta->>'element' = $2 THEN 0.15
                   WHEN c.meta->>'element_secondary' = $2 THEN 0.08
                   ELSE 0 END as score
          FROM library_chunks c
          JOIN library_sources s ON c.source_id = s.id
          WHERE c.embedding IS NOT NULL
          ORDER BY score DESC
          LIMIT 5
        `, [JSON.stringify(embedding), targetEl]);

        if (searchResult.rows.length > 0) {
          // Count how many of top 5 match target elements (primary or secondary)
          let targetHits = 0;
          for (const row of searchResult.rows) {
            if (targetElements.includes(row.element) || targetElements.includes(row.element_secondary)) {
              targetHits++;
            }
          }
          const topElements = searchResult.rows.map(r => r.element || '?').join(', ');
          const passThreshold = targetHits >= 2;
          console.log(`    "${queryText.substring(0, 45)}..." → ${targetHits}/5 ${targetElements.join('/')} hits [${topElements}]`);
          assert(passThreshold, `"${queryText.substring(0, 30)}..." has ≥2 ${targetElements.join('/')} in top 5 (got ${targetHits})`);
        }
      }
    } else {
      console.log('    Ollama not available — skipping Water/Aether validation');
    }
  } catch (error) {
    console.log('    Ollama not available — skipping Water/Aether validation');
  }

  // ===== TEST 8: Secondary element distribution =====
  console.log('\n[8] Secondary Element Distribution');
  const secondaryDist = await pool.query(`
    SELECT meta->>'element_secondary' as element, COUNT(*)::int as count
    FROM library_chunks
    WHERE meta->>'element_secondary' IS NOT NULL
    GROUP BY meta->>'element_secondary'
    ORDER BY count DESC
  `);
  if (secondaryDist.rows.length > 0) {
    for (const row of secondaryDist.rows) {
      console.log(`    ${row.element}: ${row.count} chunks`);
    }
    assert(secondaryDist.rows.length >= 3, `Has secondary elements (${secondaryDist.rows.length} distinct)`);
  } else {
    console.log('    No secondary elements found');
    assert(false, 'Has secondary element tags');
  }

  // ===== SUMMARY =====
  console.log('\n' + '═'.repeat(60));
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('  ✓ All tests passed');
  } else {
    console.log(`  ✗ ${failed} test(s) failed`);
  }
  console.log('═'.repeat(60));

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('[FATAL]', error);
  process.exit(1);
});
