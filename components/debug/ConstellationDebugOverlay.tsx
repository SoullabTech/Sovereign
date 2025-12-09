/**
 * 🔍 CONSTELLATION DEBUG OVERLAY
 *
 * Developer and facilitator-only panel showing MAIA's inner
 * constellation intelligence for testing and calibration.
 *
 * Shows:
 * - Seven-layer memory activation
 * - Spiral detection confidence
 * - Cross-pattern significance
 * - Exposure mode effects
 * - Real-time constellation updates
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Eye,
  Brain,
  Layers,
  Zap,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';

interface ConstellationDebugData {
  sessionId: string;
  timestamp: string;
  memoryLayers: {
    profile: 'loaded' | 'missing' | 'error';
    sessionMemory: 'integrated' | 'partial' | 'none';
    personalTrajectory: 'active' | 'none' | 'loading';
    spiralConstellation: string;
    collectiveField: 'resonant' | 'disconnected';
    canonicalWisdom: 'accessed' | 'limited';
  };
  spiralDetection: {
    detectedDomain: string | null;
    confidence: number;
    shouldCreateSpiral: boolean;
    existingSpiral: string | null;
  };
  constellationState: {
    activeSpirals: number;
    harmonicCoherence: number;
    crossPatterns: number;
    constellationHealth: string;
    primarySpiral: string | null;
    exposureMode: string;
  };
  responseGeneration: {
    processingTime: number;
    awarenessLevel: string;
    exposureApplied: boolean;
    fieldInfluence: number;
  };
}

interface ConstellationDebugOverlayProps {
  isVisible: boolean;
  onToggle: () => void;
  sessionId?: string;
}

export function ConstellationDebugOverlay({
  isVisible,
  onToggle,
  sessionId
}: ConstellationDebugOverlayProps) {
  const [debugData, setDebugData] = useState<ConstellationDebugData | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [exposureOverride, setExposureOverride] = useState<string>('implicit_only');

  useEffect(() => {
    if (isLiveMode && sessionId) {
      const interval = setInterval(() => {
        fetchDebugData(sessionId);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLiveMode, sessionId]);

  const fetchDebugData = async (sid: string) => {
    try {
      const response = await fetch(`/api/consciousness/debug?sessionId=${sid}`);
      const data = await response.json();
      setDebugData(data.debugInfo);
    } catch (error) {
      console.error('Failed to fetch debug data:', error);
    }
  };

  const triggerConstellationRefresh = async () => {
    try {
      await fetch('/api/spirals/constellation', { method: 'POST' });
      if (sessionId) fetchDebugData(sessionId);
    } catch (error) {
      console.error('Failed to refresh constellation:', error);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-50"
        title="Show Constellation Debug"
      >
        <Brain className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed right-4 top-4 bottom-4 w-96 bg-gray-900 text-gray-100 rounded-lg shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span className="font-semibold">Constellation Debug</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`px-2 py-1 text-xs rounded ${
              isLiveMode ? 'bg-green-600' : 'bg-gray-600'
            }`}
          >
            {isLiveMode ? 'LIVE' : 'OFF'}
          </button>
          <button
            onClick={onToggle}
            className="text-gray-200 hover:text-white"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-4 overflow-y-auto h-full">
        {/* Session Info */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Session</h4>
          <div className="text-xs space-y-1">
            <div>ID: {sessionId || 'No active session'}</div>
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Memory Layers */}
        {debugData && (
          <>
            <MemoryLayersPanel layers={debugData.memoryLayers} />
            <SpiralDetectionPanel detection={debugData.spiralDetection} />
            <ConstellationStatePanel state={debugData.constellationState} />
            <ResponseGenerationPanel generation={debugData.responseGeneration} />
          </>
        )}

        {/* Controls */}
        <div className="mt-6 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Exposure Override
            </label>
            <select
              value={exposureOverride}
              onChange={(e) => setExposureOverride(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs"
            >
              <option value="implicit_only">Implicit Only</option>
              <option value="gentle_mirrors">Gentle Mirrors</option>
              <option value="full_constellation">Full Constellation</option>
            </select>
          </div>

          <button
            onClick={triggerConstellationRefresh}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm transition-colors"
          >
            Refresh Constellation
          </button>

          <button
            onClick={() => sessionId && fetchDebugData(sessionId)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
          >
            Update Debug Data
          </button>
        </div>
      </div>
    </div>
  );
}

// Memory Layers Status Panel
function MemoryLayersPanel({ layers }: { layers: ConstellationDebugData['memoryLayers'] }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loaded':
      case 'integrated':
      case 'active':
      case 'resonant':
      case 'accessed':
        return <CheckCircle className="h-3 w-3 text-green-400" />;
      case 'missing':
      case 'none':
      case 'disconnected':
        return <AlertTriangle className="h-3 w-3 text-red-400" />;
      default:
        return <Clock className="h-3 w-3 text-yellow-400" />;
    }
  };

  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
        <Layers className="h-4 w-4 mr-1" />
        Memory Layers
      </h4>
      <div className="space-y-1 text-xs">
        {Object.entries(layers).map(([layer, status]) => (
          <div key={layer} className="flex items-center justify-between">
            <span className="capitalize">{layer.replace(/([A-Z])/g, ' $1')}</span>
            <div className="flex items-center space-x-1">
              {getStatusIcon(status)}
              <span className="text-gray-400">{status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Spiral Detection Panel
function SpiralDetectionPanel({ detection }: { detection: ConstellationDebugData['spiralDetection'] }) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
        <Eye className="h-4 w-4 mr-1" />
        Spiral Detection
      </h4>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Domain</span>
          <span className="text-blue-300">{detection.detectedDomain || 'None'}</span>
        </div>
        <div className="flex justify-between">
          <span>Confidence</span>
          <span className="text-green-300">{Math.round(detection.confidence * 100)}%</span>
        </div>
        <div className="flex justify-between">
          <span>Should Create</span>
          <span className={detection.shouldCreateSpiral ? 'text-yellow-300' : 'text-gray-400'}>
            {detection.shouldCreateSpiral ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Existing</span>
          <span className="text-purple-300">{detection.existingSpiral || 'None'}</span>
        </div>
      </div>
    </div>
  );
}

// Constellation State Panel
function ConstellationStatePanel({ state }: { state: ConstellationDebugData['constellationState'] }) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
        <Zap className="h-4 w-4 mr-1" />
        Constellation State
      </h4>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Active Spirals</span>
          <span className="text-blue-300">{state.activeSpirals}</span>
        </div>
        <div className="flex justify-between">
          <span>Harmony</span>
          <span className="text-green-300">{state.harmonicCoherence}%</span>
        </div>
        <div className="flex justify-between">
          <span>Cross-Patterns</span>
          <span className="text-purple-300">{state.crossPatterns}</span>
        </div>
        <div className="flex justify-between">
          <span>Health</span>
          <span className="text-yellow-300 capitalize">{state.constellationHealth}</span>
        </div>
        <div className="flex justify-between">
          <span>Primary</span>
          <span className="text-indigo-300">{state.primarySpiral || 'None'}</span>
        </div>
        <div className="flex justify-between">
          <span>Exposure</span>
          <span className="text-orange-300">{state.exposureMode}</span>
        </div>
      </div>
    </div>
  );
}

// Response Generation Panel
function ResponseGenerationPanel({ generation }: { generation: ConstellationDebugData['responseGeneration'] }) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
        <BarChart3 className="h-4 w-4 mr-1" />
        Response Generation
      </h4>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Processing Time</span>
          <span className="text-blue-300">{generation.processingTime}ms</span>
        </div>
        <div className="flex justify-between">
          <span>Awareness Level</span>
          <span className="text-green-300">{generation.awarenessLevel}</span>
        </div>
        <div className="flex justify-between">
          <span>Exposure Applied</span>
          <span className={generation.exposureApplied ? 'text-yellow-300' : 'text-gray-400'}>
            {generation.exposureApplied ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Field Influence</span>
          <span className="text-purple-300">{Math.round(generation.fieldInfluence * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

export default ConstellationDebugOverlay;