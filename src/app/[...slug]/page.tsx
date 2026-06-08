import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  dateLabel,
  getContentByPath,
  getSitemapRouteByPath,
  posts,
  sitemapRoutes,
  siteUrl,
  toSitemapSlugSegments,
} from '@/lib/content';

type PageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export function generateStaticParams() {
  return sitemapRoutes
    .filter((item) => item.path !== '/')
    .map((item) => ({
      slug: toSitemapSlugSegments(item.path),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = slug.join('/');
  const item = getContentByPath(path);
  const sitemapRoute = getSitemapRouteByPath(path);

  if (!item && !sitemapRoute) {
    return {};
  }

  const title = item?.title || sitemapRoute?.title || 'Gaw | Poe LLP';
  const excerpt =
    item?.excerpt ||
    `This ${sitemapRoute?.kindLabel.toLowerCase() || 'page'} is included in the Gaw | Poe LLP static migration from the WordPress sitemap.`;
  const canonicalPath = item?.path ? `/${item.path}/` : sitemapRoute?.path || '/';

  return {
    title,
    description: excerpt,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description: excerpt,
      url: `${siteUrl}${canonicalPath}`,
      type: item?.kind === 'post' ? 'article' : 'website',
      images: item?.featuredImage ? [{ url: item.featuredImage }] : undefined,
    },
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  const path = slug.join('/');
  const item = getContentByPath(path);
  const sitemapRoute = getSitemapRouteByPath(path);

  if (!item && !sitemapRoute) {
    notFound();
  }

  if (item?.path === 'news') {
    return (
      <section className="content-band page-shell">
        <p className="eyebrow">News</p>
        <h1>{item.title}</h1>
        <div className="news-list">
          {posts.map((post) => (
            <a href={`/${post.path}/`} key={post.id}>
              <span>{post.title}</span>
              <small>
                {dateLabel(post.date)} - {post.excerpt}
              </small>
            </a>
          ))}
        </div>
      </section>
    );
  }

  if (!item && sitemapRoute) {
    return (
      <section className="content-band page-shell">
        <p className="eyebrow">{sitemapRoute.kindLabel}</p>
        <h1>{sitemapRoute.title}</h1>
        <article className="wp-content">
          <p>
            This URL is part of the current WordPress sitemap and is included in the static
            Next.js build. Its final migrated content can be expanded from the source page at{' '}
            <a href={sitemapRoute.sourceUrl}>{sitemapRoute.sourceUrl}</a>.
          </p>
        </article>
      </section>
    );
  }

  return (
    <section className="content-band page-shell">
      <p className="eyebrow">{item!.kind === 'post' ? dateLabel(item!.date) : 'Gaw | Poe LLP'}</p>
      <h1>{item!.title}</h1>
      {item!.featuredImage ? (
        <img className="featured-image" src={item!.featuredImage} alt="" />
      ) : null}
      <article className="wp-content" dangerouslySetInnerHTML={{ __html: item!.html }} />
    </section>
  );
}
