const core = require("@actions/core");
const github = require("@actions/github");

// Context
const isPullRequest = github.context.eventName === "pull_request";
const gitSha = isPullRequest
  ? github.context.payload.pull_request.head.sha
  : github.sha;
const gitBranch = isPullRequest
  ? github.context.payload.pull_request.head.ref
  : github.ref_name;

const escapedBranch = gitBranch.replaceAll(/[^A-Za-z0-9]/g, "-");
const testingRegistry = "ghcr.io/wunderflats";
const shortImageName =
  core.getInput("short-image-name") || github.context.repo.repo;
const projects = core
  .getInput("projects")
  .split(",")
  .map((project) => project.trim(project));

// Outputs

core.setOutput("git-sha", gitSha);
core.setOutput("git-branch", gitBranch);
core.setOutput("git-escaped-branch", escapedBranch);

for (const project of projects) {
  const testImageRepository = `${testingRegistry}/${shortImageName}`;
  const testImageSha = `${testImageRepository}:${gitSha}`;
  const testImageBranch = `${testImageRepository}:${escapedBranch}`;
  const outputs = [
    [`${project}-image-repository`, testImageRepository],
    [`${project}-image-sha`, testImageSha],
    [`${project}-image-branch`, testImageBranch],
  ];

  for (const [key, value] of outputs) {
    console.log(key, "=", value);
    core.setOutput(key, value);
  }
}
