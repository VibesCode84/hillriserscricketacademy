import { getSession, formatTimeRange, sessionLabel } from "@/data/sessions";
import { coachAvailabilityOptions, interestOptions, labelFor } from "@/lib/interest-options";
import { campDayOptions, campWeeks, holidayOptions, holidayPeriods, sessionTerms } from "@/data/calendar";
import { ageBand, ageOn } from "@/lib/age";
import { FUTURE_CAMPS, getCamp } from "@/data/camps";
import { getStore } from "@/lib/booking";

export const dynamic = "force-dynamic";

const csvCell = (v: unknown) => {
  const s = v === undefined || v === null ? "" : String(v);
  // Guard against spreadsheet formula injection
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

function csv(name: string, header: string[], rows: unknown[][]) {
  return new Response([header.join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  if (params.get("type") === "camps") {
    const rows = await getStore().listCampInterests();
    return csv(
      "hillrisers-camp-interest",
      ["Camps", "Child", "Age", "Interest", "Parent", "Email", "Mobile", "Notes", "Registered at"],
      rows.map((c) => [
        c.camps.map((id) => (id === FUTURE_CAMPS ? "Future camps" : getCamp(id)?.name ?? id)).join(" / "),
        c.childName, c.childAge, c.interest, c.parentName, c.email, c.mobile, c.notes, c.createdAt,
      ]),
    );
  }
  if (params.get("type") === "interest") {
    // One row per child so demand can be analysed by availability, age band and level
    const regs = await getStore().listInterestRegistrations();
    const yes = (list: string[], v: string) => (list.includes(v) ? "Yes" : "");
    return csv(
      "hillrisers-registrations",
      [
        "Registered at", "Parent", "Email", "Mobile", "Postcode", "Heard about us", "News & offers",
        "Child first name", "Date of birth", "Age today", "Age band", "School", "Club", "Girls-only", "Level", "Main role",
        ...interestOptions.availability, "Availability notes",
        ...interestOptions.earlyRisersSlots.map((s) => `Early Risers ${s}`), "How often",
        "Small group (up to 6 per net)", "Group of 3", "1-to-1", "1 hour", "90 minutes", "2 hours",
        ...holidayPeriods.flatMap((p) => holidayOptions.map((o) => `${p.label}: ${o}`)), "Holiday notes",
        "Wants", "Other interests", "Payment preference",
      ],
      regs.flatMap((r) =>
        r.children.map((c) => {
          const age = ageOn(c.dateOfBirth);
          return [
            r.createdAt, r.parentName, r.email, r.mobile, r.postcode, r.heardAbout, r.marketingConsent ? "Yes" : "No",
            c.firstName, c.dateOfBirth, age, ageBand(age), c.school, c.club, labelFor("girlsOnly", c.girlsOnly),
            labelFor("level", c.level), labelFor("mainRole", c.mainRole),
            ...interestOptions.availability.map((o) => yes(c.availability, o)), c.availabilityNotes,
            ...interestOptions.earlyRisersSlots.map((s) => yes(c.earlyRisersSlots ?? [], s)), labelFor("frequency", c.frequency),
            yes(c.formats, "Small group (up to 6 per net)"), yes(c.formats, "Group of 3"), yes(c.formats, "1-to-1"),
            yes(c.sessionLengths, "1 hour"), yes(c.sessionLengths, "90 minutes"), yes(c.sessionLengths, "2 hours"),
            ...holidayPeriods.flatMap((p) => holidayOptions.map((o) => yes(c.holidays?.[p.id] ?? [], o))), c.holidayNotes,
            c.wants.join(" / "), c.otherInterests.join(" / "), labelFor("paymentPreference", c.paymentPreference),
          ];
        }),
      ),
    );
  }
  if (params.get("type") === "coaches") {
    const rows = await getStore().listCoachInterests();
    return csv(
      "hillrisers-coach-interest",
      [
        "Received", "Name", "Email", "Phone", "Roles", "Specialism", "Qualifications", "Playing background", "Coaching experience",
        "Coaching philosophy", "Strengths", "Weaknesses / working on",
        ...coachAvailabilityOptions.saturdayHours.map((h) => `Sat ${h}`),
        ...coachAvailabilityOptions.sundayHours.map((h) => `Sun ${h}`),
        ...coachAvailabilityOptions.weekdayBlocks,
        "Availability notes",
        ...sessionTerms.map((t) => t.label),
        "Summer notes",
        ...campWeeks.flatMap((w) => campDayOptions.map((o) => `Camp ${w.dates}: ${o}`)),
        "Holiday weekly sessions", "Holiday notes", "DBS", "Safeguarding", "First aid", "Message",
      ],
      rows.map((c) => [
        c.createdAt, c.name, c.email, c.phone, c.roles.join(" / "), c.specialism, c.qualifications, c.playingBackground, c.coachingExperience, c.coachingPhilosophy, c.strengths, c.weaknesses,
        ...coachAvailabilityOptions.saturdayHours.map((h) => (c.availability.saturday.includes(h) ? "Yes" : "")),
        ...coachAvailabilityOptions.sundayHours.map((h) => (c.availability.sunday.includes(h) ? "Yes" : "")),
        ...coachAvailabilityOptions.weekdayBlocks.map((b) => (c.availability.weekdayBlocks.includes(b) ? "Yes" : "")),
        c.availability.notes,
        ...sessionTerms.map((t) => (c.availability.terms?.includes(t.label) ? "Yes" : "")),
        c.availability.summerNotes,
        ...campWeeks.flatMap((w) => campDayOptions.map((o) => (c.availability.camps?.[w.id]?.includes(o) ? "Yes" : ""))),
        c.availability.holidayWeekly, c.availability.campNotes, c.dbsStatus, c.safeguardingStatus, c.firstAid ? "Yes" : "No", c.message,
      ]),
    );
  }
  const sessionId = params.get("sessionId") ?? undefined;
  const bookings = await getStore().listBookings({ sessionId });
  const header = [
    "Booking ref", "Status", "Trial", "Session", "Day", "Time", "Player", "Date of birth", "Experience",
    "Parent", "Email", "Mobile", "Emergency contact", "Emergency phone", "Medical / additional needs",
    "Photo consent", "Paid (£)", "Refunded (£)", "Attended", "Booked at",
  ];
  const rows = bookings.map((b) => {
    const s = getSession(b.sessionId);
    return [
      b.id.slice(0, 8).toUpperCase(), b.status, b.isTrial ? "Yes" : "No", s ? sessionLabel(s) : b.sessionId,
      s?.day, s ? formatTimeRange(s) : "", b.player?.name, b.player?.dateOfBirth, b.player?.experience,
      b.parent?.name, b.parent?.email, b.parent?.mobile, b.player?.emergencyContactName, b.player?.emergencyContactPhone,
      b.player?.medicalNotes, b.player?.photoConsent ? "Yes" : "No",
      b.amountPaidPence !== undefined ? (b.amountPaidPence / 100).toFixed(2) : "",
      b.amountRefundedPence !== undefined ? (b.amountRefundedPence / 100).toFixed(2) : "",
      b.attended === undefined ? "" : b.attended ? "Yes" : "No", b.createdAt,
    ].map(csvCell).join(",");
  });
  return new Response([header.join(","), ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hillrisers-bookings${sessionId ? `-${sessionId}` : ""}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
