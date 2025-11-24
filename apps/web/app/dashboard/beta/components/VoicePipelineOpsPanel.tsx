"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Volume2, Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface VoiceOpsMetrics {
  stt_health: {
    whisper_success_rate: number;
    browser_fallback_rate: number;
    avg_recognition_time: number;
  };
  tts_usage: {
    sesame: number;
    elevenlabs: number;
    mock: number;
  };
  avg_tts_latency: number;
}

interface VoicePipelineOpsPanelProps {
  voiceMetrics?: VoiceOpsMetrics;
}

export default function VoicePipelineOpsPanel({ voiceMetrics }: VoicePipelineOpsPanelProps) {
  if (!voiceMetrics) {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700/20 rounded w-1/3"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-gray-700/20 rounded"></div>
              <div className="space-y-3">
                <div className="h-12 bg-gray-700/20 rounded"></div>
                <div className="h-12 bg-gray-700/20 rounded"></div>
                <div className="h-12 bg-gray-700/20 rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const whisperHealthColor = voiceMetrics.stt_health.whisper_success_rate >= 95 ? 'text-green-400' : 
                             voiceMetrics.stt_health.whisper_success_rate >= 90 ? 'text-amber-400' : 'text-red-400';

  const ttsLatencyColor = voiceMetrics.avg_tts_latency <= 1000 ? 'text-green-400' : 
                          voiceMetrics.avg_tts_latency <= 1500 ? 'text-amber-400' : 'text-red-400';

  // TTS Usage pie chart data
  const ttsUsageData = [
    { name: 'Sesame', value: voiceMetrics.tts_usage.sesame, color: '#FFD700' },
    { name: 'ElevenLabs', value: voiceMetrics.tts_usage.elevenlabs, color: '#60A5FA' },
    { name: 'Mock', value: voiceMetrics.tts_usage.mock, color: '#F87171' }
  ];

  // Latency histogram mock data
  const latencyHistogramData = [
    { range: '<500ms', count: 45 },
    { range: '500-1s', count: 32 },
    { range: '1-1.5s', count: 18 },
    { range: '1.5-2s', count: 8 },
    { range: '>2s', count: 3 }
  ];

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sacred-gold flex items-center">
          <Volume2 className="w-6 h-6 mr-2" />
          Voice Pipeline
        </CardTitle>
        <div className="flex items-center space-x-4 text-sm">
          <div className={`font-semibold ${whisperHealthColor}`}>
            {voiceMetrics.stt_health.whisper_success_rate.toFixed(1)}% STT Success
          </div>
          <div className={`font-semibold ${ttsLatencyColor}`}>
            {voiceMetrics.avg_tts_latency.toFixed(0)}ms TTS Avg
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* TTS Usage Breakdown Pie Chart */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">TTS Usage Breakdown</h4>
            <div className="h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ttsUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {ttsUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-sacred-gold">TTS</div>
                  <div className="text-xs text-gray-400">Usage</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-4 text-xs">
              {ttsUsageData.map((item, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-400">{item.name}: {item.value.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* STT and System Health */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Speech Recognition Health</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`w-4 h-4 ${whisperHealthColor.replace('text-', '')}`} />
                  <span className="text-xs text-gray-300">Whisper STT</span>
                </div>
                <span className={`text-xs font-semibold ${whisperHealthColor}`}>
                  {voiceMetrics.stt_health.whisper_success_rate.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`w-4 h-4 ${
                    voiceMetrics.stt_health.browser_fallback_rate <= 5 ? 'text-green-400' : 'text-amber-400'
                  }`} />
                  <span className="text-xs text-gray-300">Browser Fallback</span>
                </div>
                <span className={`text-xs font-semibold ${
                  voiceMetrics.stt_health.browser_fallback_rate <= 5 ? 'text-green-400' : 'text-amber-400'
                }`}>
                  {voiceMetrics.stt_health.browser_fallback_rate.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <div className="flex items-center space-x-2">
                  <Clock className={`w-4 h-4 ${
                    voiceMetrics.stt_health.avg_recognition_time <= 200 ? 'text-green-400' : 'text-amber-400'
                  }`} />
                  <span className="text-xs text-gray-300">Recognition Time</span>
                </div>
                <span className={`text-xs font-semibold ${
                  voiceMetrics.stt_health.avg_recognition_time <= 200 ? 'text-green-400' : 'text-amber-400'
                }`}>
                  {voiceMetrics.stt_health.avg_recognition_time.toFixed(0)}ms
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TTS Latency Histogram */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">TTS Latency Distribution</h4>
            <div className="text-xs text-gray-400">
              Avg: {voiceMetrics.avg_tts_latency.toFixed(0)}ms
            </div>
          </div>
          <div className="h-20 bg-gray-800/30 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyHistogramData}>
                <XAxis 
                  dataKey="range" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#60A5FA"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Status Summary */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-700/50">
          <div className="text-center">
            <div className={`text-lg font-semibold ${whisperHealthColor}`}>
              {voiceMetrics.stt_health.whisper_success_rate >= 95 ? 'Excellent' : 
               voiceMetrics.stt_health.whisper_success_rate >= 90 ? 'Good' : 'Poor'}
            </div>
            <div className="text-xs text-gray-400">STT Health</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-sacred-gold">
              {ttsUsageData.find(t => t.name === 'Sesame')?.value.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-400">Sesame Usage</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-semibold ${ttsLatencyColor}`}>
              {voiceMetrics.avg_tts_latency <= 1000 ? 'Fast' : 
               voiceMetrics.avg_tts_latency <= 1500 ? 'Moderate' : 'Slow'}
            </div>
            <div className="text-xs text-gray-400">TTS Speed</div>
          </div>
        </div>

        {/* Health Indicators */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {voiceMetrics.stt_health.whisper_success_rate >= 95 ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-gray-300">
              {voiceMetrics.stt_health.whisper_success_rate >= 95 ? 'Pipeline Healthy' : 'Needs Attention'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300">
              {voiceMetrics.tts_usage.sesame > 50 ? 'Sesame Primary' : 'Mixed TTS'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}