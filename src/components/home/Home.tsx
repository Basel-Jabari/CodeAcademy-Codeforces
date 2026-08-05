'use client';

import { useState } from 'react';

import ContestBuilder from '@/components/contest-builder/ContestBuilder';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import ProblemCheck from '@/components/problem-check/ProblemCheck';
import RandomizerTab from '@/components/randomizer/RandomizerTab';
import Snackbar from '@/components/snackbar/Snackbar';
import TabBar, { AppTab } from '@/components/tabs/TabBar';
import { Problem } from '@/types/Problem';
import { ProblemStatistics } from '@/types/ProblemStatistics';
import { usePersistentState } from '@/utils/persistentState';

import styles from './Home.module.css';

interface Props {
  initialProblemsList: Array<{
    problem: Problem;
    problemStatistics: ProblemStatistics;
  }>;
}

export type NotifyType = 'error' | 'success';

const appTabs: AppTab[] = ['randomizer', 'crossAnalysis', 'contestBuilder'];

function restoreAppTab(value: AppTab): AppTab {
  return appTabs.indexOf(value) === -1 ? 'randomizer' : value;
}

export default function Home(props: Props) {
  const [tab, setTab] = usePersistentState<AppTab>('activeTab', 'randomizer', restoreAppTab);
  const [snackContent, setSnackContent] = useState<string>('');
  const [snackType, setSnackType] = useState<NotifyType>('error');
  const [visible, setVisible] = useState<boolean>(false);

  const triggerError = (content: string) => {
    setSnackType('error');
    setSnackContent(content);
    setVisible(true);
  };

  const triggerSuccess = (content: string) => {
    setSnackType('success');
    setSnackContent(content);
    setVisible(true);
  };

  return (
    <div className={styles.page}>
      <Header />
      <TabBar active={tab} onChange={setTab} />

      <div className={styles.content}>
        <div
          className={tab === 'randomizer' ? styles.tabPaneActive : styles.tabPaneHidden}
          aria-hidden={tab !== 'randomizer'}
        >
          <RandomizerTab
            initialProblemsList={props.initialProblemsList}
            onError={triggerError}
          />
        </div>

        <div
          className={tab === 'crossAnalysis' ? styles.tabPaneActive : styles.tabPaneHidden}
          aria-hidden={tab !== 'crossAnalysis'}
        >
          <ProblemCheck onError={triggerError} onSuccess={triggerSuccess} />
        </div>

        <div
          className={tab === 'contestBuilder' ? styles.tabPaneActive : styles.tabPaneHidden}
          aria-hidden={tab !== 'contestBuilder'}
        >
          <ContestBuilder onError={triggerError} />
        </div>
      </div>

      <Footer />

      <Snackbar
        type={snackType}
        content={snackContent}
        visible={visible}
        timeout={snackType === 'success' ? 4500 : 5000}
        onCancel={() => setVisible(false)}
      />
    </div>
  );
}
