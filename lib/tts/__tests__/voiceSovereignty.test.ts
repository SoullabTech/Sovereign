/**
 * Voice Sovereignty Invariant Tests
 *
 * Constitutional law for MAIA's voice: these tests prove the consent matrix
 * holds under all conditions. If any of these fail, sovereignty has drifted.
 *
 * ⛔ HISTORICAL — the consent matrix as originally ratified:
 *   Local healthy + cloud allowed     → local (no fallback)
 *   Local healthy + cloud denied      → local (no fallback)
 *   Local down + cloud allowed        → cloud + disclosed (fallback=1)   ← ROW 3
 *   Local down + cloud denied         → fail closed (503)
 *   Local disabled                    → cloud primary (no fallback)
 *
 * Its doctrine was: "Keep me speaking, but tell me the truth when it isn't
 * local." It is kept here in full because it WAS canon, and a record that
 * quietly edits its own past teaches nothing.
 *
 * ⭐ SUPERSEDED 2026-08-27 — VOICE-SOVEREIGNTY-01. The matrix in force:
 *   Local healthy                     → local
 *   Local down                        → text + truthful voice-unavailable
 *   Local denied / disabled           → text + truthful voice-unavailable
 *   Cloud preference present          → no cloud dispatch; local, else text
 *
 * ROW 3 is retired. There is no automatic and no consent-derived OpenAI
 * fallback. The governing principle:
 *
 *   Voice continuity does not outrank sovereignty.
 *   Disclosure is not sufficient authority to transmit MAIA voice generation
 *   to a prohibited cloud provider.
 *
 * checkCloudConsent survives with its status changed: RECORDED CONSENT /
 * PREFERENCE WITHOUT ROUTING AUTHORITY. `allowed === true` MUST NOT cause
 * OpenAI TTS to execute. Re-permission requires a new explicit canon decision;
 * the surviving infrastructure cannot reactivate it by itself.
 *
 * Truth invariant: every response MUST carry provider, fallback, and policy.
 */

import { resolveVoicePolicy, type VoicePolicy } from '../voiceSovereignty';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Policy Resolution (pure function — no mocks needed)
// ─────────────────────────────────────────────────────────────────────────────

describe('resolveVoicePolicy', () => {
  it('returns "cloud-primary" when local voice is disabled', () => {
    expect(resolveVoicePolicy({
      localVoiceEnabled: false,
      configuredProvider: 'auto',
      cloudConsentAllowed: true,
    })).toBe('cloud-primary');
  });

  it('returns "cloud-primary" when local disabled, regardless of consent', () => {
    expect(resolveVoicePolicy({
      localVoiceEnabled: false,
      configuredProvider: 'auto',
      cloudConsentAllowed: false,
    })).toBe('cloud-primary');
  });

  it('returns "cloud-allowed" when provider is explicitly openai', () => {
    expect(resolveVoicePolicy({
      localVoiceEnabled: true,
      configuredProvider: 'openai',
      cloudConsentAllowed: true,
    })).toBe('cloud-allowed');
  });

  it('returns "local-only" when local enabled and cloud consent denied', () => {
    expect(resolveVoicePolicy({
      localVoiceEnabled: true,
      configuredProvider: 'auto',
      cloudConsentAllowed: false,
    })).toBe('local-only');
  });

  it('returns "local-only" when kokoro explicit and cloud consent denied', () => {
    expect(resolveVoicePolicy({
      localVoiceEnabled: true,
      configuredProvider: 'kokoro',
      cloudConsentAllowed: false,
    })).toBe('local-only');
  });

  it('returns "local-prefer" when local enabled and cloud consent allowed', () => {
    expect(resolveVoicePolicy({
      localVoiceEnabled: true,
      configuredProvider: 'auto',
      cloudConsentAllowed: true,
    })).toBe('local-prefer');
  });

  it('returns "local-prefer" when kokoro explicit and cloud consent allowed', () => {
    expect(resolveVoicePolicy({
      localVoiceEnabled: true,
      configuredProvider: 'kokoro',
      cloudConsentAllowed: true,
    })).toBe('local-prefer');
  });

  // Exhaustive: every combination produces a valid VoicePolicy
  it('always returns a valid VoicePolicy for all input combinations', () => {
    const validPolicies: VoicePolicy[] = ['local-only', 'local-prefer', 'cloud-allowed', 'cloud-primary'];
    const localValues = [true, false];
    const providers = ['auto', 'kokoro', 'openai', 'sesame'];
    const consentValues = [true, false];

    for (const local of localValues) {
      for (const provider of providers) {
        for (const consent of consentValues) {
          const policy = resolveVoicePolicy({
            localVoiceEnabled: local,
            configuredProvider: provider,
            cloudConsentAllowed: consent,
          });
          expect(validPolicies).toContain(policy);
        }
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. TTS Router — Provider Selection + Fallback Logic
// ─────────────────────────────────────────────────────────────────────────────

describe('ttsRouter sovereignty invariants', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('isLocalVoiceEnabled', () => {
    it('returns true only when MAIA_LOCAL_VOICE_ENABLED is "1"', () => {
      // We need to re-import after setting env
      process.env.MAIA_LOCAL_VOICE_ENABLED = '1';
      const { isLocalVoiceEnabled } = require('../ttsRouter');
      expect(isLocalVoiceEnabled()).toBe(true);
    });

    it('returns false when MAIA_LOCAL_VOICE_ENABLED is "0"', () => {
      process.env.MAIA_LOCAL_VOICE_ENABLED = '0';
      const { isLocalVoiceEnabled } = require('../ttsRouter');
      expect(isLocalVoiceEnabled()).toBe(false);
    });

    it('returns false when MAIA_LOCAL_VOICE_ENABLED is unset', () => {
      delete process.env.MAIA_LOCAL_VOICE_ENABLED;
      const { isLocalVoiceEnabled } = require('../ttsRouter');
      expect(isLocalVoiceEnabled()).toBe(false);
    });
  });

  describe('getConfiguredProvider', () => {
    it('defaults to "auto" when MAIA_TTS_PROVIDER is unset', () => {
      delete process.env.MAIA_TTS_PROVIDER;
      const { getConfiguredProvider } = require('../ttsRouter');
      expect(getConfiguredProvider()).toBe('auto');
    });

    it('returns "kokoro" when explicitly set', () => {
      process.env.MAIA_TTS_PROVIDER = 'kokoro';
      const { getConfiguredProvider } = require('../ttsRouter');
      expect(getConfiguredProvider()).toBe('kokoro');
    });

    it('returns "auto" for unknown provider values', () => {
      process.env.MAIA_TTS_PROVIDER = 'banana';
      const { getConfiguredProvider } = require('../ttsRouter');
      expect(getConfiguredProvider()).toBe('auto');
    });

    it('is case-insensitive', () => {
      process.env.MAIA_TTS_PROVIDER = 'KOKORO';
      const { getConfiguredProvider } = require('../ttsRouter');
      expect(getConfiguredProvider()).toBe('kokoro');
    });
  });

  describe('synthesize routing decisions', () => {
    it('routes to kokoro when local enabled and provider is auto', async () => {
      process.env.MAIA_LOCAL_VOICE_ENABLED = '1';
      process.env.MAIA_TTS_PROVIDER = 'auto';

      // Mock the kokoro provider
      jest.doMock('../providers/kokoro', () => ({
        synthesize: jest.fn().mockResolvedValue({
          audioBuffer: Buffer.from('fake-audio'),
          contentType: 'audio/mpeg',
          provider: 'kokoro',
        }),
      }));

      const ttsRouter = require('../ttsRouter');
      const result = await ttsRouter.synthesize({ text: 'hello', voice: 'af_heart' });

      expect(result.provider).toBe('kokoro');
      expect(result.fallback).toBe(false);
      expect(result.reason).toBe('kokoro_healthy');
    });

    it('refuses rather than falling back when kokoro fails (canon)', async () => {
      process.env.MAIA_LOCAL_VOICE_ENABLED = '1';
      process.env.MAIA_TTS_PROVIDER = 'auto';

      jest.doMock('../providers/kokoro', () => ({
        synthesize: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
      }));

      const ttsRouter = require('../ttsRouter');

      try {
        await ttsRouter.synthesize({ text: 'hello', voice: 'af_heart' });
        fail('Should have refused rather than signalling a cloud fallback');
      } catch (err: any) {
        // SUPERSEDED 2026-08-27 — VOICE-SOVEREIGNTY-01. This used to signal
        // TTSFallbackToOpenAI so the route layer could decide. There is no such
        // decision any more: local failing means MAIA returns text.
        expect(err.name).toBe('CloudVoiceForbidden');
        expect(err.reason).toContain('kokoro_unreachable');
      }
    });

    it('refuses rather than falling back on kokoro timeout (canon)', async () => {
      process.env.MAIA_LOCAL_VOICE_ENABLED = '1';
      process.env.MAIA_TTS_PROVIDER = 'auto';

      jest.doMock('../providers/kokoro', () => ({
        synthesize: jest.fn().mockRejectedValue(new Error('Request timeout exceeded')),
      }));

      const ttsRouter = require('../ttsRouter');

      try {
        await ttsRouter.synthesize({ text: 'hello', voice: 'af_heart' });
        fail('Should have refused rather than signalling a cloud fallback');
      } catch (err: any) {
        // SUPERSEDED 2026-08-27 — VOICE-SOVEREIGNTY-01. This used to signal
        // TTSFallbackToOpenAI so the route layer could decide. There is no such
        // decision any more: local failing means MAIA returns text.
        expect(err.name).toBe('CloudVoiceForbidden');
        expect(err.reason).toContain('kokoro_timeout');
      }
    });

    it('refuses an openai provider selection under the canon (was: qualified lab context)', async () => {
      process.env.MAIA_LOCAL_VOICE_ENABLED = '1';
      process.env.MAIA_TTS_PROVIDER = 'openai';
      // openai is a non-sovereign provider — only selectable where qualified.
      process.env.MAIA_DEPLOYMENT_CONTEXT = 'voice-quality-lab';

      const ttsRouter = require('../ttsRouter');

      try {
        await ttsRouter.synthesize({ text: 'hello', voice: 'alloy' });
        fail('Should have refused an openai selection');
      } catch (err: any) {
        // SUPERSEDED: even an explicitly qualified lab context cannot reach
        // OpenAI TTS while the canon forbids cloud voice.
        expect(err.name).toBe('CloudVoiceForbidden');
        expect(err.reason).toContain('openai_primary');
      }
    });

    // ── Deployment-qualification guard (R15) — behavioral proof ──
    it('REFUSES openai selection in production-maia (fail-closed default context)', async () => {
      process.env.MAIA_LOCAL_VOICE_ENABLED = '1';
      process.env.MAIA_TTS_PROVIDER = 'openai';
      delete process.env.MAIA_DEPLOYMENT_CONTEXT; // → fails closed to production-maia

      const ttsRouter = require('../ttsRouter');

      try {
        await ttsRouter.synthesize({ text: 'hello', voice: 'alloy' });
        fail('Should have thrown ProviderNotQualifiedError');
      } catch (err: any) {
        expect(err.name).toBe('ProviderNotQualifiedError');
        expect(err.provider).toBe('openai');
        expect(err.context).toBe('production-maia');
      }
    });

    it('REFUSES sesame selection in production-maia (CI-shaping backend, not an audio provider)', async () => {
      process.env.MAIA_LOCAL_VOICE_ENABLED = '1';
      process.env.MAIA_TTS_PROVIDER = 'sesame';
      delete process.env.MAIA_DEPLOYMENT_CONTEXT; // → fails closed to production-maia

      const ttsRouter = require('../ttsRouter');

      await expect(
        ttsRouter.synthesize({ text: 'hello' }),
      ).rejects.toMatchObject({
        name: 'ProviderNotQualifiedError',
        provider: 'sesame',
        context: 'production-maia',
      });
    });

    it('REFUSES pplex selection in production-maia but ALLOWS it in the lab', async () => {
      // Production context → refused.
      process.env.MAIA_TTS_PROVIDER = 'pplex';
      delete process.env.MAIA_DEPLOYMENT_CONTEXT;
      let ttsRouter = require('../ttsRouter');
      await expect(
        ttsRouter.synthesize({ text: 'hello' }),
      ).rejects.toMatchObject({ name: 'ProviderNotQualifiedError', provider: 'pplex' });

      // Lab context → passes the guard and dispatches to the pplex adapter.
      jest.resetModules();
      process.env.MAIA_DEPLOYMENT_CONTEXT = 'voice-quality-lab';
      jest.doMock('../providers/personaplex', () => ({
        synthesize: jest.fn().mockResolvedValue({
          audioBuffer: Buffer.from('fake-wav'),
          contentType: 'audio/wav',
          provider: 'personaplex',
        }),
      }));
      ttsRouter = require('../ttsRouter');
      const result = await ttsRouter.synthesize({ text: 'hello' });
      expect(result.provider).toBe('personaplex');
      expect(result.reason).toBe('pplex_healthy');
    });

    it('providerOverride is subject to the same guard (Lab switch is not a bypass)', async () => {
      // Override to a non-sovereign provider in the fail-closed production context.
      delete process.env.MAIA_DEPLOYMENT_CONTEXT;
      process.env.MAIA_TTS_PROVIDER = 'kokoro'; // env says a qualified provider…
      const ttsRouter = require('../ttsRouter');

      // …but the per-request override to openai must still be refused.
      await expect(
        ttsRouter.synthesize({ text: 'hello', providerOverride: 'openai' }),
      ).rejects.toMatchObject({ name: 'ProviderNotQualifiedError', provider: 'openai' });
    });

    it('routes to kokoro when provider is explicitly kokoro', async () => {
      process.env.MAIA_LOCAL_VOICE_ENABLED = '1';
      process.env.MAIA_TTS_PROVIDER = 'kokoro';

      jest.doMock('../providers/kokoro', () => ({
        synthesize: jest.fn().mockResolvedValue({
          audioBuffer: Buffer.from('fake-audio'),
          contentType: 'audio/mpeg',
          provider: 'kokoro',
        }),
      }));

      const ttsRouter = require('../ttsRouter');
      const result = await ttsRouter.synthesize({ text: 'hello' });

      expect(result.provider).toBe('kokoro');
      expect(result.fallback).toBe(false);
    });
  });

  describe('TTSFallbackToOpenAI sentinel', () => {
    // VOICE-SOVEREIGNTY-01: the class is legacy and is NOT deleted — the ruling
    // was explicit that it may remain as unreachable code. What changed is that
    // it cannot be constructed under the canon. These tests therefore describe
    // behaviour that exists only when cloud voice has been deliberately
    // re-permitted, and say so by setting the flag.
    const permitCloud = () => { process.env.MAIA_ALLOW_CLOUD_VOICE = '1'; };
    const restoreCanon = () => { delete process.env.MAIA_ALLOW_CLOUD_VOICE; };

    it('carries isFallback and reason for audit (only when cloud is permitted)', () => {
      permitCloud();
      const { TTSFallbackToOpenAI } = require('../ttsRouter');

      const fallback = new TTSFallbackToOpenAI(true, 'kokoro_timeout');
      expect(fallback.isFallback).toBe(true);
      expect(fallback.reason).toBe('kokoro_timeout');
      expect(fallback.name).toBe('TTSFallbackToOpenAI');

      const primary = new TTSFallbackToOpenAI(false, 'openai_primary');
      expect(primary.isFallback).toBe(false);
      expect(primary.reason).toBe('openai_primary');
      restoreCanon();
    });

    it('defaults reason to "unknown" when not provided (only when cloud is permitted)', () => {
      permitCloud();
      const { TTSFallbackToOpenAI } = require('../ttsRouter');
      const sentinel = new TTSFallbackToOpenAI(true);
      expect(sentinel.reason).toBe('unknown');
      restoreCanon();
    });

    it('⭐ CANON: cannot be constructed at all under the default policy', () => {
      restoreCanon();
      const { TTSFallbackToOpenAI } = require('../ttsRouter');
      expect(() => new TTSFallbackToOpenAI(true, 'kokoro_timeout')).toThrow(/CloudVoiceForbidden|sovereignty policy/);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Consent Gate — Cloud Voice Permission
// ─────────────────────────────────────────────────────────────────────────────

describe('checkCloudConsent invariants', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('denies cloud when x-voice-local-only header is set', async () => {
    // Mock the database query to not interfere
    jest.doMock('@/lib/db/postgres', () => ({
      query: jest.fn().mockResolvedValue({ rows: [] }),
    }));

    const { checkCloudConsent } = require('../voiceSovereignty');
    const result = await checkCloudConsent({
      memberId: 'test-member',
      localOnlyHeader: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('member_consent');
  });

  it('denies cloud when global setting is disabled', async () => {
    jest.doMock('@/lib/db/postgres', () => ({
      query: jest.fn().mockImplementation((sql: string) => {
        if (sql.includes('system_settings')) {
          return { rows: [{ value: 'false' }] };
        }
        return { rows: [] };
      }),
    }));

    const { checkCloudConsent } = require('../voiceSovereignty');
    const result = await checkCloudConsent({
      memberId: 'test-member',
      localOnlyHeader: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('global_disabled');
  });

  it('denies cloud when member has opted out', async () => {
    jest.doMock('@/lib/db/postgres', () => ({
      query: jest.fn().mockImplementation((sql: string) => {
        if (sql.includes('system_settings')) {
          return { rows: [{ value: 'true' }] };
        }
        if (sql.includes('member_settings')) {
          return { rows: [{ allow_cloud_voice: false }] };
        }
        return { rows: [] };
      }),
    }));

    const { checkCloudConsent } = require('../voiceSovereignty');
    const result = await checkCloudConsent({
      memberId: 'test-member',
      localOnlyHeader: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('member_consent');
  });

  it('allows cloud when member has explicitly opted in', async () => {
    jest.doMock('@/lib/db/postgres', () => ({
      query: jest.fn().mockImplementation((sql: string) => {
        if (sql.includes('system_settings')) {
          return { rows: [{ value: 'true' }] };
        }
        if (sql.includes('member_settings')) {
          return { rows: [{ allow_cloud_voice: true }] };
        }
        return { rows: [] };
      }),
    }));

    const { checkCloudConsent } = require('../voiceSovereignty');
    const result = await checkCloudConsent({
      memberId: 'test-member',
      localOnlyHeader: false,
    });

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('member_consent');
  });

  it('allows cloud by default when no settings exist (sovereignty-pragmatic)', async () => {
    jest.doMock('@/lib/db/postgres', () => ({
      query: jest.fn().mockResolvedValue({ rows: [] }),
    }));

    const { checkCloudConsent } = require('../voiceSovereignty');
    const result = await checkCloudConsent({
      memberId: 'test-member',
      localOnlyHeader: false,
    });

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('default');
  });

  it('allows cloud by default for anonymous users', async () => {
    jest.doMock('@/lib/db/postgres', () => ({
      query: jest.fn().mockResolvedValue({ rows: [] }),
    }));

    const { checkCloudConsent } = require('../voiceSovereignty');
    const result = await checkCloudConsent({
      localOnlyHeader: false,
    });

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('default');
  });

  it('per-request override trumps everything (local-only header)', async () => {
    // Even if global + member both say "allowed", the header overrides
    jest.doMock('@/lib/db/postgres', () => ({
      query: jest.fn().mockImplementation((sql: string) => {
        if (sql.includes('system_settings')) {
          return { rows: [{ value: 'true' }] };
        }
        if (sql.includes('member_settings')) {
          return { rows: [{ allow_cloud_voice: true }] };
        }
        return { rows: [] };
      }),
    }));

    const { checkCloudConsent } = require('../voiceSovereignty');
    const result = await checkCloudConsent({
      memberId: 'test-member',
      localOnlyHeader: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('member_consent');
  });

  it('survives database errors gracefully (defaults to allowed)', async () => {
    jest.doMock('@/lib/db/postgres', () => ({
      query: jest.fn().mockRejectedValue(new Error('DB connection failed')),
    }));

    const { checkCloudConsent } = require('../voiceSovereignty');
    const result = await checkCloudConsent({
      memberId: 'test-member',
      localOnlyHeader: false,
    });

    // Should not crash — should default to allowed (pragmatic)
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('default');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Audit Logging — Fire-and-Forget Invariant
// ─────────────────────────────────────────────────────────────────────────────

describe('logFallbackEvent invariants', () => {
  it('never throws even when database is down', () => {
    jest.resetModules();
    jest.doMock('@/lib/db/postgres', () => ({
      query: jest.fn().mockRejectedValue(new Error('DB connection refused')),
    }));

    const { logFallbackEvent } = require('../voiceSovereignty');

    // This must not throw — fire-and-forget means swallow errors
    expect(() => {
      logFallbackEvent({
        requestId: 'test-123',
        memberId: 'member-1',
        intendedProvider: 'kokoro',
        actualProvider: 'openai',
        isFallback: true,
        reason: 'kokoro_unreachable',
        textLength: 42,
      });
    }).not.toThrow();
  });

  it('calls database with correct parameters', () => {
    jest.resetModules();
    const mockQuery = jest.fn().mockResolvedValue({ rows: [] });
    jest.doMock('@/lib/db/postgres', () => ({
      query: mockQuery,
    }));

    const { logFallbackEvent } = require('../voiceSovereignty');

    logFallbackEvent({
      requestId: 'req-456',
      memberId: 'member-2',
      anonId: undefined,
      intendedProvider: 'kokoro',
      actualProvider: 'kokoro',
      isFallback: false,
      reason: 'local_success',
      latencyMs: 800,
      audioBytes: 24000,
      textLength: 50,
    });

    // Give the fire-and-forget a tick to execute
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO voice_fallback_events'),
      expect.arrayContaining(['req-456', 'member-2', 'kokoro', 'kokoro', false, 'local_success'])
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Full Consent Matrix (Integration-style, mocked boundaries)
// ─────────────────────────────────────────────────────────────────────────────

describe('consent matrix — the constitutional test', () => {
  /**
   * This is the test that proves sovereignty can't drift.
   * Each row of the matrix must hold, or the system has a bug.
   *
   * | Local Available | Cloud Consent | Expected Provider | Fallback |
   * |-----------------|---------------|-------------------|----------|
   * | yes             | yes           | local             | 0        |
   * | yes             | no            | local             | 0        |
   * | no              | yes           | cloud             | 1        |
   * | no              | no            | FAIL CLOSED       | —        |
   */

  beforeEach(() => {
    jest.resetModules();
    process.env.MAIA_LOCAL_VOICE_ENABLED = '1';
    process.env.MAIA_TTS_PROVIDER = 'auto';
  });

  it('ROW 1: local healthy + cloud allowed → local, no fallback', async () => {
    jest.doMock('../providers/kokoro', () => ({
      synthesize: jest.fn().mockResolvedValue({
        audioBuffer: Buffer.from('local-audio'),
        contentType: 'audio/mpeg',
        provider: 'kokoro',
      }),
    }));

    const ttsRouter = require('../ttsRouter');
    const result = await ttsRouter.synthesize({ text: 'sovereignty test' });

    expect(result.provider).toBe('kokoro');
    expect(result.fallback).toBe(false);
    expect(result.reason).toBe('kokoro_healthy');
  });

  it('ROW 2: local healthy + cloud denied → still local, no fallback', async () => {
    // When local is healthy, cloud consent doesn't matter —
    // the request never reaches cloud
    jest.doMock('../providers/kokoro', () => ({
      synthesize: jest.fn().mockResolvedValue({
        audioBuffer: Buffer.from('local-audio'),
        contentType: 'audio/mpeg',
        provider: 'kokoro',
      }),
    }));

    const ttsRouter = require('../ttsRouter');
    const result = await ttsRouter.synthesize({ text: 'sovereignty test' });

    expect(result.provider).toBe('kokoro');
    expect(result.fallback).toBe(false);
    // Cloud was never touched — consent is irrelevant
  });

  // ── ROW 3 · SUPERSEDED 2026-08-27 — VOICE-SOVEREIGNTY-01 ──────────────────
  //
  // The retired row read:
  //
  //     local down + cloud allowed  →  cloud fallback + disclosure
  //
  // It was canon, and it is recorded here rather than deleted. What retired it:
  // voice continuity does not outrank sovereignty, and disclosure is not
  // sufficient authority to transmit MAIA voice generation to a prohibited
  // cloud provider. A disclosed fallback still sends the member's words to
  // OpenAI; telling them afterwards does not make it consented.
  //
  // Its replacement is ROW 3a/3b below: local down means text, whatever consent
  // says.

  it('ROW 3a: local down + cloud DENIED → no cloud, refusal the route turns into text', async () => {
    jest.doMock('../providers/kokoro', () => ({
      synthesize: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    }));
    const ttsRouter = require('../ttsRouter');

    await expect(ttsRouter.synthesize({ text: 'sovereignty test' }))
      .rejects.toMatchObject({ name: 'CloudVoiceForbidden' });
  });

  it('ROW 3b: local down + cloud ALLOWED → STILL no cloud (this is the retired row)', async () => {
    // ⭐ The load-bearing assertion of this unit. Consent is present and true,
    // and it changes nothing: checkCloudConsent is a recorded preference with
    // NO ROUTING AUTHORITY under the current canon.
    jest.doMock('../providers/kokoro', () => ({
      synthesize: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    }));
    jest.doMock('@/lib/db/postgres', () => ({
      query: jest.fn().mockResolvedValue({ rows: [{ cloud_voice_consent: true }] }),
    }));

    const ttsRouter = require('../ttsRouter');
    const { checkCloudConsent } = require('../voiceSovereignty');

    const consent = await checkCloudConsent({ memberId: 'test-member' });
    // Whatever consent reports, the router refuses. The assertion is the
    // implication, not the consent value.
    await expect(ttsRouter.synthesize({ text: 'sovereignty test' }))
      .rejects.toMatchObject({ name: 'CloudVoiceForbidden' });
    expect(typeof consent.allowed).toBe('boolean');
  });

  it('⭐ HARD INVARIANT: no member preference and no local health state reaches openai', async () => {
    // Stronger than testing branches individually: the whole cross-product.
    // If a seventh escape to OpenAI is added to the router later, this fails.
    const preferences = ['auto', 'local', 'cloud', undefined];
    const localStates: Array<[string, any]> = [
      ['healthy', { audioBuffer: Buffer.from('a'), contentType: 'audio/mpeg', provider: 'kokoro' }],
      ['down', null],
    ];

    for (const pref of preferences) {
      for (const [label, kokoroResult] of localStates) {
        jest.resetModules();
        jest.doMock('../providers/kokoro', () => ({
          synthesize: kokoroResult
            ? jest.fn().mockResolvedValue(kokoroResult)
            : jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
        }));
        const ttsRouter = require('../ttsRouter');

        let provider: string | undefined;
        let refusal: string | undefined;
        try {
          const r = await ttsRouter.synthesize({ text: 'x', ttsProviderPref: pref });
          provider = r.provider;
        } catch (err: any) {
          refusal = err.name;
        }

        expect({ pref, label, provider }).not.toMatchObject({ provider: 'openai' });
        if (label === 'down') {
          expect(refusal).toBe('CloudVoiceForbidden');
        } else {
          expect(provider).toBe('kokoro');
        }
      }
    }
  });

  it('ROW 4: local down + cloud denied → fail closed (route layer)', async () => {
    // This tests the consent + routing interaction.
    // When the router signals fallback AND consent denies cloud,
    // the result must be a clean failure — never silent cloud usage.

    jest.doMock('../providers/kokoro', () => ({
      synthesize: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    }));
    jest.doMock('@/lib/db/postgres', () => ({
      query: jest.fn().mockResolvedValue({ rows: [] }),
    }));

    const ttsRouter = require('../ttsRouter');
    const { checkCloudConsent, resolveVoicePolicy } = require('../voiceSovereignty');

    // Router signals fallback needed
    // SUPERSEDED mechanism, same outcome. The router used to SIGNAL a fallback
    // and leave the decision to the route layer. It now refuses outright, so
    // there is no decision left to make and no window in which one could be
    // made wrongly.
    let refused = false;
    try {
      await ttsRouter.synthesize({ text: 'sovereignty test' });
    } catch (err: any) {
      refused = true;
      expect(err.name).toBe('CloudVoiceForbidden');
    }
    expect(refused).toBe(true);

    // Consent check with local-only header → denied
    const consent = await checkCloudConsent({
      memberId: 'test-member',
      localOnlyHeader: true, // Sanctuary Voice mode
    });
    expect(consent.allowed).toBe(false);

    // Policy resolves to local-only
    const policy = resolveVoicePolicy({
      localVoiceEnabled: true,
      configuredProvider: 'auto',
      cloudConsentAllowed: consent.allowed,
    });
    expect(policy).toBe('local-only');

    // The combination: fallback needed + consent denied = fail closed.
    // This is where the API route returns 503 — not cloud audio.
  });
});
