/** @jest-environment node */
import fs from 'node:fs';
import path from 'node:path';
import { isWebOnlyRoute } from '../../mobile/mobileAllowlist';
import { requireFounder } from '../../founder/founderAuth';
import { loadLearningReport } from '../learningReportServer';
import { buildLearningReport } from '../learningReport';
import { GET } from '../../../app/api/founder/constellation/route';
import ConstellationLearningPage from '../../../app/founder/constellation/page';

jest.mock('../../founder/founderAuth', () => ({ requireFounder: jest.fn() }));
jest.mock('../learningReportServer', () => ({ loadLearningReport: jest.fn() }));
jest.mock('../../../app/founder/constellation/LearningReportView', () => ({
  __esModule: true, default: () => null,
}));

const auth = requireFounder as jest.Mock;
const load = loadLearningReport as jest.Mock;
const now = new Date('2026-10-03T20:00:00Z');
const savedStaticBuild = process.env.CAPACITOR_BUILD;
beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.CAPACITOR_BUILD;
  auth.mockResolvedValue({ ok: true, memberId: 'founder-test-fixture' });
  load.mockResolvedValue(buildLearningReport({ kind: 'read', groups: [] }, now));
});
afterAll(() => {
  if (savedStaticBuild === undefined) delete process.env.CAPACITOR_BUILD;
  else process.env.CAPACITOR_BUILD = savedStaticBuild;
});

describe('C7A founder boundary — mocked session/DB, no production access', () => {
  it.each([401, 403])('the API refuses %s before reading the source', async status => {
    auth.mockResolvedValue({ ok: false, status, error: 'Founder access required' });
    const response = await GET();
    expect(response.status).toBe(status);
    expect(load).not.toHaveBeenCalled();
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(await response.json()).toEqual({ error: 'Founder access required' });
  });
  it.each([401, 403])('the page also refuses %s before reading, independent of the API', async status => {
    auth.mockResolvedValue({ ok: false, status, error: 'Founder access required' });
    const result = await ConstellationLearningPage();
    expect(result.props['aria-label']).toBe('Founder access required');
    expect(load).not.toHaveBeenCalled();
  });
  it('loads only after authorization and does not allow caller-selected filters', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(auth.mock.invocationCallOrder[0]).toBeLessThan(load.mock.invocationCallOrder[0]);
    expect(load).toHaveBeenCalledWith();
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(response.headers.get('Vary')).toBe('Cookie');
    expect((await response.json()).source.unit).toBe('feedback submissions');
  });
  it('renders a minimized report only after the page authorization', async () => {
    const result = await ConstellationLearningPage();
    expect(auth.mock.invocationCallOrder[0]).toBeLessThan(load.mock.invocationCallOrder[0]);
    expect(result.props.report.schema).toBe('constellation-learning.v1');
    expect(result.props.report).not.toHaveProperty('memberId');
  });
  it('returns an unavailable source as 503 with nulls, not a 200 empty funnel', async () => {
    load.mockResolvedValue(buildLearningReport({ kind: 'unavailable' }, now));
    const response = await GET();
    expect(response.status).toBe(503);
    const report = await response.json();
    expect(report.feedback.every((item: { submissions: unknown }) => item.submissions === null)).toBe(true);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });
  it('does not read from the API or page in a static native build', async () => {
    process.env.CAPACITOR_BUILD = '1';
    expect((await GET()).status).toBe(501);
    await ConstellationLearningPage();
    expect(load).not.toHaveBeenCalled();
  });
});

// The page uses a real server session; keep it out of static mobile exports.
describe('C7A native-build boundary', () => {
  it('declares the report web-only without reclassifying other founder pages', () => {
    expect(isWebOnlyRoute('/founder/constellation')).toBe(true);
    expect(isWebOnlyRoute('/founder/today')).toBe(false);
  });
  it('physically excludes the page from the static export', () => {
    const script = fs.readFileSync(path.join(process.cwd(), 'scripts/capacitor-patch-routes.sh'), 'utf8');
    expect(script).toContain('"app/founder/constellation"');
  });
});
