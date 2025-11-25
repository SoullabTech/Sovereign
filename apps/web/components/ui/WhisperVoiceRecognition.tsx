/**
 * Whisper Voice Recognition
 *
 * Clean, simple, reliable voice transcription using OpenAI Whisper.
 * No state management hell. No restart loops. Just works.
 *
 * Migration path: This component can later be swapped with a local Whisper
 * implementation (whisper.cpp) without changing the parent component.
 */

'use client';

import React, { useRef, useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { voiceLock } from '@/lib/services/VoiceLock';

interface WhisperVoiceProps {
  enabled: boolean;
  isMuted: boolean;
  isMayaSpeaking: boolean;
  onTranscript: (text: string) => void;
  onAudioLevelChange?: (level: number) => void;
  conversationDepth?: 'quick' | 'normal' | 'deep'; // Adaptive silence threshold
  onManualStop?: () => void; // Manual "I'm done speaking" callback
}

export interface VoiceActivatedMaiaRef {
  isListening: boolean;
  isRecording: boolean; // Add for compatibility
  audioLevel: number;
  manualStop: () => void; // Allow parent to trigger manual stop
  startListening: () => Promise<void>; // Add for compatibility with ContinuousConversation
  stopListening: () => void; // Add for compatibility with ContinuousConversation
  toggleListening: () => void; // Add for compatibility with ContinuousConversation
}

export const WhisperVoiceRecognition = forwardRef<VoiceActivatedMaiaRef, WhisperVoiceProps>(({
  enabled,
  isMuted,
  isMayaSpeaking,
  onTranscript,
  onAudioLevelChange,
  conversationDepth = 'normal',
  onManualStop
}, ref) => {

  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');

  // Adaptive silence thresholds based on conversation depth
  const getSilenceThreshold = useCallback(() => {
    switch (conversationDepth) {
      case 'quick': return 3000;  // 3 seconds for quick exchanges
      case 'deep': return 8000;   // 8 seconds for deep reflection
      case 'normal':
      default: return 6000;       // 6 seconds default
    }
  }, [conversationDepth]);

  /**
   * Manual stop - user signals they're done speaking
   */
  const manualStop = useCallback(() => {
    console.log('🛑 Manual stop triggered by user');
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      onManualStop?.(); // Notify parent component
    }
  }, [onManualStop]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Track last speech time to detect silence
  const lastSpeechTimeRef = useRef<number>(0);
  const silenceCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Track total speech duration (only count time above threshold)
  const speechDurationRef = useRef<number>(0);
  const lastSpeechCheckRef = useRef<number>(0);

  /**
   * Send audio to Whisper for transcription
   * Uses server-side endpoint to keep API keys secure
   */
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    // 🔒 Check VoiceLock FIRST - don't process if MAIA is speaking
    if (voiceLock.isLocked) {
      console.log('🔒 Skipping transcription - VoiceLock active:', voiceLock.isLocked);
      return;
    }

    if (isProcessingRef.current) {
      console.log('⏸️ Already processing, skipping this chunk');
      return;
    }

    isProcessingRef.current = true;

    try {
      console.log('🎤 Sending audio to server for transcription...', {
        size: audioBlob.size,
        type: audioBlob.type
      });

      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      // Use server-side endpoint instead of calling OpenAI directly
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Transcription failed';
        console.error('❌ Transcription API error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          audioSize: audioBlob.size,
          audioType: audioBlob.type
        });
        throw new Error(`Transcription error (${response.status}): ${errorMessage}`);
      }

      const data = await response.json();
      const text = data.transcript?.trim();

      console.log('✅ Transcription received:', text);

      // 🔒 Double-check VoiceLock before using transcript
      // (Lock could have activated during transcription)
      if (voiceLock.isLocked) {
        console.log('🔒 Discarding transcript - VoiceLock activated during processing');
        return;
      }

      if (text && text.length > 0) {
        setTranscript(text);
        onTranscript(text);
      }

    } catch (error) {
      console.error('❌ Whisper transcription error:', error);

      // Show user-friendly error notification
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        console.error('🌐 Network issue - mobile connection may be slow. Try again.');
      } else if (errorMessage.includes('OPENAI_API_KEY')) {
        console.error('🔑 API key missing - transcription unavailable');
      }

      // Don't break the voice flow - just log the error
      // User can try speaking again
    } finally {
      isProcessingRef.current = false;
    }
  }, [onTranscript]);

  /**
   * Start recording
   */
  const startRecording = useCallback(async () => {
    try {
      console.log('🎙️ Starting Whisper voice recording...');

      // DIAGNOSTIC: List all available audio input devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      console.log('🎧 Available audio input devices:', audioInputs.map(d => ({
        id: d.deviceId,
        label: d.label,
        groupId: d.groupId
      })));

      // Request ONLY microphone input - block system audio routing
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Advanced constraints to ensure we get REAL microphone, not virtual/system audio
          suppressLocalAudioPlayback: true  // Don't capture browser audio playback
        },
        video: false  // Explicitly no video
      });

      streamRef.current = stream;

      // DIAGNOSTIC: Log which audio input is actually being used
      const audioTrack = stream.getAudioTracks()[0];
      const settings = audioTrack.getSettings();
      console.log('🎤 ACTIVE AUDIO INPUT:', {
        label: audioTrack.label,
        deviceId: settings.deviceId,
        echoCancellation: settings.echoCancellation,
        noiseSuppression: settings.noiseSuppression,
        autoGainControl: settings.autoGainControl,
        sampleRate: settings.sampleRate,
        channelCount: settings.channelCount
      });

      // Initialize visualization AND silence detection
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start audio level monitoring (for silence detection)
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkAudioLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const level = average / 255;

        // Update audio visualization
        setAudioLevel(level);
        onAudioLevelChange?.(level);

        // Update last speech time if we detect REAL speech (threshold: 0.12 = speaking volume)
        // Below 0.12 is just background noise/room tone/fan/electrical hum
        if (level > 0.12) {
          const now = Date.now();

          // Track accumulated speech duration
          if (lastSpeechCheckRef.current > 0) {
            const timeSinceLastCheck = now - lastSpeechCheckRef.current;
            speechDurationRef.current += timeSinceLastCheck;
          }

          lastSpeechTimeRef.current = now;
          lastSpeechCheckRef.current = now;
          console.log('🎤 Speech detected, level:', level.toFixed(3), 'total:', speechDurationRef.current + 'ms');
        } else {
          lastSpeechCheckRef.current = 0; // Reset check when no speech
        }

        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };
      checkAudioLevel();

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('📼 Audio chunk collected:', event.data.size, 'bytes');
        }
      };

      // When recording stops, send to Whisper
      mediaRecorder.onstop = () => {
        console.log('⏹️ Recording stopped');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const speechMs = speechDurationRef.current;

        console.log('📊 Speech stats:', {
          blobSize: audioBlob.size,
          speechDuration: speechMs + 'ms',
          chunks: audioChunksRef.current.length,
          activeInput: streamRef.current?.getAudioTracks()[0]?.label || 'unknown'
        });

        // Only transcribe if we have:
        // 1. Meaningful audio size (>1KB)
        // 2. At least 300ms of actual speech (Whisper needs minimum duration)
        // This prevents Whisper from hallucinating transcripts from pure silence or brief noise
        const MIN_SPEECH_DURATION_MS = 300;
        if (audioBlob.size > 1000 && speechMs >= MIN_SPEECH_DURATION_MS) {
          console.log('📤 Sending to Whisper:', {
            size: audioBlob.size,
            speechDuration: speechMs + 'ms',
            inputDevice: streamRef.current?.getAudioTracks()[0]?.label,
            timestamp: new Date().toISOString()
          });
          transcribeAudio(audioBlob);
        } else {
          console.log('⏭️ Skipping transcription - insufficient speech:', {
            size: audioBlob.size,
            speechDuration: speechMs + 'ms',
            required: MIN_SPEECH_DURATION_MS + 'ms',
            reason: audioBlob.size <= 1000 ? 'audio too small' : `need ${MIN_SPEECH_DURATION_MS}ms+ speech (got ${speechMs}ms)`
          });
        }

        // Reset for next recording
        audioChunksRef.current = [];
        speechDurationRef.current = 0;
        lastSpeechCheckRef.current = 0;
      };

      // Start recording
      mediaRecorder.start(1000); // Collect 1-second chunks
      setIsListening(true);
      lastSpeechTimeRef.current = Date.now();
      speechDurationRef.current = 0;
      lastSpeechCheckRef.current = 0;

      console.log('✅ Recording started');

      // Check for silence every 500ms
      silenceCheckIntervalRef.current = setInterval(() => {
        const silenceDuration = Date.now() - lastSpeechTimeRef.current;
        const threshold = getSilenceThreshold();

        console.log('🔍 Silence check:', {
          silenceDuration: `${silenceDuration}ms`,
          threshold: `${threshold}ms`,
          conversationDepth,
          recording: mediaRecorderRef.current?.state
        });

        // Stop and transcribe after adaptive silence threshold
        if (silenceDuration > threshold && mediaRecorderRef.current?.state === 'recording') {
          console.log(`🔇 Silence detected (${threshold}ms+), stopping recording...`);
          mediaRecorderRef.current?.stop();

          // Restart recording for next phrase (only if MAIA is NOT speaking)
          setTimeout(() => {
            if (!isMayaSpeaking && enabled && !isMuted && mediaRecorderRef.current?.state === 'inactive') {
              console.log('🔄 Restarting recording for next phrase...');
              mediaRecorderRef.current?.start(1000);
              lastSpeechTimeRef.current = Date.now();
              speechDurationRef.current = 0;
            } else {
              console.log('⏭️ Not restarting - MAIA is speaking or recorder not ready');
            }
          }, 100);
        }
      }, 500);

    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      setIsListening(false);
    }
  }, [enabled, isMuted, isMayaSpeaking, onAudioLevelChange, transcribeAudio, getSilenceThreshold, conversationDepth]);

  /**
   * Pause recording (when MAIA is speaking)
   * VoiceLock ensures this is called at the right time
   */
  const pauseRecording = useCallback(() => {
    console.log('⏸️ Pausing Whisper recording (MAIA speaking)...', {
      currentState: mediaRecorderRef.current?.state
    });

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      console.log('✅ Whisper recording PAUSED');
    } else {
      console.log('⚠️ Cannot pause - recorder state:', mediaRecorderRef.current?.state);
    }
  }, []);

  /**
   * Resume recording (when MAIA finishes speaking)
   * VoiceLock ensures this is called at the right time
   */
  const resumeRecording = useCallback(() => {
    console.log('▶️ Resuming Whisper recording (MAIA finished)...', {
      currentState: mediaRecorderRef.current?.state
    });

    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      lastSpeechTimeRef.current = Date.now(); // Reset silence timer
      speechDurationRef.current = 0; // Reset speech duration for new phrase
      lastSpeechCheckRef.current = 0;
      console.log('✅ Whisper recording RESUMED');
    } else {
      console.log('⚠️ Cannot resume - recorder state:', mediaRecorderRef.current?.state);
    }
  }, []);

  /**
   * Stop recording completely (cleanup)
   */
  const stopRecording = useCallback(() => {
    console.log('🛑 Stopping Whisper recording completely...');

    if (mediaRecorderRef.current?.state === 'recording' || mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (silenceCheckIntervalRef.current) {
      clearInterval(silenceCheckIntervalRef.current);
      silenceCheckIntervalRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsListening(false);
    setTranscript('');
  }, []);

  /**
   * Wrapper methods for ContinuousConversation compatibility
   */
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isListening, startRecording, stopRecording]);

  // Expose ref interface for parent component (compatible with ContinuousConversation)
  useImperativeHandle(ref, () => ({
    isListening,
    isRecording: isListening, // Same value for now
    audioLevel,
    manualStop,
    startListening: startRecording,
    stopListening: stopRecording,
    toggleListening
  }), [isListening, audioLevel, manualStop, startRecording, stopRecording, toggleListening]);

  /**
   * Effect: Start/stop based on enabled/muted
   */
  useEffect(() => {
    // Start recording if enabled and not already listening
    if (enabled && !isMuted && !isListening) {
      startRecording();
      return;
    }

    // Stop completely if disabled or muted
    if ((!enabled || isMuted) && isListening) {
      stopRecording();
    }
  }, [enabled, isMuted, isListening, startRecording, stopRecording]);

  /**
   * Effect: Subscribe to VoiceLock for pause/resume
   * This is the SINGLE SOURCE OF TRUTH for microphone state
   */
  useEffect(() => {
    const unsubscribe = voiceLock.subscribe((locked) => {
      console.log('🔄 VoiceLock state changed:', locked ? 'LOCKED' : 'UNLOCKED');

      if (isListening) {
        if (locked) {
          console.log('🛑 MAIA is speaking - pausing Whisper');
          pauseRecording();
        } else {
          console.log('▶️ MAIA finished - resuming Whisper');
          resumeRecording();
        }
      }
    });

    return unsubscribe;
  }, [isListening, pauseRecording, resumeRecording]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return (
    <div className="whisper-voice-indicator">
      {isListening && (
        <div className="text-xs text-gray-500 mt-2">
          {transcript || 'Listening...'}
        </div>
      )}
    </div>
  );
});

WhisperVoiceRecognition.displayName = 'WhisperVoiceRecognition';
