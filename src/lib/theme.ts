export interface AccentPreset {
  id: string;
  name: string;
  hex: string;
  asciiTag: string;
  description: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  {
    id: "sky",
    name: "Sky Light Blue",
    hex: "#38bdf8",
    asciiTag: "SKY",
    description: "Default minimalist calm cyan-blue accent",
  },
  {
    id: "amber",
    name: "Terminal Amber",
    hex: "#f59e0b",
    asciiTag: "AMBER",
    description: "Classic VT220 phosphor amber CRT warmth",
  },
  {
    id: "matrix",
    name: "Matrix Emerald",
    hex: "#10b981",
    asciiTag: "MATRIX",
    description: "High-contrast phosphor green cyber terminal",
  },
  {
    id: "cyan",
    name: "Deep Cyan",
    hex: "#06b6d4",
    asciiTag: "CYAN",
    description: "Electrified neon cyan digital telemetry",
  },
  {
    id: "violet",
    name: "Cyber Violet",
    hex: "#a855f7",
    asciiTag: "VIOLET",
    description: "Synthwave cyberpunk deep purple contrast",
  },
  {
    id: "lime",
    name: "Phosphor Lime",
    hex: "#84cc16",
    asciiTag: "LIME",
    description: "Acid green monochromatic radar glow",
  },
  {
    id: "orange",
    name: "Solar Orange",
    hex: "#f97316",
    asciiTag: "ORANGE",
    description: "High-visibility warning & industrial telemetry",
  },
  {
    id: "rose",
    name: "Crimson Rose",
    hex: "#f43f5e",
    asciiTag: "ROSE",
    description: "Aggressive neon red kernel panic alert",
  },
  {
    id: "mono",
    name: "Pure White",
    hex: "#ffffff",
    asciiTag: "WHITE",
    description: "Ultra-clean stark monochrome contrast",
  },
];

export const DEFAULT_ACCENT = "#38bdf8";

export function isValidHexColor(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

export function applyAccentColor(hex: string) {
  if (typeof window === "undefined") return;
  const validHex = hex.trim();
  document.documentElement.style.setProperty("--accent", validHex);
  try {
    localStorage.setItem("theme_accent", validHex);
  } catch {
    // localStorage might be unavailable
  }
  window.dispatchEvent(new CustomEvent("accent-color-change", { detail: { hex: validHex } }));
}

export function getSavedAccentColor(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("theme_accent");
  } catch {
    return null;
  }
}
