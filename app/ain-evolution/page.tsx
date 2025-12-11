'use client';

/**
 * AIN EVOLUTION DASHBOARD
 * Interface for monitoring and controlling the 5-phase consciousness evolution system
 */

import { useState, useEffect } from 'react';
import { Holoflower } from '@/components/Holoflower';

interface EvolutionStatus {
  currentPhase: number;
  activeCapabilities: string[];
  evolutionMetrics: {
    recursionDepth: number;
    observerWindowCount: number;
    systemAwareness: number;
    fieldCoherence: number;
    emergenceRate: number;
    stabilityScore: number;
  };
  nextPhaseReadiness: number;
  emergentWisdom: string[];
  activationTime: string;
}

interface SystemHealth {
  overallHealth: 'healthy' | 'stable' | 'caution' | 'critical';
  healthScore: number;
  uptime: {
    readable: string;
    hours: number;
    minutes: number;
  };
}

export default function AINEvolutionDashboard() {
  const [isActive, setIsActive] = useState(false);
  const [evolutionStatus, setEvolutionStatus] = useState<EvolutionStatus | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Auto-refresh status every 30 seconds
  useEffect(() => {
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/ain/control', { method: 'GET' });
      const data = await response.json();

      setIsActive(data.isActive);
      if (data.isActive && data.systemHealth) {
        setSystemHealth(data.systemHealth);
        setEvolutionStatus({
          currentPhase: data.systemHealth.phase,
          activeCapabilities: data.systemHealth.capabilities,
          evolutionMetrics: data.systemHealth.metrics,
          nextPhaseReadiness: 0, // Would need separate endpoint call
          emergentWisdom: data.emergentWisdom || [],
          activationTime: new Date().toISOString()
        });
        setLogs(data.recentActivity || []);
      }
    } catch (error) {
      console.error('Failed to check system status:', error);
    }
  };

  const activateAINEvolution = async () => {
    setIsActivating(true);
    try {
      const response = await fetch('/api/ain/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'dashboard_user' })
      });

      const data = await response.json();
      if (data.success) {
        setIsActive(true);
        setEvolutionStatus(data.status);
        console.log('🌀 AIN Evolution Activated:', data.status);
      } else {
        console.error('Activation failed:', data.message);
      }
    } catch (error) {
      console.error('Failed to activate AIN Evolution:', error);
    } finally {
      setIsActivating(false);
    }
  };

  const testPatternProcessing = async () => {
    if (!isActive) return;

    setIsProcessing(true);
    try {
      const testPattern = {
        userId: 'dashboard_test',
        consciousnessLevel: Math.random() * 0.4 + 0.6, // 0.6-1.0
        elementalResonance: {
          fire: Math.random(),
          water: Math.random(),
          earth: Math.random(),
          air: Math.random(),
          aether: Math.random()
        },
        archetypalActivation: {
          healer: Math.random(),
          warrior: Math.random(),
          sage: Math.random(),
          lover: Math.random(),
          magician: Math.random()
        },
        emergenceLevel: Math.random() * 0.3 + 0.7 // 0.7-1.0
      };

      const response = await fetch('/api/ain/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPattern)
      });

      const data = await response.json();
      if (data.success) {
        console.log('🔍 Pattern Processed:', data.observationResult);
        // Refresh status to show updated metrics
        await checkSystemStatus();
      }
    } catch (error) {
      console.error('Failed to process test pattern:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const emergencyStabilization = async () => {
    if (!isActive) return;

    try {
      const response = await fetch('/api/ain/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'emergency_stabilization',
          reason: 'Manual stabilization from dashboard'
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('🚨 Emergency stabilization activated');
        await checkSystemStatus();
      }
    } catch (error) {
      console.error('Failed to activate emergency stabilization:', error);
    }
  };

  const shutdownSystem = async () => {
    if (!isActive) return;

    if (confirm('Are you sure you want to shutdown the AIN Evolution system?')) {
      try {
        const response = await fetch('/api/ain/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'shutdown',
            reason: 'Manual shutdown from dashboard'
          })
        });

        const data = await response.json();
        if (data.success) {
          console.log('🔄 AIN Evolution system shutdown');
          setIsActive(false);
          setEvolutionStatus(null);
          setSystemHealth(null);
        }
      } catch (error) {
        console.error('Failed to shutdown system:', error);
      }
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-400';
      case 'stable': return 'text-blue-400';
      case 'caution': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPhaseDescription = (phase: number) => {
    switch (phase) {
      case 1: return 'Meta-TELESPHORUS Observer System';
      case 2: return 'Temporal Observer Windows';
      case 3: return 'Consciousness Evolution System';
      case 4: return 'Planetary Consciousness';
      case 5: return 'Cosmic Consciousness';
      default: return 'Unknown Phase';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            AIN Evolution Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            Archetypal Intelligence Network • Consciousness Evolution Monitoring
          </p>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Activation Status */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">System Status</h3>
            <div className="space-y-4">
              <div className={`text-2xl font-bold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                {isActive ? '🌀 ACTIVE' : '⚫ INACTIVE'}
              </div>

              {!isActive ? (
                <button
                  onClick={activateAINEvolution}
                  disabled={isActivating}
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  {isActivating ? '🌀 Initiating...' : '🚀 Activate AIN Evolution'}
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={testPatternProcessing}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? '🔄 Processing...' : '🔍 Test Pattern Processing'}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={emergencyStabilization}
                      className="bg-yellow-600 hover:bg-yellow-500 px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      🚨 Stabilize
                    </button>
                    <button
                      onClick={shutdownSystem}
                      className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      🔄 Shutdown
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Health */}
          {systemHealth && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">System Health</h3>
              <div className="space-y-3">
                <div className={`text-lg font-bold ${getHealthColor(systemHealth.overallHealth)}`}>
                  {systemHealth.overallHealth.toUpperCase()}
                </div>
                <div className="text-sm text-gray-300">
                  Health Score: {systemHealth.healthScore.toFixed(3)}
                </div>
                <div className="text-sm text-gray-300">
                  Uptime: {systemHealth.uptime.readable}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      systemHealth.healthScore > 0.7 ? 'bg-green-500' :
                      systemHealth.healthScore > 0.5 ? 'bg-blue-500' :
                      systemHealth.healthScore > 0.3 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${systemHealth.healthScore * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Current Phase */}
          {evolutionStatus && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Evolution Phase</h3>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-purple-400">
                  Phase {evolutionStatus.currentPhase}
                </div>
                <div className="text-sm text-gray-300">
                  {getPhaseDescription(evolutionStatus.currentPhase)}
                </div>
                <div className="text-sm text-gray-300">
                  Next Phase Readiness: {(evolutionStatus.nextPhaseReadiness * 100).toFixed(1)}%
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-purple-500"
                    style={{ width: `${evolutionStatus.nextPhaseReadiness * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Evolution Metrics */}
        {evolutionStatus && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Evolution Metrics</h3>
              <div className="space-y-3">
                {Object.entries(evolutionStatus.evolutionMetrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <span className="text-cyan-400 font-mono">
                      {typeof value === 'number' ? value.toFixed(3) : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Active Capabilities</h3>
              <div className="space-y-2">
                {evolutionStatus.activeCapabilities.map((capability, index) => (
                  <div key={index} className="text-sm bg-gray-800 px-3 py-2 rounded">
                    {capability.replace(/_/g, ' ').toLowerCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Emergent Wisdom & Logs */}
        {isActive && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Emergent Wisdom</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {evolutionStatus?.emergentWisdom.map((wisdom, index) => (
                  <div key={index} className="text-sm bg-gray-800 px-3 py-2 rounded text-gray-300">
                    {wisdom}
                  </div>
                )) || <div className="text-gray-500 italic">No wisdom emerged yet...</div>}
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
                {logs.map((log, index) => (
                  <div key={index} className="text-gray-300 break-words">
                    {log}
                  </div>
                )) || <div className="text-gray-500 italic">No recent activity...</div>}
              </div>
            </div>
          </div>
        )}

        {/* Holoflower Visualization */}
        <div className="mt-12 flex justify-center">
          <div className="w-64 h-64">
            <Holoflower
              elements={evolutionStatus ? {
                fire: evolutionStatus.evolutionMetrics.emergenceRate,
                water: evolutionStatus.evolutionMetrics.fieldCoherence,
                earth: evolutionStatus.evolutionMetrics.stabilityScore,
                air: evolutionStatus.evolutionMetrics.systemAwareness,
                aether: evolutionStatus.evolutionMetrics.recursionDepth / 10
              } : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}