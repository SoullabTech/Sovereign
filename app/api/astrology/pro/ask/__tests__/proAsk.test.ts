/**
 * Ask MAIA from inside Pro (founder request 2026-11-07). MAIA gets the
 * section's calculated facts only — never a name or birth details; a crisis
 * question gets the fixed reply without asking MAIA; nothing of the question
 * is logged.
 */
import { NextRequest } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { loadSubjectBirth } from '@/lib/astrology/proSubjectBirth';
import { PRO_ASK_SAFETY_REPLY } from '@/lib/astrology/proAskMaiaSections';
import { POST } from '../route';

jest.mock('@/lib/consciousness/LLMProvider', () => ({ getLLMProvider: jest.fn() }));
jest.mock('@/lib/astrology/proSubjectBirth', () => ({ loadSubjectBirth: jest.fn() }));
jest.mock('@/lib/astrology/proRouteAccess', () => {
  const { NextResponse } = jest.requireActual('next/server');
  const headers = { 'Cache-Control': 'private, no-store' };
  return {
    PRO_RESPONSE_HEADERS: headers,
    proError: (status: number, error: string) => NextResponse.json({ error }, { status, headers }),
    // A different member per test, so the per-member rate limit does not carry over.
    resolveProOwner: jest.fn(async () => ({ ok: true, memberId: `member-${(globalThis as any).__testMember}` })),
    proOwnerStillCurrent: jest.fn(async () => true),
  };
});
jest.mock('@/lib/comms/SafetyService', () => ({
  analyzeSafetyCues: (text: string) => ({ severity: /want to die|kill myself/i.test(text) ? 'crisis' : null }),
}));

const generateSimple = jest.fn();
const births: Record<string, unknown> = {
  first: { date: '1985-03-20', time: '09:40', location: { lat: 40.71, lng: -74.01, timezone: 'America/New_York' } },
  second: { date: '2010-11-02', time: '16:05', location: { lat: 34.05, lng: -118.24, timezone: 'America/Los_Angeles' } },
};

function ask(body: Record<string, unknown>) {
  return POST(new NextRequest('http://localhost/api/astrology/pro/ask', {
    method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' },
  }));
}

let testMember = 0;
beforeEach(() => {
  (globalThis as any).__testMember = ++testMember;
  generateSimple.mockReset().mockResolvedValue({ text: 'The composite Sun…' });
  jest.mocked(getLLMProvider).mockReturnValue({ generateSimple } as never);
  jest.mocked(loadSubjectBirth).mockReset().mockImplementation(async (_m, subject) =>
    births[subject as string] ? { ok: true, birth: births[subject as string] as never, revision: 'saved:' + subject } : { ok: false, status: 404, error: 'saved_chart_not_found' });
});

describe('Ask MAIA inside Pro', () => {
  it('asks about the composite from both charts\' facts, with no names or birth details', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const res = await ask({ section: 'composite', subject: 'first', other: 'second', question: 'What is this bond about?' });
    expect(res.status).toBe(200);
    expect((await res.json()).answer).toBe('The composite Sun…');
    const call = generateSimple.mock.calls[0][0];
    expect(call.messages).toEqual([{ role: 'user', content: 'What is this bond about?' }]);
    expect(call.forceClaude).toBe(true);
    expect(call.systemPrompt).toContain('Composite chart (midpoints');
    expect(call.systemPrompt).toContain('Sun:');
    for (const secret of ['1985', '2010', '09:40', '16:05', '40.71', '-118.24', 'America/Los_Angeles']) {
      expect(call.systemPrompt).not.toContain(secret);
    }
    expect(log.mock.calls.flat().join(' ')).not.toContain('bond');
    log.mockRestore();
  });

  it('reads the contacts between two charts for the biwheel', async () => {
    await ask({ section: 'biwheel', subject: 'first', other: 'second', question: 'How do they meet?' });
    const prompt = generateSimple.mock.calls[0][0].systemPrompt as string;
    expect(prompt).toContain('First chart:');
    expect(prompt).toContain('Second chart:');
    expect(prompt).toContain('Contacts between the charts');
  });

  it('adds transits to the natal reading only for a chosen date', async () => {
    await ask({ section: 'natal', subject: 'first', question: 'What stands out?' });
    await ask({ section: 'natal', subject: 'first', at: '2026-06-21T12:00:00', question: 'What was happening then?' });
    const [plain, dated] = generateSimple.mock.calls.map((c) => c[0].systemPrompt as string);
    expect(plain).not.toContain('Transits on');
    expect(dated).toContain('Transits on 2026-06-21');
  });

  it('writes a deep reading from the natal chart, Four Pillars, Maya and a chosen date, with life notes as context only', async () => {
    await ask({
      section: 'deep', subject: 'first', at: '2026-06-21T12:00:00', include: ['four-pillars', 'maya'], direction: 'forward',
      lifeContext: 'A teacher who loved the sea.', question: 'Write a full reading.',
    });
    const call = generateSimple.mock.calls[0][0];
    expect(call.tier).toBe('deep');
    expect(call.forceClaude).toBe(true);
    expect(call.maxTokens).toBeGreaterThan(600);
    const prompt = call.systemPrompt as string;
    for (const part of ['Natal chart', 'Transits on 2026-06-21', 'Chinese Four Pillars', 'Birth, traditional Maya count', 'Chosen date, traditional Maya count',
      'WHAT THE ASTROLOGER KNOWS OF THEIR LIFE', 'A teacher who loved the sea.', 'Never say or imply that the chart caused']) {
      expect(prompt).toContain(part);
    }
    for (const secret of ['1985', '09:40', '40.71']) expect(prompt).not.toContain(secret);
  });

  it('does not refuse a deep reading because the life notes speak of a death, but opens with where to turn', async () => {
    const res = await ask({ section: 'deep', subject: 'first', lifeContext: 'He died of an overdose last year.', question: 'Write a full reading.' });
    const { answer } = await res.json();
    expect(generateSimple).toHaveBeenCalledTimes(1);
    expect(answer.startsWith('If anyone in this story is at risk right now')).toBe(true);
    expect(answer).toContain('The composite Sun…');
  });

  it('keeps life notes to the deep reading, and refuses unknown parts', async () => {
    expect((await ask({ section: 'natal', subject: 'first', lifeContext: 'x', question: 'x' })).status).toBe(400);
    expect((await ask({ section: 'deep', subject: 'first', include: ['tarot'], question: 'x' })).status).toBe(400);
    expect((await ask({ section: 'deep', subject: 'first', lifeContext: 'x'.repeat(3001), question: 'x' })).status).toBe(400);
  });

  it('reads progressions and solar arcs at a date, and over a period when given', async () => {
    await ask({ section: 'progressed', subject: 'first', at: '2026-06-21T12:00:00', question: 'What is moving?' });
    await ask({ section: 'progressed', subject: 'first', at: '2026-06-21T12:00:00', from: '2024-06-21T12:00:00', question: 'And over two years?' });
    const [single, period] = generateSimple.mock.calls.map((c) => c[0].systemPrompt as string);
    expect(single).toContain('Secondary progressions for 2026-06-21');
    expect(single).toContain('Solar arc');
    expect(single).toContain('progressed-chart house');
    expect(single).not.toContain('from 2024-06');
    expect(period).toContain('from 2024-06 to 2026-06');
  }, 30_000);

  it('refuses a period that runs backwards or longer than ten years', async () => {
    expect((await ask({ section: 'progressed', subject: 'first', at: '2026-01-01', from: '2027-01-01', question: 'x' })).status).toBe(400);
    expect((await ask({ section: 'progressed', subject: 'first', at: '2026-01-01', from: '2010-01-01', question: 'x' })).status).toBe(400);
  });

  it('gives the Four Pillars and the chosen luck direction', async () => {
    await ask({ section: 'four-pillars', subject: 'first', direction: 'forward', question: 'Where is he now?' });
    const prompt = generateSimple.mock.calls[0][0].systemPrompt as string;
    expect(prompt).toContain('Day Master:');
    expect(prompt).toContain('Luck pillars counted forward');
  });

  it('answers a crisis question with the fixed reply and never asks MAIA', async () => {
    const res = await ask({ section: 'natal', subject: 'first', question: 'I want to die' });
    expect((await res.json()).answer).toBe(PRO_ASK_SAFETY_REPLY);
    expect(generateSimple).not.toHaveBeenCalled();
    expect(loadSubjectBirth).not.toHaveBeenCalled();
  });

  it('catches concern about a client in the third person, which the shared check misses', async () => {
    for (const question of ['He says he wants to die', 'She talked about ending her life', 'Is he suicidal?', 'worried she will hurt herself']) {
      const res = await ask({ section: 'natal', subject: 'first', question });
      expect((await res.json()).answer).toBe(PRO_ASK_SAFETY_REPLY);
    }
    expect(generateSimple).not.toHaveBeenCalled();
  });

  it('does not mistake ordinary chart language for concern', async () => {
    for (const question of ['What does Pluto in the 8th say about death and rebirth themes?', 'How does his Mars square Saturn play out?']) {
      await ask({ section: 'natal', subject: 'first', question });
    }
    expect(generateSimple).toHaveBeenCalledTimes(2);
  });

  it('refuses a two-chart question without the second chart, and unknown sections or fields', async () => {
    expect((await ask({ section: 'composite', subject: 'first', question: 'x' })).status).toBe(400);
    expect((await ask({ section: 'tarot', subject: 'first', question: 'x' })).status).toBe(400);
    expect((await ask({ section: 'natal', subject: 'first', question: 'x', name: 'Tim' })).status).toBe(400);
    expect((await ask({ section: 'natal', subject: 'gone', question: 'x' })).status).toBe(404);
    expect(generateSimple).not.toHaveBeenCalled();
  });
});
