import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { endOfDayLondon, getBlock, londonTime, monthInvoiceAt, monthlySplit, partnerBlocks, itemPricePence, machineKey, slotKey } from "../src/data/partners";
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
/** A time after the hold examples */
const OPEN = Date.parse("2026-11-10T10:00:00Z");
const EARLY = Date.parse("2026-11-05T10:00:00Z");
const net = (s: typeof sat, n: number, bowlingMachine = false) => ({ slotKey: slotKey(block.id, s, n), bowlingMachine });

test("autumn: Thursdays and Sundays from w/c 16 November; Wednesdays from 25 November; Saturdays 5 and 12 December", () => {
  assert.deepEqual(wed.dates, ["2026-11-25", "2026-12-02", "2026-12-09"]);
  assert.deepEqual(thu.dates, ["2026-11-19", "2026-11-26", "2026-12-03", "2026-12-10"]);
  assert.deepEqual(sat.dates, ["2026-12-05", "2026-12-12"]);
  assert.equal(block.slots.find((s) => s.day === "Sunday")!.dates[0], "2026-11-22");
  assert.deepEqual(thu.nets, [1, 2, 3]);
  assert.equal(block.slots.filter((s) => s.day === "Sunday").length, 8);
  assert.ok(block.slots.every((s) => s.dates.every((d) => d >= "2026-11-16" && d <= "2026-12-13")));
});

test("pricing: £18.80 block rate per net per hour for every week, bowling machine +£10 per hour", () => {
  assert.equal(itemPricePence(wed, false), 3 * 1880);
  assert.equal(itemPricePence(sat, false), 2 * 1880);
  assert.equal(itemPricePence(sat, true), 2 * 2880);
});

test("monthly split and invoice dates: a week before each month's first session, 8am UK time", () => {
  const months = monthlySplit([{ slotKey: slotKey(block.id, thu, 2), pricePence: itemPricePence(thu, false), weeks: 4 }], block.id);
  assert.deepEqual(months, [
    { month: "2026-11", pence: 2 * 1880, firstSession: "2026-11-19" },
    { month: "2026-12", pence: 2 * 1880, firstSession: "2026-12-03" },
  ]);
  assert.equal(monthInvoiceAt("2027-02-03").toISOString(), "2027-01-27T08:00:00.000Z");
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
    assert.ok(first.ok && first.booking.totalPence === 2 * 2880);
    assert.equal((await store.reserve({ partnerId: b.id, blockId: block.id, items: [net(sat, 3, true)], at: OPEN })).ok, false);
    assert.ok((await store.taken(block.id)).has(machineKey(block.id, sat)));
    // The net without the machine is still fine
    assert.ok((await store.reserve({ partnerId: b.id, blockId: block.id, items: [net(sat, 3)], at: OPEN })).ok);
  });

  test(`${name}: request → approve (invoice) → paid; first come, first served`, async () => {
    const store = make();
    const { partner: a } = await store.createPartner(partner);
    const { partner: b } = await store.createPartner({ ...partner, email: "b@example.com" });
    assert.ok(a && b);
    assert.equal((await store.reserve({ partnerId: a.id, blockId: block.id, items: [{ slotKey: "autumn-2026:Thursday:18:00:n4", bowlingMachine: false }], at: OPEN })).ok, false); // no net 4
    const r = await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 2), net(thu, 2)], terms: "termly", at: OPEN });
    assert.ok(r.ok);
    assert.equal(r.booking.status, "requested");
    assert.equal(r.booking.invoices, undefined);
    // A requested net is amber and can't be requested by anyone else
    assert.equal((await store.netStates(block.id)).get(slotKey(block.id, sat, 2))?.state, "requested");
    assert.equal((await store.reserve({ partnerId: b.id, blockId: block.id, items: [net(sat, 2)], at: OPEN })).ok, false);
    const ok = await store.approve(r.booking.id);
    assert.ok(ok.ok);
    assert.equal(ok.booking.status, "pending_payment");
    assert.equal(ok.invoice.amountPence, 6 * 1880);
    assert.equal(Date.parse(ok.invoice.dueAt) - Date.parse(ok.invoice.issuedAt), 24 * 3_600_000);
    assert.equal((await store.approve(r.booking.id)).ok, false);
    assert.equal((await store.netStates(block.id)).get(slotKey(block.id, sat, 2))?.state, "requested");
    const paid = await store.markInvoicePaid(ok.invoice.number);
    assert.ok(paid.ok && paid.confirmed);
    assert.equal((await store.getBooking(r.booking.id))?.status, "confirmed");
    // Still amber until the compliance documents are in, then red
    assert.equal((await store.netStates(block.id)).get(slotKey(block.id, sat, 2))?.state, "requested");
    for (const kind of ["qualification", "dbs", "safeguarding", "insurance"] as const) {
      await store.addDocument(a.id, { kind, filename: `${kind}.pdf`, contentType: "application/pdf", size: 1 }, new Uint8Array([1]));
    }
    assert.equal((await store.netStates(block.id)).get(slotKey(block.id, sat, 2))?.state, "booked");
    assert.equal((await store.markInvoicePaid(ok.invoice.number)).ok, false);
  });

  test(`${name}: a declined request frees the nets`, async () => {
    const store = make();
    const { partner: a } = await store.createPartner(partner);
    const { partner: b } = await store.createPartner({ ...partner, email: "b@example.com" });
    assert.ok(a && b);
    const r = await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 2)], at: OPEN });
    assert.ok(r.ok);
    assert.ok((await store.decline(r.booking.id)).ok);
    assert.equal((await store.getBooking(r.booking.id))?.status, "declined");
    assert.equal((await store.approve(r.booking.id)).ok, false);
    assert.ok(!(await store.taken(block.id)).has(slotKey(block.id, sat, 2)));
    assert.ok((await store.reserve({ partnerId: b.id, blockId: block.id, items: [net(sat, 2)], at: OPEN })).ok);
  });

  test(`${name}: an unpaid first invoice releases the nets after 24 hours; one unpaid invoice at a time`, async () => {
    const store = make();
    const { partner: a } = await store.createPartner(partner);
    const { partner: b } = await store.createPartner({ ...partner, email: "b@example.com" });
    assert.ok(a && b);
    const r = await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 2)], terms: "termly", at: OPEN });
    assert.ok(r.ok);
    const r2 = await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(sat, 3)], terms: "termly", at: OPEN });
    assert.ok(r2.ok);
    const ok = await store.approve(r.booking.id);
    assert.ok(ok.ok);
    const blocked = await store.approve(r2.booking.id);
    assert.ok(!blocked.ok && /unpaid invoice/.test(blocked.message));
    const late = await store.approve(r2.booking.id, Date.now() - 25 * 3_600_000);
    assert.ok(late.ok === false); // still blocked by the live invoice
    // The first invoice lapses
    const old = await store.reserve({ partnerId: b.id, blockId: block.id, items: [net(thu, 2)], terms: "termly", at: OPEN });
    assert.ok(old.ok);
    const lapsed = await store.approve(old.booking.id, Date.now() - 25 * 3_600_000);
    assert.ok(lapsed.ok);
    assert.equal((await store.getBooking(old.booking.id))?.status, "expired");
    assert.ok(!(await store.taken(block.id)).has(slotKey(block.id, thu, 2)));
    const c = await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(thu, 2)], at: OPEN });
    assert.ok(c.ok);
    assert.equal((await store.markInvoicePaid(lapsed.invoice.number)).ok, false); // someone else has the net now
  });

  test(`${name}: monthly: sessions up to Christmas invoiced in full; spring months a week before, with daily 8am reminders`, async () => {
    const store = make();
    const spring = getBlock("spring-2027")!;
    const sSat = spring.slots.find((x) => x.day === "Saturday" && x.start === "14:30")!;
    const { partner: a } = await store.createPartner(partner);
    assert.ok(a);
    // Autumn on monthly terms: one invoice for every session up to Christmas
    const au = await store.reserve({ partnerId: a.id, blockId: block.id, items: [net(thu, 2)], terms: "monthly", at: OPEN });
    assert.ok(au.ok);
    const auInv = await store.approve(au.booking.id);
    assert.ok(auInv.ok);
    assert.deepEqual(auInv.invoice.months, ["2026-11", "2026-12"]);
    assert.equal(auInv.invoice.amountPence, 4 * 1880);
    await store.markInvoicePaid(auInv.invoice.number);
    // Spring monthly: January now, February and March a week before their first session
    const r = await store.reserve({ partnerId: a.id, blockId: spring.id, items: [{ slotKey: slotKey(spring.id, sSat, 2), bowlingMachine: false }], terms: "monthly", at: OPEN });
    assert.ok(r.ok);
    const first = await store.approve(r.booking.id, OPEN);
    assert.ok(first.ok);
    assert.deepEqual(first.invoice.months, ["2027-01"]);
    assert.equal(first.invoice.amountPence, 4 * 1880); // 9, 16, 23, 30 January
    assert.equal((await store.dueMonthlyInvoices(Date.parse("2027-01-30T09:00:00Z"))).length, 0); // not paid yet
    await store.markInvoicePaid(first.invoice.number);
    const booking = (await store.getBooking(r.booking.id))!;
    assert.equal(monthsToInvoice(booking)[0].issueAt, Date.parse("2027-01-30T08:00:00Z")); // first February session Sat 6 Feb
    assert.equal((await store.dueMonthlyInvoices(Date.parse("2027-01-30T07:59:00Z"))).length, 0);
    assert.deepEqual((await store.dueMonthlyInvoices(Date.parse("2027-01-30T08:00:00Z"))).map((x) => x.month), ["2027-02"]);
    const issued = await store.issueMonthInvoice(r.booking.id, "2027-02", Date.parse("2027-01-30T08:00:00Z"));
    assert.ok(issued);
    assert.equal(issued.invoice.amountPence, 4 * 1880);
    assert.equal(issued.invoice.dueAt, "2027-01-31T08:00:00.000Z");
    assert.equal(await store.issueMonthInvoice(r.booking.id, "2027-02"), undefined); // only once
    assert.equal((await store.dueInvoiceReminders(Date.parse("2027-01-31T07:00:00Z"))).length, 0);
    const rem = await store.dueInvoiceReminders(Date.parse("2027-02-01T08:30:00Z"));
    assert.equal(rem.length, 1);
    assert.ok(await store.claimInvoiceReminder(rem[0].invoice.number, rem[0].date));
    assert.equal(await store.claimInvoiceReminder(rem[0].invoice.number, rem[0].date), false);
    assert.equal((await store.getBooking(r.booking.id))?.status, "confirmed"); // overdue monthly invoices don't release nets
    const receipt = await store.markInvoicePaid(issued.invoice.number);
    assert.ok(receipt.ok && !receipt.confirmed);
    assert.equal((await store.dueInvoiceReminders(Date.parse("2027-02-02T08:30:00Z"))).length, 0);
  });

  test(`${name}: spring can be requested without an autumn booking`, async () => {
    const store = make();
    const spring = getBlock("spring-2027")!;
    const sSat = spring.slots.find((x) => x.day === "Saturday" && x.start === "14:30")!;
    const { partner: a } = await store.createPartner(partner);
    assert.ok(a);
    assert.ok((await store.reserve({ partnerId: a.id, blockId: spring.id, items: [{ slotKey: slotKey(spring.id, sSat, 2), bowlingMachine: false }], terms: "monthly", at: OPEN })).ok);
  });

  test(`${name}: partner enquiries are stored and can be marked dealt with`, async () => {
    const store = make();
    const e = await store.addEnquiry({ name: "Jo", email: "jo@example.com", message: "Can we talk about Sundays?" });
    assert.equal((await store.listEnquiries())[0].id, e.id);
    await store.setEnquiryHandled(e.id, true);
    assert.ok((await store.listEnquiries())[0].handledAt);
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

  test(`${name}: the test booking costs £1 and never fills up`, async () => {
    const store = make();
    const t = getBlock("stripe-test")!;
    const { partner: a } = await store.createPartner(partner);
    assert.ok(a);
    const item = [{ slotKey: slotKey(t.id, t.slots[0], 1), bowlingMachine: false }];
    const first = await store.reserve({ partnerId: a.id, blockId: t.id, items: item, at: EARLY });
    assert.ok(first.ok && first.booking.totalPence === 100);
    const inv = await store.approve(first.booking.id);
    assert.ok(inv.ok && inv.invoice.amountPence === 100);
    await store.markInvoicePaid(inv.invoice.number);
    assert.ok((await store.reserve({ partnerId: a.id, blockId: t.id, items: item, at: EARLY })).ok);
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
