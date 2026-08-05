'use client';

import styles from './EmptySection.module.css';

export default function EmptySection() {
  return (
    <div className={styles.emptySection}>
      <div>Build a tag expression and press Randomize</div>
      <div>to start adding problems</div>
    </div>
  );
}
