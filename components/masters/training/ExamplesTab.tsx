'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { PersonaExample, TrainingLayer } from '@/lib/stellium/trainingTypes';

interface Props {
  fieldSlug: string;
  palette: { primary: string; text: string; background: string };
}

export default function ExamplesTab({ fieldSlug, palette }: Props) {
  const [examples, setExamples] = useState<PersonaExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [idealResponse, setIdealResponse] = useState('');
  const [layer, setLayer] = useState<TrainingLayer>('voice');
  const [error, setError] = useState<string | null>(null);

  const fetchExamples = useCallback(async () => {
    try {
      const res = await fetch(`/api/fields/${fieldSlug}/training?type=examples`);
      if (res.ok) {
        const data = await res.json();
        setExamples(data.examples ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [fieldSlug]);

  useEffect(() => { fetchExamples(); }, [fetchExamples]);

  const handleSubmit = async () => {
    if (!userMessage.trim() || !idealResponse.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/fields/${fieldSlug}/training?type=examples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_message: userMessage.trim(),
          ideal_response: idealResponse.trim(),
          layer,
        }),
      });
      if (!res.ok) throw new Error('Failed to add example');
      setUserMessage('');
      setIdealResponse('');
      await fetchExamples();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/fields/${fieldSlug}/training?type=examples&id=${id}`, {
        method: 'DELETE',
      });
      await fetchExamples();
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

  const voiceExamples = examples.filter(e => e.layer === 'voice');
  const stanceExamples = examples.filter(e => e.layer === 'stance');

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
          Show MAIA how you'd respond. Voice examples shape how you sound. Stance examples shape how you think and frame.
        </p>

        {/* Layer selector */}
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
          {(['voice', 'stance'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLayer(l)}
              style={{
                padding: '0.5rem 1rem',
                background: layer === l ? palette.primary : 'transparent',
                color: layer === l ? palette.background : `${palette.text}60`,
                border: `1px solid ${palette.primary}${layer === l ? '' : '30'}`,
                borderRadius: '2px',
                fontFamily: 'var(--field-font-body)',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Someone asks</label>
          <textarea
            value={userMessage}
            onChange={e => setUserMessage(e.target.value)}
            placeholder="What someone might say or ask..."
            rows={3}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>You'd respond</label>
          <textarea
            value={idealResponse}
            onChange={e => setIdealResponse(e.target.value)}
            placeholder="How you'd actually respond..."
            rows={5}
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
          disabled={!userMessage.trim() || !idealResponse.trim() || submitting}
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
          {submitting ? 'Adding...' : `Add ${layer} Example`}
        </button>
      </div>

      {/* List grouped by layer */}
      {[
        { label: 'Voice', items: voiceExamples },
        { label: 'Stance', items: stanceExamples },
      ].map(group => (
        <div key={group.label} style={{ marginBottom: '2rem' }}>
          <p style={{ ...labelStyle, marginBottom: '0.75rem' }}>
            {loading ? 'Loading...' : `${group.label} (${group.items.length})`}
          </p>

          {group.items.map(e => (
            <div
              key={e.id}
              style={{
                padding: '1rem',
                border: `1px solid ${palette.primary}15`,
                marginBottom: '0.75rem',
                position: 'relative',
              }}
            >
              <div style={{ marginBottom: '0.6rem' }}>
                <span style={{ ...labelStyle, fontSize: '0.6rem' }}>User</span>
                <p style={{
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '0.82rem',
                  color: `${palette.text}55`,
                  lineHeight: 1.55,
                  margin: 0,
                }}>
                  {e.user_message}
                </p>
              </div>
              <div>
                <span style={{ ...labelStyle, fontSize: '0.6rem' }}>Ideal</span>
                <p style={{
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '0.82rem',
                  color: palette.text,
                  lineHeight: 1.55,
                  margin: 0,
                }}>
                  {e.ideal_response}
                </p>
              </div>
              <button
                onClick={() => handleDelete(e.id)}
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
      ))}
    </div>
  );
}
