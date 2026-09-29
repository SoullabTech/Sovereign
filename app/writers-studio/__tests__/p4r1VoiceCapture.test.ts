/** @jest-environment jsdom */
import fs from 'node:fs';
import path from 'node:path';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import P4R1VoiceCapture from '@/app/dev/writers-studio-pc3-live/P4R1VoiceCapture';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;
let fetchMock: jest.Mock;

class FakeTrack {
  stop = jest.fn();
}

class FakeMediaRecorder {
  static isTypeSupported = jest.fn(() => true);
  state: RecordingState = 'inactive';
  mimeType = 'audio/webm';
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(_stream: MediaStream, _options?: MediaRecorderOptions) {}

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['voice-bytes'], { type: 'audio/webm' }) } as BlobEvent);
    this.onstop?.();
  }
}

beforeEach(() => {
  jest.clearAllMocks();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);

  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: jest.fn(async () => ({
        getTracks: () => [new FakeTrack()],
      })),
    },
  });

  (globalThis as any).MediaRecorder = FakeMediaRecorder;
  fetchMock = jest.fn();
  (globalThis as any).fetch = fetchMock;
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const button = (text: string) =>
  Array.from(container.querySelectorAll('button')).find((node) =>
    node.textContent?.trim().startsWith(text)
  ) as HTMLButtonElement;

function voiceResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

test('voice is locally transcribed into an editable, unsent transcript until the member explicitly asks MAIA', async () => {
  const onAsk = jest.fn();
  fetchMock.mockResolvedValueOnce(voiceResponse(200, {
    success: true,
    transcription: 'I want this passage to feel less explanatory.',
    source: 'faster-whisper-local',
  }));

  act(() => root.render(React.createElement(P4R1VoiceCapture, { onAsk })));

  await act(async () => button('Speak').click());
  expect(button('Stop & transcribe')).toBeTruthy();

  await act(async () => {
    button('Stop & transcribe').click();
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0][0]).toBe('/api/voice/transcribe-simple');
  expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ method: 'POST' }));
  expect(onAsk).not.toHaveBeenCalled();

  const transcript = container.querySelector(
    'textarea[aria-label="Edit voice transcript before asking MAIA"]',
  ) as HTMLTextAreaElement;
  expect(transcript.value).toBe('I want this passage to feel less explanatory.');

  act(() => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!
      .call(transcript, 'I want this passage to trust the image more.');
    transcript.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(onAsk).not.toHaveBeenCalled();

  act(() => button('Ask MAIA with this').click());
  expect(onAsk).toHaveBeenCalledTimes(1);
  const prompt = onAsk.mock.calls[0][0] as string;
  expect(prompt).toContain('I want this passage to trust the image more.');
  expect(prompt).toContain('not as manuscript text');
  expect(prompt).toContain('Do not insert, save, or apply these spoken words to the manuscript automatically.');
  expect(container.querySelector('textarea[aria-label="Edit voice transcript before asking MAIA"]')).toBeNull();
});

test('discard removes a transcript without sending it anywhere', async () => {
  const onAsk = jest.fn();
  fetchMock.mockResolvedValueOnce(voiceResponse(200, {
    success: true,
    transcription: 'A disposable thought.',
  }));

  act(() => root.render(React.createElement(P4R1VoiceCapture, { onAsk })));
  await act(async () => button('Speak').click());
  await act(async () => {
    button('Stop & transcribe').click();
    await Promise.resolve();
    await Promise.resolve();
  });

  act(() => button('Discard').click());
  expect(onAsk).not.toHaveBeenCalled();
  expect(container.textContent).not.toContain('A disposable thought.');
});

test('feature-disabled transcription tells the truth and never creates a MAIA act', async () => {
  const onAsk = jest.fn();
  fetchMock.mockResolvedValueOnce(voiceResponse(410, {
    success: false,
    error: 'Audio transcription is disabled. Local-only by default.',
  }));

  act(() => root.render(React.createElement(P4R1VoiceCapture, { onAsk })));
  await act(async () => button('Speak').click());
  await act(async () => {
    button('Stop & transcribe').click();
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(container.textContent).toContain('Audio transcription is disabled. Local-only by default.');
  expect(onAsk).not.toHaveBeenCalled();
});

test('Writer Studio voice capture reuses only the non-persisting local transcription route', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1VoiceCapture.tsx'),
    'utf8',
  );
  expect(source).toContain("fetch('/api/voice/transcribe-simple'");
  expect(source).not.toMatch(/fetch\(['"]\/api\/voice\/transcribe['"]/);
  expect(source).not.toContain('voice_notes');
  expect(source).not.toContain('session_voice_notes');
  expect(source).not.toContain('memoryStore');
  expect(source).not.toContain('localStorage');
  expect(source).not.toContain('onEditBody');
});

test('voice capture is present in the Focus free-prompt seam, not a separate Studio mode', () => {
  const dance = fs.readFileSync(
    path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx'),
    'utf8',
  );
  expect(dance).toContain('<P4R1VoiceCapture');
  expect(dance).toContain('onAsk={(text) => props.onSend(withOrigin(text))}');
  expect(dance).not.toContain("mode='voice'");
});
