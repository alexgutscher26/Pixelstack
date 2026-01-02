import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/auth-error`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.2,
    },
  ];

  // NOTE: Project routes are intentionally excluded because they are private to users.
  // If public projects are introduced in the future, they can be added here.

  return staticRoutes;
}
