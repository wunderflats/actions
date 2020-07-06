const github = require("@actions/github");
const core = require("@actions/core");
const { random, difference } = require("lodash");

/**
 * Fetch and transform inputs into usable variables
 **/
function getInputs() {
  const reviewerList = core
    .getInput("reviewerList")
    .split(",")
    .map(i => i.trim());
  const reviewerAmount = parseInt(core.getInput("reviewerAmount"));
  const maintainerList = core
    .getInput("maintainerList")
    .split(",")
    .map(i => i.trim());
  const maintainerAmount = parseInt(core.getInput("maintainerAmount"));
  const skipBusy = !!core.getInput("skipBusy");

  const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");

  return {
    reviewerList,
    reviewerAmount,
    maintainerList,
    maintainerAmount,
    skipBusy,
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
    return user.status.indicatesLimitedAvailability;
  }

  return false;
}

/**
 * Remove busy user if needed and pr owner from an array of user names
 * then randomly pick the requested amount of users
 **/
async function pickUsers(userList, pickAmount, removeBusy, prOwner, octokit) {
  const pickedUsers = [];
  let filteredList = [];

  if (removeBusy) {
    for (const user of userList) {
      if (!(await isUserBusy(octokit, user))) {
        filteredList.push(user);
      }
    }
  } else {
    filteredList = userList;
  }

  if (filteredList.indexOf(prOwner) >= 0) {
    filteredList.splice(filteredList.indexOf(prOwner), 1);
  }

  for (let i = 0; i < pickAmount; i++) {
    pickedUsers.push(filteredList[random(0, filteredList.length - 1)]);
  }

  return pickedUsers;
}

// This allow to have maintainers in the reviewer list. If they are already picked, we can make
// a reviewerList without them
function excludePickedMaintainer(userList, pickedMaintainers){
  return difference(userList, pickedMaintainers);
}

/**
 * Main action entry point
 **/
async function run() {
  //Get action events
  const actionEvents = require(process.env.GITHUB_EVENT_PATH);

  const isDraft = actionEvents.pull_request.draft;
  if(isDraft === true){
    core.info("Ignoring Draft PR");
    return;
  }

  const {
    reviewerList,
    reviewerAmount,
    maintainerList,
    maintainerAmount,
    skipBusy,
    GITHUB_TOKEN
  } = getInputs();

  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/", 2);
  const prNumber = actionEvents.pull_request.number;
  core.info(`Adding reviewers to pull request #${prNumber}`);

  const octokit = new github.GitHub(GITHUB_TOKEN);

  // Get current reviewers info
  const { users, teams } = (
    await octokit.pulls.listReviewRequests({
      owner,
      repo,
      pull_number: prNumber
    })
  ).data;

  // Get PR owner
  const { user: prOwner } = (
    await octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber
    })
  ).data;

  // If we needs to add reviewers
  if (users.length === 0 && teams.length === 0) {
    core.info("Reviewers needed, picking reviewers.");

    // Maintainers:
    const maintainers = await pickUsers(
      maintainerList,
      maintainerAmount,
      skipBusy,
      prOwner.login,
      octokit
    );

    // Reviewers:
    const reviewers = await pickUsers(
      excludePickedMaintainer(reviewerList, maintainers),
      reviewerAmount,
      skipBusy,
      prOwner.login,
      octokit,
    );


    core.info(
      `Assigning ${[...reviewers, ...maintainers].join(", ")} to code review`
    );
    await octokit.pulls.createReviewRequest({
      owner,
      repo,
      pull_number: prNumber,
      reviewers: [...reviewers, ...maintainers]
    });
  }
}

run().catch(error => {
  console.error(error);
  return core.setFailed(error.messsage);
});
