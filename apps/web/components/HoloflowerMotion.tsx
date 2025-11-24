"use client";

import React, { useEffect, useRef, useState } from "react";
import { MotionState, interpolateMotionStates } from "@/lib/motion-schema";

interface HoloflowerMotionProps {
  motionState: MotionState;
  onBreakthrough?: () => void;
  width?: number;
  height?: number;
  interactive?: boolean;
}

export default function HoloflowerMotion({
  motionState,
  onBreakthrough,
  width = 600,
  height = 600,
  interactive = true
}: HoloflowerMotionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [currentState, setCurrentState] = useState<MotionState>(motionState);
  const [breakthroughTriggered, setBreakthroughTriggered] = useState(false);
  
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) * 0.35;

  // Smooth state transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentState(prev => interpolateMotionStates(prev, motionState, 0.1));
    }, 50);
    return () => clearInterval(interval);
  }, [motionState]);

  // Trigger breakthrough celebration
  useEffect(() => {
    if (motionState.coherence === "breakthrough" && !breakthroughTriggered) {
      setBreakthroughTriggered(true);
      onBreakthrough?.();
      setTimeout(() => setBreakthroughTriggered(false), 3000);
    }
  }, [motionState.coherence, breakthroughTriggered, onBreakthrough]);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw breathing circles
      drawBreathingCircles(ctx, time);
      
      // Draw petals with motion
      drawPetals(ctx, time);
      
      // Draw shadow overlay
      drawShadowOverlay(ctx);
      
      // Draw Aether center if active
      if (currentState.aetherStage) {
        drawAetherCenter(ctx, time);
      }
      
      // Draw breakthrough ripple
      if (currentState.animation.ripple) {
        drawRipple(ctx, time);
      }
      
      // Draw coherence glow
      drawCoherenceGlow(ctx);
      
      time += 0.016; // ~60fps
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentState, width, height]);

  // Draw breathing background circles
  const drawBreathingCircles = (ctx: CanvasRenderingContext2D, time: number) => {
    const { pulseSpeed, pulseIntensity } = currentState.animation;
    const breathPhase = Math.sin(time / pulseSpeed * Math.PI * 2);
    
    ctx.strokeStyle = "#2a2a2a";
    ctx.globalAlpha = 0.3;
    
    [1, 0.75, 0.5, 0.25].forEach((scale, i) => {
      ctx.beginPath();
      const radius = maxRadius * scale * (1 + breathPhase * pulseIntensity * 0.02 * (i + 1));
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    
    ctx.globalAlpha = 1;
  };

  // Draw petals with jitter and shadow
  const drawPetals = (ctx: CanvasRenderingContext2D, time: number) => {
    const petalData = [
      { name: "creativity", angle: 0, color: "#FF6B6B" },
      { name: "intuition", angle: 30, color: "#4ECDC4" },
      { name: "courage", angle: 60, color: "#FFD93D" },
      { name: "love", angle: 90, color: "#FF6BCB" },
      { name: "wisdom", angle: 120, color: "#6BCB77" },
      { name: "vision", angle: 150, color: "#4D96FF" },
      { name: "grounding", angle: 180, color: "#8B4513" },
      { name: "flow", angle: 210, color: "#00CED1" },
      { name: "power", angle: 240, color: "#FF4500" },
      { name: "healing", angle: 270, color: "#90EE90" },
      { name: "mystery", angle: 300, color: "#9370DB" },
      { name: "joy", angle: 330, color: "#FFD700" }
    ];
    
    petalData.forEach(petal => {
      const angleRad = (petal.angle - 90) * Math.PI / 180;
      const isShadowed = currentState.shadowPetals.includes(petal.name);
      
      // Add jitter for low coherence
      const jitterX = currentState.animation.jitter * Math.sin(time * 10 + petal.angle) * 2;
      const jitterY = currentState.animation.jitter * Math.cos(time * 10 + petal.angle) * 2;
      
      const petalRadius = maxRadius * 0.7;
      const x = centerX + petalRadius * Math.cos(angleRad) + jitterX;
      const y = centerY + petalRadius * Math.sin(angleRad) + jitterY;
      
      // Draw petal line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = petal.color;
      ctx.lineWidth = isShadowed ? 1 : 2;
      ctx.globalAlpha = isShadowed ? 0.3 : 0.8;
      
      // Add blur for shadowed petals
      if (isShadowed) {
        ctx.filter = `blur(${currentState.shadowIntensity * 3}px)`;
      }
      
      ctx.stroke();
      ctx.filter = "none";
      
      // Draw petal dot
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = petal.color;
      ctx.fill();
    });
    
    ctx.globalAlpha = 1;
  };

  // Draw shadow overlay for hidden aspects
  const drawShadowOverlay = (ctx: CanvasRenderingContext2D) => {
    if (currentState.shadowIntensity > 0) {
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
      gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
      gradient.addColorStop(1, `rgba(0, 0, 0, ${currentState.shadowIntensity * 0.3})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
  };

  // Draw Aether center animation
  const drawAetherCenter = (ctx: CanvasRenderingContext2D, time: number) => {
    const stage = currentState.aetherStage!;
    const intensity = currentState.aetherIntensity || 0.8;
    
    // Different patterns for each Aether stage
    if (stage === 1) { // Expansive
      const expandPhase = Math.sin(time / 8 * Math.PI * 2);
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 0.5);
      gradient.addColorStop(0, `rgba(229, 228, 226, ${intensity})`);
      gradient.addColorStop(0.5, `rgba(229, 228, 226, ${intensity * 0.5})`);
      gradient.addColorStop(1, `rgba(229, 228, 226, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.5 + expandPhase * 0.3;
      ctx.fillRect(0, 0, width, height);
      
    } else if (stage === 2) { // Contractive
      const contractPhase = Math.sin(time / 10 * Math.PI * 2);
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 0.2 * (1 - contractPhase * 0.2), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(229, 228, 226, ${intensity * 0.7})`;
      ctx.fill();
      
    } else if (stage === 3) { // Stillness
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(229, 228, 226, ${intensity})`;
      ctx.fill();
      
      // Subtle ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 0.15, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(229, 228, 226, ${intensity * 0.3})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  };

  // Draw breakthrough ripple effect
  const drawRipple = (ctx: CanvasRenderingContext2D, time: number) => {
    const ripplePhase = (time % 3) / 3; // 3 second cycle
    
    for (let i = 0; i < 3; i++) {
      const phase = (ripplePhase + i * 0.3) % 1;
      const radius = maxRadius * phase * 1.5;
      const opacity = 1 - phase;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 215, 0, ${opacity * 0.5})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  // Draw overall coherence glow
  const drawCoherenceGlow = (ctx: CanvasRenderingContext2D) => {
    const { glow } = currentState.animation;
    if (glow > 0) {
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
      gradient.addColorStop(0, `rgba(255, 215, 0, ${glow * 0.3})`);
      gradient.addColorStop(0.5, `rgba(255, 215, 0, ${glow * 0.1})`);
      gradient.addColorStop(1, `rgba(255, 215, 0, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`${interactive ? "cursor-pointer" : ""}`}
        style={{
          background: "radial-gradient(circle at center, rgba(0,0,0,0.9), rgba(0,0,0,1))"
        }}
      />
      
      {/* Motion state indicator */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        <div>Coherence: {currentState.coherence}</div>
        <div>Momentum: {currentState.momentum}</div>
        {currentState.aetherStage && <div>Aether: Stage {currentState.aetherStage}</div>}
      </div>
      
      {/* Breakthrough celebration overlay */}
      {breakthroughTriggered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-4xl font-bold text-yellow-400 animate-pulse">
            ✨ Breakthrough! ✨
          </div>
        </div>
      )}
    </div>
  );
}