import { AppTab } from "./components/tabs/TabBar";

interface Palette {
  [key: string]: string;
}

export const palettes: { [key in AppTab]: Palette } = {
  randomizer: {
    bg: "#080506", surface: "#150b0d", surfaceHover: "#211014",
    border: "#38151c", borderBright: "#6b2230", text: "#f7ecee",
    textMuted: "#ad858b", accent: "#ed2447", accentBright: "#ff6a58",
    accentDeep: "#6e0b20", secondary: "#ff9a52", danger: "#ff3156",
    success: "#4ade91", warning: "#ffb45c", glow: "rgba(237,36,71,.52)",
    glowSoft: "rgba(237,36,71,.17)", secondaryGlow: "rgba(255,106,88,.42)",
  },
  crossAnalysis: {
    bg: "#04080d", surface: "#091521", surfaceHover: "#0e2133",
    border: "#12324a", borderBright: "#1b5575", text: "#eaf7ff",
    textMuted: "#7fa6bc", accent: "#20a7f5", accentBright: "#75dcff",
    accentDeep: "#075180", secondary: "#29e6d3", danger: "#ff557d",
    success: "#2ee6a8", warning: "#ffd166", glow: "rgba(32,167,245,.50)",
    glowSoft: "rgba(32,167,245,.16)", secondaryGlow: "rgba(41,230,211,.42)",
  },
  contestBuilder: {
    bg: "#07050c", surface: "#120d1d", surfaceHover: "#1c142c",
    border: "#2d2146", borderBright: "#52377b", text: "#f1ebff",
    textMuted: "#9d8dbd", accent: "#925cff", accentBright: "#c79aff",
    accentDeep: "#43207c", secondary: "#e07cff", danger: "#f45d9c",
    success: "#55d98b", warning: "#f6c85f", glow: "rgba(146,92,255,.50)",
    glowSoft: "rgba(146,92,255,.16)", secondaryGlow: "rgba(224,124,255,.38)",
  },
};

export function themeVariables(name: AppTab): { [key: string]: string } {
  const p: Palette = palettes[name];
  return {
    "--cf-bg": p.bg, "--cf-surface": p.surface,
    "--cf-surface-hover": p.surfaceHover, "--cf-border": p.border,
    "--cf-border-bright": p.borderBright, "--cf-text": p.text,
    "--cf-text-muted": p.textMuted, "--cf-accent": p.accent,
    "--cf-accent-bright": p.accentBright, "--cf-accent-deep": p.accentDeep,
    "--cf-secondary": p.secondary, "--cf-danger": p.danger,
    "--cf-success": p.success, "--cf-warning": p.warning,
    "--cf-glow": p.glow, "--cf-glow-soft": p.glowSoft,
    "--cf-secondary-glow": p.secondaryGlow,
    "--cf-danger-glow": "rgba(255,70,110,.40)",
    "--cf-success-glow": "rgba(70,225,145,.30)",
    "--cf-warning-glow": "rgba(255,195,90,.30)",
  };
}
