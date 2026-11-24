import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";

const PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/buy", priority: 0.9 },
  { path: "/guide", priority: 0.8 },
  { path: "/quick", priority: 0.6 },
  { path: "/contact", priority: 0.3 },
  { path: "/terms", priority: 0.2 },
  { path: "/privacy", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(({ path, priority }) => ({
    url: `${SITE.url}${path}`,
    changeFrequency: "weekly",
    priority,
  }));
}
