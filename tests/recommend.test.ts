import { test } from "node:test";
import assert from "node:assert/strict";
import { recommend, ageFromDob } from "../src/lib/recommend";
import { sessions, isBookable, sessionsFor, type AcademySession } from "../src/data/sessions";

const keys = (r: ReturnType<typeof recommend>) => r.academies.map((a) => a.academy.key);

test("young beginners go to Little Cricketers", () => {
  const r = recommend({ age: 5, gender: "boy", experience: "new", interest: "not-sure" });
  assert.equal(r.pathway, "Little Cricketers");
  assert.deepEqual(keys(r), ["little-cricketers"]);
});

test("new girls are offered the Girls Academy first", () => {
  const r = recommend({ age: 9, gender: "girl", experience: "new", interest: "batting" });
  assert.equal(keys(r)[0], "girls");
  assert.ok(keys(r).includes("batting"));
});

test("boys are never recommended the Girls Academy", () => {
  for (const age of [5, 7, 9, 12, 14]) {
    for (const experience of ["new", "some", "regular", "performance"] as const) {
      const r = recommend({ age, gender: "boy", experience, interest: "not-sure" });
      assert.ok(!keys(r).includes("girls"));
    }
  }
});

test("interest leads the recommendation", () => {
  assert.equal(keys(recommend({ age: 12, gender: "boy", experience: "some", interest: "spin" }))[0], "spin-bowling");
  assert.equal(keys(recommend({ age: 12, gender: "unspecified", experience: "some", interest: "seam" }))[0], "seam-bowling");
});

test("regular players aged 10+ are offered performance; beginners are not", () => {
  const r = recommend({ age: 12, gender: "boy", experience: "performance", interest: "seam" });
  assert.equal(keys(r)[0], "seam-bowling");
  assert.ok(keys(r).includes("performance"));
  assert.equal(r.pathway, "Excel");
  const beginner = recommend({ age: 12, gender: "boy", experience: "new", interest: "batting" });
  assert.ok(!keys(beginner).includes("performance") && !keys(beginner).includes("power"));
});

test("there is always a recommendation that fits the child's age", () => {
  for (let age = 4; age <= 14; age++) {
    for (const experience of ["new", "some", "regular", "performance"] as const) {
      for (const gender of ["boy", "girl", "unspecified"] as const) {
        const r = recommend({ age, gender, experience, interest: "not-sure" });
        assert.ok(r.academies.length > 0 && r.academies.length <= 3, `age ${age} ${experience} ${gender}`);
        for (const a of r.academies) assert.ok(age >= a.academy.ageMin - 1 && age <= a.academy.ageMax + 1);
      }
    }
  }
});

test("no slots are bookable while the weekly programme is unassigned", () => {
  assert.ok(sessions.every((s) => !isBookable(s)));
  const r = recommend({ age: 10, gender: "boy", experience: "some", interest: "batting" });
  assert.equal(r.sessions.length, 0);
});

test("once a slot is assigned to an academy it is recommended", () => {
  const slot: AcademySession = {
    id: "test-batting",
    title: "Batting Academy",
    discipline: "batting",
    day: "Tuesday",
    block: "test",
    startTime: "18:00",
    endTime: "19:30",
    ageMin: 8,
    ageMax: 11,
    capacity: 18,
    pricePence: 2500,
    active: true,
    confirmed: true,
  };
  sessions.push(slot);
  try {
    assert.deepEqual(sessionsFor("batting").map((s) => s.id), ["test-batting"]);
    const fits = recommend({ age: 10, gender: "boy", experience: "some", interest: "batting" });
    assert.equal(fits.sessions[0]?.session.id, "test-batting");
    const tooOld = recommend({ age: 13, gender: "boy", experience: "some", interest: "batting" });
    assert.equal(tooOld.sessions.length, 0);
  } finally {
    sessions.pop();
  }
});

test("ageFromDob handles birthdays", () => {
  assert.equal(ageFromDob("2015-06-15", new Date("2026-06-14")), 10);
  assert.equal(ageFromDob("2015-06-15", new Date("2026-06-15")), 11);
});
