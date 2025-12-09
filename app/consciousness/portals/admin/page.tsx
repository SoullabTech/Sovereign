/**
 * Portal Management Dashboard for Administrators
 *
 * Provides comprehensive oversight and management of the consciousness portal system
 * including usage analytics, safety monitoring, and configuration management.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  AlertTriangle,
  Settings,
  Eye,
  Shield,
  Brain,
  Activity,
  Clock,
  Target,
  Layers,
  Gauge,
  Zap,
  Heart
} from 'lucide-react';
import {
  PortalId,
  ComplexityTier,
  SafetyLevel,
  PORTAL_METADATA,
  COMPLEXITY_METADATA
} from '@/lib/consciousness/alchemy/portals/PortalTypes';

interface PortalUsageMetrics {
  portalId: PortalId;
  activeUsers: number;
  sessionsToday: number;
  averageSessionDuration: number;
  conversionRate: number;
  satisfactionScore: number;
  safetyIncidents: number;
  complexityDistribution: Record<ComplexityTier, number>;
}

interface SafetyAlert {
  id: string;
  portalId: PortalId;
  level: SafetyLevel;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

const PortalManagementDashboard: React.FC = () => {
  const [selectedMetricView, setSelectedMetricView] = useState<'overview' | 'detailed' | 'safety' | 'config'>('overview');
  const [realTimeData, setRealTimeData] = useState<PortalUsageMetrics[]>([]);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data generation for demo
  useEffect(() => {
    const generateMockData = (): PortalUsageMetrics[] => {
      return Object.keys(PORTAL_METADATA).map((portalId) => ({
        portalId: portalId as PortalId,
        activeUsers: Math.floor(Math.random() * 200) + 50,
        sessionsToday: Math.floor(Math.random() * 500) + 100,
        averageSessionDuration: Math.floor(Math.random() * 20) + 5,
        conversionRate: Math.random() * 0.6 + 0.2,
        satisfactionScore: Math.random() * 2 + 3,
        safetyIncidents: Math.floor(Math.random() * 5),
        complexityDistribution: {
          beginner: Math.floor(Math.random() * 40) + 20,
          intermediate: Math.floor(Math.random() * 40) + 30,
          advanced: Math.floor(Math.random() * 30) + 10
        }
      }));
    };

    const generateSafetyAlerts = (): SafetyAlert[] => {
      const alerts = [];
      const levels: SafetyLevel[] = ['moderate', 'elevated', 'critical'];
      const portals = Object.keys(PORTAL_METADATA) as PortalId[];

      for (let i = 0; i < 3; i++) {
        alerts.push({
          id: `alert_${i}`,
          portalId: portals[Math.floor(Math.random() * portals.length)],
          level: levels[Math.floor(Math.random() * levels.length)],
          message: `Safety monitoring detected elevated stress indicators in user session`,
          timestamp: new Date(Date.now() - Math.random() * 86400000),
          resolved: Math.random() > 0.3
        });
      }

      return alerts;
    };

    setTimeout(() => {
      setRealTimeData(generateMockData());
      setSafetyAlerts(generateSafetyAlerts());
      setIsLoading(false);
    }, 1000);

    // Update data every 30 seconds for real-time feel
    const interval = setInterval(() => {
      setRealTimeData(generateMockData());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const totalActiveUsers = realTimeData.reduce((sum, portal) => sum + portal.activeUsers, 0);
  const totalSessions = realTimeData.reduce((sum, portal) => sum + portal.sessionsToday, 0);
  const averageSatisfaction = realTimeData.reduce((sum, portal) => sum + portal.satisfactionScore, 0) / realTimeData.length;
  const unresolvedAlerts = safetyAlerts.filter(alert => !alert.resolved).length;

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    color: string;
  }> = ({ title, value, icon, trend, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${color} rounded-xl p-6 border border-gray-700/30`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-xs ${
              trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
            }`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
              {trend === 'up' ? '+12%' : trend === 'down' ? '-5%' : '±0%'} vs yesterday
            </div>
          )}
        </div>
        <div className="text-white/70">{icon}</div>
      </div>
    </motion.div>
  );

  const PortalAnalyticsCard: React.FC<{ portal: PortalUsageMetrics }> = ({ portal }) => {
    const metadata = PORTAL_METADATA[portal.portalId];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${metadata.iconGradient}`}></div>
            <div>
              <h3 className="text-white font-medium">{metadata.displayName}</h3>
              <p className="text-gray-400 text-xs">{portal.activeUsers} active users</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs ${
            portal.safetyIncidents === 0
              ? 'bg-green-500/20 text-green-400'
              : portal.safetyIncidents < 3
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
          }`}>
            {portal.safetyIncidents === 0 ? 'Safe' : `${portal.safetyIncidents} alerts`}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-400 text-xs">Sessions Today</p>
            <p className="text-white font-semibold">{portal.sessionsToday}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Avg Duration</p>
            <p className="text-white font-semibold">{portal.averageSessionDuration}m</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Conversion</p>
            <p className="text-white font-semibold">{(portal.conversionRate * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Satisfaction</p>
            <p className="text-white font-semibold">{portal.satisfactionScore.toFixed(1)}/5.0</p>
          </div>
        </div>

        <div>
          <p className="text-gray-400 text-xs mb-2">Complexity Distribution</p>
          <div className="flex space-x-1">
            {Object.entries(portal.complexityDistribution).map(([tier, percentage]) => (
              <div
                key={tier}
                className={`h-2 rounded-full ${
                  tier === 'beginner' ? 'bg-green-500' :
                  tier === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const SafetyAlertCard: React.FC<{ alert: SafetyAlert }> = ({ alert }) => {
    const metadata = PORTAL_METADATA[alert.portalId];

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`p-4 rounded-lg border-l-4 ${
          alert.level === 'critical'
            ? 'border-red-500 bg-red-500/10'
            : alert.level === 'elevated'
              ? 'border-yellow-500 bg-yellow-500/10'
              : 'border-blue-500 bg-blue-500/10'
        } ${alert.resolved ? 'opacity-60' : ''}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`w-4 h-4 ${
              alert.level === 'critical' ? 'text-red-400' :
              alert.level === 'elevated' ? 'text-yellow-400' : 'text-blue-400'
            }`} />
            <div>
              <p className="text-white text-sm font-medium">
                {metadata.displayName} - {alert.level.toUpperCase()}
              </p>
              <p className="text-gray-300 text-xs mt-1">{alert.message}</p>
              <p className="text-gray-500 text-xs mt-1">
                {alert.timestamp.toLocaleDateString()} {alert.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs ${
            alert.resolved
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {alert.resolved ? 'Resolved' : 'Active'}
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Portal Management Dashboard
          </h1>
          <p className="text-gray-300">
            Real-time oversight and analytics for the consciousness portal system
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex space-x-4 mb-8"
        >
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'detailed', label: 'Portal Analytics', icon: Layers },
            { id: 'safety', label: 'Safety Monitor', icon: Shield },
            { id: 'config', label: 'Configuration', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedMetricView(id as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                selectedMetricView === id
                  ? 'bg-purple-500/20 border border-purple-400 text-purple-300'
                  : 'bg-white/5 border border-gray-700 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </motion.div>

        {/* Overview Metrics */}
        {selectedMetricView === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total Active Users"
                value={totalActiveUsers.toLocaleString()}
                icon={<Users className="w-8 h-8" />}
                trend="up"
                color="from-blue-600/20 to-blue-800/20"
              />
              <MetricCard
                title="Sessions Today"
                value={totalSessions.toLocaleString()}
                icon={<Activity className="w-8 h-8" />}
                trend="up"
                color="from-green-600/20 to-green-800/20"
              />
              <MetricCard
                title="Avg Satisfaction"
                value={averageSatisfaction.toFixed(1)}
                icon={<Heart className="w-8 h-8" />}
                trend="neutral"
                color="from-pink-600/20 to-pink-800/20"
              />
              <MetricCard
                title="Safety Alerts"
                value={unresolvedAlerts}
                icon={<AlertTriangle className="w-8 h-8" />}
                trend={unresolvedAlerts > 0 ? "down" : "neutral"}
                color="from-red-600/20 to-red-800/20"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Portal Performance Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              >
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Portal Performance Overview
                </h3>
                <div className="space-y-4">
                  {realTimeData.slice(0, 5).map((portal) => {
                    const metadata = PORTAL_METADATA[portal.portalId];
                    return (
                      <div key={portal.portalId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${metadata.iconGradient}`}></div>
                          <span className="text-white text-sm">{metadata.displayName}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-gray-300">{portal.activeUsers} users</span>
                          <span className="text-gray-300">{(portal.conversionRate * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Recent Safety Activity */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              >
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Recent Safety Activity
                </h3>
                <div className="space-y-3">
                  {safetyAlerts.slice(0, 4).map((alert) => (
                    <SafetyAlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}

        {/* Detailed Portal Analytics */}
        {selectedMetricView === 'detailed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {realTimeData.map((portal) => (
              <PortalAnalyticsCard key={portal.portalId} portal={portal} />
            ))}
          </div>
        )}

        {/* Safety Monitor */}
        {selectedMetricView === 'safety' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Active Alerts"
                value={unresolvedAlerts}
                icon={<AlertTriangle className="w-8 h-8" />}
                color="from-red-600/20 to-red-800/20"
              />
              <MetricCard
                title="24h Response Time"
                value="2.3m"
                icon={<Clock className="w-8 h-8" />}
                trend="up"
                color="from-blue-600/20 to-blue-800/20"
              />
              <MetricCard
                title="Resolution Rate"
                value="94.7%"
                icon={<Target className="w-8 h-8" />}
                trend="up"
                color="from-green-600/20 to-green-800/20"
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
            >
              <h3 className="text-white font-semibold mb-4">All Safety Alerts</h3>
              <div className="space-y-4">
                {safetyAlerts.map((alert) => (
                  <SafetyAlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Configuration Panel */}
        {selectedMetricView === 'config' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-white font-semibold mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Portal System Configuration
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Portal Management */}
              <div>
                <h4 className="text-white font-medium mb-4">Portal Management</h4>
                <div className="space-y-3">
                  {Object.entries(PORTAL_METADATA).map(([portalId, metadata]) => (
                    <div key={portalId} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${metadata.iconGradient}`}></div>
                        <span className="text-white text-sm">{metadata.displayName}</span>
                      </div>
                      <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors">
                        Configure
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Settings */}
              <div>
                <h4 className="text-white font-medium mb-4">System Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-white text-sm">Auto Portal Detection</span>
                    <div className="w-12 h-6 bg-green-500 rounded-full p-1">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-white text-sm">Safety Monitoring</span>
                    <div className="w-12 h-6 bg-green-500 rounded-full p-1">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-white text-sm">Real-time Analytics</span>
                    <div className="w-12 h-6 bg-green-500 rounded-full p-1">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Live Status Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-6 right-6 bg-green-500/20 border border-green-400/30 rounded-lg px-4 py-2 backdrop-blur-sm"
        >
          <div className="flex items-center space-x-2 text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Data</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PortalManagementDashboard;