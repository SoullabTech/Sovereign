/** @jest-environment node */
/** Offline source/timeout tests: never import the serving route or its dependencies. */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
import * as ts from 'typescript';

const FILE = 'app/api/sovereign/app/maia/list/route.ts';
const BASE = '23ac0bdcebd74a8f1f0f60ed66eeda2ffef6440e';
const source = readFileSync(FILE, 'utf8');
const parent = execFileSync('git', ['show', BASE + ':' + FILE], { encoding: 'utf8' });
const parsed = ts.createSourceFile(FILE, source, ts.ScriptTarget.Latest, true);
function declaration(name: string): ts.VariableDeclaration {
  const found: ts.VariableDeclaration[] = [];
  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) found.push(node);
    ts.forEachChild(node, visit);
  }
  visit(parsed);
  if (found.length !== 1) throw new Error('Expected one declaration: ' + name);
  return found[0];
}
function emit(text: string, kind: ts.ModuleKind): string {
  return ts.transpileModule(text, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: kind, removeComments: true,
    sourceMap: false, esModuleInterop: true,
  }, fileName: FILE }).outputText;
}
function namedFunction(text: string, name: string): string {
  const ast = ts.createSourceFile(FILE, text, ts.ScriptTarget.Latest, true);
  const node = ast.statements.find((item): item is ts.FunctionDeclaration =>
    ts.isFunctionDeclaration(item) && item.name?.text === name);
  if (!node) throw new Error('Missing function: ' + name);
  return node.getText(ast);
}
type TimeoutFunction = <T>(value: Promise<T>, milliseconds: number) => Promise<T>;
function timeoutFrom(text: string): TimeoutFunction {
  const isolated = emit(namedFunction(text, 'withTimeout'), ts.ModuleKind.CommonJS);
  return runInNewContext(isolated + '\nwithTimeout;', {
    setTimeout, clearTimeout, Promise, Error,
  }, { timeout: 1000 }) as TimeoutFunction;
}

test('field safety carries the existing decision contract or null, not null-only inference', () => {
  expect(declaration('fieldSafety').type?.getText(parsed)).toBe('FieldSafetyDecision | null');
  expect(source).toContain('type FieldSafetyDecision');
});
test('member context carries its existing builder contract or null', () => {
  expect(declaration('memberLiveCtx').type?.getText(parsed)).toBe('MemberLiveContext | null');
  expect(source).toContain('type MemberLiveContext');
});
test('timeout code uses a precise Error intersection without a suppression or any cast', () => {
  const body = namedFunction(source, 'withTimeout');
  expect(body).not.toContain('@ts-expect-error');
  expect(body).not.toContain('@ts-ignore');
  expect(body).not.toContain('as any');
  expect(body).toContain("Error & { code: 'SOVEREIGN_TIMEOUT' }");
});
test.each([ts.ModuleKind.CommonJS, ts.ModuleKind.ESNext])(
  'entire route emits identical JavaScript for module kind %s', (kind) => {
    expect(emit(source, kind)).toBe(emit(parent, kind));
  },
);
test('runtime parity would detect an accidental permission change', () => {
  const changed = source.replace('if (!fieldSafety.allowed)', 'if (fieldSafety.allowed)');
  expect(changed).not.toBe(source);
  expect(emit(changed, ts.ModuleKind.CommonJS)).not.toBe(emit(parent, ts.ModuleKind.CommonJS));
});

describe.each([['parent', parent], ['candidate', source]])('%s actual timeout helper', (_label, text) => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });
  test('returns the original resolved value and clears the timer', async () => {
    const object = { fixture: 'resolved-value' };
    await expect(timeoutFrom(text)(Promise.resolve(object), 50)).resolves.toBe(object);
    expect(jest.getTimerCount()).toBe(0);
  });
  test('preserves a source rejection rather than replacing it with a timeout', async () => {
    const failure = new Error('fictional source rejected');
    await expect(timeoutFrom(text)(Promise.reject(failure), 50)).rejects.toBe(failure);
    expect(jest.getTimerCount()).toBe(0);
  });
  test('rejects on the deadline with the same timeout code and message', async () => {
    const pending = timeoutFrom(text)(new Promise<never>(() => {}), 50);
    const observed = expect(pending).rejects.toMatchObject({
      message: 'SOVEREIGN_TIMEOUT', code: 'SOVEREIGN_TIMEOUT',
    });
    jest.advanceTimersByTime(50);
    await observed;
    expect(jest.getTimerCount()).toBe(0);
  });
});
