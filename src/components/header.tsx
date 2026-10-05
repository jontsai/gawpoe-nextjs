"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
const links = [
  ["/practice-areas/", "Practice Areas"],
  ["/team/", "Our Team"],
  ["/about/", "Our Story"],
  ["/press/", "Press"],
  ["/contact-us/", "Contact"],
] as const;
export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Gaw Poe LLP home">
        <img
          src="/images/logo-gaw-poe-llp.png"
          alt="Gaw | Poe LLP"
          width="233"
          height="49"
        />
      </Link>
      <button
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="primary-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? "Close" : "Menu"}{" "}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <nav
        id="primary-nav"
        className={`site-nav ${open ? "is-open" : ""}`}
        aria-label="Primary navigation"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus();
          }
        }}
      >
        {links.map(([href, label]) => (
          <Link
            href={href}
            key={href}
            aria-current={path === href ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}
      </nav>
      <a className="header-phone" href="tel:+14157667451">
        415.766.7451 <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
