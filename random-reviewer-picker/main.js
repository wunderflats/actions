const github = require("@actions/github");
const core = require("@actions/core");
const { random } = require("lodash");

/**
 * Fetch and transform inputs into usable variables
 **/
function getInputs() {
  const reviewer_list = core
    .getInput("reviewer_list")
    .split(",")
    .map(i => i.replace(" ", ""));
  const reviewer_amount = parseInt(core.getInput("reviewer_amount"));
  const maintainer_list = core
    .getInput("maintainer_list")
    .split(",")
    .map(i => i.replace(" ", ""));
  const maintainer_amount = parseInt(core.getInput("maintainer_amount"));
  const skip_busy = !!core.getInput("skip_busy");

  const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");

  return {
    reviewer_list,
    reviewer_amount,
    maintainer_list,
    maintainer_amount,
    skip_busy,
    GITHUB_TOKEN
  };
}

/**
 * Get user "busy" status from github API
 **/
async function isUserBusy(octokit, userHandle) {
  core.info(`Checking status of "${userHandle}"`);

  const { user } = await octokit.graphql({
    query: `
    query userStatus($user: String!) {
      user(login: $user) {
        status {
          indicatesLimitedAvailability
        }
      }
    }`,
    user: userHandle
  });

  // If user never changed their status, then status is null
  if (user.status && user.status.indicatesLimitedAvailability) {
    return userStatus.user.status.indicatesLimitedAvailability;
  }

  return false;
}

/**
 * Main action entry point
 **/
async function run() {
  //Get action events
  const actionEvents = require(process.env.GITHUB_EVENT_PATH);

  const {
    reviewer_list,
    reviewer_amount,
    maintainer_list,
    maintainer_amount,
    skip_busy,
    GITHUB_TOKEN
  } = getInputs();

  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/", 2);
  const pull_number = actionEvents.pull_request.number;
  core.info(`Adding reviewers to pull request #${pull_number}`);

  const octokit = new github.GitHub(GITHUB_TOKEN);

  // Get current reviewers info
  const { users, teams } = (
    await octokit.pulls.listReviewRequests({
      owner,
      repo,
      pull_number
    })
  ).data;

  // If we needs to add reviewers
  if (users.length === 0 && teams.length === 0) {
    core.info("Reviewers needed, picking reviewers.");

    const pickedReviewers = [];

    // Reviewers:
    const filtered_reviewers = [];
    if (skip_busy) {
      for (const reviewer of reviewer_list) {
        if (!(await isUserBusy(octokit, reviewer))) {
          filtered_reviewers.push(reviewer);
        }
      }
    } else {
      filtered_reviewers = reviewers_list;
    }

    for (let i = 0; i < reviewer_amount; i++) {
      pickedReviewers.push(
        filtered_reviewers[random(0, filtered_reviewers.length - 1)]
      );
    }

    // Maintainers:
    const filtered_maintainers = [];
    if (skip_busy) {
      for (const maintainer of maintainer_list) {
        if (!(await isUserBusy(octokit, maintainer))) {
          filtered_maintainers.push(maintainer);
        }
      }
    } else {
      filtered_maintainers = maintainer_list;
    }

    for (let i = 0; i < maintainer_amount; i++) {
      pickedReviewers.push(
        filtered_maintainers[random(0, filtered_maintainers.length - 1)]
      );
    }

    core.info(`Assigning ${pickedReviewers.join(", ")} to code review`);
    await octokit.pulls.createReviewRequest({
      owner,
      repo,
      pull_number,
      reviewers: pickedReviewers
    });
  }
}

run().catch(error => core.setFailed(error.message));
