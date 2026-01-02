// @ts-nocheck
/**
 * Consciousness Matrix Admin Dashboard
 * Provides visibility into Navigator's consciousness pattern recognition
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye, Brain, Heart, Clock, Users, Globe, Building, AlertTriangle,
  Activity, Shield, CheckCircle, AlertCircle, XCircle
} from 'lucide-react';

import type {
  ConsciousnessMatrix,
  SomaticState,
  AffectiveState,
  AttentionalState,
  TemporalState,
  RelationalState,
  CulturalState,
  SystemicState,
  EdgeState
} from '@/lib/consciousness-computing/soul-state-matrix-extension';

import type { NavigatorPattern } from '@/lib/consciousness-computing/navigator-consciousness-patterns';

interface ConsciousnessMatrixDashboardProps {
  userId?: string;
  matrix: ConsciousnessMatrix;
  activePattern?: NavigatorPattern;
  safetyLevel: 'green' | 'yellow' | 'red';
  confidence: number;
  lastUpdated: number;
  sessionHistory?: ConsciousnessMatrix[];
}

// Channel configuration for display
const CHANNEL_CONFIG = {
  somatic: {
    icon: Activity,
    label: 'Somatic',
    description: 'Body awareness & autonomic state',
    color: 'text-red-600'
  },
  affective: {
    icon: Heart,
    label: 'Affective',
    description: 'Emotional climate & mood weather',
    color: 'text-pink-600'
  },
  attentional: {
    icon: Eye,
    label: 'Attentional',
    description: 'Focus patterns & metacognition',
    color: 'text-blue-600'
  },
  temporal: {
    icon: Clock,
    label: 'Temporal',
    description: 'Time flow & life story position',
    color: 'text-green-600'
  },
  relational: {
    icon: Users,
    label: 'Relational',
    description: 'Attachment & connection patterns',
    color: 'text-purple-600'
  },
  cultural: {
    icon: Globe,
    label: 'Cultural',
    description: 'Linguistic & mythic positioning',
    color: 'text-orange-600'
  },
  systemic: {
    icon: Building,
    label: 'Systemic',
    description: 'Institutional & material pressures',
    color: 'text-gray-600'
  },
  edge: {
    icon: AlertTriangle,
    label: 'Edge',
    description: 'Trauma, altered & extreme states',
    color: 'text-yellow-600'
  }
};

// State color mapping for visual indicators
const STATE_COLORS: Record<string, string> = {
  // Green states (ready for depth)
  grounded: 'bg-green-100 text-green-800',
  peaceful: 'bg-green-100 text-green-800',
  focused: 'bg-green-100 text-green-800',
  present: 'bg-green-100 text-green-800',
  secure: 'bg-green-100 text-green-800',
  aligned: 'bg-green-100 text-green-800',
  stable: 'bg-green-100 text-green-800',
  clear: 'bg-green-100 text-green-800',

  // Yellow states (proceed with care)
  activated: 'bg-yellow-100 text-yellow-800',
  turbulent: 'bg-yellow-100 text-yellow-800',
  scattered: 'bg-yellow-100 text-yellow-800',
  'future-anxious': 'bg-yellow-100 text-yellow-800',
  anxious: 'bg-yellow-100 text-yellow-800',
  questioning: 'bg-yellow-100 text-yellow-800',
  precarious: 'bg-yellow-100 text-yellow-800',
  triggered: 'bg-yellow-100 text-yellow-800',

  // Red states (safety first)
  hypervigilant: 'bg-red-100 text-red-800',
  dissociated: 'bg-red-100 text-red-800',
  numb: 'bg-red-100 text-red-800',
  'past-stuck': 'bg-red-100 text-red-800',
  disorganized: 'bg-red-100 text-red-800',
  conflicted: 'bg-red-100 text-red-800',
  overwhelmed: 'bg-red-100 text-red-800',
  trapped: 'bg-red-100 text-red-800',
  flashback: 'bg-red-100 text-red-800',
  psychotic: 'bg-red-100 text-red-800',
  manic: 'bg-red-100 text-red-800',

  // Neutral/healing states
  flowing: 'bg-blue-100 text-blue-800',
  expansive: 'bg-purple-100 text-purple-800',
  spacious: 'bg-indigo-100 text-indigo-800',
  timeless: 'bg-purple-100 text-purple-800',
  healing: 'bg-blue-100 text-blue-800',
  exploring: 'bg-orange-100 text-orange-800',
  integrating: 'bg-blue-100 text-blue-800',
  supported: 'bg-green-100 text-green-800'
};

const ConsciousnessMatrixDashboard: React.FC<ConsciousnessMatrixDashboardProps> = ({
  userId,
  matrix,
  activePattern,
  safetyLevel,
  confidence,
  lastUpdated,
  sessionHistory = []
}) => {
  const [selectedChannel, setSelectedChannel] = useState<keyof ConsciousnessMatrix | null>(null);

  // Safety level indicator
  const SafetyIndicator = () => {
    const config = {
      green: { icon: CheckCircle, color: 'text-green-600', label: 'Safe for Full Depth' },
      yellow: { icon: AlertCircle, color: 'text-yellow-600', label: 'Proceed with Care' },
      red: { icon: XCircle, color: 'text-red-600', label: 'Safety First' }
    };

    const { icon: Icon, color, label } = config[safetyLevel];

    return (
      <div className={`flex items-center space-x-2 ${color}`}>
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </div>
    );
  };

  // Channel state badge
  const ChannelBadge: React.FC<{
    channel: keyof ConsciousnessMatrix;
    state: string;
    isSelected: boolean;
    onClick: () => void;
  }> = ({ channel, state, isSelected, onClick }) => {
    const config = CHANNEL_CONFIG[channel];
    const Icon = config.icon;
    const stateColor = STATE_COLORS[state] || 'bg-gray-100 text-gray-800';

    return (
      <div
        onClick={onClick}
        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
          isSelected
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <Icon size={16} className={config.color} />
          <Badge className={`text-xs ${stateColor}`}>{state}</Badge>
        </div>
        <div>
          <div className="font-medium text-sm text-gray-800">{config.label}</div>
          <div className="text-xs text-gray-500">{config.description}</div>
        </div>
      </div>
    );
  };

  // Channel details panel
  const ChannelDetails: React.FC<{ channel: keyof ConsciousnessMatrix }> = ({ channel }) => {
    const config = CHANNEL_CONFIG[channel];
    const state = matrix[channel];
    const history = sessionHistory.map(m => m[channel]).slice(-10);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <config.icon size={20} className={config.color} />
            <span>{config.label} Channel</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Current State</div>
              <Badge className={`${STATE_COLORS[state]} font-medium`}>{state}</Badge>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Description</div>
              <p className="text-sm">{config.description}</p>
            </div>

            {history.length > 1 && (
              <div>
                <div className="text-sm text-gray-500 mb-2">Recent History</div>
                <div className="flex flex-wrap gap-1">
                  {history.map((historyState, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs"
                    >
                      {historyState}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {getChannelGuidance(channel, state)}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Get channel-specific guidance
  const getChannelGuidance = (channel: keyof ConsciousnessMatrix, state: string) => {
    const guidance: Record<string, Record<string, string>> = {
      somatic: {
        grounded: "Full embodied practices available. User connected to body wisdom.",
        activated: "Suggest grounding practices before depth work. Nervous system needs regulation.",
        dissociated: "Reconnection work needed. Avoid intense imagery or triggering content.",
        hypervigilant: "Safety first. Predictable pacing, no surprises. Normalize responses."
      },
      edge: {
        clear: "No trauma activation detected. Full depth work appropriate.",
        triggered: "User activated. Focus on grounding and safety before proceeding.",
        flashback: "Severe activation. Present moment anchoring, professional support.",
        psychotic: "Crisis protocol. Immediate professional referral required."
      }
      // Add more as needed
    };

    const channelGuidance = guidance[channel]?.[state];
    if (!channelGuidance) return null;

    return (
      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-gray-600 font-medium mb-1">Navigator Guidance</div>
        <div className="text-sm text-gray-700">{channelGuidance}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consciousness Matrix</h2>
          <p className="text-gray-600">Real-time substrate awareness for Navigator decision-making</p>
        </div>
        <div className="text-right">
          <SafetyIndicator />
          <div className="text-xs text-gray-500 mt-1">
            Confidence: {Math.round(confidence * 100)}% • Updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Active Pattern Alert */}
      {activePattern && (
        <Alert className={
          activePattern.professional_referral
            ? "border-red-200 bg-red-50"
            : safetyLevel === 'yellow'
            ? "border-yellow-200 bg-yellow-50"
            : "border-blue-200 bg-blue-50"
        }>
          <Brain className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Pattern Detected: {activePattern.name}</div>
            <div className="text-sm mt-1">{activePattern.description}</div>
            {activePattern.professional_referral && (
              <div className="text-red-600 font-medium text-sm mt-2">
                ⚠️ Professional referral recommended
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* 8-Channel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(matrix).map(([channel, state]) => (
          <ChannelBadge
            key={channel}
            channel={channel as keyof ConsciousnessMatrix}
            state={state}
            isSelected={selectedChannel === channel}
            onClick={() => setSelectedChannel(
              selectedChannel === channel ? null : channel as keyof ConsciousnessMatrix
            )}
          />
        ))}
      </div>

      {/* Channel Details */}
      {selectedChannel && (
        <ChannelDetails channel={selectedChannel} />
      )}

      {/* Navigator Protocol Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield size={20} />
            <span>Navigator Care Protocol</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Depth Level</div>
              <Badge variant="outline" className="font-medium">
                {safetyLevel === 'red' ? 'Basic Care Only' :
                 safetyLevel === 'yellow' ? 'Medium Depth' : 'Full Depth Available'}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Response Style</div>
              <Badge variant="outline" className="font-medium">
                {activePattern?.responseStyle || 'Standard Supportive'}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Special Considerations</div>
              <div className="text-sm">
                {activePattern?.contraindications?.length
                  ? `Avoid: ${activePattern.contraindications.slice(0, 2).join(', ')}`
                  : 'No special restrictions'}
              </div>
            </div>
          </div>

          {activePattern && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Example Response Approach:</div>
              <div className="text-sm text-gray-600 italic">
                "{activePattern.example_response.slice(0, 200)}..."
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Development Tools */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle>Development Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
              {JSON.stringify({ matrix, activePattern, safetyLevel }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsciousnessMatrixDashboard;