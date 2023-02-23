# image-context

This action can be used to know the image to build or use in the API project.

## Inputs

None.

## Outputs

- `commit-override`: The git SHA to use as both Docker tag and COMMIT_OVERRIDE variable for the build.
- `testing-image-sha`: The full name of the testing image to be produced with the git commit hash.
- `testing-image-branch`: The full name of the testing image to be produced with the git branch.
- `deploy-image-sha`: The full name of the deployment image to be produced with the git commit hash.
- `deploy-image-branch`: The full name of the deployment image to be produced with the git branch.

## Example use:

TO DO: use jq and one-liner

```yaml
jobs:
  build:
    steps:
      - id: image-context
        uses: wunderflats/actions/image-context
      - name: Docker build
        # docker build -t <TAG_NAME> <DIRECTORY>
        run: docker build -t ${{ steps.image-context.outputs.testing-image-sha }} .
  test:
    steps:
      - id: image-context
        uses: wunderflats/actions/image-context
      - name: Run some tests
        # docker run <IMAGE NAME> COMMAND ...ARGUMENTS
        run: docker run ${{ steps.image-context.outputs.testing-image-sha }} yarn jest some-tests
```
