import { notFound } from "next/navigation";

// Any unknown URL shows the cricket site's own "page not found" (this app has two root layouts, so there is no global one)
export default function Missing() {
  notFound();
}
