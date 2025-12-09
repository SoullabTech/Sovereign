'use client';

import React, { useMemo } from 'react';
import {
  LeadCrisisEngineState,
  getLeadCrisisPixelConfig,
  LeadCrisisPixelConfig
} from '@/lib/consciousness/alchemy/portals/LeadCrisisPixels';
import { PopulationPortal } from '@/lib/consciousness/alchemy/portals/PortalArchitecture';
import { ComplexityTier } from '@/lib/consciousness/alchemy/portals/PortalTypes';

interface LeadCrisisPortalViewProps {
  engineState: LeadCrisisEngineState;
  portalId: PopulationPortal;
  complexityTier: ComplexityTier;
  onAction?: () => void;
}

export function LeadCrisisPortalView({
  engineState,
  portalId,
  complexityTier,
  onAction
}: LeadCrisisPortalViewProps) {

  // Get the appropriate pixel configuration based on portal and complexity
  const { config: pixelConfig, hidden } = useMemo(() =>
    getLeadCrisisPixelConfig(engineState, portalId, complexityTier),
    [engineState, portalId, complexityTier]
  );

  // Don't render if this configuration should be hidden
  if (hidden || !pixelConfig) {
    return null;
  }

  // Dynamic styling based on portal and crisis intensity
  const portalStyling = useMemo(() => {
    const baseClasses = "rounded-lg shadow-md p-6 transition-all duration-300";
    const crisisOpacity = Math.max(0.8, 1 - (engineState.crisisScore * 0.3)); // Darken as crisis deepens

    // Use the color theme from the pixel configuration
    const isDarkTheme = pixelConfig.colorTheme.background.includes('#') &&
                       pixelConfig.colorTheme.background !== '#f8f9fa' &&
                       pixelConfig.colorTheme.background !== '#f0f8ff';

    return {
      container: `${baseClasses} border-2`,
      style: {
        opacity: crisisOpacity,
        backgroundColor: pixelConfig.colorTheme.background,
        borderColor: pixelConfig.colorTheme.accent,
        color: isDarkTheme ? '#fff' : '#000'
      },
      accentColor: isDarkTheme ? 'text-white' : `text-[${pixelConfig.colorTheme.primary}]`,
      buttonStyle: {
        backgroundColor: pixelConfig.colorTheme.primary,
        color: isDarkTheme ? '#fff' : '#000'
      },
      textColor: isDarkTheme ? 'text-gray-200' : 'text-gray-700'
    };
  }, [portalId, engineState.crisisScore, pixelConfig.colorTheme]);

  // Show critical safety warning if safety level is critical
  const showCriticalWarning = engineState.safetyLevel === 'critical';

  // Show urgent flags if present
  const hasUrgentFlags = engineState.urgentFlags && engineState.urgentFlags.length > 0;

  return (
    <div
      className={portalStyling.container}
      style={portalStyling.style}
    >
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl" role="img" aria-label="portal icon">
          {pixelConfig.icon}
        </span>
        <div>
          <h2 className={`text-xl font-semibold ${portalStyling.accentColor}`}>
            {pixelConfig.headline}
          </h2>
          <div className="flex gap-2 text-xs mt-1">
            <span className="bg-white bg-opacity-80 px-2 py-1 rounded text-gray-700">
              {portalId.toUpperCase()}
            </span>
            <span className="bg-white bg-opacity-80 px-2 py-1 rounded text-gray-700">
              {complexityTier.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Critical Safety Warning */}
      {showCriticalWarning && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚨</span>
            <strong>Critical Safety Alert</strong>
          </div>
          <p className="text-sm mt-1">
            Crisis indicators suggest immediate professional support is needed.
          </p>
        </div>
      )}

      {/* Urgency Indicator */}
      {pixelConfig.urgencyIndicator && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <strong>{pixelConfig.urgencyIndicator}</strong>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-4">
        <p className={`leading-relaxed ${portalStyling.textColor}`}>
          {pixelConfig.subtext}
        </p>

        {/* Crisis Score Indicator */}
        <div className="bg-white bg-opacity-50 p-3 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${portalStyling.accentColor}`}>
              Crisis Intensity
            </span>
            <span className={`text-xs ${portalStyling.textColor}`}>
              {Math.round(engineState.crisisScore * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${engineState.crisisScore * 100}%`,
                backgroundColor: pixelConfig.colorTheme.primary
              }}
            />
          </div>
        </div>

        {/* Protective Factors */}
        {engineState.protectiveFactors.length > 0 && (
          <div className="bg-white bg-opacity-50 p-3 rounded">
            <h4 className={`text-sm font-medium ${portalStyling.accentColor} mb-2`}>
              Current Strengths:
            </h4>
            <ul className={`text-sm space-y-1 ${portalStyling.textColor}`}>
              {engineState.protectiveFactors.map((factor, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Urgent Flags */}
        {hasUrgentFlags && (
          <div className="bg-white bg-opacity-70 p-3 rounded border-l-4 border-red-400">
            <h4 className={`text-sm font-medium ${portalStyling.accentColor} mb-2`}>
              Urgent Concerns:
            </h4>
            <ul className={`text-sm space-y-1 ${portalStyling.textColor}`}>
              {engineState.urgentFlags.map((flag, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Micro Practice Section */}
        <div className="bg-white bg-opacity-70 p-4 rounded">
          <h3 className={`font-medium ${portalStyling.accentColor} mb-3`}>
            {pixelConfig.microPracticeLabel}
          </h3>
          <ol className={`text-sm space-y-2 ${portalStyling.textColor}`}>
            {pixelConfig.microPracticeSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-white bg-opacity-60 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Support Message */}
        <div className="bg-white bg-opacity-70 p-4 rounded">
          <h3 className={`font-medium ${portalStyling.accentColor} mb-2`}>
            Support Guidance:
          </h3>
          <p className={`text-sm ${portalStyling.textColor}`}>
            {pixelConfig.supportMessage}
          </p>
        </div>

        {/* Advanced Panel (if available) */}
        {pixelConfig.advancedPanelLabel && pixelConfig.advancedPanelDescription && (
          <details className="bg-white bg-opacity-50 p-3 rounded">
            <summary className={`cursor-pointer font-medium ${portalStyling.accentColor}`}>
              {pixelConfig.advancedPanelLabel}
            </summary>
            <p className={`text-sm mt-2 ${portalStyling.textColor}`}>
              {pixelConfig.advancedPanelDescription}
            </p>
          </details>
        )}

        {/* Action Button */}
        <button
          onClick={onAction}
          className="w-full py-3 px-4 rounded font-medium transition-colors hover:opacity-90"
          style={portalStyling.buttonStyle}
        >
          {pixelConfig.ctaLabel}
        </button>

        {/* Engine State Debugging (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <summary className="cursor-pointer">Engine State (dev)</summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {JSON.stringify(engineState, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// Comparison view component showing the same engine state across different portals
export function LeadCrisisComparisonView({
  engineState,
  selectedPortals = ['shamanic', 'therapeutic', 'corporate'] as PopulationPortal[]
}: {
  engineState: LeadCrisisEngineState;
  selectedPortals?: PopulationPortal[];
}) {
  const complexityTier: ComplexityTier = 'intermediate';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Lead Crisis: Multi-Portal Expression
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {selectedPortals.map(portal => (
          <LeadCrisisPortalView
            key={portal}
            engineState={engineState}
            portalId={portal}
            complexityTier={complexityTier}
            onAction={() => console.log(`${portal} crisis action triggered`)}
          />
        ))}
      </div>

      {/* Complexity Tier Switcher Example */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-3">Same Portal, Different Complexity Levels:</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {(['beginner', 'intermediate', 'advanced'] as ComplexityTier[]).map(tier => (
            <LeadCrisisPortalView
              key={tier}
              engineState={engineState}
              portalId="therapeutic"
              complexityTier={tier}
              onAction={() => console.log(`Therapeutic ${tier} crisis action`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Export types for consumers
export type { LeadCrisisEngineState, LeadCrisisPixelConfig };