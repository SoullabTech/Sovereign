/**
 * WS-DEVELOP-P0 — observations never seize attention (founder rulings 2026-11-10).
 * The component tests evaluate the real `ReadingField`; the rest pin structural rulings in source. The decisive proof of the
 * experience is the integrated walk, not this file.
 */
import * as ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
const view = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
const controller = read('app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx');

function findNode(source: string, predicate: (n: ts.Node) => boolean) {
  const file = ts.createSourceFile('review.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found: ts.Node[] = [];
  const visit = (n: ts.Node) => { if (predicate(n)) found.push(n); ts.forEachChild(n, visit); };
  visit(file); expect(found).toHaveLength(1); return { file, node: found[0]! };
}
function evaluate(expression: string, bindings: Record<string, unknown>): any {
  const out = ts.transpileModule('const actual = ' + expression + ';', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const req = (n: string) => { if (n !== 'react/jsx-runtime') throw Error('Unexpected import ' + n); return require(n); };
  return Function('require', 'exports', ...Object.keys(bindings), out + ';return actual;')(req, {}, ...Object.values(bindings));
}
const elements = (v: any): any[] => Array.isArray(v) ? v.flatMap(elements)
  : v && typeof v === 'object' ? [...(v.props ? [v] : []), ...elements(v.props?.children)] : [];

const readingField = (() => {
  const { file, node } = findNode(view, (n) => ts.isFunctionDeclaration(n) && n.name?.text === 'ReadingField');
  return evaluate(node.getText(file), { LABEL: { overview: 'Overview' }, friendlyObservation: () => ({ title: 'Fiction title', lead: 'Fixture' }) });
})();
const OBS = ['o1', 'o2', 'o3'].map((key, i) => ({ key, observation: `Fictional observation number ${i + 1}.`, phenomenonLabel: 'Fixture', evidence: [], limits: [] }));
const render = (selectedObservationKey: string | null) => {
  const calls = { select: jest.fn(), talk: jest.fn() };
  const tree = readingField({
    reading: { id: 'r1', outcome: 'observations', coverage: { sentence: 'Fixture' }, frozenAt: '2026-10-01', stateLabel: 'Saved', observations: OBS },
    field: 'overview', selectedObservationKey, targets: {}, workTargets: {},
    onSelectObservation: calls.select, onTalkObservation: calls.talk, onTeachObservation: jest.fn(), onDeepObservation: jest.fn(),
    onGoToObservation: jest.fn(), onWorkWithObservation: jest.fn(),
  });
  return { els: elements(tree), calls };
};
const text = (el: any) => [el.props.children].flat(5).filter((c) => typeof c === 'string').join('');

describe('P0 · a reading never chooses an observation for the writer', () => {
  it('with nothing selected, shows an INDEX and opens nothing', () => {
    const { els, calls } = render(null);
    expect(els.some((e) => 'data-develop-observation-index' in e.props)).toBe(true);
    expect(els.filter((e) => 'data-develop-observation-open' in e.props).map((e) => e.props['data-develop-observation-open'])).toEqual(['o1', 'o2', 'o3']);
    expect(els.some((e) => 'data-develop-observation' in e.props)).toBe(false);          // no observation card
    expect(calls.select).not.toHaveBeenCalled();
  });
  it('an unknown or stale selection falls back to the index, never to observation 1', () => {
    const { els } = render('does-not-exist');
    expect(els.some((e) => 'data-develop-observation-index' in e.props)).toBe(true);
    expect(els.some((e) => 'data-develop-observation' in e.props)).toBe(false);
  });
  it('an index entry opens exactly that observation, and only by the writer\'s click', () => {
    const { els, calls } = render(null);
    els.find((e) => e.props['data-develop-observation-open'] === 'o2').props.onClick();
    expect(calls.select).toHaveBeenCalledTimes(1);
    expect(calls.select).toHaveBeenCalledWith('o2');
  });
  it('an open observation offers a way back to the index', () => {
    const { els, calls } = render('o2');
    expect(els.some((e) => e.props['data-develop-observation'] === 'o2')).toBe(true);
    els.find((e) => 'data-develop-observation-index-open' in e.props).props.onClick();
    expect(calls.select).toHaveBeenCalledWith(null);
  });
  it('the view never initialises or resets the selection to observation 1', () => {
    expect(view).toContain('useState<string | null>(null);');
    expect(view).not.toMatch(/setSelectedObservationKey\([^)]*observations\[0\]/);
    expect(view).not.toMatch(/useState<string \| null>\(\s*props\.reading\?\.observations\[0\]/);
  });
});

describe('P0 · a reading the writer asked for shows a ready state and WAITS', () => {
  it('completion records a ready reading and does not navigate to it', () => {
    expect(controller).toContain('setReadyReadingId(result.readingId)');
    expect(controller).not.toMatch(/query\.set\('r', result\.readingId\)/);
  });
  it('the offer opens nothing itself; its one action is the writer\'s explicit "Explore observations"', () => {
    const { file, node } = findNode(view, (n) => ts.isFunctionDeclaration(n) && n.name?.text === 'ReadingOffer');
    const body = node.getText(file);
    expect(body).toContain('Explore observations');
    expect(body).toContain('Nothing is opened until you choose.');
    expect(body).toContain('onClick={onExplore}');
    expect((body.match(/onClick=/g) ?? []).length).toBe(1);
  });
  it('is announced politely and never takes focus', () => {
    const { file, node } = findNode(view, (n) => ts.isFunctionDeclaration(n) && n.name?.text === 'ReadingStatusRegion');
    const body = node.getText(file);
    expect(body).toContain('aria-live="polite"');
    expect(body).not.toMatch(/\.focus\(|autoFocus|tabIndex/);
  });
  it('there is no bulk dismissal of observations anywhere', () => {
    expect(view).not.toMatch(/rest (all|every)|dismiss all|let all rest|clear all observations/i);
  });
});

describe('P0 · "More ways to explore" is visit-scoped, and the View control is the only place the saved View changes', () => {
  it('both call sites expand for this visit', () => {
    expect(view).toContain("onMoreWays={() => exploreForVisit('full')}");
    expect(view).toContain("exploreForVisit(developView === 'focused' ? 'guided' : 'full')");
    expect(view).not.toMatch(/onMoreWays=\{\(\) => chooseDevelopView/);
  });
  it('the visit-scoped path writes only a temporary per-Work choice', () => {
    const { file, node } = findNode(view, (n) => ts.isVariableDeclaration(n) && n.name.getText(file2(n)) === 'exploreForVisit');
    const body = node.getText(file2(node));
    expect(body).toContain('temporary: true');
    expect(body).not.toMatch(/writeStudioPresentation\(\{ depth: next \}\);/);
    function file2(n: ts.Node) { return n.getSourceFile(); }
    void file;
  });
  it('an explicit View choice persists and ends any visit-only expansion', () => {
    expect(view).toMatch(/const chooseDevelopView = \(next: StudioDepth\) => \{\s*if \(densityWorkId\) clearWorkPresentationOverride\(densityWorkId\);/);
  });
});

describe('P0 · the chapter stays on screen across lens navigation', () => {
  it('every non-stage page carries a read-only chapter pane the writer can fold', () => {
    expect(view).toContain('const lensChapterPane = !useStage && lensSection ?');
    expect(view).toContain('work={stageCenter ?? (lensChapterPane ?');
    const { file, node } = findNode(view, (n) => ts.isFunctionDeclaration(n) && n.name?.text === 'LensChapterPane');
    const body = node.getText(file);
    expect(body).toContain('<details open');
    expect(body).not.toMatch(/<textarea|contentEditable|onChange/);                     // read-only
  });
});
