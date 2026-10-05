"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, phoneHref, site } from "@/data/site";
import { Logo } from "./Logo";
import { ButtonLink } from "./Button";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (pathname.startsWith("/admin")) return null;

  // Booking pages have light backgrounds, so the header is always solid there
  const solid = scrolled || open || pathname.startsWith("/book") || pathname.startsWith("/register");
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid ? "bg-navy-950/92 shadow-[0_1px_0_rgba(213,169,63,0.15)] backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-[4.5rem] items-center justify-between gap-6 lg:h-20">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-6 xl:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className="link-underline whitespace-nowrap text-[0.9rem] font-medium text-cream/85 hover:text-cream"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 xl:flex">
          <ButtonLink href="/register" className="!px-5 !py-2.5">
            Register Interest
          </ButtonLink>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          {site.phone && (
            <a href={phoneHref(site.phone)} className="rounded-full p-2.5 text-cream/80 hover:text-gold" aria-label={`Call us on ${site.phone}`}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </a>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="relative h-11 w-11 rounded-full text-cream"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className={`absolute left-3 right-3 top-[17px] h-px bg-current transition-all duration-300 ${open ? "top-[21px] rotate-45" : ""}`} />
            <span className={`absolute left-3 right-3 top-[25px] h-px bg-current transition-all duration-300 ${open ? "top-[21px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`fixed inset-x-0 bottom-0 top-[4.5rem] overflow-y-auto bg-navy-950 transition-all duration-500 xl:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="container-x flex flex-col pb-32 pt-6">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              style={{ transitionDelay: open ? `${60 + i * 35}ms` : "0ms" }}
              className={`border-b border-cream/10 py-4 font-serif text-[1.75rem] text-cream transition-all duration-500 aria-[current=page]:text-gold ${
                open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-8 flex flex-col gap-3">
            <ButtonLink href="/register" className="w-full">Register Interest</ButtonLink>
            <ButtonLink href="/how-booking-works" variant="secondary" className="w-full">How it works</ButtonLink>
          </div>
          {site.phone && (
            <p className="mt-8 text-sm text-slate">
              Questions? Call <a href={phoneHref(site.phone)} className="text-gold-soft underline underline-offset-4">{site.phone}</a>
            </p>
          )}
        </nav>
      </div>
    </header>
  );
}

/** Sticky "Register your interest" bar for phones */
export function StickyMobileCTA() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/book") || pathname.startsWith("/register") || pathname.startsWith("/admin")) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-gold/20 bg-navy-950/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition-transform duration-500 md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-3">
        <ButtonLink href="/register" className="flex-1 !py-3">Register your interest</ButtonLink>
      </div>
    </div>
  );
}
