/**
 * CUTOVER-01A.2 — the selector is total, and ONE server-resolved target owns
 * orientation. A12-1 … A12-6.
 *
 * ⭐⭐ THE TWO LESSONS THIS ACT EXISTS FOR:
 *
 *     Keeping an old route PRESENT is not the same as keeping its semantics
 *     REACHABLE.
 *
 *     Resolving a proposal is not enough if the room still takes its bearings
 *     from a different proposal object.
 *
 * ── EVIDENCE CLASS ─────────────────────────────────────────────────────────
 * BEHAVIOURAL, against the real `fetchWriteState` with a recording fetcher, and
 * the real `proposalSelector` / `markableRange`. ⛔ No token searches stand in
 * for a behaviour here: the defect being repaired was invisible to every source
 * scan precisely because both halves still existed — they had simply stopped
 * being connected.
 */
import {
  fetchWriteState, proposalSelector, legacyProposalFor, roomOrientation,
  chooseMount, sectionEngine,
  type WriteState,
} from '@/lib/writersStudio/writeStateClient';

let pass = 0; let fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: unknown) => { fail++; console.log(`  FAIL  ${s}\n     -> ${String(d)}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  JSON.stringify(got) === JSON.stringify(want)
    ? ok(`${s}  [${JSON.stringify(got)}]`)
    : bad(s, `got ${JSON.stringify(got)} · want ${JSON.stringify(want)}`);

/** Records every URL the room actually requests. */
function recorder(state: WriteState) {
  const urls: string[] = [];
  const fetcher = async (url: string) => {
    urls.push(url);
    return { ok: true, status: 200, json: async () => state } as unknown as Response;
  };
  return { urls, fetcher };
}
const SECTION_AWARE: WriteState = { mode: 'section_aware', version: 41, rows: [], sections: [] };
const withTarget = (located: boolean): WriteState => ({
  mode: 'proposal_work', version: 41, rows: [], sections: [],
  target: {
    chainId: 'C', versionId: 'V', sectionId: 'sec-target',
    sectionLabel: 'Before the water', replacementText: ', steady',
    location: located
      ? { located: true, range: { space: 'projected_section_body', start: 12, end: 21 } }
      : { located: false, reason: 'expected_text_absent' },
  },
});
const query = (u: string) => u.slice(u.indexOf('?') === -1 ? u.length : u.indexOf('?'));

/**
 * ⭐ THE ROOM'S OWN ORIENTATION FUNCTION — imported, never reimplemented.
 *
 * ⚠️ The first writing of this witness carried a private copy of the rule and a
 * mutant SURVIVED: a Canvas orienting on an unlocated target passed everything,
 * because the witness was testing its own copy. A witness that reimplements the
 * law it is checking has stopped being a witness.
 */
const orientationOf = (state: WriteState) =>
  roomOrientation(sectionEngine(chooseMount('ready', state))?.target);

async function main() {
  console.log('── CUTOVER-01A.2 · selector totality + orientation ───────────');

  /* ── A12-1 · legacy only — its selector STILL TRAVELS ──────────────────── */
  const s1 = proposalSelector(null, 'old-proposal-1');
  const r1 = recorder(SECTION_AWARE);
  await fetchWriteState('ms-1', r1.fetcher, s1);
  eq('A12-1 · ⭐⭐ legacy selector still reaches its server resolution',
    [s1?.kind, query(r1.urls[0])],
    ['legacy', '?proposal=old-proposal-1']);

  /* ── A12-2 · chain + exact version only ────────────────────────────────── */
  const s2 = proposalSelector({ chainId: 'C1', versionId: 'V2' }, null);
  const r2 = recorder(SECTION_AWARE);
  await fetchWriteState('ms-1', r2.fetcher, s2);
  eq('A12-2 · the new pair travels, and `proposal=` never does',
    [s2?.kind, query(r2.urls[0]), query(r2.urls[0]).includes('proposal=old')],
    ['chain_version', '?proposalChain=C1&proposalVersion=V2', false]);

  /* ── A12-3 · BOTH present → chain/version wins, no mixed request ───────── */
  const s3 = proposalSelector({ chainId: 'C1', versionId: 'V2' }, 'old-proposal-1');
  const r3 = recorder(SECTION_AWARE);
  await fetchWriteState('ms-1', r3.fetcher, s3);
  const q3 = query(r3.urls[0]);
  eq('A12-3 · ⛔ both present → chain/version wins; NEVER both in one request',
    [s3?.kind, q3, /(^|[?&])proposal=/.test(q3)],
    ['chain_version', '?proposalChain=C1&proposalVersion=V2', false]);
  /* ⛔ And no adapter: the legacy id appears NOWHERE in the request. */
  eq('A12-3b · ⛔ no adapter — the old id is not translated into the new pair',
    q3.includes('old-proposal-1'), false);

  /* ── A12-4 · located target owns room orientation ──────────────────────── */
  eq('A12-4 · ⭐⭐ a located server-resolved target orients the room to ITS section',
    orientationOf(withTarget(true)),
    { sectionId: 'sec-target',
      range: { space: 'projected_section_body', start: 12, end: 21 } });

  /* ── A12-5 · unavailable location → mounted, but no motion ─────────────── */
  const unl = withTarget(false);
  eq('A12-5 · ⭐ location unavailable → conversation MOUNTED, no orientation',
    [unl.mode, sectionEngine(chooseMount('ready', unl))?.target !== null,
      orientationOf(unl)],
    ['proposal_work', true, null]);

  /* ── A12-6 · the legacy target orients through the SAME seam ───────────── */
  const legacyShaped: WriteState = {
    mode: 'proposal_work', version: 41, rows: [], sections: [],
    /* the legacy target shape — `range`, no `location` */
    target: {
      proposalId: 'old-proposal-1', sectionId: 'sec-legacy',
      sectionLabel: 'Before the water',
      range: { space: 'projected_section_body', start: 3, end: 9 },
      operation: 'delete_exact_text', replacementText: '',
    } as never,
  };
  eq('A12-6 · ⭐ the LEGACY target orients through the same resolved-target seam',
    orientationOf(legacyShaped),
    { sectionId: 'sec-legacy',
      range: { space: 'projected_section_body', start: 3, end: 9 } });

  /* ══ A12-9 · ⭐⭐ ONE VISIT, ONE PROPOSAL SUBJECT, EVERYWHERE ═════════════
     The most serious of the three cutover defects, because it reached the
     DECISION surface: with both identities in the URL the Work showed chain C
     while the legacy panel — and its own Accept Changes against
     /revision-proposal/OLD/accept — stayed mounted on OLD.

     Choosing one identity for the Work is insufficient if another identity
     still owns the decision panel. */
  const sBoth = proposalSelector({ chainId: 'C1', versionId: 'V2' }, 'old-proposal-1');
  eq('A12-9 · ⭐⭐ both identities present → chain/version wins AND no legacy panel',
    [sBoth?.kind, legacyProposalFor(sBoth)], ['chain_version', null]);
  /* ⛔ And the staged old path is NOT removed — on its own URL it still mounts. */
  eq('A12-9b · ⛔ a legacy-only visit still mounts its panel — nothing was removed',
    legacyProposalFor(proposalSelector(null, 'old-proposal-1')), 'old-proposal-1');
  eq('A12-9c · a visit naming neither mounts neither',
    legacyProposalFor(proposalSelector(null, null)), null);

  /* ⛔ ONE AUTHORITY. The room must not re-derive orientation from the old
     preview object; `useProposedChange` may stay alive for the old panel while
     the cutover is staged, but it is no longer a second authority on where the
     writer is taken. */
  const ROOM = require('fs')
    .readFileSync(require('path').join(__dirname, '../..',
      'app/writers-studio/canvas/page.tsx'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  eq('A12-7 · [SOURCE] orientation is not re-derived from the old preview',
    /proposalTarget\s*=[\s\S]{0,200}?proposed\.mount/.test(ROOM), false);
  /* ⛔ AND THE ROOM DOES NOT BUILD ITS OWN. The behavioural obligations above
     bind `roomOrientation`; this pins that the Canvas actually consumes it
     rather than assembling an equivalent-looking pair inline — the seam the
     surviving mutant walked through. Labelled SOURCE, and narrow: it bans
     constructing an orientation, not reading a range. */
  eq('A12-8 · [SOURCE] the room consumes roomOrientation and assembles no orientation of its own',
    [/roomOrientation\(/.test(ROOM),
      /proposalTarget\s*=[^;]*\{\s*sectionId\s*:/.test(ROOM)], [true, false]);
  /* ⭐ The behavioural half above proves the SELECTION law; this proves the room
     actually consumes it rather than reading the raw parameter again — the seam
     the whole 01A.3 defect walked through. */
  eq('A12-10 · [SOURCE] the legacy panel identity comes from the selector, never the raw URL',
    [/useProposedChange\(\s*legacyProposalFor\(/.test(ROOM),
      /useProposedChange\(\s*(raw)?[Pp]roposalId\s*\)/.test(ROOM)], [true, false]);

  console.log(`\n  ${pass} passed · ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(2); });
