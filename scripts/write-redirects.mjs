import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
const redirects = JSON.parse(
  await readFile("public/legacy-redirects.json", "utf8"),
);
const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const lines = [];
for (const [from, to] of Object.entries(redirects)) {
  if (from.includes("?")) continue;
  // Extensionless canonicalization is served by the host; writing its index would overwrite its destination.
  if (!from.endsWith("/")) {
    lines.push(`${from} ${to} 301`);
    continue;
  }
  if (from === "/" || !to.startsWith("/")) continue;
  const dir = path.resolve("out", "." + decodeURIComponent(from));
  if (!dir.startsWith(path.resolve("out") + path.sep))
    throw Error("Invalid redirect path");
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, "index.html"),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Gaw | Poe LLP</title><link rel="canonical" href="https://www.gawpoe.com${escape(to)}"><meta http-equiv="refresh" content="0;url=${escape(to)}"></head><body><a href="${escape(to)}">Continue to the original resource</a></body></html>`,
  );
  lines.push(`${from} ${to} 301`);
}
await writeFile("out/_redirects", lines.join("\n") + "\n");
console.log(
  `Preserved ${lines.length} path redirects plus legacy query-ID mapping.`,
);
