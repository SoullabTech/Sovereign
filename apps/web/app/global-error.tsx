'use client'

/**
 * Global error boundary that catches all unhandled errors
 * This file prevents useContext errors during static generation
 * by providing a completely isolated error page with no external dependencies
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1e293b 0%, #451a03 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#f59e0b' }}>
              500
            </h1>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              Something went wrong
            </h2>
            <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
              An unexpected error occurred. The MAIA system is temporarily disrupted.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
