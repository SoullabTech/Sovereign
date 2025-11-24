import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TorusProps {
  isRecording: boolean;
  isProcessing?: boolean;
  isSpeaking?: boolean;
}

function PulsingTorus({ isRecording, isProcessing, isSpeaking }: TorusProps) {
  const torusRef = useRef<THREE.Mesh>(null);
  const innerTorusRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (torusRef.current) {
      const t = clock.getElapsedTime();
      
      if (isRecording) {
        // Active listening: breathing pulse
        const scale = 1 + 0.15 * Math.sin(t * 2.5);
        torusRef.current.scale.set(scale, scale, scale);
        torusRef.current.material.opacity = 0.8 + 0.2 * Math.sin(t * 3);
        
        // Rotate slowly for dynamic feel
        torusRef.current.rotation.z = t * 0.2;
      } else if (isProcessing) {
        // Processing: faster rotation, steady glow
        const scale = 1 + 0.08 * Math.sin(t * 4);
        torusRef.current.scale.set(scale, scale, scale);
        torusRef.current.material.opacity = 0.6;
        torusRef.current.rotation.z = t * 0.5;
      } else if (isSpeaking) {
        // Speaking: Maya is responding - flowing wave animation
        const scale = 1 + 0.12 * Math.sin(t * 3);
        torusRef.current.scale.set(scale, scale, scale);
        torusRef.current.material.opacity = 0.7 + 0.3 * Math.sin(t * 2);
        torusRef.current.rotation.z = t * 0.3;
      } else {
        // Idle: subtle presence
        const scale = 1 + 0.03 * Math.sin(t * 1);
        torusRef.current.scale.set(scale, scale, scale);
        torusRef.current.material.opacity = 0.3;
        torusRef.current.rotation.z = t * 0.1;
      }
    }

    // Inner energy ring for active states
    if (innerTorusRef.current && (isRecording || isProcessing || isSpeaking)) {
      const t = clock.getElapsedTime();
      const scale = 0.8 + 0.1 * Math.sin(t * 4);
      innerTorusRef.current.scale.set(scale, scale, scale);
      innerTorusRef.current.rotation.z = -t * 0.3;
      innerTorusRef.current.material.opacity = isRecording ? 0.4 : isSpeaking ? 0.5 : 0.3;
    }
  });

  return (
    <group>
      {/* Main torus ring */}
      <mesh ref={torusRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.08, 16, 100]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Inner energy ring for active states */}
      {(isRecording || isProcessing || isSpeaking) && (
        <mesh ref={innerTorusRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.9, 0.04, 12, 80]} />
          <meshBasicMaterial
            color={isRecording ? "#FFD700" : isSpeaking ? "#F0C98A" : "#FFA500"}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
      
      {/* Particle effect points for sacred geometry feel */}
      {isRecording && (
        <points>
          <sphereGeometry args={[1.5, 32, 16]} />
          <pointsMaterial
            color="#FFD700"
            size={0.02}
            transparent
            opacity={0.6}
          />
        </points>
      )}
    </group>
  );
}

export default function MicTorusIndicator({ isRecording, isProcessing = false, isSpeaking = false }: TorusProps) {
  return (
    <div
      style={{
        width: 120,
        height: 120,
        position: 'relative'
      }}
    >
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <PulsingTorus isRecording={isRecording} isProcessing={isProcessing} isSpeaking={isSpeaking} />
      </Canvas>
      
      {/* Status text overlay */}
      {(isRecording || isProcessing || isSpeaking) && (
        <div
          className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium tracking-wide ${
            isSpeaking ? 'text-amber-300' : 'text-sacred-gold'
          }`}
          style={{ textShadow: isSpeaking ? '0 0 10px rgba(240, 201, 138, 0.6)' : '0 0 10px rgba(255, 215, 0, 0.5)' }}
        >
          {isRecording ? 'Listening...' : isProcessing ? 'Processing...' : isSpeaking ? 'Maya Speaking...' : ''}
        </div>
      )}
    </div>
  );
}

// CSS fallback version for systems without WebGL support
export function MicTorusFallback({ isRecording, isProcessing }: TorusProps) {
  return (
    <div className="relative w-[120px] h-[120px] flex items-center justify-center">
      {/* Outer ring */}
      <div 
        className={`absolute w-16 h-16 border-2 rounded-full transition-all duration-300 ${
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
      
      {/* Inner ring for active states */}
      {(isRecording || isProcessing) && (
        <div 
          className={`absolute w-10 h-10 border rounded-full transition-all duration-500 ${
            isRecording 
              ? 'border-sacred-gold animate-pulse' 
              : 'border-orange-400 animate-spin'
          }`}
          style={{
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.4)',
            animationDuration: isRecording ? '1.5s' : '2s'
          }}
        />
      )}
      
      {/* Status text */}
      {(isRecording || isProcessing) && (
        <div 
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-sacred-gold font-medium tracking-wide"
          style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
        >
          {isRecording ? 'Listening...' : 'Processing...'}
        </div>
      )}
    </div>
  );
}