/**
 * Lab Tools access is its own authority.
 *
 * THE COLLAPSE THIS PREVENTS (founder ruling 2026-09-04): /labtools was gated
 * on requireFounder(), so the only way to admit a founding member to the lab
 * was to add them to FOUNDER_MEMBER_IDS. That allowlist governs founder-PRIVATE
 * surfaces — the /api/founder/* console (contacts, tasks, signals, rollout),
 * Book Studio drafts, workbench uploads, the render pipeline. Admitting a
 * founding member there to get them through the lab door would hand them the
 * founder's private correspondence and unpublished drafts as a side effect.
 *
 * Two authorities, each named for what it is:
 *   FOUNDER_MEMBER_IDS     the founder — founder-private surfaces
 *   LAB_ACCESS_MEMBER_IDS  founding members — the internal laboratory
 *
 * Union in ONE direction only: a founder has lab access; a lab member is NOT
 * thereby a founder. If that ever reverses, this file fails.
 */
import path from 'path';
import { readFileSync } from 'fs';

const FOUNDER = '11111111-1111-1111-1111-111111111111';
const LAB_MEMBER = '22222222-2222-2222-2222-222222222222';
const ORDINARY = '33333333-3333-3333-3333-333333333333';

/** The module reads env at import time, so each case needs a fresh module. */
function loadWith(env: { founders?: string; lab?: string }) {
  let mod!: typeof import('../labAccess');
  let founderMod!: typeof import('@/lib/founder/founderAuth');
  jest.isolateModules(() => {
    process.env.FOUNDER_MEMBER_IDS = env.founders ?? '';
    process.env.LAB_ACCESS_MEMBER_IDS = env.lab ?? '';
    founderMod = require('@/lib/founder/founderAuth');
    mod = require('../labAccess');
  });
  return { ...mod, ...{ isFounderMemberId: founderMod.isFounderMemberId } };
}

const ENV = { ...process.env };
afterEach(() => {
  process.env = { ...ENV };
});

describe('hasLabAccess', () => {
  it('admits a founding member on the lab list', () => {
    const { hasLabAccess } = loadWith({ founders: FOUNDER, lab: LAB_MEMBER });
    expect(hasLabAccess(LAB_MEMBER)).toBe(true);
  });

  it('admits the founder without listing them twice', () => {
    const { hasLabAccess } = loadWith({ founders: FOUNDER, lab: LAB_MEMBER });
    expect(hasLabAccess(FOUNDER)).toBe(true);
  });

  it('refuses an ordinary member', () => {
    const { hasLabAccess } = loadWith({ founders: FOUNDER, lab: LAB_MEMBER });
    expect(hasLabAccess(ORDINARY)).toBe(false);
  });

  it('does NOT make a lab member a founder — the union runs one way', () => {
    const { hasLabAccess, isFounderMemberId } = loadWith({ founders: FOUNDER, lab: LAB_MEMBER });
    expect(hasLabAccess(LAB_MEMBER)).toBe(true);
    expect(isFounderMemberId(LAB_MEMBER)).toBe(false);
  });

  it('fails closed when nothing is configured', () => {
    // Forgetting the env var must refuse, never admit.
    const { hasLabAccess } = loadWith({});
    expect(hasLabAccess(FOUNDER)).toBe(false);
    expect(hasLabAccess(LAB_MEMBER)).toBe(false);
  });

  it('tolerates whitespace and empty entries in the list', () => {
    const { hasLabAccess } = loadWith({ lab: ` ${LAB_MEMBER} , , ` });
    expect(hasLabAccess(LAB_MEMBER)).toBe(true);
  });
});

describe('Lab Tools is gated on lab access, not on founder identity', () => {
  const layout = readFileSync(
    path.join(__dirname, '../../../app/labtools/layout.tsx'),
    'utf8',
  );
  /** The docstring names the authority it replaced; only code is scanned. */
  const code = layout.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it('app/labtools/layout.tsx calls requireLabAccess()', () => {
    expect(code).toMatch(/requireLabAccess\(\)/);
  });

  it('and no longer calls requireFounder() — that is the collapse', () => {
    expect(code).not.toMatch(/requireFounder\(/);
  });
});
