# Activate the permanent GawPoe dev site

## Context and authorization

Jonathan explicitly requested deploying the reviewed rebuild to dev so he has a stable site to view. Production deployment and PR merge are not part of that request. The existing Zion Apache vhost, DNS and valid wildcard certificate already supported `gawpoe.dev.upinthe.xyz`, but its configured document root was absent.

## Decision

Activate the already-tested static export from `f56d21e31eaf2c78dcd5c2209669a441d96ef345` as a versioned release, with dev-only Apache headers and redirects generated from the captured manifests. Do not create a Node service, alter DNS, reload shared Apache, or modify Gilead/WordPress. Use the existing document-root path as a symlink to the immutable release. Store file checksums and an activation receipt outside the served tree.

## Validation and outcome

An isolated, unprivileged Apache listener on Zion validated the staged release before public activation. This exposed Apache interpreting percent-encoded filename bytes as condition backreferences in six redirects. Escape literal percent signs in the generator and rerun all checks. All 1,345 release-file hashes then matched; the staged and public host audits each passed 1,371 cases (131 pages, 788 assets, 444 redirects, six feeds, sitemap family and true 404). Browser verification runs against the public host with `BASE_URL`, not localhost.

## Boundaries and rollback

Only the dev site was activated. No production, DNS, shared-vhost, database, or PR-merge changes. Future releases switch the symlink atomically while retaining previous releases. This first activation had no previous target; withdrawing it would restore the former unpopulated dev host, not affect production. Keep the release available until an explicitly authorized update or withdrawal.
