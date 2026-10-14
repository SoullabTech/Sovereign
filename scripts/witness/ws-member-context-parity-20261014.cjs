'use strict';
/** Offline differential check: unchanged parent vs candidate. No real source modules load. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');
const BASE = '0a8a43ce7f4d6957ae264a923a69acc49da04709';
const FILE = 'lib/memory/MemberLiveContext.ts';
const parent = execFileSync('git', ['show', BASE + ':' + FILE], { encoding: 'utf8' });
const candidate = fs.readFileSync(FILE, 'utf8');
const member = 'fixture-only-member';
const epoch = Date.parse('2026-10-14T12:00:00.000Z');
class FixedDate extends Date {
  constructor(value) { super(arguments.length ? value : epoch); }
  static now() { return epoch; }
}
const baseJournal = () => ({ id: 'fixture-journal', content: '  FICTIONAL café.\n\nSecond line.  ',
  themes: ['hope', 'creative'], mood: 'quiet', createdAt: new FixedDate(epoch) });
const cases = [
  { name: 'empty sources' },
  { name: 'Date journal', journals: () => [baseJournal()] },
  { name: 'legacy string timestamp', journals: () => [{ ...baseJournal(), createdAt: '2026-10-13T23:30:00-05:00' }] },
  { name: 'missing themes', journals: () => [{ ...baseJournal(), themes: undefined }] },
  { name: 'Date summary', summaries: () => [{ sessionId: 'fixture-session', summary: { essence: 'FICTIONAL summary', themes: ['creative'] }, completedAt: new FixedDate(epoch) }] },
  { name: 'string summary', summaries: () => [{ sessionId: 'fixture-session', summary: { essence: 'FICTIONAL summary', nextStep: 'FICTIONAL next step' }, completedAt: '2026-10-13T23:30:00-05:00' }] },
  { name: 'journal read rejected', rejectJournal: true },
  { name: 'explicit skip', options: { skip: true }, journals: () => [baseJournal()] },
  { name: 'no member', userId: '', journals: () => [baseJournal()] },
];
async function run(source, spec) {
  const calls = [];
  const stub = (name, getValue) => (...args) => {
    calls.push([name, ...args]);
    if (name === 'journals' && spec.rejectJournal) return Promise.reject(new Error('fictional source unavailable'));
    return Promise.resolve(getValue());
  };
  const sources = {
    '@/lib/consciousness/spiralStatePersistence': { loadSpiralState: stub('spiral', () => null) },
    '@/lib/scribe/sovereignSummarizer': { getRecentSummaries: stub('summaries', () => spec.summaries?.() || []) },
    '@/lib/patterns/PatternOfferingService': { getActivePatternContext: stub('patterns', () => []) },
    '@/lib/memory/SignificantMomentsService': { loadJournals: stub('journals', () => spec.journals?.() || []) },
    '@/lib/consciousness/RelationshipAnamnesisPostgres': { loadRelationshipEssence: stub('relationship', () => null) },
    '@/lib/consciousness/participatoryRealityHelper': { getRecentThemes: stub('themes', () => []), findRecurringThemes: () => [] },
  };
  const module = { exports: {} };
  const context = vm.createContext({ module, exports: module.exports, Date: FixedDate,
    console: { log() {} }, require(name) {
      assert(Object.hasOwn(sources, name), 'non-mocked source import refused: ' + name);
      return sources[name];
    },
  });
  const compiled = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
  }}).outputText;
  vm.runInContext(compiled, context, { timeout: 3000 });
  const ctx = await module.exports.buildMemberLiveContext(spec.userId ?? member, spec.options || {});
  const prompt = module.exports.formatMemberWebForPrompt(ctx);
  const diagnostics = module.exports.describeLiveContext(ctx);
  // The intended data-shape change is explicit member metadata only; compare
  // every other returned value as well as the exact prompt and source calls.
  const comparable = { ...ctx, recentJournal: ctx.recentJournal.map(({ userId, ...rest }) => rest) };
  return { prompt, diagnostics: JSON.parse(JSON.stringify(diagnostics)),
    context: JSON.parse(JSON.stringify(comparable)), calls,
    owners: ctx.recentJournal.map(j => j.userId),
  };
}
(async () => {
  for (const spec of cases) {
    const before = await run(parent, spec);
    const after = await run(candidate, spec);
    assert.equal(after.prompt, before.prompt, spec.name + ': exact prompt changed');
    assert.deepEqual(after.context, before.context, spec.name + ': non-identity data changed');
    assert.deepEqual(after.diagnostics, before.diagnostics, spec.name + ': diagnostics changed');
    assert.deepEqual(after.calls, before.calls, spec.name + ': source access changed');
    assert(after.owners.every(owner => owner === (spec.userId ?? member)), 'incorrect context metadata');
    console.log('PARITY_PASS', spec.name);
  }
  console.log('MEMBER_CONTEXT_PARITY_PASS', JSON.stringify({ cases: cases.length,
    exactPromptsPreserved: true, sourceCallArgumentsPreserved: true,
    externalRequests: 0, realRecords: 0, releaseApproved: false }));
})().catch(error => { console.error('MEMBER_CONTEXT_PARITY_FAIL', error.message); process.exitCode = 1; });
