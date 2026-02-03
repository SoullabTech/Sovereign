"use client";

/**
 * COMMS SPINE: Safety Ribbon
 *
 * Persistent alert banner showing unacknowledged safety concerns.
 * Appears at top of comms UI when any safety flags need attention.
 *
 * Design principles:
 * - Always visible when safety concerns exist
 * - One click to jump to flag
 * - Shows severity breakdown
 */

import React from 'react';
import { AlertTriangle, AlertCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SafetyRibbonData {
  has_unacknowledged: boolean;
  total_unacknowledged: number;
  highest_severity: 'yellow' | 'red' | 'crisis' | null;
  by_severity: {
    crisis: number;
    red: number;
    yellow: number;
  };
}

interface SafetyRibbonProps {
  data: SafetyRibbonData;
  onViewSafety: () => void;
}

const severityConfig = {
  crisis: {
    bg: 'bg-red-900/90',
    border: 'border-red-500',
    icon: XCircle,
    label: 'CRISIS',
    textColor: 'text-red-100',
    pulseColor: 'bg-red-500',
  },
  red: {
    bg: 'bg-red-800/80',
    border: 'border-red-400',
    icon: AlertTriangle,
    label: 'URGENT',
    textColor: 'text-red-100',
    pulseColor: 'bg-red-400',
  },
  yellow: {
    bg: 'bg-amber-800/80',
    border: 'border-amber-400',
    icon: AlertCircle,
    label: 'MONITOR',
    textColor: 'text-amber-100',
    pulseColor: 'bg-amber-400',
  },
};

export function SafetyRibbon({ data, onViewSafety }: SafetyRibbonProps) {
  if (!data.has_unacknowledged || !data.highest_severity) {
    return null;
  }

  const config = severityConfig[data.highest_severity];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${config.bg} ${config.border} border rounded-lg p-3 mb-4`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Pulsing indicator */}
            <div className="relative">
              <div className={`absolute inset-0 ${config.pulseColor} rounded-full animate-ping opacity-75`} />
              <Icon className={`w-5 h-5 ${config.textColor} relative z-10`} />
            </div>

            <div className={config.textColor}>
              <span className="font-semibold">{config.label}:</span>
              <span className="ml-2">
                {data.total_unacknowledged} safety concern{data.total_unacknowledged !== 1 ? 's' : ''} need{data.total_unacknowledged === 1 ? 's' : ''} review
              </span>
            </div>

            {/* Severity breakdown */}
            <div className="hidden sm:flex items-center space-x-2 ml-4 text-sm">
              {data.by_severity.crisis > 0 && (
                <span className="px-2 py-0.5 bg-red-500/30 rounded text-red-200">
                  {data.by_severity.crisis} crisis
                </span>
              )}
              {data.by_severity.red > 0 && (
                <span className="px-2 py-0.5 bg-red-400/30 rounded text-red-200">
                  {data.by_severity.red} urgent
                </span>
              )}
              {data.by_severity.yellow > 0 && (
                <span className="px-2 py-0.5 bg-amber-400/30 rounded text-amber-200">
                  {data.by_severity.yellow} monitor
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onViewSafety}
            className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
              data.highest_severity === 'crisis'
                ? 'bg-red-500 hover:bg-red-400 text-white'
                : data.highest_severity === 'red'
                ? 'bg-red-400 hover:bg-red-300 text-white'
                : 'bg-amber-400 hover:bg-amber-300 text-amber-900'
            }`}
          >
            Review Now
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SafetyRibbon;
