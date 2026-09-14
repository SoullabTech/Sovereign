/**
 * EW-F2 · PW-3 — WHICH SECTIONS ARE SUSPENDED, ANSWERED BY THE SERVER.
 *
 * ⭐⭐ WHY THIS EXISTS. PW-3 says proposal work suspends the TARGET section and
 * nothing else. If it suspended more, a writer would find their book quietly
 * read-only while a proposal was open, with nothing on screen saying so — the
 * one obligation in this set that fails INVISIBLY.
 *
 * ⛔ AND IT CANNOT BE WITNESSED BY LOOKING. The Studio's editors are
 * transparent and borderless by design, so a writable section and a suspended
 * one are pixel-identical until a cursor lands in one. Asking the founder "did
 * a caret appear" put a perceptual judgement in the path of a structural fact,
 * and a screenshot cannot carry the answer. That was an instrumentation
 * failure, not a witness failure.
 *
 * So this asks the same two functions the route asks, in the same order, and
 * prints the resolved authority for every section.
 *
 * ⛔ READ-ONLY. No INSERT, no UPDATE, no acceptance. It cannot move the Work
 * and it cannot spend a proposal.
 */
import { query } from '@/lib/db/postgres';
import { resolveDraftWriteState } from '@/lib/manuscript/sections/saveSection';
import { resolveProposalWork } from '@/lib/manuscript/revisionProposal/proposalWork';
import {
  authorityFromProjectability, type SectionAuthority,
} from '@/lib/writersStudio/sectionAuthority';

const MANUSCRIPT = 'a3ae67fd-a21e-4948-8766-4c397d2e4712';

function arg(name: string): string | null {
  const i = process.argv.indexOf(name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

async function main() {
  const proposalId = arg('--proposal');
  if (!proposalId) {
    console.error('usage: --proposal <uuid>');
    process.exit(2);
  }

  const d = await query<{ member_id: string; version: string }>(
    `SELECT member_id, version FROM manuscript_working_drafts
      WHERE manuscript_id = $1 ORDER BY created_at DESC LIMIT 1`, [MANUSCRIPT]);
  if (d.rows.length === 0) { console.error('no working draft'); process.exit(2); }
  const memberId = d.rows[0].member_id;

  const state = await resolveDraftWriteState(MANUSCRIPT, memberId);
  if (state.kind !== 'section_aware') {
    console.error(`draft is ${state.kind}; this census only reads section-aware drafts`);
    process.exit(2);
  }

  /* ⭐ THE SAME RESOLUTION THE ROUTE PERFORMS. Not a reimplementation of it —
     a witness that computed authority its own way would be a second opinion
     about the thing under test. */
  const target = await resolveProposalWork(memberId, proposalId);

  const authorityOf = (s: { id: string; editable: boolean }): SectionAuthority =>
    target && target.sectionId === s.id
      ? 'proposal_work'
      : authorityFromProjectability(s.editable);

  const counts: Record<string, number> = {};
  const suspended: string[] = [];
  for (const s of state.sections) {
    const a = authorityOf(s);
    counts[a] = (counts[a] ?? 0) + 1;
    if (a === 'proposal_work') suspended.push(`position ${s.position} · §${s.position + 1} · ${s.id}`);
  }

  console.log('── resolved authority ───────────────────────────────────');
  console.log('draft version   ', d.rows[0].version);
  console.log('proposal        ', proposalId);
  console.log('target resolved ', target ? target.sectionId : 'NONE');
  console.log('sections        ', state.sections.length);
  for (const [k, v] of Object.entries(counts).sort()) console.log(`  ${k.padEnd(18)} ${v}`);
  console.log('\nsuspended:');
  for (const line of suspended) console.log('  ' + line);
  if (suspended.length === 0) console.log('  (none)');

  /* ⛔ PW-3 STATED AS A VERDICT, not left for a reader to infer from counts. */
  const expected = target ? 1 : 0;
  const pass = suspended.length === expected;
  console.log(`\nPW-3 · exactly ${expected} section suspended: ${pass ? 'PASS' : 'FAIL'}`);
  if (target && pass && suspended[0].endsWith(target.sectionId)) {
    console.log('PW-3 · and it is the section the server resolved: PASS');
  } else if (target) {
    console.log('PW-3 · and it is the section the server resolved: FAIL');
  }
  console.log('\nNOTHING WAS WRITTEN.');
  process.exit(pass ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
