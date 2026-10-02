import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const SafetyDelivery = require('../src/safety-delivery-state.js');

test('Kellys World safety delivery snapshot is truthful and action-oriented', () => {
  const s = SafetyDelivery.snapshot();

  assert.equal(s.live_telemetry, false);
  assert.equal(s.standing, 'REPAIR_CANDIDATE');
  assert.match(s.source, /PR #1671/);
  assert.ok(s.needs_kelly.some(x => /SAFETY_ALERT_PHONE/.test(x) && /check:safety-human-delivery/.test(x)));
  assert.ok(s.in_motion.some(x => /PR #1671/.test(x)));
  assert.ok(s.watching.some(x => /witness/i.test(x)));
  assert.ok(s.unresolved.some(x => /Twilio transport credentials are present/.test(x) && /SAFETY_ALERT_PHONE/.test(x)));
});

test('System view renders the safety delivery custody card', () => {
  const renderer = fs.readFileSync(new URL('../src/renderer.js', import.meta.url), 'utf8');
  const html = fs.readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');

  assert.match(renderer, /function renderSafetyDeliveryCard\(\)/);
  assert.match(renderer, /Needs Kelly/);
  assert.match(renderer, /In motion/);
  assert.match(renderer, /Watching/);
  assert.match(renderer, /not live telemetry/);
  assert.match(renderer, /renderSafetyDeliveryCard\(\)/);
  assert.match(html, /safety-delivery-state\.js/);
});
