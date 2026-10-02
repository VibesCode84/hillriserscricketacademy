import type { MetadataRoute } from "next";
import { academies } from "@/data/academies";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "", "/academy", "/sessions", "/girls", "/little-cricketers", "/camps", "/coaches", "/venue", "/faq", "/find-my-session",
    "/book", "/contact", "/refer", "/safeguarding", "/privacy", "/terms", "/refunds", "/accessibility",
  ];
  const academyPages = academies.map((a) => a.href).filter((h) => h.startsWith("/academy/"));
  return [...pages, ...academyPages].map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : p.startsWith("/academy") || p === "/girls" ? 0.9 : 0.6,
  }));
}
