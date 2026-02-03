"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PractitionerThemeV1 } from "@/lib/theme/practitionerTheme";
import { PRACTITIONER_THEME_DEFAULTS_V1 } from "@/lib/theme/practitionerTheme";

type WizardStep = 1 | 2 | 3 | 4 | 5;

type Preset = {
  key: string;
  name: string;
  description?: string;
  colors?: Record<string, string>;
  typography?: { heading: string; body: string };
  aiTone?: string;
};

interface Props {
  initialStep: number;
  practitionerId?: string;
}

interface PractitionerContext {
  id: string;
  slug: string;
  name: string;
}

export default function PractitionerOnboardingWizard({ initialStep, practitionerId }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(() => clampStep(initialStep));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePractitionerId, setActivePractitionerId] = useState<string | null>(practitionerId || null);

  const [theme, setTheme] = useState<PractitionerThemeV1>(PRACTITIONER_THEME_DEFAULTS_V1);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [error, setError] = useState<string | null>(null);

  const apiBase = "/api/practitioner/theme/list";

  // Check for practitioner context on mount
  useEffect(() => {
    // If practitionerId was passed as prop, use it
    if (practitionerId) {
      setActivePractitionerId(practitionerId);
      return;
    }

    // Otherwise check localStorage for practitioner_context
    const storedContext = localStorage.getItem("practitioner_context");
    if (storedContext) {
      try {
        const ctx: PractitionerContext = JSON.parse(storedContext);
        if (ctx.id) {
          setActivePractitionerId(ctx.id);
          return;
        }
      } catch {
        // Invalid JSON, clear it
        localStorage.removeItem("practitioner_context");
      }
    }

    // No practitioner found - redirect to signup
    router.push("/practitioners/signup");
  }, [practitionerId, router]);

  useEffect(() => {
    // Don't boot until we have a practitioner ID (or redirect has been triggered)
    if (!activePractitionerId) return;

    let cancelled = false;

    async function boot() {
      try {
        setLoading(true);
        setError(null);

        const [tRes, pRes] = await Promise.all([
          fetch(`${apiBase}?practitionerId=${activePractitionerId}`, { cache: "no-store" }),
          fetch(`${apiBase}/presets`, { cache: "force-cache" }),
        ]);

        const tJson = await tRes.json();
        const pJson = await pRes.json();

        // If practitioner not found, we'll use defaults
        if (tRes.ok && tJson.theme) {
          if (!cancelled) setTheme(tJson.theme);
        }

        if (!pRes.ok) throw new Error(pJson?.error || "Failed to load presets");

        if (!cancelled) {
          setPresets(pJson.presets || []);
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Failed to load onboarding";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [activePractitionerId]);

  const go = (next: WizardStep) => {
    setStep(next);
    router.push(`/practitioners/onboarding/step/${next}`);
  };

  const next = () => go(Math.min(5, step + 1) as WizardStep);
  const back = () => go(Math.max(1, step - 1) as WizardStep);

  const saveTheme = async (partial: Partial<PractitionerThemeV1>) => {
    setSaving(true);
    setError(null);

    try {
      const merged = deepMerge(theme, partial);
      setTheme(merged);

      const res = await fetch(apiBase, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practitionerId: activePractitionerId,
          theme: merged,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Save failed");

      // Server may clamp fields (tier enforcement). Trust the server response.
      setTheme(json.theme);
      return true;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Save failed";
      setError(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = async (presetKey: string) => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/apply-preset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practitionerId: activePractitionerId,
          preset: presetKey,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Preset apply failed");

      setTheme(json.theme);
      return true;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Preset apply failed";
      setError(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const canContinue = useMemo(() => {
    if (saving || loading) return false;
    // Minimal required fields for v1 onboarding
    if (!theme.identity.practiceName?.trim()) return false;
    if (!theme.identity.practitionerName?.trim()) return false;
    if (!theme.ai.name?.trim()) return false;
    return true;
  }, [saving, loading, theme]);

  // Show loading while checking practitioner context or loading theme
  if (!activePractitionerId || loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl border p-6">Loading your setup...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Practice setup</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Step {step} of 5 - Changes save as you go.
          </p>
        </div>
        <div className="flex gap-2">
          {step > 1 && (
            <button
              onClick={back}
              className="rounded-xl border px-4 py-2 text-sm font-medium"
              disabled={saving}
            >
              Back
            </button>
          )}
          {step < 5 && (
            <button
              onClick={async () => {
                if (!canContinue) return;
                next();
              }}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              disabled={!canContinue}
            >
              Next
            </button>
          )}
          {step === 5 && (
            <button
              onClick={() => router.push("/practitioners/dashboard")}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              disabled={saving}
            >
              Finish
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border p-6">
          {step === 1 && (
            <Step1Vibe presets={presets} onApply={applyPreset} saving={saving} />
          )}
          {step === 2 && (
            <Step2Identity theme={theme} onSave={saveTheme} saving={saving} />
          )}
          {step === 3 && <Step3Voice theme={theme} onSave={saveTheme} saving={saving} />}
          {step === 4 && (
            <Step4Features theme={theme} onSave={saveTheme} saving={saving} />
          )}
          {step === 5 && <Step5Publish theme={theme} />}
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-sm font-medium">Live preview</h2>
          <div
            className="mt-3 rounded-xl border p-4"
            style={{
              backgroundColor: theme.theme.colors.background,
              color: theme.theme.colors.text,
              borderColor: theme.theme.colors.border,
            }}
          >
            <div
              className="text-base font-semibold"
              style={{ color: theme.theme.colors.primary }}
            >
              {theme.identity.practiceName}
            </div>
            <div
              className="mt-1 text-sm"
              style={{ color: theme.theme.colors.textMuted }}
            >
              AI companion: {theme.ai.name} - Tone: {theme.ai.tone}
            </div>
            <div
              className="mt-4 text-sm"
              style={{ color: theme.theme.colors.textMuted }}
            >
              Enabled:{" "}
              {Object.entries(theme.features)
                .filter(([, v]) => v)
                .map(([k]) => k)
                .join(", ") || "None"}
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Preview updates as you configure. Colors and fonts reflect your vibe selection.
          </div>
        </div>
      </div>
    </main>
  );
}

function clampStep(n: number): WizardStep {
  if (n <= 1) return 1;
  if (n >= 5) return 5;
  return n as WizardStep;
}

function deepMerge<T>(base: T, patch: Partial<T>): T {
  const out = Array.isArray(base)
    ? [...(base as unknown[])] as unknown as Record<string, unknown>
    : { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = deepMerge(out[k] ?? {}, v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

function Step1Vibe({
  presets,
  onApply,
  saving,
}: {
  presets: Preset[];
  onApply: (key: string) => Promise<boolean>;
  saving: boolean;
}) {
  return (
    <section>
      <h2 className="text-lg font-medium">Choose a vibe</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Start from a preset. You can refine later depending on your tier.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {presets.map((p) => (
          <button
            key={p.key}
            onClick={() => onApply(p.key)}
            disabled={saving}
            className="rounded-2xl border p-4 text-left hover:bg-muted/30 disabled:opacity-50"
          >
            <div className="text-sm font-medium">{p.name}</div>
            {p.description && (
              <div className="mt-1 text-xs text-muted-foreground">{p.description}</div>
            )}
            <div className="mt-3 flex gap-2">
              {p.colors?.primary && <Swatch value={p.colors.primary} />}
              {p.colors?.accent && <Swatch value={p.colors.accent} />}
              {p.colors?.background && <Swatch value={p.colors.background} />}
              {p.colors?.surface && <Swatch value={p.colors.surface} />}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function Step2Identity({
  theme,
  onSave,
  saving,
}: {
  theme: PractitionerThemeV1;
  onSave: (partial: Partial<PractitionerThemeV1>) => Promise<boolean>;
  saving: boolean;
}) {
  const [practiceName, setPracticeName] = useState(theme.identity.practiceName);
  const [practitionerName, setPractitionerName] = useState(theme.identity.practitionerName);

  useEffect(() => {
    setPracticeName(theme.identity.practiceName);
    setPractitionerName(theme.identity.practitionerName);
  }, [theme.identity.practiceName, theme.identity.practitionerName]);

  const handleBlur = () => {
    onSave({
      identity: {
        ...theme.identity,
        practiceName,
        practitionerName,
      },
    });
  };

  return (
    <section>
      <h2 className="text-lg font-medium">Identity</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This is what your clients will see at the top of your portal.
      </p>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium">Practice name</span>
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            value={practiceName}
            onChange={(e) => setPracticeName(e.target.value)}
            onBlur={handleBlur}
            disabled={saving}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Your name</span>
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            value={practitionerName}
            onChange={(e) => setPractitionerName(e.target.value)}
            onBlur={handleBlur}
            disabled={saving}
          />
        </label>
      </div>
    </section>
  );
}

function Step3Voice({
  theme,
  onSave,
  saving,
}: {
  theme: PractitionerThemeV1;
  onSave: (partial: Partial<PractitionerThemeV1>) => Promise<boolean>;
  saving: boolean;
}) {
  const [aiName, setAiName] = useState(theme.ai.name);
  const [tone, setTone] = useState(theme.ai.tone);

  useEffect(() => {
    setAiName(theme.ai.name);
    setTone(theme.ai.tone);
  }, [theme.ai.name, theme.ai.tone]);

  const handleBlur = () => {
    onSave({
      ai: {
        ...theme.ai,
        name: aiName,
        tone,
      },
    });
  };

  return (
    <section>
      <h2 className="text-lg font-medium">Voice</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Give your companion a name and a tone. Tier rules may clamp advanced settings.
      </p>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium">AI name</span>
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            value={aiName}
            onChange={(e) => setAiName(e.target.value)}
            onBlur={handleBlur}
            disabled={saving}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Tone</span>
          <select
            className="rounded-xl border px-3 py-2 text-sm"
            value={tone}
            onChange={(e) => {
              setTone(e.target.value as typeof tone);
              // Save immediately on select change
              onSave({
                ai: {
                  ...theme.ai,
                  name: aiName,
                  tone: e.target.value as typeof tone,
                },
              });
            }}
            disabled={saving}
          >
            <option value="warm">Warm</option>
            <option value="professional">Professional</option>
            <option value="poetic">Poetic</option>
            <option value="direct">Direct</option>
          </select>
        </label>
      </div>
    </section>
  );
}

function Step4Features({
  theme,
  onSave,
  saving,
}: {
  theme: PractitionerThemeV1;
  onSave: (partial: Partial<PractitionerThemeV1>) => Promise<boolean>;
  saving: boolean;
}) {
  const flags = theme.features;

  const featureLabels: Record<string, string> = {
    voice: "Voice conversations",
    textChat: "Text chat",
    dreamJournal: "Dream journal",
    birthChart: "Birth chart",
    sessionNotes: "Session notes",
    progressTracking: "Progress tracking",
    resourceLibrary: "Resource library",
    communityForum: "Community forum",
  };

  const toggle = async (key: keyof typeof flags) => {
    const next = { ...flags, [key]: !flags[key] };
    await onSave({ features: next });
  };

  return (
    <section>
      <h2 className="text-lg font-medium">Client tools</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose what your clients can access.
      </p>

      <div className="mt-6 grid gap-3">
        {Object.entries(flags).map(([k, v]) => (
          <button
            key={k}
            onClick={() => toggle(k as keyof typeof flags)}
            disabled={saving}
            className="flex items-center justify-between rounded-2xl border p-4 text-left disabled:opacity-50 hover:bg-muted/30"
          >
            <div className="text-sm font-medium">
              {featureLabels[k] || k}
            </div>
            <div
              className={`text-xs px-2 py-1 rounded ${
                v ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {v ? "On" : "Off"}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function Step5Publish({ theme }: { theme: PractitionerThemeV1 }) {
  return (
    <section>
      <h2 className="text-lg font-medium">Publish</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your portal is ready. Next you'll invite your first client and start a session.
      </p>

      <div className="mt-6 rounded-2xl border p-4">
        <div className="text-sm font-medium">Portal address</div>
        <div className="mt-1 text-sm text-muted-foreground">{theme.identity.domain}</div>
      </div>

      <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <div className="text-sm font-medium text-primary">What's next</div>
        <ul className="mt-2 text-sm text-muted-foreground space-y-1">
          <li>- Invite your first client via email</li>
          <li>- Set up intake questions (optional)</li>
          <li>- Add resources to your library</li>
          <li>- Schedule your first session</li>
        </ul>
      </div>
    </section>
  );
}

function Swatch({ value }: { value: string }) {
  return (
    <span
      className="h-4 w-4 rounded-full border"
      style={{ background: value }}
    />
  );
}
