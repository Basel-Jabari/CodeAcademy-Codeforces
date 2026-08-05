import React, { ReactElement } from "react";
import styled, { keyframes } from "styled-components";
import { AppTab } from "../tabs/TabBar";

interface EyeProps {
  kind: AppTab;
  compact?: boolean;
  className?: string;
}

export const EyeSigil: React.FC<EyeProps> = (props: EyeProps): ReactElement => {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as "round",
    strokeLinejoin: "round" as "round",
  };
  return (
    <svg className={props.className} width={props.compact ? 46 : 220} height={props.compact ? 28 : 120} viewBox="0 0 220 120" role={props.compact ? "img" : undefined} aria-label={props.compact ? `${props.kind} eye sigil` : undefined} aria-hidden={props.compact ? undefined : true}>
      <path {...common} strokeWidth="2.4" d="M12 63 C44 25 82 17 111 23 C151 15 187 34 208 60 C180 89 148 101 110 94 C72 102 39 88 12 63Z" />
      <path {...common} strokeWidth="1.2" opacity=".55" d="M18 61 C54 75 77 80 109 78 C148 81 175 73 202 61" />
      {props.kind === "randomizer" ? <g><circle {...common} strokeWidth="2" cx="110" cy="59" r="31" /><circle {...common} strokeWidth="1.7" cx="110" cy="59" r="8" /><path {...common} strokeWidth="3" d="M110 29 C122 39 126 47 121 58 C132 53 143 54 154 61 C141 67 132 72 121 66 C124 78 119 88 109 91 C107 76 102 69 94 65 C86 73 76 75 66 70 C80 60 87 56 98 58 C93 47 97 37 110 29Z" /><path {...common} strokeWidth="1.5" opacity=".8" d="M56 14 L45 45 M67 12 L56 48 M78 14 L68 47" /></g> : null}
      {props.kind === "crossAnalysis" ? <g><circle {...common} strokeWidth="1.8" cx="110" cy="59" r="33" /><circle {...common} strokeWidth="1.3" cx="110" cy="59" r="25" /><circle {...common} strokeWidth="1.2" cx="110" cy="59" r="15" /><path {...common} strokeWidth="1.2" d="M110 26V42 M110 76V92 M77 59H93 M127 59H143 M87 36L98 47 M133 36L122 47 M87 82L98 71 M133 82L122 71" /><path {...common} strokeWidth="2" opacity=".75" d="M20 91 C50 77 72 89 98 82 C127 74 151 90 200 75" /></g> : null}
      {props.kind === "contestBuilder" ? <g><circle {...common} strokeWidth="1.7" cx="110" cy="59" r="34" /><circle {...common} strokeWidth="1.4" cx="110" cy="59" r="25" /><circle {...common} strokeWidth="1.3" cx="110" cy="59" r="16" /><circle {...common} strokeWidth="1.8" cx="110" cy="59" r="6" /><path {...common} strokeWidth="1.3" d="M76 58 L61 52 M80 40 L69 29 M95 28 L91 13 M125 28 L131 13 M140 40 L152 29 M144 59 L160 53 M89 82 L81 96 M131 82 L140 96" /><path {...common} strokeWidth="2.2" opacity=".75" d="M37 101 L63 84 M183 101 L158 84" /></g> : null}
    </svg>
  );
};

const drift = keyframes`0%,100%{transform:translate3d(0,0,0) scale(1);opacity:.55}50%{transform:translate3d(18px,-24px,0) scale(1.08);opacity:.9}`;
const scan = keyframes`from{transform:translateX(-12%)}to{transform:translateX(12%)}`;

const Backdrop = styled.div<{ $kind: AppTab }>`
  position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; opacity: .95;
  &::before { content:""; position:absolute; inset:-20%; background:radial-gradient(circle at 16% 22%,var(--cf-glow-soft),transparent 25%),radial-gradient(circle at 84% 12%,var(--cf-secondary-glow),transparent 22%),radial-gradient(circle at 52% 92%,var(--cf-glow-soft),transparent 28%); animation:${drift} 16s ease-in-out infinite; }
  &::after { content:""; position:absolute; inset:0; opacity:${p => p.$kind === "crossAnalysis" ? .18 : .11}; background-image:${p => p.$kind === "randomizer" ? "repeating-linear-gradient(118deg,transparent 0 52px,var(--cf-accent) 53px,transparent 54px 105px)" : p.$kind === "crossAnalysis" ? "repeating-radial-gradient(ellipse at 50% 110%,transparent 0 42px,var(--cf-accent) 43px,transparent 45px 74px)" : "repeating-linear-gradient(145deg,transparent 0 74px,var(--cf-accent) 75px,transparent 76px 148px)"}; animation:${scan} 18s ease-in-out infinite alternate; mask-image:linear-gradient(to bottom,transparent,black 30%,black 80%,transparent); }
  @media(prefers-reduced-motion:reduce){&::before,&::after{animation:none}}
`;

const Watermark = styled(EyeSigil)`position:absolute;top:118px;right:max(3vw,24px);width:min(28vw,340px);height:auto;color:var(--cf-accent-bright);opacity:.11;filter:drop-shadow(0 0 20px var(--cf-glow));@media(max-width:760px){top:150px;right:-58px;width:250px;opacity:.07}`;

const copy: { [key in AppTab]: { eyebrow: string; title: string; note: string } } = {
  randomizer:{eyebrow:"Chapter I · Ember",title:"Train the instinct",note:"Shape the constraints. Let chance reveal the next fight."},
  crossAnalysis:{eyebrow:"Chapter II · Tide",title:"Read the field",note:"Every attempt leaves a current. Find the patterns beneath it."},
  contestBuilder:{eyebrow:"Chapter III · Void",title:"Compose the trial",note:"Build with intention. Balance difficulty, variety, and surprise."},
};

const Banner = styled.div`position:relative;z-index:2;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:16px;width:calc(100% - 48px);max-width:1050px;box-sizing:border-box;margin:8px auto 18px;padding:11px 18px;overflow:hidden;background:linear-gradient(100deg,var(--cf-surface),rgba(5,4,7,.42));border:1px solid var(--cf-border);border-left:3px solid var(--cf-accent);border-radius:4px 16px 16px 4px;box-shadow:0 18px 54px rgba(0,0,0,.34),0 0 28px var(--cf-glow-soft);&::after{content:"";position:absolute;right:-40px;width:240px;height:1px;background:linear-gradient(90deg,transparent,var(--cf-accent-bright));transform:rotate(-12deg);box-shadow:0 9px 0 var(--cf-border-bright),0 -9px 0 var(--cf-border-bright);opacity:.5}@media(max-width:620px){width:calc(100% - 24px);grid-template-columns:auto 1fr;padding:10px 12px}`;
const BannerEye = styled(EyeSigil)`color:var(--cf-accent-bright);filter:drop-shadow(0 0 9px var(--cf-glow));`;
const Eyebrow = styled.div`color:var(--cf-accent-bright);font-size:9px;font-weight:700;letter-spacing:2.6px;text-transform:uppercase;`;
const BannerTitle = styled.div`margin-top:2px;color:var(--cf-text);font-size:18px;font-weight:700;letter-spacing:.25px;`;
const Note = styled.div`max-width:370px;color:var(--cf-text-muted);font-size:11px;line-height:1.45;text-align:right;@media(max-width:620px){display:none}`;

export const MangaAtmosphere: React.FC<{kind:AppTab}> = ({kind}):ReactElement => <Backdrop $kind={kind} aria-hidden="true"><Watermark kind={kind}/></Backdrop>;
export const ChapterBanner: React.FC<{kind:AppTab}> = ({kind}):ReactElement => <Banner><BannerEye kind={kind} compact/><div><Eyebrow>{copy[kind].eyebrow}</Eyebrow><BannerTitle>{copy[kind].title}</BannerTitle></div><Note>{copy[kind].note}</Note></Banner>;
