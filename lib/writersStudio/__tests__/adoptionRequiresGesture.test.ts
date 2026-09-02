/**
 * WS2-06A · step 9 — the non-consent boundary, as a property of the program.
 *
 * THE CLAIM. Only an explicit member gesture can make a reviewed reading part of
 * the Work. None of these can:
 *
 *     arriving in Structure Review · leaving the room · continuing to edit
 *     silence · failure to reject a proposal · MAIA completing a reading
 *     a timer · a useEffect · a retry after conflict · the Ask runtime
 *
 * WHY STRUCTURAL RATHER THAN BEHAVIOURAL. A test that renders the room and
 * asserts "no request was sent" proves it for the paths that test happened to
 * walk. This walks the code instead: if the only call site is a click handler,
 * and no effect, timer or retry path can reach it, then the absent behaviours
 * are absent by construction rather than by the fixture's choice of route.
 *
 * Comments are stripped before every check. These files DISCUSS what they must
 * not do, and a grep counting prose would pass or fail for the wrong reason.
 *
 * Acceptance instrument: WS2-06A adversarial review §6. That review says how
 * this can be falsified; it is not the specification.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');
const SURFACE = join(ROOT, 'app', 'writers-studio', 'canvas', 'StructureReview.tsx');
const CLIENT = join(ROOT, 'lib', 'writersStudio', 'reviewClient.ts');
const ROUTE = join(ROOT, 'app', 'api', 'sovereign', 'manuscripts', '[id]',
  'structure', 'proposals', '[proposalId]', 'adopt', 'route.ts');
const COMMAND = join(ROOT, 'lib', 'manuscript', 'structure', 'authorStructure.ts');

const strip = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const read = (p: string) => strip(readFileSync(p, 'utf8'));

/** The body of a `useEffect(...)` call, however many there are. */
function effectBodies(code: string): string[] {
  const out: string[] = [];
  const re = /useEffect\s*\(/g;
  for (const m of code.matchAll(re)) {
    let i = m.index! + m[0].length - 1, depth = 0;
    do {
      if (code[i] === '(') depth += 1;
      else if (code[i] === ')') depth -= 1;
      i += 1;
    } while (depth > 0 && i < code.length);
    out.push(code.slice(m.index!, i));
  }
  return out;
}

describe('adoption requires an explicit member gesture', () => {
  const surface = read(SURFACE);
  const client = read(CLIENT);
  const route = read(ROUTE);
  const command = read(COMMAND);

  /* ── the surface ───────────────────────────────────────────────────────── */

  it('the crossing is reached from exactly one place in the surface', () => {
    const calls = [...surface.matchAll(/\bauthorStructure\s*\(/g)];
    expect(calls).toHaveLength(1);
  });

  it('no effect can reach the crossing — arrival, leaving and reload cannot adopt', () => {
    for (const body of effectBodies(surface)) {
      expect(body).not.toContain('authorStructure');
      expect(body).not.toContain('cross(');
    }
  });

  it('no timer can reach it — silence is not consent', () => {
    for (const t of ['setTimeout', 'setInterval', 'requestIdleCallback', 'queueMicrotask']) {
      expect(`${t} in StructureReview: ${surface.includes(t)}`).toBe(`${t} in StructureReview: false`);
    }
  });

  it('no unload, visibility or navigation handler can reach it — leaving cannot adopt', () => {
    for (const h of ['beforeunload', 'unload', 'visibilitychange', 'pagehide', 'popstate']) {
      expect(`${h}: ${surface.includes(h)}`).toBe(`${h}: false`);
    }
  });

  it('the crossing handler is invoked by onClick and by nothing else', () => {
    /* The one call site sits inside `cross`, and `cross` is passed to the
       component as onCross, which the button binds to onClick. */
    expect(surface).toMatch(/onCross=\{\(\)\s*=>\s*void cross\(\)\}/);
    expect(surface).toMatch(/onClick=\{onCross\}/);
    const bound = [...surface.matchAll(/\bcross\(\)/g)];
    expect(bound).toHaveLength(1);
  });

  it('does not retry after a conflict — a refusal ends the gesture', () => {
    const start = surface.indexOf('const cross = useCallback');
    const end = surface.indexOf('const ordered = useMemo', start);
    const body = surface.slice(start, end);
    expect(start).toBeGreaterThan(0);
    /* A refusal sets a notice and returns. No second call, no backoff. */
    expect([...body.matchAll(/authorStructure\s*\(/g)]).toHaveLength(1);
    expect(body).not.toContain('retry');
    expect(body).toContain('if (!r.ok)');
  });

  it('one gesture cannot become two requests', () => {
    const start = surface.indexOf('const cross = useCallback');
    const body = surface.slice(start, surface.indexOf('const ordered = useMemo', start));
    /* Returns rather than queueing while a request is in flight or the act is
       already done. */
    expect(body).toMatch(/if \(!view \|\| busy \|\| authored\) return;/);
  });

  it('completing a reading does not adopt — nothing in the read path names the crossing', () => {
    for (const body of effectBodies(surface)) {
      expect(body).not.toContain('adopt');
    }
  });

  /* ── the client ────────────────────────────────────────────────────────── */

  it('the client issues exactly one POST for the crossing, and no other verb', () => {
    const start = client.indexOf('export async function authorStructure');
    expect(start).toBeGreaterThan(0);
    const body = client.slice(start, client.indexOf('export function reviewRefusalCopy'));
    expect([...body.matchAll(/apiFetch\s*\(/g)]).toHaveLength(1);
    expect([...body.matchAll(/method:\s*'POST'/g)]).toHaveLength(1);
    expect(body).not.toContain('retry');
    expect(body).not.toContain('setTimeout');
  });

  it('the client sends the revision and nothing structural', () => {
    const start = client.indexOf('export async function authorStructure');
    const body = client.slice(start, client.indexOf('export function reviewRefusalCopy'));
    expect(body).toMatch(/JSON\.stringify\(\{\s*expectedReviewRevision\s*\}\)/);
    for (const forbidden of ['units', 'reviewed', 'sectionId', 'fromSection', 'toSection', 'title', 'kind']) {
      expect(`body sends ${forbidden}: ${body.includes(forbidden)}`)
        .toBe(`body sends ${forbidden}: false`);
    }
  });

  /* ── the route ─────────────────────────────────────────────────────────── */

  it('the route exposes POST only', () => {
    for (const verb of ['GET', 'PUT', 'PATCH', 'DELETE', 'HEAD']) {
      expect(`export ${verb}: ${new RegExp(`export async function ${verb}\\b`).test(route)}`)
        .toBe(`export ${verb}: false`);
    }
    expect(route).toMatch(/export async function POST\b/);
  });

  it('the route reads nothing structural from the request body', () => {
    const parsed = [...route.matchAll(/body\?\.(\w+)/g)].map((m) => m[1]);
    expect(parsed).toEqual(['expectedReviewRevision']);
  });

  it('the route requires an authenticated member before anything else', () => {
    const auth = route.indexOf('getMemberIdFromRequest');
    const call = route.indexOf('authorStructureFromProposal(');
    expect(auth).toBeGreaterThan(0);
    expect(auth).toBeLessThan(call);
    expect(route).toContain("{ error: 'unauthenticated' }");
  });

  /* ── the command ───────────────────────────────────────────────────────── */

  it('the command takes its tree from storage, never from a caller', () => {
    /* The only structure input is the proposal id and the expected revision. */
    expect(command).toMatch(
      /authorStructureFromProposal\(\s*manuscriptId: string,\s*memberId: string,\s*proposalId: string,\s*expectedReviewRevision: number,/);
    expect(command).toContain('FROM manuscript_structure_proposals');
  });

  it('the command scopes the act to the owner', () => {
    expect(command).toMatch(/FROM member_manuscripts WHERE id = \$1 AND member_id = \$2 FOR UPDATE/);
  });

  it('nothing outside the route reaches the command', () => {
    /* Proven for the Ask runtime by askRuntimeCannotWrite; asserted here for the
       Writer's Studio client layer, which must go through HTTP like any other. */
    expect(client).not.toContain('authorStructureFromProposal');
    expect(read(SURFACE)).not.toContain('authorStructureFromProposal');
  });
});
