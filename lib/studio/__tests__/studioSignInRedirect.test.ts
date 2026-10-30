import fs from 'node:fs';
import path from 'node:path';
import { studioSignInRedirect } from '../studioSignInRedirect';

const layout = () => fs.readFileSync(path.join(process.cwd(), 'app/studio/layout.tsx'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('STUDIO-GATE-01 — signed-out redirect carries the destination', () => {
  test('returns the member to the Studio route they were headed to', () => {
    expect(studioSignInRedirect('/studio')).toBe('/signin?next=%2Fstudio');
    expect(studioSignInRedirect('/studio/clients')).toBe('/signin?next=%2Fstudio%2Fclients');
  });

  test('never becomes an open redirect or leaves the Studio', () => {
    expect(studioSignInRedirect('//evil.example')).toBe('/signin?next=%2Fstudio');
    expect(studioSignInRedirect('https://evil.example')).toBe('/signin?next=%2Fstudio');
    expect(studioSignInRedirect('/home')).toBe('/signin?next=%2Fstudio');
  });
});

describe('STUDIO-GATE-01 — the layout lets the SERVER decide who is signed in', () => {
  test('no pre-gate on the browser-cached member id sends anyone to sign-in', () => {
    const src = layout();
    expect(src).not.toMatch(/router\.replace\(\s*['"]\/signin['"]\s*\)/);
    const effect = src.slice(src.indexOf('async function checkPractitioner'));
    const before = src.slice(0, src.indexOf('async function checkPractitioner'));
    // getLocalMemberId may still key a local nav-order preference, but never gate access
    expect(before.slice(before.lastIndexOf('useEffect(()')) ).not.toMatch(/getLocalMemberId\(\)/);
    expect(effect.length).toBeGreaterThan(0);
  });

  test('a 401 from the server check is the only trigger, and it carries next', () => {
    const src = layout();
    expect(src).toMatch(/response\.status === 401[\s\S]{0,80}router\.replace\(studioSignInRedirect\(pathname\)\)/);
  });
});
