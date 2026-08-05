'use client';

import { useEffect } from 'react';
import CancelButton from './CancelButton';
import styles from './Snackbar.module.css';

interface SnackbarProps {
  visible: boolean;
  type?: 'error' | 'success' | string;
  content: string;
  onCancel: () => void;
  timeout: number;
}

export default function Snackbar({ visible, type = 'error', content, onCancel, timeout }: SnackbarProps) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onCancel, timeout);
      return () => clearTimeout(t);
    }
  }, [visible, onCancel, timeout]);

  const typeClass = type === 'error' ? styles.error : type === 'success' ? styles.success : styles.default;

  return (
    <div className={`${styles.snackbar} ${typeClass} ${visible ? styles.visible : ''}`}>
      <div className={styles.messageText}>{content}</div>
      <CancelButton onClick={onCancel} />
    </div>
  );
}
