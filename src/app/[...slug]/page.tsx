import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsList } from "@/components/content";
import {
  dateLabel,
  getContentByPath,
  getSitemapRouteByPath,
  posts,
  sitemapRoutes,
  siteUrl,
  toSitemapSlugSegments,
  team,
  practiceAreas,
  archivePosts,
} from "@/lib/content";
type PageProps = { params: Promise<{ slug: string[] }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return sitemapRoutes
    .filter((p) => p.path !== "/")
    .map((p) => ({ slug: toSitemapSlugSegments(p.path) }));
}
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const path = (await params).slug.join("/"),
    item = getContentByPath(path),
    route = getSitemapRouteByPath(path);
  if (!item && !route) return {};
  const title = item?.title || route!.title,
    description =
      item?.excerpt || `News and updates from Gaw | Poe LLP: ${title}.`;
  return {
    title,
    description,
    alternates: { canonical: `/${path}/` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${path}/`,
      type: item?.kind === "post" ? "article" : "website",
      images: item?.featuredImage ? [{ url: item.featuredImage }] : undefined,
    },
  };
}
export default async function ContentPage({ params }: PageProps) {
  const path = (await params).slug.join("/"),
    item = getContentByPath(path),
    route = getSitemapRouteByPath(path);
  if (!item && !route) notFound();
  const person = team.find((p) => p.path === path),
    isArchive = !item,
    heading = item?.title || route!.title;
  return (
    <>
      <section className="page-heading">
        <div className="content-band">
          <Link className="breadcrumb" href="/">
            Home
          </Link>
          <span className="breadcrumb">
            {" "}
            /{" "}
            {person
              ? "Our Team"
              : item?.kind === "post"
                ? "Press"
                : isArchive
                  ? "Archives"
                  : heading}
          </span>
          <p className="eyebrow">
            {person
              ? person.role
              : item?.kind === "post"
                ? dateLabel(item.date)
                : "Gaw | Poe LLP"}
          </p>
          <h1>{heading}</h1>
        </div>
      </section>
      {path === "team" ? (
        <section className="content-band">
          <div className="team-grid">
            {team.map((p) => (
              <Link href={`/${p.path}/`} className="team-card" key={p.path}>
                <div>
                  <img src={p.image} alt={p.name} />
                  <span aria-hidden="true">↗</span>
                </div>
                <p className="eyebrow">{p.role}</p>
                <h2>{p.name}</h2>
                <p>{p.education}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : path === "practice-areas" ? (
        <section className="content-band">
          <div className="practice-list">
            {practiceAreas.map((p, i) => (
              <Link href={`/${p.path}/`} key={p.path}>
                <span className="index">0{i + 1}</span>
                <h2>{p.title}</h2>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
          <p className="additional-practice">
            Also explore our{" "}
            <Link className="text-link" href="/fractional-general-counsel/">
              Fractional General Counsel practice ↗
            </Link>
          </p>
        </section>
      ) : path === "press" || isArchive ? (
        <section className="content-band">
          <NewsList items={isArchive ? archivePosts(path) : posts} />
          {isArchive && (
            <Link className="text-link" href="/press/">
              Browse all press ↗
            </Link>
          )}
        </section>
      ) : path === "contact-us" ? (
        <section className="content-band contact-page">
          <div>
            <p className="eyebrow">San Francisco</p>
            <h2>Start a conversation.</h2>
            <p>
              <a className="text-link" href="tel:+14157667451">
                415.766.7451
              </a>
              <br />
              <a className="text-link" href="mailto:contact@gawpoe.com">
                contact@gawpoe.com
              </a>
            </p>
            <p>
              One Embarcadero, Suite 1200
              <br />
              San Francisco, CA 94111
            </p>
            <p>Fax: 415.737.0642</p>
            <a
              className="button primary"
              href="https://www.google.com/maps/search/?api=1&query=One+Embarcadero+Center+San+Francisco+CA+94111"
            >
              Get directions ↗
            </a>
          </div>
          <aside>
            <p className="eyebrow">Connect with us</p>
            <a
              className="text-link"
              href="https://www.linkedin.com/company/gaw-poe-llp/"
            >
              LinkedIn ↗
            </a>
            <p>We welcome the opportunity to learn about your matter.</p>
          </aside>
        </section>
      ) : (
        <section
          className={`content-band article-layout ${person ? "bio-layout" : ""}`}
        >
          {person && (
            <aside className="bio-aside">
              <img src={person.image} alt={person.name} />
              <p className="eyebrow">{person.role}</p>
              <p>{person.education}</p>
              <Link className="text-link" href="/team/">
                Meet the team ↗
              </Link>
              <div className="bio-links">
                {person.links?.map((link) => (
                  <a className="text-link" key={link.href} href={link.href}>
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </aside>
          )}
          <div>
            {item!.archived && (
              <p className="archive-note">
                Archived profile. View our{" "}
                <Link href="/team/">current team</Link>.
              </p>
            )}
            <article
              className="wp-content"
              dangerouslySetInnerHTML={{ __html: item!.html }}
            />
            {item!.kind === "post" && (
              <Link className="text-link back-link" href="/press/">
                ← Back to press
              </Link>
            )}
          </div>
        </section>
      )}
    </>
  );
}
