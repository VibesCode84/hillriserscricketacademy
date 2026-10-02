import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "dark";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[0.95rem] font-semibold tracking-[0.01em] transition-all duration-300 ease-[var(--ease-premium)] disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-gold text-navy-950 hover:bg-gold-soft shadow-[0_8px_30px_-12px_rgba(213,169,63,0.6)] hover:-translate-y-px",
  secondary: "border border-cream/30 text-cream hover:border-gold hover:text-gold-soft",
  ghost: "text-gold hover:text-gold-soft px-0 py-1",
  dark: "bg-navy-950 text-cream hover:bg-navy-800 hover:-translate-y-px",
};

export function buttonClass(variant: Variant = "primary", className = "") {
  return `${base} ${variants[variant]} ${className}`;
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  arrow = false,
  ...rest
}: { href: string; variant?: Variant; className?: string; children: ReactNode; arrow?: boolean } & Omit<
  ComponentProps<typeof Link>,
  "href" | "className"
>) {
  return (
    <Link href={href} className={buttonClass(variant, className)} {...rest}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: { variant?: Variant } & ComponentProps<"button">) {
  return (
    <button className={buttonClass(variant, className)} {...rest}>
      {children}
    </button>
  );
}

export function Arrow({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`${className} transition-transform duration-300 group-hover:translate-x-0.5`} aria-hidden="true">
      <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
