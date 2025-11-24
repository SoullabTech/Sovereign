/**
 * Enhanced Collective Daimonic Dashboard
 * Reveals the commons of encounter while preserving mystery
 * Users see themselves as part of living archetypal weather system
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';

interface DashboardData {
  fieldStatus: {
    condition: 'calm' | 'charged' | 'clear' | 'stormy';
    intensity: number;
    description: string;
    tricksterRisk: number;
  };
  archetypalPatterns: Array<{
    archetype: string;
    element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    phase: string;
    activation: number;
    themes: string[];
    participantCount: number;
  }>;
  intensityTimeSeries: Array<{
    timestamp: Date;
    intensity: number;
    tension: number;
    surprise: number;
    lunarPhase?: 'new' | 'waxing' | 'full' | 'waning';
    seasonalMarker?: string;
  }>;
  synchronisticClusters: Array<{
    theme: string;
    participantCount: number;
    resonanceStrength: number;
    timeWindow: string;
    emergentPattern: string;
  }>;
  seasonalCorrelations: Array<{
    date: Date;
    lunarPhase: 'new' | 'waxing' | 'full' | 'waning';
    season: 'spring' | 'summer' | 'autumn' | 'winter';
    daimonIntensity: number;
    tricksterActivity: number;
    elementalEmphasis: string[];
  }>;
}

export default function EnhancedCollectiveDaimonicDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [expertMode, setExpertMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000); // 5-minute updates
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data representing current collective field state
      const mockData: DashboardData = {
        fieldStatus: {
          condition: 'charged',
          intensity: 0.73,
          description: "The air is charged with potential—something is stirring in the collective.",
          tricksterRisk: 0.65
        },
        archetypalPatterns: [
          {
            archetype: 'Transformation',
            element: 'water',
            phase: 'dissolution',
            activation: 0.85,
            themes: ['surrender', 'hidden grief', 'letting flow'],
            participantCount: 12
          },
          {
            archetype: 'Initiation', 
            element: 'fire',
            phase: 'confrontation',
            activation: 0.67,
            themes: ['courage', 'breakthrough', 'facing truth'],
            participantCount: 8
          },
          {
            archetype: 'Integration',
            element: 'earth', 
            phase: 'embodiment',
            activation: 0.45,
            themes: ['grounding', 'building slowly', 'patience'],
            participantCount: 5
          }
        ],
        intensityTimeSeries: generateMockTimeSeries(),
        synchronisticClusters: [
          {
            theme: 'slow down',
            participantCount: 7,
            resonanceStrength: 0.82,
            timeWindow: '24h',
            emergentPattern: 'Multiple encounters with pace-shifting guidance'
          },
          {
            theme: 'authority resistance',
            participantCount: 11,
            resonanceStrength: 0.76,
            timeWindow: '48h', 
            emergentPattern: 'Shared challenges with institutional structures'
          }
        ],
        seasonalCorrelations: generateMockSeasonalData()
      };
      
      setDashboardData(mockData);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-pulse text-lg text-gray-600">
            Attuning to the collective field...
          </div>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">
            Unable to sense the collective field right now
          </p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 min-h-screen  from-slate-50 to-blue-50">
      {/* Expert Mode Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setExpertMode(!expertMode)}
          className="px-3 py-1 text-sm bg-white/70 hover:bg-white border border-gray-200 rounded-md shadow-sm"
        >
          {expertMode ? 'Phenomenological View' : 'Technical View'}
        </button>
      </div>

      {/* Field Status Banner */}
      <CollectiveFieldBanner 
        data={dashboardData.fieldStatus} 
        expertMode={expertMode}
      />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Archetypal Pattern Map */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-800">Archetypal Pattern Map</h3>
            <p className="text-sm text-gray-600">Current themes moving through the collective</p>
          </CardHeader>
          <CardContent>
            <ArchetypeSpiralMap 
              data={dashboardData.archetypalPatterns}
              expertMode={expertMode}
            />
          </CardContent>
        </Card>

        {/* Intensity Time Series */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-800">Collective Field Intensity</h3>
            <p className="text-sm text-gray-600">Archetypal weather patterns over time</p>
          </CardHeader>
          <CardContent>
            <IntensityTimeSeries 
              data={dashboardData.intensityTimeSeries}
              expertMode={expertMode}
            />
          </CardContent>
        </Card>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Synchronistic Resonance Network */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-800">Synchronistic Resonances</h3>
            <p className="text-sm text-gray-600">Shared themes echoing across participants</p>
          </CardHeader>
          <CardContent>
            <ResonanceNetwork 
              data={dashboardData.synchronisticClusters}
              expertMode={expertMode}
            />
          </CardContent>
        </Card>

        {/* Seasonal & Lunar Correlations */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-800">Seasonal & Lunar Correlations</h3>
            <p className="text-sm text-gray-600">Natural cycles affecting collective patterns</p>
          </CardHeader>
          <CardContent>
            <CycleHeatmap 
              data={dashboardData.seasonalCorrelations}
              expertMode={expertMode}
            />
          </CardContent>
        </Card>
      </div>

      {/* Safety & Grounding Footer */}
      <GroundingFooter 
        fieldIntensity={dashboardData.fieldStatus.intensity}
        condition={dashboardData.fieldStatus.condition}
      />

      {/* Privacy Notice */}
      <div className="text-center text-sm text-gray-500 border-t pt-4">
        All patterns are anonymized and privacy-protected. You are seeing archetypal echoes, not individual data.
      </div>
    </div>
  );
}

// Component Implementations

function CollectiveFieldBanner({ 
  data, 
  expertMode 
}: { 
  data: DashboardData['fieldStatus'];
  expertMode: boolean;
}) {
  const getGradientClass = () => {
    switch (data.condition) {
      case 'calm': 
        return ' from-green-100 via-blue-100 to-green-100';
      case 'charged': 
        return ' from-amber-200 via-orange-200 to-amber-200 animate-pulse';
      case 'clear': 
        return ' from-blue-100 via-white to-blue-100';
      case 'stormy': 
        return ' from-amber-200 via-indigo-200 to-amber-200';
      default: 
        return ' from-gray-100 to-gray-200';
    }
  };

  const getTextColor = () => {
    switch (data.condition) {
      case 'calm': return 'text-green-800';
      case 'charged': return 'text-orange-800';
      case 'clear': return 'text-blue-800';
      case 'stormy': return 'text-amber-800';
      default: return 'text-gray-800';
    }
  };

  return (
    <div className={`p-6 rounded-xl shadow-sm border ${getGradientClass()}`}>
      <div className="text-center">
        <p className={`text-xl font-medium ${getTextColor()}`}>
          {data.description}
        </p>
        {expertMode && (
          <div className="mt-3 text-sm space-x-4 opacity-75">
            <span>Field Intensity: {(data.intensity * 100).toFixed(0)}%</span>
            <span>Trickster Risk: {(data.tricksterRisk * 100).toFixed(0)}%</span>
            <span>Condition: {data.condition}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ArchetypeSpiralMap({ 
  data, 
  expertMode 
}: { 
  data: DashboardData['archetypalPatterns'];
  expertMode: boolean;
}) {
  const getElementColor = (element: string) => {
    const colors = {
      fire: '#ef4444',
      water: '#3b82f6',
      earth: '#22c55e', 
      air: '#a855f7',
      aether: '#f59e0b'
    };
    return colors[element as keyof typeof colors] || '#6b7280';
  };

  return (
    <div className="space-y-6">
      {/* Spiral Visualization */}
      <div className="relative w-64 h-64 mx-auto">
        <div className="absolute inset-0 rounded-full border border-gray-300" />
        <div className="absolute inset-4 rounded-full border border-gray-200 opacity-60" />
        <div className="absolute inset-8 rounded-full border border-gray-100 opacity-40" />
        
        {data.map((pattern, index) => {
          const angle = (index * 72) * Math.PI / 180; // 72° apart for 5 positions
          const radius = 80 + (pattern.activation * 40); // Closer to center = higher activation
          const x = 50 + (radius / 2) * Math.cos(angle);
          const y = 50 + (radius / 2) * Math.sin(angle);
          
          return (
            <div
              key={pattern.archetype}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ 
                left: `${x}%`, 
                top: `${y}%`,
                opacity: 0.7 + (pattern.activation * 0.3)
              }}
              title={expertMode 
                ? `${pattern.archetype}: ${(pattern.activation * 100).toFixed(0)}% | ${pattern.participantCount} participants`
                : `${pattern.archetype} / ${pattern.element} → themes: ${pattern.themes.join(', ')}`
              }
            >
              <div 
                className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: getElementColor(pattern.element) }}
              />
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap">
                {pattern.archetype}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pattern Description */}
      <div className="text-center space-y-2">
        {data[0] && (
          <p className="text-sm text-gray-700">
            The <span className="font-semibold">{data[0].archetype}</span> archetype is strongly active, 
            expressing through <span className="font-semibold">{data[0].element}</span> qualities.
          </p>
        )}
        <p className="text-xs text-gray-600">
          Hover circles to see themes moving through each archetype
        </p>
      </div>
    </div>
  );
}

function IntensityTimeSeries({ 
  data, 
  expertMode 
}: { 
  data: DashboardData['intensityTimeSeries'];
  expertMode: boolean;
}) {
  const maxIntensity = Math.max(...data.map(d => d.intensity));
  const recentData = data.slice(-24); // Last 24 hours/periods
  
  return (
    <div className="space-y-4">
      {/* Time Series Chart */}
      <div className="relative h-48 bg-gray-50 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 400 160">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="32" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 32" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="400" height="160" fill="url(#grid)" />
          
          {/* Intensity bands */}
          <rect x="0" y="120" width="400" height="40" fill="#dcfce7" opacity="0.5" />
          <rect x="0" y="80" width="400" height="40" fill="#fef3c7" opacity="0.5" />
          <rect x="0" y="40" width="400" height="40" fill="#fecaca" opacity="0.5" />
          
          {/* Labels */}
          <text x="10" y="155" className="text-xs fill-gray-600">ordinary</text>
          <text x="10" y="115" className="text-xs fill-gray-600">extraordinary</text>
          <text x="10" y="75" className="text-xs fill-gray-600">overload</text>
          
          {/* Intensity line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={recentData.map((d, i) => 
              `${(i * 380) / (recentData.length - 1)},${160 - (d.intensity * 140)}`
            ).join(' ')}
          />
          
          {/* Lunar phase markers */}
          {recentData.map((d, i) => 
            d.lunarPhase && (
              <circle
                key={i}
                cx={(i * 380) / (recentData.length - 1)}
                cy={160 - (d.intensity * 140)}
                r="3"
                fill="#f59e0b"
                title={`${d.lunarPhase} moon`}
              />
            )
          )}
        </svg>
      </div>
      
      {/* Current Status */}
      <div className="text-center">
        {!expertMode ? (
          <p className="text-sm text-gray-700">
            {recentData[recentData.length - 1]?.intensity > 0.7 
              ? "The field is highly activated—strong currents moving through."
              : recentData[recentData.length - 1]?.intensity > 0.4
              ? "Balanced activity flowing through the collective field."
              : "Quiet conditions in the collective field—time for integration."
            }
          </p>
        ) : (
          <p className="text-xs text-gray-600">
            Current: {(recentData[recentData.length - 1]?.intensity * 100).toFixed(0)}% | 
            Peak: {(maxIntensity * 100).toFixed(0)}% | 
            24h average: {(recentData.reduce((sum, d) => sum + d.intensity, 0) / recentData.length * 100).toFixed(0)}%
          </p>
        )}
      </div>
    </div>
  );
}

function ResonanceNetwork({ 
  data, 
  expertMode 
}: { 
  data: DashboardData['synchronisticClusters'];
  expertMode: boolean;
}) {
  return (
    <div className="space-y-4">
      {data.map((cluster, index) => (
        <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4" 
             style={{ borderLeftColor: `hsl(${index * 60}, 60%, 60%)` }}>
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800">"{cluster.theme}"</h4>
            <span className="text-xs text-gray-500">{cluster.timeWindow}</span>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>{cluster.participantCount} participants</span>
              <span>{(cluster.resonanceStrength * 100).toFixed(0)}% resonance</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full  from-blue-400 to-amber-500"
                style={{ width: `${cluster.resonanceStrength * 100}%` }}
              />
            </div>
          </div>
          
          <p className="text-xs text-gray-600">
            {!expertMode 
              ? cluster.emergentPattern
              : `Cluster ID: ${index} | Strength: ${cluster.resonanceStrength.toFixed(2)} | Window: ${cluster.timeWindow}`
            }
          </p>
        </div>
      ))}
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No strong resonances detected right now.</p>
          <p className="text-sm mt-2">The field is in individual processing mode.</p>
        </div>
      )}
    </div>
  );
}

function CycleHeatmap({ 
  data, 
  expertMode 
}: { 
  data: DashboardData['seasonalCorrelations'];
  expertMode: boolean;
}) {
  const recentData = data.slice(-28); // Last 4 weeks
  const lunarPhases = ['new', 'waxing', 'full', 'waning'];
  
  // Group by lunar phase
  const groupedData = lunarPhases.map(phase => ({
    phase,
    days: recentData.filter(d => d.lunarPhase === phase)
  }));
  
  return (
    <div className="space-y-4">
      {/* Heatmap Grid */}
      <div className="space-y-2">
        {groupedData.map(({ phase, days }) => (
          <div key={phase} className="flex items-center space-x-2">
            <div className="w-16 text-xs text-gray-600 capitalize">{phase}</div>
            <div className="flex space-x-1">
              {days.slice(0, 7).map((day, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded border border-gray-200"
                  style={{
                    backgroundColor: `rgba(59, 130, 246, ${day.daimonIntensity})`,
                  }}
                  title={expertMode
                    ? `${day.date.toLocaleDateString()}: ${(day.daimonIntensity * 100).toFixed(0)}% intensity, ${(day.tricksterActivity * 100).toFixed(0)}% trickster`
                    : `${day.date.toLocaleDateString()}: ${phase} moon, ${day.elementalEmphasis.join(' + ')} emphasis`
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pattern Insight */}
      <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
        {!expertMode ? (
          <p>Full moons in autumn season show amplified Transformation themes. 
             The collective tends toward deeper processing during this period.</p>
        ) : (
          <p>Correlation analysis: Full moon periods show 23% higher intensity average. 
             Autumn seasonal modifier adds +0.15 to baseline daimonic activity.</p>
        )}
      </div>
    </div>
  );
}

function GroundingFooter({ 
  fieldIntensity, 
  condition 
}: { 
  fieldIntensity: number;
  condition: string;
}) {
  if (fieldIntensity < 0.6) return null; // Only show when intensity is high
  
  const groundingPractices = [
    "Take three conscious breaths",
    "Step outside and feel your feet on the ground", 
    "Share what you're experiencing with a trusted friend",
    "Drink a glass of water mindfully",
    "Write down one concrete thing you can do today"
  ];
  
  const randomPractice = groundingPractices[Math.floor(Math.random() * groundingPractices.length)];
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
      <p className="text-sm text-amber-800 mb-2">
        The field energy is particularly strong right now. If feeling overwhelmed:
      </p>
      <p className="text-sm font-medium text-amber-900">
        {randomPractice}
      </p>
    </div>
  );
}

// Helper Functions
function generateMockTimeSeries(): DashboardData['intensityTimeSeries'] {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000)); // Hourly data
    const baseIntensity = 0.4 + Math.sin(i / 4) * 0.2; // Cyclical pattern
    const randomVariation = (Math.random() - 0.5) * 0.3;
    
    data.push({
      timestamp,
      intensity: Math.max(0.1, Math.min(0.9, baseIntensity + randomVariation)),
      tension: Math.random() * 0.6 + 0.2,
      surprise: Math.random() * 0.8 + 0.1,
      lunarPhase: i % 6 === 0 ? (['new', 'waxing', 'full', 'waning'] as const)[Math.floor(Math.random() * 4)] : undefined
    });
  }
  
  return data;
}

function generateMockSeasonalData(): DashboardData['seasonalCorrelations'] {
  const data = [];
  const now = new Date();
  
  for (let i = 27; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)); // Daily data
    const dayOfMonth = date.getDate();
    
    let lunarPhase: 'new' | 'waxing' | 'full' | 'waning';
    if (dayOfMonth <= 7) lunarPhase = 'new';
    else if (dayOfMonth <= 14) lunarPhase = 'waxing';
    else if (dayOfMonth <= 21) lunarPhase = 'full';
    else lunarPhase = 'waning';
    
    const season = 'autumn'; // Current season
    const baseIntensity = lunarPhase === 'full' ? 0.7 : 0.4;
    
    data.push({
      date,
      lunarPhase,
      season,
      daimonIntensity: Math.max(0.1, Math.min(0.9, baseIntensity + (Math.random() - 0.5) * 0.3)),
      tricksterActivity: Math.random() * 0.6 + 0.1,
      elementalEmphasis: season === 'autumn' ? ['earth', 'fire'] : ['water', 'air']
    });
  }
  
  return data.reverse();
}