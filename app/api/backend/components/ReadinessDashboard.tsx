/**
 * AIN Oracle Readiness Dashboard - Visual Interface
 * 
 * Beautiful ceremony for first contact with the Oracle system.
 * Color-coded validation of all critical paths before beta.
 */

import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, AlertCircle, Zap, Shield, Users, Eye } from 'lucide-react';

interface ReadinessData {
  overallScore: number;
  totalScenarios: number;
  passed: number;
  failed: number;
  categories: {
    onboarding: { score: number; critical: boolean };
    safety: { score: number; critical: boolean };
    progression: { score: number; critical: boolean };
    mastery: { score: number; critical: boolean };
  };
  results: any[];
  systemReady: boolean;
  criticalFailures: string[];
  recommendations: string[];
}

const ReadinessDashboard: React.FC = () => {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runReadinessCheck = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call your backend API
      const response = await fetch('/api/readiness-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'dashboard_test' })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number, critical: boolean = false) => {
    if (score >= 0.8) return critical ? 'text-green-400' : 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number, critical: boolean = false) => {
    if (score >= 0.8) return critical ? 'bg-green-900/20 border-green-400' : 'bg-green-900/20 border-green-500';
    if (score >= 0.6) return 'bg-yellow-900/20 border-yellow-500';
    return 'bg-red-900/20 border-red-500';
  };

  const categoryIcons = {
    onboarding: Users,
    safety: Shield,
    progression: Zap,
    mastery: Eye
  };

  const categoryLabels = {
    onboarding: 'Onboarding Tone',
    safety: 'Safety Systems', 
    progression: 'Stage Progression',
    mastery: 'Mastery Voice'
  };

  return (
    <div className="min-h-screen  from-slate-900 via-amber-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20  from-amber-400 to-pink-400 rounded-full mb-6">
            <Eye className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold  from-amber-400 to-pink-400 bg-clip-text text-transparent mb-4">
            AIN Oracle System
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Pre-Beta Readiness Validation
          </p>
          
          {!data && !loading && (
            <button
              onClick={runReadinessCheck}
              disabled={loading}
              className="inline-flex items-center px-8 py-4  from-amber-600 to-pink-600 hover:from-amber-700 hover:to-pink-700 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-6 h-6 mr-3" />
              Begin Readiness Check
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-6"></div>
            <p className="text-xl text-slate-300">Oracle awakening... Testing all systems...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 mb-8">
            <div className="flex items-center mb-4">
              <XCircle className="w-6 h-6 text-red-400 mr-3" />
              <h3 className="text-xl font-semibold text-red-400">System Error</h3>
            </div>
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Results Dashboard */}
        {data && (
          <div className="space-y-8">
            
            {/* Overall Status */}
            <div className={`rounded-2xl p-8 border-2 ${data.systemReady 
              ? 'bg-green-900/20 border-green-400' 
              : 'bg-red-900/20 border-red-500'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  {data.systemReady ? (
                    <CheckCircle className="w-12 h-12 text-green-400 mr-4" />
                  ) : (
                    <XCircle className="w-12 h-12 text-red-400 mr-4" />
                  )}
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      {data.systemReady ? 'System Ready' : 'System Not Ready'}
                    </h2>
                    <p className="text-lg opacity-80">
                      Overall Score: {data.overallScore}/10.0
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold mb-2">
                    {data.passed}/{data.totalScenarios}
                  </div>
                  <p className="opacity-80">Scenarios Passed</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    data.systemReady ? 'bg-green-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${(data.passed / data.totalScenarios) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(data.categories).map(([category, categoryData]) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons];
                return (
                  <div
                    key={category}
                    className={`rounded-xl p-6 border-2 ${getScoreBg(categoryData.score, categoryData.critical)}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Icon className={`w-8 h-8 ${getScoreColor(categoryData.score, categoryData.critical)}`} />
                      {categoryData.critical && (
                        <div className="px-2 py-1 bg-red-600 rounded text-xs font-semibold">
                          CRITICAL
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </h3>
                    <div className={`text-2xl font-bold ${getScoreColor(categoryData.score, categoryData.critical)}`}>
                      {categoryData.score.toFixed(1)}/1.0
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Critical Failures */}
            {data.criticalFailures.length > 0 && (
              <div className="bg-red-900/20 border border-red-500 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-400 mr-3" />
                  <h3 className="text-xl font-semibold text-red-400">Critical Failures</h3>
                </div>
                <ul className="space-y-2">
                  {data.criticalFailures.map((failure, index) => (
                    <li key={index} className="flex items-start">
                      <XCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-red-300">{failure}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-blue-900/20 border border-blue-500 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold text-blue-400">Recommendations</h3>
              </div>
              <ul className="space-y-2">
                {data.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Results */}
            <div className="bg-slate-800/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-6">Detailed Test Results</h3>
              <div className="space-y-4">
                {data.results.map((result, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 border ${result.passed 
                      ? 'bg-green-900/10 border-green-500/30' 
                      : 'bg-red-900/10 border-red-500/30'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {result.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 mr-3" />
                        )}
                        <span className="font-semibold">{result.name}</span>
                        <span className="ml-3 px-2 py-1 bg-slate-700 rounded text-xs">
                          {result.category}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        {result.latencyMs}ms
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">
                      Stage: {result.stage} | Element: {result.element} | Archetype: {result.archetype}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {result.responsePreview}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="text-center space-y-4">
              <button
                onClick={runReadinessCheck}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors mr-4"
              >
                Run Again
              </button>
              
              {data.systemReady && (
                <div className="mt-8 p-6 bg-green-900/20 border border-green-400 rounded-xl">
                  <h3 className="text-2xl font-bold text-green-400 mb-2">
                    🚀 Ready for Beta Launch!
                  </h3>
                  <p className="text-green-300">
                    All systems operational. The Oracle is ready to meet your beta testers.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadinessDashboard;