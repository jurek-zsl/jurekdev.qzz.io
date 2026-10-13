import { BlogPost } from "@/types/blog";
import { Project } from "@/types/project";
import { TechItem } from "@/data/tech-stack";

export type { TechItem };

export interface ProfileData {
  name: string;
  handle: string;
  host: string;
  role: string;
  location: string;
  status: string;
  ecosystem: string;
  flagships: string;
  bio: string;
  email: string;
}

export interface SiteData {
  posts: BlogPost[];
  projects: Project[];
  skills: TechItem[];
  profile: ProfileData;
}

export const DEFAULT_PROFILE: ProfileData = {
  name: "Lishafai Heorhii (Jurek)",
  handle: "jurek-zsl",
  host: "jurekdev.qzz.io",
  role: "Systems · Game Dev · Extensions · Desktop Mods",
  location: "Málaga, Spain",
  status: "AVAILABLE FOR PROJECTS",
  ecosystem: "ohiofiles.cloud · Homebrew · Jellyfin",
  flagships: "ohio-cli · antiQuarantine · openclock · MumbleMica",
  bio: "High-speed Go CLIs & TUIs, native macOS system tools, real-time LAN multiplayer games, browser extensions, desktop app mods, and pure monospace web apps.",
  email: "jurek@jurekdev.qzz.io",
};
