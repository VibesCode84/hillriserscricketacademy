import type { Metadata, Viewport } from "next";
import { hub } from "@/data/hub";
import { cormorant, manrope } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(hub.url),
  title: "HillRisers — Sport for Every Stage in Harrow",
  description: hub.description,
  openGraph: { type: "website", siteName: hub.name, locale: "en_GB", title: "HillRisers", description: hub.description },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#071b3f",
  width: "device-width",
  initialScale: 1,
};

/** Root layout for the HillRisers landing page (hillrisers.co.uk) — no cricket academy header or footer */
export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${cormorant.variable} ${manrope.variable}`} data-scroll-behavior="smooth">
      <body className="bg-navy-950">{children}</body>
    </html>
  );
}
