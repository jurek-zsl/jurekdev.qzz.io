import { Metadata } from "next";
import { Suspense } from "react";
import { ProjectsClient } from "@/components/projects/projects-client";

export const metadata: Metadata = {
  title: "Projects & Architecture | Jurek · Systems, Tools & Engineering",
  description:
    "Explore open source projects by Jurek: ohio-cli, antiQuarantine, openclock, MumbleMica, Vellum, jebacInstaling, and cattyfin.",
  openGraph: {
    title: "Projects & Architecture | Jurek",
    description:
      "Explore open source projects by Jurek: ohio-cli, antiQuarantine, openclock, MumbleMica, Vellum, jebacInstaling, and cattyfin.",
    url: "https://jurekdev.qzz.io/projects",
  },
};

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center font-mono text-sm text-[#e5e5e5]">[LOADING_PROJECTS_MATRIX...]</div>}>
      <ProjectsClient />
    </Suspense>
  );
}
