/**
 * EA walk 2026-11-11 — the defects the founder met in production, each pinned so it cannot come back unnoticed.
 *   F6/F10  Develop (stage and lens pane) showed only a chapter's first section while MAIA read the whole chapter
 *   F4      Write → Develop dropped the writer's place (stale search-param snapshot)
 *   F7      Develop's rail hid headed sub-sections that have no confirmed level
 *   F8      "How does Chapter X lead into …" named the chapter's own first sub-section
 *   F11     the coverage route was never shipped (every request 404)
 *   F2      the top bar's menus opened UNDER the room's controls
 *   F9      "Open MAIA here once" was a dead end; the writer now chooses Ordinary / Sanctuary in place
 */
import fs from 'node:fs';
import path from 'node:path';
import { chapterSections, type StageSection } from '@/app/dev/writers-studio-pc3-live/DevelopStage';

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
const s = (id: string, position: number, heading: string | null, headingDepth: number | null = null): StageSection =>
  ({ draftSectionId: id, position, heading, body: `${heading ?? ''}\n\ntext of ${id}`, headingDepth });

/* the shape of a real import: Part / Chapter at level 1, the chapter's own section only a title + epigraph */
const BOOK = [
  s('pref', 0, 'Preface', 1),
  s('part1', 1, 'Part One', 1),
  s('ch1', 2, 'Chapter 1: Wholeness', 1),
  s('ritual', 3, 'My Morning Ritual', null),
  s('walkers', 4, 'The Four Walkers', null),
  s('ch2', 5, 'Chapter 2: Fire', 1),
  s('invite', 6, 'An Invitation', 2),
];
const RANGE1 = { fromSectionId: 'ch1', toSectionId: 'walkers' };

describe('F6 · the whole chapter is shown, exactly the span MAIA reads', () => {
  it('⭐ the chapter title section opens the whole span, in book order', () => {
    expect(chapterSections(BOOK, BOOK[2]!, RANGE1).map((x) => x.draftSectionId)).toEqual(['ch1', 'ritual', 'walkers']);
  });
  it('⭐ a sub-section chosen in the dropdown shows inside its whole chapter', () => {
    expect(chapterSections(BOOK, BOOK[4]!, RANGE1).map((x) => x.draftSectionId)).toEqual(['ch1', 'ritual', 'walkers']);
  });
  it('order is by position, not by the order sections arrive in', () => {
    const shuffled = [BOOK[4]!, BOOK[2]!, BOOK[6]!, BOOK[3]!];
    expect(chapterSections(shuffled, BOOK[2]!, RANGE1).map((x) => x.draftSectionId)).toEqual(['ch1', 'ritual', 'walkers']);
  });
  it('never guesses a span: no range, an unknown range, or a range not containing the section → that section alone', () => {
    expect(chapterSections(BOOK, BOOK[2]!, null).map((x) => x.draftSectionId)).toEqual(['ch1']);
    expect(chapterSections(BOOK, BOOK[2]!, { fromSectionId: 'nope', toSectionId: 'walkers' }).map((x) => x.draftSectionId)).toEqual(['ch1']);
    expect(chapterSections(BOOK, BOOK[0]!, RANGE1).map((x) => x.draftSectionId)).toEqual(['pref']);
    expect(chapterSections(BOOK, null, RANGE1)).toEqual([]);
  });
  it('⭐ the stage AND the lens pane are both handed the chapter span', () => {
    const view = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
    expect(view.match(/chapterRange=\{props\.chapterScope \?/g)?.length).toBe(2);
  });
});

describe('F4 · Write → Develop keeps the writer’s place', () => {
  it('⭐ the room switch builds from the LIVE address (Write records the place with history.replaceState)', () => {
    const src = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
    const onMode = src.slice(src.indexOf('const onMode = useCallback'), src.indexOf('const onStudioPlace'));
    expect(onMode).toMatch(/window\.location\.search/);
    expect(onMode).not.toMatch(/new URLSearchParams\(params\?\.toString\(\)/);
  });
});

describe('F7 · Develop’s rail lists headed sub-sections without a confirmed level', () => {
  it('lists them under their chapter, marked unconfirmed, never as a confirmed level', () => {
    const view = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
    const rail = view.slice(view.indexOf('function ManuscriptRail'), view.indexOf('function ManuscriptRail') + 2600);
    expect(rail).toMatch(/insideChapter\(section\)/);
    expect(rail).toMatch(/data-depth-unconfirmed/);
  });
});

describe('F8 · "lead into" names what comes after the chapter', () => {
  it('uses the section after the chapter span, and the chapter’s own label', () => {
    const view = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
    expect(view).toMatch(/props\.chapterScope!\.toSectionId\) \+ 1/);
    expect(view).toMatch(/startersFor\(workKind \?\? null, props\.chapterScope\?\.label \?\? stageLabel/);
  });
});

describe('F11 · the coverage route exists and stays read-only', () => {
  const route = read('app/api/sovereign/manuscripts/[id]/coverage/route.ts');
  it('serves loadCoverage, GET only, private', () => {
    expect(route).toMatch(/export async function GET/);
    expect(route).not.toMatch(/export async function (POST|PUT|PATCH|DELETE)/);
    expect(route).toMatch(/loadCoverage\(id, memberId\)/);
    expect(route).toMatch(/private, no-store/);
  });
});

describe('F2 · the top bar’s menus open above the room', () => {
  it('the bar sits above the room’s own controls (up to 46) and below dialogs (70+)', () => {
    const css = read('app/dev/writers-studio-full-redesign-review/full-redesign-review.css');
    const bar = css.slice(css.indexOf('.fr-bar {'), css.indexOf('}', css.indexOf('.fr-bar {')) + 1);
    const z = Number(bar.match(/z-index:\s*(\d+)/)?.[1]);
    expect(z).toBeGreaterThan(46);
    expect(z).toBeLessThan(70);
  });
  it('F1 · the top-bar layout menu is not also called "View"', () => {
    expect(read('app/writers-studio/full-redesign/Shell.tsx')).not.toMatch(/<summary>View<\/summary>/);
  });
});

describe('F9 · no dead end when the session posture is unknown', () => {
  it('⭐ Develop surfaces offer the writer’s own Ordinary / Sanctuary choice, never "Open MAIA here once"', () => {
    for (const f of ['app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx', 'app/writers-studio/canvas/ReadScopeControl.tsx', 'app/writers-studio/canvas/SettledDecisions.tsx']) {
      const src = read(f);
      expect(src).not.toMatch(/Open MAIA here once/);
      expect(src).toMatch(/SessionPostureChoice/);
    }
  });
  it('the choice is set only by the writer’s click, through the one shared setter, with no default', () => {
    const src = read('app/writers-studio/canvas/SessionPostureChoice.tsx');
    expect(src).toMatch(/applySessionSanctuary\(sanctuary\)/);
    expect(src.match(/applySessionSanctuary\(/g)?.length).toBe(1);
    expect(src).toMatch(/onClick=\{\(\) => choose\(false\)\}/);
    expect(src).toMatch(/onClick=\{\(\) => choose\(true\)\}/);
    expect(src).not.toMatch(/useEffect/);
  });
});
