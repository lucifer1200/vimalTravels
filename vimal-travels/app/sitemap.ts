import type { MetadataRoute } from "next";
import { getAllSlugs, getDestination } from "@/lib/destinations";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.vimaltravels.in";
  const now = new Date();

  const destinationPages: MetadataRoute.Sitemap = getAllSlugs().map((slug) => {
    const d = getDestination(slug);
    return {
      url: `${base}/packages/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: d?.type === "domestic" ? 0.9 : 0.85,
    };
  });

  return [
    // Core pages
    { url: base,                                              lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/packages`,                               lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/services`,                               lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/passport-visa`,                          lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`,                                  lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`,                                lastModified: now, changeFrequency: "yearly",  priority: 0.6 },

    // Local SEO
    { url: `${base}/travel-agency-north-bangalore`,          lastModified: now, changeFrequency: "monthly", priority: 0.9 },

    // Service pages
    { url: `${base}/services/visa-agent-bangalore`,          lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/services/passport-agent-bangalore`,      lastModified: now, changeFrequency: "monthly", priority: 0.9 },

    // All destination pages (auto-generated from lib/destinations.ts)
    ...destinationPages,
  ];
}
