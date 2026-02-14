'use client';

/**
 * VoiceSettingsPanel — member voice preference controls.
 *
 * 5 sliders that gently bias MAIA's baseline voice.
 * MAIA can still self-regulate during HOLD states.
 * Member preferences are offsets, not overrides.
 */

import { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

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

export default function VoiceSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const [offset, setOffset] = useState<Offsets>({ ...DEFAULT_OFFSETS });
  const [systemVoiceId, setSystemVoiceId] = useState<string>('maia');
  const [voiceIdOverride, setVoiceIdOverride] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/api/settings/voice');
        if (res.ok) {
          const data = await res.json();
          setSystemVoiceId(data.system?.voiceId ?? 'maia');
          setVoiceIdOverride(data.member?.voiceIdOverride ?? null);
          setOffset(data.member?.offset ?? { ...DEFAULT_OFFSETS });
        }
      } catch (e) {
        console.warn('[voice-settings] Failed to load:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const effectiveVoiceId = useMemo(
    () => voiceIdOverride || systemVoiceId,
    [voiceIdOverride, systemVoiceId],
  );

  const setOne = (k: keyof Offsets, v: number) => {
    setSaved(false);
    setOffset((prev) => ({ ...prev, [k]: clamp(v, -0.3, 0.3) }));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/settings/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceIdOverride, offset }),
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

  const onReset = () => {
    setVoiceIdOverride(null);
    setOffset({ ...DEFAULT_OFFSETS });
    setSaved(false);
  };

  const onPreview = async () => {
    setPreviewing(true);
    try {
      const sampleText =
        "Here is a quick voice preview. I will keep a steady pace, warmth, and clarity so you can feel what changes.";

      // Map pace offset to speed within the same clamp range as the conductor
      const speed = clamp(1.0 + offset.pace * 0.15, 0.94, 1.06);

      // /api/voice/local-tts expects: { text, voice, format?, speed? }
      const res = await apiFetch('/api/voice/local-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sampleText,
          voice: 'af_heart', // default MAIA voice (Kokoro)
          format: 'mp3',
          speed,
        }),
      });

      if (!res.ok) throw new Error('Preview TTS failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch (e) {
      console.warn('[voice-settings] Preview failed:', e);
    } finally {
      setPreviewing(false);
    }
  };

  if (loading) {
    return <div className="text-sm opacity-70">Loading voice settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm opacity-80">Voice</div>
        <div className="mt-1 text-lg font-semibold">{effectiveVoiceId}</div>
        <div className="mt-2 text-xs opacity-70">
          Your settings gently bias MAIA&apos;s baseline. MAIA can still self-regulate during HOLD states.
        </div>
      </div>

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

      <div className="flex gap-3">
        <button
          className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15 disabled:opacity-50 transition-colors"
          onClick={onReset}
          disabled={saving}
        >
          Reset to Default
        </button>

        <button
          className="rounded-xl bg-amber-600/80 px-4 py-2 text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
        </button>

        <button
          className="ml-auto rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15 disabled:opacity-50 transition-colors"
          onClick={onPreview}
          disabled={previewing || saving}
        >
          {previewing ? 'Playing...' : 'Preview'}
        </button>
      </div>
    </div>
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
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs tabular-nums opacity-70">
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
      <div className="mt-1 flex justify-between text-xs opacity-60">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}
