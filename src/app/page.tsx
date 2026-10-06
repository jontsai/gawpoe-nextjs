import type { Metadata } from "next";
import { FaithfulPage } from "@/components/faithful-page";
import { getLivePage } from "@/lib/live-site";
const page = getLivePage("/")!;
export const metadata: Metadata = {
  title: { absolute: page.title },
  description: page.description,
  alternates: { canonical: "/" },
};
export default function Home() {
  return <FaithfulPage page={page} />;
}
