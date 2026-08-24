/**
 * ENTRY INTENT — /signin opens on username, /signup opens on email.
 *
 * THE DEFECT. Both routes rendered `<UnifiedAuth />` with no props, so the
 * shared component could not tell a returning member from a joining one and
 * opened on the email-code phase for both. `/signin` — the returning door —
 * asked for an email address.
 *
 * Structural rather than behavioural: jest runs `testEnvironment: 'node'` here,
 * so there is no DOM to render into. These assert the wiring that decides which
 * phase opens, which is the thing that was wrong.
 */
import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import path from 'path';

const read = (p: string) => readFileSync(path.join(process.cwd(), p), 'utf8');
const COMPONENT = read('components/auth/UnifiedAuth.tsx');

describe('each route declares why the person arrived', () => {
  it('/signin is the returning door', () => {
    expect(read('app/signin/page.tsx')).toContain('<UnifiedAuth mode="signin" />');
  });

  it('/signup is the joining door', () => {
    expect(read('app/signup/page.tsx')).toContain('<UnifiedAuth mode="signup" />');
  });

  it('neither route renders the component without an intent', () => {
    for (const p of ['app/signin/page.tsx', 'app/signup/page.tsx']) {
      expect(read(p)).not.toMatch(/<UnifiedAuth\s*\/>/);
    }
  });
});

describe('the intent decides the opening phase', () => {
  it('/signin opens on password', () => {
    expect(COMPONENT).toMatch(/mode === 'signin' \? 'password' : 'email'/);
  });

  it('the component accepts and forwards the mode', () => {
    expect(COMPONENT).toContain('<UnifiedAuthInner mode={mode} />');
    expect(COMPONENT).toMatch(/mode\?: AuthMode/);
  });

  // ?verified= and ?u= name a specific person mid-flow and must still win, or a
  // magic-link return would be bounced to a password form.
  it('an explicit deep-link still outranks the mode', () => {
    expect(COMPONENT).toMatch(/preVerified \? 'name' : usernameParam \? 'password' : mode/);
  });
});

describe('/signin hierarchy: password, then biometric, then email', () => {
  const passwordPhase = COMPONENT.slice(
    COMPONENT.indexOf("key=\"password\""),
    COMPONENT.indexOf("key=\"name\"")
  );

  // Assert the HANDLER BINDING, not the bare identifier: the explanatory comment
  // above the button also contains the word `continueWithBiometric`, so a
  // `toContain('continueWithBiometric')` passed even with the button deleted.
  // Caught by falsification — removing the button left the test green.
  const BINDING = 'onClick={continueWithBiometric}';

  it('biometric sits inside the password phase, not only the email phase', () => {
    expect(passwordPhase).toContain(BINDING);
  });

  it('biometric comes before the email fallback', () => {
    expect(passwordPhase.indexOf(BINDING))
      .toBeLessThan(passwordPhase.indexOf('Email me a sign-in code instead'));
  });

  it('biometric is offered as signing in, not as an unnamed continue', () => {
    expect(COMPONENT).not.toContain('Continue with {biometricLabel}');
    expect(COMPONENT).toContain('Sign in with {biometricLabel}');
  });
});

describe('/signup offers no password door', () => {
  it('the username+password button is gated to signin', () => {
    expect(COMPONENT).toMatch(/mode === 'signin' && \(\s*<button[^>]*onClick=\{\(\) => \{ setPhase\('password'\)/);
  });

  it('signup gets a way across to signin instead', () => {
    expect(COMPONENT).toMatch(/mode === 'signup' &&/);
    expect(COMPONENT).toContain('Already a member?');
    expect(COMPONENT).toContain('href="/signin"');
  });
});

describe('neither door is a dead end', () => {
  // Members who joined via email code hold a generated password they have never
  // seen. Opening /signin on password must not strand them.
  it('the password phase offers the email door', () => {
    expect(COMPONENT).toContain('Email me a sign-in code instead');
  });

  it('the email phase offers the password door', () => {
    expect(COMPONENT).toContain('Sign in with username and password');
  });
});

// Founder ruling 2026-08-24: the waitlist is removed as a product state. The
// route can no longer emit { status: 'waitlist' } (proved in
// app/api/members/email-code/__tests__/route.test.ts). These keep the CLIENT
// half removed too — otherwise a divert could be reintroduced as dead code and
// silently wait for a server that starts emitting the shape again.
//
// Added after falsification: reinstating the client divert left the component
// suite green, because nothing here was watching for it.
describe('the waitlist is gone from the card', () => {
  it('has no waitlist phase in the Phase union', () => {
    const union = COMPONENT.match(/type Phase =[^;]+;/)?.[0] ?? '';
    expect(union).toBeTruthy();
    expect(union).not.toContain('waitlist');
  });

  it('never diverts on a waitlist response', () => {
    expect(COMPONENT).not.toContain("'waitlist'");
    expect(COMPONENT).not.toMatch(/status\s*===\s*['"]waitlist['"]/);
  });

  it('renders no waitlist screen', () => {
    expect(COMPONENT.toLowerCase()).not.toContain('waitlist');
  });
});

// Trunk's failed-send presentation (PR #1079) demotes Continue to outline so the
// username+password button can carry primary weight. #1080 gates that button to
// /signin, so on /signup the demotion would leave the card with no primary action
// and nothing promoted in its place.
describe('a failed send never leaves /signup without a primary action', () => {
  it('Continue is only demoted where a password door exists to promote', () => {
    expect(COMPONENT).toContain("sendBlocked && mode === 'signin' ? outlineBtn : primaryBtn");
    expect(COMPONENT).not.toContain('sendBlocked ? outlineBtn : primaryBtn');
  });
});
