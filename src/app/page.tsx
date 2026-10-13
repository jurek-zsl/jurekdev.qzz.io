import { Hero } from "@/components/home/hero";
import { BentoGrid } from "@/components/home/bento-grid";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { LatestArticles } from "@/components/home/latest-articles";

export default function Home() {
  return (
    <div className="space-y-4">
      <Hero />
      <BentoGrid />
      <FeaturedProjects />
      <LatestArticles />
    </div>
  );
}
