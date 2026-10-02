import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

function loadLibrary() {
  const raw = fs.readFileSync(new URL('../src/field-library-data.js', import.meta.url), 'utf8');
  return JSON.parse(raw.replace(/^window\.KELLY_FIELD_LIBRARY = /, '').replace(/;\s*$/, ''));
}

test('R14 exposes only structurally warranted dormant recovery candidates', () => {
  const lib = loadLibrary();
  assert.equal(lib.counts.recovery, lib.recoveryCandidates.length);
  assert.ok(lib.recoveryCandidates.length > 0);
  for (const item of lib.recoveryCandidates) {
    assert.equal(item.standing, 'RECOVERY_CANDIDATE_UNREVIEWED');
    assert.equal(item.candidate_law, 'DORMANCY_DOES_NOT_CREATE_IMPORTANCE');
    assert.ok(item.hours_dormant >= 36);
    assert.ok(Number.isInteger(item.evidence_line) && item.evidence_line > 0);
    assert.ok(item.evidence);
    assert.ok(['EXACT_NEXT_HEADING','OPEN_HEADING','FOUNDER_PENDING','STATE_OPEN'].includes(item.signal));
    assert.doesNotMatch(item.path, /CLOSURE|SUPERSESSION|_CLOSED_|CANONICALIZATION_CLOSURE/i);
  }
});

test('R14 keeps known unfinished lineages visible and excludes a negated owed statement', () => {
  const lib = loadLibrary();
  const paths = lib.recoveryCandidates.map(x => x.path);
  assert.ok(paths.includes('docs/programme/MAIA-UNIFIED-COGNITION-CONVERGENCE-01.md'));
  assert.ok(paths.includes('docs/programme/J11_CANONICAL_COROLLARY_FOUNDER_DECISION_DOCKET_2026-09-17.md'));
  assert.ok(!paths.includes('docs/programme/WS2-06A_RUNTIME_WITNESS_2026-09-02.md'));
});

test('heading extraction is live after the regex repair', () => {
  const lib = loadLibrary();
  const item = lib.laneGroups.flatMap(g => g.items)
    .find(x => x.path === 'docs/programme/JARVIS-LIVING-FIELD-GROKKER-01_CHARTER_2026-09-28.md');
  assert.ok(item);
  assert.ok(item.headings.includes('Mandatory lane preamble'));
  assert.ok(item.headings.includes('Founding laws'));
});

test('R14 recovery action re-enters Trace without upgrading standing', () => {
  const src = fs.readFileSync(new URL('../src/renderer.js', import.meta.url), 'utf8');
  assert.match(src, /data-recovery-trace/);
  const start = src.indexOf("document.querySelectorAll('[data-recovery-trace]')");
  const end = src.indexOf("document.getElementById('governed-work-refresh')", start);
  assert.ok(start >= 0 && end > start);
  const handler = src.slice(start, end);
  assert.match(handler, /GrokkerLibraryQuery\.trace/);
  assert.doesNotMatch(handler, /workUnitAction|submitTask|create|authorize|execute/);
});
