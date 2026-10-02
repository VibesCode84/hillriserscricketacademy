import { PageHero } from "@/components/Hero";
import { ButtonLink } from "@/components/Button";

export default function NotFound() {
  return (
    <PageHero
      eyebrow="Page not found"
      title="That one’s gone over the boundary."
      intro={<p>We couldn&rsquo;t find the page you were looking for.</p>}
      actions={
        <>
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/sessions" variant="secondary">See the timetable</ButtonLink>
        </>
      }
    />
  );
}
