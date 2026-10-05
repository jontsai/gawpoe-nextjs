import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const root = path.resolve("out");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      const redirects = JSON.parse(
        await readFile(path.join(root, "legacy-redirects.json"), "utf8").catch(
          () => "{}",
        ),
      );
      if (redirects[url.pathname]) {
        res.writeHead(301, {
          Location: redirects[url.pathname],
          "X-Robots-Tag": "noindex, nofollow",
        });
        res.end();
        return;
      }
      for (const key of ["p", "page_id", "attachment_id"]) {
        const value = url.searchParams.get(key);
        const target = redirects[`/?${key}=${value}`];
        if (target) {
          res.writeHead(301, {
            Location: target,
            "X-Robots-Tag": "noindex, nofollow",
          });
          res.end();
          return;
        }
      }
      let file = path.resolve(
        root,
        "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
      );
      if (!file.startsWith(root + path.sep) && file !== root) throw Error();
      if ((await stat(file)).isDirectory())
        file = path.join(file, "index.html");
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "X-Robots-Tag": "noindex, nofollow",
      });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404, {
        "Content-Type": "text/html",
        "X-Robots-Tag": "noindex, nofollow",
      });
      res.end(
        await readFile(path.join(root, "404.html")).catch(() =>
          Buffer.from("Not found"),
        ),
      );
    }
  })
  .listen(3186, "127.0.0.1", () =>
    console.log("Static preview: http://127.0.0.1:3186"),
  );
