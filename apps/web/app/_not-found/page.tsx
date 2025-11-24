// Nuclear static page to avoid registerClientReference issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function NotFound() {
  return (
    <html>
      <head>
        <title>Page Not Found - MAIA</title>
      </head>
      <body style={{
        margin: 0,
        padding: '2rem',
        backgroundColor: '#030712',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page not found</h1>
        <p style={{ color: '#9CA3AF', marginBottom: '1rem', maxWidth: '28rem' }}>
          The page you were looking for doesn't exist or may have moved.
        </p>
        <a href="/" style={{ color: 'white', textDecoration: 'underline' }}>
          Return to MAIA home
        </a>
      </body>
    </html>
  );
}