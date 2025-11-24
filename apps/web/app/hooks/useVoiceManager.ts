"use client";

import { useState, useRef, useCallback } from "react";

export type VoiceState = "idle" | "recording" | "processing" | "error";

interface VoiceManagerHook {
  micState: VoiceState;
  interimTranscript: string;
  finalTranscript: string;
  confidence: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetTranscripts: () => void;
  sendAudioForTranscription: (blob: Blob) => Promise<void>;
}

export function useVoiceManager(onFinalTranscript?: (text: string) => void): VoiceManagerHook {
  const [micState, setMicState] = useState<VoiceState>("idle");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [confidence, setConfidence] = useState(1.0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 🎤 Start Recording
  const startRecording = useCallback(async () => {
    try {
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setMicState("processing");
        
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await sendAudioForTranscription(audioBlob);
        
        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = (error) => {
        console.error("[VOICE MANAGER] MediaRecorder error:", error);
        setMicState("error");
      };

      // Start recording with 1-second chunks for streaming
      mediaRecorder.start(1000);
      setMicState("recording");
      
      // Clear previous transcripts
      setInterimTranscript("");
      setFinalTranscript("");
      setConfidence(1.0);

    } catch (error) {
      console.error("[VOICE MANAGER] Failed to start recording:", error);
      setMicState("error");
    }
  }, []);

  // ⏹️ Stop Recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // 🔄 Send Audio for Transcription (with streaming support)
  const sendAudioForTranscription = useCallback(async (audioBlob: Blob) => {
    try {
      
      const response = await fetch('/api/oracle/voice/transcribe/stream', {
        method: 'POST',
        body: audioBlob,
        headers: {
          'Content-Type': 'audio/webm'
        }
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response reader available');
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += new TextDecoder().decode(value);
        const lines = buffer.split('\n');
        
        // Process complete lines, keep the last partial line in buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              

              switch (data.type) {
                case 'interim':
                  if (data.transcript) {
                    setInterimTranscript(data.transcript);
                    setConfidence(data.confidence || 0.8);
                  }
                  break;
                  
                case 'final':
                  setInterimTranscript("");
                  setFinalTranscript(data.transcript || "");
                  setConfidence(data.confidence || 1.0);
                  setMicState("idle");
                  
                  // Notify parent component
                  if (data.transcript && onFinalTranscript) {
                    onFinalTranscript(data.transcript);
                  }
                  break;
                  
                case 'error':
                  console.error("[VOICE MANAGER] Transcription error:", data.message);
                  setMicState("error");
                  break;
                  
                default:
              }
            } catch (parseError) {
              console.error("[VOICE MANAGER] Failed to parse event:", line, parseError);
            }
          }
        }
      }

    } catch (error) {
      console.error("[VOICE MANAGER] Transcription error:", error);
      setMicState("error");
    }
  }, [onFinalTranscript]);

  // 🧹 Reset Transcripts
  const resetTranscripts = useCallback(() => {
    setInterimTranscript("");
    setFinalTranscript("");
    setConfidence(1.0);
  }, []);

  return {
    micState,
    interimTranscript,
    finalTranscript,
    confidence,
    startRecording,
    stopRecording,
    resetTranscripts,
    sendAudioForTranscription
  };
}