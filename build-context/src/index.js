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
const deployRegistry = core.getInput("deploy-image-registry");
const shortImageName =
  core.getInput("short-image-name") || github.context.repo.repo;

// Outputs
const testImageSha = `${testingRegistry}/${shortImageName}:${gitSha}`;
const testImageBranch = `${testingRegistry}/${shortImageName}:${escapedBranch}`;
const deployImageSha = `${deployRegistry}/${shortImageName}:${gitSha}`;
const deployImageBranch = `${deployRegistry}/${shortImageName}:${escapedBranch}`;

const outputs = {
  "git-sha": gitSha,
  "git-branch": gitBranch,
  "git-escaped-branch": gitSha,
  "test-image-sha": testImageSha,
  "test-image-branch": testImageBranch,
  "deploy-image-sha": deployImageSha,
  "deploy-image-branch": deployImageBranch,
};

for (const [key, value] of Object.entries(outputs)) {
  console.log(key, "=", value);
  core.setOutput(key, value);
}
