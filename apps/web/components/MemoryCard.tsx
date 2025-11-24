"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Mic, BookOpen, Play, Pause, Download, Volume2 } from 'lucide-react';

export interface Memory {
  id: string;
  type: 'journal' | 'upload' | 'voice' | 'chat';
  title?: string;
  content: string;
  preview?: string;
  metadata?: {
    filename?: string;
    fileType?: string;
    mood?: string;
    tags?: string[];
    duration?: number;
    audioUrl?: string;
  };
  insights?: {
    archetype: string;
    confidence: number;
    symbol: string;
  }[];
  emotion?: {
    valence: number;      // -1 (negative) to +1 (positive)
    arousal: number;      // 0 (calm) to 1 (excited)
    dominance: number;    // 0 (submissive) to 1 (dominant)
    energySignature: string;
    primaryEmotion?: {
      emotion: string;
      intensity: number;
      color: string;
    };
  };
  createdAt: string;
}

interface MemoryCardProps {
  memory: Memory;
  onPlay?: (memoryId: string) => void;
  isPlaying?: boolean;
}

export function MemoryCard({ memory, onPlay, isPlaying }: MemoryCardProps) {
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isLocalPlaying, setIsLocalPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getIcon = () => {
    switch (memory.type) {
      case 'journal':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'upload':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'voice':
        return <Mic className="w-5 h-5 text-amber-500" />;
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    switch (memory.type) {
      case 'journal':
        return 'Journal Entry';
      case 'upload':
        return `Upload: ${memory.metadata?.fileType?.toUpperCase() || 'File'}`;
      case 'voice':
        return 'Voice Note';
      default:
        return 'Memory';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Draw static waveform visualization
  useEffect(() => {
    if (memory.type === 'voice' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = canvas.offsetWidth * 2; // Retina display
      canvas.height = 60;
      ctx.scale(2, 2);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw waveform bars
      const barCount = 50;
      const barWidth = canvas.offsetWidth / barCount / 2;
      const barGap = barWidth / 2;

      for (let i = 0; i < barCount; i++) {
        const height = Math.random() * 20 + 5;
        const x = i * (barWidth + barGap);
        const y = (30 - height) / 2;

        ctx.fillStyle = '#8b5cf650';
        ctx.fillRect(x, y, barWidth, height);
      }
    }
  }, [memory.type]);

  // Handle audio playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsLocalPlaying(false);
      setAudioProgress(0);
      if (onPlay) onPlay(memory.id);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [memory.id, onPlay]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isLocalPlaying) {
      audio.pause();
      setIsLocalPlaying(false);
    } else {
      audio.play();
      setIsLocalPlaying(true);
      if (onPlay) onPlay(memory.id);
    }
  };

  return (
    <div className="bg-background/40 backdrop-blur-sm border border-amber-500/20 rounded-lg p-4 hover:border-amber-500/40 hover:bg-background/60 transition-all">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs text-amber-400">{getTypeLabel()}</span>
            <span className="text-xs text-gray-500">{formatDate(memory.createdAt)}</span>
          </div>
          
          {memory.title && (
            <h3 className="font-medium text-white mb-1 truncate">
              {memory.title}
            </h3>
          )}
          
          {memory.type === 'voice' && memory.metadata?.audioUrl ? (
            <div className="space-y-3">
              {/* Waveform visualization */}
              <div className="relative bg-background/50 border border-amber-500/20 rounded-lg p-3">
                <canvas
                  ref={canvasRef}
                  className="w-full h-[30px]"
                  style={{ imageRendering: 'crisp-edges' }}
                />
                
                {/* Progress overlay */}
                <div
                  className="absolute top-0 left-0 h-full bg-amber-500/20 rounded-lg transition-all"
                  style={{ width: `${audioProgress}%` }}
                />
                
                {/* Hidden audio element */}
                <audio
                  ref={audioRef}
                  src={memory.metadata.audioUrl}
                  preload="metadata"
                  className="hidden"
                />
              </div>
              
              {/* Playback controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlayback}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  aria-label={isLocalPlaying ? 'Pause' : 'Play'}
                >
                  {isLocalPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>
                
                <div className="flex-1 flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatDuration(audioProgress * audioDuration / 100)}</span>
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  <span>{formatDuration(audioDuration || memory.metadata.duration)}</span>
                </div>
                
                {memory.metadata.audioUrl && (
                  <a
                    href={memory.metadata.audioUrl}
                    download={`voice-note-${memory.id}.webm`}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Download audio"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ) : null}
          
          <p className="text-sm text-gray-300 line-clamp-2">
            {memory.preview || memory.content}
          </p>
          
          {/* Emotional Resonance */}
          {memory.emotion && (
            <div className="flex items-center gap-2 mt-2 p-2  from-gray-50 to-gray-100 rounded-lg border">
              <div className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: memory.emotion.primaryEmotion?.color || '#888888' }}
                  title={`Energy: ${memory.emotion.energySignature}`}
                />
                <span className="text-xs font-medium text-gray-600">
                  {memory.emotion.energySignature}
                </span>
              </div>
              
              {/* VAD indicators */}
              <div className="flex gap-1 text-xs text-gray-500">
                <span title={`Valence: ${memory.emotion.valence > 0 ? 'Positive' : 'Negative'}`}>
                  {memory.emotion.valence > 0.2 ? '😊' : memory.emotion.valence < -0.2 ? '😔' : '😐'}
                </span>
                <span title={`Arousal: ${memory.emotion.arousal > 0.5 ? 'High Energy' : 'Low Energy'}`}>
                  {memory.emotion.arousal > 0.6 ? '⚡' : memory.emotion.arousal < 0.3 ? '🌊' : '💫'}
                </span>
                <span title={`Dominance: ${memory.emotion.dominance > 0.5 ? 'In Control' : 'Receptive'}`}>
                  {memory.emotion.dominance > 0.6 ? '👑' : memory.emotion.dominance < 0.4 ? '🤲' : '⚖️'}
                </span>
              </div>
              
              {memory.emotion.primaryEmotion && (
                <span 
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ 
                    backgroundColor: memory.emotion.primaryEmotion.color + '20',
                    color: memory.emotion.primaryEmotion.color,
                    border: `1px solid ${memory.emotion.primaryEmotion.color}40`
                  }}
                >
                  {memory.emotion.primaryEmotion.emotion}
                </span>
              )}
            </div>
          )}

          {/* Archetypal Insights */}
          {memory.insights && memory.insights.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {memory.insights.map((insight, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 transition-colors"
                  title={`${insight.archetype} (${Math.round(insight.confidence * 100)}% confidence)`}
                >
                  <span className="text-sm">{insight.symbol}</span>
                  <span className="font-medium">{insight.archetype}</span>
                </span>
              ))}
            </div>
          )}

          {memory.metadata?.tags && memory.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {memory.metadata.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {memory.metadata?.mood && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                Mood: {memory.metadata.mood}
              </span>
            </div>
          )}
          
          {memory.type === 'upload' && memory.metadata?.filename && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <Download className="w-3 h-3" />
              <span className="truncate">{memory.metadata.filename}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemoryCard;