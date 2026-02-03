'use client';

/**
 * Global Error Boundary for App Router
 * Handles errors in the root layout, including static export builds
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #0D0F12, #1A1D26, #0D0F12)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'Spectral, Georgia, serif',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h1 style={{ fontSize: '2rem', color: 'rgba(251, 191, 36, 0.9)', marginBottom: '1rem' }}>
              Something Went Wrong
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2rem' }}>
              A critical error has occurred.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(251, 191, 36, 0.2)',
                color: 'rgba(251, 191, 36, 1)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '9999px',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
