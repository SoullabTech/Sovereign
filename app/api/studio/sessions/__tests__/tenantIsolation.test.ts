/**
 * Synthetic fixtures; no member data, external mail, calendar, or production DB.
 * A fabricated client UUID must be refused before notification/outbound work.
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
const mockQuery = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockActor = jest.fn<(...args: unknown[]) => Promise<string | null>>();
const mockPractitioner = jest.fn<(...args: unknown[]) => Promise<string | null>>();
const mockNotification = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockCalendar = jest.fn<(...args: unknown[]) => Promise<any>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true, default: { query: (...a: unknown[]) => mockQuery(...a) },
}));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (...a: unknown[]) => mockActor(...a),
}));
jest.mock('@/lib/studio/getPractitionerIdForMember', () => ({
  getPractitionerIdForMember: (...a: unknown[]) => mockPractitioner(...a),
}));
jest.mock('@/lib/team/sessionTeamScope', () => ({
  resolveSessionTeamId: jest.fn(async () => null),
}));
jest.mock('@/lib/notifications/SessionNotificationService', () => ({
  sendBookingConfirmation: (...a: unknown[]) => mockNotification(...a),
}));
jest.mock('@/lib/calendar/syncSessionToGoogle', () => ({
  syncNewSessionToGoogle: (...a: unknown[]) => mockCalendar(...a),
  syncUpdatedSessionToGoogle: jest.fn(), syncCancelledSessionToGoogle: jest.fn(),
}));
import { POST } from '../route';
const member = '11111111-1111-4111-8111-111111111111';
const practitioner = '22222222-2222-4222-8222-222222222222';
const client = '33333333-3333-4333-8333-333333333333';
const service = '44444444-4444-4444-8444-444444444444';
const payload = (extra: Record<string, unknown> = {}) => ({
  client_id: client, scheduled_at: '2026-11-03T15:00:00Z',
  duration_minutes: 60, location_type: 'video', ...extra,
});
const req = (body: unknown) => new NextRequest('https://soullab.life/api/studio/sessions', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});
beforeEach(() => {
  mockQuery.mockReset(); mockActor.mockReset(); mockPractitioner.mockReset();
  mockNotification.mockReset(); mockCalendar.mockReset();
  mockActor.mockResolvedValue(member);
  mockPractitioner.mockResolvedValue(practitioner);
  mockNotification.mockResolvedValue({ anySuccess: false });
  mockCalendar.mockResolvedValue({ googleEventId: null, success: true });
  mockQuery.mockImplementation(async (sql) => {
    if (String(sql).includes('studio_settings')) return { rows: [{ value: 'generic' }] };
    return { rows: [] };
  });
});

describe('G1: Studio sessions are practitioner/client owned', () => {
  it('no verified member cannot query or create another practitioner session', async () => {
    mockActor.mockResolvedValue(null);
    const res = await POST(req(payload()));
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockNotification).not.toHaveBeenCalled();
    expect(mockCalendar).not.toHaveBeenCalled();
  });
  it('refuses a foreign client before contact lookup, notification and calendar', async () => {
    const res = await POST(req(payload()));
    expect(res.status).toBe(404);
    const sql = mockQuery.mock.calls.map(c => String(c[0]));
    expect(sql.filter(s => s.includes('INSERT INTO sessions'))).toHaveLength(1);
    expect(sql.find(s => s.includes('INSERT INTO sessions'))).toContain('owned_client.practitioner_id = $1');
    expect(sql.find(s => s.includes('INSERT INTO sessions'))).toContain('FROM practitioner_clients owned_client');
    expect(sql.some(s => s.includes('SELECT name, email, phone'))).toBe(false);
    expect(mockNotification).not.toHaveBeenCalled();
    expect(mockCalendar).not.toHaveBeenCalled();
  });
  it('also requires an optional service to belong to the same practice', async () => {
    const res = await POST(req(payload({ service_id: service })));
    expect(res.status).toBe(404);
    const sql = mockQuery.mock.calls.map(c => String(c[0]));
    expect(sql.find(s => s.includes('INSERT INTO sessions'))).toContain('owned_service.practitioner_id = $1');
    expect(mockNotification).not.toHaveBeenCalled();
  });
  it('refuses malformed client ID before any database or outbound activity', async () => {
    const res = await POST(req(payload({ client_id: 'other-practice' })));
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockNotification).not.toHaveBeenCalled();
  });
  it('only loads owned contact details after a successful insert', async () => {
    mockQuery.mockImplementation(async (sql) => {
      const s=String(sql);
      if (s.includes('studio_settings')) return { rows: [{ value: 'generic' }] };
      if (s.includes('INSERT INTO sessions')) return { rows: [{
        id: '55555555-5555-4555-8555-555555555555',
        client_id: client, practitioner_id: practitioner,
      }] };
      if (s.includes('SELECT name, email, phone')) return { rows: [{
        name: 'Synthetic client', email: 'fixture@example.invalid',
      }] };
      if (s.includes('SELECT name FROM practitioners')) return { rows: [{ name: 'Synthetic pro' }] };
      return { rows: [] };
    });
    const res=await POST(req(payload()));
    expect(res.status).toBe(200);
    const contactCall=mockQuery.mock.calls.find(c=>String(c[0]).includes('SELECT name, email, phone'));
    expect(contactCall?.[1]).toEqual([client,practitioner]);
  });
});
