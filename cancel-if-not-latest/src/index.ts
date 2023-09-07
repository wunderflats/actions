import * as github from "@actions/github";
import * as core from "@actions/core";

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

  core.debug(`Current commit SHA: ${thisCommitSha}`);
  core.debug(`Latest commit SHA: ${latestCommitSha}`);

  if (thisCommitSha !== latestCommitSha) {
    core.error(
      "This workflow run was cancelled because it tried to run on a commit that is not the latest."
    );
    const { runId } = github.context;
    await octokit.rest.actions.cancelWorkflowRun({
      owner,
      repo,
      run_id: runId,
    });
  } else {
    core.info("All good!");
  }
}
