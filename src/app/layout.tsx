import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { createPhoneUrl, createMailtoUrl } from "@hacktoolkit/nextjs-htk/utils";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://www.gawpoe.com"),
  title: {
    default: "Gaw | Poe LLP — Trial & Appellate Lawyers",
    template: "%s | Gaw | Poe LLP",
  },
  description:
    "Gaw | Poe LLP is a San Francisco litigation boutique handling business litigation, antitrust, catastrophic injury, trial and appellate matters.",
  openGraph: { siteName: "Gaw | Poe LLP", type: "website" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <section className="contact-band">
          <div>
            <p className="eyebrow">Let’s talk</p>
            <h2>
              Consequential matters.
              <br />
              Personal attention.
            </h2>
          </div>
          <Link className="button light" href="/contact-us/">
            Get in touch <span aria-hidden="true">↗</span>
          </Link>
        </section>
        <footer className="site-footer">
          <div className="footer-top">
            <div>
              <Link href="/" className="footer-brand">
                GAW <span>|</span> POE <small>LLP</small>
              </Link>
              <p>
                Trial & appellate counsel.
                <br />
                San Francisco, California.
              </p>
            </div>
            <div>
              <h3>Explore</h3>
              <Link href="/practice-areas/">Practice Areas</Link>
              <Link href="/team/">Our Team</Link>
              <Link href="/about/">Our Story</Link>
              <Link href="/press/">Press</Link>
            </div>
            <div>
              <h3>Contact</h3>
              <a href={createPhoneUrl("4157667451")}>415.766.7451</a>
              <a href={createMailtoUrl("contact@gawpoe.com")}>
                contact@gawpoe.com
              </a>
              <p>
                One Embarcadero, Suite 1200
                <br />
                San Francisco, CA 94111
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Gaw | Poe LLP</span>
            <span>San Francisco, California</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
