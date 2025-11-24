import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mic, MicOff } from "lucide-react";
import * as THREE from "three";

interface HybridMicProps {
  isRecording: boolean;
  isProcessing?: boolean;
  audioStream?: MediaStream;
  audioLevel?: number; // 0-1 value for fallback if no stream
}

// 🌟 3D Pulsing Torus (sacred geometry energy field)
function PulsingTorus({ isRecording, isProcessing }: { isRecording: boolean; isProcessing: boolean }) {
  const torusRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (torusRef.current) {
      const t = clock.getElapsedTime();
      
      if (isRecording) {
        // Active listening: breathing pulse
        const scale = 1 + 0.12 * Math.sin(t * 3);
        torusRef.current.scale.set(scale, scale, scale);
        torusRef.current.material.opacity = 0.7 + 0.2 * Math.sin(t * 4);
        torusRef.current.rotation.z = t * 0.2;
      } else if (isProcessing) {
        // Processing: faster rotation, steady glow
        const scale = 1 + 0.06 * Math.sin(t * 5);
        torusRef.current.scale.set(scale, scale, scale);
        torusRef.current.material.opacity = 0.5;
        torusRef.current.rotation.z = t * 0.4;
      } else {
        // Idle: subtle presence
        const scale = 1 + 0.02 * Math.sin(t * 1.2);
        torusRef.current.scale.set(scale, scale, scale);
        torusRef.current.material.opacity = 0.3;
        torusRef.current.rotation.z = t * 0.08;
      }
    }
  });

  return (
    <mesh ref={torusRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.2, 0.06, 16, 100]} />
      <meshBasicMaterial
        color="#FFD700"
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

// 🔊 Audio-Reactive Waveform Circle
function AudioWaveform({ audioStream, audioLevel = 0 }: { audioStream?: MediaStream; audioLevel?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 100;
    canvas.height = 100;

    if (audioStream) {
      // Real-time audio analysis
      try {
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(audioStream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 128;
        analyserRef.current.smoothingTimeConstant = 0.8;
        source.connect(analyserRef.current);

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

        const draw = () => {
          if (!analyserRef.current || !ctx) return;
          
          analyserRef.current.getByteFrequencyData(dataArray);

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Create circular waveform
          ctx.beginPath();
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const baseRadius = 18;
          const maxAmplitude = 8;

          for (let i = 0; i < dataArray.length; i++) {
            const angle = (i / dataArray.length) * Math.PI * 2;
            const amplitude = (dataArray[i] / 255) * maxAmplitude;
            const radius = baseRadius + amplitude;
            
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          ctx.closePath();
          
          // Tesla gold gradient
          const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius + maxAmplitude);
          gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
          gradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.4)');
          gradient.addColorStop(1, 'rgba(255, 215, 0, 0.1)');
          
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Add center energy dot
          ctx.beginPath();
          ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#FFD700';
          ctx.fill();

          animationFrameRef.current = requestAnimationFrame(draw);
        };

        draw();
      } catch (error) {
        console.warn('Audio analysis failed:', error);
        drawFallback();
      }
    } else {
      // Fallback: use audioLevel prop for simple visualization
      drawFallback();
    }

    function drawFallback() {
      if (!ctx) return;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 18;
      const amplitude = audioLevel * 8;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Simple pulsing circle based on audioLevel
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + amplitude, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Fill with gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius + amplitude);
      gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
      gradient.addColorStop(1, 'rgba(255, 215, 0, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Center dot
      ctx.beginPath();
      ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD700';
      ctx.fill();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioStream, audioLevel]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-90"
      style={{ pointerEvents: 'none' }}
    />
  );
}

// 🎯 Main Hybrid Indicator Component
export default function HybridMicIndicator({ 
  isRecording, 
  isProcessing = false, 
  audioStream, 
  audioLevel = 0 
}: HybridMicProps) {
  return (
    <div className="relative flex items-center justify-center w-[120px] h-[120px]">
      {/* Layer 1: CSS Glowing Pulse Ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`w-[90px] h-[90px] rounded-full transition-all duration-300 ${
            isRecording 
              ? "animate-ping bg-sacred-gold/20 shadow-lg shadow-sacred-gold/30" 
              : isProcessing
              ? "animate-pulse bg-orange-400/15 shadow-md shadow-orange-400/20"
              : "bg-transparent"
          }`}
        />
        
        {/* Secondary ring for depth */}
        {(isRecording || isProcessing) && (
          <div
            className={`absolute w-[70px] h-[70px] rounded-full transition-all duration-500 ${
              isRecording 
                ? "animate-pulse bg-sacred-gold/10" 
                : "animate-pulse bg-orange-400/10"
            }`}
            style={{
              animationDelay: isRecording ? '0.5s' : '0.3s',
              animationDuration: isRecording ? '2s' : '1.5s'
            }}
          />
        )}
      </div>

      {/* Layer 2: 3D Pulsing Torus */}
      <div className="w-[120px] h-[120px] absolute">
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ pointerEvents: 'none' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[0, 0, 5]} intensity={0.3} />
          <PulsingTorus isRecording={isRecording} isProcessing={isProcessing} />
        </Canvas>
      </div>

      {/* Layer 3: Audio-Reactive Waveform */}
      {(isRecording || isProcessing) && (
        <AudioWaveform 
          audioStream={audioStream} 
          audioLevel={audioLevel}
        />
      )}

      {/* Center: Mic Icon */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div
          className={`w-[48px] h-[48px] rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
            isRecording 
              ? "border-sacred-gold bg-sacred-gold/10 text-sacred-gold shadow-lg shadow-sacred-gold/30" 
              : isProcessing
              ? "border-orange-400 bg-orange-400/10 text-orange-400 shadow-md shadow-orange-400/20"
              : "border-gray-600 bg-gray-900/50 text-gray-400 hover:border-gray-500"
          }`}
          style={{
            backdropFilter: 'blur(10px)',
            boxShadow: isRecording 
              ? '0 0 20px rgba(255, 215, 0, 0.4), inset 0 0 20px rgba(255, 215, 0, 0.1)'
              : isProcessing 
              ? '0 0 15px rgba(255, 165, 0, 0.3)'
              : 'none'
          }}
        >
          {isRecording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* Status Text */}
      {(isRecording || isProcessing) && (
        <div 
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium tracking-wide transition-all duration-300"
          style={{ 
            color: isRecording ? '#FFD700' : '#FFA500',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' 
          }}
        >
          {isRecording ? 'Listening...' : isProcessing ? 'Processing...' : ''}
        </div>
      )}
    </div>
  );
}

// 🔄 CSS Fallback Version (no WebGL)
export function HybridMicFallback({ 
  isRecording, 
  isProcessing = false, 
  audioLevel = 0 
}: Omit<HybridMicProps, 'audioStream'>) {
  return (
    <div className="relative flex items-center justify-center w-[120px] h-[120px]">
      {/* Outer pulse ring */}
      <div 
        className={`absolute w-20 h-20 border-2 rounded-full transition-all duration-300 ${
          isRecording 
            ? 'border-sacred-gold animate-pulse scale-110 shadow-lg shadow-sacred-gold/50' 
            : isProcessing
            ? 'border-orange-400 animate-spin scale-105'
            : 'border-sacred-gold/30 scale-100'
        }`}
        style={{
          boxShadow: isRecording 
            ? '0 0 20px rgba(255, 215, 0, 0.6), inset 0 0 10px rgba(255, 215, 0, 0.3)'
            : isProcessing 
            ? '0 0 15px rgba(255, 165, 0, 0.4)'
            : '0 0 5px rgba(255, 215, 0, 0.2)'
        }}
      />
      
      {/* Inner ring with audio level */}
      {(isRecording || isProcessing) && (
        <div 
          className={`absolute border rounded-full transition-all duration-200 ${
            isRecording 
              ? 'border-sacred-gold' 
              : 'border-orange-400'
          }`}
          style={{
            width: `${32 + audioLevel * 16}px`,
            height: `${32 + audioLevel * 16}px`,
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.4)',
            animation: `pulse ${isRecording ? '1.5s' : '2s'} infinite`
          }}
        />
      )}
      
      {/* Center mic */}
      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
        isRecording 
          ? 'border-sacred-gold bg-sacred-gold/10 text-sacred-gold' 
          : isProcessing
          ? 'border-orange-400 bg-orange-400/10 text-orange-400'
          : 'border-gray-600 bg-gray-900/50 text-gray-400'
      }`}>
        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </div>
      
      {/* Status text */}
      {(isRecording || isProcessing) && (
        <div 
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium tracking-wide"
          style={{ 
            color: isRecording ? '#FFD700' : '#FFA500',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' 
          }}
        >
          {isRecording ? 'Listening...' : 'Processing...'}
        </div>
      )}
    </div>
  );
}