import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { FileBookingStore } from "../src/lib/booking/file-store";
import { coachInterestSchema, interestRegistrationSchema } from "../src/lib/validation";
import { programmes, REGISTRATION_FEE_PENCE, formatOfferPrice, formatProgrammePrice, getProgramme } from "../src/data/programmes";
import { sessions } from "../src/data/sessions";
import { ageBand } from "../src/lib/age";

const freshStore = () => new FileBookingStore(path.join(mkdtempSync(path.join(tmpdir(), "hillrisers-")), "store.json"));

const child = (overrides = {}) => ({
  firstName: "Aria",
  dateOfBirth: "2016-05-10",
  girlsOnly: "yes",
  level: "junior-club",
  mainRole: "spin",
  wants: ["Spin bowling", "Fielding"],
  formats: ["Small group (up to 6 per net)"],
  sessionLengths: ["90 minutes"],
  availability: ["Saturday", "Sunday morning"],
  frequency: "once",
  otherInterests: ["Holiday camps"],
  paymentPreference: "monthly",
  ...overrides,
});

const registration = (overrides = {}) => ({
  parentName: "Ravi Patel",
  email: "Ravi@Example.com",
  mobile: "07123 456789",
  postcode: "ha2 0hn",
  heardAbout: "John Lyon",
  children: [child(), child({ firstName: "Dev", dateOfBirth: "2019-02-01", girlsOnly: "not-applicable", level: "new", mainRole: "not-sure" })],
  contactConsent: true,
  marketingConsent: false,
  ...overrides,
});

test("interest form accepts multiple children and normalises the postcode", () => {
  const r = interestRegistrationSchema.safeParse(registration());
  assert.ok(r.success, JSON.stringify(!r.success && r.error.issues));
  assert.equal(r.data.children.length, 2);
  assert.equal(r.data.postcode, "HA2 0HN");
});

test("interest form requires contact consent, a postcode and core child answers", () => {
  const r = interestRegistrationSchema.safeParse(
    registration({ contactConsent: false, postcode: "nope", children: [child({ firstName: "", level: "expert" })] }),
  );
  assert.ok(!r.success);
  const paths = r.error.issues.map((i) => i.path.join("."));
  for (const p of ["contactConsent", "postcode", "children.0.firstName", "children.0.level"]) assert.ok(paths.includes(p), p);
});

test("interest form rejects options that aren't on the form", () => {
  const r = interestRegistrationSchema.safeParse(registration({ children: [child({ availability: ["Tuesday 6pm"] })] }));
  assert.ok(!r.success);
});

test("interest registrations are stored with every child", async () => {
  const store = freshStore();
  const parsed = interestRegistrationSchema.parse(registration());
  const { company: _c, ...data } = parsed;
  void _c;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await store.createInterestRegistration({ ...(data as any), contactConsent: true });
  const [saved] = await store.listInterestRegistrations();
  assert.equal(saved.email, "ravi@example.com");
  assert.deepEqual(saved.children.map((c) => c.firstName), ["Aria", "Dev"]);
  assert.deepEqual(saved.children[0].availability, ["Saturday", "Sunday morning"]);
});

test("coach expressions of interest validate and store", async () => {
  const input = coachInterestSchema.parse({
    name: "Sam Coach",
    email: "sam@example.com",
    phone: "07000 111222",
    roles: ["Specialist coach"],
    specialism: "Spin",
    qualifications: "ECB Level 2",
    availability: "Weekday evenings",
    dbsStatus: "Enhanced cricket DBS 2025",
    safeguardingStatus: "Completed 2025",
    firstAid: true,
  });
  const store = freshStore();
  await store.createCoachInterest(input);
  const [c] = await store.listCoachInterests();
  assert.equal(c.name, "Sam Coach");
  assert.deepEqual(c.roles, ["Specialist coach"]);
  assert.ok(!coachInterestSchema.safeParse({ ...input, roles: [] }).success);
});

test("prices: £30/hr standard for group programmes with a £25/hr 2026/27 offer; Little Cricketers £18", () => {
  const price = (k: string) => getProgramme(k)!.pricePence;
  const offer = (k: string) => getProgramme(k)!.offerPricePence;
  assert.equal(price("little-cricketers"), 1800);
  assert.equal(offer("little-cricketers"), undefined);
  for (const k of ["development", "girls-development", "performance", "girls-performance"]) {
    assert.equal(price(k), 3000, k);
    assert.equal(offer(k), 2500, k);
  }
  assert.equal(formatOfferPrice(getProgramme("development")!), "£25 per hour");
  assert.equal(price("small-group"), 4500);
  assert.equal(formatProgrammePrice(getProgramme("one-to-one")!), "from £75 per hour");
  assert.equal(REGISTRATION_FEE_PENCE, 3000);
  assert.equal(programmes.length, 7);
});

test("the only fixed time is Little Cricketers, Sundays 9:00–9:50am", () => {
  assert.deepEqual(
    programmes.filter((p) => p.fixedTime).map((p) => [p.key, p.fixedTime]),
    [["little-cricketers", "Sundays 9:00–9:50am"]],
  );
  assert.deepEqual(
    sessions.map((s) => [s.day, s.startTime, s.endTime]),
    [["Sunday", "09:00", "09:50"]],
  );
});

test("age bands for demand analysis", () => {
  assert.equal(ageBand(5), "4–7");
  assert.equal(ageBand(10), "8–11");
  assert.equal(ageBand(14), "12–15");
  assert.equal(ageBand(17), "Other");
});

test("holiday camp interest is stored (camp details TBC)", async () => {
  const { camps } = await import("../src/data/camps");
  assert.equal(camps[0].name, "Spring Half Term Camp");
  const store = freshStore();
  await store.createCampInterest({ camps: [camps[0].id], parentName: "P", email: "p@example.com", childName: "Kid", childAge: 15, interest: "batting" });
  assert.equal((await store.listCampInterests()).length, 1);
});
