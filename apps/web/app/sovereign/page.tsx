'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Server, Database, Cpu, HardDrive, Wifi, CloudCog, GitBranch, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface FieldStatus {
  maia: { status: 'online' | 'offline' | 'error'; uptime?: string; memory?: string };
  tunnel: { status: 'online' | 'offline' | 'error'; connections?: number };
  dns: { status: 'propagated' | 'pending' | 'error'; nameservers?: string[] };
  ollama: { status: 'online' | 'offline' | 'error'; model?: string };
  supabase: { status: 'online' | 'offline' | 'error' };
  system: { cpu?: number; memory?: number; disk?: number };
  lastCheck: Date;
}

export default function SovereignFieldPage() {
  const [fieldState, setFieldState] = useState<FieldStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const checkFieldHealth = async () => {
    try {
      const response = await fetch('/api/sovereign/field-state');
      const data = await response.json();
      setFieldState(data);
    } catch (error) {
      console.error('Failed to fetch field state:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkFieldHealth();

    if (autoRefresh) {
      const interval = setInterval(checkFieldHealth, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'propagated':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'offline':
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'propagated':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'offline':
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Sovereign Field
          </h1>
          <p className="text-muted-foreground mt-2">
            Infrastructure consciousness monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            <Activity className={autoRefresh ? 'animate-pulse' : ''} />
            {autoRefresh ? 'Live' : 'Paused'}
          </Button>
          <Button onClick={checkFieldHealth} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Field Coherence
          </CardTitle>
          <CardDescription>
            Last checked: {fieldState?.lastCheck ? new Date(fieldState.lastCheck).toLocaleTimeString() : 'Never'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* MAIA Status */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <Server className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="font-semibold">MAIA Application</p>
                  <p className="text-sm text-muted-foreground">{fieldState?.maia.uptime || 'Unknown'}</p>
                </div>
              </div>
              {getStatusIcon(fieldState?.maia.status || 'offline')}
            </div>

            {/* Tunnel Status */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <CloudCog className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-semibold">Cloudflare Tunnel</p>
                  <p className="text-sm text-muted-foreground">
                    {fieldState?.tunnel.connections || 0} connections
                  </p>
                </div>
              </div>
              {getStatusIcon(fieldState?.tunnel.status || 'offline')}
            </div>

            {/* DNS Status */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <Wifi className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-semibold">DNS Status</p>
                  <p className="text-sm text-muted-foreground">
                    {fieldState?.dns.status === 'propagated' ? 'Propagated' : 'Pending'}
                  </p>
                </div>
              </div>
              {getStatusIcon(fieldState?.dns.status || 'pending')}
            </div>

            {/* Ollama/DeepSeek */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <Cpu className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="font-semibold">Local LLM</p>
                  <p className="text-sm text-muted-foreground">{fieldState?.ollama.model || 'DeepSeek-R1'}</p>
                </div>
              </div>
              {getStatusIcon(fieldState?.ollama.status || 'offline')}
            </div>

            {/* Supabase */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-teal-500" />
                <div>
                  <p className="font-semibold">Local Database</p>
                  <p className="text-sm text-muted-foreground">Supabase</p>
                </div>
              </div>
              {getStatusIcon(fieldState?.supabase.status || 'offline')}
            </div>

            {/* System Resources */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <HardDrive className="w-8 h-8 text-pink-500" />
                <div>
                  <p className="font-semibold">System Health</p>
                  <p className="text-sm text-muted-foreground">
                    CPU: {fieldState?.system.cpu || 0}% | RAM: {fieldState?.system.memory || 0}%
                  </p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Sovereign Operations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Server className="w-4 h-4" />
              View PM2 Logs
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <CloudCog className="w-4 h-4" />
              Tunnel Status
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <GitBranch className="w-4 h-4" />
              Deploy Update
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Activity className="w-4 h-4" />
              System Metrics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Sovereignty Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Application:</span>
              <Badge variant="outline">Next.js 14</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">LLM:</span>
              <Badge variant="outline">DeepSeek-R1 (Local)</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database:</span>
              <Badge variant="outline">Supabase (Local)</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Process Manager:</span>
              <Badge variant="outline">PM2</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Public Access:</span>
              <Badge variant="outline">Cloudflare Tunnel</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Domain:</span>
              <Badge variant="outline">soullab.life</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
