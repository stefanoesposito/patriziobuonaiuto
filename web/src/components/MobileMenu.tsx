"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Lang } from "@/lib/types";

export function MobileMenu({
  lang,
  name,
  children,
}: {
  lang: Lang;
  name: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const it = lang === "it";

  function closeMenu() {
    dialog.current?.close();
  }

  // Layouts persist between routes. Close for history/programmatic navigation too.
  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const body = document.body;
    const rootOverflow = root.style.overflow;
    const bodyOverflow = body.style.overflow;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 721px)");
    const onResize = () => {
      if (desktop.matches) dialog.current?.close();
    };
    desktop.addEventListener("change", onResize);
    return () => {
      root.style.overflow = rootOverflow;
      body.style.overflow = bodyOverflow;
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <div className="mobile-menu">
      <button
        className="mobile-menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu-dialog"
        onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
        }}
      >
        Menu
      </button>
      <dialog
        ref={dialog}
        id="mobile-menu-dialog"
        className="mobile-menu-dialog"
        aria-label={it ? "Navigazione principale" : "Main navigation"}
        onClose={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = event.currentTarget.querySelectorAll<HTMLElement>(
            "a[href], button:not([disabled])",
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="mobile-menu-header">
          <Link className="brand" href={`/${lang}`} onClick={closeMenu}>
            {name}
          </Link>
          <button className="mobile-menu-close" type="button" onClick={closeMenu} autoFocus>
            {it ? "Chiudi" : "Close"} <span aria-hidden="true">×</span>
          </button>
        </div>
        <nav
          className="mobile-menu-links"
          aria-label={it ? "Navigazione mobile" : "Mobile navigation"}
          onClick={(event) => {
            if (event.target instanceof Element && event.target.closest("a")) {
              closeMenu();
            }
          }}
        >
          {children}
        </nav>
      </dialog>
    </div>
  );
}
