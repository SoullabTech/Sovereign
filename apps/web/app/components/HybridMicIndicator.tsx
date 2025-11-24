"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

interface HybridMicIndicatorProps {
  micState: "idle" | "recording" | "processing";
  onRecordingComplete: (blob: Blob) => void;
  onTranscriptUpdate?: (text: string) => void;
  onStateChange?: (state: "idle" | "recording" | "processing") => void;
}

export default function HybridMicIndicator({
  micState,
  onRecordingComplete,
  onTranscriptUpdate,
  onStateChange,
}: HybridMicIndicatorProps) {
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 🎤 Toggle Recording
  const toggleRecording = async () => {
    if (micState === "recording") {
      recorder?.stop();
      onStateChange?.("processing");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      setRecorder(mediaRecorder);

      const audioContext = new AudioContext();
      setAudioCtx(audioContext);
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        onRecordingComplete(blob);
        audioContext.close();
        setAudioCtx(null);
        onStateChange?.("idle");
      };

      mediaRecorder.start();
      onStateChange?.("recording");
    } catch (err) {
      console.error("Mic error:", err);
      onStateChange?.("idle");
    }
  };

  // 🔊 Draw waveform
  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "#0A0D16";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#FFD700";
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  }, [micState]);

  return (
    <div className="relative flex items-center justify-center">
      {/* 🔆 Pulsing torus field */}
      <motion.div
        className="absolute w-16 h-16 rounded-full"
        animate={{
          scale: micState === "recording" ? [1, 1.2, 1] : 1,
          opacity: micState === "recording" ? [0.8, 1, 0.8] : 0.6,
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          border: "2px solid #FFD700",
          borderRadius: "50%",
        }}
      />

      {/* 🎤 Mic Button */}
      <button
        onClick={toggleRecording}
        className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${
          micState === "recording"
            ? "bg-[#FFD700] text-black"
            : "bg-[#1A1F2E] text-[#FFD700]"
        }`}
      >
        🎤
      </button>

      {/* 📈 Waveform */}
      {micState === "recording" && (
        <canvas
          ref={canvasRef}
          width={120}
          height={60}
          className="absolute -bottom-20 w-32 h-16"
        />
      )}
    </div>
  );
}