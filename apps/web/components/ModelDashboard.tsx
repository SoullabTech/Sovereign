/**
 * MAIA Real-time Model Performance Dashboard
 * Live monitoring and analytics for local model ecosystem
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ModelMetrics {
  modelId: string;
  status: 'healthy' | 'degraded' | 'unavailable';
  responseTime: number;
  tokensPerSecond: number;
  memoryUsage: number;
  requestCount: number;
  errorRate: number;
  qualityScore: number;
  consciousnessLevelUsage: Record<number, number>;
  lastUsed: number;
}

interface SystemMetrics {
  totalRAM: number;
  usedRAM: number;
  activeModels: number;
  totalRequests: number;
  averageResponseTime: number;
  systemLoad: number;
}

export function ModelDashboard() {
  const [metrics, setMetrics] = useState<ModelMetrics[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simulate real-time data updates
  useEffect(() => {
    const fetchMetrics = async () => {
      // In real implementation, this would fetch from your analytics API
      const mockMetrics: ModelMetrics[] = [
        {
          modelId: 'deepseek-r1:latest',
          status: 'healthy',
          responseTime: 2800,
          tokensPerSecond: 45,
          memoryUsage: 5200,
          requestCount: 156,
          errorRate: 0.02,
          qualityScore: 0.92,
          consciousnessLevelUsage: { 1: 20, 2: 35, 3: 45, 4: 35, 5: 21 },
          lastUsed: Date.now() - 30000
        },
        {
          modelId: 'llama3.1:70b',
          status: 'healthy',
          responseTime: 5200,
          tokensPerSecond: 28,
          memoryUsage: 42000,
          requestCount: 89,
          errorRate: 0.01,
          qualityScore: 0.95,
          consciousnessLevelUsage: { 1: 5, 2: 15, 3: 25, 4: 65, 5: 85 },
          lastUsed: Date.now() - 120000
        },
        {
          modelId: 'llama3.1:8b',
          status: 'healthy',
          responseTime: 1200,
          tokensPerSecond: 85,
          memoryUsage: 4900,
          requestCount: 234,
          errorRate: 0.03,
          qualityScore: 0.78,
          consciousnessLevelUsage: { 1: 120, 2: 85, 3: 29, 4: 0, 5: 0 },
          lastUsed: Date.now() - 5000
        },
        {
          modelId: 'mistral:7b',
          status: 'healthy',
          responseTime: 950,
          tokensPerSecond: 95,
          memoryUsage: 4400,
          requestCount: 178,
          errorRate: 0.04,
          qualityScore: 0.72,
          consciousnessLevelUsage: { 1: 145, 2: 33, 3: 0, 4: 0, 5: 0 },
          lastUsed: Date.now() - 15000
        },
        {
          modelId: 'nous-hermes2-mixtral:8x7b',
          status: 'degraded',
          responseTime: 8500,
          tokensPerSecond: 22,
          memoryUsage: 26000,
          requestCount: 45,
          errorRate: 0.08,
          qualityScore: 0.88,
          consciousnessLevelUsage: { 1: 2, 2: 8, 3: 15, 4: 20, 5: 0 },
          lastUsed: Date.now() - 300000
        }
      ];

      setMetrics(mockMetrics);

      const mockSystemMetrics: SystemMetrics = {
        totalRAM: 48000,
        usedRAM: 32000,
        activeModels: mockMetrics.filter(m => m.status === 'healthy').length,
        totalRequests: mockMetrics.reduce((sum, m) => sum + m.requestCount, 0),
        averageResponseTime: mockMetrics.reduce((sum, m) => sum + m.responseTime, 0) / mockMetrics.length,
        systemLoad: 0.65
      };

      setSystemMetrics(mockSystemMetrics);
    };

    fetchMetrics();

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unavailable': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'healthy': return 'default';
      case 'degraded': return 'outline';
      case 'unavailable': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatBytes = (bytes: number) => {
    return `${(bytes / 1024).toFixed(1)} GB`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  // Prepare chart data
  const responseTimeData = metrics.map(m => ({
    name: m.modelId.split(':')[0],
    time: m.responseTime,
    tokens: m.tokensPerSecond
  }));

  const consciousnessLevelData = [
    { level: 'Level 1', usage: metrics.reduce((sum, m) => sum + (m.consciousnessLevelUsage[1] || 0), 0) },
    { level: 'Level 2', usage: metrics.reduce((sum, m) => sum + (m.consciousnessLevelUsage[2] || 0), 0) },
    { level: 'Level 3', usage: metrics.reduce((sum, m) => sum + (m.consciousnessLevelUsage[3] || 0), 0) },
    { level: 'Level 4', usage: metrics.reduce((sum, m) => sum + (m.consciousnessLevelUsage[4] || 0), 0) },
    { level: 'Level 5', usage: metrics.reduce((sum, m) => sum + (m.consciousnessLevelUsage[5] || 0), 0) }
  ];

  const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Model Performance Dashboard</h1>
          <p className="text-muted-foreground">Real-time monitoring of MAIA's local model ecosystem</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '⏸️' : '▶️'} Auto Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Memory Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(systemMetrics.usedRAM)}</div>
              <div className="text-sm text-muted-foreground">of {formatBytes(systemMetrics.totalRAM)}</div>
              <Progress
                value={(systemMetrics.usedRAM / systemMetrics.totalRAM) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.activeModels}</div>
              <div className="text-sm text-muted-foreground">models running</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.totalRequests}</div>
              <div className="text-sm text-muted-foreground">in last {timeRange}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(systemMetrics.averageResponseTime)}ms</div>
              <div className="text-sm text-muted-foreground">across all models</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Health Status */}
            <Card>
              <CardHeader>
                <CardTitle>Model Health Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.map((model) => (
                    <div key={model.modelId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(model.status)}`} />
                        <div>
                          <div className="font-medium">{model.modelId}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatBytes(model.memoryUsage)} • {model.tokensPerSecond} tok/s
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusBadgeVariant(model.status)}>
                          {model.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatTimeAgo(model.lastUsed)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Response Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'time' ? `${value}ms` : `${value} tok/s`,
                        name === 'time' ? 'Response Time' : 'Tokens/Second'
                      ]}
                    />
                    <Bar dataKey="time" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Consciousness Level Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Consciousness Level Usage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-8">
                <div className="w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={consciousnessLevelData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="usage"
                        label
                      >
                        {consciousnessLevelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-1/2 space-y-2">
                  {consciousnessLevelData.map((level, index) => (
                    <div key={level.level} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: pieColors[index] }}
                        />
                        <span>{level.level}</span>
                      </div>
                      <span className="font-medium">{level.usage} requests</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Model Quality Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.map((model) => (
                    <div key={model.modelId}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{model.modelId}</span>
                        <span className="text-sm text-muted-foreground">
                          {(model.qualityScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={model.qualityScore * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Error Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Error Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.map((model) => (
                    <div key={model.modelId} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{model.modelId}</span>
                      <Badge variant={model.errorRate > 0.05 ? "destructive" : "default"}>
                        {(model.errorRate * 100).toFixed(2)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics Table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Detailed Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Model</th>
                        <th className="text-left p-2">Response Time</th>
                        <th className="text-left p-2">Tokens/Sec</th>
                        <th className="text-left p-2">Memory</th>
                        <th className="text-left p-2">Requests</th>
                        <th className="text-left p-2">Quality</th>
                        <th className="text-left p-2">Error Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((model) => (
                        <tr key={model.modelId} className="border-b">
                          <td className="p-2 font-medium">{model.modelId}</td>
                          <td className="p-2">{model.responseTime}ms</td>
                          <td className="p-2">{model.tokensPerSecond}</td>
                          <td className="p-2">{formatBytes(model.memoryUsage)}</td>
                          <td className="p-2">{model.requestCount}</td>
                          <td className="p-2">{(model.qualityScore * 100).toFixed(1)}%</td>
                          <td className="p-2">
                            <Badge variant={model.errorRate > 0.05 ? "destructive" : "default"}>
                              {(model.errorRate * 100).toFixed(2)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Usage by Consciousness Level */}
            {metrics.map((model) => (
              <Card key={model.modelId}>
                <CardHeader>
                  <CardTitle>{model.modelId} Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((level) => {
                      const usage = model.consciousnessLevelUsage[level] || 0;
                      const maxUsage = Math.max(...Object.values(model.consciousnessLevelUsage));
                      const percentage = maxUsage > 0 ? (usage / maxUsage) * 100 : 0;

                      return (
                        <div key={level}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Level {level}</span>
                            <span className="text-sm text-muted-foreground">{usage} requests</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Optimization Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-3">
                    <div className="font-medium text-orange-600">⚡ Speed Optimization</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Consider quantizing llama3.1:70b to Q4_K_M for 2x speed improvement
                    </p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="font-medium text-blue-600">🧠 Model Selection</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use deepseek-r1:latest for Level 3+ consciousness tasks (best quality/speed ratio)
                    </p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="font-medium text-green-600">💾 Memory Optimization</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Current memory usage: 67%. Consider unloading unused models.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Model Efficiency Score */}
            <Card>
              <CardHeader>
                <CardTitle>Model Efficiency Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.map((model) => {
                    // Calculate efficiency score (quality/speed ratio)
                    const efficiency = (model.qualityScore * model.tokensPerSecond) / (model.responseTime / 1000);
                    const maxEfficiency = Math.max(...metrics.map(m =>
                      (m.qualityScore * m.tokensPerSecond) / (m.responseTime / 1000)
                    ));
                    const score = (efficiency / maxEfficiency) * 100;

                    return (
                      <div key={model.modelId}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{model.modelId}</span>
                          <span className="text-sm text-muted-foreground">
                            {score.toFixed(1)}% efficiency
                          </span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}