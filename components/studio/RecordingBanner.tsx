'use client';

/**
 * RecordingBanner — Persistent recording indicator shown across all Studio pages
 *
 * Displays: duration, audio levels (mic + tab), pause/stop, link back to Session Room
 */

import Link from 'next/link';
import { Pause, Play, Square, Radio, AlertCircle, X } from 'lucide-react';
import { useRecordingContext } from '@/lib/studio/RecordingContext';

function AudioLevelBar({ level, label }: { level: number; label: string }) {
  const bars = 6;
  const activeBars = Math.round(level * bars);

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-slate-400 w-6">{label}</span>
      <div className="flex gap-px">
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className={`w-1 h-3 rounded-sm transition-colors ${
              i < activeBars
                ? i < bars * 0.5
                  ? 'bg-emerald-400'
                  : i < bars * 0.8
                  ? 'bg-amber-400'
                  : 'bg-red-400'
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function RecordingBanner() {
  const {
    isRecording,
    isPaused,
    duration,
    audioLevels,
    hasTabAudio,
    tabAudioError,
    clearTabAudioError,
    pauseSession,
    resumeSession,
    stopSession,
  } = useRecordingContext();

  if (!isRecording) return null;

  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="bg-[#1a1020] border-b border-red-900/40 px-4 py-2 flex items-center gap-4 text-sm z-50">
      {/* Recording indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-red-500 animate-pulse'}`} />
        <span className="text-white font-medium text-xs">
          {isPaused ? 'PAUSED' : 'REC'}
        </span>
      </div>

      {/* Duration */}
      <span className="text-white font-mono text-sm tabular-nums">{timeStr}</span>

      {/* Divider */}
      <div className="w-px h-4 bg-slate-700" />

      {/* Audio levels */}
      <div className="flex items-center gap-3">
        <AudioLevelBar level={audioLevels.mic} label="Mic" />
        {hasTabAudio && <AudioLevelBar level={audioLevels.tab} label="Tab" />}
      </div>

      {/* Tab-audio status chip — surfaces mid-session warnings (e.g. presenter
          stopped sharing). Stays compact so it doesn't disrupt the banner. */}
      {tabAudioError && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          <span className="text-[11px] text-amber-200/90 max-w-[280px] truncate" title={tabAudioError}>
            {tabAudioError}
          </span>
          <button
            onClick={clearTabAudioError}
            className="text-amber-300/70 hover:text-amber-200"
            title="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Divider */}
      <div className="w-px h-4 bg-slate-700" />

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={isPaused ? resumeSession : pauseSession}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={stopSession}
          className="p-1.5 rounded hover:bg-red-900/40 text-red-400 hover:text-red-300 transition-colors"
          title="Stop recording"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Link back to Session Room */}
      <Link
        href="/studio/session-room"
        className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
      >
        <Radio className="w-3 h-3" />
        Open Session Studio
      </Link>
    </div>
  );
}
