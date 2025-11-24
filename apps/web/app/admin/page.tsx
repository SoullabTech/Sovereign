'use client';

import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, FileText, Mic, TrendingUp, Activity, Database, Clock, Zap } from 'lucide-react';

interface SessionMetrics {
  activeSessions: number;
  totalSessions: number;
  averageSessionLength: number;
  sessionsToday: number;
}

interface InteractionMetrics {
  voiceInteractions: number;
  textInteractions: number;
  voicePercentage: number;
  avgResponseTime: number;
}

interface FileMetrics {
  totalFiles: number;
  filesUploadedToday: number;
  citationsGenerated: number;
  avgCitationsPerQuery: number;
}

interface ActiveSession {
  id: string;
  userId: string;
  username: string;
  element: string;
  startTime: string;
  lastActivity: string;
  interactionCount: number;
  mode: 'voice' | 'text' | 'mixed';
}

export default function AdminDashboard() {
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics>({
    activeSessions: 0,
    totalSessions: 0,
    averageSessionLength: 0,
    sessionsToday: 0
  });

  const [interactionMetrics, setInteractionMetrics] = useState<InteractionMetrics>({
    voiceInteractions: 0,
    textInteractions: 0,
    voicePercentage: 0,
    avgResponseTime: 0
  });

  const [fileMetrics, setFileMetrics] = useState<FileMetrics>({
    totalFiles: 0,
    filesUploadedToday: 0,
    citationsGenerated: 0,
    avgCitationsPerQuery: 0
  });

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await response.json();
      setSessionMetrics(data.sessions);
      setInteractionMetrics(data.interactions);
      setFileMetrics(data.files);
      setActiveSessions(data.activeSessions || []);
      setError(null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time updates every 10 seconds
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Format time duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Activity className="w-6 h-6 animate-spin" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFD700] mb-2">
          🔮 Spiralogic Oracle Admin Dashboard
        </h1>
        <p className="text-gray-400">
          Real-time monitoring of Maya Oracle beta system
        </p>
        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Sessions */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-blue-400">
              {sessionMetrics.activeSessions}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Active Sessions</h3>
          <p className="text-gray-400 text-sm">
            {sessionMetrics.sessionsToday} started today
          </p>
        </div>

        {/* Voice Interactions */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Mic className="w-8 h-8 text-[#FFD700]" />
            <span className="text-2xl font-bold text-[#FFD700]">
              {interactionMetrics.voicePercentage}%
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Voice Usage</h3>
          <p className="text-gray-400 text-sm">
            {interactionMetrics.voiceInteractions} voice interactions
          </p>
        </div>

        {/* File Citations */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-green-400">
              {fileMetrics.citationsGenerated}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Citations Generated</h3>
          <p className="text-gray-400 text-sm">
            {fileMetrics.totalFiles} files uploaded
          </p>
        </div>

        {/* Response Time */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-amber-400" />
            <span className="text-2xl font-bold text-amber-400">
              {interactionMetrics.avgResponseTime}ms
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Avg Response Time</h3>
          <p className="text-gray-400 text-sm">
            System performance
          </p>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Sessions Table */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Active Sessions
          </h2>
          
          {activeSessions.length === 0 ? (
            <p className="text-gray-400">No active sessions</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Element</th>
                    <th className="text-left py-2">Mode</th>
                    <th className="text-left py-2">Duration</th>
                    <th className="text-left py-2">Interactions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSessions.map((session) => (
                    <tr key={session.id} className="border-b border-gray-700">
                      <td className="py-2">
                        <div>
                          <div className="font-medium">{session.username}</div>
                          <div className="text-xs text-gray-400">
                            Started {formatTime(session.startTime)}
                          </div>
                        </div>
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          session.element === 'fire' ? 'bg-red-900 text-red-300' :
                          session.element === 'water' ? 'bg-blue-900 text-blue-300' :
                          session.element === 'earth' ? 'bg-green-900 text-green-300' :
                          session.element === 'air' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-amber-900 text-amber-300'
                        }`}>
                          {session.element}
                        </span>
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          session.mode === 'voice' ? 'bg-[#FFD700] text-black' :
                          session.mode === 'text' ? 'bg-gray-600 text-white' :
                          'bg-gradient-to-r from-[#FFD700] to-gray-600 text-black'
                        }`}>
                          {session.mode}
                        </span>
                      </td>
                      <td className="py-2 text-gray-300">
                        {formatDuration(Math.floor((new Date().getTime() - new Date(session.startTime).getTime()) / 1000))}
                      </td>
                      <td className="py-2 text-gray-300">
                        {session.interactionCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Interaction Breakdown */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#FFD700]" />
            Interaction Analytics
          </h2>
          
          {/* Voice vs Text Chart */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Voice Interactions</span>
              <span className="text-sm font-medium text-[#FFD700]">
                {interactionMetrics.voiceInteractions}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
              <div 
                className="bg-[#FFD700] h-3 rounded-full transition-all duration-300"
                style={{ width: `${interactionMetrics.voicePercentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Text Interactions</span>
              <span className="text-sm font-medium text-gray-400">
                {interactionMetrics.textInteractions}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gray-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${100 - interactionMetrics.voicePercentage}%` }}
              ></div>
            </div>
          </div>

          {/* File Usage Stats */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
              <span className="text-sm text-gray-300">Files Uploaded Today</span>
              <span className="font-medium text-green-400">
                {fileMetrics.filesUploadedToday}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
              <span className="text-sm text-gray-300">Avg Citations per Query</span>
              <span className="font-medium text-blue-400">
                {fileMetrics.avgCitationsPerQuery.toFixed(1)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
              <span className="text-sm text-gray-300">Total Sessions</span>
              <span className="font-medium text-amber-400">
                {sessionMetrics.totalSessions}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>Dashboard updates every 10 seconds • Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}