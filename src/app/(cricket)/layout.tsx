import type { Metadata, Viewport } from "next";
import { site } from "@/data/site";
import { Header, StickyMobileCTA } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cormorant, manrope } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "HillRisers Cricket Academy — Junior Cricket Coaching in Harrow",
    template: "%s | HillRisers Cricket Academy",
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_GB",
    title: "HillRisers Cricket Academy — Junior Cricket Coaching in Harrow",
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

// Term messaging depends on today's date, so static pages refresh hourly
export const revalidate = 3600;

export const viewport: Viewport = {
  themeColor: "#071b3f",
  width: "device-width",
  initialScale: 1,
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: site.name,
  sport: "Cricket",
  url: site.url,
  email: site.email,
  telephone: site.phone,
  description: site.description,
  areaServed: ["Harrow", "Northwood", "Ruislip", "Pinner", "North West London"],
  location: {
    "@type": "Place",
    name: site.venue.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.venue.addressLines[0],
      addressLocality: "Harrow",
      postalCode: site.venue.addressLines[2],
      addressCountry: "GB",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${cormorant.variable} ${manrope.variable}`} data-scroll-behavior="smooth">
      <body>
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-navy-950">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <StickyMobileCTA />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </body>
    </html>
  );
}
