/**
 * Seed a DEMONSTRATION program + materials into a practice field.
 *
 * Spec: docs/specs/developmental-environment/PRACTITIONER_PROGRAM_PLATFORM_ADR_2026-07-14.md
 *
 * Never auto-run; never part of any deploy. Requires an explicit field slug:
 *   npx tsx scripts/seed-demo-program-platform.ts --field <field-slug>
 *
 * Everything seeded is clearly labeled DEMONSTRATION CONTENT. This script
 * contains no practitioner IP and must never be pointed at real authored
 * material — the IP instrument gates that, not this script
 * (docs/fields/larry/LARRY_MATERIALS_AGREEMENT_ONE_PAGE_2026-07-13.md).
 */

import { query, closePool } from '../lib/db/postgres';
import {
  addLinkMaterial,
  createProgram,
  upsertLesson,
  updateMaterial,
  type AuthoredField,
} from '../lib/practiceField/programAuthoringService';

async function main() {
  const idx = process.argv.indexOf('--field');
  const fieldSlug = idx > -1 ? process.argv[idx + 1] : null;
  if (!fieldSlug) {
    console.error('Usage: npx tsx scripts/seed-demo-program-platform.ts --field <field-slug>');
    console.error('Refusing to guess a field. Nothing was written.');
    process.exit(2);
  }

  const res = await query(
    `SELECT id, field_slug, practitioner_member_id FROM practice_fields WHERE field_slug = $1`,
    [fieldSlug],
  );
  const row = res.rows[0];
  if (!row) {
    console.error(`No practice field with slug "${fieldSlug}". Nothing was written.`);
    process.exit(2);
  }
  const field: AuthoredField = {
    practiceFieldId: row.id,
    fieldSlug: row.field_slug,
    practitionerMemberId: row.practitioner_member_id,
  };

  console.log(`Seeding DEMONSTRATION program platform content into field "${fieldSlug}"…`);

  const m1 = await addLinkMaterial(field, {
    title: '[DEMONSTRATION] Orientation article',
    url: `https://example.com/demo/${fieldSlug}/orientation`,
    description: 'Demonstration content — not practitioner-authored material.',
    type: 'article',
  }).catch((e) => (console.log(`  material 1: ${e.message}`), null));
  const m2 = await addLinkMaterial(field, {
    title: '[DEMONSTRATION] Practice worksheet',
    url: `https://example.com/demo/${fieldSlug}/worksheet`,
    description: 'Demonstration content — not practitioner-authored material.',
    type: 'worksheet',
  }).catch((e) => (console.log(`  material 2: ${e.message}`), null));

  // Demonstration materials are ratified BY THE SCRIPT so the compose path is
  // walkable — acceptable only because the content is placeholder, labeled,
  // and owned by no one. Real material is ratified only by the practitioner.
  for (const m of [m1, m2]) {
    if (m) await updateMaterial(field, m.id, { status: 'ratified' });
  }

  const program = await createProgram(field, {
    title: '[DEMONSTRATION] Flourishing in Practice',
    kind: 'course',
    slug: 'demo-flourishing',
    focalPoints: ['Arriving', 'What matters now', 'One practice to live'],
  }).catch((e) => (console.log(`  program: ${e.message}`), null));

  if (program) {
    await upsertLesson(field, 'demo-flourishing', {
      focalPoint: 'Arriving',
      purpose: 'Demonstration: landing, and naming what is actually present.',
      materialIds: m1 ? [m1.id] : [],
      practice: 'Once a day, pause and name one thing that is actually going right.',
      reflectionPrompt: 'What did you notice when you paused?',
    });
    await upsertLesson(field, 'demo-flourishing', {
      focalPoint: 'One practice to live',
      purpose: 'Demonstration: choosing one small practice worth actually living.',
      materialIds: m2 ? [m2.id] : [],
      practice: 'Pick the smallest version of the practice you would actually do.',
      reflectionPrompt: 'What made it easy or hard to live this week?',
    });
  }

  console.log('Done. Everything seeded is labeled [DEMONSTRATION].');
  await closePool();
}

main().catch(async (e) => {
  console.error('seed failed:', e);
  await closePool().catch(() => {});
  process.exit(1);
});
