import React, { ReactElement, useState } from "react";
import styled from "styled-components";
import { Problem } from "../../../lib/models/Problem";
import { ProblemStatistics } from "../../../lib/models/ProblemStatistics";
import { TagNode } from "../../../lib/models/TagExpression";
import ProblemsSection from "./ProblemsSection";
import { getRandomProblems } from "../../../lib/problems/domain/problems";
import {
  getProblemKey,
  parseHandles,
} from "../../../lib/codeforces/domain/submissions";
import {
  createDefaultExpression,
  regenerateNodeIds,
} from "../../../lib/expression/domain/tagExpression";
import {
  setProblemsListToStorage,
  clearProblemsList,
} from "../../../lib/storage/domain/storage";
import { usePersistentState } from "../../../lib/storage/domain/persistentState";
import ClearButton from "./ClearButton";
import Options from "./Options";
import ExpressionBuilder from "../../expression/views/ExpressionBuilder";
import theme from "../../../lib/theme/theme";

interface Props {
  initialProblemsList: Array<{
    problem: Problem;
    problemStatistics: ProblemStatistics;
  }>;
  onError: (message: string) => void;
}

const Pane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
`;

const PaneHead = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${theme.border};
`;

const PaneTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${theme.accentBright};
  text-shadow: 0 0 16px ${theme.glowSoft};
`;

const PaneSubtitle = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: ${theme.textMuted};
`;

const HistoryCard = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: 16px;
  background-color: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: 14px;
  box-shadow: 0 0 26px ${theme.glowSoft};
`;

const HistoryTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${theme.accentBright};
`;

const RandomizerTab: React.FC<Props> = (props: Props): ReactElement => {
  const [expression, setExpression] = usePersistentState<TagNode>(
    "randomizer.expression",
    createDefaultExpression,
    regenerateNodeIds,
  );
  const [participantHandles, setParticipantHandles] = usePersistentState<string>(
    "randomizer.participantHandles",
    "",
  );
  const [problemCount, setProblemCount] = usePersistentState<number>(
    "randomizer.problemCount",
    1,
    (stored: number) => {
      const value: number = Math.floor(Number(stored));
      if (!Number.isFinite(value) || value < 1) return 1;
      return Math.min(50, value);
    },
  );
  const [problemsList, setProblemsList] = useState<
    Array<{ problem: Problem; problemStatistics: ProblemStatistics }>
  >(props.initialProblemsList);

  const randomizeProblems: (ratings: {
    min: number;
    max: number;
  }) => void = async (ratings: { min: number; max: number }): Promise<void> => {
    const wanted: number = Math.max(
      1,
      Math.min(50, Math.floor(problemCount) || 1),
    );
    const excludeKeys: Set<string> = new Set(
      problemsList.map((entry) =>
        getProblemKey(entry.problem.contestId, entry.problem.index),
      ),
    );

    try {
      const result = await getRandomProblems(
        expression,
        ratings,
        parseHandles(participantHandles),
        wanted,
        excludeKeys,
      );

      if (result.picked.length === 0) {
        props.onError(
          result.failureReason ||
            "No matching problems left that are not already in your list.",
        );
        return;
      }

      const newProblemsList = problemsList.concat(result.picked);
      setProblemsListToStorage(newProblemsList);
      setProblemsList(newProblemsList);

      if (result.failureReason) {
        props.onError(result.failureReason);
      }
    } catch (e) {
      props.onError(e.message);
    }
  };

  const clearProblemsHistory = (): void => {
    clearProblemsList();
    setProblemsList([]);
  };

  return (
    <Pane>
      <PaneHead>
        <PaneTitle>Problem Randomizer</PaneTitle>
        <PaneSubtitle>
          Build a tag expression, then pull one or more problems
        </PaneSubtitle>
      </PaneHead>

      <ExpressionBuilder
        expression={expression}
        onChange={setExpression}
      ></ExpressionBuilder>

      <Options
        participantHandles={participantHandles}
        onParticipantHandlesChange={setParticipantHandles}
        problemCount={problemCount}
        onProblemCountChange={setProblemCount}
        onRandomize={randomizeProblems}
        onError={props.onError}
      ></Options>

      <HistoryCard>
        <HistoryTitle>Picked problems</HistoryTitle>
        <ProblemsSection problemsList={problemsList}></ProblemsSection>
        <ClearButton
          onClick={clearProblemsHistory}
          disabled={problemsList.length === 0}
        ></ClearButton>
      </HistoryCard>
    </Pane>
  );
};

export default RandomizerTab;
