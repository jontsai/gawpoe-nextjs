# Gaw | Poe LLP — faithful static migration

**Stable review site:** https://gawpoe.dev.upinthe.xyz/ — Zion, dev only, search-engine indexing disabled. Production remains on WordPress.

Next.js App Router, using the existing nextjs-htk project/export conventions. WordPress is a capture source, not a runtime dependency. This is a **faithful migration, not a redesign**: original layout, Raleway/Open Sans fonts, colors, imagery, results ticker, reviews carousel, navigation, sidebar and footer are retained.

## Build and verify

Node 22 or newer:

```sh
npm ci
npm run lint
npm run build
npm test
npm run typecheck
npx playwright install chromium
npm run test:browser
npm run preview
```

Builds use checked-in snapshots and assets without contacting WordPress. `out/` is generated; `docs/` is the committed static export plus `.nojekyll`. The preview serves only `out/` on loopback port 3186 with noindex headers. `next start` does not support static exports.

For a persistent review session, run the preview and your tunnel in separate tmux windows. A temporary tunnel is not production hosting and its URL lasts only while that tunnel runs. No production deployment or DNS configuration is included.

## Preservation inventory — October 4, 2026

- All 108 original snapshot URLs remain available.
- 113 live sitemap URLs, plus 16 linked archive-pagination pages: 129 live HTML pages.
- The retired `/christopher-wimmer1/` baseline body is retained in the current theme shell (the live source now returns 404), for 130 content pages. One additional query-only attachment page is preserved at `/attachment/1344/`, with its original `/?attachment_id=1344` alias, for 131 rendered pages total.
- The full public media catalog: 167 entries, 762 original/resized file URLs, preserved at original upload paths.
- 166 attachment permalinks retain their original redirect destinations. Legacy page/post/media query-ID aliases are captured in `public/legacy-redirects.json`.
- All six RSS feed URLs advertised by the original site, page-specific feed-discovery links, and original browser/Apple-touch icons are preserved.
- Original sitemap-family URLs, canonical page URLs, full primary text and source links are checked.

`tests/fixtures/legacy-routes.json` pins the original URL inventory. The live sitemap, full captured pages, public media catalog and redirect manifest provide independently inspectable coverage. This inventory describes the public routes discovered from these sources, not every arbitrary URL a server might accept.

## Refresh from the live source

```sh
npm run refresh:content
npm run build
npm test
npm run compare:live
```

Refresh captures anonymous public rendered HTML and styles, crawls internal page links, and mirrors public images, documents, fonts and CSS dependencies. It preserves content and theme presentation instead of substituting new templates. Public email obfuscation becomes ordinary mailto links. Missing required/discovered pages stop the capture before its page snapshot is replaced; an explicitly retained legacy page is allowed. A successful refresh archives unreferenced generated CSS outside the export instead of accumulating duplicate styles. Script execution is limited to the local menu/query-redirect behavior and the original locally mirrored reviews runtime. Original source snapshots and screenshots live in ignored `artifacts/`; authenticated browser content must never be committed.

`compare:live` compares anonymous source and preview pages at desktop/mobile widths, recording computed typography, colors, geometry and full-page screenshots. Start the preview first. The fixture in `tests/fixtures/live-style-baseline.json` pins the October 4 source measurements for offline regression checks. Animated ticker/carousel frames can differ across screenshots.

## Shared fragments (DRY authoring)

Edit shared markup once under `src/content/fragments/`:

- `header.html` and `footer.html`: one layout source used by all 131 rendered pages.
- `about-firm.html`: the complete **About Gaw | Poe LLP** heading/blurb, referenced by 92 pages, including all 91 articles.
- `latest-press*.html` and `sidebar-contact*.html`: shared sidebar blocks. Named variants preserve source differences; attorney-specific contact information is not replaced with the general firm contact.

The per-page snapshot stores fragment references, unique page bodies and the original active-link/layout bindings. `src/lib/fragments.mjs` expands these during the static build without adding DOM wrappers. Static HTML necessarily repeats the rendered header/footer for independent page loads; the **authoring source does not**. The page snapshot is 56% smaller after extraction. The retained legacy snapshot now contains only the one retired page actually needed.

`npm run import:wp` recaptures the public source and extracts shared fragments. Ordinary `npm run build` renders existing fragments, so a shared-fragment edit propagates to every referencing page. An explicit WordPress refresh can overwrite local fragment edits; review that diff. Source-text hashes are fidelity baselines, so intentional content changes also require a reviewed update to the expected content contract.

## Exhaustive page review

```sh
npm run preview
# Separate terminal; contacts the public source and takes several minutes:
npm run audit:pages
```

The audit visits every rendered page at 1440px and 390px widths (262 page/viewport cases), scrolls through images, checks status/runtime errors/image loading, compares full primary content and links against the live source, records computed font/color/position/geometry, and writes paired full-page screenshots with pixel-difference measurements. The retired page is checked locally against its retained snapshot because its former live URL returns 404. Reviews are masked only in screenshot comparisons because they animate; dedicated interaction tests cover the widget. The ticker is frozen only for comparison screenshots; interaction tests verify that it moves normally.

Results and screenshots are in ignored `artifacts/page-audit/`. A reviewed route-by-route summary is kept in `verification/page-audit.md`. The earlier `<main>`-only text test was insufficient for 92 original templates; the current content contract checks the full primary site region and explicitly covers all 91 article bodies.

## Redirects and hosting

The preview serves captured redirects as HTTP 301s. The export includes `_redirects` path rules for compatible hosts, HTML fallback redirects for attachment paths, and a browser fallback for WordPress query-ID aliases. A static host such as GitHub Pages does **not** automatically apply `_redirects`, nor can static HTML alone issue HTTP 301 query redirects. A production cutover must install/verify the manifest's path and query rules on the selected host before changing DNS. The migration is prepared for review, not deployed.

RSS documents are exported at each original `/.../feed/` route as `index.html` (for directory-index serving) and `index.xml` (an explicit XML URL). `public/_headers` supplies `application/rss+xml` for header-aware hosts; the preview applies the same MIME type. The chosen production host must apply these headers or equivalent routing—GitHub Pages does not apply `_headers` automatically. Feed content is refreshed with the source snapshot, not fetched from WordPress at runtime.

## Reviews runtime provenance

`public/vendor/trustindex-loader.js` is the original public runtime from `https://cdn.trustindex.io/loader.js?ver=1`, captured October 4, 2026. The original eight reviews, local images and styling remain in the snapshot. Its slider, relative dates, read-more controls and activity-triggered initialization are preserved. Tests verify that initialization requires no remote asset or WordPress request. Refreshing reviews is an explicit content capture, not a background production API call.

## Verification and release scope

Tests cover every preserved route, full primary-text/link fidelity, local asset/font resolution, the entire media catalog, attachment redirects, archive pagination, original desktop/mobile style measurements, mobile menu, moving ticker and reviews controls. CI validates the PR; it does not deploy. Source site, domain and production remain untouched.

Next.js is updated within 15.x and PostCSS is overridden to a patched compatible 8.x version. Production dependency audit is clean; the ESLint development dependency chain retains the upstream braces advisory. Do not apply automatic major-version downgrades from audit suggestions.

## Exact sitemap and image-source audits

The generated `/sitemap.xml` and preserved WordPress sitemap family contain exactly the same **113 published source URLs**. The broader **131 rendered routes** remain served; archive pagination, the retained retired profile, and the query-only attachment are not additional sitemap entries. Build-time checks reject missing **or extra** sitemap entries.

After building, run `npm run audit:sitemaps` and `npm run audit:media` for fresh public-source comparisons. The media audit covers 762 library files plus theme/review images (788 assets total), verifies source/public/export SHA-256 equality, and fully decodes raster images. Ordinary offline tests enforce the verified media hashes. See [sitemap/image review](verification/sitemap-and-media-review.md) and [permanent dev-site plan](verification/dev-host-plan.md). RSS remains optional; existing captured feeds are preserved without further feature work.


## Verify the permanent dev host

```sh
BASE_URL=https://gawpoe.dev.upinthe.xyz npm run test:browser
node scripts/audit-dev-host.mjs
```

The host audit verifies every page's content/canonical URL, all 788 media hashes, all 444 captured path/query redirects, both sitemap families, feed MIME types, noindex and a genuine 404. The browser suite accepts `BASE_URL` and checks rendering/interaction against that actual host rather than silently starting localhost.

`scripts/prepare-apache-dev.mjs <isolated-export-directory>` creates dev-only Apache rules in a **copy** of the committed export; it refuses the usual `public`, `docs`, and `out` roots. Never include dev noindex rules in a production export. Versioned releases and the activation receipt live outside the web root on Zion; see [dev deployment record](verification/dev-deployment.md). Future updates require explicit dev deployment scope, stage checks, and an atomic document-root symlink switch, not editing the served release in place.
