/** @jest-environment node */
/**
 * Physical PostgreSQL 16 acceptance for Work-scoped Start writing.
 * Runs only when WS_START_WRITING_PG16=fictional-only is explicitly present.
 */
const enabled = process.env.WS_START_WRITING_PG16 === 'fictional-only';
const describePhysical = enabled ? describe : describe.skip;

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));

import { NextRequest } from 'next/server';
import { Client } from 'pg';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { POST } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const MEMBER = '11111111-1111-4111-8111-111111111111';
const OTHER = '99999999-9999-4999-8999-999999999999';
const WORK_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const WORK_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const WORK_FAIL = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const WORK_FOREIGN = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
let db: Client;

const request = (workId: string) => new NextRequest(
  `https://soullab.life/api/sovereign/living-works/${workId}/start-writing`,
  { method: 'POST' },
);
const context = (workId: string) => ({ params: Promise.resolve({ id: workId }) });
const scalar = async (sql: string, values: unknown[] = []) => {
  const out = await db.query(sql, values);
  return Number(Object.values(out.rows[0] ?? {})[0] ?? 0);
};

describePhysical('physical PG16 Work-scoped Start writing', () => {
  beforeAll(async () => {
    if (!process.env.DATABASE_URL?.includes('127.0.0.1')) {
      throw new Error('FICTIONAL_PG16_REFUSE_NON_LOOPBACK_DATABASE');
    }
    db = new Client({ connectionString: process.env.DATABASE_URL, application_name: 'ws_start_writing_fictional_only' });
    await db.connect();
    const identity = await db.query('SELECT current_database() AS db, current_user AS role');
    expect(identity.rows[0]).toMatchObject({ db: 'ws_atomic', role: 'fict' });
    await db.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE TABLE living_works(id uuid PRIMARY KEY, member_id uuid NOT NULL);
      CREATE TABLE member_manuscripts(
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), member_id uuid NOT NULL,
        title text, provenance text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
      CREATE TABLE manuscript_working_drafts(
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), manuscript_id uuid NOT NULL,
        member_id uuid NOT NULL, content text NOT NULL, base_source_hash text NOT NULL,
        revision_count integer NOT NULL, section_addressable_at timestamptz,
        section_conversion_version integer, version bigint NOT NULL DEFAULT 1);
      CREATE TABLE manuscript_draft_sections(
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), draft_id uuid NOT NULL,
        position integer NOT NULL, text text NOT NULL, source_section_id uuid);
      CREATE TABLE working_draft_revisions(
        draft_id uuid NOT NULL, revision_number integer NOT NULL, content text NOT NULL,
        saved_by uuid NOT NULL, note text, section_partition jsonb);
      CREATE TABLE living_work_expressions(
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), living_work_id uuid NOT NULL,
        expression_type text NOT NULL, expression_id uuid NOT NULL,
        declared_by uuid NOT NULL, declared_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(living_work_id, expression_type, expression_id));
      CREATE FUNCTION refuse_fixture_declaration() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.living_work_id = '${WORK_FAIL}'::uuid THEN
          RAISE EXCEPTION 'fictional declaration refusal';
        END IF;
        RETURN NEW;
      END $$;
      CREATE TRIGGER refuse_fixture_declaration
        BEFORE INSERT ON living_work_expressions
        FOR EACH ROW EXECUTE FUNCTION refuse_fixture_declaration();
    `);
  });

  afterAll(async () => { await db?.end(); });

  beforeEach(async () => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue(MEMBER);
    await db.query('TRUNCATE living_work_expressions, working_draft_revisions, manuscript_draft_sections, manuscript_working_drafts, member_manuscripts, living_works');
    await db.query(
      'INSERT INTO living_works(id,member_id) VALUES($1,$4),($2,$4),($3,$4),($5,$6)',
      [WORK_A, WORK_B, WORK_FAIL, MEMBER, WORK_FOREIGN, OTHER],
    );
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('serializes two starts for one Work into one manuscript and one declaration', async () => {
    const [a, b] = await Promise.all([
      POST(request(WORK_A), context(WORK_A)),
      POST(request(WORK_A), context(WORK_A)),
    ]);
    const [left, right] = await Promise.all([a.json(), b.json()]);
    expect([a.status, b.status].sort()).toEqual([200, 201]);
    expect(a.headers.get('cache-control')).toContain('no-store');
    expect(b.headers.get('cache-control')).toContain('no-store');
    expect(left.id).toBe(right.id);
    expect(await scalar('SELECT count(*) FROM member_manuscripts')).toBe(1);
    expect(await scalar('SELECT count(*) FROM living_work_expressions WHERE living_work_id=$1', [WORK_A])).toBe(1);
    expect(await scalar('SELECT count(*) FROM working_draft_revisions')).toBe(1);
  });

  it('keeps simultaneous Work A and Work B starts on distinct manuscripts', async () => {
    const [a, b] = await Promise.all([
      POST(request(WORK_A), context(WORK_A)),
      POST(request(WORK_B), context(WORK_B)),
    ]);
    const [left, right] = await Promise.all([a.json(), b.json()]);
    expect(a.status).toBe(201);
    expect(b.status).toBe(201);
    expect(left.id).not.toBe(right.id);
    const links = await db.query('SELECT living_work_id::text, expression_id::text FROM living_work_expressions ORDER BY living_work_id');
    expect(links.rows).toEqual([
      { living_work_id: WORK_A, expression_id: left.id },
      { living_work_id: WORK_B, expression_id: right.id },
    ]);
  });

  it('rolls back every writing row when the Work declaration fails', async () => {
    const response = await POST(request(WORK_FAIL), context(WORK_FAIL));
    expect(response.status).toBe(500);
    expect(await scalar('SELECT count(*) FROM member_manuscripts')).toBe(0);
    expect(await scalar('SELECT count(*) FROM manuscript_working_drafts')).toBe(0);
    expect(await scalar('SELECT count(*) FROM manuscript_draft_sections')).toBe(0);
    expect(await scalar('SELECT count(*) FROM working_draft_revisions')).toBe(0);
    expect(await scalar('SELECT count(*) FROM living_work_expressions')).toBe(0);
  });

  it('refuses foreign Work ownership without creating rows', async () => {
    const response = await POST(request(WORK_FOREIGN), context(WORK_FOREIGN));
    expect(response.status).toBe(404);
    expect(await scalar('SELECT count(*) FROM member_manuscripts')).toBe(0);
  });

  it('refuses direct duplicate Start writing after a Work contains written material', async () => {
    const ms = await db.query('INSERT INTO member_manuscripts(member_id,title,provenance) VALUES($1,NULL,\'member_written\') RETURNING id', [MEMBER]);
    await db.query('INSERT INTO manuscript_working_drafts(manuscript_id,member_id,content,base_source_hash,revision_count,section_addressable_at,section_conversion_version,version) VALUES($1,$2,\'written\',\'hash\',2,now(),1,2)', [ms.rows[0].id, MEMBER]);
    await db.query('INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by) VALUES($1,\'manuscript\',$2,$3)', [WORK_A, ms.rows[0].id, MEMBER]);
    const response = await POST(request(WORK_A), context(WORK_A));
    expect(response.status).toBe(409);
    expect(await scalar('SELECT count(*) FROM member_manuscripts')).toBe(1);
  });
});
