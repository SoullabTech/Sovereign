/**
 * Every client of the original-file ingest route must carry the member's Sanctuary posture.
 *
 * The route (D6) refuses an upload that arrives without a well-formed `x-maia-sanctuary` claim (428) and refuses
 * Sanctuary outright (423). A caller that never learned about that rule does not fail loudly where it was written:
 * it fails for every member the moment the route is released. This guard reads the repository so a caller that is
 * added later, or one that was missed, is named here instead of being found by a member.
 *
 * Source-reading, comments stripped first: a sentence that documents the rule must not count as obeying it.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = join(__dirname, '..', '..', '..', '..');
const INGEST_PATH = /['"`]\/api\/sovereign\/manuscripts\/ingest['"`]/;
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'coverage', '__tests__']);

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');
}

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.(test|spec)\./.test(name)) out.push(full);
  }
}

function callers(): { rel: string; code: string }[] {
  const files: string[] = [];
  for (const top of ['app', 'components', 'lib']) {
    try {
      walk(join(ROOT, top), files);
    } catch {
      /* a missing top-level directory is not a caller */
    }
  }
  const found: { rel: string; code: string }[] = [];
  for (const file of files) {
    const rel = relative(ROOT, file).split(sep).join('/');
    // The route itself names its own path in documentation and error text; it is the server, not a client.
    if (rel.startsWith('app/api/sovereign/manuscripts/ingest/')) continue;
    const code = stripComments(readFileSync(file, 'utf8'));
    if (INGEST_PATH.test(code)) found.push({ rel, code });
  }
  return found.sort((a, b) => a.rel.localeCompare(b.rel));
}

describe('ingest route clients carry the Sanctuary posture', () => {
  const all = callers();

  it('finds the two known clients (so a rename cannot make this guard vacuous)', () => {
    const names = all.map((c) => c.rel);
    expect(names).toContain('app/press/manuscript/page.tsx');
    expect(names).toContain('app/dev/writers-studio-pc3-live/P4R1ImportManuscript.tsx');
  });

  it('every client reads the live posture and sends it as the x-maia-sanctuary claim', () => {
    for (const { rel, code } of all) {
      expect({ rel, readsPosture: /readCurrentSanctuaryPosture\s*\(/.test(code) }).toEqual({ rel, readsPosture: true });
      expect({ rel, sendsClaim: /['"]x-maia-sanctuary['"]/.test(code) }).toEqual({ rel, sendsClaim: true });
    }
  });

  it('no client tells the member to use a control that is not on its screen when the posture is unresolved', () => {
    for (const { rel, code } of all) {
      expect({ rel, mentionsQuickSettings: /Quick Settings/.test(code) }).toEqual({ rel, mentionsQuickSettings: false });
    }
  });

  it('the press page reads the posture, and refuses on unresolved or Sanctuary, before it sends anything', () => {
    const page = all.find((c) => c.rel === 'app/press/manuscript/page.tsx');
    expect(page).toBeDefined();
    const code = page!.code;
    const read = code.indexOf('readCurrentSanctuaryPosture()');
    const unresolved = code.indexOf('!posture.resolved');
    const sanctuary = code.indexOf('posture.sanctuary');
    const send = code.search(INGEST_PATH);
    expect(read).toBeGreaterThan(-1);
    expect(unresolved).toBeGreaterThan(read);
    expect(sanctuary).toBeGreaterThan(unresolved);
    expect(send).toBeGreaterThan(sanctuary);
  });

  it('the press page sends the claim only after Sanctuary has been ruled out, and never as a bare constant elsewhere', () => {
    const page = all.find((c) => c.rel === 'app/press/manuscript/page.tsx')!;
    const claims = page.code.match(/['"]x-maia-sanctuary['"]\s*:\s*[^,}]+/g) ?? [];
    // One send site. Its value is 'false' because the code above has already returned for Sanctuary and for an
    // unresolved posture; a literal 'true' would be a Sanctuary upload, which the server refuses.
    expect(claims).toHaveLength(1);
    expect(claims[0]!.trim()).toMatch(/:\s*'false'$/);
  });
});
