'use client';

import { useState } from 'react';

import ClearButton from '@/components/clear-button/ClearButton';
import ExpressionBuilder from '@/components/expression/ExpressionBuilder';
import Options from '@/components/options/Options';
import ProblemsSection from '@/components/problems-section/ProblemsSection';
import { getRandomProblem } from '@/services/problems';
import { Problem } from '@/types/Problem';
import { ProblemStatistics } from '@/types/ProblemStatistics';
import { TagNode } from '@/types/TagExpression';
import { parseHandles } from '@/services/submissions';
import { usePersistentState } from '@/utils/persistentState';
import { clearProblemsList, setProblemsListToStorage } from '@/utils/storage';
import { createDefaultExpression, regenerateNodeIds } from '@/utils/tagExpression';

import styles from './RandomizerTab.module.css';

interface Props {
  initialProblemsList: Array<{
    problem: Problem;
    problemStatistics: ProblemStatistics;
  }>;
  onError: (message: string) => void;
}

export default function RandomizerTab(props: Props) {
  const [expression, setExpression] = usePersistentState<TagNode>(
    'randomizer.expression',
    createDefaultExpression,
    regenerateNodeIds,
  );
  const [participantHandles, setParticipantHandles] = usePersistentState<string>(
    'randomizer.participantHandles',
    '',
  );
  const [problemsList, setProblemsList] = useState<
    Array<{ problem: Problem; problemStatistics: ProblemStatistics }>
  >(props.initialProblemsList);

  const randomizeProblem = async (ratings: { min: number; max: number }): Promise<void> => {
    try {
      const newProblem = await getRandomProblem(
        expression,
        ratings,
        parseHandles(participantHandles),
      );
      const newProblemsList = problemsList.concat(newProblem);
      setProblemsListToStorage(newProblemsList);
      setProblemsList(newProblemsList);
    } catch (e: unknown) {
      const err = e as Error;
      props.onError(err.message);
    }
  };

  const clearProblemsHistory = (): void => {
    clearProblemsList();
    setProblemsList([]);
  };

  return (
    <div className={styles.pane}>
      <div className={styles.paneHead}>
        <div className={styles.paneTitle}>Problem Randomizer</div>
        <div className={styles.paneSubtitle}>Build a tag expression, then pull a problem</div>
      </div>

      <ExpressionBuilder expression={expression} onChange={setExpression} />

      <Options
        participantHandles={participantHandles}
        onParticipantHandlesChange={setParticipantHandles}
        onRandomize={randomizeProblem}
        onError={props.onError}
      />

      <div className={styles.historyCard}>
        <div className={styles.historyTitle}>Picked problems</div>
        <ProblemsSection problemsList={problemsList} />
        <ClearButton onClick={clearProblemsHistory} disabled={problemsList.length === 0} />
      </div>
    </div>
  );
}
