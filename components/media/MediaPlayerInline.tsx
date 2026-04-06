'use client';

import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface MediaPlayerInlineProps {
  assetId: string;
  projectId: string;
  mediaType: 'audio' | 'video';
  mimeType?: string;
  onTimeUpdate?: (time: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function MediaPlayerInline({
  assetId, projectId, mediaType, mimeType, onTimeUpdate,
}: MediaPlayerInlineProps) {
  const ref = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  const src = `/api/media/projects/${projectId}/assets/${assetId}/serve`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleTime = () => {
      setCurrentTime(el.currentTime);
      onTimeUpdate?.(el.currentTime);
    };
    const handleDuration = () => setDuration(el.duration || 0);
    const handleEnded = () => setPlaying(false);

    el.addEventListener('timeupdate', handleTime);
    el.addEventListener('loadedmetadata', handleDuration);
    el.addEventListener('ended', handleEnded);

    return () => {
      el.removeEventListener('timeupdate', handleTime);
      el.removeEventListener('loadedmetadata', handleDuration);
      el.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate]);

  const togglePlay = () => {
    const el = ref.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      el.play();
    }
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    el.currentTime = ratio * duration;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Expose seekTo via ref
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__mediaPlayerSeek = (time: number) => {
      const el = ref.current;
      if (el) el.currentTime = time;
    };
  }, []);

  return (
    <div className="bg-[#0d0d1a] rounded-lg overflow-hidden">
      {mediaType === 'video' ? (
        <video
          ref={ref as React.RefObject<HTMLVideoElement>}
          src={src}
          muted={muted}
          className="w-full aspect-video bg-black"
          playsInline
        />
      ) : (
        <audio ref={ref as React.RefObject<HTMLAudioElement>} src={src} muted={muted} />
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 px-3 py-2">
        <button onClick={togglePlay} className="text-white/70 hover:text-white">
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <span className="text-xs text-white/40 font-mono min-w-[36px]">
          {formatTime(currentTime)}
        </span>

        <div
          className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer"
          onClick={seek}
        >
          <div
            className="h-full bg-amber-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-xs text-white/40 font-mono min-w-[36px]">
          {formatTime(duration)}
        </span>

        <button onClick={() => setMuted(!muted)} className="text-white/40 hover:text-white">
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
