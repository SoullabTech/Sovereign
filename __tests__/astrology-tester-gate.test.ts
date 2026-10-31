/**
 * Free Astrology is visible only to testers (founder admission 2026-10-30).
 * The gate must cover every Astrology room page, leave the identity-free
 * calculator APIs and the founder-only Pro preview to their own policies, and
 * run in the proxy before the public-route shortcut.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
import { query } from '@/lib/db/postgres';
import { isTesterGatedAstrologyPage, memberIsAstrologyTester } from '../lib/astrology/testerGate';

const mockedQuery = query as unknown as jest.Mock;

describe('Free Astrology testers-only gate', () => {
  it.each([
    '/astrology',
    '/astrology/',
    '/astrology/pathways/fire',
    '/astrology/aspects/uranus-conjunction-neptune',
    '/astrology/synastry/saved',
    '/astrology/vedic',
  ])('gates the room page %s', (p) => {
    expect(isTesterGatedAstrologyPage(p)).toBe(true);
  });

  it.each([
    '/api/astrology/current-transits',
    '/api/astrology/birth-chart',
    '/astrology/pro-preview',
    '/astrology/pro-preview/anything',
    '/astrologyx',
    '/house',
  ])('leaves %s to its own policy', (p) => {
    expect(isTesterGatedAstrologyPage(p)).toBe(false);
  });

  it('admits only an explicit tester flag', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ tester: true }] });
    await expect(memberIsAstrologyTester('m1')).resolves.toBe(true);
    mockedQuery.mockResolvedValueOnce({ rows: [{ tester: false }] });
    await expect(memberIsAstrologyTester('m1')).resolves.toBe(false);
    mockedQuery.mockResolvedValueOnce({ rows: [{ tester: null }] });
    await expect(memberIsAstrologyTester('m1')).resolves.toBe(false);
    mockedQuery.mockResolvedValueOnce({ rows: [] });
    await expect(memberIsAstrologyTester('m1')).resolves.toBe(false);
  });

  it('fails closed when the lookup errors', async () => {
    mockedQuery.mockRejectedValueOnce(new Error('db down'));
    await expect(memberIsAstrologyTester('m1')).resolves.toBe(false);
  });

  it('runs in the proxy before the public-route shortcut', () => {
    const src = readFileSync(path.join(__dirname, '..', 'proxy.ts'), 'utf8');
    const gate = src.indexOf('isTesterGatedAstrologyPage(pathname)');
    const publicShortcut = src.indexOf('if (preRule?.public)');
    expect(gate).toBeGreaterThan(-1);
    expect(publicShortcut).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(publicShortcut);
    expect(src).toContain('memberIsAstrologyTester(');
  });
});
