/**
 * MAIA SYSTEM HEALTH HOOK
 *
 * React hook for monitoring system health status across all redundancy systems.
 * Integrates with SystemHealthMonitor to provide real-time status updates.
 */

import { useEffect, useState, useCallback } from 'react';
import { systemHealthMonitor, SystemHealth } from '@/lib/monitoring/system-health-monitor';

export interface SystemHealthStatus {
  currentHealth: SystemHealth | null;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  getHistory: () => SystemHealth[];
  lastUpdate: string;
}

export const useSystemHealth = (): SystemHealthStatus => {
  const [currentHealth, setCurrentHealth] = useState<SystemHealth | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('Never');

  // Listen for health broadcasts from SystemHealthMonitor
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      return;
    }

    const healthChannel = new BroadcastChannel('maia-health');

    const handleHealthUpdate = (event: MessageEvent) => {
      if (event.data.type === 'HEALTH_UPDATE') {
        setCurrentHealth(event.data.health);
        setLastUpdate(new Date().toLocaleTimeString());
        console.log('🔍 Health update received:', event.data.health.overall);
      }
    };

    healthChannel.addEventListener('message', handleHealthUpdate);

    // Check for existing health data in localStorage
    try {
      const lastHealthData = localStorage.getItem('maia-last-health');
      if (lastHealthData) {
        const health = JSON.parse(lastHealthData);
        setCurrentHealth(health);
        setLastUpdate('From cache');
      }
    } catch (error) {
      console.warn('Failed to load cached health data:', error);
    }

    return () => {
      healthChannel.removeEventListener('message', handleHealthUpdate);
      healthChannel.close();
    };
  }, []);

  const startMonitoring = useCallback(() => {
    if (!isMonitoring) {
      systemHealthMonitor.startMonitoring();
      setIsMonitoring(true);
      console.log('🔍 System health monitoring started via hook');
    }
  }, [isMonitoring]);

  const stopMonitoring = useCallback(() => {
    if (isMonitoring) {
      systemHealthMonitor.stopMonitoring();
      setIsMonitoring(false);
      console.log('🔍 System health monitoring stopped via hook');
    }
  }, [isMonitoring]);

  const getHistory = useCallback(() => {
    return systemHealthMonitor.getHealthHistory();
  }, []);

  // Auto-start monitoring in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      setTimeout(() => {
        startMonitoring();
      }, 2000); // Delay to allow app initialization
    }
  }, [startMonitoring]);

  return {
    currentHealth,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getHistory,
    lastUpdate
  };
};

/**
 * Health Status Badge Colors
 */
export const getHealthStatusColor = (status: SystemHealth['overall']): string => {
  switch (status) {
    case 'healthy':
      return 'text-green-500 bg-green-50 border-green-200';
    case 'degraded':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-500 bg-gray-50 border-gray-200';
  }
};

/**
 * Health Status Icon
 */
export const getHealthStatusIcon = (status: SystemHealth['overall']): string => {
  switch (status) {
    case 'healthy':
      return '✅';
    case 'degraded':
      return '⚠️';
    case 'critical':
      return '🚨';
    default:
      return '❓';
  }
};