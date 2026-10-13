# jurekdev.qzz.io · Mega Minimalist ASCII / TUI Developer Portfolio & Technical Blog

A production-grade, mega minimalist developer portfolio and technical blog built with **Next.js 15 (App Router)** and **TypeScript**, styled strictly as an authentic **ASCII / Terminal User Interface (TUI)**.

- **Developer Identity:** Jurek ([@jurek-zsl](https://github.com/jurek-zsl))
- **Production Domain:** `https://jurekdev.qzz.io`
- **Aesthetic:** Mega Minimalist ASCII / TUI Terminal Design
- **Strict 3-Color Palette:**
  1. `Background:` `#000000` (Pure Terminal Black)
  2. `Foreground / Borders:` `#e5e5e5` (Terminal Light Monospace)
  3. `Highlight / Accent:` `#38bdf8` (Terminal Phosphor Green)
- **Zero Gradients:** 100% flat, high-contrast, razor-sharp terminal geometry.

---

## ⚡ Key Features

1. **Strict 3-Color ASCII / TUI Design**
   - Pure black canvas with crisp monospace typography.
   - Zero linear/radial gradients, zero box-shadow blurs, zero glassmorphism.
   - Monospace box-drawing frames (`┌─┐`, `│`, `└─┘`, `├──`, `└──`, `[+]`, `[-]`).

2. **Terminal Navigation & ASCII Art Banner**
   - Giant ASCII header: `JUREK` banner.
   - Neofetch-style system diagnostics table with host, kernel, stack, and active status.
   - TUI navbar: `┌─[ jurek@qzz.io ] :: [01:OVERVIEW] [02:PROJECTS] [03:BLOG] [SEARCH: ^K]`
   - Tmux / Vim statusline footer: `[NORMAL] jurekdev.qzz.io | UTF-8 | ● NOMINAL`
   - DigitalPlat domain attribution badge in clean ASCII box.

3. **Telemetry & Workstation Panes (Bento)**
   - Pinned project spotlight: `NexusKV` Raft key-value engine with live specs.
   - Git matrix commit heatmap in ASCII blocks (`·`, `░`, `▒`, `▓`).
   - Tech stack table: Go, Linux Kernel, io_uring, TypeScript, Rust, Docker.
   - Homelab diagnostics pane: Proxmox VE cluster, Arch Linux rig, Corne split keyboard.

4. **Projects Showcase (`/projects`)**
   - TUI radio filters: `[• ALL]  [  SYSTEMS & GO]  [  FULLSTACK]  [  OPEN SOURCE]  [  EXPERIMENTS]`.
   - Terminal prompt search: `QUERY> _`.
   - ASCII modal dialogs for architecture deep-dives and performance benchmarks.

5. **Research Notes & Technical Journal (`/blog` & `/blog/[slug]`)**
   - Tree-structure directory index: `├── [2025-02-18] [DISTRIBUTED SYSTEMS] ...`.
   - Solid phosphor green top progress bar.
   - ASCII Table of Contents tree spy (`├──`, `└──`).
   - Code blocks rendered with `vitesse-black` pure black background and ASCII titlebars.
   - RSS 2.0 XML feed (`/feed.xml`).

6. **Global Utilities**
   - `Cmd + K` Command runner in ASCII TUI modal.
   - Terminal transmit message dialog (`ContactModal`) with ACK toast confirmations.

---

## 🚀 Quick Start

```bash
cd /Users/jurekzsl/.gemini/antigravity/scratch/jurekdev-portfolio

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build production bundle (100% static HTML generation)
pnpm build

# Start production server
pnpm start -p 3009
```
