"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Database, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface MemoryMetrics {
  session_entries: number;
  journal_entries: number;
  profile_entries: number;
  continuity_percent: number;
  memory_fetch_errors: number;
  avg_memory_retrieval_time: number;
  memory_layers: {
    [key: string]: {
      health: number;
      errors: number;
    };
  };
}

interface MemoryOrchestrationPanelProps {
  memoryMetrics?: MemoryMetrics;
}

export default function MemoryOrchestrationPanel({ memoryMetrics }: MemoryOrchestrationPanelProps) {
  if (!memoryMetrics) {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700/20 rounded w-1/3"></div>
            <div className="h-32 bg-gray-700/20 rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700/20 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const continuityColor = memoryMetrics.continuity_percent >= 80 ? 'text-green-400' : 
                          memoryMetrics.continuity_percent >= 60 ? 'text-amber-400' : 'text-red-400';

  // Mock trend data for session entries (last 24 hours)
  const sessionTrendData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    sessions: Math.floor(memoryMetrics.session_entries / 24) + Math.floor(Math.random() * 5)
  }));

  const layerData = Object.entries(memoryMetrics.memory_layers).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    health: data.health,
    errors: data.errors
  }));

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sacred-gold flex items-center">
          <Brain className="w-6 h-6 mr-2" />
          Memory Orchestration
        </CardTitle>
        <div className="flex items-center space-x-4 text-sm">
          <div className={`font-semibold ${continuityColor}`}>
            {memoryMetrics.continuity_percent.toFixed(1)}% Continuity
          </div>
          <div className="text-gray-400">
            {memoryMetrics.session_entries} Sessions • {memoryMetrics.memory_fetch_errors} Errors
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Continuity Gauge */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Memory Continuity Success</span>
            <span className={`text-sm font-semibold ${continuityColor}`}>
              {memoryMetrics.continuity_percent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3">
            <motion.div
              className={`h-3 rounded-full ${
                memoryMetrics.continuity_percent >= 80 ? 'bg-green-400' : 
                memoryMetrics.continuity_percent >= 60 ? 'bg-amber-400' : 'bg-red-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${memoryMetrics.continuity_percent}%` }}
              transition={{ duration: 1.5 }}
            />
          </div>
        </div>

        {/* Session Entries Trend */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">Session Activity (24h)</h4>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <TrendingUp className="w-3 h-3" />
              <span>Total: {memoryMetrics.session_entries}</span>
            </div>
          </div>
          <div className="h-24 bg-gray-800/30 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessionTrendData}>
                <XAxis 
                  dataKey="hour" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="#FFD700"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, stroke: '#FFD700', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Counts Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="text-lg font-semibold text-blue-400">
              {memoryMetrics.session_entries}
            </div>
            <div className="text-xs text-gray-400">Sessions</div>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="text-lg font-semibold text-amber-400">
              {memoryMetrics.journal_entries}
            </div>
            <div className="text-xs text-gray-400">Journal</div>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="text-lg font-semibold text-green-400">
              {memoryMetrics.profile_entries}
            </div>
            <div className="text-xs text-gray-400">Profile</div>
          </div>
        </div>

        {/* Memory Layer Health */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Memory Layer Health</h4>
          <div className="grid grid-cols-5 gap-2">
            {layerData.map((layer) => (
              <div key={layer.name} className="text-center">
                <div className="w-full bg-gray-700/50 rounded-full h-2 mb-1">
                  <div
                    className={`h-2 rounded-full ${
                      layer.health >= 95 ? 'bg-green-400' : 
                      layer.health >= 90 ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${layer.health}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400">{layer.name}</div>
                <div className={`text-xs font-medium ${
                  layer.health >= 95 ? 'text-green-400' : 
                  layer.health >= 90 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {layer.health.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
          <div className="text-center">
            <div className="text-lg font-semibold text-amber-400">
              {memoryMetrics.avg_memory_retrieval_time.toFixed(0)}ms
            </div>
            <div className="text-xs text-gray-400">Avg Retrieval Time</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold ${
              memoryMetrics.memory_fetch_errors <= 5 ? 'text-green-400' : 'text-red-400'
            }`}>
              {memoryMetrics.memory_fetch_errors}
            </div>
            <div className="text-xs text-gray-400">Fetch Errors</div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {memoryMetrics.continuity_percent >= 70 ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-gray-300">
              {memoryMetrics.continuity_percent >= 70 ? 'Continuity Healthy' : 'Continuity Issues'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300">
              {Object.values(memoryMetrics.memory_layers).every(l => l.health >= 90) ? '5/5 Layers' : 'Layer Issues'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}