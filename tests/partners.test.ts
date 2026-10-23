import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { balanceReminderDates, endOfDayLondon, getBlock, londonDate, londonTime, partnerBlocks, itemPricePence, machineKey, slotKey } from "../src/data/partners";
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

  test(`${name}: balance reminders go out once each, after 8am UK time, until the balance is paid`, async () => {
    const store = make();
    const spring = getBlock("spring-2027")!;
    const { partner: a } = await store.createPartner(partner);
    const autumn = await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: slotKey(block.id, sat, 1), bowlingMachine: false }] });
    assert.ok(autumn.ok);
    await store.confirm(autumn.booking.id, "pi_a");
    const r = await store.reserve({ partnerId: a.id, blockId: spring.id, items: [{ slotKey: slotKey(spring.id, spring.slots.find((s) => s.day === "Saturday")!, 1), bowlingMachine: false }], plan: "deposit" });
    assert.ok(r.ok);
    await store.confirm(r.booking.id, "pi_dep");
    const booked = (await store.getBooking(r.booking.id))!;
    assert.equal(booked.firstSessionDate, "2026-11-07");
    const days = balanceReminderDates(booked.firstSessionDate!, booked.balanceDueDate!, londonDate(booked.paidAt!));
    assert.deepEqual(days, ["2026-11-21", "2026-11-28", "2026-12-05", "2026-12-09", "2026-12-10", "2026-12-12"]);
    const first = londonTime(days[0], 8).getTime();
    assert.equal((await store.dueBalanceReminders(first - 60_000)).length, 0);
    const due = await store.dueBalanceReminders(first + 3_600_000);
    assert.deepEqual(due.map((d) => d.date), [days[0]]);
    assert.equal(await store.claimReminder(r.booking.id, days[0]), true);
    assert.equal(await store.claimReminder(r.booking.id, days[0]), false);
    assert.equal((await store.dueBalanceReminders(first + 3_600_000)).length, 0);
    // A missed day isn't sent late
    assert.equal((await store.dueBalanceReminders(londonTime(days[1], 8).getTime() + 21 * 3_600_000)).length, 0);
    // Final day
    const last = await store.dueBalanceReminders(londonTime("2026-12-12", 8).getTime() + 60_000);
    assert.deepEqual(last.map((d) => [d.date, d.finalDay]), [["2026-12-12", true]]);
    // Paid: no more reminders
    await store.confirm(r.booking.id, "pi_bal", "balance");
    assert.equal((await store.dueBalanceReminders(londonTime("2026-12-12", 8).getTime() + 60_000)).length, 0);
  });

  test(`${name}: bank transfer holds nets for 24 hours with an invoice; marking it paid confirms the booking`, async () => {
    const store = make();
    const { partner: a } = await store.createPartner(partner);
    const { partner: b } = await store.createPartner({ ...partner, email: "b@example.com" });
    const item = [{ slotKey: slotKey(block.id, sat, 1), bowlingMachine: false }];
    const r = await store.reserve({ partnerId: a.id, blockId: block.id, items: item, method: "bank" });
    assert.ok(r.ok);
    const hold = Date.parse(r.booking.holdExpiresAt!) - Date.now();
    assert.ok(hold > 23.9 * 3_600_000 && hold <= 24 * 3_600_000);
    assert.equal(r.booking.invoices?.[0].number, "HR-0001");
    assert.equal(r.booking.invoices?.[0].amountPence, 6 * 1880);
    // Held for others; abandoning a card attempt doesn't release it
    assert.equal((await store.reserve({ partnerId: b.id, blockId: block.id, items: item })).ok, false);
    await store.release(r.booking.id, "cancelled");
    assert.equal((await store.getBooking(r.booking.id))?.status, "pending_payment");
    const paid = await store.markBankPaid(r.booking.id, "initial");
    assert.ok(paid.ok && paid.booking.status === "confirmed" && paid.booking.method === "bank");
    assert.ok((await store.getBooking(r.booking.id))?.invoices?.[0].paidAt);
    // Numbers keep counting
    const r2 = await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: slotKey(block.id, sat, 2), bowlingMachine: false }], method: "bank" });
    assert.ok(r2.ok && r2.booking.invoices?.[0].number === "HR-0002");
  });

  test(`${name}: one unpaid invoice at a time (card is still allowed)`, async () => {
    const store = make();
    const { partner: a } = await store.createPartner(partner);
    const first = await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: slotKey(block.id, sat, 1), bowlingMachine: false }], method: "bank" });
    assert.ok(first.ok);
    const second = await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: slotKey(block.id, sat, 2), bowlingMachine: false }], method: "bank" });
    assert.ok(!second.ok && second.message.includes("HR-0001"));
    assert.ok((await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: slotKey(block.id, sat, 2), bowlingMachine: false }], method: "card" })).ok);
    await store.markBankPaid(first.booking.id, "initial");
    assert.ok((await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: slotKey(block.id, sat, 3), bowlingMachine: false }], method: "bank" })).ok);
  });

  test(`${name}: a card payment records its card fee; spring balance can be invoiced`, async () => {
    const store = make();
    const spring = getBlock("spring-2027")!;
    const { partner: a } = await store.createPartner(partner);
    const autumn = await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: slotKey(block.id, sat, 1), bowlingMachine: false }] });
    assert.ok(autumn.ok);
    await store.confirm(autumn.booking.id, "pi_a", "initial", 193);
    const got = (await store.getBooking(autumn.booking.id))!;
    assert.equal(got.method, "card");
    assert.equal(got.cardFeePence, 193);
    const dep = await store.reserve({ partnerId: a.id, blockId: spring.id, items: [{ slotKey: slotKey(spring.id, spring.slots.find((s) => s.day === "Saturday")!, 1), bowlingMachine: false }], plan: "deposit", method: "bank" });
    assert.ok(dep.ok && dep.booking.invoices?.[0].amountPence === dep.booking.depositPence);
    assert.ok((await store.markBankPaid(dep.booking.id, "initial")).ok);
    assert.equal((await store.getBooking(dep.booking.id))?.status, "reserved");
    const inv = await store.issueBalanceInvoice(dep.booking.id, a.id);
    assert.ok(inv && !("error" in inv) && inv.stage === "balance" && inv.amountPence === dep.booking.totalPence - dep.booking.depositPence!);
    // Asking again reuses the open invoice
    const again = await store.issueBalanceInvoice(dep.booking.id, a.id);
    assert.ok(again && !("error" in again) && again.number === inv.number);
    assert.equal((await store.findInvoice(inv.number))?.booking.id, dep.booking.id);
    const done = await store.markBankPaid(dep.booking.id, "balance");
    assert.ok(done.ok && done.booking.status === "confirmed" && done.booking.balanceMethod === "bank");
  });

  test(`${name}: the Stripe test booking costs £1 and never fills up`, async () => {
    const store = make();
    const t = getBlock("stripe-test")!;
    const { partner: a } = await store.createPartner(partner);
    const item = [{ slotKey: slotKey(t.id, t.slots[0], 1), bowlingMachine: false }];
    const first = await store.reserve({ partnerId: a.id, blockId: t.id, items: item });
    assert.ok(first.ok && first.booking.totalPence === 100);
    await store.confirm(first.booking.id, "pi_test");
    assert.ok((await store.reserve({ partnerId: a.id, blockId: t.id, items: item })).ok);
    assert.equal((await store.taken(t.id)).size, 0);
  });

  test(`${name}: password sign-in creates a session; signing out ends it; the portal link still works`, async () => {
    const store = make();
    const { partner: a, key } = await store.createPartner({ ...partner, password: "correct horse" });
    assert.equal(await store.login("sam@example.com", "wrong password"), undefined);
    assert.equal(await store.login("nobody@example.com", "correct horse"), undefined);
    const s = await store.login(" SAM@example.com ", "correct horse");
    assert.ok(s);
    assert.equal((await store.partnerByKey(s.token))?.id, a.id);
    await store.endSession(s.token);
    assert.equal(await store.partnerByKey(s.token), undefined);
    assert.equal((await store.partnerByKey(key))?.id, a.id);
    // Partners from before accounts can set a password later
    const { partner: b } = await store.createPartner({ ...partner, email: "old@example.com" });
    assert.equal(await store.login("old@example.com", "anything at all"), undefined);
    await store.setPassword(b.id, "new password 1");
    assert.ok(await store.login("old@example.com", "new password 1"));
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

test("balance reminders: two weeks after the first autumn session, weekly, then 3 days, 2 days and the final day; at 8am UK time", () => {
  // First session Thursday 5 November, last Sunday 13 December, deposit paid 22 October
  assert.deepEqual(balanceReminderDates("2026-11-05", "2026-12-13", "2026-10-22"), [
    "2026-11-19", "2026-11-26", "2026-12-03", "2026-12-10", "2026-12-11", "2026-12-13",
  ]);
  // Deposit paid late: only the reminders still to come
  assert.deepEqual(balanceReminderDates("2026-11-05", "2026-12-13", "2026-12-04"), ["2026-12-10", "2026-12-11", "2026-12-13"]);
  assert.equal(londonTime("2026-11-05", 8).toISOString(), "2026-11-05T08:00:00.000Z");
  assert.equal(londonTime("2026-10-22", 8).toISOString(), "2026-10-22T07:00:00.000Z");
});

test("the Stripe test booking is only for test accounts", async () => {
  const { isTestPartner } = await import("../src/lib/partners/test-access");
  assert.ok(isTestPartner("Office@HillRisers.co.uk"));
  assert.ok(!isTestPartner("someone@example.com"));
});

test("card processing fee: grossed up so 1.5% + 20p of the total still leaves the full price", async () => {
  const { cardFeePence } = await import("../src/data/invoicing");
  for (const price of [100, 5170, 11280, 20680, 112800]) {
    const total = price + cardFeePence(price);
    const stripe = Math.round(total * 0.015) + 20;
    assert.ok(total - stripe >= price, `${price}: ${total - stripe}`);
    assert.ok(total - stripe - price <= 1, `${price} overcharged`);
  }
  assert.equal(cardFeePence(11280), 193);
});

test("UK date and time labels, in GMT and BST", async () => {
  const { ukDateTime } = await import("../src/data/invoicing");
  assert.equal(ukDateTime("2026-10-24T07:40:00Z"), "8:40am, Saturday 24 October");
  assert.equal(ukDateTime("2026-11-07T20:05:00Z", "short"), "8:05pm Sat 7 Nov");
  assert.equal(ukDateTime("2026-12-13T00:00:00Z"), "12:00am, Sunday 13 December");
});
