// useStreamingConversation.ts - Hook for managing streaming chat with chunked audio
import { useState, useEffect, useCallback, useRef } from 'react';
import { getStreamingAudioQueue } from '@/lib/audio/StreamingAudioQueue';

interface StreamingState {
  isStreaming: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  streamingText: string;
  partialText: string;
  audioQueueStatus: {
    queueLength: number;
    isPlaying: boolean;
  };
  error: string | null;
}

interface UseStreamingConversationOptions {
  userId?: string;
  sessionId?: string;
  element?: string;
  onTranscriptUpdate?: (text: string) => void;
  onAudioChunk?: (chunk: any) => void;
  autoResume?: boolean; // Auto-resume listening after Maya finishes
}

export function useStreamingConversation(options: UseStreamingConversationOptions = {}) {
  const {
    userId = 'anon',
    sessionId = `session-${Date.now()}`,
    element = 'aether',
    onTranscriptUpdate,
    onAudioChunk,
    autoResume = true
  } = options;

  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    isListening: false,
    isSpeaking: false,
    streamingText: '',
    partialText: '',
    audioQueueStatus: {
      queueLength: 0,
      isPlaying: false
    },
    error: null
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const audioQueueRef = useRef<ReturnType<typeof getStreamingAudioQueue> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize audio queue
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioQueueRef.current = getStreamingAudioQueue();
      
      // Set up audio queue event listeners
      const queue = audioQueueRef.current;
      
      const handleChunkAdded = (chunk: any) => {
        updateAudioQueueStatus();
        onAudioChunk?.(chunk);
      };

      const handleChunkPlaying = (chunk: any) => {
        setState(prev => ({ ...prev, isSpeaking: true }));
        updateAudioQueueStatus();
      };

      const handleQueueEmpty = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        updateAudioQueueStatus();
        
        // Auto-resume listening if enabled
        if (autoResume && !state.isListening) {
          startListening();
        }
      };

      const handleChunkError = ({ chunk, error }: any) => {
        console.error('❌ Audio chunk error:', error);
        setState(prev => ({ 
          ...prev, 
          error: `Audio playback error: ${error.message || 'Unknown error'}` 
        }));
      };

      queue.on('chunk:added', handleChunkAdded);
      queue.on('chunk:playing', handleChunkPlaying);
      queue.on('queue:empty', handleQueueEmpty);
      queue.on('chunk:error', handleChunkError);

      return () => {
        queue.off('chunk:added', handleChunkAdded);
        queue.off('chunk:playing', handleChunkPlaying);
        queue.off('queue:empty', handleQueueEmpty);
        queue.off('chunk:error', handleChunkError);
      };
    }
  }, [autoResume, onAudioChunk]);

  // Update audio queue status
  const updateAudioQueueStatus = useCallback(() => {
    if (audioQueueRef.current) {
      const status = audioQueueRef.current.getStatus();
      setState(prev => ({
        ...prev,
        audioQueueStatus: {
          queueLength: status.queueLength,
          isPlaying: status.isPlaying
        }
      }));
    }
  }, []);

  /**
   * Start streaming conversation with message
   */
  const startStreamingChat = useCallback(async (message: string) => {
    // Stop any existing stream
    stopStreaming();
    
    setState(prev => ({
      ...prev,
      isStreaming: true,
      streamingText: '',
      partialText: '',
      error: null
    }));

    try {
      // Create SSE connection to streaming endpoint
      const response = await fetch('/api/v1/stream/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId,
          sessionId,
          element
        })
      });

      if (!response.ok) {
        throw new Error(`Stream failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            const event = line.substring(6).trim();
            continue;
          }
          
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.substring(5));
              
              // Handle different event types
              if (data.content) {
                // Text delta
                setState(prev => ({
                  ...prev,
                  streamingText: prev.streamingText + data.content,
                  partialText: data.content
                }));
                onTranscriptUpdate?.(data.content);
              } else if (data.audioUrl) {
                // Audio chunk ready
                audioQueueRef.current?.addChunk({
                  id: data.chunkId,
                  url: data.audioUrl,
                  text: data.text
                });
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming chat error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Stream failed',
        isStreaming: false
      }));
    }
  }, [userId, sessionId, element, onTranscriptUpdate]);

  /**
   * Start listening for voice input
   */
  const startListening = useCallback(async () => {
    try {
      // Stop speaking if currently playing
      if (state.isSpeaking) {
        audioQueueRef.current?.stop();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        await processAudioBlob(blob);
      };
      
      mediaRecorder.start();
      
      setState(prev => ({
        ...prev,
        isListening: true,
        error: null
      }));
      
    } catch (error) {
      console.error('Microphone access error:', error);
      setState(prev => ({
        ...prev,
        error: 'Microphone access denied',
        isListening: false
      }));
    }
  }, [state.isSpeaking]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  /**
   * Process recorded audio
   */
  const processAudioBlob = useCallback(async (blob: Blob) => {
    const formData = new FormData();
    formData.append('audio', blob);
    
    try {
      // Send to transcription endpoint
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Transcription failed');
      }
      
      const { text } = await response.json();
      
      if (text) {
        // Start streaming chat with transcribed text
        await startStreamingChat(text);
      }
      
    } catch (error) {
      console.error('Audio processing error:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to process audio',
        isListening: false
      }));
    }
  }, [startStreamingChat]);

  /**
   * Stop all streaming
   */
  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isStreaming: false,
      streamingText: '',
      partialText: ''
    }));
  }, []);

  /**
   * Toggle listening on/off
   */
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  /**
   * Pause audio playback
   */
  const pauseAudio = useCallback(() => {
    audioQueueRef.current?.pause();
  }, []);

  /**
   * Resume audio playback
   */
  const resumeAudio = useCallback(() => {
    audioQueueRef.current?.resume();
  }, []);

  /**
   * Unlock audio (for Safari)
   */
  const unlockAudio = useCallback(async () => {
    const unlocked = await audioQueueRef.current?.unlockAudio();
    return unlocked || false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
      stopListening();
      audioQueueRef.current?.stop();
    };
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    startStreamingChat,
    startListening,
    stopListening,
    toggleListening,
    stopStreaming,
    pauseAudio,
    resumeAudio,
    unlockAudio,
    
    // Helpers
    canSpeak: !state.isListening && !state.isSpeaking,
    canListen: !state.isSpeaking && !state.isStreaming
  };
}