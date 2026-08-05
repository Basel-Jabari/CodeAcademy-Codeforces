import React, { ReactElement, useState } from "react";
import styled from "styled-components";
import BrandHeader from "../header/BrandHeader";
import Snackbar from "../snackbar/Snackbar";
import Footer from "../footer/Footer";
import ServiceNavigation, { AppTab } from "../navigation/ServiceNavigation";
import RandomizerTab from "../randomizer/RandomizerTab";
import ProblemCheck from "../problem-check/ProblemCheck";
import ContestBuilder from "../contest-builder/ContestBuilder";
import { Problem } from "../../models/Problem";
import {
  ChapterAtmosphere,
  ChapterBanner,
  ChapterStage,
} from "../effects/ChapterExperience";
import { themeVariables } from "../../themePalettes";
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
  position: relative;
  isolation: isolate;
  overflow: hidden;
  color: var(--cf-text);
  background-color: var(--cf-bg);
  transition: color 0.7s ease, background-color 0.7s ease;
`;

const Content = styled.div`
  flex: 1;
  position: relative;
  z-index: 2;
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
    <Page style={themeVariables(tab) as React.CSSProperties} data-theme={tab}>
      <ChapterAtmosphere kind={tab}></ChapterAtmosphere>
      <BrandHeader></BrandHeader>
      <ServiceNavigation active={tab} onChange={setTab}></ServiceNavigation>
      <ChapterBanner kind={tab}></ChapterBanner>

      <Content>
        <ChapterStage key={tab} kind={tab}>
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
        </ChapterStage>
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
