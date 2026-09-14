/**
 * W5-Z0 — THE CHAIN-LEVEL EDITORIAL SUBJECT. Z0-1 … Z0-10.
 *
 * ⭐⭐ THE RULING (founder, 2026-09-14):
 *
 *     The Editorial Workspace subject is the PROPOSAL CHAIN.
 *     A ProposalVersion is an OPTIONAL EXACT FOCUS within that subject.
 *
 * ⛔ AND THE RESTRICTION THAT MAKES IT SAFE: chain-only is NOT "show me the
 * head". It is admitted only for a chain the server proves holds NO versions.
 *
 * ⛔ DISPOSABLE DATABASE ONLY.
 *
 * ── EVIDENCE CLASSES, NAMED (the lane's standing rule) ─────────────────────
 *
 *  BEHAVIOURAL   Z0-1…Z0-6, Z0-8, Z0-9, Z0-10 — real rows through the real
 *                reads, and the real pure functions the room imports.
 *
 *  SOURCE-LEVEL  Z0-7 and the mount rule. ⚠️ The route cannot be driven from a
 *                witness — `getMemberIdFromRequest` refuses a bare
 *                `x-member-id` without a verified session, correctly, and ⛔ it
 *                is not weakened and no test hook is added to production to
 *                make this easier. So those lines are READ, with comments
 *                stripped (the C21 class), and labelled rather than dressed up.
 *
 * ⛔ EVERY SOURCE PIN ASSERTS ITS OWN ANCHOR FIRST. A pin whose anchor a rename
 * can delete reports PASS for a file it never read — which happened to 01A's
 * M-R6 under this very act, and is repaired there.
 */
import { query, closePool } from '@/lib/db/postgres';
import { resolveDraftWriteState } from '@/lib/manuscript/sections/saveSection';
import { readProposalWorkTarget } from '@/lib/manuscript/proposalChain/proposalWorkTarget';
import { readChainOnlySubject } from '@/lib/manuscript/proposalChain/editorialSubject';
import { requestedChainSubject, requestedProposalFocus } from '@/app/writers-studio/canvasIdentity';
import {
  proposalSelector, legacyProposalFor, editorialSubjectOf,
  type WriteState,
} from '@/lib/writersStudio/writeStateClient';

const codeOf = (rel: string) => require('fs')
  .readFileSync(require('path').join(__dirname, '../..', rel), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const url = process.env.DATABASE_URL ?? '';
const dbName = url.split('?')[0].split('/').pop() ?? '';
if (!dbName.includes('witness')) {
  console.error(`REFUSED · '${dbName || '(none)'}' is not a witness database.`);
  process.exit(2);
}
let pass = 0; let fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: unknown) => { fail++; console.log(`  FAIL  ${s}\n     -> ${String(d)}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  JSON.stringify(got) === JSON.stringify(want)
    ? ok(`${s}  [${JSON.stringify(got)}]`)
    : bad(s, `got ${JSON.stringify(got)} · want ${JSON.stringify(want)}`);

const M = '11111111-1111-1111-1111-111111111111';
const M2 = '55555555-5555-5555-5555-555555555555';
const uuid = async () => (await query<{ u: string }>('SELECT gen_random_uuid() AS u')).rows[0].u;
const BODY = 'He was there, fixated, and the river ran on without him.';
/** A query string, read exactly as the browser would hand it over. */
const q = (s: string) => new URLSearchParams(s);

async function makeWork(member: string, body = BODY, v = 41) {
  const workId = await uuid(); const draftId = await uuid(); const sectionId = await uuid();
  await query(`INSERT INTO member_manuscripts (id) VALUES ($1)`, [workId]);
  await query(`INSERT INTO manuscript_working_drafts
                 (id, manuscript_id, member_id, version, section_addressable_at)
               VALUES ($1,$2,$3,$4, now())`, [draftId, workId, member, v]);
  await query(`INSERT INTO manuscript_draft_sections (id, draft_id, text)
               VALUES ($1,$2,$3)`, [sectionId, draftId, body]);
  return { workId, draftId, sectionId };
}
async function makeChain(member: string, w: { workId: string; draftId: string; sectionId: string },
                         expected = ', fixated') {
  const c = await query<{ id: string }>(
    `INSERT INTO proposal_chains (member_id, work_id, draft_id, base_version,
                                  target_section_id, expected_text)
     VALUES ($1,$2,$3,41,$4,$5) RETURNING id`,
    [member, w.workId, w.draftId, w.sectionId, expected]);
  return c.rows[0].id;
}
async function addVersion(chainId: string, author: 'maia' | 'member',
                          text: string, supersedes: string | null) {
  const r = await query<{ id: string }>(
    `INSERT INTO proposal_versions (chain_id, author, formulation, supersedes)
     VALUES ($1,$2,$3,$4) RETURNING id`, [chainId, author, text, supersedes]);
  return r.rows[0].id;
}
async function sectionsOf(workId: string, member: string) {
  const st = await resolveDraftWriteState(workId, member);
  if (st.kind !== 'section_aware') throw new Error(`write state is ${st.kind}`);
  return st.sections;
}

async function main() {
  await query(`INSERT INTO members (id) VALUES ($1),($2) ON CONFLICT DO NOTHING`, [M, M2]);
  console.log('── W5-Z0 · the chain-level editorial subject ──────────────────');

  const w = await makeWork(M);
  /* The chain the writer is working: MAIA proposed, the writer answered. */
  const chain = await makeChain(M, w);
  const v1 = await addVersion(chain, 'maia', ', held', null);
  const v2 = await addVersion(chain, 'member', ', steady', v1);
  /* ⭐ THE OBJECT W5 EARNED: a chain with NO candidate wording at all. This is
     "MAIA noticed something here" before — or instead of — a proposed edit. */
  const empty = await makeChain(M, w, ', fixated');
  /* A second Work of the SAME writer, with its own chain. */
  const other = await makeWork(M);
  const otherChain = await makeChain(M, other, ', fixated');
  /* And another member's Work entirely. */
  const foreign = await makeWork(M2);
  const foreignChain = await makeChain(M2, foreign, ', fixated');
  const S = () => sectionsOf(w.workId, M);

  /* ── Z0-1 · C + exact V · the candidate target is UNCHANGED ─────────────── */
  const t1 = await readProposalWorkTarget(M, w.workId, chain, v1, await S());
  eq('Z0-1 · ⭐ chain + EXACT version still resolves the candidate target, at V1',
    t1.ok ? [t1.target.chainId === chain, t1.target.versionId === v1,
             t1.target.replacementText, t1.target.location.located] : t1,
    [true, true, ', held', true]);

  /* ── Z0-9 · and it is STILL the exact version, never the head ──────────── */
  eq('Z0-9 · ⛔ V1 is asked for while V2 is the head → V1, with V1 own wording',
    t1.ok ? [t1.target.versionId === v1, t1.target.versionId === v2] : t1, [true, false]);

  /* ── Z0-2 · a zero-version chain HAS a subject ──────────────────────────── */
  const z2 = await readChainOnlySubject(M, w.workId, empty);
  eq('Z0-2 · ⭐⭐ a chain with NO versions resolves a subject with NO focus',
    z2.ok ? z2.subject : z2, { kind: 'chain', chainId: empty, focusedVersionId: null });

  /* ⭐ AND NOTHING THAT COULD BE MARKED, COMPARED OR EXECUTED TRAVELS WITH IT.
     ⛔ Not the Work's wording, not a range, not an authority — this is the
     technical form of "there is a relationship and there is no proposal". */
  eq('Z0-8 · ⭐ the subject carries identity ONLY — no wording, range or authority',
    z2.ok ? Object.keys(z2.subject).sort() : z2,
    ['chainId', 'focusedVersionId', 'kind']);
  eq('Z0-8b · ⛔ and no candidate/execution vocabulary in any spelling',
    ['replacementtext', 'expectedtext', 'range', 'located', 'section',
     'mayaccept', 'authoriz', 'executable']
      .filter((t) => JSON.stringify(z2).toLowerCase().includes(t)), []);

  /* ── Z0-3 · ⭐⭐ THE HEAD-DEFAULT CUT ───────────────────────────────────── */
  const z3 = await readChainOnlySubject(M, w.workId, chain);
  eq('Z0-3 · ⭐⭐ a chain WITH versions and no named version REFUSES',
    z3.ok ? z3.subject : z3.reason, 'version_required');
  eq('Z0-3b · ⛔ and the refusal mentions no version — nothing defaulted to a head',
    [v1, v2].filter((id) => JSON.stringify(z3).includes(id)), []);

  /* ── Z0-4 · the 01A.1 binding survives the loss of the version ──────────── */
  const z4 = await readChainOnlySubject(M, w.workId, otherChain);
  eq('Z0-4 · ⭐⭐ the same writer OTHER Work does not cross into this room',
    z4.ok ? z4.subject : z4.reason, 'wrong_work');
  eq('Z0-4b · ⛔ and that chain identity does not travel back either',
    JSON.stringify(z4).includes(otherChain), false);

  /* ── Z0-5 · another member is ordinary absence, told nothing ────────────── */
  const z5 = await readChainOnlySubject(M, w.workId, foreignChain);
  eq('Z0-5 · ⛔ another member chain is indistinguishable from an unknown one',
    z5.ok ? z5.subject : z5.reason, 'chain_unknown');

  /* ── Z0-6 · a version without a chain is not expressible ────────────────── */
  eq('Z0-6 · ⛔ proposalVersion alone yields NO subject at all',
    requestedChainSubject(q(`proposalVersion=${v1}`)), null);
  eq('Z0-6b · ⛔ and no selector, so nothing is even asked of the server',
    proposalSelector(requestedChainSubject(q(`proposalVersion=${v1}`)), null), null);

  /* ── the URL contract, all three admitted rows ──────────────────────────── */
  eq('Z0-2c · chain + version → an exact focus',
    requestedChainSubject(q(`proposalChain=C&proposalVersion=V`)),
    { chainId: 'C', versionId: 'V' });
  eq('Z0-2d · chain alone → a chain subject with no focus',
    requestedChainSubject(q(`proposalChain=C`)), { chainId: 'C', versionId: null });
  /* ⛔ AN EMPTY PARAMETER IS NOT A NAMED VERSION. `?proposalVersion=` would
     otherwise become a focus on the empty string — a named-but-blank ask the
     server would then have to interpret. Absence is the only honest spelling. */
  eq('Z0-2e · ⛔ an EMPTY proposalVersion is "none named", never a blank focus',
    requestedChainSubject(q(`proposalChain=C&proposalVersion=`)),
    { chainId: 'C', versionId: null });
  eq('Z0-2f · ⭐ and the exact-focus reader is DERIVED, so the two cannot disagree',
    [requestedProposalFocus(q('proposalChain=C&proposalVersion=V')),
     requestedProposalFocus(q('proposalChain=C')),
     requestedProposalFocus(q('proposalVersion=V'))],
    [{ chainId: 'C', versionId: 'V' }, null, null]);

  /* ── the selector each row produces ─────────────────────────────────────── */
  eq('Z0-2g · one selector per row, and chain-only is its OWN kind',
    [proposalSelector({ chainId: 'C', versionId: 'V' }, null),
     proposalSelector({ chainId: 'C', versionId: null }, null),
     proposalSelector(null, 'old-1')],
    [{ kind: 'chain_version', chainId: 'C', versionId: 'V' },
     { kind: 'chain_only', chainId: 'C' },
     { kind: 'legacy', proposalId: 'old-1' }]);

  /* ── Z0-10 · the staged legacy path is UNCHANGED ────────────────────────── */
  eq('Z0-10 · ⭐ a legacy visit still reaches its own panel and only it',
    [legacyProposalFor(proposalSelector(null, 'old-1')),
     legacyProposalFor(proposalSelector({ chainId: 'C', versionId: null }, null)),
     legacyProposalFor(proposalSelector({ chainId: 'C', versionId: 'V' }, null))],
    ['old-1', null, null]);
  /* ⛔ AND IT ACQUIRES NO CHAIN IDENTITY FROM THIS ACT. A legacy response
     carries a target and no subject; the reader must not invent one from it. */
  const legacyState = {
    mode: 'proposal_work', version: 41, rows: [], sections: [],
    target: { proposalId: 'old-1', sectionId: 's', sectionLabel: 'x',
              range: { space: 'projected_section_body', start: 0, end: 2 },
              operation: 'delete_exact_text', replacementText: '' },
  } as unknown as WriteState;
  eq('Z0-10b · ⛔ a legacy response yields NO editorial subject',
    editorialSubjectOf(legacyState), null);

  /* ── the room's one question, answered from the response ────────────────── */
  eq('Z0-7a · ⭐⭐ a zero-version subject arrives in SECTION_AWARE mode',
    editorialSubjectOf({
      mode: 'section_aware', version: 41, rows: [], sections: [],
      editorialSubject: { kind: 'chain', chainId: empty, focusedVersionId: null },
    } as WriteState),
    { kind: 'chain', chainId: empty, focusedVersionId: null });
  eq('Z0-7b · a version-focused subject arrives beside its target',
    editorialSubjectOf({
      mode: 'proposal_work', version: 41, rows: [], sections: [],
      target: t1.ok ? t1.target : null,
      editorialSubject: { kind: 'chain', chainId: chain, focusedVersionId: v1 },
    } as unknown as WriteState),
    { kind: 'chain', chainId: chain, focusedVersionId: v1 });
  eq('Z0-7c · ⛔ no response, no subject — nothing is derived',
    [editorialSubjectOf(null), editorialSubjectOf(undefined),
     editorialSubjectOf({ mode: 'no_draft' } as WriteState)], [null, null, null]);

  /* ══════════════════════════════════════════════════════════════════════════
     SOURCE-LEVEL. Labelled, anchored, and anti-vacuous.
     ══════════════════════════════════════════════════════════════════════════ */
  const ROUTE = codeOf('app/api/sovereign/manuscripts/[id]/write-state/route.ts');
  const ROOM = codeOf('app/writers-studio/canvas/page.tsx');
  const WS = codeOf('app/writers-studio/EditorialWorkspace.tsx');
  const SUBJ = codeOf('lib/manuscript/proposalChain/editorialSubject.ts');

  /* ── Z0-7 · nothing about SUSPENSION or MODE may come from the subject ──── */
  const zFrom = ROUTE.indexOf('} else if (requested) {');
  const zTo = ROUTE.indexOf('} else {', zFrom + 1);
  eq('Z0-7d · [SOURCE] the chain-only branch is locatable (anti-vacuity)',
    zFrom >= 0 && zTo > zFrom, true);
  const chainOnlyBranch = zFrom >= 0 && zTo > zFrom
    ? ROUTE.slice(zFrom, zTo) : 'SENTINEL_ANCHOR_MISSING target =';
  eq('Z0-7e · ⭐⭐ [SOURCE] the chain-only branch assigns NO target',
    /target\s*=/.test(chainOnlyBranch), false);
  eq('Z0-7f · ⭐ [SOURCE] mode and suspension are still computed from the TARGET alone',
    [/mode:\s*target\s*\?/.test(ROUTE),
     /const suspendsAt\s*=\s*\n?\s*target\s*&&/.test(ROUTE)], [true, true]);
  eq('Z0-7g · ⛔ [SOURCE] and neither reads the subject',
    /suspendsAt[\s\S]{0,200}editorialSubject|mode:\s*editorialSubject/.test(ROUTE), false);

  /* ── ⭐⭐ W3-7, CARRIED FORWARD TO THE SEAM THAT NOW DECIDES IT ─────────
     *Losing the exact locus does not erase the editorial relationship.* Under
     W3 that law lived in `workspaceSubject`, which took `located` and ignored
     it. The subject is now built in the route, so the law has to hold THERE:
     the assignment is guarded by the READ having succeeded, and ⛔ by nothing
     about whether the place could be found. */
  const fFrom = ROUTE.indexOf('if (requested && requested.versionId !== null)');
  const fTo = ROUTE.indexOf('} else if (requested) {');
  eq('Z0-7h · [SOURCE] the focused branch is locatable (anti-vacuity)',
    fFrom >= 0 && fTo > fFrom, true);
  const focusedBranch = fFrom >= 0 && fTo > fFrom
    ? ROUTE.slice(fFrom, fTo) : 'SENTINEL_ANCHOR_MISSING located';
  eq('Z0-7i · ⭐⭐ [SOURCE] the SUBJECT is guarded by the read, never by the location',
    [/if \(r\.ok\) \{/.test(focusedBranch), /located/.test(focusedBranch)],
    [true, false]);

  /* ── the subject is the SERVER'S resolution, never the request ──────────── */
  eq('Z0-1b · ⭐⭐ [SOURCE] the focused subject is built from the RESOLVED target',
    /chainId:\s*r\.target\.chainId,\s*focusedVersionId:\s*r\.target\.versionId/.test(ROUTE),
    true);
  eq('Z0-1c · ⛔ [SOURCE] and never echoed back from what the browser asked for',
    /chainId:\s*requested\.chainId|focusedVersionId:\s*requested\.versionId/.test(ROUTE),
    false);

  /* ── ⛔ THE HEAD DEFAULT IS UNREACHABLE FROM THE CHAIN-ONLY READ ────────── */
  eq('M-Z0-HEAD · ⛔⭐ [SOURCE] the chain-only read never touches `focused`',
    /\.focused/.test(SUBJ), false);
  eq('M-Z0-HEAD-b · ⛔ [SOURCE] and never names a version to readProposalWork',
    /readProposalWork\([^)]*,[^)]*,[^)]*\)/.test(SUBJ), false);

  /* ── the room asks ONE question ─────────────────────────────────────────── */
  eq('Z0-M1 · ⭐⭐ [SOURCE] the room mounts from the SERVER-RESOLVED subject',
    /const subject = editorialSubjectOf\(writeState\);/.test(ROOM), true);
  eq('Z0-M2 · ⛔ [SOURCE] and there is exactly ONE subject in the room',
    (ROOM.match(/const subject\s*=/g) ?? []).length, 1);
  eq('Z0-M3 · ⛔ [SOURCE] the room builds no subject of its own',
    /kind: 'chain'|focusedVersionId:/.test(ROOM), false);
  eq('Z0-M4 · ⛔ [SOURCE] and the workspace cannot read query parameters at all',
    /useSearchParams|searchParams|location\.search|URLSearchParams/.test(WS), false);

  /* ── the second, independent cut at the head default ────────────────────── */
  eq('Z0-M5 · ⭐ [SOURCE] the workspace omits `version` when nothing is focused',
    /versionId === null \? '' :/.test(WS), true);
  eq('Z0-M6 · ⭐⭐ [SOURCE] and REFUSES a response that comes back focused anyway',
    /versionId === null && body\.focusedVersionId !== null/.test(WS), true);

  return finish();
}

function finish() {
  console.log(`\n  ${pass} passed · ${fail} failed`);
  return closePool().then(() => process.exit(fail === 0 ? 0 : 1));
}
main().catch((e) => { console.error(e); return closePool().then(() => process.exit(2)); });
