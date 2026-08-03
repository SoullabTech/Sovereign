/**
 * Seed demo content for the Now What? Client Home — executive coaching shape.
 *
 * WHAT THIS IS FOR: the Home renders only member-authored material, so an
 * empty database shows the (correct, first-class) empty state and you cannot
 * see the room's actual composition. This seeds one DEMO member's space so the
 * room can be looked at and walked.
 *
 * ⚠️ WHAT THIS IS NOT: evidence. Every row here is fiction written by a script
 * wearing a member's authorship. It demonstrates the SURFACE; it can never be
 * cited as a member's real material, and no walk finding may rest on it. Seeded
 * rows are tagged `source_session_ref = 'demo-exec-*'` precisely so they stay
 * identifiable as fiction and can be removed cleanly.
 *
 * SAFETY: requires an explicit --member. There is no default member and no
 * unscoped delete — the cleanup is narrowed to this script's own demo refs for
 * the named member. Do not point it at production.
 *
 * Usage:
 *   npx tsx scripts/seed/seed-executive-client-home.ts --member <username|passkey>
 *   npx tsx scripts/seed/seed-executive-client-home.ts --member demo --field-slug now-what-demo
 *   npx tsx scripts/seed/seed-executive-client-home.ts --member demo --clean   # remove demo rows only
 */

import { Client } from 'pg';

interface Args {
  member: string | null;
  fieldSlug: string;
  databaseUrl: string;
  clean: boolean;
}

function parseArgs(): Args {
  const a = process.argv.slice(2);
  const get = (flag: string): string | null => {
    const i = a.indexOf(flag);
    return i >= 0 && a[i + 1] ? a[i + 1] : null;
  };
  return {
    member: get('--member'),
    fieldSlug: get('--field-slug') ?? 'now-what-demo',
    databaseUrl:
      get('--database-url') ??
      process.env.DATABASE_URL ??
      'postgresql://soullab@localhost:5432/maia_consciousness',
    clean: a.includes('--clean'),
  };
}

/**
 * The demo space. Tags are the member gesture the Home groups by:
 *   decision  → Decisions band
 *   practice  → Commitments band
 *   question  → Questions you are exploring
 *   null      → Reflections (the default, not a leftover)
 *
 * `daysAgo` sets the member's KEEPING gesture, which is what the Home orders
 * by — not row creation.
 */
const THREADS: Array<{
  title: string;
  content: string;
  tag: string | null;
  daysAgo: number;
  session: string;
  shared?: boolean;
}> = [
  // ── Decisions ──────────────────────────────────────────────────────────
  {
    title: 'Whether to restructure the leadership team before or after the funding round',
    content:
      'Context: the org has outgrown the shape it was built in. Two of my directs are doing work that no longer matches their title.\n\nWhat I know: the current structure is costing us decision speed.\nWhat I don\'t know: whether doing this before the round reads as instability to the board.\nThe assumption I\'m testing: that the board would see it as instability at all — I have not actually asked.',
    tag: 'decision',
    daysAgo: 3,
    session: 'demo-exec-s4',
  },
  {
    title: 'Whether to keep owning the customer relationship for our two largest accounts',
    content:
      'Holding these myself is the last thing keeping me in the weeks rather than in the year.\n\nStakeholders: the two account leads, who have never been given full ownership; the CRO, who has asked for this twice.\nWhat changed after reflection: I framed this as a capacity problem. It is a trust problem, and it is mine.',
    tag: 'decision',
    daysAgo: 11,
    session: 'demo-exec-s3',
    shared: true,
  },

  // ── Commitments ────────────────────────────────────────────────────────
  {
    title: 'I will stop rescuing my team and start coaching them.',
    content:
      'Why it matters: every time I step in and solve it, I confirm they were right to wait for me.\n\nWhat I noticed: I did it twice in Tuesday\'s review before I caught myself. The third time I asked a question instead, and the room went quiet for a long moment — then someone else answered it.',
    tag: 'practice',
    daysAgo: 5,
    session: 'demo-exec-s4',
  },
  {
    title: 'In my next leadership meeting, ask three questions before offering a solution.',
    content:
      'What happened: I got to two. The third time I could feel the answer and said it.\nWhat surprised me: the two questions changed the problem enough that my answer would have been wrong.\nWhat I will adjust: say out loud at the start that I am going to ask before I answer.',
    tag: 'practice',
    daysAgo: 12,
    session: 'demo-exec-s3',
  },
  {
    title: 'I will have the conversation with Marcus I have been avoiding for six weeks.',
    content:
      'Why it matters: the avoidance is now more visible to the team than the issue is.',
    tag: 'practice',
    daysAgo: 19,
    session: 'demo-exec-s2',
    shared: true,
  },

  // ── Questions being lived ──────────────────────────────────────────────
  {
    title: 'What am I still holding because it is genuinely mine, and what because letting go would be uncomfortable?',
    content: '',
    tag: 'question',
    daysAgo: 6,
    session: 'demo-exec-s4',
  },
  {
    title: 'What does authority look like when I am no longer the person who knows the most in the room?',
    content: '',
    tag: 'question',
    daysAgo: 20,
    session: 'demo-exec-s2',
  },

  // ── Reflections (the default) ──────────────────────────────────────────
  {
    title: 'The board meeting went differently when I stopped pre-empting the objection.',
    content:
      'I usually answer the hard question before it is asked. This time I let it be asked. The conversation that followed was slower and much more useful.',
    tag: null,
    daysAgo: 8,
    session: 'demo-exec-s3',
  },
  {
    title: 'I notice I am most decisive on Thursday mornings and least on Monday.',
    content:
      'Not sure yet whether that is about the week or about what I schedule when.',
    tag: null,
    daysAgo: 15,
    session: 'demo-exec-s2',
  },
  {
    title: 'Being trusted and being needed are not the same thing, and I have been optimising for the second.',
    content: '',
    tag: null,
    daysAgo: 27,
    session: 'demo-exec-s1',
  },
];

/** The member's declared position — stated by them, in their words. */
const FOCAL_POINT = 'Leading through uncertainty';

async function main() {
  const args = parseArgs();
  if (!args.member) {
    console.error('✗ --member <username|passkey> is required. There is no default member.');
    process.exit(1);
  }

  const db = new Client({ connectionString: args.databaseUrl });
  await db.connect();

  try {
    const m = await db.query<{ id: string; name: string | null }>(
      `SELECT id, name FROM members WHERE username = $1 OR passkey = $1 LIMIT 1`,
      [args.member],
    );
    if (m.rowCount === 0) {
      console.error(`✗ No member matches "${args.member}" (checked username and passkey).`);
      process.exit(1);
    }
    const memberId = m.rows[0].id;
    console.log(`· member ${m.rows[0].name ?? '(unnamed)'} [${memberId.slice(0, 8)}]`);

    // Cleanup is scoped to this script's own demo rows for this member only —
    // never a blanket delete by member_id.
    const del = await db.query(
      `DELETE FROM member_field_note_threads
        WHERE member_id = $1 AND source_session_ref LIKE 'demo-exec-%'`,
      [memberId],
    );
    console.log(`· removed ${del.rowCount} existing demo row(s)`);

    if (args.clean) {
      await db.query(
        `DELETE FROM field_program_positions
          WHERE member_id = $1 AND field_slug = $2 AND focal_point = $3`,
        [memberId, args.fieldSlug, FOCAL_POINT],
      );
      console.log('✓ clean complete — demo content removed.');
      return;
    }

    for (const t of THREADS) {
      await db.query(
        `INSERT INTO member_field_note_threads
           (member_id, source_session_ref, title, content, authorship, is_directly_stated,
            member_confirmed, member_decision, member_decision_at, spiralogic_phase,
            field_context, can_be_shown_to_practitioner, consent_state, can_be_remembered,
            created_at)
         VALUES ($1, $2, $3, $4, 'member_authored', true, true, 'create',
                 NOW() - ($5 || ' days')::interval, $6, $7, $8,
                 'member-confirmed-memory', true, NOW() - ($5 || ' days')::interval)`,
        [
          memberId,
          t.session,
          t.title,
          t.content || t.title,
          String(t.daysAgo),
          t.tag,
          args.fieldSlug,
          t.shared === true,
        ],
      );
    }
    console.log(`· seeded ${THREADS.length} authored thread(s)`);

    // Position: member_stated, in their own words — not practitioner_seeded,
    // because a script standing in for a coach would misattribute authorship.
    await db.query(
      `INSERT INTO field_program_positions
         (field_slug, program_slug, member_id, focal_point, stated_by, member_confirmed_at)
       VALUES ($1, 'coaching', $2, $3, 'member_stated', NOW() - interval '21 days')
       ON CONFLICT DO NOTHING`,
      [args.fieldSlug, memberId, FOCAL_POINT],
    );
    console.log(`· position: "${FOCAL_POINT}" (member_stated)`);

    console.log(`\n✓ Seeded. Open:  /now-what?fieldContext=${args.fieldSlug}`);
    console.log('  ⚠️  Demo fiction — not evidence. Remove with --clean.');
  } finally {
    await db.end();
  }
}

main().catch((err) => {
  console.error('✗ seed failed:', err?.message || err);
  process.exit(1);
});
