'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Download, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface VoiceLogEvent {
  timestamp: string;
  engine: string;
  mode: 'local' | 'api' | 'fallback';
  success: boolean;
  latencyMs?: number;
  fallbackReason?: string;
  error?: string;
  metadata?: Record<string, any>;
}

interface VoiceLogStats {
  total: number;
  successful: number;
  failed: number;
  byEngine: Record<string, { count: number; avgLatency?: number }>;
  recentFailures: Array<{
    timestamp: string;
    engine: string;
    error: string;
  }>;
  healthScore: number;
}

export function VoiceLogViewer() {
  const [logs, setLogs] = useState<VoiceLogEvent[]>([]);
  const [stats, setStats] = useState<VoiceLogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/voice/logs?limit=50&stats=true');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.recentEvents || []);
        setStats(data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch voice logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const downloadLogs = async () => {
    try {
      const response = await fetch('/api/voice/logs?limit=1000&format=text');
      const text = await response.text();
      
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download logs:', error);
    }
  };

  const getEngineColor = (engine: string) => {
    switch (engine) {
      case 'sesame': return 'text-green-600 bg-green-50';
      case 'huggingface': return 'text-yellow-600 bg-yellow-50';
      case 'elevenlabs': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Voice Engine Logs
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50' : ''}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchLogs}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={downloadLogs}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Statistics Summary */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats.healthScore}%</div>
              <div className="text-xs text-muted-foreground">Health Score</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
              <div className="text-xs text-muted-foreground">Successful</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        )}

        {/* Engine Performance */}
        {stats && Object.keys(stats.byEngine).length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Engine Performance</h3>
            <div className="space-y-2">
              {Object.entries(stats.byEngine).map(([engine, data]) => (
                <div key={engine} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm font-medium capitalize">{engine}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span>{data.count} calls</span>
                    {data.avgLatency && (
                      <Badge variant="outline">{Math.round(data.avgLatency)}ms avg</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Failures */}
        {stats && stats.recentFailures.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 text-red-600">Recent Failures</h3>
            <div className="space-y-1">
              {stats.recentFailures.map((failure, i) => (
                <div key={i} className="text-xs p-2 bg-red-50 rounded">
                  <span className="text-muted-foreground">{failure.timestamp}</span>
                  <span className="mx-2 font-medium">{failure.engine}</span>
                  <span className="text-red-600">{failure.error}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Log */}
        <div>
          <h3 className="text-sm font-medium mb-2">Recent Events</h3>
          <ScrollArea className="h-[300px] w-full rounded-md border p-2">
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 p-2 text-xs rounded ${
                    log.success ? 'hover:bg-green-50' : 'hover:bg-red-50'
                  }`}
                >
                  <span className="text-muted-foreground w-32 shrink-0">
                    {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                  </span>
                  
                  <Badge
                    variant="outline"
                    className={`shrink-0 ${getEngineColor(log.engine)}`}
                  >
                    {log.engine}
                  </Badge>
                  
                  <span className={`shrink-0 ${log.success ? 'text-green-600' : 'text-red-600'}`}>
                    {log.success ? '✅' : '❌'}
                  </span>
                  
                  <div className="flex-1">
                    {log.latencyMs && (
                      <span className="font-mono">{log.latencyMs}ms</span>
                    )}
                    {log.error && (
                      <span className="text-red-600 ml-2">{log.error}</span>
                    )}
                    {log.fallbackReason && (
                      <span className="text-yellow-600 ml-2">Fallback: {log.fallbackReason}</span>
                    )}
                    {log.metadata?.testMode && (
                      <Badge variant="outline" className="ml-2 text-xs">TEST</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}