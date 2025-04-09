import * as github from "@actions/github";
import * as core from "@actions/core";

const token = core.getInput("github-token", { required: true });
const octokit = github.getOctokit(token);

await run();

async function run() {
  const { owner, repo } = github.context.repo;

  if (github.context.eventName !== "push") {
    core.setFailed("This workflow only works on push events.");
    return;
  }

  const thisWorkflowRun = await octokit.rest.actions.getWorkflowRun({
    owner,
    repo,
    run_id: github.context.runId,
  });
  const thisWorkflowCreatedAt = thisWorkflowRun.data.created_at;
  core.info(`Current workflow created at: ${thisWorkflowCreatedAt}`);

  // Workflow runs that were created after the current one
  const latestWorkflowRunsResponse =
    await octokit.rest.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      branch: github.context.ref.replace("refs/heads/", ""),
      per_page: 1,
      created_at: `>${thisWorkflowCreatedAt}`,
    });

  const newerWorkflowCount = latestWorkflowRunsResponse.data.total_count;
  core.info(
    `Found ${newerWorkflowCount} workflows created since ${thisWorkflowCreatedAt}`
  );

  if (newerWorkflowCount > 0) {
    const message = "There is a newer workflow run. Cancelling this one.";
    core.setFailed(message);
  }

  core.info("All good!");
  return;
}
