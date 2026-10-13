"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlassCard } from "../ui/glass-card";
import { ProjectModal } from "../ui/project-modal";
import { PROJECTS } from "@/data/projects";
import { Project } from "@/types/project";

interface FeaturedProjectsProps {
  projects?: Project[];
}

export function FeaturedProjects({ projects = PROJECTS }: FeaturedProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const featured = projects.filter((p) => p.featured);

  return (
    <section className="py-8 font-mono text-[#e5e5e5]">
      <div className="mb-4 border-b border-[#e5e5e5] pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#38bdf8]">
            === FEATURED SYSTEMS &amp; OPEN SOURCE ===
          </h2>
          <div className="text-xs text-[#e5e5e5]">
            Go CLIs &amp; TUIs, macOS system utilities, desktop mods, and real-time multiplayer engines
          </div>
        </div>

        <Link
          href="/projects"
          className="border border-[#e5e5e5] px-2.5 py-1 text-xs text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] self-start sm:self-auto"
        >
          [VIEW ALL {PROJECTS.length} PROJECTS ↗]
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {featured.map((project) => (
          <GlassCard
            key={project.id}
            className="flex flex-col justify-between p-4"
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2 text-xs">
                <span className="bg-[#38bdf8] text-[#000000] px-1 font-bold">
                  {project.category.toUpperCase()}
                </span>
                {project.stars && (
                  <span className="text-[#38bdf8]">★ {project.stars}</span>
                )}
              </div>

              <h3 className="mt-3 text-base font-bold text-[#e5e5e5]">
                {project.title}
              </h3>
              <div className="text-xs text-[#38bdf8] mt-0.5">
                // {project.tagline}
              </div>

              <p className="mt-2 text-xs leading-relaxed text-[#e5e5e5] line-clamp-3">
                {project.description}
              </p>

              <div className="mt-3 space-y-1 text-[11px] border-t border-[#e5e5e5]/40 pt-2">
                {project.highlights.slice(0, 2).map((highlight, idx) => (
                  <div key={idx} className="line-clamp-1">
                    <span className="text-[#38bdf8]">&gt;</span> {highlight}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#e5e5e5] space-y-2">
              <div className="flex flex-wrap gap-1 text-[11px] text-[#38bdf8] min-h-[1.5rem]">
                {project.techStack.slice(0, 3).map((tech) => (
                  <span key={tech}>[{tech}]</span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="col-span-2 w-full border border-[#38bdf8] bg-[#000000] py-1 text-xs text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#000000] cursor-pointer text-center font-bold transition-colors whitespace-nowrap"
                >
                  [DETAILS &amp; SPECS]
                </button>

                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`border border-[#e5e5e5] bg-[#000000] py-1 text-xs text-[#e5e5e5] hover:bg-[#e5e5e5] hover:text-[#000000] text-center transition-colors whitespace-nowrap ${
                    project.liveUrl ? "col-span-1" : "col-span-2"
                  }`}
                >
                  {project.liveUrl ? "[REPO ↗]" : "[GITHUB REPO ↗]"}
                </a>

                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-1 border border-[#38bdf8] bg-[#000000] py-1 text-xs text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#000000] text-center transition-colors whitespace-nowrap"
                  >
                    [DEMO ↗]
                  </a>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <ProjectModal
        project={selectedProject}
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
      />
    </section>
  );
}
