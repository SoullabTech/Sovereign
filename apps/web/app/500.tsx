'use client'

/**
 * Static 500 error page
 * This is a client component to prevent useContext errors during static generation
 */

export default function Custom500() {
  // This is a client component that won't cause useContext issues
  return (
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
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#f59e0b' }}>
          500
        </h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          Server Error
        </h2>
        <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
          An internal server error occurred. Please try again later.
        </p>
        <a
          href="/"
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            textDecoration: 'none',
            fontSize: '1rem',
            display: 'inline-block'
          }}
        >
          Go Home
        </a>
      </div>
    </div>
  )
}