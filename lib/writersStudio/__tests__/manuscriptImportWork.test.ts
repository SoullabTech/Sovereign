/** @jest-environment node */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/sovereign/manuscripts/route';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { claimArrival, recordSuppliedArrival } from '@/lib/manuscript/source/arrivals';
import { cabinStore, cabinMemberFromRequest, setCabinSessionCookie } from '@/lib/cabin/request';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/privacy/memberRef', () => ({ memberRef: () => 'fictional-member' }));
jest.mock('@/lib/manuscript/source/arrivals', () => ({
  claimArrival: jest.fn(), recordSuppliedArrival: jest.fn(),
}));
jest.mock('@/lib/cabin/request', () => ({
  cabinStore: jest.fn(), cabinMemberFromRequest: jest.fn(), setCabinSessionCookie: jest.fn(),
}));

const MEMBER = '11111111-1111-4111-8111-111111111111';
const MANUSCRIPT = '22222222-2222-4222-8222-222222222222';
const WORK = '33333333-3333-4333-8333-333333333333';
const SECTION = '44444444-4444-4444-8444-444444444444';
const EXPRESSION = '55555555-5555-4555-8555-555555555555';
const ARRIVAL = '66666666-6666-4666-8666-666666666666';
const sections = [
  { heading: 'Chapter 1: Rain', body: `  Rain tapped the sill.

`, headingDepth: 1, headingSignal: 'chapter' },
  { heading: null, body: `	Mara carried the blue cup.
`, headingDepth: null, headingSignal: null },
];

type Stage = 'manuscript' | 'section' | 'work' | 'expression';
let failStage: Stage | null;
let unconfirmedStage: Stage | null;
let events: string[];
let clientQuery: jest.Mock;
let cabin: { createManuscript: jest.Mock; addManuscriptSections: jest.Mock; close: jest.Mock };
const env = { capacitor: process.env.CAPACITOR_BUILD, cabin: process.env.MAIA_CABIN_MODE };

function request(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/sovereign/manuscripts', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.CAPACITOR_BUILD;
  delete process.env.MAIA_CABIN_MODE;
  failStage = null;
  unconfirmedStage = null;
  events = [];
  cabin = { createManuscript: jest.fn().mockReturnValue({ id: MANUSCRIPT }), addManuscriptSections: jest.fn(), close: jest.fn() };
  (cabinStore as jest.Mock).mockReturnValue(cabin);
  (cabinMemberFromRequest as jest.Mock).mockReturnValue({ member: { id: MEMBER }, issuedToken: null });
  (getMemberIdFromRequest as jest.Mock).mockResolvedValue(MEMBER);
  (recordSuppliedArrival as jest.Mock).mockImplementation(async () => {
    events.push('arrival');
    return { id: ARRIVAL };
  });
  (claimArrival as jest.Mock).mockResolvedValue(true);
  clientQuery = jest.fn(async (sql: string) => {
    const stage: Stage = sql.includes('INSERT INTO member_manuscripts') ? 'manuscript'
      : sql.includes('INSERT INTO manuscript_sections') ? 'section'
      : sql.includes('INSERT INTO living_work_expressions') ? 'expression'
      : sql.includes('INSERT INTO living_works') ? 'work'
      : (() => { throw new Error('Unexpected SQL in import transaction'); })();
    events.push(stage);
    if (stage === failStage) throw new Error('fictional write failure');
    if (stage === unconfirmedStage) return { rows: [] };
    return { rows: [{ id: { manuscript: MANUSCRIPT, section: SECTION, work: WORK, expression: EXPRESSION }[stage] }] };
  });
  (transaction as jest.Mock).mockImplementation(async (fn: (client: { query: jest.Mock }) => Promise<unknown>) => {
    events.push('begin');
    const result = await fn({ query: clientQuery });
    events.push('commit');
    return result;
  });
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => jest.restoreAllMocks());
afterAll(() => {
  if (env.capacitor === undefined) delete process.env.CAPACITOR_BUILD;
  else process.env.CAPACITOR_BUILD = env.capacitor;
  if (env.cabin === undefined) delete process.env.MAIA_CABIN_MODE;
  else process.env.MAIA_CABIN_MODE = env.cabin;
});

it('commits the exact confirmed manuscript and an explicitly declared same-member Work together', async () => {
  const response = await POST(request({
    title: 'Window and Rain', sections, createWork: true, confirmedText: 'Original supplied text',
    memberId: 'attacker-selected-member', workId: 'some-other-work',
  }));
  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({ id: MANUSCRIPT, workId: WORK, sectionCount: 2, sourceCustody: 'source_custodied' });
  expect(transaction).toHaveBeenCalledTimes(1);
  expect(query).not.toHaveBeenCalled();
  expect(events).toEqual(['begin', 'manuscript', 'section', 'section', 'work', 'expression', 'commit', 'arrival']);
  expect(clientQuery.mock.calls[0][1]).toEqual([MEMBER, 'Window and Rain']);
  expect(clientQuery.mock.calls[1][1]).toEqual([MANUSCRIPT, 0, sections[0].heading, sections[0].body, 1, 'chapter']);
  expect(clientQuery.mock.calls[2][1]).toEqual([MANUSCRIPT, 1, null, sections[1].body, null, null]);
  expect(clientQuery.mock.calls[3][1]).toEqual([MEMBER, 'Window and Rain']);
  expect(clientQuery.mock.calls[4][1]).toEqual([WORK, MANUSCRIPT, MEMBER]);
  expect(claimArrival).toHaveBeenCalledWith(ARRIVAL, MANUSCRIPT, MEMBER);
  expect(clientQuery.mock.calls.every(([sql]) => !/consent|editorial|reading_runs|conversation/i.test(sql))).toBe(true);
});

it('does not silently create a Work for an import without an explicit declaration', async () => {
  const response = await POST(request({ title: 'Existing API client', sections }));
  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({ id: MANUSCRIPT, sectionCount: 2, sourceCustody: 'legacy_interpreted_import' });
  expect(events).toEqual(['begin', 'manuscript', 'section', 'section', 'commit']);
  expect(query).not.toHaveBeenCalled();
});

it('leaves preview read-only even when the upcoming confirmation will create a Work', async () => {
  const response = await POST(request({ title: 'Window and Rain', text: `Chapter 1: Rain

Rain tapped.`, createWork: true }));
  expect(response.status).toBe(200);
  expect(await response.json()).toHaveProperty('preview');
  expect(transaction).not.toHaveBeenCalled();
  expect(query).not.toHaveBeenCalled();
  expect(recordSuppliedArrival).not.toHaveBeenCalled();
});

it.each<Stage>(['manuscript', 'section', 'work', 'expression'])('does not confirm success or bind custody when %s write fails', async (stage) => {
  failStage = stage;
  const response = await POST(request({ title: 'Window and Rain', sections, createWork: true, confirmedText: 'Original' }));
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: 'Failed to save manuscript' });
  expect(events).not.toContain('commit');
  expect(recordSuppliedArrival).not.toHaveBeenCalled();
  expect(claimArrival).not.toHaveBeenCalled();
  expect(query).not.toHaveBeenCalled();
});

it.each<Stage>(['manuscript', 'section', 'work', 'expression'])('refuses an unconfirmed %s insert result', async (stage) => {
  unconfirmedStage = stage;
  const response = await POST(request({ title: 'Window and Rain', sections, createWork: true }));
  expect(response.status).toBe(500);
  expect(events).not.toContain('commit');
  expect(recordSuppliedArrival).not.toHaveBeenCalled();
});

it('preserves a committed manuscript and Work when additive source custody binding fails', async () => {
  (recordSuppliedArrival as jest.Mock).mockRejectedValue(new Error('fictional custody failure'));
  const response = await POST(request({ title: 'Window and Rain', sections, createWork: true, confirmedText: 'Original' }));
  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({ id: MANUSCRIPT, workId: WORK, sectionCount: 2, sourceCustody: 'legacy_interpreted_import' });
  expect(events).toContain('commit');
});

it('refuses unauthenticated import before opening a transaction', async () => {
  (getMemberIdFromRequest as jest.Mock).mockResolvedValue(null);
  const response = await POST(request({ title: 'Window and Rain', sections, createWork: true }));
  expect(response.status).toBe(401);
  expect(transaction).not.toHaveBeenCalled();
});

it.each([['true', 'Window and Rain'], [true, 'x'.repeat(301)]])('refuses malformed explicit declaration input before writes', async (createWork, title) => {
  const response = await POST(request({ title, sections, createWork }));
  expect(response.status).toBe(400);
  expect(transaction).not.toHaveBeenCalled();
});

it('refuses an unsupported explicit Cabin Work declaration before creating any manuscript or section', async () => {
  process.env.MAIA_CABIN_MODE = 'offline';
  const response = await POST(request({ title: 'Window and Rain', sections, createWork: true }));
  expect(response.status).toBe(501);
  expect(await response.json()).toEqual({ error: 'Creating a Work during Cabin import is not available. No manuscript was saved.' });
  expect(cabin.createManuscript).not.toHaveBeenCalled();
  expect(cabin.addManuscriptSections).not.toHaveBeenCalled();
  expect(cabin.close).toHaveBeenCalledTimes(1);
  expect(setCabinSessionCookie).not.toHaveBeenCalled();
  expect(transaction).not.toHaveBeenCalled();
  expect(query).not.toHaveBeenCalled();
});

it('preserves the existing Cabin import behavior when no Work declaration was requested', async () => {
  process.env.MAIA_CABIN_MODE = 'offline';
  const response = await POST(request({ title: 'Window and Rain', sections }));
  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({ id: MANUSCRIPT, sectionCount: 2, sourceCustody: 'local_cabin' });
  expect(cabin.createManuscript).toHaveBeenCalledWith(MEMBER, { title: 'Window and Rain', provenance: 'member_uploaded' });
  expect(cabin.addManuscriptSections).toHaveBeenCalledWith(MEMBER, MANUSCRIPT, [
    { position: 0, heading: sections[0].heading, body: sections[0].body },
    { position: 1, heading: null, body: sections[1].body },
  ]);
  expect(cabin.close).toHaveBeenCalledTimes(1);
  expect(transaction).not.toHaveBeenCalled();
});
