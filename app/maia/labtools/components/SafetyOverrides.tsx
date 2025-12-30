// @ts-nocheck
'use client';

import { useState } from 'react';
import { LabToolsService } from '../lib/LabToolsService';

interface SafetyOverridesProps {
  service: LabToolsService;
}

export function SafetyOverrides({ service }: SafetyOverridesProps) {
  const [overrides, setOverrides] = useState({
    intensity: false,
    duration: false,
    safety: false
  });

  const toggleOverride = (type: keyof typeof overrides) => {
    setOverrides(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4">⚙️ Safety Overrides</h2>

      <div className="space-y-3">
        <OverrideToggle
          label="Intensity Limits"
          description="Allow protocols above normal intensity"
          enabled={overrides.intensity}
          onToggle={() => toggleOverride('intensity')}
          warning="High intensity protocols require additional monitoring"
        />

        <OverrideToggle
          label="Duration Limits"
          description="Extend session beyond recommended time"
          enabled={overrides.duration}
          onToggle={() => toggleOverride('duration')}
          warning="Extended sessions increase risk of overwhelm"
        />

        <OverrideToggle
          label="Safety Protocols"
          description="Advanced practitioner mode"
          enabled={overrides.safety}
          onToggle={() => toggleOverride('safety')}
          warning="Only for experienced practitioners with support"
        />
      </div>

      <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded text-xs text-yellow-300">
        ⚠️ Overrides should only be used by experienced practitioners
      </div>
    </div>
  );
}

interface OverrideToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  warning: string;
}

function OverrideToggle({ label, description, enabled, onToggle, warning }: OverrideToggleProps) {
  return (
    <div className={`border rounded-lg p-3 ${
      enabled ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-black/20 border-gray-600'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-semibold text-white text-sm">{label}</div>
          <div className="text-xs text-gray-300">{description}</div>
        </div>
        <button
          onClick={onToggle}
          className={`w-12 h-6 rounded-full transition-all ${
            enabled ? 'bg-yellow-500' : 'bg-gray-600'
          }`}
        >
          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {enabled && (
        <div className="text-xs text-yellow-300 bg-yellow-500/10 p-2 rounded">
          ⚠️ {warning}
        </div>
      )}
    </div>
  );
}