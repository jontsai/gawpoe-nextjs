# GawPoe permanent dev deployment — October 5, 2026

- **Public review URL:** https://gawpoe.dev.upinthe.xyz/
- **Source site commit:** `f56d21e31eaf2c78dcd5c2209669a441d96ef345` from open PR #1; no merge required or performed.
- **Host:** Zion, existing Apache vhost and wildcard TLS. No tunnel dependency, Node daemon, DNS change or shared-server reload.
- **Release:** `/home/jontsai/sites/gawpoe-nextjs/releases/f56d21e31eaf2c78dcd5c2209669a441d96ef345-dev1`
- **Active document root:** `/home/jontsai/code/gawpoe/gawpoe-nextjs/docs` → the versioned release.
- **Remote receipt and file manifest:** `/home/jontsai/sites/gawpoe-nextjs/verification/f56d21e-dev1-{receipt,file-manifest}.json` (outside the public web root).
- **Release construction:** exact committed `docs` export plus seven generated dev-only `.htaccess` files (one root and six feed directories). No source/config credentials transferred.

## Checks

All 1,345 staged file SHA-256 hashes matched the local export plus generated dev configuration, with no missing or extra files. Before activation, a separate loopback-only Apache instance tested actual per-directory behavior; it did not alter or restart shared Apache.

Staged and public HTTPS audits passed all 1,371 checks:

- 131 pages: status, original primary content hashes and production canonical URLs.
- 788 media/image assets: exact verified source SHA-256 values over HTTP.
- 444 legacy path/query aliases: HTTP 301, correct destination, no redirect to production.
- Six existing RSS feeds: byte equality and XML MIME type.
- Both generated/original sitemap families: exactly 113 source URLs.
- Genuine 404 handling rather than returning the homepage.
- `X-Robots-Tag: noindex, nofollow` on successful, redirect and error responses.

Per-URL evidence: [dev-host-audit.json](dev-host-audit.json). The same audit is repeatable with `node scripts/audit-dev-host.mjs`. The browser suite targets this host with `BASE_URL=https://gawpoe.dev.upinthe.xyz npm run test:browser`.

The staging pass exposed six percent-encoded filename redirects being interpreted as Apache condition backreferences. The generator now escapes literal percent signs; the final staged/public checks include all six corrected cases. No page HTML, CSS, images or frontend interaction code changed during deployment.

## Operations

Future dev updates should create and verify a new immutable release, record its exact source revision and generated host-rule hashes, then atomically switch the document-root symlink. Keep the old release/receipt to allow reversal. Never edit the current release in place. The first activation had no previous document-root target; production always remained separate on Cloudflare → Gilead → WordPress.

Temporary staging Apache is stopped after checks; its configuration and logs remain outside the web root as evidence. The previous temporary tunnel need not be used to review this dev release.

## Browser verification

All 30 public-host browser cases pass, including desktop/mobile page screenshots, typography/layout baselines, menu focus/Escape, ticker motion, reviews controls and no remote WordPress assets. The first public run passed 29 cases and exposed one localhost-only assertion expecting a relative Location header; Apache correctly returns an absolute same-origin URL. The assertion now checks origin plus destination path/query, and its targeted recheck passes. The separate HTTP audit already verified all 444 actual redirect destinations.
