export default function Custom500() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      background: '#1a1512',
      color: '#d4af37'
    }}>
      <h1>500 - Server Error</h1>
      <p>Something went wrong. Please try again.</p>
    </div>
  );
}
