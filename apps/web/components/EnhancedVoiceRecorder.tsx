'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2, Play, Pause, Globe } from 'lucide-react';

interface EnhancedVoiceRecorderProps {
  userId: string;
  onTranscribed?: (data: { transcript: string; audioUrl?: string; language?: string }) => void;
  maxDuration?: number; // in seconds, default 60
  defaultLanguage?: string; // default 'en'
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

export default function EnhancedVoiceRecorder({ 
  userId, 
  onTranscribed,
  maxDuration = 60,
  defaultLanguage = 'en'
}: EnhancedVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastRecording, setLastRecording] = useState<{ url: string; blob: Blob } | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Draw waveform visualization
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyzerRef.current) return;
    
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyzer.getByteTimeDomainData(dataArray);
      
      canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = isRecording ? '#ef4444' : '#3b82f6';
      canvasCtx.beginPath();
      
      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };
    
    draw();
  }, [isRecording]);

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Set up audio analysis for waveform
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 2048;
      source.connect(analyzerRef.current);
      
      // Start waveform animation
      drawWaveform();
      
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
        const audioUrl = URL.createObjectURL(audioBlob);
        setLastRecording({ url: audioUrl, blob: audioBlob });
        await processAudio(audioBlob);
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
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
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop waveform animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  // Process and upload audio
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('file', audioBlob, 'voice-note.webm');
      formData.append('language', selectedLanguage);
      
      // Upload to transcription API
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }
      
      const data = await response.json();
      
      if (data.success && onTranscribed) {
        onTranscribed({
          transcript: data.transcription,
          audioUrl: lastRecording?.url,
          language: selectedLanguage
        });
      }
      
    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsProcessing(false);
      setRecordingTime(0);
    }
  };

  // Play/pause last recording
  const togglePlayback = () => {
    if (!lastRecording) return;
    
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(lastRecording.url);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }
    
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (lastRecording?.url) {
        URL.revokeObjectURL(lastRecording.url);
      }
    };
  }, [lastRecording]);

  const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative inline-flex items-center gap-2">
      {/* Language selector */}
      <div className="relative">
        <button
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Select language"
        >
          <span className="text-lg">{selectedLang.flag}</span>
        </button>
        
        {showLanguageMenu && (
          <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-64 overflow-y-auto">
            {SUPPORTED_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLanguage(lang.code);
                  setShowLanguageMenu(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                  selectedLanguage === lang.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm">{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recording button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`
          relative flex items-center justify-center
          w-12 h-12 rounded-full transition-all duration-200
          ${isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          text-white shadow-lg hover:shadow-xl
          focus:outline-none focus:ring-2 focus:ring-offset-2 
          ${isRecording ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
        `}
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

      {/* Playback button for last recording */}
      {lastRecording && !isRecording && !isProcessing && (
        <button
          onClick={togglePlayback}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={isPlaying ? 'Pause playback' : 'Play recording'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Waveform visualization */}
      {(isRecording || isProcessing) && (
        <div className="flex items-center gap-2 animate-fade-in">
          <canvas
            ref={canvasRef}
            width={120}
            height={40}
            className="rounded-md bg-gray-100 dark:bg-gray-800"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formatTime(recordingTime)}
          </span>
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <span className="text-sm text-gray-600 dark:text-gray-400 animate-fade-in">
          Transcribing in {selectedLang.name}...
        </span>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}