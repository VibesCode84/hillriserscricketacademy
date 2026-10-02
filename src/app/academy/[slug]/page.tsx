import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAcademy, specialistAcademies } from "@/data/academies";
import { getAvailability } from "@/lib/booking";
import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";
import { AcademyDetail } from "@/components/AcademyDetail";
import { CTASection } from "@/components/CTASection";

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return specialistAcademies.map((a) => ({ slug: a.key }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const academy = getAcademy((await params).slug);
  if (!academy) return {};
  return {
    title: { absolute: `${academy.seo.title} | HillRisers` },
    description: academy.seo.description,
    alternates: { canonical: academy.href },
    openGraph: { title: academy.seo.title, description: academy.seo.description },
  };
}

export default async function AcademySessionPage({ params }: Props) {
  const academy = getAcademy((await params).slug);
  if (!academy || !specialistAcademies.includes(academy)) notFound();
  const availability = await getAvailability();

  return (
    <>
      <PageHero
        eyebrow={`${academy.ageLabel} · ${academy.levelLabel}`}
        title={academy.name}
        intro={<p className="font-serif text-2xl italic text-cream/90 md:text-3xl">{academy.strapline}</p>}
        actions={
          <>
            <ButtonLink href={`/book?discipline=${academy.key}`} arrow className="group">Book a Trial</ButtonLink>
            <ButtonLink href="#times" variant="secondary">Session times &amp; price</ButtonLink>
          </>
        }
        image={academy.image}
      >
        <p className="mt-6 text-sm text-slate">90-minute sessions · maximum 18 players · lead coach, assistant coach and two junior helpers</p>
      </PageHero>
      <AcademyDetail academy={academy} availability={availability} />
      <CTASection
        title={`Book a ${academy.shortName} trial.`}
        primary={{ href: `/book?discipline=${academy.key}`, label: "Book a Trial" }}
      />
    </>
  );
}
