"""Integration checks for release integrity, rollback, and preview HTTP behavior."""
import functools
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tarfile
import tempfile
import threading
import unittest
import urllib.error
import urllib.request


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).resolve().parents[1] / "scripts" / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


release = load("release", "dev-preview-release.py")
server = load("server", "serve-dev-preview.py")


def archive(extra=None):
    data = io.BytesIO()
    files = {"index.html": b"home", "404.html": b"missing", "press/index.html": b"press",
             "legacy-redirects.json": b'{"/?p=42":"/press/","/old/":"/press/"}',
             "feed-manifest.json": b'{"feeds":[{"path":"/feed/","file":"/feed/index.html"}]}',
             "feed/index.html": b"<rss/>", "CNAME": b"www.gawpoe.com", ".htaccess": b"ignored"}
    files.update(extra or {})
    with tarfile.open(fileobj=data, mode="w") as tar:
        for name, content in files.items():
            item = tarfile.TarInfo(name)
            item.size = len(content)
            tar.addfile(item, io.BytesIO(content))
    data.seek(0)
    return data


class PreviewTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "site"

    def publish(self, content=None, revision="a" * 40):
        data = archive(content)
        return release.publish(data, self.root, revision, hashlib.sha256(data.getvalue()).hexdigest())

    def test_publish_rollback_and_failed_upload_preserves_current(self):
        first = self.publish()
        second = self.publish({"index.html": b"new"}, "b" * 40)
        self.assertEqual((self.root / "current/index.html").read_bytes(), b"new")
        self.assertEqual(second["previous"], "releases/" + first["release"])
        with self.assertRaises(ValueError):
            release.publish(archive(), self.root, "c" * 40, "bad-checksum")
        self.assertEqual((self.root / "current/index.html").read_bytes(), b"new")
        release.activate(self.root, first["release"])
        self.assertEqual((self.root / "current/index.html").read_bytes(), b"home")
        self.assertFalse((self.root / "current/CNAME").exists())
        self.assertFalse((self.root / "current/.htaccess").exists())

    def test_archive_traversal_and_symlinks_rejected(self):
        with self.assertRaises(ValueError):
            self.publish({"../escape": b"bad"})
        data = io.BytesIO()
        with tarfile.open(fileobj=data, mode="w") as tar:
            item = tarfile.TarInfo("escape")
            item.type = tarfile.SYMTYPE
            item.linkname = "/etc/passwd"
            tar.addfile(item)
        data.seek(0)
        with self.assertRaises(ValueError):
            release.publish(data, self.root, "a" * 40, hashlib.sha256(data.getvalue()).hexdigest())
        self.assertFalse((self.root / "current").exists())

    def test_http_routes_metadata_and_atomic_switch(self):
        first = self.publish()
        httpd = server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(server.PreviewHandler, root=self.root / "current"))
        worker = threading.Thread(target=httpd.serve_forever, daemon=True)
        worker.start()
        self.addCleanup(httpd.server_close)
        self.addCleanup(httpd.shutdown)
        base = "http://127.0.0.1:" + str(httpd.server_port)
        with urllib.request.urlopen(base + "/preview.json") as response:
            self.assertEqual(json.load(response)["release"], first["release"])
            self.assertEqual(response.headers["X-Robots-Tag"], "noindex, nofollow")
        for path in ("/?p=42", "/old/"):
            with urllib.request.urlopen(base + path) as response:
                self.assertEqual(response.read(), b"press")
        with urllib.request.urlopen(base + "/feed/") as response:
            self.assertIn("application/rss+xml", response.headers["Content-Type"])
        for path in ("/missing", "/%2e%2e/etc/passwd", "/.deploy.lock"):
            with self.assertRaises(urllib.error.HTTPError) as error:
                urllib.request.urlopen(base + path)
            self.assertEqual(error.exception.code, 404)
            error.exception.close()
        self.publish({"index.html": b"new"}, "b" * 40)
        with urllib.request.urlopen(base + "/") as response:
            self.assertEqual(response.read(), b"new")


if __name__ == "__main__":
    unittest.main()
