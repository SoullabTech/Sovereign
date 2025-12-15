// frontend: components/maia/MaiaVoiceButton.tsx

import React, { useState } from 'react';

type MaiaVoiceButtonProps = {
  text: string;
};

export function MaiaVoiceButton({ text }: MaiaVoiceButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handlePlay() {
    if (!text?.trim()) return;

    try {
      setIsLoading(true);

      const res = await fetch('/api/sovereign/app/maia/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, format: 'mp3' }),
      });

      if (!res.ok) {
        console.error('MAIA TTS error:', await res.text());
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onplaying = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };

      await audio.play();
    } catch (err) {
      console.error('MAIA TTS play error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type='button'
      onClick={handlePlay}
      disabled={isLoading || !text?.trim()}
      className='inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm'
    >
      {isLoading ? 'Preparing voice…' : isPlaying ? 'Playing…' : 'Hear MAIA'}
    </button>
  );
}