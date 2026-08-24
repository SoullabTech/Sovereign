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
    expect(read('app/signin/page.tsx')).toContain('<UnifiedAuth intent="returning" />');
  });

  it('/signup is the joining door', () => {
    expect(read('app/signup/page.tsx')).toContain('<UnifiedAuth intent="joining" />');
  });

  it('neither route renders the component without an intent', () => {
    for (const p of ['app/signin/page.tsx', 'app/signup/page.tsx']) {
      expect(read(p)).not.toMatch(/<UnifiedAuth\s*\/>/);
    }
  });
});

describe('the intent decides the opening phase', () => {
  it('a returning arrival opens on password', () => {
    expect(COMPONENT).toMatch(/intent === 'returning' \? 'password' : 'email'/);
  });

  it('the component accepts and forwards the intent', () => {
    expect(COMPONENT).toContain('<UnifiedAuthInner intent={intent} />');
    expect(COMPONENT).toMatch(/intent\?: AuthIntent/);
  });

  // ?verified= and ?u= name a specific person mid-flow and must still win, or a
  // magic-link return would be bounced to a password form.
  it('an explicit deep-link still outranks the intent', () => {
    expect(COMPONENT).toMatch(/preVerified \? 'name' : usernameParam \? 'password' : intent/);
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
