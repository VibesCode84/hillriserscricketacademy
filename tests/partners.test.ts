import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { getBlock, itemPricePence, machineKey, slotKey } from "../src/data/partners";
import { createD1PartnerStore, createFilePartnerStore } from "../src/lib/partners/store";
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
const partner = { orgName: "Test CC", contactName: "Sam", email: "Sam@Example.com", phone: "07000 000000", type: "Club", sports: "Cricket" };

test("released slots: Wednesdays from 25 Nov, Thursdays two nets, Sundays 9am–5pm", () => {
  assert.deepEqual(wed.dates, ["2026-11-25", "2026-12-02", "2026-12-09"]);
  assert.deepEqual(thu.nets, [1, 2]);
  assert.equal(block.slots.filter((s) => s.day === "Sunday")[0].start, "09:00");
  assert.equal(block.slots.filter((s) => s.day === "Sunday").length, 8);
  assert.equal(block.slots.filter((s) => s.day === "Saturday").length, 3);
  assert.ok(block.slots.every((s) => s.dates.every((d) => d <= "2026-12-13")));
});

test("pricing: £17 per net per hour for every week, bowling machine +£10 per hour", () => {
  assert.equal(itemPricePence(wed, false), 3 * 1700);
  assert.equal(itemPricePence(sat, false), 6 * 1700);
  assert.equal(itemPricePence(sat, true), 6 * 2700);
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
    assert.ok(first.ok && first.booking.totalPence === 6 * 2700);
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
}

test("checkout needs the no-video confirmation; bowling machine needs a Level 2 coach and own balls", () => {
  const base = { blockId: block.id, items: [{ slotKey: slotKey(block.id, sat, 1), bowlingMachine: false }], noVideo: true, agreeTerms: true };
  assert.ok(partnerCheckoutSchema.safeParse(base).success);
  assert.ok(!partnerCheckoutSchema.safeParse({ ...base, noVideo: false }).success);
  const machine = { ...base, items: [{ slotKey: slotKey(block.id, sat, 1), bowlingMachine: true }] };
  const bad = partnerCheckoutSchema.safeParse(machine);
  assert.ok(!bad.success);
  assert.deepEqual(bad.error.issues.map((i) => i.path.join(".")).sort(), ["machineCoach", "ownBalls"]);
  assert.ok(partnerCheckoutSchema.safeParse({ ...machine, machineCoach: "Alex Smith", ownBalls: true }).success);
});
