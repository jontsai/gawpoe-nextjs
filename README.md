# Gaw | Poe LLP — static website

Next.js App Router + `@hacktoolkit/nextjs-htk`, exported as plain HTML/CSS/JS for static hosting. The toolkit supplies contact-link utilities. WordPress is an **import source**, never a runtime dependency.

## Local development

Node 22 or newer:

```sh
npm ci
npm run dev
```

## Build and verify

```sh
npm run lint
npm run build
npm test
npm run typecheck
npx playwright install chromium
npm run preview
# In another terminal:
npm run test:browser
```

The reproducible build uses the checked-in content snapshot and assets. `out/` is the build output; `docs/` is the identical committed export plus `.nojekyll`. `npm run preview` serves **only** `out/` on loopback port 3186 with `X-Robots-Tag: noindex, nofollow`. It does not expose source files. Use a static host for production; `next start` is not compatible with static export.

## Refresh public content

```sh
npm run refresh:content
npm run build
npm test
```

The explicit refresh imports current public pages/posts, category and author membership, team profiles and homepage results. It mirrors images and linked documents locally, strips WordPress theme chrome, keeps editorial bodies and normalizes internal links. Fetch failures stop the refresh rather than silently dropping content. Review the resulting content and asset diff before committing. Retired baseline content remains accessible as an archival page.

Production source: <https://www.gawpoe.com/> and its public WordPress API/sitemap. Original migration coverage is pinned in `tests/fixtures/legacy-routes.json`; all 108 original URLs are regression checked alongside current sitemap URLs. Archive pages contain their actual matching posts, not migration placeholders.

## Review scope

- Responsive homepage, practice directory, seven-member team directory, biographies, press and contact.
- Current public content, preserved legacy URLs, canonical metadata, sitemap and local media.
- Mobile menu, keyboard skip link, phone/email/directions links.
- Offline build plus export link/media/canonical tests and desktop/mobile browser tests.
- CI validates pull requests only. No deploy workflow, production changes, DNS changes or live WordPress edits.

Before a production cutover, separately approve the release and confirm hosting redirects, domain mapping and final content. The temporary preview is not the production site.

## Dependency audit

Next.js is updated within the existing 15.x release line; PostCSS is overridden to a patched compatible 8.x version. `npm audit --omit=dev` is clean. The ESLint development dependency chain still reports the upstream `braces` pattern-parser advisory with no compatible upstream fix; it does not ship in the static output. Do not run automatic major-version downgrades suggested by `npm audit fix --force`.
