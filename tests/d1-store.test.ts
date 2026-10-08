import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { D1BookingStore, type D1Database } from "../src/lib/booking/d1-store";

/** A minimal stand-in for Cloudflare's D1 binding, backed by SQLite (which D1 is built on). */
function fakeD1(): D1Database {
  const db = new DatabaseSync(":memory:");
  // Every call yields to the event loop, like a network round trip to D1
  const tick = () => new Promise((r) => setImmediate(r));
  const statement = (sql: string, values: unknown[] = []) => ({
    bind: (...v: unknown[]) => statement(sql, v),
    first: async <T>() => (await tick(), (db.prepare(sql).get(...(values as never[])) as T) ?? null),
    all: async <T>() => (await tick(), { results: db.prepare(sql).all(...(values as never[])) as T[] }),
    run: async () => (await tick(), { meta: { changes: Number(db.prepare(sql).run(...(values as never[])).changes) } }),
  });
  return {
    prepare: (sql: string) => statement(sql),
    batch: async (stmts) => Promise.all(stmts.map((s) => s.run())),
  };
}

const registration = (n: number) => ({
  parentName: `Parent ${n}`,
  email: `Parent${n}@Example.com`,
  mobile: "07123 456789",
  postcode: "HA2 0HN",
  children: [],
  contactConsent: true as const,
  marketingConsent: false,
});

test("D1: simultaneous registrations are all kept, newest first", async () => {
  const d1 = fakeD1();
  // Two stores on one database = two Cloudflare Workers instances
  const [a, b] = [new D1BookingStore(d1), new D1BookingStore(d1)];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await Promise.all(Array.from({ length: 20 }, (_, i) => (i % 2 ? a : b).createInterestRegistration(registration(i) as any)));
  const saved = await a.listInterestRegistrations();
  assert.equal(saved.length, 20);
  assert.equal(new Set(saved.map((r) => r.id)).size, 20);
  assert.ok(saved.every((r) => r.email === r.email.toLowerCase()));
  assert.ok(saved[0].createdAt >= saved.at(-1)!.createdAt);
});

test("D1: capacity holds across instances (no double booking)", async () => {
  const d1 = fakeD1();
  const stores = [new D1BookingStore(d1), new D1BookingStore(d1)];
  const profiles = [];
  for (let i = 0; i < 24; i++) {
    profiles.push(
      await stores[i % 2].createProfile({
        parent: { name: `Parent ${i}`, email: `p${i}@example.com`, mobile: "07000000000" },
        player: {
          name: `Player ${i}`, dateOfBirth: "2021-01-01", gender: "girl", experience: "new", interest: "not-sure",
          emergencyContactName: "Grandparent", emergencyContactPhone: "07000000001", photoConsent: false,
        },
      }),
    );
  }
  const results = await Promise.all(
    profiles.map(({ parent, player }, i) =>
      stores[i % 2].reservePlace({ sessionId: "sun-0900-early-risers", parentId: parent.id, playerId: player.id, holdMinutes: 10, isTrial: true }),
    ),
  );
  assert.equal(results.filter((r) => r.ok).length, 16);
  assert.equal((await stores[0].sessionCounts())["sun-0900-early-risers"].held, 16);
});

test("D1: coach interest, camp interest and enquiries are stored", async () => {
  const s = new D1BookingStore(fakeD1());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await s.createCoachInterest({ name: "Sam", email: "Sam@X.com" } as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await s.createCampInterest({ parentName: "Pat", email: "pat@x.com" } as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await s.createEnquiry({ parentName: "First" } as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await s.createEnquiry({ parentName: "Second" } as any);
  assert.equal((await s.listCoachInterests())[0].email, "sam@x.com");
  assert.equal((await s.listCampInterests()).length, 1);
  assert.deepEqual((await s.listEnquiries()).map((e) => e.parentName), ["First", "Second"]);
});
