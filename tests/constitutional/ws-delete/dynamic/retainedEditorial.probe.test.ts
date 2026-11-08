/**
 * WS-DELETE-01 / R-SHARED — what the editorial routes do for a thread whose Work has been REMOVED.
 *
 * THE QUESTION (lane record 6.9.1, "A separate founder finding, raised and not closed here"). Removing a Work deletes the Work
 * row and what cascades from it, including its editorial relationship (wer_work_member_fk ... ON DELETE CASCADE). The editorial
 * threads about the writing are bound to the manuscript, carry no Work id, and stay. The member-facing editing surface opens a
 * retained thread only through lockCurrentEditorialOriginWithClient, which needs the original Work, declaration and
 * relationship. Four routes take the retained ids without that check:
 *   POST /api/writers-studio/editorial/adoption      (member + thread id + version id)
 *   POST /api/writers-studio/editorial/undo          (member + authorization id)
 *   GET  /api/writers-studio/editorial/relationships (member + section id)
 *   GET  /api/sovereign/manuscripts/[id]/ask?thread= (member + manuscript ownership + thread id)
 * The lane record reached that by reading code only. This file runs the REAL route handlers against a real PostgreSQL 16 and
 * asserts what each one actually answers, next to the gated paths (thread read, thread open, version, turn) as controls.
 *
 * WHAT THIS IS. The real handlers, the real libraries, the real DDL of every table the editorial path touches (see
 * run-retained-editorial-pg16.sh: stub schema for the governance tables only, real migrations for the rest), fictional rows.
 * The Work is removed through the real DELETE /api/sovereign/living-works/[id] handler, on the code that is on this branch.
 *
 * WHAT THIS IS NOT. Not production; not a browser; not the follow-up in PR #2169 (which changes Remove to take the recovery
 * lock and write a deletion record, and changes nothing here: it still deletes only the Work row and what cascades). The only
 * seam replaced is the session resolver (getMemberIdFromRequest), exactly as the sibling probes do; resolveCanonicalIdentity,
 * which wraps it, runs for real. WRITERS_STUDIO_EDITORIAL_ENABLED is set by the test, because production's value was never read
 * (lane record 6.9.5): both states are asserted. No model provider is reached: the turn control stops at its preflight.
 *
 * STYLE. Each probe asserts today's behaviour and says why it matters. If someone changes the behaviour (for example by gating
 * these routes on the origin), the probe fails with a named obligation and the lane record must be updated, not silently
 * outdated. RT-0 and RT-8 pin what Remove leaves and what the writing's Delete then removes; RT-1 to RT-7 are the finding (the
 * four routes, flag on and off, and the shared-writing case); RT-C1 to RT-C4 are the gated controls; RT-X1 is the cross-member
 * control. Not exercised: the Save-working path (named in the lane record as gated; it shares lockCurrentEditorialOriginWithClient
 * with the thread read RT-C1 exercises) and any browser surface.
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

  describe('the four routes, flag on, after the Work was removed', () => {
    it('RT-1 relationships: 200, and it LISTS the retained thread with the frozen passage text, the turn count and the version count', async () => {
      const f = await makeFixture();
      await removeWork(f.work);
      const out = await relationships(f.sectionOne);
      expect(out.status).toBe(200);
      expect(out.body.relationships).toHaveLength(1);
      expect(out.body.relationships[0]).toMatchObject({
        threadId: f.threadOne, chainId: f.chainOne, sectionId: f.sectionOne,
        locusText: PASSAGE_ONE, turnCount: 2, versionCount: 2, legacyLocus: false,
      });
      // Why it matters: the frozen passage is the member's own prose, handed back by a route that no longer needs the Work.
      expect(out.body.relationships[0]).not.toHaveProperty('relationshipId');
      expect(out.body.relationships[0]).not.toHaveProperty('workId');
    });

    it('RT-2 ask GET ?thread=: 200, and it returns the WHOLE retained thread, including the member\'s own act text as an author turn', async () => {
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
    });

    it('RT-2b the same route shows the retained thread exactly as it shows it BEFORE the Remove (nothing about the Work enters the answer)', async () => {
      const f = await makeFixture();
      const before = await askThread(f.manuscript, f.threadOne);
      await removeWork(f.work);
      const after = await askThread(f.manuscript, f.threadOne);
      expect(before.status).toBe(200);
      expect(after.status).toBe(200);
      expect(after.body).toEqual(before.body);
    });

    it('RT-3 adoption: 200 applied, and the writing CHANGES: a removed Work does not stop a version of its retained conversation from being adopted', async () => {
      const f = await makeFixture();
      const before = await sectionText(f.sectionTwo);
      const versionBefore = await draftVersion(f.draft);
      await removeWork(f.work);
      const out = await adopt(f.threadTwo, f.offerTwo);
      expect(out.status).toBe(200);
      expect(out.body.kind).toBe('applied');
      expect(out.body.byThisGesture).toBe(true);
      expect(out.body.permission.established).toBe(true);
      const after = await sectionText(f.sectionTwo);
      expect(after).not.toBe(before);
      expect(after).toContain('left the spaces they kept.');
      expect(await draftVersion(f.draft)).toBeGreaterThan(versionBefore);
      // The permission and the receipt were written against a Work-less writing.
      expect(await count('manuscript_revision_authorizations WHERE id = $1 AND accepted_at IS NOT NULL', [out.body.permission.authorizationId])).toBe(1);
    });

    it('RT-3b adoption of the member\'s OWN retained version is equally accepted (the chain, not the Work, is what it reads)', async () => {
      const f = await makeFixture();
      await removeWork(f.work);
      const out = await adopt(f.threadOne, f.memberVersionOne);
      expect(out.status).toBe(200);
      expect(out.body.kind).toBe('applied');
      expect(await sectionText(f.sectionOne)).toBe(MEMBER_VERSION);
    });

    it('RT-4 undo: 200 undone, and the writing is restored: an application made BEFORE the Remove can still be undone after it', async () => {
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
    });

    it('RT-5 the two writes are the whole of what a removed Work still leaves open: with the writing\'s own routes unchanged, no row about the Work is recreated', async () => {
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

  describe('flag off (production\'s value was never read)', () => {
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
    it('RT-7 the list still offers the removed Work\'s thread by SECTION; opening it under the SECOND Work\'s relationship is refused 409 origin_unavailable', async () => {
      const f = await makeFixture();
      const second = randomUUID();
      await query('INSERT INTO living_works(id, member_id, title) VALUES ($1, $2, $3)', [second, f.member, 'The Other Harbour Book']);
      await query(`INSERT INTO living_work_expressions(living_work_id, expression_type, expression_id, declared_by) VALUES ($1, 'manuscript', $2, $3)`, [second, f.manuscript, f.member]);
      const rel2 = await createEditorialRelationshipCustody({ memberId: f.member, livingWorkId: second, manuscriptId: f.manuscript });
      if (!rel2.ok) throw new Error('fixture: second relationship refused');
      await removeWork(f.work);

      const listed = await relationships(f.sectionOne);
      expect(listed.status).toBe(200);
      expect(listed.body.relationships.map((r: any) => r.threadId)).toEqual([f.threadOne]);

      const opened = await GET(threadGet, `/api/writers-studio/editorial/thread?threadId=${f.threadOne}&relationshipId=${rel2.relationship.id}`);
      expect(opened.status).toBe(409);
      expect(opened.body).toEqual({ error: 'origin_unavailable' });
      // Why it matters: the surface can be told about a conversation by one route and refused it by the next.
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
