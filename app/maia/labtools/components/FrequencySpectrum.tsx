'use client';

import { useState, useEffect } from 'react';
import { LabToolsService, EEGState } from '../lib/LabToolsService';

interface FrequencySpectrumProps {
  service: LabToolsService;
}

export function FrequencySpectrum({ service }: FrequencySpectrumProps) {
  const [eegData, setEEGData] = useState<EEGState | null>(null);

  useEffect(() => {
    const handleEEGUpdate = (data: EEGState) => setEEGData(data);
    service.on('eegUpdate', handleEEGUpdate);
    return () => { service.off('eegUpdate', handleEEGUpdate); };
  }, [service]);

  const bands = [
    { name: 'Delta', key: 'delta', color: 'bg-blue-500', range: '0.5-4 Hz' },
    { name: 'Theta', key: 'theta', color: 'bg-purple-500', range: '4-8 Hz' },
    { name: 'Alpha', key: 'alpha', color: 'bg-green-500', range: '8-12 Hz' },
    { name: 'Beta', key: 'beta', color: 'bg-red-500', range: '12-30 Hz' },
    { name: 'Gamma', key: 'gamma', color: 'bg-orange-500', range: '30+ Hz' }
  ];

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4">📊 Frequency Analysis</h2>

      <div className="space-y-3">
        {bands.map(band => {
          const value = eegData?.[band.key as keyof EEGState] as number || 0;
          const percentage = value * 100;

          return (
            <div key={band.key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white">{band.name}</span>
                <span className="text-gray-400">{band.range}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 relative">
                <div
                  className={`${band.color} h-4 rounded-full transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}