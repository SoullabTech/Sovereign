import { NextRequest } from 'next/server';
import { proxyBecomingMaia } from '../maiaProxy.server';

const originalFetch = global.fetch;

function request(
  path: string,
  headers: Record<string, string>,
  body: Record<string, unknown>,
) {
  return new NextRequest('http://localhost:3801' + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

function upstreamBody(mock: jest.Mock) {
  const [, init] = mock.mock.calls[0] as [URL, RequestInit];
  return JSON.parse(String(init.body));
}

describe('Becoming MAIA proxy boundary', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn(async () => new Response(
      JSON.stringify({ message: 'synthetic MAIA' }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    ));
    global.fetch = fetchMock as typeof fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });
  it('refuses a guide act without its explicit header', async () => {
    const response = await proxyBecomingMaia(request('/api/becoming/guide', {}, {
      message: 'guide me',
      sessionId: 'becoming-guide-123456789012',
      conversationHistory: [],
    }), 'guide');

    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('forces the in-journey guide to sanctuary + ephemeral + empty history', async () => {
    const response = await proxyBecomingMaia(request('/api/becoming/guide', {
      'x-becoming-guide': '1',
      cookie: 'maia_session=synthetic',
      'x-session-token': 'synthetic-token',
    }, {
      message: 'guide me',
      sessionId: 'becoming-guide-123456789012',
      conversationHistory: [],
      sanctuary: false,
      memoryMode: 'continuity',
    }), 'guide');

    expect(response.status).toBe(200);
    const body = upstreamBody(fetchMock);
    expect(body.sanctuary).toBe(true);
    expect(body.memoryMode).toBe('ephemeral');
    expect(body.conversationHistory).toEqual([]);
    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get('cookie')).toBe('maia_session=synthetic');
    expect(headers.get('x-session-token')).toBe('synthetic-token');
  });
  it('forces Across Time to selected-context sanctuary while preserving current-thread history', async () => {
    const history = [{ role: 'assistant', content: 'one selected-field reflection' }];
    const response = await proxyBecomingMaia(request('/api/becoming/temporal', {
      'x-becoming-temporal': '1',
    }, {
      message: 'reconsider this selected field',
      sessionId: 'becoming-across-time-123456789012',
      conversationHistory: history,
      sanctuary: false,
      memoryMode: 'continuity',
    }), 'temporal');

    expect(response.status).toBe(200);
    const body = upstreamBody(fetchMock);
    expect(body.sanctuary).toBe(true);
    expect(body.memoryMode).toBe('ephemeral');
    expect(body.conversationHistory).toEqual(history);
    expect(body.becomingMode).toBe('temporal');
  });

  it('keeps post-Return conversation as the separate continuity-enabled act', async () => {
    const history = [{ role: 'assistant', content: 'prior in-field synthesis' }];
    const response = await proxyBecomingMaia(request('/api/becoming/conversation', {
      'x-becoming-explicit-handoff': '1',
    }, {
      message: 'continue with this journey',
      sessionId: 'becoming-123456789012',
      journeyId: 'journey-1',
      conversationHistory: history,
      sanctuary: true,
      memoryMode: 'ephemeral',
    }), 'continuity');

    expect(response.status).toBe(200);
    const body = upstreamBody(fetchMock);
    expect(body.sanctuary).toBe(false);
    expect(body.memoryMode).toBe('continuity');
    expect(body.conversationHistory).toEqual(history);
    expect(body.becomingMode).toBe('continuity');
    expect(body.becomingJourneyId).toBe('journey-1');
  });
});
