# Resume the static-site rebuild

## Context

The existing migration baseline imported 105 content entries but had invalid primary navigation, theme-dependent HTML, remote images, and three placeholder archives. The current public site has new profiles and posts since the original snapshot.

## Options

1. Extend the existing Next.js/nextjs-htk migration.
2. Start over in a new repository.
3. Continue changing WordPress.

## Decision

Extend the isolated existing migration branch. Preserve original routes, import current public content, mirror needed assets, and replace theme chrome with responsive React templates. Keep content refresh explicit so ordinary builds work without WordPress. Keep retired content accessible and marked archival.

## Verification

Check original and current URL coverage, all local links/images, canonical metadata, archive membership, directory completeness, responsive layout, mobile navigation and contact interactions. Build and check via pull-request CI, with no deployment automation.

## Follow-up

Review the preview and PR before any merge or production cutover. Hosting/domain/redirect changes require a separate approved release. Track the development-only ESLint/braces advisory until an upstream compatible fix exists; production dependencies pass the audit.
