import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://riftdistrict.com";
  const routes = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/login",
    "/signup",
    "/collection/limited-drop",
    "/collection/acid-wash",
    "/collection/oversized-tees",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
