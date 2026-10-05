/** Reject incomplete captures before replacing the checked-in page snapshot. */
export function validateCapture({ pages, requiredPaths, missing, redirects }) {
  const paths = new Set(pages.map((p) => p.path));
  const mapping = new Map(redirects.map((r) => [r.from, r.to]));
  const unresolved = [
    ...new Set([...requiredPaths, ...missing.map((m) => m.path)]),
  ].filter((p) => !paths.has(p) && !paths.has(mapping.get(p)));
  if (unresolved.length)
    throw new Error(
      `Incomplete capture; keeping previous snapshot. Missing: ${unresolved.join(", ")}`,
    );
  if (!paths.has("/") || paths.size !== pages.length)
    throw new Error("Incomplete capture: missing homepage or duplicate routes");
}
