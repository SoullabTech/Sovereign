import { NextRequest } from 'next/server';
import { GET } from '../route';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writerStudioPlanForMember } from '@/lib/writersStudio/planAccessServer';
import { decideWriterStudioPlan } from '@/lib/writersStudio/planPolicy';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/writersStudio/planAccessServer', () => ({ writerStudioPlanForMember: jest.fn() }));

const getMember = getMemberIdFromRequest as jest.Mock;
const planForMember = writerStudioPlanForMember as jest.Mock;

const request = (suffix = '') =>
  new NextRequest('https://example.test/api/sovereign/writers-studio/plan' + suffix);

describe('Writer Studio plan endpoint: private read-only projection', () => {
  beforeEach(() => { jest.resetAllMocks(); });

  it('rejects signed-out requests without touching the plan source', async () => {
    getMember.mockResolvedValue(null);
    const res = await GET(request('?plan=pro&beta=1'));
    expect(res.status).toBe(401);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(planForMember).not.toHaveBeenCalled();
  });

  it('returns complimentary Pro to a verified pilot writer, ignoring query claims', async () => {
    getMember.mockResolvedValue('member-a');
    planForMember.mockResolvedValue(decideWriterStudioPlan({
      eligible: true, basis: 'active_beta_tester',
    }));
    const res = await GET(request('?plan=free'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(planForMember).toHaveBeenCalledWith('member-a');
    expect(body).toMatchObject({
      plan: 'pro', complimentary: true, pilotEligible: true, paymentEnabled: false,
    });
    expect(body.included.advanced_develop).toBe(true);
    expect(body.heldSeparately).toContain('member_pdf_epub_delivery');
    expect(res.headers.get('vary')).toContain('Cookie');
  });

  it('does not accept pro or beta query parameters as proof', async () => {
    getMember.mockResolvedValue('member-b');
    planForMember.mockResolvedValue(decideWriterStudioPlan({
      eligible: false, basis: 'not_in_pilot',
    }));
    const res = await GET(request('?plan=pro&beta=1'));
    const body = await res.json();
    expect(body).toMatchObject({ plan: 'free', pilotEligible: false, publicEnrollmentEnabled: false });
  });

  it('fails closed if authenticated data cannot be checked', async () => {
    getMember.mockResolvedValue('member-a');
    planForMember.mockRejectedValue(new Error('database unavailable'));
    const res = await GET(request());
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'plan_unavailable' });
    expect(res.headers.get('cache-control')).toContain('no-store');
  });
});
