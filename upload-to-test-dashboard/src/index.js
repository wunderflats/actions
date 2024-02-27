import shell from "shelljs";
import chalk from "chalk";
import config from "./config";

shell.set("-e");

const print = (message = "") => process.stdout.write(message);

const println = (message = "") => print(message + "\n");

function getUploadUrl() {
  const params = new URLSearchParams({
    testSuite: config.testSuite,
    testFileType: config.testFileType,
    commitHash: config.commitHash,
    jobId: config.jobId,
    token: config.pushToken,
    runAttempt: config.runAttempt,
  });

  const { apiUrl, repository, branch } = config;

  return `${apiUrl}/${repository}/${branch}?${params.toString()}`;
}

function uploadFile(url, file) {
  const result = shell.exec(
    `curl -X POST --retry 3 --retry-delay 5 -F "testFile=@${file}" "${url}"`,
    { silent: true },
  );

  if (result.code !== 0) {
    throw new Error(`curl exit code: ${result.code}`);
  }

  let response;

  try {
    response = JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(
      `API response does not seem to be a valid JSON: ${error.message}`,
    );
  }

  if (response.success === false) {
    throw new Error(`API response reason: ${response.reason}`);
  }
}

function listFiles(path) {
  try {
    return shell.ls(path);
  } catch (error) {
    throw new Error(`Could not list ${path}: ${error.message}`);
  }
}

function run() {
  const uploadUrl = getUploadUrl();

  const files = listFiles(config.files);

  if (files.length === 0) {
    throw new Error(`No files found to upload matching ${config.files}`);
  }

  let uploaded = 0,
    failed = 0;

  println(chalk.bgGreen(`Files to upload: ${files.length}\n`));

  files.forEach((file) => {
    print(`Uploading file ${file}... `);

    try {
      uploadFile(uploadUrl, file);
      println(chalk.green("[OK]"));
      uploaded++;
    } catch (error) {
      println(`${chalk.red("[FAILED]")} ${chalk.dim(error.message)}`);
      failed++;
    } finally {
      shell.exec("sleep 2");
    }
  });

  return {
    uploaded,
    failed,
  };
}

function getConfig() {
  return [
    chalk.bgGreen("Run configuration:"),
    `  API URL: ${chalk.dim(config.apiUrl)}`,
    `  Repository: ${chalk.dim(config.repository)}`,
    `  Branch: ${chalk.dim(config.branch)}`,
    `  Test suite: ${chalk.dim(config.testSuite)}`,
    `  Test file type: ${chalk.dim(config.testFileType)}`,
    `  Commit hash: ${chalk.dim(config.commitHash)}`,
    `  Job ID: ${chalk.dim(config.jobId)}`,
    `  Files: ${chalk.dim(config.files)}`,
    `  Run Attempt: ${chalk.dim(config.runAttempt)}`,
  ];
}

function getSummary(uploaded, failed) {
  if (uploaded === 0) {
    return [chalk.red(`All ${failed} file(s) failed to upload`)];
  }

  if (failed === 0) {
    return [chalk.green("All done, full success!")];
  }

  return [
    chalk.green(`Uploaded files: ${uploaded}`),
    chalk.red(`NOT uploaded files: ${failed}`),
  ];
}

try {
  getConfig().forEach((line) => println(line));
  println();

  const { uploaded, failed } = run();

  println();
  getSummary(uploaded, failed).forEach((line) => println(line));

  process.exit(0);
} catch (error) {
  println(chalk.bgRed("Script failed!"));
  println(chalk.dim(error.message));
  process.exit(1);
}
