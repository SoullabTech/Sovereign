/**
 * Static checks on how the P1 persona reports what it pressed (F6). The walk itself needs a browser and a stack, so what it does is
 * exercised by the capped walk and fixture-check.mjs; the pure counting is tested in classify.test.mjs. This file pins the two things
 * that are only about the persona's own wording and wiring, so that the number it prints cannot drift back to "controls tried".
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Ledger } from './ledger.mjs';
import { plan, MAX_DEPTH } from '../personas/p1-first-timer.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = fs.readFileSync(path.join(here, '..', 'personas', 'p1-first-timer.mjs'), 'utf8');

test('the persona counts what it pressed from the observations (a click delivered), never from how many controls were tried', () => {
  assert.doesNotMatch(SRC, /String\(tried\.length\)/, 'the report\'s "Controls pressed" is the number of controls TRIED again');
  assert.equal((SRC.match(/tallyPresses\(tried\.map\(x => x\.obs\), skippedByCap\)/g) || []).length, 2, 'both the P1-06 evidence and the header lines must come from tallyPresses over the observations and the cap');
  assert.match(SRC, /describeTally\(t, \{ maxDepth: MAX_DEPTH/);
  assert.match(SRC, /L\.meta\['Controls found, not pressed'\]/, 'the controls that were found and not pressed are reported separately');
  assert.match(SRC, /L\.meta\['Revealed by a press, never given a row'\]/, 'the controls a press revealed that never got a row are reported separately');
});

test('the planned P1-06 row does not claim that every control was pressed', () => {
  const L = new Ledger({ journey: 't', persona: 'p' });
  plan(L);
  const row = L.rows.find(r => r.id === 'P1-06');
  assert.ok(row, 'P1-06 is planned');
  assert.doesNotMatch(row.title, /\b(was|were|each|every)\b[^.]*\bpressed and\b|\bevery control found was pressed\b/i, `P1-06 says: ${row.title}`);
  assert.match(row.title, /accounted for|not pressed|why it was not/i, 'its title says what it does check: that each control is accounted for');
});

test('the persona\'s depth limit is the one the README states (MAX_DEPTH is exported, and used for the expansion rule)', () => {
  assert.ok(Number.isInteger(MAX_DEPTH));
  assert.match(SRC, /nextDepth <= MAX_DEPTH/);
});
