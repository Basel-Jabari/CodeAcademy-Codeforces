'use client';

import styles from "./TabBar.module.css";

export type AppTab = "randomizer" | "crossAnalysis" | "contestBuilder";

interface Props {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

const labels: { [key in AppTab]: string } = {
  randomizer: "Problem Randomizer",
  crossAnalysis: "Users-Problems Cross Analysis",
  contestBuilder: "Contest Builder",
};

export default function TabBar(props: Props) {
  const tabs: AppTab[] = ["randomizer", "crossAnalysis", "contestBuilder"];

  return (
    <div className={styles.bar} role="tablist" aria-label="Services">
      {tabs.map((tab: AppTab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={props.active === tab}
          className={`${styles.tabButton} ${props.active === tab ? styles.active : ''}`}
          onClick={() => props.onChange(tab)}
        >
          {labels[tab]}
        </button>
      ))}
    </div>
  );
}
