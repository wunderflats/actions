const bent = require("bent");

const {
  INPUT_SLACK_NOTIFY_EVENT: eventType,
  INPUT_GITHUB_RUN_ID: runId,
  INPUT_WEBHOOK_TOKEN: webhookToken,
  INPUT_COMMIT_MESSAGE: commitMessage
} = process.env;

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/", 2);

if (!eventType || !runId || !webhookToken) {
  console.error("Missing argument for the slack-notifications actions!");
  console.log({ eventType, runId, webhookToken });
  process.exit(1);
}

const runLink = `https://github.com/${owner}/${repo}/actions/runs/${runId}`;
const masterActionPage = `https://github.com/${owner}/${repo}/actions?query=branch%3Amaster`;
const commit =
  commitMessage.trim().length > 0 ? `\n*${commitMessage.trim().split('\n')[0]}*\n` : "";

const eventMap = {
  DEPLOYMENT_TEST_FAIL: {
    text: `A test check failed preventing deployment on master
    ${commit}<${runLink}|See github action>`
  },
  DEPLOYMENT_PAUSED: {
    text: `The deployment for master ${commit}has been paused because of another running deployment. Please resume it when the first deployment is green.
<${runLink}|See github action> \n
<${masterActionPage}|See all running actions>`
  }
};

async function run() {
  const service = "https://hooks.slack.com/services/";
  const post = await bent(service, "POST", "json", 200);
  const payload = eventMap[eventType];

  await post(webhookToken, payload);
}

run().catch(async error => {
  if (error.responseBody) {
    const rb = await error.responseBody;
    console.log(rb.toString("utf-8"));
  }
  console.error("Something wrong happened");
  console.error(error);
  process.exit(2);
});
