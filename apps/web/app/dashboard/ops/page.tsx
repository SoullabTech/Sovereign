"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Brain, 
  MessageSquare, 
  Server,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';
import MemoryOrchestrationPanel from '../beta/components/MemoryOrchestrationPanel';
import VoicePipelineOpsPanel from '../beta/components/VoicePipelineOpsPanel';
import ConversationQualityPanel from '../beta/components/ConversationQualityPanel';
import SystemOpsPanel from '../beta/components/SystemOpsPanel';

interface OperationalMetrics {
  timestamp: string;
  memory_health: any;
  voice_pipeline: any;
  conversation_quality: any;
  system_ops: any;
  summary: {
    overall_health: number;
    critical_issues: string[];
  };
}

export default function OperationalDashboard() {
  const [metrics, setMetrics] = useState<OperationalMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setError(null);
      const response = await fetch('/api/v1/metrics', {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status}`);
      }
      
      const data = await response.json();
      setMetrics(data);
      setLastUpdate(data.timestamp);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch operational metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      setIsLoading(false);
    }
  };

  const refresh = () => {
    setIsLoading(true);
    fetchMetrics();
  };

  // Initial load
  useEffect(() => {
    fetchMetrics();
  }, []);

  // Auto-refresh every 5 seconds for operational monitoring
  useEffect(() => {
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-sacred-gold/20 border-t-sacred-gold rounded-full animate-spin mx-auto" />
          <p className="text-sacred-gold">Loading Maya&apos;s operational metrics...</p>
        </div>
      </div>
    );
  }

  const healthColor = metrics?.summary.overall_health >= 90 ? 'text-green-400' : 
                      metrics?.summary.overall_health >= 70 ? 'text-amber-400' : 'text-red-400';

  const statusText = metrics?.summary.overall_health >= 90 ? 'All Systems Operational' :
                     metrics?.summary.overall_health >= 70 ? 'Minor Issues Detected' : 'Critical Issues';

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Zap className="w-8 h-8 text-sacred-gold" />
              <h1 className="text-3xl font-bold text-sacred-gold">
                Maya Operations Dashboard
              </h1>
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-400">LIVE</span>
              </div>
            </div>
            <p className="text-gray-400">
              Real-time operational monitoring • Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={refresh}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            {metrics?.summary.critical_issues.length > 0 && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-red-300">{metrics.summary.critical_issues.length} Critical</span>
              </div>
            )}
          </div>
        </div>

        {/* System Status Bar */}
        <div className="mt-6 p-4 bg-gray-900/50 backdrop-blur-xl border border-gray-700/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {metrics?.summary.overall_health >= 90 ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              )}
              <div>
                <div className={`text-lg font-semibold ${healthColor}`}>
                  {statusText}
                </div>
                <div className="text-sm text-gray-400">
                  Overall Health: {metrics?.summary.overall_health.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-400">
                  {metrics?.system_ops.active_users_5min || 0}
                </div>
                <div className="text-xs text-gray-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-amber-400">
                  {metrics?.memory_health.continuity_percent.toFixed(1) || 0}%
                </div>
                <div className="text-xs text-gray-400">Memory</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-400">
                  {metrics?.voice_pipeline.stt_health.whisper_success_rate.toFixed(1) || 0}%
                </div>
                <div className="text-xs text-gray-400">Voice</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-sacred-gold">
                  {metrics?.conversation_quality.personalization_success_rate.toFixed(1) || 0}%
                </div>
                <div className="text-xs text-gray-400">Quality</div>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Issues Alert */}
        {metrics?.summary.critical_issues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <div className="flex items-center space-x-2 text-red-400 font-medium mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Critical Issues Detected</span>
            </div>
            <div className="space-y-1 text-sm text-red-300">
              {metrics.summary.critical_issues.map((issue, index) => (
                <div key={index}>• {issue}</div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Dashboard Grid (2x2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Orchestration Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <MemoryOrchestrationPanel memoryMetrics={metrics?.memory_health} />
        </motion.div>

        {/* Voice Pipeline Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <VoicePipelineOpsPanel voiceMetrics={metrics?.voice_pipeline} />
        </motion.div>

        {/* Conversation Quality Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ConversationQualityPanel qualityMetrics={metrics?.conversation_quality} />
        </motion.div>

        {/* System Ops Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <SystemOpsPanel opsMetrics={metrics?.system_ops} />
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Maya Operational Dashboard v2.0 • Tesla Mission Control Interface</p>
        <p>Live monitoring for memory, voice, conversation quality, and system operations</p>
        {error && (
          <div className="mt-2 text-red-400">
            Error: {error} • Using fallback data
          </div>
        )}
      </div>
    </div>
  );
}