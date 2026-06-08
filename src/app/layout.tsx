import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gawpoe.com'),
  title: {
    default: 'Gaw | Poe LLP',
    template: '%s | Gaw | Poe LLP',
  },
  description:
    'Gaw | Poe LLP is an elite litigation boutique handling high-stakes business litigation, antitrust, catastrophic injury, and appellate matters.',
  openGraph: {
    title: 'Gaw | Poe LLP',
    description:
      'Elite boutique litigation counsel for high-stakes trial, appellate, business litigation, antitrust, and catastrophic injury matters.',
    url: 'https://www.gawpoe.com/',
    siteName: 'Gaw | Poe LLP',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about-us/', label: 'About' },
  { href: '/attorneys/', label: 'Attorneys' },
  { href: '/business-litigation/', label: 'Business Litigation' },
  { href: '/antitrust/', label: 'Antitrust' },
  { href: '/news/', label: 'News' },
  { href: '/contact/', label: 'Contact' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="Gaw Poe LLP home">
            <img src="/images/logo-gaw-poe-llp.png" alt="Gaw Poe LLP" />
          </Link>
          <nav className="site-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div>
            <strong>Gaw | Poe LLP</strong>
            <span>High-stakes litigation, trial, and appellate counsel.</span>
          </div>
          <Link href="/contact/">Contact</Link>
        </footer>
      </body>
    </html>
  );
}
