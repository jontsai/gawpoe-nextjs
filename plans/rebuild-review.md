# Gaw/Poe static rebuild

## Goal

Complete the existing Next.js / nextjs-htk migration as a reviewable static site without changing production.

## Acceptance

- Preserve all baseline URLs and incorporate current public WordPress content.
- Working navigation, team/practice directories and complete filtered press archives.
- Locally mirrored media; no WordPress runtime dependency.
- Responsive, keyboard-accessible pages with canonicals and sitemap.
- Reproducible offline build; route/link/media checks and browser verification.

## Implementation

Refresh the import with archive metadata and local media, build purpose-designed home and directories, retain editorial bodies in readable templates, and verify static export. Changes are limited to app, importer, checks, snapshots, static assets, generated export and project docs.

## Review

No production merge, DNS change or deployment. Use isolated preview for desktop/mobile screenshots and interaction checks.
