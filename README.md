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
    steps:
      - uses: wunderflats/actions/cancel-if-not-latest@master
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

---

## slack-deploy-notify

A github action that sends a slack notification depending on status of running jobs in actions.

#### Example:

```
jobs:
  some-job:
    name: Do Something
    steps:
      - id: deploy
        run: return 1
      - if: failure()
        uses: wunderflats/actions/slack-deploy-notify@master
        with:
          github-run-id: ${{ github.run_id }}
          slack-notify-event: DEPLOYMENT_PAUSED
          commit-message: ${{ github.event.head_commit.message }}
          webhook-token: ${{ secrets.SLACK_WEBHOOK_TOKEN }}
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

## upload-to-test-dashboard

A github action that uploads specific files to wunderflats' test dashboard

#### Example:

```
jobs:
  some-job:
    name: Do Something
    steps:
      - id: deploy
        run: return 1
      - if: (success() || failure()) && steps.last_run.outputs.conclusion != 'success'
        uses: wunderflats/actions/upload-to-test-dashboard@master
        with:
          api-url: https://test-dashboard.wunderflats.xyz/api/test-result
          repository: my-repo-name
          branch: my-fantastic-branch
          test-suite: jest
          test-file-type: jest
          commit-hash: ${{ github.sha }}
          job-id: ${{ github.run_id }}
          files: ./test-reports/*
          dashboard-push-token: ${{ secrets.DASHBOARD_PUSH_TOKEN }}
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
