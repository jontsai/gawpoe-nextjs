"use client";
import { useEffect } from "react";
import queryRedirects from "@/data/query-redirects.json";
export function SiteBehavior({ bodyClass }: { bodyClass: string }) {
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    for (const key of ["p", "page_id", "attachment_id"]) {
      const value = params.get(key);
      const target = (queryRedirects as Record<string, string>)[
        `/?${key}=${value}`
      ];
      if (target && target !== location.pathname) {
        location.replace(target + location.hash);
        return;
      }
    }
    document.body.className = bodyClass;
    const cleanups: Array<() => void> = [];
    const on = (el: EventTarget, name: string, fn: EventListener) => {
      el.addEventListener(name, fn);
      cleanups.push(() => el.removeEventListener(name, fn));
    };
    document
      .querySelectorAll<HTMLElement>("nav.wp-block-navigation")
      .forEach((nav) => {
        const open = nav.querySelector<HTMLButtonElement>(
          ".wp-block-navigation__responsive-container-open",
        );
        const close = nav.querySelector<HTMLButtonElement>(
          ".wp-block-navigation__responsive-container-close",
        );
        const modal = nav.querySelector<HTMLElement>(
          ".wp-block-navigation__responsive-container",
        );
        const dialog = nav.querySelector<HTMLElement>(
          ".wp-block-navigation__responsive-dialog",
        );
        if (!open || !close || !modal || !dialog) return;
        const toggle = (isOpen: boolean) => {
          modal.classList.toggle("is-menu-open", isOpen);
          modal.classList.toggle("has-modal-open", isOpen);
          document.documentElement.classList.toggle("has-modal-open", isOpen);
          open.setAttribute("aria-expanded", String(isOpen));
          if (isOpen) {
            dialog.setAttribute("role", "dialog");
            dialog.setAttribute("aria-modal", "true");
            dialog.setAttribute("aria-label", "Menu");
            close.focus();
          } else {
            dialog.removeAttribute("role");
            dialog.removeAttribute("aria-modal");
            open.focus();
          }
        };
        open.setAttribute("aria-expanded", "false");
        on(open, "click", () => toggle(true));
        on(close, "click", () => toggle(false));
        on(modal, "keydown", (event) => {
          const e = event as KeyboardEvent;
          if (e.key === "Escape") toggle(false);
          if (e.key === "Tab" && modal.classList.contains("is-menu-open")) {
            const focus = [
              ...modal.querySelectorAll<HTMLElement>("a[href],button"),
            ].filter((el) => el.getBoundingClientRect().width > 0);
            if (e.shiftKey && document.activeElement === focus[0]) {
              e.preventDefault();
              focus.at(-1)?.focus();
            } else if (!e.shiftKey && document.activeElement === focus.at(-1)) {
              e.preventDefault();
              focus[0]?.focus();
            }
          }
        });
      });
    // WordPress supplies this skip link at runtime; reproduce it without its backend.
    const main = document.querySelector("main");
    if (main && !document.querySelector(".skip-link")) {
      main.id ||= "wp--skip-link--target";
      const a = document.createElement("a");
      a.className = "skip-link screen-reader-text";
      a.href = "#" + main.id;
      a.textContent = "Skip to content";
      document.querySelector(".wp-site-blocks")?.prepend(a);
      cleanups.push(() => a.remove());
    }
    return () => cleanups.forEach((fn) => fn());
  }, [bodyClass]);
  return null;
}
