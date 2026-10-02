'use client';

import { useRef, useState } from 'react';
import { readTranscript } from '@/lib/voice/transcribeResponse';

type Status =
  | { kind: 'idle' }
  | { kind: 'recording' }
  | { kind: 'transcribing' }
  | { kind: 'error'; message: string; retryable: boolean };

type Props = {
  disabled?: boolean;
  onAsk: (text: string) => void;
};

function mimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const type of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']) {
    if (typeof MediaRecorder.isTypeSupported !== 'function' || MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

export default function P4R1VoiceCapture({ disabled, onAsk }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [transcript, setTranscript] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const retryBlobRef = useRef<Blob | null>(null);

  const cleanUpStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const transcribe = async (blob: Blob) => {
    retryBlobRef.current = blob;
    setStatus({ kind: 'transcribing' });
    try {
      const form = new FormData();
      form.append('file', blob, 'writers-studio-capture.webm');
      const response = await fetch('/api/voice/transcribe-simple', {
        method: 'POST',
        body: form,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = typeof payload?.error === 'string'
          ? payload.error
          : 'Voice transcription is unavailable just now.';
        setStatus({ kind: 'error', message, retryable: response.status >= 500 });
        return;
      }

      const text = readTranscript(payload);
      if (!text) {
        setStatus({ kind: 'error', message: 'Nothing was transcribed. You can try again.', retryable: true });
        return;
      }

      retryBlobRef.current = null;
      setTranscript(text);
      setStatus({ kind: 'idle' });
    } catch {
      setStatus({ kind: 'error', message: 'Voice transcription could not be reached. You can try again.', retryable: true });
    }
  };

  const start = async () => {
    if (disabled || status.kind === 'recording' || status.kind === 'transcribing') return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setStatus({ kind: 'error', message: 'Voice capture is not available in this browser.', retryable: false });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = mimeType();
      const recorder = type ? new MediaRecorder(stream, { mimeType: type }) : new MediaRecorder(stream);
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        cleanUpStream();
        recorderRef.current = null;
        setStatus({ kind: 'error', message: 'Recording stopped unexpectedly. Nothing was sent.', retryable: false });
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        recorderRef.current = null;
        cleanUpStream();
        if (blob.size === 0) {
          setStatus({ kind: 'error', message: 'No audio was captured. Nothing was sent.', retryable: false });
          return;
        }
        void transcribe(blob);
      };

      recorder.start();
      setStatus({ kind: 'recording' });
    } catch {
      cleanUpStream();
      setStatus({ kind: 'error', message: 'Microphone unavailable. Check browser permission.', retryable: false });
    }
  };

  const stop = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
  };

  const discard = () => {
    setTranscript('');
    retryBlobRef.current = null;
    setStatus({ kind: 'idle' });
  };

  const ask = () => {
    const words = transcript.trim();
    if (!words || disabled) return;
    onAsk([
      'These are words I just spoke while working with this passage.',
      'Treat them as my current spoken intention or thinking — not as manuscript text.',
      '',
      words,
      '',
      'Reflect what I seem to be trying to do before offering anything new.',
      'Do not insert, save, or apply these spoken words to the manuscript automatically.',
      'If I later want wording from them, let me choose that explicitly.',
    ].join('\n'));
    setTranscript('');
    setStatus({ kind: 'idle' });
  };

  return (
    <section className="p4r1-voice-capture" data-writers-voice-capture>
      <header>
        <div>
          <span className="p4r1-eyebrow">Or speak</span>
          <p>Your audio is sent only for local transcription. The transcript stays here until you choose what to do with it.</p>
        </div>
        {status.kind === 'recording' ? (
          <button type="button" className="p4r1-voice-stop" onClick={stop}>
            <span aria-hidden="true" />
            Stop &amp; transcribe
          </button>
        ) : (
          <button
            type="button"
            className="p4r1-voice-start"
            disabled={disabled || status.kind === 'transcribing'}
            onClick={() => void start()}
          >
            {status.kind === 'transcribing' ? 'Transcribing…' : 'Speak'}
          </button>
        )}
      </header>

      {status.kind === 'error' ? (
        <div className="p4r1-voice-error" role="status">
          <p>{status.message}</p>
          {status.retryable && retryBlobRef.current ? (
            <button type="button" onClick={() => void transcribe(retryBlobRef.current!)}>Retry transcription</button>
          ) : null}
        </div>
      ) : null}

      {transcript ? (
        <div className="p4r1-voice-transcript">
          <div>
            <span className="p4r1-eyebrow">Spoken intention · not manuscript text</span>
            <button type="button" onClick={discard}>Discard</button>
          </div>
          <textarea
            value={transcript}
            disabled={disabled}
            onChange={(event) => setTranscript(event.target.value)}
            aria-label="Edit voice transcript before asking MAIA"
          />
          <footer>
            <span>You can correct the transcript before anything enters the conversation.</span>
            <button type="button" disabled={disabled || !transcript.trim()} onClick={ask}>Ask MAIA with this</button>
          </footer>
        </div>
      ) : null}
    </section>
  );
}
