'use client';

/**
 * Fascia Logger
 *
 * Simple, intuitive form for logging daily fascial health assessments
 * Captures physical, emotional, and consciousness markers
 */

import React, { useState } from 'react';
import { fascialHealthStorage, generateFasciaInsights, getCyclePhase, type FascialHealthAssessment } from '@/lib/biometrics/FascialHealthTracker';

export function FasciaLogger({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState<'practice' | 'physical' | 'consciousness' | 'insights'  >('practice');
  const [assessment, setAssessment] = useState<Partial<FascialHealthAssessment>>({
    timestamp: new Date(),
    userId: typeof window !== 'undefined' ? localStorage.getItem('beta_user') || 'explorer' : 'explorer',
    mobility: 5,
    flexibility: 5,
    hydration: 5,
    painLevel: 0,
    inflammation: 0,
    emotionalRelease: false,
    intuitionClarity: 5,
    synchronicityCount: 0,
    downloadQuality: 5,
    dreamRecall: 5,
    practiceType: '',
    durationMinutes: 15,
    intensity: 5
  });

  const [insights, setInsights] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function updateAssessment(updates: Partial<FascialHealthAssessment>) {
    setAssessment(prev => ({ ...prev, ...updates }));
  }

  async function handleComplete() {
    setSaving(true);

    try {
      // Calculate cycle info (get from localStorage if tracking)
      const cycleStartDate = localStorage.getItem('fascia_cycle_start');
      let cycleDay = 1;

      if (cycleStartDate) {
        const start = new Date(cycleStartDate);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        cycleDay = (diffDays % 90) + 1;
      } else {
        // Start new cycle
        localStorage.setItem('fascia_cycle_start', new Date().toISOString());
      }

      const cyclePhase = getCyclePhase(cycleDay);

      // Complete assessment
      const completeAssessment: FascialHealthAssessment = {
        ...assessment as FascialHealthAssessment,
        cycleDay,
        cyclePhase
      };

      // Generate insights
      const generatedInsights = generateFasciaInsights(completeAssessment);
      setInsights(generatedInsights);

      // Save to IndexedDB
      await fascialHealthStorage.storeAssessment(completeAssessment);

      setStep('insights');
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('Failed to save assessment. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleFinish() {
    onComplete?.();
    // Reset form
    setStep('practice');
    setAssessment({
      timestamp: new Date(),
      userId: typeof window !== 'undefined' ? localStorage.getItem('beta_user') || 'explorer' : 'explorer',
      mobility: 5,
      flexibility: 5,
      hydration: 5,
      painLevel: 0,
      inflammation: 0,
      emotionalRelease: false,
      intuitionClarity: 5,
      synchronicityCount: 0,
      downloadQuality: 5,
      dreamRecall: 5,
      practiceType: '',
      durationMinutes: 15,
      intensity: 5
    });
    setInsights([]);
  }

  return (
    <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold text-purple-300 mb-6">Log Fascial Health</h3>

      {step === 'practice' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Practice Type
            </label>
            <select
              value={assessment.practiceType}
              onChange={e => updateAssessment({ practiceType: e.target.value })}
              className="w-full bg-purple-900/30 border border-purple-700/30 rounded-lg px-4 py-2 text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="">Select practice...</option>
              <option value="fascia-blaster">Fascia Blaster</option>
              <option value="foam-rolling">Foam Rolling</option>
              <option value="yoga">Yoga</option>
              <option value="myofascial-release">Myofascial Release</option>
              <option value="massage">Massage</option>
              <option value="stretching">Stretching</option>
              <option value="movement">General Movement</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Duration (minutes): {assessment.durationMinutes}
            </label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={assessment.durationMinutes}
              onChange={e => updateAssessment({ durationMinutes: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-purple-400/60 mt-1">
              <span>5 min</span>
              <span>60 min</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Intensity: {assessment.intensity}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={assessment.intensity}
              onChange={e => updateAssessment({ intensity: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-purple-400/60 mt-1">
              <span>Gentle</span>
              <span>Intense</span>
            </div>
          </div>

          <button
            onClick={() => setStep('physical')}
            disabled={!assessment.practiceType}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900/50 disabled:text-purple-400/50 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Next: Physical Metrics
          </button>
        </div>
      )}

      {step === 'physical' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Mobility/Range of Motion: {assessment.mobility}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={assessment.mobility}
              onChange={e => updateAssessment({ mobility: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Flexibility/Suppleness: {assessment.flexibility}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={assessment.flexibility}
              onChange={e => updateAssessment({ flexibility: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Tissue Hydration: {assessment.hydration}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={assessment.hydration}
              onChange={e => updateAssessment({ hydration: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Pain Level: {assessment.painLevel}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={assessment.painLevel}
              onChange={e => updateAssessment({ painLevel: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Inflammation: {assessment.inflammation}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={assessment.inflammation}
              onChange={e => updateAssessment({ inflammation: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="pt-4">
            <label className="flex items-center gap-2 text-purple-300">
              <input
                type="checkbox"
                checked={assessment.emotionalRelease || false}
                onChange={e => updateAssessment({ emotionalRelease: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Emotional content surfaced during practice?</span>
            </label>

            {assessment.emotionalRelease && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="What emotion? (e.g., grief, anger, fear)"
                  value={assessment.emotionType || ''}
                  onChange={e => updateAssessment({ emotionType: e.target.value })}
                  className="w-full bg-purple-900/30 border border-purple-700/30 rounded-lg px-4 py-2 text-purple-200 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('practice')}
              className="flex-1 bg-purple-900/50 hover:bg-purple-900 text-purple-300 font-medium py-2 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep('consciousness')}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              Next: Consciousness
            </button>
          </div>
        </div>
      )}

      {step === 'consciousness' && (
        <div className="space-y-6">
          <p className="text-sm text-purple-400/70 mb-4">
            Track how your fascial work correlates with consciousness and quantum connection
          </p>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Intuition Clarity: {assessment.intuitionClarity}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={assessment.intuitionClarity}
              onChange={e => updateAssessment({ intuitionClarity: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-purple-400/60 mt-1">
              <span>Foggy</span>
              <span>Crystal Clear</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Download Quality: {assessment.downloadQuality}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={assessment.downloadQuality}
              onChange={e => updateAssessment({ downloadQuality: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-purple-400/60 mt-1">
              <span>No insights</span>
              <span>Profound clarity</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Dream Recall: {assessment.dreamRecall}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={assessment.dreamRecall}
              onChange={e => updateAssessment({ dreamRecall: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Synchronicities Today: {assessment.synchronicityCount}
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={assessment.synchronicityCount}
              onChange={e => updateAssessment({ synchronicityCount: parseInt(e.target.value) || 0 })}
              className="w-full bg-purple-900/30 border border-purple-700/30 rounded-lg px-4 py-2 text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <p className="text-xs text-purple-400/60 mt-1">
              Meaningful coincidences, perfect timing, "downloads"
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={assessment.notes || ''}
              onChange={e => updateAssessment({ notes: e.target.value })}
              placeholder="Any additional observations..."
              rows={3}
              className="w-full bg-purple-900/30 border border-purple-700/30 rounded-lg px-4 py-2 text-purple-200 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('physical')}
              className="flex-1 bg-purple-900/50 hover:bg-purple-900 text-purple-300 font-medium py-2 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleComplete}
              disabled={saving}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900/50 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : 'Complete Assessment'}
            </button>
          </div>
        </div>
      )}

      {step === 'insights' && (
        <div className="space-y-6">
          <div className="bg-purple-900/40 rounded-lg p-4 border border-purple-700/30">
            <h4 className="text-lg font-semibold text-purple-300 mb-3">✓ Assessment Saved</h4>
            <p className="text-sm text-purple-400/70">
              Your fascial health data has been recorded and integrated with your field coherence tracking.
            </p>
          </div>

          {insights.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-purple-300 mb-3">Insights</h4>
              <div className="space-y-2">
                {insights.map((insight, i) => (
                  <div key={i} className="flex gap-2 text-sm bg-purple-900/20 rounded p-3">
                    <span className="text-purple-400">•</span>
                    <span className="text-purple-300/90">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleFinish}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
