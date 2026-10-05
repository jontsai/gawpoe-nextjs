import { chromium } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
const capture = JSON.parse(
  await readFile("src/content/generated/live-site.json", "utf8"),
);
const root = process.env.AUDIT_OUTPUT || "artifacts/page-audit";
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = [];
let index = 0;
const selectedPaths = process.env.AUDIT_PATHS?.split(",");
const selectedPages = selectedPaths
  ? capture.pages.filter((page) => selectedPaths.includes(page.path))
  : capture.pages;
const tasks = selectedPages.flatMap((page) =>
  [1440, 390].map((width) => ({ page, width })),
);
function normalizeLink(href) {
  const u = new URL(href, "https://www.gawpoe.com");
  if (["www.gawpoe.com", "gawpoe.com", "127.0.0.1"].includes(u.hostname))
    return u.pathname + u.search + u.hash;
  return capture.assets[u.href] || u.href;
}
async function inspect(tab, url, width, screenshot) {
  const errors = [];
  const onError = (e) => errors.push(e.message);
  tab.on("pageerror", onError);
  const response = await tab.goto(url, {
    waitUntil: "networkidle",
    timeout: 45000,
  });
  await tab.evaluate(() => document.fonts.ready);
  await tab.mouse.move(100, 100);
  const widget = tab.locator(".ti-widget.ti-goog");
  if (await widget.count()) {
    await widget.scrollIntoViewIfNeeded();
    await tab.waitForFunction(
      () => document.querySelector(".ti-widget[data-trustindex-widget]"),
      null,
      { timeout: 15000 },
    );
  }
  await tab.addStyleTag({
    content:
      ".ticker{animation:none!important;transform:translateX(0)!important}html{scroll-behavior:auto!important}",
  });
  for (
    let y = 0, height = await tab.evaluate(() => document.body.scrollHeight);
    y < height;
    y += 800
  ) {
    await tab.evaluate((y) => window.scrollTo(0, y), y);
    await tab.waitForTimeout(40);
  }
  await tab.evaluate(() =>
    Promise.all(
      [...document.images]
        .filter((i) => !i.complete)
        .map((i) =>
          Promise.race([
            new Promise((r) => {
              i.addEventListener("load", r, { once: true });
              i.addEventListener("error", r, { once: true });
            }),
            new Promise((r) => setTimeout(r, 4000)),
          ]),
        ),
    ),
  );
  await tab.evaluate(async () => {
    window.scrollTo(0, 0);
    await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  await tab.waitForTimeout(150);
  const data = await tab.evaluate(() => {
    const root = document.querySelector(".wp-site-blocks");
    if (!root) throw Error("Missing site root");
    const clone = root.cloneNode(true);
    clone
      .querySelectorAll(
        "header,footer,script,style,template,.ti-widget,.skip-link",
      )
      .forEach((e) => e.remove());
    const normalize = (s) => s.replace(/\s+/g, " ").trim();
    const pick = (s) => {
      const e = document.querySelector(s);
      if (!e) return null;
      const c = getComputedStyle(e),
        r = e.getBoundingClientRect();
      return {
        font: c.fontFamily,
        size: c.fontSize,
        color: c.color,
        background: c.backgroundColor,
        x: Math.round(r.x),
        y: Math.round(r.y),
        width: Math.round(r.width),
        height: Math.round(r.height),
      };
    };
    return {
      title: document.title,
      text: normalize(clone.textContent),
      links: [...clone.querySelectorAll("a[href]")].map((a) =>
        a.getAttribute("href"),
      ),
      headerCount: document.querySelectorAll(".wp-site-blocks > header").length,
      footerCount: document.querySelectorAll(".wp-site-blocks > footer").length,
      aboutCount: document.querySelectorAll(".blk-about-gaw-poe").length,
      articleCharacters: normalize(
        document.querySelector(".wp-block-post-content")?.textContent || "",
      ).length,
      styles: {
        body: pick("body"),
        header: pick("header"),
        footer: pick("footer"),
        heading: pick("h1"),
        article: pick(".wp-block-post-content"),
      },
      brokenImages: [...document.images]
        .filter((i) => i.src && i.complete && !i.naturalWidth)
        .map((i) => i.getAttribute("src")),
    };
  });
  await tab.screenshot({
    path: screenshot,
    fullPage: true,
    animations: "disabled",
    mask: (await widget.count()) ? [widget] : [],
  });
  tab.off("pageerror", onError);
  return { ...data, status: response.status(), errors };
}
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (index < tasks.length) {
      const { page, width } = tasks[index++];
      // Isolate each viewport case to avoid retained responsive-image and font rasterization state.
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
      });
      const original = await context.newPage(),
        preview = await context.newPage();
      const slug = page.path.replaceAll("/", "_") || "home";
      const folder = `${root}/${width}`;
      await mkdir(folder, { recursive: true });
      await original.setViewportSize({ width, height: 1000 });
      await preview.setViewportSize({ width, height: 1000 });
      const row = {
        path: page.path,
        width,
        basis: page.legacy
          ? "retained baseline; live source 404"
          : "live source",
        issues: [],
      };
      try {
        const local = await inspect(
          preview,
          "http://127.0.0.1:3186" + page.path,
          width,
          `${folder}/${slug}-preview.png`,
        );
        row.status = local.status;
        row.characters = local.text.length;
        row.articleCharacters = local.articleCharacters;
        row.aboutCount = local.aboutCount;
        if (local.status !== 200)
          row.issues.push(`Preview HTTP ${local.status}`);
        if (local.errors.length) row.issues.push(...local.errors);
        if (local.brokenImages.length)
          row.issues.push(`Broken images: ${local.brokenImages.join(", ")}`);
        if (local.headerCount !== 1 || local.footerCount !== 1)
          row.issues.push("Header/footer count mismatch");
        if (!page.legacy) {
          const sourceUrl =
            page.path === "/attachment/1344/"
              ? "https://www.gawpoe.com/?attachment_id=1344"
              : "https://www.gawpoe.com" + page.path;
          const live = await inspect(
            original,
            sourceUrl,
            width,
            `${folder}/${slug}-original.png`,
          );
          row.sourceStatus = live.status;
          row.sourceBrokenImages = live.brokenImages;
          row.sourceErrors = live.errors;
          if (live.status !== 200)
            row.issues.push(`Source HTTP ${live.status}`);
          if (live.title !== local.title) row.issues.push("Title mismatch");
          if (live.text !== local.text) {
            row.issues.push("Full content text mismatch");
            await writeFile(
              `${folder}/${slug}-text.json`,
              JSON.stringify({ live: live.text, preview: local.text }, null, 2),
            );
          }
          const localLinks = new Set(local.links.map(normalizeLink));
          const missing = live.links
            .map(normalizeLink)
            .filter((h) => !localLinks.has(h));
          if (missing.length)
            row.issues.push(`Missing links: ${missing.join(", ")}`);
          if (JSON.stringify(live.styles) !== JSON.stringify(local.styles)) {
            row.issues.push("Computed style/geometry mismatch");
            row.styleDifference = { live: live.styles, preview: local.styles };
          }
          const [a, b] = await Promise.all([
            sharp(`${folder}/${slug}-original.png`)
              .ensureAlpha()
              .raw()
              .toBuffer({ resolveWithObject: true }),
            sharp(`${folder}/${slug}-preview.png`)
              .ensureAlpha()
              .raw()
              .toBuffer({ resolveWithObject: true }),
          ]);
          if (
            a.info.width === b.info.width &&
            a.info.height === b.info.height
          ) {
            let diff = 0;
            for (let i = 0; i < a.data.length; i += 4) {
              if (
                Math.max(
                  Math.abs(a.data[i] - b.data[i]),
                  Math.abs(a.data[i + 1] - b.data[i + 1]),
                  Math.abs(a.data[i + 2] - b.data[i + 2]),
                ) > 32
              )
                diff++;
            }
            row.pixelDifferencePercent = Number(
              ((100 * diff) / (a.info.width * a.info.height)).toFixed(3),
            );
            if (row.pixelDifferencePercent > 0.5)
              row.issues.push("Screenshot difference exceeds 0.5%");
          } else {
            row.issues.push("Screenshot dimensions differ");
            row.imageSizes = { source: a.info, preview: b.info };
          }
        }
      } catch (e) {
        row.issues.push(e.message);
      }
      report.push(row);
      console.log(
        JSON.stringify({
          completed: report.length,
          total: tasks.length,
          ...row,
        }),
      );
      await writeFile(`${root}/report.json`, JSON.stringify(report, null, 2));
      await context.close();
    }
  }),
);
await browser.close();
console.log(
  JSON.stringify({
    checked: report.length,
    withIssues: report.filter((r) => r.issues.length).length,
  }),
);
if (report.some((r) => r.issues.length)) process.exitCode = 1;
