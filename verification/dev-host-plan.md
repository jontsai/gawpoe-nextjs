# Permanent GawPoe dev site — original plan

**Activated October 5, 2026 with Jonathan’s explicit dev-deployment instruction.** See [deployment record](dev-deployment.md) for actual release and verification. The text below records the pre-activation plan and earlier observations.

Verified October 4, 2026 PDT / October 5 UTC. This is a plan only. No remote files, services, production WordPress, or DNS were changed.

## Current production: Cloudflare → Gilead → WordPress

- Apex/www public A responses: `104.21.90.61`, `172.67.153.163` (Cloudflare); authoritative nameservers `drew.ns.cloudflare.com` and `liv.ns.cloudflare.com`.
- `gilead.kebu.me`: `23.239.23.64`.
- Read-only SSH inspection: Apache active, nginx inactive. The enabled GawPoe TLS virtual host serves `/home/deploy/sites/gawpoe.com/www`, ultimately pointing to `/home/jontsai/sites/gawpoe.com/www_v3`.
- Direct HTTPS to Gilead with the production hostname/SNI returned the same sitemap bytes as the public Cloudflare endpoint.
- Stronger origin evidence: the uniquely tagged public request `GET /wp-sitemap.xml?migration_origin_probe=20261005T0637` appeared in Gilead's Apache access log with HTTP 200 from a Cloudflare address. This confirms the public request actually reached Gilead, rather than merely finding a matching dormant copy.
- The nginx migration configuration in the infrastructure repository is prepared configuration, **not the current running server**.

## Existing dev infrastructure — reuse it

`https://gawpoe.dev.upinthe.xyz/` already exists:

- DNS resolves via `upinthe.xyz` to Zion (`66.175.220.156`).
- Live Apache virtual host: `20_upinthe.xyz/10_gawpoe.dev.conf` under the enabled deployable config tree.
- HTTP redirects to HTTPS; HTTPS currently returns **403**, not a working preview.
- Configured document root: `/home/jontsai/code/gawpoe/gawpoe-nextjs/docs`. That directory and its checkout do not exist yet.
- Valid existing certificate includes `*.dev.upinthe.xyz`; observed validity August 17–November 15, 2026. Normal host certificate renewal remains infrastructure-owned.
- A&R's `demo1`–`demo4.dev.upinthe.xyz` use Apache directory roots under `/home/jontsai/sites/nextjs-demos/`, with symlinks choosing individual static builds. Demo2 currently points to an isolated A&R review build. GawPoe can use the same static-release model without taking over an A&R slot.

## Proposed first dev release

1. Recheck the existing host config, DNS, certificate, directory absence and Apache modules immediately before activation; do not overwrite anything created meanwhile.
2. Build and verify an exact reviewed commit from PR #1 (`feat/rebuild-review`), keeping its current base unchanged. Run build, tests, typecheck/lint, sitemap parity and browser checks. Record that commit in a release receipt.
3. Transfer **only the generated static export** to a new versioned directory on Zion, proposed `/home/jontsai/sites/gawpoe-nextjs/releases/<full-commit>/`. No repository credentials, source `.env` files, or WordPress database are needed on the host. Build locally or in CI; no persistent Next.js/Node service is needed.
4. In the staged dev release, create an Apache `.htaccess` from the checked-in redirect/feed manifests, scoped to this dev host:
   - `X-Robots-Tag: noindex, nofollow` on every response, including errors/assets.
   - Disable directory listings; serve existing files and directory indexes; genuinely missing URLs return 404 using the exported 404 page, never a homepage/SPA catch-all.
   - Real HTTP 301 rules for captured attachment paths and WordPress page/post/media query-ID aliases. Keep redirect targets on the dev host; drop consumed ID query parameters to avoid loops. Preserve unrelated query strings appropriately.
   - If retaining the already captured optional feeds, serve their directory-index XML with `application/rss+xml`. XML sitemaps must have XML MIME types. Apache does not interpret `_headers` or `_redirects` automatically.
   - Keep production canonical links (`https://www.gawpoe.com/...`); do not rewrite site content or source sitemaps to advertise dev URLs.
5. Validate those Apache-specific behaviors against the staged release before exposing it. Confirm required modules/AllowOverride permissions. Prepare rules in the infrastructure review workflow if the existing per-directory override is insufficient; do not silently broaden server config.
6. After Jonathan authorizes dev activation, create the missing parent directory and atomically set the existing configured `docs` path to a symlink to the verified release. The current vhost already has `AllowOverride All`; no DNS change and ordinarily no Apache reload are needed. Preserve any preexisting target discovered at preflight.
7. Verify actual public HTTPS: all 131 pages, 788 audited media/image assets, both sitemap families (113 exact source entries), representative and automated path/query redirects, true 404, noindex headers, desktop/mobile rendering, ticker, review slider and menu. Verify media SHA-256 values on the served release, not only local files. Confirm production remains unchanged.
8. Only after the stable dev site passes, replace the temporary tunnel link in the review handoff. Keep the tunnel during verification; no promise that a tunnel URL is permanent.

## Updates and rollback

Publish one complete tested release per reviewed commit, then atomically swap the `docs` symlink. Keep the previous target and release receipt. Rollback switches the symlink back; no database, production DNS, or WordPress rollback is involved. Never edit a currently served release in place. Do not auto-deploy arbitrary branch pushes or merge PR #1 as part of this plan.

## Scope decision

Recommend the existing dedicated `gawpoe.dev.upinthe.xyz` hostname first. Additional branch slots such as `gawpoe-pr1.dev.upinthe.xyz` can be added later if simultaneous reviews need them; those require their own explicit virtual host and release root. No new DNS/TLS platform or GawBot wiring is needed for the first dev site.

RSS is optional, not a launch requirement. The already captured feeds remain unchanged in this patch; there is no further RSS feature work. Jonathan's current request authorizes sitemap/image fixes and this hosting plan, not activation of the remote dev site or a production cutover.
