import { test, expect } from '@playwright/test';
for (const width of [1440, 390]) {
 test(`Law360 press entry ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/press/');
  const title='5-Hour Energy Sellers Ask 9th Circ. To Revive Antitrust Fight';
  const thumbnail=page.locator('.wp-block-latest-posts__list > li').first().locator('img');
  await expect(thumbnail).toBeVisible();
  await expect(thumbnail).toHaveAttribute('src','/images/press/james-r-browning-courthouse.webp');
  await expect.poll(()=>thumbnail.evaluate((img: HTMLImageElement)=>img.complete && img.naturalWidth===1844)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:`artifacts/law360-2543038-press-${width}.png`,fullPage:true});
  await thumbnail.click();
  await expect(page.locator('.wp-block-post-title')).toHaveText(title);
  await expect(page.locator('.wp-block-post-content')).toContainText('October 27, 2026');
  await expect(page.locator('.wp-block-post-content').getByRole('link', {name:'Read more'})).toHaveAttribute('href','https://www.law360.com/california/articles/2543038');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  const image=page.locator('.wp-site-blocks > .wp-block-post-featured-image img');
  await expect(image).toBeVisible();
  expect(await image.evaluate((img: HTMLImageElement)=>img.complete && img.naturalWidth===1844)).toBe(true);
  await expect(page.locator('figcaption')).toHaveCount(0);
  const credit=page.locator('.wp-block-post-content > .press-photo-credit');
  await expect(credit).toBeVisible();
  await expect(credit).toContainText('CC BY-SA 4.0');
  await expect(credit.getByRole('link', {name:'CC BY-SA 4.0'})).toHaveAttribute('href','https://creativecommons.org/licenses/by-sa/4.0/');
  const creditBox=await credit.boundingBox();
  const readMoreBox=await page.getByRole('link', {name:'Read more',exact:true}).boundingBox();
  expect(creditBox!.y).toBeGreaterThan(readMoreBox!.y+readMoreBox!.height);
  expect(await credit.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBe(12);
  const feature=page.locator('.wp-site-blocks > .wp-block-post-featured-image');
  const actual=await feature.boundingBox();
  const heading=await page.locator('.wp-block-post-title').boundingBox();
  expect(actual!.y+actual!.height).toBeLessThan(heading!.y);
  expect(actual!.width).toBeLessThanOrEqual(1000);
  expect(await image.evaluate(el=>getComputedStyle(el).borderRadius)).toBe('0px');
  // The new thumbnail must inherit the same 110px sidebar image height as its neighbor.
  const sidebarImages=page.locator('.sidebar .wp-block-latest-posts__featured-image img');
  expect(await sidebarImages.first().evaluate(el=>getComputedStyle(el).height)).toBe(await sidebarImages.nth(1).evaluate(el=>getComputedStyle(el).height));
  await page.screenshot({path:`artifacts/law360-2543038-${width}.png`,fullPage:true});
 });
}
