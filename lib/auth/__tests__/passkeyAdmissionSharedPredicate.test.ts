/**
 * The two routes must share ONE admission predicate.
 *
 * The defect this repair closed was not only that a prefix admitted without an
 * invite — it was that `check` and `register` each carried their own copy of
 * the logic and had DRIFTED, so `check` promised an admission `register` would
 * (or would not) honour. Repairing the drift without removing the duplication
 * would fix today's divergence and leave tomorrow's free to reappear.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const read = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

/** Source with comments removed, so prose describing a pattern is not mistaken
 *  for the pattern itself. */
const code = (rel: string) =>
  read(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const CHECK = 'app/api/members/check/route.ts';
const REGISTER = 'app/api/members/register/route.ts';

describe('one predicate, two routes', () => {
  it.each([CHECK, REGISTER])('%s imports the shared admission module', (rel) => {
    expect(read(rel)).toMatch(/from\s*'@\/lib\/auth\/passkeyAdmission'/);
  });

  it.each([CHECK, REGISTER])('%s calls resolveAdmission', (rel) => {
    expect(read(rel)).toMatch(/resolveAdmission\(/);
  });

  it.each([CHECK, REGISTER])('%s no longer defines a local admission predicate', (rel) => {
    const src = code(rel);
    expect(src).not.toMatch(/function\s+isAdminPasskey/);
    expect(src).not.toMatch(/adminPrefixes\s*=/);
  });

  it('register no longer treats a missing invite as acceptable', () => {
    expect(code(REGISTER)).not.toMatch(/that's fine\s*-\s*continue/);
  });

  it('check never reports a valid invite without one existing', () => {
    const src = code(CHECK);
    // The only `inviteStatus: 'valid'` in CODE may sit inside the `admit` branch.
    const validMentions = src.match(/inviteStatus:\s*'valid'/g) ?? [];
    expect(validMentions).toHaveLength(1);
    const idx = src.indexOf("inviteStatus: 'valid'");
    const admitIdx = src.indexOf("admission.kind === 'admit'");
    expect(admitIdx).toBeGreaterThan(-1);
    expect(idx).toBeGreaterThan(admitIdx);
  });

  it('the format predicate is named as a format predicate', () => {
    const mod = code('lib/auth/passkeyAdmission.ts');
    expect(mod).toMatch(/export function hasAcceptedPasskeyFormat/);
    expect(mod).not.toMatch(/export function isAdminPasskey/);
  });

  it('registration still sets no role or tier from the passkey', () => {
    const src = code(REGISTER);
    const insert = src.slice(src.indexOf('INSERT INTO members'), src.indexOf('RETURNING id, username'));
    expect(insert).not.toMatch(/\broles\b/);
    expect(insert).not.toMatch(/\btier\b/);
  });
});
