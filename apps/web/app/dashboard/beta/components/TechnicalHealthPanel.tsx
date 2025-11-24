"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Server, Activity, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { TechnicalMetrics } from '../hooks/useBetaMetrics';

interface TechnicalHealthPanelProps {
  techMetrics?: TechnicalMetrics;
}

export default function TechnicalHealthPanel({ techMetrics }: TechnicalHealthPanelProps) {
  if (!techMetrics) {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700/20 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700/20 rounded"></div>
              ))}
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-700/20 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const uptimeColor = techMetrics.uptime >= 99.5 ? 'text-green-400' : 
                      techMetrics.uptime >= 99 ? 'text-amber-400' : 'text-red-400';

  const getSystemStatus = () => {
    if (techMetrics.uptime >= 99.5 && techMetrics.errorRate < 1) return 'Excellent';
    if (techMetrics.uptime >= 99 && techMetrics.errorRate < 3) return 'Good';
    if (techMetrics.uptime >= 98 && techMetrics.errorRate < 5) return 'Fair';
    return 'Needs Attention';
  };

  const systemStatus = getSystemStatus();
  const statusColor = systemStatus === 'Excellent' ? 'text-green-400' :
                      systemStatus === 'Good' ? 'text-blue-400' :
                      systemStatus === 'Fair' ? 'text-amber-400' : 'text-red-400';

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sacred-gold flex items-center">
          <Shield className="w-6 h-6 mr-2" />
          System Health & Performance
        </CardTitle>
        <div className={`text-xl font-bold ${statusColor}`}>
          {systemStatus} • {techMetrics.uptime.toFixed(2)}% Uptime
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-gray-800/30 rounded-lg text-center">
            <div className={`text-lg font-semibold ${uptimeColor}`}>
              {techMetrics.uptime.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-400">Uptime</div>
            <div className="text-xs text-gray-500">Target: 99.5%</div>
          </div>
          
          <div className="p-3 bg-gray-800/30 rounded-lg text-center">
            <div className={`text-lg font-semibold ${
              techMetrics.errorRate < 1 ? 'text-green-400' : 
              techMetrics.errorRate < 3 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {techMetrics.errorRate.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-400">Error Rate</div>
            <div className="text-xs text-gray-500">Target: &lt;1%</div>
          </div>
          
          <div className="p-3 bg-gray-800/30 rounded-lg text-center">
            <div className={`text-lg font-semibold ${
              techMetrics.avgResponseTime < 2000 ? 'text-green-400' : 
              techMetrics.avgResponseTime < 5000 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {techMetrics.avgResponseTime.toFixed(0)}ms
            </div>
            <div className="text-xs text-gray-400">Avg Response</div>
            <div className="text-xs text-gray-500">Target: &lt;2s</div>
          </div>
          
          <div className="p-3 bg-gray-800/30 rounded-lg text-center">
            <div className="text-lg font-semibold text-blue-400">
              {techMetrics.activeConnections}
            </div>
            <div className="text-xs text-gray-400">Active Users</div>
            <div className="text-xs text-gray-500">Real-time</div>
          </div>
        </div>

        {/* Resource Usage */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Resource Usage</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Memory Usage</span>
                <span className={`font-medium ${
                  techMetrics.memoryUsage < 70 ? 'text-green-400' : 
                  techMetrics.memoryUsage < 85 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {techMetrics.memoryUsage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${
                    techMetrics.memoryUsage < 70 ? 'bg-green-400' : 
                    techMetrics.memoryUsage < 85 ? 'bg-amber-400' : 'bg-red-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${techMetrics.memoryUsage}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">CPU Usage</span>
                <span className={`font-medium ${
                  techMetrics.cpuUsage < 70 ? 'text-green-400' : 
                  techMetrics.cpuUsage < 85 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {techMetrics.cpuUsage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${
                    techMetrics.cpuUsage < 70 ? 'bg-green-400' : 
                    techMetrics.cpuUsage < 85 ? 'bg-amber-400' : 'bg-red-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${techMetrics.cpuUsage}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Service Health Checks */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Service Health</h4>
          <div className="grid grid-cols-1 gap-2">
            {techMetrics.healthChecks.map((service, index) => (
              <motion.div
                key={service.service}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ServiceHealthItem service={service} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        {(techMetrics.uptime < 99.5 || techMetrics.errorRate > 3 || techMetrics.avgResponseTime > 5000) && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400 text-xs font-medium mb-1">
              <AlertTriangle className="w-3 h-3" />
              <span>System Alert</span>
            </div>
            <div className="text-red-300 text-xs space-y-1">
              {techMetrics.uptime < 99.5 && <div>• Uptime below target (99.5%)</div>}
              {techMetrics.errorRate > 3 && <div>• Error rate above threshold (3%)</div>}
              {techMetrics.avgResponseTime > 5000 && <div>• Response time above threshold (5s)</div>}
            </div>
          </div>
        )}

        {/* Performance Summary */}
        <div className="pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Overall System Health</span>
            <div className="flex items-center space-x-2">
              {systemStatus === 'Excellent' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : systemStatus === 'Good' ? (
                <Activity className="w-4 h-4 text-blue-400" />
              ) : systemStatus === 'Fair' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className={statusColor}>{systemStatus}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Service Health Item Component
function ServiceHealthItem({ service }: { service: any }) {
  const statusIcon = {
    healthy: <CheckCircle className="w-4 h-4 text-green-400" />,
    degraded: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    down: <XCircle className="w-4 h-4 text-red-400" />
  };

  const statusColor = {
    healthy: 'text-green-400',
    degraded: 'text-amber-400',
    down: 'text-red-400'
  };

  const responseTimeColor = service.responseTime < 200 ? 'text-green-400' :
                           service.responseTime < 500 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
      <div className="flex items-center space-x-2">
        {statusIcon[service.status]}
        <span className="text-sm text-gray-300">{service.service}</span>
      </div>
      <div className="flex items-center space-x-3 text-xs">
        <span className={responseTimeColor}>{service.responseTime}ms</span>
        <span className="text-gray-400">
          {new Date(service.lastCheck).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}