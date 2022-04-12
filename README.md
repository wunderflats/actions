# wunderflats/actions

This repository contains a set of helpful github actions created and maintained by Wunderflats GmbH.

---

## auto-cancel

This action automatically cancels all the other actions still running for the same branch. This helps save computing time by only letting the last CI trigger to run completely.

#### Example:

```
jobs:
  auto-cancel:
    steps:
      - uses: wunderflats/actions/auto-cancel@master
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## prevent-concurrent-deploy

A github action to prevent concurrent deployment. This step will fail if there is another active workflow on the same branch.

#### Example:

```
jobs:
  prevent-concurrent-deploy:
    steps:
      - uses: wunderflats/actions/prevent-concurrent-deploy@master
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
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
          GITHUB_RUN_ID: ${{ github.run_id }}
          SLACK_NOTIFY_EVENT: DEPLOYMENT_PAUSED
          COMMIT_MESSAGE: ${{ github.event.head_commit.message }}
          WEBHOOK_TOKEN: ${{ secrets.SLACK_WEBHOOK_TOKEN }}
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

## License: Apache-2.0
