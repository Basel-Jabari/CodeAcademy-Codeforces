'use client';

import { ButtonHTMLAttributes } from 'react';
import styles from './OutlineButton.module.css';

export default function OutlineButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`${styles.outlineButton} ${props.className ?? ''}`} />
  );
}
