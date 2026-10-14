'use strict';
/** Offline compiler-only qualification. Never import or execute the serving route. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');
const swc = require('@swc/core');
const FILE = 'app/api/sovereign/app/maia/list/route.ts';
const BASE = '23ac0bdcebd74a8f1f0f60ed66eeda2ffef6440e';
const edits = [
  ["import { enforceFieldSafety } from '@/lib/field/enforceFieldSafety';",
   "import { enforceFieldSafety, type FieldSafetyDecision } from '@/lib/field/enforceFieldSafety';"],
  ["import { buildMemberLiveContext, formatMemberWebForPrompt, describeLiveContext } from '@/lib/memory/MemberLiveContext';",
   "import { buildMemberLiveContext, formatMemberWebForPrompt, describeLiveContext, type MemberLiveContext } from '@/lib/memory/MemberLiveContext';"],
  ["      const err = new Error('SOVEREIGN_TIMEOUT');\n      // @ts-expect-error - attach custom code for logging\n      (err as any).code = 'SOVEREIGN_TIMEOUT';",
   "      const err = new Error('SOVEREIGN_TIMEOUT') as Error & { code: 'SOVEREIGN_TIMEOUT' };\n      err.code = 'SOVEREIGN_TIMEOUT';"],
  ['    let fieldSafety = null;', '    let fieldSafety: FieldSafetyDecision | null = null;'],
  ['    let memberLiveCtx = null;', '    let memberLiveCtx: MemberLiveContext | null = null;'],
];
const hash = text => createHash('sha256').update(text).digest('hex');
function applyTypes(text) {
  for (const [before, after] of edits) {
    assert.equal(text.split(before).length - 1, 1, 'source context changed: ' + before.slice(0,70));
    text = text.replace(before, after);
  }
  return text;
}
function withoutComments(text) {
  const ast = ts.createSourceFile(FILE, text, ts.ScriptTarget.Latest, true);
  return ts.createPrinter({ removeComments: true }).printFile(ast);
}
const compilers = [
  ['typescript-cjs', text => ts.transpileModule(text, { fileName: FILE, compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
    esModuleInterop: true, removeComments: true, sourceMap: false,
  }}).outputText],
  ['typescript-esm', text => ts.transpileModule(text, { fileName: FILE, compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
    esModuleInterop: true, removeComments: true, sourceMap: false,
  }}).outputText],
  // Normalize comments only; type syntax is still present and erased by SWC.
  ['swc-cjs', text => swc.transformSync(withoutComments(text), { filename: FILE,
    jsc: { parser: { syntax: 'typescript' }, target: 'es2022' },
    module: { type: 'commonjs' }, sourceMaps: false,
  }).code],
  ['swc-esm', text => swc.transformSync(withoutComments(text), { filename: FILE,
    jsc: { parser: { syntax: 'typescript' }, target: 'es2022' },
    module: { type: 'es6' }, sourceMaps: false,
  }).code],
];
const before = execFileSync('git', ['show', BASE + ':' + FILE], { encoding: 'utf8' });
const after = fs.readFileSync(FILE, 'utf8');
assert.equal(after, applyTypes(before), 'candidate differs beyond the allowed type-only edits');
const snapshots = [{ label: 'candidate', before, after }];
// Optional adjacent checkouts are read only. Construct a virtual patch, not a merge.
for (const [index, root] of process.argv.slice(2).entries()) {
  const file = path.join(root, FILE);
  const text = fs.readFileSync(file, 'utf8');
  snapshots.push({ label: 'adjacent-' + (index + 1), before: text, after: applyTypes(text), file });
}
const results = [];
for (const snapshot of snapshots) {
  const identities = {};
  for (const [name, compile] of compilers) {
    const a = compile(snapshot.before), b = compile(snapshot.after);
    assert.equal(b, a, snapshot.label + ': executable JavaScript changed in ' + name);
    const mutation = snapshot.after.replace('if (!fieldSafety.allowed)', 'if (fieldSafety.allowed)');
    assert.notEqual(mutation, snapshot.after, 'guard mutation failed');
    assert.notEqual(compile(mutation), a, 'compiler comparison missed permission-branch change');
    identities[name] = hash(b);
  }
  if (snapshot.file) assert.equal(fs.readFileSync(snapshot.file, 'utf8'), snapshot.before,
    'adjacent source changed while it was being examined');
  results.push({ label: snapshot.label, sourceBefore: hash(snapshot.before),
    sourceAfter: hash(snapshot.after), compiled: identities, adjacentModified: false });
}
console.log('MAIA_ROUTE_TYPE_ONLY_PARITY_PASS', JSON.stringify({
  parent: BASE, typescript: ts.version, swc: swc.version,
  sourceVariants: snapshots.length, compilerComparisons: snapshots.length * compilers.length,
  mutationChecks: snapshots.length * compilers.length, results,
  routeExecuted: false, databaseAccessed: false, providersCalled: false, releaseApproved: false,
}));
