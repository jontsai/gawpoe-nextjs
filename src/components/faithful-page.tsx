import head from "@/data/head-metadata.json";
import Script from "next/script";
import { SiteBehavior } from "./site-behavior";
import { getLivePage } from "@/lib/live-site";
export function FaithfulPage({
  page,
}: {
  page: NonNullable<ReturnType<typeof getLivePage>>;
}) {
  const ids = (head.pageFeeds as Record<string, number[]>)[page.path] || [];
  return (
    <>
      {ids.map((id) => {
        const feed = head.feeds[id];
        return (
          <link
            key={feed.path}
            rel="alternate"
            type={feed.type}
            title={feed.title}
            href={feed.path}
          />
        );
      })}
      <link rel="stylesheet" href={page.cssPath} />
      <div
        className={page.bodyClass}
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
      <SiteBehavior bodyClass={page.bodyClass} />
      {page.html.includes("ti-reviews-container") && (
        <Script
          src="/vendor/trustindex-loader.js"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
