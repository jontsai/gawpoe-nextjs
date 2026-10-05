import media from "../../src/data/media-redirects.json";
import baseline from "../fixtures/live-style-baseline.json";
import { test, expect } from "@playwright/test";
for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
])
  test.describe(`${viewport.width}px`, () => {
    test.use({ viewport });
    for (const path of [
      "/",
      "/team/",
      "/randolph-gaw/",
      "/kristin-menon/",
      "/business-litigation/",
      "/about/",
      "/3d-printing-company-plans-to-challenge-arbitrators-11-million-award/",
      "/press/",
      "/contact-us/",
      "/category/uncategorized/page/9/",
    ])
      test(`faithful rendering ${path}`, async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator(".wp-site-blocks")).toBeVisible();
        expect(
          await page
            .locator("header")
            .evaluate((e) => Math.round(e.getBoundingClientRect().y)),
        ).toBe(0);
        expect(
          await page.evaluate(() => getComputedStyle(document.body).fontFamily),
        ).toBe('"Open Sans", sans-serif');
        expect(errors).toEqual([]);
        await page.screenshot({
          path: `artifacts/faithful-${viewport.width}-${path.replaceAll("/", "") || "home"}.png`,
          fullPage: true,
          animations: "disabled",
        });
      });
  });
test("original mobile menu opens, keyboard closes and navigates", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const button = page.getByRole("button", { name: "Open menu", exact: true });
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await button.click();
  await page
    .locator("nav")
    .getByRole("link", { name: "Team", exact: true })
    .click();
  await expect(page).toHaveURL(/\/team\/$/);
});
test("homepage results ticker actually moves", async ({ page }) => {
  await page.goto("/");
  const ticker = page.locator(".ticker");
  const first = await ticker.evaluate((e) => getComputedStyle(e).transform);
  await expect
    .poll(() => ticker.evaluate((e) => getComputedStyle(e).transform))
    .not.toBe(first);
});
test("original reviews carousel, dates, read-more and controls work", async ({
  page,
}) => {
  await page.goto("/");
  await page.mouse.move(100, 100);
  const widget = page.locator(".ti-widget.ti-goog");
  await widget.scrollIntoViewIfNeeded();
  const items = widget.locator(".ti-review-item:not(.ti-cloned)");
  await expect(items).toHaveCount(8);
  await expect(widget.locator(".ti-date").first()).toContainText("ago");
  await expect(widget.locator(".ti-read-more")).toHaveCount(8);
  const first = items.first();
  const before = await first.evaluate((e) =>
    Math.round(e.getBoundingClientRect().x),
  );
  await page.getByRole("button", { name: "Next review", exact: true }).click();
  await expect
    .poll(() => first.evaluate((e) => Math.round(e.getBoundingClientRect().x)))
    .not.toBe(before);
});
test("archive pagination is navigable", async ({ page }) => {
  await page.goto("/category/uncategorized/");
  await page
    .locator('main a[href="/category/uncategorized/page/2/"]')
    .first()
    .click();
  await expect(page).toHaveURL(/\/category\/uncategorized\/page\/2\/$/);
  await expect(page.locator("main")).toContainText("Next");
});

test("legacy WordPress ID URLs redirect to the matching content", async ({
  request,
}) => {
  for (const [url, target] of [
    ["/?page_id=124", "/mark-poe/"],
    [
      "/?p=1025",
      "/3d-printing-company-plans-to-challenge-arbitrators-11-million-award/",
    ],
  ]) {
    const response = await request.get(url, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers().location).toBe(target);
  }
});

test("all preserved attachment permalinks and query aliases redirect correctly", async ({
  request,
}) => {
  for (const [from, to] of Object.entries(media.redirects)) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status(), from).toBe(301);
    expect(response.headers().location, from).toBe(to);
  }
});

test("homepage initializes without requesting any WordPress backend or remote asset", async ({
  page,
}) => {
  const remote: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:3186")
      remote.push(request.url());
  });
  await page.goto("/");
  await page.mouse.move(100, 100);
  await page.locator(".ti-widget.ti-goog").scrollIntoViewIfNeeded();
  await expect(page.locator(".ti-date").first()).toContainText("ago");
  expect(remote).toEqual([]);
});

test("desktop/mobile typography, palette and hero geometry match the anonymous live baseline", async ({
  page,
}) => {
  for (const item of baseline) {
    await page.setViewportSize({ width: item.width, height: 1000 });
    await page.goto(item.path);
    await page.evaluate(() => document.fonts.ready);
    for (const [key, selector] of Object.entries({
      body: "body",
      header: "header",
      hero: ".top-bnr",
      heading: "h2",
      logo: ".wp-block-site-title",
    })) {
      const expected = item.metrics[key as keyof typeof item.metrics];
      if (!expected) continue;
      const actual = await page
        .locator(selector)
        .first()
        .evaluate((e) => {
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
        });
      const { height, ...stableExpected } = expected as typeof actual;
      const { height: actualHeight, ...stableActual } = actual;
      expect(stableActual, `${item.width} ${item.path} ${key}`).toEqual(
        stableExpected,
      );
      if (key !== "body") expect(actualHeight).toBe(height);
    }
  }
});
