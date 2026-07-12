/**
 * Seed the What Now? demo field's program doors — the experiential walk.
 *
 * Larry models experientially, not conceptually (Kelly, 2026-07-12): the
 * one-page map orients, but the doors must be WALKABLE. This seeds the four
 * program doors from the map (coaching / group / training / retreat) on the
 * demo field and prints the door links to hand out. The fifth door —
 * Personal Explorer — is the generic field door and needs no row.
 *
 * Practitioner-authored layer only (field_programs): this writes NO member
 * positions — enrollment is declared by arrival, never seeded by script
 * (catalog spec §2). Idempotent upserts; safe to re-run.
 *
 * Usage:
 *   npx tsx scripts/seed-larry-program-doors.ts                     # local dev
 *   npx tsx scripts/seed-larry-program-doors.ts --base-url https://soullab.life
 *   npx tsx scripts/seed-larry-program-doors.ts --field-slug <slug> --field-focal-point "..."
 *
 * Production (after PR #595 deploys — table must exist):
 *   run inside the container on minisforum with DATABASE_URL set.
 */

import { Client } from 'pg';

interface Args {
  fieldSlug: string;
  baseUrl: string;
  databaseUrl: string;
  fieldFocalPoint: string | null;
}

function parseArgs(): Args {
  const a = process.argv.slice(2);
  const get = (flag: string): string | null => {
    const i = a.indexOf(flag);
    return i >= 0 && a[i + 1] ? a[i + 1] : null;
  };
  return {
    fieldSlug: get('--field-slug') ?? 'now-what-demo',
    baseUrl: get('--base-url') ?? 'http://localhost:3000',
    databaseUrl:
      get('--database-url') ?? process.env.DATABASE_URL ?? 'postgresql://soullab@localhost:5432/maia_consciousness',
    fieldFocalPoint: get('--field-focal-point'),
  };
}

// The four doors from Larry's one-page map. Focal points are demo defaults in
// the program's own shape — Larry re-authors them in his working session
// (curriculum is practitioner-authored; this script only stands in until his
// authoring surface exists, same as the field corpus seeding did).
const DOORS: Array<{
  program: string;
  kind: 'coaching' | 'training' | 'workshop' | 'course' | 'retreat';
  title: string;
  focalPoints: string[];
  currentFocalPoint: string;
}> = [
  {
    program: 'coaching',
    kind: 'coaching',
    title: '1:1 Coaching',
    focalPoints: [], // coaching has no fixed sequence — a moving focal point only
    currentFocalPoint: 'What we’re working on together',
  },
  {
    program: 'thursday-group',
    kind: 'workshop',
    title: 'Thursday Group',
    focalPoints: [],
    currentFocalPoint: 'This week’s circle',
  },
  {
    program: 'training',
    kind: 'course',
    title: 'Training',
    focalPoints: ['Module 1', 'Module 2', 'Module 3', 'Module 4'],
    currentFocalPoint: 'Module 3',
  },
  {
    program: 'retreat',
    kind: 'retreat',
    title: 'Deep Dive Retreat',
    focalPoints: ['Preparation', 'Descent', 'Return', 'Integration'],
    currentFocalPoint: 'Retreat integration',
  },
];

async function main() {
  const args = parseArgs();
  const db = new Client({ connectionString: args.databaseUrl });
  await db.connect();
  try {
    const field = await db.query('SELECT field_slug FROM practice_fields WHERE field_slug = $1', [args.fieldSlug]);
    if (field.rows.length === 0) {
      throw new Error(`no practice field with slug '${args.fieldSlug}' — refusing to seed doors into a field that does not exist`);
    }

    for (const d of DOORS) {
      await db.query(
        `INSERT INTO field_programs (field_slug, program_slug, kind, title, focal_points, current_focal_point, focal_point_set_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (field_slug, program_slug)
         DO UPDATE SET kind = EXCLUDED.kind, title = EXCLUDED.title,
                       focal_points = EXCLUDED.focal_points,
                       current_focal_point = EXCLUDED.current_focal_point,
                       focal_point_set_at = NOW(), updated_at = NOW()`,
        [args.fieldSlug, d.program, d.kind, d.title, JSON.stringify(d.focalPoints), d.currentFocalPoint],
      );
      console.log(`seeded door: ${d.title} (${d.kind}) — current focus: ${d.currentFocalPoint}`);
    }

    if (args.fieldFocalPoint) {
      await db.query(
        `UPDATE practice_fields SET current_focal_point = $2, focal_point_set_at = NOW() WHERE field_slug = $1`,
        [args.fieldSlug, args.fieldFocalPoint],
      );
      console.log(`field-level focal point set: ${args.fieldFocalPoint}`);
    }

    const room = `${args.baseUrl}/now-what/room?phase=fire_1&fieldContext=${args.fieldSlug}`;
    console.log('\nDoor links (hand the right link in the right context — that IS provisioning):');
    for (const d of DOORS) console.log(`  ${d.title.padEnd(18)} ${room}&program=${d.program}`);
    console.log(`  ${'Personal Explorer'.padEnd(18)} ${room}   (generic door — offers only member-declared engagements)`);
  } finally {
    await db.end();
  }
}

main().catch((e) => {
  console.error('seed failed:', e.message ?? e);
  process.exit(1);
});
