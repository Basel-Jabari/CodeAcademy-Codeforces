import React, { ReactElement } from "react";
import styled, { keyframes } from "styled-components";
import { AppTab } from "../navigation/ServiceNavigation";

interface ChapterProps {
  kind: AppTab;
}

const eyePulse = keyframes`
  0%, 100% { opacity: .84; filter: drop-shadow(0 0 10px var(--cf-glow)); }
  50% { opacity: 1; filter: drop-shadow(0 0 24px var(--cf-glow)); }
`;

const irisSpin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const breathe = keyframes`
  0%, 100% { opacity: .55; }
  50% { opacity: 1; }
`;

const EyeSvg = styled.svg`
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  color: var(--cf-accent-bright);
  animation: ${eyePulse} 5.2s ease-in-out infinite;

  .soft {
    opacity: 0.36;
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
    animation: ${breathe} 3.6s ease-in-out infinite;
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

const spinOrigin = (cx: number, cy: number): React.CSSProperties => ({
  transformOrigin: `${cx}px ${cy}px`,
  transformBox: "view-box",
});

const lidPath = (cx: number, cy: number, w: number, h: number): string => {
  const left = cx - w;
  const right = cx + w;
  const top = cy - h;
  const bottom = cy + h * 0.72;
  return `M${left} ${cy}
    C${cx - w * 0.55} ${top} ${cx + w * 0.35} ${top} ${right} ${cy}
    C${cx + w * 0.4} ${bottom} ${cx - w * 0.55} ${bottom} ${left} ${cy}Z`;
};

const EyeLid: React.FC<{
  cx: number;
  cy: number;
  w?: number;
  h?: number;
  width?: number;
  clipId?: string;
}> = ({ cx, cy, w = 96, h = 52, width = 2.8, clipId }): ReactElement => {
  const left = cx - w;
  const right = cx + w;
  const bottom = cy + h * 0.72;
  const d = lidPath(cx, cy, w, h);
  return (
    <g>
      {clipId ? (
        <defs>
          <clipPath id={clipId}>
            <path d={d} />
          </clipPath>
        </defs>
      ) : null}
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="soft"
        d={`M${left + 10} ${cy + 2} C${cx - w * 0.2} ${bottom - 6} ${cx + w * 0.25} ${bottom - 8} ${right - 8} ${cy + 1}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <path
        d={`M${right - 4} ${cy - 2} L${right + 16} ${cy - 12}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={width * 0.9}
        strokeLinecap="round"
      />
      <path
        className="soft"
        d={`M${left + 2} ${cy} C${left + 12} ${cy + 6} ${left + 18} ${cy + 4} ${left + 22} ${cy + 1}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.1}
        strokeLinecap="round"
      />
    </g>
  );
};

/** Madara Eternal Mangekyō — 4 curved pinwheel blades */
const MadaraEye: React.FC<{ cx: number; cy: number }> = ({
  cx,
  cy,
}): ReactElement => {
  const clipId = "madara-clip";
  const r = 36;
  const blade = `M0 ${-r * 0.12}
    C${r * 0.18} ${-r * 0.35} ${r * 0.22} ${-r * 0.7} 0 ${-r * 0.92}
    C${-r * 0.08} ${-r * 0.7} ${-r * 0.12} ${-r * 0.4} ${-r * 0.06} ${-r * 0.18}
    C${-r * 0.02} ${-r * 0.12} ${r * 0.02} ${-r * 0.1} 0 ${-r * 0.12}Z`;

  return (
    <g>
      <EyeLid cx={cx} cy={cy} w={98} h={50} width={3.1} clipId={clipId} />
      <g clipPath={`url(#${clipId})`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.7}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r * 0.88}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          className="soft"
        />
        <g className="spin" style={spinOrigin(cx, cy)}>
          {[0, 90, 180, 270].map((angle: number) => (
            <g
              key={angle}
              transform={`translate(${cx} ${cy}) rotate(${angle})`}
            >
              <path
                d={blade}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                className="soft"
                d={`M${r * 0.04} ${-r * 0.22} C${r * 0.12} ${-r * 0.4} ${r * 0.1} ${-r * 0.62} ${r * 0.02} ${-r * 0.78}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.3}
                strokeLinecap="round"
              />
            </g>
          ))}
        </g>
        <circle
          cx={cx}
          cy={cy}
          r={r * 0.28}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="hot"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r * 0.14}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
        />
        <circle cx={cx} cy={cy} r={r * 0.06} fill="currentColor" />
      </g>
      {/* classic 3-tomoe badge so Sharingan reads instantly */}
      <g transform={`translate(${cx - 84} ${cy - 46})`} className="hot">
        <circle r={12} fill="none" stroke="currentColor" strokeWidth={1.4} />
        {[0, 120, 240].map((angle: number) => (
          <g
            key={angle}
            transform={`rotate(${angle}) translate(0 -5)`}
          >
            <path
              d="M0 -6 C3.5 -6 5 -3 4 1 C2.5 4 1 6 0 7 C-0.4 3.5 0 1 1 -1 C-1.5 -3 -2.5 -5 0 -6Z"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          </g>
        ))}
        <circle r={1.6} fill="currentColor" />
      </g>
    </g>
  );
};

/** Shanks — calm eye crossed by three scar lines */
const ShanksEye: React.FC<{ cx: number; cy: number }> = ({
  cx,
  cy,
}): ReactElement => {
  const clipId = "shanks-clip";
  return (
    <g>
      <EyeLid cx={cx} cy={cy} w={94} h={48} width={3} clipId={clipId} />
      <g clipPath={`url(#${clipId})`}>
        <circle
          cx={cx}
          cy={cy}
          r={29}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.3}
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
        <circle
          cx={cx}
          cy={cy}
          r={9}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="hot"
        />
        <circle cx={cx} cy={cy} r={3.5} fill="currentColor" />
        <circle
          cx={cx - 7}
          cy={cy - 8}
          r={3}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          className="soft"
        />
      </g>
      <g stroke="currentColor" strokeLinecap="round" className="hot">
        <line
          x1={cx - 58}
          y1={cy - 52}
          x2={cx + 42}
          y2={cy + 46}
          strokeWidth={3}
        />
        <line
          x1={cx - 49}
          y1={cy - 58}
          x2={cx + 50}
          y2={cy + 40}
          strokeWidth={2.3}
        />
        <line
          x1={cx - 40}
          y1={cy - 62}
          x2={cx + 58}
          y2={cy + 34}
          strokeWidth={1.7}
        />
      </g>
    </g>
  );
};

/** Gojo Six Eyes — wide lid + nested iris rings + hex motif */
const SixEyes: React.FC<{ cx: number; cy: number }> = ({
  cx,
  cy,
}): ReactElement => {
  const clipId = "gojo-clip";
  const hex = [0, 1, 2, 3, 4, 5]
    .map((i: number) => {
      const rad = ((i * 60 - 90) * Math.PI) / 180;
      return `${cx + Math.cos(rad) * 20},${cy + Math.sin(rad) * 20}`;
    })
    .join(" ");
  return (
    <g>
      <EyeLid cx={cx} cy={cy} w={104} h={42} width={2.7} clipId={clipId} />
      <path
        className="soft"
        d={`M${cx - 92} ${cy - 6} C${cx - 28} ${cy - 40} ${cx + 44} ${cy - 38} ${cx + 98} ${cy - 2}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <g clipPath={`url(#${clipId})`} className="breathe">
        {[40, 31, 23, 15, 8].map((radius: number, i: number) => (
          <circle
            key={radius}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={i === 0 ? 2.3 : 1.25}
            className={i % 2 === 1 ? "hot" : undefined}
          />
        ))}
        <polygon
          points={hex}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          className="soft"
        />
      </g>
      <circle cx={cx} cy={cy} r={3.2} fill="currentColor" className="hot" />
    </g>
  );
};

/** Killua — angular cat-eye + vertical slit + lightning */
const KilluaEye: React.FC<{ cx: number; cy: number }> = ({
  cx,
  cy,
}): ReactElement => {
  const clipId = "killua-clip";
  const lid = `M${cx - 100} ${cy + 6}
    C${cx - 48} ${cy - 48} ${cx + 18} ${cy - 54} ${cx + 102} ${cy - 8}
    L${cx + 118} ${cy - 18}
    C${cx + 58} ${cy + 40} ${cx - 42} ${cy + 46} ${cx - 100} ${cy + 6}Z`;
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <path d={lid} />
        </clipPath>
      </defs>
      <path
        d={lid}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="soft"
        d={`M${cx - 88} ${cy + 8} C${cx - 18} ${cy + 38} ${cx + 44} ${cy + 34} ${cx + 96} ${cy + 2}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
      <g clipPath={`url(#${clipId})`}>
        <circle
          cx={cx}
          cy={cy}
          r={31}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.1}
        />
        <path
          className="hot"
          d={`M${cx} ${cy - 27}
            C${cx + 8} ${cy - 10} ${cx + 8} ${cy + 10} ${cx} ${cy + 27}
            C${cx - 8} ${cy + 10} ${cx - 8} ${cy - 10} ${cx} ${cy - 27}Z`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.7}
          strokeLinejoin="round"
        />
        <line
          x1={cx}
          y1={cy - 20}
          x2={cx}
          y2={cy + 20}
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          className="hot"
        />
      </g>
      <path
        d={`M${cx + 78} ${cy - 34} L${cx + 90} ${cy - 14} L${cx + 80} ${cy - 12} L${cx + 98} ${cy + 10}
          M${cx - 82} ${cy - 28} L${cx - 94} ${cy - 8} L${cx - 84} ${cy - 6} L${cx - 96} ${cy + 8}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="hot"
      />
    </g>
  );
};

/** Rinnegan — ripple rings */
const RinneganEye: React.FC<{ cx: number; cy: number }> = ({
  cx,
  cy,
}): ReactElement => {
  const clipId = "rinnegan-clip";
  const r = 38;
  return (
    <g>
      <EyeLid cx={cx} cy={cy} w={96} h={50} width={2.9} clipId={clipId} />
      <g clipPath={`url(#${clipId})`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.6}
        />
        <g className="spin-slow" style={spinOrigin(cx, cy)}>
          {[0.84, 0.68, 0.52, 0.36, 0.22].map((scale: number, i: number) => (
            <circle
              key={scale}
              cx={cx}
              cy={cy}
              r={r * scale}
              fill="none"
              stroke="currentColor"
              strokeWidth={i === 0 ? 1.7 : 1.25}
              className={i % 2 === 0 ? "breathe" : "soft"}
            />
          ))}
          {Array.from({ length: 16 }, (_, i: number) => {
            const rad = (i * 22.5 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={cx + Math.cos(rad) * r * 0.9}
                y1={cy + Math.sin(rad) * r * 0.9}
                x2={cx + Math.cos(rad) * r}
                y2={cy + Math.sin(rad) * r}
                stroke="currentColor"
                strokeWidth={1.3}
                strokeLinecap="round"
                className="soft"
              />
            );
          })}
        </g>
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />
        <circle cx={cx} cy={cy} r={2.4} fill="currentColor" className="hot" />
      </g>
    </g>
  );
};

/** Sung Jin-Woo — glowing diamond slit + aura */
const JinWooEye: React.FC<{ cx: number; cy: number }> = ({
  cx,
  cy,
}): ReactElement => {
  const clipId = "jinwoo-clip";
  return (
    <g>
      <EyeLid cx={cx} cy={cy} w={96} h={46} width={3} clipId={clipId} />
      <g clipPath={`url(#${clipId})`}>
        <circle
          cx={cx}
          cy={cy}
          r={31}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.3}
        />
        <circle
          cx={cx}
          cy={cy}
          r={20}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.35}
          className="soft"
        />
        <path
          className="hot breathe"
          d={`M${cx} ${cy - 24} L${cx + 9} ${cy} L${cx} ${cy + 24} L${cx - 9} ${cy}Z`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <line
          x1={cx}
          y1={cy - 16}
          x2={cx}
          y2={cy + 16}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="hot"
        />
      </g>
      <path
        className="soft"
        d={`M${cx - 78} ${cy - 22} C${cx - 54} ${cy - 40} ${cx - 28} ${cy - 42} ${cx - 8} ${cy - 30}
          M${cx + 12} ${cy - 28} C${cx + 40} ${cy - 44} ${cx + 68} ${cy - 34} ${cx + 86} ${cy - 14}
          M${cx - 70} ${cy + 24} C${cx - 40} ${cy + 40} ${cx - 10} ${cy + 38} ${cx + 8} ${cy + 26}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.35}
        strokeLinecap="round"
      />
    </g>
  );
};

export const MangaEyes: React.FC<ChapterProps> = ({ kind }): ReactElement => (
  <EyeSvg viewBox="0 0 480 176" aria-hidden="true">
    {kind === "randomizer" ? (
      <g>
        <MadaraEye cx={126} cy={84} />
        <ShanksEye cx={360} cy={84} />
      </g>
    ) : null}
    {kind === "crossAnalysis" ? (
      <g>
        <SixEyes cx={126} cy={84} />
        <KilluaEye cx={360} cy={84} />
      </g>
    ) : null}
    {kind === "contestBuilder" ? (
      <g>
        <RinneganEye cx={126} cy={84} />
        <JinWooEye cx={360} cy={84} />
      </g>
    ) : null}
  </EyeSvg>
);

export default MangaEyes;
