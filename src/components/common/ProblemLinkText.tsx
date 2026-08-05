'use client';

import { AnchorHTMLAttributes } from 'react';
import styles from './ProblemLinkText.module.css';

export default function ProblemLinkText(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a {...props} className={`${styles.problemLinkText} ${props.className ?? ''}`} />
  );
}
