import type { MetadataRoute } from "next";
export const dynamic = "force-static";
import { POKEMON, CATEGORIES, ITEMS, SPECIALTIES, HABITATS, LOCATIONS } from "@/app/lib/data";

const BASE = "https://pokopia-wiki-2pr5rdj40-pinieri-amato-projects.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/pokedex`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/lookup`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/matchmaker`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  const pokemonRoutes: MetadataRoute.Sitemap = Object.keys(POKEMON).map((slug) => ({
    url: `${BASE}/pokemon/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = Object.keys(CATEGORIES).map((slug) => ({
    url: `${BASE}/category/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const itemRoutes: MetadataRoute.Sitemap = Object.values(ITEMS).map((item) => ({
    url: `${BASE}/item/${item.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const specialtyRoutes: MetadataRoute.Sitemap = Object.keys(SPECIALTIES).map((slug) => ({
    url: `${BASE}/specialty/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const habitatRoutes: MetadataRoute.Sitemap = Object.keys(HABITATS).map((slug) => ({
    url: `${BASE}/habitat/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const locationRoutes: MetadataRoute.Sitemap = Object.keys(LOCATIONS).map((slug) => ({
    url: `${BASE}/location/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...pokemonRoutes,
    ...categoryRoutes,
    ...itemRoutes,
    ...specialtyRoutes,
    ...habitatRoutes,
    ...locationRoutes,
  ];
}
