'use client';

import React from 'react';
import { CollectiveDaimonicSnapshot } from '../backend/src/types/daimonic';

interface CollectiveDaimonicBannerProps {
  snapshot: CollectiveDaimonicSnapshot;
  expert?: boolean;
  className?: string;
}

export function CollectiveDaimonicBanner({ 
  snapshot, 
  expert = false, 
  className = '' 
}: CollectiveDaimonicBannerProps) {
  // Show banner when field intensity ≥ 0.5 && trickster prevalence ≥ 0.4
  const shouldShowBanner = snapshot.fieldIntensity >= 0.5 && snapshot.tricksterPrevalence >= 0.4;
  
  if (!shouldShowBanner) {
    return null;
  }

  const bannerColor = snapshot.tricksterPrevalence >= 0.6 
    ? 'bg-amber-50 border-amber-200 text-amber-800'
    : 'bg-blue-50 border-blue-200 text-blue-800';

  return (
    <div className={`border-l-4 p-4 mb-6 ${bannerColor} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <span className="text-xl">🌊</span>
        </div>
        <div className="flex-grow">
          <h3 className="font-medium mb-1">
            Field is testing through riddles
          </h3>
          <p className="text-sm opacity-90 mb-2">
            {snapshot.collectiveMyth}
          </p>
          <p className="text-xs opacity-75">
            {snapshot.culturalCompensation}
          </p>
          
          {/* Expert sparkline */}
          {expert && (
            <div className="mt-3 pt-3 border-t border-current border-opacity-20">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="font-semibold">Field Intensity:</span> 
                  {(snapshot.fieldIntensity * 100).toFixed(0)}%
                </div>
                <div>
                  <span className="font-semibold">Trickster:</span> 
                  {(snapshot.tricksterPrevalence * 100).toFixed(0)}%
                </div>
                <div>
                  <span className="font-semibold">Both-And:</span> 
                  {(snapshot.bothAndRate * 100).toFixed(0)}%
                </div>
              </div>
              
              {/* Simple sparkline visualization */}
              <div className="mt-2 flex items-center gap-1">
                <span className="text-xs opacity-75">Trickster trend:</span>
                <div className="flex gap-px">
                  {Array.from({ length: 10 }, (_, i) => {
                    const height = Math.random() * snapshot.tricksterPrevalence + 0.1;
                    return (
                      <div
                        key={i}
                        className="w-1 bg-current opacity-40"
                        style={{ height: `${height * 20}px` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Active elements */}
              {snapshot.activeElements.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs opacity-75">Active elements:</span>
                  <div className="flex gap-1 mt-1">
                    {snapshot.activeElements.map(element => (
                      <span
                        key={element}
                        className="px-2 py-0.5 text-xs bg-current bg-opacity-10 rounded"
                      >
                        {element}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Simple toggle for expert mode */}
        <div className="flex-shrink-0">
          <button
            onClick={() => {/* Toggle expert mode */}}
            className="text-xs opacity-60 hover:opacity-100 transition-opacity"
          >
            {expert ? '👁️' : '○'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface DaimonicFieldStatusProps {
  snapshot: CollectiveDaimonicSnapshot;
  className?: string;
}

export function DaimonicFieldStatus({ 
  snapshot, 
  className = '' 
}: DaimonicFieldStatusProps) {
  const getFieldStatusColor = (intensity: number) => {
    if (intensity >= 0.7) return 'text-amber-600';
    if (intensity >= 0.4) return 'text-blue-600';
    return 'text-slate-500';
  };

  const getFieldStatusLabel = (intensity: number) => {
    if (intensity >= 0.7) return 'High intensity';
    if (intensity >= 0.4) return 'Moderate activity';
    return 'Quiet field';
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <div className="flex items-center gap-1">
        <div 
          className={`w-2 h-2 rounded-full ${
            snapshot.fieldIntensity >= 0.5 ? 'bg-amber-400 animate-pulse' : 'bg-slate-300'
          }`}
        />
        <span className={getFieldStatusColor(snapshot.fieldIntensity)}>
          {getFieldStatusLabel(snapshot.fieldIntensity)}
        </span>
      </div>
      
      {snapshot.tricksterPrevalence >= 0.3 && (
        <div className="flex items-center gap-1">
          <span className="text-amber-600">•</span>
          <span className="text-xs text-amber-700">
            Teaching patterns active
          </span>
        </div>
      )}
    </div>
  );
}