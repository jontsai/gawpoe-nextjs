# GawBot-owned development previews

This replaces the **development** host's old Zion/Apache routing with Gilead.
Production remains GitHub Pages, publishing `docs/` from `master`. The preview
command does not push, merge, change DNS, modify nginx, or deploy production.

## Publish before approving or merging

On GawBot's build host, in the feature worktree:

```sh
npm ci
npm run build
npm test
# Commit the intended source changes AND rebuilt docs/ export on the feature branch.
python3 scripts/deploy-dev-preview.py --ref HEAD
```

`--ref` can be any locally available commit or branch, including an unmerged PR.
Only that revision's **committed** `docs/` tree is uploaded. Uncommitted changes
are deliberately excluded. No Node.js installation or repository credentials are
needed on Gilead. Python 3.10+ is required on both hosts.

The SSH defaults use GawBot's existing dedicated key and pinned known-host file:
`~/.ssh/gawpoe-gilead-dev` and `~/.ssh/gawpoe-gilead-known_hosts`. Alternate paths
can be supplied with `--key` and `--known-hosts`; never copy private keys into
the repository or disable host-key checking. Agent forwarding is not needed.

Uploads are checksum-verified and extracted into new release directories under
`/home/gawpoe/previews/gawpoe/releases/`. Unsafe archive entries and incomplete
exports are rejected without replacing the current site. Publication switches
`current` atomically, with a deployment lock to serialize concurrent uploads.
Previous releases are retained. A dev-only robots file and response headers
discourage indexing; the host is **public**, not an authenticated private preview.

The command checks the public `/preview.json` endpoint for the exact revision and
release ID. Exit 0 means it matched. **Exit 2 means the files were activated on
Gilead but public routing/verification failed**; do not call that a live preview.
Report the preview URL, revision, and verification result for review separately
from PR/merge and production status. Existing pages and source attribution are
unchanged; legacy redirects, RSS content types and true 404s are preserved.

### Rollback

```sh
python3 scripts/deploy-dev-preview.py --rollback <release-id>
```

Use the prior release ID reported by a previous deployment (`previous` contains
`releases/<release-id>`). Rollback also verifies the public endpoint. Do not delete
the active release or its predecessor. Releases are not automatically pruned.

## One-time administrator setup (not yet applied by the PR)

Initial inspection on 2026-11-06 found the dev name resolving through
`upinthe.xyz` to `66.175.220.156`; Gilead resolves to `23.239.23.64`.
Gilead's nginx includes root-owned `/etc/nginx/gilead/sites/*.conf`.
GawBot can SSH as `gawpoe`, but cannot administer nginx/systemd. Preserve the
existing Zion site until the new HTTPS route passes verification.

1. Stage these reviewed files on Gilead in `/home/gawpoe/preview-setup/`:
   `gawpoe-preview.service`, `gawpoe-dev.conf`, and `serve-dev-preview.py`.
   Upload an initial committed export with the deploy command. Exit 2 is expected
   until public DNS/HTTPS is configured.
2. As an administrator, inspect `sudo nginx -T`, the existing systemd units, and
   port 3186. Ensure no existing vhost claims this hostname and nothing else owns
   that loopback port. If either destination below exists, inspect and merge it;
   do not blindly overwrite existing configuration.
3. Install root-owned copies (nginx must never include an agent-writable file):

   ```sh
   sudo install -d -o root -g root -m 755 /usr/local/lib/gawpoe-preview
   sudo install -o root -g root -m 644 /home/gawpoe/preview-setup/serve-dev-preview.py /usr/local/lib/gawpoe-preview/serve-dev-preview.py
   sudo install -o root -g root -m 644 /home/gawpoe/preview-setup/gawpoe-preview.service /etc/systemd/system/gawpoe-preview.service
   sudo install -o root -g root -m 644 /home/gawpoe/preview-setup/gawpoe-dev.conf /etc/nginx/gilead/sites/gawpoe-dev.conf
   sudo systemctl daemon-reload
   sudo systemctl enable --now gawpoe-preview
   sudo nginx -t && sudo systemctl reload nginx
   curl --fail -H 'Host: gawpoe.dev.upinthe.xyz' http://127.0.0.1/preview.json
   ```

   The service runs as `gawpoe`, binds only `127.0.0.1:3186`, and reads the current
   static release. Ordinary uploads need neither sudo nor a service restart.
4. In the authoritative DNS provider, change **only** the exact
   `gawpoe.dev.upinthe.xyz` record to an A record for `23.239.23.64`. Remove a
   conflicting exact CNAME/AAAA if present; do not change the `upinthe.xyz` apex,
   wildcard, or production `gawpoe.com` records. Confirm authoritative and public
   resolution before certificate issuance. Plan a short dev-only cutover window:
   HTTPS is not ready on the new host until the next step completes.
5. Use the host's existing Certbot/ACME account to issue and install HTTPS:

   ```sh
   sudo certbot --nginx -d gawpoe.dev.upinthe.xyz --redirect
   sudo nginx -t
   sudo systemctl status gawpoe-preview --no-pager
   curl --fail https://gawpoe.dev.upinthe.xyz/preview.json
   curl -I https://gawpoe.dev.upinthe.xyz/press/
   ```

   Then rerun the deploy command and confirm the exact public revision, the press
   listing, article and image, a legacy redirect, RSS and an unknown-path 404.
   Never skip TLS verification. If cutover fails, restore the previous exact DNS
   record so the retained Zion deployment serves the dev hostname again.

## Verification

```sh
python3 tests/dev-preview.test.py
```

The integration suite checks release switching/rollback, failed-upload isolation,
archive traversal/link rejection, redirects, RSS MIME, noindex, revision metadata,
404s and serving a new release without restarting the HTTP process.
