import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
await writeFile(
  "out/preview.json",
  JSON.stringify({
    revision: git("rev-parse", "HEAD"),
    branch: git("branch", "--show-current"),
    dirty: Boolean(git("status", "--porcelain", "--untracked-files=no")),
    builtAt: new Date().toISOString(),
  }, null, 2) + "\n",
);
