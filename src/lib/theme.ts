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

export const DEFAULT_ACCENT = "#10b981";

export function parseHex(hex: string): { r: number; g: number; b: number } | null {
  let c = hex.replace(/^#/, "").trim();
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  if (c.length !== 6) return null;
  const num = parseInt(c, 16);
  if (isNaN(num)) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function getLuminance(r: number, g: number, b: number): number {
  const toLinear = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

const PRESET_LIGHT_MAP: Record<string, string> = {
  "#ffffff": "#000000",
  "#38bdf8": "#0369a1",
  "#f59e0b": "#b45309",
  "#10b981": "#047857",
  "#06b6d4": "#0e7490",
  "#a855f7": "#7e22ce",
  "#84cc16": "#4d7c0f",
  "#f97316": "#c2410c",
  "#f43f5e": "#be123c",
};

/**
 * Calculates a high-contrast accent color suitable for light mode (white background #ffffff).
 * If the accent color is white (#ffffff) or near-white (luminance > 0.75), it adapts to stark black (#000000)
 * to maintain crisp typography, high readability, and clean box borders.
 */
export function getLightModeAccent(hex: string): string {
  const normalized = hex.toLowerCase().trim();
  if (PRESET_LIGHT_MAP[normalized]) return PRESET_LIGHT_MAP[normalized];

  const rgb = parseHex(hex);
  if (!rgb) return "#000000";

  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  // Pure white or near-white adapts to stark black ink in light mode
  if (lum > 0.75 || (rgb.r > 235 && rgb.g > 235 && rgb.b > 235)) {
    return "#000000";
  }

  // If contrast against white (#ffffff) is already >= 4.5:1 (luminance <= 0.183)
  if (lum <= 0.183) {
    return hex;
  }

  // Proportionally darken to guarantee >= 4.5:1 contrast on white paper background
  let { r, g, b } = rgb;
  for (let i = 0; i < 25; i++) {
    r *= 0.88;
    g *= 0.88;
    b *= 0.88;
    if (getLuminance(r, g, b) <= 0.183) break;
  }
  const pad = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${pad(r)}${pad(g)}${pad(b)}`;
}

/**
 * Returns either #ffffff or #000000 for text displayed inside a solid accent background.
 */
export function getContrastTextColor(bgHex: string): string {
  const rgb = parseHex(bgHex);
  if (!rgb) return "#ffffff";
  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  return lum > 0.5 ? "#000000" : "#ffffff";
}

export function isValidHexColor(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

export function applyAccentColor(hex: string) {
  if (typeof window === "undefined") return;
  const validHex = hex.trim();
  const lightAccent = getLightModeAccent(validHex);
  const contrastText = getContrastTextColor(lightAccent);

  document.documentElement.style.setProperty("--accent", validHex);
  document.documentElement.style.setProperty("--accent-light", lightAccent);
  document.documentElement.style.setProperty("--accent-contrast", contrastText);

  try {
    localStorage.removeItem("theme_accent");
  } catch {
    // localStorage might be unavailable
  }
  window.dispatchEvent(
    new CustomEvent("accent-color-change", {
      detail: { hex: validHex, lightAccent, contrastText },
    })
  );
}

export function getSavedAccentColor(): string | null {
  if (typeof window === "undefined") return null;
  const current = document.documentElement.style.getPropertyValue("--accent");
  return current ? current.trim() : null;
}

/**
 * Spawns an expanding phosphor laser ring effect at coordinates (x, y).
 */
function spawnPhosphorLaserRing(x: number, y: number, hex: string) {
  if (typeof document === "undefined") return;
  const isLight = document.documentElement.classList.contains("light");
  const effectiveColor = isLight ? getLightModeAccent(hex) : hex;
  const ring = document.createElement("div");
  ring.className = "terminal-theme-ripple";
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  ring.style.borderColor = effectiveColor;
  document.body.appendChild(ring);
  setTimeout(() => {
    ring.remove();
  }, 700);
}

/**
 * Switches theme with a circular reveal animation expanding outward from the user's cursor / touch point.
 */
export function switchThemeWithAnimation(
  newHex: string,
  event?: React.MouseEvent | { clientX: number; clientY: number }
) {
  if (typeof window === "undefined") return;

  const validHex = newHex.trim();
  if (!isValidHexColor(validHex)) return;

  // Resolve click coordinates (fallback to viewport center if invoked via keyboard)
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;

  if (event && typeof event.clientX === "number" && typeof event.clientY === "number") {
    if (
      event.clientX === 0 &&
      event.clientY === 0 &&
      "currentTarget" in event &&
      (event.currentTarget as HTMLElement)?.getBoundingClientRect
    ) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else if (event.clientX !== 0 || event.clientY !== 0) {
      x = event.clientX;
      y = event.clientY;
    }
  }

  // Spawn visual phosphor pulse ring
  spawnPhosphorLaserRing(x, y, validHex);

  // If browser supports View Transitions API and motion is not reduced
  const doc = document as any;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (doc.startViewTransition && !prefersReducedMotion) {
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      applyAccentColor(validHex);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        [
          {
            clipPath: `circle(0px at ${x}px ${y}px)`,
            filter: "brightness(1.3) contrast(1.05)",
          },
          {
            clipPath: `circle(${endRadius}px at ${x}px ${y}px)`,
            filter: "brightness(1) contrast(1)",
          },
        ],
        {
          duration: 480,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  } else {
    applyAccentColor(validHex);
  }
}

/**
 * Cycles to the next preset color in order with the expanding reveal animation.
 */
export function cycleNextAccent(
  currentHex: string,
  event?: React.MouseEvent | { clientX: number; clientY: number }
): string {
  const currentIndex = ACCENT_PRESETS.findIndex(
    (p) => p.hex.toLowerCase() === currentHex.toLowerCase()
  );
  const nextIndex = (currentIndex + 1) % ACCENT_PRESETS.length;
  const nextPreset = ACCENT_PRESETS[nextIndex];
  switchThemeWithAnimation(nextPreset.hex, event);
  return nextPreset.hex;
}
