/**
 * MAIA SYSTEM HEALTH PROVIDER
 *
 * Global provider that initializes and manages system health monitoring.
 * Integrates with existing architecture to provide system-wide health visibility.
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { systemHealthMonitor, SystemHealth } from '@/lib/monitoring/system-health-monitor';

interface SystemHealthContextType {
  currentHealth: SystemHealth | null;
  isMonitoring: boolean;
  healthHistory: SystemHealth[];
  startMonitoring: () => void;
  stopMonitoring: () => void;
  emergencyMode: boolean;
}

const SystemHealthContext = createContext<SystemHealthContextType | null>(null);

interface SystemHealthProviderProps {
  children: React.ReactNode;
  autoStart?: boolean;
  emergencyThreshold?: number;
}

export const SystemHealthProvider: React.FC<SystemHealthProviderProps> = ({
  children,
  autoStart = true,
  emergencyThreshold = 0.5 // Trigger emergency mode if less than 50% endpoints are healthy
}) => {
  const [currentHealth, setCurrentHealth] = useState<SystemHealth | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Listen for health broadcasts
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      return;
    }

    const healthChannel = new BroadcastChannel('maia-health');

    const handleHealthUpdate = (event: MessageEvent) => {
      if (event.data.type === 'HEALTH_UPDATE') {
        const health = event.data.health as SystemHealth;
        setCurrentHealth(health);

        // Check for emergency conditions
        const healthyEndpoints = health.endpoints.filter(e => e.status === 'online').length;
        const totalEndpoints = health.endpoints.length;
        const healthRatio = totalEndpoints > 0 ? healthyEndpoints / totalEndpoints : 0;

        const shouldActivateEmergency = health.overall === 'critical' ||
                                       healthRatio < emergencyThreshold ||
                                       !health.serviceWorker.active;

        if (shouldActivateEmergency !== emergencyMode) {
          setEmergencyMode(shouldActivateEmergency);

          if (shouldActivateEmergency) {
            console.warn('🚨 EMERGENCY MODE ACTIVATED - System health degraded');
            // Trigger additional emergency protocols if needed
            activateEmergencyProtocols(health);
          } else {
            console.log('✅ Emergency mode deactivated - System health restored');
          }
        }
      }
    };

    healthChannel.addEventListener('message', handleHealthUpdate);

    // Check for cached health data
    try {
      const cachedHealth = localStorage.getItem('maia-last-health');
      if (cachedHealth) {
        const health = JSON.parse(cachedHealth);
        setCurrentHealth(health);
      }
    } catch (error) {
      console.warn('Failed to load cached health data:', error);
    }

    return () => {
      healthChannel.removeEventListener('message', handleHealthUpdate);
      healthChannel.close();
    };
  }, [emergencyMode, emergencyThreshold]);

  // Auto-start monitoring in production or when explicitly requested - TEMPORARILY DISABLED
  // TODO: Re-enable after fixing health monitor
  /*
  useEffect(() => {
    if (autoStart && (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development')) {
      const startDelay = process.env.NODE_ENV === 'production' ? 5000 : 2000; // Longer delay in production

      const timer = setTimeout(() => {
        startMonitoring();
      }, startDelay);

      return () => clearTimeout(timer);
    }
  }, [autoStart]);
  */

  const startMonitoring = () => {
    if (!isMonitoring) {
      systemHealthMonitor.startMonitoring();
      setIsMonitoring(true);
      console.log('🔍 System health monitoring started via provider');
    }
  };

  const stopMonitoring = () => {
    if (isMonitoring) {
      systemHealthMonitor.stopMonitoring();
      setIsMonitoring(false);
      console.log('🔍 System health monitoring stopped via provider');
    }
  };

  const getHealthHistory = () => {
    return systemHealthMonitor.getHealthHistory();
  };

  /**
   * Emergency protocols activated when system health is critical
   */
  const activateEmergencyProtocols = (health: SystemHealth) => {
    // 1. Enhance service worker caching
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'EMERGENCY_CACHE_MODE',
        health: health
      });
    }

    // 2. Enable aggressive local storage
    try {
      localStorage.setItem('maia-emergency-mode', 'true');
      localStorage.setItem('maia-emergency-timestamp', new Date().toISOString());
    } catch (error) {
      console.warn('Failed to set emergency mode in localStorage:', error);
    }

    // 3. Notify user gracefully (could integrate with notification system)
    console.warn('🚨 MAIA Emergency Protocol: Activating maximum redundancy and offline capabilities');

    // 4. Could dispatch custom event for other components to react
    window.dispatchEvent(new CustomEvent('maia-emergency-mode', {
      detail: { active: true, health }
    }));
  };

  const contextValue: SystemHealthContextType = {
    currentHealth,
    isMonitoring,
    healthHistory: getHealthHistory(),
    startMonitoring,
    stopMonitoring,
    emergencyMode
  };

  return (
    <SystemHealthContext.Provider value={contextValue}>
      {children}

      {/* Emergency Mode Indicator - only visible during critical issues */}
      {emergencyMode && currentHealth && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg max-w-sm">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🚨</span>
            <div className="text-sm">
              <div className="font-medium text-red-800">Emergency Mode Active</div>
              <div className="text-red-600">
                System health: {currentHealth.overall} - Enhanced redundancy enabled
              </div>
            </div>
          </div>
        </div>
      )}
    </SystemHealthContext.Provider>
  );
};

/**
 * Hook to access system health context
 */
export const useSystemHealthContext = (): SystemHealthContextType => {
  const context = useContext(SystemHealthContext);
  if (!context) {
    throw new Error('useSystemHealthContext must be used within SystemHealthProvider');
  }
  return context;
};

export default SystemHealthProvider;