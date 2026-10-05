import Link from "next/link";
import { dateLabel, type SiteContent } from "@/lib/content";
export function NewsList({ items }: { items: SiteContent[] }) {
  return (
    <div className="news-list">
      {items.map((p) => (
        <article key={p.id}>
          <time dateTime={p.date}>{dateLabel(p.date)}</time>
          <h3>
            <Link href={`/${p.path}/`}>
              {p.title}
              <span aria-hidden="true">↗</span>
            </Link>
          </h3>
          <p>{p.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
