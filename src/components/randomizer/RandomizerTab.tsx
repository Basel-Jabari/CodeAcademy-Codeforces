import React, { ReactElement, useState } from "react";
import styled from "styled-components";
import { Problem } from "../../models/Problem";
import { ProblemStatistics } from "../../models/ProblemStatistics";
import { TagNode } from "../../models/TagExpression";
import ProblemsSection from "../problems-section/ProblemsSection";
import { getRandomProblem } from "../../services/problems";
import { parseHandles } from "../../services/submissions";
import {
  createDefaultExpression,
  regenerateNodeIds,
} from "../../services/tagExpression";
import {
  setProblemsListToStorage,
  clearProblemsList,
} from "../../services/storage";
import { usePersistentState } from "../../services/persistentState";
import ClearButton from "../clear-button/ClearButton";
import Options from "../options/Options";
import ExpressionBuilder from "../expression/ExpressionBuilder";
import ResetTabButton from "../common/ResetTabButton";
import theme from "../../theme";

interface Props {
  initialProblemsList: Array<{
    problem: Problem;
    problemStatistics: ProblemStatistics;
  }>;
  onError: (message: string) => void;
  onReset: () => void;
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
  flex-wrap: wrap;
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
  const [problemsList, setProblemsList] = useState<
    Array<{ problem: Problem; problemStatistics: ProblemStatistics }>
  >(props.initialProblemsList);

  const randomizeProblem: (ratings: {
    min: number;
    max: number;
  }) => void = async (ratings: { min: number; max: number }): Promise<void> => {
    try {
      const newProblem = await getRandomProblem(
        expression,
        ratings,
        parseHandles(participantHandles),
      );
      const newProblemsList = problemsList.concat(newProblem);
      setProblemsListToStorage(newProblemsList);
      setProblemsList(newProblemsList);
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
          Build a tag expression, then pull a problem
        </PaneSubtitle>
        <ResetTabButton onClick={props.onReset}></ResetTabButton>
      </PaneHead>

      <ExpressionBuilder
        expression={expression}
        onChange={setExpression}
      ></ExpressionBuilder>

      <Options
        participantHandles={participantHandles}
        onParticipantHandlesChange={setParticipantHandles}
        onRandomize={randomizeProblem}
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
