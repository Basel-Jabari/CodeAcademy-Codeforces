'use client';

import Image from 'next/image';
import Link from 'next/link';

import * as assets from '@/assets';

import styles from './Header.module.css';

export default function Header() {
  return (
    <div className={styles.container}>
      <div className={styles.brandRow}>
        <Link
          className={styles.brandBlock}
          href="https://linktr.ee/PPUCodeAcademy12"
          target="_blank"
          rel="noopener noreferrer"
          title="PPU Code Academy"
        >
          <Image
            className={styles.logo}
            src={assets.images.ppuccIcon}
            alt="PPU Code Academy logo"
            width={180}
            height={48}
            priority
          />
        </Link>

        <div className={styles.join}>X</div>

        <Link
          className={styles.brandBlock}
          href="https://codeforces.com/"
          target="_blank"
          rel="noopener noreferrer"
          title="Codeforces"
        >
          <Image
            className={styles.logo}
            src={assets.images.codeforcesIcon}
            alt="Codeforces logo"
            width={180}
            height={48}
            priority
          />
        </Link>
      </div>
    </div>
  );
}
