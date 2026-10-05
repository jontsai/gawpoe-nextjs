import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { load } from "cheerio";
import { createHash } from "node:crypto";
import { renderPageHtml } from "../src/lib/fragments.mjs";
import { primaryContract, decodePublicEmails } from "./content-contract.mjs";
const file = "src/content/generated/live-site.json",
  directory = "src/content/fragments";
await mkdir(directory, { recursive: true });
const existing = {};
for (const f of await readdir(directory))
  if (f.endsWith(".html"))
    existing[f.slice(0, -5)] = await readFile(`${directory}/${f}`, "utf8");
const data = JSON.parse(await readFile(file, "utf8"));
const fragments = {},
  usage = {};
function parameterize(html) {
  const binding = { activeClasses: [], currentAnchors: [], layoutIds: [] };
  let classes = 0,
    anchors = 0;
  html = html.replace(/class="([^"]*)"/g, (_, value) => {
    const i = classes++;
    if (value.includes(" current-menu-item")) binding.activeClasses.push(i);
    return `class="${value.replace(/ current-menu-item/g, "")}{{current-class:${i}}}"`;
  });
  html = html.replace(/<a\b([^>]*)>/g, (_, attrs) => {
    const i = anchors++;
    if (attrs.includes(' aria-current="page"')) binding.currentAnchors.push(i);
    return `<a${attrs.replace(/ aria-current="page"/g, "")}{{current-anchor:${i}}}>`;
  });
  html = html.replace(
    /(wp-container-core-[a-z-]+-layout-)(\d+)/g,
    (_, prefix, value) => {
      const i = binding.layoutIds.length;
      binding.layoutIds.push(value);
      return `${prefix}{{layout:${i}}}`;
    },
  );
  return { html, binding };
}
for (const page of data.pages) {
  const complete = renderPageHtml(page, existing);
  const $ = load(complete, null, false);
  page.fragmentBindings = {};
  // Independent expected content comes from the anonymous source, not the rendered fragments.
  if (!page.legacy) {
    const source = load(
      await readFile(`artifacts/live-source/${page.sourceFile}`, "utf8"),
    );
    decodePublicEmails(source);
    Object.assign(page, primaryContract(source));
  } else Object.assign(page, primaryContract($));
  delete page.sourceText;
  for (const [name, selector, param] of [
    ["header", "header", true],
    ["footer", "footer", true],
    ["about-firm", ".blk-about-gaw-poe", false],
    ["latest-press", ".blk-latest-press", true],
    ["sidebar-contact", ".sidebar .blk-contact", true],
  ]) {
    $(selector).each((_, el) => {
      const original = $(el).toString();
      const parsed = param
        ? parameterize(original)
        : { html: original, binding: {} };
      let key = name;
      if (fragments[key] && fragments[key] !== parsed.html) {
        if (["header", "footer", "about-firm"].includes(name))
          throw Error(`Unexpected shared ${name} variant at ${page.path}`);
        key += `-${createHash("sha256").update(parsed.html).digest("hex").slice(0, 8)}`;
      }
      fragments[key] = parsed.html;
      usage[key] = (usage[key] || 0) + 1;
      page.fragmentBindings[key] = parsed.binding;
      $(el).replaceWith(`<!--fragment:${key}-->`);
    });
  }
  page.html = $.root().html();
  const restored = load(renderPageHtml(page, fragments));
  if (primaryContract(restored).sourceTextHash !== page.sourceTextHash)
    throw Error(`Source text mismatch during extraction: ${page.path}`);
}
for (const [name, html] of Object.entries(fragments))
  await writeFile(`${directory}/${name}.html`, html);
data.fragmentUsage = usage;
await writeFile(file, JSON.stringify(data, null, 2) + "\n");
console.log(
  JSON.stringify({ pages: data.pages.length, fragments: usage }, null, 2),
);
