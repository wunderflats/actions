# wunderflats/actions

This repository contains a set of helpful github actions created and maintained by Wunderflats GmbH.

---

## cancel-if-not-latest

This action cancels a workflow if it is not running on the last commit of a the event's `ref`. This can be used e.g. to prevent jobs from running on the non-latest push to a `main` or `master` branch.

:warning: This only works in `push` events, not `pull_request`.

#### Example

```yaml
jobs:
  deploy-everything:
    permissions:
      actions: read
    steps:
      - uses: wunderflats/actions/cancel-if-not-latest@master
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

---

## slack-check-runs-notify

A github action that sends a message to slack if one of the jobs failed

#### Example:

```
jobs:
  some-job:
    name: Do Something
    steps:
      - id: main task
        run: echo do the task
  some-other-job
    name: Also doing something
    steps:
      - id: other task
        run: echo do the task
  notify:
    name: notify
    if: always() && !cancelled()
    runs-on: ubuntu-latest
    needs:
      - some-job
      - some-other-job
    steps:
      - name: notifying
        uses: wunderflats/actions/slack-check-runs-notify@master
        with:
          GITHUB_RUN_ID: ${{ github.run_id }}
          COMMIT_MESSAGE: ${{ github.event.head_commit.message }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          WEBHOOK_TOKEN: ${{ secrets.SLACK_TOKEN }}
```

---

## comment-snyk-report

A github action that adds the Snyk report(`snyk test` & `snyk code test`) as a comment to PR

#### Example:

```
jobs:
  some-job:
    name: Do Something
    steps:
      - name: run Snyk commands
        run: |
          snyk test --all-projects --json-file-output=snyk-dependencies-report.json
          snyk code test --all-projects --json-file-output=snyk-codebase-report.json
      - name: Comment reports
        uses: wunderflats/actions/comment-snyk-report@master
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          dependencies-check-file: snyk-dependencies-report.json
          codebase-check-file: snyk-codebase-report.json
```

---

## remove-testing-images

Removes a testing image by tag or clean up all unneeded and old images(older than 3 months)

#### Example:

```
jobs:
  delete-testing-image:
    runs-on: ubuntu-latest
    steps:
      - name: Delete latest testing image
        uses: wunderflats/actions/remove-testing-images@master
        with:
          package-name: "api-testing"
          tag: "branch-tag"
          bulk-cleanup: false
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

---

## codeowners-sync

Generates `.github/CODEOWNERS` from `.github/critical-paths.yml` and fails a PR when the two differ, or when an owner team cannot own the repo. One of the review gates. See [codeowners-sync/README.md](codeowners-sync/README.md).
