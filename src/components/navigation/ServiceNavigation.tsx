import React, { ReactElement } from "react";
import styled from "styled-components";

export type AppTab = "randomizer" | "crossAnalysis" | "contestBuilder";

interface Props {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

interface TabDesign {
  tab: AppTab;
  number: string;
  label: string;
  shortLabel: string;
  note: string;
  accent: string;
  glow: string;
}

const tabs: TabDesign[] = [
  {
    tab: "randomizer",
    number: "01",
    label: "Problem Randomizer",
    shortLabel: "Randomizer",
    note: "Discover the next challenge",
    accent: "#ed2447",
    glow: "rgba(237, 36, 71, .34)",
  },
  {
    tab: "crossAnalysis",
    number: "02",
    label: "Users–Problems Cross Analysis",
    shortLabel: "Cross Analysis",
    note: "Map every solve and attempt",
    accent: "#20a7f5",
    glow: "rgba(32, 167, 245, .34)",
  },
  {
    tab: "contestBuilder",
    number: "03",
    label: "Contest Builder",
    shortLabel: "Contest Builder",
    note: "Compose a balanced set",
    accent: "#925cff",
    glow: "rgba(146, 92, 255, .34)",
  },
];

const Shell = styled.nav`
  position: relative;
  z-index: 4;
  width: calc(100% - 48px);
  max-width: 1120px;
  margin: 8px auto 14px;
  padding: 5px;
  box-sizing: border-box;
  background: rgba(5, 4, 7, 0.78);
  border: 1px solid var(--cf-border);
  border-radius: 18px;
  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.025);
  backdrop-filter: blur(16px);

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    width: clamp(24px, 5vw, 86px);
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--cf-accent));
    opacity: 0.62;
  }

  &::before {
    right: 100%;
  }

  &::after {
    left: 100%;
    transform: rotate(180deg);
  }

  @media screen and (max-width: 680px) {
    width: calc(100% - 24px);
    margin-top: 2px;
    border-radius: 14px;
  }
`;

const Track = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;

  @media screen and (max-width: 680px) {
    gap: 3px;
  }
`;

const Tab = styled.button<{
  $active: boolean;
  $accent: string;
  $glow: string;
}>`
  position: relative;
  min-width: 0;
  min-height: 74px;
  padding: 12px 15px 12px 51px;
  overflow: hidden;
  color: ${(props) => (props.$active ? "#ffffff" : "#827b8a")};
  background: ${(props) =>
    props.$active
      ? `linear-gradient(116deg, ${props.$accent}1f, rgba(14, 12, 17, .96) 56%)`
      : "transparent"};
  border: 1px solid
    ${(props) => (props.$active ? `${props.$accent}73` : "transparent")};
  border-radius: 13px;
  font: inherit;
  text-align: left;
  cursor: pointer;
  box-shadow: ${(props) =>
    props.$active
      ? `inset 3px 0 0 ${props.$accent}, 0 0 28px ${props.$glow}`
      : "none"};
  transition: color 220ms ease, border-color 220ms ease,
    background 220ms ease, transform 220ms ease, box-shadow 220ms ease;

  &::after {
    content: "";
    position: absolute;
    right: -24px;
    bottom: -33px;
    width: 105px;
    height: 62px;
    border: 1px solid ${(props) => props.$accent};
    border-radius: 50%;
    opacity: ${(props) => (props.$active ? 0.22 : 0)};
    transform: rotate(-17deg);
    box-shadow: 0 -8px 0 -7px ${(props) => props.$accent},
      0 -16px 0 -15px ${(props) => props.$accent};
    transition: opacity 220ms ease;
  }

  &:hover {
    color: #f6f2fa;
    border-color: ${(props) => `${props.$accent}55`};
    background: ${(props) => `${props.$accent}13`};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.$accent};
    outline-offset: 2px;
  }

  @media screen and (max-width: 680px) {
    min-height: 60px;
    padding: 9px 5px 8px;
    text-align: center;
    box-shadow: ${(props) =>
      props.$active
        ? `inset 0 -3px 0 ${props.$accent}, 0 0 20px ${props.$glow}`
        : "none"};
  }
`;

const Number = styled.span<{ $accent: string; $active: boolean }>`
  position: absolute;
  left: 15px;
  top: 17px;
  color: ${(props) => (props.$active ? props.$accent : "#4c4652")};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.4px;
  transform: rotate(-90deg) translateX(-8px);
  text-shadow: ${(props) =>
    props.$active ? `0 0 12px ${props.$accent}` : "none"};

  @media screen and (max-width: 680px) {
    position: static;
    display: block;
    margin-bottom: 2px;
    font-size: 8px;
    transform: none;
  }
`;

const Label = styled.span`
  display: block;
  overflow: hidden;
  font-size: clamp(12px, 1.15vw, 15px);
  font-weight: 700;
  letter-spacing: 0.18px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DesktopLabel = styled.span`
  @media screen and (max-width: 920px) {
    display: none;
  }
`;

const CompactLabel = styled.span`
  display: none;
  @media screen and (max-width: 920px) {
    display: inline;
  }
`;

const Note = styled.span`
  display: block;
  margin-top: 3px;
  overflow: hidden;
  color: #696271;
  font-size: 9px;
  letter-spacing: 0.45px;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media screen and (max-width: 680px) {
    display: none;
  }
`;

const ServiceNavigation: React.FC<Props> = (props: Props): ReactElement => (
  <Shell aria-label="Codeforces X PPU services">
    <Track role="tablist">
      {tabs.map((item: TabDesign) => {
        const active: boolean = props.active === item.tab;
        return (
          <Tab
            key={item.tab}
            type="button"
            role="tab"
            aria-selected={active}
            $active={active}
            $accent={item.accent}
            $glow={item.glow}
            onClick={() => props.onChange(item.tab)}
          >
            <Number $active={active} $accent={item.accent}>
              {item.number}
            </Number>
            <Label>
              <DesktopLabel>{item.label}</DesktopLabel>
              <CompactLabel>{item.shortLabel}</CompactLabel>
            </Label>
            <Note>{item.note}</Note>
          </Tab>
        );
      })}
    </Track>
  </Shell>
);

export default ServiceNavigation;
