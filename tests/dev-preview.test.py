"""Integration checks for serving a single clone's generated export."""
import functools
import importlib.util
import json
from pathlib import Path
import tempfile
import threading
import unittest
import urllib.error
import urllib.request

spec = importlib.util.spec_from_file_location(
    "server", Path(__file__).resolve().parents[1] / "scripts/serve-dev-preview.py")
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)


class PreviewTest(unittest.TestCase):
    def test_static_export_routes_and_rebuild(self):
        with tempfile.TemporaryDirectory() as temp:
            clone = Path(temp)
            root = clone / "out"
            files = {
                "index.html": "home", "404.html": "missing",
                "press/index.html": "press", "feed/index.html": "<rss/>",
                "legacy-redirects.json": '{"/?p=42":"/press/","/old/":"/press/"}',
                "feed-manifest.json": '{"feeds":[{"path":"/feed/","file":"/feed/index.html"}]}',
                "preview.json": '{"revision":"abc123"}',
            }
            for name, content in files.items():
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content)
            (clone / "private.txt").write_text("not public")
            (root / "escape").symlink_to(clone / "private.txt")
            httpd = server.ThreadingHTTPServer(
                ("127.0.0.1", 0), functools.partial(server.PreviewHandler, root=root))
            threading.Thread(target=httpd.serve_forever, daemon=True).start()
            try:
                base = "http://127.0.0.1:" + str(httpd.server_port)
                with urllib.request.urlopen(base + "/preview.json") as response:
                    self.assertEqual(json.load(response)["revision"], "abc123")
                    self.assertEqual(response.headers["X-Robots-Tag"], "noindex, nofollow")
                    self.assertEqual(response.headers["Cache-Control"], "no-store")
                for path in ("/?p=42", "/old/"):
                    with urllib.request.urlopen(base + path) as response:
                        self.assertEqual(response.read(), b"press")
                with urllib.request.urlopen(base + "/feed/") as response:
                    self.assertIn("application/rss+xml", response.headers["Content-Type"])
                for path in ("/missing", "/%2e%2e/private.txt", "/.git/config", "/escape"):
                    with self.assertRaises(urllib.error.HTTPError) as error:
                        urllib.request.urlopen(base + path)
                    self.assertEqual(error.exception.code, 404)
                    error.exception.close()
                (root / "index.html").write_text("rebuilt")
                with urllib.request.urlopen(base + "/") as response:
                    self.assertEqual(response.read(), b"rebuilt")
            finally:
                httpd.shutdown()
                httpd.server_close()


if __name__ == "__main__":
    unittest.main()
