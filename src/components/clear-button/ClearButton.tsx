'use client';

import styles from './ClearButton.module.css';

interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export default function ClearButton({ onClick, disabled }: Props) {
  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.button} ${disabled ? styles.hidden : ''}`}
        onClick={onClick}
      >
        Clear
      </div>
    </div>
  );
}
