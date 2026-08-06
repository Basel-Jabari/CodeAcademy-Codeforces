import React, { ReactElement, useState } from "react";
import styled from "styled-components";
import Header from "./layout/header/Header";
import Snackbar from "./layout/snackbar/Snackbar";
import Footer from "./layout/footer/Footer";
import TabBar, { AppTab } from "./layout/tabs/TabBar";
import RandomizerTab from "../features/randomizer";
import ProblemCheck from "../features/cross-analysis";
import ContestBuilder from "../features/contest-builder";
import { Problem } from "../lib/models/Problem";
import { ProblemStatistics } from "../lib/models/ProblemStatistics";
import { usePersistentState } from "../lib/storage/domain/persistentState";

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

const TabPane = styled.div<{ $active: boolean }>`
  display: ${(props) => (props.$active ? "block" : "none")};
`;

const appTabs: AppTab[] = [
  "randomizer",
  "crossAnalysis",
  "contestBuilder",
];

function restoreAppTab(value: AppTab): AppTab {
  return appTabs.indexOf(value) === -1 ? "randomizer" : value;
}

const Home: React.FC<Props> = (props: Props): ReactElement => {
  const [tab, setTab] = usePersistentState<AppTab>(
    "activeTab",
    "randomizer",
    restoreAppTab,
  );
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
        <TabPane
          $active={tab === "randomizer"}
          aria-hidden={tab !== "randomizer"}
        >
          <RandomizerTab
            initialProblemsList={props.initialProblemsList}
            onError={triggerError}
          ></RandomizerTab>
        </TabPane>

        <TabPane
          $active={tab === "crossAnalysis"}
          aria-hidden={tab !== "crossAnalysis"}
        >
          <ProblemCheck
            onError={triggerError}
            onSuccess={triggerSuccess}
          ></ProblemCheck>
        </TabPane>

        <TabPane
          $active={tab === "contestBuilder"}
          aria-hidden={tab !== "contestBuilder"}
        >
          <ContestBuilder onError={triggerError}></ContestBuilder>
        </TabPane>
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
