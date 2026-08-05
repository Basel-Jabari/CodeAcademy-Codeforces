import React, { ReactElement } from "react";
import styled, { keyframes } from "styled-components";
import { AppTab } from "../navigation/ServiceNavigation";

interface Props {
  kind: AppTab;
  size?: number;
}

const glowPulse = keyframes`
  0%, 100% { filter: drop-shadow(0 0 8px var(--cf-glow)); }
  50% { filter: drop-shadow(0 0 22px var(--cf-glow)) drop-shadow(0 0 36px var(--cf-secondary-glow)); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const ringBreathe = keyframes`
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.035); }
`;

const gojoShimmer = keyframes`
  0%, 100% { stroke-dashoffset: 0; opacity: 0.55; }
  50% { stroke-dashoffset: 24; opacity: 1; }
`;

const rinneganWave = keyframes`
  0% { opacity: 0.35; }
  40% { opacity: 1; }
  100% { opacity: 0.35; }
`;

const Frame = styled.svg<{ $size: number }>`
  display: block;
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  overflow: visible;
  color: var(--cf-accent-bright);
  animation: ${glowPulse} 4.8s ease-in-out infinite;

  .soft {
    opacity: 0.38;
  }

  .hot {
    color: var(--cf-secondary);
  }

  .spin {
    transform-box: view-box;
    transform-origin: 50px 50px;
    animation: ${spin} 12s linear infinite;
  }

  .spin-slow {
    transform-box: view-box;
    transform-origin: 50px 50px;
    animation: ${spin} 26s linear infinite;
  }

  .breathe {
    transform-box: view-box;
    transform-origin: 50px 50px;
    animation: ${ringBreathe} 3.4s ease-in-out infinite;
  }

  .shimmer {
    stroke-dasharray: 8 10;
    animation: ${gojoShimmer} 3.2s ease-in-out infinite;
  }

  .ripple {
    animation: ${rinneganWave} 2.8s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    .spin,
    .spin-slow,
    .breathe,
    .shimmer,
    .ripple {
      animation: none;
    }
  }
`;

/** Madara Eternal Mangekyō — circular iris only */
const MadaraIris: React.FC = (): ReactElement => {
  const cx = 50;
  const cy = 50;
  const r = 42;
  const blade = `M0 ${-r * 0.1}
    C${r * 0.2} ${-r * 0.32} ${r * 0.24} ${-r * 0.68} 0 ${-r * 0.9}
    C${-r * 0.09} ${-r * 0.68} ${-r * 0.14} ${-r * 0.38} ${-r * 0.07} ${-r * 0.16}
    C${-r * 0.02} ${-r * 0.1} ${r * 0.02} ${-r * 0.08} 0 ${-r * 0.1}Z`;

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth={2.8} />
      <circle
        className="soft"
        cx={cx}
        cy={cy}
        r={r * 0.9}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
      />
      <g className="spin">
        {[0, 90, 180, 270].map((angle: number) => (
          <g key={angle} transform={`translate(${cx} ${cy}) rotate(${angle})`}>
            <path
              d={blade}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="soft"
              d={`M${r * 0.05} ${-r * 0.2} C${r * 0.14} ${-r * 0.4} ${r * 0.12} ${-r * 0.62} ${r * 0.03} ${-r * 0.78}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.2}
              strokeLinecap="round"
            />
          </g>
        ))}
      </g>
      <circle
        className="hot breathe"
        cx={cx}
        cy={cy}
        r={r * 0.26}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      />
      <circle cx={cx} cy={cy} r={r * 0.12} fill="none" stroke="currentColor" strokeWidth={2.2} />
      <circle cx={cx} cy={cy} r={r * 0.05} fill="currentColor" />
    </g>
  );
};

/** Gojo Six Eyes — concentric rings */
const GojoIris: React.FC = (): ReactElement => {
  const cx = 50;
  const cy = 50;
  return (
    <g>
      <circle cx={cx} cy={cy} r={42} fill="none" stroke="currentColor" strokeWidth={2.5} />
      <g className="breathe">
        {[34, 26, 18, 11].map((radius: number, i: number) => (
          <circle
            key={radius}
            className={i % 2 === 1 ? "hot shimmer" : "shimmer"}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={i === 0 ? 2 : 1.35}
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </g>
      <polygon
        className="soft"
        points={[0, 1, 2, 3, 4, 5]
          .map((i: number) => {
            const rad = ((i * 60 - 90) * Math.PI) / 180;
            return `${cx + Math.cos(rad) * 20},${cy + Math.sin(rad) * 20}`;
          })
          .join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.15}
      />
      {[0, 45, 90, 135].map((deg: number) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            className="soft"
            x1={cx + Math.cos(rad) * 8}
            y1={cy + Math.sin(rad) * 8}
            x2={cx + Math.cos(rad) * 38}
            y2={cy + Math.sin(rad) * 38}
            stroke="currentColor"
            strokeWidth={1.1}
            strokeLinecap="round"
          />
        );
      })}
      <circle className="hot" cx={cx} cy={cy} r={3.4} fill="currentColor" />
    </g>
  );
};

/** Rinnegan — ripple rings */
const RinneganIris: React.FC = (): ReactElement => {
  const cx = 50;
  const cy = 50;
  const r = 42;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth={2.6} />
      <g className="spin-slow">
        {[0.84, 0.68, 0.52, 0.36, 0.22].map((scale: number, i: number) => (
          <circle
            key={scale}
            className={i % 2 === 0 ? "ripple" : "soft"}
            cx={cx}
            cy={cy}
            r={r * scale}
            fill="none"
            stroke="currentColor"
            strokeWidth={i === 0 ? 1.7 : 1.25}
            style={{ animationDelay: `${i * 0.22}s` }}
          />
        ))}
        {Array.from({ length: 16 }, (_, i: number) => {
          const rad = (i * 22.5 * Math.PI) / 180;
          return (
            <line
              key={i}
              className="soft"
              x1={cx + Math.cos(rad) * r * 0.9}
              y1={cy + Math.sin(rad) * r * 0.9}
              x2={cx + Math.cos(rad) * r}
              y2={cy + Math.sin(rad) * r}
              stroke="currentColor"
              strokeWidth={1.2}
              strokeLinecap="round"
            />
          );
        })}
      </g>
      <circle cx={cx} cy={cy} r={6} fill="none" stroke="currentColor" strokeWidth={2} />
      <circle className="hot" cx={cx} cy={cy} r={2.5} fill="currentColor" />
    </g>
  );
};

export const MangaEyes: React.FC<Props> = ({
  kind,
  size = 120,
}): ReactElement => (
  <Frame viewBox="0 0 100 100" $size={size} aria-hidden="true">
    {kind === "randomizer" ? <MadaraIris /> : null}
    {kind === "crossAnalysis" ? <GojoIris /> : null}
    {kind === "contestBuilder" ? <RinneganIris /> : null}
  </Frame>
);

export default MangaEyes;
