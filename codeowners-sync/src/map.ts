import { parse } from "yaml";
import { normalize, patternProblem, specificity } from "./glob.ts";

export const REVIEW_SETUP = "review-setup";
const TEAM = /^@([A-Za-z0-9][A-Za-z0-9-]*)\/([A-Za-z0-9][A-Za-z0-9._-]*)$/;
const AREA = /^[a-z][a-z0-9-]*$/;

export type Area = { name: string; owners: string[]; paths: string[] };
export type Rule = { pattern: string; owners: string[]; areas: string[] };
export type Files = { map: string; codeowners: string };

export class MapError extends Error {
  problems: string[];
  constructor(problems: string[]) {
    super(problems.join("\n"));
    this.problems = problems;
  }
}

export function parseMap(text: string): Area[] {
  let data: unknown;
  try {
    data = parse(text);
  } catch (err) {
    throw new MapError([
      `The map is not valid YAML: ${(err as Error).message}`,
    ]);
  }
  const problems: string[] = [];
  const areas: Area[] = [];
  const root = data as { areas?: unknown } | null;
  if (!root || typeof root !== "object" || Array.isArray(root)) {
    throw new MapError(["The map must be a mapping with one key, `areas`."]);
  }
  for (const key of Object.keys(root)) {
    if (key !== "areas") problems.push(`Unknown top-level key \`${key}\`.`);
  }
  const raw = root.areas;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new MapError([
      ...problems,
      "`areas` must be a mapping of area names.",
    ]);
  }

  for (const [name, value] of Object.entries(raw as Record<string, unknown>)) {
    const where = `Area \`${name}\``;
    if (!AREA.test(name))
      problems.push(`${where}: names are lowercase kebab-case.`);
    const area = value as { owners?: unknown; paths?: unknown } | null;
    if (!area || typeof area !== "object" || Array.isArray(area)) {
      problems.push(
        `${where}: must be a mapping with \`owners\` and \`paths\`.`,
      );
      continue;
    }
    for (const key of Object.keys(area)) {
      if (key !== "owners" && key !== "paths") {
        problems.push(`${where}: unknown key \`${key}\`.`);
      }
    }
    const owners = stringList(area.owners);
    const paths = stringList(area.paths);
    if (!owners)
      problems.push(`${where}: \`owners\` must be a non-empty list.`);
    if (!paths) problems.push(`${where}: \`paths\` must be a non-empty list.`);
    for (const owner of owners ?? []) {
      if (!TEAM.test(owner)) {
        problems.push(
          `${where}: owner \`${owner}\` is not a team (\`@org/team\`).`,
        );
      }
    }
    for (const path of paths ?? []) {
      const problem = patternProblem(path);
      if (problem) problems.push(`${where}: path \`${path}\` ${problem}.`);
    }
    areas.push({ name, owners: owners ?? [], paths: paths ?? [] });
  }

  if (!areas.some((a) => a.name === REVIEW_SETUP)) {
    problems.push(
      `Area \`${REVIEW_SETUP}\` is missing. It owns the map, CODEOWNERS and the workflows.`,
    );
  }
  if (problems.length > 0) throw new MapError(problems);
  return areas;
}

function stringList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  if (!value.every((v) => typeof v === "string")) return null;
  return value as string[];
}

// The review setup always covers the map, CODEOWNERS and every workflow,
// so no PR can drop a path or a gate and merge unreviewed.
export function reviewSetupPaths(files: Files): string[] {
  return [`/${files.map}`, `/${files.codeowners}`, "/.github/workflows/**"];
}

// The review setup pattern a path falls inside, or null.
function insideReviewSetup(pattern: string, setup: string[]): string | null {
  for (const s of setup) {
    if (s.endsWith("/**")) {
      const dir = s.slice(0, -2);
      if (pattern.startsWith(dir) || pattern === dir.slice(0, -1)) return s;
    } else if (pattern === s) {
      return s;
    }
  }
  return null;
}

export function buildRules(areas: Area[], files: Files): Rule[] {
  // Another area inside the review setup would sort after it (or share its line)
  // and hand the setup to other owners, because the last matching line wins.
  const setupArea = areas.find((a) => a.name === REVIEW_SETUP);
  const setup = [...(setupArea?.paths ?? []), ...reviewSetupPaths(files)].map(
    normalize,
  );
  const problems: string[] = [];
  for (const area of areas) {
    if (area.name === REVIEW_SETUP) continue;
    for (const path of area.paths) {
      const inside = insideReviewSetup(normalize(path), setup);
      if (inside) {
        problems.push(
          `Area \`${area.name}\`: path \`${path}\` lies inside \`${inside}\`, which ${REVIEW_SETUP} owns. ` +
            `It would replace the ${REVIEW_SETUP} owners there. Remove it, or list it under ${REVIEW_SETUP}.`,
        );
      }
    }
  }
  if (problems.length > 0) throw new MapError(problems);

  const byPattern = new Map<string, Rule>();
  const order: string[] = [];
  for (const area of areas) {
    const paths =
      area.name === REVIEW_SETUP
        ? [...area.paths, ...reviewSetupPaths(files)]
        : area.paths;
    for (const path of paths) {
      const pattern = normalize(path);
      let rule = byPattern.get(pattern);
      if (!rule) {
        rule = { pattern, owners: [], areas: [] };
        byPattern.set(pattern, rule);
        order.push(pattern);
      }
      // Two areas on the same path: either team may approve.
      for (const owner of area.owners) {
        if (!rule.owners.includes(owner)) rule.owners.push(owner);
      }
      if (!rule.areas.includes(area.name)) rule.areas.push(area.name);
    }
  }
  // The last matching line wins, so the narrowest paths go last.
  // Ties keep map order, which makes the output stable.
  return order
    .map((pattern, index) => ({ rule: byPattern.get(pattern) as Rule, index }))
    .sort((a, b) => {
      const [da, la] = specificity(a.rule.pattern);
      const [db, lb] = specificity(b.rule.pattern);
      return da - db || la - lb || a.index - b.index;
    })
    .map((x) => x.rule);
}

export function render(rules: Rule[], files: Files): string {
  const width = Math.max(...rules.map((r) => r.pattern.length)) + 2;
  const header = [
    `# Generated by wunderflats/actions/codeowners-sync from ${files.map}.`,
    "# Do not edit by hand. Edit the map, then run:",
    "#   node <wunderflats/actions checkout>/codeowners-sync/dist/index.js --write",
    "#",
    "# Only critical paths have owners. Lines are ordered narrowest last, because",
    "# the last matching line wins.",
    "",
  ];
  const lines = rules.map(
    (r) => `${r.pattern.padEnd(width)}${r.owners.join(" ")}`,
  );
  return `${[...header, ...lines].join("\n")}\n`;
}

export function generate(
  mapText: string,
  files: Files,
): { rules: Rule[]; text: string } {
  const rules = buildRules(parseMap(mapText), files);
  return { rules, text: render(rules, files) };
}

export function teamsOf(
  rules: Rule[],
): { org: string; slug: string; handle: string }[] {
  const seen = new Set<string>();
  const teams = [];
  for (const rule of rules) {
    for (const handle of rule.owners) {
      if (seen.has(handle)) continue;
      seen.add(handle);
      const m = TEAM.exec(handle) as RegExpExecArray;
      teams.push({ org: m[1], slug: m[2], handle });
    }
  }
  return teams;
}
