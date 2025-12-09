export default function SimplePage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      padding: '20px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#000000', fontSize: '24px', marginBottom: '20px' }}>
        SOULLAB MAIA
      </h1>
      <p style={{ color: '#666666', fontSize: '16px', marginBottom: '20px' }}>
        Simple Test Page
      </p>
      <div style={{
        width: '50px',
        height: '50px',
        backgroundColor: '#00bcd4',
        borderRadius: '50%',
        marginBottom: '20px'
      }}></div>
      <p style={{ color: '#999999', fontSize: '14px' }}>
        If you can see this, the server connection is working.
      </p>
    </div>
  );
}