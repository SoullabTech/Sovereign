'use client';

/**
 * VoiceSettingsPanel — member voice preference controls.
 *
 * Voice character picker: choose from all sovereign voices (3 female, 2 male).
 * 5 sliders that gently bias MAIA's baseline voice.
 * MAIA can still self-regulate during HOLD states.
 * Member preferences are offsets, not overrides.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  SOVEREIGN_VOICES,
  getSovereignVoice,
  resolveToKokoro,
  type SovereignVoiceId,
} from '@/lib/voice/sovereignVoices';

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

/** Element badges for visual identification */
const ELEMENT_ICONS: Record<string, string> = {
  earth: '🌍',
  water: '💧',
  fire: '🔥',
  air: '🌬️',
  aether: '✨',
};

/**
 * Build preview text that varies with the chosen archetype.
 */
function buildPreviewText(o: Offsets): string {
  // Pace
  const pace =
    o.pace < -0.1 ? 'I can slow down and let each word land.'
    : o.pace > 0.1 ? 'I can pick up the pace when the moment calls for it.'
    : 'I will keep a steady, natural pace.';

  // Warmth
  const warmth =
    o.warmth < -0.1 ? 'My tone stays clear and measured.'
    : o.warmth > 0.1 ? 'There is warmth in how I hold this space with you.'
    : 'My warmth is balanced and present.';

  // Energy
  const energy =
    o.energy < -0.1 ? 'The energy is soft and close.'
    : o.energy > 0.1 ? 'There is brightness in the way I speak.'
    : 'The energy feels grounded.';

  return `${pace} ${warmth} ${energy}`;
}

export default function VoiceSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [offset, setOffset] = useState<Offsets>({ ...DEFAULT_OFFSETS });
  const [systemVoiceId, setSystemVoiceId] = useState<string>('maia_core');
  const [voiceIdOverride, setVoiceIdOverride] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/api/settings/voice');
        if (res.ok) {
          const data = await res.json();
          // Migrate legacy voice IDs on load
          const rawVoiceId = data.member?.voiceIdOverride ?? data.system?.voiceId ?? 'maia_core';
          const LEGACY_MAP: Record<string, string> = {
            maia: 'maia_core', alloy: 'maia_core', shimmer: 'maia_warm',
            nova: 'maia_clear', echo: 'atlas', onyx: 'atlas_deep', fable: 'maia_clear',
          };
          const migratedVoice = LEGACY_MAP[rawVoiceId] ?? rawVoiceId;

          setSystemVoiceId(data.system?.voiceId ?? 'maia_core');
          setVoiceIdOverride(data.member?.voiceIdOverride ? migratedVoice : null);
          if (!data.member?.voiceIdOverride && migratedVoice !== (data.system?.voiceId ?? 'maia_core')) {
            setVoiceIdOverride(migratedVoice);
          }
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

  const selectedVoice = useMemo(
    () => getSovereignVoice(effectiveVoiceId),
    [effectiveVoiceId],
  );

  const setOne = (k: keyof Offsets, v: number) => {
    setSaved(false);
    setOffset((prev) => ({ ...prev, [k]: clamp(v, -0.3, 0.3) }));
  };

  const onSelectVoice = (voiceId: SovereignVoiceId) => {
    setSaved(false);
    setVoiceIdOverride(voiceId);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/settings/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceIdOverride: voiceIdOverride ?? effectiveVoiceId, offset }),
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
    setVoiceIdOverride(null);
    setOffset({ ...DEFAULT_OFFSETS });
    setSaved(false);

    setSaving(true);
    try {
      const res = await apiFetch('/api/settings/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceIdOverride: systemVoiceId,
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
      const sampleText = buildPreviewText(offset);
      const speed = clamp(1.0 + offset.pace * 0.15, 0.94, 1.06);

      // Use the selected sovereign voice's Kokoro voice for preview
      const previewVoice = resolveToKokoro(effectiveVoiceId);

      // POST to preview endpoint → get { audioUrl } (real URL, not blob)
      // This path works reliably on iOS WKWebView + Android WebView
      const res = await apiFetch('/api/voice/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sampleText,
          voiceId: previewVoice,
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

  // Split voices into female (maia_*) and male (atlas*) groups
  const femaleVoices = SOVEREIGN_VOICES.filter(v => v.id.startsWith('maia_'));
  const maleVoices = SOVEREIGN_VOICES.filter(v => v.id.startsWith('atlas'));

  return (
    <div className="space-y-6 font-sans">
      {/* ── Voice Character Picker ──────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-medium text-stone-300 mb-3">Voice Character</div>

        {/* Female voices */}
        <div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Female</div>
        <div className="grid grid-cols-1 gap-2 mb-4">
          {femaleVoices.map((voice) => {
            const isSelected = effectiveVoiceId === voice.id;
            return (
              <button
                key={voice.id}
                onClick={() => onSelectVoice(voice.id)}
                className={`
                  text-left rounded-xl border p-3 transition-all
                  ${isSelected
                    ? 'border-amber-500/60 bg-amber-500/10'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-stone-100">{voice.label}</span>
                    <span className="text-xs">
                      {voice.elements.map(e => ELEMENT_ICONS[e] ?? '').join(' ')}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-xs text-amber-400 font-medium">Active</span>
                  )}
                </div>
                <div className="text-xs text-stone-400 mt-1">{voice.description}</div>
              </button>
            );
          })}
        </div>

        {/* Male voices */}
        <div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Male</div>
        <div className="grid grid-cols-1 gap-2">
          {maleVoices.map((voice) => {
            const isSelected = effectiveVoiceId === voice.id;
            return (
              <button
                key={voice.id}
                onClick={() => onSelectVoice(voice.id)}
                className={`
                  text-left rounded-xl border p-3 transition-all
                  ${isSelected
                    ? 'border-amber-500/60 bg-amber-500/10'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-stone-100">{voice.label}</span>
                    <span className="text-xs">
                      {voice.elements.map(e => ELEMENT_ICONS[e] ?? '').join(' ')}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-xs text-amber-400 font-medium">Active</span>
                  )}
                </div>
                <div className="text-xs text-stone-400 mt-1">{voice.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Voice Tone Offsets ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-5">
        <div className="text-sm font-medium text-stone-300 mb-1">Tone Offsets</div>
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
