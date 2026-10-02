#!/usr/bin/env node
import assert from 'node:assert/strict';

const BASE = Object.freeze({
  work_unit: Object.freeze({
    routing: Object.freeze({ route_digest: 'route-ok' }),
    authority: Object.freeze({ provider_spend: false }),
    state: Object.freeze({ lifecycle_state: 'ROUTED' }),
  }),
  absence: Object.freeze({ consulted: false, reason: 'TRANSPORT_NOT_CONNECTED', record: null }),
  human_delivery: Object.freeze({ escalate: true, clarify: false, lowering_withheld: true }),
  transport: Object.freeze({ resolved: true, judgment_reason: 'TIMEOUT' }),
});

const candidates = Object.freeze([
  ['DC-JEV-ROUTE-MUTATION', (x) => ({ ...x, work_unit: { ...x.work_unit, routing: { route_digest: 'changed' } } })],
  ['DC-JEV-AUTHORITY-MUTATION', (x) => ({ ...x, work_unit: { ...x.work_unit, authority: { provider_spend: true } } })],
  ['DC-JEV-LIFECYCLE-MUTATION', (x) => ({ ...x, work_unit: { ...x.work_unit, state: { lifecycle_state: 'EXECUTING' } } })],
  ['DC-JEV-ABSENCE-AS-ADVICE', (x) => ({ ...x, absence: { consulted: true, reason: null, record: { advice: {} } } })],
  ['DC-JEV-TRANSPORT-ERROR-ESCAPES', (x) => ({ ...x, transport: { resolved: false, judgment_reason: null } })],
  ['DC-JEV-LOWERING-DELIVERED', (x) => ({ ...x, human_delivery: { ...x.human_delivery, depth: 0.1, modelNeeded: false } })],
]);

const falsifiers = Object.freeze({
  'DC-JEV-ROUTE-MUTATION': (x) => x.work_unit.routing.route_digest === BASE.work_unit.routing.route_digest,
  'DC-JEV-AUTHORITY-MUTATION': (x) => x.work_unit.authority.provider_spend === false,
  'DC-JEV-LIFECYCLE-MUTATION': (x) => x.work_unit.state.lifecycle_state === 'ROUTED',
  'DC-JEV-ABSENCE-AS-ADVICE': (x) => x.absence.consulted === false && x.absence.record === null,
  'DC-JEV-TRANSPORT-ERROR-ESCAPES': (x) => x.transport.resolved === true && x.transport.judgment_reason === 'TIMEOUT',
  'DC-JEV-LOWERING-DELIVERED': (x) => !('depth' in x.human_delivery) && !('modelNeeded' in x.human_delivery),
});

let killed = 0;
for (const [name, mutate] of candidates) {
  assert.equal(falsifiers[name](BASE), true, 'reference must pass ' + name);
  const survivor = falsifiers[name](mutate(BASE));
  if (survivor) {
    console.error('SURVIVED  ' + name);
    process.exitCode = 1;
  } else {
    killed += 1;
    console.log('KILL  ' + name);
  }
}
console.log('\n' + killed + '/' + candidates.length + ' named defeat candidates killed');
if (killed !== candidates.length) process.exit(1);
