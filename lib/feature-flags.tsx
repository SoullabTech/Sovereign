"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';

// Feature flag configuration
export interface FeatureFlags {
  // UI Enhancement Flags
  enhanced_ui_v2: boolean;
  uizard_components: boolean;
  new_layout_system: boolean;
  enhanced_animations: boolean;
  
  // Component-specific flags
  uizard_buttons: boolean;
  uizard_cards: boolean;
  uizard_dashboard: boolean;
  uizard_settings: boolean;
  uizard_journal: boolean;
  
  // Experimental flags
  experimental_features: boolean;
  beta_enhancements: boolean;
  
  // Rollback flags
  rollback_all_uizard: boolean;
  emergency_rollback: boolean;
}

// Default feature flag values
const defaultFlags: FeatureFlags = {
  // Start with conservative defaults
  enhanced_ui_v2: false,
  uizard_components: false,
  new_layout_system: false,
  enhanced_animations: false,
  
  // Component flags - start disabled
  uizard_buttons: false,
  uizard_cards: false,
  uizard_dashboard: false,
  uizard_settings: false,
  uizard_journal: false,
  
  // Experimental - disabled by default
  experimental_features: false,
  beta_enhancements: false,
  
  // Emergency controls
  rollback_all_uizard: false,
  emergency_rollback: false,
};

// Environment-based overrides
const getEnvironmentFlags = (): Partial<FeatureFlags> => {
  if (typeof window === 'undefined') return {};
  
  const flags: Partial<FeatureFlags> = {};
  
  // Development environment
  if (process.env.NODE_ENV === 'development') {
    flags.enhanced_ui_v2 = process.env.NEXT_PUBLIC_ENABLE_ENHANCED_UI === 'true';
    flags.experimental_features = process.env.NEXT_PUBLIC_ENABLE_EXPERIMENTS === 'true';
  }
  
  // Production safeguards
  if (process.env.NODE_ENV === 'production') {
    // Only enable stable features in production
    flags.uizard_components = process.env.NEXT_PUBLIC_ENABLE_UIZARD === 'true';
    flags.emergency_rollback = process.env.NEXT_PUBLIC_EMERGENCY_ROLLBACK === 'true';
  }
  
  return flags;
};

// Local storage key for user preferences
const FEATURE_FLAGS_STORAGE_KEY = 'spiralogic-feature-flags';

// Feature flag context
const FeatureFlagContext = createContext<{
  flags: FeatureFlags;
  updateFlag: (key: keyof FeatureFlags, value: boolean) => void;
  resetFlags: () => void;
}>({
  flags: defaultFlags,
  updateFlag: () => {},
  resetFlags: () => {},
});

// Feature flag provider component
export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    // Load flags from localStorage and environment
    try {
      const savedFlags = localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
      const userFlags = savedFlags ? JSON.parse(savedFlags) : {};
      const envFlags = getEnvironmentFlags();
      
      // Merge: defaults < saved < environment
      const mergedFlags = { ...defaultFlags, ...userFlags, ...envFlags };
      
      // Apply emergency rollback if needed
      if (mergedFlags.emergency_rollback || mergedFlags.rollback_all_uizard) {
        Object.keys(mergedFlags).forEach(key => {
          if (key.startsWith('uizard_') || key.includes('enhanced')) {
            mergedFlags[key as keyof FeatureFlags] = false;
          }
        });
      }
      
      setFlags(mergedFlags);
    } catch (error) {
      console.warn('Failed to load feature flags:', error);
      setFlags({ ...defaultFlags, ...getEnvironmentFlags() });
    }
  }, []);
  
  const updateFlag = (key: keyof FeatureFlags, value: boolean) => {
    const newFlags = { ...flags, [key]: value };
    setFlags(newFlags);
    
    // Only save to localStorage in browser environment
    if (typeof window !== 'undefined') {
      try {
        // Save user preferences (not environment overrides)
        const userFlags = { ...newFlags };
        Object.keys(getEnvironmentFlags()).forEach(envKey => {
          delete userFlags[envKey as keyof FeatureFlags];
        });
        localStorage.setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(userFlags));
      } catch (error) {
        console.warn('Failed to save feature flags:', error);
      }
    }
  };
  
  const resetFlags = () => {
    const envFlags = getEnvironmentFlags();
    const resetFlags = { ...defaultFlags, ...envFlags };
    setFlags(resetFlags);
    
    // Only remove from localStorage in browser environment
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FEATURE_FLAGS_STORAGE_KEY);
    }
  };
  
  return (
    <FeatureFlagContext.Provider value={{ flags, updateFlag, resetFlags }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

// Hook for using feature flags
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const { flags } = useContext(FeatureFlagContext);
  return flags[flag];
}

// Hook for managing feature flags (admin/development)
export function useFeatureFlags() {
  return useContext(FeatureFlagContext);
}

// Convenience hooks for specific features
export function useUizardComponents() {
  return useFeatureFlag('uizard_components');
}

export function useEnhancedUI() {
  return useFeatureFlag('enhanced_ui_v2');
}

export function useExperimentalFeatures() {
  return useFeatureFlag('experimental_features');
}

// Component wrapper for feature-gated components
export function FeatureGate({ 
  flag, 
  children, 
  fallback = null 
}: { 
  flag: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isEnabled = useFeatureFlag(flag);
  return isEnabled ? <>{children}</> : <>{fallback}</>;
}

// Development helper component
export function FeatureFlagDebugPanel() {
  const { flags, updateFlag, resetFlags } = useFeatureFlags();
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <h3 className="text-sm font-semibold mb-2">🚩 Feature Flags</h3>
      <div className="space-y-1 text-xs">
        {Object.entries(flags).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <label className="cursor-pointer">{key}:</label>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => updateFlag(key as keyof FeatureFlags, e.target.checked)}
              className="ml-2"
            />
          </div>
        ))}
      </div>
      <button 
        onClick={resetFlags}
        className="mt-2 text-xs bg-red-600 px-2 py-1 rounded"
      >
        Reset All
      </button>
    </div>
  );
}

export default FeatureFlagProvider;