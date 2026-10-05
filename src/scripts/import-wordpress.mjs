import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { load } from "cheerio";

const site = "https://www.gawpoe.com";
const output = "src/content/generated/wordpress.json";
const old = JSON.parse(await readFile(output, "utf8"));
async function collection(type) {
  const all = [];
  for (let page = 1, total = 1; page <= total; page++) {
    const response = await fetch(
      `${site}/wp-json/wp/v2/${type}?per_page=100&page=${page}&_embed=1`,
      { signal: AbortSignal.timeout(30000) },
    );
    if (!response.ok) throw new Error(`${type}: HTTP ${response.status}`);
    total = Number(response.headers.get("x-wp-totalpages") || 1);
    all.push(...(await response.json()));
  }
  return all;
}
const [pages, posts, categories, users] = await Promise.all(
  ["pages", "posts", "categories", "users"].map(collection),
);
const text = (html) =>
  load(html || "")
    .text()
    .replace(/\s+/g, " ")
    .trim();
const localPath = (url) => new URL(url, site).pathname.replace(/^\/|\/$/g, "");
const assets = new Map();
async function mirror(value) {
  if (!value || (value.startsWith("/") && !value.startsWith("//")))
    return value;
  const url = new URL(value, site);
  if (
    ![
      "www.gawpoe.com",
      "gawpoe.com",
      "cms.chambers.com",
      "ocweekly.com",
    ].includes(url.hostname)
  )
    throw new Error(`Unreviewed media host: ${url.hostname}`);
  if (assets.has(url.href)) return assets.get(url.href);
  const ext = path.extname(url.pathname) || ".png";
  const name = `${createHash("sha256").update(url.href).digest("hex").slice(0, 12)}-${path.basename(url.pathname).replace(/[^a-zA-Z0-9._-]/g, "-")}${path.extname(url.pathname) ? "" : ext}`;
  const target = `/media/${name}`;
  try {
    await access(`public${target}`);
  } catch {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok)
      throw new Error(`Media HTTP ${response.status}: ${url.href}`);
    await writeFile(
      `public${target}`,
      Buffer.from(await response.arrayBuffer()),
    );
  }
  assets.set(url.href, target);
  return target;
}
await mkdir("public/media", { recursive: true });
const teamHtml = load(pages.find((p) => p.slug === "team").content.rendered);
const team = teamHtml(".blk-team")
  .toArray()
  .flatMap((el) => {
    const e = teamHtml(el),
      href = e.find("h2 a").attr("href");
    return href
      ? [
          {
            path: localPath(href),
            name: text(e.find("h2").html()),
            role: text(e.find("h3").html()),
            education: e.find("p").last().text().trim(),
            image: e.find("img").first().attr("src"),
          },
        ]
      : [];
  });
for (const person of team) person.image = await mirror(person.image);
const content = [];
for (const [kind, items] of [
  ["page", pages],
  ["post", posts],
]) {
  for (const item of items) {
    const $ = load(item.content.rendered, null, false);
    // Theme chrome is replaced by the site shell; editorial body remains intact.
    $(
      ".sidebar,.top-bnr,.practice-top-bnr,.wp-block-spacer,.blk-latest-press",
    ).remove();
    $("script,style,iframe,form,object,embed").remove();
    const person = team.find((p) => p.path === localPath(item.link));
    if (person) {
      const links = $(".team-bio-header a")
        .toArray()
        .map((el) => ({
          href: $(el).attr("href"),
          label: $(el).attr("href")?.includes("linkedin.com")
            ? "LinkedIn"
            : "Chambers profile",
        }));
      person.links = links;
      $(".team-bio-header,.chambers-badge").remove();
    }
    // The React page heading replaces the duplicated editorial title.
    $("h1,h2").each((_, el) => {
      if (
        text($(el).html()).toLowerCase() ===
        text(item.title.rendered).toLowerCase()
      )
        $(el).remove();
    });
    $("*").each((_, el) => {
      for (const key of Object.keys(el.attribs || {}))
        if (
          key.startsWith("on") ||
          [
            "style",
            "srcset",
            "sizes",
            "data-object-fit",
            "data-object-position",
          ].includes(key)
        )
          $(el).removeAttr(key);
    });
    for (const el of $("img").toArray()) {
      const img = $(el);
      img.attr("src", await mirror(img.attr("src")));
      img.attr("loading", "lazy");
    }
    for (const el of $("a").toArray()) {
      const a = $(el),
        href = a.attr("href");
      if (!href) continue;
      if (/^javascript:/i.test(href)) {
        a.removeAttr("href");
        continue;
      }
      const url = new URL(href, site);
      if (["www.gawpoe.com", "gawpoe.com"].includes(url.hostname)) {
        a.attr(
          "href",
          url.pathname.startsWith("/wp-content/uploads/")
            ? await mirror(url.href)
            : `${url.pathname}${url.search}${url.hash}`,
        );
      }
      if (a.attr("target") === "_blank") a.attr("rel", "noopener noreferrer");
    }
    const title = text(item.title.rendered),
      html = $.html().replace(/[ \t]+$/gm, "");
    content.push({
      id: item.id,
      kind,
      slug: item.slug,
      path: localPath(item.link),
      sourceUrl: item.link,
      title,
      excerpt: text(item.excerpt?.rendered || html).slice(0, 220),
      date: item.date,
      modified: item.modified,
      author: item.author,
      categories: item.categories || [],
      featuredImage: item._embedded?.["wp:featuredmedia"]?.[0]?.source_url
        ? await mirror(item._embedded["wp:featuredmedia"][0].source_url)
        : null,
      html,
    });
  }
}
// Retain retired baseline URLs as readable archival content, not silent 404s.
for (const item of old.content)
  if (!content.some((p) => p.path === item.path)) {
    const $ = load(item.html, null, false);
    $(".sidebar,.top-bnr,.practice-top-bnr,.wp-block-spacer").remove();
    for (const el of $("img").toArray()) {
      const img = $(el);
      img
        .removeAttr("srcset")
        .removeAttr("sizes")
        .attr("src", await mirror(img.attr("src")));
    }
    $("a[href]").each((_, el) => {
      const a = $(el);
      a.attr(
        "href",
        a.attr("href").replace(/^https?:\/\/(?:www\.)?gawpoe\.com/, ""),
      );
    });
    content.push({
      ...item,
      html: $.html(),
      archived: true,
      author: null,
      categories: [],
    });
  }
const home = load(pages.find((p) => p.slug === "home").content.rendered);
const results = home(".item-collection-1 .ticker__item")
  .toArray()
  .filter((el) => home(el).find(".number").length)
  .map((el) => ({
    value: home(el).find(".number").text().trim(),
    label: home(el)
      .find(".blk-txt")
      .text()
      .replace(/(Trial\/Arbitration)(Victories)/, "$1 $2")
      .replace(/(Successful)(Settlements)/, "$1 $2")
      .replace(/(Trial|Appellate)(Record)/, "$1 $2")
      .trim(),
  }));
const visuals = {
  hero: await mirror(home(".top-bnr img").first().attr("src")),
  founders: await mirror(home(".blk-gaw-poe-intro > img").attr("src")),
  chambers: await mirror(home(".chambers-badge img").attr("src")),
};
const payload = {
  generatedAt: new Date().toISOString(),
  source: site,
  counts: {
    pages: pages.length,
    posts: posts.length,
    content: content.length,
    assets: assets.size,
  },
  team,
  visuals,
  results,
  categories: categories.map((c) => ({
    id: c.id,
    path: localPath(c.link),
    name: c.name,
  })),
  authors: users.map((u) => ({
    id: u.id,
    path: localPath(u.link),
    name: u.name,
  })),
  content: content.sort((a, b) => a.path.localeCompare(b.path)),
  assets: Object.fromEntries(assets),
};
await writeFile(output, JSON.stringify(payload, null, 2) + "\n");
console.log(
  `Imported ${content.length} entries, ${team.length} team members, ${assets.size} local assets.`,
);
