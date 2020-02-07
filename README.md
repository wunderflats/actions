# wunderflats/actions

This repository contains a set of helpful github actions created and maintained by Wunderflats GmbH.

---

## auto-cancel

This action automatically cancels any long lasting actions still running for the same branch. This helps save computing time by only letting the last CI trigger to run completely.

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

## License: Apache-2.0
