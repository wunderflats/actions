const github = require("@actions/github");
const core = require("@actions/core");

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/", 2);
const commit_hash = process.env.GITHUB_SHA;
const branch = process.env.GITHUB_REF.replace("refs/heads/", "");
const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");

async function run() {
  const octokit = new github.GitHub(GITHUB_TOKEN);

  // List running workflows (in the last 100 triggers)
  const { data } = await octokit.actions.listRepoWorkflowRuns({
    owner,
    repo,
    branch,
    per_page: 100
  });

  // Filter workflows on the same branch but different commit (and still active)
  const workflowsToCancel = data.workflow_runs
    .filter(
      workflow =>
        workflow.head_sha != commit_hash && workflow.status != "completed"
    )
    .map(item => item.id);

  // Cancel all other workflows
  for (const run_id of workflowsToCancel) {
    await octokit.actions.cancelWorkflowRun({
      owner,
      repo,
      run_id
    });
  }
}

run().catch(error => core.setFailed(error.message));
