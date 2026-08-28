/**
 * Seed the Now What? Flourishing Field (demo) — practice field content for the
 * What Now? room's field composition (fieldContext=now-what-demo).
 *
 * Identity model (Representation & Claim Discipline): the field is held by a
 * clearly-labeled DEMO practitioner identity (`larry.demo`, the michael.demo
 * hygiene pattern), because Larry Closs has no member identity and creating one
 * for him pre-consent would cross the representation line. The content is
 * authored by Kelly from Larry's Now What? materials (docs/fields/larry/*) and
 * carries that provenance in the field itself. When Larry's own authoring act
 * replaces this, swapping the slug's holder is a one-row update.
 *
 * Content discipline (per FLOURISHING_NOW_WHAT_FIELD_CONCEPT.md §II, §VIII):
 *   - the framework is offered as a lens, never unsolicited categorization
 *   - no flourishing scores/levels/profiles, no domain assignment
 *   - MAIA may surface Larry's teaching with provenance ("Larry writes…"),
 *     never speaks AS him
 * These land as Layer 4 guidance (narrow-only, validated at save and compose).
 *
 * Idempotent: re-running updates the same rows. Targets LOCAL dev by default;
 * production markers are refused (deploy-time prod seeding goes through
 * Kelly's gate, like every prod act).
 *
 * Usage: npx tsx scripts/seed/seed-flourishing-field.ts [--database-url <dsn>] [--slug now-what-demo]
 */

import { createRequire } from 'node:module';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

import {
  FLOURISHING_DOMAIN_SLUGS,
  flourishingDomainSentenceList,
  assertFlourishingVocabulary,
} from '../../lib/nowWhat/flourishingDomains.js';

// NW-D01.5 R1: fail loudly at startup rather than composing a vocabulary the
// database would reject. Drift becomes a crash, not a prompt.
assertFlourishingVocabulary(FLOURISHING_DOMAIN_SLUGS);

const PROD_MARKERS = ['soullab.life', '192.168.0.104', 'minisforum'];

const DEMO_USERNAME = 'larry.demo';
const DEMO_NAME = 'Larry Closs (Demo)';

const FIELD_CONTENT = {
  welcome_message:
    'Welcome. This room holds your Now What? practice between our conversations — ' +
    'a place to keep the thread alive, in your own words.',
  // NW-D01.5 R2 (2026-08-26): this column composes DIRECTLY into MAIA's system
  // prompt (practiceFieldService.formatFieldContextForRoom line ~292), and it
  // does so OUTSIDE the corpus gate — `corpusIsComposable()` returns false
  // unconditionally, but `about_practice` bypasses it entirely.
  //
  // It previously asserted Larry's central claim ("flourishing is not a
  // destination — it is a practice") and described his framework. Both are
  // class-D material (Soullab-derived from a talk corpus that is NOT held),
  // unratified, and unlicensed — the Materials Agreement is unsigned and
  // Attachment A does not exist. Placing them here put unratified practitioner
  // doctrine into every room turn of any field this seeds.
  //
  // The demo field stays a demo field. It no longer makes a claim about Larry's
  // practice. When Larry authors his own field, that act replaces this text.
  about_practice:
    'Demo practice field for the Now What? room. This text is Soullab-authored ' +
    'scaffolding for development and walkthroughs — it makes no claim about any ' +
    "real practitioner's method, framework, or teaching. Practitioner-authored " +
    'content enters only through the practitioner’s own authoring act, under a ' +
    'signed materials agreement and an itemised inventory.',
  how_we_work_together:
    'The atomic unit of this work is the practice loop, not the session: an encounter with ' +
    'Larry → the person chooses one practice (one domain, one experiment) → lives it between ' +
    'sessions → reflects privately with MAIA → carries what mattered back to the next ' +
    'conversation. Between encounters, this room keeps the practice thread alive. Not living ' +
    'a practice is information about the practice or the season — never a failure of the person.',
  how_maia_supports:
    "MAIA is the member's own companion between encounters — not Larry's chatbot, and never a " +
    "substitute for him. She may surface Larry's authored teaching with provenance " +
    '("Larry writes…", "Larry’s practice offers…") but never speaks as him. The Now What? ' +
    'framework is offered as an invitation when the member reaches for it — never as ' +
    'unsolicited categorization. There are no flourishing scores, levels, or assessments, ' +
    'ever: recognition asks what became visible through living, not how flourishing someone is.',
  // NW-A02 repair 4 (founder ruling 2026-08-26): this column is declared in
  // 20260701000001_practice_fields.sql for "jurisdictional declarations
  // (required for LIVE)" — not biography, method, or positioning. It carried an
  // unratified prose description of a real named practitioner, which composed
  // as "The practitioner: …". It no longer composes at all (see
  // formatFieldContextForRoom), and the prose is removed rather than left inert.
  professional_practice:
    'Demo practitioner profile — no jurisdictional declaration on file.',
  orientation_style: 'guided',
  maia_guidance: {
    // NW-D01.5 R1: derived from the ONE shared source, never restated here.
    // This previously named five domains including an invented "attention".
    preferred_language:
      `flourishing-practice vocabulary — the six domains (${flourishingDomainSentenceList()}) ` +
      'as lenses the member may pick up, never labels applied to them',
    boundaries: [
      'never assign a domain to what the member shares — offer the lens only when they reach for it',
      "no flourishing scores, levels, profiles, or 'you're strongest in…' statements",
    ],
    forbidden_engagements: [
      'do not simulate Larry or speak as him — surface his teaching only with provenance',
      'no flourishing assessments of any kind',
    ],
  },
};

function parseArgs(argv: string[]) {
  let databaseUrl =
    process.env.SEED_DATABASE_URL ||
    process.env.DATABASE_URL ||
    'postgresql://soullab@localhost:5432/maia_consciousness';
  let slug = 'now-what-demo';
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--database-url') databaseUrl = argv[++i];
    else if (argv[i] === '--slug') slug = argv[++i];
    else throw new Error(`unknown flag: ${argv[i]}`);
  }
  for (const marker of PROD_MARKERS) {
    if (databaseUrl.includes(marker)) {
      throw new Error(
        `REFUSED: database "${databaseUrl}" targets production (${marker}). ` +
          'Prod seeding is a deploy-time act behind the deploy gate.',
      );
    }
  }
  return { databaseUrl, slug };
}

async function main() {
  const { databaseUrl, slug } = parseArgs(process.argv);
  const req = createRequire(join(APP_ROOT, 'package.json'));
  const { Client } = req('pg');
  const db = new Client({ connectionString: databaseUrl });
  await db.connect();
  try {
    // Demo practitioner identity — labeled, tester=true (structural analytics
    // exclusion), password sign-in impossible (sentinel non-hex hash).
    const member = await db.query(
      `INSERT INTO members (passkey, username, password_hash, name, email, onboarded, onboarding_step, tester)
       VALUES ('SOULLAB-DEMO-LARRY', $1, '!DEMO-NO-PASSWORD-LOGIN!', $2, 'larry.demo@synthetic.invalid', true, 'complete', true)
       ON CONFLICT (username) DO UPDATE SET name = EXCLUDED.name, tester = true
       RETURNING id`,
      [DEMO_USERNAME, DEMO_NAME],
    );
    const practitionerId = member.rows[0].id as string;

    const field = await db.query(
      `INSERT INTO practice_fields (
         practitioner_member_id, field_slug, welcome_message, about_practice,
         how_we_work_together, how_maia_supports, professional_practice,
         orientation_style, maia_guidance,
         -- NW-A02 repair 5: the demo field ratifies its OWN identity text.
         -- That text is now plainly Soullab-authored demo scaffolding making no
         -- claim about a real practitioner (NW-D01.5 R2), so ratifying it asserts
         -- nothing on anyone's behalf. A real practitioner field ratifies by
         -- their own act; unratified identity text does not compose.
         identity_ratified_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
       ON CONFLICT (practitioner_member_id) DO UPDATE SET
         field_slug = EXCLUDED.field_slug,
         welcome_message = EXCLUDED.welcome_message,
         about_practice = EXCLUDED.about_practice,
         how_we_work_together = EXCLUDED.how_we_work_together,
         how_maia_supports = EXCLUDED.how_maia_supports,
         identity_ratified_at = NOW(),
         professional_practice = EXCLUDED.professional_practice,
         orientation_style = EXCLUDED.orientation_style,
         maia_guidance = EXCLUDED.maia_guidance
       RETURNING id, field_slug`,
      [
        practitionerId,
        slug,
        FIELD_CONTENT.welcome_message,
        FIELD_CONTENT.about_practice,
        FIELD_CONTENT.how_we_work_together,
        FIELD_CONTENT.how_maia_supports,
        FIELD_CONTENT.professional_practice,
        FIELD_CONTENT.orientation_style,
        JSON.stringify(FIELD_CONTENT.maia_guidance),
      ],
    );
    console.log(
      `seeded: practitioner ${DEMO_USERNAME} (${practitionerId.slice(0, 8)}…) · ` +
        `field ${field.rows[0].id} · slug '${field.rows[0].field_slug}'`,
    );
    console.log('removal: DELETE FROM practice_fields WHERE practitioner_member_id = (SELECT id FROM members WHERE username = \'larry.demo\'); DELETE FROM members WHERE username = \'larry.demo\';');
  } finally {
    await db.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
