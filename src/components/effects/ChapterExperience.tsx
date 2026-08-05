import React, { ReactElement, ReactNode } from "react";
import styled, { css, keyframes } from "styled-components";
import { AppTab } from "../navigation/ServiceNavigation";

interface ChapterProps {
  kind: AppTab;
}

interface StageProps extends ChapterProps {
  children: ReactNode;
}

const eyePulse = keyframes`
  0%, 100% { opacity: .78; filter: drop-shadow(0 0 8px var(--cf-glow)); }
  50% { opacity: 1; filter: drop-shadow(0 0 18px var(--cf-glow)); }
`;

const rise = keyframes`
  0% { transform: translate3d(0, 10vh, 0) scale(.35); opacity: 0; }
  15% { opacity: .9; }
  80% { opacity: .4; }
  100% { transform: translate3d(var(--drift), -105vh, 0) scale(1); opacity: 0; }
`;

const flameBreathe = keyframes`
  0%, 100% { transform: translateY(12px) scaleX(1); opacity: .42; }
  50% { transform: translateY(-5px) scaleX(1.08); opacity: .72; }
`;

const current = keyframes`
  from { transform: translate3d(-8%, 0, 0) rotate(-1deg); }
  to { transform: translate3d(8%, -8px, 0) rotate(1deg); }
`;

const bubbleRise = keyframes`
  0% { transform: translateY(18vh) scale(.5); opacity: 0; }
  18% { opacity: .45; }
  100% { transform: translateY(-105vh) scale(1.25); opacity: 0; }
`;

const lightning = keyframes`
  0%, 9%, 14%, 72%, 100% { opacity: 0; stroke-dashoffset: 520; }
  10%, 13% { opacity: .9; stroke-dashoffset: 0; }
  73% { opacity: .55; stroke-dashoffset: 0; }
  76% { opacity: 0; }
`;

const haze = keyframes`
  0%, 100% { transform: translate3d(-3%, 2%, 0) scale(1); }
  50% { transform: translate3d(4%, -3%, 0) scale(1.12); }
`;

const revealContent = keyframes`
  0% { opacity: 0; transform: translateY(14px) scale(.992); filter: blur(5px); }
  42% { opacity: 0; }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
`;

const curtain = keyframes`
  0% { clip-path: inset(0 0 0 0); opacity: 1; }
  38% { clip-path: inset(0 0 0 0); opacity: 1; }
  100% { clip-path: inset(0 0 0 100%); opacity: 0; }
`;

const slash = keyframes`
  0% { left: -12%; opacity: 0; }
  30% { opacity: 1; }
  100% { left: 112%; opacity: 0; }
`;

const EyeSvg = styled.svg`
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  color: var(--cf-accent-bright);
  animation: ${eyePulse} 4.8s ease-in-out infinite;

  .soft {
    opacity: .42;
  }

  .hot {
    color: var(--cf-secondary);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Stroke: React.FC<{
  d: string;
  width?: number;
  className?: string;
}> = ({ d, width = 2, className }): ReactElement => (
  <path
    d={d}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

export const MangaEyes: React.FC<ChapterProps> = ({ kind }): ReactElement => (
  <EyeSvg viewBox="0 0 480 176" aria-hidden="true">
    {kind === "randomizer" ? (
      <g>
        <Stroke width={3.2} d="M22 92 C72 37 143 28 211 69 C166 118 91 130 22 92Z" />
        <Stroke width={1.4} className="soft" d="M31 89 C84 105 141 110 203 71" />
        <circle cx="126" cy="79" r="38" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="126" cy="79" r="8" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <Stroke width={4} d="M126 42 C140 54 143 67 135 77 C149 72 162 76 173 87 C158 92 145 91 135 84 C136 99 129 109 116 116 C114 101 116 90 121 83 C106 88 93 83 84 73 C99 66 111 67 121 74 C116 60 118 50 126 42Z" />
        <Stroke width={1.5} className="hot" d="M75 25 L58 63 M87 22 L70 65 M99 25 L83 63" />

        <Stroke width={3.4} d="M270 79 C319 43 395 43 458 87 C403 111 334 111 270 79Z" />
        <Stroke width={2.2} d="M283 77 C329 66 390 67 447 86" />
        <Stroke width={3.1} className="hot" d="M364 59 C375 68 379 80 371 94 C360 87 356 73 364 59Z" />
        <Stroke width={1.3} className="soft" d="M302 110 C346 122 398 118 434 99" />
        <Stroke width={2} d="M313 20 L296 64 M329 18 L313 67 M345 23 L329 66" />
      </g>
    ) : null}

    {kind === "crossAnalysis" ? (
      <g>
        <Stroke width={2.8} d="M20 89 C69 38 151 29 215 78 C166 124 80 128 20 89Z" />
        <Stroke width={1.2} className="soft" d="M28 88 C89 109 151 108 207 78" />
        <circle cx="126" cy="79" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="126" cy="79" r="29" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="126" cy="79" r="17" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <circle className="hot" cx="126" cy="79" r="6" fill="currentColor" />
        <Stroke width={1.5} d="M126 39V61 M126 97V119 M86 79H108 M144 79H166 M98 51L112 65 M154 51L140 65 M98 107L112 93 M154 107L140 93" />

        <Stroke width={3.2} d="M263 87 C315 37 396 39 461 82 C404 122 320 121 263 87Z" />
        <Stroke width={1.5} className="soft" d="M273 87 C329 103 390 106 451 82" />
        <Stroke width={3} className="hot" d="M365 48 C379 60 381 80 369 101 C354 91 350 66 365 48Z" />
        <Stroke width={1.8} d="M297 31 L314 57 L325 42 L341 64 M401 29 L389 55 L411 64 L394 82" />
        <Stroke width={1.4} className="soft" d="M285 122 C330 132 403 132 442 104" />
      </g>
    ) : null}

    {kind === "contestBuilder" ? (
      <g>
        <Stroke width={3} d="M20 88 C67 42 150 30 214 77 C164 125 77 127 20 88Z" />
        <Stroke width={1.3} className="soft" d="M29 87 C83 109 154 107 205 78" />
        <circle cx="126" cy="79" r="40" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="126" cy="79" r="31" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="126" cy="79" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="126" cy="79" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle className="hot" cx="126" cy="79" r="4" fill="currentColor" />
        <Stroke width={1.3} d="M86 78H166 M126 39V119" />

        <Stroke width={3.5} d="M265 92 C319 38 400 40 461 76 C411 123 326 128 265 92Z" />
        <Stroke width={1.4} className="soft" d="M275 90 C333 111 398 108 452 77" />
        <Stroke width={3.2} className="hot" d="M365 48 C381 61 383 84 367 107 C350 91 350 64 365 48Z" />
        <Stroke width={1.8} d="M365 38V118 M347 52L356 64 M384 51L376 65 M344 101L356 92 M386 101L376 91" />
        <Stroke width={1.5} className="soft" d="M303 25 L316 57 M421 24 L404 58" />
      </g>
    ) : null}
  </EyeSvg>
);

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
`;

const Ambient = styled.div<{ $kind: AppTab }>`
  position: absolute;
  inset: -12%;
  background: ${(props) =>
    props.$kind === "randomizer"
      ? "radial-gradient(circle at 18% 78%, rgba(237,36,71,.18), transparent 28%), radial-gradient(circle at 78% 12%, rgba(255,106,88,.12), transparent 25%)"
      : props.$kind === "crossAnalysis"
      ? "radial-gradient(ellipse at 50% 115%, rgba(32,167,245,.24), transparent 44%), radial-gradient(circle at 84% 10%, rgba(41,230,211,.12), transparent 26%)"
      : "radial-gradient(circle at 50% 56%, rgba(146,92,255,.18), transparent 42%), radial-gradient(circle at 82% 8%, rgba(224,124,255,.10), transparent 25%)"};
  animation: ${haze} 15s ease-in-out infinite;
`;

const FireBed = styled.div`
  position: absolute;
  right: -5%;
  bottom: -90px;
  left: -5%;
  height: 260px;
  opacity: .62;
  background: repeating-radial-gradient(ellipse at 50% 105%, transparent 0 32px, rgba(237, 36, 71, .19) 34px, rgba(255, 139, 63, .08) 45px, transparent 65px);
  filter: blur(10px) saturate(1.3);
  animation: ${flameBreathe} 3.2s ease-in-out infinite;
`;

const Spark = styled.i`
  position: absolute;
  bottom: -20px;
  left: var(--left);
  width: var(--size);
  height: calc(var(--size) * 2.8);
  border-radius: 999px;
  background: linear-gradient(to top, #ed2447, #ff9a52);
  box-shadow: 0 0 10px #ed2447, 0 0 18px rgba(255, 154, 82, .45);
  animation: ${rise} var(--duration) linear var(--delay) infinite;
`;

const Water = styled.div`
  position: absolute;
  right: -12%;
  bottom: -80px;
  left: -12%;
  height: 300px;
  opacity: .38;
`;

const Wave = styled.i`
  position: absolute;
  inset: var(--inset);
  border: 2px solid rgba(117, 220, 255, .42);
  border-right-color: rgba(41, 230, 211, .18);
  border-left-color: transparent;
  border-radius: 48% 52% 0 0 / 22% 25% 0 0;
  filter: drop-shadow(0 0 15px rgba(32, 167, 245, .32));
  animation: ${current} var(--duration) ease-in-out var(--delay) infinite alternate;
`;

const Bubble = styled.i`
  position: absolute;
  bottom: -20px;
  left: var(--left);
  width: var(--size);
  height: var(--size);
  border: 1px solid rgba(117, 220, 255, .6);
  border-radius: 50%;
  box-shadow: inset 2px 2px 5px rgba(41, 230, 211, .2), 0 0 8px rgba(32, 167, 245, .2);
  animation: ${bubbleRise} var(--duration) ease-in var(--delay) infinite;
`;

const LightningSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: var(--cf-accent-bright);
  opacity: .48;

  path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.3;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 520;
    filter: drop-shadow(0 0 7px var(--cf-glow));
    animation: ${lightning} 7s ease-in-out infinite;
  }

  path:nth-child(2) { animation-delay: -2.6s; opacity: .65; }
  path:nth-child(3) { animation-delay: -4.8s; opacity: .38; }
`;

const Watermark = styled.div`
  position: absolute;
  top: 106px;
  right: max(2vw, 18px);
  width: min(39vw, 540px);
  opacity: .08;

  @media screen and (max-width: 760px) {
    top: 148px;
    right: -110px;
    width: 390px;
    opacity: .055;
  }
`;

const sparks = Array.from({ length: 25 }, (_, index: number) => index);
const bubbles = Array.from({ length: 18 }, (_, index: number) => index);

export const ChapterAtmosphere: React.FC<ChapterProps> = ({ kind }): ReactElement => (
  <Backdrop aria-hidden="true">
    <Ambient $kind={kind} />
    {kind === "randomizer" ? (
      <>
        <FireBed />
        {sparks.map((spark: number) => (
          <Spark
            key={spark}
            style={{
              "--left": `${(spark * 37) % 101}%`,
              "--size": `${2 + (spark % 4)}px`,
              "--duration": `${5 + (spark % 7) * 0.7}s`,
              "--delay": `${-(spark % 9) * 0.8}s`,
              "--drift": `${(spark % 2 ? 1 : -1) * (20 + (spark % 5) * 13)}px`,
            } as React.CSSProperties}
          />
        ))}
      </>
    ) : null}
    {kind === "crossAnalysis" ? (
      <>
        <Water>
          <Wave style={{ "--inset": "12% 0 0", "--duration": "7s", "--delay": "-2s" } as React.CSSProperties} />
          <Wave style={{ "--inset": "30% -7% 0", "--duration": "9s", "--delay": "-5s" } as React.CSSProperties} />
          <Wave style={{ "--inset": "49% -3% 0", "--duration": "11s", "--delay": "-1s" } as React.CSSProperties} />
        </Water>
        {bubbles.map((bubble: number) => (
          <Bubble
            key={bubble}
            style={{
              "--left": `${(bubble * 43) % 97}%`,
              "--size": `${4 + (bubble % 5) * 3}px`,
              "--duration": `${8 + (bubble % 6)}s`,
              "--delay": `${-(bubble % 8) * 1.25}s`,
            } as React.CSSProperties}
          />
        ))}
      </>
    ) : null}
    {kind === "contestBuilder" ? (
      <LightningSvg viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path d="M1260 -10 L1188 122 L1225 148 L1132 278 L1163 304 L1060 468 L1097 490 L998 650" />
        <path d="M170 -20 L239 114 L205 148 L302 285 L265 318 L382 455" />
        <path d="M840 -10 L803 91 L834 121 L763 226 L788 249 L719 360" />
      </LightningSvg>
    ) : null}
    <Watermark><MangaEyes kind={kind} /></Watermark>
  </Backdrop>
);

const chapterCopy: { [key in AppTab]: { eyebrow: string; title: string; note: string } } = {
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

const Banner = styled.section<{ $kind: AppTab }>`
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(280px, 470px);
  align-items: center;
  gap: 24px;
  width: calc(100% - 48px);
  max-width: 1120px;
  min-height: 104px;
  margin: 0 auto 18px;
  padding: 15px 22px 15px 25px;
  box-sizing: border-box;
  overflow: hidden;
  background: ${(props) =>
    props.$kind === "randomizer"
      ? "linear-gradient(105deg, rgba(33,9,14,.94), rgba(8,5,6,.76) 68%)"
      : props.$kind === "crossAnalysis"
      ? "linear-gradient(105deg, rgba(5,27,42,.94), rgba(4,8,13,.76) 68%)"
      : "linear-gradient(105deg, rgba(25,13,42,.94), rgba(7,5,12,.76) 68%)"};
  border: 1px solid var(--cf-border);
  border-left: 3px solid var(--cf-accent);
  border-radius: ${(props) =>
    props.$kind === "randomizer" ? "3px 22px 22px 3px" : props.$kind === "crossAnalysis" ? "26px 8px 26px 8px" : "6px 25px 6px 25px"};
  box-shadow: 0 22px 60px rgba(0, 0, 0, .4), 0 0 32px var(--cf-glow-soft);
  backdrop-filter: blur(13px);

  &::before {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 42%;
    height: 1px;
    background: linear-gradient(90deg, var(--cf-accent-bright), transparent);
    box-shadow: 0 0 12px var(--cf-glow);
  }

  @media screen and (max-width: 720px) {
    width: calc(100% - 24px);
    grid-template-columns: 1fr;
    min-height: 92px;
    padding: 14px 18px;
  }
`;

const Copy = styled.div`
  position: relative;
  z-index: 2;
`;

const Eyebrow = styled.div`
  color: var(--cf-accent-bright);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
`;

const BannerTitle = styled.div`
  margin-top: 3px;
  color: var(--cf-text);
  font-size: clamp(19px, 2vw, 26px);
  font-weight: 700;
  letter-spacing: .2px;
  text-shadow: 0 0 20px var(--cf-glow-soft);
`;

const Note = styled.div`
  max-width: 440px;
  margin-top: 3px;
  color: var(--cf-text-muted);
  font-size: 11px;
  line-height: 1.5;
`;

const BannerEyes = styled.div`
  width: 100%;
  opacity: .88;

  @media screen and (max-width: 720px) {
    position: absolute;
    right: -80px;
    width: 390px;
    opacity: .12;
  }
`;

export const ChapterBanner: React.FC<ChapterProps> = ({ kind }): ReactElement => (
  <Banner $kind={kind}>
    <Copy>
      <Eyebrow>{chapterCopy[kind].eyebrow}</Eyebrow>
      <BannerTitle>{chapterCopy[kind].title}</BannerTitle>
      <Note>{chapterCopy[kind].note}</Note>
    </Copy>
    <BannerEyes><MangaEyes kind={kind} /></BannerEyes>
  </Banner>
);

const stageShape = (kind: AppTab) => {
  if (kind === "randomizer") {
    return css`
      border-radius: 4px 30px 8px 4px;
      border-left: 2px solid var(--cf-accent);
      background: linear-gradient(120deg, var(--cf-glow-soft), transparent 38%);
    `;
  }
  if (kind === "crossAnalysis") {
    return css`
      border-radius: 34px 12px 34px 12px;
      border-top: 1px solid var(--cf-border-bright);
      background: radial-gradient(ellipse at 50% 120%, var(--cf-glow-soft), transparent 58%);
    `;
  }
  return css`
    border-radius: 8px 28px 8px 28px;
    border: 1px solid var(--cf-border);
    background: linear-gradient(145deg, var(--cf-glow-soft), transparent 30%, var(--cf-glow-soft));
  `;
};

const Stage = styled.div<{ $kind: AppTab }>`
  position: relative;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 18px;
  box-sizing: border-box;
  isolation: isolate;
  ${props => stageShape(props.$kind)}

  > * {
    animation: ${revealContent} 760ms cubic-bezier(.22, .84, .31, 1) both;
  }

  &::before {
    content: "";
    position: absolute;
    inset: -2px;
    z-index: 8;
    pointer-events: none;
    background: linear-gradient(110deg, var(--cf-accent-deep), var(--cf-accent), var(--cf-bg) 76%);
    border-radius: inherit;
    animation: ${curtain} 760ms cubic-bezier(.72, 0, .18, 1) both;
  }

  &::after {
    content: "";
    position: absolute;
    z-index: 9;
    top: -4%;
    left: -12%;
    width: 2px;
    height: 108%;
    pointer-events: none;
    background: #fff;
    box-shadow: 0 0 10px #fff, 0 0 24px var(--cf-accent), 0 0 52px var(--cf-glow);
    transform: skewX(-12deg);
    animation: ${slash} 780ms cubic-bezier(.7, 0, .2, 1) both;
  }

  @media screen and (max-width: 620px) {
    padding: 10px;
    border-radius: 10px 20px 10px 20px;
  }

  @media (prefers-reduced-motion: reduce) {
    > *, &::before, &::after { animation: none; }
    &::before, &::after { display: none; }
  }
`;

export const ChapterStage: React.FC<StageProps> = ({ kind, children }): ReactElement => (
  <Stage $kind={kind} data-chapter={kind}>{children}</Stage>
);
