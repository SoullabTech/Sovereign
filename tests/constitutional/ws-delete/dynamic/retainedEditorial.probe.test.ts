/**
 * WS-DELETE-01 / R-SHARED — the editorial routes and a thread whose Work has been REMOVED.
 *
 * THE FINDING (lane record 6.9.1, "A separate founder finding, raised and not closed here"). Removing a Work deletes the Work row
 * and what cascades from it, including its editorial relationship (wer_work_member_fk ... ON DELETE CASCADE). The editorial threads
 * about the writing are bound to the manuscript, carry no Work id, and stay. The member-facing paths open a retained thread only
 * through lockCurrentEditorialOriginWithClient, which needs the original Work, declaration and relationship. Four routes took the
 * retained ids without that check. MEASURED on PostgreSQL 16 on 2026-11-08 (see the options record): after a Remove, editorial
 * ADOPTION applied a retained version to the writing, UNDO restored it, the RELATIONSHIPS list returned the frozen passage text, and
 * manuscripts-ask ?thread= returned the whole thread.
 *
 * THE DECISION (founder, 2026-11-08; production flag read ON, 0 orphaned threads in production at that time): option (b-narrow).
 *   adoption       REFUSED 409 origin_unavailable before any permission exists, when the thread's origin names a relationship that
 *                  no longer exists (lib/writers-studio/orphanedEditorialOrigin.ts)
 *   relationships  the orphaned thread is OMITTED from the list
 *   undo           NOT gated (it restores bytes the member already had and authors nothing)
 *   ask ?thread=   NOT gated (declared: an owner-only read by id, the member's only sight of what is retained; option c is its door)
 * Threads with NO origin row (opened before origins existed) are untouched. A withdrawn declaration with the Work still present is
 * a DECLARED GAP (RT-10), pinned as it is, awaiting a ruling.
 *
 * WHAT THIS IS. The real handlers, the real libraries, the real DDL of every table the editorial path touches (see
 * run-retained-editorial-pg16.sh: stub schema for the governance tables only, real migrations for the rest), fictional rows. The
 * Work is removed through the real DELETE /api/sovereign/living-works/[id] handler, on the code that is on this branch.
 *
 * WHAT THIS IS NOT. Not production; not a browser; not real HTTP or middleware. The only seam replaced is the session resolver
 * (getMemberIdFromRequest), exactly as the sibling probes do; resolveCanonicalIdentity, which wraps it, runs for real.
 * WRITERS_STUDIO_EDITORIAL_ENABLED is set by the test: both states are asserted. No model provider is reached: the turn control
 * stops at its preflight.
 *
 * STYLE. Each probe asserts the behaviour and says why it matters. If someone changes it (for example by gating undo, by refusing
 * threads that never had an origin, or by dropping the list filter), a probe fails with a named obligation and the lane record
 * must be updated, not silently outdated. RT-0 and RT-8 pin what Remove leaves and what the writing's Delete then removes; RT-1 to
 * RT-7 are the four routes (flag on and off, and the shared-writing case); RT-9 and RT-10 are the older-thread control and the
 * declared gap; RT-C1 to RT-C4 are the gated controls; RT-X1 is the cross-member control. Not exercised: the Save-working path
 * (it shares lockCurrentEditorialOriginWithClient with the thread read RT-C1 exercises) and any browser surface. The race between
 * the check and the write is a stated limit of the gate (see orphanedEditorialOrigin.ts) and is not probed.
 *
 * SAFETY. Disabled unless WS_DELETE_DYNAMIC=fictional-only. Refuses a non-loopback database. Fictional data only.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';

(globalThis as any).__probeMember = null as string | null;

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/lib/cabin/request', () => ({
  cabinStore: jest.fn(() => { throw new Error('cabin mode is not exercised by this probe'); }),
  cabinMemberFromRequest: jest.fn(() => { throw new Error('cabin mode is not exercised by this probe'); }),
  setCabinSessionCookie: jest.fn(),
}));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(async () => (globalThis as any).__probeMember ?? null),
}));
// The writing's Delete (RT-8) seals the independent R20 ledger after commit. That seal is not what this probe is about and the
// ledger is not configured here, so it is replaced by a switch that seals, exactly as the sibling probes do.
jest.mock('@/lib/recovery/r20DeletionLedger', () => ({
  sealR20DeletionLedger: jest.fn(async () => ({ sealed: true })),
  r20LedgerErrorCode: jest.fn(() => 'R20_LEDGER_FILE_MISSING'),
}));

import { POST as adoptionPost } from '@/app/api/writers-studio/editorial/adoption/route';
import { POST as undoPost } from '@/app/api/writers-studio/editorial/undo/route';
import { GET as relationshipsGet } from '@/app/api/writers-studio/editorial/relationships/route';
import { GET as threadGet, POST as threadPost } from '@/app/api/writers-studio/editorial/thread/route';
import { POST as versionPost } from '@/app/api/writers-studio/editorial/version/route';
import { POST as turnPost } from '@/app/api/writers-studio/editorial/turn/route';
import { GET as askGet } from '@/app/api/sovereign/manuscripts/[id]/ask/route';
import { DELETE as deleteWorkRoute } from '@/app/api/sovereign/living-works/[id]/route';
import { DELETE as deleteManuscriptRoute } from '@/app/api/sovereign/manuscripts/[id]/route';
import { createEditorialRelationshipCustody } from '@/lib/writers-studio/relationshipCustody';
import { closePool, query, transaction } from '@/lib/db/postgres';

const enabled = process.env.WS_DELETE_DYNAMIC === 'fictional-only';
const suite = enabled ? describe : describe.skip;
jest.setTimeout(120_000);

// Fictional prose, invented for this file. Each passage occurs exactly once in its section.
const PASSAGE_ONE = 'The lamp-keeper counted the boats that never returned and gave each of them a different name for patience.';
const PASSAGE_TWO = 'By the third winter the salt had taken the letters off the harbour wall and left only the spaces between them.';
const SECOND_SECTION_TAIL = ' A gull stood on the rail and watched the water as if it owed her something.';
const MAIA_OFFER = 'The lamp-keeper counted the boats that never returned and named every one of them after a kind of waiting.';
const MEMBER_ACT_TEXT = 'Could this sentence carry less weight without losing the counting?';
const MAIA_REPLY_TEXT = 'The counting is the weight; what could go is the word different.';
const MEMBER_VERSION = 'The lamp-keeper counted the boats that never returned and named each one for a kind of patience.';

const asMember = (id: string | null) => { (globalThis as any).__probeMember = id; };
const nextRequest = (path: string, method: string, body?: unknown) =>
  new NextRequest(`http://localhost${path}`, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }),
  });
const respond = async (res: Response) => {
  const text = await res.text();
  let json: any = null;
  try { json = text.length ? JSON.parse(text) : null; } catch { json = null; }
  return { status: res.status, body: json, raw: text };
};
const POST = (h: (r: NextRequest) => Promise<Response>, path: string, body: unknown) => h(nextRequest(path, 'POST', body)).then(respond);
const GET = (h: (r: NextRequest) => Promise<Response>, path: string) => h(nextRequest(path, 'GET')).then(respond);
const count = async (sql: string, params: unknown[] = []) =>
  Number((await query<{ n: string }>(`SELECT count(*)::int AS n FROM ${sql}`, params as any[])).rows[0]!.n);
const sectionText = async (id: string) =>
  (await query<{ text: string }>('SELECT text FROM manuscript_draft_sections WHERE id = $1', [id])).rows[0]!.text;
const draftVersion = async (id: string) =>
  Number((await query<{ version: string }>('SELECT version FROM manuscript_working_drafts WHERE id = $1', [id])).rows[0]!.version);

interface Fixture {
  member: string; manuscript: string; draft: string;
  sectionOne: string; sectionTwo: string;      // draft section ids
  work: string; relationship: string;
  threadOne: string; chainOne: string; offerOne: string; memberVersionOne: string;
  threadTwo: string; chainTwo: string; offerTwo: string;
}

/**
 * One member, one writing with two sections, one Work declaring it, and an A2 editorial relationship. Two real editorial
 * threads are opened through the real thread route (one per section), each with a MAIA offer and a member version, and a
 * stored author turn and MAIA turn. Turns and versions are inserted directly, as the turn route's persist step would write
 * them: the routes under test read them, they do not make a model call.
 */
async function makeFixture(): Promise<Fixture> {
  const member = randomUUID(), manuscript = randomUUID(), draft = randomUUID(), work = randomUUID();
  const srcOne = randomUUID(), srcTwo = randomUUID(), sectionOne = randomUUID(), sectionTwo = randomUUID();
  await query('INSERT INTO members(id) VALUES ($1)', [member]);
  await query('INSERT INTO member_manuscripts(id, member_id, title) VALUES ($1, $2, $3)', [manuscript, member, 'A Fictional Harbour Book']);
  await query('INSERT INTO manuscript_sections(id, manuscript_id, position, heading, body) VALUES ($1, $2, 0, NULL, $3)', [srcOne, manuscript, PASSAGE_ONE]);
  await query('INSERT INTO manuscript_sections(id, manuscript_id, position, heading, body) VALUES ($1, $2, 1, NULL, $3)', [srcTwo, manuscript, PASSAGE_TWO + SECOND_SECTION_TAIL]);
  await transaction(async (tx) => {
    await tx.query(`INSERT INTO manuscript_working_drafts (id, manuscript_id, member_id, content, base_source_hash, revision_count, version, section_addressable_at)
                    VALUES ($1, $2, $3, '', 'fictional', 1, 41, NULL)`, [draft, manuscript, member]);
    await tx.query('INSERT INTO manuscript_draft_sections (id, draft_id, position, text, source_section_id) VALUES ($1, $2, 0, $3, $4)', [sectionOne, draft, PASSAGE_ONE, srcOne]);
    await tx.query('INSERT INTO manuscript_draft_sections (id, draft_id, position, text, source_section_id) VALUES ($1, $2, 1, $3, $4)', [sectionTwo, draft, PASSAGE_TWO + SECOND_SECTION_TAIL, srcTwo]);
    await tx.query(`UPDATE manuscript_working_drafts
                       SET content = (SELECT COALESCE(string_agg(text, '' ORDER BY position), '') FROM manuscript_draft_sections WHERE draft_id = $1),
                           section_addressable_at = now()
                     WHERE id = $1`, [draft]);
  });
  await query('INSERT INTO living_works(id, member_id, title) VALUES ($1, $2, $3)', [work, member, 'The Harbour Book']);
  await query(`INSERT INTO living_work_expressions(living_work_id, expression_type, expression_id, declared_by) VALUES ($1, 'manuscript', $2, $3)`, [work, manuscript, member]);

  asMember(member);
  const rel = await createEditorialRelationshipCustody({ memberId: member, livingWorkId: work, manuscriptId: manuscript });
  if (!rel.ok) throw new Error(`fixture: relationship refused: ${rel.reason}`);
  const relationship = rel.relationship.id;

  const open = async (sectionId: string) => {
    const out = await POST(threadPost, '/api/writers-studio/editorial/thread', { sectionId, sanctuary: false, relationshipId: relationship });
    if (out.status !== 200) throw new Error(`fixture: thread open refused: ${out.status} ${out.raw}`);
    return out.body as { threadId: string; chainId: string };
  };
  const one = await open(sectionOne);
  const two = await open(sectionTwo);

  const offer = async (chainId: string, threadId: string, formulation: string, memberVersion: string | null) => {
    const maia = randomUUID();
    await query(`INSERT INTO proposal_versions (id, chain_id, author, formulation, supersedes) VALUES ($1, $2, 'maia', $3, NULL)`, [maia, chainId, formulation]);
    let mine = '';
    if (memberVersion !== null) {
      mine = randomUUID();
      await query(`INSERT INTO proposal_versions (id, chain_id, author, formulation, supersedes) VALUES ($1, $2, 'member', $3, $4)`, [mine, chainId, memberVersion, maia]);
    }
    await query(`INSERT INTO ask_turns (thread_id, turn_index, speaker, body, staleness) VALUES ($1, 0, 'author', $2, '{}'::jsonb)`, [threadId, MEMBER_ACT_TEXT]);
    await query(`INSERT INTO ask_turns (thread_id, turn_index, speaker, body, staleness) VALUES ($1, 1, 'maia', $2, '{}'::jsonb)`, [threadId, MAIA_REPLY_TEXT]);
    return { maia, mine };
  };
  const first = await offer(one.chainId, one.threadId, MAIA_OFFER, MEMBER_VERSION);
  const second = await offer(two.chainId, two.threadId, 'By the third winter the salt had taken the letters off the harbour wall and left the spaces they kept.', null);

  return {
    member, manuscript, draft, sectionOne, sectionTwo, work, relationship,
    threadOne: one.threadId, chainOne: one.chainId, offerOne: first.maia, memberVersionOne: first.mine,
    threadTwo: two.threadId, chainTwo: two.chainId, offerTwo: second.maia,
  };
}

const removeWork = async (workId: string) =>
  deleteWorkRoute(nextRequest(`/api/sovereign/living-works/${workId}`, 'DELETE'), { params: Promise.resolve({ id: workId }) }).then(respond);

const deleteWriting = async (manuscriptId: string) =>
  deleteManuscriptRoute(nextRequest(`/api/sovereign/manuscripts/${manuscriptId}`, 'DELETE'), { params: Promise.resolve({ id: manuscriptId }) }).then(respond);

const adopt = (threadId: string, versionId: string) =>
  POST(adoptionPost, '/api/writers-studio/editorial/adoption', { threadId, versionId });
const undo = (authorizationId: string) =>
  POST(undoPost, '/api/writers-studio/editorial/undo', { authorizationId });
const relationships = (sectionId: string) =>
  GET(relationshipsGet, `/api/writers-studio/editorial/relationships?sectionId=${sectionId}`);
const askThread = (manuscriptId: string, threadId: string) =>
  askGet(nextRequest(`/api/sovereign/manuscripts/${manuscriptId}/ask?thread=${threadId}`, 'GET'), { params: Promise.resolve({ id: manuscriptId }) }).then(respond);

let logSpy: jest.SpiedFunction<typeof console.log>;
let errSpy: jest.SpiedFunction<typeof console.error>;
let warnSpy: jest.SpiedFunction<typeof console.warn>;

suite('WS-DELETE-01 retained editorial threads after Remove (real PostgreSQL 16, real routes, fictional rows)', () => {
  beforeAll(async () => {
    const url = process.env.DATABASE_URL ?? '';
    if (!/@(127\.0\.0\.1|localhost)[:/]/.test(url)) throw new Error('refusing: the probe database must be loopback');
    if (!/\/ws_delete_fictional(\?|$)/.test(url)) throw new Error('refusing: the probe database must be the disposable ws_delete_fictional database');
  });
  beforeEach(() => {
    process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = '1';
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => { logSpy.mockRestore(); errSpy.mockRestore(); warnSpy.mockRestore(); });
  afterAll(async () => { await closePool(); });

  describe('the removal itself (what is, and is not, left behind)', () => {
    it('RT-0 Remove deletes the Work, its declaration and its editorial relationship; the threads, chains, versions, turns and both origin rows stay', async () => {
      const f = await makeFixture();
      expect(await count('writer_editorial_relationships WHERE id = $1', [f.relationship])).toBe(1);
      const out = await removeWork(f.work);
      expect(out.status).toBe(200);
      expect(await count('living_works WHERE id = $1', [f.work])).toBe(0);
      expect(await count('living_work_expressions WHERE living_work_id = $1', [f.work])).toBe(0);
      expect(await count('writer_editorial_relationships WHERE id = $1', [f.relationship])).toBe(0);
      // What stays. The origin rows name a Work and a relationship that no longer exist: they carry no foreign key to either.
      expect(await count('ask_threads WHERE id = ANY($1)', [[f.threadOne, f.threadTwo]])).toBe(2);
      expect(await count('ask_turns WHERE thread_id = ANY($1)', [[f.threadOne, f.threadTwo]])).toBe(4);
      expect(await count('proposal_chains WHERE id = ANY($1)', [[f.chainOne, f.chainTwo]])).toBe(2);
      expect(await count('proposal_versions WHERE chain_id = ANY($1)', [[f.chainOne, f.chainTwo]])).toBe(3);
      expect(await count('writer_editorial_thread_origins WHERE thread_id = ANY($1)', [[f.threadOne, f.threadTwo]])).toBe(2);
      expect(await count('writer_editorial_chain_origins WHERE proposal_chain_id = ANY($1)', [[f.chainOne, f.chainTwo]])).toBe(2);
      expect(await count('member_manuscripts WHERE id = $1', [f.manuscript])).toBe(1);
    });
  });

  describe('the only way a member can remove retained editorial history today', () => {
    it('RT-8 deleting the WRITING after the Remove deletes the retained threads, turns, chains, versions, authorizations and both origin rows', async () => {
      const f = await makeFixture();
      const applied = await adopt(f.threadOne, f.offerOne);   // leaves an authorization and a recovery snapshot behind
      expect(applied.body.kind).toBe('applied');
      await removeWork(f.work);
      expect(await count('manuscript_revision_authorizations WHERE proposal_chain_id = $1', [f.chainOne])).toBe(1);
      const out = await deleteWriting(f.manuscript);
      expect(out.status).toBe(200);
      expect(await count('member_manuscripts WHERE id = $1', [f.manuscript])).toBe(0);
      expect(await count('ask_threads WHERE id = ANY($1)', [[f.threadOne, f.threadTwo]])).toBe(0);
      expect(await count('ask_turns WHERE thread_id = ANY($1)', [[f.threadOne, f.threadTwo]])).toBe(0);
      expect(await count('proposal_chains WHERE id = ANY($1)', [[f.chainOne, f.chainTwo]])).toBe(0);
      expect(await count('proposal_versions WHERE chain_id = ANY($1)', [[f.chainOne, f.chainTwo]])).toBe(0);
      expect(await count('manuscript_revision_authorizations WHERE proposal_chain_id = ANY($1)', [[f.chainOne, f.chainTwo]])).toBe(0);
      expect(await count('writer_editorial_thread_origins WHERE thread_id = ANY($1)', [[f.threadOne, f.threadTwo]])).toBe(0);
      expect(await count('writer_editorial_chain_origins WHERE proposal_chain_id = ANY($1)', [[f.chainOne, f.chainTwo]])).toBe(0);
      // And the routes under test then find nothing at all.
      const gone = await adopt(f.threadTwo, f.offerTwo);
      expect(gone.status).toBe(404);
    });
  });

  describe('the four routes, flag on, after the Work was removed (founder-chosen option b-narrow, 2026-11-08)', () => {
    it('RT-1 relationships: 200 and an EMPTY list: a thread whose relationship is gone is no longer a relationship on the passage', async () => {
      const f = await makeFixture();
      const before = await relationships(f.sectionOne);
      expect(before.body.relationships.map((r: any) => r.threadId)).toEqual([f.threadOne]);   // the live one IS listed, with its frozen passage
      expect(before.body.relationships[0]).toMatchObject({ locusText: PASSAGE_ONE, turnCount: 2, versionCount: 2, legacyLocus: false });
      await removeWork(f.work);
      const after = await relationships(f.sectionOne);
      expect(after.status).toBe(200);
      expect(after.body).toEqual({ relationships: [] });
      // Why it matters: before the gate this answered 200 with the member's frozen passage text and counts for a thread no Work could open.
      expect(after.raw).not.toContain(PASSAGE_ONE);
    });

    it('RT-2 ask GET ?thread= is NOT gated (declared): 200, and it returns the WHOLE retained thread, including the member\'s own act text', async () => {
      const f = await makeFixture();
      await removeWork(f.work);
      const out = await askThread(f.manuscript, f.threadOne);
      expect(out.status).toBe(200);
      expect(out.body.thread.id).toBe(f.threadOne);
      expect(out.body.thread.manuscriptId).toBe(f.manuscript);
      expect(out.body.thread.anchor).toBeNull();
      expect(out.body.thread.turns.map((t: any) => [t.speaker, t.body])).toEqual([
        ['author', MEMBER_ACT_TEXT], ['maia', MAIA_REPLY_TEXT],
      ]);
      // Why it is left open: it is a read by id, owner-only (RT-X1), and the owner's only sight of what is retained. Closing it
      // without a member door (option c) would remove the member's last view of their own words.
    });

    it('RT-2b the ask route shows the retained thread exactly as it shows it BEFORE the Remove (nothing about the Work enters the answer)', async () => {
      const f = await makeFixture();
      const before = await askThread(f.manuscript, f.threadOne);
      await removeWork(f.work);
      const after = await askThread(f.manuscript, f.threadOne);
      expect(before.status).toBe(200);
      expect(after.status).toBe(200);
      expect(after.body).toEqual(before.body);
    });

    it('RT-3 adoption of MAIA\'s offer: 409 origin_unavailable; NO permission is minted and the writing is byte-identical', async () => {
      const f = await makeFixture();
      const before = await sectionText(f.sectionTwo);
      const versionBefore = await draftVersion(f.draft);
      await removeWork(f.work);
      const out = await adopt(f.threadTwo, f.offerTwo);
      expect(out.status).toBe(409);
      expect(out.body).toEqual({ kind: 'relationship_refusal', reason: 'origin_unavailable' });
      expect(out.body).not.toHaveProperty('permission');
      expect(await sectionText(f.sectionTwo)).toBe(before);
      expect(await draftVersion(f.draft)).toBe(versionBefore);
      // Refused BEFORE act 1: not even an unspent authorization row exists for the chain.
      expect(await count('manuscript_revision_authorizations WHERE proposal_chain_id = $1', [f.chainTwo])).toBe(0);
    });

    it('RT-3b adoption of the member\'s OWN retained version is refused the same way', async () => {
      const f = await makeFixture();
      await removeWork(f.work);
      const out = await adopt(f.threadOne, f.memberVersionOne);
      expect(out.status).toBe(409);
      expect(out.body).toEqual({ kind: 'relationship_refusal', reason: 'origin_unavailable' });
      expect(await sectionText(f.sectionOne)).toBe(PASSAGE_ONE);
      expect(await count('manuscript_revision_authorizations WHERE proposal_chain_id = $1', [f.chainOne])).toBe(0);
    });

    it('RT-3c adoption on a LIVE origin is unchanged: 200 applied, the writing changes (the gate refuses only the orphaned)', async () => {
      const f = await makeFixture();
      const out = await adopt(f.threadTwo, f.offerTwo);
      expect(out.status).toBe(200);
      expect(out.body.kind).toBe('applied');
      expect(out.body.byThisGesture).toBe(true);
      expect(await sectionText(f.sectionTwo)).toContain('left the spaces they kept.');
    });

    it('RT-3d the origin refusal comes BEFORE the legacy-locus guard: the same adoption answers legacy_locus on a live origin and origin_unavailable once the Work is removed', async () => {
      const f = await makeFixture();
      // Give section two a heading and freeze its chain in the STORED space (heading prefix included): the pre-alignment locus the
      // legacy guard exists for. A headingless section can never be legacy, so without this the ordering below would prove nothing.
      const stored = `A Heading\n\n${PASSAGE_TWO + SECOND_SECTION_TAIL}`;
      await transaction(async (tx) => {
        await tx.query('SET LOCAL session_replication_role = replica');
        await tx.query(`UPDATE manuscript_sections SET heading = 'A Heading' WHERE manuscript_id = $1 AND position = 1`, [f.manuscript]);
        await tx.query('UPDATE manuscript_draft_sections SET text = $2 WHERE id = $1', [f.sectionTwo, stored]);
        await tx.query('UPDATE proposal_chains SET expected_text = $2 WHERE id = $1', [f.chainTwo, stored]);
      });
      const live = await adopt(f.threadTwo, f.offerTwo);
      expect(live.body.kind).toBe('legacy_locus');           // the legacy guard DOES fire here, so the next assertion is not vacuous
      await removeWork(f.work);
      const orphaned = await adopt(f.threadTwo, f.offerTwo);
      expect(orphaned.status).toBe(409);
      expect(orphaned.body).toEqual({ kind: 'relationship_refusal', reason: 'origin_unavailable' });
    });

    it('RT-4 undo is NOT gated (chosen): 200 undone, the writing is restored; an application made BEFORE the Remove can still be reversed after it', async () => {
      const f = await makeFixture();
      const applied = await adopt(f.threadOne, f.offerOne);
      expect(applied.body.kind).toBe('applied');
      const authorizationId = applied.body.permission.authorizationId as string;
      expect(await sectionText(f.sectionOne)).toBe(MAIA_OFFER);
      await removeWork(f.work);
      const out = await undo(authorizationId);
      expect(out.status).toBe(200);
      expect(out.body.kind).toBe('undone');
      expect(await sectionText(f.sectionOne)).toBe(PASSAGE_ONE);
      // Why: undo restores bytes the member already had from a server-held snapshot and authors nothing; refusing it after a Remove
      // would strip the only way back from an adoption the member made earlier.
    });

    it('RT-5 the gate writes nothing and recreates nothing: no row about the removed Work comes back', async () => {
      const f = await makeFixture();
      await removeWork(f.work);
      await adopt(f.threadTwo, f.offerTwo);
      await relationships(f.sectionOne);
      await askThread(f.manuscript, f.threadOne);
      expect(await count('living_works WHERE id = $1', [f.work])).toBe(0);
      expect(await count('writer_editorial_relationships WHERE living_work_id = $1', [f.work])).toBe(0);
      expect(await count('living_work_expressions WHERE living_work_id = $1', [f.work])).toBe(0);
    });
  });

  describe('older threads (no origin row) and the declared gap', () => {
    /** An editing thread opened before origins existed: a chain and an editorial thread, and NO origin row. The origin migration's
     *  triggers refuse to create one in the ordinary way, so it is inserted as a superuser with triggers off, which is what its
     *  existence in production (never backfilled) amounts to. */
    async function makeOlderThread(f: Fixture) {
      const chain = randomUUID(), thread = randomUUID(), version = randomUUID();
      await transaction(async (tx) => {
        await tx.query('SET LOCAL session_replication_role = replica');
        await tx.query(`INSERT INTO proposal_chains (id, member_id, work_id, draft_id, base_version, target_section_id, expected_text)
                        VALUES ($1, $2, $3, $4, 1, $5, $6)`, [chain, f.member, f.manuscript, f.draft, f.sectionTwo, PASSAGE_TWO + SECOND_SECTION_TAIL]);
        await tx.query(`INSERT INTO ask_threads (id, manuscript_id, member_id, anchor, reading_identity, canonical_at_open, initiated_by, proposal_chain_id)
                        VALUES ($1, $2, $3, NULL, NULL, $4, 'author', $5)`, [thread, f.manuscript, f.member, `draft:${f.draft}@1`, chain]);
        await tx.query(`INSERT INTO proposal_versions (id, chain_id, author, formulation, supersedes) VALUES ($1, $2, 'maia', $3, NULL)`,
          [version, chain, PASSAGE_TWO.replace('By the third winter', 'By the fourth winter') + SECOND_SECTION_TAIL]);
      });
      return { chain, thread, version };
    }

    it('RT-9 a thread with NO origin row is untouched by the gate, before and after a Remove: it is listed and it is adoptable', async () => {
      const f = await makeFixture();
      const older = await makeOlderThread(f);
      expect(await count('writer_editorial_thread_origins WHERE thread_id = $1', [older.thread])).toBe(0);
      await removeWork(f.work);
      const listed = await relationships(f.sectionTwo);
      expect(listed.status).toBe(200);
      expect(listed.body.relationships.map((r: any) => r.threadId)).toEqual([older.thread]);   // the orphaned thread two is NOT listed; the older one is
      const out = await adopt(older.thread, older.version);
      expect(out.status).toBe(200);
      expect(out.body.kind).toBe('applied');
      expect(await sectionText(f.sectionTwo)).toContain('By the fourth winter');
    });

    it('RT-10 DECLARED GAP: a Work that still exists but WITHDREW the writing\'s declaration is not orphaned by this definition: the list still offers the thread and adoption still applies, although the gated paths refuse it', async () => {
      const f = await makeFixture();
      // What the expressions route does: delete the declaration row and nothing else. The relationship stays.
      await query(`DELETE FROM living_work_expressions WHERE living_work_id = $1 AND expression_type = 'manuscript' AND expression_id = $2`, [f.work, f.manuscript]);
      expect(await count('writer_editorial_relationships WHERE id = $1', [f.relationship])).toBe(1);
      const read = await GET(threadGet, `/api/writers-studio/editorial/thread?threadId=${f.threadOne}&relationshipId=${f.relationship}`);
      expect(read.status).toBe(409);
      expect(read.body).toEqual({ error: 'origin_unavailable' });
      const listed = await relationships(f.sectionOne);
      expect(listed.body.relationships.map((r: any) => r.threadId)).toEqual([f.threadOne]);
      const out = await adopt(f.threadOne, f.memberVersionOne);
      expect(out.status).toBe(200);
      expect(out.body.kind).toBe('applied');
      // This probe PINS a gap; it is not an endorsement. Widening the definition (relationship OR declaration gone) is a founder
      // ruling, recorded as R5 in the options record. If that ruling is made, this probe flips to 409 and the list to empty.
    });
  });

  describe('flag off (production\'s value was read on 2026-11-08: ON)', () => {
    it('RT-6 adoption, undo and relationships answer 404 with an EMPTY body; ask GET ?thread= has no flag and answers 200 regardless', async () => {
      const f = await makeFixture();
      const applied = await adopt(f.threadOne, f.offerOne);
      const authorizationId = applied.body.permission.authorizationId as string;
      await removeWork(f.work);
      process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = '0';
      const a = await adopt(f.threadTwo, f.offerTwo);
      const u = await undo(authorizationId);
      const r = await relationships(f.sectionOne);
      expect([a.status, u.status, r.status]).toEqual([404, 404, 404]);
      expect([a.raw, u.raw, r.raw]).toEqual(['', '', '']);
      const ask = await askThread(f.manuscript, f.threadOne);
      expect(ask.status).toBe(200);
      expect(ask.body.thread.turns).toHaveLength(2);
      // And nothing was written while the flag was off.
      expect(await sectionText(f.sectionTwo)).toBe(PASSAGE_TWO + SECOND_SECTION_TAIL);
    });
  });

  describe('the shared-writing case: a second Work still holds the writing after the first is removed', () => {
    it('RT-7 the list offers ONLY the second Work\'s own live thread, not the removed Work\'s; the retained one is still refused under the second Work\'s relationship', async () => {
      const f = await makeFixture();
      const second = randomUUID();
      await query('INSERT INTO living_works(id, member_id, title) VALUES ($1, $2, $3)', [second, f.member, 'The Other Harbour Book']);
      await query(`INSERT INTO living_work_expressions(living_work_id, expression_type, expression_id, declared_by) VALUES ($1, 'manuscript', $2, $3)`, [second, f.manuscript, f.member]);
      const rel2 = await createEditorialRelationshipCustody({ memberId: f.member, livingWorkId: second, manuscriptId: f.manuscript });
      if (!rel2.ok) throw new Error('fixture: second relationship refused');
      const own = await POST(threadPost, '/api/writers-studio/editorial/thread', { sectionId: f.sectionOne, sanctuary: false, relationshipId: rel2.relationship.id });
      expect(own.status).toBe(200);
      await removeWork(f.work);

      const listed = await relationships(f.sectionOne);
      expect(listed.status).toBe(200);
      expect(listed.body.relationships.map((r: any) => r.threadId)).toEqual([own.body.threadId]);

      const opened = await GET(threadGet, `/api/writers-studio/editorial/thread?threadId=${f.threadOne}&relationshipId=${rel2.relationship.id}`);
      expect(opened.status).toBe(409);
      expect(opened.body).toEqual({ error: 'origin_unavailable' });
      // Why it matters: the surface is no longer told about a conversation the next call will refuse, and the second Work's own
      // conversation on the same passage is still offered.
    });
  });

  describe('controls: the gated paths refuse a removed Work', () => {
    it('RT-C1 thread GET with the removed relationship: 409 origin_unavailable, no turns returned', async () => {
      const f = await makeFixture();
      const before = await GET(threadGet, `/api/writers-studio/editorial/thread?threadId=${f.threadOne}&relationshipId=${f.relationship}`);
      expect(before.status).toBe(200);
      await removeWork(f.work);
      const out = await GET(threadGet, `/api/writers-studio/editorial/thread?threadId=${f.threadOne}&relationshipId=${f.relationship}`);
      expect(out.status).toBe(409);
      expect(out.body).toEqual({ error: 'origin_unavailable' });
      expect(out.raw).not.toContain(MEMBER_ACT_TEXT);
    });

    it('RT-C2 thread POST (open a new conversation) under the removed relationship: 400 origin_unavailable, no thread or chain written', async () => {
      const f = await makeFixture();
      await removeWork(f.work);
      const threadsBefore = await count('ask_threads WHERE member_id = $1', [f.member]);
      const out = await POST(threadPost, '/api/writers-studio/editorial/thread', { sectionId: f.sectionOne, sanctuary: false, relationshipId: f.relationship });
      expect(out.status).toBe(400);
      expect(out.body).toEqual({ error: 'origin_unavailable' });
      expect(await count('ask_threads WHERE member_id = $1', [f.member])).toBe(threadsBefore);
    });

    it('RT-C3 version POST (the member writes a version): 409 origin_unavailable, persisted false, no version row written', async () => {
      const f = await makeFixture();
      await removeWork(f.work);
      const versionsBefore = await count('proposal_versions WHERE chain_id = $1', [f.chainOne]);
      const out = await POST(versionPost, '/api/writers-studio/editorial/version', {
        threadId: f.threadOne, relationshipId: f.relationship, sanctuary: false,
        supersedes: f.memberVersionOne, replacementText: 'A version written after the Work was removed.',
      });
      expect(out.status).toBe(409);
      expect(out.body).toMatchObject({ error: 'origin_unavailable', persisted: false });
      expect(await count('proposal_versions WHERE chain_id = $1', [f.chainOne])).toBe(versionsBefore);
    });

    it('RT-C4 turn POST (MAIA opens) stops at the preflight: 404 relationship_not_found, persisted false, no model call', async () => {
      const f = await makeFixture();
      await removeWork(f.work);
      const turnsBefore = await count('ask_turns WHERE thread_id = $1', [f.threadOne]);
      const out = await POST(turnPost, '/api/writers-studio/editorial/turn', {
        threadId: f.threadOne, relationshipId: f.relationship, sanctuary: false, opening: true,
      });
      expect(out.status).toBe(404);
      expect(out.body).toEqual({ error: 'relationship_not_found', persisted: false });
      expect(await count('ask_turns WHERE thread_id = $1', [f.threadOne])).toBe(turnsBefore);
    });
  });

  describe('cross-member controls: the finding is about the member\'s OWN retained data, not anyone else\'s', () => {
    it('RT-X1 another member gets nothing from any of the four routes, before or after the Remove', async () => {
      const f = await makeFixture();
      const applied = await adopt(f.threadOne, f.offerOne);
      const authorizationId = applied.body.permission.authorizationId as string;
      await removeWork(f.work);
      const stranger = randomUUID();
      await query('INSERT INTO members(id) VALUES ($1)', [stranger]);
      asMember(stranger);
      const a = await adopt(f.threadTwo, f.offerTwo);
      expect(a.status).toBe(404);
      expect(a.body).toEqual({ kind: 'relationship_refusal', reason: 'thread_not_found' });
      const u = await undo(authorizationId);
      expect(u.status).toBe(409);
      expect(u.body).toEqual({ kind: 'refused', reason: 'unknown_application' });
      const r = await relationships(f.sectionOne);
      expect(r.status).toBe(200);
      expect(r.body.relationships).toEqual([]);
      const ask = await askThread(f.manuscript, f.threadOne);
      expect(ask.status).toBe(404);
      expect(ask.body).toEqual({ refusal: 'not_found' });
      expect(await sectionText(f.sectionTwo)).toBe(PASSAGE_TWO + SECOND_SECTION_TAIL);
      asMember(f.member);
    });
  });
});
