/**
 * Collective Daimonic Dashboard
 * Surfaces collective patterns while maintaining irreducible otherness
 * Uses phenomenological language to describe archetypal weather
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { DaimonicDashboardCopy } from '../backend/src/content/DaimonicDashboardCopy';

interface DashboardData {
  currentSnapshot: {
    fieldIntensity: number;
    weatherCondition: 'ordinary' | 'charged' | 'clear' | 'stormy';
    transmissionQuality: 'clear' | 'riddles' | 'static' | 'silence';
    dominantArchetypes: Array<{
      archetype: string;
      element: string;
      intensity: number;
      recentThemes: string[];
    }>;
  };
  transmissionStatus: {
    clarity: number;
    guidance: string;
    recommendation: string;
  };
  synchronisticClusters: Array<{
    theme: string;
    participantCount: number;
    resonanceStrength: number;
  }>;
  seasonalPatterns: Array<{
    date: Date;
    daimonIntensity: number;
    lunarPhase: string;
    season: string;
  }>;
}

export default function CollectiveDaimonicDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [expertMode, setExpertMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // This would call your API endpoint
      // const response = await fetch('/api/collective/dashboard');
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockData: DashboardData = {
        currentSnapshot: {
          fieldIntensity: 0.73,
          weatherCondition: 'charged',
          transmissionQuality: 'riddles',
          dominantArchetypes: [
            {
              archetype: 'Transformation',
              element: 'water',
              intensity: 0.85,
              recentThemes: ['surrender', 'letting go', 'flow']
            },
            {
              archetype: 'Initiation', 
              element: 'fire',
              intensity: 0.67,
              recentThemes: ['courage', 'breakthrough', 'action']
            }
          ]
        },
        transmissionStatus: {
          clarity: 0.45,
          guidance: "The field carries both clarity and confusion—discern carefully.",
          recommendation: "Proceed with extra attention to mixed signals."
        },
        synchronisticClusters: [
          {
            theme: 'Authority Resistance',
            participantCount: 7,
            resonanceStrength: 0.82
          },
          {
            theme: 'Creative Expression', 
            participantCount: 4,
            resonanceStrength: 0.65
          }
        ],
        seasonalPatterns: generateMockSeasonalData()
      };
      
      setDashboardData(mockData);
      setError(null);
    } catch (err) {
      setError('Unable to read the collective field right now');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <p className="text-lg text-gray-600">
            {DaimonicDashboardCopy.getRandomVariation(
              DaimonicDashboardCopy.getErrorCopy('loading'),
              expertMode ? 'expert' : 'standard'
            )}
          </p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <p className="text-lg text-red-600">
            {error || DaimonicDashboardCopy.getRandomVariation(
              DaimonicDashboardCopy.getErrorCopy('connection'),
              expertMode ? 'expert' : 'standard'
            )}
          </p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {DaimonicDashboardCopy.getRandomVariation(
              DaimonicDashboardCopy.getInteractiveCopy().refreshButton,
              expertMode ? 'expert' : 'standard'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Expert Mode Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setExpertMode(!expertMode)}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          {DaimonicDashboardCopy.getRandomVariation(
            DaimonicDashboardCopy.getInteractiveCopy().expertToggle,
            expertMode ? 'expert' : 'standard'
          )}
        </button>
      </div>

      {/* Collective Field Banner */}
      <CollectiveDaimonicBanner 
        data={dashboardData.currentSnapshot}
        expertMode={expertMode}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Archetypal Pattern Map */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Archetypal Pattern Map</h3>
          </CardHeader>
          <CardContent>
            <ArchetypePolarMap 
              data={dashboardData.currentSnapshot.dominantArchetypes}
              expertMode={expertMode}
            />
          </CardContent>
        </Card>

        {/* Field Intensity */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Collective Field Intensity</h3>
          </CardHeader>
          <CardContent>
            <IntensityDisplay 
              intensity={dashboardData.currentSnapshot.fieldIntensity}
              expertMode={expertMode}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clear Transmission */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Transmission Status</h3>
          </CardHeader>
          <CardContent>
            <TransmissionGauge 
              status={dashboardData.transmissionStatus}
              expertMode={expertMode}
            />
          </CardContent>
        </Card>

        {/* Synchronistic Resonances */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Synchronistic Resonances</h3>
          </CardHeader>
          <CardContent>
            <ResonanceNetwork 
              clusters={dashboardData.synchronisticClusters}
              expertMode={expertMode}
            />
          </CardContent>
        </Card>
      </div>

      {/* Seasonal / Lunar Cycles */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Seasonal & Lunar Correlations</h3>
        </CardHeader>
        <CardContent>
          <CycleHeatmap 
            data={dashboardData.seasonalPatterns}
            expertMode={expertMode}
          />
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <div className="text-center text-sm text-gray-500">
        {DaimonicDashboardCopy.getRandomVariation(
          DaimonicDashboardCopy.getInteractiveCopy().privacyInfo,
          expertMode ? 'expert' : 'standard'
        )}
      </div>
    </div>
  );
}

// Individual Component Implementations

function CollectiveDaimonicBanner({ 
  data, 
  expertMode 
}: { 
  data: DashboardData['currentSnapshot'];
  expertMode: boolean;
}) {
  const bannerCopy = DaimonicDashboardCopy.getFieldBannerCopy(
    data.weatherCondition, 
    data.transmissionQuality
  );
  
  const getBannerColor = () => {
    switch (data.weatherCondition) {
      case 'ordinary': return 'bg-green-100 border-green-300 text-green-800';
      case 'charged': return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'clear': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'stormy': return 'bg-amber-100 border-amber-300 text-amber-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getBannerColor()}`}>
      <p className="text-lg font-medium">
        {DaimonicDashboardCopy.getRandomVariation(bannerCopy, expertMode ? 'expert' : 'standard')}
      </p>
    </div>
  );
}

function ArchetypePolarMap({ 
  data, 
  expertMode 
}: { 
  data: DashboardData['currentSnapshot']['dominantArchetypes'];
  expertMode: boolean;
}) {
  const topArchetype = data[0];
  
  if (!topArchetype) {
    return <p>The archetypal field is quiet.</p>;
  }

  const archetypeCopy = DaimonicDashboardCopy.getArchetypalMapCopy(
    topArchetype.archetype,
    topArchetype.element,
    topArchetype.intensity
  );

  return (
    <div className="space-y-4">
      {/* Simplified polar representation */}
      <div className="relative w-48 h-48 mx-auto">
        <div className="absolute inset-0 rounded-full border-2 border-gray-300"></div>
        {data.map((archetype, index) => (
          <div
            key={archetype.archetype}
            className={`absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2`}
            style={{
              backgroundColor: getElementColor(archetype.element),
              opacity: archetype.intensity,
              left: `${50 + 40 * Math.cos(index * 72 * Math.PI / 180)}%`,
              top: `${50 + 40 * Math.sin(index * 72 * Math.PI / 180)}%`
            }}
            title={`${archetype.archetype}: ${Math.round(archetype.intensity * 100)}%`}
          />
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-sm">
          {DaimonicDashboardCopy.getRandomVariation(archetypeCopy, expertMode ? 'expert' : 'standard')}
        </p>
        <div className="mt-2 text-xs text-gray-500">
          Recent themes: {topArchetype.recentThemes.join(', ')}
        </div>
      </div>
    </div>
  );
}

function IntensityDisplay({ 
  intensity, 
  expertMode 
}: { 
  intensity: number;
  expertMode: boolean;
}) {
  const intensityCopy = DaimonicDashboardCopy.getFieldIntensityCopy(intensity, 'stable');
  
  return (
    <div className="space-y-4">
      <div className="w-full bg-gray-200 rounded-full h-6">
        <div 
          className="bg-blue-500 h-6 rounded-full transition-all duration-300"
          style={{ width: `${intensity * 100}%` }}
        />
      </div>
      <p className="text-sm">
        {DaimonicDashboardCopy.getRandomVariation(intensityCopy, expertMode ? 'expert' : 'standard')}
      </p>
      {expertMode && (
        <p className="text-xs text-gray-500">
          Field intensity: {(intensity * 100).toFixed(1)}%
        </p>
      )}
    </div>
  );
}

function TransmissionGauge({ 
  status, 
  expertMode 
}: { 
  status: DashboardData['transmissionStatus'];
  expertMode: boolean;
}) {
  const transmissionCopy = DaimonicDashboardCopy.getTransmissionCopy(status.clarity, status.recommendation);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="relative w-32 h-16 overflow-hidden">
          <div className="absolute inset-0 rounded-t-full border-4 border-gray-300"></div>
          <div 
            className="absolute bottom-0 left-0 right-0  from-blue-500 to-blue-300 transition-all duration-300"
            style={{ height: `${status.clarity * 100}%` }}
          />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm">
          {DaimonicDashboardCopy.getRandomVariation(transmissionCopy, expertMode ? 'expert' : 'standard')}
        </p>
        {expertMode && (
          <p className="text-xs text-gray-500 mt-2">
            Clarity: {(status.clarity * 100).toFixed(0)}%
          </p>
        )}
      </div>
    </div>
  );
}

function ResonanceNetwork({ 
  clusters, 
  expertMode 
}: { 
  clusters: DashboardData['synchronisticClusters'];
  expertMode: boolean;
}) {
  return (
    <div className="space-y-3">
      {clusters.map((cluster, index) => {
        const resonanceCopy = DaimonicDashboardCopy.getResonanceCopy(
          cluster.theme,
          cluster.participantCount,
          cluster.resonanceStrength
        );
        
        return (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-sm">{cluster.theme}</span>
              <span className="text-xs text-gray-500">
                {cluster.participantCount} participants
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-amber-500 h-2 rounded-full"
                style={{ width: `${cluster.resonanceStrength * 100}%` }}
              />
            </div>
            <p className="text-xs">
              {DaimonicDashboardCopy.getRandomVariation(resonanceCopy, expertMode ? 'expert' : 'standard')}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function CycleHeatmap({ 
  data, 
  expertMode 
}: { 
  data: DashboardData['seasonalPatterns'];
  expertMode: boolean;
}) {
  const recentData = data.slice(-14); // Last 14 days
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-1">
        {recentData.map((day, index) => (
          <div
            key={index}
            className="w-8 h-8 rounded border"
            style={{
              backgroundColor: `rgba(99, 102, 241, ${day.daimonIntensity})`,
              border: '1px solid #e5e7eb'
            }}
            title={expertMode 
              ? `${day.date.toLocaleDateString()}: ${(day.daimonIntensity * 100).toFixed(0)}%`
              : `${day.date.toLocaleDateString()}: ${day.lunarPhase} moon`
            }
          />
        ))}
      </div>
      <p className="text-sm text-center">
        {expertMode 
          ? "14-day intensity heatmap with lunar/seasonal correlations"
          : "Recent archetypal weather patterns with lunar phases"
        }
      </p>
    </div>
  );
}

// Helper functions
function getElementColor(element: string): string {
  const colors = {
    fire: '#ef4444',
    water: '#3b82f6', 
    earth: '#22c55e',
    air: '#a855f7',
    aether: '#f59e0b'
  };
  return colors[element as keyof typeof colors] || '#6b7280';
}

function generateMockSeasonalData(): DashboardData['seasonalPatterns'] {
  const data = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date,
      daimonIntensity: Math.random() * 0.8 + 0.1,
      lunarPhase: ['new', 'waxing', 'full', 'waning'][Math.floor(Math.random() * 4)],
      season: 'autumn' // Current season
    });
  }
  return data.reverse();
}