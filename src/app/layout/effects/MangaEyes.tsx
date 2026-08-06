import React, { ReactElement } from "react";
import styled, { keyframes } from "styled-components";
import { AppTab } from "../navigation/ServiceNavigation";

interface Props {
  kind: AppTab;
  size?: number;
}

const auraPulse = keyframes`
  0%, 100% { filter: drop-shadow(0 0 6px var(--cf-glow)); }
  50% { filter: drop-shadow(0 0 18px var(--cf-glow)) drop-shadow(0 0 34px var(--cf-secondary-glow)); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const counterSpin = keyframes`
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
`;

const dilate = keyframes`
  0%, 100% { transform: scale(1); }
  45% { transform: scale(0.82); }
  60% { transform: scale(1.06); }
`;

const rippleOut = keyframes`
  0% { transform: scale(0.32); opacity: 0; }
  25% { opacity: 0.85; }
  100% { transform: scale(1); opacity: 0; }
`;

const sheen = keyframes`
  0%, 100% { opacity: 0.35; transform: translate(0, 0); }
  50% { opacity: 0.8; transform: translate(2px, -2px); }
`;

const Frame = styled.svg<{ $size: number }>`
  display: block;
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  overflow: visible;
  animation: ${auraPulse} 5s ease-in-out infinite;

  .spin {
    transform-box: view-box;
    transform-origin: 50px 50px;
    animation: ${spin} 16s linear infinite;
  }

  .spin-rev {
    transform-box: view-box;
    transform-origin: 50px 50px;
    animation: ${counterSpin} 30s linear infinite;
  }

  .pupil {
    transform-box: view-box;
    transform-origin: 50px 50px;
    animation: ${dilate} 6s ease-in-out infinite;
  }

  .ripple {
    transform-box: view-box;
    transform-origin: 50px 50px;
    animation: ${rippleOut} 3.4s ease-out infinite;
  }

  .sheen {
    animation: ${sheen} 4.5s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    .spin,
    .spin-rev,
    .pupil,
    .ripple,
    .sheen {
      animation: none;
    }
  }
`;

/** Dark sclera bowl + rim shared by every iris */
const EyeBall: React.FC<{ id: string }> = ({ id }): ReactElement => (
  <g>
    <circle cx={50} cy={50} r={46} fill={`url(#${id}-bowl)`} />
    <circle
      cx={50}
      cy={50}
      r={46}
      fill="none"
      stroke="var(--cf-accent-deep)"
      strokeWidth={1.6}
      opacity={0.9}
    />
  </g>
);

/** Glass highlight so the eye reads as a sphere, not a flat disc */
const Highlight: React.FC = (): ReactElement => (
  <g className="sheen">
    <ellipse cx={36} cy={32} rx={13} ry={9} fill="#ffffff" opacity={0.22} transform="rotate(-28 36 32)" />
    <ellipse cx={62} cy={68} rx={7} ry={4} fill="#ffffff" opacity={0.09} transform="rotate(-28 62 68)" />
  </g>
);

/** Madara Eternal Mangekyō Sharingan */
const MadaraIris: React.FC = (): ReactElement => {
  const id = "eye-madara";
  // one curved pinwheel blade, repeated 4x
  const blade = `M0 -6
    C10 -12 20 -22 15 -36
    C10 -30 2 -26 -3 -20
    C-6 -15 -6 -10 0 -6Z`;

  return (
    <g>
      <defs>
        <radialGradient id={`${id}-bowl`} cx="38%" cy="32%">
          <stop offset="0%" stopColor="#3d0a12" />
          <stop offset="65%" stopColor="#1a0407" />
          <stop offset="100%" stopColor="#080203" />
        </radialGradient>
        <radialGradient id={`${id}-iris`} cx="40%" cy="34%">
          <stop offset="0%" stopColor="#ff5a6e" />
          <stop offset="45%" stopColor="#e01838" />
          <stop offset="100%" stopColor="#7d0518" />
        </radialGradient>
        <filter id={`${id}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <EyeBall id={id} />

      <circle cx={50} cy={50} r={35} fill={`url(#${id}-iris)`} />
      <circle
        cx={50}
        cy={50}
        r={35}
        fill="none"
        stroke="#ff8a99"
        strokeWidth={1.2}
        opacity={0.5}
      />

      {/* pinwheel */}
      <g className="spin" filter={`url(#${id}-glow)`}>
        {[0, 90, 180, 270].map((angle: number) => (
          <path
            key={angle}
            d={blade}
            transform={`translate(50 50) rotate(${angle})`}
            fill="#12000a"
          />
        ))}
        <circle cx={50} cy={50} r={13} fill="#12000a" />
      </g>

      {/* pupil */}
      <g className="pupil">
        <circle cx={50} cy={50} r={9} fill="#0a0003" />
        <circle
          cx={50}
          cy={50}
          r={9}
          fill="none"
          stroke="#ff5a6e"
          strokeWidth={1.4}
          opacity={0.75}
        />
      </g>

      <Highlight />
    </g>
  );
};

/** Gojo Satoru — Six Eyes */
const GojoIris: React.FC = (): ReactElement => {
  const id = "eye-gojo";
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-bowl`} cx="38%" cy="32%">
          <stop offset="0%" stopColor="#0b3a48" />
          <stop offset="65%" stopColor="#04141c" />
          <stop offset="100%" stopColor="#01070b" />
        </radialGradient>
        <radialGradient id={`${id}-iris`} cx="40%" cy="32%">
          <stop offset="0%" stopColor="#d7fbff" />
          <stop offset="30%" stopColor="#5fe3ff" />
          <stop offset="70%" stopColor="#12a3c9" />
          <stop offset="100%" stopColor="#063e56" />
        </radialGradient>
        <radialGradient id={`${id}-core`} cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#8ceeff" />
          <stop offset="100%" stopColor="#1b9fc4" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-glow`} x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <EyeBall id={id} />

      <circle cx={50} cy={50} r={36} fill={`url(#${id}-iris)`} />

      {/* concentric limitless rings */}
      <g className="spin-rev" filter={`url(#${id}-glow)`}>
        {[30, 23, 16].map((radius: number, i: number) => (
          <circle
            key={radius}
            cx={50}
            cy={50}
            r={radius}
            fill="none"
            stroke="#e8fdff"
            strokeWidth={i === 0 ? 1.7 : 1.2}
            opacity={0.55 - i * 0.1}
            strokeDasharray={i === 1 ? "7 5" : undefined}
          />
        ))}
      </g>

      {/* expanding infinity ripples */}
      {[0, 1.7].map((delay: number) => (
        <circle
          key={delay}
          className="ripple"
          cx={50}
          cy={50}
          r={34}
          fill="none"
          stroke="#bff5ff"
          strokeWidth={1.6}
          style={{ animationDelay: `${delay}s` }}
        />
      ))}

      <circle cx={50} cy={50} r={20} fill={`url(#${id}-core)`} opacity={0.85} />

      <g className="pupil">
        <ellipse cx={50} cy={50} rx={5.5} ry={11} fill="#04222e" />
        <ellipse
          cx={50}
          cy={50}
          rx={5.5}
          ry={11}
          fill="none"
          stroke="#d7fbff"
          strokeWidth={1.1}
          opacity={0.7}
        />
      </g>

      <Highlight />
    </g>
  );
};

/** Rinnegan — Madara's ripple eye */
const RinneganIris: React.FC = (): ReactElement => {
  const id = "eye-rinnegan";
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-bowl`} cx="38%" cy="32%">
          <stop offset="0%" stopColor="#2b1150" />
          <stop offset="65%" stopColor="#120724" />
          <stop offset="100%" stopColor="#06030d" />
        </radialGradient>
        <radialGradient id={`${id}-iris`} cx="40%" cy="34%">
          <stop offset="0%" stopColor="#e3c8ff" />
          <stop offset="35%" stopColor="#a678ff" />
          <stop offset="75%" stopColor="#6b34c9" />
          <stop offset="100%" stopColor="#2d1160" />
        </radialGradient>
        <filter id={`${id}-glow`} x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <EyeBall id={id} />

      <circle cx={50} cy={50} r={36} fill={`url(#${id}-iris)`} />

      {/* ripple rings — the defining Rinnegan pattern */}
      <g filter={`url(#${id}-glow)`}>
        {[31, 25, 19, 13].map((radius: number, i: number) => (
          <circle
            key={radius}
            cx={50}
            cy={50}
            r={radius}
            fill="none"
            stroke="#1c0b38"
            strokeWidth={2}
            opacity={0.85 - i * 0.06}
          />
        ))}
        {[31, 25, 19, 13].map((radius: number) => (
          <circle
            key={`h-${radius}`}
            cx={50}
            cy={50}
            r={radius - 1}
            fill="none"
            stroke="#d9bcff"
            strokeWidth={0.6}
            opacity={0.3}
          />
        ))}
      </g>

      {[0, 1.7].map((delay: number) => (
        <circle
          key={delay}
          className="ripple"
          cx={50}
          cy={50}
          r={35}
          fill="none"
          stroke="#d9bcff"
          strokeWidth={1.4}
          style={{ animationDelay: `${delay}s` }}
        />
      ))}

      <g className="pupil">
        <circle cx={50} cy={50} r={7} fill="#14062c" />
        <circle
          cx={50}
          cy={50}
          r={7}
          fill="none"
          stroke="#e3c8ff"
          strokeWidth={1.2}
          opacity={0.75}
        />
      </g>

      <Highlight />
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
