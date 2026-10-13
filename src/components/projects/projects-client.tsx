"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { ProjectModal } from "@/components/ui/project-modal";
import { Project, ProjectCategory } from "@/types/project";

interface ProjectsClientProps {
  initialProjects?: Project[];
}

export function ProjectsClient({ initialProjects = [] }: ProjectsClientProps) {
  const searchParams = useSearchParams();
  const highlightParam = searchParams.get("highlight");

  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const allProjects = initialProjects;

  useEffect(() => {
    if (highlightParam) {
      const match = allProjects.find((p) => p.id === highlightParam);
      if (match) {
        setSelectedProject(match);
      }
    }
  }, [highlightParam, allProjects]);

  const categories: { label: string; value: ProjectCategory }[] = [
    { label: "ALL", value: "all" },
    { label: "SYSTEMS & GO", value: "systems" },
    { label: "FULLSTACK", value: "fullstack" },
    { label: "OPEN SOURCE", value: "opensource" },
    { label: "EXPERIMENTS", value: "experiments" },
  ];

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const projCat = project.category || "all";
      const matchesCategory =
        activeCategory === "all" || projCat === activeCategory;

      const query = searchQuery.toLowerCase().trim();
      const title = project.title || "";
      const tagline = project.tagline || "";
      const desc = project.description || "";
      const techStack = Array.isArray(project.techStack) ? project.techStack : [];

      const matchesSearch =
        !query ||
        title.toLowerCase().includes(query) ||
        tagline.toLowerCase().includes(query) ||
        desc.toLowerCase().includes(query) ||
        techStack.some((tech) => typeof tech === "string" && tech.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [allProjects, activeCategory, searchQuery]);

  return (
    <div className="py-8 font-mono text-[#e5e5e5]">
      {/* Header */}
      <div className="mb-6 border-b border-[#e5e5e5] pb-3">
        <h1 className="text-xl sm:text-2xl font-bold uppercase text-[#38bdf8]">
          === PROJECTS &amp; OPEN SOURCE ARCHIVES ===
        </h1>
        <p className="mt-1 text-xs text-[#e5e5e5]">
          Total entries: {allProjects.length} · Go CLIs, macOS Darwin tools, multiplayer game engines, desktop mods, and browser extensions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 space-y-3">
        {/* Category radio tabs */}
        <div className="flex flex-wrap gap-2 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`border px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
                activeCategory === cat.value
                  ? "border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold"
                  : "border-[#e5e5e5] bg-[#000000] text-[#e5e5e5] hover:border-[#38bdf8]"
              }`}
            >
              [{activeCategory === cat.value ? "•" : " "} {cat.label}]
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="flex items-center border border-[#e5e5e5] bg-[#000000] px-3 py-1.5 text-xs">
          <span className="text-[#38bdf8] mr-2">QUERY&gt;</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords (Go, macOS, WebSockets, Extension, Qt, Canvas)..."
            className="w-full bg-transparent text-xs text-[#e5e5e5] placeholder:text-[#e5e5e5]/50 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-[#e5e5e5] hover:text-[#38bdf8]"
            >
              [CLEAR]
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {allProjects.length === 0 ? (
        <div className="border border-[#e5e5e5] p-8 text-center text-xs">
          <div className="text-[#38bdf8] font-bold">[00: NO_PROJECTS_RECORDED]</div>
          <div className="mt-1 text-[#e5e5e5]">
            No projects found in database. Projects can be authored and added via{" "}
            <a href="/admin" className="text-[#38bdf8] underline hover:text-[#e5e5e5]">
              [ADMIN]
            </a>.
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="border border-[#e5e5e5] p-8 text-center text-xs">
          <div className="text-[#38bdf8]">[NO MATCHES FOUND]</div>
          <div className="mt-1 text-[#e5e5e5]">
            No records match query &quot;{searchQuery}&quot;.
          </div>
          <button
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
            className="mt-3 border border-[#38bdf8] px-2 py-1 text-xs text-[#38bdf8]"
          >
            [RESET FILTER]
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <GlassCard
              key={project.id}
              className="flex flex-col justify-between p-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2 text-xs">
                  <span className="bg-[#38bdf8] text-[#000000] px-1 font-bold">
                    {(project.category || "project").toUpperCase()}
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

                {/* Metrics */}
                {project.metrics && Array.isArray(project.metrics) && project.metrics.length > 0 && (
                  <div className="mt-3 border border-[#e5e5e5] p-2 text-xs grid grid-cols-2 gap-1">
                    {project.metrics.slice(0, 2).map((m, idx) => (
                      <div key={idx} className="line-clamp-1">
                        <span className="text-[#38bdf8]">{m.label}:</span> {m.value}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#e5e5e5] space-y-2">
                <div className="flex flex-wrap gap-1 text-[11px] text-[#38bdf8] min-h-[1.5rem]">
                  {(project.techStack || []).map((tech) => (
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
      )}

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
      />
    </div>
  );
}
