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

## get-last-run-conclusion

A github action that returns the conclusion of on job's last completed run for the same workflow. It basically allows to skip jobs that succeded for the same workflow run if it's rerun.

#### Example:

```
jobs:
  some-job:
    name: Do Something
    steps:
      - id: last_run
        uses: wunderflats/actions/get-last-run-conclusion@master
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          jobName: Do Something
      - id: main task
        if: steps.last_run.outputs.conclusion != 'success'
        run: echo do the task
```

---

## License: Apache-2.0
