// Apply dev-only Apache rules to an isolated copy of the committed static export.
// Never run this against a production/public source directory.
import { readFile, writeFile, realpath } from "node:fs/promises";
import path from "node:path";
const root = await realpath(process.argv[2] || "artifacts/dev-release");
for (const forbidden of ["public", "docs", "out"]) {
  if (root === path.resolve(forbidden))
    throw Error("Use an isolated dev-release copy");
}
const redirects = JSON.parse(
  await readFile(path.join(root, "legacy-redirects.json"), "utf8"),
);
const feeds = JSON.parse(
  await readFile(path.join(root, "feed-manifest.json"), "utf8"),
).feeds;
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const rules = [
  "# Generated dev-only configuration; do not use for production.",
  "Options -Indexes -MultiViews +FollowSymLinks",
  "DirectoryIndex index.html",
  "ErrorDocument 404 /404.html",
  'Header always set X-Robots-Tag "noindex, nofollow"',
  "AddType application/xml .xml",
  "RewriteEngine On",
];
for (const [from, to] of Object.entries(redirects)) {
  if (!to.startsWith("/") || to.startsWith("//") || /[\s?#]/.test(to))
    throw Error("Unexpected redirect destination");
  // Escape percent signs so encoded filenames are not interpreted as %N condition backreferences.
  const target = to.replaceAll("%", "\\%");
  const url = new URL(from, "https://www.gawpoe.com");
  if (url.search) {
    const entries = [...url.searchParams];
    if (
      url.pathname !== "/" ||
      entries.length !== 1 ||
      !/^(p|page_id|attachment_id)$/.test(entries[0][0]) ||
      !/^\d+$/.test(entries[0][1])
    )
      throw Error("Unexpected query alias");
    const [key, value] = entries[0];
    rules.push(
      `RewriteCond %{QUERY_STRING} (^|&)${key}=${value}(&|$)`,
      `RewriteRule ^$ ${target} [R=301,END,NE,QSD]`,
    );
  } else {
    rules.push(
      `RewriteRule ^${escape(decodeURIComponent(url.pathname).slice(1))}$ ${target} [R=301,END,NE]`,
    );
  }
}
await writeFile(path.join(root, ".htaccess"), rules.join("\n") + "\n");
for (const feed of feeds) {
  const dir = path.resolve(root, "." + feed.path);
  if (!dir.startsWith(root + path.sep)) throw Error("Invalid feed path");
  await writeFile(
    path.join(dir, ".htaccess"),
    "# This directory contains only preserved RSS documents.\nForceType application/rss+xml\n",
  );
}
console.log(
  `Prepared ${Object.keys(redirects).length} Apache redirects and ${feeds.length} feed MIME rules in isolated dev release.`,
);
