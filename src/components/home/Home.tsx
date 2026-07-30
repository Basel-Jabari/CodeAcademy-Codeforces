import React, { ReactElement, useState } from "react";
import styled from "styled-components";
import Header from "../header/Header";
import Snackbar from "../snackbar/Snackbar";
import Footer from "../footer/Footer";
import TabBar, { AppTab } from "../tabs/TabBar";
import RandomizerTab from "../randomizer/RandomizerTab";
import ProblemCheck from "../problem-check/ProblemCheck";
import ContestBuilder from "../contest-builder/ContestBuilder";
import { Problem } from "../../models/Problem";
import { ProblemStatistics } from "../../models/ProblemStatistics";

interface Props {
  initialProblemsList: Array<{
    problem: Problem;
    problemStatistics: ProblemStatistics;
  }>;
}

export type NotifyType = "error" | "success";

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`;

const Content = styled.div`
  flex: 1;
  box-sizing: border-box;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  padding: 6px 24px 36px 24px;

  @media screen and (max-width: 620px) {
    padding: 6px 12px 28px 12px;
  }
`;

const Home: React.FC<Props> = (props: Props): ReactElement => {
  const [tab, setTab] = useState<AppTab>("randomizer");
  const [snackContent, setSnackContent] = useState<string>("");
  const [snackType, setSnackType] = useState<NotifyType>("error");
  const [visible, setVisible] = useState<boolean>(false);

  const triggerError: (content: string) => void = (content: string) => {
    setSnackType("error");
    setSnackContent(content);
    setVisible(true);
  };

  const triggerSuccess: (content: string) => void = (content: string) => {
    setSnackType("success");
    setSnackContent(content);
    setVisible(true);
  };

  return (
    <Page>
      <Header></Header>
      <TabBar active={tab} onChange={setTab}></TabBar>

      <Content>
        {tab === "randomizer" ? (
          <RandomizerTab
            initialProblemsList={props.initialProblemsList}
            onError={triggerError}
          ></RandomizerTab>
        ) : null}

        {tab === "crossAnalysis" ? (
          <ProblemCheck
            onError={triggerError}
            onSuccess={triggerSuccess}
          ></ProblemCheck>
        ) : null}

        {tab === "contestBuilder" ? (
          <ContestBuilder onError={triggerError}></ContestBuilder>
        ) : null}
      </Content>

      <Footer></Footer>

      <Snackbar
        type={snackType}
        content={snackContent}
        visible={visible}
        timeout={snackType === "success" ? 4500 : 5000}
        onCancel={() => setVisible(false)}
      ></Snackbar>
    </Page>
  );
};

export default Home;
