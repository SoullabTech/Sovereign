/**
 * Ask MAIA about a shared chart (founder ruling 2026-11-05): off unless the
 * astrologer turned it on; a crisis question gets the fixed safety reply and
 * MAIA is never asked; the per-link allowance is taken before MAIA is asked;
 * MAIA is told it is MAIA, not the astrologer; nothing is logged but the fact.
 */
import { NextRequest } from 'next/server';
import { query } from '@/lib/db/postgres';
import { proMemberAllowed, proPreviewEnabled } from '@/lib/astrology/proAccess';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { ASK_MAIA_SAFETY_REPLY, askMaiaSystemPrompt, plainAnswer } from '@/lib/astrology/proAskMaia';
import { POST } from '../[token]/ask/route';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), queryOne: jest.fn() }));
jest.mock('@/lib/comms/events', () => ({ emitSafetyFlagged: jest.fn(), emitSafetyAcknowledged: jest.fn() }));
jest.mock('@/lib/astrology/proAccess', () => ({ proPreviewEnabled: jest.fn(), proMemberAllowed: jest.fn() }));
jest.mock('@/lib/consciousness/LLMProvider', () => ({ getLLMProvider: jest.fn() }));

const OWNER = '11111111-1111-4111-8111-111111111111';
const sql = jest.mocked(query);
const generateSimple = jest.fn();
let ip = 0;

function sharedRow(over: Record<string, unknown> = {}) {
  return { rows: [{
    owner_member_id: OWNER, label: 'Sam Rivera', place_label: 'New York', birth_date: '1990-06-15', birth_time: '14:30:00',
    latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York', include_elemental: false,
    include_ask_maia: true, ask_maia_offered_by: 'Moon Path Astrology', ...over,
  }] } as never;
}

function ask(question: string) {
  const token = 'B'.repeat(43);
  ip += 1; // each test is its own visitor, so the per-visitor rate limit does not interfere
  return POST(new NextRequest(`http://localhost/api/shared-chart/${token}/ask`, {
    method: 'POST', body: JSON.stringify({ question }),
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.0.0.${ip}` },
  }), { params: Promise.resolve({ token }) });
}

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(proPreviewEnabled).mockReturnValue(true);
  jest.mocked(proMemberAllowed).mockResolvedValue(true);
  jest.mocked(getLLMProvider).mockReturnValue({ generateSimple } as never);
  generateSimple.mockResolvedValue({ text: 'Your Sun in Gemini…' });
});

describe('Ask MAIA on a shared chart', () => {
  it('is not there unless the astrologer turned it on', async () => {
    sql.mockResolvedValueOnce(sharedRow({ include_ask_maia: false }));
    expect((await ask('What does my Moon mean?')).status).toBe(404);
    expect(generateSimple).not.toHaveBeenCalled();
  });

  it('answers a crisis question with the safety reply, never asking MAIA or using the allowance', async () => {
    sql.mockResolvedValueOnce(sharedRow());
    const res = await ask('I want to die, does my chart say why?');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.answer).toBe(ASK_MAIA_SAFETY_REPLY);
    expect(body.answer).toContain('988');
    expect(generateSimple).not.toHaveBeenCalled();
    expect(sql).toHaveBeenCalledTimes(1); // only the link lookup; no question counted
  });

  it('stops at the per-link limit before asking MAIA', async () => {
    sql.mockResolvedValueOnce(sharedRow()).mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);
    const res = await ask('What does my Moon mean?');
    expect(res.status).toBe(429);
    expect((await res.json()).error).toBe('limit_reached');
    expect(generateSimple).not.toHaveBeenCalled();
    const [text] = sql.mock.calls[1] as [string];
    expect(text).toContain('ask_maia_questions < $2');
  });

  it('asks MAIA with this chart only, as MAIA, and logs nothing of the question', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    sql.mockResolvedValueOnce(sharedRow()).mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);
    const res = await ask('What does my Moon in Pisces mean?');
    expect(res.status).toBe(200);
    expect((await res.json()).answer).toBe('Your Sun in Gemini…');
    const call = generateSimple.mock.calls[0][0];
    expect(call.messages).toEqual([{ role: 'user', content: 'What does my Moon in Pisces mean?' }]);
    expect(call.systemPrompt).toContain('You are MAIA, an AI companion');
    expect(call.systemPrompt).toContain('not the astrologer');
    expect(call.systemPrompt).toContain('Moon Path Astrology');
    expect(call.systemPrompt).toContain('Moon: Pisces');
    expect(call.systemPrompt).not.toContain('1990-06-15');
    expect(call.systemPrompt).not.toContain('40.71');
    expect(log.mock.calls.flat().join(' ')).not.toContain('Pisces mean');
    log.mockRestore();
  });

  it('keeps to Western astrology unless the astrologer included the elemental view', () => {
    const base = { firstName: 'Sam', offeredBy: null, context: 'x' };
    expect(askMaiaSystemPrompt({ ...base, includeElemental: false })).toContain('Keep to Western astrology');
    expect(askMaiaSystemPrompt({ ...base, includeElemental: true })).toContain('Elemental Alchemy view');
  });

  // Local walk 2026-11-05: an answer began '# Moon in Pisces…' as raw markdown.
  it('shows answers as plain text', () => {
    expect(plainAnswer('# Moon in Pisces\n\nYour **Moon** feels deeply.\n- one\n* two'))
      .toBe('Moon in Pisces\n\nYour Moon feels deeply.\none\ntwo');
  });
});

