import * as github from "@actions/github";
import * as core from "@actions/core";

const token = core.getInput("github-token", { required: true });
const octokit = github.getOctokit(token);

await run();

async function run() {
  if (github.context.eventName !== "push") {
    core.setFailed("This workflow only works on push events.");
    return;
  }

  const { owner, repo } = github.context.repo;
  const thisRunId = github.context.runId;

  const thisWorkflowRun = await octokit.rest.actions.getWorkflowRun({
    owner,
    repo,
    run_id: thisRunId,
  });
  const thisCreatedAt = thisWorkflowRun.data.created_at;
  core.info(`Current workflow created at ${thisCreatedAt}`);

  const { ref } = github.context;
  const branch = ref.replace("refs/heads/", "");

  type QueryParams = Parameters<
    typeof octokit.rest.actions.listWorkflowRunsForRepo
  >[0];
  const queryParams: QueryParams = {
    owner,
    repo,
    event: "push",
    branch,
    per_page: 10,
    created: `>${thisCreatedAt}`, // The ">" syntax does not work, though
  };
  const paramsString = JSON.stringify(queryParams, null, 2);
  core.info(`Will query for workflows: ${paramsString}`);

  // Workflow runs that were created after the current one
  const response = await octokit.rest.actions.listWorkflowRunsForRepo(
    queryParams
  );

  const runs = response.data.workflow_runs;
  core.info(`Total workflow run count: ${runs.length}`);

  // Any runs that are e.g. in progress or completed or failed, but not queued
  const ignoreStatus = ["queued", "waiting", "requested", "pending"];
  const relevantRuns = response.data.workflow_runs
    .filter((run) => run.id !== thisRunId)
    .filter((run) => !ignoreStatus.includes(run.status));

  if (relevantRuns.length > 0) {
    for (const workflow of response.data.workflow_runs) {
      const logItem = {
        id: workflow.id,
        name: workflow.name,
        created_at: workflow.created_at,
        html_url: workflow.html_url,
        status: workflow.status,
      };
      core.info(JSON.stringify(logItem, null, 2));
    }
    core.setFailed("There is a newer workflow run. Cancelling this one.");
    return;
  }

  core.info("All good!");
  return;
}
