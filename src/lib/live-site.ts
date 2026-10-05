import capture from "@/content/generated/live-site.json";
export const siteUrl = "https://www.gawpoe.com";
export const livePages = capture.pages;
export const liveRedirects = capture.redirects;
export function normalizePath(path: string) {
  return path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;
}
export function getLivePage(path: string) {
  return livePages.find((page) => page.path === normalizePath(path));
}
