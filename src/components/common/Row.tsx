'use client';

import { HTMLAttributes } from 'react';
import styles from './Row.module.css';

export default function Row(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`${styles.row} ${props.className ?? ''}`} />
  );
}
