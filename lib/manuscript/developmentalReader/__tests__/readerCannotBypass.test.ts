/**
 * BUILD-07B — the reader cannot bypass evidence (contract A6, F3, F15, F16, F19).
 *
 * Asserted over the actual module graph, not by comment. The census named
 * unrestricted `runStructured(messages)` as the principal bypass: any module
 * can hand the seam any prose. This gate is the answer. A model-facing reader
 * may take prose from `development/resolve` and from nowhere else; it may not
 * reach capture, live draft state, draft loaders, the database, structure-row
 * loaders, the structure reader, the Ask runtime, or a route.
 *
 * The reverse gate — evidence cannot act — lives beside the substrate
 * (development/__tests__/evidenceCannotAct.test.ts) and names this module
 * among its forbidden imports. Two one-way gates make one seam.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..', '..');
const DIR = join(ROOT, 'lib', 'manuscript', 'developmentalReader');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function modules(): { path: string; name: string; code: string }[] {
  return readdirSync(DIR)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => ({ path: join(DIR, f), name: f, code: stripComments(readFileSync(join(DIR, f), 'utf8')) }));
}

function importsOf(code: string): string[] {
  return [...code.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
}

/** What a reader module may import. Anything else is a bypass. */
const ALLOWED = [
  /^\.\/(contract|render|validate|parse|read)$/,          // siblings
  /^\.\.\/development\/(evidenceRef|readState|resolve)$/,  // the 07A vocabulary + the ONLY prose source
  /^\.\.\/development\/bind$/,                             // host validator only (checked below)
  /^\.\.\/structure\/readerProvenance$/,                   // the identity type, nothing that reads
  /^\.\.\/\.\.\/ai\/structured\/(router|types)$/,          // the seam
  /^crypto$/,
];

const FORBIDDEN_SUBSTRINGS = [
  'development/capture', 'draftSections', 'draftConcurrency', 'lib/db', '@/lib/db', 'postgres',
  'structure/maiaReader', 'structure/evidence', 'structure/interpret', 'structure/readScope',
  'structure/proposalStore', 'structure/structureService', 'structure/authorStructure',
  'structure/structureDigest', 'ask/', 'app/', 'writersStudio', 'next/', '@anthropic-ai',
  'anthropicStructuredAdapter', 'lib/maia', 'lib/oracle', 'openai', 'ollama',
  'developmentalReading',   // the reader cannot persist, classify, or reach a store (07C is downstream)
];

export function violations(code: string): string[] {
  const out: string[] = [];
  for (const spec of importsOf(code)) {
    if (!ALLOWED.some((re) => re.test(spec))) out.push(`import not allowed: ${spec}`);
    for (const bad of FORBIDDEN_SUBSTRINGS) {
      if (spec.includes(bad)) out.push(`forbidden import: ${spec}`);
    }
  }
  return out;
}

describe('the developmental reader cannot bypass evidence', () => {
  it('imports only the 07A vocabulary, development/resolve, the identity type, the seam, and its siblings', () => {
    for (const { path, code } of modules()) {
      expect(`${path}: ${violations(code).join('; ')}`).toBe(`${path}: `);
    }
  });

  it('negative control — the gate catches a capture import, a live loader, the database, and the structure reader', () => {
    for (const bad of [
      "import { captureEvidence } from '../development/capture';",
      "import { loadLiveWork } from '../development/capture';",
      "import { query } from '@/lib/db/postgres';",
      "import { createMaiaStructureReader } from '../structure/maiaReader';",
      "import { readStructureRows } from '../development/capture';",
      "import type { HeadedSection } from '../structure/evidence';",
      "import { loadFrozenReading } from '../ask/frozenReading';",
      "import { freezeAndStore } from '../developmentalReading/store';",
    ]) {
      expect(violations(bad).length).toBeGreaterThan(0);
    }
  });

  it('bindEvidence is reached only by the host loop, never by the renderer or parser', () => {
    for (const { name, code } of modules()) {
      const usesBind = importsOf(code).some((s) => s.endsWith('development/bind'));
      expect(`${name} imports bind: ${usesBind}`).toBe(`${name} imports bind: ${name === 'read.ts'}`);
    }
  });

  it('names no live Work, capture, loader, adoption or apply path (F3, F16)', () => {
    for (const { path, code } of modules()) {
      for (const forbidden of [
        'LiveDraftState', 'LiveWork', 'loadLiveWork', 'captureEvidence', 'readStructureRows',
        'loadRevisionContent', 'readDraft', 'readSections', 'manuscript_draft_sections',
        'manuscript_structure_units', 'working_draft_revisions', 'HeadedSection',
        'applyGesture', 'updateReviewed', 'applyReviewOperation', 'adoptProposal',
        'authorStructureFromProposal', 'planAuthoredStructure', 'restoreSectionAddressable',
        'saveSectionAddressable', 'convertExistingDraft',
      ]) {
        expect(`${path} names ${forbidden}: ${code.includes(forbidden)}`).toBe(`${path} names ${forbidden}: false`);
      }
    }
  });

  it('writes to no table and makes no network call except through the seam (F16)', () => {
    const WRITE = /\b(INSERT\s+INTO|UPDATE\s+[a-z_]+\s+SET|DELETE\s+FROM|TRUNCATE|ALTER\s+TABLE|CREATE\s+TABLE)\b/gi;
    for (const { path, code } of modules()) {
      expect(`${path} writes: ${[...code.matchAll(WRITE)].map((m) => m[0]).join(', ')}`).toBe(`${path} writes: `);
      expect(`${path} fetch: ${/\bfetch\s*\(/.test(code)}`).toBe(`${path} fetch: false`);
      expect(`${path} messages.create: ${/messages\.create/.test(code)}`).toBe(`${path} messages.create: false`);
    }
  });

  it('exposes no second tool and no request_sections (A4, F12)', () => {
    for (const { path, code } of modules()) {
      expect(`${path}: ${/request_sections/.test(code)}`).toBe(`${path}: false`);
    }
  });

  it('offers no client, provider, mode or seam option — no second door (F14)', () => {
    const read = modules().find((m) => m.name === 'read.ts');
    expect(read).toBeDefined();
    const opts = /export interface ReadOptions \{([\s\S]*?)\}/.exec(read!.code)?.[1] ?? '';
    for (const door of ['client', 'provider', 'mode', 'seam', 'adapter']) {
      expect(`ReadOptions has ${door}: ${new RegExp(`\\b${door}\\??:`).test(opts)}`).toBe(`ReadOptions has ${door}: false`);
    }
  });

  it('holds no module-level cache of prose or claims (F19)', () => {
    /* An EMPTY container at module level is what a cache looks like. A Set
       or Map built from a literal vocabulary (`new Set(['outcome', ...])`) is
       a constant, not state, and is allowed. */
    for (const { path, code } of modules()) {
      expect(`${path}: ${/^(const|let|var)\s+\w+\s*(:\s*[^=]+)?=\s*new\s+(Map|Set|WeakMap|WeakSet)\s*(<[^>]*>)?\s*\(\s*\)/m.test(code)}`)
        .toBe(`${path}: false`);
      expect(`${path}: ${/^(let|var)\s+\w+/m.test(code)}`).toBe(`${path}: false`);
    }
  });

  it('defines no observation, reading, phenomenon, or identity-minting type — those are BUILD-07C', () => {
    for (const { path, code } of modules()) {
      expect(`${path}: ${/\b(interface|type|class)\s+(DevelopmentalObservation|DevelopmentalReading|Phenomenon\w*)\b/.test(code)}`)
        .toBe(`${path}: false`);
      expect(`${path} uses frozenAt: ${/frozenAt\s*[:=]/.test(code)}`).toBe(`${path} uses frozenAt: false`);
    }
  });
});
