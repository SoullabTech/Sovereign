'use client';

/**
 * VoiceSettingsPanel — member voice preference controls.
 *
 * Two layers:
 *   1. Archetype cards — choose the felt presence (MAIA Core, Warm, Clear, Mentor, Elder, Puck)
 *   2. Offset sliders — gently bias MAIA's baseline voice within that archetype
 *
 * MAIA can still self-regulate during HOLD states.
 * Member preferences are offsets, not overrides.
 */

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  MAIA_VOICE_ARCHETYPES,
  type MaiaVoiceArchetype,
  type VoiceArchetypeEntry,
} from '@/lib/voice/voiceArchetypes';

type Offsets = {
  pace: number;
  warmth: number;
  poetry: number;
  directiveness: number;
  energy: number;
};

const DEFAULT_OFFSETS: Offsets = {
  pace: 0,
  warmth: 0,
  poetry: 0,
  directiveness: 0,
  energy: 0,
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/**
 * Build preview text that varies with the chosen archetype.
 */
function buildPreviewText(archetype: MaiaVoiceArchetype | null): string {
  switch (archetype) {
    case 'maia_warm':
      return 'Take a breath. You are safe here. Let the next true thing arrive in its own time.';
    case 'maia_clear':
      return 'Here is what matters right now. One clear step. You already know what it is.';
    case 'mentor':
      return 'Hold the line. You have the capacity for this. I am here with steady counsel.';
    case 'elder':
      return 'Let us slow down. Breathe. Choose the next honest step.';
    case 'puck':
      return 'Hey, we have got this. One small step, clean and doable. Ready when you are.';
    case 'maia_core':
    default:
      return 'This is MAIA. A calm, grounded voice for clear decisions and gentle guidance.';
  }
}

export default function VoiceSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [selectedArchetype, setSelectedArchetype] = useState<MaiaVoiceArchetype>('maia_core');
  const [offset, setOffset] = useState<Offsets>({ ...DEFAULT_OFFSETS });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/api/settings/voice');
        if (res.ok) {
          const data = await res.json();
          setSelectedArchetype(data.member?.voiceArchetype || 'maia_core');
          setOffset(data.member?.offset ?? { ...DEFAULT_OFFSETS });
        }
      } catch (e) {
        console.warn('[voice-settings] Failed to load:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setOne = (k: keyof Offsets, v: number) => {
    setSaved(false);
    setOffset((prev) => ({ ...prev, [k]: clamp(v, -0.3, 0.3) }));
  };

  const onSelectArchetype = (id: MaiaVoiceArchetype) => {
    setSaved(false);
    setSelectedArchetype(id);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/settings/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceArchetype: selectedArchetype, offset }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) {
      console.error('[voice-settings] Failed to save:', e);
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    setSelectedArchetype('maia_core');
    setOffset({ ...DEFAULT_OFFSETS });
    setSaved(false);

    setSaving(true);
    try {
      const res = await apiFetch('/api/settings/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceArchetype: 'maia_core',
          offset: { ...DEFAULT_OFFSETS },
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        setTimeout(() => onPreview(), 300);
      }
    } catch (e) {
      console.error('[voice-settings] Reset save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const onPreview = async () => {
    setPreviewing(true);
    setPreviewError(null);
    try {
      const sampleText = buildPreviewText(selectedArchetype);
      const speed = clamp(1.0 + offset.pace * 0.15, 0.94, 1.06);

      const res = await apiFetch('/api/voice/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sampleText,
          voiceArchetype: selectedArchetype,
          speed,
        }),
      });

      if (!res.ok) {
        if (res.status === 503) {
          setPreviewError('Voice engine is offline. Start the Kokoro TTS service to preview.');
        } else {
          const data = await res.json().catch(() => ({}));
          setPreviewError(data?.error ?? `Preview failed (${res.status})`);
        }
        return;
      }

      const { audioUrl } = await res.json();
      if (!audioRef.current || !audioUrl) return;

      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = `${audioUrl}?t=${Date.now()}`;
      try {
        await audioRef.current.play();
      } catch (playErr: any) {
        console.warn('[voice-settings] play() rejected:', playErr);
        setPreviewError('Audio blocked. Tap Preview again or check your mute switch.');
        return;
      }
    } catch (e: any) {
      console.warn('[voice-settings] Preview failed:', e);
      if (e?.message?.includes('401') || e?.message?.includes('Unauthorized')) {
        setPreviewError('Session expired. Sign in again to preview.');
      } else {
        setPreviewError('Preview failed unexpectedly.');
      }
    } finally {
      setPreviewing(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-stone-400">Loading voice settings...</div>;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Archetype cards */}
      <div className="space-y-2">
        <div className="text-sm text-stone-400 px-1">Choose a voice presence</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MAIA_VOICE_ARCHETYPES.map((arch) => (
            <ArchetypeCard
              key={arch.id}
              entry={arch}
              selected={selectedArchetype === arch.id}
              onSelect={() => onSelectArchetype(arch.id)}
            />
          ))}
        </div>
      </div>

      {/* Offset sliders */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-5">
        <VoiceSlider
          label="Pace"
          value={offset.pace}
          onChange={(v) => setOne('pace', v)}
          left="Slower"
          right="Faster"
        />
        <VoiceSlider
          label="Warmth"
          value={offset.warmth}
          onChange={(v) => setOne('warmth', v)}
          left="Cool"
          right="Warm"
        />
        <VoiceSlider
          label="Clarity / Poetry"
          value={offset.poetry}
          onChange={(v) => setOne('poetry', v)}
          left="Direct"
          right="Mythic"
        />
        <VoiceSlider
          label="Guidance Style"
          value={offset.directiveness}
          onChange={(v) => setOne('directiveness', v)}
          left="Reflective"
          right="Directive"
        />
        <VoiceSlider
          label="Energy"
          value={offset.energy}
          onChange={(v) => setOne('energy', v)}
          left="Soft"
          right="Bright"
        />
      </div>

      <p className="text-xs text-stone-500 px-1">
        Offsets are bounded (&plusmn;0.30) and combined with MAIA&apos;s current elemental pacing.
        Changes are gentle &mdash; sovereignty means the system breathes, not obeys.
      </p>

      <div className="flex gap-3">
        <button
          className="rounded-xl bg-white/10 px-4 py-2 text-sm text-stone-200 hover:bg-white/15 disabled:opacity-50 transition-colors"
          onClick={onReset}
          disabled={saving || previewing}
        >
          Reset to Baseline
        </button>

        <button
          className="rounded-xl bg-amber-600/80 px-4 py-2 text-sm font-semibold text-stone-100 hover:bg-amber-600 disabled:opacity-50 transition-colors"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
        </button>

        <button
          className="ml-auto rounded-xl bg-white/10 px-4 py-2 text-sm text-stone-200 hover:bg-white/15 disabled:opacity-50 transition-colors"
          onClick={onPreview}
          disabled={previewing || saving}
        >
          {previewing ? 'Playing...' : 'Preview'}
        </button>
      </div>

      {previewError && (
        <div className="rounded-lg border border-stone-700/60 bg-stone-900/40 px-3 py-2 text-sm text-stone-300">
          {previewError}
        </div>
      )}

      {/* Hidden audio element for iOS/Android-reliable URL-based playback */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}

// ===================================================================
// Archetype card sub-component
// ===================================================================

function ArchetypeCard({
  entry,
  selected,
  onSelect,
}: {
  entry: VoiceArchetypeEntry;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`rounded-xl border p-3 text-left transition-colors ${
        selected
          ? 'border-amber-500/60 bg-amber-900/20'
          : 'border-white/10 bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className={`text-sm font-semibold ${selected ? 'text-amber-300' : 'text-stone-200'}`}>
        {entry.label}
      </div>
      <div className="mt-1 text-xs text-stone-400">{entry.desc}</div>
    </button>
  );
}

// ===================================================================
// Slider sub-component
// ===================================================================

function VoiceSlider({
  label,
  value,
  onChange,
  left,
  right,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  left: string;
  right: string;
}) {
  // Maps [-0.3..0.3] to [0..100]
  const pct = Math.round(((value + 0.3) / 0.6) * 100);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-stone-200">{label}</div>
        <div className="text-xs tabular-nums text-stone-400">
          {value > 0 ? '+' : ''}{value.toFixed(2)}
        </div>
      </div>
      <input
        className="mt-2 w-full accent-amber-500"
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => {
          const p = Number(e.target.value);
          const v = (p / 100) * 0.6 - 0.3;
          onChange(Math.round(v * 100) / 100); // round to 2 decimal places
        }}
      />
      <div className="mt-1 flex justify-between text-xs text-stone-500">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}
