# Sitemap parity and image preservation

## Sitemap: exact URL-set comparison

The earlier coverage check ensured that every source URL had an exported page. It did **not** check that the generated sitemap's URL set matched WordPress exactly.

Fresh comparison against the public WordPress sitemap index and all four children found:

| Inventory | Before | After |
|---|---:|---:|
| WordPress sitemap URLs | 113 | 113 |
| Generated `/sitemap.xml` URLs | 131 | 113 |
| Missing source URLs | 0 | 0 |
| Additional generated sitemap URLs | 18 | 0 |

Source breakdown: 91 posts, 19 pages, one category archive and two author archives. The 18 extra listings were 16 pagination routes, the retained retired profile and the query-only attachment page. **Only their sitemap listings changed; all 131 rendered routes remain available**, including all 108 original snapshot URLs.

The generated sitemap now uses the independently captured WordPress sitemap inventory. Each build rejects differences in either direction, duplicate generated entries, and differences in the preserved original `/wp-sitemap.xml` index/children. `npm run audit:sitemaps` separately re-fetches the live sitemap tree and compares the built export, so an offline pinned inventory is not mistaken for a fresh live check.

Machine-readable evidence: [sitemap-audit.json](sitemap-audit.json).

## All images and media, including responsive sizes

`npm run audit:media` re-fetches the public WordPress media catalog and every catalog asset, plus captured theme/review/external image assets. It compares SHA-256 hashes across the fresh source response and all three copies (`public`, `out`, `docs`). Raster images are fully decoded with Sharp to check validity and dimensions, not merely file existence. Existing export/browser checks cover page image references, responsive `srcset`, CSS image/font URLs, and rendering at desktop/mobile widths.

The live library still has **167 entries and 762 distinct original/resized file URLs**, with no missing or extra catalog URLs after correction. The earlier 757-file inventory omitted five full-resolution originals stored separately in WordPress `media_details.original_image`; these are now mirrored at their original upload paths, and the importer and independent live audit both include that field. These include the Randy, Mark Poe and Chris Wimmer photos, a city background, and an article image. Including additional theme/review images, the audit covers **788 assets**. The first pass found one external LinkedIn PNG with a different encoding; decoded dimensions and RGBA pixel hash were identical. Its local copy now uses the exact fresh source bytes as well. This was not a missing or visually different image.

Machine-readable evidence includes per-file source URL, local path, byte size, SHA-256, decoded dimensions and outcome: [media-audit.json](media-audit.json). An offline regression test checks exported bytes against these verified source hashes on every test run. Live audits contact public sources only and must be deliberately rerun when refreshing source content; ordinary builds remain offline.

## Hosting and release boundary

[Permanent dev-site plan and verified production origin](dev-host-plan.md). Production runs through Cloudflare to Gilead. Existing GawPoe dev DNS/HTTPS/vhost on Zion can be reused, but currently returns 403 because its document root is absent. No remote configuration, DNS, or production changes were made.

## Final verification

Build, lint, typecheck, 13 offline export/refresh/integrity checks and 30 browser tests pass. Fresh source sitemap comparison has zero differences; all 788 asset comparisons pass. Comparing the rendered primary HTML before/after shows zero changes across all 131 pages. Public tunnel `/sitemap.xml` serves 113 entries, and all five added full-resolution originals return the expected source hashes through the public preview. A fresh-browser homepage screenshot was reviewed. The permanent dev host remains unactivated.
