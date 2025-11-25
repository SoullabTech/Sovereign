// frontend
// apps/web/components/session/SessionDurationSelector.tsx

'use client';

import React, { useState } from 'react';
import { SESSION_PRESETS } from '@/lib/session/SessionTimer';

export interface SessionDurationSelectorProps {
  /**
   * Currently selected preset or duration
   */
  selectedPreset?: any;

  /**
   * Currently selected duration in minutes
   */
  selectedDuration?: number;

  /**
   * Callback when a preset is selected
   */
  onPresetSelect?: (preset: any) => void;

  /**
   * Callback when custom duration is set
   */
  onDurationChange?: (duration: number) => void;

  /**
   * Callback when selection is confirmed
   */
  onConfirm?: (preset: any | null, duration: number) => void;

  /**
   * Whether the selector is in compact mode
   */
  compact?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether to show custom duration input
   */
  allowCustomDuration?: boolean;

  /**
   * Minimum duration in minutes
   */
  minDuration?: number;

  /**
   * Maximum duration in minutes
   */
  maxDuration?: number;
}

/**
 * Component for selecting session duration using presets or custom input.
 * Integrates with SessionTimer and SESSION_PRESETS.
 */
const SessionDurationSelector: React.FC<SessionDurationSelectorProps> = ({
  selectedPreset = null,
  selectedDuration = 20,
  onPresetSelect,
  onDurationChange,
  onConfirm,
  compact = false,
  className = '',
  allowCustomDuration = true,
  minDuration = 1,
  maxDuration = 180,
}) => {
  const [localSelectedPreset, setLocalSelectedPreset] = useState<any>(selectedPreset);
  const [localDuration, setLocalDuration] = useState(selectedDuration);
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handlePresetClick = (preset: any) => {
    setLocalSelectedPreset(preset);
    setLocalDuration(preset.minutes);
    setIsCustomMode(preset.label.includes('Custom'));
    onPresetSelect?.(preset);
    onDurationChange?.(preset.minutes);
  };

  const handleCustomDurationChange = (duration: number) => {
    const clampedDuration = Math.max(minDuration, Math.min(maxDuration, duration));
    setLocalDuration(clampedDuration);
    onDurationChange?.(clampedDuration);

    // Create a custom preset for this duration
    const customPreset = {
      minutes: clampedDuration,
      label: `${clampedDuration} min - Custom`
    };
    setLocalSelectedPreset(customPreset);
  };

  const handleConfirm = () => {
    onConfirm?.(localSelectedPreset, localDuration);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  if (compact) {
    return (
      <div className={`session-duration-selector-compact ${className}`}>
        <select
          className="bg-amber-950/20 border border-amber-500/30 rounded px-2 py-1 text-sm text-amber-100 focus:border-amber-400 focus:outline-none"
          value={localSelectedPreset?.label || 'Custom'}
          onChange={(e) => {
            const preset = Object.values(SESSION_PRESETS).find(p => p.label === e.target.value);
            if (preset) {
              handlePresetClick(preset);
            }
          }}
        >
          {Object.values(SESSION_PRESETS).map((preset) => (
            <option key={preset.label} value={preset.label}>
              {preset.label} ({formatDuration(preset.minutes)})
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`session-duration-selector ${className}`}>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-amber-200 tracking-wide uppercase">
          Choose Session Length
        </h3>

        <div className="grid gap-2">
          {Object.values(SESSION_PRESETS).map((preset) => {
            const isSelected = localSelectedPreset?.label === preset.label;

            return (
              <div key={preset.label} className="space-y-2">
                <button
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                      : 'bg-amber-950/10 border-amber-500/20 text-amber-200/80 hover:border-amber-400/50 hover:bg-amber-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm" style={{ color: '#F59E0B' }}>
                        {preset.label}
                      </div>
                    </div>
                    <div className="text-xs font-mono">
                      {formatDuration(preset.minutes)}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}

          {/* Custom duration option */}
          {allowCustomDuration && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsCustomMode(!isCustomMode)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                  isCustomMode
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                    : 'bg-amber-950/10 border-amber-500/20 text-amber-200/80 hover:border-amber-400/50 hover:bg-amber-500/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm" style={{ color: '#F59E0B' }}>
                      Custom Duration
                    </div>
                  </div>
                  <div className="text-xs font-mono">
                    {formatDuration(localDuration)}
                  </div>
                </div>
              </button>

              {/* Custom duration input */}
              {isCustomMode && (
                <div className="pl-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={minDuration}
                      max={maxDuration}
                      value={localDuration}
                      onChange={(e) => handleCustomDurationChange(parseInt(e.target.value, 10) || minDuration)}
                      className="bg-amber-950/20 border border-amber-500/30 rounded px-2 py-1 text-sm text-amber-100 w-20 focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-xs text-amber-200/60">minutes</span>
                  </div>
                  <div className="text-xs text-amber-300/40">
                    Range: {minDuration}-{maxDuration} minutes
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {onConfirm && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full bg-amber-600 hover:bg-amber-500 text-amber-950 font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200"
            >
              Start {formatDuration(localDuration)} Session
            </button>
          </div>
        )}
      </div>

      {localSelectedPreset && (
        <div className="mt-4 p-3 bg-amber-950/10 rounded-lg border border-amber-500/20">
          <div className="text-xs text-amber-200/80">
            <div className="font-medium">{localSelectedPreset.label} Session</div>
            <div className="mt-2 text-amber-300/60">
              Duration: {formatDuration(localDuration)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDurationSelector;
export { SessionDurationSelector };