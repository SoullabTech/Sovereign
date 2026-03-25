'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { PersonaBuild, BuildDiff } from '@/lib/stellium/trainingTypes';

interface Props {
  fieldSlug: string;
  palette: { primary: string; text: string; background: string };
}

export default function BuildsTab({ fieldSlug, palette }: Props) {
  const [builds, setBuilds] = useState<PersonaBuild[]>([]);
  const [diff, setDiff] = useState<BuildDiff | null>(null);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBuilds = useCallback(async () => {
    try {
      const res = await fetch(`/api/fields/${fieldSlug}/training?type=builds`);
      if (res.ok) {
        const data = await res.json();
        setBuilds(data.builds ?? []);
        setDiff(data.diff ?? null);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [fieldSlug]);

  useEffect(() => { fetchBuilds(); }, [fetchBuilds]);

  const handleBuild = async () => {
    setBuilding(true);
    setError(null);

    try {
      const res = await fetch(`/api/fields/${fieldSlug}/training/build`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Build failed');
      }
      await fetchBuilds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Build failed');
    } finally {
      setBuilding(false);
    }
  };

  const handleActivate = async (buildId: string) => {
    setActivating(buildId);
    setError(null);

    try {
      const res = await fetch(
        `/api/fields/${fieldSlug}/training/build?action=activate&id=${buildId}`,
        { method: 'POST' }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.issues?.join(', ') || 'Activation failed');
      }
      await fetchBuilds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed');
    } finally {
      setActivating(null);
    }
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

  const totalDiffInputs = diff
    ? diff.corrections_since +
      diff.examples_since.voice + diff.examples_since.stance + diff.examples_since.knowledge +
      diff.preferences_since.voice + diff.preferences_since.stance + diff.preferences_since.boundary
    : 0;

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
        Build synthesizes your corrections, examples, and preferences into a coherent persona.
        New builds start as drafts — review before activating.
      </p>

      {/* Build diff */}
      {diff && totalDiffInputs > 0 && (
        <div
          style={{
            padding: '1rem 1.25rem',
            border: `1px solid ${palette.primary}25`,
            background: `${palette.primary}06`,
            marginBottom: '1.5rem',
          }}
        >
          <p style={{ ...labelStyle, marginBottom: '0.6rem' }}>
            New since {diff.last_build_version ? `v${diff.last_build_version}` : 'start'}
          </p>
          <div style={{
            fontFamily: 'var(--field-font-body)',
            fontSize: '0.82rem',
            color: palette.text,
            display: 'flex',
            gap: '1.25rem',
            flexWrap: 'wrap',
          }}>
            {diff.corrections_since > 0 && (
              <span>+{diff.corrections_since} correction{diff.corrections_since !== 1 ? 's' : ''}</span>
            )}
            {(diff.examples_since.voice + diff.examples_since.stance) > 0 && (
              <span>+{diff.examples_since.voice + diff.examples_since.stance} example{(diff.examples_since.voice + diff.examples_since.stance) !== 1 ? 's' : ''}</span>
            )}
            {(diff.preferences_since.voice + diff.preferences_since.stance + diff.preferences_since.boundary) > 0 && (
              <span>+{diff.preferences_since.voice + diff.preferences_since.stance + diff.preferences_since.boundary} preference{(diff.preferences_since.voice + diff.preferences_since.stance + diff.preferences_since.boundary) !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      )}

      {/* Build button */}
      <button
        onClick={handleBuild}
        disabled={building}
        style={{
          padding: '0.875rem 2rem',
          background: palette.primary,
          color: palette.background,
          fontFamily: 'var(--field-font-body)',
          fontSize: '0.78rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          border: 'none',
          borderRadius: '2px',
          cursor: building ? 'not-allowed' : 'pointer',
          opacity: building ? 0.6 : 1,
          marginBottom: '2rem',
          width: '100%',
        }}
      >
        {building ? 'Building persona...' : 'Build Persona'}
      </button>

      {error && (
        <div style={{
          padding: '0.875rem',
          background: '#FFF0EE',
          border: '1px solid #E8C4BC',
          borderRadius: '2px',
          fontFamily: 'var(--field-font-body)',
          fontSize: '0.82rem',
          color: '#8B3020',
          marginBottom: '1.5rem',
        }}>
          {error}
        </div>
      )}

      {/* Build history */}
      <p style={{ ...labelStyle, marginBottom: '1rem' }}>
        {loading ? 'Loading...' : `${builds.length} build${builds.length !== 1 ? 's' : ''}`}
      </p>

      {builds.map(b => {
        const isExpanded = expandedId === b.id;
        const summary = b.build_input_summary as Record<string, unknown> | null;

        return (
          <div
            key={b.id}
            style={{
              padding: '1rem',
              border: `1px solid ${b.is_active ? palette.primary : `${palette.primary}15`}`,
              background: b.is_active ? `${palette.primary}06` : 'transparent',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: palette.text,
                }}>
                  v{b.version}
                </span>
                {b.is_active && (
                  <span style={{
                    padding: '0.15rem 0.5rem',
                    background: palette.primary,
                    color: palette.background,
                    fontFamily: 'var(--field-font-body)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    borderRadius: '1px',
                  }}>
                    active
                  </span>
                )}
                <span style={{
                  padding: '0.15rem 0.5rem',
                  background:
                    b.validation_status === 'validated' ? '#E8F5E9' :
                    b.validation_status === 'rejected' ? '#FFF0EE' :
                    `${palette.primary}10`,
                  color:
                    b.validation_status === 'validated' ? '#2E7D32' :
                    b.validation_status === 'rejected' ? '#8B3020' :
                    `${palette.text}60`,
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  borderRadius: '1px',
                }}>
                  {b.validation_status}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!b.is_active && b.validation_status !== 'rejected' && (
                  <button
                    onClick={() => handleActivate(b.id)}
                    disabled={activating === b.id}
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: 'transparent',
                      border: `1px solid ${palette.primary}40`,
                      color: palette.primary,
                      fontFamily: 'var(--field-font-body)',
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: activating === b.id ? 'not-allowed' : 'pointer',
                      borderRadius: '2px',
                    }}
                  >
                    {activating === b.id ? '...' : 'Activate'}
                  </button>
                )}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : b.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: `${palette.text}40`,
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                  }}
                >
                  {isExpanded ? 'collapse' : 'expand'}
                </button>
              </div>
            </div>

            {/* Summary line */}
            <div style={{
              fontFamily: 'var(--field-font-body)',
              fontSize: '0.72rem',
              color: `${palette.text}45`,
              marginTop: '0.4rem',
            }}>
              {new Date(b.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
              {summary && (
                <span>
                  {' '}&middot; {String(summary.corrections_count ?? 0)} corrections,{' '}
                  {String(
                    ((summary.examples_count as Record<string, number>)?.voice ?? 0) +
                    ((summary.examples_count as Record<string, number>)?.stance ?? 0)
                  )} examples,{' '}
                  {String(
                    ((summary.preferences_count as Record<string, number>)?.voice ?? 0) +
                    ((summary.preferences_count as Record<string, number>)?.stance ?? 0) +
                    ((summary.preferences_count as Record<string, number>)?.boundary ?? 0)
                  )} preferences
                </span>
              )}
            </div>

            {/* Validation issues */}
            {b.validation_issues?.length > 0 && (
              <div style={{
                marginTop: '0.6rem',
                padding: '0.5rem 0.75rem',
                background: '#FFF0EE',
                borderRadius: '2px',
              }}>
                {b.validation_issues.map((issue, i) => (
                  <p key={i} style={{
                    fontFamily: 'var(--field-font-body)',
                    fontSize: '0.75rem',
                    color: '#8B3020',
                    margin: '0.15rem 0',
                  }}>
                    {issue}
                  </p>
                ))}
              </div>
            )}

            {/* Expanded content */}
            {isExpanded && (
              <div style={{ marginTop: '1rem' }}>
                {b.voice_block && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ ...labelStyle, fontSize: '0.6rem' }}>Voice Block</p>
                    <pre style={{
                      fontFamily: 'var(--field-font-body)',
                      fontSize: '0.78rem',
                      color: `${palette.text}70`,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      margin: 0,
                      padding: '0.75rem',
                      background: `${palette.primary}05`,
                      border: `1px solid ${palette.primary}10`,
                    }}>
                      {b.voice_block}
                    </pre>
                  </div>
                )}
                {b.stance_block && (
                  <div>
                    <p style={{ ...labelStyle, fontSize: '0.6rem' }}>Stance Block</p>
                    <pre style={{
                      fontFamily: 'var(--field-font-body)',
                      fontSize: '0.78rem',
                      color: `${palette.text}70`,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      margin: 0,
                      padding: '0.75rem',
                      background: `${palette.primary}05`,
                      border: `1px solid ${palette.primary}10`,
                    }}>
                      {b.stance_block}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
