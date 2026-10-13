"use client";

import React, { useState, useMemo } from "react";
import { GlassCard } from "../ui/glass-card";
import { ProjectModal } from "../ui/project-modal";
import { PROJECTS } from "@/data/projects";
import { TECH_STACK, TechItem } from "@/data/tech-stack";
import { GITHUB_STATS, REAL_CONTRIBUTIONS } from "@/data/github-matrix";
import { Project } from "@/types/project";
import { ProfileData, DEFAULT_PROFILE } from "@/lib/store";

interface BentoGridProps {
  projects?: Project[];
  profile?: ProfileData;
  skills?: TechItem[];
}

export function BentoGrid({
  projects = PROJECTS,
  profile = DEFAULT_PROFILE,
  skills = TECH_STACK,
}: BentoGridProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTechDomain, setSelectedTechDomain] = useState<string>("ALL");
  const [pinnedIndex, setPinnedIndex] = useState(0);

  const pinnedProject = projects[pinnedIndex] || projects[0] || null;

  // Group real 367 contributions into 53 weeks of 7 days
  const weeks = useMemo(() => {
    const result: (typeof REAL_CONTRIBUTIONS)[] = [];
    for (let i = 0; i < REAL_CONTRIBUTIONS.length; i += 7) {
      result.push(REAL_CONTRIBUTIONS.slice(i, i + 7));
    }
    return result;
  }, []);

  const charForLevel = (level: number) => {
    switch (level) {
      case 0:
        return "·";
      case 1:
        return "░";
      case 2:
        return "▒";
      case 3:
        return "▓";
      case 4:
        return "█";
      default:
        return "·";
    }
  };

  // Dynamically compute domain categories from skills
  const domainTabs = useMemo(() => {
    const rawCategories = Array.from(new Set(skills.map((t) => t.category).filter(Boolean)));
    return ["ALL", ...rawCategories];
  }, [skills]);

  const filteredTech = useMemo(() => {
    if (selectedTechDomain === "ALL" || !domainTabs.includes(selectedTechDomain)) {
      return skills.slice(0, 8);
    }
    return skills.filter((t) => t.category === selectedTechDomain);
  }, [selectedTechDomain, skills, domainTabs]);

  return (
    <section className="py-8 font-mono text-[#e5e5e5]">
      <div className="mb-4 border-b border-[#e5e5e5] pb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#38bdf8]">
          === TELEMETRY &amp; WORKSTATION PANES ===
        </h2>
        <span className="text-xs text-[#e5e5e5]">[LAYOUT: 2x2 PANES]</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pane 1: Pinned Project Spotlight */}
        <GlassCard className="p-4 flex flex-col justify-between">
          {!pinnedProject ? (
            <div className="py-12 text-center text-xs space-y-2">
              <div className="text-[#38bdf8] font-bold">[00: NO_PROJECTS_REGISTERED]</div>
              <p className="text-[#e5e5e5]">No active projects found in database.</p>
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2 text-xs">
                  <span className="bg-[#38bdf8] text-[#000000] px-1 font-bold">
                    PANE 01: PINNED_ENGINE
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#38bdf8]">
                      {pinnedProject.stars !== undefined && `STARS: ${pinnedProject.stars} ★`}
                    </span>
                    <button
                      onClick={() =>
                        setPinnedIndex((prev) => (prev + 1) % (projects.length || 1))
                      }
                      className="text-[10px] border border-[#e5e5e5] px-1 text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8]"
                      title="Switch spotlight project"
                    >
                      [CYCLE ⟳]
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#e5e5e5]">
                      {pinnedProject.title}
                    </h3>
                    <span className="text-[10px] border border-[#38bdf8] px-1 text-[#38bdf8]">
                      [{(pinnedProject.category || "project").toUpperCase()}]
                    </span>
                  </div>
                  <div className="text-xs text-[#38bdf8] mt-0.5">
                    // {pinnedProject.tagline}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#e5e5e5]">
                    {pinnedProject.description}
                  </p>
                </div>

                {/* Metrics */}
                <div className="mt-4 border border-[#e5e5e5] p-2 text-xs grid grid-cols-2 gap-2">
                  {pinnedProject.metrics?.map((m, idx) => (
                    <div key={idx}>
                      <span className="text-[#38bdf8]">{m.label}:</span> {m.value}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#e5e5e5] flex items-center justify-between text-xs">
                <span className="text-xs text-[#38bdf8]">
                  [{((pinnedProject.techStack || []).slice(0, 3)).join(" · ")}]
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={pinnedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-[#e5e5e5] px-2 py-1 text-xs text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8]"
                  >
                    [REPO ↗]
                  </a>
                  <button
                    onClick={() => setSelectedProject(pinnedProject)}
                    className="border border-[#38bdf8] bg-[#000000] px-2 py-1 text-xs text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#000000] cursor-pointer"
                  >
                    [ARCHITECTURE ↗]
                  </button>
                </div>
              </div>
            </>
          )}
        </GlassCard>

        {/* Pane 2: Real GitHub Activity Heatmap */}
        <GlassCard className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2 text-xs">
              <span className="bg-[#e5e5e5] text-[#000000] px-1 font-bold">
                PANE 02: GIT_MATRIX (REAL)
              </span>
              <a
                href={GITHUB_STATS.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#38bdf8] hover:underline"
              >
                @{GITHUB_STATS.username} ↗
              </a>
            </div>

            <div className="mt-3 text-xs flex justify-between items-center text-[#e5e5e5]">
              <span>Real GitHub timeline: {GITHUB_STATS.totalContributions} commits &amp; events</span>
              <span className="text-[#38bdf8] text-[10px]">Peak: {GITHUB_STATS.peakDay.count} / day</span>
            </div>

            {/* ASCII Contribution Grid: 53 weeks x 7 days */}
            <div className="mt-3 border border-[#e5e5e5] p-2 text-xs overflow-x-auto">
              <div className="font-mono text-xs leading-none tracking-widest text-[#38bdf8]">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
                  return (
                    <div key={dayIndex} className="flex items-center gap-1 my-0.5 whitespace-nowrap">
                      <span className="w-3 text-[9px] text-[#e5e5e5]/70 select-none">
                        {dayIndex % 2 === 1 ? dayNames[dayIndex] : " "}
                      </span>
                      <div className="flex gap-0.5">
                        {weeks.map((week, weekIndex) => {
                          const day = week[dayIndex];
                          const char = day ? charForLevel(day.level) : " ";
                          const isHigh = day && day.level >= 3;
                          return (
                            <span
                              key={weekIndex}
                              title={day ? `${day.date}: ${day.count} contributions` : ""}
                              className={`inline-block w-2 text-center select-none cursor-default ${
                                isHigh ? "bg-[#38bdf8] text-[#000000] font-bold" : ""
                              }`}
                            >
                              {char}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 text-[10px] text-[#e5e5e5] flex flex-wrap justify-between border-t border-[#e5e5e5]/40 pt-1.5">
                <span>Total: {GITHUB_STATS.totalContributions} commits across {GITHUB_STATS.publicRepos} repos</span>
                <span>Legend: · (0) ░ (1-2) ▒ (3-5) ▓ (6-9) █ (10+)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e5e5e5] text-xs flex justify-between text-[#e5e5e5]">
            <span className="truncate mr-2">
              ACTIVE: {GITHUB_STATS.recentPushes.join(", ")}
            </span>
            <span className="text-[#38bdf8] shrink-0">STATUS: Live</span>
          </div>
        </GlassCard>

        {/* Pane 3: Multidisciplinary Tech Stack */}
        <GlassCard className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2 text-xs">
              <span className="bg-[#e5e5e5] text-[#000000] px-1 font-bold">
                PANE 03: MULTIDISCIPLINARY_STACK
              </span>
              <span className="text-[#38bdf8]">[{skills.length} SKILLS]</span>
            </div>

            {/* Domain filter pills */}
            <div className="mt-2.5 flex flex-wrap gap-1 text-[10px]">
              {domainTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTechDomain(tab)}
                  className={`px-1.5 py-0.5 border cursor-pointer ${
                    selectedTechDomain === tab
                      ? "border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold"
                      : "border-[#e5e5e5] bg-[#000000] text-[#e5e5e5] hover:border-[#38bdf8]"
                  }`}
                >
                  [{tab}]
                </button>
              ))}
            </div>

            {filteredTech.length === 0 ? (
              <div className="mt-3 border border-[#e5e5e5] p-6 text-center text-xs">
                <span className="text-[#38bdf8] font-bold">[00: NO_SKILLS_RECORDED]</span>
                <p className="mt-1 text-[11px] text-[#e5e5e5]/80">
                  No skills in this category. Skills can be configured via /admin.
                </p>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {filteredTech.slice(0, 6).map((tech) => (
                  <div
                    key={tech.name}
                    className="border border-[#e5e5e5] p-2 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#e5e5e5] font-bold">{tech.name}</span>
                      <span className="text-[#38bdf8] text-[10px]">[{tech.proficiency}]</span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#e5e5e5]/80 line-clamp-2">
                      {tech.description}
                    </p>
                    {tech.tag && (
                      <div className="mt-1 text-[9px] text-[#38bdf8]">
                        &gt; {tech.tag}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#e5e5e5] text-xs flex justify-between text-[#e5e5e5]">
            <span className="truncate mr-2">
              DOMAINS: {Array.from(new Set(skills.map((s) => s.category).filter(Boolean))).slice(0, 4).join(" · ") || "Multidisciplinary"}
            </span>
            <span className="text-[#38bdf8] shrink-0">Versatile</span>
          </div>
        </GlassCard>

        {/* Pane 4: Homelab, Rigs & Workstation */}
        <GlassCard className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2 text-xs">
              <span className="bg-[#e5e5e5] text-[#000000] px-1 font-bold">
                PANE 04: WORKSTATION_&amp;_RIGS
              </span>
              <span className="text-[#38bdf8]">[ONLINE]</span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="border border-[#e5e5e5] p-2">
                <span className="text-[#38bdf8]">macOS DARWIN WORKSTATION:</span> Apple Silicon · sys/xattr API · Homebrew taps · Neovim/Zsh
              </div>
              <div className="border border-[#e5e5e5] p-2">
                <span className="text-[#38bdf8]">HOMELAB &amp; MEDIA SERVER:</span> Jellyfin Media Server with custom Catppuccin TUI theme (cattyfin)
              </div>
              <div className="border border-[#e5e5e5] p-2">
                <span className="text-[#38bdf8]">LAN GAME DEPLOYMENT:</span> Zero-config script hosting for openclock multiplayer tournaments
              </div>
              <div className="border border-[#e5e5e5] p-2">
                <span className="text-[#38bdf8]">WINDOWS DWM MODDING:</span> Windows 11 Acrylic &amp; Mica materials testing (MumbleMica)
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e5e5e5] text-xs flex justify-between text-[#e5e5e5]">
            <span>BASE: Málaga, Spain</span>
            <span className="text-[#38bdf8]">NODE: ohiofiles.cloud</span>
          </div>
        </GlassCard>
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
      />
    </section>
  );
}

