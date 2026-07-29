/**
 * Invitation gate — ordering invariant for the Now What? front door.
 *
 * INVARIANT (Kelly ruling 2026-07-29, F1 — Option A):
 *   No ACCOUNT-CREATING credential field may be presented until invitation
 *   eligibility has been established. Existing authorized members must always
 *   retain a path to authenticate into accounts they already hold.
 *
 * An earlier version of this file encoded the broader invariant — "no credential
 * field at all" — which the implementation then satisfied by locking existing
 * members out. The ruling narrowed the gate to account creation; these tests
 * were revised to match, and the acceptance case below pins the return path so
 * the over-gate cannot silently return.
 *
 * ⚠️ TEST-STRENGTH NOTE (read before trusting this file): the strongest form of
 * these assertions would RENDER the page and assert no password input exists in
 * the produced DOM. That could not run here — this repo's jest `transform` does
 * not handle `.tsx`, and there is no React Testing Library, which is why no
 * component renders anywhere in this suite. Adding a transform is a repo-wide
 * change and was refused inside a Tier 0 repair lane.
 *
 * What replaces it is a SOURCE-STRUCTURE proof that the credential component is
 * mounted only in the eligible branch — weaker than a render, and honest about
 * being so. If component testing is ever configured, replace that block with
 * real renders.
 *
 * The eligibility rule itself is pure and IS tested behaviourally.
 */
import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import { invitedFieldContext, isInvited, AUTHORIZED_FIELD_CONTEXTS, UNINVITED_COPY } from '../invitation';

const page = readFileSync(join(process.cwd(), 'app/now-what/arrive/page.tsx'), 'utf8');
const route = readFileSync(join(process.cwd(), 'app/api/now-what/register/route.ts'), 'utf8');

/**
 * Extract a top-level `function Name(...) { ... }` body by brace matching.
 *
 * NOTE: the body brace must be located AFTER the parameter list closes.
 * Anchoring on the first `{` finds the destructuring param of
 * `function Foo({ next }: Props)` and silently returns a truncated body — which
 * is exactly how the first version of this file produced four false failures.
 */
function functionBody(src: string, name: string): string {
  const start = src.indexOf(`function ${name}(`);
  if (start === -1) throw new Error(`function ${name} not found`);
  // Walk the parameter list to its closing paren, then take the next brace.
  let i = src.indexOf('(', start);
  let parens = 0;
  for (; i < src.length; i++) {
    if (src[i] === '(') parens++;
    else if (src[i] === ')') {
      parens--;
      if (parens === 0) break;
    }
  }
  const open = src.indexOf('{', i);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(open, i + 1);
    }
  }
  throw new Error(`unbalanced braces in ${name}`);
}

const countOf = (haystack: string, needle: string) => haystack.split(needle).length - 1;

describe('eligibility rule (behavioural)', () => {
  it('accepts an authorized context on a now-what path', () => {
    expect(invitedFieldContext('/now-what/room?fieldContext=now-what-demo')).toBe('now-what-demo');
    expect(isInvited('/now-what/room?fieldContext=flourishing')).toBe(true);
  });

  it('refuses missing context', () => {
    expect(invitedFieldContext('/now-what/room')).toBeNull();
    expect(invitedFieldContext(null)).toBeNull();
    expect(invitedFieldContext('')).toBeNull();
    expect(invitedFieldContext(undefined)).toBeNull();
  });

  it('refuses malformed input rather than throwing', () => {
    for (const bad of ['%%%', 'http://', '://nope', '/now-what/room?fieldContext=']) {
      expect(() => invitedFieldContext(bad)).not.toThrow();
      expect(invitedFieldContext(bad)).toBeNull();
    }
  });

  it('refuses an unauthorized context even on a valid path', () => {
    expect(invitedFieldContext('/now-what/room?fieldContext=not-a-real-field')).toBeNull();
  });

  it('refuses an authorized context outside the environment', () => {
    expect(invitedFieldContext('/maia?fieldContext=now-what-demo')).toBeNull();
  });

  it('admits the returning-room path the threshold builds', () => {
    // NowWhatThreshold sets next = pathname + search, so a bounced member
    // carries their fieldContext back to the door. This must keep working.
    expect(isInvited('/now-what/field?fieldContext=flourishing')).toBe(true);
    expect(isInvited('/now-what/room?fieldContext=now-what-demo&program=x')).toBe(true);
  });

  it('uninvited copy leaks no allowlist member', () => {
    const copy = `${UNINVITED_COPY.heading} ${UNINVITED_COPY.body}`;
    for (const ctx of AUTHORIZED_FIELD_CONTEXTS) {
      expect(copy).not.toContain(ctx);
    }
  });

  it('uninvited copy does not assert an invitation', () => {
    const copy = `${UNINVITED_COPY.heading} ${UNINVITED_COPY.body}`;
    expect(copy).not.toMatch(/you were invited/i);
  });
});

/**
 * ACCEPTANCE CASE (Kelly ruling 2026-07-29, F1 — Option A).
 *
 *   1. Existing member bookmarks /now-what/map
 *   2. Signs out
 *   3. Returns to the bookmark
 *   4. Middleware redirects to /now-what/arrive?next=/now-what/map
 *   5. No fieldContext is present
 *   6. Member can sign in
 *   7. Member returns to /now-what/map
 */
describe('acceptance — an existing member is never locked out', () => {
  const BOOKMARK = '/now-what/map';

  it('step 5: the arrival carries no eligible field context', () => {
    expect(invitedFieldContext(BOOKMARK)).toBeNull();
  });

  it('step 6: sign-in is still offered — SignInForm is outside the eligible branch', () => {
    const signInOnly = functionBody(page, 'ArrivalSignInOnly');
    expect(signInOnly).toContain('<SignInForm');
    // ...and account creation is not.
    expect(signInOnly).not.toContain('<CreateForm');
  });

  it('step 7: the original destination survives authentication', () => {
    // The ineligible branch is handed `destination`, which is requestedNext
    // when present — so sign-in returns the member to their bookmark.
    const inner = functionBody(page, 'ArriveInner');
    expect(inner).toMatch(/const destination = requestedNext \?\? SIGNED_IN_LANDING/);
    expect(inner).toMatch(/<ArrivalSignInOnly next=\{destination\}/);
    // SignInForm redirects to exactly what it was given.
    expect(functionBody(page, 'SignInForm')).toMatch(/window\.location\.href = next/);
  });

  it('the post-auth landing is never an eligibility input', () => {
    const inner = functionBody(page, 'ArriveInner');
    const eligibilityAt = inner.indexOf('invitedFieldContext(requestedNext)');
    const destinationAt = inner.indexOf('const destination');
    expect(eligibilityAt).toBeGreaterThan(-1);
    // Eligibility is decided before any fallback destination exists.
    expect(eligibilityAt).toBeLessThan(destinationAt);
  });
});

describe('account creation gated; sign-in never gated (structural)', () => {
  it('account-creating fields live solely inside CreateForm', () => {
    const create = functionBody(page, 'CreateForm');
    for (const marker of ['autoComplete="new-password"', 'placeholder="Your name"', 'placeholder="Email"']) {
      expect(create).toContain(marker);
      expect(countOf(page, marker)).toBe(countOf(create, marker));
    }
  });

  it('the uninvited state mounts SignInForm and NOT CreateForm', () => {
    const signInOnly = functionBody(page, 'ArrivalSignInOnly');
    expect(signInOnly).toContain('<SignInForm');
    expect(signInOnly).not.toContain('<CreateForm');
    // A mount decision, not a CSS or disabled-prop one.
    expect(signInOnly).not.toMatch(/hidden|display:\s*none|visibility:\s*hidden/);
  });

  it('the resolving state mounts neither form', () => {
    const resolving = functionBody(page, 'ArrivalResolving');
    expect(resolving).not.toContain('<SignInForm');
    expect(resolving).not.toContain('<CreateForm');
  });

  it('only the eligible state mounts CreateForm', () => {
    const eligible = functionBody(page, 'ArrivalEligible');
    expect(eligible).toContain('<CreateForm');
    expect(eligible).toContain('<SignInForm');
    // CreateForm appears in exactly one branch of the page.
    expect(countOf(page, '<CreateForm')).toBe(1);
  });

  it('only ArrivalEligible asserts the invitation', () => {
    expect(functionBody(page, 'ArrivalEligible')).toContain('You were invited here.');
    expect(functionBody(page, 'ArrivalSignInOnly')).not.toContain('You were invited here.');
    expect(functionBody(page, 'ArrivalResolving')).not.toContain('You were invited here.');
  });

  it('eligibility is decided before any branch returns', () => {
    const inner = functionBody(page, 'ArriveInner');
    const decidedAt = inner.indexOf('invitedFieldContext');
    const firstReturn = inner.indexOf('return <');
    expect(decidedAt).toBeGreaterThan(-1);
    expect(firstReturn).toBeGreaterThan(-1);
    expect(decidedAt).toBeLessThan(firstReturn);
  });

  it('no fabricated default feeds the eligibility check', () => {
    const code = page.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).not.toContain("|| '/now-what/room'");
    // The post-auth landing is a separate, named constant.
    expect(code).toContain('SIGNED_IN_LANDING');
  });
});

describe('single resolver — page and route cannot drift', () => {
  it('both import the shared rule', () => {
    expect(page).toContain("from '@/lib/nowWhat/invitation'");
    expect(route).toContain("from '@/lib/nowWhat/invitation'");
  });

  it('neither redeclares the allowlist', () => {
    expect(page).not.toMatch(/const AUTHORIZED_FIELD_CONTEXTS\s*[:=]/);
    expect(route).not.toMatch(/const AUTHORIZED_FIELD_CONTEXTS\s*[:=]/);
  });

  it('the route remains the authority — a bypassed client gate changes nothing', () => {
    expect(route).toContain('invitedFieldContext(next)');
    expect(route).toMatch(/status:\s*403/);
  });

  it('the route refuses before any account write', () => {
    const body = route.slice(route.indexOf('export async function POST'));
    const gateAt = body.indexOf('invitedFieldContext(next)');
    const insertAt = body.search(/INSERT INTO members/i);
    expect(gateAt).toBeGreaterThan(-1);
    expect(insertAt).toBeGreaterThan(-1);
    expect(insertAt).toBeGreaterThan(gateAt);
  });
});

describe('control (pre-fix source at 4b3448c6f)', () => {
  const preFix = (p: string) =>
    execFileSync('git', ['show', `4b3448c6f:${p}`], { encoding: 'utf8', maxBuffer: 20e6 });

  it('pre-fix page fabricated a default next with no field context', () => {
    expect(preFix('app/now-what/arrive/page.tsx')).toContain("params?.get('next') || '/now-what/room'");
  });

  it('pre-fix page rendered credentials unconditionally and asserted the invitation', () => {
    const src = preFix('app/now-what/arrive/page.tsx');
    expect(src).toContain('type="password"');
    expect(src).toContain('You were invited here.');
    expect(src).not.toContain('invitedFieldContext');
  });

  it('pre-fix route declared its own copy of the allowlist', () => {
    expect(preFix('app/api/now-what/register/route.ts')).toMatch(/const AUTHORIZED_FIELD_CONTEXTS/);
  });
});
