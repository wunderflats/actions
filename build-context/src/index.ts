import * as core from "@actions/core";
import * as github from "@actions/github";

// Context

let gitSha: string;
if (github.context.eventName === "pull_request") {
  gitSha = github.context.payload.pull_request.head.sha;
} else if (github.context.eventName === "push") {
  gitSha = github.context.sha;
}

let gitBranch: string;
if (github.context.eventName === "pull_request") {
  gitBranch = github.context.payload.pull_request.head.ref;
} else if (github.context.eventName === "push") {
  github.context.ref;
}

// Input
console.log(JSON.stringify(github.context, null, 2));
const shortImageName = core.getInput("image-name", { required: true });
const defaultBranch = core.getInput("default-branch", { required: false });

const escapedBranch = gitBranch.replaceAll(/[^A-Za-z0-9]/g, "-");
const registry = core.getInput("registry", { required: true });

// Calculations

const imageRepository = `${registry}/${shortImageName}`;
const imageSha = `${imageRepository}:${gitSha}`;
const imageBranch = `${imageRepository}:${escapedBranch}`;
const testImageDefaultBranch = `${imageRepository}:${defaultBranch}`;

// Outputs
core.setOutput("git-sha", gitSha);
core.setOutput("git-branch", gitBranch);
core.setOutput("git-escaped-branch", escapedBranch);
core.setOutput("image-repository", imageRepository);
core.setOutput("image-sha", imageSha);
core.setOutput("image-branch", imageBranch);
core.setOutput("image-default-branch", testImageDefaultBranch);
