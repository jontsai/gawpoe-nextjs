import Link from 'next/link';
import { getHomePage, pages, posts } from '@/lib/content';

export default function Home() {
  const home = getHomePage();
  const spotlightPages = pages.filter((page) =>
    ['business-litigation', 'antitrust', 'catastrophic-injury', 'appeals'].includes(page.slug),
  );

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">Elite Boutique Litigation</p>
          <h1>Gaw | Poe LLP</h1>
          <p className="hero-copy">
            High-stakes trial and appellate counsel for business litigation, antitrust disputes,
            catastrophic injury matters, and complex commercial cases.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/attorneys/">
              Attorneys
            </Link>
            <Link className="button" href="/contact/">
              Contact
            </Link>
          </div>
        </div>
      </section>

      {home?.html ? (
        <section className="content-band">
          <article
            className="wp-content home-content"
            dangerouslySetInnerHTML={{ __html: home.html }}
          />
        </section>
      ) : null}

      <section className="content-band muted">
        <div className="section-heading">
          <p className="eyebrow">Practice Focus</p>
          <h2>Built for consequential disputes.</h2>
        </div>
        <div className="practice-grid">
          {spotlightPages.map((page) => (
            <Link className="practice-card" href={`/${page.path}/`} key={page.id}>
              <span>{page.title}</span>
              <p>{page.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="section-heading">
          <p className="eyebrow">Recent Updates</p>
          <h2>News and results.</h2>
        </div>
        <div className="news-list">
          {posts.slice(0, 6).map((post) => (
            <Link href={`/${post.path}/`} key={post.id}>
              <span>{post.title}</span>
              <small>{post.excerpt}</small>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

