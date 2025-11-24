/**
 * Shared Human Experiences Dashboard
 * 
 * Replaces daimonic dashboard with safe focus on shared human experiences,
 * common challenges, and collective support without external attribution.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';

interface SharedExperiencesData {
  currentThemes: {
    commonChallenges: string[];
    supportiveInsights: string[];
    sharedGrowthAreas: string[];
    collectiveWisdom: string;
  };
  humanConnection: {
    connectionStrength: number;
    mutualSupport: 'high' | 'medium' | 'low';
    encouragementLevel: number;
    sharedUnderstanding: string;
  };
  developmentPatterns: Array<{
    theme: string;
    participantCount: number;
    supportiveness: number;
    commonApproaches: string[];
  }>;
  wellbeingTrends: Array<{
    date: Date;
    collectiveSupport: number;
    hopefulness: number;
    groundedness: number;
  }>;
}

export default function SharedHumanExperiencesDashboard() {
  const [dashboardData, setDashboardData] = useState<SharedExperiencesData | null>(null);
  const [detailView, setDetailView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSharedExperiencesData();
    const interval = setInterval(fetchSharedExperiencesData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchSharedExperiencesData = async () => {
    try {
      setLoading(true);
      // This would call your safe API endpoint
      // const response = await fetch('/api/shared-experiences/dashboard');
      // const data = await response.json();
      
      // Mock data for demonstration - all internally attributed
      const mockData: SharedExperiencesData = {
        currentThemes: {
          commonChallenges: [
            'Navigating life transitions',
            'Seeking work-life balance', 
            'Processing relationship changes',
            'Exploring personal growth'
          ],
          supportiveInsights: [
            'Many people find that change brings both challenge and opportunity',
            'Internal complexity often signals growth rather than problems',
            'Self-compassion helps when facing difficult decisions',
            'Connection with others provides valuable perspective'
          ],
          sharedGrowthAreas: [
            'Building emotional resilience',
            'Developing authentic self-expression',
            'Cultivating meaningful relationships',
            'Finding purpose and direction'
          ],
          collectiveWisdom: 'This week many people are experiencing similar themes around navigating change while staying grounded. You\'re not alone in these experiences.'
        },
        humanConnection: {
          connectionStrength: 0.78,
          mutualSupport: 'high',
          encouragementLevel: 0.82,
          sharedUnderstanding: 'Strong sense of shared human experience and mutual support'
        },
        developmentPatterns: [
          {
            theme: 'Personal Growth Through Challenges',
            participantCount: 23,
            supportiveness: 0.85,
            commonApproaches: ['Self-reflection', 'Seeking support', 'Taking small steps', 'Practicing patience']
          },
          {
            theme: 'Building Authentic Relationships', 
            participantCount: 18,
            supportiveness: 0.73,
            commonApproaches: ['Honest communication', 'Setting boundaries', 'Showing vulnerability', 'Active listening']
          },
          {
            theme: 'Career and Life Direction',
            participantCount: 15,
            supportiveness: 0.67,
            commonApproaches: ['Exploring values', 'Experimenting with new paths', 'Seeking mentorship', 'Trusting the process']
          }
        ],
        wellbeingTrends: generateMockWellbeingData()
      };
      
      setDashboardData(mockData);
      setError(null);
    } catch (err) {
      setError('Unable to load shared experiences data right now');
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
            Loading shared human experiences...
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
            {error || 'Unable to connect to shared experiences'}
          </p>
          <button 
            onClick={fetchSharedExperiencesData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Detail View Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setDetailView(!detailView)}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          {detailView ? 'Simple View' : 'Detailed View'}
        </button>
      </div>

      {/* Collective Wisdom Banner */}
      <SharedWisdomBanner 
        wisdom={dashboardData.currentThemes.collectiveWisdom}
        connectionData={dashboardData.humanConnection}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Common Human Themes */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Common Human Experiences</h3>
          </CardHeader>
          <CardContent>
            <CommonThemesDisplay 
              themes={dashboardData.currentThemes}
              detailView={detailView}
            />
          </CardContent>
        </Card>

        {/* Human Connection Strength */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Community Support Level</h3>
          </CardHeader>
          <CardContent>
            <ConnectionDisplay 
              connection={dashboardData.humanConnection}
              detailView={detailView}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shared Growth Patterns */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Shared Growth Patterns</h3>
          </CardHeader>
          <CardContent>
            <GrowthPatternsDisplay 
              patterns={dashboardData.developmentPatterns}
              detailView={detailView}
            />
          </CardContent>
        </Card>

        {/* Collective Wellbeing */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Collective Wellbeing Trends</h3>
          </CardHeader>
          <CardContent>
            <WellbeingTrendsDisplay 
              trends={dashboardData.wellbeingTrends}
              detailView={detailView}
            />
          </CardContent>
        </Card>
      </div>

      {/* Support Resources */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Available Support</h3>
        </CardHeader>
        <CardContent>
          <SupportResourcesDisplay />
        </CardContent>
      </Card>

      {/* Privacy & Safety Notice */}
      <div className="text-center text-sm text-gray-500 space-y-2">
        <p>All data is anonymized and reflects patterns in human experiences, not external forces.</p>
        <p>This dashboard shows shared themes to help you feel less alone in your journey.</p>
        <p>If you&apos;re experiencing crisis, please contact professional support: 988 (Crisis Lifeline)</p>
      </div>
    </div>
  );
}

// Component Implementations

function SharedWisdomBanner({ 
  wisdom, 
  connectionData 
}: { 
  wisdom: string;
  connectionData: SharedExperiencesData['humanConnection'];
}) {
  const getBannerColor = () => {
    switch (connectionData.mutualSupport) {
      case 'high': return 'bg-green-100 border-green-300 text-green-800';
      case 'medium': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'low': return 'bg-amber-100 border-amber-300 text-amber-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getBannerColor()}`}>
      <p className="text-lg font-medium mb-2">{wisdom}</p>
      <p className="text-sm opacity-80">
        Community connection: {connectionData.sharedUnderstanding}
      </p>
    </div>
  );
}

function CommonThemesDisplay({ 
  themes, 
  detailView 
}: { 
  themes: SharedExperiencesData['currentThemes'];
  detailView: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-sm mb-2">Common Challenges</h4>
        <ul className="space-y-1">
          {themes.commonChallenges.slice(0, detailView ? 6 : 4).map((challenge, index) => (
            <li key={index} className="text-sm flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {challenge}
            </li>
          ))}
        </ul>
      </div>
      
      {detailView && (
        <div>
          <h4 className="font-medium text-sm mb-2">Supportive Insights</h4>
          <div className="space-y-1">
            {themes.supportiveInsights.slice(0, 3).map((insight, index) => (
              <p key={index} className="text-xs text-gray-600 italic">
                "{insight}"
              </p>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-medium text-sm mb-2">Growth Areas</h4>
        <div className="flex flex-wrap gap-1">
          {themes.sharedGrowthAreas.map((area, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded"
            >
              {area}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConnectionDisplay({ 
  connection, 
  detailView 
}: { 
  connection: SharedExperiencesData['humanConnection'];
  detailView: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div 
            className="absolute inset-0 rounded-full border-4 border-green-500 transition-all duration-500"
            style={{
              clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((connection.connectionStrength * 2 - 0.5) * Math.PI)}% ${50 - 50 * Math.sin((connection.connectionStrength * 2 - 0.5) * Math.PI)}%, 50% 50%)`
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-700">
              {Math.round(connection.connectionStrength * 100)}%
            </span>
          </div>
        </div>
        <p className="text-sm mt-2">Connection Strength</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Mutual Support:</span>
          <span className={`font-medium ${
            connection.mutualSupport === 'high' ? 'text-green-600' : 
            connection.mutualSupport === 'medium' ? 'text-blue-600' : 'text-amber-600'
          }`}>
            {connection.mutualSupport}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Encouragement Level:</span>
          <span className="font-medium">{Math.round(connection.encouragementLevel * 100)}%</span>
        </div>
      </div>

      {detailView && (
        <p className="text-xs text-gray-600">
          {connection.sharedUnderstanding}
        </p>
      )}
    </div>
  );
}

function GrowthPatternsDisplay({ 
  patterns, 
  detailView 
}: { 
  patterns: SharedExperiencesData['developmentPatterns'];
  detailView: boolean;
}) {
  return (
    <div className="space-y-3">
      {patterns.map((pattern, index) => (
        <div key={index} className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm">{pattern.theme}</span>
            <span className="text-xs text-gray-500">
              {pattern.participantCount} people
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${pattern.supportiveness * 100}%` }}
              title={`${Math.round(pattern.supportiveness * 100)}% finding this supportive`}
            />
          </div>
          
          {detailView && (
            <div className="text-xs text-gray-600">
              <p className="mb-1">Common approaches:</p>
              <div className="flex flex-wrap gap-1">
                {pattern.commonApproaches.map((approach, i) => (
                  <span key={i} className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded">
                    {approach}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function WellbeingTrendsDisplay({ 
  trends, 
  detailView 
}: { 
  trends: SharedExperiencesData['wellbeingTrends'];
  detailView: boolean;
}) {
  const recentTrends = trends.slice(-14); // Last 14 days
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-1">
        {recentTrends.map((day, index) => (
          <div
            key={index}
            className="w-8 h-8 rounded border-2 flex items-center justify-center text-xs"
            style={{
              backgroundColor: `rgba(34, 197, 94, ${day.collectiveSupport})`,
              borderColor: `rgba(59, 130, 246, ${day.groundedness})`
            }}
            title={detailView 
              ? `${day.date.toLocaleDateString()}: Support ${Math.round(day.collectiveSupport * 100)}%, Hope ${Math.round(day.hopefulness * 100)}%, Groundedness ${Math.round(day.groundedness * 100)}%`
              : `${day.date.toLocaleDateString()}: Collective wellbeing trends`
            }
          >
            {day.hopefulness > 0.7 ? '😊' : day.hopefulness > 0.4 ? '😐' : '😔'}
          </div>
        ))}
      </div>
      
      <div className="text-xs text-center space-y-1">
        <p>14-day wellbeing trends</p>
        {detailView && (
          <div className="flex justify-center space-x-4">
            <span>🟢 Support</span>
            <span>🔵 Groundedness</span>
            <span>😊 Hopefulness</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SupportResourcesDisplay() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Professional Support</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Crisis Lifeline: 988</li>
          <li>• Crisis Text Line: Text HOME to 741741</li>
          <li>• NAMI Support: 1-800-950-NAMI</li>
          <li>• Psychology Today: Therapist finder</li>
        </ul>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Community Support</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Connect with trusted friends</li>
          <li>• Join support groups</li>
          <li>• Participate in community activities</li>
          <li>• Consider spiritual communities if helpful</li>
        </ul>
      </div>
    </div>
  );
}

// Helper Functions

function generateMockWellbeingData(): SharedExperiencesData['wellbeingTrends'] {
  const data = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date,
      collectiveSupport: Math.random() * 0.4 + 0.5, // Tend toward positive
      hopefulness: Math.random() * 0.5 + 0.4,
      groundedness: Math.random() * 0.6 + 0.3
    });
  }
  return data.reverse();
}