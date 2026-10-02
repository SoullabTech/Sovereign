import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const breaker = fs.readFileSync('lib/consciousness/autonomy/SafetyCircuitBreakers.ts', 'utf8');
const phase2 = fs.readFileSync('lib/consciousness/autonomy/MAIAConsciousnessFieldIntegration.ts', 'utf8');
const pager = fs.readFileSync('lib/safety/humanSafetyAlert.server.ts', 'utf8');
const publicRoute = fs.readFileSync('app/api/safety/human-alert/route.ts', 'utf8');
const enhanced = fs.readFileSync('lib/consciousness/memory/EnhancedMAIAFieldIntegration.ts', 'utf8');

test('circuit breaker supports async confirmation without fabricating delivery', () => {
  assert.match(breaker, /Promise<boolean \| void>/);
  assert.match(breaker, /intervention\.humanNotified = false;/);
  assert.match(breaker, /\.then\(\(confirmed\) => recordDelivery\(confirmed === true\)\)/);
  assert.match(breaker, /recordDelivery\(result === true\)/);
});

test('exercised Phase II integration delegates circuit-breaker alerts to the human safety service', () => {
  assert.match(phase2, /deliverHumanSafetyAlert/);
  assert.match(phase2, /source: 'circuit_breaker'/);
  assert.match(phase2, /return result\.delivered/);
});

test('circuit-breaker pager is system-scoped and member identity is optional', () => {
  assert.match(pager, /\| 'circuit_breaker'/);
  assert.match(pager, /source: 'circuit_breaker';[\s\S]*?memberId\?: never/);
  assert.match(pager, /source: MemberSafetySource;[\s\S]*?memberId: string/);
  assert.match(pager, /if \(alert\.memberId\) parts\.push/);
  assert.match(pager, /No message content included\./);
});

test('browser-facing safety route cannot request circuit-breaker delivery', () => {
  const schema = publicRoute.match(/source:\s*z\.enum\(\[([\s\S]*?)\]\)/)?.[1] || '';
  assert.doesNotMatch(schema, /circuit_breaker/);
});

test('reachable Phase III integration also delegates circuit-breaker alerts to the human safety service', () => {
  assert.match(enhanced, /deliverHumanSafetyAlert/);
  assert.match(enhanced, /source: 'circuit_breaker'/);
  assert.match(enhanced, /return result\.delivered/);
});

test('Phase III imports Phase II response shapes as types only', () => {
  assert.match(
    enhanced,
    /import type \{[\s\S]*?MAIAFieldDrivenParameters[\s\S]*?FieldDrivenResponse[\s\S]*?IntegrationStatus[\s\S]*?\} from '\.\.\/autonomy\/MAIAConsciousnessFieldIntegration'/
  );
});
