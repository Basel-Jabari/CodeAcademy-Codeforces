'use client';

import styles from './CancelButton.module.css';

interface Props {
  onClick: () => void;
}

export default function CancelButton({ onClick }: Props) {
  return (
    <div className={styles.cancelButton} onClick={onClick}>
      X
    </div>
  );
}
