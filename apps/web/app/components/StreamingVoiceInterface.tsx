'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { OracleStreamingPlayer } from './OracleStreamingPlayer';

interface StreamingVoiceInterfaceProps {
  sessionId: string;
  element?: string;
  enableVAD?: boolean;
  silenceThreshold?: number;
  silenceDuration?: number;
  onTranscriptUpdate?: (text: string) => void;
  onResponseReceived?: (text: string) => void;
}

export const StreamingVoiceInterface: React.FC<StreamingVoiceInterfaceProps> = ({
  sessionId,
  element = 'aether',
  enableVAD = true,
  silenceThreshold = 0.01,
  silenceDuration = 2000,
  onTranscriptUpdate,
  onResponseReceived
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamingPlayerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize audio context and analyzer
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      // Create audio context for VAD
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Setup media recorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        processRecording();
      };
      
      setIsMicEnabled(true);
      
      // Start monitoring audio levels
      monitorAudioLevels();
      
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      setIsMicEnabled(false);
    }
  }, []);

  // Monitor audio levels for VAD
  const monitorAudioLevels = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const checkLevel = () => {
      if (!isListening || !analyserRef.current) {
        return;
      }
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      const normalizedLevel = average / 255;
      
      setAudioLevel(normalizedLevel);
      
      // VAD logic
      if (enableVAD) {
        if (normalizedLevel < silenceThreshold) {
          // Start silence timer if not already started
          if (!silenceTimerRef.current && mediaRecorderRef.current?.state === 'recording') {
            silenceTimerRef.current = setTimeout(() => {
              stopRecording();
            }, silenceDuration);
          }
        } else {
          // Cancel silence timer if sound detected
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(checkLevel);
    };
    
    checkLevel();
  }, [enableVAD, silenceThreshold, silenceDuration, isListening]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !isMicEnabled) {
      await initializeAudio();
      return;
    }
    
    audioChunksRef.current = [];
    setTranscript('');
    setIsListening(true);
    
    mediaRecorderRef.current.start();
    monitorAudioLevels();
  }, [isMicEnabled, initializeAudio, monitorAudioLevels]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    setIsListening(false);
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Process recorded audio
  const processRecording = useCallback(async () => {
    if (audioChunksRef.current.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
      });
      
      // Transcribe audio
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('sessionId', sessionId);
      
      const transcribeResponse = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (!transcribeResponse.ok) {
        throw new Error('Transcription failed');
      }
      
      const { text } = await transcribeResponse.json();
      setTranscript(text);
      onTranscriptUpdate?.(text);
      
      // Send to streaming chat endpoint
      if (text && streamingPlayerRef.current) {
        setResponseText('');
        await streamingPlayerRef.current.startStreaming(text);
      }
      
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
      audioChunksRef.current = [];
    }
  }, [sessionId, onTranscriptUpdate]);

  // Handle playback completion for continuous conversation
  const handlePlaybackComplete = useCallback(() => {
    // Re-enable microphone after response playback
    if (isMicEnabled && !isListening) {
      setTimeout(() => {
        startRecording();
      }, 500); // Small delay before restarting
    }
  }, [isMicEnabled, isListening, startRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="streaming-voice-interface p-6 bg-gradient-to-br from-indigo-50 to-amber-50 rounded-xl shadow-lg">
      {/* Audio Level Visualizer */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Audio Level</span>
          <span className="text-xs text-gray-500">
            {enableVAD ? 'VAD Enabled' : 'Manual Control'}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-amber-500 transition-all duration-100"
            style={{ 
              width: `${audioLevel * 100}%`,
              opacity: isListening ? 1 : 0.3
            }}
          />
        </div>
        {enableVAD && audioLevel < silenceThreshold && isListening && (
          <div className="mt-1 text-xs text-orange-600">
            Detecting silence... will stop in {silenceDuration / 1000}s
          </div>
        )}
      </div>

      {/* Recording Controls */}
      <div className="mb-6 flex items-center justify-center gap-4">
        <button
          onClick={() => isListening ? stopRecording() : startRecording()}
          disabled={isProcessing || !isMicEnabled}
          className={`
            px-6 py-3 rounded-full font-medium transition-all duration-200
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white scale-110' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2
          `}
        >
          {isListening ? (
            <>
              <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
              Stop Recording
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Start Recording
            </>
          )}
        </button>

        {!isMicEnabled && (
          <button
            onClick={initializeAudio}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full text-sm"
          >
            Enable Microphone
          </button>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="mb-4 p-3 bg-white/70 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">You said:</div>
          <div className="text-gray-800">{transcript}</div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="mb-4 flex items-center justify-center gap-2 text-blue-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Processing your message...</span>
        </div>
      )}

      {/* Streaming Player */}
      <OracleStreamingPlayer
        ref={streamingPlayerRef}
        sessionId={sessionId}
        element={element}
        onPlaybackComplete={handlePlaybackComplete}
        onTextReceived={(text) => {
          setResponseText(prev => prev + text);
          onResponseReceived?.(text);
        }}
      />

      {/* Response Display */}
      {responseText && (
        <div className="mt-4 p-4 bg-gradient-to-br from-amber-100 to-pink-100 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Maya says:</div>
          <div className="text-gray-800 leading-relaxed">{responseText}</div>
        </div>
      )}

      {/* Status Indicators */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className={`flex items-center gap-1 ${isMicEnabled ? 'text-green-600' : 'text-red-600'}`}>
            <span className={`w-2 h-2 rounded-full ${isMicEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
            Mic {isMicEnabled ? 'Ready' : 'Disabled'}
          </span>
          <span className={`flex items-center gap-1 ${isListening ? 'text-blue-600' : 'text-gray-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
            {isListening ? 'Listening' : 'Idle'}
          </span>
        </div>
        <span>Session: {sessionId.slice(0, 8)}...</span>
      </div>
    </div>
  );
};

export default StreamingVoiceInterface;