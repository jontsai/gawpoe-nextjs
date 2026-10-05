import { validateCapture } from "./capture-validation.mjs";
import {
  mkdir,
  readFile,
  writeFile,
  access,
  readdir,
  rename,
} from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { load } from "cheerio";
const origin = "https://www.gawpoe.com";
const root = path.resolve("public");
const cache = path.resolve("artifacts/live-source");
await mkdir(cache, { recursive: true });
const sitemap = JSON.parse(await readFile("src/data/wp-sitemap.json", "utf8"));
const legacy = JSON.parse(
  await readFile("tests/fixtures/legacy-routes.json", "utf8"),
);
const baseline = JSON.parse(
  await readFile("src/content/generated/legacy-wordpress.json", "utf8"),
);
const mediaCapture = JSON.parse(
  await readFile("src/data/media-redirects.json", "utf8"),
);
const queue = [
  ...new Set([
    ...sitemap.routes.map((x) => x.path),
    ...legacy,
    ...mediaCapture.attachmentPages,
    ...Object.keys(mediaCapture.queryPages || {}),
  ]),
];
const seen = new Set(),
  pages = [],
  redirects = [],
  missing = [],
  assets = new Map(),
  pendingAssets = new Map();
const hosts = new Set([
  "www.gawpoe.com",
  "gawpoe.com",
  "cms.chambers.com",
  "cdn.trustindex.io",
  "ocweekly.com",
  "jhgstudios.com",
  "lh3.googleusercontent.com",
  "lh4.googleusercontent.com",
  "lh5.googleusercontent.com",
  "lh6.googleusercontent.com",
]);
const sha = (x) => createHash("sha256").update(x).digest("hex").slice(0, 16);
function assetPath(url) {
  const u = new URL(url, origin);
  return ["www.gawpoe.com", "gawpoe.com"].includes(u.hostname)
    ? decodeURI(u.pathname)
    : `/external/${u.hostname}/${sha(u.href)}${path.extname(u.pathname) || ".png"}`;
}
async function fetchSafe(url) {
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(25000) });
      if (r.status >= 500) throw Error(`HTTP ${r.status}`);
      return r;
    } catch (e) {
      last = e;
    }
  }
  throw last;
}
async function mirror(value) {
  if (!value || /^(data:|#)/.test(value)) return value;
  const u = new URL(value, origin);
  if (!hosts.has(u.hostname))
    throw Error(`Unreviewed asset host ${u.hostname}`);
  const dest = assetPath(u);
  if (pendingAssets.has(u.href)) return pendingAssets.get(u.href);
  const work = (async () => {
    const file = path.resolve(root, "." + dest);
    if (!file.startsWith(root + path.sep)) throw Error("Invalid asset path");
    await mkdir(path.dirname(file), { recursive: true });
    try {
      await access(file);
    } catch {
      const r = await fetchSafe(u);
      if (!r.ok) throw Error(`Asset ${r.status}: ${u.href}`);
      let data = Buffer.from(await r.arrayBuffer());
      if (u.pathname.endsWith(".css"))
        data = Buffer.from(await cssLocal(data.toString(), u.href));
      await writeFile(file, data);
    }
    assets.set(u.href, dest);
    return dest;
  })();
  pendingAssets.set(u.href, work);
  return work;
}
async function cssLocal(css, base = origin) {
  const matches = [...css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)];
  for (const m of matches) {
    if (!m[2] || m[2].startsWith("data:") || m[2].startsWith("#")) continue;
    const local = await mirror(new URL(m[2], base).href);
    css = css.replaceAll(m[0], `url("${local}")`);
  }
  return css;
}
function decodeEmails($) {
  $("[data-cfemail]").each((_, el) => {
    const e = $(el),
      hex = e.attr("data-cfemail"),
      key = parseInt(hex.slice(0, 2), 16);
    let value = "";
    for (let i = 2; i < hex.length; i += 2)
      value += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
    if (el.name === "a") e.attr("href", "mailto:" + value);
    else if (
      e.closest("a").attr("href")?.includes("/cdn-cgi/l/email-protection")
    )
      e.closest("a").attr("href", "mailto:" + value);
    e.text(value).removeAttr("data-cfemail").removeClass("__cf_email__");
  });
}
async function localize($) {
  decodeEmails($);
  // Preserve all public page markup; only CMS/runtime scripts are replaced.
  $("script").remove();
  for (const el of $("img,source,video,audio,trustindex-image").toArray())
    for (const attr of ["src", "poster", "data-imgurl"]) {
      const value = $(el).attr(attr);
      if (value) $(el).attr(attr, await mirror(value));
    }
  for (const el of $("[srcset]").toArray()) {
    const values = $(el).attr("srcset").split(",");
    const result = [];
    for (const v of values) {
      const match = v.trim().match(/^(.*)\s+(\d+(?:\.\d+)?[wx])$/);
      const url = match ? match[1] : v.trim();
      result.push((await mirror(url)) + (match ? " " + match[2] : ""));
    }
    $(el).attr("srcset", result.join(", "));
  }
  for (const el of $("[style]").toArray())
    $(el).attr("style", await cssLocal($(el).attr("style")));
  for (const el of $("a[href]").toArray()) {
    const value = $(el).attr("href");
    if (/^(mailto:|tel:|#|javascript:)/i.test(value)) continue;
    const u = new URL(value, origin);
    if (["www.gawpoe.com", "gawpoe.com"].includes(u.hostname)) {
      if (
        u.pathname.startsWith("/wp-content/") ||
        u.pathname.startsWith("/wp-includes/")
      )
        $(el).attr("href", await mirror(u.href));
      else if (!/^\/(wp-admin|wp-json|wp-login|xmlrpc)/.test(u.pathname)) {
        $(el).attr("href", u.pathname + u.search + u.hash);
        if (!u.search) queue.push(u.pathname);
        else if (u.searchParams.has("p") || u.searchParams.has("page_id"))
          queue.push(u.pathname + u.search);
      }
    }
  }
  // The source embeds the full reviews in a template; make it real DOM for the static carousel.
  $("template#trustindex-google-widget-html").each((_, el) => {
    const html = $(el).html();
    const pre = $(el).parent("pre.ti-widget");
    if (pre.length) pre.replaceWith(html);
    else $(el).replaceWith(html);
  });
  $("trustindex-image").each((_, el) => {
    const e = $(el),
      img = $("<img>");
    for (const [k, v] of Object.entries(el.attribs))
      if (k !== "data-imgurl") img.attr(k, v);
    img.attr("src", e.attr("data-imgurl"));
    e.replaceWith(img);
  });
  $("[data-template-id=trustindex-google-widget-html]").remove();
  $("style").remove();
}
async function capture(route) {
  if (seen.has(route)) return;
  seen.add(route);
  if (seen.size > 500) throw Error("Unexpected crawl scope");
  const response = await fetchSafe(origin + route);
  if (!response.ok) {
    missing.push({ path: route, status: response.status });
    return;
  }
  const finalUrl = new URL(response.url);
  if (!["www.gawpoe.com", "gawpoe.com"].includes(finalUrl.hostname))
    throw Error("External page redirect");
  const queryPath = mediaCapture.queryPages?.[route];
  if (
    !queryPath &&
    (finalUrl.pathname !== route.split("?")[0] || route.includes("?"))
  ) {
    redirects.push({ from: route, to: finalUrl.pathname, status: 301 });
    queue.push(finalUrl.pathname);
    return;
  }
  const html = await response.text();
  await writeFile(path.join(cache, sha(route) + ".html"), html);
  const $ = load(html);
  let css = "";
  for (const el of $("style,link[rel=stylesheet]").toArray()) {
    if (el.name === "style") css += (await cssLocal($(el).html())) + "\n";
    else {
      const href = $(el).attr("href");
      const r = await fetchSafe(href);
      if (!r.ok) throw Error(`Stylesheet ${r.status}`);
      css += (await cssLocal(await r.text(), href)) + "\n";
    }
  }
  if ($("template#trustindex-google-widget-html").length) {
    const href = origin + "/wp-content/uploads/trustindex-google-widget.css";
    const r = await fetchSafe(href);
    if (!r.ok) throw Error("Missing reviews CSS");
    css += (await cssLocal(await r.text(), href)) + "\n";
  }
  const bodyClass = $("body").attr("class") || "";
  const title = $("title").text();
  const description =
    $("meta[name=description]").attr("content") ||
    $("main p").first().text().trim().slice(0, 200);
  css = css.replace(/[ \t]+$/gm, "").trimEnd() + "\n";
  const cssPath = "/site-css/" + sha(css) + ".css";
  await mkdir("public/site-css", { recursive: true });
  await writeFile("public" + cssPath, css);
  decodeEmails($);
  const sourceText = $("main").text().replace(/\s+/g, " ").trim();
  const sourceLinks = $("main a[href]")
    .map((_, el) => $(el).attr("href"))
    .get();
  await localize($);
  const site = $(".wp-site-blocks").first();
  if (!site.length) throw Error("No site content " + route);
  pages.push({
    path: queryPath || route,
    title,
    description,
    bodyClass,
    cssPath,
    html: site.toString().replace(/[ \t]+$/gm, ""),
    sourceText,
    sourceLinks,
    sourceFile: sha(route) + ".html",
  });
  console.log("Captured", route);
}
while (queue.length) {
  const batch = queue.splice(0, 5);
  await Promise.all(batch.map(capture));
}
// Retain the original sitemap endpoint family and public feed URLs as static documents.
for (const url of [sitemap.source, ...(sitemap.childSitemaps || [])]) {
  const u = new URL(url);
  const r = await fetchSafe(u);
  if (r.ok) {
    await mkdir(path.dirname("public" + u.pathname), { recursive: true });
    await writeFile("public" + u.pathname, await r.text());
  }
}
for (const row of missing.filter(
  (x) => x.path != "/cdn-cgi/l/email-protection",
)) {
  const old = baseline.content.find((p) => "/" + p.path + "/" === row.path);
  if (!old) continue;
  const reference = pages.find((p) => p.path === "/christopher-wimmer/");
  const $ = load(reference.html, null, false);
  $(".wp-block-post-content").html(old.html);
  await localize($);
  pages.push({
    ...reference,
    path: row.path,
    title: old.title + " – Gaw Poe",
    html: $.html().replace(/[ \t]+$/gm, ""),
    sourceText: $("main").text().replace(/\s+/g, " ").trim(),
    legacy: true,
    sourceFile: null,
    sourceLinks: [],
  });
}
validateCapture({
  pages,
  requiredPaths: [
    ...sitemap.routes.map((p) => p.path),
    ...legacy,
    ...Object.values(mediaCapture.queryPages || {}),
  ],
  missing,
  redirects,
});
const payload = {
  capturedAt: new Date().toISOString(),
  source: origin,
  pages: pages.sort((a, b) => a.path.localeCompare(b.path)),
  redirects,
  missing,
  assets: Object.fromEntries(
    [...assets].sort(([a], [b]) => a.localeCompare(b)),
  ),
};
await writeFile(
  "src/content/generated/live-site.json",
  JSON.stringify(payload, null, 2) + "\n",
);
const queryRedirects = {};
for (const page of pages) {
  if (page.legacy || page.path.startsWith("/attachment/")) continue;
  const match = page.bodyClass.match(/\b(page-id|postid)-(\d+)\b/);
  if (match)
    queryRedirects[
      `/?${match[1] === "page-id" ? "page_id" : "p"}=${match[2]}`
    ] = page.path;
}
await writeFile(
  "src/data/query-redirects.json",
  JSON.stringify(
    {
      ...Object.fromEntries(
        Object.entries(mediaCapture.redirects).filter(([key]) =>
          key.includes("?"),
        ),
      ),
      ...queryRedirects,
    },
    null,
    2,
  ) + "\n",
);
await writeFile(
  "public/legacy-redirects.json",
  JSON.stringify(
    {
      ...mediaCapture.redirects,
      ...queryRedirects,
      ...Object.fromEntries(redirects.map((r) => [r.from, r.to])),
    },
    null,
    2,
  ) + "\n",
);
// Archive obsolete generated CSS only after the complete capture has been saved.
// This prevents repeated refreshes accumulating duplicate, unreferenced exports.
const referencedCss = new Set(pages.map((page) => path.basename(page.cssPath)));
await mkdir("artifacts/retired-site-css", { recursive: true });
for (const file of await readdir("public/site-css")) {
  if (/^[a-f0-9]{16}\.css$/.test(file) && !referencedCss.has(file))
    await rename(
      path.join("public/site-css", file),
      path.join("artifacts/retired-site-css", file),
    );
}
console.log(
  JSON.stringify({
    pages: pages.length,
    redirects: redirects.length,
    missing,
    assets: assets.size,
  }),
);
