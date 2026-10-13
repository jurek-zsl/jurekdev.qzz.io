import { Hero } from "@/components/home/hero";
import { BentoGrid } from "@/components/home/bento-grid";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { LatestArticles } from "@/components/home/latest-articles";
import { getSiteData } from "@/lib/store-server";

export default function Home() {
  const { posts, projects, profile, skills } = getSiteData();

  return (
    <div className="space-y-4">
      <Hero profile={profile} />
      <BentoGrid projects={projects} profile={profile} skills={skills} />
      <FeaturedProjects projects={projects} />
      <LatestArticles posts={posts} />
    </div>
  );
}
