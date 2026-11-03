import "../globals.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import type { Lang } from "@/lib/types";
import { MobileMenu } from "@/components/MobileMenu";
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (lang !== "it" && lang !== "en") notFound();
  const { settings } = await getContent(lang as Lang);
  const it = lang === "it";
  const menu = (
    <>
      <Link href={`/${lang}/portfolio`}>{it ? "Opere" : "Works"}</Link>
      <Link href={`/${lang}/${it ? "su-di-me" : "about-me"}`}>
        {it ? "Biografia e CV" : "Biography & CV"}
      </Link>
      <Link href={`/${lang}/contact`}>{it ? "Contatti" : "Contact"}</Link>
      <Link
        href={it ? "/en" : "/it"}
        lang={it ? "en" : "it"}
        aria-label={it ? "Read in English" : "Leggi in italiano"}
      >
        {it ? "EN" : "IT"}
      </Link>
      <a
        className="profile-link"
        href="https://www.sanity.io/login/email"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={it ? "Accedi a Sanity (nuova scheda)" : "Sign in to Sanity (new tab)"}
        title={it ? "Accedi a Sanity" : "Sign in to Sanity"}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <circle cx="12" cy="7.5" r="3.5" />
          <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
        </svg>
      </a>
    </>
  );
  return (
    <html lang={lang} data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          {it ? "Vai al contenuto" : "Skip to content"}
        </a>
        <header className="site-header">
          <Link className="brand" href={`/${lang}`}>
            {settings.name}
          </Link>
          <nav
            className="desktop-nav"
            aria-label={it ? "Navigazione principale" : "Main navigation"}
          >
            {menu}
          </nav>
          <MobileMenu lang={lang} name={settings.name}>
            {menu}
          </MobileMenu>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <p className="eyebrow">PATRIZIO BUONAIUTO · NAPOLI</p>
          <h2>
            {it
              ? "Un capolavoro, dipinto per te."
              : "A masterpiece, painted for you."}
          </h2>
          <a className="text-link" href={`mailto:${settings.email}`}>
            {it ? "Scrivi a Patrizio" : "Write to Patrizio"} ↗
          </a>
          <div className="footer-links">
            <Link href={`/${lang}/${it ? "su-di-me" : "about-me"}`}>
              {it ? "Biografia e CV" : "Biography & CV"}
            </Link>
            <Link href={`/${lang}/portfolio`}>
              {it ? "Tutte le opere" : "All artworks"}
            </Link>
            <a href={settings.facebook}>Facebook</a>
          </div>
          <p className="small">
            © {new Date().getFullYear()} {settings.name}
          </p>
        </footer>
      </body>
    </html>
  );
}
