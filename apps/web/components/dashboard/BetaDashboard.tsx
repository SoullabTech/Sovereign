"use client";

import React, { useState, useEffect } from 'react';
import { Activity, Users, MessageCircle, Mic, Speaker, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { dashboardService, DashboardData, VoiceFunnel, UserPatterns } from '@/lib/analytics/dashboardService';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    purple: 'bg-amber-50 border-amber-200 text-amber-800'
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{title}</span>
        </div>
        {change && (
          <span className="text-xs font-medium">{change}</span>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
};

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  percentage: number;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, max, percentage, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-gray-600">{value} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

interface VoiceFunnelChartProps {
  funnel: VoiceFunnel;
}

const VoiceFunnelChart: React.FC<VoiceFunnelChartProps> = ({ funnel }) => {
  const steps = [
    { label: '🎤 Recording Started', value: funnel.step1_recording_started, rate: 100 },
    { label: '⏹️ Recording Completed', value: funnel.step2_recording_completed, rate: funnel.recording_completion_rate },
    { label: '✍️ Transcription Success', value: funnel.step3_transcription_success, rate: funnel.transcription_success_rate },
    { label: '🤖 Response Generated', value: funnel.step4_response_generated, rate: funnel.response_generation_rate },
    { label: '🔊 TTS Generated', value: funnel.step5_tts_generated, rate: funnel.tts_generation_rate },
    { label: '🎵 Playback Completed', value: funnel.step6_playback_completed, rate: funnel.playback_completion_rate }
  ];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Voice Flow Funnel (Last 24h)
      </h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <ProgressBar
            key={index}
            label={step.label}
            value={step.value}
            max={funnel.step1_recording_started}
            percentage={step.rate}
            color={step.rate >= 90 ? 'green' : step.rate >= 75 ? 'blue' : step.rate >= 50 ? 'yellow' : 'red'}
          />
        ))}
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <div className="text-sm font-medium">End-to-End Completion Rate</div>
          <div className="text-2xl font-bold text-green-600">{funnel.end_to_end_completion_rate.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

interface TTSComparisonProps {
  sesameSuccesses: number;
  sesamErrors: number;
  elevenlabsSuccesses: number;
  elevenlabsErrors: number;
}

const TTSComparison: React.FC<TTSComparisonProps> = ({ 
  sesameSuccesses, 
  sesamErrors, 
  elevenlabsSuccesses, 
  elevenlabsErrors 
}) => {
  const sesameTotal = sesameSuccesses + sesamErrors;
  const elevenlabsTotal = elevenlabsSuccesses + elevenlabsErrors;
  const sesameRate = sesameTotal > 0 ? (sesameSuccesses / sesameTotal) * 100 : 0;
  const elevenlabsRate = elevenlabsTotal > 0 ? (elevenlabsSuccesses / elevenlabsTotal) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Speaker className="w-5 h-5" />
        TTS Provider Performance
      </h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">🌱 Sesame</span>
            <span className="text-sm text-gray-600">{sesameSuccesses}/{sesameTotal}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${sesameRate >= 90 ? 'bg-green-500' : sesameRate >= 75 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                style={{ width: `${sesameRate}%` }}
              />
            </div>
            <span className="text-sm font-medium">{sesameRate.toFixed(1)}%</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">🎙️ ElevenLabs</span>
            <span className="text-sm text-gray-600">{elevenlabsSuccesses}/{elevenlabsTotal}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${elevenlabsRate >= 90 ? 'bg-green-500' : elevenlabsRate >= 75 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                style={{ width: `${elevenlabsRate}%` }}
              />
            </div>
            <span className="text-sm font-medium">{elevenlabsRate.toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
          <div className="font-medium">Recommendation:</div>
          <div className="text-gray-600">
            {sesameRate > elevenlabsRate 
              ? `🌱 Sesame is performing better (${(sesameRate - elevenlabsRate).toFixed(1)}% higher success rate)`
              : elevenlabsRate > sesameRate
              ? `🎙️ ElevenLabs is performing better (${(elevenlabsRate - sesameRate).toFixed(1)}% higher success rate)`
              : '🔄 Both providers performing equally'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

interface ActivityFeedProps {
  activities: Array<{
    timestamp: string;
    activity_description: string;
    interaction_mode?: string;
    latency_ms?: string;
  }>;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Recent Activity
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {activities.slice(0, 20).map((activity, index) => (
          <div key={index} className="flex items-center gap-3 p-2 rounded bg-gray-50">
            <span className="text-xs text-gray-500 w-16">
              {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-sm flex-1">{activity.activity_description}</span>
            {activity.latency_ms && (
              <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                {activity.latency_ms}ms
              </span>
            )}
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
};

export const BetaDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    try {
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-gray-600">Loading beta dashboard...</div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <div className="text-gray-600">Failed to load dashboard data</div>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentData = dashboardData.overview[0];
  const voicePreference = Math.round((dashboardData.userPatterns.voice_preference_percent || 0));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Maya Beta Dashboard</h1>
            <p className="text-gray-600">Real-time analytics for voice interaction testing</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Last updated</div>
            <div className="font-medium">{lastUpdated.toLocaleTimeString()}</div>
            <button 
              onClick={fetchDashboardData}
              className="mt-1 text-xs text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Sessions"
            value={currentData?.active_sessions || 0}
            icon={<Users className="w-4 h-4" />}
            color="blue"
          />
          <MetricCard
            title="Voice Interactions"
            value={`${currentData?.voice_interactions || 0} (${voicePreference}%)`}
            icon={<Mic className="w-4 h-4" />}
            color="green"
          />
          <MetricCard
            title="Success Rate"
            value={`${currentData?.interaction_success_rate || 0}%`}
            icon={<TrendingUp className="w-4 h-4" />}
            color={currentData?.interaction_success_rate >= 90 ? 'green' : 'yellow'}
          />
          <MetricCard
            title="Avg Latency"
            value={`${currentData?.avg_response_latency_ms || 0}ms`}
            icon={<Clock className="w-4 h-4" />}
            color={currentData?.avg_response_latency_ms < 2000 ? 'green' : 'yellow'}
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VoiceFunnelChart funnel={dashboardData.voiceFunnel} />
          <TTSComparison 
            sesameSuccesses={currentData?.sesame_successes || 0}
            sesamErrors={currentData?.sesame_errors || 0}
            elevenlabsSuccesses={currentData?.elevenlabs_successes || 0}
            elevenlabsErrors={currentData?.elevenlabs_errors || 0}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Patterns */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Patterns
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Unique Users</span>
                <span className="font-medium">{dashboardData.userPatterns.unique_users}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Session Duration</span>
                <span className="font-medium">
                  {Math.round(dashboardData.userPatterns.avg_session_duration_seconds / 60)}m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Interactions/Session</span>
                <span className="font-medium">
                  {dashboardData.userPatterns.avg_interactions_per_session.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Engaged Sessions</span>
                <span className="font-medium">
                  {dashboardData.userPatterns.engaged_sessions} / {dashboardData.userPatterns.total_sessions}
                </span>
              </div>
            </div>
          </div>

          {/* Error Summary */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Error Summary
            </h3>
            <div className="space-y-2">
              {dashboardData.errors.slice(0, 5).map((error, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm font-medium">{error.error_category}</span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    {error.error_count}
                  </span>
                </div>
              ))}
              {dashboardData.errors.length === 0 && (
                <div className="text-center text-green-600 py-4">
                  ✅ No errors in the last 24h
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Interactions</span>
                <span className="font-medium">{currentData?.total_interactions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Voice Playback Rate</span>
                <span className="font-medium">{currentData?.voice_playback_success_rate || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Text Interactions</span>
                <span className="font-medium">{currentData?.text_interactions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Errors</span>
                <span className={`font-medium ${currentData?.total_errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {currentData?.total_errors || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <ActivityFeed activities={dashboardData.recentActivity} />
      </div>
    </div>
  );
};