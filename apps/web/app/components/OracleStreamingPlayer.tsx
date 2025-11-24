'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Analytics } from '@/lib/analytics/supabaseAnalytics';

interface AudioChunk {
  chunkId: string;
  audioUrl?: string;
  audioData?: string;
  duration?: number;
  text?: string;
}

interface OracleStreamingPlayerProps {
  sessionId: string;
  element?: string;
  className?: string;
  onPlaybackStart?: () => void;
  onPlaybackComplete?: () => void;
  onTextReceived?: (text: string) => void;
}

export const OracleStreamingPlayer: React.FC<OracleStreamingPlayerProps> = ({
  sessionId,
  element = 'aether',
  className = '',
  onPlaybackStart,
  onPlaybackComplete,
  onTextReceived
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [audioQueue, setAudioQueue] = useState<AudioChunk[]>([]);
  const [displayText, setDisplayText] = useState('');
  const [streamComplete, setStreamComplete] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const playbackQueueRef = useRef<AudioChunk[]>([]);
  const isProcessingRef = useRef(false);

  // Get element icon
  const getElementIcon = () => {
    switch (element?.toLowerCase()) {
      case 'fire': return '🔥';
      case 'water': return '💧';
      case 'earth': return '🌱';
      case 'air': return '🌬️';
      case 'aether': return '✨';
      default: return '🔮';
    }
  };

  // Start streaming conversation
  const startStreaming = useCallback(async (message: string) => {
    try {
      setIsStreaming(true);
      setStreamComplete(false);
      setDisplayText('');
      setAudioQueue([]);
      playbackQueueRef.current = [];
      
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create new EventSource for SSE
      const response = await fetch('/api/oracle/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
          element,
          enableVoice: true,
          voiceEngine: 'auto',
          useCSM: true,
          fallbackEnabled: true
        })
      });

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      // Process streaming response
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Parse SSE events
        const lines = buffer.split('\n');
        buffer = lines[lines.length - 1];

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'text':
                  // Append streaming text
                  setDisplayText(prev => prev + data.text);
                  onTextReceived?.(data.text);
                  break;
                  
                case 'audio':
                  // Add audio chunk to queue
                  const audioChunk: AudioChunk = {
                    chunkId: data.chunkId,
                    audioUrl: data.audioUrl,
                    audioData: data.audioData,
                    duration: data.duration
                  };
                  
                  setAudioQueue(prev => [...prev, audioChunk]);
                  playbackQueueRef.current.push(audioChunk);
                  
                  // Start playback if not already playing
                  if (!isProcessingRef.current && !isPlaying) {
                    processAudioQueue();
                  }
                  break;
                  
                case 'done':
                  setStreamComplete(true);
                  setIsStreaming(false);
                  break;
                  
                case 'error':
                  console.error('Stream error:', data.message);
                  Analytics.ttsError('stream', {
                    type: 'stream_error',
                    message: data.message
                  });
                  break;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setIsStreaming(false);
      Analytics.ttsError('stream', {
        type: 'connection_error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [sessionId, element, onTextReceived]);

  // Process audio queue
  const processAudioQueue = useCallback(async () => {
    if (isProcessingRef.current || playbackQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    setIsPlaying(true);
    onPlaybackStart?.();

    while (playbackQueueRef.current.length > 0) {
      const chunk = playbackQueueRef.current.shift();
      
      if (!chunk) continue;

      try {
        // Play audio chunk
        await playAudioChunk(chunk);
        
        // Track analytics
        Analytics.completePlayback('streaming', {
          chunkId: chunk.chunkId,
          element,
          duration: chunk.duration
        });
      } catch (error) {
        console.error(`Error playing chunk ${chunk.chunkId}:`, error);
        Analytics.playbackError('streaming', {
          type: 'chunk_playback_error',
          chunkId: chunk.chunkId,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    isProcessingRef.current = false;
    setIsPlaying(false);
    
    if (streamComplete) {
      onPlaybackComplete?.();
    }
  }, [element, streamComplete, onPlaybackStart, onPlaybackComplete]);

  // Play individual audio chunk
  const playAudioChunk = (chunk: AudioChunk): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!audioRef.current) {
        reject(new Error('Audio element not available'));
        return;
      }

      const audio = audioRef.current;

      // Set audio source
      if (chunk.audioUrl) {
        audio.src = chunk.audioUrl;
      } else if (chunk.audioData) {
        audio.src = `data:audio/mp3;base64,${chunk.audioData}`;
      } else {
        resolve();
        return;
      }

      // Event handlers
      const handleEnded = () => {
        cleanup();
        resolve();
      };

      const handleError = (e: Event) => {
        cleanup();
        reject(new Error('Audio playback error'));
      };

      const cleanup = () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      // Play audio
      audio.play().catch(error => {
        cleanup();
        reject(error);
      });
    });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Auto-process queue when new chunks arrive
  useEffect(() => {
    if (audioQueue.length > 0 && !isProcessingRef.current) {
      processAudioQueue();
    }
  }, [audioQueue, processAudioQueue]);

  return (
    <div className={`oracle-streaming-player ${className}`}>
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="auto" />

      {/* Display text */}
      {displayText && (
        <div className="oracle-text mb-4 p-4 bg-gradient-to-br from-amber-50 to-blue-50 rounded-lg">
          <p className="text-gray-800 leading-relaxed">{displayText}</p>
        </div>
      )}

      {/* Playback status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getElementIcon()}</span>
          
          {isStreaming && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" />
                <span className="w-1 h-4 bg-blue-500 rounded-full animate-pulse delay-75" />
                <span className="w-1 h-4 bg-blue-500 rounded-full animate-pulse delay-150" />
              </div>
              <span className="text-sm text-blue-600">Maya is speaking...</span>
            </div>
          )}
          
          {isPlaying && !isStreaming && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600">Playing audio...</span>
            </div>
          )}
          
          {streamComplete && !isPlaying && (
            <span className="text-sm text-gray-600">Response complete</span>
          )}
        </div>

        {/* Queue status */}
        {audioQueue.length > 0 && (
          <div className="text-xs text-gray-500">
            Queue: {currentChunkIndex + 1}/{audioQueue.length} chunks
          </div>
        )}
      </div>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-400">
          <div>Session: {sessionId}</div>
          <div>Element: {element}</div>
          <div>Streaming: {isStreaming ? 'Yes' : 'No'}</div>
          <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
          <div>Queue: {audioQueue.length} chunks</div>
        </div>
      )}
    </div>
  );
};

export default OracleStreamingPlayer;