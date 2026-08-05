export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#070b14',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(61, 155, 255, 0.2)',
          borderTopColor: '#3d9bff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{ color: 'rgba(232, 238, 252, 0.5)', fontSize: '14px', letterSpacing: '0.05em' }}>
        Loading…
      </span>
    </div>
  );
}
