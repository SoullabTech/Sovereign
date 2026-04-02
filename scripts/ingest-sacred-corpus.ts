#!/usr/bin/env npx tsx
/**
 * Sacred Learning Corpus Ingestion Script
 *
 * Reads theme JSON files from data/sacred-learning/themes/
 * and inserts them into PostgreSQL.
 *
 * Validates each entry against Sacred Source Integrity Policy:
 * - authority_level present and valid (1-6)
 * - Level 1 must have Arabic text + surah reference
 * - All commentary must have author + work
 * - review_status must be explicitly set
 *
 * Usage: npx tsx scripts/ingest-sacred-corpus.ts
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness',
});

const THEMES_DIR = join(__dirname, '..', 'data', 'sacred-learning', 'themes');

interface ThemeFile {
  theme: {
    slug: string;
    name: string;
    arabicTerm?: string;
    description?: string;
    displayOrder: number;
  };
  sources: Array<{
    ref: string;
    authorityLevel: number;
    author?: string;
    work: string;
    translator?: string;
    translationEdition?: string;
    sourceEdition?: string;
    language: string;
    reviewStatus: string;
  }>;
  passages: Array<{
    dayNumber: number;
    sourceRef: string;
    authorityLevel: number;
    surahName?: string;
    surahNumber?: number;
    ayahStart?: number;
    ayahEnd?: number;
    sectionRef?: string;
    arabicText?: string;
    translationText: string;
    contextNote?: string;
    translator?: string;
    translationEdition?: string;
    reviewStatus: string;
    sensitivityFlags: string[];
    commentary: Array<{
      sourceRef: string;
      authorityLevel: number;
      author: string;
      work: string;
      sectionRef?: string;
      translator?: string;
      text: string;
      reviewStatus: string;
      displayOrder: number;
    }>;
    practices: Array<{
      practiceType: string;
      text: string;
      authorityLevel: number;
      label: string;
      reviewStatus: string;
    }>;
    reflectionPrompt: string;
  }>;
}

// ─── Validation ─────────────────────────────────────────────

function validate(data: ThemeFile): string[] {
  const errors: string[] = [];

  for (const passage of data.passages) {
    const ref = `Day ${passage.dayNumber}`;

    if (passage.authorityLevel < 1 || passage.authorityLevel > 6) {
      errors.push(`${ref}: invalid authority_level ${passage.authorityLevel}`);
    }

    if (passage.authorityLevel === 1) {
      if (!passage.arabicText) errors.push(`${ref}: Level 1 passage missing Arabic text`);
      if (!passage.surahNumber) errors.push(`${ref}: Level 1 passage missing surah_number`);
      if (!passage.ayahStart) errors.push(`${ref}: Level 1 passage missing ayah_start`);
    }

    if (!passage.reviewStatus) {
      errors.push(`${ref}: missing review_status`);
    }

    for (const c of passage.commentary) {
      if (!c.author) errors.push(`${ref} commentary: missing author`);
      if (!c.work) errors.push(`${ref} commentary: missing work`);
      if (!c.reviewStatus) errors.push(`${ref} commentary: missing review_status`);
      if (c.authorityLevel < 2 || c.authorityLevel > 6) {
        errors.push(`${ref} commentary: invalid authority_level ${c.authorityLevel}`);
      }
    }

    for (const p of passage.practices) {
      if (!p.reviewStatus) errors.push(`${ref} practice: missing review_status`);
    }
  }

  return errors;
}

// ─── Ingestion ──────────────────────────────────────────────

async function ingestThemeFile(filePath: string) {
  const raw = readFileSync(filePath, 'utf-8');
  const data: ThemeFile = JSON.parse(raw);

  console.log(`\n--- Ingesting: ${data.theme.name} ---`);

  // Validate
  const errors = validate(data);
  if (errors.length > 0) {
    console.error('VALIDATION ERRORS:');
    errors.forEach(e => console.error(`  - ${e}`));
    console.error('Aborting this theme.');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Upsert theme
    const themeResult = await client.query(
      `INSERT INTO sacred_themes (slug, name, arabic_term, description, display_order)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO UPDATE SET name = $2, arabic_term = $3, description = $4, display_order = $5
       RETURNING id`,
      [data.theme.slug, data.theme.name, data.theme.arabicTerm, data.theme.description, data.theme.displayOrder]
    );
    const themeId = themeResult.rows[0].id;
    console.log(`  Theme: ${data.theme.slug} → ${themeId}`);

    // 2. Upsert sources (keyed by ref within this file)
    const sourceIdMap = new Map<string, string>();
    for (const src of data.sources) {
      const result = await client.query(
        `INSERT INTO sacred_sources (authority_level, author, work, translator, translation_edition, source_edition, language, review_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [src.authorityLevel, src.author, src.work, src.translator, src.translationEdition, src.sourceEdition, src.language, src.reviewStatus]
      );
      sourceIdMap.set(src.ref, result.rows[0].id);
      console.log(`  Source: ${src.ref} → ${result.rows[0].id}`);
    }

    // 3. Upsert passages + commentary + practices + themes link
    for (const passage of data.passages) {
      const sourceId = sourceIdMap.get(passage.sourceRef);
      if (!sourceId) {
        console.error(`  Passage day ${passage.dayNumber}: source ref '${passage.sourceRef}' not found. Skipping.`);
        continue;
      }

      const passageResult = await client.query(
        `INSERT INTO sacred_passages
         (source_id, authority_level, surah_name, surah_number, ayah_start, ayah_end,
          section_ref, arabic_text, translation_text, context_note,
          translator, translation_edition, review_status, sensitivity_flags, day_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING id`,
        [
          sourceId, passage.authorityLevel,
          passage.surahName, passage.surahNumber, passage.ayahStart, passage.ayahEnd,
          passage.sectionRef, passage.arabicText, passage.translationText, passage.contextNote,
          passage.translator, passage.translationEdition, passage.reviewStatus,
          passage.sensitivityFlags, passage.dayNumber,
        ]
      );
      const passageId = passageResult.rows[0].id;
      console.log(`  Passage day ${passage.dayNumber}: ${passageId}`);

      // Link passage to theme
      await client.query(
        `INSERT INTO sacred_passage_themes (passage_id, theme_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [passageId, themeId]
      );

      // Commentary
      for (const c of passage.commentary) {
        const cSourceId = sourceIdMap.get(c.sourceRef) || sourceId;
        await client.query(
          `INSERT INTO sacred_commentary
           (passage_id, source_id, authority_level, text, section_ref, author, work, translator, review_status, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [passageId, cSourceId, c.authorityLevel, c.text, c.sectionRef, c.author, c.work, c.translator, c.reviewStatus, c.displayOrder]
        );
      }

      // Practices
      for (const p of passage.practices) {
        await client.query(
          `INSERT INTO sacred_practices
           (passage_id, theme_id, authority_level, practice_type, text, label, review_status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [passageId, themeId, p.authorityLevel, p.practiceType, p.text, p.label, p.reviewStatus]
        );
      }

      // Reflection prompt as a practice entry (authority_level 6)
      if (passage.reflectionPrompt) {
        await client.query(
          `INSERT INTO sacred_practices
           (passage_id, theme_id, authority_level, practice_type, text, label, review_status)
           VALUES ($1, $2, 6, 'contemplation', $3, 'Reflection Prompt (AI-composed)', 'approved')`,
          [passageId, themeId, passage.reflectionPrompt]
        );
      }
    }

    await client.query('COMMIT');
    console.log(`  DONE: ${data.passages.length} passages ingested.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('  FAILED:', err);
    throw err;
  } finally {
    client.release();
  }
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  console.log('Sacred Learning Corpus Ingestion');
  console.log('================================');

  const files = readdirSync(THEMES_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} theme file(s) in ${THEMES_DIR}`);

  for (const file of files) {
    await ingestThemeFile(join(THEMES_DIR, file));
  }

  console.log('\n================================');
  console.log('Ingestion complete.');

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
