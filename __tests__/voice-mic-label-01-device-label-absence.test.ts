/**
 * VOICE-MIC-LABEL-01 — the microphone's name is the member's, not ours.
 *
 * `voice_mic_granted` shipped `trackLabel` to the telemetry receiver on every
 * mic grant. On the founder's hardware that read "Scarlett 2i2 USB
 * (1235:8210)"; on a member using AirPods the same field reads their name.
 * The event fires server-side each time capture starts, so this was a
 * per-grant transmission of a member-authored string.
 *
 * ⭐ WHY THIS TEST READS SOURCE. The emission is an inline object literal
 * inside a React component's getUserMedia path — there is no exported record
 * to assert against, the way `captureForensics` has one. A behavioural test
 * would need a browser, a granted permission and a real device. So this pins
 * the *call site* directly, following the precedent set by the F10 Sanctuary
 * boundary proof, which walks the route source rather than trusting a mock.
 *
 * ⛔ WHY THE FORENSICS PIN IS NOT ENOUGH. `captureForensics.test.ts` already
 * asserts no `trackLabel` key in the capture-loss record. That pin passed for
 * the entire time this defect was live, because it guards a different event.
 * A regression test that can be satisfied by an unrelated file is not a guard.
 * Everything below is anchored to `voice_mic_granted` itself.
 *
 * ⛔ THE BOUNDARY IS ABSENCE. Not hashing, not redaction, not truncation, not
 * a replacement identifier. A shortened or hashed device name is still a
 * stable per-member handle, and a field that exists is a field something
 * eventually fills. These tests therefore reject *any* device-name-shaped
 * key, not merely the old one.
 */

import fs from 'fs';
import path from 'path';

const COMPONENT = path.join(
  process.cwd(),
  'components/voice/ContinuousConversation.tsx',
);

/**
 * Strip comments before matching.
 *
 * The repair deliberately leaves a comment naming `trackLabel` and explaining
 * why it is gone. Without this, that explanation would fail the very test it
 * exists to document — and, worse, a future author could satisfy the test by
 * deleting the reasoning instead of keeping the code correct.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

/** The object literal passed to logVoiceEvent('voice_mic_granted', {...}). */
function readMicGrantedPayload(): string {
  const src = stripComments(fs.readFileSync(COMPONENT, 'utf8'));
  const start = src.indexOf("logVoiceEvent('voice_mic_granted'");
  expect(start).toBeGreaterThan(-1); // the event must still exist at all

  const open = src.indexOf('{', start);
  expect(open).toBeGreaterThan(-1);

  // Walk braces so a nested object cannot truncate the payload early.
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(open, i + 1);
    }
  }
  throw new Error('unterminated voice_mic_granted payload');
}

describe('VOICE-MIC-LABEL-01 — voice_mic_granted carries no device label', () => {
  it('still emits the event (this is a privacy repair, not a removal)', () => {
    const src = stripComments(fs.readFileSync(COMPONENT, 'utf8'));
    expect(src).toContain("logVoiceEvent('voice_mic_granted'");
  });

  it('does not send trackLabel', () => {
    expect(readMicGrantedPayload()).not.toMatch(/trackLabel/);
  });

  it('never reads .label off the audio track in the payload', () => {
    // Catches the substitution where the key is renamed but the same value
    // is still transmitted.
    expect(readMicGrantedPayload()).not.toMatch(/\.label/);
  });

  it('carries no device-name-shaped field under any name', () => {
    // The boundary is absence: a hashed, truncated or renamed device handle
    // is still a per-member identifier.
    const payload = readMicGrantedPayload();
    for (const forbidden of [/label/i, /deviceId/i, /deviceName/i, /\bdevice\b/i]) {
      expect(payload).not.toMatch(forbidden);
    }
  });

  it('pins the exact pre-repair line as forbidden', () => {
    // Negative control. If this string returns, the defect returned with it.
    const src = stripComments(fs.readFileSync(COMPONENT, 'utf8'));
    expect(src).not.toContain('trackLabel: stream.getAudioTracks()[0]?.label');
  });

  it('keeps only the track count, which describes no one', () => {
    const payload = readMicGrantedPayload();
    expect(payload).toMatch(/audioTracks:\s*stream\.getAudioTracks\(\)\.length/);

    // Every key in the payload must be on the allowlist. A new key added
    // later fails here rather than shipping unreviewed.
    const keys = [...payload.matchAll(/(\w+)\s*:/g)].map((m) => m[1]);
    expect(keys).toEqual(['audioTracks']);
  });
});

describe('the forensics pin is a different guard, not this one', () => {
  it('captureForensics still excludes trackLabel, independently', () => {
    // Recorded so the relationship is explicit: #1126 cleaned the
    // capture-loss record; this unit cleans the mic-grant event. Neither
    // pin can stand in for the other.
    const forensics = fs.readFileSync(
      path.join(process.cwd(), 'lib/voice/captureForensics.ts'),
      'utf8',
    );
    expect(forensics).not.toMatch(/trackLabel\s*:/);
  });
});
