import { test } from "node:test";
import assert from "node:assert/strict";
import { validateCapture } from "../scripts/capture-validation.mjs";
test("refresh rejects a missing published or newly linked page instead of silently dropping it", () => {
  assert.throws(
    () =>
      validateCapture({
        pages: [{ path: "/" }],
        requiredPaths: ["/", "/press/"],
        missing: [{ path: "/press/", status: 404 }],
        redirects: [],
      }),
    /Incomplete capture/,
  );
  assert.throws(
    () =>
      validateCapture({
        pages: [{ path: "/" }],
        requiredPaths: ["/"],
        missing: [{ path: "/newly-linked-page/", status: 404 }],
        redirects: [],
      }),
    /newly-linked-page/,
  );
});
test("refresh accepts a retained legacy page and a captured canonical redirect", () => {
  assert.doesNotThrow(() =>
    validateCapture({
      pages: [{ path: "/" }, { path: "/retired/" }, { path: "/current/" }],
      requiredPaths: ["/", "/retired/", "/current"],
      missing: [{ path: "/retired/", status: 404 }],
      redirects: [{ from: "/current", to: "/current/" }],
    }),
  );
});
