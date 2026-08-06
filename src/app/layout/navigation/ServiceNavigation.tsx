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
  0%, 100% { transform: scaleY(1) scaleX(1) translateY(0); }
  30% { transform: scaleY(1.16) scaleX(.93) translateY(-1px); }
  55% { transform: scaleY(.93) scaleX(1.07) translateY(.5px); }
  80% { transform: scaleY(1.08) scaleX(.97) translateY(-.5px); }
`;

const emberFloat = keyframes`
  0% { transform: translateY(4px) scale(.6); opacity: 0; }
  35% { opacity: 1; }
  100% { transform: translateY(-14px) scale(1); opacity: 0; }
`;

const waveMove = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-40px); }
`;

const dropFall = keyframes`
  0% { transform: translateY(-6px); opacity: 0; }
  30% { opacity: .9; }
  100% { transform: translateY(8px); opacity: 0; }
`;

const boltFlash = keyframes`
  0%, 100% { opacity: .9; }
  42% { opacity: .3; }
  48% { opacity: 1; }
  62% { opacity: .55; }
`;

const boltSpark = keyframes`
  0%, 100% { opacity: 0; transform: scale(.4); }
  45% { opacity: .9; transform: scale(1); }
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
  opacity: ${(props) => (props.$live ? 1 : props.$active ? 0.9 : 0.42)};
  transform: scale(${(props) => (props.$live ? 1.45 : 1)});
  transform-origin: center bottom;
  filter: drop-shadow(
    0 0 ${(props) => (props.$live ? "10px" : props.$active ? "5px" : "0px")}
      currentColor
  );
  transition: transform 380ms ease, opacity 280ms ease, filter 380ms ease;
  pointer-events: none;

  @media screen and (max-width: 680px) {
    right: 50%;
    bottom: 4px;
    width: 26px;
    height: 22px;
    transform: translateX(50%) scale(${(props) => (props.$live ? 1.35 : 1)});
  }
`;

const Glyph = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

const FireGlyph = styled(Glyph)<{ $live: boolean }>`
  .flame {
    transform-box: fill-box;
    transform-origin: center bottom;
    ${(props) =>
      props.$live
        ? css`
            animation: ${fireFlicker} 0.7s ease-in-out infinite;
          `
        : ""}
  }

  .flame-mid {
    animation-delay: ${(props) => (props.$live ? "-0.22s" : "0s")};
  }

  .flame-core {
    animation-delay: ${(props) => (props.$live ? "-0.4s" : "0s")};
  }

  .ember {
    transform-box: fill-box;
    transform-origin: center;
    opacity: 0;
    ${(props) =>
      props.$live
        ? css`
            animation: ${emberFloat} 1.4s ease-out infinite;
          `
        : ""}
  }

  .ember-b {
    animation-delay: ${(props) => (props.$live ? "-0.7s" : "0s")};
  }
`;

const WaveGlyph = styled(Glyph)<{ $live: boolean }>`
  overflow: hidden;

  .track {
    ${(props) =>
      props.$live
        ? css`
            animation: ${waveMove} 1.6s linear infinite;
          `
        : ""}
  }

  .drop {
    transform-box: fill-box;
    transform-origin: center;
    opacity: 0;
    ${(props) =>
      props.$live
        ? css`
            animation: ${dropFall} 1.5s ease-in infinite;
          `
        : ""}
  }
`;

const BoltGlyph = styled(Glyph)<{ $live: boolean }>`
  .bolt {
    ${(props) =>
      props.$live
        ? css`
            animation: ${boltFlash} 1.1s steps(1, end) infinite;
          `
        : ""}
  }

  .spark {
    transform-box: fill-box;
    transform-origin: center;
    opacity: 0;
    ${(props) =>
      props.$live
        ? css`
            animation: ${boltSpark} 1.1s ease-out infinite;
          `
        : ""}
  }

  .spark-b {
    animation-delay: ${(props) => (props.$live ? "-0.45s" : "0s")};
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
        <defs>
          <linearGradient id="tab-fire-outer" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff3d2e" />
            <stop offset="55%" stopColor="#ff6a3c" />
            <stop offset="100%" stopColor="#ffb347" />
          </linearGradient>
          <linearGradient id="tab-fire-core" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ffd166" />
            <stop offset="100%" stopColor="#fff3c4" />
          </linearGradient>
        </defs>
        {/* outer flame */}
        <path
          className="flame"
          fill="url(#tab-fire-outer)"
          d="M20 37 C11 37 6.5 30.5 8 23.5 C9.2 17.8 13.5 14.6 15.6 8.4
             C16.4 6.2 17 4.2 17.2 2 C21.4 5.6 23.2 10 22.6 14.6
             C25.4 12.9 26.7 10.4 26.8 7.4 C31 12 33.4 17.4 33 23.2
             C32.5 31 27 37 20 37Z"
        />
        {/* mid flame */}
        <path
          className="flame flame-mid"
          fill="url(#tab-fire-core)"
          opacity="0.85"
          d="M20 36 C15 36 12 32.2 12.7 27.6 C13.3 23.8 16 21.6 17.4 17.8
             C18 16.3 18.3 15 18.4 13.4 C21.2 16 22.4 19 22 22.2
             C23.6 21 24.4 19.6 24.6 17.8 C27.2 21 28.4 24.2 28 27.6
             C27.5 32.6 24.4 36 20 36Z"
        />
        {/* white-hot core */}
        <path
          className="flame flame-core"
          fill="#fffdf2"
          opacity="0.9"
          d="M20 34.6 C17.6 34.6 16.2 32.8 16.6 30.4 C17 28.4 18.4 27.2 19.2 25.2
             C20.8 27 21.6 28.6 21.4 30.2 C22.2 29.6 22.6 28.8 22.8 27.8
             C23.9 29.6 24.2 31.2 23.8 32.4 C23.3 33.9 21.9 34.6 20 34.6Z"
        />
        <circle className="ember" cx="12" cy="16" r="1.5" fill="#ffb347" />
        <circle className="ember ember-b" cx="28" cy="13" r="1.2" fill="#ff6a3c" />
      </FireGlyph>
    ) : null}
    {kind === "crossAnalysis" ? (
      <WaveGlyph $live={live} viewBox="0 0 40 40" aria-hidden="true">
        <defs>
          <linearGradient id="tab-wave-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#0e7490" />
          </linearGradient>
          <linearGradient id="tab-wave-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0b5563" />
          </linearGradient>
          <clipPath id="tab-wave-clip">
            <rect x="0" y="0" width="40" height="40" rx="9" />
          </clipPath>
        </defs>
        <g clipPath="url(#tab-wave-clip)">
          {/* curling crest */}
          <path
            fill="url(#tab-wave-back)"
            opacity="0.75"
            d="M2 20 C7 13 13 13 18 18 C22 22 26 23 30 20 C33 17.6 35.6 17.4 38 19
               L38 40 L2 40Z"
          />
          <path
            fill="none"
            stroke="#c7f4ff"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.85"
            d="M6 17.5 C9.5 13.5 14 13.8 17.5 17.5 C20.5 20.6 24 21.6 27.4 19.6"
          />
          <g className="track">
            <path
              fill="url(#tab-wave-front)"
              d="M-40 27 C-32 21 -24 33 -16 27 C-8 21 0 33 8 27 C16 21 24 33 32 27
                 C40 21 48 33 56 27 L56 44 L-40 44Z"
            />
            <path
              fill="#0b3d4a"
              opacity="0.55"
              d="M-40 31 C-32 26 -24 37 -16 31 C-8 26 0 37 8 31 C16 26 24 37 32 31
                 C40 26 48 37 56 31 L56 44 L-40 44Z"
            />
          </g>
          <circle className="drop" cx="24" cy="12" r="1.6" fill="#a5f3fc" />
        </g>
      </WaveGlyph>
    ) : null}
    {kind === "contestBuilder" ? (
      <BoltGlyph $live={live} viewBox="0 0 40 40" aria-hidden="true">
        <defs>
          <linearGradient id="tab-bolt" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="45%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <filter id="tab-bolt-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g className="bolt" filter="url(#tab-bolt-glow)">
          <path
            fill="url(#tab-bolt)"
            d="M23.5 2 L11 21.5 H18.2 L15.5 38 L29.5 17.5 H21.8 L26 2 Z"
          />
          <path
            fill="#fbf5ff"
            opacity="0.75"
            d="M22.6 6 L15.4 19.6 H19 L17.6 30 L24.4 18.6 H20.6 L23.4 6 Z"
          />
        </g>
        <circle className="spark" cx="31" cy="10" r="1.5" fill="#e9d5ff" />
        <circle className="spark spark-b" cx="9" cy="29" r="1.2" fill="#c084fc" />
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
