/**
 * @jest-environment jsdom
 */
/**
 * VOICE-SOVEREIGNTY-03 — the member-facing gesture, as executed.
 *
 * The gate policy and the storage write are proven elsewhere. This suite proves
 * the part a member actually touches: that the two buttons send the two answers,
 * that answering settles the question, and — the load-bearing one — that
 * answering does NOT resend or regenerate the turn.
 *
 * ⭐ WHY THE NO-REPLAY ASSERTION IS THE POINT. A consent answer that re-ran the
 *   turn would re-synthesise words the member already heard, in a voice they
 *   only just authorised, without their asking. Consent to a future boundary is
 *   not consent to repeat the past. Nothing in the type system prevents someone
 *   later adding a helpful "and now speak it properly" — so it is asserted.
 */

// jsdom ships neither TextEncoder/TextDecoder nor crypto.randomUUID. The hook
// decodes the SSE stream with TextDecoder and mints a turn ID from randomUUID,
// so without these the request fails and the hook takes its offline presence
// fallback — which looks exactly like "the event never arrived". Polyfilled
// here rather than in the shared domSetup so this suite cannot change the
// environment other suites run in.
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as { crypto?: unknown }).crypto = {};
}
if (typeof globalThis.crypto.randomUUID !== 'function') {
  let n = 0;
  (globalThis.crypto as { randomUUID: () => string }).randomUUID = () =>
    `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}` as `${string}-${string}-${string}-${string}-${string}`;
}

import { TextEncoder as NodeTextEncoder, TextDecoder as NodeTextDecoder } from 'node:util';

if (typeof globalThis.TextEncoder === 'undefined') {
  (globalThis as { TextEncoder?: unknown }).TextEncoder = NodeTextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  (globalThis as { TextDecoder?: unknown }).TextDecoder = NodeTextDecoder;
}

import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

// Every network call the hook can make, captured. `apiFetch` is the project's
// Capacitor-safe wrapper (lib/http/apiBase) — mocking it rather than global
// fetch is what lets the no-replay assertion see a stream-conversation POST if
// one were ever made.
const calls: Array<{ url: string; body: unknown }> = [];

/** SSE frames the fake server will emit for the next stream-conversation call. */
let sseFrames: string[] = [];

function sseBody(frames: string[]) {
  const enc = new TextEncoder();
  let i = 0;
  return {
    getReader: () => ({
      read: async () =>
        i < frames.length
          ? { done: false, value: enc.encode(frames[i++]) }
          : { done: true, value: undefined },
      releaseLock: () => {},
      cancel: async () => {},
    }),
  };
}

// `apiFetch` is the project's Capacitor-safe wrapper (lib/http/apiBase). Mocking
// it rather than global fetch is what lets the no-replay assertion SEE a
// stream-conversation POST if one were ever made by answering.
jest.mock('@/lib/http/apiBase', () => ({
  apiFetch: (url: string, init?: RequestInit) => {
    calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : null });
    if (url.includes('stream-conversation')) {
      return Promise.resolve({ ok: true, status: 200, body: sseBody(sseFrames) });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true, storedPreference: 'cloud' }),
    });
  },
  getValidMemberId: () => 'member-test',
}));

jest.mock('@/lib/offline/presenceFallback', () => ({
  isProbablyOnline: () => true,
  generatePresenceFallback: () => 'offline',
}));

import { useStreamingVoice, type CloudVoiceConsentRequest } from '@/hooks/useStreamingVoice';
import { CloudVoiceConsentPrompt } from '../CloudVoiceConsentPrompt';

const REQUEST: CloudVoiceConsentRequest = {
  voiceArchetype: 'maia_core',
  voiceLabel: 'Maia',
  provider: 'openai',
  voice: 'alloy',
  storedPreference: 'auto',
};

type HookApi = ReturnType<typeof useStreamingVoice>;

let container: HTMLDivElement;
let root: Root;
let api: HookApi;

function Harness() {
  api = useStreamingVoice({});
  return (
    <CloudVoiceConsentPrompt
      request={api.cloudVoiceConsent}
      onAnswer={api.answerCloudVoiceConsent}
    />
  );
}

beforeEach(() => {
  calls.length = 0;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => { root.render(<Harness />); });
});

afterEach(() => {
  act(() => { root.unmount(); });
  container.remove();
});

/**
 * Drive the hook into the pending-question state THROUGH THE REAL SSE PATH.
 *
 * ⭐ Deliberately not by rendering the prompt with a literal request object. An
 *   earlier draft did that, which made "answering clears the pending prompt"
 *   trivially true — hook state started null and was never set, so the assertion
 *   proved nothing. Driving the actual `cloud_voice_consent_required` frame
 *   exercises the SSE case as well, which is the wiring most likely to rot.
 */
async function raiseQuestion() {
  sseFrames = [
    'event: cloud_voice_consent_required\n' +
      `data: ${JSON.stringify(REQUEST)}\n\n`,
  ];
  await act(async () => { await api.sendMessage('hello'); });
  calls.length = 0; // the turn itself is not what these assertions are about
}

function buttonByText(text: string): HTMLButtonElement {
  const found = Array.from(container.querySelectorAll('button'))
    .find(b => b.textContent?.trim() === text);
  if (!found) {
    throw new Error(
      `no button labelled "${text}" — found: ${Array.from(container.querySelectorAll('button'))
        .map(b => JSON.stringify(b.textContent?.trim())).join(', ') || '(none)'}`,
    );
  }
  return found as HTMLButtonElement;
}

function click(button: HTMLButtonElement) {
  act(() => { button.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
}

describe('the two answers', () => {
  it('"Allow cloud voice" POSTs { allow: true }', async () => {
    await raiseQuestion();
    click(buttonByText('Allow cloud voice'));
    await act(async () => {});

    const consent = calls.filter(c => c.url === '/api/voice/cloud-consent');
    expect(consent).toHaveLength(1);
    expect(consent[0].body).toEqual({ allow: true });
  });

  it('"Keep voice local" POSTs { allow: false }', async () => {
    await raiseQuestion();
    click(buttonByText('Keep voice local'));
    await act(async () => {});

    const consent = calls.filter(c => c.url === '/api/voice/cloud-consent');
    expect(consent).toHaveLength(1);
    expect(consent[0].body).toEqual({ allow: false });
  });

  it('the decline button is NOT labelled as a deferral', async () => {
    // ⭐ allow:false durably stores tts_provider='local' and the member is never
    // asked again. "Not now" described a deferral this has never been. A durable
    // choice mislabelled as temporary misrepresents the act at the moment of
    // consent — the worst possible moment to be imprecise.
    await raiseQuestion();
    const labels = Array.from(container.querySelectorAll('button')).map(b => b.textContent?.trim());
    expect(labels).toContain('Keep voice local');
    expect(labels).not.toContain('Not now');
    expect(labels).not.toContain('Later');
  });
});

describe('answering settles the question', () => {
  it.each([['Allow cloud voice', true], ['Keep voice local', false]] as const)(
    '%s clears the pending prompt',
    async (label) => {
      await raiseQuestion();
      click(buttonByText(label));
      await act(async () => {});

      // The Harness renders straight from hook state, so an empty container is
      // the surface agreeing that the question is settled.
      expect(api.cloudVoiceConsent).toBeNull();
      expect(container.querySelector('button')).toBeNull();
    },
  );
});

describe('answering does not touch the turn', () => {
  it.each([['Allow cloud voice'], ['Keep voice local']])(
    '%s makes exactly one request, and not to stream-conversation',
    async (label) => {
      await raiseQuestion();
      click(buttonByText(label));
      await act(async () => {});

      // ⛔ No replay, no regeneration, no re-request of audio. Exactly one call,
      //    and it is the narrow consent write.
      expect(calls).toHaveLength(1);
      expect(calls[0].url).toBe('/api/voice/cloud-consent');
      expect(calls.some(c => c.url.includes('stream-conversation'))).toBe(false);
    },
  );

  it('sends nothing but the answer — no transcript, no voice settings', async () => {
    await raiseQuestion();
    click(buttonByText('Allow cloud voice'));
    await act(async () => {});

    // The consent act must not be able to carry identity or content across the
    // axis boundary, so the body has exactly one key.
    expect(Object.keys(calls[0].body as object)).toEqual(['allow']);
  });
});

describe('nothing is asked when there is nothing to ask', () => {
  it('renders nothing for a null request', () => {
    act(() => { root.render(<CloudVoiceConsentPrompt request={null} onAnswer={() => {}} />); });
    expect(container.textContent).toBe('');
  });

  it('never renders the internal archetype ID', async () => {
    // voiceArchetypes.ts:14 — DB IDs are internal and never shown to members.
    await raiseQuestion();
    expect(container.textContent).not.toContain('maia_core');
    expect(container.textContent).toContain('Maia');
  });
});
