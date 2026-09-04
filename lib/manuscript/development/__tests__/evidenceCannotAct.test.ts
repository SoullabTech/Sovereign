/**
 * BUILD-07A — the evidence substrate cannot read with a model, write the Work,
 * or reach a reader. Asserted over the actual module graph, not by comment.
 *
 * The lane's line: "07A establishes evidence; it does not produce MAIA's
 * reading of the evidence." A substrate that could reach a model or a prompt
 * is one dropped `type` keyword from producing one.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..', '..');
const DIR = join(ROOT, 'lib', 'manuscript', 'development');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function modules(): { path: string; code: string }[] {
  return readdirSync(DIR)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => ({ path: join(DIR, f), code: stripComments(readFileSync(join(DIR, f), 'utf8')) }));
}

function importsOf(code: string): string[] {
  return [...code.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
}

describe('the developmental-evidence substrate cannot act', () => {
  const FORBIDDEN_IMPORTS = [
    '@anthropic-ai', 'anthropic', 'openai', 'ollama',
    'structure/maiaReader', 'ask/askReader', 'lib/ai', 'lib/maia', 'lib/oracle',
    'developmentalReader',
    'structure/proposalStore', 'structure/structureService', 'structure/authorStructure',
    'structure/reviewOperationParser', 'writersStudio/',
  ];

  it('imports no model client, no reader, no prompt, and no module that can write structure', () => {
    for (const { path, code } of modules()) {
      for (const spec of importsOf(code)) {
        for (const bad of FORBIDDEN_IMPORTS) {
          expect(`${path} :: ${spec}`).not.toContain(bad);
        }
      }
    }
  });

  it('writes to no table at all', () => {
    const WRITE = /\b(INSERT\s+INTO|UPDATE\s+[a-z_]+\s+SET|DELETE\s+FROM|TRUNCATE|ALTER\s+TABLE|CREATE\s+TABLE)\b/gi;
    for (const { path, code } of modules()) {
      const hits = [...code.matchAll(WRITE)].map((m) => m[0]);
      expect(`${path} writes: ${hits.join(', ')}`).toBe(`${path} writes: `);
    }
  });

  it('names no adoption, apply, checkpoint or restore path', () => {
    for (const { path, code } of modules()) {
      for (const forbidden of [
        'applyGesture', 'updateReviewed', 'applyReviewOperation', 'adoptProposal',
        'authorStructureFromProposal', 'planAuthoredStructure', 'restoreSectionAddressable',
        'saveSectionAddressable', 'convertExistingDraft',
      ]) {
        expect(`${path} names ${forbidden}: ${code.includes(forbidden)}`).toBe(`${path} names ${forbidden}: false`);
      }
    }
  });

  it('carries no prompt and makes no network call', () => {
    for (const { path, code } of modules()) {
      expect(`${path}: ${/\bfetch\s*\(/.test(code)}`).toBe(`${path}: false`);
      expect(`${path}: ${/system\s*prompt|messages\.create|promptContractHash|READER_VERSION/i.test(code)}`).toBe(`${path}: false`);
    }
  });

  it('defines no observation, reading, lens or phenomenon type — those are BUILD-07B/07C', () => {
    for (const { path, code } of modules()) {
      expect(`${path}: ${/\b(interface|type|class)\s+(DevelopmentalObservation|DevelopmentalReading|DevelopmentLens|Phenomenon)\b/.test(code)}`)
        .toBe(`${path}: false`);
    }
  });

  it('adds no migration — the evidence object needs no schema of its own', () => {
    /* Dated from the day BUILD-07A opened for build. Older files that happen
       to carry these words belong to other systems and are not this claim. */
    const migrations = readdirSync(join(ROOT, 'database', 'migrations'));
    expect(migrations.filter((f) => f >= '20260903' && /develop|evidence|reading|observation/i.test(f))).toEqual([]);
  });
});
