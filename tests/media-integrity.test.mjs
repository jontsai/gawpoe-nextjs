import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
test("mirrored and exported media bytes match the verified public source hashes", () => {
  const audit = JSON.parse(
    readFileSync("verification/media-audit.json", "utf8"),
  );
  assert.deepEqual(audit.failures, []);
  assert.deepEqual(audit.missing, []);
  assert.deepEqual(audit.extra, []);
  const catalog = JSON.parse(
    readFileSync("src/data/media-catalog.json", "utf8"),
  );
  const audited = new Set(audit.assets.map((asset) => asset.url));
  for (const item of catalog) {
    for (const url of [item.source, ...item.variants])
      assert.ok(audited.has(url), url);
  }
  for (const asset of audit.assets) {
    assert.equal(asset.status, "pass", asset.url);
    for (const root of ["public", "out", "docs"]) {
      const bytes = readFileSync(root + asset.local);
      assert.equal(
        createHash("sha256").update(bytes).digest("hex"),
        asset.sha256,
        root + asset.local,
      );
    }
  }
});
