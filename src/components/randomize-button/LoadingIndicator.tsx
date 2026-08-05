'use client';

import styles from './LoadingIndicator.module.css';

export default function LoadingIndicator() {
  return (
    <div className={styles.indicator}>
      <div className={`${styles.circle} ${styles.circle1}`} />
      <div className={`${styles.circle} ${styles.circle2}`} />
      <div className={`${styles.circle} ${styles.circle3}`} />
    </div>
  );
}
