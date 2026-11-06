# One-clone development preview on Gilead

GawBot checks out the branch under review, builds it on Gilead, and serves its
static export before approval or merge. Production is unchanged: GitHub Pages
publishes committed `docs/` from `master`.

## Directory contract

- Deployment user: `gawpoe` on `gilead.kebu.me`.
- One clone/build directory: `/home/gawpoe/sites/gawpoe.com`.
- Generated files served: `/home/gawpoe/sites/gawpoe.com/out/` only.
- Checkout convention: `~/sites/<public-site-domain>`; never expose the repository root.
- Dev virtual hostname: `gawpoe.dev.upinthe.xyz`, configured independently of the
  checkout basename `gawpoe.com`. This directory is a dev checkout, not production.
- Configuration sources: this repository's `deploy/gilead/`; active nginx and
  systemd configuration remains administrator-owned, not an included writable file.

There are no release directories, current symlink, upload step, required
worktrees, or rollback framework. Rebuilds happen in place and can temporarily
interrupt this development preview. Other clones used for development do not
need to move. Leave the earlier `~/previews/gawpoe` artifacts untouched; they
are not used by this setup.

## Clone once

Use GawBot's existing SSH connection from its host (no key forwarding needed):

```sh
ssh -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes \
  -o UserKnownHostsFile="$HOME/.ssh/gawpoe-gilead-known_hosts" \
  -i "$HOME/.ssh/gawpoe-gilead-dev" gawpoe@gilead.kebu.me
```

On Gilead, inspect the destination before cloning. If it already exists, inspect
its remote, branch and work instead of overwriting it. This repository is public,
so HTTPS cloning does not require GitHub credentials on the server.

```sh
site="$HOME/sites/gawpoe.com"
if test ! -e "$site"; then
  mkdir -p "$HOME/sites"
  git clone https://github.com/jontsai/gawpoe-nextjs.git "$site"
fi
cd "$site"
git remote -v
git status --short
```

Build dependencies: Node.js 22 or newer, npm, Git, and Python 3.10+ for the static
server. If Node is installed per-user at `~/.local/node22`, prepend
`export PATH="$HOME/.local/node22/bin:$PATH"` for each build session. No shell rc
or system-wide runtime changes are required.

## Preview the active branch

Run inside the clone on Gilead. If `git status` shows local work, preserve it and
resolve it explicitly before switching; never force checkout, reset or clean.
Choose the desired remote branch (an unmerged PR branch is fine):

```sh
cd "$HOME/sites/gawpoe.com"
export PATH="$HOME/.local/node22/bin:$PATH"
git status --short
git fetch origin
git switch feat/bot-dev-preview  # replace with the branch under review
git merge --ff-only origin/feat/bot-dev-preview
npm ci
npm run build:preview
npm test
```

`build:preview` exports `out/`, writes legacy redirects and `out/preview.json`.
It does not regenerate tracked `docs/`, so preview builds do not dirty the
production export. For a branch predating this helper, the equivalent is:
`npx next build && node scripts/write-redirects.mjs`; that older branch will not
produce revision metadata. Do not merge the preview tooling just to preview it.

After the persistent service is installed, it reads rebuilt files without a
restart. For a temporary loopback-only check, run:

```sh
python3 scripts/serve-dev-preview.py --root "$PWD/out" --port 3186
```

Confirm `git branch --show-current` and `git rev-parse HEAD`, then inspect:

```sh
curl --fail http://127.0.0.1:3186/preview.json
curl --fail https://gawpoe.dev.upinthe.xyz/preview.json
```

The public revision must match the clone's HEAD and `dirty` should be false for
a committed review. Verify `/press/`, the article and image, RSS, a legacy
redirect and an unknown-path 404. Report the branch/commit and verified URL
separately from PR/merge and production status. A loopback success alone does
not establish public activation. The preview is public, with noindex headers.

## One-time administrator setup

The earlier inspection found the dev hostname resolving to Zion (`66.175.220.156`),
not Gilead (`23.239.23.64`). Inspect current DNS before acting. GawBot can build as
`gawpoe` but does not have sudo. Preserve existing service/vhost configuration.

1. Inspect `sudo nginx -T`, existing systemd units and port 3186. Stop and resolve
   any conflicting owner or hostname. The default paths below can be changed by
   editing the reviewed service's `User`, `Group`, `WorkingDirectory`, and
   `ExecStart --root/--port`; keep the nginx upstream port consistent.
2. From the clone, install root-owned server/config copies. Inspect and merge if
   these destinations already exist; do not blindly overwrite them:

   ```sh
   sudo install -d -o root -g root -m 755 /usr/local/lib/gawpoe-preview
   sudo install -o root -g root -m 644 scripts/serve-dev-preview.py /usr/local/lib/gawpoe-preview/serve-dev-preview.py
   sudo install -o root -g root -m 644 deploy/gilead/gawpoe-preview.service /etc/systemd/system/gawpoe-preview.service
   sudo install -o root -g root -m 644 deploy/gilead/gawpoe-dev.conf /etc/nginx/gilead/sites/gawpoe-dev.conf
   sudo systemctl daemon-reload
   sudo systemctl enable --now gawpoe-preview
   sudo nginx -t && sudo systemctl reload nginx
   curl --fail -H 'Host: gawpoe.dev.upinthe.xyz' http://127.0.0.1/preview.json
   ```

3. Change only the exact `gawpoe.dev.upinthe.xyz` DNS record to an A record for
   `23.239.23.64`, resolving any conflicting exact CNAME/AAAA. Do not change apex,
   wildcard, or production `gawpoe.com` records. Preserve the previous dev route
   until verification succeeds.
4. Confirm DNS and use the existing Certbot account for HTTPS:

   ```sh
   sudo certbot --nginx -d gawpoe.dev.upinthe.xyz --redirect
   sudo nginx -t
   sudo systemctl status gawpoe-preview --no-pager
   curl --fail https://gawpoe.dev.upinthe.xyz/preview.json
   ```

   Do not skip TLS verification. If cutover fails, restore the prior exact dev
   DNS record to retain the old preview. Production remains untouched.

## Verification

`python3 tests/dev-preview.test.py` checks static-only serving, redirects, RSS
content types, noindex, missing pages and rebuilt files served without restart.
