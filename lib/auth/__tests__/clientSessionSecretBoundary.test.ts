import { readFileSync } from 'fs';
import path from 'path';

const src = readFileSync(path.resolve(__dirname, '../clientSession.ts'), 'utf8');

describe('client portal session secret boundary', () => {
  it('uses only CLIENT_SESSION_SECRET for portal-session HMACs', () => {
    expect(src).toMatch(/process\.env\.CLIENT_SESSION_SECRET/);
    expect(src).not.toMatch(/PHI_ENCRYPTION_KEY/);
    expect(src).not.toContain('dev-client-secret');
  });

  it('fails closed when the dedicated secret is absent', () => {
    expect(src).toMatch(/CLIENT_SESSION_SECRET is required/);
    expect(src).toMatch(/if \(!secret\) return null/);
  });
});
