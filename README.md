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

For pre-merge reviews without updating the committed `docs/` export:

```sh
npm run build:preview
python3 scripts/serve-dev-preview.py
```

The preview build generates `out/` and revision metadata at `out/preview.json`.
The Python 3.10+ preview server listens only on `http://127.0.0.1:3186` and supports
legacy redirects, RSS content types, noindex headers, and missing-page responses.
Run `python3 tests/dev-preview.test.py` to check the preview server.
Preview builds do not publish the site or modify the production export.

GitHub Actions runs verification on pull requests and pushes to `master`. The Pages workflow publishes the committed `docs/` export from `master`, using `www.gawpoe.com` as the custom domain. Rebuild the export when changing site content or code.
