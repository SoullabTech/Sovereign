// Legacy Pages Router error handler
// This file prevents Next.js from generating a default error handler that uses React Context
// during static generation, which causes useContext errors on Vercel.

function Error({ statusCode }) {
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
      <div style={{
        textAlign: 'center',
        maxWidth: '400px',
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '12px',
        padding: '2rem',
        border: '1px solid rgba(239, 68, 68, 0.2)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'rgba(239, 68, 68, 0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          fontSize: '24px'
        }}>
          ⚠️
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#f59e0b' }}>
          {statusCode
            ? `A ${statusCode} error occurred on server`
            : 'An error occurred on client'}
        </h1>
        <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
          We encountered an unexpected error. Please try again or return home.
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
          🏠 Go Home
        </a>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error