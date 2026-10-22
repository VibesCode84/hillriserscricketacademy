import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { endOfDayLondon, getBlock, partnerBlocks, itemPricePence, machineKey, slotKey } from "../src/data/partners";
import { createD1PartnerStore, createFilePartnerStore, holds } from "../src/lib/partners/store";
import type { D1Database } from "../src/lib/booking/d1-store";
import { partnerCheckoutSchema } from "../src/lib/validation";

function fakeD1(): D1Database {
  const db = new DatabaseSync(":memory:");
  const tick = () => new Promise((r) => setImmediate(r));
  const statement = (sql: string, values: unknown[] = []) => ({
    bind: (...v: unknown[]) => statement(sql, v),
    first: async <T>() => (await tick(), (db.prepare(sql).get(...(values as never[])) as T) ?? null),
    all: async <T>() => (await tick(), { results: db.prepare(sql).all(...(values as never[])) as T[] }),
    run: async () => (await tick(), { meta: { changes: Number(db.prepare(sql).run(...(values as never[])).changes) } }),
  });
  return { prepare: (sql: string) => statement(sql), batch: async (stmts) => Promise.all(stmts.map((s) => s.run())) };
}

const block = getBlock("autumn-2026")!;
const sat = block.slots.find((s) => s.day === "Saturday" && s.start === "14:30")!;
const wed = block.slots.find((s) => s.day === "Wednesday")!;
const thu = block.slots.find((s) => s.day === "Thursday")!;
const partner = { orgName: "Test CC", contactName: "Sam", email: "Sam@Example.com", phone: "07000 000000", type: "Club" };

test("released slots: Wednesdays from 25 Nov, Thursdays two nets, Sundays 9am–5pm", () => {
  assert.deepEqual(wed.dates, ["2026-11-25", "2026-12-02", "2026-12-09"]);
  assert.deepEqual(thu.nets, [1, 2]);
  assert.equal(block.slots.filter((s) => s.day === "Sunday")[0].start, "09:00");
  assert.equal(block.slots.filter((s) => s.day === "Sunday").length, 8);
  assert.equal(block.slots.filter((s) => s.day === "Saturday").length, 3);
  assert.ok(block.slots.every((s) => s.dates.every((d) => d <= "2026-12-13")));
});

test("pricing: £18.80 block rate per net per hour for every week, bowling machine +£10 per hour", () => {
  assert.equal(itemPricePence(wed, false), 3 * 1880);
  assert.equal(itemPricePence(sat, false), 6 * 1880);
  assert.equal(itemPricePence(sat, true), 6 * 2880);
});

for (const [name, make] of [
  ["file", () => createFilePartnerStore(mkdtempSync(path.join(tmpdir(), "hr-partners-")))],
  ["D1", () => createD1PartnerStore(fakeD1())],
] as const) {
  test(`${name}: a net can only be booked once, even when two partners try at the same time`, async () => {
    const store = make();
    const { partner: a, key } = await store.createPartner(partner);
    const { partner: b } = await store.createPartner({ ...partner, orgName: "Other" });
    assert.equal((await store.partnerByKey(key))?.id, a.id);
    assert.equal(a.email, "sam@example.com");
    const k = slotKey(block.id, sat, 2);
    const [r1, r2] = await Promise.all([
      store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: k, bowlingMachine: false }] }),
      store.reserve({ partnerId: b.id, blockId: block.id, items: [{ slotKey: k, bowlingMachine: false }] }),
    ]);
    assert.equal([r1, r2].filter((r) => r.ok).length, 1);
    assert.ok((await store.taken(block.id)).has(k));
  });

  test(`${name}: one bowling machine per time slot`, async () => {
    const store = make();
    const { partner: a } = await store.createPartner(partner);
    const both = await store.reserve({
      partnerId: a.id,
      blockId: block.id,
      items: [{ slotKey: slotKey(block.id, sat, 1), bowlingMachine: true }, { slotKey: slotKey(block.id, sat, 2), bowlingMachine: true }],
    });
    assert.equal(both.ok, false);
    const first = await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: slotKey(block.id, sat, 1), bowlingMachine: true }], machineCoach: "Alex" });
    assert.ok(first.ok && first.booking.totalPence === 6 * 2880);
    const second = await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: slotKey(block.id, sat, 3), bowlingMachine: true }] });
    assert.equal(second.ok, false);
    assert.ok((await store.taken(block.id)).has(machineKey(block.id, sat)));
    // The net without the machine is still fine
    assert.ok((await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: slotKey(block.id, sat, 3), bowlingMachine: false }] })).ok);
  });

  test(`${name}: unreleased nets can't be booked; cancelled holds free the slot; confirm marks paid`, async () => {
    const store = make();
    const { partner: a } = await store.createPartner(partner);
    assert.equal((await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: slotKey(block.id, thu, 3), bowlingMachine: false }] })).ok, false);
    const r = await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: slotKey(block.id, thu, 1), bowlingMachine: false }] });
    assert.ok(r.ok);
    await store.release(r.booking.id, "cancelled");
    assert.equal((await store.taken(block.id)).size, 0);
    const again = await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: slotKey(block.id, thu, 1), bowlingMachine: false }] });
    assert.ok(again.ok);
    await store.confirm(again.booking.id, "pi_123");
    assert.equal((await store.getBooking(again.booking.id))?.status, "confirmed");
    await store.release(again.booking.id, "expired");
    assert.equal((await store.getBooking(again.booking.id))?.status, "confirmed");
  });

  test(`${name}: documents are stored and read back byte for byte (larger than one chunk)`, async () => {
    const store = make();
    const { partner: a } = await store.createPartner(partner);
    const bytes = new Uint8Array(1_300_000).map((_, i) => i % 251);
    const doc = await store.addDocument(a.id, { kind: "dbs", filename: "dbs.pdf", contentType: "application/pdf", size: bytes.length }, bytes);
    const back = await store.getDocument(doc.id);
    assert.equal(back?.doc.review, "pending");
    assert.deepEqual(back?.bytes, bytes);
    await store.reviewDocument(doc.id, "approved");
    assert.equal((await store.documentsFor(a.id))[0].review, "approved");
  });
  test(`${name}: spring can only be booked once the partner's autumn booking is paid`, async () => {
    const store = make();
    const spring = getBlock("spring-2027")!;
    const springSat = spring.slots.find((s) => s.day === "Saturday")!;
    const { partner: a } = await store.createPartner(partner);
    const { partner: b } = await store.createPartner({ ...partner, email: "other@example.com" });
    const springItem = [{ slotKey: slotKey(spring.id, springSat, 1), bowlingMachine: false }];
    const locked = await store.reserve({ partnerId: a.id, blockId: spring.id, items: springItem });
    assert.ok(!locked.ok && locked.reason === "locked");
    const autumn = await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: slotKey(block.id, sat, 1), bowlingMachine: false }] });
    assert.ok(autumn.ok);
    // A hold awaiting payment isn't enough
    assert.equal((await store.reserve({ partnerId: a.id, blockId: spring.id, items: springItem })).ok, false);
    await store.confirm(autumn.booking.id, "pi_1");
    // Another partner's autumn booking doesn't unlock spring for them
    assert.equal((await store.reserve({ partnerId: b.id, blockId: spring.id, items: springItem })).ok, false);
    assert.ok((await store.reserve({ partnerId: a.id, blockId: spring.id, items: springItem })).ok);
  });
  test(`${name}: spring deposit reserves the nets; the balance is due by midnight after the last autumn session`, async () => {
    const store = make();
    const spring = getBlock("spring-2027")!;
    const springSat = spring.slots.find((s) => s.day === "Saturday")!;
    const { partner: a } = await store.createPartner(partner);
    // Autumn can't be reserved with a deposit
    const noDeposit = await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: slotKey(block.id, sat, 1), bowlingMachine: false }], plan: "deposit" });
    assert.equal(noDeposit.ok, false);
    const autumn = await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: slotKey(block.id, sat, 1), bowlingMachine: false }] });
    assert.ok(autumn.ok);
    await store.confirm(autumn.booking.id, "pi_a");
    const r = await store.reserve({ partnerId: a.id, blockId: spring.id, items: [{ slotKey: slotKey(spring.id, springSat, 1), bowlingMachine: false }], plan: "deposit" });
    assert.ok(r.ok);
    assert.equal(r.booking.totalPence, 11 * 1880);
    assert.equal(r.booking.depositPence, Math.round(11 * 1880 * 0.25));
    assert.equal(r.booking.balanceDueDate, "2026-12-12");
    assert.equal(r.booking.balanceDueAt, "2026-12-13T00:00:00.000Z");
    await store.confirm(r.booking.id, "pi_dep");
    assert.equal((await store.getBooking(r.booking.id))?.status, "reserved");
    // A repeated deposit webhook doesn't settle the balance
    await store.confirm(r.booking.id, "pi_dep");
    assert.equal((await store.getBooking(r.booking.id))?.status, "reserved");
    const reserved = (await store.getBooking(r.booking.id))!;
    assert.ok(holds(reserved, Date.parse("2026-12-12T23:00:00Z")));
    assert.ok(!holds(reserved, Date.parse("2026-12-13T00:31:00Z")));
    await store.confirm(r.booking.id, "pi_bal", "balance");
    const paid = (await store.getBooking(r.booking.id))!;
    assert.equal(paid.status, "confirmed");
    assert.ok(paid.balancePaidAt);
  });
}

test("checkout needs the no-video confirmation; bowling machine needs a Level 2 coach and own balls", () => {
  const who = { ageGroup: "Under 11", ability: "Beginner", gender: "Mixed" };
  const base = { blockId: block.id, items: [{ slotKey: slotKey(block.id, sat, 1), bowlingMachine: false, ...who }], noVideo: true, agreeTerms: true };
  assert.ok(partnerCheckoutSchema.safeParse(base).success);
  assert.ok(!partnerCheckoutSchema.safeParse({ ...base, noVideo: false }).success);
  const machine = { ...base, items: [{ slotKey: slotKey(block.id, sat, 1), bowlingMachine: true, ...who }] };
  const bad = partnerCheckoutSchema.safeParse(machine);
  assert.ok(!bad.success);
  assert.deepEqual(bad.error.issues.map((i) => i.path.join(".")).sort(), ["machineCoach", "ownBalls"]);
  assert.ok(partnerCheckoutSchema.safeParse({ ...machine, machineCoach: "Alex Smith", ownBalls: true }).success);
});

test("each booked session says who it's for", () => {
  const item = { slotKey: slotKey(block.id, sat, 1), bowlingMachine: false };
  const bad = partnerCheckoutSchema.safeParse({ blockId: block.id, items: [item], noVideo: true, agreeTerms: true });
  assert.ok(!bad.success);
  assert.deepEqual(bad.error.issues.map((i) => i.path.join(".")).sort(), ["items.0.ability", "items.0.ageGroup", "items.0.gender"]);
  const ok = partnerCheckoutSchema.safeParse({ blockId: block.id, items: [{ ...item, ageGroup: "Adults", ability: "Advanced", gender: "Female" }], noVideo: true, agreeTerms: true });
  assert.ok(ok.success);
});

test("spring block: 11 weeks from 6 January, none in half term", () => {
  const spring = partnerBlocks.find((b) => b.id === "spring-2027")!;
  for (const s of spring.slots) {
    assert.equal(s.dates.length, 11);
    assert.ok(s.dates.every((d) => d < "2027-02-15" || d > "2027-02-21"));
  }
  assert.equal(spring.slots.find((s) => s.day === "Wednesday")!.dates[0], "2027-01-06");
  assert.equal(spring.slots.find((s) => s.day === "Sunday")!.dates.at(-1), "2027-03-28");
});

test("midnight UK time at the end of a date, in GMT and BST", () => {
  assert.equal(endOfDayLondon("2026-12-13").toISOString(), "2026-12-14T00:00:00.000Z");
  assert.equal(endOfDayLondon("2027-06-01").toISOString(), "2027-06-01T23:00:00.000Z");
});
