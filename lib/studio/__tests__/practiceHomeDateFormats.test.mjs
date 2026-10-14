/**
 * R2a adversarial timestamp control — synthetic only, no member data.
 * SQL TIMESTAMPTZ endpoints JSON-serialize machine timestamps; Date.parse()
 * alone also accepts malformed abbreviations ('0', '1') and impossible dates.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  selectPracticeClients,
  selectPracticeBookings,
} from '../practiceHomeResponses.ts';
import { readStudioResource } from '../practiceHomeLoad.ts';
const ok = (body) => async () => ({ ok:true, status:200, json:async()=>body });
const client = (date) => ({ id:'fiction-client', name:'Example only',lastSessionAt:date });
const booking = (date) => ({ id:'fiction-booking', startAt:date });
const read = (body,select) => readStudioResource(ok(body), '/fiction-only',select);

test('R2a-NEG — non-ISO or impossible booking dates are unavailable, not ready',async()=>{
 for(const invalid of [
  '0','1','2026-10-20','2026-10-20T15:30:00',
  '2026-02-30T10:00:00.000Z',
  '2026-02-29T10:00:00Z',
  '2026-13-20T10:00:00.000Z',
  '2026-10-20T25:30:00Z',
 ]){
  const r=await read({bookings:[booking(invalid)]},selectPracticeBookings);
  assert.equal(r.standing,'unavailable',invalid);
 }
});
test('R2a-NEG — non-ISO or impossible client session dates are unavailable',async()=>{
 for(const invalid of ['0','1','2026-02-30T10:00:00.000Z','2026-10-20T10:00:00']){
  const r=await read({clients:[client(invalid)]},selectPracticeClients);
  assert.equal(r.standing,'unavailable',invalid);
 }
});
test('R2a-POS — genuine ISO UTC and offset timestamps keep all booking records intact',async()=>{
 const rows=[
  booking('2026-10-20T15:30:00.000Z'),
  booking('2026-10-20T15:30:00Z'),
  booking('2026-10-20T11:30:00-04:00'),
  booking('2028-02-29T10:00:00.000Z'),
 ];
 const r=await read({bookings:rows},selectPracticeBookings);
 assert.equal(r.standing,'ready');
 assert.strictEqual(r.value,rows);
 assert.deepEqual(r.value,rows);
});
test('R2a-POS — nullable client session dates and leap day remain valid',async()=>{
 const rows=[
  {id:'fiction-client-1',name:'First',lastSessionAt:null},
  {id:'fiction-client-2',name:'Second',lastSessionAt:undefined},
  {id:'fiction-client-3',name:'Third',lastSessionAt:'2028-02-29T10:00:00.000Z'},
 ];
 const r=await read({clients:rows},selectPracticeClients);
 assert.equal(r.standing,'ready');
 assert.strictEqual(r.value,rows);
});
