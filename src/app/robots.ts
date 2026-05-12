import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/create/",
          "/history",
          "/billing",
          "/profile",
          "/credits",
          "/support",
          "/admin/",
          "/api/",
          "/auth/",
        ],
      },
    ],
    sitemap: "https://www.ugcads.us/sitemap.xml",
  };
}
