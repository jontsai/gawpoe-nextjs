import { existsSync, readFileSync } from "node:fs";

const payload = JSON.parse(readFileSync("src/data/wp-sitemap.json", "utf8"));
const routes = payload.routes || [];

function outputPath(routePath) {
  if (routePath === "/") {
    return "docs/index.html";
  }

  return `docs/${routePath.replace(/^\/|\/$/g, "")}/index.html`;
}

const missing = routes.filter((route) => !existsSync(outputPath(route.path)));

if (missing.length > 0) {
  console.error(
    `Missing ${missing.length} WordPress sitemap route(s) from docs/:`,
  );
  for (const route of missing.slice(0, 30)) {
    console.error(`- ${route.path} (${route.sitemap})`);
  }
  process.exit(1);
}

console.log(`Verified ${routes.length} WordPress sitemap routes in docs/.`);
