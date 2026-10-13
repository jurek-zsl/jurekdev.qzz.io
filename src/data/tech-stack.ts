export type TechCategory =
  | "Systems & OS Tooling"
  | "Game Dev & Real-Time"
  | "Browser Extensions & Automation"
  | "Desktop Modding & Theming"
  | "Fullstack & Cloud"
  | "Languages & Runtimes";

export interface TechItem {
  name: string;
  category: TechCategory;
  proficiency: "Expert" | "Advanced" | "Proficient";
  description: string;
  tag?: string;
}

export const TECH_STACK: TechItem[] = [
  // Systems & OS Tooling
  {
    name: "Go (CLI & TUI)",
    category: "Systems & OS Tooling",
    proficiency: "Expert",
    description: "Interactive terminal user interfaces, bubbletea/tview, concurrent file chunk streaming, process managers",
    tag: "ohio-cli, vellum",
  },
  {
    name: "macOS Darwin & xattr",
    category: "Systems & OS Tooling",
    proficiency: "Expert",
    description: "macOS extended attributes, Gatekeeper quarantine removal, Darwin sys/xattr syscalls",
    tag: "homebrew-antiQuarantine",
  },
  {
    name: "Homebrew Packaging",
    category: "Systems & OS Tooling",
    proficiency: "Advanced",
    description: "Custom Homebrew taps, Ruby formula authoring, automated binary release pipelines",
    tag: "jurek-zsl/tap",
  },
  {
    name: "AppleScript & Automator",
    category: "Systems & OS Tooling",
    proficiency: "Advanced",
    description: "Native macOS Finder context menu actions, workflow automation, POSIX path resolving",
    tag: "CreateNewFile-macOS",
  },
  {
    name: "Linux & Bash / Zsh",
    category: "Systems & OS Tooling",
    proficiency: "Advanced",
    description: "Debian & Arch Linux administration, subprocess group isolation (PGID), cron & log rotation daemons",
    tag: "vellum",
  },
  {
    name: "Windows DWM & Mica",
    category: "Systems & OS Tooling",
    proficiency: "Advanced",
    description: "Desktop Window Manager composition, Acrylic/Mica hardware blur, MicaForEveryone hook integration",
    tag: "MumbleMica",
  },

  // Game Dev & Real-Time
  {
    name: "Multiplayer Game Engines",
    category: "Game Dev & Real-Time",
    proficiency: "Advanced",
    description: "60 FPS authoritative server loop, collision detection, classes and projectile combat",
    tag: "openclock",
  },
  {
    name: "WebSockets & Netcode",
    category: "Game Dev & Real-Time",
    proficiency: "Expert",
    description: "Delta state compression, client-side interpolation, zero-latency local area network sync",
    tag: "openclock, simpleOnlineChat",
  },
  {
    name: "HTML5 Canvas 2D",
    category: "Game Dev & Real-Time",
    proficiency: "Advanced",
    description: "Custom retro/cyberpunk 2D renderers, camera tracking, dynamic sprite animations",
    tag: "openclock",
  },
  {
    name: "Zero-Config LAN Hosting",
    category: "Game Dev & Real-Time",
    proficiency: "Expert",
    description: "Self-contained portable execution (.bat/.sh scripts), offline school network playability",
    tag: "openclock",
  },

  // Browser Extensions & Automation
  {
    name: "Manifest V3 Extensions",
    category: "Browser Extensions & Automation",
    proficiency: "Expert",
    description: "Chrome and Firefox extension development, background service workers, content script isolation",
    tag: "jebacInstaling, add2ott",
  },
  {
    name: "DOM Reverse Engineering",
    category: "Browser Extensions & Automation",
    proficiency: "Expert",
    description: "Dynamic DOM mutation analysis, automated problem solvers, anti-detection human typing cadence",
    tag: "jebacInstaling",
  },
  {
    name: "API & Webhook Client Sync",
    category: "Browser Extensions & Automation",
    proficiency: "Advanced",
    description: "Reverse-engineered educational platform APIs, offline lexical databases, cross-browser injection",
    tag: "instaling.jurekzsl.lol",
  },
  {
    name: "YouTube & Video Sync",
    category: "Browser Extensions & Automation",
    proficiency: "Advanced",
    description: "DOM media element overrides, OpenTogetherTube room synchronizer, native player controls enabler",
    tag: "add2ott",
  },

  // Desktop Modding & Theming
  {
    name: "Qt Style Sheets (QSS)",
    category: "Desktop Modding & Theming",
    proficiency: "Expert",
    description: "Deep Qt client styling, high-contrast typography, high-DPI Windows 11 window styling",
    tag: "MumbleMica",
  },
  {
    name: "Electron App Modding",
    category: "Desktop Modding & Theming",
    proficiency: "Advanced",
    description: "Desktop runtime webview injection, custom IPC messaging layers, hotkey accelerators",
    tag: "Wand-Enhancer",
  },
  {
    name: "Jellyfin Media Theming",
    category: "Desktop Modding & Theming",
    proficiency: "Expert",
    description: "Catppuccin color palette adaptation, TUI-inspired media browser styling, custom CSS architectures",
    tag: "cattyfin",
  },

  // Fullstack & Cloud
  {
    name: "TypeScript & JavaScript",
    category: "Fullstack & Cloud",
    proficiency: "Expert",
    description: "Modern ESNext, Node.js runtimes, strict typing, functional utilities and reactive state",
  },
  {
    name: "Next.js 15 & React 19",
    category: "Fullstack & Cloud",
    proficiency: "Expert",
    description: "App Router, Server Components, client state machines, Tailwind CSS v4, dynamic SEO",
  },
  {
    name: "Cloud Storage Architectures",
    category: "Fullstack & Cloud",
    proficiency: "Advanced",
    description: "Chunked streaming file pipelines, token-based authentication, OhioFiles Cloud ecosystem",
    tag: "ohiofiles.cloud",
  },
  {
    name: "Tailwind CSS & TUI UI",
    category: "Fullstack & Cloud",
    proficiency: "Expert",
    description: "Pure monospace layouts, 3-color minimalist contrast, box-drawing window borders",
  },
];

