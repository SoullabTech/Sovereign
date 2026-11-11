/**
 * EA acceptance walk (2026-11-11): with NEXT_PUBLIC_WS_DEVELOP_STAGE=1, "More ways to explore" on the Develop stage changed only the depth
 * preference, which the stage never consulted — the writer stayed on the stage and the Develop map (lens tabs, "Start an editorial pass")
 * was unreachable in production. These tests evaluate the REAL `useStage` expression lifted from the component source.
 */
import * as ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const SRC = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'), 'utf8');

function initializerOf(name: string): string {
  const file = ts.createSourceFile('v.tsx', SRC, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found: string[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === name && n.initializer) found.push(n.initializer.getText(file));
    ts.forEachChild(n, visit);
  };
  visit(file);
  expect(found).toHaveLength(1);
  return found[0]!;
}

const USE_STAGE = initializerOf('useStage');
const evaluate = (b: Record<string, unknown>) =>
  Function(...Object.keys(b), `return (${USE_STAGE});`)(...Object.values(b));

const base = {
  process: { env: { NEXT_PUBLIC_WS_DEVELOP_STAGE: '1' } },
  props: { field: 'overview', work: { id: 'w' }, preparing: false, sections: [{}] },
  selectedObservation: null, needsWork: false, leftStage: false,
};

describe('Develop stage: "More ways to explore" leads somewhere', () => {
  it('opens on the stage by default (the work stays central)', () => {
    expect(evaluate(base)).toBe(true);
  });

  it('⭐ once the writer chooses "More ways to explore", the stage gives way to the Develop map', () => {
    expect(evaluate({ ...base, leftStage: true })).toBe(false);
  });

  it('a writer whose depth preference is already "Full" still opens on the stage (leaving is never inferred from the preference)', () => {
    expect(USE_STAGE).not.toMatch(/developView/);
    expect(evaluate({ ...base, developView: 'full' })).toBe(true);
  });

  it('the stage\'s More control sets the leave flag, and the map offers a way back to the reading', () => {
    expect(SRC).toMatch(/onMoreWays=\{\(\) => \{ setLeftStage\(true\); chooseDevelopView\('full'\); \}\}/);
    expect(SRC).toMatch(/data-develop-back-to-stage="true" onClick=\{\(\) => setLeftStage\(false\)\}/);
  });

  it('with the stage flag off, nothing changes (the stage never shows)', () => {
    expect(evaluate({ ...base, process: { env: {} } })).toBe(false);
  });
});
