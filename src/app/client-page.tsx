'use client';

import React, { useEffect, useState } from 'react';
import App from '../App';
import { dropOutdatedState } from '../services/storage';

export default function ClientPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    dropOutdatedState();
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <App />;
}
