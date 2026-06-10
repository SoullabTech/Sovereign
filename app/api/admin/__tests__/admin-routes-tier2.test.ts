/**
 * Tier-2 admin guard verification. Every listed handler must block
 * unauthenticated callers (401); the previously-forgeable routes must reject a
 * forged x-member-id alone; valid x-admin-password passes. Guard = isAdminRequest
 * (LABTOOLS_ADMIN_PASSWORD), run for real; DB + agent-monitor services mocked.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

const ADMIN_PW = 'tier2-test-secret';

const mockQuery = jest.fn<(...a: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (...a: unknown[]) => mockQuery(...a) },
  query: (...a: unknown[]) => mockQuery(...a),
}));
jest.mock('@/lib/ai/agentMonitorQueries', () => ({
  __esModule: true,
  getAgentRuns: jest.fn(async () => []),
  getAgentRunById: jest.fn(async () => null),
  getAgentRunEvents: jest.fn(async () => []),
  getAgentRunSummaryCounts: jest.fn(async () => ({})),
}));
jest.mock('@/lib/ai/agentMonitor', () => ({
  __esModule: true,
  updateAgentRunHumanReview: jest.fn(async () => {}),
  HumanReviewStatus: {},
}));

import { GET as ccMembersGET, POST as ccMembersPOST } from '../command-center/members/route';
import { GET as ccOverviewGET, POST as ccOverviewPOST } from '../command-center/overview/route';
import { GET as ccSystemGET, POST as ccSystemPOST } from '../command-center/system/route';
import { GET as ccConvGET, POST as ccConvPOST } from '../command-center/conversations/route';
import { GET as ccFieldGET, POST as ccFieldPOST } from '../command-center/field-engines/route';
import { GET as ccActionsGET, POST as ccActionsPOST } from '../command-center/actions/route';
import { GET as securityGET } from '../security/route';
import { GET as opusSummaryGET, POST as opusSummaryPOST } from '../opus-pulse/summary/route';
import { GET as opusTurnsGET } from '../opus-pulse/turns/route';
import { GET as opusHeatGET } from '../opus-pulse/facet-heatmap/route';
import { GET as councilGET } from '../council/telemetry/route';
import { POST as activityPOST } from '../activity-feed/route';
import { GET as agentGET, PATCH as agentPATCH } from '../agent-monitor/route';
import { GET as substrateGET } from '../maia/substrate/route';
import { GET as engineGET } from '../maia/engine-comparisons/route';
import { PATCH as enginePATCH } from '../maia/engine-comparisons/[id]/route';

type H = (req: NextRequest, ctx?: unknown) => Promise<Response>;
const idCtx = { params: Promise.resolve({ id: 'x' }) };

function req(opts: { method?: string; admin?: string; member?: string; body?: unknown } = {}): NextRequest {
  const h: Record<string, string> = { 'content-type': 'application/json' };
  if (opts.admin) h['x-admin-password'] = opts.admin;
  if (opts.member) h['x-member-id'] = opts.member;
  return new NextRequest('http://localhost/api/admin/x', {
    method: opts.method ?? 'GET',
    headers: h,
    ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
  });
}

beforeEach(() => {
  mockQuery.mockReset();
  mockQuery.mockResolvedValue({ rows: [] });
  process.env.LABTOOLS_ADMIN_PASSWORD = ADMIN_PW;
  delete process.env.CAPACITOR_BUILD;
});

// [label, handler, method, needsIdCtx]
const ALL: [string, H, string, boolean][] = [
  ['cc/members GET', ccMembersGET as H, 'GET', false], ['cc/members POST', ccMembersPOST as H, 'POST', false],
  ['cc/overview GET', ccOverviewGET as H, 'GET', false], ['cc/overview POST', ccOverviewPOST as H, 'POST', false],
  ['cc/system GET', ccSystemGET as H, 'GET', false], ['cc/system POST', ccSystemPOST as H, 'POST', false],
  ['cc/conversations GET', ccConvGET as H, 'GET', false], ['cc/conversations POST', ccConvPOST as H, 'POST', false],
  ['cc/field-engines GET', ccFieldGET as H, 'GET', false], ['cc/field-engines POST', ccFieldPOST as H, 'POST', false],
  ['cc/actions GET', ccActionsGET as H, 'GET', false], ['cc/actions POST', ccActionsPOST as H, 'POST', false],
  ['security GET', securityGET as H, 'GET', false],
  ['opus/summary GET', opusSummaryGET as H, 'GET', false], ['opus/summary POST', opusSummaryPOST as H, 'POST', false],
  ['opus/turns GET', opusTurnsGET as H, 'GET', false],
  ['opus/facet-heatmap GET', opusHeatGET as H, 'GET', false],
  ['council/telemetry GET', councilGET as H, 'GET', false],
  ['activity-feed POST', activityPOST as H, 'POST', false],
  ['agent-monitor GET', agentGET as H, 'GET', false], ['agent-monitor PATCH', agentPATCH as H, 'PATCH', false],
  ['maia/substrate GET', substrateGET as H, 'GET', false],
  ['maia/engine-comparisons GET', engineGET as H, 'GET', false],
  ['maia/engine-comparisons/[id] PATCH', enginePATCH as H, 'PATCH', true],
];

describe('Tier-2 — every guarded handler blocks unauthenticated (401)', () => {
  it.each(ALL)('%s → 401', async (_label, handler, method, needsId) => {
    const r = req({ method, body: method === 'GET' ? undefined : {} });
    const res = needsId ? await handler(r, idCtx) : await handler(r);
    expect(res.status).toBe(401);
  });
});

describe('Tier-2 — previously-forgeable routes reject forged x-member-id alone (401)', () => {
  it.each([
    ['agent GET', agentGET as H, 'GET', false],
    ['agent PATCH', agentPATCH as H, 'PATCH', false],
    ['substrate GET', substrateGET as H, 'GET', false],
    ['engine GET', engineGET as H, 'GET', false],
    ['engine/[id] PATCH', enginePATCH as H, 'PATCH', true],
  ] as [string, H, string, boolean][])('%s forged member only → 401', async (_l, handler, method, needsId) => {
    const r = req({ method, member: 'forged-uuid', body: method === 'GET' ? undefined : {} });
    const res = needsId ? await handler(r, idCtx) : await handler(r);
    expect(res.status).toBe(401);
  });
});

describe('Tier-2 — valid admin secret passes the guard (not 401)', () => {
  it.each([
    ['cc/members GET', ccMembersGET as H], ['security GET', securityGET as H],
    ['agent GET', agentGET as H], ['maia/substrate GET', substrateGET as H],
    ['opus/turns GET', opusTurnsGET as H],
  ] as [string, H][])('%s valid secret → not 401', async (_l, handler) => {
    const res = await handler(req({ admin: ADMIN_PW }));
    expect(res.status).not.toBe(401);
  });
});
