'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  Calendar,
  Download,
  TrendingUp,
  Heart,
  Brain,
  Zap,
  Eye,
  MapPin,
  Star,
  Clock,
  Target,
  BarChart3,
  Activity,
  Compass,
  Moon,
  Sun,
  Globe,
  Users,
  ArrowRight,
  TrendingDown,
  Minus
} from 'lucide-react';

interface EmotionalDataPoint {
  timestamp: string;
  date: string;
  valence: number;
  arousal: number;
  dominance: number;
  archetype: string;
  intensity: number;
  context: string;
  hour: number;
  dayOfWeek: number;
}

interface ArchetypeEvolution {
  archetype: string;
  encounters: number;
  growth: number;
  color: string;
  icon: string;
  recentGrowth: number;
  dominantThemes: string[];
}

interface JourneyInsight {
  type: 'breakthrough' | 'pattern' | 'integration' | 'shadow' | 'daimonic';
  title: string;
  description: string;
  timestamp: string;
  impact: number;
  archetype?: string;
}

interface EmotionalHeatmapData {
  day: number;
  hour: number;
  intensity: number;
  valence: number;
  archetype: string;
}

const EvolutionDashboard = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [emotionalData, setEmotionalData] = useState<EmotionalDataPoint[]>([]);
  const [archetypeEvolution, setArchetypeEvolution] = useState<ArchetypeEvolution[]>([]);
  const [journeyInsights, setJourneyInsights] = useState<JourneyInsight[]>([]);
  const [heatmapData, setHeatmapData] = useState<EmotionalHeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'timeline' | 'patterns' | 'heatmap' | 'field-context'>('overview');
  
  // Cross-narrative state
  const [combinedData, setCombinedData] = useState<any>(null);
  const [showFieldContext, setShowFieldContext] = useState(false);

  useEffect(() => {
    generateEvolutionData();
    loadCombinedData();
  }, [timeRange]);

  const loadCombinedData = async () => {
    try {
      const response = await fetch(`/api/evolution/combined?timeframe=${timeRange}&userId=demo-user`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCombinedData(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading combined data:', error);
    }
  };

  const generateEvolutionData = () => {
    setIsLoading(true);
    
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const emotionalPoints: EmotionalDataPoint[] = [];
    const heatmapPoints: EmotionalHeatmapData[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Multiple data points per day for richer visualization
      const sessionsPerDay = Math.floor(Math.random() * 4) + 1;
      
      for (let session = 0; session < sessionsPerDay; session++) {
        const hour = Math.floor(Math.random() * 24);
        const dayOfWeek = date.getDay();
        
        // Create evolving emotional patterns based on archetypal cycles
        const archetypes = ['Hero', 'Sage', 'Creator', 'Lover', 'Seeker', 'Shadow'];
        const archetype = archetypes[Math.floor((i + session) * 0.7) % 6];
        
        // Archetypal emotional signatures
        let baseValence = 0.5, baseArousal = 0.5, baseDominance = 0.5;
        
        switch (archetype) {
          case 'Hero':
            baseValence = 0.6 + Math.sin(i * 0.1) * 0.2;
            baseArousal = 0.7 + Math.cos(i * 0.08) * 0.2;
            baseDominance = 0.8 + Math.sin(i * 0.06) * 0.1;
            break;
          case 'Sage':
            baseValence = 0.7 + Math.sin(i * 0.05) * 0.1;
            baseArousal = 0.3 + Math.cos(i * 0.12) * 0.2;
            baseDominance = 0.6 + Math.sin(i * 0.09) * 0.2;
            break;
          case 'Creator':
            baseValence = 0.8 + Math.sin(i * 0.15) * 0.1;
            baseArousal = 0.8 + Math.cos(i * 0.2) * 0.15;
            baseDominance = 0.7 + Math.sin(i * 0.11) * 0.2;
            break;
          case 'Lover':
            baseValence = 0.9 + Math.sin(i * 0.08) * 0.05;
            baseArousal = 0.6 + Math.cos(i * 0.14) * 0.3;
            baseDominance = 0.4 + Math.sin(i * 0.07) * 0.3;
            break;
          case 'Shadow':
            baseValence = 0.2 + Math.sin(i * 0.12) * 0.3;
            baseArousal = 0.7 + Math.cos(i * 0.09) * 0.2;
            baseDominance = 0.8 + Math.sin(i * 0.13) * 0.15;
            break;
          case 'Seeker':
            baseValence = 0.5 + Math.sin(i * 0.2) * 0.4;
            baseArousal = 0.6 + Math.cos(i * 0.18) * 0.3;
            baseDominance = 0.3 + Math.sin(i * 0.16) * 0.4;
            break;
        }
        
        const valence = Math.max(0, Math.min(1, baseValence + (Math.random() - 0.5) * 0.3));
        const arousal = Math.max(0, Math.min(1, baseArousal + (Math.random() - 0.5) * 0.2));
        const dominance = Math.max(0, Math.min(1, baseDominance + (Math.random() - 0.5) * 0.25));
        
        const intensity = (arousal + Math.abs(valence - 0.5) * 2 + dominance) / 3;
        
        emotionalPoints.push({
          timestamp: date.toISOString(),
          date: date.toISOString().split('T')[0],
          valence,
          arousal,
          dominance,
          archetype,
          intensity,
          context: ['Voice session', 'Text conversation', 'Daimonic encounter', 'Integration work', 'Shadow work'][Math.floor(Math.random() * 5)],
          hour,
          dayOfWeek
        });
        
        heatmapPoints.push({
          day: dayOfWeek,
          hour,
          intensity,
          valence,
          archetype
        });
      }
    }
    
    setEmotionalData(emotionalPoints);
    setHeatmapData(heatmapPoints);

    // Generate archetype evolution with growth trajectories
    const archetypes: ArchetypeEvolution[] = [
      { 
        archetype: 'Hero', 
        encounters: 45, 
        growth: 78, 
        recentGrowth: 12,
        color: '#dc2626', 
        icon: '⚔️',
        dominantThemes: ['Courage', 'Challenge', 'Victory']
      },
      { 
        archetype: 'Sage', 
        encounters: 38, 
        growth: 85, 
        recentGrowth: 8,
        color: '#2563eb', 
        icon: '🧙‍♀️',
        dominantThemes: ['Wisdom', 'Teaching', 'Integration']
      },
      { 
        archetype: 'Creator', 
        encounters: 52, 
        growth: 72, 
        recentGrowth: 15,
        color: '#7c3aed', 
        icon: '🎨',
        dominantThemes: ['Innovation', 'Expression', 'Birth']
      },
      { 
        archetype: 'Lover', 
        encounters: 41, 
        growth: 91, 
        recentGrowth: 22,
        color: '#ec4899', 
        icon: '💝',
        dominantThemes: ['Connection', 'Passion', 'Unity']
      },
      { 
        archetype: 'Seeker', 
        encounters: 35, 
        growth: 68, 
        recentGrowth: 9,
        color: '#059669', 
        icon: '🧭',
        dominantThemes: ['Quest', 'Discovery', 'Purpose']
      },
      { 
        archetype: 'Shadow', 
        encounters: 28, 
        growth: 95, 
        recentGrowth: 18,
        color: '#374151', 
        icon: '🌑',
        dominantThemes: ['Integration', 'Wholeness', 'Power']
      }
    ];
    
    setArchetypeEvolution(archetypes);

    // Generate insights with daimonic encounters
    const insights: JourneyInsight[] = [
      {
        type: 'breakthrough',
        title: 'Shadow Integration Breakthrough',
        description: 'Profound integration of shadow material led to 85% increase in emotional resilience and authentic power.',
        timestamp: '2 days ago',
        impact: 9.2,
        archetype: 'Shadow'
      },
      {
        type: 'daimonic',
        title: 'The Eternal Student Encounter',
        description: 'A powerful daimonic encounter revealed your pattern of seeking wisdom in unexpected places.',
        timestamp: '4 days ago',
        impact: 8.7,
        archetype: 'Seeker'
      },
      {
        type: 'pattern',
        title: 'Evening Reflection Rhythm',
        description: 'Your deepest insights consistently emerge during twilight hours, when the veil between worlds is thin.',
        timestamp: '5 days ago',
        impact: 7.8
      },
      {
        type: 'integration',
        title: 'Creator-Sage Synthesis',
        description: 'Beautiful fusion of creative fire and wise integration, leading to breakthrough in manifestation.',
        timestamp: '1 week ago',
        impact: 8.5,
        archetype: 'Creator'
      },
      {
        type: 'shadow',
        title: 'Authority & Personal Power',
        description: 'Recurring shadow encounters reveal ongoing alchemy with authority dynamics and sovereign power.',
        timestamp: '10 days ago',
        impact: 6.9,
        archetype: 'Shadow'
      },
      {
        type: 'breakthrough',
        title: 'Heart Opening Cascade',
        description: 'Series of Lover encounters led to profound heart opening and capacity for deeper connection.',
        timestamp: '2 weeks ago',
        impact: 9.1,
        archetype: 'Lover'
      }
    ];
    
    setJourneyInsights(insights);
    setIsLoading(false);
  };

  const downloadJourneyReport = async () => {
    const reportData = {
      title: "Spiralogic Evolution Report",
      timeRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalSessions: emotionalData.length,
        averageValence: (emotionalData.reduce((sum, d) => sum + d.valence, 0) / emotionalData.length * 100).toFixed(1),
        averageArousal: (emotionalData.reduce((sum, d) => sum + d.arousal, 0) / emotionalData.length * 100).toFixed(1),
        averageDominance: (emotionalData.reduce((sum, d) => sum + d.dominance, 0) / emotionalData.length * 100).toFixed(1),
        dominantArchetype: archetypeEvolution.reduce((prev, curr) => prev.growth > curr.growth ? prev : curr).archetype
      },
      archetypeEvolution,
      journeyInsights,
      emotionalPatterns: {
        peakIntensityHours: [...new Set(emotionalData.filter(d => d.intensity > 0.7).map(d => d.hour))],
        dominantContexts: [...new Set(emotionalData.map(d => d.context))],
        evolutionTrend: "Ascending spiral with deepening integration"
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spiralogic-evolution-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'breakthrough': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'pattern': return <BarChart3 className="w-4 h-4 text-blue-500" />;
      case 'integration': return <Target className="w-4 h-4 text-green-500" />;
      case 'shadow': return <Eye className="w-4 h-4 text-amber-500" />;
      case 'daimonic': return <Moon className="w-4 h-4 text-indigo-500" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const heatmapGrid = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({length: 24}, (_, i) => i);
    
    // Create intensity grid
    const intensityGrid = Array(7).fill(null).map(() => Array(24).fill(0));
    
    heatmapData.forEach(point => {
      if (intensityGrid[point.day] && intensityGrid[point.day][point.hour] !== undefined) {
        intensityGrid[point.day][point.hour] = Math.max(intensityGrid[point.day][point.hour], point.intensity);
      }
    });

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white/70 px-2">
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>12am</span>
        </div>
        {days.map((day, dayIndex) => (
          <div key={day} className="flex items-center space-x-1">
            <span className="text-xs text-white/70 w-10">{day}</span>
            <div className="flex space-x-1">
              {hours.map(hour => {
                const intensity = intensityGrid[dayIndex][hour];
                return (
                  <div
                    key={hour}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: intensity > 0 
                        ? `rgba(139, 92, 246, ${intensity})` 
                        : 'rgba(255, 255, 255, 0.1)'
                    }}
                    title={`${day} ${hour}:00 - Intensity: ${(intensity * 100).toFixed(0)}%`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen  from-amber-900 via-blue-900 to-indigo-900 p-6 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Mapping your evolutionary journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  from-amber-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center text-white space-y-4">
          <h1 className="text-4xl font-bold  from-amber-400 to-pink-400 bg-clip-text text-transparent">
            🌀 Evolution Dashboard
          </h1>
          <p className="text-xl text-amber-200">
            Witness your archetypal transformation and consciousness evolution
          </p>
          
          {/* Navigation */}
          <div className="flex justify-center space-x-4 flex-wrap">
            {(['overview', 'timeline', 'patterns', 'heatmap', 'field-context'] as const).map((view) => (
              <Button
                key={view}
                variant={activeView === view ? 'default' : 'outline'}
                onClick={() => setActiveView(view)}
                className="capitalize"
              >
                {view === 'heatmap' ? 'Heat Map' : 
                 view === 'field-context' ? 'Field Context' : 
                 view}
              </Button>
            ))}
          </div>
          
          {/* Time Range Selector */}
          <div className="flex justify-center space-x-2">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                onClick={() => setTimeRange(range)}
                className="text-sm"
                size="sm"
              >
                {range === 'all' ? 'All Time' : range.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Overview View */}
        {activeView === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-8 h-8 text-red-400" />
                    <div>
                      <p className="text-white/70 text-sm">Emotional Valence</p>
                      <p className="text-white text-2xl font-bold">
                        {(emotionalData.reduce((sum, d) => sum + d.valence, 0) / emotionalData.length * 100).toFixed(1)}%
                      </p>
                      <p className="text-white/50 text-xs">Average positivity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-8 h-8 text-yellow-400" />
                    <div>
                      <p className="text-white/70 text-sm">Evolutionary Intensity</p>
                      <p className="text-white text-2xl font-bold">
                        {(emotionalData.reduce((sum, d) => sum + d.intensity, 0) / emotionalData.length * 100).toFixed(1)}%
                      </p>
                      <p className="text-white/50 text-xs">Growth momentum</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Compass className="w-8 h-8 text-amber-400" />
                    <div>
                      <p className="text-white/70 text-sm">Dominant Archetype</p>
                      <p className="text-white text-lg font-bold">
                        {archetypeEvolution.reduce((prev, curr) => prev.growth > curr.growth ? prev : curr).icon}
                        {archetypeEvolution.reduce((prev, curr) => prev.growth > curr.growth ? prev : curr).archetype}
                      </p>
                      <p className="text-white/50 text-xs">Leading evolution</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Star className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-white/70 text-sm">Integration Score</p>
                      <p className="text-white text-2xl font-bold">
                        {Math.round(archetypeEvolution.reduce((sum, arch) => sum + arch.growth, 0) / archetypeEvolution.length)}%
                      </p>
                      <p className="text-white/50 text-xs">Overall synthesis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Archetype Evolution Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Star className="w-5 h-5" />
                    <span>Archetypal Evolution</span>
                    {combinedData && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveView('field-context')}
                        className="text-cyan-400 hover:text-cyan-300 ml-auto"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        vs Field
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {archetypeEvolution.map((archetype) => {
                      const collectiveComparison = combinedData?.insights?.find(
                        (insight: any) => insight.crossNarrative?.archetypalComparisons?.find(
                          (comp: any) => comp.archetype === archetype.archetype
                        )
                      );
                      const fieldAverage = collectiveComparison?.crossNarrative?.archetypalComparisons?.find(
                        (comp: any) => comp.archetype === archetype.archetype
                      )?.collectiveAverage || null;
                      
                      return (
                        <div key={archetype.archetype} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{archetype.icon}</span>
                              <div>
                                <span className="text-white font-medium text-lg">{archetype.archetype}</span>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                                    {archetype.encounters} encounters
                                  </Badge>
                                  {archetype.recentGrowth > 10 && (
                                    <Badge className="bg-green-500/20 text-green-300 text-xs">
                                      +{archetype.recentGrowth}% recent
                                    </Badge>
                                  )}
                                  {fieldAverage && (
                                    <Badge variant="outline" className="border-cyan-400/30 text-cyan-300 text-xs">
                                      field: {fieldAverage}%
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <span className="text-white text-2xl font-bold">{archetype.growth}%</span>
                                {fieldAverage && (
                                  <div className="flex items-center">
                                    {archetype.growth > fieldAverage + 10 && <TrendingUp className="w-4 h-4 text-green-400" />}
                                    {archetype.growth < fieldAverage - 10 && <TrendingDown className="w-4 h-4 text-orange-400" />}
                                    {Math.abs(archetype.growth - fieldAverage) <= 10 && <Minus className="w-4 h-4 text-blue-400" />}
                                  </div>
                                )}
                              </div>
                              <p className="text-white/50 text-xs">integration</p>
                            </div>
                          </div>
                          <div className="relative">
                            <Progress 
                              value={archetype.growth} 
                              className="h-3 bg-white/10"
                            />
                            {fieldAverage && (
                              <div 
                                className="absolute top-0 h-3 w-1 bg-cyan-400/60 rounded"
                                style={{ left: `${fieldAverage}%` }}
                                title={`Field average: ${fieldAverage}%`}
                              />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {archetype.dominantThemes.map((theme, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/80">
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Evolutionary Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {journeyInsights.slice(0, 4).map((insight, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getInsightIcon(insight.type)}
                            <span className="text-white font-medium">{insight.title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {insight.archetype && (
                              <span className="text-sm text-white/60">
                                {archetypeEvolution.find(a => a.archetype === insight.archetype)?.icon}
                              </span>
                            )}
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400" />
                              <span className="text-yellow-400 text-sm">{insight.impact}/10</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed">{insight.description}</p>
                        <div className="flex items-center space-x-1 text-white/50 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{insight.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Timeline View */}
        {activeView === 'timeline' && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Evolutionary Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={emotionalData.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.7)"
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis stroke="rgba(255,255,255,0.7)" domain={[0, 1]} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(0,0,0,0.9)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: 'white'
                      }}
                    />
                    <Line type="monotone" dataKey="valence" stroke="#ef4444" strokeWidth={3} name="Valence" dot={false} />
                    <Line type="monotone" dataKey="arousal" stroke="#f59e0b" strokeWidth={3} name="Arousal" dot={false} />
                    <Line type="monotone" dataKey="dominance" stroke="#8b5cf6" strokeWidth={3} name="Dominance" dot={false} />
                    <Line type="monotone" dataKey="intensity" stroke="#06d6a0" strokeWidth={3} name="Intensity" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patterns View */}
        {activeView === 'patterns' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Archetype Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={archetypeEvolution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="encounters"
                        label={({ archetype, percent }) => `${archetype} ${(percent * 100).toFixed(0)}%`}
                      >
                        {archetypeEvolution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Emotional Scatter Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        type="number" 
                        dataKey="valence" 
                        stroke="rgba(255,255,255,0.7)"
                        domain={[0, 1]}
                        name="Valence"
                      />
                      <YAxis 
                        type="number" 
                        dataKey="arousal" 
                        stroke="rgba(255,255,255,0.7)"
                        domain={[0, 1]}
                        name="Arousal"
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ 
                          background: 'rgba(0,0,0,0.9)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Scatter 
                        name="Emotional States" 
                        data={emotionalData.slice(-100)} 
                        fill="#8b5cf6"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
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
                <Sun className="w-5 h-5" />
                <span>Evolutionary Intensity Heatmap</span>
              </CardTitle>
              <p className="text-white/70 text-sm">
                Discover when your transformation is most active
              </p>
            </CardHeader>
            <CardContent>
              {heatmapGrid()}
              <div className="flex items-center justify-center mt-6 space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white/10 rounded"></div>
                  <span className="text-white/70 text-sm">Low</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-amber-400/50 rounded"></div>
                  <span className="text-white/70 text-sm">Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-amber-400 rounded"></div>
                  <span className="text-white/70 text-sm">High Intensity</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Field Context View */}
        {activeView === 'field-context' && combinedData && (
          <div className="space-y-6">
            {/* Cross-Narrative Banner */}
            <Card className=" from-cyan-900/40 via-blue-900/40 to-amber-900/40 backdrop-blur-sm border-cyan-400/30">
              <CardHeader>
                <CardTitle className="text-white text-center text-2xl">
                  🌊 Your Place in the Archetypal Field
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-white/95 text-lg leading-relaxed italic mb-4">
                  {combinedData.crossNarrative}
                </p>
                <p className="text-cyan-300 text-lg font-medium">
                  {combinedData.bridgeNarrative}
                </p>
                <Button
                  onClick={() => window.open('/dashboard/collective', '_blank')}
                  className="mt-4  from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  View Collective Dashboard
                </Button>
              </CardContent>
            </Card>

            {/* Field Position Analysis */}
            {combinedData.insights && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Compass className="w-5 h-5" />
                      <span>Field Position</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {combinedData.contribution && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-4xl mb-2">
                            {combinedData.contribution.resonanceType === 'aligned' && '🌊'}
                            {combinedData.contribution.resonanceType === 'leading' && '⚡'}
                            {combinedData.contribution.resonanceType === 'counterpoint' && '⚖️'}
                            {combinedData.contribution.resonanceType === 'balancing' && '🌱'}
                          </div>
                          <h3 className="text-white text-xl font-bold capitalize mb-2">
                            {combinedData.contribution.resonanceType} Resonance
                          </h3>
                          <p className="text-white/80 text-sm leading-relaxed">
                            You contribute <span className="font-bold text-cyan-300">
                            {combinedData.contribution.percentOfField}%</span> to the collective{' '}
                            <span className="font-bold">{combinedData.contribution.archetype}</span> current.
                          </p>
                        </div>
                        
                        <div className="bg-white/5 rounded-lg p-4">
                          <h4 className="text-white font-medium mb-2">Your vs Field</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/70">Your Growth:</span>
                              <span className="text-white font-bold">{combinedData.contribution.personalGrowth}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/70">Field Average:</span>
                              <span className="text-cyan-300 font-bold">{combinedData.contribution.fieldAverage}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/70">Difference:</span>
                              <span className={`font-bold ${
                                combinedData.contribution.personalGrowth > combinedData.contribution.fieldAverage 
                                  ? 'text-green-400' : 'text-orange-400'
                              }`}>
                                {combinedData.contribution.personalGrowth > combinedData.contribution.fieldAverage ? '+' : ''}
                                {combinedData.contribution.personalGrowth - combinedData.contribution.fieldAverage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>Temporal Alignment</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white/80 font-medium mb-2">Shared Peak Hours</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {[8, 9, 19, 20, 21].filter(hour => 
                            emotionalData.some(d => d.hour === hour && d.intensity > 0.7)
                          ).map(hour => (
                            <Badge key={hour} className="bg-green-500/20 text-green-300">
                              {hour}:00
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-white/80 font-medium mb-2">Your Unique Hours</h4>
                        <div className="flex flex-wrap gap-2">
                          {[6, 7, 22, 23].filter(hour => 
                            emotionalData.some(d => d.hour === hour && d.intensity > 0.6)
                          ).map(hour => (
                            <Badge key={hour} className="bg-amber-500/20 text-amber-300">
                              {hour}:00
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-white/80 text-sm leading-relaxed">
                          Your transformation rhythm {emotionalData.filter(d => [8,9,19,20,21].includes(d.hour) && d.intensity > 0.7).length > 5 ? 
                            'flows in harmony with the collective pulse, amplifying shared breakthroughs.' :
                            'dances to its own sacred timing, accessing deeper currents when the field is quieter.'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Cross-Navigation */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => setActiveView('overview')}
                variant="outline"
                className="border-amber-500/20 hover:bg-amber-500/10"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Personal View
              </Button>
              <Button
                onClick={() => window.open('/dashboard/collective', '_blank')}
                className=" from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                <Globe className="w-4 h-4 mr-2" />
                Explore Collective Field
              </Button>
            </div>
          </div>
        )}

        {/* Download Report */}
        {activeView !== 'field-context' && (
          <div className="text-center">
            <Button 
              onClick={downloadJourneyReport}
              className=" from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white px-8 py-4 text-lg"
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Evolution Report
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvolutionDashboard;