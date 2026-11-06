# Gaw | Poe LLP

The Gaw | Poe LLP website, built with Next.js, React, and TypeScript.

**Website:** [www.gawpoe.com](https://www.gawpoe.com/)

## Features

- Responsive pages for the firm, attorneys, practice areas, and news.
- Shared header, footer, and article components for consistent updates.
- Static HTML, locally hosted images and fonts, and a generated XML sitemap.
- Automated build, content-integrity, and desktop/mobile browser checks.

## Local development

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

To build and preview the static site:

```sh
npm run build
npm run preview
```

## Project structure

- `src/app/` — pages, layouts, and metadata.
- `src/components/` — interactive components and site behavior.
- `src/content/` — page content and reusable fragments.
- `public/` — images, fonts, and other static assets.
- `docs/` — committed static export used by GitHub Pages.
- `tests/` — content and browser regression checks.

Shared markup lives in `src/content/fragments/`, including the header, footer, and “About Gaw | Poe LLP” article blurb. Edit a shared fragment once to update every page that uses it.

## Checks

```sh
npm run lint
npm run build
npm test
npm run typecheck
npx playwright install chromium
npm run test:browser
```

## Publishing

`npm run build` generates the static site in `out/` and copies it to `docs/`, the same export used by GitHub Pages. A static web server can serve `docs/` directly; no application server or separate preview build is required. Building a branch does not publish it to GitHub Pages.

GitHub Actions runs verification on pull requests and pushes to `master`. The Pages workflow publishes the committed `docs/` export from `master`, using `www.gawpoe.com` as the custom domain. Rebuild the export when changing site content or code.

## Editing page content

Each URL now has its own source directory under `src/content/pages/`:

```text
src/content/pages/index.html                  # homepage body
src/content/pages/page.json                   # homepage metadata
src/content/pages/about/index.html            # /about/ body
src/content/pages/about/page.json             # /about/ metadata
src/content/pages/press/page/2/index.html      # /press/page/2/ body
src/content/pages/press/page/2/page.json        # /press/page/2/ metadata
src/content/fragments/*.html                  # shared header/footer/sidebar
src/content/site.json                        # site-wide capture provenance/redirects
```

Edit a page's **`index.html`** for its unique markup and **`page.json`** for its
SEO title/description, stylesheet, body classes, fragment bindings and content
integrity contract. The `path` must match the directory (`/` at the root).
HTML is plain HTML, not an escaped JSON string. Existing `<!--fragment:name-->`
markers expand shared fragments at build time; keep them when editing a page.
There is no aggregate page-content file to edit or regenerate.

For a new page, create both files in the route directory, using a comparable
existing page as a template. Review its metadata, source links, fragment bindings
and independently verified content-contract fields rather than blindly copying
them. Add public sitemap entries to the appropriate `src/data/wp-sitemap.json`
and `public/wp-sitemap-*.xml` inventories and relevant shared listing fragments.
Update regression tests for intended content changes; retain existing URL and
content-integrity checks. Nested routes work without adding a React route file.

Run the checks above, including the build, and commit the resulting `docs/`
export together with the source change. `docs/` is generated publication output,
not an authoring location. A merged PR is not proof that a host has deployed it.

The former WordPress capture/refresh commands are **retired and fail before any
writes or network requests**. The live site is now an output, not an import
source. Do not run a recapture to add or edit content. Historical capture scripts
remain only as migration reference and are guarded against accidental use.
