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

/**
 * Spawns an expanding phosphor laser ring effect at coordinates (x, y).
 */
function spawnPhosphorLaserRing(x: number, y: number, hex: string) {
  if (typeof document === "undefined") return;
  const ring = document.createElement("div");
  ring.className = "terminal-theme-ripple";
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  ring.style.borderColor = hex;
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
