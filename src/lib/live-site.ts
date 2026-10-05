import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { renderPageHtml } from "./fragments.mjs";
import capture from "@/content/generated/live-site.json";
export const siteUrl = "https://www.gawpoe.com";
const fragmentDirectory = path.join(process.cwd(), "src/content/fragments");
const fragments: Record<string, string> = Object.fromEntries(
  readdirSync(fragmentDirectory)
    .filter((name) => name.endsWith(".html"))
    .map((name) => [
      name.slice(0, -5),
      readFileSync(path.join(fragmentDirectory, name), "utf8"),
    ]),
);
export const livePages = capture.pages.map((page) => ({
  ...page,
  html: renderPageHtml(page, fragments),
}));
export const liveRedirects = capture.redirects;
export function normalizePath(path: string) {
  return path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;
}
export function getLivePage(path: string) {
  return livePages.find((page) => page.path === normalizePath(path));
}
