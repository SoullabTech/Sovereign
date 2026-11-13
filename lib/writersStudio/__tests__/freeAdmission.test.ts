/**
 * Step B — Free admission (founder rulings 2026-11-02 "ADMIT FREE NOW" / "ONE-WORK FREE"; 2026-11-13 expiry → Free).
 * Built dark and fail-closed: the door opens only when both Free/Pro boundaries are on.
 */
jest.mock('server-only', () => ({}), { virtual: true });
const beta = jest.fn();
jest.mock('@/lib/writersStudio/betaAccessServer', () => {
  const real = jest.requireActual('@/lib/writersStudio/betaAccessServer');
  return { ...real, writersStudioBetaAccess: (...a: unknown[]) => beta(...a) };
});
const query = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => query(...a) }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: async () => 'm1' }));

import { NextRequest } from 'next/server';
import { freeAdmissionMissingBoundaries, freeAdmissionOpen } from '../freeAdmission';
import { admittedToStudio, writerStudioAdmissionForMember } from '../admissionServer';
import { resolveWholeWork } from '@/lib/auth/wholeWorkEntitlement';
import { POST as arrival } from '@/app/api/sovereign/writers-studio/arrival/route';
import { GET as betaAccessRoute } from '@/app/api/sovereign/writers-studio/beta-access/route';

const KEYS = ['WS_FREE_ADMISSION_ENABLED', 'WS_FREE_WORK_LIMIT_ENABLED', 'WS_PRO_GATE_ENABLED'] as const;
const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
function env(door: boolean, limit: boolean, gate: boolean) {
  const v = (b: boolean) => (b ? 'true' : undefined);
  for (const [k, on] of [[KEYS[0], door], [KEYS[1], limit], [KEYS[2], gate]] as const) {
    if (v(on)) process.env[k] = 'true'; else delete process.env[k];
  }
}
const notPilot = { eligible: false, basis: 'not_in_pilot' } as const;
const pilot = { eligible: true, basis: 'active_beta_tester' } as const;

beforeEach(() => { beta.mockReset(); query.mockReset(); env(false, false, false); jest.spyOn(console, 'warn').mockImplementation(() => {}); });
afterAll(() => { for (const k of KEYS) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } });

describe('the door is fail-closed', () => {
  it('⭐ closed by default; closed if either boundary is off; open only when all three are on', () => {
    expect(freeAdmissionOpen()).toBe(false);
    env(true, false, true); expect(freeAdmissionOpen()).toBe(false);
    env(true, true, false); expect(freeAdmissionOpen()).toBe(false);
    env(false, true, true); expect(freeAdmissionOpen()).toBe(false);
    env(true, true, true); expect(freeAdmissionOpen()).toBe(true);
  });
  it('names the missing boundaries', () => {
    expect(freeAdmissionMissingBoundaries({})).toEqual(['WS_FREE_WORK_LIMIT_ENABLED', 'WS_PRO_GATE_ENABLED']);
    expect(freeAdmissionMissingBoundaries({ WS_FREE_WORK_LIMIT_ENABLED: 'true', WS_PRO_GATE_ENABLED: 'true' })).toEqual([]);
  });
});

describe('admission decision', () => {
  it('⭐ closed: exactly as before — pilot in, everyone else WRITER_STUDIO_INVITATION_REQUIRED', async () => {
    beta.mockResolvedValue(pilot);
    expect((await writerStudioAdmissionForMember('m1')).allowed).toBe(true);
    beta.mockResolvedValue(notPilot);
    expect(await writerStudioAdmissionForMember('m1')).toMatchObject({ allowed: false, code: 'WRITER_STUDIO_INVITATION_REQUIRED' });
  });
  it('open: a non-pilot member (incl. an expired beta tester) is admitted on the Free plan', async () => {
    env(true, true, true);
    beta.mockResolvedValue(notPilot);
    const a = await writerStudioAdmissionForMember('m1');
    expect(a.allowed).toBe(true);
    expect(a.plan).toMatchObject({ plan: 'free', pilotEligible: false });
  });
  it('a pilot member stays Pro when the door is open', async () => {
    env(true, true, true);
    beta.mockResolvedValue(pilot);
    expect((await writerStudioAdmissionForMember('m1')).plan).toMatchObject({ plan: 'pro' });
  });
  it('admittedToStudio mirrors the decision for routes that check access themselves', () => {
    expect(admittedToStudio(notPilot)).toBe(false);
    env(true, true, true);
    expect(admittedToStudio(notPilot)).toBe(true);
  });
});

describe('Pro stays Pro for an admitted Free writer', () => {
  it('⭐ the whole-book pass is refused (the door cannot open without the Pro gate)', async () => {
    env(true, true, true);
    beta.mockResolvedValue(notPilot);
    query.mockResolvedValue({ rows: [{ tier: 'free' }] });
    expect(await resolveWholeWork('m1')).toEqual({ entitled: false, basis: 'not_pro' });
  });
});

describe('routes', () => {
  const post = () => new NextRequest('https://soullab.life/api/sovereign/writers-studio/arrival', { method: 'POST', body: '{}' });
  const get = () => new NextRequest('https://soullab.life/api/sovereign/writers-studio/beta-access');
  it('the Spark door (arrival) refuses a non-pilot member while the door is closed…', async () => {
    beta.mockResolvedValue(notPilot);
    expect((await arrival(post())).status).toBe(403);
  });
  it('…and lets an admitted Free writer through (here: past the gate to the body check)', async () => {
    env(true, true, true);
    beta.mockResolvedValue(notPilot);
    expect((await arrival(post())).status).toBe(400);
  });
  it('beta-access reports admitted separately from beta standing, with release capabilities', async () => {
    env(true, true, true);
    beta.mockResolvedValue(notPilot);
    const body = await (await betaAccessRoute(get())).json();
    expect(body).toMatchObject({ eligible: false, admitted: true });
    expect(body.capabilities).toBeDefined();
  });
  it('closed: beta-access reports admitted false for a non-pilot member', async () => {
    beta.mockResolvedValue(notPilot);
    expect(await (await betaAccessRoute(get())).json()).toMatchObject({ eligible: false, admitted: false });
  });
});

describe('boundary names stay in sync', () => {
  it('freeAdmission reads the same switches as step A and the Pro gate', () => {
    const { freeWorkLimitEnabled } = jest.requireActual('../workLimit');
    const { proGateEnabled } = jest.requireActual('@/lib/auth/wholeWorkEntitlement');
    const on = { WS_FREE_WORK_LIMIT_ENABLED: 'true', WS_PRO_GATE_ENABLED: 'true' };
    expect(freeWorkLimitEnabled(on) && proGateEnabled(on)).toBe(true);
    expect(freeAdmissionMissingBoundaries(on)).toEqual([]);
    expect(freeAdmissionMissingBoundaries({ WS_FREE_WORK_LIMIT_ENABLED: 'true' })).toEqual(['WS_PRO_GATE_ENABLED']);
  });
});

