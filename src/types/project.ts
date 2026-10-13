export type ProjectCategory = "all" | "systems" | "fullstack" | "opensource" | "experiments";

export interface Project {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: "systems" | "fullstack" | "opensource" | "experiments";
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  stars?: number;
  forks?: number;
  featured: boolean;
  highlights: string[];
  architecture?: {
    overview: string;
    keyDecisions: string[];
    benchmark?: string;
  };
  metrics?: { label: string; value: string }[];
}
