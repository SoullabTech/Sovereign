'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useStreamingConversation } from '@/app/hooks/useStreamingConversation';
import { Mic, MicOff, Volume2, VolumeX, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreamingOracleVoicePlayerProps {
  userId?: string;
  sessionId?: string;
  element?: string;
  className?: string;
  onTranscriptUpdate?: (text: string) => void;
  onStateChange?: (state: any) => void;
}

export function StreamingOracleVoicePlayer({
  userId,
  sessionId,
  element = 'aether',
  className,
  onTranscriptUpdate,
  onStateChange
}: StreamingOracleVoicePlayerProps) {
  const {
    isStreaming,
    isListening,
    isSpeaking,
    streamingText,
    partialText,
    audioQueueStatus,
    error,
    startStreamingChat,
    startListening,
    stopListening,
    toggleListening,
    pauseAudio,
    resumeAudio,
    unlockAudio,
    canSpeak,
    canListen
  } = useStreamingConversation({
    userId,
    sessionId,
    element,
    onTranscriptUpdate,
    autoResume: true
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Initialize audio on first interaction
  const handleInitialize = useCallback(async () => {
    if (!isInitialized) {
      const unlocked = await unlockAudio();
      if (unlocked) {
        setIsInitialized(true);
      }
    }
  }, [isInitialized, unlockAudio]);

  // Update display text with streaming content
  useEffect(() => {
    if (streamingText) {
      setDisplayText(streamingText);
      setShowTypingIndicator(isStreaming && !isSpeaking);
    }
  }, [streamingText, isStreaming, isSpeaking]);

  // Auto-scroll text container
  useEffect(() => {
    if (textContainerRef.current) {
      textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight;
    }
  }, [displayText]);

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.({
      isStreaming,
      isListening,
      isSpeaking,
      audioQueueLength: audioQueueStatus.queueLength,
      error
    });
  }, [isStreaming, isListening, isSpeaking, audioQueueStatus, error, onStateChange]);

  // Render status indicator
  const renderStatusIndicator = () => {
    if (isListening) {
      return (
        <div className="flex items-center gap-2 text-blue-500">
          <div className="relative">
            <Mic className="w-5 h-5" />
            <div className="absolute inset-0 animate-ping">
              <Mic className="w-5 h-5 opacity-75" />
            </div>
          </div>
          <span className="text-sm">Listening...</span>
        </div>
      );
    }

    if (isStreaming) {
      return (
        <div className="flex items-center gap-2 text-amber-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Maya is thinking...</span>
        </div>
      );
    }

    if (isSpeaking) {
      return (
        <div className="flex items-center gap-2 text-green-500">
          <Volume2 className="w-5 h-5" />
          <span className="text-sm">Maya is speaking...</span>
          {audioQueueStatus.queueLength > 0 && (
            <span className="text-xs opacity-75">
              ({audioQueueStatus.queueLength} chunks queued)
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-gray-500">
        <MicOff className="w-5 h-5" />
        <span className="text-sm">Click microphone to start</span>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col gap-3 sm:gap-4 p-3 sm:p-6 rounded-xl bg-white/5 backdrop-blur-md", className)}>
      {/* Status Bar */}
      <div className="flex justify-between items-center">
        {renderStatusIndicator()}
        
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Text Display */}
      <div
        ref={textContainerRef}
        className="min-h-[150px] sm:min-h-[200px] max-h-[300px] sm:max-h-[400px] overflow-y-auto p-3 sm:p-4 rounded-lg bg-black/20 backdrop-blur text-sm sm:text-base"
      >
        {displayText ? (
          <div className="space-y-4">
            <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
              {displayText}
            </p>
            {showTypingIndicator && (
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        ) : (
          <p className="text-white/50 italic">
            Your conversation with Maya will appear here...
          </p>
        )}

        {/* Partial text indicator */}
        {partialText && (
          <span className="text-white/60 text-sm italic">
            {partialText}
          </span>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-3 sm:gap-4">
        {/* Microphone Button */}
        <button
          onClick={() => {
            if (!isInitialized) {
              handleInitialize();
            } else {
              toggleListening();
            }
          }}
          disabled={!canListen && !isListening}
          className={cn(
            "relative p-4 sm:p-6 rounded-full transition-all duration-300",
            "transform hover:scale-105 active:scale-95",
            isListening
              ? "bg-blue-500 shadow-lg shadow-blue-500/50"
              : canListen
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-800 opacity-50 cursor-not-allowed",
            "group"
          )}
        >
          {isListening ? (
            <>
              <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              <div className="absolute inset-0 rounded-full animate-pulse bg-blue-400 opacity-25" />
            </>
          ) : (
            <MicOff className="w-6 h-6 sm:w-8 sm:h-8 text-white/70 group-hover:text-white" />
          )}
        </button>

        {/* Volume Control */}
        {isSpeaking && (
          <button
            onClick={() => {
              if (audioQueueStatus.isPlaying) {
                pauseAudio();
              } else {
                resumeAudio();
              }
            }}
            className="p-3 sm:p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            {audioQueueStatus.isPlaying ? (
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" />
            )}
          </button>
        )}
      </div>

      {/* Queue Status */}
      {audioQueueStatus.queueLength > 0 && (
        <div className="flex justify-center">
          <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
            Audio Queue: {audioQueueStatus.queueLength} chunks
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isInitialized && (
        <p className="text-center text-white/50 text-xs sm:text-sm">
          Click the microphone to start your conversation with Maya
        </p>
      )}
    </div>
  );
}