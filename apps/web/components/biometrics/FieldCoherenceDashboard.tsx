'use client';

/**
 * Field Coherence Dashboard
 *
 * Visualizes elemental coherence, fascial health, and consciousness metrics
 * Integrates biometric data with MAIA's elemental framework
 */

import React, { useEffect, useState } from 'react';
import { biometricStorage } from '@/lib/biometrics/BiometricStorage';
import { fascialHealthStorage, type FascialHealthAssessment } from '@/lib/biometrics/FascialHealthTracker';
import {
  calculateElementalCoherence,
  type ElementalCoherence,
  getElementalPracticeRecommendations
} from '@/lib/biometrics/ElementalCoherenceCalculator';
import { ElementalWheelDetailed } from '../ElementalWheel';
import { AlchemicalOperationDisplay } from '../AlchemicalOperationDisplay';
import { BreakthroughTrajectoryDisplay } from '../BreakthroughTrajectoryDisplay';
import { alchemicalDetector } from '@/lib/maia/AlchemicalOperationDetector';
import { breakthroughEngine, type BreakthroughIndicators } from '@/lib/maia/BreakthroughTrajectoryEngine';
import { getSpiralogicOrchestrator } from '@/lib/maia/SpiralogicOrchestrator';

export function FieldCoherenceDashboard() {
  const [coherence, setCoherence] = useState<ElementalCoherence | null>(null);
  const [recentFascia, setRecentFascia] = useState<FascialHealthAssessment | null>(null);
  const [alchemicalOperation, setAlchemicalOperation] = useState<any>(null);
  const [circulation, setCirculation] = useState<any>(null);
  const [breakthroughPrediction, setBreakthroughPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoherenceData();
  }, []);

  async function loadCoherenceData() {
    try {
      console.log('🔮 Loading field coherence data...');

      // Get latest health data
      const healthData = await biometricStorage.getLatestHealthData();
      console.log('📊 Health data:', healthData ? 'Found' : 'None');

      // Get latest fascial assessment with timeout
      let latestFascia = null;
      try {
        console.log('🔍 Attempting to load fascia data...');
        const userId = localStorage.getItem('beta_user') || 'explorer';

        // Add timeout to prevent hanging
        const fasciaPromise = fascialHealthStorage.getAssessments(userId, 7);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Fascia data load timeout')), 5000)
        );

        const fasciaAssessments = await Promise.race([fasciaPromise, timeoutPromise]) as any[];
        latestFascia = fasciaAssessments[fasciaAssessments.length - 1] || null;
        console.log('🧘 Fascia data:', latestFascia ? 'Found' : 'None');
      } catch (fasciaError) {
        console.warn('⚠️ Could not load fascia data:', fasciaError);
        // Continue without fascia data
      }

      // Calculate coherence
      const coherenceData = calculateElementalCoherence(healthData, latestFascia);
      console.log('✨ Coherence calculated:', coherenceData);

      // Get alchemical operation awareness
      try {
        const userId = localStorage.getItem('beta_user') || 'explorer';
        const orchestrator = getSpiralogicOrchestrator();
        const trajectory = orchestrator.getOrchestrationState();

        const alchemicalStatus = alchemicalDetector.instance.detectCurrentOperation(userId, trajectory);
        console.log('🧪 Alchemical operation detected:', alchemicalStatus?.currentOperation);

        setAlchemicalOperation(alchemicalStatus);

        // Get circulation data for visualization
        if (alchemicalStatus) {
          setCirculation({
            currentElement: alchemicalStatus.elementalCirculation.currentElement,
            direction: alchemicalStatus.elementalCirculation.direction,
            completionPercentage: alchemicalStatus.elementalCirculation.completionPercentage,
            momentum: 0.7 // Mock momentum for now
          });

          // Generate breakthrough prediction
          try {
            const indicators: BreakthroughIndicators = {
              intensity: coherenceData.overallCoherence / 100,
              frequency: latestFascia ? 0.7 : 0.3, // Based on data availability
              synchronicity: latestFascia?.synchronicityCount ? Math.min(1, latestFascia.synchronicityCount / 5) : 0.5,
              resistanceLevel: 1 - (coherenceData.balance / 100),
              energyVolatility: Math.abs(coherenceData.fire - coherenceData.water) / 100,
              dreamActivity: 0.5, // Would integrate with dream tracking
              relationshipTension: 0.4, // Would integrate with relationship metrics
              creativeDrive: coherenceData.fire / 100
            };

            const prediction = breakthroughEngine.predictBreakthrough(
              alchemicalStatus.currentOperation,
              trajectory,
              indicators
            );

            console.log('🚀 Breakthrough prediction:', prediction);
            setBreakthroughPrediction(prediction);
          } catch (predictionError) {
            console.warn('⚠️ Could not generate breakthrough prediction:', predictionError);
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not load alchemical operation data:', error);
      }

      setCoherence(coherenceData);
      setRecentFascia(latestFascia);
    } catch (error) {
      console.error('❌ Error loading coherence data:', error);
    } finally {
      console.log('✅ Loading complete');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-purple-400 animate-pulse">Loading field coherence...</div>
      </div>
    );
  }

  if (!coherence) {
    return (
      <div className="p-6 bg-purple-950/30 rounded-lg border border-purple-800/30">
        <h3 className="text-xl font-semibold text-purple-300 mb-4">Field Coherence</h3>
        <p className="text-purple-400/70 mb-4">
          No biometric or fascial data available yet. Start tracking to see your elemental coherence.
        </p>
        <div className="space-y-2 text-sm text-purple-400/60">
          <p>• Import Apple Health data for HRV and respiratory metrics</p>
          <p>• Log fascial health assessments after your daily practice</p>
          <p>• Track consciousness markers (intuition, synchronicity, downloads)</p>
        </div>
      </div>
    );
  }

  const practices = getElementalPracticeRecommendations(coherence);

  return (
    <div className="space-y-6">
      {/* Overall Coherence */}
      <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
        <h3 className="text-2xl font-semibold text-purple-300 mb-6">Field Coherence</h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm text-purple-400/70 mb-1">Overall Coherence</div>
            <div className="text-4xl font-bold text-purple-300">
              {Math.round(coherence.overallCoherence)}
              <span className="text-lg text-purple-400/70">/100</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-purple-400/70 mb-1">Elemental Balance</div>
            <div className="text-4xl font-bold text-purple-300">
              {Math.round(coherence.balance)}
              <span className="text-lg text-purple-400/70">/100</span>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="flex gap-2 text-xs mb-4">
          <span className={`px-2 py-1 rounded ${coherence.sources.hasHRV ? 'bg-green-900/30 text-green-400' : 'bg-gray-800/30 text-gray-500'}`}>
            HRV {coherence.sources.hasHRV ? '✓' : '✗'}
          </span>
          <span className={`px-2 py-1 rounded ${coherence.sources.hasFascia ? 'bg-green-900/30 text-green-400' : 'bg-gray-800/30 text-gray-500'}`}>
            Fascia {coherence.sources.hasFascia ? '✓' : '✗'}
          </span>
          <span className={`px-2 py-1 rounded ${coherence.sources.hasBreath ? 'bg-green-900/30 text-green-400' : 'bg-gray-800/30 text-gray-500'}`}>
            Breath {coherence.sources.hasBreath ? '✓' : '✗'}
          </span>
        </div>
      </div>

      {/* Alchemical Process Awareness - NEW */}
      {alchemicalOperation && (
        <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
          <h3 className="text-xl font-semibold text-purple-300 mb-6">Current Alchemical Process</h3>
          <AlchemicalOperationDisplay
            operation={alchemicalOperation}
            variant="card"
            showPractices={false}
          />
        </div>
      )}

      {/* Toroidal Circulation - NEW */}
      {circulation && (
        <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
          <h3 className="text-xl font-semibold text-purple-300 mb-6">Elemental Circulation</h3>
          <div className="flex justify-center">
            <ElementalWheelDetailed
              circulation={circulation}
              momentum={circulation.momentum}
            />
          </div>
          <div className="mt-6 text-center text-sm text-purple-400/70">
            Your consciousness is currently circulating through the {circulation.currentElement} element,
            moving in an {circulation.direction} spiral direction.
          </div>
        </div>
      )}

      {/* Breakthrough Trajectory Prediction - NEW */}
      {breakthroughPrediction && (
        <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
          <h3 className="text-xl font-semibold text-purple-300 mb-6">Breakthrough Trajectory</h3>
          <BreakthroughTrajectoryDisplay
            prediction={breakthroughPrediction}
            variant="card"
          />
        </div>
      )}

      {/* Elemental Breakdown */}
      <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
        <h4 className="text-lg font-semibold text-purple-300 mb-4">Elemental State</h4>

        <div className="space-y-4">
          <ElementBar label="Fire" value={coherence.fire} color="red" />
          <ElementBar label="Water" value={coherence.water} color="blue" />
          <ElementBar label="Earth" value={coherence.earth} color="green" />
          <ElementBar label="Air" value={coherence.air} color="cyan" />
          <ElementBar label="Aether" value={coherence.aether} color="purple" />
        </div>

        {(coherence.dominant.length > 0 || coherence.deficient.length > 0) && (
          <div className="mt-4 pt-4 border-t border-purple-800/30 space-y-2 text-sm">
            {coherence.dominant.length > 0 && (
              <div>
                <span className="text-purple-400/70">Dominant: </span>
                <span className="text-purple-300">{coherence.dominant.join(', ')}</span>
              </div>
            )}
            {coherence.deficient.length > 0 && (
              <div>
                <span className="text-purple-400/70">Needs attention: </span>
                <span className="text-orange-400">{coherence.deficient.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Insights */}
      {coherence.insights.length > 0 && (
        <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
          <h4 className="text-lg font-semibold text-purple-300 mb-4">Insights</h4>
          <div className="space-y-2">
            {coherence.insights.map((insight, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="text-purple-400">•</span>
                <span className="text-purple-300/90">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {coherence.recommendations.length > 0 && (
        <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
          <h4 className="text-lg font-semibold text-purple-300 mb-4">Recommendations</h4>
          <div className="space-y-2">
            {coherence.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="text-orange-400">→</span>
                <span className="text-purple-300/90">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Practice Recommendations */}
      {practices.length > 0 && (
        <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
          <h4 className="text-lg font-semibold text-purple-300 mb-4">Suggested Practices</h4>
          <div className="space-y-4">
            {practices.map((practice, i) => (
              <div key={i} className="border-l-2 border-purple-600 pl-4">
                <div className="text-purple-300 font-medium">{practice.element}</div>
                <div className="text-sm text-purple-400 mt-1">{practice.practice}</div>
                <div className="text-xs text-purple-400/70 mt-1">{practice.why}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Fascia Assessment */}
      {recentFascia && (
        <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
          <h4 className="text-lg font-semibold text-purple-300 mb-4">Latest Fascial Assessment</h4>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-purple-400/70">Practice: </span>
                <span className="text-purple-300">{recentFascia.practiceType}</span>
              </div>
              <div>
                <span className="text-purple-400/70">Duration: </span>
                <span className="text-purple-300">{recentFascia.durationMinutes} min</span>
              </div>
              <div>
                <span className="text-purple-400/70">Mobility: </span>
                <span className="text-purple-300">{recentFascia.mobility}/10</span>
              </div>
              <div>
                <span className="text-purple-400/70">Intuition: </span>
                <span className="text-purple-300">{recentFascia.intuitionClarity}/10</span>
              </div>
            </div>

            {recentFascia.synchronicityCount > 0 && (
              <div className="mt-2 pt-2 border-t border-purple-800/30">
                <span className="text-purple-400/70">Synchronicities: </span>
                <span className="text-purple-300">{recentFascia.synchronicityCount}</span>
              </div>
            )}

            {recentFascia.emotionalRelease && (
              <div className="mt-2 pt-2 border-t border-purple-800/30">
                <span className="text-green-400">✓ Emotional release occurred</span>
                {recentFascia.emotionType && (
                  <span className="text-purple-400/70 ml-2">({recentFascia.emotionType})</span>
                )}
              </div>
            )}

            {recentFascia.cyclePhase && (
              <div className="mt-2 pt-2 border-t border-purple-800/30">
                <span className="text-purple-400/70">90-Day Cycle: </span>
                <span className="text-purple-300 capitalize">
                  Day {recentFascia.cycleDay} - {recentFascia.cyclePhase} Phase
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ElementBar({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: 'red' | 'blue' | 'green' | 'cyan' | 'purple';
}) {
  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    cyan: 'bg-cyan-500',
    purple: 'bg-purple-500'
  };

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-purple-300">{label}</span>
        <span className="text-sm text-purple-400/70">{Math.round(value)}</span>
      </div>
      <div className="w-full bg-purple-900/30 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
