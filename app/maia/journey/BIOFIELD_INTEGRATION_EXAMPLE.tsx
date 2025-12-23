/**
 * Biofield Integration Example - Journey Page Phase 5
 *
 * Complete example showing how to integrate biofield sensors
 * into the Journey Page with visual and audio modulation.
 *
 * Phase: 4.4-C Phase 5 (Biofield Integration)
 * Created: December 23, 2024
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useBiofield } from './hooks/useBiofield';
import { BiofieldHUD } from './components/biofield/BiofieldHUD';
import { SpiralCanvas } from './components/spiral/SpiralCanvas';
import { SpatialSoundscape } from './lib/audio/spatialSoundscape';

/**
 * Example: Full Biofield-Integrated Journey Page
 *
 * This example demonstrates:
 * 1. Connecting to biofield sensors
 * 2. Displaying live HRV/voice/breath data
 * 3. Modulating spiral colors based on coherence
 * 4. Adjusting spatial audio based on element ratios
 */
export default function JourneyPageWithBiofield() {
  // Initialize biofield sensors
  const biofield = useBiofield({
    hrvSource: 'stub',           // Use 'polar-h10' for real Bluetooth HRV
    breathMode: 'microphone',    // Or 'camera' for visual detection
    enableHRV: true,
    enableVoice: true,
    enableBreath: true,
    autoConnect: false,          // Manual connection via button
    debug: true,
  });

  // Audio engine
  const soundscapeRef = useRef<SpatialSoundscape | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // ============================================================================
  // Audio Integration
  // ============================================================================

  /**
   * Initialize spatial soundscape
   */
  const initAudio = async () => {
    if (!soundscapeRef.current) {
      soundscapeRef.current = new SpatialSoundscape({
        masterVolume: -20,
        spatialEnabled: true,
        reverbMix: 0.3,
        baseFrequency: 110,
      });

      await soundscapeRef.current.initialize();
      await soundscapeRef.current.start();
      setAudioInitialized(true);
    }
  };

  /**
   * Update audio parameters when biofield changes
   */
  useEffect(() => {
    if (!audioInitialized || !soundscapeRef.current || !biofield.audioParams) {
      return;
    }

    const { volumeAdjustment, reverbMix, elementRatios } = biofield.audioParams;

    // Update element ratios (drives frequency/volume of each element synth)
    soundscapeRef.current.updateElements(elementRatios);

    // Update reverb mix
    soundscapeRef.current.setReverbMix(reverbMix);

    // Update volume (optional - can be too dynamic)
    // soundscapeRef.current.setVolume(volumeAdjustment);
  }, [biofield.audioParams, audioInitialized]);

  // ============================================================================
  // Biofield Connection
  // ============================================================================

  const handleToggleBiofield = async () => {
    if (biofield.connected) {
      biofield.disconnect();
    } else {
      await biofield.connect();
    }
  };

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      soundscapeRef.current?.dispose();
      biofield.disconnect();
    };
  }, [biofield]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Main Spiral Canvas */}
      <SpiralCanvas
        enableControls={true}
        showPath={true}
        showStars={true}
        showAtmosphere={true}
        // Pass biofield coherence to modulate atmosphere
        coherence={biofield.coherence?.combined}
      />

      {/* Biofield HUD (live overlay) */}
      <BiofieldHUD
        hrv={biofield.hrv}
        voice={biofield.voice}
        breath={biofield.breath}
        coherence={biofield.coherence}
        connected={biofield.connected}
        sources={biofield.sources}
        onToggleConnection={handleToggleBiofield}
        position="bottom-left"
        collapsedByDefault={false}
      />

      {/* Audio Init Button */}
      {!audioInitialized && (
        <button
          onClick={initAudio}
          className="fixed bottom-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-lg
                     shadow-lg hover:bg-purple-600 transition-colors z-30"
        >
          🔊 Enable Soundscape
        </button>
      )}

      {/* Phase Indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white
                     text-xs px-4 py-2 rounded-full shadow-lg z-50"
        >
          Phase 5: Biofield Integration
          {biofield.isActive && ' • Biofield Active'}
          {audioInitialized && ' • Audio Active'}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example: Biofield-Modulated Thread Node
// ============================================================================

/**
 * Example showing how to modulate thread node colors with biofield coherence.
 *
 * Usage in ThreadNode.tsx:
 * ```tsx
 * import { useBiofield } from '../../hooks/useBiofield';
 * import { modulateThreadColor } from '../../lib/biofield/mappers';
 *
 * function ThreadNode({ thread, position }: ThreadNodeProps) {
 *   const biofield = useBiofield({ autoConnect: true });
 *
 *   // Calculate modulated color
 *   const baseColor = getElementColor(thread.element);
 *   const modulatedColor = biofield.coherence
 *     ? modulateThreadColor(baseColor, biofield.coherence.combined)
 *     : baseColor;
 *
 *   return (
 *     <mesh position={position}>
 *       <sphereGeometry args={[0.5, 32, 32]} />
 *       <meshStandardMaterial color={modulatedColor} />
 *     </mesh>
 *   );
 * }
 * ```
 */

// ============================================================================
// Example: Biofield-Driven Atmosphere Shader
// ============================================================================

/**
 * Example showing how to modulate Aether field with biofield coherence.
 *
 * Usage in AtmosphereBackground.tsx:
 * ```tsx
 * import { useFrame } from '@react-three/fiber';
 * import { useBiofield } from '../../hooks/useBiofield';
 *
 * function AtmosphereBackground() {
 *   const biofield = useBiofield({ autoConnect: true });
 *   const shaderRef = useRef<ShaderMaterial>(null);
 *
 *   useFrame((state) => {
 *     if (!shaderRef.current || !biofield.coherence) return;
 *
 *     // Modulate shader intensity with combined coherence
 *     shaderRef.current.uniforms.uIntensity.value = biofield.coherence.combined;
 *
 *     // Modulate shader speed with HRV coherence
 *     shaderRef.current.uniforms.uSpeed.value = 1.0 + biofield.coherence.hrv * 0.5;
 *   });
 *
 *   return (
 *     <mesh>
 *       <sphereGeometry args={[50, 64, 64]} />
 *       <shaderMaterial
 *         ref={shaderRef}
 *         vertexShader={vertexShader}
 *         fragmentShader={fragmentShader}
 *         uniforms={{
 *           uTime: { value: 0 },
 *           uIntensity: { value: 0.5 },
 *           uSpeed: { value: 1.0 },
 *         }}
 *         transparent
 *         side={BackSide}
 *       />
 *     </mesh>
 *   );
 * }
 * ```
 */

// ============================================================================
// Example: Biofield-Responsive Collective Coherence
// ============================================================================

/**
 * Example showing how to display collective coherence from biofield.
 *
 * Usage in CollectiveCoherenceMeter.tsx:
 * ```tsx
 * import { useBiofield } from '../../hooks/useBiofield';
 *
 * function CollectiveCoherenceMeter() {
 *   const biofield = useBiofield({ autoConnect: true });
 *
 *   // In a real system, this would aggregate across multiple users
 *   const groupCoherence = biofield.coherence?.combined || 0;
 *
 *   return (
 *     <div className="p-4 bg-white rounded-lg shadow">
 *       <h3>Collective Coherence</h3>
 *       <div className="text-2xl font-bold">
 *         {Math.round(groupCoherence * 100)}%
 *       </div>
 *       <div className="text-sm text-gray-600">
 *         Based on {biofield.isActive ? 'live' : 'historical'} biofield data
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */

// ============================================================================
// Example: Biofield Event Triggers
// ============================================================================

/**
 * Example showing how to trigger audio events from biofield changes.
 *
 * Usage in page.tsx or SpiralCanvas:
 * ```tsx
 * import { useEffect, useRef } from 'react';
 * import { useBiofield } from './hooks/useBiofield';
 *
 * function JourneyPage() {
 *   const biofield = useBiofield({ autoConnect: true });
 *   const soundscapeRef = useRef<SpatialSoundscape>(null);
 *   const prevCoherenceRef = useRef<number>(0);
 *
 *   // Trigger sound when coherence crosses thresholds
 *   useEffect(() => {
 *     if (!biofield.coherence || !soundscapeRef.current) return;
 *
 *     const { combined } = biofield.coherence;
 *     const prev = prevCoherenceRef.current;
 *
 *     // Coherence increased significantly
 *     if (combined > prev + 0.1) {
 *       soundscapeRef.current.playEvent('coherenceShift', {
 *         frequency: 440,
 *         duration: 1.0,
 *       });
 *     }
 *
 *     prevCoherenceRef.current = combined;
 *   }, [biofield.coherence]);
 *
 *   // ... rest of component
 * }
 * ```
 */

// ============================================================================
// Example: Biofield Persistence
// ============================================================================

/**
 * Example showing how to persist biofield snapshots to database.
 *
 * Usage in page.tsx or biofield service:
 * ```tsx
 * import { useEffect, useRef } from 'react';
 * import { useBiofield } from './hooks/useBiofield';
 * import { storeBiofieldSnapshot } from './lib/db/threadsQuery';
 *
 * function JourneyPage() {
 *   const biofield = useBiofield({ autoConnect: true });
 *   const currentThreadId = 123; // From route params or state
 *
 *   // Save biofield snapshot every 5 seconds
 *   useEffect(() => {
 *     if (!biofield.isActive) return;
 *
 *     const interval = setInterval(async () => {
 *       if (!biofield.hrv || !biofield.voice || !biofield.breath) return;
 *
 *       try {
 *         await storeBiofieldSnapshot({
 *           traceId: currentThreadId,
 *           hrvRMSSD: biofield.hrv.rmssd,
 *           hrvCoherence: biofield.hrv.coherence,
 *           hrvQuality: biofield.hrv.quality,
 *           voicePitch: biofield.voice.pitch,
 *           voiceEnergy: biofield.voice.energy,
 *           voiceAffect: biofield.voice.affect,
 *           voiceQuality: biofield.voice.quality,
 *           breathRate: biofield.breath.rate,
 *           breathCoherence: biofield.breath.coherence,
 *           breathQuality: biofield.breath.quality,
 *           combinedCoherence: biofield.coherence?.combined,
 *         });
 *
 *         console.log('[Biofield] Snapshot saved');
 *       } catch (error) {
 *         console.error('[Biofield] Failed to save snapshot:', error);
 *       }
 *     }, 5000);
 *
 *     return () => clearInterval(interval);
 *   }, [biofield, currentThreadId]);
 *
 *   // ... rest of component
 * }
 * ```
 */
