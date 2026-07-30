import React, { ReactElement, useState } from "react";
import { Problem } from "../../models/Problem";
import { ProblemStatistics } from "../../models/ProblemStatistics";
import { TagNode } from "../../models/TagExpression";
import Header from "../header/Header";
import Snackbar from "../snackbar/Snackbar";
import ProblemsSection from "../problems-section/ProblemsSection";
import { getRandomProblem } from "../../services/problems";
import { parseHandles } from "../../services/submissions";
import { createDefaultExpression } from "../../services/tagExpression";
import {
  setProblemsListToStorage,
  clearProblemsList,
} from "../../services/storage";
import ClearButton from "../clear-button/ClearButton";
import Options from "../options/Options";
import ExpressionBuilder from "../expression/ExpressionBuilder";
import ProblemCheck from "../problem-check/ProblemCheck";
import styled from "styled-components";
import Footer from "../footer/Footer";
import theme from "../../theme";

interface Props {
  initialProblemsList: Array<{
    problem: Problem;
    problemStatistics: ProblemStatistics;
  }>;
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`;

// left half randomizer, right half analyzer; minmax(0, …) keeps the wide
// analyzer tables from stretching the grid past the viewport
const Split = styled.div`
  flex: 1;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: start;
  gap: 24px;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  padding: 6px 24px 36px 24px;

  @media screen and (max-width: 1240px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }

  @media screen and (max-width: 620px) {
    padding: 6px 12px 28px 12px;
  }
`;

const Pane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
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

const Home: React.FC<Props> = (props: Props): ReactElement => {
  const [errContent, setErrContent] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [expression, setExpression] = useState<TagNode>(
    createDefaultExpression(),
  );
  const [participantHandles, setParticipantHandles] = useState<string>("");
  const [problemsList, setProblemsList] = useState<
    Array<{ problem: Problem; problemStatistics: ProblemStatistics }>
  >(props.initialProblemsList);

  const triggerError: (content: string) => void = (content: string) => {
    setErrContent(content);
    setVisible(true);
  };

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
      triggerError(e.message);
    }
  };

  const clearProblemsHistory = (): void => {
    clearProblemsList();
    setProblemsList([]);
  };

  return (
    <Page>
      <Header></Header>

      <Split>
        <Pane>
          <PaneHead>
            <PaneTitle>Randomizer</PaneTitle>
            <PaneSubtitle>
              Build a tag expression, then pull a problem
            </PaneSubtitle>
          </PaneHead>

          <ExpressionBuilder
            expression={expression}
            onChange={setExpression}
          ></ExpressionBuilder>

          <Options
            participantHandles={participantHandles}
            onParticipantHandlesChange={setParticipantHandles}
            onRandomize={randomizeProblem}
            onError={triggerError}
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

        <Pane>
          <PaneHead>
            <PaneTitle>Analyzer</PaneTitle>
            <PaneSubtitle>
              Who solved, who tried, who never opened it
            </PaneSubtitle>
          </PaneHead>

          <ProblemCheck onError={triggerError}></ProblemCheck>
        </Pane>
      </Split>

      <Footer></Footer>

      <Snackbar
        type="error"
        content={errContent}
        visible={visible}
        timeout={5000}
        onCancel={() => setVisible(false)}
      ></Snackbar>
    </Page>
  );
};

export default Home;
