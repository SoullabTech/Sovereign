'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Sparkles,
  TrendingUp, Heart, Target, X, Download
} from 'lucide-react';
import { VoiceJournalSession } from '@/lib/journaling/VoiceJournalingService';
import { voiceJournalExporter } from '@/lib/journaling/VoiceJournalExport';
import { JOURNALING_MODES } from '@/lib/journaling/JournalingPrompts';

interface VoiceSessionReplayProps {
  session: VoiceJournalSession;
  onClose?: () => void;
}

interface TranscriptSegment {
  text: string;
  start: number; // seconds
  end: number;
  symbols?: string[];
  intensity?: number;
}

export default function VoiceSessionReplay({ session, onClose }: VoiceSessionReplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [showSymbols, setShowSymbols] = useState(true);
  const [showIntensity, setShowIntensity] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const duration = session.duration || 0;
  const modeInfo = JOURNALING_MODES[session.mode];

  useEffect(() => {
    const segs = generateSegments(session);
    setSegments(segs);
  }, [session]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.1;
          if (next >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return next;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, duration]);

  const generateSegments = (sess: VoiceJournalSession): TranscriptSegment[] => {
    const words = sess.transcript.split(/\s+/);
    const wordsPerSecond = words.length / (sess.duration || 1);
    const segmentSize = 20; // words per segment

    const segs: TranscriptSegment[] = [];
    let currentStart = 0;

    for (let i = 0; i < words.length; i += segmentSize) {
      const segmentWords = words.slice(i, i + segmentSize);
      const segmentText = segmentWords.join(' ');
      const segmentDuration = segmentWords.length / wordsPerSecond;

      const symbols = sess.analysis?.symbols?.filter(() => Math.random() > 0.7) || [];

      segs.push({
        text: segmentText,
        start: currentStart,
        end: currentStart + segmentDuration,
        symbols: symbols.length > 0 ? symbols.slice(0, 2) : undefined,
        intensity: Math.random(),
      });

      currentStart += segmentDuration;
    }

    return segs;
  };

  const getCurrentSegment = (): TranscriptSegment | null => {
    return segments.find(s => currentTime >= s.start && currentTime < s.end) || null;
  };

  const getTransformationProgress = (): number => {
    if (!session.analysis?.transformationScore) return 0;
    return (currentTime / duration) * session.analysis.transformationScore;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkip = (seconds: number) => {
    setCurrentTime(prev => Math.max(0, Math.min(duration, prev + seconds)));
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    setCurrentTime(percentage * duration);
  };

  const handleExport = (format: 'markdown' | 'pdf') => {
    if (format === 'markdown') {
      voiceJournalExporter.downloadAsMarkdown(session);
    } else {
      voiceJournalExporter.downloadAsPDF(session);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSegment = getCurrentSegment();
  const transformationProgress = getTransformationProgress();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-neutral-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">{modeInfo.icon}</span>
                Session Replay
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                {new Date(session.startTime).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('markdown')}
                className="p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
                title="Export as Markdown"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-300">{session.wordCount} words</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                session.element === 'fire' ? 'bg-orange-500' :
                session.element === 'water' ? 'bg-blue-500' :
                session.element === 'earth' ? 'bg-green-500' :
                session.element === 'air' ? 'bg-sky-500' :
                'bg-purple-500'
              }`} />
              <span className="text-neutral-300 capitalize">{session.element}</span>
            </div>
            {session.analysis?.transformationScore && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-300">{session.analysis.transformationScore}% transformation</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 max-h-[50vh] overflow-y-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              {currentSegment && (
                <motion.div
                  key={currentSegment.start}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
                    <p className="text-lg text-white leading-relaxed">
                      {currentSegment.text}
                    </p>
                  </div>

                  {showSymbols && currentSegment.symbols && currentSegment.symbols.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-wrap gap-2"
                    >
                      {currentSegment.symbols.map((symbol, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30"
                        >
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span className="text-sm text-purple-300">{symbol}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {showIntensity && currentSegment.intensity !== undefined && (
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-rose-400" />
                      <div className="flex-1 h-2 bg-neutral-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${currentSegment.intensity * 100}%` }}
                          className="h-full bg-gradient-to-r from-rose-500 to-pink-500"
                        />
                      </div>
                      <span className="text-xs text-neutral-400">
                        {(currentSegment.intensity * 100).toFixed(0)}% intensity
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {session.analysis && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-300">Transformation Progress</span>
                </div>
                <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${transformationProgress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-neutral-700 space-y-4">
          <div
            className="relative h-2 bg-neutral-700 rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-transform group-hover:scale-125"
              style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
            />

            {segments.map((seg, i) => (
              seg.symbols && seg.symbols.length > 0 && (
                <div
                  key={i}
                  className="absolute top-0 w-1 h-full bg-purple-400"
                  style={{ left: `${(seg.start / duration) * 100}%` }}
                  title={seg.symbols.join(', ')}
                />
              )
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">{formatTime(currentTime)}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSkip(-10)}
                className="p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={handlePlayPause}
                className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button
                onClick={() => handleSkip(10)}
                className="p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
            <span className="text-sm text-neutral-400">{formatTime(duration)}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSymbols(!showSymbols)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                showSymbols
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {showSymbols ? '✓' : ''} Symbols
            </button>
            <button
              onClick={() => setShowIntensity(!showIntensity)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                showIntensity
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {showIntensity ? '✓' : ''} Intensity
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}