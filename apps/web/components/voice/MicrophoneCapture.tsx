"use client";

import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Analytics } from "../../lib/analytics/supabaseAnalytics";

interface MicrophoneCaptureProps {
  onTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  isProcessing?: boolean;
}

export interface MicrophoneCaptureRef {
  startRecording: () => void;
  stopRecording: () => void;
  toggleRecording: () => void;
  isRecording: boolean;
}

export const MicrophoneCapture = forwardRef<MicrophoneCaptureRef, MicrophoneCaptureProps>((props, ref) => {
  const { 
    onTranscript, 
    onInterimTranscript, 
    onRecordingStateChange, 
    isProcessing = false 
  } = props;
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    toggleRecording: handleToggleRecording,
    isRecording
  }));

  const startRecording = useCallback(async () => {
    const recordingStartTime = Date.now();
    
    try {
      // Track recording start
      Analytics.startRecording({
        timestamp: new Date().toISOString(),
        user_agent: window.navigator.userAgent
      });

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        const recordingDuration = Date.now() - recordingStartTime;
        setIsTranscribing(true);
        onRecordingStateChange?.(false);
        
        // Create audio blob
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Track recording stop with metrics
        Analytics.stopRecording({
          recording_duration_ms: recordingDuration,
          audio_size_bytes: audioBlob.size,
          success: true
        });
        
        // Send to STT
        const transcriptionStartTime = Date.now();
        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');

          const response = await fetch('/api/voice/transcribe-simple', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) throw new Error('Transcription failed');

          const data = await response.json();
          
          const transcriptionDuration = Date.now() - transcriptionStartTime;
          
          if (data.success && data.transcription) {
            
            // Track successful transcription
            Analytics.transcriptionSuccess({
              transcription_duration_ms: transcriptionDuration,
              transcription_length: data.transcription.length,
              confidence: data.confidence || null
            });
            
            onTranscript(data.transcription);
          } else if (data.transcript) {
            // Fallback for different API response format
            Analytics.transcriptionSuccess({
              transcription_duration_ms: transcriptionDuration,
              transcription_length: data.transcript.length
            });
            
            onTranscript(data.transcript);
          } else {
            console.error('❌ [MicrophoneCapture] No transcription in response:', data);
            
            Analytics.transcriptionError({
              type: 'empty_response',
              message: 'No transcription in API response',
              duration_ms: transcriptionDuration
            });
          }
        } catch (error) {
          console.error('Transcription error:', error);
          
          Analytics.transcriptionError({
            type: 'api_error',
            message: error.message || 'Unknown transcription error',
            duration_ms: Date.now() - transcriptionStartTime
          });
        } finally {
          setIsTranscribing(false);
        }

        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      onRecordingStateChange?.(true);
    } catch (error) {
      console.error('Microphone access error:', error);
      
      // Track recording error
      Analytics.recordingError({
        type: error.name === 'NotAllowedError' ? 'mic_denied' : 'mic_error',
        message: error.message || 'Unknown microphone error',
        duration_ms: Date.now() - recordingStartTime
      });
      
      alert('Unable to access microphone. Please check permissions.');
    }
  }, [onTranscript, onRecordingStateChange]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecordingStateChange?.(false);
    }
  }, [isRecording, onRecordingStateChange]);

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Determine button state
  const isDisabled = isProcessing || isTranscribing;
  const showLoader = isTranscribing || (isProcessing && !isRecording);

  return (
    <button
      onClick={handleToggleRecording}
      disabled={isDisabled}
      className={`
        relative p-3 rounded-lg transition-all
        ${isRecording 
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse' 
          : 'bg-white/10 text-gray-400 hover:bg-white/20'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {showLoader ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isRecording ? (
        <Mic className="w-5 h-5" />
      ) : (
        <MicOff className="w-5 h-5" />
      )}

      {/* Recording indicator */}
      {isRecording && (
        <span className="absolute -top-1 -right-1 w-3 h-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      )}
    </button>
  );
});

MicrophoneCapture.displayName = 'MicrophoneCapture';