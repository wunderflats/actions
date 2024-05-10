import * as core from "@actions/core";
import * as github from "@actions/github";

// Input
const gitRepository = github.context.payload.repository.name;
const shortImageName = core.getInput("image-name", { required: false }) || gitRepository; 
const defaultBranch = core.getInput("default-branch", { required: false });

// Context
let gitSha: string;
let gitBranch: string;

if (github.context.eventName === "pull_request") {
  gitSha = github.context.payload.pull_request.head.sha;
  gitBranch = process.env.GITHUB_HEAD_REF;
} else if (github.context.eventName === "push") {
  gitSha = github.context.sha;
  gitBranch = process.env.GITHUB_REF_NAME;
} else {
  throw new Error(`Unsupported event: ${github.context.eventName}`);
}

const escapedBranch = gitBranch.replaceAll(/[^A-Za-z0-9]+/g, "-");
const registry = core.getInput("registry", { required: true });

// Calculations
const imageRepository = `${registry}/${shortImageName}`;
const imageSha = `${imageRepository}:${gitSha}`;
const imageBranch = `${imageRepository}:${escapedBranch}`;
const testImageDefaultBranch = `${imageRepository}:${defaultBranch}`;

// Debug
core.info(`git-sha: ${gitSha}`);
core.info(`git-branch: ${gitBranch}`);
core.info(`git-escaped-branch: ${escapedBranch}`);
core.info(`image-repository: ${imageRepository}`);
core.info(`image-sha: ${imageSha}`);
core.info(`image-branch: ${imageBranch}`);
core.info(`image-default-branch: ${testImageDefaultBranch}`);

// Outputs
core.setOutput("git-sha", gitSha);
core.setOutput("git-branch", gitBranch);
core.setOutput("git-escaped-branch", escapedBranch);
core.setOutput("image-repository", imageRepository);
core.setOutput("image-sha", imageSha);
core.setOutput("image-branch", imageBranch);
core.setOutput("image-default-branch", testImageDefaultBranch);
