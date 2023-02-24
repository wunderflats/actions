# image-context

This action can be used to know the image to build or use in the API project.

## Glossary

- **image registry:** e.g. `ghcr.io/wunderflats`
- **image short name:** e.g. `myproject` (not an official word)
- **repository:** the image registry followed by the short name e.g. `ghcr.io/wunderflats/myproject`
- **tag:** `1.2.4`
- **full image name:** `ghcr.io/wunderflats/myproject:1.2.4` (not an official word)

## Inputs

### deploy-image-registry

The image registry to use for images that get deployed

### short-image-name

Name to append to the image registry ("<imageRegistry>/<image>"); by default uses the GitHub project name

## Outputs

### git-sha

The git commit SHA that triggered the workflow

### git-branch

The git branch that triggered the branch workflow or PR workflow

### git-branch-escaped

The git branch, but escaped with dashes

### repository

The docker repository (<imageRegistry>/<shortImageName>) e.g. `ghcr.io/wunderflats/my-project` or `gcr.io/abc123/myproject`.

### test-image-sha

The full name of the testing image tagged with the git commit SHA e.g. `ghcr.io/wunderflats/my-project-testing:abc12345`

### test-image-branch

The full name of the testing image tagged with the git branch e.g. `ghcr.io/wunderflats/my-project-testing:mybranch`

### deploy-image-sha

The full name of the deployment image tagged with the git commit SAH e.g. `gcr.io/abc123/my-project:mybranch`

### deploy-image-branch

The full name of the deployment image tagged with the git branch e.g. `gcr.io/abc123/my-project:mybranch`

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
