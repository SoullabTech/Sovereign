"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Users, Clock, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface SystemOpsMetrics {
  active_users_5min: number;
  avg_processing_time: number;
  p95_processing_time: number;
  error_rate: number;
  supabase_failures: number;
  tts_failures: number;
  uptime_percent: number;
}

interface SystemOpsPanelProps {
  opsMetrics?: SystemOpsMetrics;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  service: string;
}

export default function SystemOpsPanel({ opsMetrics }: SystemOpsPanelProps) {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);

  // Mock error logs stream
  useEffect(() => {
    const generateErrorLog = (): ErrorLog => {
      const types = ['TTS_TIMEOUT', 'SUPABASE_CONNECTION', 'MEMORY_FETCH', 'RATE_LIMIT'];
      const services = ['Voice Pipeline', 'Memory System', 'Database', 'TTS Service'];
      const messages = {
        'TTS_TIMEOUT': 'TTS request timed out after 5000ms',
        'SUPABASE_CONNECTION': 'Database connection pool exhausted',
        'MEMORY_FETCH': 'Failed to fetch user memory context',
        'RATE_LIMIT': 'API rate limit exceeded'
      };
      
      const type = types[Math.floor(Math.random() * types.length)];
      return {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type,
        message: messages[type as keyof typeof messages],
        service: services[Math.floor(Math.random() * services.length)]
      };
    };

    // Add error log occasionally
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        setErrorLogs(prev => [generateErrorLog(), ...prev.slice(0, 9)]); // Keep latest 10
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!opsMetrics) {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700/20 rounded w-1/3"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-gray-700/20 rounded"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-700/20 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const uptimeColor = opsMetrics.uptime_percent >= 99.5 ? 'text-green-400' : 
                      opsMetrics.uptime_percent >= 99 ? 'text-amber-400' : 'text-red-400';

  const processingColor = opsMetrics.avg_processing_time <= 1500 ? 'text-green-400' : 
                          opsMetrics.avg_processing_time <= 2500 ? 'text-amber-400' : 'text-red-400';

  const errorColor = opsMetrics.error_rate <= 1 ? 'text-green-400' : 
                     opsMetrics.error_rate <= 3 ? 'text-amber-400' : 'text-red-400';

  // Mock processing time trend data (last 2 hours)
  const processingTrendData = Array.from({ length: 24 }, (_, i) => ({
    time: i,
    avg: opsMetrics.avg_processing_time + (Math.random() - 0.5) * 400,
    p95: opsMetrics.p95_processing_time + (Math.random() - 0.5) * 600
  }));

  // Mock active users over time (last 2 hours)
  const activeUsersData = Array.from({ length: 24 }, (_, i) => ({
    time: i,
    users: Math.max(0, opsMetrics.active_users_5min + Math.floor((Math.random() - 0.5) * 6))
  }));

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sacred-gold flex items-center">
          <Server className="w-6 h-6 mr-2" />
          System Operations
        </CardTitle>
        <div className="flex items-center space-x-4 text-sm">
          <div className={`font-semibold ${uptimeColor}`}>
            {opsMetrics.uptime_percent.toFixed(2)}% Uptime
          </div>
          <div className="text-gray-400">
            {opsMetrics.active_users_5min} Active Users
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Processing Time Trends */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-300">Processing Time (2h)</h4>
              <div className="flex items-center space-x-3 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-sacred-gold rounded-full"></div>
                  <span>Avg</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span>P95</span>
                </div>
              </div>
            </div>
            <div className="h-24 bg-gray-800/30 rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processingTrendData}>
                  <XAxis 
                    dataKey="time" 
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
                    dataKey="avg"
                    stroke="#FFD700"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="p95"
                    stroke="#F87171"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System Health Metrics */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">System Health</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <div className="flex items-center space-x-2">
                  <Clock className={`w-4 h-4 ${processingColor.replace('text-', '')}`} />
                  <span className="text-xs text-gray-300">Avg Processing</span>
                </div>
                <span className={`text-xs font-semibold ${processingColor}`}>
                  {opsMetrics.avg_processing_time.toFixed(0)}ms
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-gray-300">P95 Processing</span>
                </div>
                <span className="text-xs font-semibold text-red-400">
                  {opsMetrics.p95_processing_time.toFixed(0)}ms
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`w-4 h-4 ${errorColor.replace('text-', '')}`} />
                  <span className="text-xs text-gray-300">Error Rate</span>
                </div>
                <span className={`text-xs font-semibold ${errorColor}`}>
                  {opsMetrics.error_rate.toFixed(2)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-300">Active Users</span>
                </div>
                <span className="text-xs font-semibold text-blue-400">
                  {opsMetrics.active_users_5min}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Users Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">Active Users (2h)</h4>
            <div className="text-xs text-gray-400">
              Current: {opsMetrics.active_users_5min} users
            </div>
          </div>
          <div className="h-16 bg-gray-800/30 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeUsersData}>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#60A5FA"
                  fill="#60A5FA"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Error Logs Stream */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">Live Error Stream</h4>
            <div className="text-xs text-gray-400">
              {opsMetrics.supabase_failures + opsMetrics.tts_failures} Recent Failures
            </div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 max-h-32 overflow-y-auto">
            {errorLogs.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-2">
                No recent errors - system healthy
              </div>
            ) : (
              <div className="space-y-1">
                {errorLogs.slice(0, 5).map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs p-2 bg-red-500/10 border border-red-500/20 rounded text-red-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{log.type}</span>
                      <span className="text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-gray-300">{log.service}: {log.message}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Service Failure Summary */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-700/50">
          <div className="text-center">
            <div className={`text-lg font-semibold ${
              opsMetrics.supabase_failures <= 2 ? 'text-green-400' : 'text-red-400'
            }`}>
              {opsMetrics.supabase_failures}
            </div>
            <div className="text-xs text-gray-400">DB Failures</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-semibold ${
              opsMetrics.tts_failures <= 3 ? 'text-green-400' : 'text-red-400'
            }`}>
              {opsMetrics.tts_failures}
            </div>
            <div className="text-xs text-gray-400">TTS Failures</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-semibold ${uptimeColor}`}>
              {opsMetrics.uptime_percent >= 99.5 ? 'Excellent' : 
               opsMetrics.uptime_percent >= 99 ? 'Good' : 'Poor'}
            </div>
            <div className="text-xs text-gray-400">Uptime</div>
          </div>
        </div>

        {/* System Status Summary */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-700/50">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">
              System operational - {opsMetrics.active_users_5min} users active
            </span>
          </div>
          <div className={`font-medium ${
            opsMetrics.error_rate <= 1 && opsMetrics.uptime_percent >= 99.5 ? 'text-green-400' :
            opsMetrics.error_rate <= 3 && opsMetrics.uptime_percent >= 99 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {opsMetrics.error_rate <= 1 && opsMetrics.uptime_percent >= 99.5 ? 'All Systems Green' :
             opsMetrics.error_rate <= 3 && opsMetrics.uptime_percent >= 99 ? 'Minor Issues' : 'System Degraded'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}