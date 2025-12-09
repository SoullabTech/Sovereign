'use client';

import React, { useMemo } from 'react';
import {
  IronBoundaryEngineState,
  getIronBoundaryPixelConfig
} from '@/lib/consciousness/alchemy/portals/IronBoundaryPixels';
import type { PortalId, ComplexityTier } from '@/lib/consciousness/alchemy/portals/PortalTypes';

interface IronBoundaryPortalViewProps {
  engineState: IronBoundaryEngineState;
  portalId: PortalId;
  complexityTier: ComplexityTier;
  onAction?: () => void;
}

export function IronBoundaryPortalView({
  engineState,
  portalId,
  complexityTier,
  onAction
}: IronBoundaryPortalViewProps) {

  // Get the appropriate pixel configuration based on portal and complexity
  const { config: pixelConfig, hidden } = useMemo(() =>
    getIronBoundaryPixelConfig(engineState, portalId, complexityTier),
    [engineState, portalId, complexityTier]
  );

  // Don't render if this configuration should be hidden
  if (hidden || !pixelConfig) {
    return null;
  }

  // Dynamic styling based on pixel config and intensity
  const portalStyling = useMemo(() => {
    const baseClasses = "rounded-lg shadow-md p-6 transition-all duration-300";
    const intensityOpacity = Math.max(0.7, engineState.intensity / 100);

    // Use color theme from pixel configuration
    const isDarkTheme = pixelConfig.colorTheme.background.includes('#') &&
                       pixelConfig.colorTheme.background !== '#f8f9fa' &&
                       pixelConfig.colorTheme.background !== '#f0f8ff';

    return {
      container: `${baseClasses} border-2`,
      style: {
        opacity: intensityOpacity,
        backgroundColor: pixelConfig.colorTheme.background,
        borderColor: pixelConfig.colorTheme.accent,
        color: isDarkTheme ? '#fff' : '#000'
      },
      accentColor: isDarkTheme ? 'text-white' : `text-[${pixelConfig.colorTheme.primary}]`,
      buttonColor: 'transition-colors hover:opacity-90',
      buttonStyle: {
        backgroundColor: pixelConfig.colorTheme.primary,
        color: isDarkTheme ? '#fff' : '#000'
      },
      textColor: isDarkTheme ? 'text-gray-200' : 'text-gray-700'
    };
  }, [pixelConfig.colorTheme, engineState.intensity]);

  // Format the emerging capacity text based on engine state
  const emergingCapacityText = useMemo(() => {
    return `Emerging Capacity: ${engineState.emerging_capacity}`;
  }, [engineState.emerging_capacity]);

  // Show velocity warning if rupture is sudden or seismic
  const showVelocityWarning = engineState.rupture_velocity === 'sudden' || engineState.rupture_velocity === 'seismic';

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
          <div className="flex gap-2 text-xs text-gray-600 mt-1">
            <span className="bg-white px-2 py-1 rounded">
              {portalId.toUpperCase()}
            </span>
            <span className="bg-white px-2 py-1 rounded">
              {complexityTier.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Velocity Warning */}
      {showVelocityWarning && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <strong>
              {engineState.rupture_velocity === 'seismic' ? 'Critical' : 'Urgent'} Velocity Detected
            </strong>
          </div>
          <p className="text-sm mt-1">
            The pace of boundary dissolution requires immediate attention and support.
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-4">
        <p className="text-gray-700 leading-relaxed">
          {pixelConfig.subtext}
        </p>

        {/* Emerging Capacity */}
        <div className="bg-white bg-opacity-50 p-3 rounded">
          <p className={`text-sm font-medium ${portalStyling.accentColor}`}>
            {emergingCapacityText}
          </p>
        </div>

        {/* Support Guidance */}
        <div className="bg-white bg-opacity-70 p-4 rounded">
          <h3 className={`font-medium ${portalStyling.accentColor} mb-2`}>
            Recommended Support:
          </h3>
          <p className={`text-sm ${portalStyling.textColor}`}>
            {pixelConfig.supportMessage}
          </p>
        </div>

        {/* Rigidity Patterns (if any) */}
        {engineState.rigidity_patterns.length > 0 && (
          <div className="bg-white bg-opacity-50 p-3 rounded">
            <h4 className={`text-sm font-medium ${portalStyling.accentColor} mb-2`}>
              Dissolving Patterns:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {engineState.rigidity_patterns.map((pattern, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  {pattern}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onAction}
          className={`w-full py-3 px-4 rounded font-medium ${portalStyling.buttonColor}`}
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

// Example usage component showing the same engine state across different portals
export function IronBoundaryComparisonView({ engineState }: { engineState: IronBoundaryEngineState }) {
  const portals: PortalId[] = ['shamanic', 'therapeutic', 'corporate'];
  const complexityTier: ComplexityTier = 'intermediate'; // Could be dynamic

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Iron Boundary Rupture: Multi-Portal Expression
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {portals.map(portal => (
          <IronBoundaryPortalView
            key={portal}
            engineState={engineState}
            portalId={portal}
            complexityTier={complexityTier}
            onAction={() => console.log(`${portal} action triggered`)}
          />
        ))}
      </div>

      {/* Complexity Tier Switcher Example */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-3">Same Portal, Different Complexity Levels:</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {(['beginner', 'intermediate', 'advanced'] as ComplexityTier[]).map(tier => (
            <IronBoundaryPortalView
              key={tier}
              engineState={engineState}
              portalId="therapeutic" // Fixed to therapeutic for comparison
              complexityTier={tier}
              onAction={() => console.log(`Therapeutic ${tier} action`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}