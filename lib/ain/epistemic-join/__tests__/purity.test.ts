/**
 * JARVIS-KP-01 · I2 — purity and seam-closure guards.
 *
 * I2 is constitutional computation only. These guards hold that claim
 * structurally rather than by assertion in prose:
 *
 *   1. deterministic for identical inputs;
 *   2. no clock, randomness, network, database, filesystem, environment, or
 *      provider dependency;
 *   3. no mutation of the caller's input;
 *   4. no write or runtime authority over any existing seam;
 *   5. no persistence or projection module even exists yet.
 *
 * NOTE ON METHOD: every source scan strips comments FIRST. The module documents
 * its own prohibitions, so a raw-source scan would fail these files precisely
 * because they state what they refuse to do — the C21 instrument defect from
 * the Circles lane, applied here before it could bite.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { evaluateJoin } from '../evaluate';
import { adoptionAct, component, envelope, lawfulRequest, warrant } from './fixtures';

const MODULE_DIR = join(__dirname, '..');

const sourceFiles = (): readonly string[] =>
  readdirSync(MODULE_DIR)
    .filter((name) => name.endsWith('.ts'))
    .map((name) => join(MODULE_DIR, name));

/** Remove block and line comments so prose about a prohibition is not read as the prohibited act. */
const stripComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

describe('I2 purity · determinism', () => {
  const request = lawfulRequest({
    envelope: envelope({
      components: [component('c-meaning'), component('c-motive', { kind: 'external_motive' })],
    }),
    adoptionActs: [adoptionAct({ adoptedComponentIds: ['c-meaning', 'c-motive'] })],
  });

  it('returns structurally identical results for identical inputs', () => {
    const first = evaluateJoin(request);
    const second = evaluateJoin(request);
    expect(second).toEqual(first);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it('returns the same result for an independently constructed identical input', () => {
    const clone = JSON.parse(JSON.stringify(request)) as typeof request;
    expect(JSON.stringify(evaluateJoin(clone))).toBe(JSON.stringify(evaluateJoin(request)));
  });

  it('does not mutate the caller input', () => {
    const before = JSON.stringify(request);
    evaluateJoin(request);
    evaluateJoin(request);
    expect(JSON.stringify(request)).toBe(before);
  });

  it('does not carry state between evaluations of different joins', () => {
    const a = lawfulRequest();
    const b = lawfulRequest({ requestedJurisdiction: 'metaphysical' });
    const aFirst = JSON.stringify(evaluateJoin(a));
    evaluateJoin(b);
    expect(JSON.stringify(evaluateJoin(a))).toBe(aFirst);
  });
});

describe('I2 purity · no impure dependency in module source', () => {
  // Each entry is a capability the evaluator must not have. Test files are
  // excluded from the scan: this suite itself reads the filesystem in order to
  // prove that the module does not.
  const FORBIDDEN: readonly { readonly label: string; readonly pattern: RegExp }[] = [
    { label: 'clock', pattern: /\bDate\s*\.\s*now\b|\bnew\s+Date\b|\bperformance\s*\.\s*now\b/ },
    { label: 'randomness', pattern: /\bMath\s*\.\s*random\b|\brandomUUID\b|\bcrypto\s*\./ },
    { label: 'environment', pattern: /\bprocess\s*\.\s*env\b|\bprocess\s*\.\s*argv\b/ },
    { label: 'filesystem', pattern: /\bnode:fs\b|\brequire\s*\(|\breadFileSync\b|\bwriteFileSync\b/ },
    { label: 'network or provider call', pattern: /\bfetch\s*\(|\baxios\b|\banthropic\b|\bopenai\b|\bollama\b/i },
    { label: 'database', pattern: /\bDATABASE_URL\b|\bfrom\s+['"]pg['"]|\bquery\s*\(|\bpool\b|\btransaction\s*\(/i },
    { label: 'SQL mutation', pattern: /\bINSERT\s+INTO\b|\bUPDATE\s+\w+\s+SET\b|\bDELETE\s+FROM\b|\bTRUNCATE\b/i },
    { label: 'supabase', pattern: /supabase/i },
  ];

  it.each(FORBIDDEN.map((f) => [f.label, f.pattern] as const))(
    'has no %s anywhere in the module',
    (label, pattern) => {
      const offenders: string[] = [];
      for (const file of sourceFiles()) {
        const code = stripComments(readFileSync(file, 'utf8'));
        if (pattern.test(code)) offenders.push(file);
      }
      expect({ label, offenders }).toEqual({ label, offenders: [] });
    },
  );

  it('declares no import outside this module', () => {
    for (const file of sourceFiles()) {
      const code = stripComments(readFileSync(file, 'utf8'));
      const imports = [...code.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const specifier of imports) {
        expect(specifier?.startsWith('./')).toBe(true);
      }
    }
  });
});

describe('I2 seam closure · no existing seam acquires write or runtime authority', () => {
  const SEAMS: readonly { readonly label: string; readonly pattern: RegExp }[] = [
    { label: 'Member Memory atoms', pattern: /member_memory_atoms|crossing_allowed/i },
    { label: 'Relational Practice Ledger', pattern: /\brl_[a-z_]+\b|relational_ledger/i },
    { label: 'Wisdom Graph', pattern: /wisdom_graph|wisdom_nodes|wisdom_events/i },
    { label: 'Living Constellation', pattern: /living-constellation|livingConstellation/i },
    { label: 'JARVIS CI epistemic ledger', pattern: /epistemic-ledger|\.ain\//i },
    { label: 'MAIA prompt or context injection', pattern: /systemPrompt|buildMaia|conversationHistory|promptBlock/i },
    { label: 'feature flag activation', pattern: /featureFlag|FEATURE_|_ENABLED\b/i },
    { label: 'migration', pattern: /database\/migrations|CREATE TABLE/i },
  ];

  it.each(SEAMS.map((s) => [s.label, s.pattern] as const))('does not reach %s', (label, pattern) => {
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      const code = stripComments(readFileSync(file, 'utf8'));
      if (pattern.test(code)) offenders.push(file);
    }
    expect({ label, offenders }).toEqual({ label, offenders: [] });
  });

  it('contains no persistence adapter and no projection module', () => {
    // I3 and I4 work. Absent, not present and disabled: a disabled writer is
    // still a writer waiting for a flag.
    const names = readdirSync(MODULE_DIR);
    expect(names).not.toContain('store.ts');
    expect(names).not.toContain('projection.ts');
    expect(names.filter((n) => n.endsWith('.ts')).sort()).toEqual([
      'adoption.ts',
      'composite.ts',
      'evaluate.ts',
      'index.ts',
      'standing.ts',
      'types.ts',
    ]);
  });
});

describe('I2 representation authority is closed by type, not by runtime choice', () => {
  it('cannot be told to authorize downstream representation', () => {
    const result = evaluateJoin(lawfulRequest());
    // @ts-expect-error downstreamRepresentationAuthorized is the literal `false`
    const attempt: boolean = ((): typeof result.downstreamRepresentationAuthorized => true)();
    expect(attempt).toBe(true);
    expect(result.downstreamRepresentationAuthorized).toBe(false);
  });

  it('never reports an admitted standing above the strongest warrant in the input', () => {
    // A sweep over the ladder: no request can produce a standing the warrants
    // did not license.
    for (const ceiling of ['CANDIDATE_UNESTABLISHED', 'PROVISIONAL', 'WARRANTED'] as const) {
      for (const requested of ['PROVISIONAL', 'WARRANTED', 'PROMOTED'] as const) {
        const result = evaluateJoin(
          lawfulRequest({
            requestedStanding: requested,
            envelope: envelope({ operation: 'PROMOTE' }),
            warrants: [warrant('w1', { standingCeiling: ceiling })],
          }),
        );
        const ladder = ['NONE_UNASSERTED', 'CANDIDATE_UNESTABLISHED', 'PROVISIONAL', 'WARRANTED', 'PROMOTED'];
        expect(ladder.indexOf(result.admittedStanding)).toBeLessThanOrEqual(ladder.indexOf(ceiling));
      }
    }
  });
});
