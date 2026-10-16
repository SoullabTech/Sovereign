import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const invitation = readFileSync(join(__dirname, 'page.tsx'), 'utf8');

describe('invitation threshold is before voluntary participation consent', () => {
  it('does not tell the writer that password setup has opened Studio', () => {
    expect(invitation).not.toContain('Your writing room is ready.');
    expect(invitation).toContain('Sign in to review the beta participation terms');
  });

  it('offers account setup, not an implied consent or editorial act', () => {
    expect(invitation).toContain('Create a password for your private beta account.');
    expect(invitation).toContain('decide whether to enter Writer’s Studio.');
    expect(invitation).toContain('Set password and continue');
    expect(invitation).not.toContain("'Enter Writer’s Studio'");
  });

  it('still completes through the ordinary verified sign-in doorway', () => {
    expect(invitation).toContain('href="/signin"');
    expect(invitation).toContain('Go to sign in');
  });
});
