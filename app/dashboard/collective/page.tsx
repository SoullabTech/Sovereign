'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  Globe,
  Users,
  TrendingUp,
  Activity,
  Clock,
  Sparkles,
  Eye,
  Brain,
  Heart,
  Moon,
  Sun,
  Zap,
  Compass
} from 'lucide-react';
import { CollectiveService, CollectiveStats, ArchetypeInsight, CollectivePattern } from '@/lib/services/CollectiveService';
import RitualTransition from '@/components/RitualTransition';
import ConstellationMap from '@/components/ConstellationMap';

const CollectiveDashboard = () => {
  const [stats, setStats] = useState<CollectiveStats | null>(null);
  const [archetypeInsights, setArchetypeInsights] = useState<ArchetypeInsight[]>([]);
  const [collectivePatterns, setCollectivePatterns] = useState<CollectivePattern[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'patterns' | 'heatmap' | 'narrative' | 'constellation'>('overview');
  const [showTransition, setShowTransition] = useState(false);
  
  // User contribution state
  const [userContribution, setUserContribution] = useState<any>(null);
  const [crossNarrative, setCrossNarrative] = useState<string>('');

  useEffect(() => {
    loadCollectiveData();
  }, [timeframe]);

  const loadCollectiveData = async () => {
    setIsLoading(true);
    try {
      // Try to load combined data first (includes user contribution)
      const combinedResponse = await fetch(`/api/evolution/combined?timeframe=${timeframe}&userId=demo-user`);
      if (combinedResponse.ok) {
        const combinedResult = await combinedResponse.json();
        if (combinedResult.success) {
          setStats(combinedResult.data.collective);
          setUserContribution(combinedResult.data.contribution);
          setCrossNarrative(combinedResult.data.crossNarrative);
        }
      } else {
        // Fallback to collective-only data
        const collectiveService = CollectiveService.getInstance();
        const statsData = await collectiveService.fetchCollectiveStats(timeframe);
        setStats(statsData);
      }
      
      const collectiveService = CollectiveService.getInstance();
      const [insights, patterns] = await Promise.all([
        collectiveService.getArchetypeInsights(timeframe),
        collectiveService.getCollectivePatterns(timeframe)
      ]);
      
      setArchetypeInsights(insights);
      setCollectivePatterns(patterns);
    } catch (error) {
      console.error('Error loading collective data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatHeatmapData = () => {
    if (!stats) return [];
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const heatmapData = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const hourData: any = { hour: `${hour}:00` };
      days.forEach((day, dayIndex) => {
        hourData[day] = stats.collectiveHeatmap[dayIndex][hour];
      });
      heatmapData.push(hourData);
    }
    
    return heatmapData;
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'temporal': return <Clock className="w-4 h-4" />;
      case 'archetypal': return <Compass className="w-4 h-4" />;
      case 'seasonal': return <Sun className="w-4 h-4" />;
      case 'emergence': return <Sparkles className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const renderHeatmapGrid = () => {
    if (!stats) return null;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({length: 24}, (_, i) => i);

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white/70 px-2 ml-10">
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>12am</span>
        </div>
        {days.map((day, dayIndex) => (
          <div key={day} className="flex items-center space-x-1">
            <span className="text-xs text-white/70 w-8 text-right">{day}</span>
            <div className="flex space-x-0.5">
              {hours.map(hour => {
                const intensity = stats.collectiveHeatmap[dayIndex][hour];
                return (
                  <div
                    key={hour}
                    className="w-4 h-4 rounded-sm border border-white/10"
                    style={{
                      backgroundColor: intensity > 0.1 
                        ? `rgba(139, 92, 246, ${intensity * 0.8 + 0.2})` 
                        : 'rgba(255, 255, 255, 0.05)'
                    }}
                    title={`${day} ${hour}:00 - Intensity: ${Math.round(intensity * 100)}%`}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-white/10 rounded"></div>
            <span className="text-white/70">Low</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-amber-400/50 rounded"></div>
            <span className="text-white/70">Medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-amber-400 rounded"></div>
            <span className="text-white/70">High</span>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen  from-amber-900 via-blue-900 to-indigo-900 p-6 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Reading the collective field...</p>
          <p className="text-sm text-white/60 mt-2">Gathering archetypal currents from the depths</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen  from-amber-900 via-blue-900 to-indigo-900 p-6 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Unable to Read the Field</h2>
          <p className="text-white/70 mb-6">The collective currents are temporarily obscured</p>
          <Button onClick={loadCollectiveData} className="bg-amber-600 hover:bg-amber-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  from-amber-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center text-white space-y-4">
          <h1 className="text-4xl font-bold  from-blue-400 to-amber-400 bg-clip-text text-transparent">
            🌍 Collective Evolution
          </h1>
          <p className="text-xl text-blue-200">
            Witnessing the archetypal currents flowing through human consciousness
          </p>
          
          {/* Navigation */}
          <div className="flex justify-center space-x-4 flex-wrap">
            {(['overview', 'patterns', 'heatmap', 'narrative', 'constellation'] as const).map((view) => (
              <Button
                key={view}
                variant={activeView === view ? 'default' : 'outline'}
                onClick={() => {
                  if (view === 'constellation' && activeView !== 'constellation') {
                    setShowTransition(true);
                    setTimeout(() => setActiveView(view), 2000);
                  } else {
                    setActiveView(view);
                  }
                }}
                className="capitalize"
              >
                {view === 'constellation' ? '🌌 Constellation' : view}
              </Button>
            ))}
          </div>
          
          {/* Time Range Selector */}
          <div className="flex justify-center space-x-2">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <Button
                key={range}
                variant={timeframe === range ? 'default' : 'outline'}
                onClick={() => setTimeframe(range)}
                className="text-sm"
                size="sm"
              >
                {range === 'all' ? 'All Time' : range.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Overview */}
        {activeView === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Users className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-white/70 text-sm">Total Encounters</p>
                      <p className="text-white text-2xl font-bold">
                        {stats.totalEncounters.toLocaleString()}
                      </p>
                      <p className="text-white/50 text-xs">Collective activations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                    <div>
                      <p className="text-white/70 text-sm">Growth Rate</p>
                      <p className="text-white text-2xl font-bold">
                        {stats.growthTrends.totalGrowthRate}
                      </p>
                      <p className="text-white/50 text-xs">This {timeframe}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Compass className="w-8 h-8 text-amber-400" />
                    <div>
                      <p className="text-white/70 text-sm">Dominant Field</p>
                      <p className="text-white text-lg font-bold">
                        {archetypeInsights[0]?.icon} {stats.growthTrends.dominantArchetype}
                      </p>
                      <p className="text-white/50 text-xs">Leading the current</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-8 h-8 text-yellow-400" />
                    <div>
                      <p className="text-white/70 text-sm">Integration Rate</p>
                      <p className="text-white text-2xl font-bold">
                        {stats.growthTrends.integrationRate}
                      </p>
                      <p className="text-white/50 text-xs">Collective synthesis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Contribution Banner */}
            {userContribution && (
              <Card className=" from-indigo-900/40 to-amber-900/40 backdrop-blur-sm border-indigo-400/30">
                <CardHeader>
                  <CardTitle className="text-white text-center text-xl">
                    🌊 Your Contribution to the Field
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <div className="text-3xl mb-1">
                        {archetypeInsights.find(a => a.archetype === userContribution.archetype)?.icon || '🔮'}
                      </div>
                      <p className="text-white font-bold">{userContribution.archetype}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-indigo-300">{userContribution.percentOfField}%</p>
                      <p className="text-white/70 text-sm">of field current</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-1">
                        {userContribution.resonanceType === 'aligned' && '🌊'}
                        {userContribution.resonanceType === 'leading' && '⚡'}
                        {userContribution.resonanceType === 'counterpoint' && '⚖️'}
                        {userContribution.resonanceType === 'balancing' && '🌱'}
                      </div>
                      <p className="text-white/80 text-sm capitalize">{userContribution.resonanceType}</p>
                    </div>
                  </div>
                  
                  {crossNarrative && (
                    <div className="bg-white/10 rounded-lg p-4 mt-4">
                      <p className="text-white/90 text-sm leading-relaxed italic">
                        {crossNarrative}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => window.open('/dashboard/evolution', '_blank')}
                    variant="outline"
                    className="border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/10"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Personal Evolution
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Archetype Distribution & Emerging Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Archetypal Field Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={archetypeInsights.map(insight => ({
                            name: insight.archetype,
                            value: insight.percentage,
                            icon: insight.icon,
                            color: insight.color
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value, icon }) => `${icon} ${name}: ${value}%`}
                        >
                          {archetypeInsights.map((insight, index) => (
                            <Cell key={`cell-${index}`} fill={insight.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            background: 'rgba(0,0,0,0.9)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-3">
                    {archetypeInsights.slice(0, 3).map((insight) => (
                      <div key={insight.archetype} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{insight.icon}</span>
                          <span className="text-white font-medium">{insight.archetype}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white text-sm">{insight.percentage}%</span>
                          <Badge 
                            className={`text-xs ${
                              insight.trend === 'rising' ? 'bg-green-500/20 text-green-300' :
                              insight.trend === 'declining' ? 'bg-red-500/20 text-red-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}
                          >
                            {insight.trend === 'rising' && '↗'} 
                            {insight.trend === 'declining' && '↘'} 
                            {insight.trend === 'stable' && '→'}
                            {Math.abs(insight.weeklyChange)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Emerging Patterns</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentPatterns.map((pattern, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 space-y-2">
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-white/90 text-sm leading-relaxed">{pattern}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Patterns View */}
        {activeView === 'patterns' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Collective Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {collectivePatterns.map((pattern, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getPatternIcon(pattern.type)}
                          <span className="text-white font-medium">{pattern.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={pattern.strength * 100} className="w-16 h-2" />
                          <span className="text-white/60 text-xs">{Math.round(pattern.strength * 100)}%</span>
                        </div>
                      </div>
                      <p className="text-white/80 text-sm">{pattern.description}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-white/10 text-white/70 text-xs">
                          {pattern.timeframe}
                        </Badge>
                        <div className="flex space-x-1">
                          {pattern.affectedArchetypes.map((archetype, idx) => (
                            <span key={idx} className="text-xs text-white/60">
                              {archetypeInsights.find(a => a.archetype === archetype)?.icon || '🔮'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Temporal Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white/80 font-medium mb-2">Peak Days</h4>
                    <div className="flex flex-wrap gap-2">
                      {stats.temporalInsights.peakDays.map((day) => (
                        <Badge key={day} className="bg-blue-500/20 text-blue-300">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white/80 font-medium mb-2">Peak Hours</h4>
                    <div className="flex flex-wrap gap-2">
                      {stats.temporalInsights.peakHours.map((hour) => (
                        <Badge key={hour} className="bg-amber-500/20 text-amber-300">
                          {hour}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white/80 font-medium mb-2">Pattern Rhythms</h4>
                    <div className="space-y-2 text-sm text-white/70">
                      <p><strong>Weekends:</strong> {stats.temporalInsights.weekendPattern}</p>
                      <p><strong>Weekdays:</strong> {stats.temporalInsights.weekdayPattern}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Heatmap View */}
        {activeView === 'heatmap' && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Collective Activity Heatmap</span>
              </CardTitle>
              <p className="text-white/70 text-sm">
                When the collective field is most active throughout the week
              </p>
            </CardHeader>
            <CardContent>
              {renderHeatmapGrid()}
            </CardContent>
          </Card>
        )}

        {/* Constellation View */}
        {activeView === 'constellation' && (
          <div className="space-y-6">
            <ConstellationMap />
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Sacred Geometry Insight</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 leading-relaxed text-lg">
                  You are both individual star and part of the greater constellation. 
                  Your unique light contributes to the archetypal field while being held 
                  within the collective wisdom. Notice how your personal journey resonates 
                  with the larger patterns of human consciousness unfolding.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Narrative View */}
        {activeView === 'narrative' && (
          <div className="space-y-6">
            {/* Oracle Reading Card */}
            {stats.oracleNarrative && (
              <Card className=" from-amber-900/40 via-indigo-900/40 to-blue-900/40 backdrop-blur-sm border-amber-400/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-white flex items-center justify-center space-x-2 text-2xl">
                    <Eye className="w-6 h-6" />
                    <span>Oracle Reading</span>
                  </CardTitle>
                  <Badge className="mx-auto bg-amber-500/20 text-amber-200 capitalize">
                    {stats.oracleNarrative.tone} Voice
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Opening */}
                  <div className="text-center">
                    <p className="text-white/95 text-lg leading-relaxed italic">
                      {stats.oracleNarrative.opening}
                    </p>
                  </div>

                  {/* Archetypal Reading */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
                      <Compass className="w-4 h-4" />
                      <span>Archetypal Reading</span>
                    </h3>
                    <p className="text-white/90 leading-relaxed whitespace-pre-line">
                      {stats.oracleNarrative.archetypalReading}
                    </p>
                  </div>

                  {/* Temporal Insight */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Temporal Insight</span>
                    </h3>
                    <p className="text-white/90 leading-relaxed">
                      {stats.oracleNarrative.temporalInsight}
                    </p>
                  </div>

                  {/* Collective Guidance */}
                  <div className=" from-cyan-900/30 to-blue-900/30 rounded-lg p-6 border border-cyan-400/20">
                    <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span>Collective Guidance</span>
                    </h3>
                    <p className="text-white/95 leading-relaxed text-lg">
                      {stats.oracleNarrative.collectiveGuidance}
                    </p>
                  </div>

                  {/* Closing */}
                  <div className="text-center border-t border-white/10 pt-6">
                    <p className="text-white/90 text-lg leading-relaxed italic">
                      {stats.oracleNarrative.closing}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seasonal Narrative */}
            {stats.seasonalNarrative && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Sun className="w-5 h-5" />
                    <span>Seasonal Current</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90 leading-relaxed text-lg">
                    {stats.seasonalNarrative}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Archetypal Field Summary */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Archetypal Field Essence</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {archetypeInsights.slice(0, 6).map((insight) => (
                    <div key={insight.archetype} className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                          style={{ backgroundColor: insight.color + '20', border: `1px solid ${insight.color}40` }}
                        >
                          {insight.icon}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{insight.archetype}</h4>
                          <p className="text-white/60 text-sm">{insight.percentage}% of field</p>
                          <Badge 
                            className={`text-xs mt-1 ${
                              insight.trend === 'rising' ? 'bg-green-500/20 text-green-300' :
                              insight.trend === 'declining' ? 'bg-red-500/20 text-red-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}
                          >
                            {insight.trend === 'rising' && '↗'} 
                            {insight.trend === 'declining' && '↘'} 
                            {insight.trend === 'stable' && '→'}
                            {insight.trend} {Math.abs(insight.weeklyChange)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {insight.dominantThemes.slice(0, 3).map((theme, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/70">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    
      <RitualTransition 
        trigger={showTransition} 
        onComplete={() => setShowTransition(false)}
      />
    </div>
  );
};

export default CollectiveDashboard;