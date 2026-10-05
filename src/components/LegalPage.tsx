import type { ReactNode } from "react";
import { PageHero } from "./Hero";
import { Section } from "./Section";

export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
  draft = true,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  draft?: boolean;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro} />
      <Section tone="light">
        <div className="prose-academy mx-auto max-w-3xl">
          {draft && (
            <p className="!mb-10 rounded-xl border border-gold-deep/40 bg-cream-200 p-4 text-sm !text-navy-950" role="note">
              <strong>Draft – to be reviewed.</strong> This page is a working draft and will be confirmed by HillRisers before bookings open.
            </p>
          )}
          {children}
        </div>
      </Section>
    </>
  );
}
