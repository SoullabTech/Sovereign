/**
 * WS2-04A — the migration census. READ ONLY.
 *
 * Before any Working Draft can become section-addressable, one question has to
 * be answered per draft, and answered mechanically:
 *
 *   Is this draft still byte-for-byte what the immutable Source composed?
 *
 * If yes, its section boundaries are known exactly and it can be seeded into
 * section-addressable form losslessly. If no, the member has edited it, and
 * where their edits belong is NOT derivable — a paragraph moved across a
 * chapter break, a heading rewritten, a section merged. Attributing those by
 * heading search or diff would be guessing about someone's book.
 *
 * So a divergent draft is REFUSED, not migrated cleverly. This script only
 * reports which is which. It writes nothing, and it prints no member prose —
 * lengths, hashes and offsets only, never content.
 *
 * Run:
 *   npx tsx scripts/ws2-04a-draft-census.ts
 */

import { createHash } from 'crypto';
import { query } from '../lib/db/postgres';

/**
 * The HISTORICAL composition algorithm, copied verbatim from
 * app/api/sovereign/manuscripts/[id]/draft/route.ts.
 *
 * Deliberately duplicated rather than imported. The census must compare
 * against the algorithm as it WAS when these drafts were composed; importing
 * the live one would make the census silently follow any future change to it
 * and start reporting drafts as clean that are not. If that route's composer
 * changes, this copy must stay put and the divergence becomes a finding.
 */
function composeDraftText(sections: { heading: string | null; body: string }[]): string {
  const parts: string[] = [];
  for (const s of sections) {
    const heading = s.heading?.trim();
    if (heading) {
      parts.push(heading);
      parts.push('');
    }
    parts.push(s.body);
    parts.push('');
  }
  return parts.join('\n');
}

const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 12);

/** First index where two strings differ, or -1. Offsets only — never text. */
function firstDivergence(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
}

async function main() {
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

  let safe = 0;
  let refused = 0;

  console.log(`\nWS2-04A DRAFT CENSUS — ${drafts.rows.length} working draft(s)\n`);

  for (const d of drafts.rows) {
    const sections = await query<{ heading: string | null; body: string }>(
      `SELECT heading, body FROM manuscript_sections
        WHERE manuscript_id = $1 ORDER BY position ASC`,
      [d.manuscript_id],
    );
    const recomposed = composeDraftText(sections.rows);
    const identical = recomposed === d.content;
    const at = identical ? -1 : firstDivergence(recomposed, d.content);

    /* CORRECTED after the first run. "REFUSE = member edits" was too coarse:
       a draft with NO source sections was never composed from a Source at all
       — it is a blank page someone started writing on. Calling that "edits
       whose section ownership cannot be proven" implies a Source it never had.

       Both are still refusals for migration, but for opposite reasons, and
       04A's design depends on the difference: an edited draft needs a
       member-facing act to section-address it; a blank-page draft needs
       sections to exist at all. Conflating them would have produced a schema
       that answers neither. */
    const kind = identical
      ? 'SEEDABLE'
      : sections.rows.length === 0
        ? 'NO-SOURCE'
        : 'EDITED';

    if (identical) safe++;
    else refused++;

    console.log(`  ${kind.padEnd(9)} ${d.title ?? '(untitled)'}`);
    console.log(`     manuscript   ${d.manuscript_id}`);
    console.log(`     sections     ${sections.rows.length}`);
    console.log(`     draft chars  ${d.content.length}  (sha ${sha(d.content)})`);
    console.log(`     source chars ${recomposed.length}  (sha ${sha(recomposed)})`);
    console.log(`     revisions    ${d.revision_count}`);
    if (kind === 'EDITED') {
      console.log(`     diverges at  char ${at} of ${Math.min(recomposed.length, d.content.length)}`);
      console.log(`     → member edits present; section ownership is not derivable.`);
      console.log(`       PRESERVED AS IS. Not a defect — a book someone wrote in.`);
    } else if (kind === 'NO-SOURCE') {
      console.log(`     → no source sections: this draft was never composed from a`);
      console.log(`       Source. A blank page someone started writing on. It cannot`);
      console.log(`       be seeded because there is nothing to seed FROM, which is a`);
      console.log(`       different problem from an edited draft.`);
    }
    console.log('');
  }

  console.log(`  ${safe} losslessly seedable · ${refused} not seedable\n`);
  if (refused > 0) {
    console.log('  A refusal is the correct outcome, not a blocker to route around.');
    console.log('  Section-addressing an edited draft requires a member-facing act,');
    console.log('  never an inference about where their sentences belong.\n');
  }
  process.exit(0);
}

main().catch((e) => {
  console.error('census failed:', e?.message ?? e);
  process.exit(1);
});
