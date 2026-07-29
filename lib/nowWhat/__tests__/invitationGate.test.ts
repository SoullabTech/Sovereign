/**
 * Invitation gate — ordering invariant for the Now What? front door.
 *
 * INVARIANT: no credential field appears until the arriving context has been
 * resolved and found eligible.
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
import { invitedFieldContext, isInvited, AUTHORIZED_FIELD_CONTEXTS, REFUSAL_COPY } from '../invitation';

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

const CREDENTIAL_MARKERS = [
  'type="password"',
  'autoComplete="new-password"',
  'autoComplete="current-password"',
];

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

  it('refusal copy leaks no allowlist member', () => {
    const copy = `${REFUSAL_COPY.heading} ${REFUSAL_COPY.body}`;
    for (const ctx of AUTHORIZED_FIELD_CONTEXTS) {
      expect(copy).not.toContain(ctx);
    }
  });
});

describe('credential component mounted only in the eligible branch (structural)', () => {
  it('credential markup lives solely inside ArrivalCredentials', () => {
    const credentials = functionBody(page, 'ArrivalCredentials');
    for (const marker of CREDENTIAL_MARKERS) {
      expect(credentials).toContain(marker);
      expect(countOf(page, marker)).toBe(countOf(credentials, marker));
    }
  });

  it('the refused state mounts no credential component and no form', () => {
    const refused = functionBody(page, 'ArrivalRefused');
    expect(refused).not.toContain('ArrivalCredentials');
    expect(refused).not.toContain('<form');
    for (const marker of CREDENTIAL_MARKERS) expect(refused).not.toContain(marker);
  });

  it('the resolving state mounts no credential component', () => {
    const resolving = functionBody(page, 'ArrivalResolving');
    expect(resolving).not.toContain('ArrivalCredentials');
    for (const marker of CREDENTIAL_MARKERS) expect(resolving).not.toContain(marker);
  });

  it('only the eligible state mounts it — a mount, not a hidden render', () => {
    const eligible = functionBody(page, 'ArrivalEligible');
    expect(eligible).toContain('<ArrivalCredentials');
    // The regression this lane exists to prevent: gating by CSS or a disabled
    // prop instead of by mounting.
    expect(eligible).not.toMatch(/hidden|display:\s*none|visibility:\s*hidden/);
  });

  it('only ArrivalEligible asserts the invitation', () => {
    expect(functionBody(page, 'ArrivalEligible')).toContain('You were invited here.');
    expect(functionBody(page, 'ArrivalRefused')).not.toContain('You were invited here.');
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

  it('no fabricated default destination', () => {
    // Comments are stripped: the file's own history note quotes the old
    // expression, and prose must not fail an assertion about executable code.
    const code = page.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).not.toContain("|| '/now-what/room'");
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
