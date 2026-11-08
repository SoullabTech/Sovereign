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
    expect(unified).toContain('Forgot your password? Email me a sign-in code');
    // The emailed reset link cannot be delivered (the mail boundary admits only
    // the sign-in code), so the sign-in page must not send members to it.
    expect(unified).not.toContain('href="/reset-password"');
    expect(unified).toContain('mailto:support@soullab.life');
  });

  it('does not point members at the dead legacy /recover page', () => {
    expect(unified).not.toContain('href="/recover"');
    expect(legacyCard).not.toContain('href="/recover"');
    expect(legacyCard).toContain('href="/reset-password"');
  });

  it('opens straight on the email-code step when sent with ?method=code', () => {
    expect(unified).toContain("searchParams?.get('method') === 'code'");
  });

  it('the reset page no longer offers a request form that posts an address', () => {
    const page = read('app/reset-password/page.tsx');
    expect(page).not.toContain("method: 'POST'");
    expect(page).toContain('/signin?method=code');
    // founder-issued links keep working
    expect(page).toContain("method: 'PUT'");
  });
});
