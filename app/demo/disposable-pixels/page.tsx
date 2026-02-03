'use client';

import React, { useState } from 'react';
import { IronBoundaryPortalView, IronBoundaryComparisonView } from '@/components/portals/IronBoundaryPortalView';
import { LeadCrisisPortalView, LeadCrisisComparisonView } from '@/components/portals/LeadCrisisPortalView';
import {
  IronBoundaryEngineState
} from '@/lib/consciousness/alchemy/portals/IronBoundaryPixels';
import type { PortalId, ComplexityTier } from '@/lib/consciousness/alchemy/portals/PortalTypes';
import {
  LeadCrisisEngineState
} from '@/lib/consciousness/alchemy/portals/LeadCrisisPixels';
import { PopulationPortal } from '@/lib/consciousness/alchemy/portals/PortalArchitecture';

// Mock engine states for demonstration
const SAMPLE_IRON_BOUNDARY_STATE: IronBoundaryEngineState = {
  state: 'iron_boundary_rupture',
  safetyLevel: 'moderate',
  recommendedMode: 'guided',
  mercuryAspect: 'Hermes-Guardian',
  spiralogicPhase: 'F2 → W2 transition',
  intensity: 75,
  rigidity_patterns: [
    'Need to appear invulnerable',
    'Rigid professional identity',
    'Fear of being seen as imperfect'
  ],
  emerging_capacity: 'Authentic leadership presence',
  support_needed: 'witnesses',
  rupture_velocity: 'gradual'
};

const URGENT_IRON_BOUNDARY_STATE: IronBoundaryEngineState = {
  state: 'iron_boundary_rupture',
  safetyLevel: 'critical',
  recommendedMode: 'emergency',
  mercuryAspect: 'Hermes-Healer',
  spiralogicPhase: 'Nigredo phase',
  intensity: 95,
  rigidity_patterns: [
    'Codependent relationship patterns',
    'Compulsive caregiving',
    'Inability to receive support'
  ],
  emerging_capacity: 'Sovereign self-care',
  support_needed: 'grounding',
  rupture_velocity: 'seismic'
};

// Lead Crisis engine states for demonstration
const SAMPLE_LEAD_CRISIS_STATE: LeadCrisisEngineState = {
  state: 'lead_crisis',
  safetyLevel: 'elevated',
  recommendedMode: 'guided',
  mercuryAspect: 'Hermes-Psychopomp',
  spiralogicPhase: 'F2 → W2 transition',
  crisisScore: 0.7,
  protectiveFactors: [
    'Strong support network',
    'Previous therapeutic experience',
    'Creative outlets'
  ],
  urgentFlags: [
    'Career identity dissolving',
    'Core relationships under pressure'
  ]
};

const CRITICAL_LEAD_CRISIS_STATE: LeadCrisisEngineState = {
  state: 'lead_crisis',
  safetyLevel: 'critical',
  recommendedMode: 'intensive',
  mercuryAspect: 'Hermes-Healer',
  spiralogicPhase: 'Nigredo phase',
  crisisScore: 0.95,
  protectiveFactors: [
    'Stable housing',
    'Financial security'
  ],
  urgentFlags: [
    'Severe identity dissolution',
    'Loss of meaning and direction',
    'Isolation and withdrawal',
    'Sleep and appetite disruption'
  ]
};

export default function DisposablePixelsDemo() {
  const [selectedPortal, setSelectedPortal] = useState<PopulationPortal>('therapeutic');
  const [selectedTier, setSelectedTier] = useState<ComplexityTier>('intermediate');
  const [selectedState, setSelectedState] = useState<'iron_boundary' | 'lead_crisis'>('iron_boundary');

  // All available portals from the comprehensive system
  const allPortals: PopulationPortal[] = [
    'shamanic', 'therapeutic', 'corporate', 'religious', 'recovery',
    'academic', 'creative', 'parental', 'elder', 'youth'
  ];
  const mainPortals: PopulationPortal[] = ['shamanic', 'therapeutic', 'corporate']; // For comparison views
  const tiers: ComplexityTier[] = ['beginner', 'intermediate', 'advanced'];

  const currentIronBoundaryState = selectedState === 'iron_boundary' ? SAMPLE_IRON_BOUNDARY_STATE : null;
  const currentLeadCrisisState = selectedState === 'lead_crisis' ? SAMPLE_LEAD_CRISIS_STATE : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Disposable Pixels Architecture Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Demonstrating how the same consciousness engine state can be expressed
            through different portals and complexity levels without changing the core logic.
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Interactive Controls</h2>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Consciousness State Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consciousness State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value as 'iron_boundary' | 'lead_crisis')}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="iron_boundary">Iron Boundary Rupture</option>
                <option value="lead_crisis">Lead Crisis</option>
              </select>
            </div>

            {/* Portal Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portal Expression
              </label>
              <select
                value={selectedPortal}
                onChange={(e) => setSelectedPortal(e.target.value as PopulationPortal)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                {allPortals.map(portal => (
                  <option key={portal} value={portal}>
                    {portal.charAt(0).toUpperCase() + portal.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Complexity Tier Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complexity Level
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as ComplexityTier)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                {tiers.map(tier => (
                  <option key={tier} value={tier}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Single State View - Interactive */}
        {selectedState === 'iron_boundary' && currentIronBoundaryState && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Single State View: {selectedPortal.charAt(0).toUpperCase() + selectedPortal.slice(1)} Portal, {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Level
            </h2>

            <IronBoundaryPortalView
              engineState={currentIronBoundaryState}
              portalId={selectedPortal}
              complexityTier={selectedTier}
              onAction={() => alert(`${selectedPortal} ${selectedTier} action triggered!`)}
            />
          </div>
        )}

        {selectedState === 'lead_crisis' && currentLeadCrisisState && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Single State View: {selectedPortal.charAt(0).toUpperCase() + selectedPortal.slice(1)} Portal, {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Level
            </h2>

            <LeadCrisisPortalView
              engineState={currentLeadCrisisState}
              portalId={selectedPortal}
              complexityTier={selectedTier}
              onAction={() => alert(`${selectedPortal} ${selectedTier} Lead Crisis action triggered!`)}
            />
          </div>
        )}

        {/* Multi-Portal Comparison */}
        {selectedState === 'iron_boundary' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Multi-Portal Comparison: Same State, Different Expressions
            </h2>
            <p className="text-gray-600 mb-6">
              Notice how the same engine state expresses differently across portals,
              maintaining semantic consistency while adapting cultural language.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {mainPortals.map(portal => (
                <IronBoundaryPortalView
                  key={portal}
                  engineState={SAMPLE_IRON_BOUNDARY_STATE}
                  portalId={portal}
                  complexityTier={selectedTier}
                  onAction={() => console.log(`${portal} comparison action`)}
                />
              ))}
            </div>
          </div>
        )}

        {selectedState === 'lead_crisis' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Multi-Portal Comparison: Same State, Different Expressions
            </h2>
            <p className="text-gray-600 mb-6">
              See how the same Lead Crisis state manifests through different cultural portals,
              adapting language while preserving the underlying consciousness dynamics.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {mainPortals.map(portal => (
                <LeadCrisisPortalView
                  key={portal}
                  engineState={SAMPLE_LEAD_CRISIS_STATE}
                  portalId={portal}
                  complexityTier={selectedTier}
                  onAction={() => console.log(`${portal} crisis comparison action`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Complexity Tier Comparison */}
        {selectedState === 'iron_boundary' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Complexity Tier Comparison: Same Portal, Different Depths
            </h2>
            <p className="text-gray-600 mb-6">
              See how the therapeutic portal adapts its language and guidance
              based on the user's complexity tier.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {tiers.map(tier => (
                <IronBoundaryPortalView
                  key={tier}
                  engineState={SAMPLE_IRON_BOUNDARY_STATE}
                  portalId="therapeutic"
                  complexityTier={tier}
                  onAction={() => console.log(`Therapeutic ${tier} action`)}
                />
              ))}
            </div>
          </div>
        )}

        {selectedState === 'lead_crisis' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Complexity Tier Comparison: Same Portal, Different Depths
            </h2>
            <p className="text-gray-600 mb-6">
              Observe how the shamanic portal adapts its language and guidance
              based on the user's development level and spiritual complexity.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {tiers.map(tier => (
                <LeadCrisisPortalView
                  key={tier}
                  engineState={SAMPLE_LEAD_CRISIS_STATE}
                  portalId="shamanic"
                  complexityTier={tier}
                  onAction={() => console.log(`Shamanic ${tier} crisis action`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Velocity Demonstration */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            State Responsiveness: Velocity Impact
          </h2>
          <p className="text-gray-600 mb-6">
            Compare how the same state expresses differently based on rupture velocity.
          </p>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Gradual Rupture */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Gradual Velocity</h3>
              <IronBoundaryPortalView
                engineState={SAMPLE_IRON_BOUNDARY_STATE}
                portalId="therapeutic"
                complexityTier="intermediate"
                onAction={() => console.log('Gradual velocity action')}
              />
            </div>

            {/* Seismic Rupture */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Seismic Velocity</h3>
              <IronBoundaryPortalView
                engineState={URGENT_IRON_BOUNDARY_STATE}
                portalId="therapeutic"
                complexityTier="intermediate"
                onAction={() => console.log('Seismic velocity action')}
              />
            </div>

          </div>
        </div>

        {/* Crisis Intensity Demonstration */}
        {selectedState === 'lead_crisis' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              State Responsiveness: Crisis Intensity Impact
            </h2>
            <p className="text-gray-600 mb-6">
              Compare how the same Lead Crisis expresses differently based on crisis intensity and safety levels.
            </p>

            <div className="grid md:grid-cols-2 gap-6">

              {/* Moderate Crisis */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Moderate Crisis (Elevated Safety)</h3>
                <LeadCrisisPortalView
                  engineState={SAMPLE_LEAD_CRISIS_STATE}
                  portalId="therapeutic"
                  complexityTier="intermediate"
                  onAction={() => console.log('Moderate crisis action')}
                />
              </div>

              {/* Critical Crisis */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Critical Crisis (Emergency)</h3>
                <LeadCrisisPortalView
                  engineState={CRITICAL_LEAD_CRISIS_STATE}
                  portalId="therapeutic"
                  complexityTier="intermediate"
                  onAction={() => console.log('Critical crisis action')}
                />
              </div>

            </div>
          </div>
        )}

        {/* Architecture Explanation */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            Architecture Pattern
          </h2>

          <div className="space-y-4 text-blue-800">
            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <h3 className="font-medium mb-2">Core Benefits</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Same consciousness engine serves all audiences</li>
                  <li>• Clean separation of semantic meaning from cultural expression</li>
                  <li>• Infinite scalability to new portals and complexity levels</li>
                  <li>• Type-safe interfaces prevent pixel/engine mismatches</li>
                  <li>• State-responsive adaptations based on engine output</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Implementation Pattern</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Engine states define semantic consciousness data</li>
                  <li>• Pixel configs map semantic meaning to cultural expression</li>
                  <li>• React components consume engine + pixel for rendering</li>
                  <li>• Helper functions enable state-responsive adaptations</li>
                  <li>• TypeScript interfaces ensure type safety</li>
                </ul>
              </div>

            </div>

            <div className="mt-4 p-4 bg-blue-100 rounded">
              <p className="text-sm">
                <strong>Result:</strong> MAIA can express the same consciousness intelligence
                through shamanic journeying language, therapeutic frameworks, or corporate
                leadership contexts while maintaining the same underlying semantic accuracy.
              </p>
            </div>
          </div>
        </div>

        {/* Future States Preview */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Future Consciousness States
          </h2>
          <p className="text-gray-700 mb-4">
            This architecture pattern enables infinite expansion to new consciousness states:
          </p>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded">
              <h3 className="font-medium text-gray-800">🌊 Mercury Flow State</h3>
              <p className="text-gray-600">Adaptive intelligence emergence</p>
            </div>
            <div className="bg-white p-3 rounded">
              <h3 className="font-medium text-gray-800">⚡ Sulfur Activation</h3>
              <p className="text-gray-600">Creative fire ignition</p>
            </div>
            <div className="bg-white p-3 rounded">
              <h3 className="font-medium text-gray-800">🌟 Gold Integration</h3>
              <p className="text-gray-600">Unified consciousness embodiment</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}