'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

/** Preserve every word and keep each request inside the existing TTS limit. */
export function speechChunks(text: string): string[] {
  const chunks: string[] = [];
  let remaining = text.trim();
  while (remaining.length > 3000) {
    let end = remaining.lastIndexOf(' ', 3000);
    if (end < 1000) end = 3000;
    // Never split a surrogate pair.
    if (/^[\uDC00-\uDFFF]$/.test(remaining[end])) end--;
    chunks.push(remaining.slice(0, end)); remaining = remaining.slice(end).trimStart();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}
const STOP_EVENT = 'ws-stop-maia-reading';
export default function MaiaListen({ text, active = true }: { text: string; active?: boolean }) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const url = useRef<string | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const clearAudio = useCallback(() => {
    if (audio.current) { audio.current.pause(); audio.current.removeAttribute('src'); audio.current = null; }
    if (url.current) { URL.revokeObjectURL(url.current); url.current = null; }
  }, []);
  const stop = useCallback(() => {
    request.current?.abort(); request.current = null; clearAudio(); setState('idle');
  }, [clearAudio]);
  useEffect(() => {
    setError(null); stop();
    const dialog = button.current?.closest('dialog');
    window.addEventListener(STOP_EVENT, stop);
    dialog?.addEventListener('close', stop);
    return () => { stop(); window.removeEventListener(STOP_EVENT, stop); dialog?.removeEventListener('close', stop); };
  }, [text, active, stop]);
  const listen = async () => {
    if (!active || !text.trim()) return;
    window.dispatchEvent(new Event(STOP_EVENT));
    const controller = new AbortController(); request.current = controller;
    setError(null); setState('loading');
    try {
      for (const chunk of speechChunks(text)) {
        if (controller.signal.aborted) return;
        setState('loading');
        const response = await apiFetch('/api/voice/openai-tts', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
          body: JSON.stringify({ text: chunk, voice: 'maia_core', format: 'mp3', speed: 1 }),
        });
        if (!response.ok) throw new Error('Voice unavailable');
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        url.current = URL.createObjectURL(blob);
        const player = new Audio(url.current); audio.current = player;
        await new Promise<void>((resolve, reject) => {
          const abort = () => resolve();
          const finish = () => { controller.signal.removeEventListener('abort', abort); resolve(); };
          controller.signal.addEventListener('abort', abort, { once: true });
          player.onended = finish;
          player.onerror = () => { controller.signal.removeEventListener('abort', abort); reject(new Error('Playback unavailable')); };
          player.play().then(() => { if (!controller.signal.aborted) setState('playing'); }).catch(reject);
        });
        if (controller.signal.aborted) return;
        clearAudio();
      }
    } catch {
      if (!controller.signal.aborted) setError('MAIA’s voice is unavailable right now. You can retry; the text remains here.');
    } finally {
      if (request.current === controller) { request.current = null; clearAudio(); setState('idle'); }
    }
  };
  return <span className="ws-maia-listen">
    <button ref={button} type="button" disabled={!active || !text.trim()} onClick={() => state === 'idle' ? void listen() : stop()} aria-label={state === 'idle' ? 'Listen to MAIA' : 'Stop MAIA playback'}>
      {state === 'idle' ? '♫ Listen to MAIA' : state === 'loading' ? 'Stop · Preparing voice…' : '■ Stop MAIA'}
    </button>
    {error && <span role="status">{error}</span>}
  </span>;
}
