# Faithful WordPress-to-Next.js migration

## Context

The original baseline had imported content and incomplete archives. The first review iteration redesigned templates and changed fonts/colors while omitting original homepage interactions. Jonathan explicitly rejected those changes: preserve every URL and maintain the existing site faithfully. The ephemeral preview process also died after the turn.

## Options

1. Continue recreating the design with new templates.
2. Capture original public markup, CSS, media and widget behavior into the existing Next.js static exporter.
3. Keep WordPress in production unchanged.

## Decision

Use option 2 for the review branch; production stays on option 3 until separately approved. This supersedes the initial decision to replace theme chrome. Preserve original typography, colors, complete page bodies and links, layout, ticker and reviews carousel. Keep the original Trustindex runtime local; use no WordPress runtime. Public captures only, never authenticated admin content. Run preview and tunnel in persistent tmux windows.

## Evidence and actions

The expanded crawl found 129 live content/archive pages plus one retired baseline page and one query-only attachment page (131 rendered pages total). The public media catalog contains 167 entries and 757 original/resized files. Capture attachment and query redirects, preserve original upload paths, and verify all 108 baseline routes. Compare anonymous original and local pages at desktop/mobile widths and pin source style measurements. Keep source captures/screenshots ignored and commit the static export and reproducible checks.

## Release boundary

No merge, deployment, DNS change or live WordPress edit. At a separately approved production cutover, configure HTTP path/query redirects from the captured manifest and verify on the actual host. HTML/browser fallback navigation is not equivalent to an HTTP 301. Existing source layout quirks are retained instead of silently redesigned.

## Follow-up: exhaustive review and shared fragments

Jonathan requested a walkthrough of every page and DRY shared header/footer/About content. Extract a single header and footer with per-page active-link/layout bindings, a single About firm fragment across 92 pages, and shared sidebar blocks with explicit source-specific variants. Keep unique article content and attorney contact details distinct. Do not add wrapper elements that alter WordPress layout selectors. Ordinary builds expand source fragments; public refresh explicitly regenerates them.

The exhaustive review exposed a `<main>`-only test gap (92 source templates have no main element) and a skip-link insertion that shifted the absolute header down. Replace the text contract with complete primary-region hashes/links from anonymous originals and place the skip link before the site root as WordPress does. Verify every page at desktop/mobile widths with full screenshots and element positions, not just typography and box sizes.

## Follow-up: head resources, feeds and safe refresh

Continued review found six live RSS endpoints advertised in WordPress page heads and three browser/touch icon links missing from the static metadata. Capture the exact public RSS XML, retain page-specific discovery links and local icon paths, and declare feed MIME headers for the preview and compatible static hosts. Host-specific header configuration remains a production-cutover prerequisite.

An importer could record a missing page without rejecting the incomplete snapshot. Validate the entire required/discovered route set before replacing the page snapshot, accepting only a successfully retained legacy page or captured canonical redirect. Archive obsolete generated CSS after successful capture to prevent duplicated export assets. A full live refresh preserved every existing body, text contract, shared fragment and CSS byte; targeted tests cover missing-page rejection, feeds, all page heads and keyboard focus containment.

## Follow-up: exact sitemap parity, media integrity and stable dev planning

Jonathan prioritized sitemap parity and complete image migration, and clarified that RSS is optional. Generate the canonical sitemap from the independent WordPress sitemap inventory (113 entries), not every preserved route (131). Retain all route bodies, including pagination and legacy endpoints. Validate exact sets in both directions and preserve original sitemap-family endpoints. Verify fresh source bytes for the full media catalog and additional captured images; persist hash/dimension evidence and enforce it offline on future exports.

Prefer reusing the existing but unpopulated `gawpoe.dev.upinthe.xyz` Apache vhost on Zion instead of adding another platform or occupying A&R demo slots. Prepare a versioned static-release/symlink plan with noindex and actual Apache redirect rules. Activation is a separate approval; current authorization is fixes and planning only. Production origin confirmed as Cloudflare-to-Gilead using an observed tagged public request, not inferred solely from DNS.

The deeper image audit found five full-resolution originals listed in WordPress `media_details.original_image`, outside its registered size map. Preserve those as well: the library file inventory increases from 757 to 762, and the full image/media audit to 788 assets. This is an actual completeness fix, not merely a new count. Also normalize one differently encoded but pixel-identical external PNG to the fresh source bytes.
