# Gaw | Poe LLP — faithful static migration

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
- The full public media catalog: 167 entries, 757 original/resized file URLs, preserved at original upload paths.
- 166 attachment permalinks retain their original redirect destinations. Legacy page/post/media query-ID aliases are captured in `public/legacy-redirects.json`.
- Original sitemap-family URLs, canonical page URLs, full main text and source links are checked.

`tests/fixtures/legacy-routes.json` pins the original URL inventory. The live sitemap, full captured pages, public media catalog and redirect manifest provide independently inspectable coverage. This inventory describes the public routes discovered from these sources, not every arbitrary URL a server might accept.

## Refresh from the live source

```sh
npm run refresh:content
npm run build
npm test
npm run compare:live
```

Refresh captures anonymous public rendered HTML and styles, crawls internal page links, and mirrors public images, documents, fonts and CSS dependencies. It preserves content and theme presentation instead of substituting new templates. Public email obfuscation becomes ordinary mailto links. Script execution is limited to the local menu/query-redirect behavior and the original locally mirrored reviews runtime. Original source snapshots and screenshots live in ignored `artifacts/`; authenticated browser content must never be committed.

`compare:live` compares anonymous source and preview pages at desktop/mobile widths, recording computed typography, colors, geometry and full-page screenshots. Start the preview first. The fixture in `tests/fixtures/live-style-baseline.json` pins the October 4 source measurements for offline regression checks. Animated ticker/carousel frames can differ across screenshots.

## Redirects and hosting

The preview serves captured redirects as HTTP 301s. The export includes `_redirects` path rules for compatible hosts, HTML fallback redirects for attachment paths, and a browser fallback for WordPress query-ID aliases. A static host such as GitHub Pages does **not** automatically apply `_redirects`, nor can static HTML alone issue HTTP 301 query redirects. A production cutover must install/verify the manifest's path and query rules on the selected host before changing DNS. The migration is prepared for review, not deployed.

## Reviews runtime provenance

`public/vendor/trustindex-loader.js` is the original public runtime from `https://cdn.trustindex.io/loader.js?ver=1`, captured October 4, 2026. The original eight reviews, local images and styling remain in the snapshot. Its slider, relative dates, read-more controls and activity-triggered initialization are preserved. Tests verify that initialization requires no remote asset or WordPress request. Refreshing reviews is an explicit content capture, not a background production API call.

## Verification and release scope

Tests cover every preserved route, main-text/link fidelity, local asset/font resolution, the entire media catalog, attachment redirects, archive pagination, original desktop/mobile style measurements, mobile menu, moving ticker and reviews controls. CI validates the PR; it does not deploy. Source site, domain and production remain untouched.

Next.js is updated within 15.x and PostCSS is overridden to a patched compatible 8.x version. Production dependency audit is clean; the ESLint development dependency chain retains the upstream braces advisory. Do not apply automatic major-version downgrades from audit suggestions.
