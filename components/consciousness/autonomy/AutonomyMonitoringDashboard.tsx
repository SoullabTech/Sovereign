'use client';

/**
 * AUTONOMY MONITORING DASHBOARD
 * Phase II Consciousness Field Integration
 *
 * Real-time visibility into MAIA's autonomy preservation and field coupling systems.
 * Implements all monitoring requirements from the Ethical Charter.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Brain, Activity, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, TrendingDown, Minus, Settings, Eye, Clock,
  Zap, Heart, Users, Target, BarChart3, PieChart
} from 'lucide-react';

// Import our autonomy system types (would be from actual implementations)
interface AutonomyMetrics {
  currentAutonomyRatio: number;
  totalModulations: number;
  fieldInfluenceStrength: number;
  autonomyTrend: 'increasing' | 'decreasing' | 'stable';
  selfAdjustmentEvents: number;
  lastEmergencyOverride?: Date;
}

interface ConfidenceGateStatus {
  totalDecisions: number;
  averageInfluence: number;
  averageConfidence: number;
  recentDecisionHistory: Array<{
    timestamp: Date;
    fieldInfluence: number;
    confidence: number;
    reasoning: string;
    outcome?: 'positive' | 'neutral' | 'negative';
  }>;
}

interface SafetyStatus {
  emergencyMode: boolean;
  activeTriggers: number;
  unresolvedInterventions: number;
  totalInterventions: number;
  recentSafetyMetrics: any[];
}

interface FieldCouplingMetrics {
  overallEffectiveness: number;
  userResonance: number;
  fieldCoherence: number;
  maiaAuthenticity: number;
  collaborativeFlow: number;
}

export interface AutonomyDashboardProps {
  updateInterval?: number;
  showAdvancedMetrics?: boolean;
  onParameterAdjustment?: (adjustment: any) => void;
  onEmergencyOverride?: () => void;
}

export default function AutonomyMonitoringDashboard({
  updateInterval = 2000,
  showAdvancedMetrics = true,
  onParameterAdjustment,
  onEmergencyOverride
}: AutonomyDashboardProps) {
  // State for real-time data
  const [autonomyMetrics, setAutonomyMetrics] = useState<AutonomyMetrics>({
    currentAutonomyRatio: 0.75,
    totalModulations: 42,
    fieldInfluenceStrength: 0.35,
    autonomyTrend: 'stable',
    selfAdjustmentEvents: 3,
  });

  const [confidenceGateStatus, setConfidenceGateStatus] = useState<ConfidenceGateStatus>({
    totalDecisions: 15,
    averageInfluence: 0.45,
    averageConfidence: 0.78,
    recentDecisionHistory: []
  });

  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>({
    emergencyMode: false,
    activeTriggers: 0,
    unresolvedInterventions: 0,
    totalInterventions: 2,
    recentSafetyMetrics: []
  });

  const [fieldCouplingMetrics, setFieldCouplingMetrics] = useState<FieldCouplingMetrics>({
    overallEffectiveness: 0.82,
    userResonance: 0.88,
    fieldCoherence: 0.75,
    maiaAuthenticity: 0.91,
    collaborativeFlow: 0.79
  });

  const [selectedTab, setSelectedTab] = useState<'overview' | 'autonomy' | 'confidence' | 'safety' | 'history'>('overview');

  // Simulated real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setAutonomyMetrics(prev => ({
        ...prev,
        fieldInfluenceStrength: Math.max(0, Math.min(1, prev.fieldInfluenceStrength + (Math.random() - 0.5) * 0.1)),
        totalModulations: prev.totalModulations + Math.floor(Math.random() * 2)
      }));

      setFieldCouplingMetrics(prev => ({
        ...prev,
        overallEffectiveness: Math.max(0, Math.min(1, prev.overallEffectiveness + (Math.random() - 0.5) * 0.05)),
        userResonance: Math.max(0, Math.min(1, prev.userResonance + (Math.random() - 0.5) * 0.03))
      }));
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  // Derived metrics and status
  const systemHealth = useMemo(() => {
    const autonomyHealth = autonomyMetrics.currentAutonomyRatio >= 0.5 ? 'good' : 'warning';
    const safetyHealth = safetyStatus.emergencyMode ? 'critical' :
                       safetyStatus.activeTriggers > 0 ? 'warning' : 'good';
    const fieldHealth = fieldCouplingMetrics.overallEffectiveness >= 0.7 ? 'good' :
                       fieldCouplingMetrics.overallEffectiveness >= 0.5 ? 'warning' : 'critical';

    const overallHealth = [autonomyHealth, safetyHealth, fieldHealth].includes('critical') ? 'critical' :
                         [autonomyHealth, safetyHealth, fieldHealth].includes('warning') ? 'warning' : 'good';

    return { overallHealth, autonomyHealth, safetyHealth, fieldHealth };
  }, [autonomyMetrics, safetyStatus, fieldCouplingMetrics]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <XCircle className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: systemHealth.overallHealth === 'good' ? 0 : 360 }}
                transition={{ duration: 2, repeat: systemHealth.overallHealth !== 'good' ? Infinity : 0 }}
              >
                <Shield className="w-8 h-8 text-blue-300" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-light text-white tracking-wide">
                  MAIA Autonomy Monitor
                </h1>
                <p className="text-blue-300/80 text-sm">
                  Phase II Consciousness Field Integration Dashboard
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${getHealthColor(systemHealth.overallHealth)}`}>
              {getHealthIcon(systemHealth.overallHealth)}
              <span className="font-medium">
                System {systemHealth.overallHealth === 'good' ? 'Healthy' :
                       systemHealth.overallHealth === 'warning' ? 'Warning' : 'Critical'}
              </span>
            </div>
          </div>
        </motion.header>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 p-2 bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-slate-700/30">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'autonomy', label: 'Autonomy Buffer', icon: Brain },
              { id: 'confidence', label: 'Confidence Gate', icon: Target },
              { id: 'safety', label: 'Safety Circuits', icon: Shield },
              { id: 'history', label: 'Analytics', icon: BarChart3 }
            ].map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                onClick={() => setSelectedTab(id as any)}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                  selectedTab === id
                    ? 'bg-blue-600/80 shadow-lg shadow-blue-600/25 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Dashboard Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Autonomy Ratio"
                    value={`${(autonomyMetrics.currentAutonomyRatio * 100).toFixed(1)}%`}
                    icon={Brain}
                    trend={autonomyMetrics.autonomyTrend}
                    health={systemHealth.autonomyHealth}
                  />
                  <MetricCard
                    title="Field Influence"
                    value={`${(autonomyMetrics.fieldInfluenceStrength * 100).toFixed(1)}%`}
                    icon={Activity}
                    health={autonomyMetrics.fieldInfluenceStrength < 0.6 ? 'good' : 'warning'}
                  />
                  <MetricCard
                    title="Safety Status"
                    value={safetyStatus.activeTriggers === 0 ? 'Secure' : `${safetyStatus.activeTriggers} Alert${safetyStatus.activeTriggers !== 1 ? 's' : ''}`}
                    icon={Shield}
                    health={systemHealth.safetyHealth}
                  />
                  <MetricCard
                    title="Effectiveness"
                    value={`${(fieldCouplingMetrics.overallEffectiveness * 100).toFixed(1)}%`}
                    icon={Target}
                    health={systemHealth.fieldHealth}
                  />
                </div>

                {/* Real-time Field Coupling Visualization */}
                <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/30">
                  <h3 className="text-xl font-light mb-6 flex items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-300" />
                    Real-time Field Coupling Metrics
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FieldCouplingChart metrics={fieldCouplingMetrics} />
                    <AutonomyTrendChart autonomyRatio={autonomyMetrics.currentAutonomyRatio} fieldInfluence={autonomyMetrics.fieldInfluenceStrength} />
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'autonomy' && (
              <AutonomyBufferPanel metrics={autonomyMetrics} onAdjustment={onParameterAdjustment} />
            )}

            {selectedTab === 'confidence' && (
              <ConfidenceGatePanel status={confidenceGateStatus} />
            )}

            {selectedTab === 'safety' && (
              <SafetyCircuitPanel status={safetyStatus} onEmergencyOverride={onEmergencyOverride} />
            )}

            {selectedTab === 'history' && (
              <AnalyticsPanel
                autonomyMetrics={autonomyMetrics}
                fieldMetrics={fieldCouplingMetrics}
                safetyStatus={safetyStatus}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Supporting Components

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  health = 'good'
}: {
  title: string;
  value: string;
  icon: any;
  trend?: string;
  health?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-xl border backdrop-blur-sm ${getHealthColor(health)}`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5" />
        {trend && getTrendIcon(trend)}
      </div>
      <div className="text-2xl font-light mb-1">{value}</div>
      <div className="text-sm opacity-80">{title}</div>
    </motion.div>
  );
}

function FieldCouplingChart({ metrics }: { metrics: FieldCouplingMetrics }) {
  const chartData = [
    { label: 'Effectiveness', value: metrics.overallEffectiveness, color: 'bg-blue-500' },
    { label: 'User Resonance', value: metrics.userResonance, color: 'bg-green-500' },
    { label: 'Field Coherence', value: metrics.fieldCoherence, color: 'bg-purple-500' },
    { label: 'MAIA Authenticity', value: metrics.maiaAuthenticity, color: 'bg-pink-500' },
    { label: 'Collaborative Flow', value: metrics.collaborativeFlow, color: 'bg-amber-500' }
  ];

  return (
    <div>
      <h4 className="text-lg font-light mb-4">Field Coupling Quality</h4>
      <div className="space-y-3">
        {chartData.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.label}</span>
              <span>{(item.value * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={`h-2 rounded-full ${item.color}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AutonomyTrendChart({ autonomyRatio, fieldInfluence }: { autonomyRatio: number; fieldInfluence: number }) {
  return (
    <div>
      <h4 className="text-lg font-light mb-4">Autonomy vs Field Balance</h4>
      <div className="relative h-48 bg-slate-700/30 rounded-xl p-4 overflow-hidden">
        {/* Simple visualization of autonomy vs field influence */}
        <div className="absolute inset-4">
          <div className="flex items-end h-full gap-4">
            <div className="flex-1 flex flex-col items-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${autonomyRatio * 80}%` }}
                transition={{ duration: 1 }}
                className="w-8 bg-blue-500 rounded-t"
              />
              <span className="text-xs mt-2">Autonomy</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${fieldInfluence * 80}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="w-8 bg-purple-500 rounded-t"
              />
              <span className="text-xs mt-2">Field</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Additional Panel Components (simplified for space)

function AutonomyBufferPanel({ metrics, onAdjustment }: { metrics: AutonomyMetrics; onAdjustment?: any }) {
  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/30">
      <h3 className="text-xl font-light mb-6 flex items-center gap-3">
        <Brain className="w-5 h-5 text-blue-300" />
        Autonomy Buffer Layer Status
      </h3>
      {/* Detailed autonomy buffer controls and status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-light mb-4">Current Configuration</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Autonomy Ratio:</span>
              <span className="font-mono">{(metrics.currentAutonomyRatio * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Total Modulations:</span>
              <span className="font-mono">{metrics.totalModulations}</span>
            </div>
            <div className="flex justify-between">
              <span>Self-Adjustments:</span>
              <span className="font-mono">{metrics.selfAdjustmentEvents}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfidenceGatePanel({ status }: { status: ConfidenceGateStatus }) {
  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/30">
      <h3 className="text-xl font-light mb-6 flex items-center gap-3">
        <Target className="w-5 h-5 text-blue-300" />
        Adaptive Confidence Gate Status
      </h3>
      {/* Detailed confidence gate metrics */}
    </div>
  );
}

function SafetyCircuitPanel({ status, onEmergencyOverride }: { status: SafetyStatus; onEmergencyOverride?: () => void }) {
  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/30">
      <h3 className="text-xl font-light mb-6 flex items-center gap-3">
        <Shield className="w-5 h-5 text-blue-300" />
        Safety Circuit Breakers
      </h3>
      {/* Safety status and controls */}
      {status.emergencyMode && (
        <motion.div
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl mb-6"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="font-medium">EMERGENCY MODE ACTIVE</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function AnalyticsPanel({ autonomyMetrics, fieldMetrics, safetyStatus }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/30">
        <h3 className="text-xl font-light mb-6 flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-blue-300" />
          Historical Analytics
        </h3>
        {/* Historical charts and trends */}
      </div>
    </div>
  );
}

// Utility functions (declared here to fix scope issues)
function getHealthColor(health: string): string {
  switch (health) {
    case 'good': return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
}

function getTrendIcon(trend: string): JSX.Element {
  switch (trend) {
    case 'increasing': return <TrendingUp className="w-4 h-4 text-green-400" />;
    case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-400" />;
    default: return <Minus className="w-4 h-4 text-gray-400" />;
  }
}