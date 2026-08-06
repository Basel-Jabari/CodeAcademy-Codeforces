import React, { ReactElement, ReactNode } from "react";
import styled, { keyframes } from "styled-components";
import { AppTab } from "../navigation/ServiceNavigation";
import { MangaEyes } from "./MangaEyes";

interface ChapterProps {
  kind: AppTab;
}

interface StageProps extends ChapterProps {
  children: ReactNode;
}

const rise = keyframes`
  0% { transform: translate3d(0, 12vh, 0) scale(.3); opacity: 0; }
  12% { opacity: .95; }
  78% { opacity: .35; }
  100% { transform: translate3d(var(--drift), -110vh, 0) scale(1.1); opacity: 0; }
`;

const flameBreathe = keyframes`
  0%, 100% { transform: translateY(10px) scaleX(1); opacity: .4; }
  50% { transform: translateY(-8px) scaleX(1.06); opacity: .78; }
`;

const waveSlide = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

const waveBob = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const lightning = keyframes`
  0%, 8%, 13%, 70%, 100% { opacity: 0; stroke-dashoffset: 640; }
  9%, 12% { opacity: .95; stroke-dashoffset: 0; }
  71% { opacity: .5; stroke-dashoffset: 0; }
  74% { opacity: 0; }
`;

const haze = keyframes`
  0%, 100% { transform: translate3d(-2%, 1%, 0) scale(1); }
  50% { transform: translate3d(3%, -2%, 0) scale(1.08); }
`;

const revealContent = keyframes`
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
`;

const Ambient = styled.div<{ $kind: AppTab }>`
  position: absolute;
  inset: -10%;
  background: ${(props) =>
    props.$kind === "randomizer"
      ? "radial-gradient(circle at 15% 85%, rgba(237,36,71,.22), transparent 32%), radial-gradient(circle at 80% 8%, rgba(255,106,88,.12), transparent 28%), radial-gradient(circle at 50% 40%, rgba(110,11,32,.1), transparent 50%)"
      : props.$kind === "crossAnalysis"
      ? "radial-gradient(ellipse at 50% 120%, rgba(14,116,144,.32), transparent 48%), radial-gradient(circle at 12% 20%, rgba(8,145,178,.14), transparent 30%), radial-gradient(circle at 88% 10%, rgba(34,211,238,.1), transparent 26%)"
      : "radial-gradient(circle at 50% 55%, rgba(146,92,255,.2), transparent 44%), radial-gradient(circle at 80% 8%, rgba(224,124,255,.1), transparent 26%), radial-gradient(circle at 15% 80%, rgba(67,32,124,.14), transparent 34%)"};
  animation: ${haze} 18s ease-in-out infinite;
`;

const FireBed = styled.div`
  position: absolute;
  right: -6%;
  bottom: -100px;
  left: -6%;
  height: 42vh;
  min-height: 220px;
  opacity: 0.7;
  background:
    radial-gradient(ellipse 80% 60% at 20% 100%, rgba(237, 36, 71, 0.35), transparent 55%),
    radial-gradient(ellipse 70% 55% at 55% 110%, rgba(255, 106, 88, 0.28), transparent 50%),
    radial-gradient(ellipse 60% 50% at 85% 100%, rgba(255, 154, 82, 0.22), transparent 48%);
  filter: blur(8px) saturate(1.25);
  animation: ${flameBreathe} 3.4s ease-in-out infinite;
`;

const Spark = styled.i`
  position: absolute;
  bottom: -24px;
  left: var(--left);
  width: var(--size);
  height: calc(var(--size) * 3.2);
  border-radius: 999px;
  background: linear-gradient(to top, #ed2447, #ff9a52);
  box-shadow: 0 0 12px #ed2447, 0 0 22px rgba(255, 154, 82, 0.45);
  animation: ${rise} var(--duration) linear var(--delay) infinite;
`;

const SeaFloor = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: min(48vh, 420px);
  overflow: hidden;
`;

const WaveLayer = styled.div<{ $delay: string; $opacity: number; $duration: string }>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  opacity: ${(props) => props.$opacity};
  animation: ${waveSlide} ${(props) => props.$duration} linear infinite;
  animation-delay: ${(props) => props.$delay};

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  path {
    fill: currentColor;
  }
`;

const WaveBob = styled.div`
  position: absolute;
  inset: 0;
  color: rgba(14, 116, 144, 0.55);
  animation: ${waveBob} 5.5s ease-in-out infinite;

  &:nth-child(2) {
    color: rgba(8, 145, 178, 0.4);
    animation-delay: -1.8s;
  }

  &:nth-child(3) {
    color: rgba(34, 211, 238, 0.28);
    animation-delay: -3.2s;
  }
`;

const LightningSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: var(--cf-accent-bright);
  opacity: 0.55;

  path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.4;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 640;
    filter: drop-shadow(0 0 8px var(--cf-glow));
    animation: ${lightning} 6.5s ease-in-out infinite;
  }

  path:nth-child(2) {
    animation-delay: -2.2s;
    opacity: 0.7;
  }
  path:nth-child(3) {
    animation-delay: -4.1s;
    opacity: 0.45;
  }
  path:nth-child(4) {
    animation-delay: -1.1s;
    opacity: 0.35;
  }
`;

const sparks = Array.from({ length: 32 }, (_, index: number) => index);

const wavePath =
  "M0,180 C120,120 240,240 360,180 C480,120 600,240 720,180 C840,120 960,240 1080,180 C1200,120 1320,240 1440,180 L1440,420 L0,420 Z";

export const ChapterAtmosphere: React.FC<ChapterProps> = ({
  kind,
}): ReactElement => (
  <Backdrop aria-hidden="true">
    <Ambient $kind={kind} />
    {kind === "randomizer" ? (
      <>
        <FireBed />
        {sparks.map((spark: number) => (
          <Spark
            key={spark}
            style={
              {
                "--left": `${(spark * 31) % 101}%`,
                "--size": `${2 + (spark % 5)}px`,
                "--duration": `${4.5 + (spark % 8) * 0.65}s`,
                "--delay": `${-(spark % 11) * 0.7}s`,
                "--drift": `${(spark % 2 ? 1 : -1) * (18 + (spark % 6) * 12)}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </>
    ) : null}
    {kind === "crossAnalysis" ? (
      <SeaFloor>
        <WaveBob>
          <WaveLayer $delay="0s" $opacity={1} $duration="18s">
            <svg viewBox="0 0 1440 420" preserveAspectRatio="none">
              <path d={wavePath} />
              <path d={wavePath} transform="translate(1440,0)" />
            </svg>
          </WaveLayer>
        </WaveBob>
        <WaveBob>
          <WaveLayer $delay="-4s" $opacity={1} $duration="14s">
            <svg viewBox="0 0 1440 420" preserveAspectRatio="none">
              <path d="M0,220 C150,160 300,280 450,210 C600,140 750,270 900,200 C1050,140 1200,260 1440,200 L1440,420 L0,420 Z" />
              <path
                d="M0,220 C150,160 300,280 450,210 C600,140 750,270 900,200 C1050,140 1200,260 1440,200 L1440,420 L0,420 Z"
                transform="translate(1440,0)"
              />
            </svg>
          </WaveLayer>
        </WaveBob>
        <WaveBob>
          <WaveLayer $delay="-8s" $opacity={1} $duration="11s">
            <svg viewBox="0 0 1440 420" preserveAspectRatio="none">
              <path d="M0,260 C180,210 360,310 540,250 C720,190 900,300 1080,240 C1260,190 1380,280 1440,250 L1440,420 L0,420 Z" />
              <path
                d="M0,260 C180,210 360,310 540,250 C720,190 900,300 1080,240 C1260,190 1380,280 1440,250 L1440,420 L0,420 Z"
                transform="translate(1440,0)"
              />
            </svg>
          </WaveLayer>
        </WaveBob>
      </SeaFloor>
    ) : null}
    {kind === "contestBuilder" ? (
      <LightningSvg viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path d="M1280 -20 L1195 130 L1240 155 L1130 300 L1170 330 L1055 500 L1095 525 L980 700" />
        <path d="M160 -30 L235 120 L200 155 L310 300 L270 340 L400 500 L360 540 L470 700" />
        <path d="M820 -10 L780 100 L815 130 L740 250 L775 275 L690 400 L720 430 L640 560" />
        <path d="M520 40 L490 140 L520 165 L455 280 L485 305 L410 430" />
      </LightningSvg>
    ) : null}
  </Backdrop>
);

const chapterCopy: {
  [key in AppTab]: { eyebrow: string; title: string; note: string };
} = {
  randomizer: {
    eyebrow: "Chapter I · Crimson instinct",
    title: "Walk into the fire",
    note: "Shape the constraints. Let chance reveal the next worthy fight.",
  },
  crossAnalysis: {
    eyebrow: "Chapter II · Infinite current",
    title: "See the whole field",
    note: "Every solve leaves a current. Read the pattern beneath the surface.",
  },
  contestBuilder: {
    eyebrow: "Chapter III · Violet dominion",
    title: "Command the trial",
    note: "Compose difficulty, variety, and surprise into one deliberate contest.",
  },
};

const Banner = styled.section`
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 20px;
  width: calc(100% - 48px);
  max-width: 1120px;
  min-height: 96px;
  margin: 0 auto 18px;
  padding: 16px 22px;
  box-sizing: border-box;
  overflow: hidden;
  background-image: linear-gradient(
    135deg,
    var(--cf-glow-soft),
    rgba(7, 5, 12, 0.88) 55%,
    rgba(7, 5, 12, 0.82)
  );
  border: 1px solid var(--cf-border);
  border-radius: 8px 28px 8px 28px;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.4), 0 0 28px var(--cf-glow-soft);
  backdrop-filter: blur(14px);

  &::before {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 40%;
    height: 1px;
    background: linear-gradient(90deg, var(--cf-accent-bright), transparent);
    box-shadow: 0 0 12px var(--cf-glow);
  }

  @media screen and (max-width: 720px) {
    width: calc(100% - 24px);
    grid-template-columns: 1fr auto;
    min-height: 84px;
    padding: 14px 16px;
  }
`;

const Copy = styled.div`
  position: relative;
  z-index: 2;
  min-width: 0;
`;

const Eyebrow = styled.div`
  color: var(--cf-accent-bright);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 2.4px;
  text-transform: uppercase;
`;

const BannerTitle = styled.div`
  margin-top: 4px;
  color: var(--cf-text);
  font-size: clamp(18px, 2vw, 25px);
  font-weight: 700;
  letter-spacing: 0.2px;
  text-shadow: 0 0 18px var(--cf-glow-soft);
`;

const Note = styled.div`
  max-width: 460px;
  margin-top: 4px;
  color: var(--cf-text-muted);
  font-size: 11px;
  line-height: 1.5;
`;

const EyeSlot = styled.div`
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media screen and (max-width: 720px) {
    width: 64px;
    height: 64px;
  }
`;

export const ChapterBanner: React.FC<ChapterProps> = ({
  kind,
}): ReactElement => (
  <Banner>
    <Copy>
      <Eyebrow>{chapterCopy[kind].eyebrow}</Eyebrow>
      <BannerTitle>{chapterCopy[kind].title}</BannerTitle>
      <Note>{chapterCopy[kind].note}</Note>
    </Copy>
    <EyeSlot>
      <MangaEyes kind={kind} size={88} />
    </EyeSlot>
  </Banner>
);

const Stage = styled.div`
  position: relative;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 18px;
  box-sizing: border-box;
  isolation: isolate;
  border-radius: 8px 28px 8px 28px;
  border: 1px solid var(--cf-border);
  background: linear-gradient(
    145deg,
    var(--cf-glow-soft),
    transparent 32%,
    var(--cf-glow-soft)
  );

  > * {
    animation: ${revealContent} 520ms ease both;
  }

  @media screen and (max-width: 620px) {
    padding: 10px;
    border-radius: 8px 20px 8px 20px;
  }

  @media (prefers-reduced-motion: reduce) {
    > * {
      animation: none;
    }
  }
`;

export const ChapterStage: React.FC<StageProps> = ({
  kind,
  children,
}): ReactElement => (
  <Stage data-chapter={kind}>{children}</Stage>
);
