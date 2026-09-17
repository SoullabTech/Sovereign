import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockQuery = jest.fn<any>();
const mockGenerateText = jest.fn<any>();
const mockLoadSessionData = jest.fn<any>();
const mockMember = jest.fn<any>();
const mockPractice = jest.fn<any>();
const mockCheckAccess = jest.fn<any>();
const mockSendEmail = jest.fn<any>();

jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
}));

jest.mock('@/lib/ai/modelService', () => ({
  generateText: (...args: unknown[]) => mockGenerateText(...args),
}));

jest.mock('@/lib/studio/followups/sessionDataLoader', () => ({
  loadSessionData: (...args: unknown[]) => mockLoadSessionData(...args),
}));

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (...args: unknown[]) => mockMember(...args),
}));

jest.mock('@/lib/studio/getPractitionerIdForMember', () => ({
  getPractitionerIdForMember: (...args: unknown[]) => mockPractice(...args),
}));

jest.mock('@/lib/trust/checkAccess', () => ({
  checkAccess: (...args: unknown[]) => mockCheckAccess(...args),
}));

jest.mock('@/lib/email/sendEmail', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

import { POST as generate } from '../generate/route';
import { POST as send } from '../send/route';

const SESSION_A = '00000000-0000-4000-8000-000000000001';
const SESSION_B = '00000000-0000-4000-8000-000000000002';
const CLIENT_A = '00000000-0000-4000-8000-000000000003';
const ARTIFACT_A = '00000000-0000-4000-8000-000000000004';

function request(path: string, body: Record<string, unknown>) {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const sessionData = {
  sessionId: SESSION_A,
  clientId: CLIENT_A,
  practitionerRecordId: 'practice-a',
  container: 'practitioner',
  title: null,
  startedAt: new Date('2026-09-17T00:00:00.000Z'),
  endedAt: new Date('2026-09-17T01:00:00.000Z'),
  durationMinutes: 60,
  transcript: [{ speaker: 'self', text: 'A useful session.', startMs: 0 }],
  markers: [],
  reviewableContentExists: true,
  assembledTurnCount: 0,
};

describe('session follow-up relationship binding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMember.mockResolvedValue('member-a');
    mockPractice.mockResolvedValue('practice-a');
    mockCheckAccess.mockResolvedValue({ allowed: true, aiPermitted: true });
  });

  it('RB-17 refuses a foreign Session Room record before any model call', async () => {
    mockLoadSessionData.mockImplementation(async (opts: Record<string, unknown>) =>
      opts.practitionerRecordId ? null : sessionData
    );

    const response = await generate(request('/api/studio/session-followup/generate', {
      sessionId: SESSION_B,
      clientId: CLIENT_A,
      clientName: 'Synthetic Client',
    }));

    expect(response.status).toBe(404);
    expect(mockGenerateText).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('RB-18 refuses an owned artifact paired with a different request session before delivery', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: ARTIFACT_A,
        session_id: SESSION_A,
        client_id: CLIENT_A,
        practitioner_record_id: 'practice-a',
        draft_content: {},
        sent_at: null,
      }],
    });
    mockLoadSessionData.mockResolvedValue(sessionData);
    mockSendEmail.mockResolvedValue({ success: true, id: 'message-a' });

    const response = await send(request('/api/studio/session-followup/send', {
      artifactId: ARTIFACT_A,
      sessionId: SESSION_B,
      clientId: CLIENT_A,
      recipientEmail: 'synthetic@example.test',
      recipientName: 'Synthetic Parent',
      practitionerName: 'Synthetic Practitioner',
      clientName: 'Synthetic Client',
      draft: {
        whatWeWorkedOn: 'Work',
        whatINoticed: 'Notice',
        whatMayHelpThisWeek: 'Support',
        whatToWatchFor: null,
      },
      humanEdited: true,
      consentConfirmed: true,
      sendVia: 'email',
    }));

    expect(response.status).toBe(404);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});
