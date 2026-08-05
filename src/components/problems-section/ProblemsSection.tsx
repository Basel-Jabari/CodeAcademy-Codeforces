'use client';

import { useEffect, useRef } from 'react';

import EmptySection from '@/components/problems-section/EmptySection';
import ProblemCard from '@/components/problems-section/ProblemCard';
import { Problem } from '@/types/Problem';
import { ProblemStatistics } from '@/types/ProblemStatistics';

import styles from './ProblemsSection.module.css';

interface Props {
  problemsList: Array<{ problem: Problem; problemStatistics: ProblemStatistics }>;
}

export default function ProblemsSection({ problemsList }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    wrapperRef.current?.scrollTo(0, 0);
  }, [problemsList]);

  return (
    <div className={styles.row}>
      <div className={styles.problemsSection} ref={wrapperRef}>
        {problemsList.length === 0 ? (
          <EmptySection />
        ) : (
          [...problemsList].reverse().map((val, index) => (
            <ProblemCard
              key={index}
              problem={val.problem}
              problemStatistics={val.problemStatistics}
            />
          ))
        )}
      </div>
    </div>
  );
}
