/**
 * BiofieldHUD Component - Journey Page Phase 5
 *
 * Live overlay panel displaying real-time biofield data:
 * - HRV (Heart Rate Variability)
 * - Voice prosody (pitch, energy, affect)
 * - Breath rate and coherence
 *
 * Phase: 4.4-C Phase 5 (Biofield Integration)
 * Created: December 23, 2024
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HRVData, VoiceData, BreathData } from '../../lib/biofield/sensors';
import type { BiofieldCoherence } from '../../lib/biofield/mappers';

// ============================================================================
// Types
// ============================================================================

export interface BiofieldHUDProps {
  /** HRV data */
  hrv: HRVData | null;

  /** Voice data */
  voice: VoiceData | null;

  /** Breath data */
  breath: BreathData | null;

  /** Combined coherence */
  coherence: BiofieldCoherence | null;

  /** Connection state */
  connected: boolean;

  /** Source status */
  sources: {
    hrv: boolean;
    voice: boolean;
    breath: boolean;
  };

  /** Callback to connect/disconnect */
  onToggleConnection?: () => void;

  /** Position (default: 'bottom-left') */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /** Collapsed by default */
  collapsedByDefault?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * BiofieldHUD Component
 *
 * Displays live biofield metrics in a collapsible overlay panel.
 *
 * @example
 * ```tsx
 * <BiofieldHUD
 *   hrv={biofield.hrv}
 *   voice={biofield.voice}
 *   breath={biofield.breath}
 *   coherence={biofield.coherence}
 *   connected={biofield.connected}
 *   sources={biofield.sources}
 *   onToggleConnection={biofield.connected ? biofield.disconnect : biofield.connect}
 *   position="bottom-left"
 * />
 * ```
 */
export function BiofieldHUD({
  hrv,
  voice,
  breath,
  coherence,
  connected,
  sources,
  onToggleConnection,
  position = 'bottom-left',
  collapsedByDefault = false,
}: BiofieldHUDProps) {
  const [collapsed, setCollapsed] = useState(collapsedByDefault);

  // Position classes
  const positionClasses: Record<string, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-30`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-white/95 backdrop-blur-md shadow-xl rounded-lg border border-gray-200 overflow-hidden"
        style={{ width: collapsed ? 'auto' : '320px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <span className="text-sm font-semibold text-gray-900">
              🫀 Biofield
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label={collapsed ? 'Expand' : 'Collapse'}
            >
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  collapsed ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-3 space-y-3">
                {/* Combined Coherence */}
                {coherence && (
                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700">
                        Combined Coherence
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {Math.round(coherence.combined * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${coherence.combined * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}

                {/* HRV Data */}
                {sources.hrv && (
                  <BiofieldMetric
                    label="HRV (Heart)"
                    value={hrv?.rmssd?.toFixed(1) || '--'}
                    unit="ms"
                    coherence={hrv?.coherence}
                    quality={hrv?.quality}
                    icon="💚"
                    color="green"
                  />
                )}

                {/* Voice Data */}
                {sources.voice && (
                  <BiofieldMetric
                    label="Voice (Expression)"
                    value={voice?.pitch?.toFixed(0) || '--'}
                    unit="Hz"
                    coherence={voice ? (voice.affect + 1) / 2 : undefined}
                    quality={voice?.quality}
                    icon="🔥"
                    color="red"
                  />
                )}

                {/* Breath Data */}
                {sources.breath && (
                  <BiofieldMetric
                    label="Breath (Flow)"
                    value={breath?.rate?.toFixed(1) || '--'}
                    unit="BPM"
                    coherence={breath?.coherence}
                    quality={breath?.quality}
                    icon="💧"
                    color="blue"
                  />
                )}

                {/* Connection Button */}
                {onToggleConnection && (
                  <button
                    onClick={onToggleConnection}
                    className={`w-full py-2 px-3 text-sm font-medium rounded transition-colors ${
                      connected
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {connected ? 'Disconnect' : 'Connect Sensors'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Biofield Metric Component
// ============================================================================

interface BiofieldMetricProps {
  label: string;
  value: string;
  unit: string;
  coherence?: number;
  quality?: string;
  icon: string;
  color: 'green' | 'blue' | 'red' | 'purple';
}

function BiofieldMetric({
  label,
  value,
  unit,
  coherence,
  quality,
  icon,
  color,
}: BiofieldMetricProps) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  const barColors: Record<string, string> = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="space-y-1.5">
      {/* Label and value */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{icon}</span>
          <span className="text-xs font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-gray-900">{value}</span>
          <span className="text-xs text-gray-500">{unit}</span>
        </div>
      </div>

      {/* Coherence bar */}
      {coherence !== undefined && (
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${barColors[color]}`}
            initial={{ width: 0 }}
            animate={{ width: `${coherence * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* Quality badge */}
      {quality && (
        <span
          className={`inline-block text-xs px-2 py-0.5 rounded-full ${colorClasses[color]}`}
        >
          {quality}
        </span>
      )}
    </div>
  );
}
