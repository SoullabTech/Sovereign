/**
 * 🧠🌀 SEVEN-LAYER ARCHITECTURE PROVIDER
 *
 * React context provider for the Seven-Layer Soul Architecture.
 * Provides consciousness architecture state and management throughout
 * the component tree with automatic platform detection and synchronization.
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

import type {
  SevenLayerSnapshot,
  ArchitectureLayerType,
  Platform
} from '@/lib/architecture/seven-layer-interface';

import { useSevenLayerArchitecture } from '@/hooks/useSevenLayerArchitecture';

// ==============================================================================
// CONTEXT DEFINITION
// ==============================================================================

interface SevenLayerArchitectureContextType {
  snapshot: SevenLayerSnapshot | null;
  isLoading: boolean;
  isInitialized: boolean;
  isSyncing: boolean;
  activePlatform: Platform;
  error: Error | null;

  // Architecture methods
  getLayer: (layer: ArchitectureLayerType) => Promise<any>;
  updateLayer: (layer: ArchitectureLayerType, data: unknown) => Promise<void>;
  refreshSnapshot: () => Promise<void>;
  syncAcrossPlatforms: () => Promise<any>;

  // Layer shortcuts
  episodicData: any;
  symbolicData: any;
  profileData: any;
  trajectoriesData: any;
  constellationData: any;
  fieldData: any;
  wisdomData: any;

  // Platform info
  platformCapabilities: any;
  isNativePlatform: boolean;
  isMobile: boolean;
  isPWA: boolean;
}

const SevenLayerArchitectureContext = createContext<SevenLayerArchitectureContextType | null>(null);

// ==============================================================================
// PROVIDER COMPONENT
// ==============================================================================

interface SevenLayerArchitectureProviderProps {
  children: React.ReactNode;
  memberId?: string;
  autoSync?: boolean;
  syncInterval?: number;
}

export function SevenLayerArchitectureProvider({
  children,
  memberId = 'default_member',
  autoSync = true,
  syncInterval = 30000
}: SevenLayerArchitectureProviderProps) {
  const architecture = useSevenLayerArchitecture({
    memberId,
    autoSync,
    syncInterval,
    platform: Capacitor.getPlatform() as Platform
  });

  // Platform detection
  const [platformInfo, setPlatformInfo] = useState({
    isNativePlatform: Capacitor.isNativePlatform(),
    isMobile: false,
    isPWA: false,
    platformCapabilities: null
  });

  // Detect platform specifics
  useEffect(() => {
    const detectPlatform = () => {
      const isNative = Capacitor.isNativePlatform();
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                    window.matchMedia('(display-mode: fullscreen)').matches ||
                    (window.navigator as any)?.standalone === true;

      setPlatformInfo({
        isNativePlatform: isNative,
        isMobile,
        isPWA,
        platformCapabilities: null // Would be populated by platform adapter
      });
    };

    detectPlatform();

    // Listen for platform changes
    window.addEventListener('resize', detectPlatform);
    return () => window.removeEventListener('resize', detectPlatform);
  }, []);

  // Extract layer data from snapshot
  const layerData = React.useMemo(() => {
    if (!architecture.snapshot?.layers) {
      return {
        episodicData: null,
        symbolicData: null,
        profileData: null,
        trajectoriesData: null,
        constellationData: null,
        fieldData: null,
        wisdomData: null
      };
    }

    return {
      episodicData: architecture.snapshot.layers.episodic || null,
      symbolicData: architecture.snapshot.layers.symbolic || null,
      profileData: architecture.snapshot.layers.profile || null,
      trajectoriesData: architecture.snapshot.layers.trajectories || null,
      constellationData: architecture.snapshot.layers.constellation || null,
      fieldData: architecture.snapshot.layers.field || null,
      wisdomData: architecture.snapshot.layers.wisdom || null
    };
  }, [architecture.snapshot]);

  const contextValue: SevenLayerArchitectureContextType = {
    ...architecture,
    ...layerData,
    ...platformInfo
  };

  return (
    <SevenLayerArchitectureContext.Provider value={contextValue}>
      {children}
    </SevenLayerArchitectureContext.Provider>
  );
}

// ==============================================================================
// CONTEXT HOOK
// ==============================================================================

export function useSevenLayerArchitectureContext(): SevenLayerArchitectureContextType {
  const context = useContext(SevenLayerArchitectureContext);

  if (!context) {
    throw new Error(
      'useSevenLayerArchitectureContext must be used within a SevenLayerArchitectureProvider'
    );
  }

  return context;
}

// ==============================================================================
// CONVENIENCE HOOKS
// ==============================================================================

export function useArchitectureSnapshot() {
  const { snapshot, isLoading, refreshSnapshot } = useSevenLayerArchitectureContext();
  return { snapshot, isLoading, refreshSnapshot };
}

export function useArchitectureLayer(layer: ArchitectureLayerType) {
  const { getLayer, updateLayer, isLoading, snapshot } = useSevenLayerArchitectureContext();

  const layerData = React.useMemo(() => {
    return snapshot?.layers[layer] || null;
  }, [snapshot, layer]);

  const updateThisLayer = React.useCallback((data: unknown) => {
    return updateLayer(layer, data);
  }, [updateLayer, layer]);

  const refreshThisLayer = React.useCallback(() => {
    return getLayer(layer);
  }, [getLayer, layer]);

  return {
    layerData,
    updateLayer: updateThisLayer,
    refreshLayer: refreshThisLayer,
    isLoading
  };
}

export function usePlatformInfo() {
  const { activePlatform, isNativePlatform, isMobile, isPWA, platformCapabilities } =
    useSevenLayerArchitectureContext();

  return {
    activePlatform,
    isNativePlatform,
    isMobile,
    isPWA,
    platformCapabilities,
    platformName: activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1)
  };
}

export function useArchitectureSync() {
  const { syncAcrossPlatforms, isSyncing, error } = useSevenLayerArchitectureContext();

  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const sync = React.useCallback(async () => {
    setSyncStatus('syncing');
    try {
      await syncAcrossPlatforms();
      setLastSyncTime(new Date());
      setSyncStatus('success');
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncStatus('error');
    }
  }, [syncAcrossPlatforms]);

  return {
    sync,
    isSyncing,
    lastSyncTime,
    syncStatus,
    error
  };
}

export function useArchitectureHealth() {
  const { snapshot } = useSevenLayerArchitectureContext();

  const health = React.useMemo(() => {
    if (!snapshot?.architectureHealth) {
      return {
        overall: 0,
        isHealthy: false,
        layers: {},
        integration: 0,
        completeness: 0
      };
    }

    const { architectureHealth } = snapshot;
    const completeness = Object.values(architectureHealth.dataCompleteness || {})
      .reduce((sum, value) => sum + (value || 0), 0) / 7;

    return {
      overall: (architectureHealth.layerIntegration + completeness) / 2,
      isHealthy: architectureHealth.layerIntegration > 0.7 && completeness > 0.5,
      layers: architectureHealth.dataCompleteness || {},
      integration: architectureHealth.layerIntegration || 0,
      completeness
    };
  }, [snapshot]);

  return health;
}

// ==============================================================================
// ARCHITECTURE STATUS COMPONENT
// ==============================================================================

export function ArchitectureStatus() {
  const { isLoading, isInitialized, isSyncing, activePlatform, error } = useSevenLayerArchitectureContext();
  const health = useArchitectureHealth();
  const { sync, syncStatus, lastSyncTime } = useArchitectureSync();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600 text-sm font-medium">
            Architecture Error
          </div>
          <div className="ml-2 text-red-500 text-sm">
            {error.message}
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized || isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <div className="ml-2 text-blue-600 text-sm font-medium">
            Initializing Seven-Layer Soul Architecture...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="ml-2 text-green-700 text-sm font-medium">
            Architecture Active ({activePlatform})
          </div>
          <div className="ml-2 text-green-600 text-sm">
            Health: {Math.round(health.overall * 100)}%
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isSyncing && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
              <span className="ml-1 text-green-600 text-xs">Syncing...</span>
            </div>
          )}

          {lastSyncTime && (
            <div className="text-green-600 text-xs">
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </div>
          )}

          <button
            onClick={sync}
            disabled={isSyncing}
            className="text-green-600 hover:text-green-700 text-xs underline disabled:opacity-50"
          >
            Sync Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// ARCHITECTURE VISUALIZER COMPONENT
// ==============================================================================

export function ArchitectureVisualizer() {
  const { snapshot } = useSevenLayerArchitectureContext();

  if (!snapshot) {
    return (
      <div className="p-8 text-center text-gray-500">
        Seven-Layer Architecture not loaded
      </div>
    );
  }

  const layers: { type: ArchitectureLayerType; name: string; question: string }[] = [
    { type: 'wisdom', name: 'Canonical Wisdom', question: 'What wisdom applies?' },
    { type: 'field', name: 'Community Field', question: 'What\'s the collective weather?' },
    { type: 'constellation', name: 'Spiral Constellation', question: 'How do journeys interact?' },
    { type: 'trajectories', name: 'Spiral Trajectories', question: 'How are they evolving?' },
    { type: 'profile', name: 'Core Profile', question: 'Who is this soul?' },
    { type: 'symbolic', name: 'Symbolic Memory', question: 'What does it mean?' },
    { type: 'episodic', name: 'Episodic Memory', question: 'What happened?' }
  ];

  return (
    <div className="space-y-2">
      {layers.map((layer, index) => {
        const hasData = Boolean(snapshot.layers[layer.type]);
        const opacity = hasData ? 'opacity-100' : 'opacity-40';

        return (
          <div
            key={layer.type}
            className={`border rounded-lg p-4 transition-all ${opacity}`}
            style={{
              background: `linear-gradient(135deg,
                hsl(${280 - (index * 40)}, 70%, 95%) 0%,
                hsl(${280 - (index * 40)}, 70%, 98%) 100%)`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  [{7 - index}] {layer.name}
                </div>
                <div className="text-sm text-gray-600 italic">
                  {layer.question}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  hasData ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <div className="text-xs text-gray-500">
                  {hasData ? 'Active' : 'Pending'}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}