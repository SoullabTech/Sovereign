import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Q = require('../src/field-library-query.js');

function loadLibrary() {
  const raw = fs.readFileSync(new URL('../src/field-library-data.js', import.meta.url), 'utf8');
  return JSON.parse(raw.replace(/^window\.KELLY_FIELD_LIBRARY = /, '').replace(/;\s*$/, ''));
}

test('ordinary question words do not dominate Grokker Trace', () => {
  assert.deepEqual(Q.tokens('What have we established about context release?'), ['context', 'release']);
});

test('title evidence ranks above incidental excerpt evidence', () => {
  const lib = {
    conceptGroups: [{ title: 'Memory', items: [{ title: 'Context release' }] }],
    laneGroups: [{ title: 'Other', items: [{ title: 'Unrelated', excerpt: 'context release appears incidentally' }] }],
  };
  const rows = Q.trace(lib, 'context release');
  assert.equal(rows[0].item.title, 'Context release');
  assert.equal(rows[0].kind, 'field');
});
test('actual corpus trace can recover context-release work', () => {
  const rows = Q.trace(loadLibrary(), 'context release');
  assert.ok(rows.length > 0);
  assert.ok(rows.some(r => /context|release/i.test(
    [r.item.title, r.item.excerpt, ...(r.item.headings || [])].join(' ')
  )));
});

test('trace preserves source paths rather than inventing provenance', () => {
  const rows = Q.trace(loadLibrary(), "Writer's Studio");
  const source = rows.find(r => r.kind === 'record');
  assert.ok(source);
  assert.match(source.item.path, /^docs\/programme\//);
});
