'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

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
      <h2
        style={{
          color: '#ff4d4f',
          fontSize: '20px',
          fontWeight: 600,
          margin: 0,
        }}
      >
        Something went wrong
      </h2>
      <p
        style={{
          color: 'rgba(232, 238, 252, 0.6)',
          fontSize: '14px',
          maxWidth: '480px',
          margin: 0,
        }}
      >
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: '8px',
          padding: '8px 24px',
          background: 'linear-gradient(135deg, #1a6fd4, #3d9bff)',
          border: 'none',
          borderRadius: '6px',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '0.05em',
        }}
      >
        Try again
      </button>
    </div>
  );
}
