import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/** Read only local, independently editable page sources. Never fetch the live site. */
export function readSiteContent(root = process.cwd()) {
  const content = path.join(root, "src/content");
  const pages = [];
  function visit(directory, segments = []) {
    const entries = readdirSync(directory, { withFileTypes: true });
    const hasMetadata = entries.some((entry) => entry.name === "page.json" && entry.isFile());
    const hasHtml = entries.some((entry) => entry.name === "index.html" && entry.isFile());
    if (hasMetadata !== hasHtml) throw new Error(`Incomplete page source: ${directory}`);
    if (hasMetadata) {
      const metadata = JSON.parse(readFileSync(path.join(directory, "page.json"), "utf8"));
      const route = segments.length ? `/${segments.join("/")}/` : "/";
      if (metadata.path !== route) throw new Error(`Page path must match directory: ${route}`);
      if ("html" in metadata) throw new Error(`HTML belongs in index.html: ${route}`);
      for (const key of ["title", "description", "bodyClass", "cssPath"])
        if (typeof metadata[key] !== "string") throw new Error(`Missing ${key}: ${route}`);
      pages.push({ ...metadata, html: readFileSync(path.join(directory, "index.html"), "utf8") });
    }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) throw new Error(`Symlink in page sources: ${entry.name}`);
      if (entry.isDirectory()) visit(path.join(directory, entry.name), [...segments, entry.name]);
    }
  }
  visit(path.join(content, "pages"));
  const site = JSON.parse(readFileSync(path.join(content, "site.json"), "utf8"));
  if ("pages" in site) throw new Error("site.json must not contain page bodies");
  return { ...site, pages: pages.sort((a, b) => a.path.localeCompare(b.path)) };
}
