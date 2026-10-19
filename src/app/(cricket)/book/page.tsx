import { redirect } from "next/navigation";

/**
 * Trial booking opens once the timetable is published (see src/data/launch.ts).
 * Until then, families register their interest.
 */
export default function BookPage() {
  redirect("/register");
}
