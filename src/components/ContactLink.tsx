import Link from "next/link";
import { site } from "@/data/site";

/** "email us at x" when an email is set, otherwise a link to the contact form. */
export function ContactLink({ children = "contact us" }: { children?: React.ReactNode }) {
  return site.email ? <a href={`mailto:${site.email}`}>{site.email}</a> : <Link href="/contact">{children}</Link>;
}
