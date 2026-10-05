import type { MetadataRoute } from "next";
import { livePages, siteUrl } from "@/lib/live-site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return livePages.map((page) => ({ url: siteUrl + page.path }));
}
