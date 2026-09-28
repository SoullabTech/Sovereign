import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('member access recovery door', () => {
  const unified = read('components/auth/UnifiedAuth.tsx');
  const legacyCard = read('components/auth/SignInCard.tsx');

  it('offers one plain emergency access doorway on returning-member sign-in', () => {
    expect(unified).toContain('Can’t get in?');
  });

  it('offers only real existing recovery paths', () => {
    expect(unified).toContain('Email me a sign-in code');
    expect(unified).toContain('href="/reset-password"');
    expect(unified).toContain('mailto:support@soullab.life');
  });

  it('does not point members at the dead legacy /recover page', () => {
    expect(unified).not.toContain('href="/recover"');
    expect(legacyCard).not.toContain('href="/recover"');
    expect(legacyCard).toContain('href="/reset-password"');
  });
});
