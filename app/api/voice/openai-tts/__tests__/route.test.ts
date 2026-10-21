/**
 * GOVERNED TTS SEAM — observable-boundary tests (Phase 0, 2026-07-26)
 *
 * Verifies the rewritten /api/voice/openai-tts route interprets the router's
 * TTSFallbackToOpenAI sentinel correctly, at the RESPONSE boundary (status + headers),
 * not by inspecting internals. Founder-required matrix:
 *
 *   Case                          | Provider              | Consent gate | Provenance
 *   maia_* design selection       | OpenAI / alloy        | No new gate  | selection_reason
 *   Kokoro archetype succeeds     | Kokoro                | (existing)   | selected provider
 *   Kokoro fails, consent present | OpenAI fallback       | Yes          | fallback_reason
 *   Kokoro fails, consent absent  | No silent OpenAI      | Yes          | refusal
 *
 * External network calls are mocked — no live paid API calls.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

// No real DB: router/sovereignty modules transitively import postgres.
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: jest.fn(async () => ({ rows: [] })),
  default: { query: jest.fn(async () => ({ rows: [] })) },
}));

// ── ttsRouter: keep the REAL TTSFallbackToOpenAI class + env helpers; control synthesize ──
const mockSynthesize = jest.fn<any>();
jest.mock('@/lib/tts/ttsRouter', () => {
  const actual = jest.requireActual('@/lib/tts/ttsRouter') as any;
  return { __esModule: true, ...actual, synthesize: (...a: any[]) => mockSynthesize(...a) };
});

// ── voiceSovereignty: real resolveVoicePolicy; spy logFallbackEvent; control consent ──
const mockLogFallbackEvent = jest.fn();
const mockCheckCloudConsent = jest.fn<any>();
jest.mock('@/lib/tts/voiceSovereignty', () => {
  const actual = jest.requireActual('@/lib/tts/voiceSovereignty') as any;
  return {
    __esModule: true,
    ...actual,
    logFallbackEvent: (...a: any[]) => mockLogFallbackEvent(...a),
    checkCloudConsent: (...a: any[]) => mockCheckCloudConsent(...a),
  };
});

// ── OpenAI SDK: assert whether cloud egress happened ──
const mockSpeechCreate = jest.fn<any>();
jest.mock('openai', () => ({
  __esModule: true,
  default: class MockOpenAI {
    audio = { speech: { create: (...a: any[]) => mockSpeechCreate(...a) } };
  },
}));

// ── limits / auth / prefs ──
jest.mock('@/lib/limits/LimitsEnforcer', () => ({
  __esModule: true,
  LimitsEnforcer: {
    checkUsage: jest.fn(async () => ({ action: 'allow' })),
    recordUsage: jest.fn(async () => {}),
  },
  getMemberTier: jest.fn(async () => 'free'),
}));
const mockGetMemberId = jest.fn<any>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  __esModule: true,
  getMemberIdFromRequest: () => mockGetMemberId(),
}));
const mockGetPrefs = jest.fn<any>();
jest.mock('@/lib/voice/voiceControlsService', () => ({
  __esModule: true,
  getMemberVoicePreferences: () => mockGetPrefs(),
}));

import { TTSFallbackToOpenAI } from '@/lib/tts/ttsRouter';
import { POST } from '../route';

function makeReq(body: any, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/voice/openai-tts', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', ...headers },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.OPENAI_API_KEY = 'test-key';
  mockGetMemberId.mockResolvedValue(null);           // anonymous by default
  mockGetPrefs.mockResolvedValue(null);              // → effective archetype maia_core
  mockSpeechCreate.mockResolvedValue({ arrayBuffer: async () => new ArrayBuffer(16) });
  mockCheckCloudConsent.mockResolvedValue({ allowed: true, reason: 'default' });
});

describe('POST /api/voice/openai-tts — governed seam, observable boundary', () => {
  it('maia_* design-selection → OpenAI/alloy, NOT consent-gated, selection_reason=archetype_rule', async () => {
    mockSynthesize.mockRejectedValue(
      new TTSFallbackToOpenAI(false, 'archetype_openai:maia_core:alloy', 'alloy'),
    );
    const res = await POST(makeReq({ text: 'Hello there.' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('X-TTS-Provider')).toBe('openai');
    expect(res.headers.get('X-TTS-Fallback')).toBe('0');            // design-select ≠ failure fallback
    expect(res.headers.get('X-TTS-Selection-Reason')).toBe('archetype_rule');
    expect(res.headers.get('X-TTS-Fallback-Reason')).toBe('none');
    expect(mockCheckCloudConsent).not.toHaveBeenCalled();           // ratified default is not gated
    expect(mockSpeechCreate).toHaveBeenCalledWith(expect.objectContaining({ voice: 'alloy' }));
  });

  it('Kokoro archetype succeeds → Kokoro provider, no OpenAI egress', async () => {
    mockGetMemberId.mockResolvedValue('m1');
    mockGetPrefs.mockResolvedValue({ voiceArchetype: 'mentor' });   // kokoro archetype
    mockSynthesize.mockResolvedValue({
      audioBuffer: Buffer.from([1, 2, 3, 4]),
      contentType: 'audio/mpeg',
      provider: 'kokoro',
      fallback: false,
      reason: 'kokoro_healthy',
    });
    const res = await POST(makeReq({ text: 'Grounded.' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('X-TTS-Provider')).toBe('kokoro');
    expect(res.headers.get('X-TTS-Fallback')).toBe('0');
    expect(mockSpeechCreate).not.toHaveBeenCalled();                // no cloud egress on local success
  });

  it('Kokoro fails + consent present → consent-gated OpenAI fallback, fallback_reason classified', async () => {
    mockGetMemberId.mockResolvedValue('m1');
    mockGetPrefs.mockResolvedValue({ voiceArchetype: 'mentor' });
    mockSynthesize.mockRejectedValue(new TTSFallbackToOpenAI(true, 'kokoro_unreachable'));
    mockCheckCloudConsent.mockResolvedValue({ allowed: true, reason: 'default' });
    const res = await POST(makeReq({ text: 'Grounded.' }));
    expect(res.status).toBe(200);
    expect(mockCheckCloudConsent).toHaveBeenCalled();               // genuine fallback IS gated
    expect(res.headers.get('X-TTS-Provider')).toBe('openai');
    expect(res.headers.get('X-TTS-Fallback')).toBe('1');           // genuine failure fallback
    expect(res.headers.get('X-TTS-Fallback-Reason')).toBe('provider_unavailable');
    expect(mockSpeechCreate).toHaveBeenCalledWith(expect.objectContaining({ voice: 'alloy' }));
  });

  it('Kokoro fails + consent absent → 503, NO silent OpenAI fallback', async () => {
    mockGetMemberId.mockResolvedValue('m1');
    mockGetPrefs.mockResolvedValue({ voiceArchetype: 'mentor' });
    mockSynthesize.mockRejectedValue(new TTSFallbackToOpenAI(true, 'kokoro_error'));
    mockCheckCloudConsent.mockResolvedValue({ allowed: false, reason: 'member_consent' });
    const res = await POST(makeReq({ text: 'Grounded.' }));
    expect(res.status).toBe(503);
    expect(mockSpeechCreate).not.toHaveBeenCalled();                // no silent cloud rescue
    const refusal = (mockLogFallbackEvent.mock.calls.map((c: any[]) => c[0]) as any[])
      .find((e) => e.actualProvider === 'none');
    expect(refusal?.fallbackReason).toBe('consent_policy');
  });

  it('provenance distinguishes selection_reason from fallback_reason and carries NO raw message text', async () => {
    mockSynthesize.mockRejectedValue(
      new TTSFallbackToOpenAI(false, 'archetype_openai:maia_core:alloy', 'alloy'),
    );
    const res = await POST(makeReq({ text: 'SECRET_SENTINEL_TEXT.' }));
    expect(res.headers.get('X-TTS-Selection-Reason')).toBe('archetype_rule');
    expect(res.headers.get('X-TTS-Fallback-Reason')).toBe('none');
    for (const call of mockLogFallbackEvent.mock.calls as any[]) {
      expect(JSON.stringify(call[0])).not.toContain('SECRET_SENTINEL_TEXT');
    }
  });
});
