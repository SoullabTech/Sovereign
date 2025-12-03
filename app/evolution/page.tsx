"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ConsciousnessEvolutionDashboard from '@/components/consciousness/ConsciousnessEvolutionDashboard';

// ============================================================================
// EVOLUTION TRACKING PAGE
// ============================================================================

interface EvolutionData {
  currentEvolution: any;
  history: any;
  realTimeCapable: boolean;
  nextUpdateEstimate: string;
}

export default function EvolutionTrackingPage() {
  const [evolutionData, setEvolutionData] = useState<EvolutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Get user data from localStorage
  const getUserInfo = () => {
    try {
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        const userData = JSON.parse(betaUser);
        return {
          userId: userData.id || userData.username || 'guest',
          sessionId: `session_${Date.now()}`
        };
      }
    } catch (error) {
      console.warn('Error parsing user data:', error);
    }
    return {
      userId: 'guest',
      sessionId: `session_${Date.now()}`
    };
  };

  // Fetch consciousness evolution data
  const fetchEvolutionData = async (includeHistory = false) => {
    try {
      const { userId, sessionId } = getUserInfo();

      const response = await fetch(
        `/api/consciousness/evolution?userId=${userId}&sessionId=${sessionId}&includeHistory=${includeHistory}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch evolution data');
      }

      const result = await response.json();

      if (result.success) {
        setEvolutionData(result.data);
        setLastUpdate(new Date().toLocaleTimeString());
        setError(null);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching evolution data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchEvolutionData(true); // Include history on initial load
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!realTimeEnabled || !evolutionData?.realTimeCapable) return;

    const interval = setInterval(() => {
      fetchEvolutionData(false); // Regular updates without history
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeEnabled, evolutionData?.realTimeCapable]);

  // Handle real-time toggle
  const toggleRealTime = () => {
    setRealTimeEnabled(!realTimeEnabled);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    setLoading(true);
    fetchEvolutionData(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100 to-sage-200 flex items-center justify-center">
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Loading spinner with consciousness symbols */}
          <motion.div
            className="w-16 h-16 mx-auto relative"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <svg width="64" height="64" viewBox="0 0 64 64">
              <defs>
                <radialGradient id="loadingGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#14b8a6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
                </radialGradient>
              </defs>

              {/* Nested consciousness rings */}
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  cx="32"
                  cy="32"
                  r={8 + i * 8}
                  fill="none"
                  stroke="url(#loadingGlow)"
                  strokeWidth="2"
                  strokeDasharray={`${4 + i * 2} ${8 + i * 4}`}
                  animate={{
                    rotate: i % 2 === 0 ? 360 : -360,
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    rotate: {
                      duration: 4 + i,
                      repeat: Infinity,
                      ease: "linear"
                    },
                    opacity: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                />
              ))}
            </svg>
          </motion.div>

          <div className="space-y-3">
            <h2 className="text-xl font-medium text-sage-800">
              Analyzing Consciousness Evolution
            </h2>
            <p className="text-sage-600">
              Gathering insights across all dimensional layers...
            </p>

            {/* Loading steps */}
            <div className="space-y-1 text-sm text-sage-500">
              {[
                'Quantum field memory integration',
                'Gebser structure assessment',
                'Autonomous agent status check',
                'Shadow pattern analysis',
                'Collective intelligence readiness'
              ].map((step, index) => (
                <motion.div
                  key={step}
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.3, duration: 0.5 }}
                >
                  <motion.div
                    className="w-2 h-2 bg-sage-400 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  />
                  <span>{step}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100 to-sage-200 flex items-center justify-center">
        <motion.div
          className="text-center space-y-6 max-w-md mx-auto p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-6xl">🌀</div>
          <div className="space-y-3">
            <h2 className="text-xl font-medium text-sage-800">
              Consciousness Field Disruption
            </h2>
            <p className="text-sage-600">
              {error}
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors"
            >
              Reconnect to Field
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!evolutionData) {
    return <div>No evolution data available</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100 to-sage-200">
      {/* Header Controls */}
      <motion.div
        className="bg-white/80 backdrop-blur-sm border-b border-sage-200 sticky top-0 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-sage-800">
              Consciousness Evolution Tracker
            </h1>
            <p className="text-sm text-sage-600">
              Last updated: {lastUpdate}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Real-time toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-sage-600">Real-time</span>
              <button
                onClick={toggleRealTime}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${realTimeEnabled ? 'bg-sage-500' : 'bg-sage-200'}
                `}
              >
                <span className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${realTimeEnabled ? 'translate-x-6' : 'translate-x-1'}
                `} />
              </button>
              {realTimeEnabled && (
                <motion.div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>

            {/* Manual refresh */}
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-sage-100 text-sage-700 rounded-lg hover:bg-sage-200 transition-colors"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Refresh'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <ConsciousnessEvolutionDashboard
          data={evolutionData.currentEvolution}
          realTimeUpdates={realTimeEnabled}
          showDetailedMetrics={true}
        />
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-center py-8 text-xs text-sage-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <p>Powered by Enhanced MAIA Field Integration (Phase III)</p>
        <p>Next update: {evolutionData.nextUpdateEstimate ?
          new Date(evolutionData.nextUpdateEstimate).toLocaleString() : 'Continuous'}</p>
      </motion.div>
    </div>
  );
}