import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const CONTEXT_ROUTE = fs.readFileSync(
  new URL('../../app/api/cabin/context/route.ts', import.meta.url),
  'utf8',
);

const HEALTH_ROUTE = fs.readFileSync(
  new URL('../../app/api/cabin/health/route.ts', import.meta.url),
  'utf8',
);

test('Cabin context route reads the validated runtime mount', () => {
  assert.match(CONTEXT_ROUTE, /initializeCabinContextMount/);
  assert.match(CONTEXT_ROUTE, /cabinContextSnapshot/);
  assert.match(CONTEXT_ROUTE, /cabinStore/);
  assert.match(CONTEXT_ROUTE, /resolveSession/);
  assert.match(CONTEXT_ROUTE, /cabin_session_required/);
  assert.doesNotMatch(CONTEXT_ROUTE, /getMaiaResponse/);
  assert.doesNotMatch(CONTEXT_ROUTE, /fetch\(/);
});

test('Cabin health reports context mount state without becoming a cognition route', () => {
  assert.match(HEALTH_ROUTE, /initializeCabinContextMount/);
  assert.match(HEALTH_ROUTE, /context\.state/);
  assert.doesNotMatch(HEALTH_ROUTE, /getMaiaResponse/);
  assert.doesNotMatch(HEALTH_ROUTE, /cabinContextSnapshot/);
});
