/**
 * C0 source-contract guard for UI surfaces.
 * These checks prevent the old unsafe APIs being reintroduced by ordinary UI
 * refactors; browser UX still requires a separate human/mobile witness.
 */
import { describe, expect, it } from '@jest/globals';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../../..');
const settings = readFileSync(path.join(ROOT, 'components/account/AccountSettings.tsx'), 'utf8');
const sheet = readFileSync(path.join(ROOT, 'components/auth/PasswordChangeSheet.tsx'), 'utf8');
const profileRoute = readFileSync(path.join(ROOT, 'app/api/members/profile/route.ts'), 'utf8');
const passwordRoute = readFileSync(path.join(ROOT, 'app/api/members/password/route.ts'), 'utf8');

describe('C0 account identity UI contract', () => {
  it('does not send account email during an ordinary profile save', () => {
    const save = settings.slice(settings.indexOf('const saveProfile = useCallback'), settings.indexOf('// Search for birth location'));
    expect(save).toContain("apiFetch('/api/members/profile'");
    expect(save).not.toMatch(/email\s*:\s*editEmail/);
    expect(save).toContain('setProfileSaveError');
  });

  it('shows the existing account email as noneditable with explanation', () => {
    expect(settings).toContain('id="profile-account-email"');
    expect(settings).toMatch(/id="profile-account-email"[\s\S]{0,180}readOnly/);
    expect(settings).toContain('Account email changes require separate verification');
    expect(settings).toContain('role="alert"');
  });

  it('keeps birth data and astrology consent independent of the email restriction', () => {
    expect(settings).toContain('body: JSON.stringify({ memberId: userId, birthData })');
    expect(settings).toContain('body: JSON.stringify({ memberId: userId, birthData: null })');
    expect(settings).toContain('body: JSON.stringify({ memberId: userId, astrologyConsent: consent })');
  });

  it('does not collect a new password or call session-only password setup', () => {
    expect(sheet).not.toContain("apiFetch('/api/members/password'");
    expect(sheet).not.toMatch(/<input[^>]*type="password"/);
    expect(sheet).toContain('No password has been changed');
    expect(sheet).toContain('mailto:support@soullab.life');
    expect(sheet).toContain('href="/account/settings"');
  });

  it('refuses email writes at the API and credential writes at the legacy password API', () => {
    expect(profileRoute).toContain("Object.prototype.hasOwnProperty.call(body, 'email')");
    expect(profileRoute).toContain('EMAIL_CHANGE_REQUIRES_VERIFICATION');
    expect(passwordRoute).toContain('PASSWORD_SETUP_REQUIRES_REVERIFICATION');
    expect(passwordRoute).not.toContain('UPDATE members');
    expect(passwordRoute).not.toContain('hashPassword');
  });
});
