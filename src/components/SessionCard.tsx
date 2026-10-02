import Link from "next/link";
import { formatPrice } from "@/data/site";
import { durationMinutes, formatTimeRange, type AcademySession } from "@/data/sessions";
import type { SessionAvailability } from "@/lib/booking";
import { buttonClass } from "./Button";

export function AvailabilityBadge({ session, availability }: { session: AcademySession; availability?: SessionAvailability }) {
  if (!session.confirmed) {
    return <Badge className="bg-cream/10 text-slate">Times being finalised</Badge>;
  }
  if (!availability) return null;
  if (availability.status === "full") return <Badge className="bg-[#5b1f1f]/60 text-[#f4c7c3]">Full · Waiting list</Badge>;
  if (availability.status === "limited")
    return (
      <Badge className="bg-gold/15 text-gold-soft">
        {availability.remaining === 1 ? "1 place left" : `${availability.remaining} places left`}
      </Badge>
    );
  return <Badge className="bg-[#1f4a3a]/60 text-[#bfe6d2]">Places available</Badge>;
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export function sessionCta(session: AcademySession, availability?: SessionAvailability) {
  if (!session.confirmed) return { href: `/book?session=${session.id}`, label: "Register interest" };
  if (availability?.status === "full") return { href: `/book?session=${session.id}`, label: "Join Waiting List" };
  return { href: `/book?session=${session.id}`, label: "Book a Trial" };
}

export function SessionCard({
  session,
  availability,
  showDay = true,
  reason,
}: {
  session: AcademySession;
  availability?: SessionAvailability;
  showDay?: boolean;
  reason?: string;
}) {
  const cta = sessionCta(session, availability);
  return (
    <article className="card-lift flex h-full flex-col rounded-2xl border border-cream/10 bg-navy-900 p-6 hover:border-gold/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gold">
          {showDay && `${session.day} · `}
          {formatTimeRange(session)}
          {!session.confirmed && <span className="font-normal text-slate"> (provisional)</span>}
        </p>
        <AvailabilityBadge session={session} availability={availability} />
      </div>
      <h3 className="mt-4 text-2xl leading-tight text-cream">{session.title}</h3>
      <p className="mt-1 text-sm text-slate">
        {session.group} · Ages {session.ageMin}–{session.ageMax}
        {session.girlsOnly && " · Girls only"}
      </p>
      {reason && <p className="mt-4 text-[0.95rem] leading-relaxed text-cream/80">{reason}</p>}
      <div className="mt-auto flex items-end justify-between gap-4 pt-6">
        <p className="text-sm text-slate">
          {durationMinutes(session)} min · max {session.capacity}
          <span className="mt-0.5 block font-serif text-2xl text-cream">{formatPrice(session.pricePence)}</span>
        </p>
        <Link href={cta.href} className={buttonClass(cta.label === "Book a Trial" ? "primary" : "secondary", "!px-5 !py-2.5 text-sm")}>
          {cta.label}
        </Link>
      </div>
    </article>
  );
}
