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
  0%, 100% { opacity: .82; filter: drop-shadow(0 0 10px var(--cf-glow)); }
  50% { opacity: 1; filter: drop-shadow(0 0 22px var(--cf-glow)); }
`;

const irisSpin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const rinneganPulse = keyframes`
  0%, 100% { opacity: .55; }
  50% { opacity: 1; }
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
  animation: ${eyePulse} 5.2s ease-in-out infinite;

  .soft {
    opacity: 0.38;
  }

  .hot {
    color: var(--cf-secondary);
  }

  .spin {
    animation: ${irisSpin} 14s linear infinite;
  }

  .spin-slow {
    animation: ${irisSpin} 28s linear infinite;
  }

  .breathe {
    animation: ${rinneganPulse} 3.6s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    .spin,
    .spin-slow,
    .breathe {
      animation: none;
    }
  }
`;

/** Shared almond eye outline — classic manga eye silhouette */
const EyeLid: React.FC<{
  cx: number;
  cy: number;
  w?: number;
  h?: number;
  width?: number;
}> = ({ cx, cy, w = 96, h = 52, width = 2.8 }): ReactElement => {
  const left = cx - w;
  const right = cx + w;
  const top = cy - h;
  const bottom = cy + h * 0.72;
  return (
    <g>
      <path
        d={`M${left} ${cy} C${cx - w * 0.55} ${top} ${cx + w * 0.35} ${top} ${right} ${cy}
            C${cx + w * 0.4} ${bottom} ${cx - w * 0.55} ${bottom} ${left} ${cy}Z`}
        fill="none"
        stroke="currentColor"
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* lower lid crease */}
      <path
        className="soft"
        d={`M${left + 10} ${cy + 2} C${cx - w * 0.2} ${bottom - 6} ${cx + w * 0.25} ${bottom - 8} ${right - 8} ${cy + 1}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      {/* sharp outer corner flick */}
      <path
        d={`M${right - 4} ${cy - 2} L${right + 14} ${cy - 10}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={width * 0.85}
        strokeLinecap="round"
      />
    </g>
  );
};

const spinOrigin = (cx: number, cy: number): React.CSSProperties => ({
  transformOrigin: `${cx}px ${cy}px`,
  transformBox: "view-box",
});

/** Classic 3-tomoe Sharingan (Uchiha / Madara) */
const SharinganIris: React.FC<{ cx: number; cy: number; r?: number }> = ({
  cx,
  cy,
  r = 36,
}): ReactElement => {
  const pupil = r * 0.2;
  // Magatama / comma tomoe centered on local origin, then rotated into place
  const tomoePath =
    "M0 -18 C8 -18 14 -10 12 -2 C10 8 4 14 0 18 C-2 10 -2 2 0 -2 C-6 -6 -8 -14 0 -18Z";

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.82}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.15}
        className="soft"
      />
      <g className="spin" style={spinOrigin(cx, cy)}>
        {[0, 120, 240].map((angle: number) => (
          <g key={angle} transform={`translate(${cx} ${cy}) rotate(${angle}) translate(0 ${-r * 0.48})`}>
            <path
              d={tomoePath}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* tomoe head accent */}
            <circle
              cx={2}
              cy={-12}
              r={3.2}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            />
          </g>
        ))}
      </g>
      <circle
        cx={cx}
        cy={cy}
        r={pupil}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
      />
      <circle cx={cx} cy={cy} r={pupil * 0.4} fill="currentColor" />
    </g>
  );
};

/** Shanks — calm eye crossed by the three-line scar */
const ShanksEye: React.FC<{ cx: number; cy: number }> = ({
  cx,
  cy,
}): ReactElement => (
  <g>
    <EyeLid cx={cx} cy={cy} w={94} h={48} width={3} />
    <circle
      cx={cx}
      cy={cy}
      r={28}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
    />
    <circle
      cx={cx}
      cy={cy}
      r={14}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="hot"
    />
    <circle cx={cx} cy={cy} r={5} fill="currentColor" />
    {/* iconic three parallel scar strokes */}
    <g stroke="currentColor" strokeLinecap="round" className="hot">
      <line x1={cx - 52} y1={cy - 48} x2={cx + 38} y2={cy + 42} strokeWidth={2.8} />
      <line x1={cx - 44} y1={cy - 54} x2={cx + 46} y2={cy + 36} strokeWidth={2.2} />
      <line x1={cx - 36} y1={cy - 58} x2={cx + 54} y2={cy + 30} strokeWidth={1.8} />
    </g>
    {/* scar flecks near brow */}
    <path
      className="soft"
      d={`M${cx - 58} ${cy - 36} L${cx - 50} ${cy - 22} M${cx + 44} ${cy + 28} L${cx + 52} ${cy + 40}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
    />
  </g>
);

/** Gojo Satoru — Six Eyes: wide lid + concentric iris rings */
const SixEyes: React.FC<{ cx: number; cy: number }> = ({
  cx,
  cy,
}): ReactElement => (
  <g>
    <EyeLid cx={cx} cy={cy} w={100} h={44} width={2.6} />
    {/* upper lid extra crease — Gojo's sharp gaze */}
    <path
      className="soft"
      d={`M${cx - 88} ${cy - 8} C${cx - 30} ${cy - 42} ${cx + 40} ${cy - 40} ${cx + 92} ${cy - 4}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
    <g className="breathe">
      {[38, 28, 18, 10].map((radius: number, i: number) => (
        <circle
          key={radius}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={i === 0 ? 2.2 : 1.35}
          className={i % 2 === 1 ? "hot" : undefined}
        />
      ))}
    </g>
    {/* radial "sight" ticks */}
    <g stroke="currentColor" strokeWidth={1.2} strokeLinecap="round">
      {[0, 45, 90, 135].map((deg: number) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={cx + Math.cos(rad) * 12}
            y1={cy + Math.sin(rad) * 12}
            x2={cx + Math.cos(rad) * 36}
            y2={cy + Math.sin(rad) * 36}
            className="soft"
          />
        );
      })}
    </g>
    <circle cx={cx} cy={cy} r={3.5} fill="currentColor" className="hot" />
  </g>
);

/** Killua — sharp cat-eye with vertical lightning slit */
const KilluaEye: React.FC<{ cx: number; cy: number }> = ({
  cx,
  cy,
}): ReactElement => (
  <g>
    {/* sharper / more angular lid than the shared almond */}
    <path
      d={`M${cx - 98} ${cy + 4}
          C${cx - 50} ${cy - 46} ${cx + 20} ${cy - 52} ${cx + 100} ${cy - 6}
          L${cx + 112} ${cy - 14}
          C${cx + 55} ${cy + 38} ${cx - 40} ${cy + 44} ${cx - 98} ${cy + 4}Z`}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      className="soft"
      d={`M${cx - 86} ${cy + 6} C${cx - 20} ${cy + 36} ${cx + 40} ${cy + 32} ${cx + 92} ${cy}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
    />
    <circle
      cx={cx}
      cy={cy}
      r={30}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    />
    {/* vertical cat slit */}
    <path
      className="hot"
      d={`M${cx} ${cy - 26}
          C${cx + 7} ${cy - 10} ${cx + 7} ${cy + 10} ${cx} ${cy + 26}
          C${cx - 7} ${cy + 10} ${cx - 7} ${cy - 10} ${cx} ${cy - 26}Z`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinejoin="round"
    />
    <line
      x1={cx}
      y1={cy - 18}
      x2={cx}
      y2={cy + 18}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="hot"
    />
    {/* lightning sparks near outer corner */}
    <path
      d={`M${cx + 72} ${cy - 28} L${cx + 82} ${cy - 12} L${cx + 74} ${cy - 10} L${cx + 90} ${cy + 8}
          M${cx - 78} ${cy - 22} L${cx - 88} ${cy - 6} L${cx - 80} ${cy - 4}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="hot"
    />
  </g>
);

/** Rinnegan — concentric ripple rings (Sasuke / Madara) */
const RinneganIris: React.FC<{ cx: number; cy: number; r?: number }> = ({
  cx,
  cy,
  r = 40,
}): ReactElement => (
  <g>
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
    />
    <g className="spin-slow" style={spinOrigin(cx, cy)}>
      {[0.82, 0.64, 0.46, 0.3].map((scale: number, i: number) => (
        <circle
          key={scale}
          cx={cx}
          cy={cy}
          r={r * scale}
          fill="none"
          stroke="currentColor"
          strokeWidth={i === 0 ? 1.8 : 1.35}
          className={i % 2 === 0 ? "breathe" : "soft"}
        />
      ))}
      {/* evenly spaced tick marks on outermost ring */}
      {Array.from({ length: 12 }, (_, i: number) => {
        const rad = (i * 30 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={cx + Math.cos(rad) * r * 0.88}
            y1={cy + Math.sin(rad) * r * 0.88}
            x2={cx + Math.cos(rad) * r}
            y2={cy + Math.sin(rad) * r}
            stroke="currentColor"
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        );
      })}
    </g>
    <circle cx={cx} cy={cy} r={5} fill="none" stroke="currentColor" strokeWidth={2} />
    <circle cx={cx} cy={cy} r={2.2} fill="currentColor" className="hot" />
  </g>
);

/** Sung Jin-Woo — sharp glowing eye with vertical diamond highlight */
const JinWooEye: React.FC<{ cx: number; cy: number }> = ({
  cx,
  cy,
}): ReactElement => (
  <g>
    <EyeLid cx={cx} cy={cy} w={96} h={46} width={3} />
    <circle
      cx={cx}
      cy={cy}
      r={30}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
    />
    <circle
      cx={cx}
      cy={cy}
      r={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      className="soft"
    />
    {/* glowing vertical diamond / slit */}
    <path
      className="hot breathe"
      d={`M${cx} ${cy - 22}
          L${cx + 8} ${cy}
          L${cx} ${cy + 22}
          L${cx - 8} ${cy}Z`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinejoin="round"
    />
    <line
      x1={cx}
      y1={cy - 14}
      x2={cx}
      y2={cy + 14}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      className="hot"
    />
    {/* aura strokes */}
    <path
      className="soft"
      d={`M${cx - 70} ${cy - 18} C${cx - 50} ${cy - 34} ${cx - 30} ${cy - 36} ${cx - 12} ${cy - 28}
          M${cx + 16} ${cy - 26} C${cx + 40} ${cy - 38} ${cx + 62} ${cy - 30} ${cx + 78} ${cy - 12}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
    />
  </g>
);

export const MangaEyes: React.FC<ChapterProps> = ({ kind }): ReactElement => (
  <EyeSvg viewBox="0 0 480 176" aria-hidden="true">
    {kind === "randomizer" ? (
      <g>
        {/* left: Sharingan (Madara) */}
        <EyeLid cx={126} cy={84} w={98} h={50} width={3.1} />
        <SharinganIris cx={126} cy={84} r={36} />
        {/* right: Shanks */}
        <ShanksEye cx={360} cy={84} />
      </g>
    ) : null}

    {kind === "crossAnalysis" ? (
      <g>
        {/* left: Gojo Six Eyes */}
        <SixEyes cx={126} cy={84} />
        {/* right: Killua */}
        <KilluaEye cx={360} cy={84} />
      </g>
    ) : null}

    {kind === "contestBuilder" ? (
      <g>
        {/* left: Rinnegan */}
        <EyeLid cx={126} cy={84} w={96} h={50} width={2.9} />
        <RinneganIris cx={126} cy={84} r={38} />
        {/* right: Sung Jin-Woo */}
        <JinWooEye cx={360} cy={84} />
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
  width: min(42vw, 560px);
  opacity: 0.11;

  @media screen and (max-width: 760px) {
    top: 148px;
    right: -110px;
    width: 390px;
    opacity: 0.07;
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
  max-width: 460px;
  justify-self: end;
  opacity: 0.95;

  @media screen and (max-width: 720px) {
    position: absolute;
    right: -80px;
    width: 390px;
    opacity: 0.14;
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
