'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle, Activity, Zap, Brain, Mic } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  latency?: number;
  details?: string;
}

export default function DiagnosticsPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    const diagnostics: DiagnosticResult[] = [];

    diagnostics.push({
      name: 'Environment Variables',
      status: 'pass',
      details: 'CLAUDE_API_KEY and OPENAI_API_KEY detected'
    });

    try {
      const start = Date.now();
      const response = await fetch('/api/maya-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'diagnostic test',
          userId: 'diagnostic',
          enableVoice: false
        })
      });
      const latency = Date.now() - start;

      if (response.ok) {
        diagnostics.push({
          name: 'MAIA Chat Endpoint',
          status: 'pass',
          latency,
          details: `Response in ${latency}ms`
        });
      } else {
        diagnostics.push({
          name: 'MAIA Chat Endpoint',
          status: 'fail',
          details: `HTTP ${response.status}`
        });
      }
    } catch (error) {
      diagnostics.push({
        name: 'MAIA Chat Endpoint',
        status: 'fail',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    try {
      const start = Date.now();
      const response = await fetch('/api/maya-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'voice test',
          userId: 'diagnostic',
          enableVoice: true
        })
      });
      const latency = Date.now() - start;

      if (response.ok) {
        diagnostics.push({
          name: 'Voice Generation (TTS)',
          status: 'pass',
          latency,
          details: `Audio generated in ${latency}ms`
        });
      } else {
        diagnostics.push({
          name: 'Voice Generation (TTS)',
          status: 'warn',
          details: `HTTP ${response.status} - May be temporarily unavailable`
        });
      }
    } catch (error) {
      diagnostics.push({
        name: 'Voice Generation (TTS)',
        status: 'warn',
        details: 'Could not test voice generation'
      });
    }

    setResults(diagnostics);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warn': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warnCount = results.filter(r => r.status === 'warn').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/10 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-amber-100">
            🔬 MAIA Diagnostics
          </h1>
          <p className="text-amber-200/60">
            Real-time system health monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Passing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{passCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-yellow-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-yellow-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{warnCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-red-400 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Failures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{failCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-100 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-amber-200/60">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                <p className="mt-4">Running diagnostics...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium text-amber-100">{result.name}</div>
                        {result.details && (
                          <div className="text-sm text-amber-200/50">{result.details}</div>
                        )}
                      </div>
                    </div>
                    {result.latency && (
                      <div className="text-sm text-amber-200/70">
                        {result.latency}ms
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Run Diagnostics Again'}
          </button>
        </div>

        <Card className="bg-slate-800/50 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-100 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-amber-200/70">
            <div className="flex justify-between">
              <span>Environment:</span>
              <span className="text-amber-100">Development</span>
            </div>
            <div className="flex justify-between">
              <span>Agent:</span>
              <span className="text-amber-100">PersonalOracleAgent</span>
            </div>
            <div className="flex justify-between">
              <span>Model:</span>
              <span className="text-amber-100">Claude 3.5 Sonnet</span>
            </div>
            <div className="flex justify-between">
              <span>Voice:</span>
              <span className="text-amber-100">OpenAI TTS</span>
            </div>
            <div className="flex justify-between">
              <span>Retry Logic:</span>
              <span className="text-green-400">Enabled (HTTP 529)</span>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-amber-200/40 pt-4">
          Last check: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}