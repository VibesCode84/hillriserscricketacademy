import { getSession, formatTimeRange } from "@/data/sessions";
import { getStore } from "@/lib/booking";

export const dynamic = "force-dynamic";

const csvCell = (v: unknown) => {
  const s = v === undefined || v === null ? "" : String(v);
  // Guard against spreadsheet formula injection
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("sessionId") ?? undefined;
  const bookings = await getStore().listBookings({ sessionId });
  const header = [
    "Booking ref", "Status", "Trial", "Session", "Day", "Time", "Player", "Date of birth", "Experience",
    "Parent", "Email", "Mobile", "Emergency contact", "Emergency phone", "Medical / additional needs",
    "Photo consent", "Paid (£)", "Refunded (£)", "Attended", "Booked at",
  ];
  const rows = bookings.map((b) => {
    const s = getSession(b.sessionId);
    return [
      b.id.slice(0, 8).toUpperCase(), b.status, b.isTrial ? "Yes" : "No", s ? `${s.title} — ${s.group}` : b.sessionId,
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
