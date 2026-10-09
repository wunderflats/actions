import assert from "node:assert/strict";
import { test } from "node:test";
import {
  normalize,
  patternProblem,
  specificity,
  toRegExp,
} from "../src/glob.ts";

const matches = (pattern: string, path: string) => toRegExp(pattern).test(path);

test("a trailing /** matches everything below the folder, and only there", () => {
  assert.ok(matches("/src/payments/**", "src/payments/a.ts"));
  assert.ok(matches("/src/payments/**", "src/payments/deep/b.ts"));
  assert.ok(!matches("/src/payments/**", "src/paymentsx/a.ts"));
  assert.ok(!matches("/src/payments/**", "lib/src/payments/a.ts"));
});

test("a slash in the middle anchors the pattern to the root", () => {
  assert.equal(normalize("src/pricing/**"), "/src/pricing/**");
  assert.ok(!matches("src/pricing/**", "app/src/pricing/a.ts"));
});

test("a pattern without a slash matches at any depth", () => {
  assert.equal(normalize("*.sql"), "*.sql");
  assert.ok(matches("*.sql", "db/migrations/001.sql"));
  assert.ok(matches("migrations/", "db/migrations/001.sql"));
  assert.ok(!matches("migrations/", "db/migrations"));
});

test("a literal last segment also owns everything below it", () => {
  assert.ok(matches("/docs", "docs/a.md"));
  assert.ok(matches("/.github/CODEOWNERS", ".github/CODEOWNERS"));
});

test("a wildcard last segment matches direct children only", () => {
  assert.ok(matches("/docs/*", "docs/a.md"));
  assert.ok(!matches("/docs/*", "docs/build/b.md"));
});

test("** in the middle matches zero or more folders", () => {
  assert.ok(matches("/src/**/state/*.ts", "src/state/a.ts"));
  assert.ok(matches("/src/**/state/*.ts", "src/bookings/x/state/a.ts"));
  assert.ok(matches("**/booking-state.ts", "a/b/booking-state.ts"));
});

test("dots and other regex characters are literal", () => {
  assert.ok(!matches("/a.b", "axb"));
  assert.ok(matches("/file?.ts", "file1.ts"));
});

test("catch-alls and syntax CODEOWNERS lacks are rejected", () => {
  for (const p of [
    "*",
    "/*",
    "**",
    "/**",
    "/",
    "***",
    "**/**",
    "/**/**",
    "*/",
    "?*",
    "*/*",
  ])
    assert.match(patternProblem(p) ?? "", /catch-all/, p);
  assert.match(patternProblem("!src/a") ?? "", /negation/);
  assert.match(patternProblem("src/[ab]") ?? "", /ranges/);
  assert.match(patternProblem("my dir/**") ?? "", /space/);
  assert.equal(patternProblem("/src/payments/**"), null);
});

test("deeper literal paths rank narrower", () => {
  const [a] = specificity("/src/**");
  const [b] = specificity("/src/payments/**");
  const [c] = specificity("/src/payments/refunds/**");
  const [d] = specificity("*.sql");
  assert.ok(d < a && a < b && b < c);
});

test("a pattern that extends another after ** ranks narrower", () => {
  const [da, la] = specificity("/src/**");
  const [db, lb] = specificity("/src/**/policies/*.ts");
  assert.equal(da, db);
  assert.ok(la < lb);
});
