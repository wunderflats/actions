import * as env from "env-var";
import * as github from "@actions/github";
import * as core from "@actions/core";

const token = core.getInput("TEST_DASHBOARD_API_URL");
console.log("CORE TOKEN", token);

console.log("GITHUB", github);

export const config = {
  apiUrl: env.get("INPUT_API_URL").required().asString(),
  repository: env.get("INPUT_REPOSITORY").required().asString(),
  branch: env.get("INPUT_BRANCH").required().asString(),
  testSuite: env.get("INPUT_TEST_SUITE").required().asString(),
  testFileType: env.get("INPUT_TEST_FILE_TYPE").required().asString(),
  commitHash: env.get("INPUT_COMMIT_HASH").required().asString(),
  jobId: env.get("INPUT_JOB_ID").required().asString(),
  files: env.get("INPUT_FILES").required().asString(),
  runAttempt: github.context.runNumber.toString(10),
  pushToken: env.get("INPUT_DASHBOARD_PUSH_TOKEN").required().asString(),
};
