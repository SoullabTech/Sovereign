/**
 * BUILD-07C — module-graph boundaries of the reading unit.
 *
 *   freeze / assess / contract   pure: no database, no seam, no reader call
 *   classify                     the seam and the vocabularies only — no prose source, no store
 *   store                        the database and the contract only — no reader, no seam, no classifier;
 *                                INSERT and SELECT only, never UPDATE or DELETE (INV-4, INV-22)
 *   commission                   the only module that joins capture, reader, classifier, freeze, store
 *   the reader                   still cannot reach this unit (gate beside the reader)
 *   the evidence substrate       still cannot reach this unit (gate beside the substrate)
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..', '..');
const DIR = join(ROOT, 'lib', 'manuscript', 'developmentalReading');

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const importsOf = (code: string) => [...code.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
const modules = () => readdirSync(DIR).filter((f) => f.endsWith('.ts'))
  .map((f) => ({ name: f, code: strip(readFileSync(join(DIR, f), 'utf8')) }));

const ALLOWED: Record<string, RegExp[]> = {
  'contract.ts': [/^\.\.\/development\/(evidenceRef|readState)$/, /^\.\.\/developmentalReader\/contract$/, /^\.\.\/structure\/readerProvenance$/],
  'freeze.ts': [/^\.\/contract$/, /^\.\.\/development\/(bind|evidenceRef)$/, /^\.\.\/developmentalReader\/contract$/, /^\.\.\/structure\/readerProvenance$/],
  'assess.ts': [/^\.\/contract$/, /^\.\.\/development\/resolve$/],
  'classify.ts': [/^\.\/contract$/, /^crypto$/, /^\.\.\/\.\.\/ai\/structured\/(router|types)$/, /^\.\.\/developmentalReader\/contract$/],
  'store.ts': [/^\.\/contract$/, /^\.\.\/\.\.\/db\/postgres$/, /^\.\.\/development\/evidenceRef$/],
  'commission.ts': [/^\.\/(classify|contract|freeze|store)$/, /^\.\.\/development\/(capture|resolve)$/, /^\.\.\/developmentalReader\/(contract|read)$/],
};

describe('developmental reading — module boundaries', () => {
  it('every module imports only what its role allows', () => {
    for (const { name, code } of modules()) {
      const allowed = ALLOWED[name];
      expect(`${name} is a known module: ${allowed !== undefined}`).toBe(`${name} is a known module: true`);
      const bad = importsOf(code).filter((s) => !allowed.some((re) => re.test(s)));
      expect(`${name}: ${bad.join(', ')}`).toBe(`${name}: `);
    }
  });

  it('the store has INSERT and SELECT only — no UPDATE, DELETE, TRUNCATE (INV-4, INV-22)', () => {
    const store = modules().find((m) => m.name === 'store.ts')!.code;
    expect(/\b(UPDATE\s+[a-z_]+\s+SET|DELETE\s+FROM|TRUNCATE|ALTER\s+TABLE|DROP\s+TABLE)\b/i.test(store)).toBe(false);
    expect(/INSERT\s+INTO\s+developmental_readings/.test(store)).toBe(true);
    /* the store touches only its own two tables */
    const tables = [...store.matchAll(/\b(?:INTO|FROM|JOIN)\s+([a-z_]+)/gi)].map((m) => m[1]);
    expect(new Set(tables)).toEqual(new Set(['developmental_readings', 'developmental_observations']));
  });

  it('freeze never rewrites: the observation is assigned from the claim text with no transformation', () => {
    const freeze = modules().find((m) => m.name === 'freeze.ts')!.code;
    expect(freeze).toMatch(/observation:\s*claim\.text,/);
    expect(/claim\.text\.(trim|replace|slice|toLowerCase|toUpperCase|normalize)\(/.test(freeze.replace(/claim\.text\.trim\(\)\s*===\s*''/g, ''))).toBe(false);
  });

  it('the classifier has no path to prose: no request, no recovered, no evidence parameter', () => {
    const classify = modules().find((m) => m.name === 'classify.ts')!.code;
    for (const word of ['recovered', 'DevelopmentalReaderRequest', 'DevelopmentalEvidence', 'readState', 'revisionContent', 'renderRequest']) {
      expect(`classify names ${word}: ${classify.includes(word)}`).toBe(`classify names ${word}: false`);
    }
  });

  it('observation-only v1: no module names interpretation, questions, possibilities, uncertainty as fields', () => {
    for (const { name, code } of modules()) {
      expect(`${name}: ${/\b(interpretation|questions|possibilities|uncertainty|severity|priority|confidence|score|rank)\s*[:?]\s*/.test(code)}`)
        .toBe(`${name}: false`);
    }
  });

  it('no module names a manuscript-mutating path', () => {
    for (const { name, code } of modules()) {
      for (const forbidden of ['applyGesture', 'updateReviewed', 'applyReviewOperation', 'adoptProposal', 'saveSectionAddressable',
        'restoreSectionAddressable', 'convertExistingDraft', 'manuscript_draft_sections', 'manuscript_working_drafts']) {
        expect(`${name} names ${forbidden}: ${code.includes(forbidden)}`).toBe(`${name} names ${forbidden}: false`);
      }
    }
  });

  it('the migration adds no column for anything 07C v1 does not authorize', () => {
    const sql = readFileSync(join(ROOT, 'database', 'migrations', '20260904000001_developmental_readings.sql'), 'utf8')
      .replace(/^\s*--.*$/gm, '');
    for (const col of ['interpretation', 'questions', 'possibilities', 'uncertainty', 'severity', 'priority', 'confidence', 'score', 'rank']) {
      expect(`migration column ${col}: ${new RegExp(`^\\s*${col}\\s+`, 'm').test(sql)}`).toBe(`migration column ${col}: false`);
    }
    expect(sql).toMatch(/BEFORE UPDATE ON developmental_readings/);
    expect(sql).toMatch(/BEFORE UPDATE ON developmental_observations/);
  });
});
