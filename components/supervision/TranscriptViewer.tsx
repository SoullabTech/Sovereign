'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, MessageSquare, ChevronDown } from 'lucide-react';

interface TranscriptSegment {
  id: string;
  speaker: string;
  speakerConfidence?: number;
  startMs: number;
  endMs: number;
  text: string;
  confidence?: number;
}

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  isLive?: boolean;
  highlightedSegmentId?: string;
  onSegmentClick?: (segment: TranscriptSegment) => void;
  maxHeight?: string;
}

// Speaker colors mapping
const SPEAKER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  therapist: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  client: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  supervisor: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  unknown: { bg: 'bg-stone-500/10', border: 'border-stone-500/30', text: 'text-stone-400' },
  // Fallback for numbered speakers
  'speaker_0': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  'speaker_1': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  'speaker_2': { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  'speaker_3': { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' }
};

function getSpeakerColor(speaker: string) {
  const normalized = speaker.toLowerCase().replace(/\s+/g, '_');
  return SPEAKER_COLORS[normalized] || SPEAKER_COLORS.unknown;
}

function formatTimestamp(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function TranscriptViewer({
  segments,
  isLive = false,
  highlightedSegmentId,
  onSegmentClick,
  maxHeight = '400px'
}: TranscriptViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll to bottom when new segments arrive (if enabled)
  useEffect(() => {
    if (autoScroll && scrollRef.current && isLive) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments, autoScroll, isLive]);

  // Track scroll position
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
    setShowScrollButton(!isNearBottom && segments.length > 5);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setAutoScroll(true);
    }
  };

  // Group consecutive segments by speaker
  const groupedSegments = segments.reduce<Array<TranscriptSegment[]>>((groups, segment) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup[0].speaker === segment.speaker) {
      lastGroup.push(segment);
    } else {
      groups.push([segment]);
    }
    return groups;
  }, []);

  if (segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-stone-500">
        <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">
          {isLive ? 'Waiting for transcript...' : 'No transcript available'}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-transparent"
        style={{ maxHeight }}
      >
        <AnimatePresence initial={false}>
          {groupedSegments.map((group, groupIndex) => {
            const speaker = group[0].speaker;
            const colors = getSpeakerColor(speaker);
            const startTime = group[0].startMs;

            return (
              <motion.div
                key={`group-${groupIndex}-${group[0].id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative pl-4 border-l-2 ${colors.border}`}
              >
                {/* Speaker Header */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-sm font-medium ${colors.text} capitalize`}>
                    {speaker.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-stone-500">
                    {formatTimestamp(startTime)}
                  </span>
                </div>

                {/* Grouped Messages */}
                <div className="space-y-1">
                  {group.map((segment) => {
                    const isHighlighted = segment.id === highlightedSegmentId;

                    return (
                      <motion.div
                        key={segment.id}
                        onClick={() => onSegmentClick?.(segment)}
                        className={`
                          py-1.5 px-2 rounded-lg cursor-pointer transition-colors
                          ${isHighlighted
                            ? 'bg-amber-500/20 border border-amber-500/30'
                            : `${colors.bg} hover:bg-stone-700/30`
                          }
                        `}
                      >
                        <p className="text-stone-200 text-sm leading-relaxed">
                          {segment.text}
                        </p>
                        {segment.confidence !== undefined && segment.confidence < 0.8 && (
                          <span className="text-xs text-stone-500 italic">
                            (confidence: {(segment.confidence * 100).toFixed(0)}%)
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Live indicator */}
        {isLive && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 text-stone-500 text-sm"
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            Transcribing...
          </motion.div>
        )}
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-2 right-2 p-2 bg-stone-800 hover:bg-stone-700 border border-stone-600 rounded-full shadow-lg transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-stone-300" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
