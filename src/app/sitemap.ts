import type { MetadataRoute } from "next";
import inventory from "@/data/wp-sitemap.json";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  // Serving a legacy/pagination URL does not make it a source sitemap entry.
  return inventory.routes.map((route) => ({ url: route.sourceUrl }));
}
