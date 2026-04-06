'use client';

import { useState } from 'react';
import type { MediaTranscriptRow, TranscriptSegment } from '@/lib/media/types';

interface TranscriptViewerProps {
  transcript: MediaTranscriptRow;
  onSeek?: (time: number) => void;
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function TranscriptViewer({ transcript, onSeek }: TranscriptViewerProps) {
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const segments = (transcript.segments || []) as TranscriptSegment[];

  if (!transcript.full_text && segments.length === 0) {
    return (
      <div className="text-center text-white/30 py-8 text-sm">
        No transcript available
      </div>
    );
  }

  // If we have segments, show timestamped view
  if (segments.length > 0) {
    return (
      <div className="space-y-1">
        {/* Summary */}
        {transcript.summary && (
          <div className="mb-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
            <h4 className="text-xs font-medium text-amber-400/80 mb-1">Summary</h4>
            <p className="text-sm text-white/60 leading-relaxed">{transcript.summary}</p>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 mb-3 text-xs text-white/30">
          <span>{transcript.word_count?.toLocaleString()} words</span>
          <span>{segments.length} segments</span>
          {transcript.speaker_count && <span>{transcript.speaker_count} speakers</span>}
          <span>{transcript.engine}</span>
        </div>

        {/* Segments */}
        <div className="space-y-0.5 max-h-[500px] overflow-y-auto">
          {segments.map((seg, i) => (
            <div
              key={i}
              className={`flex gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                activeSegment === i ? 'bg-amber-500/10' : 'hover:bg-white/5'
              }`}
              onClick={() => {
                setActiveSegment(i);
                onSeek?.(seg.start);
              }}
            >
              <span className="text-[10px] text-amber-400/40 font-mono whitespace-nowrap pt-0.5 min-w-[40px]">
                {formatTimestamp(seg.start)}
              </span>
              {seg.speaker && (
                <span className="text-[10px] text-purple-400/60 whitespace-nowrap pt-0.5">
                  [{seg.speaker}]
                </span>
              )}
              <span className="text-sm text-white/70 leading-relaxed">
                {seg.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback: plain text
  return (
    <div>
      {transcript.summary && (
        <div className="mb-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
          <h4 className="text-xs font-medium text-amber-400/80 mb-1">Summary</h4>
          <p className="text-sm text-white/60 leading-relaxed">{transcript.summary}</p>
        </div>
      )}
      <pre className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
        {transcript.full_text}
      </pre>
    </div>
  );
}
