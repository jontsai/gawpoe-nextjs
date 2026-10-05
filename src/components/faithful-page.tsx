import Script from "next/script";
import { SiteBehavior } from "./site-behavior";
import { getLivePage } from "@/lib/live-site";
export function FaithfulPage({
  page,
}: {
  page: NonNullable<ReturnType<typeof getLivePage>>;
}) {
  return (
    <>
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
