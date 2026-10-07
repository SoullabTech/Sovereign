/**
 * Test-only helper for the J1R5-WIRE candidate (JEV-INT-05).
 * Produces temp copies of jev-wire-v1.mjs: optionally with edits (defeat candidates) and optionally
 * with the response-shape gate flipped to "witnessed" so the pipeline can be exercised against a fake
 * transport. The committed module is NEVER edited and its flag stays false.
 */
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const WIRE_PATH = join(HERE, '..', 'jev-wire-v1.mjs');
const BUILDER_URL = pathToFileURL(join(HERE, '..') + '/').href;

export function makeVariant(edits = [], { witnessed = false } = {}) {
  let text = readFileSync(WIRE_PATH, 'utf8');
  const all = witnessed ? [['  witnessed: false,', '  witnessed: true,'], ...edits] : edits;
  for (const [from, to] of all) {
    const count = text.split(from).length - 1;
    if (count !== 1) throw new Error(`EDIT_NOT_UNIQUE (${count}): ${from.slice(0, 60)}`);
    text = text.replace(from, () => to);
  }
  text = text.replaceAll("from './", `from '${BUILDER_URL}`);
  const dir = mkdtempSync(join(tmpdir(), 'jev-wire-variant-'));
  const file = join(dir, 'variant.mjs');
  writeFileSync(file, text);
  return { file, url: pathToFileURL(file).href, source: text };
}
