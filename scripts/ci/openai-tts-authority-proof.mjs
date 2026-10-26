#!/usr/bin/env node
/**
 * Executable authority proof for the legacy-named Soullab TTS gateway.
 *
 * Bundles the actual route with provider/database/network dependencies replaced by
 * deterministic in-memory doubles. No credentials, member records, provider calls,
 * database calls, or network requests are used.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const ROOT = resolve(import.meta.dirname, '../..');
const ROUTE = join(ROOT, 'app/api/voice/openai-tts/route.ts');
const requireHere = createRequire(import.meta.url);

const virtualModules = new Map([
  ['server-only', 'export {};'],
  ['next/server', 'export class NextRequest {}'],
  ['openai', `
    export default class OpenAI {
      constructor() {
        this.audio = { speech: { create: async (options) => {
          globalThis.__ttsCalls.openai += 1;
          globalThis.__ttsCalls.openaiOptions.push(options);
          if (globalThis.__ttsScenario.openaiFailure) throw new Error('fictional provider unavailable');
          return { arrayBuffer: async () => new Uint8Array([79, 65, 73]).buffer };
        } } };
      }
    }
  `],
  ['@/lib/auth/getMemberFromRequest', `
    export async function getMemberIdFromRequest() {
      return globalThis.__ttsScenario.authenticated ? 'fictional-member-a' : null;
    }
  `],
  ['@/lib/limits/LimitsEnforcer', `
    export async function getMemberTier() { return globalThis.__ttsScenario.tier || 'free'; }
    export class LimitsEnforcer {
      static async checkUsage() {
        return globalThis.__ttsScenario.quotaBlocked
          ? { action: 'block', message: 'fictional quota reached' }
          : { action: 'allow' };
      }
      static async recordUsage() { globalThis.__ttsCalls.productMeter += 1; }
    }
  `],
  ['@/lib/limits/ProviderSpendGate', `
    export const PROVIDER_SPEND_LIMIT_REACHED = 'PROVIDER_SPEND_LIMIT_REACHED';
    export const PROVIDER_SPEND_ACCOUNTING_UNAVAILABLE = 'PROVIDER_SPEND_ACCOUNTING_UNAVAILABLE';
    class GateError extends Error {
      constructor(code, status) { super(code); this.code = code; this.status = status; this.isProviderSpendGateError = true; }
    }
    export function estimateVoiceSeconds(text) { return Math.max(1, Math.ceil(text.length / 12.5)); }
    export function isProviderSpendGateError(error) { return Boolean(error?.isProviderSpendGateError); }
    export async function reserveVoiceProviderSpend() {
      globalThis.__ttsCalls.reserve += 1;
      if (globalThis.__ttsScenario.spend === 'accounting') throw new GateError(PROVIDER_SPEND_ACCOUNTING_UNAVAILABLE, 503);
      if (globalThis.__ttsScenario.spend === 'limit') throw new GateError(PROVIDER_SPEND_LIMIT_REACHED, 429);
      return { reserved: true };
    }
  `],
  ['@/lib/tts/ttsRouter', `
    export function isLocalVoiceEnabled() { return true; }
    export function getConfiguredProvider() { return 'auto'; }
    export async function synthesize(options) {
      globalThis.__ttsCalls.local += 1;
      globalThis.__ttsCalls.localOptions.push(options);
      if (globalThis.__ttsScenario.localFailure) throw new Error('fictional local voice unavailable');
      return { audioBuffer: Buffer.from('LOCAL'), contentType: 'audio/mpeg', provider: 'kokoro', fallback: false };
    }
  `],
  ['@/lib/tts/voiceSovereignty', `
    export async function checkCloudConsent() { return { allowed: globalThis.__ttsScenario.consent !== false, reason: 'member_consent' }; }
    export function logFallbackEvent() { globalThis.__ttsCalls.audit += 1; }
    export function resolveVoicePolicy() { return 'cloud-allowed'; }
  `],
  ['@/lib/voice/voiceArchetypes', `
    export function resolveArchetypeVoice() { return { provider: globalThis.__ttsScenario.archetypeProvider || 'openai', voice: 'alloy' }; }
    export function resolveArchetypeToKokoro() { return 'af_kore'; }
  `],
  ['@/lib/voice/voiceControlsService', `
    export async function getMemberVoicePreferences() {
      if (globalThis.__ttsScenario.preferenceFailure) throw new Error('fictional preference store unavailable');
      return { voiceArchetype: 'maia_core', ttsProvider: globalThis.__ttsScenario.preference ?? null };
    }
  `],
]);

function virtualPlugin() {
  return {
    name: 'soullab-tts-authority-doubles',
    setup(builder) {
      builder.onResolve({ filter: /.*/ }, (args) => {
        if (virtualModules.has(args.path)) return { path: args.path, namespace: 'soullab-test' };
        return null;
      });
      builder.onLoad({ filter: /.*/, namespace: 'soullab-test' }, (args) => ({
        contents: virtualModules.get(args.path),
        loader: 'ts',
      }));
    },
  };
}

const folder = mkdtempSync(join(tmpdir(), 'soullab-openai-tts-authority-'));
const bundle = join(folder, 'route.cjs');
const originalConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};
try {
  await build({
    entryPoints: [ROUTE],
    outfile: bundle,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node22',
    plugins: [virtualPlugin()],
    logLevel: 'silent',
  });
  const { POST } = requireHere(bundle);
  // Route diagnostics are intentionally suppressed in this fixture. The final
  // receipt carries only synthetic case names and aggregate dispatch counts.
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};

  async function run(name, scenario, expected) {
    globalThis.__ttsScenario = {
      authenticated: true,
      preference: null,
      consent: true,
      spend: 'ok',
      ...scenario,
    };
    globalThis.__ttsCalls = {
      openai: 0,
      local: 0,
      reserve: 0,
      productMeter: 0,
      audit: 0,
      localOptions: [],
      openaiOptions: [],
    };
    process.env.OPENAI_API_KEY = 'fictional-test-placeholder';
    process.env.MAIA_ALLOW_CLOUD_VOICE = scenario.cloudFlag ? '1' : '0';

    const req = {
      headers: new Headers(scenario.localOnly ? { 'x-voice-local-only': '1' } : {}),
      json: async () => ({
        text: 'Fictional voice boundary sentence.',
        voice: 'untrusted-client-voice',
        model: 'untrusted-model-name',
        format: 'untrusted-format',
        speed: 99,
      }),
    };
    const response = await POST(req);
    assert.equal(response.status, expected.status, `${name}: status`);
    assert.equal(globalThis.__ttsCalls.openai, expected.openai, `${name}: OpenAI dispatches`);
    assert.equal(globalThis.__ttsCalls.local, expected.local, `${name}: local dispatches`);
    assert.equal(globalThis.__ttsCalls.reserve, expected.reserve, `${name}: spend reservations`);
    if (expected.provider) assert.equal(response.headers.get('x-tts-provider'), expected.provider, `${name}: response provider`);
    if (globalThis.__ttsCalls.local) {
      const localOptions = globalThis.__ttsCalls.localOptions[0];
      assert.equal(localOptions?.providerOverride, 'kokoro', `${name}: local provider pin`);
      assert.equal(localOptions?.ttsProviderPref, 'local', `${name}: local preference pin`);
      assert.equal(localOptions?.voice, 'af_kore', `${name}: server-owned local voice`);
      assert.equal(localOptions?.format, 'mp3', `${name}: local format allowlist`);
      assert.equal(localOptions?.speed, 4, `${name}: local speed clamp`);
    }
    if (globalThis.__ttsCalls.openai) {
      const openaiOptions = globalThis.__ttsCalls.openaiOptions[0];
      assert.equal(openaiOptions?.voice, 'alloy', `${name}: server-owned cloud voice`);
      assert.equal(openaiOptions?.model, 'gpt-4o-mini-tts', `${name}: cloud model allowlist`);
      assert.equal(openaiOptions?.response_format, 'mp3', `${name}: cloud format allowlist`);
      assert.equal(openaiOptions?.speed, 4, `${name}: cloud speed clamp`);
    }
    return { name, status: response.status, openai: expected.openai, local: expected.local, reserve: expected.reserve };
  }

  const results = [];
  results.push(await run('anonymous-refused', { authenticated: false, cloudFlag: true, preference: 'cloud' }, { status: 401, openai: 0, local: 0, reserve: 0 }));
  results.push(await run('unset-stays-local-with-flag', { cloudFlag: true, preference: null }, { status: 200, openai: 0, local: 1, reserve: 0, provider: 'kokoro' }));
  results.push(await run('auto-stays-local-with-flag', { cloudFlag: true, preference: 'auto' }, { status: 200, openai: 0, local: 1, reserve: 0, provider: 'kokoro' }));
  results.push(await run('cloud-choice-without-flag-stays-local', { cloudFlag: false, preference: 'cloud' }, { status: 200, openai: 0, local: 1, reserve: 0, provider: 'kokoro' }));
  results.push(await run('local-only-overrides-cloud-choice', { cloudFlag: true, preference: 'cloud', localOnly: true }, { status: 200, openai: 0, local: 1, reserve: 0, provider: 'kokoro' }));
  results.push(await run('recorded-denial-overrides-cloud-choice', { cloudFlag: true, preference: 'cloud', consent: false }, { status: 200, openai: 0, local: 1, reserve: 0, provider: 'kokoro' }));
  results.push(await run('preference-store-failure-stays-local', { cloudFlag: true, preference: 'cloud', preferenceFailure: true }, { status: 200, openai: 0, local: 1, reserve: 0, provider: 'kokoro' }));
  results.push(await run('accounting-outage-falls-local-before-provider', { cloudFlag: true, preference: 'cloud', spend: 'accounting' }, { status: 200, openai: 0, local: 1, reserve: 1, provider: 'kokoro' }));
  results.push(await run('spend-limit-refuses-without-provider', { cloudFlag: true, preference: 'cloud', spend: 'limit' }, { status: 429, openai: 0, local: 0, reserve: 1 }));
  results.push(await run('explicit-cloud-dispatches-once', { cloudFlag: true, preference: 'cloud' }, { status: 200, openai: 1, local: 0, reserve: 1, provider: 'openai' }));
  results.push(await run('cloud-provider-failure-falls-local', { cloudFlag: true, preference: 'cloud', openaiFailure: true }, { status: 200, openai: 1, local: 1, reserve: 1, provider: 'kokoro' }));
  results.push(await run('local-unavailable-never-falls-cloud-without-authority', { cloudFlag: true, preference: 'auto', localFailure: true }, { status: 503, openai: 0, local: 1, reserve: 0 }));

  originalConsole.log(JSON.stringify({
    status: 'PASS',
    checks: results.length,
    results,
    member_content_used: false,
    provider_calls_made: false,
    real_provider_calls_made: false,
    simulated_provider_dispatches_observed: true,
    provider_calls_are_test_doubles: true,
    database_calls_made: false,
    network_calls_made: false,
    secrets_included: false,
  }));
} finally {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  delete process.env.OPENAI_API_KEY;
  delete process.env.MAIA_ALLOW_CLOUD_VOICE;
  delete globalThis.__ttsScenario;
  delete globalThis.__ttsCalls;
  rmSync(folder, { recursive: true, force: true });
}
