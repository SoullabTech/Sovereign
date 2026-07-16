'use client';

/**
 * Send panel — bottom of the practitioner preview (/soul-portrait/preview/[id]).
 *
 * The Gate-4 send gesture: the practitioner attests the recipient's consent,
 * then the portrait is published and a private link is minted (optionally
 * emailed). The attestation checkbox is the consent RECORD's source — it is
 * required on first send, and the API refuses without it.
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
  const [email, setEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentUrl, setSentUrl] = useState<string | null>(
    alreadyPublished && existingPath ? existingPath : null,
  );
  const [emailedTo, setEmailedTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendNote, setResendNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const needsAttestation = !alreadyPublished && !sentUrl;

  async function send() {
    setSending(true);
    setError(null);
    setResendNote(null);
    try {
      const res = await fetch(`/api/soul-portrait/${encodeURIComponent(portraitSlug)}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          consentAttested: attested || alreadyPublished || !!sentUrl,
          recipientEmail: email.trim() || undefined,
          recipientName: recipientName.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || 'Send failed.');
        return;
      }
      setSentUrl(data.url);
      if (data.emailed) {
        setEmailedTo(email.trim());
        setResendNote(
          `Email accepted for delivery to ${email.trim()}. If it doesn't appear within a few minutes, ask them to check Spam or Promotions — or share the link directly.`,
        );
      } else if (email.trim()) {
        setError(data.emailError ? `The email failed to send: ${data.emailError}` : 'The email failed to send — the link above still works.');
      }
    } catch {
      setError('Send failed — check your connection and try again.');
    } finally {
      setSending(false);
    }
  }

  async function copy() {
    if (!sentUrl) return;
    const absolute = sentUrl.startsWith('http') ? sentUrl : `${window.location.origin}${sentUrl}`;
    await navigator.clipboard.writeText(absolute);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid rgba(234,242,236,0.25)',
    background: 'rgba(255,255,255,0.06)',
    color: INK,
    fontSize: 14,
    boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: 720, margin: '48px auto 64px', padding: '0 16px' }}>
      <div
        style={{
          background: GREEN,
          color: INK,
          borderRadius: 12,
          padding: '28px 28px 32px',
          border: `1px solid rgba(201,162,39,0.35)`,
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: ACCENT, marginBottom: 8 }}>
          Send this portrait
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 500, fontFamily: 'Georgia, serif' }}>
          Deliver {subjectName}&rsquo;s portrait
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 14, lineHeight: 1.6, color: 'rgba(234,242,236,0.75)' }}>
          Sending creates a private, unlisted link that {subjectName} can open without an account.
          The portrait becomes final when sent — it can no longer be edited, only regenerated.
        </p>

        {sentUrl ? (
          <div>
            <div style={{ fontSize: 13, color: 'rgba(234,242,236,0.7)', marginBottom: 6 }}>
              {emailedTo ? `Sent to ${emailedTo}. The private link:` : 'The private link:'}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href={sentUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: ACCENT, fontSize: 14, wordBreak: 'break-all' }}
              >
                {sentUrl.startsWith('http') ? sentUrl : `${typeof window !== 'undefined' ? window.location.origin : ''}${sentUrl}`}
              </a>
              <button
                onClick={copy}
                style={{
                  background: 'transparent',
                  border: `1px solid ${ACCENT}`,
                  color: ACCENT,
                  borderRadius: 6,
                  padding: '6px 14px',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
            <div style={{ marginTop: 20, borderTop: '1px solid rgba(234,242,236,0.15)', paddingTop: 16 }}>
              <div style={{ fontSize: 13, color: 'rgba(234,242,236,0.7)', marginBottom: 10 }}>
                Email the link{emailedTo ? ' again' : ''}:
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="email"
                  placeholder="recipient@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ ...inputStyle, flex: '1 1 220px' }}
                />
                <button
                  onClick={send}
                  disabled={sending || !email.trim()}
                  style={{
                    background: ACCENT,
                    color: GREEN,
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 20px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: sending || !email.trim() ? 'default' : 'pointer',
                    opacity: sending || !email.trim() ? 0.5 : 1,
                  }}
                >
                  {sending ? 'Sending…' : 'Send email'}
                </button>
              </div>
              {resendNote && <div style={{ color: '#9FD8A8', fontSize: 13, marginTop: 10 }}>{resendNote}</div>}
              {error && <div style={{ color: '#E8A0A0', fontSize: 13, marginTop: 10 }}>{error}</div>}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            <input
              type="text"
              placeholder={`Recipient name (defaults to ${subjectName})`}
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Recipient email (optional — leave blank to just create the link)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
            <textarea
              placeholder="A personal note to include (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
            {needsAttestation && (
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, lineHeight: 1.5, color: 'rgba(234,242,236,0.85)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={attested}
                  onChange={(e) => setAttested(e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span>
                  {subjectName} knows this portrait was prepared and has agreed to receive it.
                  Their consent is recorded and they may ask for it to be withdrawn at any time.
                </span>
              </label>
            )}
            {error && <div style={{ color: '#E8A0A0', fontSize: 13 }}>{error}</div>}
            <div>
              <button
                onClick={send}
                disabled={sending || (needsAttestation && !attested)}
                style={{
                  background: ACCENT,
                  color: GREEN,
                  border: 'none',
                  borderRadius: 6,
                  padding: '12px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: sending || (needsAttestation && !attested) ? 'default' : 'pointer',
                  opacity: sending || (needsAttestation && !attested) ? 0.5 : 1,
                }}
              >
                {sending ? 'Sending…' : email.trim() ? 'Send portrait' : 'Create private link'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
