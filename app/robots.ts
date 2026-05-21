import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE = "https://pokopia-wiki-2pr5rdj40-pinieri-amato-projects.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
