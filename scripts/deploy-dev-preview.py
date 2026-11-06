"""Publish an exact committed docs/ export to GawBot's development host."""
import argparse
import hashlib
import json
from pathlib import Path
import shlex
import subprocess
import tempfile
import time
import urllib.request


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    selection = parser.add_mutually_exclusive_group()
    selection.add_argument("--ref", default="HEAD", help="Commit/branch whose committed docs/ export to publish")
    selection.add_argument("--rollback", help="Previously published release ID")
    parser.add_argument("--key", default="~/.ssh/gawpoe-gilead-dev")
    parser.add_argument("--known-hosts", default="~/.ssh/gawpoe-gilead-known_hosts")
    args = parser.parse_args()
    repo = Path(__file__).resolve().parent.parent
    receiver = (repo / "scripts/dev-preview-release.py").read_text()
    ssh = ["ssh", "-o", "BatchMode=yes", "-o", "IdentitiesOnly=yes", "-o", "StrictHostKeyChecking=yes",
           "-o", "ConnectTimeout=15", "-o", "UserKnownHostsFile=" + str(Path(args.known_hosts).expanduser()),
           "-i", str(Path(args.key).expanduser()), "gawpoe@gilead.kebu.me"]
    with tempfile.TemporaryFile() as bundle:
        if args.rollback:
            action = ["activate", args.rollback]
        else:
            revision = subprocess.check_output(
                ["git", "rev-parse", "--verify", "--end-of-options", args.ref + "^{commit}"],
                cwd=repo, text=True).strip()
            subprocess.run(["git", "archive", "--format=tar", revision + ":docs"],
                           cwd=repo, stdout=bundle, check=True)
            bundle.seek(0)
            digest = hashlib.file_digest(bundle, "sha256").hexdigest() if hasattr(hashlib, "file_digest") else None
            if digest is None:
                bundle.seek(0)
                hasher = hashlib.sha256()
                for chunk in iter(lambda: bundle.read(1024 * 1024), b""):
                    hasher.update(chunk)
                digest = hasher.hexdigest()
            bundle.seek(0)
            action = ["publish", revision, digest]
        result = subprocess.run(ssh + [shlex.join(["python3", "-c", receiver, *action])],
                                stdin=bundle, stdout=subprocess.PIPE, text=True, check=True)
    deployed = json.loads(result.stdout)
    print(json.dumps(deployed, indent=2))
    url = "https://gawpoe.dev.upinthe.xyz/preview.json?release=" + deployed["release"]
    error = ""
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=15) as response:
                live = json.load(response)
            if live.get("release") == deployed["release"] and live.get("revision") == deployed["revision"]:
                print("Verified public preview: https://gawpoe.dev.upinthe.xyz/")
                return
            error = "Public endpoint is serving a different release"
        except (OSError, ValueError) as exc:
            error = str(exc)
        if attempt < 2:
            time.sleep(2)
    print("Uploaded and activated on Gilead, but PUBLIC PREVIEW IS UNVERIFIED: " + error)
    raise SystemExit(2)


if __name__ == "__main__":
    main()
