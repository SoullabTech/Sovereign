/**
 * useStreamingVoice - Streaming Voice Response Hook
 *
 * Connects to the streaming conversation endpoint and plays audio chunks
 * as they arrive, creating natural conversational flow.
 *
 * Flow: User message → Stream connection → Audio chunks arrive → Queue & play seamlessly
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface StreamingVoiceOptions {
  onTextChunk?: (text: string, index: number) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: string) => void;
  voice?: string;
  element?: string;
}

interface StreamingVoiceState {
  isStreaming: boolean;
  isPlaying: boolean;
  currentText: string;
  fullResponse: string;
  sentenceIndex: number;
  error: string | null;
}

interface AudioQueueItem {
  index: number;
  audio: string;
  format: string;
  text: string;
}

export function useStreamingVoice(options: StreamingVoiceOptions = {}) {
  const { onTextChunk, onComplete, onError, voice = 'maya', element } = options;

  const [state, setState] = useState<StreamingVoiceState>({
    isStreaming: false,
    isPlaying: false,
    currentText: '',
    fullResponse: '',
    sentenceIndex: 0,
    error: null
  });

  // Audio queue and playback management
  const audioQueueRef = useRef<AudioQueueItem[]>([]);
  const isPlayingRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Play next audio chunk from queue
   */
  const playNextChunk = useCallback(() => {
    // If currently playing, wait for current chunk to finish
    if (isPlayingRef.current) {
      return;
    }

    // Queue empty - we're done playing
    if (audioQueueRef.current.length === 0) {
      console.log('[StreamingVoice] Queue empty, setting isPlaying=false');
      setState(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    // Sort by index to ensure correct order
    audioQueueRef.current.sort((a, b) => a.index - b.index);

    const chunk = audioQueueRef.current.shift();
    if (!chunk) return;

    isPlayingRef.current = true;
    setState(prev => ({
      ...prev,
      isPlaying: true,
      currentText: chunk.text,
      sentenceIndex: chunk.index
    }));

    try {
      // Create audio element from base64 data
      const audioSrc = `data:audio/${chunk.format};base64,${chunk.audio}`;
      const audio = new Audio(audioSrc);
      currentAudioRef.current = audio;

      audio.onended = () => {
        console.log('[StreamingVoice] Audio chunk ended, queue length:', audioQueueRef.current.length);
        isPlayingRef.current = false;
        currentAudioRef.current = null;
        // Play next chunk or signal completion
        setTimeout(playNextChunk, 50); // Small gap between chunks
      };

      audio.onerror = (e) => {
        console.error('[StreamingVoice] Audio playback error:', e);
        isPlayingRef.current = false;
        currentAudioRef.current = null;
        // Try next chunk anyway
        setTimeout(playNextChunk, 50);
      };

      audio.play().catch(e => {
        console.error('[StreamingVoice] Audio play failed:', e);
        isPlayingRef.current = false;
        playNextChunk();
      });
    } catch (e) {
      console.error('[StreamingVoice] Audio creation error:', e);
      isPlayingRef.current = false;
      playNextChunk();
    }
  }, []);

  /**
   * Send a message and stream the response
   */
  const sendMessage = useCallback(async (
    message: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ) => {
    // Clear previous state
    audioQueueRef.current = [];
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    isPlayingRef.current = false;

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState({
      isStreaming: true,
      isPlaying: false,
      currentText: '',
      fullResponse: '',
      sentenceIndex: 0,
      error: null
    });

    try {
      const response = await fetch('/api/voice/stream-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          voice,
          element,
          conversationHistory,
          sessionId: `stream-${Date.now()}`
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        let eventType = '';
        let eventData = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            eventData = line.slice(5).trim();

            if (eventType && eventData) {
              try {
                const data = JSON.parse(eventData);

                switch (eventType) {
                  case 'text':
                    setState(prev => ({
                      ...prev,
                      currentText: data.text,
                      sentenceIndex: data.index
                    }));
                    onTextChunk?.(data.text, data.index);
                    break;

                  case 'audio':
                    // Add to queue and start playing if not already
                    audioQueueRef.current.push({
                      index: data.index,
                      audio: data.audio,
                      format: data.format,
                      text: data.text
                    });
                    // Start playback if not already playing
                    if (!isPlayingRef.current) {
                      playNextChunk();
                    }
                    break;

                  case 'complete':
                    setState(prev => ({
                      ...prev,
                      isStreaming: false,
                      fullResponse: data.fullResponse
                    }));
                    onComplete?.(data.fullResponse);
                    break;

                  case 'error':
                    setState(prev => ({
                      ...prev,
                      isStreaming: false,
                      error: data.message
                    }));
                    onError?.(data.message);
                    break;
                }
              } catch (e) {
                // Ignore parse errors for incomplete data
              }

              eventType = '';
              eventData = '';
            }
          }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        // Intentional cancellation
        return;
      }

      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: errorMessage
      }));
      onError?.(errorMessage);
    }
  }, [voice, element, onTextChunk, onComplete, onError, playNextChunk]);

  /**
   * Stop streaming and playback
   */
  const stop = useCallback(() => {
    // Cancel stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Stop current audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    // Clear queue
    audioQueueRef.current = [];
    isPlayingRef.current = false;

    setState({
      isStreaming: false,
      isPlaying: false,
      currentText: '',
      fullResponse: '',
      sentenceIndex: 0,
      error: null
    });
  }, []);

  /**
   * Pause/resume playback
   */
  const togglePause = useCallback(() => {
    if (currentAudioRef.current) {
      if (currentAudioRef.current.paused) {
        currentAudioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
      } else {
        currentAudioRef.current.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  return {
    ...state,
    sendMessage,
    stop,
    togglePause
  };
}
