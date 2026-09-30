/**
 * HOUSE-STUDIO-CONTINUITY-01 — falsifiers for the House → Studio seam.
 *
 * Each block names the weaker candidate it exists to kill:
 *
 *   HSC-F1  guess a manuscript when several are declared (first / latest)
 *   HSC-F2  trust the carried id without checking it is the member's Work
 *   HSC-F3  open something before the member's Works have been read
 *   HSC-F4  carry content (title, excerpt, intention) through the URL
 *   HSC-F5  the House keeps linking to a bare /writers-studio (the defect)
 *   HSC-F6  the House or the Studio stores a record of the crossing
 *   HSC-F7  the entered-through Work keeps riding along after the member
 *           moves to other writing (context outliving its validation)
 */

import fs from 'node:fs';
import path from 'node:path';

import { HOUSE_WORK_PARAM, houseArrivalTarget, houseWorkHref, resolveHouseArrival } from '../houseArrival';
import type { LivingWork, WorkExpression } from '../useLivingWorks';

const expr = (expressionId: string, expressionType = 'manuscript', declaredAt = '2026-09-01T00:00:00Z'): WorkExpression =>
  ({ expressionType, expressionId, declaredAt });

const work = (id: string, expressions: WorkExpression[] = []): LivingWork => ({
  id,
  title: 'Elemental Alchemy',
  purpose: null,
  form: null,
  stage: null,
  manuscriptState: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
  expressions,
  materials: [],
});

describe('resolveHouseArrival', () => {
  it('does nothing when nothing was carried', () => {
    expect(resolveHouseArrival(null, 'ready', [work('w1', [expr('m1')])])).toEqual({ kind: 'none' });
    expect(resolveHouseArrival('   ', 'ready', [work('w1', [expr('m1')])])).toEqual({ kind: 'none' });
  });

  it('opens the single declared manuscript of the Work the member chose', () => {
    const works = [work('w1', [expr('m1')]), work('w2', [expr('m2')])];
    expect(resolveHouseArrival('w2', 'ready', works)).toEqual({ kind: 'open', workId: 'w2', manuscriptId: 'm2' });
  });

  it('HSC-F1 — never picks a manuscript when several are declared', () => {
    const w = work('w1', [
      expr('m-old', 'manuscript', '2026-01-01T00:00:00Z'),
      expr('m-new', 'manuscript', '2026-09-01T00:00:00Z'),
    ]);
    expect(resolveHouseArrival('w1', 'ready', [w])).toEqual({ kind: 'orient', workId: 'w1', manuscriptCount: 2 });
  });

  it('HSC-F1 — a Work with no manuscript orients rather than inventing one', () => {
    const w = work('w1', [expr('idea-1', 'idea')]);
    expect(resolveHouseArrival('w1', 'ready', [w])).toEqual({ kind: 'orient', workId: 'w1', manuscriptCount: 0 });
  });

  it('counts a manuscript declared twice as one manuscript', () => {
    const w = work('w1', [expr('m1'), expr('m1')]);
    expect(resolveHouseArrival('w1', 'ready', [w])).toEqual({ kind: 'open', workId: 'w1', manuscriptId: 'm1' });
  });

  it("HSC-F2 — an id that is not one of the member's Works opens nothing", () => {
    const works = [work('mine', [expr('m1')])];
    expect(resolveHouseArrival('someone-elses', 'ready', works)).toEqual({ kind: 'unknown' });
    expect(resolveHouseArrival('someone-elses', 'ready', [])).toEqual({ kind: 'unknown' });
  });

  it('HSC-F2 — unauthorized or failed reads open nothing', () => {
    const works = [work('w1', [expr('m1')])];
    expect(resolveHouseArrival('w1', 'unauthorized', works)).toEqual({ kind: 'unknown' });
    expect(resolveHouseArrival('w1', 'error', works)).toEqual({ kind: 'unknown' });
  });

  it('HSC-F3 — asserts nothing while the Works are still loading', () => {
    expect(resolveHouseArrival('w1', 'loading', [work('w1', [expr('m1')])])).toEqual({ kind: 'pending' });
  });
});

describe('houseWorkHref', () => {
  it('HSC-F4 — carries the Work identity and nothing else', () => {
    const href = houseWorkHref('w 1&x=y');
    const url = new URL(href, 'https://soullab.life');
    expect(url.pathname).toBe('/writers-studio');
    expect([...url.searchParams.keys()].sort()).toEqual(['from', HOUSE_WORK_PARAM].sort());
    expect(url.searchParams.get('from')).toBe('house');
    expect(url.searchParams.get(HOUSE_WORK_PARAM)).toBe('w 1&x=y');
  });
});

describe('HSC-F7 — context survives only while the relationship validates', () => {
  it('the landing drops the carried Work and names only the manuscript', () => {
    const target = new URLSearchParams(houseArrivalTarget('from=house&work=wA', 'mA1'));
    expect(target.get(HOUSE_WORK_PARAM)).toBeNull();
    expect(target.get('m')).toBe('mA1');
    expect(target.get('mode')).toBe('write');
    expect(target.get('from')).toBe('house');
    expect([...target.values()]).not.toContain('wA');
  });

  it('after the landing, nothing resolves Work A again', () => {
    const works = [work('wA', [expr('mA1')]), work('wB', [expr('mB1')])];
    const landed = new URLSearchParams(houseArrivalTarget('from=house&work=wA', 'mA1'));
    expect(resolveHouseArrival(landed.get(HOUSE_WORK_PARAM), 'ready', works)).toEqual({ kind: 'none' });
    // Moving on to other writing: the Studio's own navigation rewrites `m`; Work A is gone.
    landed.set('m', 'mB1');
    expect(resolveHouseArrival(landed.get(HOUSE_WORK_PARAM), 'ready', works)).toEqual({ kind: 'none' });
    expect([...landed.values()]).not.toContain('wA');
  });

  it('the Studio lands through houseArrivalTarget, not a hand-built URL', () => {
    const controller = fs.readFileSync(
      path.resolve(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1HomeController.tsx'), 'utf8');
    expect(controller).toContain('router.replace(pathname + \'?\' + houseArrivalTarget(');
  });
});

describe('the House door and the Studio intake (source)', () => {
  const read = (rel: string) => fs.readFileSync(path.resolve(process.cwd(), rel), 'utf8');
  const housePage = read('app/house/page.tsx');
  const controller = read('app/dev/writers-studio-pc3-live/P4R1HomeController.tsx');
  const seam = read('app/writers-studio/houseArrival.ts');

  it('HSC-F5 — every living Work row in the House carries its identity', () => {
    const alive = housePage.slice(housePage.indexOf("WHAT'S ALIVE"), housePage.indexOf('See the larger whole'));
    expect(alive).toContain('houseWorkHref(work.id)');
    expect(alive).not.toMatch(/href="\/writers-studio"/);
  });

  it('HSC-F6 — the seam and its consumers write nothing', () => {
    const code = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    for (const src of [seam, controller.slice(controller.indexOf('HOUSE → STUDIO'), controller.indexOf('houseArrival, params, pathname, router'))]) {
      expect(code(src)).not.toMatch(/localStorage|sessionStorage|document\.cookie|apiFetch|fetch\(|INSERT|query\(/);
    }
  });

  it('the Studio resolves the carried id through the seam, and Back returns to the House', () => {
    expect(controller).toContain('resolveHouseArrival(params?.get(HOUSE_WORK_PARAM), worksPhase, works)');
    expect(controller).toMatch(/router\.replace\(/);
  });
});
