// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { LabToolsService, EEGState, HRVState } from '../lib/LabToolsService';

interface BiometricStreamProps {
  service: LabToolsService;
}

export function BiometricStream({ service }: BiometricStreamProps) {
  const [eegData, setEEGData] = useState<EEGState | null>(null);
  const [hrvData, setHRVData] = useState<HRVState | null>(null);

  useEffect(() => {
    const handleEEGUpdate = (data: EEGState) => setEEGData(data);
    const handleHRVUpdate = (data: HRVState) => setHRVData(data);

    service.on('eegUpdate', handleEEGUpdate);
    service.on('hrvUpdate', handleHRVUpdate);

    return () => {
      service.off('eegUpdate', handleEEGUpdate);
      service.off('hrvUpdate', handleHRVUpdate);
    };
  }, [service]);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        🧠 Neural Stream
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </h2>

      {/* Live EEG Channels */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <WaveformDisplay channel="FP1" data={eegData?.fp1} />
        <WaveformDisplay channel="FP2" data={eegData?.fp2} />
        <WaveformDisplay channel="T7" data={eegData?.t7} />
        <WaveformDisplay channel="T8" data={eegData?.t8} />
      </div>

      {/* Frequency Bands */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        <BandDisplay band="δ" label="Delta" value={eegData?.delta} color="bg-blue-500" />
        <BandDisplay band="θ" label="Theta" value={eegData?.theta} color="bg-purple-500" />
        <BandDisplay band="α" label="Alpha" value={eegData?.alpha} color="bg-green-500" />
        <BandDisplay band="β" label="Beta" value={eegData?.beta} color="bg-red-500" />
        <BandDisplay band="γ" label="Gamma" value={eegData?.gamma} color="bg-orange-500" />
      </div>

      {/* HRV Coherence */}
      <div className="bg-black/30 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-300 mb-2">🫀 Heart Coherence</h3>
        <CoherenceDisplay value={hrvData?.coherence} />
        <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
          <div>
            <span className="text-gray-400">HR:</span>
            <span className="text-white ml-1">{hrvData?.heartRate?.toFixed(0) || '--'} BPM</span>
          </div>
          <div>
            <span className="text-gray-400">RMSSD:</span>
            <span className="text-white ml-1">{hrvData?.rmssd?.toFixed(1) || '--'} ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface WaveformDisplayProps {
  channel: string;
  data?: number[];
}

function WaveformDisplay({ channel, data }: WaveformDisplayProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-black/30 rounded p-2 h-16 flex items-center justify-center">
        <div className="text-gray-500 text-xs">{channel}: No signal</div>
      </div>
    );
  }

  // Create SVG path from EEG data
  const width = 120;
  const height = 40;
  const step = width / data.length;
  const amplitude = height / 4;
  const midpoint = height / 2;

  const pathData = data
    .map((value, index) => {
      const x = index * step;
      const y = midpoint - (value / 100) * amplitude;
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="bg-black/30 rounded p-2">
      <div className="text-xs text-purple-300 mb-1">{channel}</div>
      <svg width={width} height={height} className="w-full">
        <path
          d={pathData}
          stroke="#10b981"
          strokeWidth="1"
          fill="none"
          className="drop-shadow-sm"
        />
        <line
          x1="0"
          y1={midpoint}
          x2={width}
          y2={midpoint}
          stroke="#374151"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      </svg>
    </div>
  );
}

interface BandDisplayProps {
  band: string;
  label: string;
  value?: number;
  color: string;
}

function BandDisplay({ band, label, value, color }: BandDisplayProps) {
  const percentage = (value || 0) * 100;
  const intensity = Math.min(percentage / 80, 1); // Scale to 0-1

  return (
    <div className="bg-black/30 rounded p-2 text-center">
      <div className="text-lg font-bold text-white">{band}</div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%`, opacity: 0.3 + intensity * 0.7 }}
        ></div>
      </div>
      <div className="text-xs text-white">{percentage.toFixed(0)}%</div>
    </div>
  );
}

interface CoherenceDisplayProps {
  value?: number;
}

function CoherenceDisplay({ value }: CoherenceDisplayProps) {
  const coherence = value || 0;
  const percentage = coherence * 100;

  const getCoherenceColor = (val: number) => {
    if (val > 0.7) return 'text-green-400 bg-green-500/20';
    if (val > 0.4) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getCoherenceLabel = (val: number) => {
    if (val > 0.7) return 'High Coherence';
    if (val > 0.4) return 'Medium Coherence';
    return 'Low Coherence';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">Coherence:</span>
        <span className={`text-sm px-2 py-1 rounded ${getCoherenceColor(coherence)}`}>
          {getCoherenceLabel(coherence)}
        </span>
      </div>

      {/* Circular coherence indicator */}
      <div className="relative w-16 h-16 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#374151"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={coherence > 0.7 ? '#10b981' : coherence > 0.4 ? '#f59e0b' : '#ef4444'}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - coherence)}`}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-white font-bold">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}