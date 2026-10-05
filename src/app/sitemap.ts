import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "", "/register", "/programmes", "/how-booking-works", "/girls", "/little-cricketers", "/venue", "/coaches", "/coach-with-us",
    "/camps", "/faq", "/contact", "/refer", "/terms", "/safeguarding", "/privacy", "/refunds", "/accessibility",
  ];
  return pages.map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : p === "/register" || p === "/programmes" ? 0.9 : 0.6,
  }));
}
