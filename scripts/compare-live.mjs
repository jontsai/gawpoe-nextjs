import { chromium } from "@playwright/test";
import { writeFile, mkdir } from "node:fs/promises";
await mkdir("artifacts/comparison", { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = [];
for (const width of [1440, 390])
  for (const route of [
    "/",
    "/team/",
    "/business-litigation/",
    "/randolph-gaw/",
    "/contact-us/",
  ]) {
    const pair = [];
    for (const [name, base] of [
      ["original", "https://www.gawpoe.com"],
      ["preview", "http://127.0.0.1:3186"],
    ]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      await page.goto(base + route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      if (route === "/") {
        await page.mouse.move(100, 100);
        await page.waitForFunction(
          () => document.querySelector(".ti-widget[data-trustindex-widget]"),
          {},
          { timeout: 15000 },
        );
        await page.waitForTimeout(1000);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      const metrics = await page.evaluate(() => {
        const pick = (s) => {
          const e = document.querySelector(s);
          if (!e) return null;
          const c = getComputedStyle(e),
            r = e.getBoundingClientRect();
          return {
            font: c.fontFamily,
            size: c.fontSize,
            weight: c.fontWeight,
            color: c.color,
            background: c.backgroundColor,
            width: Math.round(r.width),
            height: Math.round(r.height),
          };
        };
        return {
          body: pick("body"),
          header: pick("header"),
          hero: pick(".top-bnr"),
          heading: pick("h2"),
          logo: pick(".wp-block-site-title"),
          main: pick("main"),
          ticker: pick(".ticker"),
          reviewCount: document.querySelectorAll(".ti-review-item").length,
        };
      });
      await page.screenshot({
        path: `artifacts/comparison/${width}-${route.replaceAll("/", "") || "home"}-${name}.png`,
        fullPage: true,
        animations: "disabled",
      });
      pair.push({ name, metrics });
      await page.close();
    }
    report.push({ width, route, pair });
    console.log(width, route, JSON.stringify(pair));
  }
await browser.close();
await writeFile(
  "artifacts/comparison/report.json",
  JSON.stringify(report, null, 2),
);
