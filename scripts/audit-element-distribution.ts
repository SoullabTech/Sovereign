#!/usr/bin/env npx tsx
/**
 * Element Distribution Audit
 *
 * Measures element tagging health across the Living Library corpus.
 * Run before and after classifier tuning to measure impact.
 *
 * Outputs:
 *   1. Tagged counts by element
 *   2. Untagged chunk count
 *   3. Near-miss analysis (chunks just below threshold)
 *   4. Cross-contamination check (Fire/Earth chunks with Water/Aether signals)
 *   5. Stratified sample export for human review
 *
 * Usage:
 *   npx tsx scripts/audit-element-distribution.ts
 *   npx tsx scripts/audit-element-distribution.ts --export  (saves to artifacts/)
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import {
  scoreElement,
  type SpiralogicElement,
} from '../lib/library/spiralogicTagger';

const ELEMENTS: SpiralogicElement[] = ['fire', 'water', 'earth', 'air', 'aether'];
const CURRENT_THRESHOLD = 3;
const EXPORT_MODE = process.argv.includes('--export');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness',
  });

  try {
    console.log('════════════════════════════════════════════════════════════');
    console.log('  Element Distribution Audit');
    console.log('════════════════════════════════════════════════════════════\n');

    // ──────────────────────────────────────────────────────────
    // 1. Current distribution
    // ──────────────────────────────────────────────────────────
    console.log('[1] Current Element Distribution');
    console.log('────────────────────────────────────────────────────────────');

    const distResult = await pool.query(`
      SELECT
        meta->>'element' as element,
        COUNT(*) as count
      FROM library_chunks
      GROUP BY meta->>'element'
      ORDER BY count DESC
    `);

    let totalChunks = 0;
    let untaggedCount = 0;
    const taggedCounts: Record<string, number> = {};

    for (const row of distResult.rows) {
      const el = row.element || 'untagged';
      const count = parseInt(row.count);
      totalChunks += count;
      if (el === 'untagged') {
        untaggedCount = count;
      } else {
        taggedCounts[el] = count;
      }
    }

    const taggedTotal = totalChunks - untaggedCount;
    for (const el of ELEMENTS) {
      const count = taggedCounts[el] || 0;
      const pct = taggedTotal > 0 ? ((count / taggedTotal) * 100).toFixed(1) : '0';
      console.log(`  ${el.padEnd(8)} ${String(count).padStart(6)} chunks  (${pct}% of tagged)`);
    }
    console.log(`  ${'untagged'.padEnd(8)} ${String(untaggedCount).padStart(6)} chunks`);
    console.log(`  ${'TOTAL'.padEnd(8)} ${String(totalChunks).padStart(6)} chunks\n`);

    // ──────────────────────────────────────────────────────────
    // 2. Near-miss analysis
    // ──────────────────────────────────────────────────────────
    console.log('[2] Near-Miss Analysis (chunks just below threshold)');
    console.log('────────────────────────────────────────────────────────────');

    // Sample untagged chunks and re-score
    const untaggedSample = await pool.query(`
      SELECT id, content, meta
      FROM library_chunks
      WHERE meta->>'element' IS NULL
         OR meta->>'element' = ''
      ORDER BY RANDOM()
      LIMIT 2000
    `);

    const nearMissCounts: Record<string, { at2: number; at1: number }> = {};
    for (const el of ELEMENTS) {
      nearMissCounts[el] = { at2: 0, at1: 0 };
    }

    for (const row of untaggedSample.rows) {
      const text = row.content.substring(0, 3000);
      for (const el of ELEMENTS) {
        const score = scoreElement(text, el);
        if (score === 2) nearMissCounts[el].at2++;
        if (score === 1) nearMissCounts[el].at1++;
      }
    }

    const sampleRatio = untaggedCount / Math.max(untaggedSample.rows.length, 1);

    console.log(`  Sampled ${untaggedSample.rows.length} of ${untaggedCount} untagged chunks`);
    console.log(`  (Extrapolated counts use ratio ${sampleRatio.toFixed(1)}x)\n`);

    console.log('  Element    Score=2 (near-miss)    Score=1    Est. recovered at threshold=2');
    console.log('  ────────   ───────────────────    ───────    ────────────────────────────');
    for (const el of ELEMENTS) {
      const nm = nearMissCounts[el];
      const estRecovered = Math.round(nm.at2 * sampleRatio);
      console.log(`  ${el.padEnd(10)} ${String(nm.at2).padStart(5)} (est ~${estRecovered})       ${String(nm.at1).padStart(5)}      ${el === 'water' || el === 'aether' ? `→ +${estRecovered} chunks ★` : `→ +${estRecovered} chunks`}`);
    }

    // ──────────────────────────────────────────────────────────
    // 3. Cross-contamination check
    // ──────────────────────────────────────────────────────────
    console.log('\n[3] Cross-Contamination (Fire/Earth with Water/Aether signals)');
    console.log('────────────────────────────────────────────────────────────');

    const fireEarthSample = await pool.query(`
      SELECT id, content, meta
      FROM library_chunks
      WHERE meta->>'element' IN ('fire', 'earth')
      ORDER BY RANDOM()
      LIMIT 1000
    `);

    let dualTagCandidates = 0;
    let waterSignalInFire = 0;
    let aetherSignalInEarth = 0;

    for (const row of fireEarthSample.rows) {
      const text = row.content.substring(0, 3000);
      const currentEl = row.meta?.element;
      const waterScore = scoreElement(text, 'water');
      const aetherScore = scoreElement(text, 'aether');

      if (waterScore >= 2 || aetherScore >= 2) {
        dualTagCandidates++;
      }
      if (currentEl === 'fire' && waterScore >= 2) waterSignalInFire++;
      if (currentEl === 'earth' && aetherScore >= 2) aetherSignalInEarth++;
    }

    const feRatio = (taggedCounts.fire || 0 + taggedCounts.earth || 0) / Math.max(fireEarthSample.rows.length, 1);
    console.log(`  Sampled ${fireEarthSample.rows.length} Fire/Earth chunks`);
    console.log(`  Dual-tag candidates (Water/Aether score ≥ 2): ${dualTagCandidates} (est ~${Math.round(dualTagCandidates * feRatio)})`);
    console.log(`  Water signal in Fire chunks: ${waterSignalInFire}`);
    console.log(`  Aether signal in Earth chunks: ${aetherSignalInEarth}`);

    // ──────────────────────────────────────────────────────────
    // 4. Score distribution for all elements (full picture)
    // ──────────────────────────────────────────────────────────
    console.log('\n[4] Score Distribution Across All Sampled Chunks');
    console.log('────────────────────────────────────────────────────────────');

    const allSample = await pool.query(`
      SELECT id, content, meta
      FROM library_chunks
      ORDER BY RANDOM()
      LIMIT 3000
    `);

    const scoreDistribution: Record<string, Record<number, number>> = {};
    for (const el of ELEMENTS) {
      scoreDistribution[el] = {};
    }

    for (const row of allSample.rows) {
      const text = row.content.substring(0, 3000);
      for (const el of ELEMENTS) {
        const score = scoreElement(text, el);
        if (!scoreDistribution[el][score]) scoreDistribution[el][score] = 0;
        scoreDistribution[el][score]++;
      }
    }

    console.log('  Element    Score: 0     1     2     3     4     5+');
    console.log('  ────────   ─────────────────────────────────────────');
    for (const el of ELEMENTS) {
      const dist = scoreDistribution[el];
      const s0 = dist[0] || 0;
      const s1 = dist[1] || 0;
      const s2 = dist[2] || 0;
      const s3 = dist[3] || 0;
      const s4 = dist[4] || 0;
      const s5plus = Object.entries(dist)
        .filter(([k]) => parseInt(k) >= 5)
        .reduce((sum, [, v]) => sum + v, 0);
      console.log(`  ${el.padEnd(10)} ${String(s0).padStart(5)} ${String(s1).padStart(5)} ${String(s2).padStart(5)} ${String(s3).padStart(5)} ${String(s4).padStart(5)} ${String(s5plus).padStart(5)}`);
    }

    // ──────────────────────────────────────────────────────────
    // 5. Stratified sample export (optional)
    // ──────────────────────────────────────────────────────────
    if (EXPORT_MODE) {
      console.log('\n[5] Exporting Stratified Sample');
      console.log('────────────────────────────────────────────────────────────');

      const strata: { element: string | null; sql_filter: string; count: number }[] = [
        { element: 'fire', sql_filter: `meta->>'element' = 'fire'`, count: 50 },
        { element: 'earth', sql_filter: `meta->>'element' = 'earth'`, count: 50 },
        { element: null, sql_filter: `meta->>'element' IS NULL`, count: 50 },
        { element: 'air', sql_filter: `meta->>'element' = 'air'`, count: 50 },
      ];

      const samples: any[] = [];

      for (const stratum of strata) {
        const result = await pool.query(`
          SELECT id, content, meta
          FROM library_chunks
          WHERE ${stratum.sql_filter}
          ORDER BY RANDOM()
          LIMIT ${stratum.count}
        `);

        for (const row of result.rows) {
          const text = row.content.substring(0, 3000);
          const scores: Record<string, number> = {};
          for (const el of ELEMENTS) {
            scores[el] = scoreElement(text, el);
          }

          samples.push({
            id: row.id,
            current_tag: row.meta?.element || 'untagged',
            excerpt: row.content.substring(0, 400),
            scores,
            would_tag_at_2: Object.entries(scores)
              .filter(([, s]) => s >= 2)
              .sort((a, b) => b[1] - a[1])
              .map(([el]) => el),
          });
        }
      }

      const artifactsDir = path.join(process.cwd(), 'artifacts');
      if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

      const outPath = path.join(artifactsDir, 'element-audit.json');
      fs.writeFileSync(outPath, JSON.stringify(samples, null, 2));
      console.log(`  Exported ${samples.length} samples to ${outPath}`);
    } else {
      console.log('\n  (Run with --export to save stratified sample to artifacts/element-audit.json)');
    }

    // ──────────────────────────────────────────────────────────
    // Summary
    // ──────────────────────────────────────────────────────────
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('  Summary');
    console.log('════════════════════════════════════════════════════════════');

    const waterNearMiss = Math.round(nearMissCounts.water.at2 * sampleRatio);
    const aetherNearMiss = Math.round(nearMissCounts.aether.at2 * sampleRatio);
    console.log(`  Estimated Water recovery at threshold=2: ~${waterNearMiss} chunks`);
    console.log(`  Estimated Aether recovery at threshold=2: ~${aetherNearMiss} chunks`);
    console.log(`  Combined potential lift: ~${waterNearMiss + aetherNearMiss} chunks from untagged`);
    console.log(`  Dual-tag candidates in Fire/Earth: ~${Math.round(dualTagCandidates * feRatio)} chunks`);
    console.log(`  (Soft cues will add further recovery beyond these estimates)`);

  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error('[FATAL]', error);
  process.exit(1);
});
