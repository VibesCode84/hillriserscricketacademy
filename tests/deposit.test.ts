import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { FileBookingStore } from "../src/lib/booking/file-store";
import { academies, depositFor, getAcademy } from "../src/data/academies";
import { sessions, durationMinutes } from "../src/data/sessions";

test("the deposit is the first session fee: £25 for 90 minutes, £15 for Little Cricketers", () => {
  assert.equal(depositFor("batting"), 2500);
  assert.equal(depositFor("girls"), 2500);
  assert.equal(depositFor("little-cricketers"), 1500);
  for (const a of academies) {
    assert.equal(a.pricePence, a.key === "little-cricketers" ? 1500 : 2500, a.key);
    assert.equal(a.sessionMinutes, a.key === "little-cricketers" ? 60 : 90, a.key);
  }
});

test("any slot assigned to an academy matches that academy's length and fee", () => {
  for (const s of sessions) {
    if (!s.discipline) continue;
    const a = getAcademy(s.discipline)!;
    assert.equal(s.pricePence, a.pricePence, s.id);
    if (s.startTime && s.endTime) assert.equal(durationMinutes(s), a.sessionMinutes, s.id);
  }
});

test("deposit lifecycle: pending → paid (idempotent) → refunded", async () => {
  const store = new FileBookingStore(path.join(mkdtempSync(path.join(tmpdir(), "hillrisers-")), "store.json"));
  const { parent, player } = await store.createProfile({
    parent: { name: "Parent", email: "p@example.com", mobile: "07000000000" },
    player: {
      name: "Little One",
      dateOfBirth: "2021-01-01",
      gender: "girl",
      experience: "new",
      interest: "not-sure",
      emergencyContactName: "Gran",
      emergencyContactPhone: "07000000001",
      photoConsent: false,
    },
  });
  const r = await store.createTrialRequest({
    parentId: parent.id,
    playerId: player.id,
    academy: "little-cricketers",
    preferredDays: ["Sunday"],
    depositPence: depositFor("little-cricketers"),
  });
  assert.equal(r.depositStatus, "pending");
  await store.attachDepositCheckout(r.id, "cs_1");
  assert.equal((await store.findTrialRequestByCheckoutId("cs_1"))?.id, r.id);

  const first = await store.markDepositPaid(r.id, { paymentIntentId: "pi_1", amountPaidPence: 1500 });
  const again = await store.markDepositPaid(r.id, { paymentIntentId: "pi_1", amountPaidPence: 1500 });
  assert.equal(first.changed, true);
  assert.equal(again.changed, false);
  assert.equal(first.request?.depositPence, 1500);
  // An expired, superseded checkout must not undo a paid deposit
  assert.equal((await store.markDepositUnpaid(r.id))?.depositStatus, "paid");

  const refunded = await store.recordDepositRefund((await store.findTrialRequestByPaymentIntent("pi_1"))!.id, 1500);
  assert.equal(refunded?.depositStatus, "refunded");
});

test("a request sent without a deposit has no deposit status", async () => {
  const store = new FileBookingStore(path.join(mkdtempSync(path.join(tmpdir(), "hillrisers-")), "store.json"));
  const { parent, player } = await store.createProfile({
    parent: { name: "Parent", email: "q@example.com", mobile: "07000000000" },
    player: {
      name: "Player",
      dateOfBirth: "2015-01-01",
      gender: "boy",
      experience: "some",
      interest: "batting",
      emergencyContactName: "Gran",
      emergencyContactPhone: "07000000001",
      photoConsent: false,
    },
  });
  const r = await store.createTrialRequest({ parentId: parent.id, playerId: player.id, academy: "batting", preferredDays: [] });
  assert.equal(r.depositStatus, "none");
});

test("terms follow the John Lyon calendar; fees due at least 10 days before sessions start", async () => {
  const { terms, paymentDueDate, sessionDates, termFee, upcomingTerm, termStartLabel, PAYMENT_DUE_DAYS_BEFORE } = await import(
    "../src/data/term"
  );
  const [autumn, spring, summer] = terms;
  const DAY = 86_400_000;
  assert.equal(PAYMENT_DUE_DAYS_BEFORE, 10);
  for (const t of terms) {
    const notice = (Date.parse(t.startsOn) - Date.parse(paymentDueDate(t))) / DAY;
    assert.ok(notice >= 10, `${t.id} fees due only ${notice} days before`);
  }
  assert.equal(paymentDueDate(autumn), "2026-10-22");
  assert.equal(paymentDueDate(spring), "2026-12-11"); // before Christmas
  assert.equal(paymentDueDate(summer), "2027-04-06");

  // Autumn: first session Sunday 1 November, to 11 December
  assert.equal(termStartLabel(autumn), "Sunday 1 November");
  assert.equal(sessionDates(autumn, "Sunday")[0], "2026-11-01");
  assert.deepEqual(sessionDates(autumn, "Wednesday"), ["2026-11-04", "2026-11-11", "2026-11-18", "2026-11-25", "2026-12-02", "2026-12-09"]);
  assert.equal(sessionDates(autumn, "Saturday").length, 5);
  assert.equal(termFee(autumn, "Wednesday", 2500), 15000);

  // No sessions in the half-term week, including the weekends either side
  for (const d of ["2027-02-13", "2027-02-14", "2027-02-16", "2027-02-17", "2027-02-20", "2027-02-21"]) {
    assert.ok(!(["Wednesday", "Saturday", "Sunday"] as const).some((day) => sessionDates(spring, day).includes(d)), d);
  }
  for (const d of ["2027-05-29", "2027-05-30", "2027-06-01", "2027-06-02", "2027-06-05", "2027-06-06"]) {
    assert.ok(!(["Wednesday", "Saturday", "Sunday"] as const).some((day) => sessionDates(summer, day).includes(d)), d);
  }
  assert.ok(sessionDates(spring, "Saturday").includes("2027-02-06"));
  assert.ok(sessionDates(spring, "Saturday").includes("2027-02-27"));

  // Which term families see
  assert.equal(upcomingTerm(new Date("2026-10-02")).id, "autumn-2026");
  assert.equal(upcomingTerm(new Date("2026-11-15")).id, "spring-2027");
  assert.equal(upcomingTerm(new Date("2026-12-20")).id, "summer-2027");
});

test("holiday camp interest is stored (camp details TBC)", async () => {
  const { camps } = await import("../src/data/camps");
  assert.equal(camps[0].name, "Spring Half Term Camp");
  assert.equal(camps[0].bookable, false);
  const store = new FileBookingStore(path.join(mkdtempSync(path.join(tmpdir(), "hillrisers-")), "store.json"));
  await store.createCampInterest({
    camps: [camps[0].id, "future"],
    parentName: "Parent",
    email: " P@Example.com",
    childName: "Kid",
    childAge: 10,
    interest: "batting",
  });
  const [c] = await store.listCampInterests();
  assert.equal(c.email, "p@example.com");
  assert.deepEqual(c.camps, [camps[0].id, "future"]);
});

test("term dates format the same on server and browser", async () => {
  const { formatTermDate } = await import("../src/data/term");
  assert.equal(formatTermDate("2027-02-19", { weekday: true, year: true }), "Friday 19 February 2027");
  assert.equal(formatTermDate("2026-11-01"), "1 November");
});
