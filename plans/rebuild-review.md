# Gaw/Poe faithful migration review

## Goal

Resume the existing Next.js/nextjs-htk migration without changing production. The earlier redesigned preview did not meet the requirement and is superseded by the faithful source capture.

## Acceptance

- Preserve all original URLs and current public pages, linked archive pagination, media file paths, attachment links and WordPress ID aliases.
- Retain original fonts, colors, layout, page text, images, sidebar/footer, results ticker and reviews slider behavior.
- Build reproducibly from local snapshots without a WordPress runtime dependency.
- Compare anonymous live and preview desktop/mobile rendering; verify content and interaction behavior.
- Keep a persistent review preview running and update the existing PR. No merge or production deployment.

## Implementation

Capture rendered public page markup and CSS in source order, mirror assets at original paths, and render through static Next.js routes. Preserve the original reviews runtime locally and implement the small WordPress navigation interactions. Retain the retired baseline page in the original theme shell. Export host redirect rules with static fallbacks and document query-rule requirements before cutover.

## Review evidence

131 rendered pages (including the query-only attachment), 166 attachment permalink redirects and 757 media-library file URLs; all 108 baseline URLs covered. Ten live/preview desktop/mobile comparisons have matching recorded typography, colors and geometry. Offline regression, interaction and route/media tests run in PR CI.
