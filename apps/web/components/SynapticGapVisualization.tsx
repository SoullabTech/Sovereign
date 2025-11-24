'use client';

import React, { useEffect, useRef } from 'react';
import { SynapticUI } from '../backend/src/types/agentCommunication';

interface SynapticGapProps {
  gapWidth: number; // 0-1, how much space between self and Other
  resonance: number; // 0-1, quality of dialogue
  intensity: number; // 0-1, energetic charge
  visualType: SynapticUI['gapVisualization']['type'];
  className?: string;
}

export function SynapticGapVisualization({
  gapWidth,
  resonance,
  intensity,
  visualType,
  className = ''
}: SynapticGapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || visualType === 'none') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    switch (visualType) {
      case 'subtle_glow':
        renderSubtleGlow(ctx, rect, gapWidth, resonance, intensity);
        break;
      case 'particle_field':
        renderParticleField(ctx, rect, gapWidth, resonance, intensity);
        break;
      case 'distance_blur':
        renderDistanceBlur(ctx, rect, gapWidth, resonance, intensity);
        break;
    }
  }, [gapWidth, resonance, intensity, visualType]);

  if (visualType === 'none') {
    return null;
  }

  return (
    <div className={`synaptic-gap-container relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          mixBlendMode: 'multiply',
          opacity: Math.max(0.1, intensity)
        }}
      />
    </div>
  );
}

// Subtle glow - healthy gap shows as soft illumination between elements
function renderSubtleGlow(
  ctx: CanvasRenderingContext2D,
  rect: DOMRect,
  gapWidth: number,
  resonance: number,
  intensity: number
) {
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const baseRadius = Math.min(rect.width, rect.height) / 8;
  const gapRadius = baseRadius * (0.5 + gapWidth * 1.5);
  
  // Create radial gradient based on gap quality
  const gradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, gapRadius
  );

  // Colors based on resonance quality
  const hue = resonance > 0.7 ? 240 : resonance > 0.4 ? 180 : 30; // Blue -> Cyan -> Orange
  const alpha = intensity * (0.3 + gapWidth * 0.4);

  gradient.addColorStop(0, `hsla(${hue}, 60%, 70%, ${alpha})`);
  gradient.addColorStop(0.7, `hsla(${hue}, 40%, 50%, ${alpha * 0.3})`);
  gradient.addColorStop(1, `hsla(${hue}, 20%, 30%, 0)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, rect.width, rect.height);
}

// Particle field - shows gap as space between active particles
function renderParticleField(
  ctx: CanvasRenderingContext2D,
  rect: DOMRect,
  gapWidth: number,
  resonance: number,
  intensity: number
) {
  const particleCount = Math.floor(20 + intensity * 30);
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const gapRadius = (rect.width / 4) * gapWidth;
  
  ctx.fillStyle = `hsla(200, 60%, 60%, ${0.6 * intensity})`;
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const distance = gapRadius + (Math.random() * 20) + (resonance * 15);
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    const size = 1 + (intensity * 3) + (Math.random() * 2);
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add connection lines for high resonance
    if (resonance > 0.6 && Math.random() < resonance) {
      const nextAngle = ((i + 1) / particleCount) * Math.PI * 2;
      const nextX = centerX + Math.cos(nextAngle) * distance;
      const nextY = centerY + Math.sin(nextAngle) * distance;
      
      ctx.strokeStyle = `hsla(200, 40%, 50%, ${0.3 * intensity})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nextX, nextY);
      ctx.stroke();
    }
  }
}

// Distance blur - shows gap through depth-of-field effect
function renderDistanceBlur(
  ctx: CanvasRenderingContext2D,
  rect: DOMRect,
  gapWidth: number,
  resonance: number,
  intensity: number
) {
  const centerX = rect.width / 2;
  const layers = 5;
  
  for (let layer = 0; layer < layers; layer++) {
    const layerDepth = layer / layers;
    const blur = gapWidth * 10 * layerDepth;
    const alpha = intensity * (1 - layerDepth * 0.7);
    
    ctx.shadowColor = `hsla(220, 50%, ${40 + layerDepth * 30}%, ${alpha})`;
    ctx.shadowBlur = blur;
    
    const width = rect.width * (0.8 - layerDepth * 0.3);
    const height = 2;
    const x = centerX - width / 2;
    const y = rect.height / 2 + (layer - layers/2) * 8;
    
    ctx.fillStyle = `hsla(220, 60%, 60%, ${alpha})`;
    ctx.fillRect(x, y, width, height);
  }
  
  // Reset shadow
  ctx.shadowBlur = 0;
}

interface SynapticSpaceIndicatorProps {
  responsiveness: SynapticUI['responsiveness'];
  className?: string;
}

export function SynapticSpaceIndicator({ 
  responsiveness, 
  className = '' 
}: SynapticSpaceIndicatorProps) {
  const getIndicatorStyle = () => {
    switch (responsiveness) {
      case 'crystalline':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.1)', // blue
          borderColor: 'rgb(59, 130, 246)',
          animation: 'pulse 2s infinite',
          filter: 'brightness(1.1)'
        };
      case 'flowing':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.1)', // emerald  
          borderColor: 'rgb(16, 185, 129)',
          animation: 'float 3s ease-in-out infinite',
          filter: 'none'
        };
      case 'dense':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.1)', // amber
          borderColor: 'rgb(245, 158, 11)',
          animation: 'none',
          filter: 'saturate(0.8)'
        };
      case 'static':
        return {
          backgroundColor: 'rgba(107, 114, 128, 0.1)', // gray
          borderColor: 'rgb(107, 114, 128)',
          animation: 'none',
          filter: 'grayscale(0.5)'
        };
    }
  };

  const style = getIndicatorStyle();

  return (
    <div 
      className={`synaptic-indicator h-1 w-full border-t-2 transition-all duration-1000 ${className}`}
      style={style}
    />
  );
}

interface ResonanceQualityIndicatorProps {
  quality: SynapticUI['resonanceIndicator']['quality'];
  show: boolean;
  className?: string;
}

export function ResonanceQualityIndicator({ 
  quality, 
  show, 
  className = '' 
}: ResonanceQualityIndicatorProps) {
  if (!show) return null;

  const getQualityVisualization = () => {
    switch (quality) {
      case 'harmonic':
        return {
          icon: '🌊',
          label: 'Harmonic resonance',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'dissonant':
        return {
          icon: '⚡',
          label: 'Creative dissonance',
          color: 'text-amber-600', 
          bgColor: 'bg-amber-50'
        };
      case 'creative_tension':
        return {
          icon: '⚔️',
          label: 'Creative tension',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50'
        };
      case 'collapse':
        return {
          icon: '⚫',
          label: 'Gap collapsed',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
    }
  };

  const viz = getQualityVisualization();

  return (
    <div className={`resonance-quality inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${viz.bgColor} ${viz.color} ${className}`}>
      <span>{viz.icon}</span>
      <span className="font-medium">{viz.label}</span>
    </div>
  );
}

// Complete synaptic visualization combining all elements
interface CompleteSynapticVisualizationProps {
  synapticUI: SynapticUI;
  className?: string;
}

export function CompleteSynapticVisualization({ 
  synapticUI, 
  className = '' 
}: CompleteSynapticVisualizationProps) {
  return (
    <div className={`synaptic-visualization relative ${className}`}>
      {/* Main gap visualization */}
      <SynapticGapVisualization
        gapWidth={0.5} // Would come from actual synaptic space calculation
        resonance={0.7}
        intensity={synapticUI.gapVisualization.intensity}
        visualType={synapticUI.gapVisualization.type}
        className="h-16"
      />
      
      {/* Space responsiveness indicator */}
      <SynapticSpaceIndicator 
        responsiveness={synapticUI.responsiveness}
        className="mt-2"
      />
      
      {/* Resonance quality indicator */}
      <div className="mt-2 flex justify-center">
        <ResonanceQualityIndicator
          quality={synapticUI.resonanceIndicator.quality}
          show={synapticUI.resonanceIndicator.show}
        />
      </div>
    </div>
  );
}

// CSS animations that should be included globally
export const synapticAnimations = `
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  
  .synaptic-visualization {
    --synaptic-glow: 0 0 20px rgba(59, 130, 246, 0.3);
  }
  
  .synaptic-indicator {
    transition: all 1000ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .synaptic-gap-container {
    position: relative;
    overflow: hidden;
  }
`;