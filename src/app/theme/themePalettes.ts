import { AppTab } from "../layout/navigation/ServiceNavigation";

interface Palette {
  [key: string]: string;
}

export const palettes: { [key in AppTab]: Palette } = {
  randomizer: {
    bg: "#080506",
    surface: "#150b0d",
    surfaceHover: "#211014",
    border: "#38151c",
    borderBright: "#6b2230",
    text: "#f7ecee",
    textMuted: "#ad858b",
    accent: "#ed2447",
    accentBright: "#ff6a58",
    accentDeep: "#6e0b20",
    secondary: "#ff9a52",
    danger: "#ff3156",
    success: "#4ade91",
    warning: "#ffb45c",
    glow: "rgba(237,36,71,.52)",
    glowSoft: "rgba(237,36,71,.17)",
    secondaryGlow: "rgba(255,106,88,.42)",
  },
  crossAnalysis: {
    // sea / ocean teal — deeper and more water-like than electric blue
    bg: "#031016",
    surface: "#071c24",
    surfaceHover: "#0b2a35",
    border: "#0f3d4a",
    borderBright: "#156878",
    text: "#e8f7fa",
    textMuted: "#7ba8b3",
    accent: "#0e7490",
    accentBright: "#22d3ee",
    accentDeep: "#0a4f5f",
    secondary: "#2dd4bf",
    danger: "#ff557d",
    success: "#2ee6a8",
    warning: "#ffd166",
    glow: "rgba(14,116,144,.52)",
    glowSoft: "rgba(14,116,144,.18)",
    secondaryGlow: "rgba(45,212,191,.4)",
  },
  contestBuilder: {
    bg: "#07050c",
    surface: "#120d1d",
    surfaceHover: "#1c142c",
    border: "#2d2146",
    borderBright: "#52377b",
    text: "#f1ebff",
    textMuted: "#9d8dbd",
    accent: "#925cff",
    accentBright: "#c79aff",
    accentDeep: "#43207c",
    secondary: "#e07cff",
    danger: "#f45d9c",
    success: "#55d98b",
    warning: "#f6c85f",
    glow: "rgba(146,92,255,.50)",
    glowSoft: "rgba(146,92,255,.16)",
    secondaryGlow: "rgba(224,124,255,.38)",
  },
};

export function themeVariables(name: AppTab): { [key: string]: string } {
  const p: Palette = palettes[name];
  return {
    "--cf-bg": p.bg,
    "--cf-surface": p.surface,
    "--cf-surface-hover": p.surfaceHover,
    "--cf-border": p.border,
    "--cf-border-bright": p.borderBright,
    "--cf-text": p.text,
    "--cf-text-muted": p.textMuted,
    "--cf-accent": p.accent,
    "--cf-accent-bright": p.accentBright,
    "--cf-accent-deep": p.accentDeep,
    "--cf-secondary": p.secondary,
    "--cf-danger": p.danger,
    "--cf-success": p.success,
    "--cf-warning": p.warning,
    "--cf-glow": p.glow,
    "--cf-glow-soft": p.glowSoft,
    "--cf-secondary-glow": p.secondaryGlow,
    "--cf-danger-glow": "rgba(255,70,110,.40)",
    "--cf-success-glow": "rgba(70,225,145,.30)",
    "--cf-warning-glow": "rgba(255,195,90,.30)",
  };
}
