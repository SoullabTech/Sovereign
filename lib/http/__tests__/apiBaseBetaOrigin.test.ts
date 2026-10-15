import fs from 'node:fs';
import path from 'node:path';

describe('Writer Studio beta web API origin', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'lib/http/apiBase.ts'), 'utf8');

  it('keeps beta.soullab.life API calls on the beta origin', () => {
    expect(source).toContain("hostname === 'beta.soullab.life'");
    const beta = source.indexOf("hostname === 'beta.soullab.life'");
    const sameOrigin = source.indexOf("return ''; // Same-origin API calls for local dev and the isolated beta host");
    expect(beta).toBeGreaterThan(-1);
    expect(sameOrigin).toBeGreaterThan(beta);
  });

  it('retains the absolute Soullab fallback for native and other web hosts', () => {
    expect(source).toContain('return "https://soullab.life";');
    expect(source).toContain("protocol === 'capacitor:'");
    expect(source).toContain("Capacitor native platform — using soullab.life");
  });
});
