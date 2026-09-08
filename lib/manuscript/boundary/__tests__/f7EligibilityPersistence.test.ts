/**
 * SEL-0 — F-7 eligibility as reading provenance, and the boundary's resolution
 * of its ABSENCE.
 *
 * Synthetic fixtures only. Nothing here touches the frozen SEL-0 corpus, and no
 * production row is read or written by any test in this file.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { isF7Verdict, type DevelopmentalReading } from '../../developmentalReading/contract';
import { verdictFor } from '../candidateEligibility';

const ROOT = join(__dirname, '..', '..', '..', '..');
const MIGRATION = join(ROOT, 'database/migrations/20260908000001_developmental_reading_f7_eligibility.sql');
const sql = readFileSync(MIGRATION, 'utf8');

const reading = (f7?: DevelopmentalReading['f7Eligibility']): DevelopmentalReading =>
  ({ ...(f7 ? { f7Eligibility: f7 } : {}) } as unknown as DevelopmentalReading);

describe('the three states', () => {
  it('admits exactly three', () => {
    expect(['eligible', 'ineligible', 'unestablished'].every(isF7Verdict)).toBe(true);
  });

  it.each([['unknown'], ['pending'], [''], [null], [undefined], [true]])(
    'refuses %p', (v) => expect(isF7Verdict(v)).toBe(false));
});

describe('absence is resolved once, in the boundary seam, and never to eligible', () => {
  it('a reading with NO record reads as unestablished', () => {
    expect(verdictFor(reading(), 'o1')).toBe('unestablished');
  });

  it('an observation missing from a present record reads as unestablished', () => {
    expect(verdictFor(reading({
      rule: 'r', ruleVersion: 'v', adjudicator: { kind: 'none', reason: 'x' },
      verdicts: { o1: 'eligible' },
    }), 'o2')).toBe('unestablished');
  });

  it('a recorded verdict is returned as recorded', () => {
    const r = reading({
      rule: 'r', ruleVersion: 'v', adjudicator: { kind: 'none', reason: 'x' },
      verdicts: { o1: 'eligible', o2: 'ineligible', o3: 'unestablished' },
    });
    expect([verdictFor(r, 'o1'), verdictFor(r, 'o2'), verdictFor(r, 'o3')])
      .toEqual(['eligible', 'ineligible', 'unestablished']);
  });

  it('ONLY `eligible` is admitted by the boundary — the other two are equally excluded', () => {
    const seam = readFileSync(join(ROOT, 'lib/manuscript/boundary/candidateEligibility.ts'), 'utf8');
    expect(seam).toMatch(/f7\(o\.key\) === 'eligible'/);
    /* Never a negative test. `!== 'ineligible'` would admit `unestablished`,
       which is the exact default the ruling forbids. */
    expect(seam).not.toMatch(/!== 'ineligible'|!== 'unestablished'/);
  });
});

describe('what a NEW reading is frozen with', () => {
  const freeze = readFileSync(join(ROOT, 'lib/manuscript/developmentalReading/freeze.ts'), 'utf8');

  it('carries a complete record, with every verdict unestablished', () => {
    expect(freeze).toMatch(/verdicts\[k\] = 'unestablished'/);
    expect(freeze).toMatch(/kind: 'none'/);
  });

  it('names the governing rule and its version', () => {
    expect(freeze).toMatch(/export const F7_RULE\b/);
    expect(freeze).toMatch(/export const F7_RULE_VERSION\b/);
  });

  it('never writes `eligible` at freeze — there is no adjudicator to write it', () => {
    const helper = freeze.slice(freeze.indexOf('function unadjudicatedF7'));
    expect(helper.slice(0, helper.indexOf('\n}'))).not.toMatch(/'eligible'/);
  });
});

describe('the store persists what freeze assembles', () => {
  const store = readFileSync(join(ROOT, 'lib/manuscript/developmentalReading/store.ts'), 'utf8');
  const askReader = readFileSync(
    join(ROOT, 'lib/manuscript/ask/frozenDevelopmentalReading.ts'), 'utf8');

  it('the INSERT names both new columns', () => {
    expect(store).toMatch(/f7_eligibility, reading_contract_version/);
  });

  it('the recorded defect is repaired: readingContractVersion now reaches a column', () => {
    expect(store).toMatch(/reading\.provenance\.readingContractVersion \?\? null/);
  });

  it('both readers select the new columns', () => {
    expect(store).toMatch(/f7_eligibility, reading_contract_version/);
    expect(askReader).toMatch(/f7_eligibility, reading_contract_version/);
  });

  it('NULL is omitted on hydrate, never spelled — absence is the v1 evidence', () => {
    for (const src of [store, askReader]) {
      expect(src).toMatch(/row\.reading_contract_version === null\s*\n?\s*\? \{\}/);
    }
  });
});

describe('the migration is additive and backfills nothing', () => {
  it('adds two nullable columns and asserts NOT NULL on neither', () => {
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS f7_eligibility jsonb;/);
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS reading_contract_version text;/);
    expect(sql).not.toMatch(/SET NOT NULL/);
  });

  it('writes no data at all — no backfill, including of the frozen 19', () => {
    /* Scanned as DML against the table, not as the words. `BEFORE INSERT ON`
       is trigger DDL and says the opposite of a write; a bare keyword scan
       would fail on a migration precisely because it installs the guard. */
    const statements = sql.replace(/--.*$/gm, '');
    expect(statements).not.toMatch(/UPDATE\s+developmental_readings\s+SET/i);
    expect(statements).not.toMatch(/INSERT\s+INTO\s+developmental_readings/i);
    expect(statements).not.toMatch(/DELETE\s+FROM\s+developmental_readings/i);
  });

  it('FALSIFIER · a backfill statement would be caught', () => {
    const poisoned = "UPDATE developmental_readings SET f7_eligibility = '{}'::jsonb;";
    expect(poisoned).toMatch(/UPDATE\s+developmental_readings\s+SET/i);
  });

  it('does not replace the observation check, so v2 cannot be lost by reinstatement', () => {
    expect(sql).not.toMatch(/developmental_readings_observations_check/);
  });

  it('constrains the record only where it is present', () => {
    expect(sql).toMatch(/f7_eligibility IS NULL OR \(/);
  });

  it('requires a complete record and refuses a verdict outside the three states', () => {
    expect(sql).toMatch(/carries no F-7 verdict/);
    expect(sql).toMatch(/'eligible', 'ineligible', 'unestablished'/);
  });

  it('fires on INSERT only — the row is immutable, so a verdict cannot be revised', () => {
    expect(sql).toMatch(/BEFORE INSERT ON developmental_readings/);
    expect(sql).not.toMatch(/BEFORE UPDATE ON developmental_readings/);
  });
});
