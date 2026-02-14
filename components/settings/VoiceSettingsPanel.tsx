'use client';

/**
 * VoiceSettingsPanel — member voice preference controls.
 *
 * 5 sliders that gently bias MAIA's baseline voice.
 * MAIA can still self-regulate during HOLD states.
 * Member preferences are offsets, not overrides.
 */

import { useEffect, useRef, useState, useMemo } from 'react';
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
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [offset, setOffset] = useState<Offsets>({ ...DEFAULT_OFFSETS });
  const [systemVoiceId, setSystemVoiceId] = useState<string>('maia');
  const [voiceIdOverride, setVoiceIdOverride] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const onReset = async () => {
    setVoiceIdOverride(null);
    setOffset({ ...DEFAULT_OFFSETS });
    setSaved(false);

    // Auto-save the reset, then preview so the member hears "home"
    setSaving(true);
    try {
      const res = await apiFetch('/api/settings/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceIdOverride: null, offset: { ...DEFAULT_OFFSETS } }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        // Fire preview at baseline so member hears the clean home sound
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
      const sampleText =
        "Here is a quick voice preview. I will keep a steady pace, warmth, and clarity so you can feel what changes.";

      // Map pace offset to speed within the same clamp range as the conductor
      const speed = clamp(1.0 + offset.pace * 0.15, 0.94, 1.06);

      // POST to preview endpoint → get { audioUrl } (real URL, not blob)
      // This path works reliably on iOS WKWebView + Android WebView
      const res = await apiFetch('/api/voice/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sampleText,
          voiceId: effectiveVoiceId === 'maia' ? 'af_heart' : effectiveVoiceId,
          speed,
        }),
      });

      if (!res.ok) {
        if (res.status === 503) {
          setPreviewError('Voice engine is offline. Start the Kokoro TTS service to preview.');
        } else {
          setPreviewError('Preview failed. Try again later.');
        }
        return;
      }

      const { audioUrl } = await res.json();
      if (!audioRef.current || !audioUrl) return;

      // Stop any currently playing preview
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      // Cache-bust so iOS doesn't serve stale audio
      audioRef.current.src = `${audioUrl}?t=${Date.now()}`;
      try {
        await audioRef.current.play();
      } catch (playErr: any) {
        // iOS WKWebView rejects play() if not user-gesture-initiated or muted
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
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm text-stone-400">Voice</div>
        <div className="mt-1 text-lg font-semibold text-stone-100">{effectiveVoiceId}</div>
        <div className="mt-2 text-xs text-stone-400">
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
        <p className="text-xs text-amber-400/80 px-1">{previewError}</p>
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
