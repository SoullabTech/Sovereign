/**
 * DESKTOP-VOICE-TEST-INSTRUMENT-RESTORE-01 — supply `crypto.randomUUID` under jsdom.
 *
 * ⛔ THE DEFECT THIS CLOSES. `apiFetch` builds a stable visitor id via
 * `crypto.randomUUID()` (`lib/http/apiBase.ts:481`) on the way to every request.
 * Node provides that global; the jsdom environment these voice suites opt into
 * does not. So every test that reached the upload died with a bare `TypeError`
 * BEFORE the behaviour under test ran, and surfaced as
 * `voice_fallback_failed { reason: 'transcribe_http_error', errorName: 'TypeError' }`.
 *
 * ⛔ WHY IT STAYED INVISIBLE. `androidVoiceFallback.ts` records the failure as
 * `errorName: String(name).slice(0, 60)` — the error's NAME, not its message. So
 * the logs said `TypeError` and never said `crypto.randomUUID is not a function`.
 * Three suites were read as "the sovereign capture path is broken" when the
 * instrument was.
 *
 * ⛔ THIS IS A TEST FIXTURE, NOT A PRODUCTION FALLBACK. Production `apiFetch` is
 * unchanged and still requires a real `crypto.randomUUID`; visitor-id generation
 * is not weakened. A browser that genuinely lacked it would still fail, loudly,
 * which is correct.
 *
 * ⛔ WHY NOT `setupFilesAfterEnv`. jest.config.js declares none, so adding one
 * would apply this shim to every suite in the repository — including suites this
 * unit has not audited, some of which are red. Turning those green for a reason
 * nobody examined is exactly the concealment this unit is meant to avoid. An
 * explicit import names the dependency at the top of each file that has it.
 *
 * Import for side effect, before the module under test:
 *
 *     import './support/jsdomCrypto';
 */

const FIXED_UUID = '00000000-0000-4000-8000-000000000000';

if (typeof (globalThis.crypto as { randomUUID?: unknown } | undefined)?.randomUUID !== 'function') {
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    // Spread first so getRandomValues and anything else jsdom does provide
    // survives; only the missing method is added.
    value: { ...globalThis.crypto, randomUUID: () => FIXED_UUID },
  });
}

export {};
