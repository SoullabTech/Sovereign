/**
 * `service-not-allowed` containment — regression pins for #706.
 *
 * Observed 2026-07-23 in production: on Safari 26.5.2 / iOS 18.7 the recogniser
 * is refused at start. `voice_mic_granted` fires with a live audio track, then
 * `voice_transcribe_error: service-not-allowed`. Safari 26.6 and Chrome complete
 * the same path on the same phone, so this is neither a permission problem nor a
 * device limitation.
 *
 * The product defect was a FALSE STATE TRANSITION, not missing copy: the surface
 * entered/remained in LISTENING after recognition had already been refused.
 *
 * Load-bearing measurement: the three failing sessions emitted ONLY
 * voice_mic_granted and voice_transcribe_error — no voice_recognition_ended.
 * `onend` does not fire for this error on that build, so the usual
 * onRecordingStateChange(false) → parent setIsListening(false) path never runs.
 * That is why the parent must be told explicitly.
 *
 * SCOPE OF THESE TESTS: they are structural pins over the error-handling source,
 * not runtime proof. Nothing here forces a real `service-not-allowed` event. The
 * acceptance test in #706 requires forcing the error on a device; these tests
 * only guard the wiring from silently regressing.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const child = readFileSync(join(ROOT, 'components/voice/ContinuousConversation.tsx'), 'utf8');
const parent = readFileSync(join(ROOT, 'components/OracleConversation.tsx'), 'utf8');

/** The body of the `else if` branch matching `event.error === '<code>'`. */
function branchFor(code: string): string {
  const marker = `event.error === '${code}'`;
  const start = child.indexOf(marker);
  if (start === -1) throw new Error(`no branch for ${code}`);
  const next = child.indexOf('} else if (', start + marker.length);
  return child.slice(start, next === -1 ? start + 1200 : next);
}

describe('the two error codes are handled separately', () => {
  it('gives service-not-allowed its own branch', () => {
    // They used to share one branch, which is how a service refusal came to be
    // reported to the member as a microphone denial.
    expect(child).not.toMatch(/event\.error === 'not-allowed' \|\| event\.error === 'service-not-allowed'/);
    expect(child).toMatch(/event\.error === 'service-not-allowed'/);
    expect(child).toMatch(/event\.error === 'not-allowed'/);
  });

  it('keeps genuine microphone denial distinct and unchanged in behaviour', () => {
    const b = branchFor('not-allowed');
    expect(b).toMatch(/Microphone permission denied/);
    expect(b).toMatch(/setIsListening\(false\)/);
    // A real denial must NOT tell the member to switch browsers — updating
    // Safari does not grant a microphone the member refused.
    expect(b).not.toMatch(/onVoiceUnavailable/);
    expect(b).not.toMatch(/Chrome/);
  });
});

describe('service-not-allowed leaves the false LISTENING state', () => {
  const b = branchFor('service-not-allowed');

  it('notifies the parent explicitly rather than waiting for onend', () => {
    expect(b).toMatch(/onVoiceUnavailable\?\.\(/);
    expect(b).toMatch(/reason: 'service-not-allowed'/);
  });

  it('carries the member-facing remedy', () => {
    expect(b).toMatch(/Voice couldn't start in this browser/);
    expect(b).toMatch(/Chrome/);
    expect(b).toMatch(/Safari/);
  });

  it('no longer claims the microphone was denied', () => {
    // The mic IS granted in these sessions (voice_mic_granted, 1 audio track).
    expect(b).not.toMatch(/Microphone permission denied/);
    expect(b).toMatch(/not a permission denial/);
  });
});

describe('the parent clears the listening state on this path', () => {
  it('setIsListening(false) runs inside onVoiceUnavailable', () => {
    const start = parent.indexOf('onVoiceUnavailable={');
    expect(start).toBeGreaterThan(-1);
    const handler = parent.slice(start, start + 1400);
    expect(handler).toMatch(/setIsListening\(false\)/);
    expect(handler).toMatch(/setShowChatInterface\(true\)/);
    expect(handler).toMatch(/setIsHandsFreeMode\(false\)/);
    expect(handler).toMatch(/toast\(userMessage/);
  });
});

describe('constraints this patch must not violate', () => {
  it('leaves telemetry untouched — the event still fires for every error', () => {
    // logVoiceEvent runs at the top of onerror, before any branching, so no
    // branch can suppress it. The event is how this defect was found at all.
    expect(child).toMatch(/logVoiceEvent\('voice_transcribe_error', \{ error: String\(event\.error \|\| 'unknown'\) \}\)/);
    const onerror = child.indexOf('recognition.onerror');
    const telemetry = child.indexOf("logVoiceEvent('voice_transcribe_error'", onerror);
    const firstBranch = child.indexOf('if (', telemetry);
    expect(telemetry).toBeGreaterThan(onerror);
    expect(telemetry).toBeLessThan(firstBranch);
  });

  it('adds no browser or version detection', () => {
    // The remedy names Chrome and Safari in copy only. Branching on the browser
    // would encode today's observation as tomorrow's behaviour.
    const b = branchFor('service-not-allowed');
    expect(b).not.toMatch(/userAgent|CriOS|Version\/|isSafari\(|navigator\./);
  });

  it('adds no retry control', () => {
    // Ruled out for this containment patch: recognition was already refused, so
    // an immediate retry re-enters the same dead end.
    const b = branchFor('service-not-allowed');
    expect(b).not.toMatch(/retry|Try Again|tryAgain/i);
  });
});
