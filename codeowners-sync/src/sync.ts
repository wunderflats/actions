import { matchesAny } from "./glob.ts";
import { type Files, generate, MapError, type Rule } from "./map.ts";

export type Report = {
  errors: string[];
  warnings: string[];
  expected: string | null;
  rules: Rule[];
};

// Everything the check decides without calling GitHub.
export function checkLocal(
  mapText: string | null,
  codeownersText: string | null,
  files: Files,
  repoFiles: string[],
): Report {
  const report: Report = {
    errors: [],
    warnings: [],
    expected: null,
    rules: [],
  };
  if (mapText === null) {
    report.errors.push(`${files.map} is missing.`);
    return report;
  }
  try {
    const { rules, text } = generate(mapText, files);
    report.rules = rules;
    report.expected = text;
  } catch (err) {
    if (!(err instanceof MapError)) throw err;
    report.errors.push(...err.problems.map((p) => `${files.map}: ${p}`));
    return report;
  }

  if (codeownersText === null) {
    report.errors.push(
      `${files.codeowners} is missing. Generate it from ${files.map}.`,
    );
  } else if (codeownersText !== report.expected) {
    report.errors.push(
      `${files.codeowners} differs from what ${files.map} produces. Regenerate it, do not edit it by hand.`,
    );
  }

  // A glob that matches nothing is a warning, so a new repo can map paths before the code exists.
  for (const rule of report.rules) {
    if (!matchesAny(rule.pattern, repoFiles)) {
      report.warnings.push(
        `\`${rule.pattern}\` (${rule.areas.join(", ")}) matches no file in the repo.`,
      );
    }
  }
  return report;
}

export function firstDifference(expected: string, actual: string): string {
  const e = expected.split("\n");
  const a = actual.split("\n");
  for (let i = 0; i < Math.max(e.length, a.length); i++) {
    if (e[i] !== a[i]) {
      return `Line ${i + 1}: expected ${JSON.stringify(e[i] ?? "")}, found ${JSON.stringify(a[i] ?? "")}.`;
    }
  }
  return "";
}
