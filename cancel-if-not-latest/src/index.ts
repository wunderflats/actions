import * as github from "@actions/github";
import * as core from "@actions/core";

const token = core.getInput("GITHUB_TOKEN", { required: true });
const octokit = github.getOctokit(token);
const { owner, repo } = github.context.repo;

const thisCommitSha = github.context.sha;

const latestCommit = await octokit.rest.repos.getCommit({
  owner,
  repo,
  ref: github.context.ref,
});
const latestCommitSha = latestCommit.data.sha;

console.log("Current commit SHA:", thisCommitSha);
console.log("Latest commit SHA:", latestCommitSha);

if (thisCommitSha !== latestCommitSha) {
  core.error(
    "This workflow run was cancelled because it tried to run on a commit that is not the latest."
  );
  const { runId } = github.context;
  await octokit.rest.actions.cancelWorkflowRun({ owner, repo, run_id: runId });
} else {
  console.log("All good!");
}
