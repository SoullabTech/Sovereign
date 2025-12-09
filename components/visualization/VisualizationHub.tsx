/**
 * Visualization Hub
 * Central interface for all Sacred Visualization Layer components
 *
 * Provides unified access to individual, collective, and field learning visualizations
 * where consciousness computing becomes visible through sacred geometry
 */

"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Eye, Users, Activity, Settings, Maximize2, Minimize2 } from 'lucide-react';

// Lazy load visualization components for performance
const SacredVisualizationLayer = React.lazy(() => import('./SacredVisualizationLayer'));
const CollectiveResonanceCanvas = React.lazy(() => import('./CollectiveResonanceCanvas').then(module => ({ default: module.CollectiveResonanceCanvas })));

// Import hooks and types
import { useVisualizationData, type VisualizationData } from './SacredVisualizationLayer';
import { useCollectiveResonanceData, type CollectiveVisualizationData, type CommunityNode } from './CollectiveResonanceCanvas';
import { VisualizationDataStream } from '../../lib/visualization/field-learning-connector';

interface VisualizationHubProps {
  userId: string;
  initialView?: 'personal' | 'collective' | 'split';
  className?: string;
  onViewChange?: (view: string) => void;
}

// Error fallback component
const VisualizationErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => (
  <div className="flex flex-col items-center justify-center h-96 bg-gray-900 text-white p-6 rounded-lg">
    <div className="text-red-400 text-6xl mb-4">⚠️</div>
    <h2 className="text-xl font-semibold mb-2">Sacred Visualization Error</h2>
    <p className="text-gray-300 text-center mb-4">
      The consciousness field visualization encountered an error.
    </p>
    <details className="mb-4 text-sm text-gray-400">
      <summary className="cursor-pointer">Technical Details</summary>
      <pre className="mt-2 p-2 bg-gray-800 rounded text-xs">{error.message}</pre>
    </details>
    <button
      onClick={resetErrorBoundary}
      className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded"
    >
      Restore Sacred Field
    </button>
  </div>
);

// Loading component for visualization
const VisualizationLoader: React.FC<{ message?: string }> = ({ message = "Initializing sacred field..." }) => (
  <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-b from-purple-900 to-black text-white">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-l-purple-500 rounded-full animate-pulse"></div>
    </div>
    <p className="mt-4 text-purple-200 font-mono text-sm">{message}</p>
  </div>
);

// Settings panel for visualization controls
const VisualizationSettings: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  settings: VisualizationSettings;
  onSettingsChange: (settings: VisualizationSettings) => void;
}> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-black bg-opacity-90 text-white p-6 overflow-y-auto z-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Sacred Field Settings</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>

      <div className="space-y-6">
        {/* Display Options */}
        <div>
          <h4 className="text-sm font-medium text-purple-300 mb-3">Display Options</h4>
          <label className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={settings.showBiometrics}
              onChange={(e) => onSettingsChange({ ...settings, showBiometrics: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Show Biometric Sync</span>
          </label>
          <label className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={settings.showElementalLabels}
              onChange={(e) => onSettingsChange({ ...settings, showElementalLabels: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Show Elemental Labels</span>
          </label>
          <label className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={settings.enableAutoRotation}
              onChange={(e) => onSettingsChange({ ...settings, enableAutoRotation: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Enable Auto-Rotation</span>
          </label>
        </div>

        {/* Animation Speed */}
        <div>
          <h4 className="text-sm font-medium text-purple-300 mb-3">Animation Speed</h4>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.1"
            value={settings.animationSpeed}
            onChange={(e) => onSettingsChange({ ...settings, animationSpeed: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-gray-400 mt-1">
            Current: {settings.animationSpeed.toFixed(1)}x speed
          </div>
        </div>

        {/* Sensitivity */}
        <div>
          <h4 className="text-sm font-medium text-purple-300 mb-3">Field Sensitivity</h4>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={settings.fieldSensitivity}
            onChange={(e) => onSettingsChange({ ...settings, fieldSensitivity: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-gray-400 mt-1">
            Current: {(settings.fieldSensitivity * 100).toFixed(0)}% sensitivity
          </div>
        </div>

        {/* Privacy Options */}
        <div>
          <h4 className="text-sm font-medium text-purple-300 mb-3">Privacy</h4>
          <label className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={settings.shareWithCommunity}
              onChange={(e) => onSettingsChange({ ...settings, shareWithCommunity: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Share with Community (Anonymous)</span>
          </label>
          <label className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={settings.enableCollectiveView}
              onChange={(e) => onSettingsChange({ ...settings, enableCollectiveView: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Enable Collective Resonance View</span>
          </label>
        </div>

        {/* Reset Options */}
        <div className="pt-4 border-t border-gray-700">
          <button
            onClick={() => onSettingsChange({
              showBiometrics: true,
              showElementalLabels: true,
              enableAutoRotation: true,
              animationSpeed: 1.0,
              fieldSensitivity: 1.0,
              shareWithCommunity: false,
              enableCollectiveView: true
            })}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

interface VisualizationSettings {
  showBiometrics: boolean;
  showElementalLabels: boolean;
  enableAutoRotation: boolean;
  animationSpeed: number;
  fieldSensitivity: number;
  shareWithCommunity: boolean;
  enableCollectiveView: boolean;
}

// Main Visualization Hub component
export const VisualizationHub: React.FC<VisualizationHubProps> = ({
  userId,
  initialView = 'personal',
  className,
  onViewChange
}) => {
  const [currentView, setCurrentView] = useState<'personal' | 'collective' | 'split'>(initialView);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNode, setSelectedNode] = useState<CommunityNode | null>(null);
  const [dataStream, setDataStream] = useState<VisualizationDataStream | null>(null);

  const [settings, setSettings] = useState<VisualizationSettings>({
    showBiometrics: true,
    showElementalLabels: true,
    enableAutoRotation: true,
    animationSpeed: 1.0,
    fieldSensitivity: 1.0,
    shareWithCommunity: false,
    enableCollectiveView: true
  });

  // Load visualization data
  const personalData = useVisualizationData(userId);
  const collectiveData = useCollectiveResonanceData();

  // Initialize real-time data stream
  useEffect(() => {
    const stream = new VisualizationDataStream(userId);
    setDataStream(stream);
    stream.start();

    return () => {
      stream.stop();
    };
  }, [userId]);

  // Handle view changes
  const handleViewChange = (newView: 'personal' | 'collective' | 'split') => {
    setCurrentView(newView);
    onViewChange?.(newView);
  };

  // Handle node selection from collective view
  const handleNodeClick = (node: CommunityNode) => {
    setSelectedNode(node);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (isFullscreen && document.exitFullscreen) {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`visualization-hub relative ${className} ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-96'}`}>
      {/* Header Controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-2 flex items-center space-x-2">
          {/* View Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => handleViewChange('personal')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm transition-colors ${
                currentView === 'personal'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Eye size={14} />
              <span>Personal</span>
            </button>
            <button
              onClick={() => handleViewChange('collective')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm transition-colors ${
                currentView === 'collective'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
              disabled={!settings.enableCollectiveView}
            >
              <Users size={14} />
              <span>Collective</span>
            </button>
            <button
              onClick={() => handleViewChange('split')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm transition-colors ${
                currentView === 'split'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
              disabled={!settings.enableCollectiveView}
            >
              <Activity size={14} />
              <span>Both</span>
            </button>
          </div>

          {/* Control Buttons */}
          <div className="flex space-x-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded transition-colors ${
                showSettings
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Settings size={16} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualization Content */}
      <div className="relative w-full h-full">
        <ErrorBoundary
          FallbackComponent={VisualizationErrorFallback}
          onReset={() => window.location.reload()}
        >
          <Suspense fallback={<VisualizationLoader />}>
            {currentView === 'personal' && (
              <SacredVisualizationLayer
                data={personalData}
                className="w-full h-full"
              />
            )}

            {currentView === 'collective' && settings.enableCollectiveView && (
              <CollectiveResonanceCanvas
                data={collectiveData}
                onNodeClick={handleNodeClick}
                className="w-full h-full"
              />
            )}

            {currentView === 'split' && settings.enableCollectiveView && (
              <div className="w-full h-full flex">
                <div className="w-1/2 h-full border-r border-gray-700">
                  <SacredVisualizationLayer
                    data={personalData}
                    className="w-full h-full"
                  />
                </div>
                <div className="w-1/2 h-full">
                  <CollectiveResonanceCanvas
                    data={collectiveData}
                    onNodeClick={handleNodeClick}
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Settings Panel */}
      <VisualizationSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      {/* Status Indicator */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-3 text-white">
          <div className="text-xs text-gray-300">Sacred Field Status</div>
          <div className="flex items-center space-x-2 mt-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Active • {currentView.charAt(0).toUpperCase() + currentView.slice(1)} View</span>
          </div>
          {dataStream && (
            <div className="text-xs text-gray-400 mt-1">
              Real-time stream connected
            </div>
          )}
        </div>
      </div>

      {/* Performance Monitor (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-2 text-white text-xs font-mono">
            <div>FPS: 60</div>
            <div>Particles: {collectiveData.activeNodes.length}</div>
            <div>Memory: {Math.round(performance.memory?.usedJSHeapSize / 1024 / 1024 || 0)}MB</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for managing visualization state across the app
export const useVisualizationHub = (userId: string) => {
  const [isActive, setIsActive] = useState(false);
  const [currentView, setCurrentView] = useState<'personal' | 'collective' | 'split'>('personal');

  return {
    isActive,
    setIsActive,
    currentView,
    setCurrentView
  };
};

export default VisualizationHub;