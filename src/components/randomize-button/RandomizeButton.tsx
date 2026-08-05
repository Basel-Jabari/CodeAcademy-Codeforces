'use client';

import LoadingIndicator from './LoadingIndicator';
import { LoopIcon } from '../../assets/LoopIcon';
import styles from './RandomizeButton.module.css';

interface Props {
  isLoading?: boolean;
  onClick: () => void;
}

export default function RandomizeButton({ isLoading = false, onClick }: Props) {
  return (
    <div
      className={`${styles.button} ${isLoading ? styles.buttonLoading : ''}`}
      onClick={() => { if (!isLoading) onClick(); }}
    >
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <LoopIcon className={styles.loopIcon} />
          <div>Randomize</div>
        </>
      )}
    </div>
  );
}
