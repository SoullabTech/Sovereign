/**
 * useAudioCapture - Browser audio capture hook for Live Scribe
 *
 * Provides three modes:
 * 1. Chunked - Records chunks and sends to Whisper periodically
 * 2. Continuous - Streams audio via WebSocket for real-time transcription
 * 3. Full - Records entire session for upload at end
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export type CaptureMode = 'chunked' | 'continuous' | 'full';

export interface AudioChunk {
  blob: Blob;
  startMs: number;
  endMs: number;
  index: number;
}

export interface TranscriptResult {
  text: string;
  startMs: number;
  endMs: number;
  confidence?: number;
  language?: string;
}

export interface UseAudioCaptureOptions {
  mode?: CaptureMode;
  chunkIntervalMs?: number; // For chunked mode (default 5000ms)
  onChunk?: (chunk: AudioChunk) => void;
  onTranscript?: (result: TranscriptResult) => void;
  onError?: (error: Error) => void;
  sampleRate?: number;
}

export interface UseAudioCaptureReturn {
  isCapturing: boolean;
  isPaused: boolean;
  audioLevel: number;
  duration: number;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  pause: () => void;
  resume: () => void;
  getFullRecording: () => Blob | null;
}

export function useAudioCapture(options: UseAudioCaptureOptions = {}): UseAudioCaptureReturn {
  const {
    mode = 'chunked',
    chunkIntervalMs = 5000,
    onChunk,
    onTranscript,
    onError,
    sampleRate = 16000,
  } = options;

  const [isCapturing, setIsCapturing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const chunkIndexRef = useRef(0);
  const startTimeRef = useRef(0);
  const chunkStartTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Analyze audio level for visual feedback
  const analyzeAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate RMS level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const level = Math.min(1, rms / 128); // Normalize to 0-1

    setAudioLevel(level);

    if (isCapturing && !isPaused) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudioLevel);
    }
  }, [isCapturing, isPaused]);

  // Process a chunk of audio
  const processChunk = useCallback(async (blob: Blob, startMs: number, endMs: number, index: number) => {
    const chunk: AudioChunk = { blob, startMs, endMs, index };

    onChunk?.(chunk);

    // In chunked mode, send to Whisper for transcription
    if (mode === 'chunked' && blob.size > 0) {
      try {
        const formData = new FormData();
        formData.append('audio', blob, `chunk_${index}.webm`);
        formData.append('startMs', String(startMs));
        formData.append('endMs', String(endMs));

        const response = await fetch('/api/voice/transcribe-simple', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          if (result.text) {
            onTranscript?.({
              text: result.text,
              startMs,
              endMs,
              confidence: result.confidence,
              language: result.language,
            });
          }
        }
      } catch (err) {
        console.error('[AudioCapture] Transcription error:', err);
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }
  }, [mode, onChunk, onTranscript, onError]);

  // Start capturing
  const start = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Setup audio analysis
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate,
      });
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Determine MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      chunkIndexRef.current = 0;
      startTimeRef.current = Date.now();
      chunkStartTimeRef.current = Date.now();

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);

          // In chunked mode, process each chunk
          if (mode === 'chunked') {
            const endMs = Date.now() - startTimeRef.current;
            const startMs = chunkStartTimeRef.current - startTimeRef.current;
            processChunk(event.data, startMs, endMs, chunkIndexRef.current);
            chunkIndexRef.current++;
            chunkStartTimeRef.current = Date.now();
          }
        }
      };

      // Start recording
      if (mode === 'chunked') {
        // Use timeslice for chunked recording
        mediaRecorder.start(chunkIntervalMs);
      } else {
        // Record continuously for full mode
        mediaRecorder.start();
      }

      setIsCapturing(true);
      setIsPaused(false);
      setDuration(0);

      // Start audio level analysis
      analyzeAudioLevel();

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      console.log('[AudioCapture] Started in', mode, 'mode');
    } catch (err) {
      console.error('[AudioCapture] Start error:', err);
      onError?.(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [mode, chunkIntervalMs, sampleRate, analyzeAudioLevel, processChunk, onError]);

  // Stop capturing
  const stop = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !streamRef.current) {
        resolve(null);
        return;
      }

      const mediaRecorder = mediaRecorderRef.current;

      mediaRecorder.onstop = () => {
        // Stop all tracks
        streamRef.current?.getTracks().forEach((track) => track.stop());

        // Close audio context
        audioContextRef.current?.close();

        // Cancel animation frame
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        // Clear intervals
        if (chunkIntervalRef.current) {
          clearInterval(chunkIntervalRef.current);
        }
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }

        // Create full recording blob
        const fullBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });

        setIsCapturing(false);
        setIsPaused(false);
        setAudioLevel(0);

        console.log('[AudioCapture] Stopped, total size:', fullBlob.size);
        resolve(fullBlob);
      };

      mediaRecorder.stop();
    });
  }, []);

  // Pause capturing
  const pause = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, []);

  // Resume capturing
  const resume = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      analyzeAudioLevel();
    }
  }, [analyzeAudioLevel]);

  // Get full recording blob
  const getFullRecording = useCallback((): Blob | null => {
    if (chunksRef.current.length === 0) return null;
    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
    return new Blob(chunksRef.current, { type: mimeType });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current?.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  return {
    isCapturing,
    isPaused,
    audioLevel,
    duration,
    start,
    stop,
    pause,
    resume,
    getFullRecording,
  };
}
