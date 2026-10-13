/**
 * R1b-R2 integration wiring proof: real page code uses independently tested,
 * fail-closed selectors. Synthetic HTTP responses only, no live data.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  selectPracticeIdentity,
  selectPracticeClients,
  selectPracticeBookings,
} from '@/lib/studio/practiceHomeResponses';
import { readStudioResource, practiceHomeStanding } from '@/lib/studio/practiceHomeLoad';

const page = fs.readFileSync(path.join(process.cwd(), 'app/studio/page.tsx'), 'utf8');
const read = async <T,>(payload: unknown, select: (data: unknown) => T | null) =>
  readStudioResource<T>(
    async () => ({ ok: true, status: 200, json: async () => payload }),
    '/fiction-only', select,
  );

describe('R1b-R2 Practice Home fail-closed integration', () => {
  test('real UI wires verified whoami, clients and bookings selectors before empty-state', () => {
    expect(page).toContain("readStudioResource<Identity>(apiFetch, '/api/studio/whoami', selectPracticeIdentity)");
    expect(page).toContain("readStudioResource<ClientRow[]>(apiFetch, '/api/studio/clients', selectPracticeClients)");
    expect(page).toContain("readStudioResource<Booking[]>(apiFetch, '/api/studio/bookings?limit=20', selectPracticeBookings)");
    const failed = page.indexOf("if (practiceStanding !== 'ready')");
    const empty = page.indexOf('const isEmptyPractice');
    expect(failed).toBeGreaterThan(0);
    expect(empty).toBeGreaterThan(failed);
  });

  test('malformed successful responses do not become an empty Practice', async () => {
    const i = await read({authenticated:true,isPractitioner:false,identity:{}},selectPracticeIdentity);
    const c = await read({clients:[null]}, selectPracticeClients);
    const b = await read({bookings:[null]}, selectPracticeBookings);
    expect(i.standing).toBe('unavailable');
    expect(c.standing).toBe('unavailable');
    expect(b.standing).toBe('unavailable');
    expect(practiceHomeStanding(i,c,b)).toBe('unavailable');
  });

  test('verified, historically shaped populated data remains complete', async () => {
    const clients = [
      {id:'fiction-client-a',name:'Example Client A',lastSessionAt:'2026-09-22T12:00:00.000Z',totalSessions:5, internalNotes:'fiction only'},
      {id:'fiction-client-b',name:'Example Client B',lastSessionAt:null,totalSessions:0},
    ];
    const bookings = [
      {id:'fiction-booking-a',startAt:'2026-11-02T10:00:00.000Z',clientName:'Example Client A'},
      {id:'fiction-booking-b',startAt:'2026-11-03T10:00:00.000Z',clientName:null,serviceName:null},
    ];
    const i = await read({authenticated:true,isPractitioner:true,
      identity:{memberId:'fiction-member',practitionerId:'fiction-practitioner',name:'Example Practitioner'}
    },selectPracticeIdentity);
    const c=await read({clients},selectPracticeClients);
    const b=await read({bookings},selectPracticeBookings);
    expect(practiceHomeStanding(i,c,b)).toBe('ready');
    if(c.standing!=='ready'||b.standing!=='ready')throw Error('Valid arrays unexpectedly held');
    expect(c.value).toBe(clients);
    expect(b.value).toBe(bookings);
    expect(c.value.map(x=>x.id)).toEqual(['fiction-client-a','fiction-client-b']);
    expect(b.value.map(x=>x.id)).toEqual(['fiction-booking-a','fiction-booking-b']);
  });

  test('authenticated and practitioner flags cannot be inferred from an identity object alone', () => {
    const props={memberId:'fiction-member',practitionerId:'fiction-practitioner'};
    expect(selectPracticeIdentity({identity:props})).toBeNull();
    expect(selectPracticeIdentity({authenticated:true,isPractitioner:false,identity:props})).toBeNull();
    expect(selectPracticeIdentity({authenticated:true,isPractitioner:true,identity:props})).toBe(props);
  });
});
