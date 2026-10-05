import { test, expect } from "@playwright/test";
for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test.describe(`${viewport.width}px`, () => {
    test.use({ viewport });
    for (const path of [
      "/",
      "/team/",
      "/randolph-gaw/",
      "/kristin-menon/",
      "/business-litigation/",
      "/about/",
      "/press/",
      "/contact-us/",
    ])
      test(`renders ${path}`, async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto(path);
        await expect(page.locator("h1")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        expect(
          await page
            .locator("img")
            .evaluateAll((imgs) =>
              imgs
                .filter(
                  (img) =>
                    (img as HTMLImageElement).complete &&
                    !(img as HTMLImageElement).naturalWidth,
                )
                .map((img) => img.getAttribute("src")),
            ),
        ).toEqual([]);
        expect(errors).toEqual([]);
        await page.screenshot({
          path: `artifacts/${viewport.width}-${path.replaceAll("/", "") || "home"}.png`,
          fullPage: true,
        });
      });
  });
}
test("mobile navigation opens, navigates and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const button = page.locator(".menu-toggle");
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Our Team" })
    .click();
  await expect(page).toHaveURL(/\/team\/$/);
  await expect(page.getByRole("button", { name: /menu/i })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});
test("contact actions and keyboard skip link", async ({ page }) => {
  await page.goto("/contact-us/");
  await expect(
    page.locator('main a[href="mailto:contact@gawpoe.com"]'),
  ).toBeVisible();
  await expect(page.locator('main a[href="tel:+14157667451"]')).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
});
