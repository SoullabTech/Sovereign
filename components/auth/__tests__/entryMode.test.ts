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

// SUPERSEDED 2026-09-11 — FOUNDER RULING. Both doors open on email.
//
// The header above is kept verbatim. The earlier ruling is not stale and was not
// wrong on its own terms: /signin really was asking returning members for an email
// address. It is superseded ON ITS PREMISE — it assumed a population for whom
// password was a valid universal entry mode. Production now contains email-code
// members who have never possessed a password. The premise is false, so the ruling
// falls with it.
//
// IDENTITY FIRST; AUTHENTICATION METHOD SECOND. The door asks who is entering
// before presuming how they authenticate.
//
// Observed 2026-09-11: an operator holding a valid 6-digit code typed it into the
// password field and was correctly refused by the wrong form — the interface
// contradicting the authentication model. 5 of the 7 stalled accounts sit at the
// step straight after account creation.
//
// The general rule this defends, beyond this screen:
//     never ask a member for a credential the system has never established
//     with them.
describe('the intent decides the opening phase', () => {
  it('both doors open on email', () => {
    expect(COMPONENT).toMatch(/preVerified \? 'name' : usernameParam \? 'password' : 'email'/);
  });

  it('no route opens straight onto a password form', () => {
    expect(COMPONENT).not.toMatch(/mode === 'signin' \? 'password'/);
  });

  it('the component accepts and forwards the mode', () => {
    expect(COMPONENT).toContain('<UnifiedAuthInner mode={mode} />');
    expect(COMPONENT).toMatch(/mode\?: AuthMode/);
  });

  // ?verified= and ?u= name a specific person mid-flow and must still win, or a
  // magic-link return would be bounced to a password form.
  it('an explicit deep-link still outranks the default', () => {
    expect(COMPONENT).toMatch(/preVerified \? 'name' : usernameParam \? 'password'/);
  });
});

// Two constraints ride with the 2026-09-11 ruling. Asking for identity first
// creates a new opportunity to leak — the email step now happens for everyone —
// and a new way to strand the password population if their door gets demoted to a
// footnote. Both are asserted here so the ruling cannot be half-implemented.
describe('the constraints that ride with identity-first', () => {
  const sendCode = COMPONENT.slice(
    COMPONENT.indexOf('async function sendCode'),
    COMPONENT.indexOf('async function verifyCode')
  );

  it('the send step is there', () => {
    expect(sendCode.length).toBeGreaterThan(200);
  });

  // The API returns an identical body either way (asserted server-side in
  // app/api/members/email-code/__tests__/route.test.ts). This keeps the CLIENT
  // from reintroducing the distinction by reading a field the server may one day
  // start sending, or by branching its own way to the code screen.
  it('reveals nothing about whether the account already exists', () => {
    expect(sendCode).not.toMatch(/isExistingMember|alreadyAMember|data\??\.(exists|member)/);
    expect(sendCode).toContain("setPhase('code')");
    expect(sendCode.match(/setPhase\(/g) ?? []).toHaveLength(1);
  });

  // Established password members lost their default opening to this ruling. They
  // must not also lose their door to a 12px link — the 2026-08-24 regression.
  it('an established password member does not have to hunt', () => {
    const emailPhase = COMPONENT.slice(
      COMPONENT.indexOf('Sign in with username and password') - 2000,
      COMPONENT.indexOf('Sign in with username and password')
    );
    expect(emailPhase).toMatch(/sendBlocked \? primaryBtn : outlineBtn/);
    expect(COMPONENT).toContain('Sign in with username and password');
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

// /signin opens straight onto a password form. Someone who arrives without an
// account sees three doors they cannot open — password, biometric, email code —
// and, before this, no exit. The mirror of /signup's "Already a member?" link.
describe('/signin offers a way out for someone with no account', () => {
  const passwordPhase = COMPONENT.slice(
    COMPONENT.indexOf("key=\"password\""),
    COMPONENT.indexOf("key=\"name\"")
  );

  it('offers new members a route in, from the password phase', () => {
    expect(passwordPhase).toContain('New to Soullab?');
  });

  // /begin, not /signup: the onboarding invariant is a single entry point for
  // new members. Asserted so a later edit cannot quietly reroute it.
  it('routes them to the canonical entry point', () => {
    expect(passwordPhase).toContain('href="/begin"');
    expect(passwordPhase).not.toContain('href="/signup"');
  });

  it('is gated to signin — /signup already has its own footer', () => {
    expect(COMPONENT).toMatch(/mode === 'signin' && \(\s*<p[^>]*>\s*New to Soullab\?/);
  });
});
