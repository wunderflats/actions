import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { buildRules, generate, MapError, parseMap } from "../src/map.ts";
import { checkLocal } from "../src/sync.ts";

const FILES = {
  map: ".github/critical-paths.yml",
  codeowners: ".github/CODEOWNERS",
};
const PLATFORM = "@wunderflats/agentic-technology-platform";

const map = (areas: string) => `areas:\n${areas}`;
const SETUP = `  review-setup:\n    owners: ["${PLATFORM}"]\n    paths: [".github/critical-paths.yml"]\n`;

function problems(text: string): string[] {
  try {
    generate(text, FILES);
    return [];
  } catch (err) {
    assert.ok(err instanceof MapError);
    return err.problems;
  }
}

test("the example map produces the example CODEOWNERS", () => {
  const mapText = readFileSync(
    new URL("../example/critical-paths.yml", import.meta.url),
    "utf8",
  );
  const expected = readFileSync(
    new URL("../example/CODEOWNERS", import.meta.url),
    "utf8",
  );
  assert.equal(generate(mapText, FILES).text, expected);
});

test("review-setup always covers the map, CODEOWNERS and every workflow", () => {
  const rules = buildRules(parseMap(map(SETUP)), FILES);
  assert.deepEqual(rules.map((r) => r.pattern).sort(), [
    "/.github/CODEOWNERS",
    "/.github/critical-paths.yml",
    "/.github/workflows/**",
  ]);
});

test("review-setup follows custom file locations", () => {
  const files = { map: "ci/critical-paths.yml", codeowners: "docs/CODEOWNERS" };
  const rules = buildRules(parseMap(map(SETUP)), files);
  const patterns = rules.map((r) => r.pattern);
  assert.ok(patterns.includes("/ci/critical-paths.yml"));
  assert.ok(patterns.includes("/docs/CODEOWNERS"));
});

test("the narrowest path comes last, whatever the map order", () => {
  const text = map(
    `  payments:\n    owners: ["@wunderflats/payments"]\n    paths: ["src/payments/refunds/**"]\n` +
      `  pricing:\n    owners: ["${PLATFORM}"]\n    paths: ["src/**", "*.sql"]\n${SETUP}`,
  );
  const patterns = generate(text, FILES).rules.map((r) => r.pattern);
  assert.ok(patterns.indexOf("*.sql") < patterns.indexOf("/src/**"));
  assert.ok(
    patterns.indexOf("/src/**") < patterns.indexOf("/src/payments/refunds/**"),
  );
});

test("two areas on one path become one line with both owners", () => {
  const text = map(
    `  pricing:\n    owners: ["@wunderflats/a"]\n    paths: ["src/price/**"]\n` +
      `  payments:\n    owners: ["@wunderflats/b"]\n    paths: ["/src/price/**"]\n${SETUP}`,
  );
  const rule = generate(text, FILES).rules.find(
    (r) => r.pattern === "/src/price/**",
  );
  assert.deepEqual(rule?.owners, ["@wunderflats/a", "@wunderflats/b"]);
  assert.deepEqual(rule?.areas, ["pricing", "payments"]);
});

test("the output has no catch-all line", () => {
  const { text } = generate(map(SETUP), FILES);
  for (const line of text.split("\n")) {
    if (line.startsWith("#") || line === "") continue;
    assert.ok(!/^\*\s|^\/\*\s|^\*\*\s/.test(line), line);
  }
});

test("a map without review-setup is rejected", () => {
  const out = problems(
    map(`  pricing:\n    owners: ["${PLATFORM}"]\n    paths: ["src/**"]\n`),
  );
  assert.ok(out.some((p) => p.includes("review-setup")));
});

test("owners must be teams, and every area needs owners and paths", () => {
  const out = problems(
    map(
      `  pricing:\n    owners: ["@someone"]\n    paths: []\n  payments: {}\n${SETUP}`,
    ),
  );
  assert.ok(out.some((p) => p.includes("`@someone` is not a team")));
  assert.ok(
    out.some((p) => p.includes("`pricing`: `paths` must be a non-empty list")),
  );
  assert.ok(
    out.some((p) =>
      p.includes("`payments`: `owners` must be a non-empty list"),
    ),
  );
});

test("a typo in a key is an error, not a silently ignored area", () => {
  const out = problems(
    map(
      `  pricing:\n    owner: ["${PLATFORM}"]\n    paths: ["src/**"]\n${SETUP}`,
    ),
  );
  assert.ok(out.some((p) => p.includes("unknown key `owner`")));
});

test("a catch-all path is rejected", () => {
  const out = problems(
    map(`  pricing:\n    owners: ["${PLATFORM}"]\n    paths: ["*"]\n${SETUP}`),
  );
  assert.ok(out.some((p) => p.includes("catch-all")));
});

test("invalid YAML is reported, not thrown", () => {
  const report = checkLocal("areas: [", null, FILES, []);
  assert.match(report.errors[0], /not valid YAML/);
});

test("the check fails on drift and on a missing file, and passes when in sync", () => {
  const mapText = map(SETUP);
  const { text } = generate(mapText, FILES);
  const tracked = [
    ".github/critical-paths.yml",
    ".github/CODEOWNERS",
    ".github/workflows/ci.yml",
  ];
  assert.deepEqual(checkLocal(mapText, text, FILES, tracked).errors, []);
  assert.match(
    checkLocal(mapText, `${text}* @x/y\n`, FILES, tracked).errors[0],
    /differs/,
  );
  assert.match(checkLocal(mapText, null, FILES, tracked).errors[0], /missing/);
  assert.match(checkLocal(null, text, FILES, tracked).errors[0], /missing/);
});

test("a path that matches no file warns but does not fail", () => {
  const mapText = map(
    `  pricing:\n    owners: ["${PLATFORM}"]\n    paths: ["src/pricing/**"]\n${SETUP}`,
  );
  const { text } = generate(mapText, FILES);
  const report = checkLocal(mapText, text, FILES, [
    ".github/critical-paths.yml",
  ]);
  assert.deepEqual(report.errors, []);
  assert.ok(
    report.warnings.some(
      (w) => w.includes("/src/pricing/**") && w.includes("pricing"),
    ),
  );
});

test("a narrow rule after ** sorts after the broad one, whatever the map order", () => {
  const text = map(
    `  authorization:\n    owners: ["@wunderflats/a"]\n    paths: ["src/**/policies/*.ts"]\n` +
      `  pricing:\n    owners: ["@wunderflats/b"]\n    paths: ["src/**"]\n${SETUP}`,
  );
  const patterns = generate(text, FILES).rules.map((r) => r.pattern);
  assert.ok(
    patterns.indexOf("/src/**") < patterns.indexOf("/src/**/policies/*.ts"),
  );
});

test("another area cannot take over a path inside review-setup", () => {
  for (const path of [
    ".github/workflows/deploy.yml",
    ".github/workflows/",
    ".github/workflows",
    ".github/CODEOWNERS",
    ".github/critical-paths.yml",
  ]) {
    const out = problems(
      map(
        `  payments:\n    owners: ["@wunderflats/x"]\n    paths: ["${path}"]\n${SETUP}`,
      ),
    );
    assert.ok(
      out.some((p) => p.includes("inside") && p.includes("review-setup")),
      path,
    );
  }
});

test("review-setup itself may list narrower workflow paths", () => {
  const text = map(
    `  review-setup:\n    owners: ["${PLATFORM}"]\n    paths: [".github/workflows/review-classification.yml"]\n`,
  );
  assert.ok(generate(text, FILES).rules.length > 0);
});

test("paths next to the review setup stay allowed", () => {
  const text = map(
    `  payments:\n    owners: ["${PLATFORM}"]\n    paths: [".github/workflows-docs/**", ".github/dependabot.yml"]\n${SETUP}`,
  );
  assert.ok(generate(text, FILES).rules.length > 0);
});
