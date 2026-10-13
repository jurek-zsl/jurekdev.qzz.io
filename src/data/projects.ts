import { Project } from "@/types/project";

export const PROJECTS: Project[] = [
  {
    id: "ohio-cli",
    slug: "ohio-cli",
    title: "Ohio-CLI",
    tagline: "Official Go Terminal Client & TUI for OhioFiles Cloud",
    description:
      "Official CLI client and interactive terminal user interface (TUI) written in Go for managing, syncing, and streaming files with OhioFiles Cloud directly through the command line.",
    category: "systems",
    techStack: ["Go", "TUI", "CLI", "REST API", "Cloud Storage", "Linux/macOS"],
    githubUrl: "https://github.com/jurek-zsl/ohio-cli",
    liveUrl: "https://ohiofiles.cloud/cli",
    stars: 2,
    forks: 0,
    featured: true,
    highlights: [
      "Interactive terminal user interface with keyboard navigation and progress meters",
      "Chunked upload and download pipelining with resume support for large files",
      "Encrypted token authentication and multi-account profile switching",
      "Cross-compiled standalone binaries with zero external runtime dependencies",
    ],
    architecture: {
      overview:
        "Built in Go with a decoupled networking pipeline and terminal view layer. Handles concurrent chunked streaming to OhioFiles cloud endpoints while rendering live transfer speed graphs in the TUI.",
      keyDecisions: [
        "Chose Go for instant CLI execution speed and single-binary distribution",
        "Engineered non-blocking I/O routines so transfer stalls never freeze the terminal cursor",
        "Automated release artifacts via GitHub Actions for Linux (x86/ARM) and macOS",
      ],
      benchmark: "Saturates 1Gbps uplink with negligible CPU usage (< 2% on 8-core host)",
    },
    metrics: [
      { label: "Language", value: "Go 1.23+" },
      { label: "Interface", value: "CLI + TUI" },
      { label: "Distribution", value: "Single Binary" },
      { label: "Ecosystem", value: "OhioFiles Cloud" },
    ],
  },
  {
    id: "homebrew-antiquarantine",
    slug: "homebrew-antiquarantine",
    title: "antiQuarantine CLI",
    tagline: "macOS Extended Attribute Quarantine Stripper & Homebrew Tap",
    description:
      "A fast, native CLI utility written in Go for stripping macOS Gatekeeper 'com.apple.quarantine' extended attributes from downloaded binaries and applications.",
    category: "systems",
    techStack: ["Go", "macOS", "Homebrew", "CLI", "xattr", "Security"],
    githubUrl: "https://github.com/jurek-zsl/homebrew-antiQuarantine",
    stars: 10,
    forks: 0,
    featured: true,
    highlights: [
      "Direct manipulation of macOS xattr flags without requiring slow system dialogs",
      "Available directly via official Homebrew tap (brew install jurek-zsl/tap/antiquarantine)",
      "Batch processing mode recursively walking directories and nested application bundles",
      "10 GitHub stars and active daily usage in developer macOS workflows",
    ],
    architecture: {
      overview:
        "Leverages Darwin system calls to inspect and remove quarantine attributes cleanly. Includes dry-run verification mode and permission safety checks.",
      keyDecisions: [
        "Interfaced with native macOS sys/xattr syscalls to avoid shelling out to /usr/bin/xattr",
        "Packaged with automated Homebrew formula generation and notarization pipelines",
      ],
      benchmark: "Processes 1,000+ nested app bundle files in under 28ms",
    },
    metrics: [
      { label: "Stars", value: "10 ★" },
      { label: "Packaging", value: "Homebrew Tap" },
      { label: "Target OS", value: "macOS Darwin" },
      { label: "Binary Size", value: "< 3.5 MB" },
    ],
  },
  {
    id: "mumble-mica",
    slug: "mumble-mica",
    title: "MumbleMica",
    tagline: "Fluent Acrylic/Mica Custom UI Theme for Mumble VoIP Client",
    description:
      "An advanced custom theme bringing Windows 11 Acrylic and Mica materials to the Mumble open-source voice chat client using MicaForEveryone integration.",
    category: "experiments",
    techStack: ["QSS/CSS", "Windows 11", "Mica", "Mumble", "UI Modding"],
    githubUrl: "https://github.com/jurek-zsl/MumbleMica",
    stars: 9,
    forks: 1,
    featured: true,
    highlights: [
      "Custom Qt style sheet (QSS) engineered for high contrast and modern typography",
      "Native DWM composition hooks enabling hardware-accelerated Mica blur on Windows",
      "9 GitHub stars and community adoption within the open-source voice chat ecosystem",
    ],
    architecture: {
      overview:
        "Combines low-level Qt stylesheet overrides with DWM composition window attributes to produce transparent backdrop acrylic effects without UI lag.",
      keyDecisions: [
        "Restructured Mumble QSS selectors to prevent rendering glitches on high-DPI displays",
        "Coordinated with MicaForEveryone process hooks for seamless titlebar blending",
      ],
    },
    metrics: [
      { label: "Stars", value: "9 ★" },
      { label: "Forks", value: "1" },
      { label: "Platform", value: "Win11 / Qt" },
      { label: "Styling", value: "Mica / QSS" },
    ],
  },
  {
    id: "openclock",
    slug: "openclock",
    title: "OpenClock Brawl .io",
    tagline: "Multiplayer Cyberpunk Brawl LAN Game Engine",
    description:
      "A fast-paced local area network cyberpunk multiplayer brawl game built with JavaScript, WebSockets, and HTML5 Canvas. Zero-config hosting by running a single batch/shell script on any LAN machine.",
    category: "fullstack",
    techStack: ["JavaScript", "Node.js", "WebSockets", "HTML5 Canvas", "Game Dev", "LAN"],
    githubUrl: "https://github.com/jurek-zsl/openclock",
    stars: 1,
    forks: 0,
    featured: true,
    highlights: [
      "Real-time authoritative server architecture handling multiplayer physics at 60 FPS",
      "Multiple character classes, projectile weapon mechanics, and arena game modes",
      "Zero dependencies: instant LAN hosting via a single portable script on any PC",
      "Designed specifically for offline local networks in schools and clubs",
    ],
    architecture: {
      overview:
        "Node.js WebSocket server orchestrates real-time player states, interpolation, and collision detection. Canvas front-end renders retro cyberpunk assets with client-side prediction.",
      keyDecisions: [
        "Implemented delta state synchronization over WebSockets to minimize LAN bandwidth",
        "Standalone self-contained server bundle requiring no external package manager at launch",
      ],
    },
    metrics: [
      { label: "Tick Rate", value: "60 FPS" },
      { label: "Protocol", value: "WebSockets" },
      { label: "Hosting", value: "Zero Config" },
      { label: "Genre", value: "LAN .io Game" },
    ],
  },
  {
    id: "vellum",
    slug: "vellum",
    title: "Vellum Runner",
    tagline: "Go Terminal User Interface for Local Script Management",
    description:
      "A Go-based TUI tool for organizing, executing, and monitoring local automation scripts with real-time stdout/stderr capture, process lifecycle hooks, and automated 7-day log rotation.",
    category: "systems",
    techStack: ["Go", "TUI", "Automation", "Process Management", "Logging"],
    githubUrl: "https://github.com/jurek-zsl/Vellum",
    stars: 0,
    forks: 0,
    featured: false,
    highlights: [
      "Interactive terminal interface with list filtering and status inspection",
      "Non-blocking background process execution with real-time streaming logs",
      "Automated log cleanup with configurable 7-day retention daemon",
    ],
    architecture: {
      overview:
        "Utilizes Go os/exec subprocess wrappers with ring-buffer stdout monitors. TUI event loop provides instantaneous response times during heavy build jobs.",
      keyDecisions: [
        "Isolated child process groups (PGID) to prevent orphan background processes on exit",
        "Deterministic file rotation based on timestamp indices to prevent disk bloat",
      ],
    },
    metrics: [
      { label: "Language", value: "Go" },
      { label: "Interface", value: "TUI" },
      { label: "Cleanup", value: "7-Day Auto" },
    ],
  },
  {
    id: "jebac-instaling",
    slug: "jebac-instaling",
    title: "Instaling Automation Suite",
    tagline: "Cross-Browser Extension & Reverse-Engineered Solver",
    description:
      "High-efficiency browser extension for Chrome and Firefox (Manifest V3) that inspects DOM session structures and automates vocabulary problem solving on learning platforms.",
    category: "opensource",
    techStack: ["JavaScript", "Browser Extension", "Manifest V3", "DOM Automation", "Firefox/Chrome"],
    githubUrl: "https://github.com/jurek-zsl/jebacInstaling",
    liveUrl: "https://instaling.jurekzsl.lol",
    stars: 1,
    forks: 0,
    featured: false,
    highlights: [
      "Manifest V3 compliant content script injection with human-like delay simulation",
      "Local dictionary caching for offline answer lookup and API proxy support",
      "Supported across both Chromium and Mozilla Firefox engines with unified code",
    ],
    architecture: {
      overview:
        "Reverse-engineered learning platform requests, built a client-side lexical database, and injected an ergonomic floating HUD into the page DOM.",
      keyDecisions: [
        "Simulated variable human keystroke cadences to avoid bot detection heuristics",
        "Engineered offline fallback dictionary to operate even when API servers are unreachable",
      ],
    },
    metrics: [
      { label: "Engines", value: "Chrome & Firefox" },
      { label: "Spec", value: "Manifest V3" },
      { label: "Portal", value: "instaling.jurekzsl.lol" },
    ],
  },
  {
    id: "cattyfin",
    slug: "cattyfin",
    title: "Cattyfin",
    tagline: "Catppuccin TUI-Themed Interface for Jellyfin Media Server",
    description:
      "A tailored custom CSS theme for Jellyfin media servers utilizing the beloved Catppuccin color palette with terminal and TUI-inspired aesthetic touches.",
    category: "experiments",
    techStack: ["CSS", "Jellyfin", "Catppuccin", "Media Server", "TUI Design"],
    githubUrl: "https://github.com/jurek-zsl/cattyfin",
    stars: 0,
    forks: 0,
    featured: false,
    highlights: [
      "Complete Jellyfin web client restyling matching Catppuccin Mocha colors",
      "Monospace typography and sharp terminal-style card borders",
      "Lightweight drop-in stylesheet compatible with modern Jellyfin releases",
    ],
    architecture: {
      overview:
        "Overrode Jellyfin's default CSS custom properties and component rules with a focused, readable monospace dark aesthetic.",
      keyDecisions: [
        "Avoided bloated JavaScript injections by utilizing pure CSS variables and transitions",
      ],
    },
    metrics: [
      { label: "Palette", value: "Catppuccin Mocha" },
      { label: "Compatibility", value: "Jellyfin 10.8+" },
    ],
  },
  {
    id: "wand-enhancer",
    slug: "wand-enhancer",
    title: "Wand Enhancer",
    tagline: "Advanced UX & Interoperability Mod for Desktop Applications",
    description:
      "A desktop mod and UX enhancement extension providing custom shortcuts, interoperability interfaces, and power-user workflows for desktop trainer tools.",
    category: "opensource",
    techStack: ["JavaScript", "Electron", "Reverse Engineering", "Desktop Mod"],
    githubUrl: "https://github.com/jurek-zsl/Wand-Enhancer",
    liveUrl: "https://gitlab.com/kitbyte/wand-enhancer",
    stars: 0,
    forks: 0,
    featured: false,
    highlights: [
      "Injected custom IPC hooks into Electron desktop runtime",
      "Ergonomic keyboard shortcuts for rapid game state manipulation",
    ],
    architecture: {
      overview:
        "Patches desktop client webviews to add an advanced command layer and keyboard bindings.",
      keyDecisions: [
        "Used safe runtime monkey-patching to preserve official updates compatibility",
      ],
    },
    metrics: [
      { label: "Runtime", value: "Electron" },
      { label: "Mod Target", value: "Wand / WeMod" },
    ],
  },
  {
    id: "add2ott",
    slug: "add2ott",
    title: "add2ott Extension",
    tagline: "YouTube to OpenTogetherTube Room Synchronizer",
    description:
      "Browser extension for instantly sharing and queueing YouTube videos into OpenTogetherTube watch parties, complete with native media controls enabler.",
    category: "opensource",
    techStack: ["JavaScript", "Browser Extension", "YouTube API", "WebSync"],
    githubUrl: "https://github.com/jurek-zsl/add2ott",
    stars: 0,
    forks: 0,
    featured: false,
    highlights: [
      "One-click action button on YouTube watch pages sending payloads to room websockets",
      "Restores native picture-in-picture and keyboard media shortcuts",
    ],
    architecture: {
      overview:
        "Extracts active video IDs from YouTube history states and communicates directly with OpenTogetherTube REST/WebSocket APIs.",
      keyDecisions: [
        "Lightweight manifest with minimal permissions strictly scoped to relevant hosts",
      ],
    },
    metrics: [
      { label: "Type", value: "Web Extension" },
      { label: "Target", value: "OpenTogetherTube" },
    ],
  },
  {
    id: "createnewfile-macos",
    slug: "createnewfile-macos",
    title: "CreateNewFile macOS",
    tagline: "Finder Context Action for Fast File Creation",
    description:
      "Automator workflow and AppleScript package enabling quick right-click file creation with custom extensions directly in macOS Finder, bringing familiar Unix/Windows functionality to Mac.",
    category: "experiments",
    techStack: ["AppleScript", "Automator", "macOS Finder", "Automation"],
    githubUrl: "https://github.com/jurek-zsl/CreateNewFile-macOS",
    stars: 0,
    forks: 0,
    featured: false,
    highlights: [
      "Context menu integration in macOS Finder without external third-party daemons",
      "Support for custom file extensions, templates, and path resolution",
    ],
    architecture: {
      overview:
        "Executes localized AppleScript commands to resolve Finder selection targets and create new file nodes via posix file descriptors.",
      keyDecisions: [
        "Zero memory footprint: only triggers when invoked from Finder Quick Actions",
      ],
    },
    metrics: [
      { label: "Language", value: "AppleScript" },
      { label: "Host", value: "macOS Finder" },
    ],
  },
  {
    id: "simple-online-chat",
    slug: "simple-online-chat",
    title: "Simple Online Chat",
    tagline: "Real-Time WebSocket Web Chat Remake",
    description:
      "A lightweight, clean real-time chat application with an accessible web interface, instant broadcast messaging, and decoupled client-server architecture.",
    category: "fullstack",
    techStack: ["JavaScript", "WebSockets", "Node.js", "HTML5", "CSS"],
    githubUrl: "https://github.com/jurek-zsl/simpleOnlineChat",
    stars: 0,
    forks: 0,
    featured: false,
    highlights: [
      "Real-time event broadcasting over persistent WebSocket connections",
      "Zero frontend frameworks: pure lightweight responsive client",
    ],
    architecture: {
      overview:
        "Node.js server handling connection pooling, message deserialization, and multi-client broadcast dispatch.",
      keyDecisions: [
        "Lightweight footprint for quick deployment on local or hosted web servers",
      ],
    },
    metrics: [
      { label: "Protocol", value: "WebSockets" },
      { label: "Architecture", value: "Real-Time" },
    ],
  },
];

