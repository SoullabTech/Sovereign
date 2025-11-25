'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2 } from 'lucide-react';

interface MaiaBubbleProps {
  text: string;
  audioUrl?: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
  isTyping?: boolean;
  timestamp?: string;
}

export default function MaiaBubble({ 
  text, 
  audioUrl,
  onPlayStateChange,
  isTyping = false,
  timestamp
}: MaiaBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);


  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('play', () => {
        setIsPlaying(true);
        onPlayStateChange?.(true);
      });
      
      audioRef.current.addEventListener('pause', () => {
        setIsPlaying(false);
        onPlayStateChange?.(false);
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setHasPlayed(true);
        onPlayStateChange?.(false);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [onPlayStateChange]);

  // Audio analysis for voice-synced animations
  useEffect(() => {
    if (!isPlaying || !audioRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setAudioLevel(0);
      return;
    }

    const setupAudioAnalysis = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioContextRef.current.createMediaElementSource(audioRef.current!);
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          analyserRef.current.smoothingTimeConstant = 0.8;
          
          source.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
        }

        const dataArray = new Uint8Array(analyserRef.current!.frequencyBinCount);

        const updateLevel = () => {
          if (!analyserRef.current || !isPlaying) return;
          
          analyserRef.current.getByteTimeDomainData(dataArray);
          
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sum += normalized * normalized;
          }
          const rms = Math.sqrt(sum / dataArray.length);
          
          setAudioLevel(prev => prev * 0.7 + rms * 0.3);
          
          animationRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (err) {
        console.error('Audio analysis setup failed:', err);
      }
    };

    setupAudioAnalysis();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  // Show typing indicator
  if (isTyping) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 mb-4"
      >
        <div className="flex-1">
          <div className="inline-block px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-100 to-indigo-100 dark:from-amber-900/30 dark:to-indigo-900/30">
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-amber-600 dark:bg-amber-400 rounded-full"
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 mb-4"
    >
      <div className="flex-1">
        {/* Main bubble with voice-reactive scale */}
        <motion.div
          className="relative inline-block max-w-[85%] px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-lg"
          animate={{
            scale: isPlaying ? 1 + (audioLevel * 0.05) : 1,
          }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          {/* Voice-synced subtle glow */}
          {isPlaying && (
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 blur-xl opacity-40"
              animate={{
                opacity: 0.2 + (audioLevel * 0.3),
                scale: 1 + (audioLevel * 0.1),
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          )}

          {/* Text content */}
          <div className="relative z-10">
            {text}
          </div>

          {/* Audio playback button - minimal style */}
          {audioUrl && (
            <motion.button
              onClick={togglePlayback}
              className="absolute -right-2 -bottom-2 p-2 rounded-full bg-white dark:bg-neutral-800 shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-amber-600" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-600" />
              )}
              
              {/* Simple playback ring */}
              {isPlaying && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-amber-400"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              )}
            </motion.button>
          )}
        </motion.div>

        {/* Timestamp */}
        {timestamp && (
          <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 ml-5">
            {timestamp}
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => {
            setIsPlaying(false);
            setHasPlayed(true);
            onPlayStateChange?.(false);
          }}
          preload="metadata"
        />
      )}
    </motion.div>
  );
}