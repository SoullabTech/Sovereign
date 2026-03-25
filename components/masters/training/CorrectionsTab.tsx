'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { PersonaCorrection } from '@/lib/stellium/trainingTypes';

interface Props {
  fieldSlug: string;
  palette: { primary: string; text: string; background: string };
}

export default function CorrectionsTab({ fieldSlug, palette }: Props) {
  const [corrections, setCorrections] = useState<PersonaCorrection[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [originalResponse, setOriginalResponse] = useState('');
  const [correction, setCorrection] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchCorrections = useCallback(async () => {
    try {
      const res = await fetch(`/api/fields/${fieldSlug}/training?type=corrections`);
      if (res.ok) {
        const data = await res.json();
        setCorrections(data.corrections ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [fieldSlug]);

  useEffect(() => { fetchCorrections(); }, [fetchCorrections]);

  const handleSubmit = async () => {
    if (!originalResponse.trim() || !correction.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/fields/${fieldSlug}/training?type=corrections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_response: originalResponse.trim(),
          correction: correction.trim(),
        }),
      });
      if (!res.ok) throw new Error('Failed to add correction');
      setOriginalResponse('');
      setCorrection('');
      await fetchCorrections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/fields/${fieldSlug}/training?type=corrections&id=${id}`, {
        method: 'DELETE',
      });
      await fetchCorrections();
    } catch {
      // silent
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.875rem',
    background: `${palette.primary}08`,
    border: `1px solid ${palette.primary}25`,
    borderRadius: '2px',
    color: palette.text,
    fontFamily: 'var(--field-font-body)',
    fontSize: '0.85rem',
    lineHeight: 1.65,
    resize: 'vertical',
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
      {/* Add form */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p
          style={{
            fontFamily: 'var(--field-font-body)',
            fontSize: '0.85rem',
            color: `${palette.text}60`,
            lineHeight: 1.6,
            marginBottom: '1.5rem',
          }}
        >
          When MAIA says something that doesn't sound like you, paste it here with how you'd actually say it.
          This is the highest-signal training input.
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>MAIA said</label>
          <textarea
            value={originalResponse}
            onChange={e => setOriginalResponse(e.target.value)}
            placeholder="Paste what MAIA said that didn't feel right..."
            rows={4}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>You would say</label>
          <textarea
            value={correction}
            onChange={e => setCorrection(e.target.value)}
            placeholder="How you'd actually say it..."
            rows={4}
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
          disabled={!originalResponse.trim() || !correction.trim() || submitting}
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
          }}
        >
          {submitting ? 'Adding...' : 'Add Correction'}
        </button>
      </div>

      {/* List */}
      <div>
        <p style={{ ...labelStyle, marginBottom: '1rem' }}>
          {loading ? 'Loading...' : `${corrections.length} correction${corrections.length !== 1 ? 's' : ''}`}
        </p>

        {corrections.map(c => (
          <div
            key={c.id}
            style={{
              padding: '1rem',
              border: `1px solid ${palette.primary}15`,
              marginBottom: '0.75rem',
              position: 'relative',
            }}
          >
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ ...labelStyle, fontSize: '0.6rem' }}>MAIA said</span>
              <p style={{
                fontFamily: 'var(--field-font-body)',
                fontSize: '0.82rem',
                color: `${palette.text}55`,
                lineHeight: 1.55,
                margin: 0,
              }}>
                {c.original_response}
              </p>
            </div>
            <div>
              <span style={{ ...labelStyle, fontSize: '0.6rem' }}>Corrected to</span>
              <p style={{
                fontFamily: 'var(--field-font-body)',
                fontSize: '0.82rem',
                color: palette.text,
                lineHeight: 1.55,
                margin: 0,
              }}>
                {c.correction}
              </p>
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'none',
                border: 'none',
                color: `${palette.text}30`,
                cursor: 'pointer',
                fontSize: '0.7rem',
              }}
            >
              remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
