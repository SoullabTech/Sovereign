import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('returning-member identifier contract', () => {
  const route = read('app/api/members/signin/route.ts');
  const component = read('components/auth/UnifiedAuth.tsx');

  it('password sign-in accepts username or email case-insensitively', () => {
    expect(route).toContain('LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)');
  });

  it('keeps the existing username request field for client compatibility', () => {
    expect(route).toContain('const { username, password } = body;');
  });

  it('labels the identifier field as email or username', () => {
    expect(component).toContain('placeholder="Email or username"');
    expect(component).toContain('Sign in with your email or username and password.');
  });

  it('parses API JSON errors before presenting them', () => {
    expect(component).toContain('setError(data?.error || `Sign in failed (${res.status})`)');
    expect(component).not.toContain('setError(text || `Sign in failed (${res.status})`)');
  });
});
