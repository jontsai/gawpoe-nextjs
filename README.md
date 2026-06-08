# Gaw/Poe Next.js Static Site

Static-export Next.js migration for `www.gawpoe.com`.

## Sitemap Coverage

The build uses `https://www.gawpoe.com/wp-sitemap.xml` as the source of truth.

```bash
npm run sync:sitemap
npm run build
```

`npm run build` refreshes `src/data/wp-sitemap.json`, generates static routes for every URL in the WordPress sitemap child indexes, and fails after export if any expected path is missing from `out/`.
