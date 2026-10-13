"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Project } from "@/types/project";
import { SpotlightButton } from "./spotlight-button";

interface ProjectModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectModal({ project, open, onOpenChange }: ProjectModalProps) {
  if (!project) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#000000]/80" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-[#e5e5e5] bg-[#000000] p-5 font-mono text-[#e5e5e5] tui-glow-pane">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#e5e5e5] pb-3 text-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#38bdf8] text-[#000000] px-1 font-bold">
                  {(project.category || "project").toUpperCase()}
                </span>
                {project.stars && (
                  <span className="text-[#38bdf8]">STARS: {project.stars}</span>
                )}
                {project.forks && (
                  <span className="text-[#e5e5e5]">FORKS: {project.forks}</span>
                )}
              </div>
              <Dialog.Title className="text-lg font-bold text-[#e5e5e5]">
                {project.title}
              </Dialog.Title>
              <Dialog.Description className="text-xs text-[#38bdf8]">
                // {project.tagline}
              </Dialog.Description>
            </div>

            <Dialog.Close className="border border-[#e5e5e5] px-1.5 py-0.5 text-xs text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8]">
              [X]
            </Dialog.Close>
          </div>

          {/* Metrics bar */}
          {project.metrics && project.metrics.length > 0 && (
            <div className="my-4 border border-[#e5e5e5] p-2 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
              {project.metrics.map((metric, i) => (
                <div key={i}>
                  <span className="text-[#38bdf8]">{metric.label}:</span> {metric.value}
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="space-y-4 text-xs leading-relaxed text-[#e5e5e5]">
            <p>{project.description}</p>

            {/* Architecture Section */}
            {project.architecture && (
              <div className="border border-[#e5e5e5] p-3 space-y-2">
                <div className="font-bold text-[#38bdf8]">
                  === ARCHITECTURE OVERVIEW ===
                </div>
                <p>{project.architecture.overview}</p>

                {project.architecture.keyDecisions && Array.isArray(project.architecture.keyDecisions) && (
                  <div className="pt-2 border-t border-[#e5e5e5]/40 space-y-1">
                    <div className="text-[#38bdf8] font-bold">KEY DECISIONS:</div>
                    {project.architecture.keyDecisions.map((decision, idx) => (
                      <div key={idx} className="pl-2">
                        &gt; {decision}
                      </div>
                    ))}
                  </div>
                )}

                {project.architecture.benchmark && (
                  <div className="pt-2 border-t border-[#e5e5e5]/40 text-[#38bdf8] font-bold">
                    BENCHMARK: {project.architecture.benchmark}
                  </div>
                )}
              </div>
            )}

            {/* Highlights */}
            {project.highlights && Array.isArray(project.highlights) && project.highlights.length > 0 && (
              <div>
                <div className="text-[#38bdf8] font-bold mb-1">
                  === HIGHLIGHTS &amp; CAPABILITIES ===
                </div>
                <ul className="space-y-1 pl-2">
                  {project.highlights.map((highlight, index) => (
                    <li key={index}>
                      &gt; {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tech Stack */}
            <div>
              <div className="text-[#38bdf8] font-bold mb-1">
                === TECHNOLOGIES USED ===
              </div>
              <div className="flex flex-wrap gap-1">
                {(project.techStack || []).map((tech) => (
                  <span key={tech} className="text-[#e5e5e5]">
                    [{tech}]
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 border-t border-[#e5e5e5] pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-[#e5e5e5]">
              REPO: github.com/jurek-zsl/{project.slug}
            </span>

            <div className="flex gap-2">
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <SpotlightButton variant="secondary" size="sm">
                  VIEW_REPO ↗
                </SpotlightButton>
              </a>

              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <SpotlightButton variant="primary" size="sm">
                    RUN_DEMO ↗
                  </SpotlightButton>
                </a>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
