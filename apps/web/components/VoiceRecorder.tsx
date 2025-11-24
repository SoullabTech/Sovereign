'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, Shield, Settings, Eye, EyeOff } from 'lucide-react';
import { showError } from '@/components/system/ErrorOverlay';
import { useMaiaStream } from '@/hooks/useMayaStream';
import { OracleVoicePlayer } from './voice/OracleVoicePlayer';
import { unlockAudio } from '@/lib/audio/audioUnlock';
import { useToastContext } from '@/components/system/ToastProvider';
import PrivacySettingsPanel from './PrivacySettingsPanel';

interface VoiceRecorderProps {
  userId: string;
  onTranscribed?: (data: { transcript: string; audioUrl?: string }) => void;
  maxDuration?: number; // in seconds, default 60
  autoSend?: boolean; // Auto-send after silence vs manual confirm
  silenceTimeout?: number; // Base silence detection (ms) - only used in strict mode
  minSpeechLength?: number; // Minimum speech duration before auto-send (ms)
  strictMode?: boolean; // If true, use fixed timeout; if false, use adaptive timeout
  autoStartSession?: boolean; // Auto-trigger Maya&apos;s welcome ritual on component mount
  // 🌀 Jungian Prosody Props
  prosodyData?: any; // Live prosody data from backend
  onProsodyUpdate?: (data: any) => void; // Callback when new prosody data is available
}

export default function VoiceRecorder({ 
  userId, 
  onTranscribed,
  maxDuration = 60,
  autoSend = true,
  silenceTimeout = 5000,
  minSpeechLength = 2000,
  strictMode = false, // Default to adaptive mode for better UX
  autoStartSession = true, // Default to auto-start Maya&apos;s welcome ritual
  // 🌀 Jungian Prosody Props
  prosodyData: externalProsodyData,
  onProsodyUpdate
}: VoiceRecorderProps) {
  const { showToast } = useToastContext();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [micScale, setMicScale] = useState(1);
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [autoStopReason, setAutoStopReason] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>(''); // Track interim transcript for adaptive timeout
  const [prosodyData, setProsodyData] = useState<any>(externalProsodyData || null); // Live Jungian prosody data
  const [jungianFlow, setJungianFlow] = useState<any>(null); // Mirror→Balance flow data
  const [hasTriggeredWelcome, setHasTriggeredWelcome] = useState(false); // Track if we&apos;ve auto-triggered Maya&apos;s welcome
  const [mayaWelcomeMessage, setMayaWelcomeMessage] = useState<string>(''); // Store Maya&apos;s welcome message
  const [isPlayingWelcome, setIsPlayingWelcome] = useState(false); // Track welcome audio playback

  // 🔒 Privacy Controls State
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [cognitiveAnalysis, setCognitiveAnalysis] = useState<any>(null);
  const [memberInsights, setMemberInsights] = useState<any>(null);
  const [showInsights, setShowInsights] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);
  const stopRecordingRef = useRef<(() => void) | null>(null);
  
  // Maya Stream integration
  const { isStreaming, stream: streamMayaMessage, stopStream } = useMayaStream();

  // Silence detection constants (Adaptive + ChatGPT-style)
  const SILENCE_THRESHOLD = 0.025; // Raised for background noise tolerance
  const MIN_RECORDING_TIME = minSpeechLength; // Configurable minimum speech length
  const MAX_RECORDING_DURATION = 8000; // 8s hard cutoff
  const SILENCE_THRESHOLDS = {
    short: 2500,
    medium: 4000,
    long: 6000,
  };
  
  // 🧠 Adaptive Silence Detection Mode
  const detectSilenceMode = (transcriptLength: number): "short" | "medium" | "long" => {
    const estimatedWords = Math.max(1, Math.floor(transcriptLength / 5));
    if (estimatedWords < 4) return "short";
    if (estimatedWords < 12) return "medium";
    return "long";
  };

  // 🔥 Enhanced silence detection with adaptive thresholds
  const checkSilence = (volume: number) => {
    const now = Date.now();
    const totalRecordingTime = now - recordingStartTime;
    const timeSinceLastSpeech = now - lastSpeechTimeRef.current;
    
    if (volume > SILENCE_THRESHOLD) {
      // ✅ Speech detected - reset silence timer and update last speech time
      lastSpeechTimeRef.current = now;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
        
        if (process.env.NODE_ENV === 'development') {
        }
      }
    } else if (
      isRecording && 
      !silenceTimerRef.current && 
      autoSend && 
      totalRecordingTime > MIN_RECORDING_TIME
    ) {
      // ⏰ Start adaptive silence countdown
      const mode = detectSilenceMode(currentTranscript.length);
      const timeout = SILENCE_THRESHOLDS[mode];
      
      console.debug(`[DEBUG] Silence countdown started: ${timeout}ms`);
      
      if (process.env.NODE_ENV === 'development') {
        const estimatedWords = Math.max(1, Math.floor(currentTranscript.length / 5));
      }
      
      silenceTimerRef.current = setTimeout(() => {
        console.debug(`[DEBUG] Auto-stop after ${timeout}ms (${mode}) silence`);
        
        if (process.env.NODE_ENV === 'development') {
        }
        
        setAutoStopReason(`Stopped after ${(timeout/1000).toFixed(1)}s silence`);
        
        // Force stop recording
        if (stopRecordingRef.current) {
          stopRecordingRef.current();
        }
      }, timeout);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 🌀 Helper functions for Jungian Prosody Debug Panel
  const getElementColor = (element: string) => {
    const colors: Record<string, string> = {
      fire: 'text-orange-400',
      water: 'text-blue-400', 
      earth: 'text-green-400',
      air: 'text-yellow-400',
      aether: 'text-amber-400'
    };
    return colors[element] || 'text-white';
  };

  const getElementIcon = (element: string) => {
    const icons: Record<string, string> = {
      fire: '🔥',
      water: '💧',
      earth: '🌍', 
      air: '💨',
      aether: '✨'
    };
    return icons[element] || '❓';
  };

  const getBalanceReason = (userElement: string, balanceElement: string) => {
    const reasons: Record<string, string> = {
      'fire-earth': 'Jungian opposite (grounding)',
      'fire-water': 'softened for overwhelm',
      'air-water': 'Jungian opposite (feeling)',
      'air-aether': 'uncertainty bridge',
      'water-air': 'Jungian opposite (clarity)', 
      'earth-fire': 'Jungian opposite (activation)',
      'aether-earth': 'transcendence grounding'
    };
    return reasons[`${userElement}-${balanceElement}`] || 'contextual balance';
  };

  // Continuous audio analysis loop (runs even when silent)
  const startAudioAnalysis = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyse = () => {
      if (!isRecording) {
        // Stop analysis when not recording
        return;
      }

      animationRef.current = requestAnimationFrame(analyse);
      
      // Get audio data
      analyser.getByteTimeDomainData(dataArray);

      // Calculate RMS volume (always runs - this was the bug!)
      let rms = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        rms += normalized * normalized;
      }
      rms = Math.sqrt(rms / bufferLength);
      
      // Update mic button scale based on RMS
      const scale = 1 + (rms * 0.5);
      setMicScale(Math.min(scale, 1.3));
      
      // CRITICAL: Always check silence even when volume is low
      checkSilence(rms);

      // Update debug info with enhanced diagnostics
      const now = Date.now();
      const totalRecordingTime = now - recordingStartTime;
      const timeSinceLastSpeech = now - lastSpeechTimeRef.current;
      const mode = detectSilenceMode(currentTranscript.length);
      const adaptiveTimeout = SILENCE_THRESHOLDS[mode];
      
      setDebugInfo({
        volume: rms,
        volumePercent: (rms * 100).toFixed(1),
        threshold: SILENCE_THRESHOLD,
        thresholdPercent: (SILENCE_THRESHOLD * 100).toFixed(1),
        silenceTimerActive: !!silenceTimerRef.current,
        timeSinceLastSpeech,
        recordingDuration: totalRecordingTime,
        minRecordingMet: totalRecordingTime > MIN_RECORDING_TIME,
        autoStopCountdown: silenceTimerRef.current ? Math.max(0, adaptiveTimeout - (now - lastSpeechTimeRef.current)) : 0,
        isSpeaking: rms > SILENCE_THRESHOLD,
        adaptiveTimeout,
        adaptiveMode: true,
        estimatedWords: Math.max(1, Math.floor(currentTranscript.length / 5)),
        transcriptLength: currentTranscript.length,
        mode
      });
    };

    analyse();
  };

  // Draw organic amoebic blob (ChatGPT-style voice visualization)
  const drawOrganicBlob = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let time = 0; // Time for organic animation

    const draw = () => {
      if (!isRecording) {
        // Draw subtle breathing animation when idle
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const baseRadius = 20;
        const breathingScale = 1 + Math.sin(time * 0.02) * 0.1;
        
        // Draw idle breathing blob
        ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * breathingScale, 0, Math.PI * 2);
        ctx.fill();
        
        time++;
        if (isRecording) requestAnimationFrame(draw);
        return;
      }

      requestAnimationFrame(draw);
      time++;
      
      analyser.getByteTimeDomainData(dataArray);

      // Calculate RMS for overall energy
      let rms = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        rms += normalized * normalized;
      }
      rms = Math.sqrt(rms / bufferLength);

      // Clear canvas with subtle background
      ctx.fillStyle = 'rgba(248, 250, 252, 0.98)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 25;
      const energyRadius = baseRadius + (rms * 40);

      // Create organic blob points
      const numPoints = 12;
      const points = [];
      
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        
        // Use frequency data for organic variation
        const freqIndex = Math.floor((i / numPoints) * bufferLength);
        const freqValue = (dataArray[freqIndex] - 128) / 128;
        
        // Create organic variation with multiple sine waves
        const organicVariation = 
          Math.sin(time * 0.03 + i * 0.5) * 0.3 +
          Math.sin(time * 0.05 + i * 0.8) * 0.2 +
          Math.cos(time * 0.04 + i * 1.2) * 0.15;
        
        const radius = energyRadius * (1 + organicVariation + freqValue * 0.4);
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        points.push({ x, y });
      }

      // Draw smooth organic blob using cardinal splines
      ctx.fillStyle = `rgba(59, 130, 246, ${0.15 + rms * 0.3})`;
      ctx.strokeStyle = `rgba(37, 99, 235, ${0.4 + rms * 0.4})`;
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      
      // Move to first point
      ctx.moveTo(points[0].x, points[0].y);
      
      // Create smooth curves between all points
      for (let i = 0; i < points.length; i++) {
        const current = points[i];
        const next = points[(i + 1) % points.length];
        const afterNext = points[(i + 2) % points.length];
        
        // Calculate control points for smooth curves
        const cp1x = current.x + (next.x - points[(i - 1 + points.length) % points.length].x) / 6;
        const cp1y = current.y + (next.y - points[(i - 1 + points.length) % points.length].y) / 6;
        const cp2x = next.x - (afterNext.x - current.x) / 6;
        const cp2y = next.y - (afterNext.y - current.y) / 6;
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Add subtle glow effect
      ctx.shadowColor = 'rgba(59, 130, 246, 0.2)';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow
      
      // Add inner sparkle effect when speaking
      if (rms > 0.05) {
        ctx.fillStyle = `rgba(255, 255, 255, ${rms * 2})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, rms * 15, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    draw();
  };

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      
      // ✅ Gracefully unlock audio on first interaction
      await unlockAudio(showToast);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Setup Web Audio API for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Handle data chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await processAudio(audioBlob);
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Initialize speech detection and recording start time
      const now = Date.now();
      lastSpeechTimeRef.current = now;
      setRecordingStartTime(now);
      
      if (process.env.NODE_ENV === 'development') {
        const modeLabel = strictMode ? 'Strict' : 'Adaptive';
      }
      
      // Start both organic blob animation AND audio analysis
      drawOrganicBlob();
      startAudioAnalysis();
      
      // Safety timer: 8s hard cutoff
      safetyTimerRef.current = setTimeout(() => {
        console.warn("[DEBUG] Safety cutoff at 8s reached");
        setAutoStopReason("Stopped after 8s (safety cutoff)");
        if (stopRecordingRef.current) {
          stopRecordingRef.current();
        }
      }, MAX_RECORDING_DURATION);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      const errorMsg = 'Failed to access microphone. Please check permissions.';
      setError(errorMsg);
      showError(errorMsg, 'error');
    }
  };

  // Stop recording (bulletproof state reset to prevent black screen bug)
  const stopRecording = async () => {
    if (process.env.NODE_ENV === 'development') {
      const recordingDuration = Date.now() - recordingStartTime;
      const estimatedWords = Math.max(1, Math.floor(currentTranscript.length / 5));
    }
    
    // ✅ Always clear timers first
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // ✅ Always reset recording state (prevents black button bug)
    setIsRecording(false);
    setMicScale(1);

    // ✅ Stop audio tracks cleanly
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    // ✅ Reset audio context so next recording starts clean
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        await audioContextRef.current.close();
      } catch (err) {
        console.warn('Audio context close warning:', err);
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;

    // Clear recording timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    // Clear debug info
    setDebugInfo({});
    
  };

  // Process and upload audio
  const processAudio = async (audioBlob: Blob) => {
    console.log('Processing audio blob:', {
      size: audioBlob.size,
      type: audioBlob.type,
      timestamp: new Date().toISOString()
    });
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('file', audioBlob, 'voice-note.webm');
      
      
      // Upload to transcription API
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }
      
      const data = await response.json();
      
      console.log('[VoiceRecorder] Response:', {
        success: data.success,
        transcript: data.transcription?.substring(0, 50) + '...',
        hasTranscript: !!data.transcription
      });
      
      if (data.success) {
        const transcript = data.transcription;
        const audioUrl = URL.createObjectURL(audioBlob);

        // 🔒 Handle Privacy-Aware Cognitive Analysis
        if (data.cognitiveAnalysis) {
          setCognitiveAnalysis(data.cognitiveAnalysis);
          console.log('🧠 Received cognitive analysis with privacy filtering applied');
        }

        if (data.memberInsights) {
          setMemberInsights(data.memberInsights);
          console.log('✨ Received member-friendly insights:', Object.keys(data.memberInsights));
        }

        // Log the final transcript
        console.log('📝 Transcription complete:', {
          transcript: transcript.substring(0, 50) + '...',
          duration: data.duration + 's',
          hasCoordinates: data.voiceMetrics?.hasWordTimings || false,
          hasCognitiveAnalysis: !!data.cognitiveAnalysis,
          hasMemberInsights: !!data.memberInsights
        });

        // Check if we recorded long enough
        const recordingDuration = Date.now() - recordingStartTime;

        if (autoSend && recordingDuration >= MIN_RECORDING_TIME) {
          // Auto-send mode: send immediately
          console.log('Auto-sending transcript:', {
            transcript: transcript.substring(0, 50) + '...',
            audioUrl: audioUrl ? 'Has URL' : 'No URL',
            duration: recordingDuration + 'ms'
          });

          onTranscribed?.({
            transcript,
            audioUrl
          });

        } else if (!autoSend) {
          // Manual mode: store for manual confirmation
          setPendingTranscript(transcript);
        } else {
          // Recording too short, ignore
        }
      } else {
        console.error('❌ [DEBUG] Transcription failed:', data);
      }
      
    } catch (err) {
      console.error('Error processing audio:', err);
      const errorMsg = 'Failed to transcribe audio. Please try again.';
      setError(errorMsg);
      showError(errorMsg, 'error');
    } finally {
      setIsProcessing(false);
      setRecordingTime(0);
    }
  };

  // Manual send function for manual mode
  const handleManualSend = () => {
    if (pendingTranscript && onTranscribed) {
      onTranscribed({
        transcript: pendingTranscript,
        audioUrl: undefined // Audio URL not needed for manual sends
      });
      setPendingTranscript(null);
    }
  };

  // Cancel pending transcript
  const handleCancelPending = () => {
    setPendingTranscript(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
      }
      
      // Stop media tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Stop animations
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Only close AudioContext on unmount (not on stop recording)
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Auto-clear auto-stop notification after 3 seconds
  useEffect(() => {
    if (autoStopReason) {
      const timer = setTimeout(() => {
        setAutoStopReason(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoStopReason]);

  // Setup stop ref for use in timers
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, []);

  // 🌀 Sync external prosody data with internal state
  useEffect(() => {
    if (externalProsodyData && externalProsodyData !== prosodyData) {
      setProsodyData(externalProsodyData);
      if (externalProsodyData.jungianFlow) {
        setJungianFlow(externalProsodyData.jungianFlow);
      }
    }
  }, [externalProsodyData, prosodyData]);
  
  // 🌟 Auto-trigger Maya's Welcome Ritual on component mount
  useEffect(() => {
    const triggerMayaWelcome = async () => {
      if (!autoStartSession || hasTriggeredWelcome || isStreaming) return;
      
      try {
        setHasTriggeredWelcome(true);
        
        // Trigger Maya&apos;s opening ritual with a special parameter to indicate this is a new session
        const welcomeMessage = await streamMayaMessage({
          userText: '__MAYA_WELCOME_RITUAL__', // Special trigger for opening ritual
          element: 'aether', // Start with balanced aether energy
          userId: userId || 'anonymous',
          lang: 'en-US'
        });
        
        if (welcomeMessage) {
          setMayaWelcomeMessage(welcomeMessage);
          setIsPlayingWelcome(true);
        }
      } catch (error) {
        console.error('❌ [VoiceRecorder] Failed to trigger Maya welcome ritual:', error);
        // Don&apos;t show error to user, as this is a background enhancement
      }
    };
    
    // Slight delay to ensure component is fully mounted
    const timer = setTimeout(triggerMayaWelcome, 500);
    return () => clearTimeout(timer);
  }, [autoStartSession, hasTriggeredWelcome, streamMayaMessage, userId, isStreaming]);

  // Set canvas size
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = 80;
      }
    }
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-3">
      {/* 🔒 Privacy Controls - Prominent at Top */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setShowPrivacySettings(true)}
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all"
          title="Manage what cognitive insights you want to see"
        >
          <Shield className="w-4 h-4" />
          Privacy Controls
        </button>

        {memberInsights && (
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all"
            title={showInsights ? "Hide your voice insights" : "Show your voice insights"}
          >
            {showInsights ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showInsights ? "Hide" : "Show"} Insights
          </button>
        )}
      </div>

      {/* Member-Friendly Cognitive Insights */}
      {showInsights && memberInsights && (
        <div className="w-full max-w-lg mb-4 p-4 bg-gradient-to-br from-amber-50 to-violet-50 dark:from-amber-900/20 dark:to-violet-900/20 rounded-xl border border-amber-200 dark:border-amber-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Your Voice Essence</h3>
          </div>

          <div className="space-y-3 text-sm">
            {memberInsights.essenceInsights && (
              <div>
                <div className="text-violet-700 dark:text-violet-300 font-medium mb-1">Voice Clarity</div>
                <div className="text-gray-700 dark:text-gray-300">{memberInsights.essenceInsights}</div>
              </div>
            )}

            {memberInsights.energyFlow && (
              <div>
                <div className="text-violet-700 dark:text-violet-300 font-medium mb-1">Energy Flow</div>
                <div className="text-gray-700 dark:text-gray-300">{memberInsights.energyFlow}</div>
              </div>
            )}

            {memberInsights.wisdomEmergence && (
              <div>
                <div className="text-violet-700 dark:text-violet-300 font-medium mb-1">Wisdom Emergence</div>
                <div className="text-gray-700 dark:text-gray-300">{memberInsights.wisdomEmergence}</div>
              </div>
            )}

            {memberInsights.breathworkGuidance && (
              <div>
                <div className="text-violet-700 dark:text-violet-300 font-medium mb-1">Breathwork Guidance</div>
                <div className="text-gray-700 dark:text-gray-300">{memberInsights.breathworkGuidance}</div>
              </div>
            )}

            {memberInsights.integrationInvitation && (
              <div>
                <div className="text-violet-700 dark:text-violet-300 font-medium mb-1">Integration Invitation</div>
                <div className="text-gray-700 dark:text-gray-300">{memberInsights.integrationInvitation}</div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
            <div className="text-xs text-amber-600 dark:text-amber-400">
              These insights respect your privacy settings and are only shown to you.
            </div>
          </div>
        </div>
      )}

      {/* Recording button with pulsing effect */}
      <div className="relative">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            relative flex items-center justify-center
            w-12 h-12 rounded-full transition-all duration-200
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            text-white shadow-lg hover:shadow-xl
            focus:outline-none focus:ring-2 focus:ring-offset-2 
            ${isRecording ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
          `}
          style={{
            transform: `scale(${micScale})`,
            transition: 'transform 100ms ease-out'
          }}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
        
        {/* Pulsing ring when recording */}
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></div>
        )}
      </div>

      {/* Waveform canvas */}
      <div className={`
        w-full max-w-xs transition-all duration-300
        ${isRecording ? 'opacity-100 h-20' : 'opacity-0 h-0'}
        overflow-hidden
      `}>
        <canvas
          ref={canvasRef}
          className="w-full h-20 bg-white rounded-lg shadow-sm"
          aria-label="Recording waveform visualization"
        />
      </div>

      {/* Recording time and status */}
      <div className="flex items-center gap-3">
        {isRecording && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="flex gap-1">
              <span className="w-1 h-4 bg-red-500 rounded-full animate-wave-1"></span>
              <span className="w-1 h-4 bg-red-500 rounded-full animate-wave-2"></span>
              <span className="w-1 h-4 bg-red-500 rounded-full animate-wave-3"></span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {formatTime(recordingTime)}
            </span>
          </div>
        )}

        {isProcessing && (
          <span className="text-sm text-gray-600 animate-fade-in">
            Transcribing...
          </span>
        )}
      </div>

      {/* Manual send controls (only in manual mode with pending transcript) */}
      {!autoSend && pendingTranscript && (
        <div className="flex items-center gap-2 animate-fade-in">
          <button
            onClick={handleManualSend}
            className="px-3 py-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFD700]/90 transition-colors font-medium text-sm"
            title="Send transcript"
          >
            ✅ Send
          </button>
          <button
            onClick={handleCancelPending}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
            title="Cancel transcript"
          >
            ✖ Cancel
          </button>
        </div>
      )}

      {/* Status indicator */}
      {!autoSend && pendingTranscript && (
        <div className="text-sm text-[#FFD700] animate-pulse">
          Transcript ready - tap ✅ to send
        </div>
      )}

      {/* Auto-stop notification (golden toast) */}
      {autoStopReason && (
        <div className="animate-fade-in bg-[#FFD700]/90 text-black px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
          ✋ {autoStopReason}
        </div>
      )}

      {/* Mode indicator */}
      <div className="text-xs text-gray-500">
        {autoSend 
          ? 'Auto-stop: 2.5s (short) / 4s (medium) / 6s (long) / 8s (max)'
          : 'Manual send mode - tap ✅ to confirm'
        }
      </div>

      {/* 🔍 Enhanced Debug Overlay - Live Diagnostics */}
      {process.env.NODE_ENV === 'development' && isRecording && debugInfo.volume !== undefined && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-black/90 text-white rounded-lg text-xs font-mono shadow-lg border border-gray-600 min-w-80 z-50">
          {/* Title Bar */}
          <div className="mb-2 pb-2 border-b border-gray-600">
            <div className="text-cyan-400 font-bold text-sm">🔍 VOICE DEBUG PANEL</div>
          </div>
          
          {/* Volume Meter */}
          <div className="mb-2">
            <div className="flex justify-between text-yellow-300 font-semibold mb-1">
              <span>Volume: {debugInfo.volumePercent}%</span>
              <span>Threshold: {debugInfo.thresholdPercent}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  debugInfo.isSpeaking ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, debugInfo.volumePercent)}%` }}
              />
            </div>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-300">Status:</span>
              <span className={debugInfo.isSpeaking ? 'text-green-400' : 'text-red-400'}>
                {debugInfo.isSpeaking ? '🎤 SPEAKING' : '🔇 SILENT'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Timer:</span>
              <span className={debugInfo.silenceTimerActive ? 'text-red-400' : 'text-gray-400'}>
                {debugInfo.silenceTimerActive ? '🔴 ARMED' : '⚪ OFF'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Duration:</span>
              <span className="text-blue-400">{Math.round(debugInfo.recordingDuration / 1000)}s</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Min Met:</span>
              <span className={debugInfo.minRecordingMet ? 'text-green-400' : 'text-yellow-400'}>
                {debugInfo.minRecordingMet ? '✅ YES' : '⏳ NO'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-300">Last Speech:</span>
              <span className="text-amber-400">{Math.round(debugInfo.timeSinceLastSpeech / 1000)}s ago</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-300">Auto-Stop:</span>
              <span className={debugInfo.silenceTimerActive ? 'text-red-400 font-bold' : 'text-gray-400'}>
                {debugInfo.silenceTimerActive ? 
                  `${Math.max(0, Math.round(debugInfo.autoStopCountdown / 1000))}s` : 
                  '—'
                }
              </span>
            </div>
          </div>

          {/* 🚨 Live Countdown Alert */}
          {debugInfo.silenceTimerActive && (
            <div className="mt-2 p-2 bg-red-900/50 border border-red-600 rounded text-center">
              <div className="text-red-300 font-bold animate-pulse">
                ⏰ AUTO-STOP IN {Math.max(0, Math.round(debugInfo.autoStopCountdown / 1000))} SECONDS
              </div>
            </div>
          )}
          
          {/* Adaptive Mode Status */}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="flex justify-between text-xs text-cyan-300 font-semibold mb-1">
              <span>Mode: 🧠 {debugInfo.mode || 'Adaptive'}</span>
              <span>Timeout: {(debugInfo.adaptiveTimeout / 1000).toFixed(1)}s</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              <span>Est. Words: {debugInfo.estimatedWords}</span>
              <span>Chars: {debugInfo.transcriptLength}</span>
            </div>
          </div>
          
          {/* System Status */}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-xs text-green-400 font-semibold mb-1">SYSTEM STATUS</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="text-gray-400">TTS Service:</span>
              <span className="text-white">{process.env.SESAME_URL ? 'Sesame' : 'Fallback'}</span>
              <span className="text-gray-400">Memory Refs:</span>
              <span className="text-white">{process.env.NEXT_PUBLIC_MEMORY_REFERENCES_ENABLED === 'true' ? 'Enabled' : 'Disabled'}</span>
              <span className="text-gray-400">Input Clear:</span>
              <span className="text-green-400">✅ Active</span>
            </div>
          </div>
          
          {/* Logic Status */}
          <div className="pt-2 text-xs text-gray-400">
            Logic: {debugInfo.isSpeaking ? 'Speech clearing timer' : 
                    debugInfo.minRecordingMet ? 'Ready for silence detection' : 'Waiting for minimum duration'}
          </div>
        </div>
      )}

      {/* 🌀 Enhanced Jungian Prosody Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-full right-0 mt-2 p-3 bg-gradient-to-br from-amber-900/90 to-indigo-900/90 text-white rounded-lg text-xs font-mono shadow-lg border border-amber-600 min-w-80 z-40">
          {/* Title Bar */}
          <div className="mb-2 pb-2 border-b border-amber-600">
            <div className="text-amber-300 font-bold text-sm flex items-center gap-2">
              🌀 JUNGIAN PROSODY LAB
              {prosodyData && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live Data" />}
            </div>
            <div className="text-amber-400 text-xs mt-1">Mirror → Balance → Shape</div>
          </div>

          {/* Real-Time Data or Demo Mode */}
          <div className="space-y-3">
            {prosodyData ? (
              /* 🔴 LIVE DATA MODE */
              <>
                {/* User Element Detection */}
                <div className="bg-amber-800/40 rounded p-2">
                  <div className="text-yellow-300 font-semibold mb-1 flex items-center gap-1">
                    {getElementIcon(prosodyData.userElement)} User Element Detection:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-gray-300">Detected:</span>
                    <span className={`font-bold ${getElementColor(prosodyData.userElement)}`}>
                      {prosodyData.userElement} 
                    </span>
                    <span className="text-gray-300">Confidence:</span>
                    <span className="text-green-400">{Math.round((prosodyData.confidence || 0.8) * 100)}%</span>
                    <span className="text-gray-300">Context:</span>
                    <span className="text-red-400">
                      {prosodyData.context ? Object.keys(prosodyData.context).filter(k => prosodyData.context[k]).join(', ') || 'balanced' : 'analyzing...'}
                    </span>
                  </div>
                </div>

                {/* Mirror Phase - Live Data */}
                <div className="bg-blue-800/40 rounded p-2">
                  <div className="text-blue-300 font-semibold mb-1 flex items-center gap-1">
                    🪞 1. Mirror Phase:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-gray-300">Element:</span>
                    <span className={`${getElementColor(prosodyData.mirrorElement || prosodyData.userElement)}`}>
                      {getElementIcon(prosodyData.mirrorElement || prosodyData.userElement)} {prosodyData.mirrorElement || prosodyData.userElement}
                    </span>
                    <span className="text-gray-300">Duration:</span>
                    <span className="text-blue-400">{prosodyData.mirrorDuration || 'moderate'}</span>
                    <span className="text-gray-300">Approach:</span>
                    <span className="text-blue-400">{prosodyData.mirrorApproach || 'empathetic'}</span>
                  </div>
                </div>

                {/* Balance Phase - Live Data */}
                <div className="bg-green-800/40 rounded p-2">
                  <div className="text-green-300 font-semibold mb-1 flex items-center gap-1">
                    ⚖️ 2. Balance Phase:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-gray-300">Target:</span>
                    <span className={`${getElementColor(prosodyData.balanceElement)}`}>
                      {getElementIcon(prosodyData.balanceElement)} {prosodyData.balanceElement}
                    </span>
                    <span className="text-gray-300">Reason:</span>
                    <span className="text-yellow-400 text-wrap">
                      {prosodyData.balanceReason || getBalanceReason(prosodyData.userElement, prosodyData.balanceElement)}
                    </span>
                    <span className="text-gray-300">Transition:</span>
                    <span className="text-green-400">{prosodyData.transition || 'moderate'}</span>
                  </div>
                </div>

                {/* Voice Parameters - Live Data */}
                <div className="bg-indigo-800/40 rounded p-2">
                  <div className="text-indigo-300 font-semibold mb-1 flex items-center gap-1">
                    🎵 3. Voice Shaping:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-gray-300">Speed:</span>
                    <span className="text-white font-mono">{prosodyData.voiceParams?.speed?.toFixed(2) || '1.00'}x</span>
                    <span className="text-gray-300">Pitch:</span>
                    <span className="text-white font-mono">{prosodyData.voiceParams?.pitch?.toFixed(0) || '0'}</span>
                    <span className="text-gray-300">Warmth:</span>
                    <span className="text-white font-mono">{prosodyData.voiceParams?.warmth?.toFixed(2) || '0.50'}</span>
                    <span className="text-gray-300">Emphasis:</span>
                    <span className="text-white font-mono">{prosodyData.voiceParams?.emphasis?.toFixed(2) || '0.50'}</span>
                  </div>
                </div>

                {/* Context Flags - Live Data */}
                <div className="bg-red-800/40 rounded p-2">
                  <div className="text-red-300 font-semibold mb-1 flex items-center gap-1">
                    🧠 Context Analysis:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {prosodyData.context ? Object.entries(prosodyData.context).map(([key, active]) => (
                      <span key={key} className={`px-2 py-1 rounded text-xs transition-all ${
                        active ? 'bg-red-700 text-white font-semibold animate-pulse' : 'bg-gray-600 text-gray-400 opacity-50'
                      }`}>
                        {key}
                      </span>
                    )) : <span className="text-gray-400 text-xs">No context flags detected</span>}
                  </div>
                  {prosodyData.contextReasoning && (
                    <div className="mt-1 text-xs text-red-300 border-l-2 border-red-500 pl-2">
                      💡 {prosodyData.contextReasoning}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* 📊 DEMO MODE (when no live data available) */
              <>
                <div className="bg-amber-800/40 rounded p-2 opacity-60">
                  <div className="text-yellow-300 font-semibold mb-1 flex items-center gap-1">
                    🔥 User Element Detection:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-gray-300">Status:</span>
                    <span className="text-gray-400">Waiting for voice input...</span>
                  </div>
                </div>

                <div className="bg-blue-800/40 rounded p-2 opacity-60">
                  <div className="text-blue-300 font-semibold mb-1 flex items-center gap-1">
                    🪞 Mirror Phase:
                  </div>
                  <div className="text-xs text-gray-400">Will match your detected element for rapport</div>
                </div>

                <div className="bg-green-800/40 rounded p-2 opacity-60">
                  <div className="text-green-300 font-semibold mb-1 flex items-center gap-1">
                    ⚖️ Balance Phase:
                  </div>
                  <div className="text-xs text-gray-400">Will apply Jungian opposite or contextual adjustment</div>
                </div>

                <div className="bg-indigo-800/40 rounded p-2 opacity-60">
                  <div className="text-indigo-300 font-semibold mb-1 flex items-center gap-1">
                    🎵 Voice Shaping:
                  </div>
                  <div className="text-xs text-gray-400">Speed, pitch, warmth, emphasis parameters</div>
                </div>
              </>
            )}
          </div>

          {/* System Status */}
          <div className="mt-3 pt-2 border-t border-amber-600">
            <div className="flex justify-between text-xs">
              <span className="text-amber-300">Jungian Engine:</span>
              <span className={prosodyData ? "text-green-400" : "text-yellow-400"}>
                {prosodyData ? "🟢 Live Data" : "🟡 Standby"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-amber-300">Data Source:</span>
              <span className="text-blue-400">
                {prosodyData ? "ConversationalPipeline" : "Demo Mode"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-amber-300">Last Update:</span>
              <span className="text-green-400 font-mono">
                {prosodyData?.timestamp ? new Date(prosodyData.timestamp).toLocaleTimeString() : 'None'}
              </span>
            </div>
          </div>

          {/* Live Updates Indicator */}
          {prosodyData && (
            <div className="mt-2 pt-2 border-t border-amber-600 text-xs text-center">
              <div className="text-green-300 animate-pulse flex items-center justify-center gap-1">
                📡 Real-time Jungian prosody analysis active
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions for Demo Mode */}
          {!prosodyData && (
            <div className="mt-2 pt-2 border-t border-amber-600 text-xs text-amber-300 text-center">
              💡 Record a voice message to see live Jungian prosody analysis
            </div>
          )}
        </div>
      )}

      {/* 🌟 Maya Welcome Audio Player */}
      {mayaWelcomeMessage && (
        <div className="mb-4">
          <OracleVoicePlayer
            text={mayaWelcomeMessage}
            element="aether"
            autoPlay={true}
            onPlayStart={() => setIsPlayingWelcome(true)}
            onPlayEnd={() => setIsPlayingWelcome(false)}
            className="maya-welcome-player"
          />
        </div>
      )}
      
      {/* Maya Welcome Status Indicator */}
      {isPlayingWelcome && (
        <div className="mb-3 flex items-center justify-center gap-2 animate-fade-in">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-amber-600 font-medium">Maya is greeting you...</span>
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
        </div>
      )}
      
      {/* Auto-start session indicator */}
      {autoStartSession && !hasTriggeredWelcome && !isStreaming && (
        <div className="mb-3 text-xs text-gray-500 text-center animate-fade-in">
          🌟 Preparing Maya&apos;s welcome...
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <style jsx>{`
        @keyframes wave-1 {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
        
        @keyframes wave-2 {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
        
        @keyframes wave-3 {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
        
        .animate-wave-1 {
          animation: wave-1 1s ease-in-out infinite;
        }
        
        .animate-wave-2 {
          animation: wave-2 1s ease-in-out infinite;
          animation-delay: 0.1s;
        }
        
        .animate-wave-3 {
          animation: wave-3 1s ease-in-out infinite;
          animation-delay: 0.2s;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* 🔒 Privacy Settings Modal */}
      {showPrivacySettings && (
        <PrivacySettingsPanel onClose={() => setShowPrivacySettings(false)} />
      )}
    </div>
  );
}