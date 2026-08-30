/**
 * WS2-04A — the migration census. READ ONLY.
 *
 * Before any Working Draft can become section-addressable, one question has to
 * be answered per draft, and answered mechanically:
 *
 *   Is this draft still byte-for-byte what the immutable Source composed?
 *
 * The answer used to be binary — matches, or the member edited it — and that
 * was wrong in three directions. A draft may match a DIFFERENT, older composer
 * and be equally seedable. A draft may have no source sections at all, having
 * never been composed from anything. And the instruments may disagree, which
 * is a fault in them rather than a fact about the book. So the question is
 * answered by the shared rule in scripts/lib/draftProof.ts, which names all
 * five outcomes.
 *
 * Where a draft genuinely IS edited, where those edits belong is NOT derivable
 * — a paragraph moved across a chapter break, a heading rewritten, a section
 * merged. Attributing those by heading search or diff would be guessing about
 * someone's book.
 *
 * So a divergent draft is REFUSED, not migrated cleverly. This script only
 * reports which is which. It writes nothing, and it prints no member prose —
 * lengths, hashes and offsets only, never content.
 *
 * The verdict comes from scripts/lib/draftProof.ts — the same rule the
 * per-manuscript proof applies, imported rather than restated, so the two
 * instruments cannot drift into disagreeing about the same book.
 *
 * A NOTE ON WHAT A CENSUS CAN CLAIM. This describes the drafts that exist on
 * the day it runs. "No EDITED drafts" is never an architectural finding that
 * edited drafts do not occur: any draft becomes EDITED the moment a member
 * types into it. Read the counts as a population at a date, not as a property
 * of the system.
 *
 * Run:
 *   npx tsx scripts/ws2-04a-draft-census.ts
 */

import { createHash } from 'crypto';
import { query } from '../lib/db/postgres';
import { COMPOSERS } from './lib/composers';
import { classifyDraft, type Classification } from './lib/draftProof';

const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 12);

/** First index where two strings differ, or -1. Offsets only — never text. */
function firstDivergence(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
}

async function main() {
  /* NAME THE POPULATION, from the database's own answer rather than from an
     env var this script might have misread. Twice during 04A a run was very
     nearly made against the wrong data — once from a directory with no repo,
     once against a local dev database that does not hold these manuscripts —
     and in neither case would the output have said so. A census that does not
     name what it counted is one `cd` away from lying. */
  const where = await query<{
    db: string; host: string | null; port: number | null; user: string;
  }>(`SELECT current_database() AS db,
             host(coalesce(inet_server_addr(), '127.0.0.1'::inet)) AS host,
             inet_server_port() AS port,
             current_user AS "user"`);
  const w = where.rows[0];
  console.log(`\n  counted against  ${w.user}@${w.host ?? 'local socket'}:${w.port ?? '-'}/${w.db}`);
  console.log(`  at               ${new Date().toISOString()}`);

  const drafts = await query<{
    manuscript_id: string;
    title: string | null;
    content: string;
    revision_count: number;
    updated_at: string;
  }>(
    `SELECT d.manuscript_id, m.title, d.content, d.revision_count, d.updated_at
       FROM manuscript_working_drafts d
       JOIN member_manuscripts m ON m.id = d.manuscript_id
      ORDER BY d.updated_at DESC`,
  );

  const tally: Record<Classification, number> = {
    PRISTINE: 0,
    LEGACY_COMPOSER_VARIANT: 0,
    NO_SOURCE: 0,
    EDITED: 0,
    WITHHELD: 0,
  };

  console.log(`\nWS2-04A DRAFT CENSUS — ${drafts.rows.length} working draft(s)\n`);

  for (const d of drafts.rows) {
    const sections = await query<{ heading: string | null; body: string }>(
      `SELECT heading, body FROM manuscript_sections
        WHERE manuscript_id = $1 ORDER BY position ASC`,
      [d.manuscript_id],
    );
    /* CORRECTED after Stage 2. Comparing against ONE composer made a draft
       composed by the other look edited: Elemental Alchemy reported EDITED
       with 173 divergent lines, every one a heading, every one exactly +2
       chars — the `# ` prefix the composer used before 2026-08-05.

       A draft can only be judged against the algorithm that actually made it,
       so every known composer is tried. Still exact: a draft equals one of
       them byte-for-byte or it does not. No fuzzy matching was introduced to
       rescue this — a second exact hypothesis was. */
    let recomposed = COMPOSERS[0].compose(sections.rows);
    let composer: string = COMPOSERS[0].name;
    for (const c of COMPOSERS) {
      const text = c.compose(sections.rows);
      if (text === d.content) { recomposed = text; composer = c.name; break; }
    }
    const identical = recomposed === d.content;
    const at = identical ? -1 : firstDivergence(recomposed, d.content);

    /* This loop and classifyDraft reach the same conclusion by different
       routes. They must never disagree — if they do, one of them is wrong and
       neither verdict is usable. Fail loudly rather than print a number
       someone would act on.

       The proposition has to match the rule exactly, INCLUDING the sourceless
       case: with no sections both composers emit '', so an empty draft is
       "exact" against a composition that never happened. hasSource is what
       keeps this loop from asserting a match the rule rightly refuses. */
    const hasSource = sections.rows.length > 0;
    const composerExact = hasSource && identical;
    const seedableClasses = ['PRISTINE', 'LEGACY_COMPOSER_VARIANT'];

    /* CORRECTED after the first run. "REFUSE = member edits" was too coarse:
       a draft with NO source sections was never composed from a Source at all
       — it is a blank page someone started writing on. Calling that "edits
       whose section ownership cannot be proven" implies a Source it never had.

       Both are still refusals for migration, but for opposite reasons, and
       04A's design depends on the difference: an edited draft needs a
       member-facing act to section-address it; a blank-page draft needs
       sections to exist at all. Conflating them would have produced a schema
       that answers neither. */
    /* The verdict is the shared rule's to give, not this script's. It
       distinguishes PRISTINE from LEGACY_COMPOSER_VARIANT — both seedable,
       but by different mechanics — and can return WITHHELD, which the older
       SEEDABLE/EDITED/NO-SOURCE vocabulary had no way to express. */
    const verdict = classifyDraft(sections.rows, d.content);
    const kind = verdict.classification;
    if (composerExact !== seedableClasses.includes(kind)) {
      console.error(`\n  INSTRUMENT FAULT on ${d.manuscript_id}:`);
      console.error(`    composer loop says ${composerExact ? 'exact' : 'divergent'};`);
      console.error(`    classifyDraft says ${kind}. Census aborted — fix this first.\n`);
      process.exit(1);
    }
    tally[kind]++;

    console.log(`  ${kind.padEnd(23)} ${d.title ?? '(untitled)'}`);
    console.log(`     manuscript   ${d.manuscript_id}`);
    console.log(`     sections     ${sections.rows.length}`);
    console.log(`     draft chars  ${d.content.length}  (sha ${sha(d.content)})`);
    console.log(`     source chars ${recomposed.length}  (sha ${sha(recomposed)})`);
    console.log(`     revisions    ${d.revision_count}`);
    if (composerExact) console.log(`     composed by  ${composer}`);
    if (kind === 'LEGACY_COMPOSER_VARIANT') {
      const p = verdict.proof;
      console.log(`     legacy form  ${p.exactLegacy}/${p.headedCount} headings, ${p.bodyDiff} body differences`);
      console.log(`     boundaries   ${p.resolved}/${p.boundaries} resolved`);
      console.log(`     → composed before 5f50f6790 and unedited since. Seedable`);
      console.log(`       exactly; the "# " scaffold drops mechanically.`);
    } else if (kind === 'WITHHELD') {
      const p = verdict.proof;
      console.log(`     → whole draft matches the legacy composer, but the line pass`);
      console.log(`       cannot account for every difference (${p.exactLegacy}/${p.headedCount} headings,`);
      console.log(`       ${p.otherHeadingDiff} other, ${p.bodyDiff} body, ${p.resolved}/${p.boundaries} boundaries).`);
      console.log(`       An instrument fault, not a finding about this book. Do not`);
      console.log(`       migrate on a result that cannot be fully explained.`);
    } else if (kind === 'EDITED') {
      const p = verdict.proof;
      console.log(`     edits        ${p.otherHeadingDiff} heading, ${p.bodyDiff} body line(s)`);
      console.log(`     boundaries   ${p.resolved}/${p.boundaries} resolved`);
      console.log(`     diverges at  char ${at} of ${Math.min(recomposed.length, d.content.length)}`);
      /* CORRECTED after the first production census. "EDITED ⇒ ownership is
         not derivable" was too coarse, and the finer instrument contradicted
         it on both real books: every heading byte-identical, every boundary
         located by identity, every edit inside body text. When no heading
         differs and every boundary resolves, each edit lies within exactly
         one section — attribution is mechanical, not inferred, and telling
         the writer their book cannot be section-addressed would be false.

         Ownership stops being derivable when a boundary itself moves: a
         heading rewritten or deleted, sections merged, text carried across a
         break. That is what the two counts below distinguish. */
      if (p.resolved === p.boundaries && p.otherHeadingDiff === 0) {
        console.log(`     → edits are body-only and every boundary is located by`);
        console.log(`       identity, so each edit falls inside exactly one section.`);
        console.log(`       Section ownership IS derivable here. Seedable with the`);
        console.log(`       member's text preserved verbatim — no ceremony owed.`);
      } else {
        console.log(`     → a boundary itself moved; section ownership is not`);
        console.log(`       derivable. PRESERVED AS IS. Not a defect — a book`);
        console.log(`       someone wrote in. Only the writer can say where the`);
        console.log(`       break now falls.`);
      }
    } else if (kind === 'NO_SOURCE') {
      console.log(`     → no source sections: this draft was never composed from a`);
      console.log(`       Source. A blank page someone started writing on. It cannot`);
      console.log(`       be seeded because there is nothing to seed FROM, which is a`);
      console.log(`       different problem from an edited draft.`);
    }
    console.log('');
  }

  const seedable = tally.PRISTINE + tally.LEGACY_COMPOSER_VARIANT;
  const refused = tally.EDITED + tally.NO_SOURCE + tally.WITHHELD;
  /* An EDITED draft is not automatically un-seedable — see the per-draft
     boundary lines above. This split counts composer-exact drafts only. */

  console.log('  ── population ──────────────────────────────────────────');
  console.log(`  PRISTINE                 ${tally.PRISTINE}\tcurrent composer, exact`);
  console.log(`  LEGACY_COMPOSER_VARIANT  ${tally.LEGACY_COMPOSER_VARIANT}\tlegacy composer, exact`);
  console.log(`  EDITED                   ${tally.EDITED}\tmatches no composer that ever ran`);
  console.log(`  NO_SOURCE                ${tally.NO_SOURCE}\tnever composed from a Source`);
  console.log(`  WITHHELD                 ${tally.WITHHELD}\tinstruments disagree — fix before migrating`);
  console.log('');
  console.log(`  ${seedable} composer-exact · ${refused} not (see boundary lines above:`);
  console.log(`  an EDITED draft whose boundaries all resolve is still seedable)\n`);

  if (tally.EDITED > 0) {
    console.log('  A refusal is the correct outcome, not a blocker to route around.');
    console.log('  Section-addressing an edited draft requires a member-facing act,');
    console.log('  never an inference about where their sentences belong.\n');
  } else {
    console.log('  No EDITED draft in TODAY\'S population. That is a fact about these');
    console.log('  drafts on this date — not a finding that edited drafts do not occur.');
    console.log('  Any draft becomes EDITED the moment a member types into it, so the');
    console.log('  Structure Adoption contract stays defined for the first real case.\n');
  }
  if (tally.WITHHELD > 0) {
    console.log('  ⚠ WITHHELD present. Do not design or migrate against this census');
    console.log('    until the line pass explains those drafts.\n');
  }
  process.exit(0);
}

main().catch((e) => {
  console.error('census failed:', e?.message ?? e);
  process.exit(1);
});
