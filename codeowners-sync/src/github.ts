const API = process.env.GITHUB_API_URL ?? "https://api.github.com";

async function get(
  path: string,
  token: string,
  accept = "application/vnd.github+json",
) {
  return fetch(`${API}${path}`, {
    headers: {
      Accept: accept,
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
}

// Returns a problem, or null when the team can be a code owner of the repo.
// GitHub silently ignores a code owner team without write access.
// Needs a token that can read the org's teams: the wf-review-gates App token.
export async function teamAccessProblem(
  team: { org: string; slug: string; handle: string },
  repo: { owner: string; repo: string },
  token: string,
): Promise<string | null> {
  if (team.org.toLowerCase() !== repo.owner.toLowerCase()) {
    return `\`${team.handle}\` belongs to another organization than ${repo.owner}.`;
  }
  const res = await get(
    `/orgs/${team.org}/teams/${team.slug}/repos/${repo.owner}/${repo.repo}`,
    token,
    "application/vnd.github.v3.repository+json",
  );
  if (res.status === 404) {
    return `\`${team.handle}\` does not exist or has no access to ${repo.owner}/${repo.repo}.`;
  }
  if (!res.ok) {
    throw new Error(
      `Reading access of ${team.handle} failed: HTTP ${res.status} ${await res.text()}`,
    );
  }
  const body = (await res.json()) as { permissions?: Record<string, boolean> };
  const p = body.permissions ?? {};
  if (!(p.push || p.maintain || p.admin)) {
    return `\`${team.handle}\` has read access only on ${repo.owner}/${repo.repo}. Code owners need write.`;
  }
  return null;
}

// GitHub's own parse of the CODEOWNERS file at a commit.
export async function codeownersErrors(
  repo: { owner: string; repo: string },
  ref: string,
  token: string,
): Promise<string[]> {
  const res = await get(
    `/repos/${repo.owner}/${repo.repo}/codeowners/errors?ref=${encodeURIComponent(ref)}`,
    token,
  );
  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(
      `Reading CODEOWNERS errors failed: HTTP ${res.status} ${await res.text()}`,
    );
  }
  const body = (await res.json()) as {
    errors: { line: number; kind: string; message: string; path: string }[];
  };
  return body.errors.map(
    (e) => `${e.path}:${e.line}: ${e.kind}. ${e.message.split("\n")[0]}`,
  );
}
