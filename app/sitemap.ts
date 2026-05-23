import type { MetadataRoute } from "next";
export const dynamic = "force-static";
import { POKEMON, CATEGORIES, ITEMS, SPECIALTIES, HABITATS, LOCATIONS } from "@/app/lib/data";
import { SITE_URL } from "@/app/lib/config";

const LAST_UPDATED = new Date("2026-05-22"); // update this when data changes

export default function sitemap(): MetadataRoute.Sitemap {

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                        lastModified: LAST_UPDATED, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/pokedex`,           lastModified: LAST_UPDATED, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE_URL}/items`,             lastModified: LAST_UPDATED, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE_URL}/specialty`,         lastModified: LAST_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/habitats`,          lastModified: LAST_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/locations`,         lastModified: LAST_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/matchmaker`,        lastModified: LAST_UPDATED, changeFrequency: "weekly",  priority: 0.7 },
  ];

  const pokemonRoutes: MetadataRoute.Sitemap = Object.keys(POKEMON).map((slug) => ({
    url: `${SITE_URL}/pokemon/${slug}`,
    lastModified: LAST_UPDATED, changeFrequency: "monthly", priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = Object.keys(CATEGORIES).map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    lastModified: LAST_UPDATED, changeFrequency: "monthly", priority: 0.6,
  }));

  const itemRoutes: MetadataRoute.Sitemap = Object.values(ITEMS).map((item) => ({
    url: `${SITE_URL}/item/${item.slug}`,
    lastModified: LAST_UPDATED, changeFrequency: "monthly", priority: 0.5,
  }));

  const specialtyRoutes: MetadataRoute.Sitemap = Object.keys(SPECIALTIES).map((slug) => ({
    url: `${SITE_URL}/specialty/${slug}`,
    lastModified: LAST_UPDATED, changeFrequency: "monthly", priority: 0.6,
  }));

  const habitatRoutes: MetadataRoute.Sitemap = Object.keys(HABITATS).map((slug) => ({
    url: `${SITE_URL}/habitats/${slug}`,
    lastModified: LAST_UPDATED, changeFrequency: "monthly", priority: 0.5,
  }));

  const locationRoutes: MetadataRoute.Sitemap = Object.keys(LOCATIONS).map((slug) => ({
    url: `${SITE_URL}/locations/${slug}`,
    lastModified: LAST_UPDATED, changeFrequency: "monthly", priority: 0.5,
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
