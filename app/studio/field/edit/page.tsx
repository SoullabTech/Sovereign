'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Loader2, Check, Eye, GripVertical, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

// ─── Types ───────────────────────────────────────────────────────────

interface FieldModule {
  id: string;
  label: string;
  order: number;
  enabled: boolean;
}

interface FieldPresence {
  openingLine: string;
  subLine: string;
  backgroundDescription: string;
}

interface FieldStory {
  headline: string;
  lead: string;
  paragraphs: string[];
  lineage: string[];
}

interface FieldCTA {
  label: string;
  href: string;
  style: 'invitation' | 'direct';
}

interface FieldConfig {
  fieldType: string;
  shortName: string;
  practiceType: string;
  presence: FieldPresence;
  story: FieldStory;
  cta: FieldCTA;
  modules: FieldModule[];
  heroImage?: string;
  workIntro?: string;
  theme?: {
    palette: string;
    font: string;
  };
}

// ─── Component ───────────────────────────────────────────────────────

export default function FieldEditorPage() {
  const [config, setConfig] = useState<FieldConfig | null>(null);
  const [practitionerName, setPractitionerName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  // ─── Load ──────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch('/api/studio/field/config');
        const data = await res.json();
        if (data.success && data.fieldConfig) {
          setConfig(data.fieldConfig);
          setPractitionerName(data.name ?? '');
          setSlug(data.slug ?? '');
        } else {
          // No config yet — initialize with defaults
          setConfig({
            fieldType: 'practitioner',
            shortName: '',
            practiceType: '',
            presence: { openingLine: '', subLine: '', backgroundDescription: '' },
            story: { headline: '', lead: '', paragraphs: [''], lineage: [] },
            cta: { label: 'Begin', href: '/', style: 'invitation' },
            modules: [
              { id: 'threshold', label: 'Threshold', order: 1, enabled: true },
              { id: 'presence', label: 'Presence', order: 2, enabled: true },
              { id: 'work-with-me', label: 'Work With Me', order: 3, enabled: true },
              { id: 'booking', label: 'Booking', order: 4, enabled: true },
              { id: 'maia', label: 'MAIA', order: 5, enabled: true },
              { id: 'resources', label: 'Resources', order: 6, enabled: true },
            ],
          });
          setPractitionerName(data?.name ?? '');
          setSlug(data?.slug ?? '');
        }
      } catch (e) {
        setError('Failed to load field config');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ─── Save ──────────────────────────────────────────────────────────

  const save = useCallback(async () => {
    if (!config) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await apiFetch('/api/studio/field/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldConfig: config }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.fieldConfig);
        setSaved(true);
        setDirty(false);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(data.error ?? 'Save failed');
      }
    } catch (e) {
      setError('Failed to save');
      console.error(e);
    } finally {
      setSaving(false);
    }
  }, [config]);

  // ─── Helpers ───────────────────────────────────────────────────────

  function update<K extends keyof FieldConfig>(key: K, value: FieldConfig[K]) {
    if (!config) return;
    setConfig({ ...config, [key]: value });
    setDirty(true);
  }

  function updatePresence<K extends keyof FieldPresence>(key: K, value: string) {
    if (!config) return;
    setConfig({ ...config, presence: { ...config.presence, [key]: value } });
    setDirty(true);
  }

  function updateStory<K extends keyof FieldStory>(key: K, value: FieldStory[K]) {
    if (!config) return;
    setConfig({ ...config, story: { ...config.story, [key]: value } });
    setDirty(true);
  }

  function updateCTA<K extends keyof FieldCTA>(key: K, value: FieldCTA[K]) {
    if (!config) return;
    setConfig({ ...config, cta: { ...config.cta, [key]: value } });
    setDirty(true);
  }

  function toggleModule(id: string) {
    if (!config) return;
    setConfig({
      ...config,
      modules: config.modules.map(m =>
        m.id === id ? { ...m, enabled: !m.enabled } : m
      ),
    });
    setDirty(true);
  }

  function updateParagraph(index: number, value: string) {
    if (!config) return;
    const paragraphs = [...config.story.paragraphs];
    paragraphs[index] = value;
    updateStory('paragraphs', paragraphs);
  }

  function addParagraph() {
    if (!config) return;
    updateStory('paragraphs', [...config.story.paragraphs, '']);
  }

  function removeParagraph(index: number) {
    if (!config) return;
    const paragraphs = config.story.paragraphs.filter((_, i) => i !== index);
    updateStory('paragraphs', paragraphs.length > 0 ? paragraphs : ['']);
  }

  // ─── Render ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500/60" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6 text-red-400">
        {error ?? 'No field config found.'}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-amber-100/90">
            Field Editor
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            {practitionerName ? `${practitionerName}'s field` : 'Your field'}{slug ? ` — ${slug}.soullab.life` : ''}
          </p>
        </div>

        <button
          onClick={save}
          disabled={saving || !dirty}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${dirty
              ? 'bg-amber-600 text-white hover:bg-amber-500'
              : saved
                ? 'bg-emerald-700/50 text-emerald-300'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed'
            }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> :
           saved ? <Check className="w-4 h-4" /> :
           <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-900/30 border border-red-800/50 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* ─── Presence ─────────────────────────────────────────── */}
      <Section title="Presence" description="The first thing visitors see.">
        <Field label="Headline" value={config.presence.openingLine}
          onChange={v => updatePresence('openingLine', v)} />
        <Field label="Subline" value={config.presence.subLine}
          onChange={v => updatePresence('subLine', v)} />
        <Field label="Atmosphere" value={config.presence.backgroundDescription}
          onChange={v => updatePresence('backgroundDescription', v)}
          placeholder="e.g. Warm parchment. Deep amber. Grounded, alive, unhurried." />
      </Section>

      {/* ─── Story ────────────────────────────────────────────── */}
      <Section title="Story" description="Who you are and what brought you here.">
        <Field label="Headline" value={config.story.headline}
          onChange={v => updateStory('headline', v)} />
        <Field label="Lead" value={config.story.lead}
          onChange={v => updateStory('lead', v)} multiline />

        <div className="mt-4">
          <label className="block text-sm text-stone-400 mb-2">Paragraphs</label>
          {config.story.paragraphs.map((p, i) => (
            <div key={i} className="flex gap-2 mb-3">
              <GripVertical className="w-4 h-4 text-stone-600 mt-3 shrink-0" />
              <textarea
                value={p}
                onChange={e => updateParagraph(i, e.target.value)}
                rows={3}
                className="flex-1 bg-stone-900/50 border border-stone-700/50 rounded-lg px-3 py-2 text-stone-200 text-sm
                  focus:outline-none focus:border-amber-600/50 resize-y"
              />
              {config.story.paragraphs.length > 1 && (
                <button onClick={() => removeParagraph(i)}
                  className="text-stone-600 hover:text-red-400 mt-2 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button onClick={addParagraph}
            className="flex items-center gap-1 text-sm text-amber-500/70 hover:text-amber-400 mt-1">
            <Plus className="w-3 h-3" /> Add paragraph
          </button>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-stone-400 mb-2">Lineage</label>
          <textarea
            value={config.story.lineage.join('\n')}
            onChange={e => updateStory('lineage', e.target.value.split('\n').filter(Boolean))}
            rows={4}
            placeholder="One line per credential or lineage item"
            className="w-full bg-stone-900/50 border border-stone-700/50 rounded-lg px-3 py-2 text-stone-200 text-sm
              focus:outline-none focus:border-amber-600/50 resize-y"
          />
        </div>
      </Section>

      {/* ─── Work Intro ───────────────────────────────────────── */}
      <Section title="Work Introduction" description="How you describe what you do.">
        <Field label="Short Name" value={config.shortName}
          onChange={v => update('shortName', v)}
          placeholder="e.g. Kelly" />
        <Field label="Practice Type" value={config.practiceType}
          onChange={v => update('practiceType', v)}
          placeholder="e.g. guide, therapist, coach" />
        <Field label="Work Intro" value={config.workIntro ?? ''}
          onChange={v => update('workIntro', v)}
          multiline
          placeholder="A brief description of how you work with people." />
      </Section>

      {/* ─── Hero Image ───────────────────────────────────────── */}
      <Section title="Hero Image" description="Your field's main visual.">
        <Field label="Image URL" value={config.heroImage ?? ''}
          onChange={v => update('heroImage', v)}
          placeholder="/images/practitioners/your-image.jpg" />
        {config.heroImage && (
          <div className="mt-3 rounded-lg overflow-hidden border border-stone-700/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={config.heroImage} alt="Hero preview" className="w-full max-h-48 object-cover" />
          </div>
        )}
      </Section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <Section title="Call to Action" description="The primary action button.">
        <Field label="Button Text" value={config.cta.label}
          onChange={v => updateCTA('label', v)} />
        <Field label="Link" value={config.cta.href}
          onChange={v => updateCTA('href', v)} />
        <div className="mt-3">
          <label className="block text-sm text-stone-400 mb-2">Style</label>
          <div className="flex gap-3">
            {(['invitation', 'direct'] as const).map(style => (
              <button key={style}
                onClick={() => updateCTA('style', style)}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-all
                  ${config.cta.style === style
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-600/50'
                    : 'bg-stone-800/50 text-stone-400 border border-stone-700/30 hover:border-stone-600/50'
                  }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Module Toggles ───────────────────────────────────── */}
      <Section title="Modules" description="Toggle which sections appear on your field page.">
        <div className="space-y-2">
          {config.modules
            .sort((a, b) => a.order - b.order)
            .map(mod => (
            <div key={mod.id}
              className="flex items-center justify-between p-3 rounded-lg bg-stone-900/30 border border-stone-700/30">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-stone-600" />
                <span className="text-sm text-stone-200">{mod.label}</span>
              </div>
              <button
                onClick={() => toggleModule(mod.id)}
                className={`w-10 h-5 rounded-full transition-colors relative
                  ${mod.enabled ? 'bg-amber-600' : 'bg-stone-700'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform
                  ${mod.enabled ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Theme / Palette ──────────────────────────────────── */}
      <Section title="Theme" description="Visual styling for your field page.">
        <Field label="Palette" value={config.theme?.palette ?? ''}
          onChange={v => update('theme', { ...config.theme, palette: v, font: config.theme?.font ?? '' })}
          placeholder="e.g. warm-earth, deep-ocean, sage" />
        <Field label="Font" value={config.theme?.font ?? ''}
          onChange={v => update('theme', { ...config.theme, font: v, palette: config.theme?.palette ?? '' })}
          placeholder="e.g. serif, sans, mono" />
      </Section>

      {/* Preview link */}
      {slug && (
        <div className="mt-8 text-center">
          <a href={`/fields/${slug}/partner`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-amber-500/70 hover:text-amber-400 transition-colors">
            <Eye className="w-4 h-4" /> Preview your field page
          </a>
        </div>
      )}

      {/* Floating save bar */}
      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 bg-stone-900/95 border-t border-stone-700/50 p-4 z-50
          flex items-center justify-center gap-4 backdrop-blur-sm">
          <span className="text-sm text-stone-400">Unsaved changes</span>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium
              hover:bg-amber-500 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Shared Components ─────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-medium text-amber-100/80 mb-1">{title}</h2>
      <p className="text-sm text-stone-500 mb-4">{description}</p>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, placeholder, multiline }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const cls = `w-full bg-stone-900/50 border border-stone-700/50 rounded-lg px-3 py-2 text-stone-200 text-sm
    focus:outline-none focus:border-amber-600/50 placeholder:text-stone-600`;

  return (
    <div className="mb-3">
      <label className="block text-sm text-stone-400 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className={`${cls} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}
