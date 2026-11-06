"""Unprivileged Gilead receiver. Static files only; never changes server config."""
import datetime
import fcntl
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import sys
import tarfile
import tempfile
import uuid


def activate(root, release):
    if not re.fullmatch(r"[0-9a-f]{12}-[0-9a-f]{12}", release):
        raise ValueError("Invalid release ID")
    directory = root / "releases" / release
    if directory.is_symlink() or not directory.is_dir():
        raise ValueError("Release does not exist")
    metadata = json.loads((directory / "preview.json").read_text())
    previous = os.readlink(root / "current") if (root / "current").is_symlink() else None
    temporary = root / (".current-" + uuid.uuid4().hex)
    temporary.symlink_to("releases/" + release)
    os.replace(temporary, root / "current")
    return {**metadata, "previous": previous}


def publish(stream, root, revision, digest):
    if not re.fullmatch(r"[0-9a-f]{40}", revision):
        raise ValueError("Expected a full Git revision")
    root.mkdir(parents=True, exist_ok=True)
    (root / "releases").mkdir(exist_ok=True)
    release = revision[:12] + "-" + uuid.uuid4().hex[:12]
    directory = root / "releases" / release
    directory.mkdir()
    try:
        with tempfile.TemporaryFile() as archive:
            checksum = hashlib.sha256()
            size = 0
            while chunk := stream.read(1024 * 1024):
                size += len(chunk)
                if size > 512 * 1024 * 1024:
                    raise ValueError("Export exceeds 512 MiB")
                checksum.update(chunk)
                archive.write(chunk)
            if checksum.hexdigest() != digest:
                raise ValueError("Incomplete or corrupted upload")
            archive.seek(0)
            with tarfile.open(fileobj=archive) as bundle:
                for member in bundle:
                    name = PurePosixPath(member.name)
                    if name.is_absolute() or ".." in name.parts or not name.parts:
                        raise ValueError("Unsafe archive path")
                    if not (member.isdir() or member.isfile()):
                        raise ValueError("Links and special files are not allowed")
                    # No production CNAME, hidden files, or Apache overrides on dev.
                    if any(part.startswith(".") for part in name.parts) or name.name == "CNAME":
                        continue
                    target = directory.joinpath(*name.parts)
                    if member.isdir():
                        target.mkdir(parents=True, exist_ok=True)
                    else:
                        target.parent.mkdir(parents=True, exist_ok=True)
                        with bundle.extractfile(member) as source, target.open("wb") as output:
                            shutil.copyfileobj(source, output)
                        target.chmod(0o644)
        for required in ("index.html", "404.html", "press/index.html"):
            if not (directory / required).is_file():
                raise ValueError("Incomplete static export: " + required)
        metadata = {
            "revision": revision,
            "release": release,
            "publishedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "environment": "development",
        }
        (directory / "preview.json").write_text(json.dumps(metadata, indent=2) + "\n")
        (directory / "robots.txt").write_text("User-agent: *\nDisallow: /\n")
        (directory / "preview.json").chmod(0o644)
        (directory / "robots.txt").chmod(0o644)
        for folder, _, _ in os.walk(directory):
            Path(folder).chmod(0o755)
        return activate(root, release)
    except BaseException:
        shutil.rmtree(directory)
        raise


def main():
    root = Path.home() / "previews" / "gawpoe"
    root.mkdir(parents=True, exist_ok=True)
    with (root / ".deploy.lock").open("w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        if sys.argv[1] == "publish":
            result = publish(sys.stdin.buffer, root, sys.argv[2], sys.argv[3])
        elif sys.argv[1] == "activate":
            result = activate(root, sys.argv[2])
        else:
            raise ValueError("Unknown action")
    print(json.dumps(result))


if __name__ == "__main__":
    main()
