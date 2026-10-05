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
      <body>{children}</body>
    </html>
  );
}
