// CODEOWNERS path patterns, as GitHub reads them.
// https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners#codeowners-syntax

// A pattern made only of wildcards and slashes (`*`, `***`, `**/**`, `*/`) has no
// literal path part, so it matches whole swaths of the repo, not a critical area.
const NO_LITERAL = /^[*?/]+$/;

// Returns why GitHub would misread the pattern, or null when it is fine.
export function patternProblem(pattern: string): string | null {
  if (pattern.trim() !== pattern || pattern === "") {
    return "is empty or has leading or trailing spaces";
  }
  if (NO_LITERAL.test(pattern)) {
    return "is a catch-all: it has no literal path part. Only critical paths get owners";
  }
  if (pattern.startsWith("!")) {
    return "starts with `!`. CODEOWNERS has no negation";
  }
  if (/[[\]]/.test(pattern)) {
    return "uses `[ ]`. CODEOWNERS has no character ranges";
  }
  if (pattern.startsWith("#")) {
    return "starts with `#`, which CODEOWNERS reads as a comment";
  }
  if (/\s/.test(pattern) || pattern.includes("\\")) {
    return "contains a space or a backslash";
  }
  return null;
}

// A pattern with a slash anywhere but at the end is anchored to the repo root.
// Writing that leading slash out makes the generated file unambiguous.
export function normalize(pattern: string): string {
  if (pattern.startsWith("/") || pattern.startsWith("**")) return pattern;
  const inner = pattern.endsWith("/") ? pattern.slice(0, -1) : pattern;
  return inner.includes("/") ? `/${pattern}` : pattern;
}

function isAnchored(pattern: string): boolean {
  return normalize(pattern).startsWith("/");
}

// Higher means narrower. First the literal directory depth before the first
// wildcard, then the literal characters in the whole pattern, so that
// `/src/**/policies/*.ts` ranks narrower than `/src/**`.
// Unanchored patterns match at any depth, so they rank broadest.
export function specificity(pattern: string): [number, number] {
  const literal = pattern.replace(/[*?/]/g, "").length;
  if (!isAnchored(pattern)) return [0, literal];
  const segments = normalize(pattern).slice(1).split("/");
  let depth = 0;
  for (const segment of segments) {
    if (segment === "" || /[*?]/.test(segment)) break;
    depth += 1;
  }
  return [depth, literal];
}

export function toRegExp(pattern: string): RegExp {
  let p = normalize(pattern);
  const dirOnly = p.endsWith("/");
  if (dirOnly) p = p.slice(0, -1);
  const anchored = p.startsWith("/");
  if (anchored) p = p.slice(1);

  const segments = p.split("/");
  const last = segments[segments.length - 1];
  // `docs/*` matches direct children only, so only a literal last segment
  // also matches everything below it.
  const literalLast = !/[*?]/.test(last);

  let body = "";
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const isLast = i === segments.length - 1;
    if (segment === "**") {
      body += isLast ? ".*" : "(?:.*/)?";
      continue;
    }
    body += segment
      .split("")
      .map((c) => {
        if (c === "*") return "[^/]*";
        if (c === "?") return "[^/]";
        return c.replace(/[.+^${}()|\\]/g, "\\$&");
      })
      .join("");
    if (!isLast) body += "/";
  }

  const prefix = anchored ? "" : "(?:.*/)?";
  let suffix = "";
  if (dirOnly) suffix = "/.*";
  else if (literalLast) suffix = "(?:/.*)?";
  return new RegExp(`^${prefix}${body}${suffix}$`);
}

export function matchesAny(pattern: string, files: string[]): boolean {
  const re = toRegExp(pattern);
  return files.some((f) => re.test(f));
}
