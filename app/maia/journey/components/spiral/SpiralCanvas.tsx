/**
 * SpiralCanvas Component - Journey Page Phase 3
 *
 * Main Three.js scene rendering the living spiral visualization.
 * Integrates thread nodes, spiral path, camera controls, and lighting.
 *
 * Phase: 4.4-C Phase 3 (Spiral Visualization)
 * Created: December 23, 2024
 */

'use client';

import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { ThreadNode } from './ThreadNode';
import { SpiralPath } from './SpiralPath';
import { AtmosphereBackground } from './AtmosphereBackground';
import { calculateSpiralLayout, calculateCameraPosition, type ThreadPosition } from '../../lib/spiralLayout';
import { useThreads } from '../../hooks/useThreads';
import { useJourneyStore } from '../../store/journeyStore';
import type { Thread } from '../../types';

export interface SpiralCanvasProps {
  /** Enable orbit controls */
  enableControls?: boolean;

  /** Show spiral path tube */
  showPath?: boolean;

  /** Enable stars background */
  showStars?: boolean;

  /** Enable Air/Aether atmospheric shader */
  showAtmosphere?: boolean;

  /** Callback when thread detail should be opened */
  onThreadDetailOpen?: (threadId: number, thread?: Thread) => void;

  /** Biofield coherence (0-1) for atmosphere modulation */
  coherence?: number;
}

/**
 * SpiralCanvas Component
 *
 * Renders the complete Three.js scene with:
 * - Thread nodes positioned along spiral
 * - Interactive camera controls
 * - Ambient lighting
 * - Optional spiral path visualization
 *
 * @example
 * ```tsx
 * <SpiralCanvas
 *   enableControls={true}
 *   showPath={true}
 *   showStars={true}
 * />
 * ```
 */
export function SpiralCanvas({
  enableControls = true,
  showPath = true,
  showStars = true,
  showAtmosphere = true,
  onThreadDetailOpen,
  coherence,
}: SpiralCanvasProps) {
  // Fetch threads from API
  const { threads, isLoading } = useThreads({ count: 12 });

  // Store state
  const selectedThreads = useJourneyStore((state) => state.selectedThreads);
  const toggleThreadSelection = useJourneyStore((state) => state.toggleThreadSelection);
  const setActiveThread = useJourneyStore((state) => state.setActiveThread);

  // Hover state for tooltips
  const [hoveredThreadId, setHoveredThreadId] = useState<number | null>(null);

  // Calculate thread positions along spiral
  const threadPositions = useMemo<ThreadPosition[]>(() => {
    if (threads.length === 0) return [];
    return calculateSpiralLayout(threads);
  }, [threads]);

  // Calculate camera position
  const cameraPosition = useMemo(() => {
    const { position } = calculateCameraPosition();
    return position;
  }, []);

  const handleThreadClick = (threadId: number) => {
    toggleThreadSelection(threadId);
    setActiveThread(threadId);

    // Open thread detail panel if callback provided
    if (onThreadDetailOpen) {
      const threadPosition = threadPositions.find((tp) => tp.id === threadId);
      onThreadDetailOpen(threadId, threadPosition?.thread);
    }
  };

  const handleThreadHover = (threadId: number | null) => {
    setHoveredThreadId(threadId);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-spin-slow">🌀</div>
          <p className="text-sm text-gray-500">Loading spiral...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        className="bg-gradient-to-br from-gray-50 to-white"
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Camera */}
          <PerspectiveCamera
            makeDefault
            position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]}
            fov={50}
            near={0.1}
            far={1000}
          />

          {/* Orbit Controls */}
          {enableControls && (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={30}
              target={[0, 0, 0]}
            />
          )}

          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={0.8}
            castShadow
          />
          <pointLight position={[-10, -10, -5]} intensity={0.3} />

          {/* Air/Aether Atmospheric Background */}
          {showAtmosphere && (
            <AtmosphereBackground
              radius={50}
              speed={1.0}
              intensity={coherence !== undefined ? coherence * 0.6 : 0.5}
              useCoherence={true}
            />
          )}

          {/* Stars Background */}
          {showStars && (
            <Stars
              radius={100}
              depth={50}
              count={5000}
              factor={4}
              saturation={0}
              fade
              speed={1}
            />
          )}

          {/* Spiral Path */}
          {showPath && <SpiralPath opacity={0.2} glowIntensity={0.4} />}

          {/* Thread Nodes */}
          {threadPositions.map((tp) => (
            <ThreadNode
              key={tp.id}
              threadPosition={tp}
              onClick={handleThreadClick}
              onHover={handleThreadHover}
              isSelected={selectedThreads.includes(tp.id)}
            />
          ))}
        </Suspense>
      </Canvas>

      {/* Hover Tooltip */}
      {hoveredThreadId && (
        <ThreadTooltip
          threadId={hoveredThreadId}
          threadPositions={threadPositions}
        />
      )}

      {/* Phase 3 Indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="absolute bottom-4 left-4 bg-purple-500 text-white text-xs
                     px-3 py-1.5 rounded-full shadow-lg"
        >
          Phase 3: Spiral Visualization
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Tooltip Component
// ============================================================================

interface ThreadTooltipProps {
  threadId: number;
  threadPositions: ThreadPosition[];
}

function ThreadTooltip({ threadId, threadPositions }: ThreadTooltipProps) {
  const threadPosition = threadPositions.find((tp) => tp.id === threadId);

  if (!threadPosition) return null;

  const { thread } = threadPosition;

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur
                 border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm z-50"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-3 h-3 rounded-full mt-1"
          style={{ backgroundColor: threadPosition.color }}
        />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            {thread.title}
          </h4>
          <p className="text-xs text-gray-600 line-clamp-2">
            {thread.summary}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>Week {thread.weekNumber}</span>
            <span>•</span>
            <span>{Math.round(thread.coherence * 100)}% coherence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
