/** @jest-environment node */
import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import * as server from '@/lib/writersStudio/journeyServer';
import { GET, POST } from '../route';
import { PATCH } from '../[answerId]/route';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/writersStudio/betaAccessServer', () => ({ writersStudioBetaAccess: jest.fn() }));
jest.mock('@/lib/writersStudio/journeyServer', () => ({
  addJourneyAnswer: jest.fn(),
  colabShareAvailability: jest.fn(),
  isFounder: jest.fn(),
  listCurrentForFounder: jest.fn(),
  listOwnJourney: jest.fn(),
  shareJourneyAnswer: jest.fn(),
  withdrawJourneyAnswer: jest.fn(),
}));

const auth = getMemberIdFromRequest as jest.Mock;
const access = writersStudioBetaAccess as jest.Mock;
const ME = '11111111-1111-4111-8111-111111111111';
const ANSWER = '22222222-2222-4222-8222-222222222222';
const URL_BASE = 'http://localhost/api/sovereign/writers-studio/journey';

const req = (url: string, init?: RequestInit) => new NextRequest(url, init as never);
const json = (body: unknown) => ({ method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
const patch = (body: unknown) => ({ ...json(body), method: 'PATCH' });

beforeEach(() => {
  jest.clearAllMocks();
  auth.mockResolvedValue(ME);
  access.mockResolvedValue({ eligible: true, basis: 'active_beta_tester' });
});

it('refuses anyone outside the Writer’s Studio pilot, and reads nothing', async () => {
  access.mockResolvedValue({ eligible: false, basis: 'not_in_pilot' });
  expect((await GET(req(URL_BASE))).status).toBe(403);
  expect((await POST(req(URL_BASE, json({ promptKey: 'edit_felt_like_mine', answer: 'x' })))).status).toBe(403);
  expect(server.listOwnJourney).not.toHaveBeenCalled();
  expect(server.addJourneyAnswer).not.toHaveBeenCalled();
});

it('shows every writer’s answers only to the founder', async () => {
  (server.isFounder as jest.Mock).mockResolvedValue(false);
  const refused = await GET(req(`${URL_BASE}?scope=all`));
  expect(refused.status).toBe(403);
  expect(server.listCurrentForFounder).not.toHaveBeenCalled();

  (server.isFounder as jest.Mock).mockResolvedValue(true);
  (server.listCurrentForFounder as jest.Mock).mockResolvedValue([]);
  expect((await GET(req(`${URL_BASE}?scope=all`))).status).toBe(200);
});

it('rejects unexpected fields instead of storing them', async () => {
  const res = await POST(req(URL_BASE, json({ promptKey: 'edit_felt_like_mine', answer: 'x', sessionDwellMs: 4000 })));
  expect(res.status).toBe(400);
  expect(server.addJourneyAnswer).not.toHaveBeenCalled();
});

it('shares only with an explicit, valid kind', async () => {
  const noKind = await PATCH(req(`${URL_BASE}/${ANSWER}`, patch({ action: 'share' })), { params: Promise.resolve({ answerId: ANSWER }) });
  expect(noKind.status).toBe(400);
  const badKind = await PATCH(req(`${URL_BASE}/${ANSWER}`, patch({ action: 'share', kind: 'praise' })), { params: Promise.resolve({ answerId: ANSWER }) });
  expect(badKind.status).toBe(400);
  expect(server.shareJourneyAnswer).not.toHaveBeenCalled();

  (server.shareJourneyAnswer as jest.Mock).mockResolvedValue({ ok: false, refusal: 'colab_not_open' });
  const closed = await PATCH(req(`${URL_BASE}/${ANSWER}`, patch({ action: 'share', kind: 'suggestion' })), { params: Promise.resolve({ answerId: ANSWER }) });
  expect(closed.status).toBe(409);
  expect(server.shareJourneyAnswer).toHaveBeenCalledWith(ME, ANSWER, 'suggestion');
});

it('withdraws only on the bare withdraw action', async () => {
  (server.withdrawJourneyAnswer as jest.Mock).mockResolvedValue({ ok: true, withdrawn: 1 });
  const extra = await PATCH(req(`${URL_BASE}/${ANSWER}`, patch({ action: 'withdraw', also: 'x' })), { params: Promise.resolve({ answerId: ANSWER }) });
  expect(extra.status).toBe(400);
  const ok = await PATCH(req(`${URL_BASE}/${ANSWER}`, patch({ action: 'withdraw' })), { params: Promise.resolve({ answerId: ANSWER }) });
  expect(ok.status).toBe(200);
  expect(server.withdrawJourneyAnswer).toHaveBeenCalledWith(ME, ANSWER);
});
