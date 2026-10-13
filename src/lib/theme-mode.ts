import { getLightModeAccent, getContrastTextColor } from "./theme";

export type ThemeMode = "dark" | "light";

export function getInitialThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("theme_mode");
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

/**
 * Spawns an expanding phosphor laser ring effect at coordinates (x, y).
 */
function spawnModeLaserRing(x: number, y: number, color: string) {
  if (typeof document === "undefined") return;
  const ring = document.createElement("div");
  ring.className = "terminal-theme-ripple";
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  ring.style.borderColor = color;
  document.body.appendChild(ring);
  setTimeout(() => {
    ring.remove();
  }, 700);
}

/**
 * Toggles theme between 'dark' and 'light' with View Transitions circular reveal animation.
 */
export function toggleThemeWithAnimation(
  event?: React.MouseEvent | { clientX: number; clientY: number }
): ThemeMode {
  if (typeof document === "undefined") return "dark";

  const isCurrentDark = !document.documentElement.classList.contains("light");
  const nextMode: ThemeMode = isCurrentDark ? "light" : "dark";

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
  spawnModeLaserRing(x, y, nextMode === "light" ? "#111827" : "var(--accent, #38bdf8)");

  const applyMode = () => {
    if (nextMode === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }

    try {
      const currentAccent =
        document.documentElement.style.getPropertyValue("--accent") ||
        "#10b981";
      const lightAccent = getLightModeAccent(currentAccent);
      const contrastText = getContrastTextColor(lightAccent);
      document.documentElement.style.setProperty("--accent-light", lightAccent);
      document.documentElement.style.setProperty("--accent-contrast", contrastText);
      localStorage.setItem("theme_mode", nextMode);
    } catch {
      // localStorage may fail in private mode
    }
    window.dispatchEvent(
      new CustomEvent("theme-mode-change", { detail: { mode: nextMode } })
    );
  };

  const doc = document as any;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (doc.startViewTransition && !prefersReducedMotion) {
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      applyMode();
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        [
          {
            clipPath: `circle(0px at ${x}px ${y}px)`,
            filter: "brightness(1.25) contrast(1.05)",
          },
          {
            clipPath: `circle(${endRadius}px at ${x}px ${y}px)`,
            filter: "brightness(1) contrast(1)",
          },
        ],
        {
          duration: 500,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  } else {
    applyMode();
  }

  return nextMode;
}
