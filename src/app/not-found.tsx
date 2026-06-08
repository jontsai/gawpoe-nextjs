import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="content-band page-shell">
      <p className="eyebrow">404</p>
      <h1>Page not found.</h1>
      <p>The page may have moved during migration.</p>
      <Link className="button primary" href="/">
        Return home
      </Link>
    </section>
  );
}

