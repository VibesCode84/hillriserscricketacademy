import { getSession, formatTimeRange, sessionLabel } from "@/data/sessions";
import { getAcademy } from "@/data/academies";
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
  if (params.get("type") === "trials") {
    const trials = await getStore().listTrialRequests();
    return csv(
      "hillrisers-trial-requests",
      ["Status", "Academy", "Preferred days", "Player", "Date of birth", "Gender", "Experience", "Interest", "Club/school", "Parent", "Email", "Mobile", "Emergency contact", "Emergency phone", "Medical / additional needs", "Photo consent", "Heard via", "Requested at"],
      trials.map((t) => [
        t.status, getAcademy(t.academy)?.name ?? t.academy, t.preferredDays.join(" / ") || "Any", t.player?.name, t.player?.dateOfBirth,
        t.player?.gender, t.player?.experience, t.player?.interest, t.player?.clubOrSchool, t.parent?.name, t.parent?.email,
        t.parent?.mobile, t.player?.emergencyContactName, t.player?.emergencyContactPhone, t.player?.medicalNotes,
        t.player?.photoConsent ? "Yes" : "No", t.player?.heardAbout, t.createdAt,
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
