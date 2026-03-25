'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { PersonaPreference, PreferenceCategory } from '@/lib/stellium/trainingTypes';
import {
  VOICE_PRESET_KEYS,
  STANCE_PRESET_KEYS,
  BOUNDARY_PRESET_KEYS,
} from '@/lib/stellium/trainingTypes';

interface Props {
  fieldSlug: string;
  palette: { primary: string; text: string; background: string };
}

const CATEGORIES: { id: PreferenceCategory; label: string; presets: readonly string[] }[] = [
  { id: 'voice', label: 'Voice', presets: VOICE_PRESET_KEYS },
  { id: 'stance', label: 'Stance', presets: STANCE_PRESET_KEYS },
  { id: 'boundary', label: 'Boundary', presets: BOUNDARY_PRESET_KEYS },
];

export default function ToneTab({ fieldSlug, palette }: Props) {
  const [preferences, setPreferences] = useState<PersonaPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState<PreferenceCategory>('voice');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    try {
      const res = await fetch(`/api/fields/${fieldSlug}/training?type=preferences`);
      if (res.ok) {
        const data = await res.json();
        setPreferences(data.preferences ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [fieldSlug]);

  useEffect(() => { fetchPreferences(); }, [fetchPreferences]);

  const handleSubmit = async () => {
    if (!key.trim() || !value.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/fields/${fieldSlug}/training?type=preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, key: key.trim(), value: value.trim() }),
      });
      if (!res.ok) throw new Error('Failed to save preference');
      setKey('');
      setValue('');
      await fetchPreferences();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await fetch(`/api/fields/${fieldSlug}/training?type=preferences&id=${id}`, {
        method: 'DELETE',
      });
      await fetchPreferences();
    } catch {
      // silent
    }
  };

  const currentPresets = CATEGORIES.find(c => c.id === category)?.presets ?? [];

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    background: `${palette.primary}08`,
    border: `1px solid ${palette.primary}25`,
    borderRadius: '2px',
    color: palette.text,
    fontFamily: 'var(--field-font-body)',
    fontSize: '0.85rem',
    lineHeight: 1.5,
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--field-font-body)',
    fontSize: '0.65rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: `${palette.text}50`,
    marginBottom: '0.5rem',
    display: 'block',
  };

  return (
    <div>
      <p
        style={{
          fontFamily: 'var(--field-font-body)',
          fontSize: '0.85rem',
          color: `${palette.text}60`,
          lineHeight: 1.6,
          marginBottom: '1.5rem',
        }}
      >
        Set preferences that shape how your Virtual Self speaks, frames, and holds boundaries.
        Each preference is a key-value directive.
      </p>

      {/* Category selector */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => { setCategory(c.id); setKey(''); }}
            style={{
              padding: '0.5rem 1rem',
              background: category === c.id ? palette.primary : 'transparent',
              color: category === c.id ? palette.background : `${palette.text}60`,
              border: `1px solid ${palette.primary}${category === c.id ? '' : '30'}`,
              borderRadius: '2px',
              fontFamily: 'var(--field-font-body)',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Preset keys */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Key (pick or type)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
          {currentPresets.map(preset => (
            <button
              key={preset}
              onClick={() => setKey(preset)}
              style={{
                padding: '0.3rem 0.6rem',
                background: key === preset ? `${palette.primary}20` : `${palette.primary}08`,
                border: `1px solid ${palette.primary}${key === preset ? '40' : '15'}`,
                borderRadius: '2px',
                fontFamily: 'var(--field-font-body)',
                fontSize: '0.72rem',
                color: `${palette.text}70`,
                cursor: 'pointer',
              }}
            >
              {preset.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="Or type a custom key..."
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Value</label>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={`e.g. "grounded, direct, unhurried"`}
          style={inputStyle}
        />
      </div>

      {error && (
        <p style={{ color: '#8B3020', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!key.trim() || !value.trim() || submitting}
        style={{
          padding: '0.75rem 1.5rem',
          background: palette.primary,
          color: palette.background,
          fontFamily: 'var(--field-font-body)',
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          border: 'none',
          borderRadius: '2px',
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.6 : 1,
          marginBottom: '2.5rem',
        }}
      >
        {submitting ? 'Saving...' : 'Set Preference'}
      </button>

      {/* Grouped list */}
      {CATEGORIES.map(cat => {
        const catPrefs = preferences.filter(p => p.category === cat.id);
        if (catPrefs.length === 0 && !loading) return null;
        return (
          <div key={cat.id} style={{ marginBottom: '1.5rem' }}>
            <p style={{ ...labelStyle, marginBottom: '0.5rem' }}>
              {cat.label} ({catPrefs.length})
            </p>
            {catPrefs.map(p => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.875rem',
                  border: `1px solid ${palette.primary}12`,
                  marginBottom: '0.35rem',
                }}
              >
                <div>
                  <span style={{
                    fontFamily: 'var(--field-font-body)',
                    fontSize: '0.75rem',
                    color: `${palette.text}50`,
                    marginRight: '0.5rem',
                  }}>
                    {p.key}:
                  </span>
                  <span style={{
                    fontFamily: 'var(--field-font-body)',
                    fontSize: '0.82rem',
                    color: palette.text,
                  }}>
                    {p.value}
                  </span>
                </div>
                <button
                  onClick={() => handleDeactivate(p.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: `${palette.text}30`,
                    cursor: 'pointer',
                    fontSize: '0.65rem',
                  }}
                >
                  remove
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
