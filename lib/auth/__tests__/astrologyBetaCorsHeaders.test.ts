/**
 * Astrology beta preflight contract. Static Next headers apply to the exact
 * 13 non-Synastry endpoints; list/save apply their independent dynamic policy.
 */
describe('Astrology beta exact API CORS', () => {
  it('only attaches credentialed beta CORS to 13 named endpoints', async () => {
    // Read the evaluated Next config, not just source text.
    const config = require('../../../next.config.js');
    expect(typeof config.headers).toBe('function');
    const entries: Array<{source: string;headers: Array<{key:string;value:string}>}> = await config.headers();
    const astroApi = entries.filter(x => x.source.startsWith('/api/'));
    const expected = [
      '/api/members/profile',
      '/api/astrology/birth-chart',
      '/api/astrology/current-transits',
      '/api/astrology/geocode',
      '/api/astrology/reflection',
      '/api/astrology/synastry/saved',
      '/api/astrology/spiralogic-report',
      '/api/astrology/vedic/list',
      '/api/astrology/vedic/gochara',
      '/api/astrology/vedic/ashtakavarga',
      '/api/astrology/vedic/dasha',
      '/api/astrology/da-yun',
      '/api/astrology/chinese/discuss',
    ];
    expect(astroApi.map(x => x.source).sort()).toEqual(expected.sort());
    for (const entry of astroApi) {
      const headers = Object.fromEntries(entry.headers.map(h => [h.key.toLowerCase(), h.value]));
      expect(headers['access-control-allow-origin']).toBe('https://beta.soullab.life');
      expect(headers['access-control-allow-credentials']).toBe('true');
      expect(headers['vary']).toBe('Origin');
      expect(headers['access-control-allow-methods']).toContain('OPTIONS');
      expect(headers['access-control-allow-headers']).toContain('X-Session-Token');
      expect(entry.source).not.toContain('*');
    }
    const profile = astroApi.find(x => x.source === '/api/members/profile');
    const profileMethods = profile?.headers.find(h => h.key.toLowerCase() === 'access-control-allow-methods')?.value;
    expect(profileMethods).toContain('PUT'); // useBirthChart.saveBirthData needs PUT.
    const birthCalculator = astroApi.find(x => x.source === '/api/astrology/birth-chart');
    expect(birthCalculator?.headers.find(h => h.key.toLowerCase() === 'access-control-allow-methods')?.value)
      .toContain('POST');
    expect(profileMethods).not.toContain('DELETE');
    expect(astroApi.some(x => x.source === '/api/astrology/synastry/list')).toBe(false);
    expect(astroApi.some(x => x.source === '/api/astrology/synastry/save')).toBe(false);
  });
});
