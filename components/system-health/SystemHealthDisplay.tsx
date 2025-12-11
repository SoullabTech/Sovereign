/**
 * MAIA SYSTEM HEALTH DISPLAY
 *
 * Visual component for displaying system health status across all redundancy systems.
 * Shows real-time health monitoring with color-coded status indicators.
 */

'use client';

import React, { useState } from 'react';
import { useSystemHealth, getHealthStatusColor, getHealthStatusIcon } from '@/hooks/useSystemHealth';

interface SystemHealthDisplayProps {
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const SystemHealthDisplay: React.FC<SystemHealthDisplayProps> = ({
  compact = false,
  showDetails = false,
  className = ''
}) => {
  const { currentHealth, isMonitoring, startMonitoring, stopMonitoring, lastUpdate } = useSystemHealth();
  const [showFullDetails, setShowFullDetails] = useState(showDetails);

  if (!currentHealth) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-gray-500">🔍</span>
        <span className="text-sm text-gray-600">Health monitoring initializing...</span>
        {!isMonitoring && (
          <button
            onClick={startMonitoring}
            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
          >
            Start
          </button>
        )}
      </div>
    );
  }

  const healthIcon = getHealthStatusIcon(currentHealth.overall);
  const healthColor = getHealthStatusColor(currentHealth.overall);

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`} title={`System Status: ${currentHealth.overall} (Updated: ${lastUpdate})`}>
        <span className="text-lg">{healthIcon}</span>
        <span className={`text-sm px-2 py-1 rounded border ${healthColor}`}>
          {currentHealth.overall.toUpperCase()}
        </span>
      </div>
    );
  }

  const healthyEndpoints = currentHealth.endpoints.filter(e => e.status === 'online').length;
  const totalEndpoints = currentHealth.endpoints.length;

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{healthIcon}</span>
          <div>
            <h3 className="font-semibold text-gray-900">System Health</h3>
            <p className="text-sm text-gray-600">Last updated: {lastUpdate}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${healthColor}`}>
            {currentHealth.overall.toUpperCase()}
          </span>
          <button
            onClick={() => setShowFullDetails(!showFullDetails)}
            className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
          >
            {showFullDetails ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>

      {/* Quick Status Overview */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Endpoints */}
          <div className="text-center">
            <div className="text-2xl mb-1">
              {healthyEndpoints === totalEndpoints ? '✅' : healthyEndpoints > 0 ? '⚠️' : '🚨'}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {healthyEndpoints}/{totalEndpoints}
            </div>
            <div className="text-xs text-gray-600">Endpoints</div>
          </div>

          {/* Service Worker */}
          <div className="text-center">
            <div className="text-2xl mb-1">
              {currentHealth.serviceWorker.active ? '✅' : '🚨'}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {currentHealth.serviceWorker.active ? 'Active' : 'Offline'}
            </div>
            <div className="text-xs text-gray-600">Service Worker</div>
          </div>

          {/* WebSocket */}
          <div className="text-center">
            <div className="text-2xl mb-1">
              {currentHealth.webSocket.connected ? '✅' : '🚨'}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {currentHealth.webSocket.connectionQuality}
            </div>
            <div className="text-xs text-gray-600">WebSocket</div>
          </div>

          {/* Storage */}
          <div className="text-center">
            <div className="text-2xl mb-1">
              {currentHealth.storage.dataIntegrity > 0.9 ? '✅' : currentHealth.storage.dataIntegrity > 0.5 ? '⚠️' : '🚨'}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {Math.round(currentHealth.storage.dataIntegrity * 100)}%
            </div>
            <div className="text-xs text-gray-600">Data Integrity</div>
          </div>
        </div>
      </div>

      {/* Detailed Status */}
      {showFullDetails && (
        <div className="border-t bg-gray-50">
          <div className="p-4 space-y-4">
            {/* API Endpoints */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">API Endpoints</h4>
              <div className="space-y-2">
                {currentHealth.endpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{endpoint.url}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        endpoint.status === 'online' ? 'bg-green-100 text-green-800' :
                        endpoint.status === 'slow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {endpoint.status}
                      </span>
                      <span className="text-gray-500">{endpoint.responseTime}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Worker Details */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Service Worker</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Cache Size:</span>
                  <span>{currentHealth.serviceWorker.cacheSize} items</span>
                </div>
                <div className="flex justify-between">
                  <span>Offline Ready:</span>
                  <span className={currentHealth.serviceWorker.offlineResponsesReady ? 'text-green-600' : 'text-red-600'}>
                    {currentHealth.serviceWorker.offlineResponsesReady ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Storage Systems */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Storage Systems</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Local Storage:</span>
                  <span className={currentHealth.storage.localStorage ? 'text-green-600' : 'text-red-600'}>
                    {currentHealth.storage.localStorage ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Encrypted Backup:</span>
                  <span className={currentHealth.storage.encryptedBackup ? 'text-green-600' : 'text-red-600'}>
                    {currentHealth.storage.encryptedBackup ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cloud Sync:</span>
                  <span className={currentHealth.storage.cloudSync ? 'text-green-600' : 'text-red-600'}>
                    {currentHealth.storage.cloudSync ? 'Synced' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monitoring Controls */}
      <div className="border-t p-4 flex items-center justify-between bg-gray-50">
        <div className="text-sm text-gray-600">
          Monitoring: {isMonitoring ?
            <span className="text-green-600 font-medium">Active</span> :
            <span className="text-red-600 font-medium">Inactive</span>
          }
        </div>
        <div className="flex space-x-2">
          {!isMonitoring ? (
            <button
              onClick={startMonitoring}
              className="text-sm px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
            >
              Start Monitoring
            </button>
          ) : (
            <button
              onClick={stopMonitoring}
              className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
            >
              Stop Monitoring
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemHealthDisplay;