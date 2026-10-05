import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaithfulPage } from "@/components/faithful-page";
import { getLivePage, livePages } from "@/lib/live-site";
type Props = { params: Promise<{ slug: string[] }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return livePages
    .filter((p) => p.path !== "/")
    .map((p) => ({ slug: p.path.split("/").filter(Boolean) }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = (await params).slug.join("/"),
    page = getLivePage(path);
  if (!page) return {};
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: page.path },
  };
}
export default async function Page({ params }: Props) {
  const page = getLivePage((await params).slug.join("/"));
  if (!page) notFound();
  return <FaithfulPage page={page} />;
}
