throw new Error(
  "The WordPress capture/refresh pipeline is retired. Edit src/content/pages/<route>/index.html and page.json, shared fragments in src/content/fragments/, and sitemap inventories explicitly. Live-site recapture would overwrite maintained content and is not supported. See README.md.",
);
