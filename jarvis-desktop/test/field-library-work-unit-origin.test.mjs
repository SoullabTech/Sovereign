import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const O = require('../src/field-library-work-unit-origin.js');

function grokkerWorkUnit() {
  return {
    identity: {
      task_shape: 'EVIDENCE_SYNTHESIS',
      objective: O.PREFIX + 'What have we established about context release?',
    },
    scope: {
      evidence_selectors: [
        {ref:'docs/programme/A.md',selector:{type:'lines',start:10,end:14}},
        {ref:'docs/programme/B.md',selector:{type:'lines',start:31,end:39}},
      ],
    },
  };
}

test('R12 derives Grokker re-entry only from canonical Work Unit facts', () => {
  assert.deepEqual(O.project(grokkerWorkUnit()), {
    origin_type: 'GROKKER_FIELD_LIBRARY',
    query: 'What have we established about context release?',
    source_ranges: [
      'docs/programme/A.md:10-14',
      'docs/programme/B.md:31-39',
    ],
    projection_law: 'CANONICAL_WORK_UNIT_FACTS_ARE_THE_RETURN_ADDRESS',
  });
});

test('ordinary evidence synthesis is not silently labeled Grokker', () => {
  const wu = grokkerWorkUnit();
  wu.identity.objective = 'Compare two implementation options.';
  assert.equal(O.project(wu), null);
});

test('malformed selectors cannot become a false source-range return address', () => {
  const wu = grokkerWorkUnit();
  wu.scope.evidence_selectors.push({
    ref:'docs/programme/C.md',
    selector:{type:'lines',start:20,end:4},
  });
  const out = O.project(wu);
  assert.deepEqual(out.source_ranges, [
    'docs/programme/A.md:10-14',
    'docs/programme/B.md:31-39',
  ]);
});

test('Work return re-traces current Library and clears stale packet/synthesis state', () => {
  const src = fs.readFileSync(new URL('../src/renderer.js', import.meta.url), 'utf8');
  const start = src.indexOf("document.getElementById('grokker-return-inquiry')?.addEventListener");
  const end = src.indexOf("document.getElementById('wu-refresh')?.addEventListener", start);
  assert.ok(start >= 0 && end > start);
  const handler = src.slice(start, end);
  assert.match(handler, /GrokkerLibraryQuery\.trace/);
  assert.match(handler, /libraryState\.sourcePacket = null/);
  assert.match(handler, /libraryState\.synthesis = null/);
  assert.match(handler, /setView\('library'\)/);
  assert.doesNotMatch(handler, /buildSourcePacket/);
});
