/**
 * Journey Page - MAIA Five-Element Integration
 *
 * Main page component orchestrating all five Spiralogic elements:
 * 🫀 Earth (Embodied), 💧 Water (Narrative), 🔥 Fire (Sovereignty),
 * 🌬️ Air (Insight), ✨ Aether (Meta-Awareness)
 *
 * Phase: 4.4-C (Five-Element Integration)
 * Status: Phase 3 - Three.js Spiral Visualization
 * Created: December 23, 2024
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useJourneyStore, selectViewMode, selectAetherActive } from './store/journeyStore';

// Providers
import { QueryProvider } from './providers/QueryProvider';

// Spiral Visualization Components
import { SpiralCanvas } from './components/spiral/SpiralCanvas';

// Thread Detail Components
import { ThreadDetailPanel } from './components/thread/ThreadDetailPanel';

// Air Layer Components
import { InsightPanel } from './components/air/InsightPanel';
import { SymbolCloud } from './components/air/SymbolCloud';

// Aether Layer Components
import { AetherFieldOverlay } from './components/aether/AetherFieldOverlay';
import { CollectiveCoherenceMeter } from './components/aether/CollectiveCoherenceMeter';
import { SynthesisPanel } from './components/aether/SynthesisPanel';

// Phase 5: Biofield Integration
import { useBiofield } from './hooks/useBiofield';
import { BiofieldHUD } from './components/biofield/BiofieldHUD';
import { SpatialSoundscape } from './lib/audio/spatialSoundscape';

// Import types
import type { Symbol, CollectiveCoherence, Thread } from './types';

export default function JourneyExperience() {
  // Store state
  const viewMode = useJourneyStore(selectViewMode);
  const aetherActive = useJourneyStore(selectAetherActive);
  const insightPanelVisible = useJourneyStore((state) => state.insightPanelVisible);
  const synthesisPanelVisible = useJourneyStore((state) => state.synthesisPanelVisible);
  const collectiveCoherenceVisible = useJourneyStore((state) => state.collectiveCoherenceVisible);
  const selectedThreads = useJourneyStore((state) => state.selectedThreads);
  const activeThread = useJourneyStore((state) => state.activeThread);

  // Store actions
  const hideInsightPanel = useJourneyStore((state) => state.hideInsightPanel);
  const hideSynthesisPanel = useJourneyStore((state) => state.hideSynthesisPanel);
  const setActiveSymbol = useJourneyStore((state) => state.setActiveSymbol);

  // Local state for thread detail panel
  const [detailPanelVisible, setDetailPanelVisible] = useState(false);
  const [detailThreadId, setDetailThreadId] = useState<number | null>(null);
  const [detailThreadPreview, setDetailThreadPreview] = useState<Thread | undefined>();

  // ========== PHASE 5: BIOFIELD INTEGRATION ==========
  const biofield = useBiofield({
    hrvSource: 'stub',           // Use 'polar-h10' for real Bluetooth HRV
    breathMode: 'microphone',    // Or 'camera' for visual detection
    enableHRV: true,
    enableVoice: true,
    enableBreath: true,
    autoConnect: false,          // Manual connection via button
    debug: process.env.NODE_ENV === 'development',
  });

  const soundscapeRef = useRef<SpatialSoundscape | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  // ====================================================

  // Handle thread click (opens detail panel)
  const handleThreadDetailOpen = (threadId: number, thread?: Thread) => {
    setDetailThreadId(threadId);
    setDetailThreadPreview(thread);
    setDetailPanelVisible(true);
  };

  const handleThreadDetailClose = () => {
    setDetailPanelVisible(false);
  };

  // ========== PHASE 5: AUDIO INTEGRATION ==========
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

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      soundscapeRef.current?.dispose();
      biofield.disconnect();
    };
  }, [biofield]);

  /**
   * Biofield Persistence: Save snapshots every 5 seconds (OPTIONAL)
   * Uncomment to enable automatic snapshot saving to database
   */
  /*
  useEffect(() => {
    if (!biofield.isActive) return;

    const currentThreadId = activeThread; // Thread ID from store

    const interval = setInterval(async () => {
      if (!biofield.hrv || !biofield.voice || !biofield.breath || !currentThreadId) return;

      try {
        const response = await fetch('/api/biofield/snapshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            traceId: currentThreadId,
            hrvRMSSD: biofield.hrv.rmssd,
            hrvCoherence: biofield.hrv.coherence,
            hrvQuality: biofield.hrv.quality,
            voicePitch: biofield.voice.pitch,
            voiceEnergy: biofield.voice.energy,
            voiceAffect: biofield.voice.affect,
            voiceQuality: biofield.voice.quality,
            breathRate: biofield.breath.rate,
            breathCoherence: biofield.breath.coherence,
            breathQuality: biofield.breath.quality,
            combinedCoherence: biofield.coherence?.combined,
          }),
        });

        if (!response.ok) {
          console.error('[Biofield] Snapshot save failed:', response.statusText);
        }
      } catch (error) {
        console.error('[Biofield] Snapshot save error:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [biofield, activeThread]);
  */
  // ====================================================

  // Phase 1: Mock data for placeholder components
  const mockSymbols: Symbol[] = [];
  const mockCoherence: CollectiveCoherence = {
    groupCoherence: 0.73,
    participantCount: 12,
    trend: 'rising',
    timestamp: new Date().toISOString(),
  };

  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-50 relative">
        {/* ✨ Aether Layer: Background Field */}
        <AetherFieldOverlay coherence={0.75} animated={true} />

      {/* ✨ Aether Layer: Collective Coherence Meter (Top-Left) */}
      {collectiveCoherenceVisible && (
        <CollectiveCoherenceMeter
          visible={collectiveCoherenceVisible}
          coherence={mockCoherence}
        />
      )}

      {/* 🌬️ Air Layer: Insight Panel (Top-Right) */}
      <InsightPanel
        visible={insightPanelVisible}
        onClose={hideInsightPanel}
      />

      {/* Main Layout Container */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Navigation Header */}
        <JourneyNavigation />

        {/* Main Content Area (3-Pane Layout) */}
        <main className="flex-1 flex overflow-hidden">
          {/* Desktop Layout: Thread Sidebar (20%) | Canvas (60%) | Biofield Panel (20%) */}
          {/* Tablet/Mobile: Responsive stacking */}

          {/* Thread Sidebar (💧 Water Layer) - Desktop Only */}
          <aside className="hidden lg:block w-1/5 border-r border-gray-200 bg-white overflow-y-auto">
            <ThreadSidebarPlaceholder />
          </aside>

          {/* Center Canvas (All Elements Converge) */}
          <section className="flex-1 relative bg-white">
            {/* 🌬️ Air Layer: Symbol Cloud (Overlay) */}
            <SymbolCloud
              symbols={mockSymbols}
              activeSymbol={null}
              onSymbolClick={setActiveSymbol}
            />

            {/* 🌀 Living Spiral Canvas (Phase 4) */}
            <SpiralCanvas
              enableControls={true}
              showPath={true}
              showStars={true}
              showAtmosphere={true}
              onThreadDetailOpen={handleThreadDetailOpen}
              coherence={biofield.coherence?.combined}
            />
          </section>

          {/* Biofield Panel (🫀 Earth Layer) - Desktop Only */}
          <aside className="hidden lg:block w-1/5 border-l border-gray-200 bg-white overflow-y-auto">
            <BiofieldPanelPlaceholder />
          </aside>
        </main>

        {/* ✨ Aether Layer: Synthesis Panel (Bottom Overlay) */}
        <SynthesisPanel
          visible={synthesisPanelVisible && selectedThreads.length > 0}
          threadIds={selectedThreads}
          onClose={hideSynthesisPanel}
        />
      </div>

      {/* 🌀 Thread Detail Panel (Phase 4) */}
      <ThreadDetailPanel
        visible={detailPanelVisible}
        threadId={detailThreadId}
        threadPreview={detailThreadPreview}
        onClose={handleThreadDetailClose}
        onNavigateToThread={(id) => {
          // Find thread in active threads and open its detail
          handleThreadDetailOpen(id);
        }}
      />

        {/* ========== PHASE 5: BIOFIELD HUD ========== */}
        <BiofieldHUD
          hrv={biofield.hrv}
          voice={biofield.voice}
          breath={biofield.breath}
          coherence={biofield.coherence}
          connected={biofield.connected}
          sources={biofield.sources}
          onToggleConnection={biofield.connected ? biofield.disconnect : biofield.connect}
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

        {/* Phase 5 Indicator (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2
                          bg-green-500 text-white text-xs px-4 py-2 rounded-full
                          z-50 shadow-lg">
            Phase 5: Biofield Integration
            {biofield.isActive && ' • Biofield Active'}
            {audioInitialized && ' • Audio Active'}
          </div>
        )}
      </div>
    </QueryProvider>
  );
}

// ============================================================================
// Navigation Component
// ============================================================================

function JourneyNavigation() {
  const viewMode = useJourneyStore((state) => state.viewMode);
  const setViewMode = useJourneyStore((state) => state.setViewMode);
  const aetherModeActive = useJourneyStore((state) => state.aetherModeActive);
  const toggleAetherMode = useJourneyStore((state) => state.toggleAetherMode);
  const toggleInsightPanel = useJourneyStore((state) => state.toggleInsightPanel);
  const toggleCollectiveCoherence = useJourneyStore((state) => state.toggleCollectiveCoherence);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 relative z-20">
      <div className="flex items-center justify-between">
        {/* Left: View Mode Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('spiral')}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              viewMode === 'spiral'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🌀 Spiral
          </button>
          <button
            onClick={() => setViewMode('tapestry')}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              viewMode === 'tapestry'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💧 Tapestry
          </button>
          <button
            onClick={() => setViewMode('biofield')}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              viewMode === 'biofield'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🫀 Biofield
          </button>
        </div>

        {/* Right: Air/Aether Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleInsightPanel}
            className="px-3 py-1.5 text-sm bg-air-bg text-air-text rounded
                       hover:bg-air-border transition-colors"
          >
            🌬️ Insights
          </button>
          <button
            onClick={toggleCollectiveCoherence}
            className="px-3 py-1.5 text-sm bg-aether-bg text-aether-text rounded
                       hover:bg-aether-border transition-colors"
          >
            ✨ Coherence
          </button>
          <button
            onClick={toggleAetherMode}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              aetherModeActive
                ? 'bg-aether-accent text-white'
                : 'bg-aether-bg text-aether-text hover:bg-aether-border'
            }`}
          >
            {aetherModeActive ? '✨ Aether Active' : '✨ Aether Mode'}
          </button>
        </div>
      </div>
    </nav>
  );
}

// ============================================================================
// Placeholder Components (Phase 1)
// ============================================================================

function ThreadSidebarPlaceholder() {
  return (
    <div className="p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">💧 Narrative Threads</h2>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="p-3 bg-gray-50 border border-gray-200 rounded-lg
                     hover:border-blue-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-900">
              Thread {i}
            </span>
            <span className="text-xs text-gray-500">85%</span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">
            Placeholder narrative thread summary...
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
              W{i}
            </span>
            <span className="text-xs text-gray-500">2h ago</span>
          </div>
        </div>
      ))}
      <div className="text-xs text-gray-400 italic text-center pt-4">
        Phase 1 • Connect to useThreads() hook
      </div>
    </div>
  );
}

function BiofieldPanelPlaceholder() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">🫀 Biofield</h2>

      {/* HRV Graph Placeholder */}
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-xs font-medium text-green-700 mb-2">Heart Rate Variability</div>
        <div className="h-24 bg-white rounded flex items-center justify-center">
          <span className="text-xs text-gray-400">HRV Graph (Phase 5)</span>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          RMSSD: <span className="font-medium">45 ms</span>
        </div>
      </div>

      {/* Voice Prosody Placeholder */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-xs font-medium text-blue-700 mb-2">Voice Prosody</div>
        <div className="h-16 bg-white rounded flex items-center justify-center">
          <span className="text-xs text-gray-400">Waveform (Phase 5)</span>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          Affect: <span className="font-medium">0.72</span>
        </div>
      </div>

      <div className="text-xs text-gray-400 italic text-center pt-4">
        Phase 1 • Connect to useBiofieldData() hook
      </div>
    </div>
  );
}
