# image-context

This action can be used to know the image to build or use in the API project.

## Inputs

```
deploy-image-registry:
  description: The image registry to use for images that get deployed
short-image-name:
  description: Name to append to the image registry ("<imageRegistry>/<image>"); by default uses the GitHub project name
  required: false
```

## Outputs

```
WF_GIT_SHA:
  description: The git commit SHA that triggered the workflow
WF_GIT_BRANCH:
  description: The git branch that triggered the branch workflow or PR workflow
WF_GIT_BRANCH_ESCAPED:
  description: The git branch, but escaped with dashes
WF_REPOSITORY:
  description: >
    The docker repository
    e.g. ghcr.io/wunderflats/my-project
WF_TEST_IMAGE_SHA:
  description: >
    The full name of the testing image tagged with the git commit SHA
    e.g. ghcr.io/wunderflats/my-project-testing:abc12345
WF_TEST_IMAGE_BRANCH:
  description: >
    The full name of the testing image tagged with the git branch
    e.g. ghcr.io/wunderflats/my-project-testing:mybranch
WF_DEPLOY_IMAGE_SHA:
  description: >
    The full name of the deployment image tagged with the git commit SAH
    e.g. ghcr.io/wunderflats/my-project:mybranch
WF_DEPLOY_IMAGE_BRANCH:
  description: >
    The full name of the deployment image tagged with the git branch
    e.g. ghcr.io/wunderflats/my-project:mybranch
```

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
