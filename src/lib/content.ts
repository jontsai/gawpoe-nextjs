import sitemap from "@/data/wp-sitemap.json";
import wordpress from "@/content/generated/wordpress.json";

export type ContentKind = "page" | "post";
export type SitemapKind = "page" | "post" | "category" | "user" | "url";

export type SiteContent = {
  id: number;
  kind: ContentKind;
  slug: string;
  path: string;
  sourceUrl: string;
  title: string;
  excerpt: string;
  date: string;
  modified: string;
  featuredImage: string | null;
  html: string;
  author?: number | null;
  categories?: number[];
  archived?: boolean;
};

export type WordpressPayload = {
  generatedAt: string;
  source: string;
  counts: Record<string, number>;
  content: SiteContent[];
};

export type SitemapRoute = {
  path: string;
  sourceUrl: string;
  sitemap: string;
  kind: SitemapKind;
  kindLabel: string;
  slug: string;
  title: string;
};

export type SitemapPayload = {
  generatedAt: string | null;
  source: string;
  childSitemaps?: string[];
  routeCount?: number;
  routes: SitemapRoute[];
};

const payload = wordpress as WordpressPayload;
const sitemapPayload = sitemap as SitemapPayload;

export const siteUrl = "https://www.gawpoe.com";
export const devUrl = "https://gawpoe.dev.upinthe.xyz";

export const allContent = payload.content;
export const sitemapRoutes = [
  ...new Map(
    [
      ...sitemapPayload.routes,
      ...payload.content.map((item) => ({
        path: normalizeRoutePath(item.path),
        sourceUrl: item.sourceUrl,
        sitemap: "",
        kind: item.kind,
        kindLabel: item.kind === "post" ? "News" : "Page",
        slug: item.slug,
        title: item.title,
      })),
    ].map((route) => [route.path, route]),
  ).values(),
];

export const pages = allContent.filter((item) => item.kind === "page");
export const posts = allContent
  .filter((item) => item.kind === "post")
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getContentByPath(path: string) {
  const normalized = path.replace(/^\/|\/$/g, "");
  return allContent.find((item) => item.path === normalized);
}

export function getSitemapRouteByPath(path: string) {
  const normalized = normalizeRoutePath(path);
  return sitemapRoutes.find((item) => item.path === normalized);
}

export function getHomePage() {
  return (
    getContentByPath("") ||
    getContentByPath("home") ||
    pages.find((item) => item.slug === "home") ||
    pages[0]
  );
}

export function toSlugSegments(path: string) {
  return path ? path.split("/").filter(Boolean) : [];
}

export function toSitemapSlugSegments(path: string) {
  return normalizeRoutePath(path)
    .replace(/^\/|\/$/g, "")
    .split("/")
    .filter(Boolean);
}

export function canonicalFor(item: SiteContent) {
  return `${siteUrl}/${item.path ? `${item.path}/` : ""}`;
}

export function normalizeRoutePath(path: string) {
  const stripped = path.replace(/^\/|\/$/g, "");
  return stripped ? `/${stripped}/` : "/";
}

export function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export const team = wordpress.team;
export const visuals = wordpress.visuals;
export const practiceAreas = [
  "trial-work",
  "business-litigation",
  "antitrust",
  "catastrophic-injury",
  "appeals",
].map((path) => getContentByPath(path)!);
export function archivePosts(path: string) {
  const category = wordpress.categories.find((c) => c.path === path);
  const author = wordpress.authors.find((a) => a.path === path);
  return category
    ? posts.filter((p) => p.categories?.includes(category.id))
    : author
      ? posts.filter((p) => p.author === author.id)
      : [];
}

export const results = wordpress.results;
