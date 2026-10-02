import type { ReactNode } from "react";
import { PageHero } from "./Hero";
import { Section } from "./Section";

export function LegalPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro} />
      <Section tone="light">
        <div className="prose-academy mx-auto max-w-3xl">
          {children}
          <p className="mt-12 border-t border-navy-950/10 pt-6 text-sm">
            Last updated: {/* TODO: set when reviewed */}to be confirmed. This page is a working draft and should be reviewed by the academy
            before launch.
          </p>
        </div>
      </Section>
    </>
  );
}
