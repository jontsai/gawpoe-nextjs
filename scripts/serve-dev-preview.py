"""Loopback-only static preview with the site's legacy redirects and RSS types."""
import argparse
import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import urllib.parse


class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, root, **kwargs):
        self.release_root = Path(root).resolve()
        super().__init__(*args, directory=str(self.release_root), **kwargs)

    def end_headers(self):
        self.send_header("X-Robots-Tag", "noindex, nofollow")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def list_directory(self, path):
        self.send_error(404)
        return None

    def send_head(self):
        url = urllib.parse.urlsplit(self.path)
        decoded = urllib.parse.unquote(url.path)
        if any(part.startswith(".") for part in Path(decoded).parts if part not in ("/", "")):
            self.send_error(404)
            return None
        candidate = (self.release_root / decoded.lstrip("/")).resolve()
        if not candidate.is_relative_to(self.release_root):
            self.send_error(404)
            return None
        try:
            redirects = json.loads((self.release_root / "legacy-redirects.json").read_text())
        except FileNotFoundError:
            redirects = {}
        target = redirects.get(url.path)
        if url.path == "/":
            query = urllib.parse.parse_qs(url.query)
            for key in ("p", "page_id", "attachment_id"):
                if key in query:
                    target = redirects.get("/?" + key + "=" + query[key][0], target)
        if target:
            if not target.startswith("/") or target.startswith("//") or any(ord(c) < 32 for c in target):
                self.send_error(500, "Invalid redirect")
                return None
            self.send_response(301)
            self.send_header("Location", target)
            self.send_header("Content-Length", "0")
            self.end_headers()
            return None
        if not candidate.exists():
            page = self.release_root / "404.html"
            if page.is_file():
                self.send_response(404)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(page.stat().st_size))
                self.end_headers()
                return page.open("rb")
        return super().send_head()

    def guess_type(self, path):
        try:
            feeds = json.loads((self.release_root / "feed-manifest.json").read_text())["feeds"]
        except FileNotFoundError:
            feeds = []
        relative = "/" + Path(path).relative_to(self.release_root).as_posix()
        if any(relative in (item["path"], item["file"], item["path"] + "index.html") for item in feeds):
            return "application/rss+xml; charset=utf-8"
        return super().guess_type(path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=str(Path.home() / "previews/gawpoe/current"))
    parser.add_argument("--port", type=int, default=3186)
    args = parser.parse_args()
    ThreadingHTTPServer(("127.0.0.1", args.port), functools.partial(PreviewHandler, root=args.root)).serve_forever()
