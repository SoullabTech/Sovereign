"use client";

import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Analytics } from "../../lib/analytics/supabaseAnalytics";
import { Capacitor } from "@capacitor/core";
import { VoiceRecorder } from "capacitor-voice-recorder";

// Check if running on web (not native mobile)
const isWeb = Capacitor.getPlatform() === 'web';

interface WhisperContinuousConversationProps {
  onTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  onListeningStateChange?: (isListening: boolean) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  onAudioLevelChange?: (amplitude: number, isSpeaking: boolean) => void;
  isProcessing?: boolean;
  isSpeaking?: boolean;
  autoRestart?: boolean;
  autoStart?: boolean;
  silenceThreshold?: number;
}

export interface WhisperContinuousConversationRef {
  startListening: () => Promise<void>;
  stopListening: () => void;
  toggleListening: () => void;
  isListening: boolean;
}

export const WhisperContinuousConversation = forwardRef<
  WhisperContinuousConversationRef,
  WhisperContinuousConversationProps
>((props, ref) => {
  const {
    onTranscript,
    onInterimTranscript,
    onListeningStateChange,
    onRecordingStateChange,
    onAudioLevelChange,
    isProcessing = false,
    isSpeaking = false,
    autoRestart,
    autoStart = false,
    silenceThreshold
  } = props;

  // Determine auto-restart behavior
  const shouldAutoRestart = autoRestart !== undefined ? autoRestart : autoStart;

  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const shouldRestartRef = useRef<boolean>(false);
  const restartAttemptsRef = useRef<number>(0);
  const maxRestartAttempts = 10; // Prevent infinite restart loops

  // Web browser recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioEnergySamplesRef = useRef<number[]>([]);

  // Master restart interval - checks every 500ms if we should restart
  const restartIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    startListening,
    stopListening,
    toggleListening,
    isListening
  }));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (restartIntervalRef.current) {
        clearInterval(restartIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Audio level monitoring for holoflower visualizer
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
    const normalizedLevel = Math.min(average / 128, 1);

    audioEnergySamplesRef.current.push(normalizedLevel);

    if (Math.random() < 0.01) {
      console.log(`🎤 Audio level: ${normalizedLevel.toFixed(3)}`);
    }

    onAudioLevelChange?.(normalizedLevel, true);
    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
  }, [onAudioLevelChange]);

  const startListening = useCallback(async () => {
    // REMOVED the isSpeaking check here - we check this in the master restart loop instead
    // This prevents the race condition where restart is blocked

    // Check if already listening or transcribing
    if (isListening || isTranscribing) {
      console.log('⏭️ Already listening or transcribing, skipping start');
      return;
    }

    console.log('🎙️ Starting voice recording...');

    try {
      recordingStartTimeRef.current = Date.now();
      restartAttemptsRef.current = 0; // Reset attempts counter on successful start

      try {
        Analytics.startRecording({
          timestamp: new Date().toISOString(),
          user_agent: window.navigator.userAgent
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed (non-blocking):', analyticsError);
      }

      // WEB BROWSER: Use MediaRecorder API
      if (isWeb) {
        console.log('🌐 Using web MediaRecorder API');

        streamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        console.log('🎤 Microphone stream obtained');

        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
        source.connect(analyserRef.current);

        const mimeTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/mp4',
          'audio/wav'
        ];
        const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';

        mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType });
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            console.log(`📦 Audio chunk: ${event.data.size} bytes`);
          }
        };

        mediaRecorderRef.current.start(100);
        console.log('▶️ MediaRecorder started');

        audioEnergySamplesRef.current = [];

        setIsListening(true);
        shouldRestartRef.current = true;
        onListeningStateChange?.(true);
        onRecordingStateChange?.(true);

        monitorAudioLevel();

        // Stop recording after 5 seconds
        silenceTimerRef.current = setTimeout(async () => {
          try {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
              console.log('⏭️ MediaRecorder not in recording state');
              return;
            }

            mediaRecorderRef.current.stop();

            await new Promise<void>((resolve) => {
              if (mediaRecorderRef.current) {
                mediaRecorderRef.current.onstop = async () => {
                  const recordingDuration = Date.now() - recordingStartTimeRef.current;

                  if (recordingDuration < 500 || audioChunksRef.current.length === 0) {
                    console.log('⏭️ Recording too short, skipping');
                    resolve();
                    return;
                  }

                  const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

                  console.log(`🎵 Audio blob: ${audioBlob.size} bytes, ${recordingDuration}ms`);

                  try {
                    Analytics.stopRecording({
                      recording_duration_ms: recordingDuration,
                      audio_size_bytes: audioBlob.size,
                      success: true
                    });
                  } catch (e) {
                    console.warn('Analytics failed:', e);
                  }

                  setIsTranscribing(true);
                  setIsListening(false);
                  onListeningStateChange?.(false);
                  onRecordingStateChange?.(false);

                  // Cleanup audio monitoring
                  if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                  }

                  if (analyserRef.current) {
                    analyserRef.current.disconnect();
                    analyserRef.current = null;
                  }
                  if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                    await audioContextRef.current.close();
                    audioContextRef.current = null;
                  }

                  if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                  }

                  // Check audio energy
                  const avgEnergy = audioEnergySamplesRef.current.reduce((a, b) => a + b, 0) / audioEnergySamplesRef.current.length;
                  const MINIMUM_ENERGY_THRESHOLD = 0.02;

                  console.log(`🔊 Audio energy: ${avgEnergy.toFixed(3)} (threshold: ${MINIMUM_ENERGY_THRESHOLD})`);

                  if (avgEnergy < MINIMUM_ENERGY_THRESHOLD) {
                    console.log('⏭️ Audio too quiet, skipping transcription');
                    setIsTranscribing(false);
                    resolve();
                    return;
                  }

                  await transcribeAudio(audioBlob, mimeType);
                  resolve();
                };
              } else {
                resolve();
              }
            });
          } catch (stopError: any) {
            console.error('❌ Error stopping web recording:', stopError);
            setIsListening(false);
            setIsTranscribing(false);
            onListeningStateChange?.(false);
            onRecordingStateChange?.(false);

            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = null;
            }

            if (analyserRef.current) {
              analyserRef.current.disconnect();
              analyserRef.current = null;
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
              audioContextRef.current.close().catch(e => console.warn('AudioContext close failed:', e));
              audioContextRef.current = null;
            }

            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
          }
        }, 5000);

        console.log('✅ Web voice recording started successfully');

      } else {
        // NATIVE MOBILE: Use Capacitor VoiceRecorder plugin
        console.log('📱 Using Capacitor VoiceRecorder plugin');

        const permissionResult = await VoiceRecorder.hasAudioRecordingPermission();
        if (!permissionResult.value) {
          const requestResult = await VoiceRecorder.requestAudioRecordingPermission();
          if (!requestResult.value) {
            throw new Error('Microphone permission denied');
          }
        }

        await VoiceRecorder.startRecording();

        setIsListening(true);
        shouldRestartRef.current = true;
        onListeningStateChange?.(true);
        onRecordingStateChange?.(true);

        // iOS: Simulate audio level monitoring
        const simulateAudioLevel = () => {
          const baseLevel = 0.55;
          const variation = Math.sin(Date.now() / 200) * 0.25;
          const randomNoise = (Math.random() - 0.5) * 0.1;
          const simulatedLevel = Math.max(0.3, Math.min(0.8, baseLevel + variation + randomNoise));

          onAudioLevelChange?.(simulatedLevel, true);
          animationFrameRef.current = requestAnimationFrame(simulateAudioLevel);
        };

        console.log('📱 Starting simulated audio monitoring');
        simulateAudioLevel();

        // Stop recording after 5 seconds
        silenceTimerRef.current = setTimeout(async () => {
          try {
            const result = await VoiceRecorder.stopRecording();
            const recordingDuration = Date.now() - recordingStartTimeRef.current;

            if (!result.value || !result.value.recordDataBase64 || recordingDuration < 500) {
              console.log('⏭️ Recording too short or no data');
              return;
            }

            setIsTranscribing(true);
            setIsListening(false);
            onListeningStateChange?.(false);
            onRecordingStateChange?.(false);

            // Convert base64 to Blob
            const byteCharacters = atob(result.value.recordDataBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const audioBlob = new Blob([byteArray], { type: result.value.mimeType });

            try {
              Analytics.stopRecording({
                recording_duration_ms: recordingDuration,
                audio_size_bytes: audioBlob.size,
                success: true
              });
            } catch (e) {
              console.warn('Analytics failed:', e);
            }

            await transcribeAudio(audioBlob, result.value.mimeType);
          } catch (stopError: any) {
            console.error('❌ Error stopping recording:', stopError);
            setIsListening(false);
            setIsTranscribing(false);
            onListeningStateChange?.(false);
            onRecordingStateChange?.(false);
          }
        }, 5000);

        console.log('✅ Voice recording started with VoiceRecorder plugin');
      }

    } catch (error: any) {
      console.error('❌ Microphone access error:', error);

      try {
        Analytics.recordingError({
          type: error.message?.includes('permission') ? 'mic_denied' : 'mic_error',
          message: error.message || 'Unknown microphone error',
          duration_ms: Date.now() - recordingStartTimeRef.current
        });
      } catch (e) {
        console.warn('Analytics failed:', e);
      }

      let errorMessage = 'Unable to access microphone.';
      if (error.message?.includes('permission')) {
        errorMessage = 'Microphone access was denied. Please allow microphone access in Settings.';
      } else {
        errorMessage = `Microphone error: ${error.message || 'Unknown error'}. Please try again.`;
      }

      alert(errorMessage);
      setIsListening(false);
      onListeningStateChange?.(false);
      onRecordingStateChange?.(false);
    }
  }, [onTranscript, onListeningStateChange, onRecordingStateChange, shouldAutoRestart, isListening, isTranscribing]);

  // Helper function to transcribe audio
  const transcribeAudio = async (audioBlob: Blob, mimeType: string) => {
    const transcriptionStartTime = Date.now();
    try {
      let fileExtension = 'webm';
      if (mimeType.includes('webm')) {
        fileExtension = 'webm';
      } else if (mimeType.includes('mp4')) {
        fileExtension = 'mp4';
      } else if (mimeType.includes('wav')) {
        fileExtension = 'wav';
      } else if (mimeType.includes('ogg')) {
        fileExtension = 'ogg';
      }

      console.log(`🎵 Transcribing: ${audioBlob.size} bytes, type: ${mimeType}`);

      const formData = new FormData();
      formData.append('file', audioBlob, `recording.${fileExtension}`);

      const response = await fetch('/api/voice/transcribe-simple', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const data = await response.json();
      const transcriptionDuration = Date.now() - transcriptionStartTime;

      if (data.success && data.transcription) {
        try {
          Analytics.transcriptionSuccess({
            transcription_duration_ms: transcriptionDuration,
            transcription_length: data.transcription.length,
            confidence: data.confidence || null
          });
        } catch (e) {
          console.warn('Analytics failed:', e);
        }

        onTranscript(data.transcription);
        console.log('✅ Transcription:', data.transcription);
      } else {
        console.error('❌ No transcription in response:', data);
        try {
          Analytics.transcriptionError({
            type: 'empty_response',
            message: 'No transcription in API response',
            duration_ms: transcriptionDuration
          });
        } catch (e) {
          console.warn('Analytics failed:', e);
        }
      }
    } catch (error: any) {
      console.error('❌ Transcription error:', error);
      try {
        Analytics.transcriptionError({
          type: 'api_error',
          message: error.message || 'Unknown transcription error',
          duration_ms: Date.now() - transcriptionStartTime
        });
      } catch (e) {
        console.warn('Analytics failed:', e);
      }
    } finally {
      setIsTranscribing(false);
      // Do NOT restart here - let the master restart loop handle it
      console.log('✅ Transcription complete, waiting for restart conditions...');
    }
  };

  const stopListening = useCallback(async () => {
    console.log('🛑 Stopping voice listening');

    shouldRestartRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (isWeb) {
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      } catch (error) {
        console.error('Error stopping web recording:', error);
      }
    } else {
      try {
        const status = await VoiceRecorder.getCurrentStatus();
        if (status.status === 'RECORDING') {
          await VoiceRecorder.stopRecording();
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }

    setIsListening(false);
    onListeningStateChange?.(false);
    onRecordingStateChange?.(false);
  }, [onListeningStateChange, onRecordingStateChange]);

  const toggleListening = useCallback(() => {
    if (isListening || isTranscribing) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, isTranscribing, startListening, stopListening]);

  // BULLETPROOF MASTER RESTART LOOP
  // This runs every 500ms and checks if we should restart recording
  useEffect(() => {
    if (!shouldAutoRestart) {
      return; // Don't run restart loop if autoRestart is disabled
    }

    console.log('🔄 Starting master restart loop (autoRestart enabled)');

    restartIntervalRef.current = setInterval(() => {
      // Check restart conditions:
      // 1. shouldRestartRef must be true (user wants continuous recording)
      // 2. Must not be currently listening or transcribing
      // 3. MAIA must not be speaking (isSpeaking must be false)
      // 4. Haven't exceeded max restart attempts

      const shouldTryRestart =
        shouldRestartRef.current &&
        !isListening &&
        !isTranscribing &&
        !isSpeaking &&
        restartAttemptsRef.current < maxRestartAttempts;

      if (shouldTryRestart) {
        console.log(`🔄 Restart conditions met! Attempting restart (attempt ${restartAttemptsRef.current + 1}/${maxRestartAttempts})`);
        restartAttemptsRef.current += 1;
        startListening().catch(err => {
          console.error('❌ Restart failed:', err);
        });
      } else {
        // Log why we're not restarting (for debugging)
        if (shouldRestartRef.current && (isListening || isTranscribing || isSpeaking)) {
          const reasons = [];
          if (isListening) reasons.push('listening');
          if (isTranscribing) reasons.push('transcribing');
          if (isSpeaking) reasons.push('MAIA speaking');

          if (Math.random() < 0.05) { // Log ~5% of the time to avoid spam
            console.log(`⏳ Waiting to restart: ${reasons.join(', ')}`);
          }
        }
      }
    }, 500);

    return () => {
      if (restartIntervalRef.current) {
        clearInterval(restartIntervalRef.current);
        restartIntervalRef.current = null;
      }
    };
  }, [shouldAutoRestart, isListening, isTranscribing, isSpeaking, startListening]);

  // Determine button state
  const isDisabled = isProcessing;
  const showLoader = isTranscribing;
  const isActive = isListening || isTranscribing;

  return (
    <button
      onClick={toggleListening}
      disabled={isDisabled}
      className={`
        relative p-4 rounded-full transition-all shadow-lg
        ${isActive
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-2 ring-red-400/50'
          : 'bg-white/10 text-gray-400 hover:bg-white/20'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={isActive ? 'Stop listening' : 'Start listening'}
      title={`Whisper Voice Input (${isActive ? 'Active' : 'Inactive'})`}
    >
      {showLoader ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : isListening ? (
        <Mic className="w-6 h-6 animate-pulse" />
      ) : (
        <MicOff className="w-6 h-6" />
      )}

      {/* Recording indicator */}
      {isListening && (
        <span className="absolute -top-1 -right-1 w-4 h-4">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
        </span>
      )}

      {/* Whisper indicator */}
      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-blue-500 rounded text-[10px] font-bold text-white">
        W
      </span>
    </button>
  );
});

WhisperContinuousConversation.displayName = 'WhisperContinuousConversation';
