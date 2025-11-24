'use client';

import React from 'react';
import { DaimonicChip } from '../backend/src/types/daimonic';

interface DaimonicChipsDisplayProps {
  chips: DaimonicChip[];
  onChipClick?: (chip: DaimonicChip) => void;
  className?: string;
}

const chipColors = {
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  purple: 'bg-amber-100 text-amber-800 border-amber-200',
  green: 'bg-green-100 text-green-800 border-green-200'
};

const chipIcons = {
  threshold: '🌅',
  trickster: '🎭',
  'both-and': '⚖️',
  integration: '🕸️'
};

export function DaimonicChipsDisplay({ 
  chips, 
  onChipClick, 
  className = '' 
}: DaimonicChipsDisplayProps) {
  if (!chips || chips.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {chips.map((chip, index) => (
        <button
          key={`${chip.type}-${index}`}
          onClick={() => onChipClick?.(chip)}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 
            rounded-full text-xs font-medium border
            transition-all duration-200 hover:scale-105
            ${chipColors[chip.color]}
            ${onChipClick ? 'cursor-pointer hover:shadow-sm' : 'cursor-default'}
          `}
        >
          <span className="text-sm">
            {chipIcons[chip.type]}
          </span>
          {chip.label}
        </button>
      ))}
    </div>
  );
}

interface DaimonicMicroPromptsProps {
  prompts: string[];
  className?: string;
}

export function DaimonicMicroPrompts({ 
  prompts, 
  className = '' 
}: DaimonicMicroPromptsProps) {
  if (!prompts || prompts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-slate-700">
        Quick Practice
      </h4>
      <div className="space-y-1">
        {prompts.map((prompt, index) => (
          <div
            key={index}
            className="
              flex items-start gap-2 p-2 
              bg-slate-50 rounded-lg border border-slate-200
              text-sm text-slate-700
            "
          >
            <span className="text-slate-500 mt-0.5">•</span>
            <span>{prompt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DaimonicPracticeHintsProps {
  hints: string[];
  className?: string;
}

export function DaimonicPracticeHints({ 
  hints, 
  className = '' 
}: DaimonicPracticeHintsProps) {
  if (!hints || hints.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-slate-700">
        Practice Tiles
      </h4>
      <div className="grid gap-2">
        {hints.map((hint, index) => (
          <button
            key={index}
            className="
              p-3 text-left bg-white rounded-lg border border-slate-200
              hover:border-slate-300 hover:shadow-sm transition-all
              text-sm text-slate-800
            "
          >
            <span className="font-medium block">
              {hint.split('(')[0].trim()}
            </span>
            {hint.includes('(') && (
              <span className="text-xs text-slate-500 mt-1 block">
                {hint.match(/\(([^)]+)\)/)?.[1]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface DaimonicNarrativeCardProps {
  narrative: any; // Individual narrative with daimonic data
  expert?: boolean;
  className?: string;
}

export function DaimonicNarrativeCard({ 
  narrative, 
  expert = false, 
  className = '' 
}: DaimonicNarrativeCardProps) {
  const daimonic = narrative.daimonic;
  
  if (!daimonic) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Chips */}
      {daimonic.chips && (
        <DaimonicChipsDisplay chips={daimonic.chips} />
      )}

      {/* Main Narrative */}
      <div className="prose prose-sm text-slate-700">
        <p className="mb-3">{narrative.narrative.opening}</p>
        
        {narrative.narrative.insights.map((insight: any, index: number) => (
          <p key={index} className="mb-2">
            {insight.narrative}
          </p>
        ))}
        
        <p className="mt-3">{narrative.narrative.closing}</p>
      </div>

      {/* Micro Prompts */}
      {daimonic.microPrompts && (
        <DaimonicMicroPrompts prompts={daimonic.microPrompts} />
      )}

      {/* Practice Hints */}
      {daimonic.practiceHints && (
        <DaimonicPracticeHints hints={daimonic.practiceHints} />
      )}

      {/* Expert Mode - Internal Data */}
      {expert && daimonic.detection && (
        <details className="mt-4">
          <summary className="text-xs text-slate-500 cursor-pointer">
            Expert View
          </summary>
          <div className="mt-2 p-3 bg-slate-50 rounded text-xs font-mono text-slate-600">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-semibold">Trickster Risk:</span> 
                {(daimonic.detection.trickster.risk * 100).toFixed(0)}%
              </div>
              <div>
                <span className="font-semibold">Liminal:</span> 
                {(daimonic.detection.liminal.weight * 100).toFixed(0)}%
              </div>
              <div>
                <span className="font-semibold">Both-And:</span> 
                {daimonic.detection.bothAnd.signature ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-semibold">Pull:</span> 
                {daimonic.detection.spiritSoul.pull}
              </div>
            </div>
            {daimonic.detection.trickster.reasons.length > 0 && (
              <div className="mt-2">
                <span className="font-semibold">Trickster Reasons:</span>
                <div className="text-xs text-slate-500">
                  {daimonic.detection.trickster.reasons.join(', ')}
                </div>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}