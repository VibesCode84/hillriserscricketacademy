import { test } from "node:test";
import assert from "node:assert/strict";
import { recommend, ageFromDob } from "../src/lib/recommend";

test("young beginners go to Little Cricketers", () => {
  const r = recommend({ age: 5, gender: "boy", experience: "new", interest: "not-sure" });
  assert.equal(r.pathway, "Little Cricketers");
  assert.equal(r.recommendations[0].session.discipline, "little-cricketers");
});

test("new girls are offered the Girls Academy first", () => {
  const r = recommend({ age: 9, gender: "girl", experience: "new", interest: "batting" });
  assert.equal(r.recommendations[0].session.discipline, "girls");
  assert.ok(r.recommendations.some((x) => x.session.discipline === "batting"));
});

test("boys are never recommended girls-only sessions", () => {
  for (const age of [7, 9, 12, 14]) {
    const r = recommend({ age, gender: "boy", experience: "some", interest: "not-sure" });
    assert.ok(r.recommendations.every((x) => !x.session.girlsOnly));
  }
});

test("batters get an age-appropriate batting group", () => {
  const younger = recommend({ age: 9, gender: "boy", experience: "some", interest: "batting" });
  assert.equal(younger.recommendations[0].session.id, "tue-1800-batting");
  const older = recommend({ age: 13, gender: "unspecified", experience: "regular", interest: "batting" });
  assert.equal(older.recommendations[0].session.id, "tue-1930-batting");
});

test("regular players aged 10+ are offered performance", () => {
  const r = recommend({ age: 12, gender: "boy", experience: "performance", interest: "seam" });
  assert.equal(r.recommendations[0].session.discipline, "seam-bowling");
  assert.ok(r.recommendations.some((x) => x.session.discipline === "performance"));
  assert.equal(r.pathway, "Excel");
});

test("recommendations always fit the child's age", () => {
  for (let age = 4; age <= 14; age++) {
    for (const experience of ["new", "some", "regular", "performance"] as const) {
      const r = recommend({ age, gender: "girl", experience, interest: "not-sure" });
      assert.ok(r.recommendations.length > 0, `no recommendation for age ${age} ${experience}`);
      assert.ok(r.recommendations.length <= 3);
    }
  }
});

test("ageFromDob handles birthdays", () => {
  assert.equal(ageFromDob("2015-06-15", new Date("2026-06-14")), 10);
  assert.equal(ageFromDob("2015-06-15", new Date("2026-06-15")), 11);
});
