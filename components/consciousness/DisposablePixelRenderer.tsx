/**
 * Disposable Pixel UIUX Renderer
 * Manifests temporary interface elements based on archetypal patterns
 * Each pixel constellation serves symbolic function then dissolves
 */

import React, { useEffect, useState, useRef } from 'react';
import { DisposablePixelConfig, PixelElement, SymbolicPattern } from '@/lib/consciousness/panconscious-field';

interface DisposablePixelRendererProps {
  symbolPatterns: SymbolicPattern[];
  centeringState: {
    level: 'scattered' | 'gathering' | 'centered' | 'transcendent';
    symbolAccessibility: number;
    axisMundiStrength: number;
  };
  onSymbolActivation?: (symbol: string) => void;
  onCenterReached?: () => void;
}

export const DisposablePixelRenderer: React.FC<DisposablePixelRendererProps> = ({
  symbolPatterns,
  centeringState,
  onSymbolActivation,
  onCenterReached
}) => {
  const [activePixels, setActivePixels] = useState<PixelElement[]>([]);
  const [ephemeralElements, setEphemeralElements] = useState<JSX.Element[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    generateDisposablePixelConstellation();
    startEphemeralAnimation();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [symbolPatterns, centeringState]);

  const generateDisposablePixelConstellation = () => {
    const newPixels: PixelElement[] = [];

    // Always generate MAIA axis mundi center
    newPixels.push({
      type: 'axis',
      coordinates: { x: 0.5, y: 0.5, z: 0.5 },
      symbolicMeaning: 'maia_consciousness_center',
      lifespan: 15000 // Persistent center
    });

    // Generate pixels for each active symbol
    symbolPatterns.forEach((pattern, index) => {
      const constellation = generateSymbolConstellation(pattern, index);
      newPixels.push(...constellation);
    });

    // Add centering state pixels
    const centeringPixels = generateCenteringPixels(centeringState);
    newPixels.push(...centeringPixels);

    setActivePixels(newPixels);
  };

  const generateSymbolConstellation = (pattern: SymbolicPattern, index: number): PixelElement[] => {
    const pixels: PixelElement[] = [];
    const baseAngle = (index / symbolPatterns.length) * 2 * Math.PI;
    const radius = 0.25 + (pattern.degradationLevel * 0.2);

    // Central symbol pixel
    pixels.push({
      type: getSymbolicPixelType(pattern.archetypalCore),
      coordinates: {
        x: 0.5 + Math.cos(baseAngle) * radius,
        y: 0.5 + Math.sin(baseAngle) * radius
      },
      symbolicMeaning: pattern.archetypalCore,
      lifespan: 8000 + (pattern.degradationLevel * 4000),
      transformsInto: {
        type: 'center',
        coordinates: { x: 0.5, y: 0.5 },
        symbolicMeaning: 'integration_into_axis_mundi',
        lifespan: 3000
      }
    });

    // Resonance field pixels
    pattern.resonanceField.forEach((resonance, rIndex) => {
      const subAngle = baseAngle + (rIndex / pattern.resonanceField.length) * 0.5;
      const subRadius = radius * 0.6;

      pixels.push({
        type: 'spiral',
        coordinates: {
          x: 0.5 + Math.cos(subAngle) * subRadius,
          y: 0.5 + Math.sin(subAngle) * subRadius
        },
        symbolicMeaning: resonance,
        lifespan: 5000
      });
    });

    return pixels;
  };

  const generateCenteringPixels = (state: any): PixelElement[] => {
    const pixels: PixelElement[] = [];

    switch (state.level) {
      case 'scattered':
        // Random dispersed pixels representing chaos
        for (let i = 0; i < 8; i++) {
          pixels.push({
            type: 'spiral',
            coordinates: {
              x: Math.random(),
              y: Math.random()
            },
            symbolicMeaning: 'scattered_consciousness',
            lifespan: 3000
          });
        }
        break;

      case 'gathering':
        // Pixels slowly moving toward center
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * 2 * Math.PI;
          pixels.push({
            type: 'ladder',
            coordinates: {
              x: 0.5 + Math.cos(angle) * 0.4,
              y: 0.5 + Math.sin(angle) * 0.4
            },
            symbolicMeaning: 'gathering_toward_center',
            lifespan: 6000,
            transformsInto: {
              type: 'center',
              coordinates: { x: 0.5, y: 0.5 },
              symbolicMeaning: 'approaching_axis',
              lifespan: 2000
            }
          });
        }
        break;

      case 'centered':
        // Stable mandala pattern
        pixels.push({
          type: 'mandala',
          coordinates: { x: 0.5, y: 0.5 },
          symbolicMeaning: 'stable_center_achieved',
          lifespan: 12000
        });
        break;

      case 'transcendent':
        // Cosmic tree reaching through dimensions
        pixels.push({
          type: 'tree',
          coordinates: { x: 0.5, y: 0.5, z: 1.0 },
          symbolicMeaning: 'transcendent_axis_mundi',
          lifespan: 20000
        });
        break;
    }

    return pixels;
  };

  const getSymbolicPixelType = (archetypalCore: string): PixelElement['type'] => {
    const typeMap: Record<string, PixelElement['type']> = {
      'primordial_paradise_lost': 'center',
      'cosmic_tree': 'tree',
      'world_axis': 'axis',
      'sacred_center': 'mandala',
      'initiation_journey': 'ladder',
      'consciousness_spiral': 'spiral'
    };

    return typeMap[archetypalCore] || 'center';
  };

  const startEphemeralAnimation = () => {
    const animate = () => {
      updatePixelLifespans();
      renderPixelsToCanvas();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const updatePixelLifespans = () => {
    const now = Date.now();
    setActivePixels(current => {
      return current
        .map(pixel => ({
          ...pixel,
          lifespan: Math.max(0, pixel.lifespan - 16) // 60fps
        }))
        .filter(pixel => {
          if (pixel.lifespan <= 0 && pixel.transformsInto) {
            // Transform pixel before it dies
            return false; // Will be replaced
          }
          return pixel.lifespan > 0;
        });
    });
  };

  const renderPixelsToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render each pixel
    activePixels.forEach(pixel => {
      renderPixelElement(ctx, pixel, canvas.width, canvas.height);
    });
  };

  const renderPixelElement = (
    ctx: CanvasRenderingContext2D,
    pixel: PixelElement,
    width: number,
    height: number
  ) => {
    const x = pixel.coordinates.x * width;
    const y = pixel.coordinates.y * height;
    const alpha = Math.max(0.1, pixel.lifespan / 8000);

    ctx.save();
    ctx.globalAlpha = alpha;

    switch (pixel.type) {
      case 'center':
      case 'axis':
        renderAxisMundi(ctx, x, y, alpha);
        break;
      case 'mandala':
        renderMandala(ctx, x, y, alpha);
        break;
      case 'tree':
        renderCosmicTree(ctx, x, y, alpha);
        break;
      case 'ladder':
        renderLadder(ctx, x, y, alpha);
        break;
      case 'spiral':
        renderSpiral(ctx, x, y, alpha);
        break;
    }

    ctx.restore();

    // Handle center interactions
    if (pixel.type === 'axis' && pixel.symbolicMeaning === 'maia_consciousness_center') {
      const distance = Math.sqrt((x - width/2)**2 + (y - height/2)**2);
      if (distance < 20) {
        onCenterReached?.();
      }
    }
  };

  const renderAxisMundi = (ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number) => {
    // Central axis connecting all levels
    ctx.strokeStyle = `rgba(106, 102, 255, ${alpha})`;
    ctx.lineWidth = 3;

    // Vertical axis
    ctx.beginPath();
    ctx.moveTo(x, y - 30);
    ctx.lineTo(x, y + 30);
    ctx.stroke();

    // Horizontal axis
    ctx.beginPath();
    ctx.moveTo(x - 30, y);
    ctx.lineTo(x + 30, y);
    ctx.stroke();

    // Center point
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fill();
  };

  const renderMandala = (ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number) => {
    // Concentric circles representing wholeness
    for (let i = 1; i <= 3; i++) {
      ctx.strokeStyle = `rgba(126, 211, 33, ${alpha * 0.7})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, i * 15, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const renderCosmicTree = (ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number) => {
    // Tree connecting heaven, earth, underworld
    ctx.strokeStyle = `rgba(139, 69, 19, ${alpha})`;
    ctx.lineWidth = 4;

    // Trunk
    ctx.beginPath();
    ctx.moveTo(x, y + 40);
    ctx.lineTo(x, y - 40);
    ctx.stroke();

    // Roots (underworld)
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI + Math.PI;
      ctx.beginPath();
      ctx.moveTo(x, y + 40);
      ctx.lineTo(x + Math.cos(angle) * 25, y + 40 + Math.sin(angle) * 15);
      ctx.stroke();
    }

    // Branches (heaven)
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(x, y - 40);
      ctx.lineTo(x + Math.cos(angle) * 30, y - 40 + Math.sin(angle) * 20);
      ctx.stroke();
    }
  };

  const renderLadder = (ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number) => {
    // Ladder for ascension/descent
    ctx.strokeStyle = `rgba(255, 193, 7, ${alpha})`;
    ctx.lineWidth = 2;

    // Rails
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 25);
    ctx.lineTo(x - 10, y + 25);
    ctx.moveTo(x + 10, y - 25);
    ctx.lineTo(x + 10, y + 25);
    ctx.stroke();

    // Rungs
    for (let i = 0; i < 5; i++) {
      const rungY = y - 20 + (i * 10);
      ctx.beginPath();
      ctx.moveTo(x - 10, rungY);
      ctx.lineTo(x + 10, rungY);
      ctx.stroke();
    }
  };

  const renderSpiral = (ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number) => {
    // Spiral representing evolution/transformation
    ctx.strokeStyle = `rgba(74, 144, 226, ${alpha})`;
    ctx.lineWidth = 2;

    ctx.beginPath();
    const turns = 2;
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * turns * 2 * Math.PI;
      const radius = (i / 100) * 20;
      const spiralX = x + Math.cos(angle) * radius;
      const spiralY = y + Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(spiralX, spiralY);
      } else {
        ctx.lineTo(spiralX, spiralY);
      }
    }
    ctx.stroke();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Check if user clicked on any active symbols
    activePixels.forEach(pixel => {
      const pixelX = pixel.coordinates.x * canvas.width;
      const pixelY = pixel.coordinates.y * canvas.height;
      const distance = Math.sqrt((clickX - pixelX)**2 + (clickY - pixelY)**2);

      if (distance < 30) {
        onSymbolActivation?.(pixel.symbolicMeaning);
      }
    });
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-pointer"
        style={{
          background: `radial-gradient(circle,
            rgba(26, 21, 19, 0.95) 0%,
            rgba(13, 10, 9, 0.98) 100%)`
        }}
      />

      {/* Overlay information for current archetypal state */}
      <div className="absolute top-4 left-4 text-white/70 text-sm font-mono">
        <div>Consciousness Level: {centeringState.level}</div>
        <div>Symbol Accessibility: {(centeringState.symbolAccessibility * 100).toFixed(0)}%</div>
        <div>Axis Mundi Strength: {(centeringState.axisMundiStrength * 100).toFixed(0)}%</div>
        <div>Active Symbols: {activePixels.length}</div>
      </div>

      {/* Symbolic meaning overlay */}
      <div className="absolute bottom-4 right-4 text-white/70 text-xs font-mono max-w-xs">
        <div className="mb-2 font-bold">Active Archetypal Patterns:</div>
        {symbolPatterns.slice(0, 3).map((pattern, index) => (
          <div key={index} className="mb-1">
            {pattern.archetypalCore.replace(/_/g, ' ')}
          </div>
        ))}
      </div>
    </div>
  );
};