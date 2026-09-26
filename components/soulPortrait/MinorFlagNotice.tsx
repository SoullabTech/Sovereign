'use client';

/**
 * Quiet minor-flag notice — top of the practitioner preview
 * (/soul-portrait/preview/[id]). Rendered only when the draft was generated
 * with "Subject is a minor" ticked.
 *
 * Exists because the flag was otherwise invisible until the send API refused
 * with 403 (production incident 2026-07-16 — an elder's portrait, accidental
 * tick, corrected by SQL). This surface makes the marking visible and, on an
 * UNPUBLISHED draft only, lets the owner correct it. The correction is
 * two-step (click, then confirm) so an accidental unflag is as hard as the
 * accidental flag was easy. Published portraits are write-once — the notice
 * explains, offers nothing.
 *
 * This corrects the RECORD only. The send route's minor → guardian-consent
 * refusal is untouched: a genuinely minor subject still cannot be sent to.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ACCENT = '#C9A227';

export function MinorFlagNotice({
  portraitSlug,
  subjectName,
  isPublished,
}: {
  portraitSlug: string;
  subjectName: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function correct() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/soul-portrait/${encodeURIComponent(portraitSlug)}/minor-flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isMinor: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || 'Correction failed.');
        return;
      }
      router.refresh();
    } catch {
      setError('Correction failed — check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px' }}>
      <div
        style={{
          border: `1px solid rgba(201,162,39,0.5)`,
          borderRadius: 8,
          padding: '12px 16px',
          fontSize: 13,
          lineHeight: 1.6,
          color: '#5a4a1a',
          background: 'rgba(201,162,39,0.08)',
        }}
      >
        <div>
          This draft is marked as a <strong>minor&rsquo;s portrait</strong> (&ldquo;Subject is a
          minor&rdquo; was ticked at generation). It cannot be sent — delivery for minors waits on a
          guardian consent flow.
        </div>
        {isPublished ? (
          <div style={{ marginTop: 6, opacity: 0.8 }}>
            This portrait is published and write-once, so the marking can no longer be changed here.
          </div>
        ) : confirming ? (
          <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span>
              Confirm: {subjectName} is <strong>not</strong> a minor?
            </span>
            <button
              onClick={correct}
              disabled={saving}
              style={{
                background: ACCENT,
                color: '#1A2F24',
                border: 'none',
                borderRadius: 6,
                padding: '5px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: saving ? 'default' : 'pointer',
                opacity: saving ? 0.5 : 1,
              }}
            >
              {saving ? 'Correcting…' : 'Yes — remove the marking'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={saving}
              style={{
                background: 'transparent',
                border: '1px solid rgba(90,74,26,0.4)',
                color: '#5a4a1a',
                borderRadius: 6,
                padding: '5px 14px',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Keep it
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 6 }}>
            Ticked by mistake?{' '}
            <button
              onClick={() => setConfirming(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#8a6d1a',
                textDecoration: 'underline',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Correct this on the draft
            </button>
          </div>
        )}
        {error && <div style={{ marginTop: 6, color: '#a33' }}>{error}</div>}
      </div>
    </div>
  );
}
