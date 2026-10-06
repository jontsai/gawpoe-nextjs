import { test } from "node:test";
import { checkSitemapParity } from "../scripts/check-sitemap-parity.mjs";
test("generated and preserved WordPress sitemaps have exact source URL parity", () => {
  checkSitemapParity("out");
  checkSitemapParity("docs");
});
