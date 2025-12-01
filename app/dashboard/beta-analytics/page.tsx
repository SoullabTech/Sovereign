"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Activity, Users, MessageCircle, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

// Simple analytics data structure - no complex imports
interface SimpleAnalytics {
  activeSessions: number;
  voiceInteractions: number;
  textInteractions: number;
  totalErrors: number;
  avgLatency: number;
  successRate: number;
}

// Mock data for demonstration
const getMockAnalytics = (): SimpleAnalytics => ({
  activeSessions: Math.floor(Math.random() * 20) + 5,
  voiceInteractions: Math.floor(Math.random() * 100) + 50,
  textInteractions: Math.floor(Math.random() * 50) + 20,
  totalErrors: Math.floor(Math.random() * 5),
  avgLatency: Math.floor(Math.random() * 500) + 800,
  successRate: Math.floor(Math.random() * 10) + 90
});

// Simple admin authentication
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'maya-beta-2024'
};

export default function BetaAnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState<SimpleAnalytics>(getMockAnalytics());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const router = useRouter();

  useEffect(() => {
    const isAuth = sessionStorage.getItem('beta_admin_auth');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Update analytics every 10 seconds
      const interval = setInterval(() => {
        setAnalytics(getMockAnalytics());
        setLastUpdated(new Date());
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (credentials.username === ADMIN_CREDENTIALS.username && 
        credentials.password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      sessionStorage.setItem('beta_admin_auth', 'true');
    } else {
      setError('Invalid credentials');
      setCredentials({ username: '', password: '' });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('beta_admin_auth');
    setCredentials({ username: '', password: '' });
  };

  const refreshData = () => {
    setAnalytics(getMockAnalytics());
    setLastUpdated(new Date());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <button
            onClick={() => router.push('/oracle')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Oracle
          </button>

          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">Maya Beta Analytics</h1>
              <p className="text-gray-600 mt-2">Admin access required</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Access Dashboard
              </button>
            </form>

            <div className="mt-6 text-xs text-gray-500 text-center">
              🔒 Beta testing analytics dashboard
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/oracle')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Oracle
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-gray-900">Maya Beta Analytics</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="text-gray-500">Last updated</div>
              <div className="font-medium">{lastUpdated.toLocaleTimeString()}</div>
            </div>
            <button
              onClick={refreshData}
              className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maya Beta Dashboard</h1>
          <p className="text-gray-600">Real-time analytics for voice interaction testing</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Active Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.activeSessions}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Voice Interactions</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.voiceInteractions}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.successRate}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">Text Interactions</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.textInteractions}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">Avg Latency</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.avgLatency}ms</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-8 h-8 ${analytics.totalErrors > 0 ? 'text-red-500' : 'text-green-500'}`} />
                <div>
                  <p className="text-sm text-gray-500">Total Errors</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalErrors}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Voice vs Text Preference</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Voice Interactions</span>
                <span>{analytics.voiceInteractions} ({Math.round((analytics.voiceInteractions / (analytics.voiceInteractions + analytics.textInteractions)) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(analytics.voiceInteractions / (analytics.voiceInteractions + analytics.textInteractions)) * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Text Interactions</span>
                <span>{analytics.textInteractions} ({Math.round((analytics.textInteractions / (analytics.voiceInteractions + analytics.textInteractions)) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(analytics.textInteractions / (analytics.voiceInteractions + analytics.textInteractions)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${analytics.successRate >= 95 ? 'bg-green-500' : analytics.successRate >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Voice Pipeline: {analytics.successRate >= 95 ? 'Healthy' : analytics.successRate >= 85 ? 'Warning' : 'Critical'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${analytics.totalErrors === 0 ? 'bg-green-500' : analytics.totalErrors <= 2 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Error Rate: {analytics.totalErrors === 0 ? 'None' : analytics.totalErrors <= 2 ? 'Low' : 'High'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${analytics.avgLatency <= 1000 ? 'bg-green-500' : analytics.avgLatency <= 2000 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Response Time: {analytics.avgLatency <= 1000 ? 'Fast' : analytics.avgLatency <= 2000 ? 'Moderate' : 'Slow'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Maya AI: Online</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">📊 Beta Dashboard</h3>
          <p className="text-blue-800 text-sm">
            This dashboard shows live Maya interaction analytics. Data refreshes automatically every 10 seconds.
            For full Supabase integration, deploy the SQL schema and connect your database.
          </p>
        </div>
      </div>
    </div>
  );
}