# image-context

This action can be used to know the image to build or use in the API project.

## Example use

```yaml
jobs:
  build for test:
    steps:
      - id: context
        uses: wunderflats/actions/build-context
      - name: Docker build
        run: docker build -t "${{ steps.context.outputs.test-image-sha }}" .

  build for production:
    steps:
      - id: context
        uses: wunderflats/actions/build-context
      - name: Docker build
        run: docker build -t "${{ steps.context.outputs.deploy-image-sha }}" .

  test:
    steps:
      - id: context
        uses: wunderflats/actions/build-context
      - name: Run some tests
        run: docker run "${{ steps.context.outputs.test-image-sha }}" yarn jest some-tests
```
