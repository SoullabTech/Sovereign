'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { resolveWebHandoffR61 } from '@/lib/mobile/resolvedWebHandoffR61';

/**
 * open-web — mobile gate page
 *
 * Shown when an iOS user navigates to a route that only exists on the web.
 * Offers a single action: open soullab.life in Safari.
 *
 * Usage:
 *   router.push('/open-web?to=/studio')
 *   router.push('/open-web?to=/labtools/admin')
 *
 * The `to` param is appended to the base URL so the user lands on the right page.
 *
 * Note: useSearchParams() must be in a child component wrapped by <Suspense>
 * for Next.js static export compatibility.
 */

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  background: '#1A1513',
  color: '#E8DCC8',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  textAlign: 'center',
  gap: '1.5rem',
};

function OpenWebContent() {
  const searchParams = useSearchParams();
  // A changed, unavailable or untrusted query must NOT retain the previous
  // member destination. Derive each navigation from the current verified path.
  const destination = resolveWebHandoffR61(searchParams?.get('to'));

  function openInBrowser() {
    // On iOS Capacitor, window.open with _blank opens Safari
    window.open(destination.href, '_blank', 'noopener,noreferrer');
  }

  return (
    <div style={containerStyle}>
      <div style={{ fontSize: '2.5rem' }}>🌐</div>

      <h1
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#E8DCC8',
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        This feature is on the web
      </h1>

      <p
        style={{
          fontSize: '0.95rem',
          color: '#9B8E7E',
          margin: 0,
          maxWidth: '280px',
          lineHeight: 1.6,
        }}
      >
        {destination.kind === 'verified_destination'
          ? 'This destination is available in the Soullab web experience at '
          : 'The requested route is unavailable or could not be verified. Open Soullab at '}{' '}
        <span style={{ color: '#C4A882' }}>soullab.life</span>
      </p>

      <button
        onClick={openInBrowser}
        style={{
          marginTop: '0.5rem',
          padding: '0.85rem 2rem',
          background: '#C4A882',
          color: '#1A1513',
          border: 'none',
          borderRadius: '8px',
          fontSize: '0.95rem',
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '0.01em',
        }}
      >
        {destination.kind === 'verified_destination'
          ? 'Open in Browser'
          : 'Open Soullab homepage'}
      </button>

      <button
        onClick={() => window.history.back()}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#9B8E7E',
          fontSize: '0.85rem',
          cursor: 'pointer',
          padding: '0.25rem 0.5rem',
        }}
      >
        Go back
      </button>
    </div>
  );
}

// Static fallback shown during SSR prerender (no search params available)
function OpenWebFallback() {
  return (
    <div style={containerStyle}>
      <div style={{ fontSize: '2.5rem' }}>🌐</div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#E8DCC8', margin: 0 }}>
        This feature is on the web
      </h1>
    </div>
  );
}

export default function OpenWebPage() {
  return (
    <Suspense fallback={<OpenWebFallback />}>
      <OpenWebContent />
    </Suspense>
  );
}
