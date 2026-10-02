import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { FileBookingStore } from "../src/lib/booking/file-store";
import { availabilityFor } from "../src/lib/booking";
import { getSession } from "../src/data/sessions";

const SESSION = "wed-1800"; // capacity 18

async function freshStore() {
  const dir = mkdtempSync(path.join(tmpdir(), "hillrisers-"));
  return new FileBookingStore(path.join(dir, "store.json"));
}

async function profile(store: FileBookingStore, n: number) {
  return store.createProfile({
    parent: { name: `Parent ${n}`, email: `parent${n}@example.com`, mobile: "07000000000" },
    player: {
      name: `Player ${n}`,
      dateOfBirth: "2016-01-01",
      gender: "boy",
      experience: "some",
      interest: "batting",
      emergencyContactName: "Grandparent",
      emergencyContactPhone: "07000000001",
      photoConsent: false,
    },
  });
}

test("never books more than capacity, even with simultaneous requests", async () => {
  const store = await freshStore();
  const profiles = await Promise.all(Array.from({ length: 25 }, (_, i) => profile(store, i)));
  const results = await Promise.all(
    profiles.map(({ parent, player }) =>
      store.reservePlace({ sessionId: SESSION, parentId: parent.id, playerId: player.id, holdMinutes: 10, isTrial: true }),
    ),
  );
  assert.equal(results.filter((r) => r.ok).length, 18);
  assert.ok(results.filter((r) => !r.ok).every((r) => !r.ok && r.reason === "full"));
  const counts = await store.sessionCounts();
  assert.equal(counts[SESSION].held, 18);
  assert.equal(availabilityFor(getSession(SESSION)!, counts[SESSION]).status, "full");
});

test("expired holds release the place", async () => {
  const store = await freshStore();
  const { parent, player } = await profile(store, 1);
  const r = await store.reservePlace({ sessionId: SESSION, parentId: parent.id, playerId: player.id, holdMinutes: -1, isTrial: true });
  assert.ok(r.ok);
  const counts = await store.sessionCounts();
  assert.equal(counts[SESSION]?.held ?? 0, 0);
});

test("confirming is idempotent and refunds release capacity", async () => {
  const store = await freshStore();
  const { parent, player } = await profile(store, 1);
  const r = await store.reservePlace({ sessionId: SESSION, parentId: parent.id, playerId: player.id, holdMinutes: 10, isTrial: true });
  assert.ok(r.ok);
  const first = await store.confirmBooking(r.booking.id, { paymentIntentId: "pi_1", amountPaidPence: 2500 });
  const second = await store.confirmBooking(r.booking.id, { paymentIntentId: "pi_1", amountPaidPence: 2500 });
  assert.equal(first.changed, true);
  assert.equal(second.changed, false);
  assert.equal((await store.sessionCounts())[SESSION].confirmed, 1);

  const part = await store.recordRefund(r.booking.id, 1000);
  assert.equal(part?.status, "part_refunded");
  assert.equal((await store.sessionCounts())[SESSION].confirmed, 1);

  const full = await store.recordRefund(r.booking.id, 2500);
  assert.equal(full?.status, "refunded");
  assert.equal((await store.sessionCounts())[SESSION]?.confirmed ?? 0, 0);
  assert.ok(await store.findBookingByPaymentIntent("pi_1"));
});

test("parent email is the booking identity", async () => {
  const store = await freshStore();
  const a = await profile(store, 1);
  const b = await store.createProfile({
    parent: { name: "Parent One", email: "PARENT1@example.com ", mobile: "07000000009" },
    player: { ...a.player, name: "Sibling" },
  });
  assert.equal(a.parent.id, b.parent.id);
  assert.notEqual(a.player.id, b.player.id);
});
