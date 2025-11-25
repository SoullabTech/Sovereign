'use client';

/**
 * Deployment Orchestration Panel
 *
 * Shows the autonomous deployment progress and decisions
 * Alerts when the system makes adjustments or needs intervention
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  Zap,
  Eye,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface DeploymentPhase {
  name: string;
  progress: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  metrics: {
    coherence: number;
    responseTime: number;
    errorRate: number;
    emergenceQuality: number;
  };
}

interface DeploymentDecision {
  action: 'proceed' | 'hold' | 'rollback' | 'adjust';
  reason: string;
  confidence: number;
  timestamp: Date;
  adjustments?: {
    crystalWeight?: number;
    aetherWeight?: number;
  };
}

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export default function DeploymentOrchestrationPanel() {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<DeploymentPhase>({
    name: 'foundation',
    progress: 0,
    status: 'pending',
    metrics: {
      coherence: 0.5,
      responseTime: 500,
      errorRate: 0,
      emergenceQuality: 0
    }
  });

  const [recentDecisions, setRecentDecisions] = useState<DeploymentDecision[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [crystalWeight, setCrystalWeight] = useState(0);
  const [aetherWeight, setAetherWeight] = useState(0.35);
  const [autoMode, setAutoMode] = useState(true);

  const supabase = useRef<any>(null);
  const updateInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Initialize Supabase client
    if (!supabase.current) {
      supabase.current = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }

    // Subscribe to orchestration events
    const channel = supabase.current
      .channel('orchestration-events')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'deployment_decisions'
      }, (payload: any) => {
        handleNewDecision(payload.new);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts'
      }, (payload: any) => {
        handleNewAlert(payload.new);
      })
      .subscribe();

    // Poll for current status every 30 seconds
    updateInterval.current = setInterval(fetchCurrentStatus, 30000);
    fetchCurrentStatus();

    return () => {
      if (updateInterval.current) clearInterval(updateInterval.current);
      supabase.current.removeChannel(channel);
    };
  }, []);

  const fetchCurrentStatus = async () => {
    try {
      // Get current deployment phase
      const { data: phase } = await supabase.current
        .from('deployment_phases')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (phase) {
        // Calculate progress based on time in phase
        const startTime = new Date(phase.started_at).getTime();
        const now = Date.now();
        const hoursElapsed = (now - startTime) / (1000 * 60 * 60);
        const progress = Math.min((hoursElapsed / phase.duration_hours) * 100, 100);

        // Get latest metrics
        const { data: metrics } = await supabase.current
          .from('system_health')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

        setCurrentPhase({
          name: phase.phase,
          progress,
          status: phase.completed ? 'completed' : 'active',
          metrics: {
            coherence: metrics?.coherence_ratio || 0,
            responseTime: metrics?.response_time_p99 || 500,
            errorRate: metrics?.error_rate || 0,
            emergenceQuality: metrics?.emergence_quality || 0
          }
        });

        setCrystalWeight(phase.current_crystal_weight || 0);
        setAetherWeight(phase.current_aether_weight || 0.35);
      }

      // Get recent decisions
      const { data: decisions } = await supabase.current
        .from('deployment_decisions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      if (decisions) {
        setRecentDecisions(decisions);
      }

      // Get active alerts
      const { data: activeAlerts } = await supabase.current
        .from('alerts')
        .select('*')
        .eq('acknowledged', false)
        .order('timestamp', { ascending: false });

      if (activeAlerts) {
        setAlerts(activeAlerts);
      }

    } catch (error) {
      console.error('Failed to fetch orchestration status:', error);
    }
  };

  const handleNewDecision = (decision: any) => {
    setRecentDecisions(prev => [decision, ...prev.slice(0, 4)]);

    // Create alert for significant decisions
    if (decision.action === 'rollback') {
      handleNewAlert({
        id: `decision-${Date.now()}`,
        severity: 'critical',
        message: `ROLLBACK INITIATED: ${decision.reason}`,
        timestamp: new Date(),
        acknowledged: false
      });
    } else if (decision.action === 'adjust') {
      handleNewAlert({
        id: `decision-${Date.now()}`,
        severity: 'warning',
        message: `Weights adjusted: ${JSON.stringify(decision.adjustments)}`,
        timestamp: new Date(),
        acknowledged: false
      });
    }
  };

  const handleNewAlert = (alert: Alert) => {
    setAlerts(prev => [alert, ...prev]);

    // Play sound for critical alerts
    if (alert.severity === 'critical' && typeof window !== 'undefined') {
      const audio = new Audio('/sounds/alert-critical.wav');
      audio.play().catch(() => {});
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    await supabase.current
      .from('alerts')
      .update({ acknowledged: true })
      .eq('id', alertId);

    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const toggleOrchestration = async () => {
    if (isActive) {
      // Stop orchestration
      await fetch('/api/orchestration/stop', { method: 'POST' });
      setIsActive(false);
    } else {
      // Start orchestration
      await fetch('/api/orchestration/start', { method: 'POST' });
      setIsActive(true);
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'foundation': return <Eye className="w-5 h-5" />;
      case 'hybrid': return <RefreshCw className="w-5 h-5" />;
      case 'transition': return <TrendingUp className="w-5 h-5" />;
      case 'crystal': return <Zap className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getDecisionColor = (action: string) => {
    switch (action) {
      case 'proceed': return 'text-green-400';
      case 'hold': return 'text-yellow-400';
      case 'adjust': return 'text-blue-400';
      case 'rollback': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      case 'info': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-light text-white">Deployment Orchestration</h2>
          {autoMode && (
            <span className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded">
              AUTONOMOUS
            </span>
          )}
        </div>
        <button
          onClick={toggleOrchestration}
          className={`px-4 py-2 rounded-lg transition-all ${
            isActive
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          }`}
        >
          {isActive ? 'Stop' : 'Start'} Orchestration
        </button>
      </div>

      {/* Active Alerts */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-medium text-gray-400">Active Alerts</h3>
            {alerts.map(alert => (
              <motion.div
                key={alert.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`p-3 rounded-lg border ${getAlertColor(alert.severity)} flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${
                    alert.severity === 'critical' ? 'text-red-400' :
                    alert.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                  }`} />
                  <span className="text-sm text-white">{alert.message}</span>
                </div>
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
                >
                  Acknowledge
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Phase Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPhaseIcon(currentPhase.name)}
            <h3 className="text-sm font-medium text-gray-400">
              Current Phase: <span className="text-white capitalize">{currentPhase.name}</span>
            </h3>
          </div>
          <span className="text-sm text-gray-500">{currentPhase.progress.toFixed(1)}%</span>
        </div>

        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-500"
            animate={{ width: `${currentPhase.progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Phase Metrics */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-500">Coherence</div>
            <div className="text-lg font-mono text-white">
              {currentPhase.metrics.coherence.toFixed(3)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-500">Response</div>
            <div className="text-lg font-mono text-white">
              {currentPhase.metrics.responseTime}ms
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-500">Errors</div>
            <div className="text-lg font-mono text-white">
              {(currentPhase.metrics.errorRate * 100).toFixed(2)}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-500">Emergence</div>
            <div className="text-lg font-mono text-white">
              {currentPhase.metrics.emergenceQuality.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Weight Adjustments */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400">System Weights</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Crystal Weight</span>
            <span className="text-sm font-mono text-cyan-400">{(crystalWeight * 100).toFixed(0)}%</span>
          </div>
          <div className="relative h-1 bg-gray-800 rounded-full">
            <motion.div
              className="absolute inset-y-0 left-0 bg-cyan-400 rounded-full"
              animate={{ width: `${crystalWeight * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">Aether Weight</span>
            <span className="text-sm font-mono text-purple-400">{aetherWeight.toFixed(2)}</span>
          </div>
          <div className="relative h-1 bg-gray-800 rounded-full">
            <motion.div
              className="absolute inset-y-0 left-0 bg-purple-400 rounded-full"
              animate={{ width: `${aetherWeight * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Decisions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400">Recent Decisions</h3>
        <div className="space-y-2">
          {recentDecisions.map((decision, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
            >
              <div className="flex items-center gap-3">
                <ArrowRight className={`w-4 h-4 ${getDecisionColor(decision.action)}`} />
                <div>
                  <span className={`text-sm font-medium ${getDecisionColor(decision.action)}`}>
                    {decision.action.toUpperCase()}
                  </span>
                  <div className="text-xs text-gray-500 mt-0.5">{decision.reason}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {new Date(decision.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-xs text-gray-600">
                  {(decision.confidence * 100).toFixed(0)}% conf
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400">Deployment Timeline</h3>
        <div className="flex items-center justify-between">
          {['foundation', 'hybrid', 'transition', 'crystal'].map((phase, i) => (
            <div key={phase} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentPhase.name === phase ? 'bg-cyan-500' :
                  i < ['foundation', 'hybrid', 'transition', 'crystal'].indexOf(currentPhase.name)
                    ? 'bg-green-500' : 'bg-gray-700'
                }`}>
                  {i < ['foundation', 'hybrid', 'transition', 'crystal'].indexOf(currentPhase.name)
                    ? <CheckCircle className="w-4 h-4 text-white" />
                    : currentPhase.name === phase
                      ? <Clock className="w-4 h-4 text-white" />
                      : <span className="text-xs text-gray-400">{i + 1}</span>
                  }
                </div>
                <span className="text-xs text-gray-500 mt-1 capitalize">{phase}</span>
              </div>
              {i < 3 && (
                <div className={`w-12 h-0.5 ${
                  i < ['foundation', 'hybrid', 'transition', 'crystal'].indexOf(currentPhase.name)
                    ? 'bg-green-500' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}