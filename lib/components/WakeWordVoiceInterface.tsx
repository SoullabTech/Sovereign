// lib/components/WakeWordVoiceInterface.tsx
// Wake word enabled voice interface supporting both push-to-talk and "Hello Maya"

"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, Settings, Loader2 } from 'lucide-react';
import { WakeWordDetector } from '../voice/wakeWord';
import { VoicePreprocessor } from '../voice/VoicePreprocessor';
import { useVoiceConfig } from '../hooks/useUserPreferences';

interface WakeWordVoiceInterfaceProps {
  userId: string;
  onTranscribed?: (transcript: string) => void;
  onVoiceResponse?: (audioUrl: string) => void;
  className?: string;
}

interface VoiceState {
  mode: 'push-to-talk' | 'wake-word';
  isListening: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  isWaitingForWakeWord: boolean;
  recordingDuration: number;
  lastTranscript: string;
  error?: string;
}

export const WakeWordVoiceInterface: React.FC<WakeWordVoiceInterfaceProps> = ({
  userId,
  onTranscribed,
  onVoiceResponse,
  className = ''
}) => {
  const {
    voiceId,
    voiceMode,
    interactionMode,
    customWakeWord,
    setVoiceMode,
    loading: prefsLoading
  } = useVoiceConfig(userId);

  const [state, setState] = useState<VoiceState>({
    mode: voiceMode,
    isListening: false,
    isRecording: false,
    isProcessing: false,
    isWaitingForWakeWord: false,
    recordingDuration: 0,
    lastTranscript: ''
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const wakeWordDetectorRef = useRef<WakeWordDetector | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const silenceDetectionRef = useRef<{
    silenceStart: number | null;
    lastSpeechTime: number;
    silenceThreshold: number;
    maxSilenceDuration: number;
  }>({
    silenceStart: null,
    lastSpeechTime: Date.now(),
    silenceThreshold: 0.005, // Even lower threshold to detect quieter speech
    maxSilenceDuration: 6000 // 6 seconds of silence before stopping (more patient)
  });

  // Initialize wake word detector
  useEffect(() => {
    if (state.mode === 'wake-word') {
      const wakeWord = customWakeWord || `Hello ${voiceId === 'maya-alloy' ? 'Maya' : 'Anthony'}`;
      wakeWordDetectorRef.current = new WakeWordDetector(wakeWord);
    }
  }, [state.mode, customWakeWord, voiceId]);

  // Update mode when preferences change
  useEffect(() => {
    if (!prefsLoading && voiceMode !== state.mode) {
      setState(prev => ({ ...prev, mode: voiceMode }));
    }
  }, [voiceMode, prefsLoading, state.mode]);

  // Start continuous listening for wake word
  const startWakeWordListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      streamRef.current = stream;
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });

      const source = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processorRef.current.onaudioprocess = async (event) => {
        if (!wakeWordDetectorRef.current || state.isRecording) return;

        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);

        // Convert to Float32Array for wake word detection
        const audioChunk = new Float32Array(inputData);
        const result = await wakeWordDetectorRef.current.detect(audioChunk);

        if (result.detected && result.confidence > 0.6) {
          console.log(`Wake word detected: ${result.keyword} (${(result.confidence * 100).toFixed(1)}%)`);
          startRecording();
        }
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      setState(prev => ({
        ...prev,
        isWaitingForWakeWord: true,
        error: undefined
      }));

    } catch (error) {
      console.error('Failed to start wake word listening:', error);
      setState(prev => ({
        ...prev,
        error: 'Microphone access denied. Please enable microphone permissions.',
        isWaitingForWakeWord: false
      }));
    }
  }, [state.isRecording]);

  // Setup intelligent silence detection during recording
  const setupSilenceDetection = useCallback(() => {
    if (!streamRef.current) return;

    // Create audio context for monitoring during recording
    const recordingAudioContext = new AudioContext({ sampleRate: 16000 });
    const source = recordingAudioContext.createMediaStreamSource(streamRef.current);
    const analyser = recordingAudioContext.createAnalyser();

    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Reset silence detection state
    silenceDetectionRef.current = {
      silenceStart: null,
      lastSpeechTime: Date.now(),
      silenceThreshold: 0.01,
      maxSilenceDuration: 4000 // 4 seconds for thinking pauses
    };

    const checkAudioLevel = () => {
      if (!state.isRecording) {
        recordingAudioContext.close();
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const normalizedVolume = average / 255;

      const now = Date.now();
      const silenceRef = silenceDetectionRef.current;

      if (normalizedVolume > silenceRef.silenceThreshold) {
        // Speech detected - reset silence tracking
        silenceRef.silenceStart = null;
        silenceRef.lastSpeechTime = now;
      } else {
        // Silence detected
        if (silenceRef.silenceStart === null) {
          silenceRef.silenceStart = now;
        } else {
          const silenceDuration = now - silenceRef.silenceStart;
          const timeSinceLastSpeech = now - silenceRef.lastSpeechTime;

          // Only auto-stop if we've had speech and then extended silence
          if (timeSinceLastSpeech > 2000 && silenceDuration > silenceRef.maxSilenceDuration) {
            console.log('Auto-stopping recording after natural pause');
            stopRecording();
            recordingAudioContext.close();
            return;
          }
        }
      }

      // Continue monitoring
      if (state.isRecording) {
        requestAnimationFrame(checkAudioLevel);
      }
    };

    // Start monitoring
    requestAnimationFrame(checkAudioLevel);
  }, [state.isRecording, stopRecording]);

  // Stop wake word listening
  const stopWakeWordListening = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setState(prev => ({ ...prev, isWaitingForWakeWord: false }));
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      if (!streamRef.current) {
        // For push-to-talk mode, request new stream with gentle noise suppression
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 44100,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: false, // Disable aggressive noise suppression that can cut off speech
            autoGainControl: false   // Prevent automatic gain adjustments during pauses
          }
        });
      }

      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        processRecording();
      };

      // Setup intelligent silence detection for automatic stopping
      setupSilenceDetection();

      mediaRecorderRef.current.start();

      // Start recording timer with extended timeout for natural pauses
      let duration = 0;
      recordingTimerRef.current = setInterval(() => {
        duration += 1;
        setState(prev => ({ ...prev, recordingDuration: duration }));

        // Auto-stop after 60 seconds (extended for thoughtful conversation)
        if (duration >= 60) {
          stopRecording();
        }
      }, 1000);

      setState(prev => ({
        ...prev,
        isRecording: true,
        recordingDuration: 0,
        error: undefined
      }));

    } catch (error) {
      console.error('Failed to start recording:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to start recording. Please check microphone permissions.'
      }));
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setState(prev => ({ ...prev, isRecording: false }));
  }, []);

  // Process recorded audio
  const processRecording = useCallback(async () => {
    if (audioChunksRef.current.length === 0) return;

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('userId', userId);

      // Send to transcription service
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      const transcript = result.transcript || '';

      setState(prev => ({
        ...prev,
        lastTranscript: transcript,
        isProcessing: false
      }));

      // Send transcript to parent
      if (transcript && onTranscribed) {
        onTranscribed(transcript);
      }

      // Get voice response
      if (transcript) {
        await getVoiceResponse(transcript);
      }

    } catch (error) {
      console.error('Failed to process recording:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: 'Failed to process audio. Please try again.'
      }));
    }
  }, [userId, onTranscribed]);

  // Get voice response from Oracle
  const getVoiceResponse = useCallback(async (transcript: string) => {
    try {
      const response = await fetch('/api/oracle/voice-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: transcript,
          userId,
          voiceId,
          interactionMode
        }),
      });

      if (!response.ok) {
        throw new Error('Voice response failed');
      }

      const result = await response.json();

      // Process text for voice synthesis
      let responseText = result.content || result.response || '';
      responseText = VoicePreprocessor.extractSpokenContent(responseText);

      // 🔥 ELEMENTAL PROSODY: Extract voiceTone from oracle response
      const voiceTone = result.voiceTone;
      if (voiceTone) {
        console.log('🌀 Received elemental voiceTone from oracle:', voiceTone);
      }

      // Generate voice audio with elemental prosody
      const voiceResponse = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: responseText,
          voiceId,
          userId,
          voiceTone  // 🌀 Pass elemental tone for Fire/Water/Earth/Air/Aether modulation
        }),
      });

      if (voiceResponse.ok) {
        const audioBlob = await voiceResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Play audio automatically
        const audio = new Audio(audioUrl);
        audio.play();

        if (onVoiceResponse) {
          onVoiceResponse(audioUrl);
        }
      }

    } catch (error) {
      console.error('Failed to get voice response:', error);
    }
  }, [userId, voiceId, interactionMode, onVoiceResponse]);

  // Toggle voice mode
  const toggleVoiceMode = useCallback(async () => {
    const newMode = state.mode === 'push-to-talk' ? 'wake-word' : 'push-to-talk';

    // Stop current listening
    if (state.isWaitingForWakeWord) {
      stopWakeWordListening();
    }

    // Update preferences
    await setVoiceMode(newMode);

    setState(prev => ({ ...prev, mode: newMode }));
  }, [state.mode, state.isWaitingForWakeWord, setVoiceMode, stopWakeWordListening]);

  // Handle push-to-talk
  const handlePushToTalk = useCallback((pressed: boolean) => {
    if (pressed && !state.isRecording) {
      startRecording();
    } else if (!pressed && state.isRecording) {
      stopRecording();
    }
  }, [state.isRecording, startRecording, stopRecording]);

  // Initialize wake word listening
  useEffect(() => {
    if (state.mode === 'wake-word' && !state.isWaitingForWakeWord && !state.isRecording) {
      startWakeWordListening();
    } else if (state.mode === 'push-to-talk' && state.isWaitingForWakeWord) {
      stopWakeWordListening();
    }

    return () => {
      stopWakeWordListening();
    };
  }, [state.mode, state.isWaitingForWakeWord, state.isRecording, startWakeWordListening, stopWakeWordListening]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (prefsLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading voice settings...</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Status Display */}
      <div className="text-center">
        {state.mode === 'wake-word' && state.isWaitingForWakeWord && (
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm">
              Listening for "{customWakeWord || `Hello ${voiceId === 'maya-alloy' ? 'Maya' : 'Anthony'}`}"
            </span>
          </div>
        )}

        {state.isRecording && (
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Recording... {formatTime(state.recordingDuration)}</span>
          </div>
        )}

        {state.isProcessing && (
          <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Processing...</span>
          </div>
        )}

        {state.error && (
          <div className="text-red-600 dark:text-red-400 text-sm">
            {state.error}
          </div>
        )}
      </div>

      {/* Voice Controls */}
      <div className="flex items-center space-x-4">
        {/* Main Voice Button */}
        <button
          onMouseDown={() => state.mode === 'push-to-talk' && handlePushToTalk(true)}
          onMouseUp={() => state.mode === 'push-to-talk' && handlePushToTalk(false)}
          onTouchStart={() => state.mode === 'push-to-talk' && handlePushToTalk(true)}
          onTouchEnd={() => state.mode === 'push-to-talk' && handlePushToTalk(false)}
          disabled={state.isProcessing}
          className={`
            relative w-16 h-16 rounded-full transition-all duration-200 flex items-center justify-center
            ${state.isRecording
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
              : state.isWaitingForWakeWord
              ? 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30'
              : 'bg-gray-600 hover:bg-gray-700'
            }
            ${state.mode === 'push-to-talk' ? 'cursor-pointer' : 'cursor-default'}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {state.isProcessing ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : state.isRecording ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}

          {/* Recording indicator */}
          {state.isRecording && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
          )}
        </button>

        {/* Mode Toggle */}
        <button
          onClick={toggleVoiceMode}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={`Switch to ${state.mode === 'push-to-talk' ? 'wake word' : 'push-to-talk'} mode`}
        >
          <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {state.mode === 'push-to-talk' ? 'Push-to-Talk' : 'Wake Word'}
          </span>
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 max-w-sm">
        {state.mode === 'push-to-talk' ? (
          <p>Hold the microphone button to speak. Take your time - natural thinking pauses are welcome. Release when completely finished.</p>
        ) : (
          <p>Say "{customWakeWord || `Hello ${voiceId === 'maya-alloy' ? 'Maya' : 'Anthony'}`}" to start speaking. I'll automatically detect when you're finished after a natural pause.</p>
        )}
      </div>

      {/* Last Transcript Display */}
      {state.lastTranscript && (
        <div className="max-w-md p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">You said:</div>
          <div className="text-sm text-gray-900 dark:text-gray-100">"{state.lastTranscript}"</div>
        </div>
      )}
    </div>
  );
};

export default WakeWordVoiceInterface;