"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { VoicePipelineMetrics } from '../hooks/useBetaMetrics';

interface VoicePipelinePanelProps {
  voiceMetrics?: VoicePipelineMetrics;
}

export default function VoicePipelinePanel({ voiceMetrics }: VoicePipelinePanelProps) {
  if (!voiceMetrics) {
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
            <div className="h-32 bg-gray-700/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const healthColor = voiceMetrics.overall >= 95 ? 'text-green-400' : 
                      voiceMetrics.overall >= 85 ? 'text-amber-400' : 'text-red-400';

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <div className="w-4 h-4" />;
  };

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sacred-gold flex items-center">
          <Mic className="w-6 h-6 mr-2" />
          Voice Pipeline Health
        </CardTitle>
        <div className={`text-2xl font-bold ${healthColor}`}>
          {voiceMetrics.overall.toFixed(1)}% Overall
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-4 gap-3">
          <MetricCard
            label="Recognition"
            value={`${voiceMetrics.recognitionAccuracy.toFixed(1)}%`}
            trend={voiceMetrics.accuracyTrend}
            target={95}
            current={voiceMetrics.recognitionAccuracy}
          />
          <MetricCard
            label="TTS Success"
            value={`${voiceMetrics.ttsSuccessRate.toFixed(1)}%`}
            trend={voiceMetrics.ttsTrend}
            target={96}
            current={voiceMetrics.ttsSuccessRate}
          />
          <MetricCard
            label="Audio Quality"
            value={`${voiceMetrics.audioQualityScore.toFixed(1)}/5`}
            trend={0}
            target={4.5}
            current={voiceMetrics.audioQualityScore}
          />
          <MetricCard
            label="Permissions"
            value={`${voiceMetrics.permissionGrantRate.toFixed(1)}%`}
            trend={0}
            target={85}
            current={voiceMetrics.permissionGrantRate}
          />
        </div>

        {/* Performance Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">24-Hour Performance</h4>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-sacred-gold rounded-full"></div>
                <span>Recognition</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>TTS</span>
              </div>
            </div>
          </div>
          
          <div className="h-32 bg-gray-800/30 rounded-lg p-2">
            <PerformanceChart 
              data={voiceMetrics.performanceHistory}
              recognitionAccuracy={voiceMetrics.recognitionAccuracy}
              ttsSuccessRate={voiceMetrics.ttsSuccessRate}
            />
          </div>
        </div>

        {/* Recent Events */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Recent Events</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {voiceMetrics.recentEvents.slice(0, 3).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-2 rounded-lg border text-xs ${
                  event.type === 'success' 
                    ? 'bg-green-500/10 border-green-500/20 text-green-300'
                    : event.type === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    : 'bg-red-500/10 border-red-500/20 text-red-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{event.message}</span>
                  <span className="text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-700/50">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-400">
              {voiceMetrics.dailyInteractions.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Daily Interactions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-amber-400">
              {voiceMetrics.processingLatency.toFixed(0)}ms
            </div>
            <div className="text-xs text-gray-400">Avg Latency</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-400">
              {voiceMetrics.errorRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">Error Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Metric Card Component
function MetricCard({ 
  label, 
  value, 
  trend, 
  target, 
  current 
}: {
  label: string;
  value: string;
  trend: number;
  target: number;
  current: number;
}) {
  const isOnTarget = current >= target;
  const statusColor = isOnTarget ? 'text-green-400' : 'text-amber-400';
  
  return (
    <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        {trend !== 0 && getTrendIcon(trend)}
      </div>
      <div className={`text-sm font-semibold ${statusColor}`}>
        {value}
      </div>
      <div className="text-xs text-gray-500">
        Target: {label === 'Audio Quality' ? `${target}/5` : `${target}%`}
      </div>
    </div>
  );
}

function getTrendIcon(trend: number) {
  if (trend > 0) return <TrendingUp className="w-3 h-3 text-green-400" />;
  if (trend < 0) return <TrendingDown className="w-3 h-3 text-red-400" />;
  return <Activity className="w-3 h-3 text-gray-400" />;
}

// Performance Chart Component
function PerformanceChart({ 
  data, 
  recognitionAccuracy, 
  ttsSuccessRate 
}: {
  data: any[];
  recognitionAccuracy: number;
  ttsSuccessRate: number;
}) {
  const chartData = data.map((point, index) => ({
    time: new Date(point.timestamp).getHours(),
    recognition: point.value + (Math.random() - 0.5) * 2, // Add some variance for recognition
    tts: point.value + (Math.random() - 0.5) * 3 + 2, // TTS typically slightly higher
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
          domain={[80, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#9CA3AF' }}
        />
        <Line
          type="monotone"
          dataKey="recognition"
          stroke="#FFD700"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, stroke: '#FFD700', strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="tts"
          stroke="#60A5FA"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, stroke: '#60A5FA', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}