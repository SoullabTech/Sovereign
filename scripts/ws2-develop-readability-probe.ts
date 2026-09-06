/**
 * DEVELOP READABILITY PROBE — read-only. Writes nothing, ever.
 *
 *   DATABASE_URL=postgres://... npx tsx scripts/ws2-develop-readability-probe.ts [manuscriptId]
 *
 * WHY THIS EXISTS. The DEVELOP surface refuses `not_readable` at capture when
 * a Work has no rows in `manuscript_draft_sections` on a draft whose
 * `section_addressable_at` is set. That is a fact about the WORKING DRAFT, not
 * about the manuscript the member sees in WRITE — a Work can show 185 Source
 * sections in the outline and still be unreadable, because the outline is
 * `manuscript_sections` and DEVELOP reads the draft's partition.
 *
 * Drafts created before the "born section-addressable" rule (74bed57c,
 * 2026-09-02) are in exactly that state. This instrument reports, per draft,
 * whether the WS2-04A conversion service (`convertDraftToSections`) WOULD
 * partition it — by running the same pure planner it runs, against the same
 * content, with no side effects.
 *
 * WHAT IT IS NOT. Not a conversion. It never calls `convertDraftToSections`,
 * opens no transaction, and issues no INSERT or UPDATE. A verdict here is a
 * prediction about a conversion that has not happened and that this script
 * cannot cause. Running it many times changes nothing.
 *
 * NO MEMBER PROSE IS PRINTED. Structural counts and identifiers only.
 */

import { query } from '@/lib/db/postgres';
import { classifyDraft } from '@/lib/manuscript/sections/draftProof';
import { planConversion } from '@/lib/manuscript/sections/convertDraft';

interface DraftRow {
  draft_id: string;
  manuscript_id: string;
  title: string | null;
  content: string;
  version: string;
  section_addressable_at: Date | null;
  draft_sections: string;
}

async function main() {
  const only = process.argv[2];

  const drafts = await query<DraftRow>(
    `SELECT d.id AS draft_id, d.manuscript_id, m.title, d.content, d.version,
            d.section_addressable_at,
            (SELECT count(*) FROM manuscript_draft_sections s WHERE s.draft_id = d.id)::text
              AS draft_sections
       FROM manuscript_working_drafts d
       JOIN member_manuscripts m ON m.id = d.manuscript_id
      ${only ? 'WHERE d.manuscript_id = $1' : ''}
      ORDER BY d.created_at ASC`,
    only ? [only] : [],
  );

  if (drafts.rows.length === 0) {
    console.log(only ? `no working draft for manuscript ${only}` : 'no working drafts');
    return;
  }

  let readable = 0;
  let convertible = 0;
  let blocked = 0;

  for (const d of drafts.rows) {
    const sources = await query<{ id: string; heading: string | null; body: string }>(
      `SELECT id, heading, body FROM manuscript_sections
        WHERE manuscript_id = $1 ORDER BY position ASC`,
      [d.manuscript_id],
    );

    const label = `${d.title ?? '(untitled)'} · ${d.manuscript_id}`;

    if (d.section_addressable_at !== null && Number(d.draft_sections) > 0) {
      readable++;
      console.log(`READABLE          ${label}  (${d.draft_sections} draft sections)`);
      continue;
    }

    const verdict = classifyDraft(sources.rows, d.content);
    const plan = planConversion(d.content, sources.rows);
    const p = verdict.proof;
    const shape =
      `class=${verdict.classification} ` +
      `boundaries=${p.resolved}/${p.boundaries} ` +
      `headingDiff=${p.otherHeadingDiff} bodyDiff=${p.bodyDiff} ` +
      `source=${sources.rows.length} chars=${d.content.length}`;

    if (plan.ok) {
      convertible++;
      console.log(`WOULD CONVERT     ${label}\n                  ${shape} → ${plan.slices.length} slices`);
    } else {
      blocked++;
      console.log(
        `WOULD REFUSE      ${label}\n                  ${shape}\n` +
        `                  refusal=${plan.refusal}${plan.detail ? ` (${plan.detail})` : ''}` +
        (p.unresolved.length ? `\n                  unresolved sections: ${p.unresolved.slice(0, 20).join(', ')}${p.unresolved.length > 20 ? ` …+${p.unresolved.length - 20}` : ''}` : ''),
      );
    }
  }

  console.log(`\n${drafts.rows.length} draft(s) · ${readable} readable · ${convertible} would convert · ${blocked} would refuse`);
  console.log('nothing was written');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
