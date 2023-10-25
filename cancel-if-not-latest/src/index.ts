import * as github from "@actions/github";
import * as core from "@actions/core";
import * as process from "node:process";

const token = core.getInput("GITHUB_TOKEN", { required: true });
const octokit = github.getOctokit(token);

await run();

async function run() {
  const { owner, repo } = github.context.repo;

  if (github.context.eventName !== "push") {
    core.setFailed("This workflow only works on push events.");
    return;
  }

  const thisCommitSha = github.context.sha;

  const latestCommit = await octokit.rest.repos.getCommit({
    owner,
    repo,
    ref: github.context.ref,
  });
  const latestCommitSha = latestCommit.data.sha;
  const attempt = process.env.GITHUB_RUN_ATTEMPT;

  core.info(`Current commit SHA: ${thisCommitSha}`);
  core.info(`Latest commit SHA: ${latestCommitSha}`);
  core.info(`Attempt: ${attempt}`);

  const isLatestCommit = thisCommitSha === latestCommitSha;
  if (isLatestCommit) {
    core.info("All good!");
    return;
  }

  const isFirstAttempt = attempt === "1";
  if (isFirstAttempt) {
    // Someone has made a new commit in the meantime, but this is still the first attempt of this workflow run
    core.info("All good!");
    return;
  }

  const message = "This workflow run is not the latest commit on this branch";
  core.setFailed(message);
}
