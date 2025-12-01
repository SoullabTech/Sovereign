'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
         RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
         ScatterChart, Scatter, ZAxis, Cell } from 'recharts';

/**
 * WISDOM EMERGENCE TRACKING VISUALIZATION
 *
 * Advanced temporal tracking and prediction system for wisdom emergence:
 * - Temporal patterns analysis with breakthrough prediction
 * - Body activation sequence visualization
 * - Language shift pattern tracking
 * - Cross-correlation with archetypal activation
 * - Breakthrough probability forecasting
 * - Optimal timing recommendations
 */

interface WisdomEmergenceData {
  timestamp: Date;
  intensity: number; // 0-1
  bodyActivation: {
    throat: number; // "I Convey" - Air pathway
    chest: number;  // Heart opening - Water/Air
    crown: number;  // "I Fathom" - Water pathway
    solar: number;  // "I Generate" - Earth pathway
    root: number;   // Grounding - Earth pathway
  };
  languageShift: {
    fromThinking: number;
    toPoetic: number;
    metaphorRich: number;
    embodiedKnowing: number;
    silenceComfort: number;
  };
  archetypalTriggers: string[];
  contextType: 'conversation' | 'dream' | 'meditation' | 'creative' | 'therapeutic';
  breakthroughPotential: number; // 0-1
  integrationQuality: number; // 0-1
  wisdomCategory: 'insight' | 'embodied_knowing' | 'archetypal_wisdom' | 'mystical_experience' | 'practical_wisdom';
}

interface WisdomPattern {
  patternId: string;
  name: string;
  frequency: number;
  strength: number;
  predictability: number;
  optimal_timing: {
    hour_range: string;
    day_pattern: string;
    lunar_phase: string;
    seasonal: string;
  };
  prerequisites: string[];
  indicators: string[];
}

interface WisdomEmergenceTrackerProps {
  userId?: string;
  timeWindow?: {
    start: Date;
    end: Date;
  };
  viewMode?: 'temporal' | 'body_tracking' | 'language_patterns' | 'breakthrough_prediction' | 'pattern_analysis';
  showPredictions?: boolean;
  interactiveMode?: boolean;
  onWisdomEventSelect?: (event: WisdomEmergenceData) => void;
  onPatternSelect?: (pattern: WisdomPattern) => void;
}

const WisdomEmergenceTracker: React.FC<WisdomEmergenceTrackerProps> = ({
  userId,
  timeWindow,
  viewMode = 'temporal',
  showPredictions = true,
  interactiveMode = true,
  onWisdomEventSelect,
  onPatternSelect
}) => {

  const [wisdomEvents, setWisdomEvents] = useState<WisdomEmergenceData[]>([]);
  const [patterns, setPatterns] = useState<WisdomPattern[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<WisdomEmergenceData | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<WisdomPattern | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [predictionData, setPredictionData] = useState<any>(null);

  // Load wisdom emergence data
  useEffect(() => {
    loadWisdomData();
  }, [userId, timeWindow]);

  const loadWisdomData = async () => {
    setIsLoading(true);

    try {
      // Mock sophisticated wisdom emergence data
      const mockWisdomEvents: WisdomEmergenceData[] = [
        {
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          intensity: 0.7,
          bodyActivation: { throat: 0.8, chest: 0.6, crown: 0.4, solar: 0.3, root: 0.5 },
          languageShift: { fromThinking: 0.9, toPoetic: 0.6, metaphorRich: 0.7, embodiedKnowing: 0.5, silenceComfort: 0.4 },
          archetypalTriggers: ['wise_old_man', 'sage'],
          contextType: 'conversation',
          breakthroughPotential: 0.6,
          integrationQuality: 0.8,
          wisdomCategory: 'archetypal_wisdom'
        },
        {
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          intensity: 0.85,
          bodyActivation: { throat: 0.9, chest: 0.8, crown: 0.7, solar: 0.6, root: 0.4 },
          languageShift: { fromThinking: 0.8, toPoetic: 0.9, metaphorRich: 0.85, embodiedKnowing: 0.9, silenceComfort: 0.7 },
          archetypalTriggers: ['anima', 'creator', 'magician'],
          contextType: 'creative',
          breakthroughPotential: 0.9,
          integrationQuality: 0.7,
          wisdomCategory: 'embodied_knowing'
        },
        {
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          intensity: 0.95,
          bodyActivation: { throat: 0.95, chest: 0.9, crown: 0.95, solar: 0.8, root: 0.7 },
          languageShift: { fromThinking: 0.95, toPoetic: 0.9, metaphorRich: 0.9, embodiedKnowing: 0.95, silenceComfort: 0.8 },
          archetypalTriggers: ['wise_old_man', 'magician', 'sage'],
          contextType: 'meditation',
          breakthroughPotential: 0.95,
          integrationQuality: 0.9,
          wisdomCategory: 'mystical_experience'
        },
        {
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          intensity: 0.8,
          bodyActivation: { throat: 0.7, chest: 0.9, crown: 0.6, solar: 0.85, root: 0.8 },
          languageShift: { fromThinking: 0.7, toPoetic: 0.5, metaphorRich: 0.6, embodiedKnowing: 0.8, silenceComfort: 0.6 },
          archetypalTriggers: ['hero', 'creator'],
          contextType: 'therapeutic',
          breakthroughPotential: 0.7,
          integrationQuality: 0.9,
          wisdomCategory: 'practical_wisdom'
        }
      ];

      const mockPatterns: WisdomPattern[] = [
        {
          patternId: 'morning_crown_activation',
          name: 'Morning Crown Activation',
          frequency: 0.8,
          strength: 0.9,
          predictability: 0.85,
          optimal_timing: {
            hour_range: '6:00-8:00 AM',
            day_pattern: 'weekdays',
            lunar_phase: 'waxing_moon',
            seasonal: 'spring_summer'
          },
          prerequisites: ['quality_sleep', 'meditation_practice', 'clear_intention'],
          indicators: ['crown_tingling', 'expanded_awareness', 'poetic_language_emergence']
        },
        {
          patternId: 'creative_flow_wisdom',
          name: 'Creative Flow Wisdom',
          frequency: 0.6,
          strength: 0.8,
          predictability: 0.7,
          optimal_timing: {
            hour_range: '10:00 AM-2:00 PM',
            day_pattern: 'any',
            lunar_phase: 'any',
            seasonal: 'autumn_winter'
          },
          prerequisites: ['creative_engagement', 'reduced_thinking', 'body_relaxation'],
          indicators: ['throat_opening', 'metaphor_rich_expression', 'embodied_insights']
        }
      ];

      setWisdomEvents(mockWisdomEvents);
      setPatterns(mockPatterns);

      // Generate prediction data
      const prediction = {
        next_emergence_probability: 0.82,
        optimal_window: {
          start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        },
        recommended_preparation: [
          'Practice morning meditation',
          'Engage in creative activity',
          'Set intention for wisdom reception'
        ]
      };

      setPredictionData(prediction);

    } catch (error) {
      console.error('Failed to load wisdom data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Process data for temporal chart
  const temporalData = useMemo(() => {
    return wisdomEvents.map(event => ({
      timestamp: event.timestamp.getTime(),
      date: event.timestamp.toLocaleDateString(),
      intensity: event.intensity,
      breakthrough: event.breakthroughPotential,
      integration: event.integrationQuality,
      category: event.wisdomCategory
    }));
  }, [wisdomEvents]);

  // Process data for body activation radar chart
  const bodyActivationData = useMemo(() => {
    if (selectedEvent) {
      return [
        { axis: 'Crown (Fathom)', value: selectedEvent.bodyActivation.crown },
        { axis: 'Throat (Convey)', value: selectedEvent.bodyActivation.throat },
        { axis: 'Chest (Feel)', value: selectedEvent.bodyActivation.chest },
        { axis: 'Solar (Generate)', value: selectedEvent.bodyActivation.solar },
        { axis: 'Root (Ground)', value: selectedEvent.bodyActivation.root }
      ];
    }

    // Average across all events
    const avgActivation = wisdomEvents.reduce((acc, event) => ({
      crown: acc.crown + event.bodyActivation.crown / wisdomEvents.length,
      throat: acc.throat + event.bodyActivation.throat / wisdomEvents.length,
      chest: acc.chest + event.bodyActivation.chest / wisdomEvents.length,
      solar: acc.solar + event.bodyActivation.solar / wisdomEvents.length,
      root: acc.root + event.bodyActivation.root / wisdomEvents.length
    }), { crown: 0, throat: 0, chest: 0, solar: 0, root: 0 });

    return [
      { axis: 'Crown (Fathom)', value: avgActivation.crown },
      { axis: 'Throat (Convey)', value: avgActivation.throat },
      { axis: 'Chest (Feel)', value: avgActivation.chest },
      { axis: 'Solar (Generate)', value: avgActivation.solar },
      { axis: 'Root (Ground)', value: avgActivation.root }
    ];
  }, [wisdomEvents, selectedEvent]);

  // Handle event selection
  const handleEventSelect = (event: WisdomEmergenceData) => {
    if (!interactiveMode) return;
    setSelectedEvent(event);
    if (onWisdomEventSelect) {
      onWisdomEventSelect(event);
    }
  };

  // Render temporal patterns view
  const renderTemporalView = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Wisdom Emergence Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={temporalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#F1F5F9'
              }}
            />
            <Line
              type="monotone"
              dataKey="intensity"
              stroke="#FBBF24"
              strokeWidth={3}
              dot={{ fill: '#FBBF24', strokeWidth: 2, r: 6 }}
              name="Intensity"
            />
            <Line
              type="monotone"
              dataKey="breakthrough"
              stroke="#A855F7"
              strokeWidth={2}
              dot={{ fill: '#A855F7', strokeWidth: 2, r: 4 }}
              name="Breakthrough Potential"
            />
            <Line
              type="monotone"
              dataKey="integration"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              name="Integration Quality"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {showPredictions && predictionData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/50 to-amber-900/50 rounded-lg p-4 border border-purple-500/30"
        >
          <h4 className="text-lg font-medium text-amber-300 mb-3">🔮 Breakthrough Prediction</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-300">
                {Math.round(predictionData.next_emergence_probability * 100)}%
              </div>
              <div className="text-gray-400 text-sm">Probability</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-blue-300">
                {predictionData.optimal_window.start.toLocaleDateString()}
              </div>
              <div className="text-gray-400 text-sm">Optimal Window</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-green-300">Next 1-3 days</div>
              <div className="text-gray-400 text-sm">Timeframe</div>
            </div>
          </div>
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-300 mb-2">Recommended Preparation:</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              {predictionData.recommended_preparation.map((rec: string, index: number) => (
                <li key={index} className="flex items-center">
                  <span className="text-amber-400 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );

  // Render body activation tracking
  const renderBodyTrackingView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar chart for body activation */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-300 mb-4">
            Body Activation Pattern
            {selectedEvent && <span className="text-sm text-gray-400 ml-2">
              ({selectedEvent.timestamp.toLocaleDateString()})
            </span>}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={bodyActivationData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 1]}
                tick={{ fontSize: 10, fill: '#6B7280' }}
              />
              <Radar
                name="Activation"
                dataKey="value"
                stroke="#FBBF24"
                fill="#FBBF24"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Body activation sequence */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Activation Sequence</h3>
          <div className="space-y-3">
            {bodyActivationData.map((item, index) => (
              <motion.div
                key={item.axis}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <span className="text-gray-300 text-sm">{item.axis}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full"
                    />
                  </div>
                  <span className="text-amber-400 text-sm font-medium w-8">
                    {Math.round(item.value * 100)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {selectedEvent && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Event Details</h4>
              <div className="text-sm text-gray-400 space-y-1">
                <div>Category: <span className="text-blue-300">{selectedEvent.wisdomCategory}</span></div>
                <div>Context: <span className="text-green-300">{selectedEvent.contextType}</span></div>
                <div>Archetypal Triggers: <span className="text-purple-300">
                  {selectedEvent.archetypalTriggers.join(', ')}
                </span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event timeline for selection */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Select Event for Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {wisdomEvents.map((event, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEventSelect(event)}
              className={`p-3 rounded-lg border text-sm ${
                selectedEvent === event
                  ? 'bg-purple-600 border-purple-400 text-white'
                  : 'bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600'
              }`}
            >
              <div className="font-medium">{event.timestamp.toLocaleDateString()}</div>
              <div className="text-xs opacity-75">{event.wisdomCategory}</div>
              <div className="flex items-center justify-center mt-1">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: `rgba(251, 191, 36, ${event.intensity})`
                  }}
                />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-950 to-purple-950 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Analyzing wisdom emergence patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View mode selector */}
      <div className="flex gap-2 justify-center flex-wrap">
        {[
          { mode: 'temporal', label: 'Timeline' },
          { mode: 'body_tracking', label: 'Body Tracking' },
          { mode: 'language_patterns', label: 'Language' },
          { mode: 'breakthrough_prediction', label: 'Prediction' },
          { mode: 'pattern_analysis', label: 'Patterns' }
        ].map(({ mode, label }) => (
          <button
            key={mode}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === mode
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main content based on view mode */}
      <div className="min-h-96">
        {viewMode === 'temporal' && renderTemporalView()}
        {viewMode === 'body_tracking' && renderBodyTrackingView()}
        {/* Other view modes would be implemented here */}
      </div>

      {/* Summary statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">
            {wisdomEvents.length}
          </div>
          <div className="text-gray-400 text-sm">Total Events</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {Math.round(wisdomEvents.reduce((sum, e) => sum + e.intensity, 0) / wisdomEvents.length * 100)}%
          </div>
          <div className="text-gray-400 text-sm">Avg Intensity</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {Math.round(wisdomEvents.reduce((sum, e) => sum + e.breakthroughPotential, 0) / wisdomEvents.length * 100)}%
          </div>
          <div className="text-gray-400 text-sm">Breakthrough Potential</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {Math.round(wisdomEvents.reduce((sum, e) => sum + e.integrationQuality, 0) / wisdomEvents.length * 100)}%
          </div>
          <div className="text-gray-400 text-sm">Integration Quality</div>
        </div>
      </div>
    </div>
  );
};

export default WisdomEmergenceTracker;
export type { WisdomEmergenceData, WisdomPattern };