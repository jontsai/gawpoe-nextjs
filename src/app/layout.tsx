import head from "@/data/head-metadata.json";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata = {
  metadataBase: new URL("https://www.gawpoe.com"),
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US">
      <head>
        {head.meta.map((meta) => (
          <meta key={meta.name} name={meta.name} content={meta.content} />
        ))}
        {head.icons.map((icon) => (
          <link
            key={icon.rel + icon.url}
            rel={icon.rel}
            href={icon.url}
            sizes={"sizes" in icon ? icon.sizes : undefined}
          />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
