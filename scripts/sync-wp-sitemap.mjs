import { mkdir, writeFile } from "node:fs/promises";

const SITEMAP_INDEX = "https://www.gawpoe.com/wp-sitemap.xml";
const OUTPUT_PATH = new URL("../src/data/wp-sitemap.json", import.meta.url);

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function textBetweenTags(xml, tag) {
  const pattern = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g");
  return [...xml.matchAll(pattern)].map((match) => decodeXml(match[1].trim()));
}

function normalizePath(url) {
  const parsed = new URL(url);
  const path = parsed.pathname.replace(/\/$/, "") || "/";
  return path === "/" ? "/" : `${path}/`;
}

function titleFromPath(path) {
  if (path === "/") {
    return "Gaw | Poe LLP";
  }

  return path
    .replace(/^\/|\/$/g, "")
    .split("/")
    .filter(Boolean)
    .map((part) =>
      part.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
    )
    .join(" / ");
}

function routeKindFromSitemap(sitemapUrl) {
  if (sitemapUrl.includes("posts-post")) {
    return ["post", "News"];
  }

  if (sitemapUrl.includes("posts-page")) {
    return ["page", "Page"];
  }

  if (sitemapUrl.includes("taxonomies-category")) {
    return ["category", "Category"];
  }

  if (sitemapUrl.includes("users")) {
    return ["user", "Author"];
  }

  return ["url", "Page"];
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/xml,text/xml,*/*",
      "User-Agent": "gawpoe-nextjs-migration/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
}

const indexXml = await fetchText(SITEMAP_INDEX);
const childSitemaps = textBetweenTags(indexXml, "loc").filter((url) =>
  url.includes("/wp-sitemap-"),
);

const routesByPath = new Map();

for (const sitemapUrl of childSitemaps) {
  const [kind, kindLabel] = routeKindFromSitemap(sitemapUrl);
  const sitemapXml = await fetchText(sitemapUrl);
  const urls = textBetweenTags(sitemapXml, "loc").filter((url) => {
    const parsed = new URL(url);
    return (
      parsed.hostname === "www.gawpoe.com" || parsed.hostname === "gawpoe.com"
    );
  });

  for (const sourceUrl of urls) {
    const path = normalizePath(sourceUrl);
    const slugParts = path
      .replace(/^\/|\/$/g, "")
      .split("/")
      .filter(Boolean);

    routesByPath.set(path, {
      path,
      sourceUrl,
      sitemap: sitemapUrl,
      kind,
      kindLabel,
      slug: slugParts.at(-1) || "",
      title: titleFromPath(path),
    });
  }
}

const routes = [...routesByPath.values()].sort((left, right) =>
  left.path.localeCompare(right.path),
);

await mkdir(new URL("../src/data", import.meta.url), { recursive: true });
await writeFile(
  OUTPUT_PATH,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: SITEMAP_INDEX,
      childSitemaps,
      routeCount: routes.length,
      routes,
    },
    null,
    2,
  )}\n`,
);

console.log(`Wrote ${routes.length} sitemap routes to ${OUTPUT_PATH.pathname}`);
