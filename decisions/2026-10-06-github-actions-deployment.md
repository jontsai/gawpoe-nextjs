# GitHub Actions deployment and master default branch

## Request

Jonathan requested GitHub Actions deployment matching previously built sites, then explicitly authorized merging PR #1 and making `master` the repository default. This does not authorize making the private repository public, purchasing a plan, or changing production DNS.

## Established pattern

Yippee Cafe, Tea-Rek'z and Noorava use a `Deploy GitHub Pages` workflow: push to the default branch/manual dispatch, `configure-pages`, upload the committed `docs/` artifact, and `deploy-pages`, with `pages: write`, `id-token: write`, a `github-pages` environment and serialized deployments. Copy that pattern for GawPoe, using `master`. Extend verification to master pushes as well as PR/manual runs.

## Concrete blocker and safe behavior

On October 6, GitHub rejected `POST /repos/jontsai/gawpoe-nextjs/pages` with HTTP 422: “Your current plan does not support GitHub Pages for this repository.” The repository is private. Leave visibility unchanged and do not purchase/upgrade anything. The copied deployment job is gated by repository variable `PAGES_DEPLOY_ENABLED=true` until GitHub Pages can actually be enabled. A skipped deploy job is not a successful site publication.

The existing Zion dev deployment remains available and is not replaced by this workflow yet. Jonathan has been asked to choose private-repo Pages support or an Actions-to-Zion deployment. Before enabling Pages publication, choose the intended domain/base path and verify its redirects: the committed export uses domain-root paths, while a GitHub project-site URL uses a repository prefix. Do not advertise an unverified project URL or cut over production merely to resolve this setup issue.

## Branch migration

Create `master` at the existing PR base SHA `5b991bebe3fc5511e9599f736dd6c04783adac6f`, retarget PR #1 to the identical-history base, verify the updated head, merge with a merge commit, then make `master` the default branch. Retain the old branches; no force-push or history rewrite. This fixes the historical feature-branch default without dropping the existing migration history.
