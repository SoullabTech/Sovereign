/**
 * R1-A executable source-policy checks: no session-mode cleanup,
 * no implicit background provider grant and no post-delete influence reuse.
 * The physical PostgreSQL tests exercise the actual metadata eligibility SQL.
 */
import {describe,it,expect} from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
import {
  summaryProviderFixtureEnabled,
  summaryReadFixtureEnabled,
} from '../sessionSummaryEligibility';

const read = (name:string)=>
 fs.readFileSync(path.join(process.cwd(),name),'utf8');
const worker=read('scripts/run-session-summary-worker.ts');
const legacyBackfill=read('scripts/backfill-maia-turns-summaries.ts');
const summarizer=read('lib/scribe/sovereignSummarizer.ts');
const store=read('lib/memory/stores/SessionSummaryStore.ts');
const finalizer=read('lib/sovereign/sessionFinalizer.ts');
const sweeper=read('scripts/sweep-stale-sessions.ts');
const endSession=read('app/api/scribe/end-session/route.ts');

describe('R1-A no background cloud processing or deletion by default',()=>{
  it('summary and legacy recall permissions are distinct, default-off',()=>{
    expect(summaryProviderFixtureEnabled()).toBe(false);
    expect(summaryReadFixtureEnabled()).toBe(false);
  });
  it('a production runtime cannot turn the fixture on with an environment flag',()=>{
    const prior=process.env.NODE_ENV;
    process.env.NODE_ENV='production';
    process.env.RF01_R1_SUMMARY_FIXTURE_ENABLED='1';
    process.env.RF01_R1_SUMMARY_READ_FIXTURE_ENABLED='1';
    try {
      expect(summaryProviderFixtureEnabled()).toBe(false);
      expect(summaryReadFixtureEnabled()).toBe(false);
    } finally {
      process.env.NODE_ENV=prior;
      delete process.env.RF01_R1_SUMMARY_FIXTURE_ENABLED;
      delete process.env.RF01_R1_SUMMARY_READ_FIXTURE_ENABLED;
    }
  });
  it('summary worker refuses before any database connectivity or job claim',()=>{
    const start=worker.indexOf('async function runWorkerLoop');
    const gate=worker.indexOf('if (!summaryProviderFixtureEnabled())',start);
    const db=worker.indexOf('await assertCorrectDb()',start);
    expect(gate).toBeGreaterThan(start);
    expect(gate).toBeLessThan(db);
    expect(db).toBeGreaterThan(gate);
  });
  it('worker will not use unqualified content for a provider or storage',()=>{
    const start=worker.indexOf('async function processJob');
    const read=worker.indexOf('await generateSessionRemembrance(',start);
    const gate=worker.indexOf('const eligible = await evaluateSummaryEligibility',start);
    const recheck=worker.indexOf('const beforeWrite = await evaluateSummaryEligibility',start);
    const write=worker.indexOf('await storeRemembrance(',start);
    expect(gate).toBeGreaterThan(start);
    expect(gate).toBeLessThan(read);
    expect(recheck).toBeGreaterThan(read);
    expect(recheck).toBeLessThan(write);
  });
  it('the worker has no content-bearing blanket DELETE or embedding bridge',()=>{
    expect(worker).not.toContain('DELETE FROM conversation_turns\n');
    expect(worker).not.toContain('await bridgeRemembranceToEpisodicMemory(');
    expect(worker).not.toContain('new VectorEmbeddingService(');
    expect(worker).not.toContain('remembrance.essence.slice(');
  });
  it('legacy maia_turns backfill is held before opening database or provider',()=>{
    const start=legacyBackfill.indexOf('async function main()');
    const gate=legacyBackfill.indexOf('if (!summaryProviderFixtureEnabled())',start);
    const db=legacyBackfill.indexOf('await assertCorrectDb()',start);
    expect(gate).toBeGreaterThan(start);
    expect(gate).toBeLessThan(db);
  });
  it('the direct summarizer checks before turn read and again before Anthropic',()=>{
    const start=summarizer.indexOf('export async function generateSessionRemembrance');
    const gate=summarizer.indexOf('if (!summaryProviderFixtureEnabled())',start);
    const eligible=summarizer.indexOf('await evaluateSummaryEligibility(',start);
    const content=summarizer.indexOf('await TurnsStore.getSessionTurns(',start);
    const recheck=summarizer.indexOf('const beforeProvider = await evaluateSummaryEligibility',start);
    const model=summarizer.indexOf('anthropic.messages.create(',start);
    expect(gate).toBeGreaterThan(start);
    expect(eligible).toBeLessThan(content);
    expect(recheck).toBeGreaterThan(content);
    expect(recheck).toBeLessThan(model);
  });
  it('both summary stores suppress legacy derived-content reuse',()=>{
    expect(summarizer).toContain('if (!summaryReadFixtureEnabled()) return [];');
    expect(store).toContain('if (!summaryReadFixtureEnabled()) return [];');
  });
  it('every standalone summary writer is held without independent approval',()=>{
    expect(store).toContain("if (!summaryProviderFixtureEnabled()) throw new Error('SUMMARY_STORAGE_HELD')");
    expect(summarizer).toContain("if (!summaryProviderFixtureEnabled()) throw new Error('SUMMARY_STORAGE_HELD')");
  });
  it('the finalizer and stale sweeper do not enqueue summaries by default',()=>{
    expect(finalizer).toContain('if (!summaryProviderFixtureEnabled()) {');
    expect(sweeper).toContain('sessions.length === 0 || !summaryProviderFixtureEnabled()');
  });
  it('the MAIA Scribe end-session path cannot delete older turns',()=>{
    expect(endSession).not.toMatch(/DELETE\s+FROM\s+conversation_turns/i);
    expect(endSession).not.toContain('transaction(async');
    expect(endSession).toContain('PER_TURN_DELETION_POLICY_NOT_QUALIFIED');
  });
  it('the MAIA Scribe end-session GET never selects or returns summary content',()=>{
    expect(endSession).toContain('hasSummary: false');
    expect(endSession).toContain('summary: null');
    expect(endSession).not.toContain('SELECT id, mode, status, summary');
  });
});
