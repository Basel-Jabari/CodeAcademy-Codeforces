'use client';

import Image from 'next/image';
import Link from 'next/link';

import { images } from '@/assets';

import styles from './Footer.module.css';

const originalRepositoryUrl = 'https://github.com/KarimElghamry/Codeforces-Randomizer';
const projectRepositoryUrl = 'https://github.com/Basel-Jabari/Codeforces-Randomizer';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Link className={styles.link} href={originalRepositoryUrl} target="_blank" rel="noopener noreferrer">
        <Image className={styles.githubLogo} src={images.githubLogo} alt="GitHub Logo" width={20} height={20} />
        <div>Codeforces Randomizer — Karim Elghamry</div>
      </Link>
      <Link className={styles.link} href={projectRepositoryUrl} target="_blank" rel="noopener noreferrer">
        <Image className={styles.githubLogo} src={images.githubLogo} alt="GitHub Logo" width={20} height={20} />
        <div>
          CodeAcademy-Codeforces — Basel Al-Jabari, Bara Wazwaz, Mohammed Al-Shareef
        </div>
      </Link>
    </footer>
  );
}
