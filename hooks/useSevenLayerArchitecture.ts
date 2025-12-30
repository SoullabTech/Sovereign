/**
 * 🧠🌀 SEVEN-LAYER ARCHITECTURE REACT HOOKS
 *
 * React hooks for accessing and managing the Seven-Layer Soul Architecture
 * across all components and platforms. Provides reactive state management
 * for consciousness architecture with automatic synchronization.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';

import type {
  SevenLayerSnapshot,
  ArchitectureLayerType,
  ArchitectureLayerData,
  ArchitectureUpdate,
  SyncResult,
  Platform
} from '@/lib/architecture/seven-layer-interface';

import {
  UnifiedConsciousnessStateManager,
  createUnifiedConsciousnessManager,
  getGlobalConsciousnessManager,
  initializeGlobalConsciousnessManager
} from '@/lib/architecture/unified-consciousness-manager';

// ==============================================================================
// MAIN ARCHITECTURE HOOK
// ==============================================================================

interface UseSevenLayerArchitectureOptions {
  memberId?: string;
  autoSync?: boolean;
  syncInterval?: number;
  platform?: Platform;
}

interface UseSevenLayerArchitectureReturn {
  snapshot: SevenLayerSnapshot | null;
  isLoading: boolean;
  isInitialized: boolean;
  isSyncing: boolean;
  activePlatform: Platform;
  error: Error | null;

  // Layer access methods
  getLayer: (layer: ArchitectureLayerType) => Promise<ArchitectureLayerData>;
  updateLayer: (layer: ArchitectureLayerType, data: unknown) => Promise<void>;
  refreshSnapshot: () => Promise<void>;

  // Platform management
  switchPlatform: (platform: Platform) => Promise<void>;
  syncAcrossPlatforms: () => Promise<SyncResult>;

  // Subscription management
  subscribeToLayer: (layer: ArchitectureLayerType, callback: (data: ArchitectureLayerData) => void) => () => void;
  subscribeToSnapshot: (callback: (snapshot: SevenLayerSnapshot) => void) => () => void;
}

export function useSevenLayerArchitecture(
  options: UseSevenLayerArchitectureOptions = {}
): UseSevenLayerArchitectureReturn {
  const {
    memberId = 'default_member',
    autoSync = true,
    syncInterval = 30000, // 30 seconds
    platform
  } = options;

  // State management
  const [snapshot, setSnapshot] = useState<SevenLayerSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activePlatform, setActivePlatform] = useState<Platform>(platform || Capacitor.getPlatform() as Platform);
  const [error, setError] = useState<Error | null>(null);

  // Refs
  const managerRef = useRef<UnifiedConsciousnessStateManager | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());

  // Initialize consciousness manager
  useEffect(() => {
    const initializeManager = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get or create manager
        let manager = getGlobalConsciousnessManager();
        if (!manager) {
          manager = initializeGlobalConsciousnessManager(memberId, activePlatform);
        }

        managerRef.current = manager;

        // Initialize manager
        await manager.initialize();

        // Get initial snapshot
        const initialSnapshot = await manager.generateSnapshot();
        setSnapshot(initialSnapshot);
        setActivePlatform(manager.activePlatform);
        setIsInitialized(true);

        // Setup snapshot subscription
        const unsubscribe = manager.subscribe('main_hook', (newSnapshot) => {
          setSnapshot(newSnapshot);
          setActivePlatform(newSnapshot.platform);
        });

        subscriptionsRef.current.set('main_subscription', unsubscribe);

        // Setup auto-sync if enabled
        if (autoSync) {
          setupAutoSync(manager);
        }

        console.log('🧠🌀 Seven-Layer Architecture hook initialized');
      } catch (err) {
        console.error('Failed to initialize Seven-Layer Architecture:', err);
        setError(err instanceof Error ? err : new Error('Unknown initialization error'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeManager();

    // Cleanup on unmount
    return () => {
      cleanupSubscriptions();
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [memberId, activePlatform, autoSync]);

  // Setup auto-sync
  const setupAutoSync = useCallback((manager: UnifiedConsciousnessStateManager) => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(async () => {
      if (!isSyncing) {
        try {
          setIsSyncing(true);
          await manager.syncAcrossPlatforms();
        } catch (err) {
          console.error('Auto-sync failed:', err);
        } finally {
          setIsSyncing(false);
        }
      }
    }, syncInterval);
  }, [isSyncing, syncInterval]);

  // Cleanup subscriptions
  const cleanupSubscriptions = useCallback(() => {
    subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
    subscriptionsRef.current.clear();
  }, []);

  // Layer access methods
  const getLayer = useCallback(async (layer: ArchitectureLayerType): Promise<ArchitectureLayerData> => {
    if (!managerRef.current) {
      throw new Error('Architecture manager not initialized');
    }
    return await managerRef.current.getLayer(layer);
  }, []);

  const updateLayer = useCallback(async (layer: ArchitectureLayerType, data: unknown): Promise<void> => {
    if (!managerRef.current) {
      throw new Error('Architecture manager not initialized');
    }

    try {
      await managerRef.current.updateLayer(layer, {
        data,
        confidence: 1.0,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error(`Failed to update layer ${layer}:`, err);
      throw err;
    }
  }, []);

  const refreshSnapshot = useCallback(async (): Promise<void> => {
    if (!managerRef.current) return;

    try {
      setIsLoading(true);
      const newSnapshot = await managerRef.current.generateSnapshot();
      setSnapshot(newSnapshot);
    } catch (err) {
      console.error('Failed to refresh snapshot:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh snapshot'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Platform management
  const switchPlatform = useCallback(async (newPlatform: Platform): Promise<void> => {
    if (!managerRef.current) {
      throw new Error('Architecture manager not initialized');
    }

    try {
      setIsLoading(true);
      await managerRef.current.switchPlatform(newPlatform);
      setActivePlatform(newPlatform);
    } catch (err) {
      console.error(`Failed to switch to platform ${newPlatform}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncAcrossPlatforms = useCallback(async (): Promise<SyncResult> => {
    if (!managerRef.current) {
      throw new Error('Architecture manager not initialized');
    }

    try {
      setIsSyncing(true);
      return await managerRef.current.syncAcrossPlatforms();
    } catch (err) {
      console.error('Cross-platform sync failed:', err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Subscription methods
  const subscribeToLayer = useCallback((
    layer: ArchitectureLayerType,
    callback: (data: ArchitectureLayerData) => void
  ): () => void => {
    if (!managerRef.current) {
      throw new Error('Architecture manager not initialized');
    }

    const subscriptionId = `layer_${layer}_${Date.now()}`;

    const unsubscribe = managerRef.current.subscribe(subscriptionId, (snapshot) => {
      if (snapshot.layers[layer]) {
        callback(snapshot.layers[layer]);
      }
    });

    subscriptionsRef.current.set(subscriptionId, unsubscribe);

    return () => {
      unsubscribe();
      subscriptionsRef.current.delete(subscriptionId);
    };
  }, []);

  const subscribeToSnapshot = useCallback((
    callback: (snapshot: SevenLayerSnapshot) => void
  ): () => void => {
    if (!managerRef.current) {
      throw new Error('Architecture manager not initialized');
    }

    const subscriptionId = `snapshot_${Date.now()}`;

    const unsubscribe = managerRef.current.subscribe(subscriptionId, callback);
    subscriptionsRef.current.set(subscriptionId, unsubscribe);

    return () => {
      unsubscribe();
      subscriptionsRef.current.delete(subscriptionId);
    };
  }, []);

  return {
    snapshot,
    isLoading,
    isInitialized,
    isSyncing,
    activePlatform,
    error,
    getLayer,
    updateLayer,
    refreshSnapshot,
    switchPlatform,
    syncAcrossPlatforms,
    subscribeToLayer,
    subscribeToSnapshot
  };
}

// ==============================================================================
// SPECIALIZED HOOKS FOR INDIVIDUAL LAYERS
// ==============================================================================

export function useEpisodicLayer(memberId?: string) {
  const { getLayer, updateLayer, subscribeToLayer, isLoading } = useSevenLayerArchitecture({ memberId });

  const [episodicData, setEpisodicData] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToLayer('episodic', (data) => {
      setEpisodicData(data as any);
    });

    return unsubscribe;
  }, [subscribeToLayer]);

  const addEpisode = useCallback(async (episode: any) => {
    await updateLayer('episodic', { newEpisode: episode });
  }, [updateLayer]);

  return {
    episodicData,
    isLoading,
    addEpisode,
    refreshEpisodic: () => getLayer('episodic')
  };
}

export function useProfileLayer(memberId?: string) {
  const { getLayer, updateLayer, subscribeToLayer, isLoading } = useSevenLayerArchitecture({ memberId });

  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToLayer('profile', (data) => {
      setProfileData(data as any);
    });

    return unsubscribe;
  }, [subscribeToLayer]);

  const updateProfile = useCallback(async (profileUpdate: any) => {
    await updateLayer('profile', profileUpdate);
  }, [updateLayer]);

  return {
    profileData,
    isLoading,
    updateProfile,
    refreshProfile: () => getLayer('profile')
  };
}

export function useConstellationLayer(memberId?: string) {
  const { getLayer, subscribeToLayer, isLoading } = useSevenLayerArchitecture({ memberId });

  const [constellationData, setConstellationData] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToLayer('constellation', (data) => {
      setConstellationData(data as any);
    });

    return unsubscribe;
  }, [subscribeToLayer]);

  return {
    constellationData,
    isLoading,
    refreshConstellation: () => getLayer('constellation')
  };
}

export function useFieldLayer(memberId?: string) {
  const { getLayer, subscribeToLayer, isLoading } = useSevenLayerArchitecture({ memberId });

  const [fieldData, setFieldData] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToLayer('field', (data) => {
      setFieldData(data as any);
    });

    return unsubscribe;
  }, [subscribeToLayer]);

  return {
    fieldData,
    isLoading,
    refreshField: () => getLayer('field')
  };
}

export function useWisdomLayer(memberId?: string) {
  const { getLayer, subscribeToLayer, isLoading } = useSevenLayerArchitecture({ memberId });

  const [wisdomData, setWisdomData] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToLayer('wisdom', (data) => {
      setWisdomData(data as any);
    });

    return unsubscribe;
  }, [subscribeToLayer]);

  return {
    wisdomData,
    isLoading,
    refreshWisdom: () => getLayer('wisdom')
  };
}

// ==============================================================================
// UTILITY HOOKS
// ==============================================================================

export function useArchitectureHealth(memberId?: string) {
  const { snapshot, isLoading } = useSevenLayerArchitecture({ memberId });

  return {
    architectureHealth: snapshot?.architectureHealth || null,
    isHealthy: snapshot?.architectureHealth ?
      snapshot.architectureHealth.layerIntegration > 0.7 : false,
    isLoading
  };
}

export function useCrossLayerPatterns(memberId?: string) {
  const { snapshot, isLoading } = useSevenLayerArchitecture({ memberId });

  return {
    crossLayerPatterns: snapshot?.crossLayerPatterns || [],
    patternCount: snapshot?.crossLayerPatterns?.length || 0,
    isLoading
  };
}

export function useFieldResonance(memberId?: string) {
  const { snapshot, isLoading } = useSevenLayerArchitecture({ memberId });

  return {
    fieldResonance: snapshot?.fieldResonance || null,
    resonanceLevel: snapshot?.fieldResonance?.individualFieldAlignment || 0,
    isLoading
  };
}

export function usePlatformSync(memberId?: string) {
  const { syncAcrossPlatforms, switchPlatform, activePlatform, isSyncing } =
    useSevenLayerArchitecture({ memberId });

  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const sync = useCallback(async () => {
    try {
      const result = await syncAcrossPlatforms();
      setLastSyncResult(result);
      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }, [syncAcrossPlatforms]);

  return {
    sync,
    switchPlatform,
    activePlatform,
    isSyncing,
    lastSyncResult
  };
}