// RF01 S0-B parity — native privacy is deliberate, in MAIN, before content.
// Fictional sessions, local JavaScript, no network or real member data.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { createConversation, MAIA_PATH, TURNS_PATH, CONSENT_PATH } =
  require('../src/conversation.js');
const { createContinuity } = require('../src/continuity.js');
const src = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

function fixture(options = {}) {
  const calls = [];
  const session = {
    authedFetch: async (pathname, init) => {
      const body = init && typeof init.body === 'string' ? JSON.parse(init.body) : null;
      calls.push({ pathname, method: init && init.method, body });
      if (pathname === TURNS_PATH || pathname.startsWith(TURNS_PATH + '?')) {
        const messages = options.recent || [];
        return { ok: true, status: 200, res: { json: async () => ({
          success: true, messages,
        }) } };
      }
      if (pathname === CONSENT_PATH) {
        if (options.consentThrows) throw new Error('FICTIONAL_NETWORK_DOWN');
        if (options.consentRefused) return {
          ok: false, status: 503, error: 'CONSENT_UNAVAILABLE',
          res: { text: async () => JSON.stringify({ error: 'CONSENT_UNAVAILABLE' }) },
        };
        const receipt = options.badReceipt ?
          { ok: true, exchangeId: 'wrong', sessionId: body.sessionId, privacyChoice: body.privacyChoice } :
          { ok: true, exchangeId: body.exchangeId, sessionId: body.sessionId, privacyChoice: body.privacyChoice };
        return { ok: true, status: 200, res: { json: async () => receipt } };
      }
      if (pathname === MAIA_PATH) {
        return { ok: true, status: 200, res: { json: async () => ({
          message: 'FICTIONAL_RESPONSE',
          audio: { audioBase64: 'FICTIONAL_AUDIO', format: 'mp3' },
        }) } };
      }
      throw new Error('Unexpected fictional request');
    },
  };
  const conv = createConversation({
    session, diagnostics: { emit: () => {} }, sessionId: 'desktop-fictional-1',
  });
  return { conv, calls, session };
}

test('unresolved native choice refuses text and transcription without network calls', async () => {
  const { conv, calls } = fixture();
  const said = await conv.ask('FICTIONAL_PRIVATE_WORDS');
  const heard = await conv.transcribe(new Float32Array(1600), 16000);
  assert.equal(said.ok, false);
  assert.equal(heard.ok, false);
  assert.equal(calls.length, 0);
  assert.equal(conv.privacyState().ready, false);
});

test('native history and cross-device adoption cannot read before Continuity', async () => {
  const { conv, calls } = fixture();
  assert.equal((await conv.adoptMemberThread()).ok, false);
  assert.equal((await conv.canonicalThreadId()).ok, false);
  assert.equal((await conv.history()).ok, false);
  assert.equal(calls.length, 0);
});

test('an explicit Continuity choice alone is not a verified thread', async () => {
  const { conv, calls } = fixture();
  assert.equal(conv.choosePrivacy('continuity').ok, true);
  assert.equal(conv.privacyState().ready, false);
  assert.equal((await conv.ask('FICTIONAL_PRIVATE_WORDS')).ok, false);
  assert.equal((await conv.transcribe(new Float32Array(1600), 16000)).ok, false);
  assert.equal(calls.length, 0);
});

test('Continuity sends a content-free preflight before MAIA and preserves custody', async () => {
  const { conv, calls } = fixture();
  assert.equal(conv.choosePrivacy('continuity').ok, true);
  assert.equal((await conv.adoptMemberThread()).ok, true);
  const sent = await conv.ask('FICTIONAL_PRIVATE_WORDS');
  assert.equal(sent.ok, true);
  assert.deepEqual(calls.map(c => c.pathname), [TURNS_PATH, CONSENT_PATH, MAIA_PATH]);
  const pre = calls[1].body;
  const send = calls[2].body;
  assert.equal(pre.privacyChoice, 'continuity');
  assert.equal(pre.explicitChoice, true);
  assert.equal(pre.explicitRemembrance, true);
  assert.equal(pre.message, undefined);
  assert.equal(pre.memberId, undefined);
  assert.equal(send.message, 'FICTIONAL_PRIVATE_WORDS');
  assert.equal(send.sanctuary, false);
  assert.equal(send.exchangeId, pre.exchangeId);
  assert.equal(send.sessionId, pre.sessionId);
  assert.equal(send.includeAudio, true);
});

test('preflight refusal forbids a second MAIA request', async () => {
  const { conv, calls } = fixture({ consentRefused: true });
  conv.choosePrivacy('continuity');
  await conv.adoptMemberThread();
  const sent = await conv.ask('FICTIONAL_PRIVATE_WORDS');
  assert.equal(sent.ok, false);
  assert.deepEqual(calls.map(c => c.pathname), [TURNS_PATH, CONSENT_PATH]);
});

test('preflight network failure returns clear member feedback and sends no words', async () => {
  const { conv, calls } = fixture({ consentThrows: true });
  conv.choosePrivacy('continuity');
  await conv.adoptMemberThread();
  const sent = await conv.ask('FICTIONAL_PRIVATE_WORDS');
  assert.equal(sent.ok, false);
  assert.match(sent.error, /privacy verification/i);
  assert.deepEqual(calls.map(c => c.pathname), [TURNS_PATH, CONSENT_PATH]);
});

test('fabricated success with a mismatching receipt refuses MAIA processing', async () => {
  const { conv, calls } = fixture({ badReceipt: true });
  conv.choosePrivacy('continuity');
  await conv.adoptMemberThread();
  const sent = await conv.ask('FICTIONAL_PRIVATE_WORDS');
  assert.equal(sent.ok, false);
  assert.deepEqual(calls.map(c => c.pathname), [TURNS_PATH, CONSENT_PATH]);
});

test('Sanctuary starts a fresh unadopted conversation and refuses external transcription', async () => {
  const { conv, calls } = fixture();
  assert.equal(conv.choosePrivacy('sanctuary').ok, true);
  assert.equal(conv.privacyState().ready, true);
  const transcribed = await conv.transcribe(new Float32Array(1600), 16000);
  assert.equal(transcribed.ok, false);
  assert.match(transcribed.error, /Sanctuary voice/i);
  assert.equal(calls.length, 0);
  const answered = await conv.ask('FICTIONAL_PROTECTED_WORDS');
  assert.equal(answered.ok, true);
  assert.equal(answered.audio, null);
  assert.deepEqual(calls.map(c => c.pathname), [CONSENT_PATH, MAIA_PATH]);
  assert.equal(calls[0].body.privacyChoice, 'sanctuary');
  assert.equal(calls[0].body.explicitRemembrance, false);
  assert.equal(calls[1].body.sanctuary, true);
  assert.equal(calls[1].body.includeAudio, false);
});

test('a second renderer request cannot change privacy mid-encounter', async () => {
  const { conv } = fixture();
  assert.equal(conv.choosePrivacy('sanctuary').ok, true);
  assert.equal(conv.choosePrivacy('sanctuary').ok, true);
  assert.equal(conv.choosePrivacy('continuity').ok, false);
  assert.equal(conv.privacyState().privacyChoice, 'sanctuary');
  assert.equal(conv.choosePrivacy('invalid').ok, false);
});

test('another signed-in conversation starts with no inherited privacy choice', () => {
  const first = fixture().conv;
  first.choosePrivacy('continuity');
  const second = fixture().conv;
  assert.equal(first.privacyState().privacyChoice, 'continuity');
  assert.equal(second.privacyState().privacyChoice, null);
});

test('background continuity polling has no member-history authority before choice', async () => {
  const { conv, calls } = fixture();
  const published = [];
  const continuity = createContinuity({
    conversation: () => conv,
    session: () => ({ state: () => ({ signedIn: true, member: { username: 'fictional-user' } }) }),
    publish: (m) => published.push(m),
  });
  const joined = await continuity.join();
  assert.equal(joined.ok, false);
  assert.equal(calls.length, 0);
  assert.equal(published.length, 0);
  continuity.stop();
});

test('Quick Settings cannot claim privacy authority from cached local state', () => {
  const quick = readFileSync(path.join(src, '..', '..', 'components', 'QuickSettingsSheet.tsx'), 'utf8');
  const oracle = readFileSync(path.join(src, '..', '..', 'components', 'OracleConversation.tsx'), 'utf8');
  assert.match(quick, /privacyChoice.*null/);
  assert.match(quick, /Privacy cannot be changed by Quick Settings/);
  assert.ok(!quick.includes("updateSetting('sanctuary'"));
  assert.ok(oracle.includes('privacyChoice={explicitSessionPrivacyChoice}'));
});

test('native privileged handlers gate text, microphone, and consent separately', () => {
  const main = readFileSync(path.join(src, 'main.js'), 'utf8');
  const preload = readFileSync(path.join(src, 'preload.js'), 'utf8');
  const renderer = readFileSync(path.join(src, 'renderer.js'), 'utf8');
  for (const channel of ['maia:choose-privacy', 'maia:privacy-state']) {
    assert.ok(main.includes(channel));
    assert.ok(preload.includes(channel));
  }
  assert.ok(main.includes("if (!currentPrivacy().ready)"));
  assert.ok(main.includes("currentPrivacy().privacyChoice !== 'continuity'"));
  assert.ok(renderer.includes('privacySnapshot.privacyChoice'));
  assert.ok(renderer.indexOf('if (privacySnapshot.privacyChoice !==') <
            renderer.indexOf('navigator.mediaDevices.getUserMedia'));
  assert.ok(!preload.includes('x-session-token'));
});

test('native named consent bridge has no arbitrary IPC access', () => {
  const preload = readFileSync(path.join(src, 'preload.js'), 'utf8');
  assert.ok(preload.includes('choosePrivacy: (choice)'));
  assert.ok(preload.includes('getPrivacyState: ()'));
  assert.ok(!preload.includes('invoke: (channel'));
  assert.ok(!preload.includes('sessionToken:'));
});
