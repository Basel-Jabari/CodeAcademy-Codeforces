import React, { ReactElement } from "react";
import styled from "styled-components";
import theme from "../../theme";

export type AppTab = "randomizer" | "crossAnalysis" | "contestBuilder";

interface Props {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 960px;
  margin: 0 auto 8px auto;
  padding: 0 16px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1 1 180px;
  max-width: 280px;
  padding: 12px 16px;
  color: ${(props) => (props.$active ? theme.background : theme.textMuted)};
  background: ${(props) =>
    props.$active
      ? `linear-gradient(135deg, ${theme.accent}, ${theme.cyan})`
      : theme.surface};
  border: 1px solid
    ${(props) => (props.$active ? theme.accentBright : theme.border)};
  border-radius: 12px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.4px;
  cursor: pointer;
  box-shadow: ${(props) =>
    props.$active ? `0 0 22px ${theme.glowSoft}` : "none"};
  transition: 0.25s;

  &:hover {
    color: ${(props) => (props.$active ? theme.background : theme.accentBright)};
    border-color: ${theme.accent};
  }

  &:focus {
    outline: none;
  }
`;

const labels: { [key in AppTab]: string } = {
  randomizer: "Problem Randomizer",
  crossAnalysis: "Users-Problems Cross Analysis",
  contestBuilder: "Contest Builder",
};

const TabBar: React.FC<Props> = (props: Props): ReactElement => {
  const tabs: AppTab[] = ["randomizer", "crossAnalysis", "contestBuilder"];

  return (
    <Bar role="tablist" aria-label="Services">
      {tabs.map((tab: AppTab) => (
        <TabButton
          key={tab}
          type="button"
          role="tab"
          aria-selected={props.active === tab}
          $active={props.active === tab}
          onClick={() => props.onChange(tab)}
        >
          {labels[tab]}
        </TabButton>
      ))}
    </Bar>
  );
};

export default TabBar;
