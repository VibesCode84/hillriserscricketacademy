import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const links = [
  { href: "/admin/bookings", label: "Academy" },
  { href: "/admin/partners", label: "Delivery partners" },
  { href: "/admin/invoices", label: "Invoices" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream text-navy-950">
      <nav className="border-b border-navy-950/10 bg-white print:hidden" aria-label="Admin">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-1 px-5 py-2 text-sm font-semibold">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3 py-1.5 hover:bg-cream-200">{l.label}</Link>
          ))}
        </div>
      </nav>
      {children}
    </div>
  );
}
