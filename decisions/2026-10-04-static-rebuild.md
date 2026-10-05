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
