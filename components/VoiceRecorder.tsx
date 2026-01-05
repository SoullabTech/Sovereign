'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, AlertCircle, Settings } from 'lucide-react';
import { useVoiceInput } from '@/lib/hooks/useVoiceInput';
import { Capacitor } from '@capacitor/core';

interface VoiceRecorderProps {
  userId?: string;
  onTranscribed: (data: { transcript: string; audioUrl?: string }) => void;
  autoSend?: boolean;
  silenceTimeout?: number;
  minSpeechLength?: number;
}

export default function VoiceRecorder({
  userId = 'anonymous',
  onTranscribed,
  autoSend = true,
  silenceTimeout = 3000,
  minSpeechLength = 500
}: VoiceRecorderProps) {
  const [hasStarted, setHasStarted] = useState(false);

  const handleResult = useCallback((transcript: string, isFinal: boolean) => {
    // Results are handled via onAutoStop for auto-send mode
    if (!autoSend && isFinal && transcript.trim()) {
      onTranscribed({ transcript: transcript.trim() });
    }
  }, [autoSend, onTranscribed]);

  const handleAutoStop = useCallback((finalTranscript: string) => {
    if (autoSend && finalTranscript.trim()) {
      onTranscribed({ transcript: finalTranscript.trim() });
    }
  }, [autoSend, onTranscribed]);

  const handleError = useCallback((error: string) => {
    console.error('Voice recording error:', error);
  }, []);

  const {
    isRecording,
    isSupported,
    isTranscribing,
    transcript,
    error,
    permissionStatus,
    startRecording,
    stopRecording,
    requestPermission
  } = useVoiceInput({
    onResult: handleResult,
    onAutoStop: handleAutoStop,
    onError: handleError,
    continuous: true,
    interimResults: true,
    language: 'en-US',
    silenceTimeoutMs: silenceTimeout,
    minSpeechLengthChars: Math.floor(minSpeechLength / 100) // Convert ms to rough char count
  });

  // Auto-start recording when component mounts and is ready
  useEffect(() => {
    // Wait for both support check AND permission to be resolved
    const shouldStart = !hasStarted && isSupported &&
      (permissionStatus === 'granted' || permissionStatus === 'prompt');

    console.log('🎤 VoiceRecorder mount check:', {
      hasStarted,
      isSupported,
      permissionStatus,
      shouldStart
    });

    if (shouldStart) {
      setHasStarted(true);
      // Small delay to ensure native plugin is ready
      setTimeout(() => {
        console.log('🎤 Auto-starting recording...');
        startRecording();
      }, 100);
    }
  }, [hasStarted, isSupported, permissionStatus, startRecording]);

  // Handle opening iOS settings for permission
  const openSettings = useCallback(() => {
    if (Capacitor.isNativePlatform()) {
      // On iOS, guide user to Settings app
      // Unfortunately we can't directly open Settings programmatically
      // But the error message guides them
    }
  }, []);

  // Permission denied state
  if (permissionStatus === 'denied' || (error && error.includes('permission'))) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-3 p-4 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
          <MicOff className="w-6 h-6 text-red-400" />
        </div>
        <div className="space-y-1">
          <p className="text-amber-400 font-medium text-sm">Voice Access Needed</p>
          <p className="text-neutral-400 text-xs max-w-[200px]">
            To speak with Maia, enable Microphone and Speech Recognition in Settings.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-[200px]">
          <motion.button
            onClick={() => requestPermission()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <Mic className="w-4 h-4" />
            Try Again
          </motion.button>
          {Capacitor.isNativePlatform() && (
            <p className="text-neutral-500 text-xs">
              Settings &rarr; MAIA &rarr; Enable Microphone & Speech
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  // Not supported state
  if (!isSupported) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-3 p-4 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-neutral-700/50 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-neutral-400" />
        </div>
        <p className="text-neutral-400 text-sm">
          Voice input not available on this device
        </p>
      </motion.div>
    );
  }

  // Permission prompt state (waiting for user to grant)
  if (permissionStatus === 'prompt' || permissionStatus === 'unknown') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-3 p-4 text-center"
      >
        <motion.div
          className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Mic className="w-6 h-6 text-amber-400" />
        </motion.div>
        <div className="space-y-1">
          <p className="text-amber-400 font-medium text-sm">Allow Voice Access</p>
          <p className="text-neutral-400 text-xs max-w-[200px]">
            Tap "Allow" when prompted to speak with Maia
          </p>
        </div>
      </motion.div>
    );
  }

  // Error state (non-permission errors)
  if (error && !error.includes('permission')) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-3 p-4 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-amber-400" />
        </div>
        <p className="text-neutral-400 text-sm max-w-[200px]">{error}</p>
        <motion.button
          onClick={() => startRecording()}
          className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  // Recording state
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-3 p-4"
    >
      {/* Animated mic with pulse rings */}
      <div className="relative">
        {/* Pulse rings */}
        <AnimatePresence>
          {isRecording && (
            <>
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute inset-0 rounded-full border-2 border-amber-400"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{
                    scale: [1, 1.5 + ring * 0.3],
                    opacity: [0.6, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: ring * 0.3,
                    ease: 'easeOut'
                  }}
                  style={{
                    width: 48,
                    height: 48,
                    marginLeft: -24,
                    marginTop: -24,
                    left: '50%',
                    top: '50%'
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Mic button */}
        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing}
          className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isTranscribing
              ? 'bg-amber-500/30 text-amber-400/50 cursor-wait'
              : isRecording
              ? 'bg-red-500 text-white'
              : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
          }`}
          whileTap={isTranscribing ? {} : { scale: 0.95 }}
          animate={isRecording && !isTranscribing ? { scale: [1, 1.05, 1] } : {}}
          transition={isRecording ? { duration: 1, repeat: Infinity } : {}}
        >
          {isRecording ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </motion.button>
      </div>

      {/* Transcript display */}
      <AnimatePresence mode="wait">
        {transcript ? (
          <motion.p
            key="transcript"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-white text-sm text-center max-w-[250px] line-clamp-3"
          >
            {transcript}
          </motion.p>
        ) : isTranscribing ? (
          <motion.p
            key="transcribing"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-amber-400 text-sm"
          >
            Processing...
          </motion.p>
        ) : isRecording ? (
          <motion.p
            key="listening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-amber-400/70 text-sm"
          >
            Listening...
          </motion.p>
        ) : null}
      </AnimatePresence>

      {/* Stop hint */}
      {isRecording && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="text-neutral-500 text-xs"
        >
          Tap to stop
        </motion.p>
      )}
    </motion.div>
  );
}
