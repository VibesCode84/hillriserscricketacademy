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

test("term fees are due one week before sessions start", async () => {
  const { term, paymentDueDate, termStartLabel, termPaymentDueLabel } = await import("../src/data/term");
  assert.equal(term.startsWeekCommencing, "2026-11-01");
  assert.equal(paymentDueDate(), "2026-10-25");
  assert.equal(termStartLabel, "week commencing 1 November");
  assert.equal(termPaymentDueLabel, "Sunday 25 October");
});
