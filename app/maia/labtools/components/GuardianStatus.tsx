'use client';

import { useState, useEffect } from 'react';
import { LabToolsService, GuardianState, GuardianAlert } from '../lib/LabToolsService';

interface GuardianStatusProps {
  service: LabToolsService;
}

export function GuardianStatus({ service }: GuardianStatusProps) {
  const [guardianState, setGuardianState] = useState<GuardianState | null>(null);

  useEffect(() => {
    const handleGuardianUpdate = (state: GuardianState) => setGuardianState(state);

    service.on('guardianUpdate', handleGuardianUpdate);

    return () => {
      service.off('guardianUpdate', handleGuardianUpdate);
    };
  }, [service]);

  const getOverallStatus = (state: GuardianState | null) => {
    if (!state) return 'unknown';

    const statuses = [state.field, state.psyche, state.soma, state.meaning];

    if (statuses.includes('emergency')) return 'emergency';
    if (statuses.includes('warning')) return 'warning';
    if (statuses.includes('caution')) return 'caution';
    return 'safe';
  };

  const overallStatus = getOverallStatus(guardianState);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        🛡️ Presence Guardian
        <StatusIndicator status={overallStatus} />
      </h2>

      {/* Four-Layer Status */}
      <div className="space-y-3 mb-4">
        <LayerStatus
          layer="Field"
          status={guardianState?.field || 'unknown'}
          icon="⚡"
          description="Energy presence"
        />
        <LayerStatus
          layer="Psyche"
          status={guardianState?.psyche || 'unknown'}
          icon="🌊"
          description="Soul patterns"
        />
        <LayerStatus
          layer="Soma"
          status={guardianState?.soma || 'unknown'}
          icon="🫀"
          description="Body wisdom"
        />
        <LayerStatus
          layer="Meaning"
          status={guardianState?.meaning || 'unknown'}
          icon="✨"
          description="Integration flow"
        />
      </div>

      {/* Window of Tolerance */}
      <div className="bg-black/30 rounded-lg p-3 mb-4">
        <h3 className="text-sm font-semibold text-purple-300 mb-2">Window of Tolerance</h3>
        <WindowOfToleranceDisplay state={guardianState?.window || 'optimal'} />
      </div>

      {/* Active Alerts */}
      {guardianState?.alerts && guardianState.alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-purple-300">Active Alerts</h3>
          {guardianState.alerts.map(alert => (
            <AlertDisplay key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {(!guardianState?.alerts || guardianState.alerts.length === 0) && (
        <div className="text-center py-4 text-gray-400 text-sm">
          ✅ All systems nominal
        </div>
      )}
    </div>
  );
}

interface LayerStatusProps {
  layer: string;
  status: 'safe' | 'caution' | 'warning' | 'emergency' | 'unknown';
  icon: string;
  description: string;
}

function LayerStatus({ layer, status, icon, description }: LayerStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'caution': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'warning': return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      case 'emergency': return 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return '✅';
      case 'caution': return '⚠️';
      case 'warning': return '🟠';
      case 'emergency': return '🚨';
      default: return '❓';
    }
  };

  return (
    <div className={`border rounded-lg p-3 ${getStatusColor(status)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <div>
            <div className="font-semibold">{layer}</div>
            <div className="text-xs opacity-75">{description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>{getStatusIcon(status)}</span>
          <span className="text-sm font-semibold capitalize">{status}</span>
        </div>
      </div>
    </div>
  );
}

interface WindowOfToleranceProps {
  state: 'optimal' | 'hyperarousal' | 'hypoarousal' | 'overwhelm';
}

function WindowOfToleranceDisplay({ state }: WindowOfToleranceProps) {
  const getStateColor = (state: string) => {
    switch (state) {
      case 'optimal': return 'bg-green-500';
      case 'hyperarousal': return 'bg-yellow-500';
      case 'hypoarousal': return 'bg-blue-500';
      case 'overwhelm': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStateDescription = (state: string) => {
    switch (state) {
      case 'optimal': return 'Sweet spot - everything flows naturally';
      case 'hyperarousal': return 'High energy - might benefit from grounding';
      case 'hypoarousal': return 'Low energy - gentle awakening could help';
      case 'overwhelm': return 'Beyond comfort - extra care needed';
      default: return 'State unclear';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold capitalize">{state}</span>
        <div className={`w-3 h-3 rounded-full ${getStateColor(state)}`}></div>
      </div>

      {/* Window visualization */}
      <div className="relative h-8 bg-gray-700 rounded-lg overflow-hidden">
        <div className="absolute inset-y-1 left-1/4 right-1/4 bg-green-500/30 rounded"></div>
        <div
          className={`absolute inset-y-0 w-1 ${getStateColor(state)} transition-all duration-500`}
          style={{
            left: state === 'hypoarousal' ? '10%' :
                  state === 'optimal' ? '45%' :
                  state === 'hyperarousal' ? '75%' :
                  '90%'
          }}
        ></div>

        {/* Labels */}
        <div className="absolute inset-x-0 -bottom-5 flex justify-between text-xs text-gray-400">
          <span>Low</span>
          <span>Optimal</span>
          <span>High</span>
          <span>Over</span>
        </div>
      </div>

      <div className="text-xs text-gray-300 mt-4">
        {getStateDescription(state)}
      </div>
    </div>
  );
}

interface AlertDisplayProps {
  alert: GuardianAlert;
}

function AlertDisplay({ alert }: AlertDisplayProps) {
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'critical': return 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  const getLayerEmoji = (layer: string) => {
    switch (layer) {
      case 'field': return '⚡';
      case 'psyche': return '🌊';
      case 'soma': return '🫀';
      case 'meaning': return '✨';
      default: return '❓';
    }
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className={`border rounded-lg p-3 ${getAlertColor(alert.type)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span>{getAlertIcon(alert.type)}</span>
          <span>{getLayerEmoji(alert.layer)}</span>
          <span className="text-sm font-semibold capitalize">{alert.layer}</span>
        </div>
        <span className="text-xs opacity-75">{timeAgo(alert.timestamp)}</span>
      </div>

      <div className="text-sm mb-2">{alert.message}</div>

      {alert.recommendations.length > 0 && (
        <div className="text-xs space-y-1">
          <div className="opacity-75">Recommendations:</div>
          {alert.recommendations.map((rec, index) => (
            <div key={index} className="opacity-90">• {rec}</div>
          ))}
        </div>
      )}
    </div>
  );
}

interface StatusIndicatorProps {
  status: 'safe' | 'caution' | 'warning' | 'emergency' | 'unknown';
}

function StatusIndicator({ status }: StatusIndicatorProps) {
  const getStatusProps = (status: string) => {
    switch (status) {
      case 'safe': return { color: 'bg-green-400', text: 'Flowing Well' };
      case 'caution': return { color: 'bg-yellow-400', text: 'Gentle Care' };
      case 'warning': return { color: 'bg-orange-400', text: 'Extra Support' };
      case 'emergency': return { color: 'bg-red-400 animate-pulse', text: 'Needs Care' };
      default: return { color: 'bg-gray-400', text: 'Sensing...' };
    }
  };

  const props = getStatusProps(status);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${props.color}`}></div>
      <span className="text-sm font-medium">{props.text}</span>
    </div>
  );
}