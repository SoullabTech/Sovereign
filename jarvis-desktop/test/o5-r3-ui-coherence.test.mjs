import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const renderer = readFileSync(path.join(HERE, '..', 'src', 'renderer.js'), 'utf8');

describe('O5-R3 canonical status presentation coherence', () => {
  test('authoritative lifecycle state is rendered directly', () => {
    assert.match(renderer, /<b>Lifecycle:<\/b> \$\{escapeHtml\(lifecycle\.state \|\| 'UNKNOWN'\)\}/);
  });

  test('empty transition history cannot masquerade as DRAFT', () => {
    assert.doesNotMatch(renderer, /\.join\(' · '\) \|\| 'DRAFT'/);
    assert.match(renderer, /\.join\(' · '\) \|\| 'none recorded'/);
  });

  test('W2 lifecycle gestures and E1 execution authority remain visibly distinct', () => {
    assert.match(renderer, /<b>Next W2 gesture:<\/b>/);
    assert.match(renderer, /<b>Execution bridge:<\/b> governed separately below/);
    assert.match(renderer, /routing ≠ authorization ≠ execution/);
    assert.match(renderer, /Canonical provider execution · E1/);
  });

  test('evidence/source SHA and runtime execution SHA are explicitly distinct', () => {
    assert.match(renderer, /evidence source @/);
    assert.match(renderer, /runtime @/);
    assert.match(renderer, /Work Unit evidence\/source SHA:/);
    assert.match(renderer, /JARVIS runtime execution SHA:/);
    assert.doesNotMatch(renderer, /<div class=\"a-line\">Canonical SHA:/);
  });

  test('defeat candidate: the old contradictory labels are absent', () => {
    assert.doesNotMatch(renderer, /<b>Next lawful gesture:<\/b>/);
    assert.doesNotMatch(renderer, /<b>Lifecycle:<\/b> \$\{escapeHtml\(transitionTrace\)\}/);
  });
});
