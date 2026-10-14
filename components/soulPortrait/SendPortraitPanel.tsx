'use client';

/**
 * SOUL-PORTRAIT-GIFT-BETA-01 — consent-first, link-only offer.
 *
 * Existing portrait review and subject-consent guarantees remain authoritative.
 * Email delivery and personal-message transport are not available in this beta.
 * A portrait is published only after an explicit member gesture.
 */
import { useState } from 'react';

const GREEN = '#1A2F24';
const INK = '#EAF2EC';
const ACCENT = '#C9A227';

export function SendPortraitPanel({
  portraitSlug,
  subjectName,
  alreadyPublished,
  existingPath,
}: {
  portraitSlug: string;
  subjectName: string;
  alreadyPublished: boolean;
  existingPath: string | null;
}) {
  const [attested, setAttested] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentUrl, setSentUrl] = useState<string | null>(
    alreadyPublished && existingPath ? existingPath : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const needsAttestation = !alreadyPublished && !sentUrl;

  async function createPrivateLink() {
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const response = await fetch('/api/soul-portrait/' + encodeURIComponent(portraitSlug) + '/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          consentAttested: attested || alreadyPublished || !!sentUrl,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || result.error || 'The private link could not be created.');
        return;
      }
      if (typeof result.url !== 'string' || !result.url ||
          result.delivery !== 'private_link_only' || result.emailed !== false) {
        setError('The private-link delivery contract could not be verified. Please try again later.');
        return;
      }
      setSentUrl(result.url);
    } catch {
      setError('The private link could not be created. Check your connection and try again.');
    } finally {
      setSending(false);
    }
  }

  async function copyPrivateLink() {
    if (!sentUrl) return;
    const absolute = sentUrl.startsWith('http') ? sentUrl : window.location.origin + sentUrl;
    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      setError(null);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Copy was not permitted by your browser. You can select and copy the link above.');
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '48px auto 64px', padding: '0 16px' }}>
      <div style={{
        background: GREEN, color: INK, borderRadius: 12,
        padding: '28px 28px 32px', border: '1px solid rgba(201,162,39,0.35)',
      }}>
        <div style={{
          fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: ACCENT, marginBottom: 8,
        }}>
          Offer this portrait
        </div>
        <h2 style={{
          margin: '0 0 8px', fontSize: 20, fontWeight: 500,
          fontFamily: 'Georgia, serif',
        }}>
          A private gift for {subjectName}
        </h2>
        <p style={{
          margin: '0 0 20px', fontSize: 14, lineHeight: 1.6,
          color: 'rgba(234,242,236,0.75)',
        }}>
          Create an unlisted link that the recipient can open without an account.
          This completes the portrait and preserves the subject's consent.
          No email is sent; you choose how to share the link.
        </p>

        {sentUrl ? (
          <div>
            <p style={{ fontSize: 13, color: 'rgba(234,242,236,0.82)', marginBottom: 8 }}>
              Your private gift link
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href={sentUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: ACCENT, fontSize: 14, wordBreak: 'break-all' }}
              >
                {sentUrl.startsWith('http') ? sentUrl :
                  (typeof window !== 'undefined' ? window.location.origin : '') + sentUrl}
              </a>
              <button
                type="button"
                onClick={copyPrivateLink}
                style={{
                  background: 'transparent', border: '1px solid ' + ACCENT,
                  color: ACCENT, borderRadius: 6, padding: '10px 16px',
                  minHeight: 44, fontSize: 14, cursor: 'pointer',
                }}
              >
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
            <p style={{
              marginTop: 20, fontSize: 13, lineHeight: 1.6,
              color: 'rgba(234,242,236,0.72)',
            }}>
              Share only with the person who consented to receive this portrait.
              Their gift is complete without signing up for Soullab.
              Outbound gift email remains unavailable.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 18 }}>
            {needsAttestation && (
              <label style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                fontSize: 13, lineHeight: 1.5,
                color: 'rgba(234,242,236,0.85)', cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={attested}
                  onChange={(event) => setAttested(event.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span>
                  {subjectName} knows this portrait was prepared and has agreed to receive it.
                  Their consent is recorded, and they may request withdrawal at any time.
                </span>
              </label>
            )}
            <button
              type="button"
              onClick={createPrivateLink}
              disabled={sending || (needsAttestation && !attested)}
              style={{
                alignSelf: 'start', background: ACCENT, color: GREEN, border: 'none',
                borderRadius: 6, padding: '12px 22px', minHeight: 44,
                fontSize: 15, fontWeight: 600,
                cursor: sending || (needsAttestation && !attested) ? 'default' : 'pointer',
                opacity: sending || (needsAttestation && !attested) ? 0.5 : 1,
              }}
            >
              {sending ? 'Creating private link…' : 'Create private link'}
            </button>
          </div>
        )}
        {error && (
          <p role="alert" style={{ color: '#E8A0A0', fontSize: 13, marginTop: 16 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
