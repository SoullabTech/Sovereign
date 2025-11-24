"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Database, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MemorySystemMetrics } from '../hooks/useBetaMetrics';

interface MemorySystemPanelProps {
  memoryMetrics?: MemorySystemMetrics;
}

export default function MemorySystemPanel({ memoryMetrics }: MemorySystemPanelProps) {
  if (!memoryMetrics) {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700/20 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-700/20 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const healthColor = memoryMetrics.overall >= 90 ? 'text-green-400' : 
                      memoryMetrics.overall >= 80 ? 'text-amber-400' : 'text-red-400';

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sacred-gold flex items-center">
          <Brain className="w-6 h-6 mr-2" />
          Memory System Health
        </CardTitle>
        <div className={`text-2xl font-bold ${healthColor}`}>
          {memoryMetrics.overall.toFixed(1)}% Overall
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="text-lg font-semibold text-blue-400">
              {memoryMetrics.integrationSuccess.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">Integration Success</div>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="text-lg font-semibold text-amber-400">
              {memoryMetrics.crossSessionContinuity.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">Session Continuity</div>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="text-lg font-semibold text-green-400">
              {memoryMetrics.processingTime.toFixed(0)}ms
            </div>
            <div className="text-xs text-gray-400">Avg Processing</div>
          </div>
        </div>

        {/* Memory Layer Health */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Memory Layer Health</h4>
          <div className="space-y-2">
            {memoryMetrics.layers.map((layer, index) => (
              <motion.div
                key={layer.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MemoryLayerItem layer={layer} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Performance Visualization */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Context Preservation Trend</h4>
          <div className="h-24 bg-gray-800/30 rounded-lg p-2">
            <MemoryPerformanceChart data={memoryMetrics.performanceHistory} />
          </div>
        </div>

        {/* Memory Layer Performance */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Layer Performance</h4>
          <div className="h-20 bg-gray-800/30 rounded-lg p-2">
            <LayerHealthChart layers={memoryMetrics.layers} />
          </div>
        </div>

        {/* Memory Architecture Status */}
        <div className="space-y-3 pt-4 border-t border-gray-700/50">
          <h4 className="text-sm font-medium text-gray-300">Architecture Status</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">5-Layer Stack Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Cross-Session Linking</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Symbolic Integration</span>
            </div>
            <div className="flex items-center space-x-2">
              {memoryMetrics.layers.find(l => l.name === 'External')?.status === 'healthy' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-gray-300">External Memory</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Memory Layer Item Component
function MemoryLayerItem({ layer }: { layer: any }) {
  const statusIcon = {
    healthy: <CheckCircle className="w-4 h-4 text-green-400" />,
    degraded: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    error: <XCircle className="w-4 h-4 text-red-400" />
  };

  const statusColor = {
    healthy: 'text-green-400',
    degraded: 'text-amber-400',
    error: 'text-red-400'
  };

  const healthColor = layer.health >= 90 ? 'text-green-400' : 
                      layer.health >= 80 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {statusIcon[layer.status]}
          <span className="text-sm font-medium text-gray-300">{layer.name} Layer</span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className={healthColor}>{layer.health.toFixed(1)}%</span>
          <span className="text-gray-400">{layer.latency.toFixed(0)}ms</span>
        </div>
      </div>
      
      {/* Health bar */}
      <div className="w-full bg-gray-700/50 rounded-full h-1.5">
        <motion.div
          className={`h-1.5 rounded-full ${
            layer.health >= 90 ? 'bg-green-400' : 
            layer.health >= 80 ? 'bg-amber-400' : 'bg-red-400'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${layer.health}%` }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>
    </div>
  );
}

// Memory Performance Chart Component
function MemoryPerformanceChart({ data }: { data: any[] }) {
  const chartData = data.map((point) => ({
    time: new Date(point.timestamp).getHours(),
    value: point.value,
    timestamp: point.timestamp
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <XAxis 
          dataKey="time" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#9CA3AF' }}
        />
        <YAxis 
          domain={[70, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#9CA3AF' }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#C084FC"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, stroke: '#C084FC', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Layer Health Chart Component
function LayerHealthChart({ layers }: { layers: any[] }) {
  const chartData = layers.map((layer) => ({
    name: layer.name,
    health: layer.health,
    latency: layer.latency / 10, // Scale down for visibility
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} barCategoryGap={10}>
        <XAxis 
          dataKey="name" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fill: '#9CA3AF' }}
        />
        <YAxis 
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fill: '#9CA3AF' }}
        />
        <Bar 
          dataKey="health" 
          fill="#10B981"
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}