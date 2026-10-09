# codeowners-sync

Generates `.github/CODEOWNERS` from `.github/critical-paths.yml`, and fails a PR when the two differ. It is the first of the three review gates in the [review enforcement plan](https://github.com/wunderflats/agentic-tech-plugins/blob/main/docs/review-enforcement-plan.md).

With "Require review from Code Owners" on and zero required approvals, GitHub asks for a Platform review only when a PR touches a critical path. That works only if CODEOWNERS is right. A wrong line fails silently, so this check makes it fail loudly.

## What the check does

| Check | Result |
|---|---|
| The map is invalid: bad YAML, an unknown key, an owner that is not `@org/team`, a path with no literal part (`*`, `**/**`), no `review-setup` area, or another area claiming a path inside the review setup | Fails |
| CODEOWNERS differs from what the map produces, or is missing | Fails. The job summary shows the expected file. |
| An owner team does not exist, or has less than write access to the repo | Fails. GitHub would ignore it. |
| GitHub's own parse of CODEOWNERS at the PR head reports an error, or GitHub finds no CODEOWNERS it would use | Fails |
| A path matches no file in the repo | Warns. A new repo can map paths before the code exists. |
| The action itself errors | Fails. The gate never fails open. |

## What it generates

- Only critical paths get owners. There is no catch-all line.
- Lines run from broadest to narrowest, because the last matching line wins. Rank: literal folder depth before the first wildcard, then literal characters in the whole pattern. Nested paths always order correctly. For two unrelated wildcard patterns that happen to overlap, the rank is a heuristic.
- `review-setup` always covers the map, CODEOWNERS and `.github/workflows/**`, even when the map leaves them out. No other area may list a path inside them, so nobody else can own the review machinery.
- A path in two areas becomes one line with both teams.
- Paths with a slash in the middle get a leading `/`. GitHub reads them as anchored either way.

See `example/critical-paths.yml` and the `example/CODEOWNERS` it produces. A unit test keeps the two in step.

## Use in a repo

Run it on every PR, not only on PRs that touch the map. A required check that does not run blocks the merge.

```yaml
name: codeowners-sync
on:
  pull_request:
    types: [opened, synchronize, reopened]
permissions:
  contents: read
jobs:
  codeowners-sync:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v6
      - uses: actions/create-github-app-token@v3
        id: app-token
        with:
          client-id: ${{ vars.REVIEW_GATES_APP_ID }}
          private-key: ${{ secrets.REVIEW_GATES_PRIVATE_KEY }}
      - uses: wunderflats/actions/codeowners-sync@review-gates-v1
        with:
          app-token: ${{ steps.app-token.outputs.token }}
```

The App token comes from `wf-review-gates` (Members read, Metadata read). The default `GITHUB_TOKEN` cannot read team access.

## Regenerate locally

```sh
node <wunderflats/actions checkout>/codeowners-sync/dist/index.js --write
node <wunderflats/actions checkout>/codeowners-sync/dist/index.js --check
```

Both run from the repo root. `--root`, `--map` and `--codeowners` change the locations. `--check` locally skips the team access check, which needs the App token.

## Develop

```sh
npm install
npm test          # unit tests, node:test
npm run typecheck
npm run build     # rebuilds dist/, which is committed
```

Matching follows GitHub's CODEOWNERS rules, which differ from `.gitignore`: `docs/*` matches direct children only. The matcher only decides the "matches no file" warning. GitHub decides who reviews.
