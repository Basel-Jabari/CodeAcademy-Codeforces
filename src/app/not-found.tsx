import Link from 'next/link';

export default function NotFound() {
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
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '72px',
          fontWeight: 700,
          color: 'rgba(61, 155, 255, 0.25)',
          margin: 0,
          lineHeight: 1,
        }}
      >
        404
      </h1>
      <h2
        style={{
          color: '#e8eefc',
          fontSize: '20px',
          fontWeight: 600,
          margin: 0,
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          color: 'rgba(232, 238, 252, 0.5)',
          fontSize: '14px',
          maxWidth: '400px',
          margin: 0,
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist. Head back to the randomizer.
      </p>
      <Link
        href="/"
        style={{
          marginTop: '8px',
          padding: '8px 24px',
          background: 'linear-gradient(135deg, #1a6fd4, #3d9bff)',
          borderRadius: '6px',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none',
          letterSpacing: '0.05em',
        }}
      >
        Go to Randomizer
      </Link>
    </div>
  );
}
