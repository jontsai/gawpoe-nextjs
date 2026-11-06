import { test, expect } from '@playwright/test';
for (const width of [1440, 390]) {
 test(`Law360 press entry ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/press/');
  const title='5-Hour Energy Sellers Ask 9th Circ. To Revive Antitrust Fight';
  await page.getByRole('link', { name: title, exact: true }).click();
  await expect(page.locator('.wp-block-post-title')).toHaveText(title);
  await expect(page.locator('.wp-block-post-content')).toContainText('October 27, 2026');
  await expect(page.locator('.wp-block-post-content').getByRole('link', {name:'Read more'})).toHaveAttribute('href','https://www.law360.com/california/articles/2543038');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  const image=page.locator('.wp-block-post-content img');
  await expect(image).toBeVisible();
  expect(await image.evaluate((img: HTMLImageElement)=>img.complete && img.naturalWidth===1844)).toBe(true);
  await expect(page.locator('figcaption')).toContainText('CC BY-SA 4.0');
  await page.screenshot({path:`artifacts/law360-2543038-${width}.png`,fullPage:true});
 });
}
