import type { ReactNode } from "react";
import { PageHero } from "./Hero";
import { Section } from "./Section";

export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
  mayChange = true,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  /** Shows a note that the page may be updated */
  mayChange?: boolean;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro} />
      <Section tone="light">
        <div className="prose-academy mx-auto max-w-3xl">
          {children}
          {mayChange && <p className="!mt-12 text-sm">We may update this page from time to time. The latest version will always be published here.</p>}
        </div>
      </Section>
    </>
  );
}
