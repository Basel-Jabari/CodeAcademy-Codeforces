'use client';

import Image from 'next/image';
import Link from 'next/link';

import { images } from '@/assets';
import { Problem } from '@/types/Problem';
import { ProblemStatistics } from '@/types/ProblemStatistics';
import { getProblemUrl } from '@/utils/problemLink';

import styles from './ProblemCard.module.css';

interface CardProps {
  problem: Problem;
  problemStatistics: ProblemStatistics;
}

export default function ProblemCard({ problem, problemStatistics }: CardProps) {
  const problemUrl = getProblemUrl({ contestId: problem.contestId, index: problem.index });

  return (
    <Link href={problemUrl} target="_blank" rel="noopener noreferrer" className={styles.card}>
      <div className={`${styles.cell} ${styles.flex1} ${styles.idCell}`}>
        {`${problemStatistics.contestId}${problemStatistics.index}`}
      </div>
      <div className={`${styles.cell} ${styles.flex2}`}>{problem.name}</div>
      <div className={`${styles.cell} ${styles.flex1} ${styles.ratingCell}`}>
        {problem.rating ?? 0}
      </div>
      <div className={`${styles.cell} ${styles.flex1} ${styles.solvedCell}`}>
        <Image src={images.userIcon} alt="Solved count" width={16} height={16} />
        <span>{`x${problemStatistics.solvedCount}`}</span>
      </div>
    </Link>
  );
}
