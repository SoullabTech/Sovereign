import fs from 'node:fs';
import path from 'node:path';
import { matchRule } from '../accessMatrix';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe("Writer's Studio authenticated corridor", () => {
  it.each([
    '/writers-studio/rebuild',
    '/writers-studio/develop',
    '/writers-studio/review',
    '/writers-studio/canvas',
    '/writers-studio/sources',
  ])('%s is explicitly inside the authenticated member corridor', (pathname) => {
    const rule = matchRule(pathname);
    expect(rule).not.toBeNull();
    expect(rule?.prefix).toBe('/writers-studio/');
    expect(rule?.minTier).toBe('free');
    expect(rule?.public).not.toBe(true);
  });

  it('the canonical root keeps its exact member-facing rule', () => {
    const rule = matchRule('/writers-studio');
    expect(rule?.exact).toBe('/writers-studio');
    expect(rule?.minTier).toBe('free');
  });

  it('the lab inherits the authenticated outer corridor but retains its stricter founder gate', () => {
    const rule = matchRule('/writers-studio/lab/maia');
    expect(rule?.prefix).toBe('/writers-studio/');
    expect(rule?.minTier).toBe('free');

    const layout = read('app/writers-studio/lab/maia/layout.tsx');
    const page = read('app/writers-studio/lab/maia/page.tsx');
    expect(layout).toContain('requireHarnessAccess');
    expect(layout).toContain('notFound()');
    expect(page).toContain('requireHarnessAccess');
    expect(page).toContain('notFound()');
  });
});
