import React, { ReactElement, useEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";

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
    accent: "#0e7490",
    glow: "rgba(14, 116, 144, .34)",
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

const fireFlicker = keyframes`
  0%, 100% { transform: scaleY(1) scaleX(1); opacity: .9; }
  35% { transform: scaleY(1.18) scaleX(.92); opacity: 1; }
  70% { transform: scaleY(.88) scaleX(1.1); opacity: .75; }
`;

const waveMove = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const boltFlash = keyframes`
  0%, 100% { opacity: .55; filter: drop-shadow(0 0 2px currentColor); }
  40% { opacity: 1; filter: drop-shadow(0 0 10px currentColor); }
  55% { opacity: .35; }
  70% { opacity: .95; }
`;

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
  border-radius: 8px 28px 8px 28px;
  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.025);
  backdrop-filter: blur(16px);

  @media screen and (max-width: 680px) {
    width: calc(100% - 24px);
    margin-top: 2px;
    border-radius: 8px 18px 8px 18px;
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
  $live: boolean;
}>`
  position: relative;
  min-width: 0;
  min-height: 74px;
  padding: 12px 52px 12px 51px;
  overflow: hidden;
  color: ${(props) => (props.$active ? "#ffffff" : "#827b8a")};
  background: ${(props) =>
    props.$active
      ? `linear-gradient(116deg, ${props.$accent}22, rgba(14, 12, 17, .96) 56%)`
      : "transparent"};
  border: 1px solid
    ${(props) => (props.$active ? `${props.$accent}73` : "transparent")};
  border-radius: 8px 20px 8px 20px;
  font: inherit;
  text-align: left;
  cursor: pointer;
  box-shadow: ${(props) =>
    props.$active
      ? `inset 3px 0 0 ${props.$accent}, 0 0 28px ${props.$glow}`
      : "none"};
  transition: color 220ms ease, border-color 220ms ease,
    background 220ms ease, transform 220ms ease, box-shadow 220ms ease;

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
    min-height: 64px;
    padding: 9px 5px 28px;
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

const EffectSlot = styled.span<{
  $live: boolean;
  $active: boolean;
}>`
  position: absolute;
  right: 10px;
  bottom: 8px;
  width: 34px;
  height: 34px;
  color: currentColor;
  opacity: ${(props) => (props.$live ? 1 : props.$active ? 0.85 : 0.4)};
  transform: scale(${(props) => (props.$live ? 1.45 : 1)});
  transform-origin: center bottom;
  transition: transform 380ms ease, opacity 280ms ease;
  pointer-events: none;

  @media screen and (max-width: 680px) {
    right: 50%;
    bottom: 4px;
    width: 26px;
    height: 22px;
    transform: translateX(50%) scale(${(props) => (props.$live ? 1.35 : 1)});
  }
`;

const FireGlyph = styled.svg<{ $live: boolean }>`
  width: 100%;
  height: 100%;
  overflow: visible;

  path {
    fill: currentColor;
    ${(props) =>
      props.$live
        ? css`
            animation: ${fireFlicker} 0.55s ease-in-out infinite;
            transform-origin: center bottom;
            transform-box: fill-box;
          `
        : ""}
  }

  path:nth-child(2) {
    opacity: 0.7;
    animation-delay: ${(props) => (props.$live ? "-0.18s" : "0s")};
  }
  path:nth-child(3) {
    opacity: 0.45;
    animation-delay: ${(props) => (props.$live ? "-0.32s" : "0s")};
  }
`;

const WaveGlyph = styled.svg<{ $live: boolean }>`
  width: 100%;
  height: 100%;
  overflow: hidden;

  .track {
    ${(props) =>
      props.$live
        ? css`
            animation: ${waveMove} 1.1s linear infinite;
          `
        : ""}
  }

  path {
    fill: currentColor;
  }
`;

const BoltGlyph = styled.svg<{ $live: boolean }>`
  width: 100%;
  height: 100%;
  overflow: visible;

  path {
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
    ${(props) =>
      props.$live
        ? css`
            animation: ${boltFlash} 0.9s ease-in-out infinite;
          `
        : ""}
  }

  path:nth-child(2) {
    opacity: 0.55;
    animation-delay: ${(props) => (props.$live ? "-0.25s" : "0s")};
  }
`;

const TabEffect: React.FC<{
  kind: AppTab;
  live: boolean;
  active: boolean;
  accent: string;
}> = ({ kind, live, active, accent }): ReactElement => (
  <EffectSlot $live={live} $active={active} style={{ color: accent }}>
    {kind === "randomizer" ? (
      <FireGlyph $live={live} viewBox="0 0 40 40" aria-hidden="true">
        <path d="M20 36 C12 36 8 30 9 23 C10 18 14 15 16 10 C17 16 20 18 22 14 C26 20 30 22 30 28 C30 33 26 36 20 36Z" />
        <path d="M20 34 C15 34 13 30 14 26 C15 23 18 21 19 18 C20 22 22 23 23 21 C26 24 27 26 27 29 C27 32 24 34 20 34Z" />
        <path d="M20 30 C17 30 16 28 17 26 C18 25 19 24 20 23 C21 25 22 26 23 27 C23 29 22 30 20 30Z" />
      </FireGlyph>
    ) : null}
    {kind === "crossAnalysis" ? (
      <WaveGlyph $live={live} viewBox="0 0 40 40" aria-hidden="true">
        <g className="track">
          <path d="M0 24 C5 18 10 30 15 24 C20 18 25 30 30 24 C35 18 40 30 45 24 L45 40 L0 40Z" />
          <path d="M0 28 C5 23 10 33 15 28 C20 23 25 33 30 28 C35 23 40 33 45 28 L45 40 L0 40Z" opacity="0.55" />
          <path
            d="M0 24 C5 18 10 30 15 24 C20 18 25 30 30 24 C35 18 40 30 45 24 L45 40 L0 40Z"
            transform="translate(45,0)"
          />
          <path
            d="M0 28 C5 23 10 33 15 28 C20 23 25 33 30 28 C35 23 40 33 45 28 L45 40 L0 40Z"
            transform="translate(45,0)"
            opacity="0.55"
          />
        </g>
      </WaveGlyph>
    ) : null}
    {kind === "contestBuilder" ? (
      <BoltGlyph $live={live} viewBox="0 0 40 40" aria-hidden="true">
        <path d="M22 4 L14 20 H21 L16 36 L30 16 H22 Z" />
        <path d="M28 8 L24 16 H28 L25 24" />
      </BoltGlyph>
    ) : null}
  </EffectSlot>
);

const ServiceTab: React.FC<{
  item: TabDesign;
  active: boolean;
  onSelect: () => void;
}> = ({ item, active, onSelect }): ReactElement => {
  const [live, setLive] = useState<boolean>(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  const clearHoverTimer = (): void => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  return (
    <Tab
      type="button"
      role="tab"
      aria-selected={active}
      $active={active}
      $accent={item.accent}
      $glow={item.glow}
      $live={live}
      onClick={onSelect}
      onMouseEnter={() => {
        clearHoverTimer();
        timer.current = window.setTimeout(() => setLive(true), 500);
      }}
      onMouseLeave={() => {
        clearHoverTimer();
        setLive(false);
      }}
      onFocus={() => {
        clearHoverTimer();
        timer.current = window.setTimeout(() => setLive(true), 500);
      }}
      onBlur={() => {
        clearHoverTimer();
        setLive(false);
      }}
    >
      <Number $active={active} $accent={item.accent}>
        {item.number}
      </Number>
      <Label>
        <DesktopLabel>{item.label}</DesktopLabel>
        <CompactLabel>{item.shortLabel}</CompactLabel>
      </Label>
      <Note>{item.note}</Note>
      <TabEffect
        kind={item.tab}
        live={live}
        active={active}
        accent={item.accent}
      />
    </Tab>
  );
};

const ServiceNavigation: React.FC<Props> = (props: Props): ReactElement => (
  <Shell aria-label="Codeforces X PPU services">
    <Track role="tablist">
      {tabs.map((item: TabDesign) => (
        <ServiceTab
          key={item.tab}
          item={item}
          active={props.active === item.tab}
          onSelect={() => props.onChange(item.tab)}
        />
      ))}
    </Track>
  </Shell>
);

export default ServiceNavigation;
