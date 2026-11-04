import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { endOfDayLondon, getBlock, heldNets, londonTime, monthInvoiceAt, monthlySplit, partnerBlocks, itemPricePence, machineKey, priorityWindowOpen, slotKey } from "../src/data/partners";
import { createD1PartnerStore, createFilePartnerStore, monthsToInvoice } from "../src/lib/partners/store";
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
/** After the priority window (11:59pm, 8 November) */
const OPEN = Date.parse("2026-11-10T10:00:00Z");
const PRIORITY = Date.parse("2026-11-05T10:00:00Z");
const net = (s: typeof sat, n: number, bowlingMachine = false) => ({ slotKey: slotKey(block.id, s, n), bowlingMachine });

test("autumn: Thursdays, Saturdays and Sundays from w/c 16 November; Wednesdays from 25 November", () => {
  assert.deepEqual(wed.dates, ["2026-11-25", "2026-12-02", "2026-12-09"]);
  assert.deepEqual(thu.dates, ["2026-11-19", "2026-11-26", "2026-12-03", "2026-12-10"]);
  assert.deepEqual(sat.dates, ["2026-11-21", "2026-11-28", "2026-12-05", "2026-12-12"]);
  assert.equal(block.slots.find((s) => s.day === "Sunday")!.dates[0], "2026-11-22");
  assert.deepEqual(thu.nets, [1, 2]);
  assert.equal(block.slots.filter((s) => s.day === "Sunday").length, 8);
  assert.ok(block.slots.every((s) => s.dates.every((d) => d >= "2026-11-16" && d <= "2026-12-13")));
});

test("pricing: £18.80 block rate per net per hour for every week, bowling machine +£10 per hour", () => {
  assert.equal(itemPricePence(wed, false), 3 * 1880);
  assert.equal(itemPricePence(sat, false), 4 * 1880);
  assert.equal(itemPricePence(sat, true), 4 * 2880);
});

test("held nets: Bessborough CC on spring Sundays 2–5pm (all nets); Sanjiv on one net Wed, Thu 6–9pm, Sat 2:30–5:30pm, Sun 9am–1pm", () => {
  const spring = getBlock("spring-2027")!;
  const springHeld = heldNets(spring.id);
  const sunday = (start: string) => spring.slots.find((s) => s.day === "Sunday" && s.start === start)!;
  for (const n of [1, 2, 3]) for (const t of ["14:00", "15:00", "16:00"]) assert.equal(springHeld.get(slotKey(spring.id, sunday(t), n))?.id, "bessborough");
  assert.equal(springHeld.get(slotKey(spring.id, sunday("13:00"), 2)), undefined);
  const autumn = heldNets(block.id);
  assert.equal(autumn.size, 3 + 3 + 3 + 4);
  assert.ok([...autumn.values()].every((h) => h.id === "sanjiv"));
  assert.equal(autumn.get(slotKey(block.id, sat, 1))?.id, "sanjiv");
  assert.equal(autumn.get(slotKey(block.id, sat, 2)), undefined);
  // Sanjiv's nets are held in spring too
  assert.equal([...springHeld.values()].filter((h) => h.id === "sanjiv").length, 13);
});

test("priority booking ends at 11:59pm UK time on Sunday 8 November", () => {
  assert.ok(priorityWindowOpen(Date.parse("2026-11-08T23:59:00Z")));
  assert.ok(!priorityWindowOpen(Date.parse("2026-11-09T00:00:00Z")));
});

test("monthly split and invoice dates: a week before each month's first session, 8am UK time", () => {
  const months = monthlySplit([{ slotKey: slotKey(block.id, sat, 2), pricePence: itemPricePence(sat, false), weeks: 4 }], block.id);
  assert.deepEqual(months, [
    { month: "2026-11", pence: 2 * 1880, firstSession: "2026-11-21" },
    { month: "2026-12", pence: 2 * 1880, firstSession: "2026-12-05" },
  ]);
  assert.equal(monthInvoiceAt("2026-12-05").toISOString(), "2026-11-28T08:00:00.000Z");
  assert.equal(monthInvoiceAt("2027-04-10").toISOString(), "2027-04-03T07:00:00.000Z");
});

for (const [name, make] of [
  ["file", () => createFilePartnerStore(mkdtempSync(path.join(tmpdir(), "hr-partners-")))],
  ["D1", () => createD1PartnerStore(fakeD1())],
] as const) {
  test(`${name}: a net can only be booked once, even when two partners try at the same time`, async () => {
    const store = make();
    const { partner: a, token } = await store.createPartner(partner);
    const { partner: b } = await store.createPartner({ ...partner, orgName: "Other" });
    assert.ok(a && b);
    assert.equal((await store.partnerBySession(token))?.id, a.id);
    assert.equal(a.email, "sam@example.com");
    const [r1, r2] = await Promise.all([
      store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 2)], at: OPEN }),
      store.reserve({ partnerId: b.id, blockId: block.id, items: [net(sat, 2)], at: OPEN }),
    ]);
    assert.equal([r1, r2].filter((r) => r.ok).length, 1);
    assert.ok((await store.taken(block.id)).has(slotKey(block.id, sat, 2)));
  });

  test(`${name}: one bowling machine per time slot`, async () => {
    const store = make();
    const { partner: a } = await store.createPartner(partner);
    const { partner: b } = await store.createPartner({ ...partner, email: "b@example.com" });
    assert.ok(a && b);
    assert.equal((await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 2, true), net(sat, 3, true)], at: OPEN })).ok, false);
    const first = await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 2, true)], machineCoach: "Alex", at: OPEN });
    assert.ok(first.ok && first.booking.totalPence === 4 * 2880);
    assert.equal((await store.reserve({ partnerId: b.id, blockId: block.id, items: [net(sat, 3, true)], at: OPEN })).ok, false);
    assert.ok((await store.taken(block.id)).has(machineKey(block.id, sat)));
    // The net without the machine is still fine
    assert.ok((await store.reserve({ partnerId: b.id, blockId: block.id, items: [net(sat, 3)], at: OPEN })).ok);
  });

  test(`${name}: termly: one invoice for the block, nets held for 24 hours, confirmed when paid`, async () => {
    const store = make();
    const { partner: a } = await store.createPartner(partner);
    assert.ok(a);
    assert.equal((await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(thu, 3)], at: OPEN })).ok, false); // net 3 isn't released on Thursdays
    const r = await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 2), net(thu, 2)], terms: "termly", at: OPEN });
    assert.ok(r.ok);
    assert.equal(r.booking.status, "pending_payment");
    assert.equal(r.booking.invoices?.length, 1);
    const inv = r.booking.invoices![0];
    assert.equal(inv.amountPence, 8 * 1880);
    assert.equal(Date.parse(inv.dueAt) - Date.parse(inv.issuedAt), 24 * 3_600_000);
    assert.equal(r.booking.holdExpiresAt, inv.dueAt);
    // One unpaid invoice at a time
    const second = await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 3)], at: OPEN });
    assert.ok(!second.ok && /unpaid invoice/.test(second.message));
    const paid = await store.markInvoicePaid(inv.number);
    assert.ok(paid.ok && paid.confirmed);
    assert.equal((await store.getBooking(r.booking.id))?.status, "confirmed");
    assert.equal((await store.markInvoicePaid(inv.number)).ok, false);
    assert.ok((await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 3)], at: OPEN })).ok);
  });

  test(`${name}: an unpaid first invoice releases the nets after 24 hours`, async () => {
    const store = make();
    const { partner: a } = await store.createPartner(partner);
    const { partner: b } = await store.createPartner({ ...partner, email: "b@example.com" });
    assert.ok(a && b);
    await store.redeemPriorityCode(a.id, (await store.createPriorityCode("Test CC")).code);
    const past = Date.now() - 25 * 3_600_000;
    const r = await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 2)], terms: "termly", at: past });
    assert.ok(r.ok);
    assert.equal((await store.getBooking(r.booking.id))?.status, "expired");
    assert.ok(!(await store.taken(block.id)).has(slotKey(block.id, sat, 2)));
    assert.ok((await store.reserve({ partnerId: b.id, blockId: block.id, items: [net(sat, 2)], terms: "termly", at: OPEN })).ok);
    // Too late to pay now: someone else has the net
    assert.equal((await store.markInvoicePaid(r.booking.invoices![0].number)).ok, false);
  });

  test(`${name}: monthly: first month invoiced now, later months a week before, with daily 8am reminders when overdue`, async () => {
    const store = make();
    const { partner: a } = await store.createPartner(partner);
    assert.ok(a);
    const r = await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 2)], terms: "monthly", at: OPEN });
    assert.ok(r.ok);
    assert.equal(r.booking.totalPence, 4 * 1880);
    assert.deepEqual(r.booking.invoices!.map((i) => [i.months, i.amountPence]), [[["2026-11"], 2 * 1880]]);
    assert.equal(await store.dueMonthlyInvoices(Date.parse("2026-11-28T09:00:00Z")).then((d) => d.length), 0); // not confirmed yet
    await store.markInvoicePaid(r.booking.invoices![0].number);
    const booking = (await store.getBooking(r.booking.id))!;
    assert.equal(monthsToInvoice(booking)[0].issueAt, Date.parse("2026-11-28T08:00:00Z"));
    assert.equal((await store.dueMonthlyInvoices(Date.parse("2026-11-28T07:59:00Z"))).length, 0);
    const due = await store.dueMonthlyInvoices(Date.parse("2026-11-28T08:00:00Z"));
    assert.deepEqual(due.map((x) => x.month), ["2026-12"]);
    const issued = await store.issueMonthInvoice(r.booking.id, "2026-12", Date.parse("2026-11-28T08:00:00Z"));
    assert.ok(issued);
    assert.equal(issued.invoice.amountPence, 2 * 1880);
    assert.equal(issued.invoice.dueAt, "2026-11-29T08:00:00.000Z");
    assert.equal(await store.issueMonthInvoice(r.booking.id, "2026-12"), undefined); // only once
    // Overdue: a reminder at 8am each day, once
    assert.equal((await store.dueInvoiceReminders(Date.parse("2026-11-29T07:00:00Z"))).length, 0);
    const rem = await store.dueInvoiceReminders(Date.parse("2026-11-30T08:30:00Z"));
    assert.equal(rem.length, 1);
    assert.ok(await store.claimInvoiceReminder(rem[0].invoice.number, rem[0].date));
    assert.equal(await store.claimInvoiceReminder(rem[0].invoice.number, rem[0].date), false);
    assert.equal((await store.dueInvoiceReminders(Date.parse("2026-11-30T09:30:00Z"))).length, 0);
    // An unpaid monthly invoice blocks new bookings, and doesn't release the nets
    assert.equal((await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 3)], at: OPEN })).ok, false);
    assert.equal((await store.getBooking(r.booking.id))?.status, "confirmed");
    const receipt = await store.markInvoicePaid(issued.invoice.number);
    assert.ok(receipt.ok && !receipt.confirmed);
    assert.equal((await store.dueInvoiceReminders(Date.parse("2026-12-01T08:30:00Z"))).length, 0);
  });

  test(`${name}: priority window: only partners with a code can book until 11:59pm on 8 November`, async () => {
    const store = make();
    const code = await store.createPriorityCode("Friend CC");
    assert.match(code.code, /^HR-[A-Z2-9]{6}$/);
    const { partner: a } = await store.createPartner(partner);
    assert.ok(a);
    const early = await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 2)], at: PRIORITY });
    assert.ok(!early.ok && early.reason === "locked" && /11:59pm on Sunday 8 November/.test(early.message));
    assert.equal((await store.redeemPriorityCode(a.id, "HR-NOPE00")).ok, false);
    assert.ok((await store.redeemPriorityCode(a.id, ` ${code.code.toLowerCase()} `)).ok);
    assert.ok((await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 2)], at: PRIORITY })).ok);
    // A code works for one account; registering with a used or unknown code creates nothing
    assert.ok((await store.createPartner({ ...partner, email: "c@example.com", priorityCode: code.code })).error);
    assert.ok((await store.createPartner({ ...partner, email: "d@example.com", priorityCode: "HR-ZZZZZZ" })).error);
    assert.equal((await store.listPartners()).length, 1);
    const second = await store.createPriorityCode("Second CC");
    const { partner: e } = await store.createPartner({ ...partner, email: "e@example.com", priorityCode: second.code });
    assert.equal(e?.priorityCode, second.code);
    assert.equal(await store.deletePriorityCode(second.code), false); // used
    const spare = await store.createPriorityCode("Spare");
    assert.ok(await store.deletePriorityCode(spare.code));
  });

  test(`${name}: held nets can only be booked with the linked priority code`, async () => {
    const store = make();
    const { partner: a } = await store.createPartner(partner);
    assert.ok(a);
    assert.ok((await store.taken(block.id)).has(slotKey(block.id, sat, 1)));
    const no = await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 1)], at: OPEN });
    assert.ok(!no.ok && no.reason === "taken");
    const sanjiv = await store.createPriorityCode("Sanjiv", "sanjiv");
    const { partner: s } = await store.createPartner({ ...partner, email: "sanjiv@example.com", priorityCode: sanjiv.code });
    assert.ok(s);
    assert.ok(!(await store.taken(block.id, "sanjiv")).has(slotKey(block.id, sat, 1)));
    assert.ok((await store.reserve({ partnerId: s.id, blockId: block.id, items: [net(sat, 1)], at: PRIORITY })).ok);
  });

  test(`${name}: spring can only be booked once the partner's autumn booking is paid`, async () => {
    const store = make();
    const spring = getBlock("spring-2027")!;
    const sSat = spring.slots.find((x) => x.day === "Saturday" && x.start === "14:30")!;
    const { partner: a } = await store.createPartner(partner);
    assert.ok(a);
    const item = [{ slotKey: slotKey(spring.id, sSat, 2), bowlingMachine: false }];
    const locked = await store.reserve({ partnerId: a.id, blockId: spring.id, items: item, at: OPEN });
    assert.ok(!locked.ok && locked.reason === "locked");
    const autumn = await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 2)], at: OPEN });
    assert.ok(autumn.ok);
    await store.markInvoicePaid(autumn.booking.invoices![0].number);
    assert.ok((await store.reserve({ partnerId: a.id, blockId: spring.id, items: item, terms: "monthly", at: OPEN })).ok);
  });

  test(`${name}: documents are stored and read back byte for byte (larger than one chunk)`, async () => {
    const store = make();
    const { partner: a } = await store.createPartner(partner);
    assert.ok(a);
    const bytes = new Uint8Array(1_300_000).map((_, i) => i % 251);
    const doc = await store.addDocument(a.id, { kind: "dbs", filename: "dbs.pdf", contentType: "application/pdf", size: bytes.length }, bytes);
    const back = await store.getDocument(doc.id);
    assert.equal(back?.doc.review, "pending");
    assert.deepEqual(back?.bytes, bytes);
    await store.reviewDocument(doc.id, "approved");
    assert.equal((await store.documentsFor(a.id))[0].review, "approved");
  });

  test(`${name}: the test booking costs £1, never fills up and ignores the priority window`, async () => {
    const store = make();
    const t = getBlock("stripe-test")!;
    const { partner: a } = await store.createPartner(partner);
    assert.ok(a);
    const item = [{ slotKey: slotKey(t.id, t.slots[0], 1), bowlingMachine: false }];
    const first = await store.reserve({ partnerId: a.id, blockId: t.id, items: item, at: PRIORITY });
    assert.ok(first.ok && first.booking.totalPence === 100 && first.booking.invoices![0].amountPence === 100);
    await store.markInvoicePaid(first.booking.invoices![0].number);
    assert.ok((await store.reserve({ partnerId: a.id, blockId: t.id, items: item, at: PRIORITY })).ok);
    assert.equal((await store.taken(t.id)).size, 0);
  });

  test(`${name}: password sign-in, lockout, sign-in links and password changes`, async () => {
    const store = make();
    const { partner: a, token: first } = await store.createPartner({ ...partner, password: "correct horse battery" });
    assert.ok(a && first);
    assert.equal((await store.login("nobody@example.com", "correct horse battery")).ok, false);
    const s = await store.login(" SAM@example.com ", "correct horse battery");
    assert.ok(s.ok);
    assert.equal((await store.partnerBySession(s.token))?.id, a.id);
    await store.endSession(s.token);
    assert.equal(await store.partnerBySession(s.token), undefined);
    // Five wrong passwords lock the account, even against the right one
    for (let i = 0; i < 4; i++) assert.deepEqual(await store.login("sam@example.com", "wrong"), { ok: false, locked: false });
    assert.deepEqual(await store.login("sam@example.com", "wrong"), { ok: false, locked: true });
    assert.deepEqual(await store.login("sam@example.com", "correct horse battery"), { ok: false, locked: true });
    // A sign-in link works once
    const link = await store.issueSignInLink("sam@example.com");
    assert.ok(link);
    const viaLink = await store.useSignInLink(link.key);
    assert.ok(viaLink && (await store.partnerBySession(viaLink.token))?.id === a.id);
    assert.equal(await store.useSignInLink(link.key), undefined);
    // ...and the link cleared the lockout
    assert.ok((await store.login("sam@example.com", "correct horse battery")).ok);
    // Changing the password signs out every other device
    const changed = await store.setPassword(a.id, "new password 123");
    assert.ok(changed);
    assert.equal(await store.partnerBySession(first), undefined);
    assert.equal(await store.partnerBySession(viaLink.token), undefined);
    assert.equal((await store.partnerBySession(changed.token))?.id, a.id);
    assert.ok((await store.login("sam@example.com", "new password 123")).ok);
  });
}

test("checkout needs the terms, monthly or termly; bowling machine needs a Level 2 coach and own balls", () => {
  const who = { ageGroup: "Under 11", ability: "Beginner", gender: "Mixed" };
  const base = { blockId: block.id, items: [{ slotKey: slotKey(block.id, sat, 2), bowlingMachine: false, ...who }], terms: "termly", agreeTerms: true };
  assert.ok(partnerCheckoutSchema.safeParse(base).success);
  assert.ok(partnerCheckoutSchema.safeParse({ ...base, terms: "monthly" }).success);
  assert.ok(!partnerCheckoutSchema.safeParse({ ...base, terms: undefined }).success);
  assert.ok(!partnerCheckoutSchema.safeParse({ ...base, agreeTerms: false }).success);
  const machine = { ...base, items: [{ slotKey: slotKey(block.id, sat, 2), bowlingMachine: true, ...who }] };
  const bad = partnerCheckoutSchema.safeParse(machine);
  assert.ok(!bad.success);
  assert.deepEqual(bad.error.issues.map((i) => i.path.join(".")).sort(), ["machineCoach", "ownBalls"]);
  assert.ok(partnerCheckoutSchema.safeParse({ ...machine, machineCoach: "Alex Smith", ownBalls: true }).success);
});

test("each booked session says who it's for", () => {
  const item = { slotKey: slotKey(block.id, sat, 2), bowlingMachine: false };
  const bad = partnerCheckoutSchema.safeParse({ blockId: block.id, items: [item], terms: "termly", agreeTerms: true });
  assert.ok(!bad.success);
  assert.deepEqual(bad.error.issues.map((i) => i.path.join(".")).sort(), ["items.0.ability", "items.0.ageGroup", "items.0.gender"]);
  const ok = partnerCheckoutSchema.safeParse({ blockId: block.id, items: [{ ...item, ageGroup: "Adults", ability: "Advanced", gender: "Female" }], terms: "termly", agreeTerms: true });
  assert.ok(ok.success);
});

test("spring block: 12 weeks from 6 January, including half term", () => {
  const spring = partnerBlocks.find((b) => b.id === "spring-2027")!;
  for (const s of spring.slots) {
    assert.equal(s.dates.length, 12);
    assert.ok(s.dates.some((d) => d >= "2027-02-15" && d <= "2027-02-21"));
  }
  assert.equal(spring.slots.find((s) => s.day === "Wednesday")!.dates[0], "2027-01-06");
  assert.equal(spring.slots.find((s) => s.day === "Sunday")!.dates.at(-1), "2027-03-28");
});

test("UK times: midnight at the end of a date and 8am, in GMT and BST", () => {
  assert.equal(endOfDayLondon("2026-12-13").toISOString(), "2026-12-14T00:00:00.000Z");
  assert.equal(endOfDayLondon("2027-06-01").toISOString(), "2027-06-01T23:00:00.000Z");
  assert.equal(londonTime("2026-11-05", 8).toISOString(), "2026-11-05T08:00:00.000Z");
  assert.equal(londonTime("2026-10-22", 8).toISOString(), "2026-10-22T07:00:00.000Z");
});

test("the test booking is only for test accounts", async () => {
  const { isTestPartner } = await import("../src/lib/partners/test-access");
  assert.ok(isTestPartner("Office@HillRisers.co.uk"));
  assert.ok(!isTestPartner("someone@example.com"));
});

test("UK date and time labels, in GMT and BST", async () => {
  const { ukDateTime } = await import("../src/data/invoicing");
  assert.equal(ukDateTime("2026-10-24T07:40:00Z"), "8:40am, Saturday 24 October");
  assert.equal(ukDateTime("2026-11-07T20:05:00Z", "short"), "8:05pm Sat 7 Nov");
  assert.equal(ukDateTime("2026-12-13T00:00:00Z"), "12:00am, Sunday 13 December");
});
