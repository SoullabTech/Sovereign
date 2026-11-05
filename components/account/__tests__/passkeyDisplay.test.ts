/**
 * The profile API returns the passkey already masked (first 8 characters, then
 * asterisks) and never the full value. A show/hide toggle over that value can
 * only switch between two masked displays, so a member who clicks it sees
 * "SOULLAB-" followed by asterisks and concludes the page is broken
 * (2026-09-10 report). The page must not offer a reveal it cannot perform.
 */
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'components/account/AccountSettings.tsx'), 'utf8');
const profileRoute = fs.readFileSync(path.join(process.cwd(), 'app/api/members/profile/route.ts'), 'utf8');

describe('account passkey display', () => {
  it('offers no show/hide toggle for the passkey', () => {
    expect(source).not.toMatch(/showPasskey|setShowPasskey/);
  });

  it('says plainly that the passkey is hidden and not needed to sign in', () => {
    expect(source).toContain('hidden for security');
    expect(source).toContain('You don’t need it to sign in');
  });

  it('is consistent with the API, which masks the passkey server-side', () => {
    expect(profileRoute).toMatch(/'\*'\.repeat\(/);
  });
});
