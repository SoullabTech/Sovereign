'use client';

/**
 * CMEnvironmentToggle
 *
 * Minimal practitioner control for the CM Practitioner Environment.
 * v1: toggle on/off + display current active layer.
 * No sliders, no advanced controls.
 */

import { useEffect, useState } from 'react';

interface CMEnvironmentState {
  enabled: boolean;
  activeLayer: string;
}

const LAYER_LABELS: Record<string, string> = {
  weave: 'Unified Weave',
  energy: 'Energy (TCM/Taoist)',
  symbolic: 'Symbolic (Shamanic/Jungian)',
  embodiment: 'Embodiment (Somatic)',
  integration: 'Integration (Psychological/Taoist)',
};

export function CMEnvironmentToggle() {
  const [state, setState] = useState<CMEnvironmentState>({ enabled: false, activeLayer: 'weave' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/cm-environment')
      .then((r) => r.json())
      .then((data) => {
        setState({ enabled: data.enabled ?? false, activeLayer: data.activeLayer ?? 'weave' });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggle = async () => {
    const newEnabled = !state.enabled;
    setState((prev) => ({ ...prev, enabled: newEnabled }));

    try {
      await fetch('/api/settings/cm-environment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newEnabled }),
      });
    } catch {
      // Revert on failure
      setState((prev) => ({ ...prev, enabled: !newEnabled }));
    }
  };

  if (loading) {
    return (
      <div className="bg-[#111827] rounded-xl border border-gray-700 p-6 animate-pulse">
        <div className="h-4 w-48 bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-[#111827] rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase">
          Practitioner Environment
        </h2>
        <button
          onClick={toggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            state.enabled ? 'bg-amber-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              state.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {state.enabled ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-300">
            Four-layer perceptual field active
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Current:</span>
            <span className="text-xs text-amber-400 font-medium">
              {LAYER_LABELS[state.activeLayer] || state.activeLayer}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Energy &middot; Symbolic &middot; Embodiment &middot; Integration
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Activate to engage the four-layer perceptual field during conversations.
        </p>
      )}
    </div>
  );
}
