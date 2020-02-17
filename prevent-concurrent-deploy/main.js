const github = require("@actions/github");
const core = require("@actions/core");

const actionEvents = require(process.env.GITHUB_EVENT_PATH);
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/", 2);
const branch = process.env.GITHUB_HEAD_REF
  ? process.env.GITHUB_HEAD_REF
  : process.env.GITHUB_REF.replace("refs/heads/", "");

// In case you are wondering, github is not consistent here. On the UI it will give you
// the commit hash of your branch head, but in reality GITHUB_SHA is the commit hash
// of your commit on the target branch of your PR. So we parse it from the event file.
const commit_hash = process.env.GITHUB_HEAD_REF
  ? actionEvents.pull_request.head.sha
  : process.env.GITHUB_SHA;

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

  // Set workflow to failed (so it can be re-run) if other workflows are still running
  if (workflowsToCancel.length > 0) {
    core.setFailed("Another deployment is currently running, aborting");
  }
}

run().catch(error => core.setFailed(error.message));
