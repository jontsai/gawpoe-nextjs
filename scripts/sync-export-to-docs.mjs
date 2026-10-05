import { cp, mkdir, rm, writeFile } from "node:fs/promises";

await rm("docs", { force: true, recursive: true });
await mkdir("docs", { recursive: true });
await cp("out", "docs", { recursive: true });
await writeFile("docs/.nojekyll", "");

console.log("Synced static export from out/ to docs/.");
