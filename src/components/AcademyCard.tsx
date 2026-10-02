import Link from "next/link";
import type { Academy } from "@/data/academies";
import { Photo } from "./Photo";
import { Arrow } from "./Button";

export function AcademyCard({ academy, tone = "dark" }: { academy: Academy; tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <Link
      href={academy.href}
      className={`group card-lift flex h-full flex-col overflow-hidden rounded-2xl ${
        light ? "bg-white shadow-[0_1px_0_rgba(7,24,47,0.06)] hover:shadow-[0_24px_50px_-28px_rgba(7,24,47,0.35)]" : "bg-navy-900 hover:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.7)]"
      }`}
    >
      <Photo src={academy.image.src} alt={academy.image.alt} className="aspect-[4/3]" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" showCaption={false} />
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${light ? "text-gold-deep" : "text-gold"}`}>
          {academy.ageLabel}
        </p>
        <h3 className={`mt-3 text-[1.75rem] leading-tight ${light ? "text-navy-950" : "text-cream"}`}>{academy.name}</h3>
        <p className={`mt-3 flex-1 leading-relaxed ${light ? "text-ink-muted" : "text-slate"}`}>{academy.proposition}</p>
        <p className={`mt-4 text-sm ${light ? "text-ink-muted" : "text-slate/80"}`}>{academy.levelLabel}</p>
        <span className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold ${light ? "text-navy-950" : "text-gold"}`}>
          View Session <Arrow />
        </span>
      </div>
    </Link>
  );
}
