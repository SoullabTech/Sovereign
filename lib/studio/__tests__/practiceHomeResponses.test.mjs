/**
 * PRO-STUDIO-01-A-R1b-R2 — source-bound response-shape regressions.
 * All identifiers and records are FICTIONAL. No server/database/model calls.
 * Preserve every valid client/booking exactly; on one malformed item fail the
 * whole HTTP 200 response as unavailable instead of silently losing records.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  selectPracticeIdentity,
  selectPracticeClients,
  selectPracticeBookings,
} from '../practiceHomeResponses.ts';
import { readStudioResource, practiceHomeStanding } from '../practiceHomeLoad.ts';

const http = (status, body) => async () => ({
  ok: status >= 200 && status < 300, status, json: async () => body,
});
const identity = {
  memberId: 'fiction-member-1',
  practitionerId: 'fiction-practitioner-1',
  name: 'Example Clinician',
  portalType: 'generalist',
  studioMode: 'practice',
};
const client = {
  id: 'fiction-client-1',
  name: 'Example Client',
  status: 'active',
  lastSessionAt: '2026-09-12T10:00:00.000Z',
  nextSessionAt: null,
  totalSessions: 3,
  tags: ['fiction'],
};
const otherClient = {
  id: 'fiction-client-2',
  name: 'Second Example',
  lastSessionAt: null,
  nextSessionAt: undefined,
};
const booking = {
  id: 'fiction-booking-1',
  startAt: '2026-10-20T15:30:00.000Z',
  clientName: 'Example Client',
  serviceName: 'Practice Session',
  status: 'scheduled',
  priceCents: 0,
};
const otherBooking = {
  id: 'fiction-booking-2',
  startAt: '2026-10-21T15:30:00.000Z',
  clientName: null,
  serviceName: null,
};
const whoami = { authenticated: true, isPractitioner: true, identity };
const read = (path, data, selector) =>
  readStudioResource(http(200, data), path, selector);

test('R2-I1 — real whoami response shape is accepted unchanged (fictional identity)', async () => {
  const result = await read('/api/studio/whoami', whoami, selectPracticeIdentity);
  assert.equal(result.standing, 'ready');
  assert.strictEqual(result.value, identity);
});
test('R2-I2 — explicit non-practitioner and empty identity never prove Practice', async () => {
  for (const payload of [
    { authenticated: true, isPractitioner: false, identity: {} },
    { authenticated: true, isPractitioner: true, identity: {} },
    { authenticated: false, isPractitioner: true, identity },
    { authenticated: true, identity },
    { authenticated: true, isPractitioner: true, identity: { memberId: 'fiction-member-1' } },
    { authenticated: true, isPractitioner: true, identity: { ...identity, practitionerId: '  ' } },
    { authenticated: true, isPractitioner: true, identity: { ...identity, memberId: '' } },
    { authenticated: true, isPractitioner: true, identity: { ...identity, name: {} } },
  ]) {
    const r = await read('/api/studio/whoami', payload, selectPracticeIdentity);
    assert.equal(r.standing, 'unavailable', JSON.stringify(payload));
    assert.equal(practiceHomeStanding(r, {standing:'ready',value:[]},{standing:'ready',value:[]}), 'unavailable');
  }
});
test('R2-C1 — null, primitive or malformed entry holds entire client response', async () => {
  for (const invalid of [
    null, undefined, '', 42, [], {},
    { name: 'No ID' },
    { id: '', name: 'Blank ID' },
    { id: 'fiction-client-bad', name: null },
    { id: 'fiction-client-bad', name: 'Record', lastSessionAt: 'not-a-date' },
    { id: 'fiction-client-bad', name: 'Record', nextSessionAt: 42 },
    { id: 'fiction-client-bad', name: 'Record', totalSessions: 'one' },
    { id: 'fiction-client-bad', name: 'Record', totalSessions: -1 },
  ]) {
    const source = [client, invalid, otherClient];
    const r = await read('/api/studio/clients', {clients:source}, selectPracticeClients);
    assert.equal(r.standing, 'unavailable', String(invalid));
    assert.equal(source.length, 3, 'Do not filter or mutate source');
  }
});
test('R2-B1 — null, primitive, missing identifier or invalid start holds bookings', async () => {
  for (const invalid of [
    null, undefined, '', 9, [], {},
    { startAt:'2026-10-20T15:30:00.000Z' },
    { id:'fiction-booking-bad', startAt:null },
    { id:'fiction-booking-bad', startAt:'invalid date' },
    { id:'fiction-booking-bad', startAt:'2026-10-20T15:30:00.000Z',clientName:{} },
    { id:'fiction-booking-bad', startAt:'2026-10-20T15:30:00.000Z',serviceName:42 },
  ]) {
    const source=[booking,invalid,otherBooking];
    const r=await read('/api/studio/bookings',{bookings:source},selectPracticeBookings);
    assert.equal(r.standing,'unavailable',String(invalid));
    assert.equal(source.length,3);
  }
});
test('R2-C2 — true zero clients and true zero bookings remain verified empty',async()=>{
  const c=await read('/api/studio/clients',{clients:[]},selectPracticeClients);
  const b=await read('/api/studio/bookings',{bookings:[]},selectPracticeBookings);
  const i=await read('/api/studio/whoami',whoami,selectPracticeIdentity);
  assert.equal(c.standing,'ready');assert.deepEqual(c.value,[]);
  assert.equal(b.standing,'ready');assert.deepEqual(b.value,[]);
  assert.equal(practiceHomeStanding(i,c,b),'ready');
});
test('R2-P1 — populated existing practice retains complete arrays, order, fields, and references',async()=>{
  const clients=[client,otherClient];
  const bookings=[otherBooking,booking]; // deliberately non-sorted, must preserve as returned
  const copyClients=structuredClone(clients),copyBookings=structuredClone(bookings);
  const c=await read('/api/studio/clients',{clients},selectPracticeClients);
  const b=await read('/api/studio/bookings',{bookings},selectPracticeBookings);
  const i=await read('/api/studio/whoami',whoami,selectPracticeIdentity);
  assert.equal(c.standing,'ready');assert.equal(b.standing,'ready');
  assert.strictEqual(c.value,clients,'Do not filter clients');
  assert.strictEqual(b.value,bookings,'Do not filter bookings');
  assert.deepEqual(c.value,copyClients);
  assert.deepEqual(b.value,copyBookings);
  assert.strictEqual(c.value[0],client);
  assert.strictEqual(b.value[1],booking);
  assert.equal(practiceHomeStanding(i,c,b),'ready');
});
test('R2-E1 — invalid tail never becomes a smaller, allegedly true practice',async()=>{
  const c=await read('/api/studio/clients',{clients:[client,null]},selectPracticeClients);
  const b=await read('/api/studio/bookings',{bookings:[booking,null]},selectPracticeBookings);
  assert.equal(c.standing,'unavailable');
  assert.equal(b.standing,'unavailable');
});
test('R2-A1 — 401, 403, 503 remain distinct under new selectors',async()=>{
  for(const [status,standing] of [[401,'signed-out'],[403,'forbidden'],[503,'unavailable']]){
    const r=await readStudioResource(http(status,{clients:[]}),'/api/studio/clients',selectPracticeClients);
    assert.equal(r.standing,standing);
  }
});
test('R2-P2 — rejected malformed responses never log member or client details',async()=>{
  const old=console.log;const output=[];console.log=(...args)=>output.push(args.join(' '));
  try{
    const r=await read('/api/studio/clients',{clients:[{id:'fiction-private-member',name:{secret:'fiction'}}]},selectPracticeClients);
    assert.equal(r.standing,'unavailable');
  }finally{console.log=old;}
  assert.deepEqual(output,[]);
});
