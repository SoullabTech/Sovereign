import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const renderer = readFileSync(path.join(here, '..', 'src', 'renderer.js'), 'utf8');

test('Home separates decision work from genuinely live work', () => {
  assert.match(renderer, /decisionSessions = allSessions\.filter\(sess => sess\.liveness\?\.claim_state !== 'LIVE'\)/);
  assert.match(renderer, /liveSessions = allSessions\.filter\(sess => sess\.liveness\?\.claim_state === 'LIVE'\)/);
  assert.match(renderer, /<h3>Needs you/);
  assert.match(renderer, /<h3>In motion<\/h3>/);
});

test('stale work is described as a decision, not movement', () => {
  assert.match(renderer, /This work stopped reporting back and is still holding a lane\./);
  assert.match(renderer, /Needs decision/);
  assert.doesNotMatch(renderer, /STALE[^\n]{0,120}In motion/);
});

test('System leads with human meaning and hides technical machinery', () => {
  assert.match(renderer, /JARVIS carries the complexity\. You see what matters\./);
  assert.match(renderer, /Check MAIA Memory/);
  assert.match(renderer, /Check Production/);
  assert.match(renderer, /<summary>Technical details<\/summary>/);
});

test('Work and Living Spiral keep advanced machinery behind disclosure', () => {
  assert.match(renderer, /<summary>Advanced work controls<\/summary>/);
  assert.match(renderer, /<summary>Open the field map<\/summary>/);
  assert.match(renderer, /A living view of what JARVIS can see right now\./);
});
