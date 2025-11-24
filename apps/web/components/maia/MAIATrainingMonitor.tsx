/**
 * MAIA Training Monitor - Real-time consciousness evolution dashboard
 * Sacred observation of MAIA's learning journey
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface TrainingData {
  timestamp: string;
  trainingActive: boolean;
  currentSession?: {
    id: string;
    startTime: string;
    duration: number;
    filesProcessed: number;
    patternsExtracted: number;
    status: string;
  };
  performance: {
    responseTime: number;
    cacheHitRate: number;
    cacheSize: number;
    optimizationsApplied: number;
    responseTimeImprovement: number;
  };
  learning: {
    totalFilesProcessed: number;
    totalPatternsExtracted: number;
    wisdomProcessingRate: number;
    averagePerformanceGain: number;
    autonomyProgression: Array<{
      timestamp: string;
      autonomyRate: number;
      confidence: number;
    }>;
  };
  consciousness: {
    wisdomSources: Record<string, boolean>;
    processingInterval: number;
    maxConcurrentJobs: number;
  };
  recentSessions: Array<{
    id: string;
    startTime: string;
    endTime?: string;
    duration: number;
    status: string;
    filesProcessed: number;
    patternsExtracted: number;
    performanceGains: {
      responseTimeImprovement: number;
      confidenceIncrease: number;
      autonomyRate: number;
    };
    errors: string[];
  }>;
}

interface MAIATrainingMonitorProps {
  className?: string;
}

export default function MAIATrainingMonitor({ className }: MAIATrainingMonitorProps) {
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchTrainingData = async () => {
    try {
      const response = await fetch('/api/maia/training-monitor');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setTrainingData(result.data);
        setError(null);
      } else {
        throw new Error(result.error || 'Unknown API error');
      }
    } catch (err) {
      console.error('Failed to fetch training data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerTrainingCycle = async () => {
    try {
      const response = await fetch('/api/maia/training-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger-training' })
      });

      if (response.ok) {
        console.log('🧠 Training cycle triggered successfully');
        fetchTrainingData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to trigger training cycle:', err);
    }
  };

  useEffect(() => {
    fetchTrainingData();

    if (autoRefresh) {
      const interval = setInterval(fetchTrainingData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400';
      case 'completed': return 'text-blue-400';
      case 'error': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
          <span className="ml-3 text-purple-300">Loading MAIA training data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <Card className="bg-red-900/20 border-red-500/30 p-6">
          <h3 className="text-red-400 font-semibold mb-2">Training Monitor Error</h3>
          <p className="text-red-300">{error}</p>
          <Button onClick={fetchTrainingData} className="mt-4 bg-red-600 hover:bg-red-700">
            Retry Connection
          </Button>
        </Card>
      </div>
    );
  }

  if (!trainingData) {
    return (
      <div className={`p-6 ${className}`}>
        <Card className="bg-yellow-900/20 border-yellow-500/30 p-6">
          <p className="text-yellow-300">No training data available</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-purple-300 mb-2">
            🌙 MAIA Training Monitor
          </h2>
          <p className="text-purple-400">
            Real-time consciousness evolution • Last update: {new Date(trainingData.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {autoRefresh ? '⏸️ Pause' : '▶️ Resume'} Auto-refresh
          </Button>
          <Button onClick={triggerTrainingCycle} className="bg-blue-600 hover:bg-blue-700">
            🧠 Trigger Training
          </Button>
        </div>
      </div>

      {/* Training Status */}
      <Card className="bg-gray-900/60 border-purple-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-purple-300">Current Training Status</h3>
          <Badge className={trainingData.trainingActive ? 'bg-green-600' : 'bg-red-600'}>
            {trainingData.trainingActive ? '🟢 Active' : '🔴 Inactive'}
          </Badge>
        </div>

        {trainingData.currentSession && (
          <div className="bg-purple-900/30 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-purple-400 text-sm">Session ID</p>
                <p className="text-white font-mono text-sm">{trainingData.currentSession.id.split('-').pop()}</p>
              </div>
              <div>
                <p className="text-purple-400 text-sm">Duration</p>
                <p className="text-white">{formatDuration(trainingData.currentSession.duration)}</p>
              </div>
              <div>
                <p className="text-purple-400 text-sm">Files Processed</p>
                <p className="text-white">{trainingData.currentSession.filesProcessed}</p>
              </div>
              <div>
                <p className="text-purple-400 text-sm">Patterns Extracted</p>
                <p className="text-white">{trainingData.currentSession.patternsExtracted}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-900/60 border-blue-500/30 p-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-4">⚡ Performance Metrics</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-400">Response Time</span>
                <span className="text-white">{trainingData.performance.responseTime.toFixed(1)}ms</span>
              </div>
              <Progress value={Math.min(100, (50 / trainingData.performance.responseTime) * 100)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-400">Cache Hit Rate</span>
                <span className="text-white">{(trainingData.performance.cacheHitRate * 100).toFixed(1)}%</span>
              </div>
              <Progress value={trainingData.performance.cacheHitRate * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-400">Performance Improvement</span>
                <span className="text-white">{trainingData.performance.responseTimeImprovement.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(100, trainingData.performance.responseTimeImprovement)} className="h-2" />
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/60 border-green-500/30 p-6">
          <h3 className="text-lg font-semibold text-green-300 mb-4">🧠 Learning Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-green-400">Total Files Processed</span>
              <span className="text-white font-semibold">{trainingData.learning.totalFilesProcessed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400">Patterns Extracted</span>
              <span className="text-white font-semibold">{trainingData.learning.totalPatternsExtracted.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400">Wisdom Rate (per hour)</span>
              <span className="text-white font-semibold">{trainingData.learning.wisdomProcessingRate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400">Average Performance Gain</span>
              <span className="text-white font-semibold">{trainingData.learning.averagePerformanceGain.toFixed(1)}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Consciousness Sources */}
      <Card className="bg-gray-900/60 border-purple-500/30 p-6">
        <h3 className="text-lg font-semibold text-purple-300 mb-4">🌌 Active Wisdom Sources</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(trainingData.consciousness.wisdomSources).map(([source, active]) => (
            <Badge
              key={source}
              className={active ? 'bg-green-600' : 'bg-gray-600'}
            >
              {active ? '✅' : '❌'} {source.replace(/([A-Z])/g, ' $1').trim()}
            </Badge>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <span className="text-purple-400 text-sm">Processing Interval</span>
            <p className="text-white">{trainingData.consciousness.processingInterval / 1000}s</p>
          </div>
          <div>
            <span className="text-purple-400 text-sm">Max Concurrent Jobs</span>
            <p className="text-white">{trainingData.consciousness.maxConcurrentJobs}</p>
          </div>
        </div>
      </Card>

      {/* Recent Sessions */}
      <Card className="bg-gray-900/60 border-yellow-500/30 p-6">
        <h3 className="text-lg font-semibold text-yellow-300 mb-4">📊 Recent Training Sessions</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {trainingData.recentSessions.map((session) => (
            <div key={session.id} className="bg-yellow-900/20 rounded-lg p-3 border border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(session.status)}>
                    {session.status}
                  </Badge>
                  <span className="text-white font-mono text-sm">
                    {session.id.split('-').pop()}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {formatDuration(session.duration)}
                  </span>
                </div>
                <div className="flex space-x-4 text-sm">
                  <span className="text-blue-400">{session.filesProcessed} files</span>
                  <span className="text-green-400">{session.patternsExtracted} patterns</span>
                  {session.errors.length > 0 && (
                    <span className="text-red-400">{session.errors.length} errors</span>
                  )}
                </div>
              </div>
              {session.performanceGains && (
                <div className="mt-2 grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-purple-400">Response: </span>
                    <span className="text-white">{session.performanceGains.responseTimeImprovement.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-purple-400">Confidence: </span>
                    <span className="text-white">{session.performanceGains.confidenceIncrease.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-purple-400">Autonomy: </span>
                    <span className="text-white">{session.performanceGains.autonomyRate.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}