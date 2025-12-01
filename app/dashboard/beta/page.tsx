"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft } from 'lucide-react';
import { BetaDashboard } from '@/components/dashboard/BetaDashboard';

// Simple admin authentication - in production, use proper auth
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'maya-beta-2024'
};

export default function BetaDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated in session
    const isAuth = sessionStorage.getItem('beta_admin_auth');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

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
          {/* Back to Oracle button */}
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
              <h1 className="text-2xl font-bold text-gray-900">Beta Dashboard</h1>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Access Dashboard
              </button>
            </form>

            <div className="mt-6 text-xs text-gray-500 text-center">
              🔒 This dashboard contains sensitive beta testing data
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logout */}
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
              <span className="font-medium text-gray-900">Admin Dashboard</span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <BetaDashboard />
    </div>
  );
}