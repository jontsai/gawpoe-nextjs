import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = 'https://www.gawpoe.com';
const OUT_DIR = path.resolve('src/content/generated');

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'gawpoe-nextjs-migration/0.1',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed ${response.status} ${url}`);
  }

  return response.json();
}

async function fetchCollection(type) {
  const first = await fetch(`${SITE_URL}/wp-json/wp/v2/${type}?per_page=100&page=1&_embed=1`);
  if (!first.ok) {
    throw new Error(`Failed ${first.status} ${type} page 1`);
  }

  const totalPages = Number(first.headers.get('x-wp-totalpages') || '1');
  const items = await first.json();

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchJson(`${SITE_URL}/wp-json/wp/v2/${type}?per_page=100&page=${page}&_embed=1`);
    items.push(...next);
  }

  return items;
}

function decodeEntities(value = '') {
  return value
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '-')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripHtml(html = '') {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function cleanHtml(html = '') {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\sclass="wp-block-[^"]*"/g, (match) => match)
    .replace(/\sloading="lazy"/g, ' loading="lazy"');
}

function slugPath(item) {
  const url = new URL(item.link);
  const pathname = url.pathname.replace(/^\/|\/$/g, '');
  return pathname || '';
}

function mediaUrl(item) {
  const embedded = item._embedded?.['wp:featuredmedia']?.[0];
  return embedded?.source_url || null;
}

function normalize(item, kind) {
  const title = decodeEntities(item.title?.rendered || item.title || item.slug);
  const excerpt = stripHtml(item.excerpt?.rendered || item.content?.rendered || '').slice(0, 220);

  return {
    id: item.id,
    kind,
    slug: item.slug,
    path: slugPath(item),
    sourceUrl: item.link,
    title,
    excerpt,
    date: item.date,
    modified: item.modified,
    featuredImage: mediaUrl(item),
    html: cleanHtml(item.content?.rendered || ''),
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const [pages, posts, media] = await Promise.all([
    fetchCollection('pages'),
    fetchCollection('posts'),
    fetchCollection('media'),
  ]);

  const content = [
    ...pages.map((item) => normalize(item, 'page')),
    ...posts.map((item) => normalize(item, 'post')),
  ].sort((a, b) => a.path.localeCompare(b.path));

  const payload = {
    generatedAt: new Date().toISOString(),
    source: SITE_URL,
    counts: {
      pages: pages.length,
      posts: posts.length,
      media: media.length,
      content: content.length,
    },
    content,
    media: media.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: decodeEntities(item.title?.rendered || item.title || item.slug),
      sourceUrl: item.source_url,
      mimeType: item.mime_type,
      modified: item.modified,
    })),
  };

  await writeFile(path.join(OUT_DIR, 'wordpress.json'), `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Imported ${content.length} content entries and ${media.length} media records.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

